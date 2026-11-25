const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [,,d,start,end,sub]=process.argv;const SUB=+sub;fs.mkdirSync(d+'/frames',{recursive:true});
const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+d+'/anim.html');await p.waitForFunction('window.ready');await p.waitForTimeout(800);
for(let f=+start;f<+end;f++){for(let s=0;s<SUB;s++){const t=f/60+(s-(SUB-1)/2)/(60*SUB);
 await p.evaluate(t=>seek(Math.max(0,t)),t);await p.screenshot({path:`${d}/frames/${String(f*SUB+s).padStart(6,'0')}.jpg`,type:'jpeg',quality:92});}
 if(f%120==0)console.log(start,'frame',f);}
await b.close()})();
