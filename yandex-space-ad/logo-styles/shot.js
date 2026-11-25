const {chromium}=require('playwright');(async()=>{const [,,f,o,w,h,dpr]=process.argv;const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:+w,height:+h},deviceScaleFactor:+(dpr||1)});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+f);await p.waitForTimeout(1500);try{await p.waitForFunction('window.ready!==false',{timeout:60000})}catch(e){}
await p.screenshot({path:o});await b.close()})();
