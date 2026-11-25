const {chromium}=require('playwright');(async()=>{const d=process.argv[2],n=+process.argv[3],fps=+process.argv[4];const b=await chromium.launch();
const p=await b.newPage({viewport:{width:800,height:+(process.argv[6]||1060)}});await p.goto('file://'+d+'/'+(process.argv[5]||'ui.html')+'');await p.waitForFunction('window.ready');await p.waitForTimeout(300);
require('fs').mkdirSync(d+'/'+(process.argv[7]||'ui'),{recursive:true});
for(let k=0;k<n;k++){await p.evaluate(t=>seek(t),k/fps);await p.screenshot({path:`${d}/${process.argv[7]||'ui'}/${String(k).padStart(3,'0')}.png`,omitBackground:true});}
await b.close()})();
