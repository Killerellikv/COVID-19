/* Illustrations dessinées en SVG : panneaux, feux, agents, marquages et carrefours vus du dessus.
   Fonctions pures (aucun accès au DOM) : utilisables dans le navigateur comme dans Node pour les tests. */
export const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

const C={r:"#C8102E",b:"#1F5AA6",y:"#F6C300",k:"#16181D",w:"#FFFFFF",g:"#8E949C"};
const FONT='font-family="Arial,Helvetica,sans-serif" font-weight="700" text-anchor="middle"';
const TRI=`<path d="M50 7 L95 87 Q97 92 91 92 L9 92 Q3 92 5 87 Z" fill="#fff" stroke="${C.r}" stroke-width="8" stroke-linejoin="round"/>`;
const RING=`<circle cx="50" cy="50" r="44" fill="#fff" stroke="${C.r}" stroke-width="10"/>`;
const BLUE=`<circle cx="50" cy="50" r="46" fill="${C.b}" stroke="#fff" stroke-width="2"/>`;
const SQ=`<rect x="5" y="5" width="90" height="90" rx="9" fill="${C.b}"/><rect x="10" y="10" width="80" height="80" rx="6" fill="none" stroke="#fff" stroke-width="2.5"/>`;
const SLASH=`<path d="M19 19 L81 81" stroke="${C.r}" stroke-width="9"/>`;
const DIAMOND=`<path d="M50 3 L97 50 L50 97 L3 50Z" fill="#fff" stroke="${C.k}" stroke-width="1.5"/><path d="M50 17 L83 50 L50 83 L17 50Z" fill="${C.y}"/>`;
const ENDLINES=`<g transform="rotate(-45 50 50)" stroke="${C.k}" stroke-width="2">${[-8,-4,0,4,8].map(d=>`<line x1="10" y1="${50+d}" x2="90" y2="${50+d}"/>`).join("")}</g>`;
function oct(r){const p=[];for(let k=0;k<8;k++){const a=(22.5+45*k)*Math.PI/180;p.push((50+r*Math.cos(a)).toFixed(2)+" "+(50+r*Math.sin(a)).toFixed(2));}return "M"+p.join(" L")+" Z";}
function carRear(cx,col,win){return `<g fill="${col}"><path d="M${cx-9} 45 L${cx-7} 37 Q${cx-6} 35 ${cx-4} 35 L${cx+4} 35 Q${cx+6} 35 ${cx+7} 37 L${cx+9} 45 Z"/><rect x="${cx-13}" y="44" width="26" height="15" rx="4"/><rect x="${cx-12}" y="58" width="6" height="7" rx="1.5"/><rect x="${cx+6}" y="58" width="6" height="7" rx="1.5"/></g><rect x="${cx-6}" y="38" width="12" height="5" rx="1" fill="${win}"/>`;}
function cross(){return [35,-35].map(a=>`<g transform="rotate(${a} 50 50)"><rect x="6" y="42" width="88" height="16" rx="2" fill="#fff" stroke="${C.r}" stroke-width="3"/></g>`).join("");}

