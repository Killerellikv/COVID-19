import {THEMES,QUESTIONS as Q} from "./questions.js";
import {illus,signSvg,glyph,esc} from "./illustrations.js";
import {initPwa} from "./pwa.js";

const $=s=>document.querySelector(s);
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function hash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return (h>>>0).toString(36);}

const THEME_BY_ID=Object.fromEntries(THEMES.map(t=>[t.id,t]));
const ids=new Set();
Q.forEach(q=>{let id=q.t+"-"+hash(q.q+"|"+JSON.stringify(q.i||0));while(ids.has(id))id+="x";ids.add(id);q.id=id;});
const BY_ID=Object.fromEntries(Q.map(q=>[q.id,q]));
const EXAM_N=50, PASS_RATIO=41/50;

/* ---------- Progression (navigateur) ---------- */
const KEY="permisB-be.v1";
let DB={stats:{},errors:[],history:[],timer:15};
try{const raw=localStorage.getItem(KEY);if(raw){const d=JSON.parse(raw);if(d&&typeof d==="object")DB=Object.assign(DB,d);}}catch(e){}
DB.errors=(DB.errors||[]).filter(id=>BY_ID[id]);
function save(){try{localStorage.setItem(KEY,JSON.stringify(DB));}catch(e){}}
function record(q,ok){
  const s=DB.stats[q.id]||{n:0,ok:0};s.n++;if(ok)s.ok++;s.last=ok?1:0;DB.stats[q.id]=s;
  const i=DB.errors.indexOf(q.id);
  if(ok&&i>=0)DB.errors.splice(i,1);
  if(!ok&&i<0)DB.errors.push(q.id);
  save();
}

/* ---------- Accueil ---------- */
const views=["v-home","v-quiz","v-result"];
function show(v){views.forEach(id=>{$("#"+id).hidden=id!==v;});window.scrollTo(0,0);}
function mastered(qs){return qs.filter(q=>DB.stats[q.id]&&DB.stats[q.id].last).length;}
function fmtDate(t){try{return new Date(t).toLocaleDateString("fr-BE",{day:"numeric",month:"short"});}catch(e){return "";}}
function renderHome(){
  $("#lede").textContent=`${Q.length} questions originales basées sur le code de la route belge. Passez des examens blancs dans les conditions du jour J, ou entraînez-vous thème par thème avec la correction expliquée.`;
  const m=mastered(Q),pct=Math.round(100*m/Q.length);
  $("#st-mastery").textContent=pct+" %";
  $("#st-bar").style.width=pct+"%";
  $("#st-seen").textContent=`${Q.filter(q=>DB.stats[q.id]).length} / ${Q.length}`;
  const ex=DB.history||[];
  $("#st-pass").textContent=`${ex.filter(h=>h.pass).length} / ${ex.length}`;
  $("#st-best").textContent=ex.length?Math.max(...ex.map(h=>h.score))+" / "+(ex[0].total||EXAM_N):"–";
  $("#err-count").textContent=DB.errors.length;
  $("#err-count").hidden=!DB.errors.length;
  $("#go-errors").disabled=!DB.errors.length;
  $("#history").innerHTML=ex.slice(0,5).map(h=>`<li><span class="sc">${h.score}/${h.total||EXAM_N}</span><span class="pill ${h.pass?"ok":"ko"}">${h.pass?"Réussi":"Échoué"}</span><time>${fmtDate(h.d)}</time></li>`).join("");
  $("#hist-empty").hidden=ex.length>0;
  $("#themes").innerHTML=THEMES.map(t=>{
    const qs=Q.filter(q=>q.t===t.id),p=qs.length?Math.round(100*mastered(qs)/qs.length):0;
    const ic=t.icon.s?signSvg(t.icon.s,t.icon.v,""):`<svg viewBox="0 0 100 100" aria-hidden="true">${glyph(t.icon.g)}</svg>`;
    return `<button type="button" class="theme" data-theme="${t.id}" id="th-${t.id}"><span class="ic" aria-hidden="true">${ic}</span><span class="nm">${esc(t.name)}</span><span class="meta"><span>${qs.length} q.</span><span class="bar"><i style="width:${p}%"></i></span><span class="pc">${p} %</span></span></button>`;
  }).join("");
  ["15","30","0"].forEach(v=>$("#t-"+v).setAttribute("aria-pressed",String(String(DB.timer)===v)));
}

