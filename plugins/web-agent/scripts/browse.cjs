#!/usr/bin/env node
// Браузер для агента web-agent: открывает страницу в Chromium (Playwright),
// выполняет шаги (клик, ввод текста, ожидание, прокрутка, загрузка файла) и печатает
// текст страницы, ссылки и путь к скриншоту.
//
//   node browse.cjs <url> [--steps '<json>'] [--profile имя] [--shot файл.png] [--links] [--max 20000]
//   node browse.cjs --secrets          показать, какие секреты заданы (только имена)
//
// Шаги — JSON-массив, например:
//   [{"fill":"#login","text":"{{secret:GMAIL_LOGIN}}"},
//    {"fill":"#password","text":"{{secret:GMAIL_PASSWORD}}"},{"press":"Enter"},
//    {"waitFor":"text=Входящие"},{"click":"text=Написать"},{"upload":"input[type=file]","file":"a.png"}]
//
// Секреты: {{secret:ИМЯ}} берётся из переменной окружения ИМЯ, а если её нет — из
// ~/.web-agent/secrets.json ({"ИМЯ": "значение"}). Значения никогда не печатаются:
// в выводе они заменяются на [секрет ИМЯ].
//
// --profile имя: сохраняет вход (cookies) в ~/.web-agent/state/имя.json и подхватывает
// его в следующий раз, чтобы не логиниться заново. Файл вне репозитория.
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const HOME_DIR = path.join(os.homedir(), '.web-agent');
const SECRETS_FILE = path.join(HOME_DIR, 'secrets.json');
const STATE_DIR = path.join(HOME_DIR, 'state');
const SECRET_RE = /\{\{secret:([A-Za-z0-9_]+)\}\}/g;