function sign(code,v){
  switch(code){
    case "B1": return `<path d="M9 12 L91 12 Q97 12 94 17 L54 86 Q50 93 46 86 L6 17 Q3 12 9 12 Z" fill="#fff" stroke="${C.r}" stroke-width="8" stroke-linejoin="round"/>`;
    case "B5": return `<path d="${oct(47)}" fill="#fff"/><path d="${oct(43)}" fill="${C.r}"/><text x="50" y="59" font-size="25" ${FONT} fill="#fff">STOP</text>`;
    case "B9": return DIAMOND;
    case "B11": return DIAMOND+`<path d="M29 71 L71 29" stroke="${C.k}" stroke-width="10"/><path d="M22 64 L64 22 M36 78 L78 36" stroke="${C.k}" stroke-width="2"/>`;
    case "B15": return TRI+`<rect x="45" y="36" width="10" height="46" fill="${C.k}"/><rect x="31" y="56" width="38" height="5" fill="${C.k}"/>`;
    case "B17": return TRI+`<path d="M36 48 L64 80 M64 48 L36 80" stroke="${C.k}" stroke-width="8"/>`;
    case "A51": return TRI+`<rect x="45.5" y="38" width="9" height="30" rx="3" fill="${C.k}"/><circle cx="50" cy="77" r="5" fill="${C.k}"/>`;
    case "A33": return TRI+`<rect x="42" y="33" width="16" height="50" rx="4" fill="${C.k}"/><circle cx="50" cy="42" r="5.5" fill="${C.r}"/><circle cx="50" cy="58" r="5.5" fill="#F39200"/><circle cx="50" cy="74" r="5.5" fill="#2DB24A"/>`;
    case "A1a": return TRI+`<path d="M57 84 L57 64 Q57 48 42 40" fill="none" stroke="${C.k}" stroke-width="8"/>`;
    case "A45": return cross();
    case "C1": return `<circle cx="50" cy="50" r="46" fill="${C.r}"/><rect x="18" y="42" width="64" height="16" fill="#fff"/>`;
    case "C3": return RING;
    case "C43": {const s=String(v||"50");return RING+`<text x="50" y="${s.length>2?61:63}" font-size="${s.length>2?31:38}" ${FONT} fill="${C.k}">${s}</text>`;}
    case "C45": {const s=String(v||"70");return `<circle cx="50" cy="50" r="45" fill="#fff" stroke="${C.k}" stroke-width="1.5"/><text x="50" y="${s.length>2?61:63}" font-size="${s.length>2?31:38}" ${FONT} fill="${C.g}">${s}</text>`+ENDLINES;}
    case "C35": return RING+carRear(36,C.r,"#fff")+carRear(64,C.k,"#fff");
    case "C37": return `<circle cx="50" cy="50" r="45" fill="#fff" stroke="${C.k}" stroke-width="1.5"/>`+carRear(36,C.g,"#fff")+carRear(64,C.g,"#fff")+ENDLINES;
    case "C31": return RING+`<path d="M58 80 L58 48 Q58 40 50 40 L40 40" fill="none" stroke="${C.k}" stroke-width="8"/><path d="M28 40 L42 29 L42 51 Z" fill="${C.k}"/>`+SLASH;
    case "C33": return RING+`<path d="M38 80 L38 46 Q38 32 51 32 Q64 32 64 46 L64 54" fill="none" stroke="${C.k}" stroke-width="7"/><path d="M54 54 L74 54 L64 68 Z" fill="${C.k}"/>`+SLASH;
    case "D1": return BLUE+`<path d="M22 50 L62 50" stroke="#fff" stroke-width="11"/><path d="M58 32 L80 50 L58 68 Z" fill="#fff"/>`;
    case "D5": {let g=BLUE;const R=24;for(let k=0;k<3;k++){const a0=(105+120*k)*Math.PI/180,a1=a0+78*Math.PI/180;const p=a=>[50+R*Math.cos(a),50-R*Math.sin(a)];const [x0,y0]=p(a0),[x1,y1]=p(a1);const tx=-Math.sin(a1),ty=-Math.cos(a1),nx=Math.cos(a1),ny=-Math.sin(a1);g+=`<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 0 0 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="#fff" stroke-width="7"/><path d="M${(x1+tx*10).toFixed(1)} ${(y1+ty*10).toFixed(1)} L${(x1+nx*8).toFixed(1)} ${(y1+ny*8).toFixed(1)} L${(x1-nx*8).toFixed(1)} ${(y1-ny*8).toFixed(1)} Z" fill="#fff"/>`;}return g;}
    case "D7": return BLUE+`<g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="29" cy="61" r="12"/><circle cx="71" cy="61" r="12"/><path d="M29 61 L48 61 L43 41 L29 61 M43 41 L64 41 L48 61 M64 41 L71 61 M64 41 L61 33 L68 32 M38 38 L48 38"/></g>`;
    case "E1": return `<circle cx="50" cy="50" r="44" fill="${C.b}" stroke="${C.r}" stroke-width="10"/>`+SLASH;
    case "E3": return `<circle cx="50" cy="50" r="44" fill="${C.b}" stroke="${C.r}" stroke-width="10"/>`+SLASH+`<path d="M81 19 L19 81" stroke="${C.r}" stroke-width="9"/>`;
    case "E9a": return SQ+`<text x="50" y="72" font-size="60" ${FONT} fill="#fff">P</text>`;
    case "F19": return SQ+`<rect x="44" y="38" width="12" height="44" fill="#fff"/><path d="M28 42 L50 17 L72 42 Z" fill="#fff"/>`;
    case "F45": return SQ+`<rect x="42" y="36" width="16" height="48" fill="#fff"/><rect x="25" y="20" width="50" height="15" fill="${C.r}"/>`;
    case "F5": return SQ+`<path d="M27 86 L44 34 M73 86 L56 34" stroke="#fff" stroke-width="6" fill="none"/><path d="M50 84 V74 M50 66 V58" stroke="#fff" stroke-width="3"/><rect x="17" y="30" width="66" height="9" fill="#fff"/><rect x="21" y="39" width="7" height="14" fill="#fff"/><rect x="72" y="39" width="7" height="14" fill="#fff"/>`;
    case "Z30": return `<rect x="10" y="4" width="80" height="92" rx="6" fill="#fff" stroke="${C.k}" stroke-width="2.5"/><text x="50" y="28" font-size="17" ${FONT} fill="${C.k}">ZONE</text><circle cx="50" cy="62" r="25" fill="#fff" stroke="${C.r}" stroke-width="6"/><text x="50" y="71" font-size="25" ${FONT} fill="${C.k}">30</text>`;
  }
  return "";
}
function glyph(name){
  const st='fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';
  switch(name){
    case "road": return `<path d="M28 94 L42 6 M72 94 L58 6" ${st} stroke-width="6"/><path d="M50 12 V24 M50 38 V52 M50 66 V84" ${st} stroke-width="5"/>`;
    case "beam": return `<path d="M46 24 Q18 24 18 50 Q18 76 46 76 Z" ${st} stroke-width="6"/><path d="M58 30 L84 36 M58 44 L84 50 M58 58 L84 64 M58 72 L84 78" ${st} stroke-width="6"/>`;
    case "wheel": return `<circle cx="50" cy="50" r="36" ${st} stroke-width="7"/><circle cx="50" cy="56" r="8" ${st} stroke-width="6"/><path d="M15 46 Q50 34 85 46 M50 64 V86" ${st} stroke-width="6"/>`;
    case "warn": return `<path d="M50 12 L90 84 H10 Z" fill="none" stroke="${C.r}" stroke-width="9" stroke-linejoin="round"/>`;
  }
  return "";
}
function signSvg(code,v,cls){return `<svg class="${cls||"ill-sign"}" viewBox="0 0 100 100" role="img" aria-label="Signal routier">${sign(code,v)}</svg>`;}

