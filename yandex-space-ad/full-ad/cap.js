const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const d=process.argv[2],out=d+'/appcap',FPS=60;fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('C',m.text())});
await p.addInitScript({path:d+'/vt.js'});
await p.goto('file:///home/user/sleepyescape/yandex-space/app/index.html');
const step=async ms=>{await p.evaluate(ms=>__step(ms),ms)};
for(let i=0;i<80;i++)await step(50);            // boot 4 s
await p.keyboard.press('3');for(let i=0;i<40;i++)await step(50);  // company scenario, settle 2 s
// set guests to 4 to start counting from a low number
for(let k=0;k<3;k++){const m=await p.$('.res-guests .stepper button[data-d="-1"]');if(m)await m.click();await step(30)}
for(let i=0;i<30;i++)await step(50);
await p.screenshot({path:d+'/pre.png'});
const acts=[];
const at=(t,f)=>acts.push({t,f,done:false});
for(let k=0;k<9;k++)at(0.45+k*0.17,async()=>{const pl=await p.$('.res-guests .stepper button[data-d="1"]');if(pl)await pl.click()});
at(2.3,async()=>{await p.$eval('.marker[data-id=kystybyi] .mk',e=>e.click())});
at(5.25,async()=>{await p.evaluate(()=>{const ts=[...document.querySelectorAll('g.tbl.free')];let best=null,ba=0;ts.forEach(g=>{const r=g.getBoundingClientRect();if(r.width*r.height>ba){ba=r.width*r.height;best=g}});best&&best.dispatchEvent(new MouseEvent('click',{bubbles:true}))})});
const N=Math.round(6.65*FPS);
for(let k=0;k<N;k++){const t=k/FPS;
 for(const a of acts)if(!a.done&&t>=a.t){a.done=true;await a.f()}
 // smooth manual scroll of the card 3.9..5.3 s
 if(t>=3.5&&t<=5.0){const q=Math.min(1,(t-3.5)/1.5),e=q<.5?4*q*q*q:1-Math.pow(-2*q+2,3)/2;
   await p.evaluate(e=>{const s=document.querySelector('.card-scroll');if(s){if(window.__s0==null){window.__s0=s.scrollTop;window.__s1=s.scrollHeight-s.clientHeight}s.scrollTop=window.__s0+(window.__s1-window.__s0)*e}},e)}
 await step(1000/FPS);
 await p.screenshot({path:`${out}/${String(k).padStart(4,'0')}.jpg`,type:'jpeg',quality:94});
}
await b.close()})();