/* ---------- Quiz ---------- */
let S=null, LAST=null, tick=null;
function prep(q){
  let answers=q.a.map((t,i)=>({t,ok:i===q.r}));
  const numeric=answers.every(a=>/^\d/.test(a.t));
  const yesno=answers.length===2&&answers.every(a=>/^(Oui|Non)\b/.test(a.t));
  if(yesno)answers.sort((a,b)=>(/^Oui/.test(a.t)?-1:1)-(/^Oui/.test(b.t)?-1:1));
  else if(!numeric)answers=shuffle(answers);
  return {q,answers};
}
function buildExam(n){
  n=Math.min(n,Q.length);
  const groups=THEMES.map(t=>shuffle(Q.filter(q=>q.t===t.id)));
  const quotas=groups.map(g=>Math.round(n*g.length/Q.length));
  let sum=quotas.reduce((a,b)=>a+b,0);
  while(sum!==n){
    const dir=sum<n?1:-1;let best=-1;
    groups.forEach((g,i)=>{
      const can=dir>0?quotas[i]<g.length:quotas[i]>0;
      if(!can)return;
      if(best<0||(dir>0?g.length-quotas[i]>groups[best].length-quotas[best]:quotas[i]>quotas[best]))best=i;
    });
    quotas[best]+=dir;sum+=dir;
  }
  return shuffle(groups.flatMap((g,i)=>g.slice(0,quotas[i])));
}
function start(mode,list,label,kind){
  stopTimer();disarmQuit();
  S={mode,label,kind,items:list.map(prep),idx:0,results:[],selected:null,answered:false};
  if(!history.state||history.state.v==="home")history.pushState({v:"quiz"},"");
  else history.replaceState({v:"quiz"},"");
  show("v-quiz");renderQ();
}
function renderQ(){
  const it=S.items[S.idx];
  S.selected=null;S.answered=false;
  $("#q-mode").textContent=S.label;
  $("#q-count").textContent=`${S.idx+1} / ${S.items.length}`;
  $("#q-bar").style.width=(100*S.idx/S.items.length)+"%";
  const img=$("#q-img");img.innerHTML=illus(it.q.i);img.hidden=!it.q.i;
  $("#q-text").textContent=it.q.q;
  $("#q-answers").innerHTML=it.answers.map((a,i)=>`<button type="button" class="ans" id="ans-${i}" data-i="${i}" aria-pressed="false"><span class="k">${"ABC"[i]}</span><span>${esc(a.t)}</span></button>`).join("");
  $("#q-feedback").hidden=true;
  updateAction();startTimer();
}
function updateAction(){
  const b=$("#q-action"),last=S.idx===S.items.length-1;
  if(S.mode==="exam"){b.hidden=false;b.textContent=last?"Valider et terminer":"Valider";b.disabled=S.selected==null;}
  else{b.hidden=!S.answered;b.disabled=false;b.textContent=last?"Voir le résultat":"Question suivante";}
}
function pick(i){
  if(!S||S.answered)return;
  const it=S.items[S.idx];if(i<0||i>=it.answers.length)return;
  S.selected=i;
  document.querySelectorAll(".ans").forEach(el=>el.setAttribute("aria-pressed",String(+el.dataset.i===i)));
  if(S.mode==="exam")updateAction();else commit();
}
function commit(){
  if(!S||S.answered)return;
  const it=S.items[S.idx],chosen=S.selected,ok=chosen!=null&&it.answers[chosen].ok;
  S.answered=true;stopTimer();
  S.results.push({q:it.q,answers:it.answers,chosen,ok});
  record(it.q,ok);
  if(S.mode==="exam"){next();return;}
  document.querySelectorAll(".ans").forEach(el=>{
    const i=+el.dataset.i;el.disabled=true;el.setAttribute("aria-pressed","false");
    if(it.answers[i].ok)el.classList.add("is-ok");else if(i===chosen)el.classList.add("is-ko");
  });
  const fb=$("#q-feedback");
  fb.className="feedback "+(ok?"ok":"ko");
  fb.innerHTML=`<div class="fb-title">${ok?"Bonne réponse":"Mauvaise réponse"}${!ok&&it.q.g?'<span class="tag-grave">Faute grave · −5</span>':""}</div>${ok?"":`<p><strong>Réponse correcte :</strong> ${esc(it.answers.find(a=>a.ok).t)}</p>`}<p>${esc(it.q.e)}</p>`;
  fb.hidden=false;updateAction();$("#q-action").focus({preventScroll:true});
}
function next(){S.idx++;if(S.idx>=S.items.length)finish();else renderQ();}
function startTimer(){
  stopTimer();
  const box=$("#q-timer");
  if(S.mode!=="exam"||!DB.timer){box.hidden=true;return;}
  box.hidden=false;box.classList.remove("low");
  const total=DB.timer*1000,t0=performance.now();
  const upd=()=>{
    const left=Math.max(0,total-(performance.now()-t0));
    $("#timer-fill").style.width=(100*left/total)+"%";
    $("#timer-s").textContent=Math.ceil(left/1000)+" s";
    box.classList.toggle("low",left<5000);
    if(left<=0){stopTimer();commit();}
  };
  upd();tick=setInterval(upd,100);
}
function stopTimer(){if(tick){clearInterval(tick);tick=null;}}

