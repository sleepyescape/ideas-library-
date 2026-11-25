// Vector logo, 512 box. opts: bg, beam, hi, fur (furniture), ring, ringW
window.LOGO=(o={})=>{const bg=o.bg??'#1E1E1E',beam=o.beam??'#FFC21A',hi=o.hi??'#FFD45A',fur=o.fur??'#FBF8F0';
const id='c'+Math.random().toString(36).slice(2,8);
const chairL='M44 238 C30 238 26 250 28 262 L50 356 C53 368 62 374 74 374 L176 374 C190 374 196 366 193 354 L190 344 C187 334 180 330 168 330 L110 330 C99 330 93 324 91 313 L79 256 C76 244 66 238 52 238 Z';
const beamP='M338 12 L120 222 L405 232 L300 430 L330 498 A250 250 0 0 0 338 12 Z';
return `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" ${o.attrs||''}>
<defs><clipPath id="${id}"><circle cx="256" cy="256" r="250"/></clipPath></defs>
${bg==='none'?'':`<circle cx="256" cy="256" r="250" fill="${bg}"/>`}
<g clip-path="url(#${id})"><path d="M338 0 L118 222 L262 262 L300 434 L506 226 L620 -60 Z" fill="${beam}"/>
<path d="M342 6 L386 24 L380 156 L226 126 Z" fill="${hi}"/></g>
<g fill="${fur}" ${o.furStroke?`stroke="${o.furStroke}" stroke-width="${o.furStrokeW||12}" stroke-linejoin="round" paint-order="stroke"`:''}><ellipse cx="252" cy="240" rx="142" ry="44"/>
<path d="M238 276 L266 276 L268 396 C270 418 300 426 316 432 C324 436 322 446 312 446 L192 446 C182 446 180 436 188 432 C204 426 234 418 236 396 Z"/>
<path d="${chairL}"/><path d="${chairL}" transform="translate(512 0) scale(-1 1)"/></g>
${o.ring?`<circle cx="256" cy="256" r="${250-(o.ringW||14)/2}" fill="none" stroke="${o.ring}" stroke-width="${o.ringW||14}"/>`:''}
</svg>`};
