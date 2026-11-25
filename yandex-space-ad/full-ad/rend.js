const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [,,d,html,out,dur,fps]=process.argv;fs.mkdirSync(d+'/'+out,{recursive:true});
const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+d+'/'+html);await p.waitForFunction('window.ready',{timeout:60000});await p.waitForTimeout(500);
const N=Math.round(+dur*+fps);for(let k=0;k<N;k++){await p.evaluate(t=>seek(t),k/+fps);await p.screenshot({path:`${d}/${out}/${String(k).padStart(4,'0')}.jpg`,type:'jpeg',quality:93});}
await b.close()})();
