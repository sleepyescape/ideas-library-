import json
p=json.load(open('paths.json'))
js="window.LP="+json.dumps(p)+";\n"+r"""
window.LOGO=(o={})=>{const bg=o.bg??'#1A1A1A',beam=o.beam??'#FCBF1E',hi=o.hi??'#FAD974',fur=o.fur??'#F9F8F1';
const fs=o.furStroke?`stroke="${o.furStroke}" stroke-width="${o.furStrokeW||12}" stroke-linejoin="round" paint-order="stroke"`:'';
const k=o.ring?(250-(o.ringW||14))/250:1;
return `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g transform="translate(256 256) scale(${k}) translate(-256 -256)">
${bg==='none'?'':`<path d="${LP.circle}" fill="${bg}"/>`}
${beam==='none'?'':`<path d="${LP.beam}" fill="${beam}" stroke="${beam}" stroke-width="2.5" stroke-linejoin="round"/>`}
${hi==='none'?'':`<path d="${LP.hi}" fill="${hi}"/>`}
<path d="${LP.fur}" fill="${fur}" ${fs}/></g>
${o.ring?`<circle cx="256" cy="256" r="${252-(o.ringW||14)/2}" fill="none" stroke="${o.ring}" stroke-width="${o.ringW||14}"/>`:''}
</svg>`};"""
open('logo.js','w').write(js)