/* ---------- Résultat ---------- */
function finish(){
  stopTimer();disarmQuit();
  const R=S.results,total=R.length,good=R.filter(r=>r.ok).length;
  const grave=R.filter(r=>!r.ok&&r.q.g).length,simple=R.filter(r=>!r.ok&&!r.q.g).length,none=R.filter(r=>r.chosen==null).length;
  LAST={...S,good,grave,simple,none,total};
  const sign=$("#r-sign"),title=$("#r-title"),line=$("#r-line");
  $("#r-kind").textContent=S.label;
  if(S.mode==="exam"){
    const need=Math.ceil(total*PASS_RATIO),score=Math.max(0,total-simple-5*grave),pass=score>=need;
    LAST.score=score;
    DB.history.unshift({d:Date.now(),score,total,grave,simple,pass});DB.history=DB.history.slice(0,30);save();
    sign.innerHTML=`<div>${score}<small>/ ${total}</small></div>`;
    title.textContent=pass?"Réussi":"Échoué";title.className=pass?"ok":"ko";
    line.textContent=pass?`Il fallait au moins ${need} points sur ${total}. Bon travail !`
      :grave>=2?`Il fallait ${need} points. Avec ${grave} fautes graves (−${5*grave} points), l'examen est perdu même sans autre erreur.`
      :`Il fallait ${need} points : il vous en manque ${need-score}.`;
    $("#r-tally").innerHTML=`<li><b>${good}</b>bonnes réponses</li><li><b>${simple}</b>erreurs (−1)</li><li><b>${grave}</b>fautes graves (−5)</li>${none?`<li><b>${none}</b>sans réponse</li>`:""}`;
    $("#r-again").textContent="Nouvel examen blanc";
  }else{
    const pct=total?Math.round(100*good/total):0;
    sign.innerHTML=`<div>${good}<small>/ ${total}</small></div>`;
    title.textContent=`${pct} % de bonnes réponses`;title.className=pct>=82?"ok":"ko";
    line.textContent=pct>=82?"Au-dessus du seuil de réussite de l'examen (82 %).":"Le seuil de réussite de l'examen est de 82 % (41/50). Revoyez les explications ci-dessous.";
    $("#r-tally").innerHTML=`<li><b>${good}</b>bonnes réponses</li><li><b>${total-good}</b>erreurs</li>${grave?`<li><b>${grave}</b>dont fautes graves</li>`:""}`;
    $("#r-again").textContent="Recommencer cette série";
  }
  S=null;
  $("#r-errors").disabled=!DB.errors.length;
  $("#r-all").checked=false;
  history.replaceState({v:"result"},"");
  renderReview();show("v-result");
}
function renderReview(){
  const all=$("#r-all").checked;
  const items=LAST.results.map((r,i)=>Object.assign({n:i+1},r)).filter(r=>all||!r.ok);
  if(!items.length){$("#r-list").innerHTML=`<li class="empty">Aucune erreur dans cette série. Bravo !</li>`;return;}
  $("#r-list").innerHTML=items.map(r=>{
    const right=r.answers.find(a=>a.ok).t,mine=r.chosen==null?null:r.answers[r.chosen].t;
    const ans=r.ok?`<p class="rv-a ok">✓ ${esc(right)}</p>`
      :(mine==null?`<p class="rv-a ko none">Pas de réponse (temps écoulé)</p>`:`<p class="rv-a ko">✗ ${esc(mine)}</p>`)+`<p class="rv-a ok">✓ ${esc(right)}</p>`;
    return `<li class="rv ${r.ok?"is-ok":"is-ko"}"><div class="rv-head"><span class="rv-n">${r.n}</span><span>${esc(THEME_BY_ID[r.q.t].name)}</span>${!r.ok&&r.q.g?'<span class="tag-grave">Faute grave · −5</span>':""}</div><div class="rv-body${r.q.i?"":" noimg"}">${r.q.i?`<div class="rv-img plate">${illus(r.q.i)}</div>`:""}<div class="rv-txt"><p class="rv-q">${esc(r.q.q)}</p>${ans}<p class="rv-e">${esc(r.q.e)}</p></div></div></li>`;
  }).join("");
}