function loadSecretsFile() {
  try {
    return JSON.parse(fs.readFileSync(SECRETS_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

const fileSecrets = loadSecretsFile();
const usedSecrets = new Map(); // значение -> имя, чтобы вычищать из вывода

function secretValue(name) {
  const v = process.env[name] ?? fileSecrets[name];
  if (v === undefined || v === '') {
    throw new Error(`секрет ${name} не задан (переменная окружения ${name} или ~/.web-agent/secrets.json)`);
  }
  usedSecrets.set(String(v), name);
  return String(v);
}

function resolve(value) {
  return String(value ?? '').replace(SECRET_RE, (_, name) => secretValue(name));
}

function redact(text) {
  let out = String(text);
  for (const [value, name] of usedSecrets) {
    if (value.length >= 3) out = out.split(value).join(`[секрет ${name}]`);
  }
  return out;
}

function listSecrets() {
  const names = new Set(Object.keys(fileSecrets));
  for (const k of Object.keys(process.env)) {
    if (/^WEB_AGENT_|_(LOGIN|PASSWORD)$/.test(k)) names.add(k);
  }
  console.log(names.size ? 'Заданы секреты:\n' + [...names].sort().join('\n') : 'Секреты не заданы.');
  let profiles = [];
  try { profiles = fs.readdirSync(STATE_DIR).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)); } catch (e) {}
  console.log(profiles.length ? 'Сохранённые входы (--profile): ' + profiles.join(', ') : 'Сохранённых входов нет.');
}

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  console.error('Нет Playwright. В облаке он уже есть; на компьютере: npm i -g playwright && npx playwright install chromium');
  process.exit(2);
}

function parseArgs(argv) {
  const out = { url: null, steps: [], shot: null, links: false, max: 20000, timeout: 30000, profile: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--steps') out.steps = JSON.parse(argv[++i] || '[]');
    else if (a === '--shot') out.shot = argv[++i];
    else if (a === '--links') out.links = true;
    else if (a === '--max') out.max = Number(argv[++i]) || out.max;
    else if (a === '--timeout') out.timeout = Number(argv[++i]) || out.timeout;
    else if (a === '--profile') out.profile = argv[++i];
    else if (!out.url) out.url = a;
  }
  if (!out.url) {
    console.error('Использование: node browse.cjs <url> [--steps json] [--profile имя] [--shot file.png] [--links] [--max N]');
    process.exit(2);
  }
  if (!/^https?:\/\//i.test(out.url)) out.url = 'https://' + out.url;
  if (!Array.isArray(out.steps)) throw new Error('--steps должен быть JSON-массивом');
  if (out.profile && !/^[A-Za-z0-9_-]+$/.test(out.profile)) throw new Error('--profile: только латиница, цифры, - и _');
  return out;
}

async function runStep(page, step, timeout) {
  if (step.click) return page.click(step.click, { timeout });
  if (step.fill) return page.fill(step.fill, resolve(step.text), { timeout });
  if (step.press) return page.keyboard.press(step.press);
  if (step.type) return page.keyboard.type(resolve(step.type), { delay: 30 });
  if (step.select) return page.selectOption(step.select, step.value, { timeout });
  if (step.check) return page.check(step.check, { timeout });
  if (step.upload) return page.setInputFiles(step.upload, step.file, { timeout });
  if (step.waitFor) return page.waitForSelector(step.waitFor, { timeout });
  if (step.wait) return page.waitForTimeout(Math.min(Number(step.wait) || 0, 30000));
  if (step.scroll) {
    for (let i = 0; i < Number(step.scroll); i++) {
      await page.mouse.wheel(0, 1500);
      await page.waitForTimeout(400);
    }
    return;
  }
  if (step.goto) return page.goto(step.goto, { waitUntil: 'domcontentloaded', timeout });
  throw new Error('Неизвестный шаг: ' + JSON.stringify(step));
}

(async () => {
  if (process.argv.includes('--secrets')) return listSecrets();
  const opt = parseArgs(process.argv.slice(2));
  const statePath = opt.profile ? path.join(STATE_DIR, opt.profile + '.json') : null;
  const browser = await chromium.launch();
  let code = 0;
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      locale: 'ru-RU',
      storageState: statePath && fs.existsSync(statePath) ? statePath : undefined,
    });
    if (statePath && fs.existsSync(statePath)) console.log(`PROFILE: ${opt.profile} (вход подхвачен)`);
    const page = await context.newPage();
    await page.goto(opt.url, { waitUntil: 'domcontentloaded', timeout: opt.timeout });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});

    for (const [i, step] of opt.steps.entries()) {
      try {
        await runStep(page, step, opt.timeout);
        await page.waitForLoadState('domcontentloaded', { timeout: 8000 }).catch(() => {});
      } catch (e) {
        // Шаг печатается в виде шаблона ({{secret:...}}), значения секретов не попадают в вывод.
        console.log(redact(`!! Шаг ${i + 1} не выполнен (${JSON.stringify(step)}): ${e.message.split('\n')[0]}`));
        code = 1;
        break;
      }
    }
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    if (statePath) {
      fs.mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 });
      await context.storageState({ path: statePath });
      fs.chmodSync(statePath, 0o600);
      console.log(`PROFILE SAVED: ${opt.profile}`);
    }

    console.log(redact('URL: ' + page.url()));
    console.log(redact('TITLE: ' + (await page.title())));

    if (opt.shot) {
      // Поля паролей на скриншоте закрываются.
      await page.screenshot({ path: opt.shot, fullPage: false, mask: [page.locator('input[type=password]')] });
      console.log('SCREENSHOT: ' + opt.shot);
    }

    let text = await page.evaluate(() => document.body ? document.body.innerText : '');
    text = redact(text.replace(/\n{3,}/g, '\n\n').trim());
    if (text.length > opt.max) text = text.slice(0, opt.max) + `\n…[обрезано, всего ${text.length} символов]`;
    console.log('\n--- TEXT ---\n' + text);

    if (opt.links) {
      const links = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[href]'))
          .map(a => [(a.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 80), a.href])
          .filter(([t, h]) => h.startsWith('http'))
          .slice(0, 150));
      console.log('\n--- LINKS ---');
      for (const [t, h] of links) console.log(redact(`${t || '(без текста)'} -> ${h}`));
    }
  } catch (e) {
    console.log(redact('!! Ошибка: ' + e.message.split('\n')[0]));
    code = 1;
  } finally {
    await browser.close();
  }
  process.exit(code);
})();
