const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [,,d,out]=process.argv;fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+d+'/anim.html');await p.waitForFunction('window.ready');await p.waitForTimeout(800);
for(let k=0;k<80;k++){await p.evaluate(t=>seek(t),10.45+k/60);await p.screenshot({path:`${out}/${String(k).padStart(4,'0')}.jpg`,type:'jpeg',quality:93});}
await b.close()})();
