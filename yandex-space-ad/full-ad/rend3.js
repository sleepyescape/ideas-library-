const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [,,d,out,dur,mode,ext]=process.argv;fs.mkdirSync(d+'/'+out,{recursive:true});
const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+d+'/finale3.html');await p.waitForFunction('window.ready');await p.waitForTimeout(500);
const N=Math.round(+dur*60);for(let k=0;k<N;k++){await p.evaluate(([t,m])=>seek(t,m),[k/60,mode]);
 await p.screenshot({path:`${d}/${out}/${String(k).padStart(4,'0')}.${ext}`,omitBackground:ext==='png',...(ext==='jpg'?{type:'jpeg',quality:93}:{})});}
await b.close()})();
