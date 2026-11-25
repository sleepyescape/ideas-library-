(()=>{let now=0;const T0=1795000000000;const timers=[];let id=1;
performance.now=()=>now;Date.now=()=>T0+now;
window.setTimeout=(f,d=0,...a)=>{const i=id++;timers.push({i,t:now+Math.max(0,+d||0),f,a});return i};
window.clearTimeout=i=>{for(let k=timers.length-1;k>=0;k--)if(timers[k].i===i)timers.splice(k,1)};
window.setInterval=(f,d,...a)=>{const i=id++;const tick=()=>{timers.push({i,t:now+d,f:tick,a:[]});f(...a)};timers.push({i,t:now+d,f:tick,a:[]});return i};
window.clearInterval=window.clearTimeout;
let rafs=[];window.requestAnimationFrame=f=>{const i=id++;rafs.push({i,f});return i};window.cancelAnimationFrame=i=>{rafs=rafs.filter(r=>r.i!==i)};
window.__step=(dt)=>{const target=now+dt;
 for(let g=0;g<10000;g++){timers.sort((a,b)=>a.t-b.t);if(!timers.length||timers[0].t>target)break;const x=timers.shift();now=x.t;try{x.f(...x.a)}catch(e){console.error(e)}}
 now=target;const r=rafs;rafs=[];r.forEach(x=>{try{x.f(now)}catch(e){console.error(e)}});
 document.getAnimations().forEach(a=>{if(!a.__vt){a.__vt=1;a.pause();a.currentTime=0}else{a.currentTime=(a.currentTime||0)+dt}});
};})();
