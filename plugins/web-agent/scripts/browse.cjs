#!/usr/bin/env node
// Браузер для агента web-agent: открывает страницу в Chromium (Playwright),
// выполняет шаги (клик, ввод текста, ожидание, прокрутка) и печатает текст страницы,
// ссылки и путь к скриншоту.
//
//   node browse.cjs <url> [--steps '<json>'] [--shot файл.png] [--links] [--max 20000]
//
// Шаги — JSON-массив, например:
//   [{"fill":"input[name=q]","text":"котики"},{"press":"Enter"},{"wait":2000},
//    {"click":"text=Images"},{"scroll":3},{"waitFor":"#results"}]
//
// Ничего не отправляет на сайты само: только то, что указано в шагах.
'use strict';

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  console.error('Нет Playwright. В облаке он уже есть; на компьютере: npm i -g playwright && npx playwright install chromium');
  process.exit(2);
}

function parseArgs(argv) {
  const out = { url: null, steps: [], shot: null, links: false, max: 20000, timeout: 30000 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--steps') out.steps = JSON.parse(argv[++i] || '[]');
    else if (a === '--shot') out.shot = argv[++i];
    else if (a === '--links') out.links = true;
    else if (a === '--max') out.max = Number(argv[++i]) || out.max;
    else if (a === '--timeout') out.timeout = Number(argv[++i]) || out.timeout;
    else if (!out.url) out.url = a;
  }
  if (!out.url) {
    console.error('Использование: node browse.cjs <url> [--steps json] [--shot file.png] [--links] [--max N]');
    process.exit(2);
  }
  if (!/^https?:\/\//i.test(out.url)) out.url = 'https://' + out.url;
  if (!Array.isArray(out.steps)) throw new Error('--steps должен быть JSON-массивом');
  return out;
}

async function runStep(page, step, timeout) {
  if (step.click) return page.click(step.click, { timeout });
  if (step.fill) return page.fill(step.fill, String(step.text ?? ''), { timeout });
  if (step.press) return page.keyboard.press(step.press);
  if (step.type) return page.keyboard.type(String(step.type));
  if (step.select) return page.selectOption(step.select, step.value, { timeout });
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
  const opt = parseArgs(process.argv.slice(2));
  const browser = await chromium.launch();
  let code = 0;
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      locale: 'ru-RU',
    });
    const page = await context.newPage();
    await page.goto(opt.url, { waitUntil: 'domcontentloaded', timeout: opt.timeout });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});

    for (const [i, step] of opt.steps.entries()) {
      try {
        await runStep(page, step, opt.timeout);
        await page.waitForLoadState('domcontentloaded', { timeout: 8000 }).catch(() => {});
      } catch (e) {
        console.log(`!! Шаг ${i + 1} не выполнен (${JSON.stringify(step)}): ${e.message.split('\n')[0]}`);
        code = 1;
        break;
      }
    }

    console.log('URL: ' + page.url());
    console.log('TITLE: ' + (await page.title()));

    if (opt.shot) {
      await page.screenshot({ path: opt.shot, fullPage: false });
      console.log('SCREENSHOT: ' + opt.shot);
    }

    let text = await page.evaluate(() => document.body ? document.body.innerText : '');
    text = text.replace(/\n{3,}/g, '\n\n').trim();
    if (text.length > opt.max) text = text.slice(0, opt.max) + `\n…[обрезано, всего ${text.length} символов]`;
    console.log('\n--- TEXT ---\n' + text);

    if (opt.links) {
      const links = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[href]'))
          .map(a => [(a.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 80), a.href])
          .filter(([t, h]) => h.startsWith('http'))
          .slice(0, 150));
      console.log('\n--- LINKS ---');
      for (const [t, h] of links) console.log(`${t || '(без текста)'} -> ${h}`);
    }
  } catch (e) {
    console.log('!! Ошибка: ' + e.message.split('\n')[0]);
    code = 1;
  } finally {
    await browser.close();
  }
  process.exit(code);
})();
