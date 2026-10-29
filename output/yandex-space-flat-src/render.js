// usage: node render.js outdir frames...  (frames: N or A-B ranges, end-exclusive)
const {chromium}=require('playwright');
(async()=>{
 const out=process.argv[2]; const list=[];
 for(const a of process.argv.slice(3)){ if(a.includes('-')){const [x,y]=a.split('-').map(Number);for(let i=x;i<y;i++)list.push(i);} else list.push(+a); }
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
 await p.goto('file://'+__dirname+'/scene.html');await p.evaluate(()=>document.fonts.ready);
 for(const n of list){ await p.evaluate(n=>window.draw(n),n);
   await p.screenshot({path:`${out}/f${String(n).padStart(5,'0')}.${process.env.EXT||'png'}`,type:process.env.EXT==='jpg'?'jpeg':'png',quality:process.env.EXT==='jpg'?95:undefined}); }
 await b.close();})();
