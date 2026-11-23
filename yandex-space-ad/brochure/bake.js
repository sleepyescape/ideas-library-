const {chromium}=require('playwright');(async()=>{const d=process.argv[2];const b=await chromium.launch();
const p=await b.newPage({viewport:{width:600,height:1700},deviceScaleFactor:3.2});
await p.goto('file://'+d+'/shadow.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
const s=await (await p.$('.stage')).boundingBox();
await p.screenshot({path:d+'/stage.png',clip:s});
const m=await (await p.$('.mini .phone')).boundingBox();const pad=30;
await p.screenshot({path:d+'/mini.png',clip:{x:m.x-pad,y:m.y-pad,width:m.width+2*pad,height:m.height+2*pad}});
console.log(JSON.stringify({s,m}));await b.close()})();