function lightSvg(k){
  if(k==="pn"){
    return `<svg class="ill-light pn" viewBox="0 0 160 170" role="img" aria-label="Feux de passage à niveau"><g transform="translate(40,0) scale(.8)">${cross()}</g><rect x="22" y="86" width="116" height="44" rx="22" fill="#1C1F24"/><circle cx="52" cy="108" r="22" fill="${C.r}" opacity=".18"/><circle cx="108" cy="108" r="22" fill="${C.r}" opacity=".18"/><circle class="blink" cx="52" cy="108" r="15" fill="#E5322D"/><circle class="blink2" cx="108" cy="108" r="15" fill="#E5322D"/><rect x="76" y="130" width="8" height="40" fill="#5A606A"/></svg>`;
  }
  const on={red:0,orange:1,blink:1,green:2,arrow:2}[k];
  const cols=["#E5322D","#F5A300","#2DB24A"];
  let lamps="";
  for(let j=0;j<3;j++){
    const cy=32+j*46, lit=j===on;
    if(k==="arrow"&&j===2){lamps+=`<circle cx="50" cy="${cy}" r="18" fill="#2A2F36"/><path d="M36 ${cy} H60 M52 ${cy-9} L62 ${cy} L52 ${cy+9}" stroke="#2DB24A" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;continue;}
    if(lit)lamps+=`<g${k==="blink"?' class="blink"':""}><circle cx="50" cy="${cy}" r="24" fill="${cols[j]}" opacity=".25"/><circle cx="50" cy="${cy}" r="18" fill="${cols[j]}"/></g>`;
    else lamps+=`<circle cx="50" cy="${cy}" r="18" fill="#3A4048"/>`;
  }
  return `<svg class="ill-light" viewBox="0 0 100 172" role="img" aria-label="Feu de signalisation"><rect x="22" y="4" width="56" height="148" rx="12" fill="#1C1F24"/>${lamps}<rect x="46" y="152" width="8" height="20" fill="#5A606A"/></svg>`;
}

function agentSvg(kind){
  const arm='stroke="#22385E" stroke-width="9" stroke-linecap="round" fill="none"';
  const arms=kind==="up"
    ?`<path d="M80 52 L81 10" ${arm}/><circle cx="81" cy="7" r="5.5" fill="#fff" stroke="#22385E" stroke-width="1.5"/><path d="M60 52 L55 88" ${arm}/><circle cx="55" cy="92" r="5" fill="#fff" stroke="#22385E" stroke-width="1.5"/>`
    :`<path d="M60 52 H16" ${arm}/><path d="M80 52 H124" ${arm}/><circle cx="12" cy="52" r="5.5" fill="#fff" stroke="#22385E" stroke-width="1.5"/><circle cx="128" cy="52" r="5.5" fill="#fff" stroke="#22385E" stroke-width="1.5"/>`;
  return `<svg class="ill-agent" viewBox="0 0 140 150" role="img" aria-label="Agent de police"><rect x="0" y="140" width="140" height="10" fill="#8C96A3" opacity=".5"/><rect x="61" y="96" width="8" height="44" rx="3" fill="#1A2B49"/><rect x="71" y="96" width="8" height="44" rx="3" fill="#1A2B49"/>${arms}<rect x="57" y="44" width="26" height="56" rx="7" fill="#22385E"/><rect x="57" y="76" width="26" height="5" fill="#fff"/><circle cx="70" cy="33" r="10" fill="#E3BC96"/><rect x="58" y="19" width="24" height="8" rx="2" fill="#1A2B49"/><rect x="56" y="25" width="28" height="3" rx="1.5" fill="#1A2B49"/></svg>`;
}

let uid=0;
function markSvg(type,side){
  const id="m"+(++uid);
  let s=`<svg class="ill-mark" viewBox="0 0 260 130" role="img" aria-label="Marquage routier"><rect width="260" height="130" fill="#C9CED6"/><rect y="12" width="260" height="106" fill="#565D67"/>`;
  const yellow=type==="jaune-disc"||type==="jaune-cont";
  if(!yellow)s+=`<rect y="16" width="260" height="2" fill="#fff" opacity=".8"/><rect y="112" width="260" height="2" fill="#fff" opacity=".8"/>`;
  else s+=`<rect y="16" width="260" height="2" fill="#fff" opacity=".8"/>`;
  const solid=y=>`<rect y="${y-2}" width="260" height="4" fill="#fff"/>`;
  const dashed=(y,x0,x1)=>`<path d="M${x0==null?0:x0} ${y} H${x1==null?260:x1}" stroke="#fff" stroke-width="4" stroke-dasharray="20 14"/>`;
  let me=`<rect x="26" y="78" width="46" height="26" rx="6" fill="#2F6FDE"/><rect x="58" y="82" width="8" height="18" rx="2" fill="#DCE8F7"/>`;
  const truck=`<rect x="104" y="72" width="70" height="34" rx="4" fill="#8C96A3"/><rect x="164" y="76" width="7" height="26" rx="2" fill="#DCE8F7"/>`;
  switch(type){
    case "continue": s+=solid(65)+truck;break;
    case "discontinue": s+=dashed(65)+truck;break;
    case "mixte": s+=(side==="me"?solid(60)+dashed(70):dashed(60)+solid(70))+truck;break;
    case "dents": s+=dashed(65,0,205);for(const y of [70,81,92,103])s+=`<path d="M228 ${y} L228 ${y+9} L214 ${y+4.5} Z" fill="#fff"/>`;break;
    case "arret": s+=dashed(65,0,150)+`<rect x="150" y="63" width="80" height="4" fill="#fff"/><rect x="224" y="67" width="8" height="45" fill="#fff"/>`;break;
    case "hachures": {
      const poly="M30 65 L130 49 L250 49 L250 81 L130 81 Z";
      let lines="";for(let x=10;x<300;x+=12)lines+=`<line x1="${x}" y1="40" x2="${x-40}" y2="90"/>`;
      s+=dashed(65,0,26)+`<clipPath id="${id}"><path d="${poly}"/></clipPath><g clip-path="url(#${id})" stroke="#fff" stroke-width="3">${lines}</g><path d="${poly}" fill="none" stroke="#fff" stroke-width="3"/>`;
      break;}
    case "jaune-disc": case "jaune-cont":
      s+=dashed(65)+`<path d="M0 113 H260" stroke="#F2C200" stroke-width="4"${type==="jaune-disc"?' stroke-dasharray="16 10"':""}/>`;
      me=`<rect x="100" y="82" width="46" height="26" rx="6" fill="#2F6FDE"/><rect x="132" y="86" width="8" height="18" rx="2" fill="#DCE8F7"/>`;
      break;
    case "rabattement":
      s+=dashed(65,0,186)+`<rect x="186" y="63" width="74" height="4" fill="#fff"/>`;
      for(const x of [96,140]){s+=`<path d="M${x} 47 L${x+24} 55" stroke="#fff" stroke-width="4"/><path d="M${x+33.5} 58.2 L${x+22.4} 59.7 L${x+25.6} 50.3 Z" fill="#fff"/>`;}
      s+=truck;
      break;
  }
  return s+me+`</svg>`;
}

/* Carrefour vu du dessus. Tout est dessiné pour l'approche Sud puis tourné. */
const ROT={S:0,E:-90,N:180,W:90};
const VCOL={B:"#D9482B",C:"#E8A317",D:"#2E9E5B"};
const PATH={s:"M135 166 L135 72",l:"M135 166 L135 142 Q135 105 98 105 L72 105",r:"M135 166 Q135 135 166 135 L200 135"};
const HEAD={s:"M128 76 L135 62 L142 76 Z",l:"M74 98 L60 105 L74 112 Z",r:"M198 128 L212 135 L198 142 Z"};
function rot(dir,inner){const a=ROT[dir]||0;return a?`<g transform="rotate(${a} 120 120)">${inner}</g>`:inner;}
function upright(dir,cx,cy,inner){const a=ROT[dir]||0;return a?`<g transform="rotate(${-a} ${cx} ${cy})">${inner}</g>`:inner;}
function vehicle(o,isMe){
  const f=o.f||"S",k=o.k||"car",d=o.d||"s";
  if(k==="bike"){
    const col="#7B3FB0";
    const g=`<path d="M157 164 V104" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="6" stroke-linecap="round"/><path d="M157 164 V104" fill="none" stroke="${col}" stroke-width="3" stroke-dasharray="6 5"/><path d="M151 108 L157 95 L163 108 Z" fill="${col}" stroke="#fff" stroke-width="1"/><line x1="157" y1="168" x2="157" y2="196" stroke="#15171A" stroke-width="3" stroke-linecap="round"/><line x1="151" y1="174" x2="163" y2="174" stroke="#15171A" stroke-width="2"/><ellipse cx="157" cy="184" rx="6.5" ry="5" fill="${col}"/><circle cx="157" cy="181" r="3.5" fill="#2B2B2B"/>`;
    return rot(f,g);
  }
  const col=isMe?"#2F6FDE":(k==="tram"?"#F2C230":(VCOL[o.t]||"#D9482B"));
  let g=`<path d="${PATH[d]}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="${PATH[d]}" fill="none" stroke="${col}" stroke-width="3" stroke-dasharray="6 5" stroke-linecap="round"/><path d="${HEAD[d]}" fill="${col}" stroke="#fff" stroke-width="1"/>`;
  if(k==="tram")g+=`<rect x="123" y="168" width="24" height="76" rx="6" fill="${col}" stroke="#6B5200" stroke-width="1.5"/><rect x="127" y="173" width="16" height="7" rx="2" fill="#2B3440"/>`;
  else g+=`<rect x="125" y="170" width="20" height="34" rx="5" fill="${col}" stroke="rgba(0,0,0,.35)" stroke-width="1"/><rect x="128" y="175" width="14" height="7" rx="2" fill="#DCE8F7"/><rect x="128" y="196" width="14" height="4" rx="1.5" fill="#DCE8F7" opacity=".85"/>`;
  if(!isMe&&o.t)g+=upright(f,135,191,`<text x="135" y="195.5" font-size="12" ${FONT} fill="#fff" stroke="rgba(0,0,0,.5)" stroke-width="2" paint-order="stroke">${esc(o.t)}</text>`);
  return rot(f,g);
}
function sceneSvg(x){
  const others=x.o||[], signs=x.sg||{};
  let s=`<svg class="ill-scene" viewBox="0 0 240 240" role="img" aria-label="Carrefour vu du dessus"><rect width="240" height="240" fill="#C9CED6"/>`;
  for(const [qx,qy] of [[0,0],[154,0],[0,154],[154,154]])s+=`<rect x="${qx}" y="${qy}" width="86" height="86" rx="8" fill="#A7B694"/>`;
  s+=`<rect x="90" y="0" width="60" height="240" fill="#565D67"/><rect x="0" y="90" width="240" height="60" fill="#565D67"/><path d="M120 0 V88 M120 152 V240 M0 120 H88 M152 120 H240" stroke="#fff" stroke-width="2" stroke-dasharray="9 7"/>`;
  if(others.some(o=>o.k==="bike")){
    s+=`<rect x="151" y="0" width="12" height="90" fill="#B4553F"/><rect x="151" y="150" width="12" height="90" fill="#B4553F"/><path d="M151 92 V150 M163 92 V150" stroke="#fff" stroke-width="2" stroke-dasharray="4 4"/>`;
  }
  for(const o of others)if(o.k==="tram")s+=rot(o.f,`<path d="M129 0 V240 M141 0 V240" stroke="#2B2F35" stroke-width="1.6"/>`);
  for(const [dir,code] of Object.entries(signs)){
    if(code==="B5")s+=rot(dir,`<rect x="121" y="151" width="28" height="5" fill="#fff"/>`);
    if(code==="B1")s+=rot(dir,[0,1,2].map(k=>`<path d="M${123+k*9} 152 L${130+k*9} 152 L${126.5+k*9} 160 Z" fill="#fff"/>`).join(""));
  }
  for(const o of others)s+=vehicle(o,false);
  s+=vehicle({f:"S",d:x.md||"s"},true);
  s+=`<text x="135" y="222" font-size="11" ${FONT} fill="#fff">vous</text>`;
  for(const [dir,code] of Object.entries(signs))s+=rot(dir,upright(dir,173,165,`<g transform="translate(159,151) scale(.28)">${sign(code)}</g>`));
  return s+`</svg>`;
}
function illus(i){
  if(!i)return "";
  if(i.s)return signSvg(i.s,i.v);
  if(i.l)return lightSvg(i.l);
  if(i.x)return sceneSvg(i.x);
  if(i.m)return markSvg(i.m,i.side);
  if(i.ag)return agentSvg(i.ag);
  return "";
}

export {sign,glyph,signSvg,illus};