/* ---------- Navigation (bouton Retour du téléphone compris) ---------- */
function startExam(){start("exam",buildExam(EXAM_N),"Examen blanc","exam");}
function startQuick(){start("practice",shuffle(Q).slice(0,20),"Entraînement rapide","quick");}
function startErrors(){const l=DB.errors.map(id=>BY_ID[id]).filter(Boolean);if(l.length)start("practice",shuffle(l),"Mes erreurs","errors");}
function startTheme(id){start("practice",shuffle(Q.filter(q=>q.t===id)),THEME_BY_ID[id].name,"theme:"+id);}
function showHome(){stopTimer();disarmQuit();S=null;renderHome();show("v-home");}
let leaving=false;
function goHome(){
  stopTimer();
  if(history.state&&history.state.v&&history.state.v!=="home"){leaving=true;history.back();return;}
  showHome();
}
function examInProgress(){return !!(S&&S.mode==="exam"&&S.results.length>0&&!$("#v-quiz").hidden);}
let quitArmed=null;
function armQuit(){
  const q=$("#quit");q.textContent="Confirmer l'abandon";
  clearTimeout(quitArmed);quitArmed=setTimeout(disarmQuit,3500);
}
function disarmQuit(){clearTimeout(quitArmed);quitArmed=null;const q=$("#quit");if(q)q.textContent="Quitter";}
function requestQuit(){
  if(examInProgress()&&!quitArmed){armQuit();return;}
  disarmQuit();goHome();
}
window.addEventListener("popstate",e=>{
  const v=e.state&&e.state.v;
  if(v==="quiz"&&!S){history.back();return;}
  if(v==="result"&&!LAST){history.back();return;}
  if(v==="home"||!v){
    if(!leaving&&examInProgress()&&!quitArmed){history.pushState({v:"quiz"},"");armQuit();return;}
    leaving=false;showHome();
  }
});

$("#brand").addEventListener("click",()=>{if(!$("#v-quiz").hidden)requestQuit();else goHome();});
$("#go-exam").addEventListener("click",startExam);
$("#go-quick").addEventListener("click",startQuick);
$("#go-errors").addEventListener("click",startErrors);
$("#themes").addEventListener("click",e=>{const b=e.target.closest(".theme");if(b)startTheme(b.dataset.theme);});
document.querySelectorAll(".seg button").forEach(b=>b.addEventListener("click",()=>{DB.timer=+b.dataset.timer;save();renderHome();}));
$("#q-answers").addEventListener("click",e=>{const b=e.target.closest(".ans");if(b)pick(+b.dataset.i);});
$("#q-action").addEventListener("click",()=>{if(!S)return;if(S.mode==="exam"){if(S.selected!=null)commit();}else if(S.answered)next();});
$("#quit").addEventListener("click",requestQuit);
$("#r-all").addEventListener("change",renderReview);
$("#r-home").addEventListener("click",goHome);
$("#r-errors").addEventListener("click",startErrors);
$("#r-again").addEventListener("click",()=>{
  const k=LAST&&LAST.kind;
  if(k==="errors"&&!DB.errors.length){goHome();return;}
  if(k==="exam")startExam();else if(k==="quick")startQuick();else if(k==="errors")startErrors();
  else if(k&&k.startsWith("theme:"))startTheme(k.slice(6));else startExam();
});
let resetArmed=null;
$("#reset").addEventListener("click",()=>{
  const b=$("#reset");
  if(!resetArmed){b.textContent="Cliquez à nouveau pour tout effacer";resetArmed=setTimeout(()=>{resetArmed=null;b.textContent="Effacer ma progression";},4000);return;}
  clearTimeout(resetArmed);resetArmed=null;
  DB={stats:{},errors:[],history:[],timer:DB.timer};save();
  b.textContent="Progression effacée";setTimeout(()=>{b.textContent="Effacer ma progression";},2500);
  renderHome();
});
document.addEventListener("keydown",e=>{
  if($("#v-quiz").hidden||!S||e.altKey||e.ctrlKey||e.metaKey)return;
  const k=e.key.toLowerCase();
  const map={"1":0,"2":1,"3":2,"a":0,"b":1,"c":2};
  if(k in map){e.preventDefault();pick(map[k]);}
  else if(k==="enter"){const b=$("#q-action");if(!b.hidden&&!b.disabled){e.preventDefault();b.click();}}
});

/* ---------- Démarrage ---------- */
const params=new URLSearchParams(location.search);
const startParam=params.get("start");
params.delete("start");
const rest=params.toString();
history.replaceState({v:"home"},"",location.pathname+(rest?"?"+rest:"")+location.hash);
renderHome();
initPwa();
if(startParam==="exam")startExam();
else if(startParam==="quick")startQuick();
else if(startParam==="errors"&&DB.errors.length)startErrors();
