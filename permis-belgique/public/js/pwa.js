/* Installation de l'application, service worker (hors connexion) et mises à jour. */
export function initPwa(){
  const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;

  // Bouton « Installer » (Chrome, Edge, Android)
  const btn=document.getElementById("install");
  let deferred=null;
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;btn.hidden=false;});
  btn.addEventListener("click",async()=>{
    if(!deferred)return;
    deferred.prompt();
    try{await deferred.userChoice;}catch(e){}
    deferred=null;btn.hidden=true;
  });
  window.addEventListener("appinstalled",()=>{deferred=null;btn.hidden=true;});

  // iPhone / iPad : pas de bouton possible, on explique la marche à suivre
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  if(ios&&!standalone)document.getElementById("ios-hint").hidden=false;

  // Une fois installée, on demande au navigateur de ne pas effacer la progression
  if(standalone&&navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});

  if(!("serviceWorker" in navigator))return;
  // En développement local (wrangler dev), pas de cache sauf avec ?sw
  const local=/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if(local&&!new URLSearchParams(location.search).has("sw")){
    navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
    return;
  }

  let updating=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{if(updating)location.reload();});
  const bar=document.getElementById("update");
  const offerUpdate=worker=>{
    bar.hidden=false;
    document.getElementById("update-btn").onclick=()=>{updating=true;worker.postMessage({type:"SKIP_WAITING"});};
  };
  const register=()=>navigator.serviceWorker.register("/sw.js").then(reg=>{
    if(reg.waiting&&navigator.serviceWorker.controller)offerUpdate(reg.waiting);
    reg.addEventListener("updatefound",()=>{
      const w=reg.installing;if(!w)return;
      w.addEventListener("statechange",()=>{if(w.state==="installed"&&navigator.serviceWorker.controller)offerUpdate(w);});
    });
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")reg.update().catch(()=>{});});
  }).catch(()=>{});
  if(document.readyState==="complete")register();else window.addEventListener("load",register);
}
