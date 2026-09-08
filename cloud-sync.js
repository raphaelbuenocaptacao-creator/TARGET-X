// TARGET X — sincronização segura com Supabase
(function(){
  if(window.__txCloudLoaded)return;window.__txCloudLoaded=true;
  const SUPA_URL='https://veznreiamwstlulkpocz.supabase.co';
  const API_KEY='sb_publishable_7ukoyUiZh73XRZxzBDhqjw_OsvJ8_JB';
  const SESSION_KEY='tx_cloud_session_v45';
  const BASE_DATE='2026-09-06';
  let syncing=false,syncTimer=null;

  const css=document.createElement('style');
  css.textContent=`
  #txCloudBadge{display:inline-flex;align-items:center;gap:6px;margin-top:5px;padding:5px 8px;border:1px solid var(--line);border-radius:999px;background:#07120d;color:var(--muted);font-size:9px;cursor:pointer}
  #txCloudBadge.on{color:#b8ff2c;border-color:#315c47}.txCloudDot{width:7px;height:7px;border-radius:50%;background:#7d8d84}.on .txCloudDot{background:#b8ff2c;box-shadow:0 0 10px #b8ff2c66}
  #txCloudModal{display:none;position:fixed;inset:0;z-index:12000;background:#020604dd;backdrop-filter:blur(8px);padding:14px;overflow:auto}#txCloudModal.open{display:grid;place-items:center}
  .txCloudCard{width:min(520px,100%);background:linear-gradient(180deg,#0b1b13,#07100c);border:1px solid #28533d;border-radius:18px;padding:18px}.txCloudCard h2{margin:3px 0 6px}.txCloudForm{display:grid;gap:8px;margin-top:12px}.txCloudForm input{width:100%}.txCloudActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.txCloudActions button{flex:1}.txCloudStatus{font-size:11px;color:var(--muted);margin-top:9px}.txCloudStatus.ok{color:#b8ff2c}.txCloudStatus.err{color:#ff697d}
  `;document.head.appendChild(css);

  function getSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
  function setSession(s){if(s)localStorage.setItem(SESSION_KEY,JSON.stringify(s));else localStorage.removeItem(SESSION_KEY);updateBadge()}
  function token(){return getSession()?.access_token||''}
  function userId(){return getSession()?.user?.id||''}
  function headers(extra={}){const h={'apikey':API_KEY,'Content-Type':'application/json',...extra};if(token())h.Authorization='Bearer '+token();return h}
  async function refreshSession(){const s=getSession();if(!s?.refresh_token)return false;try{const r=await fetch(`${SUPA_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{'apikey':API_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});if(!r.ok)return false;const n=await r.json();setSession(n);return true}catch{return false}}
  async function api(path,opt={},retry=true){const r=await fetch(SUPA_URL+path,{...opt,headers:headers(opt.headers||{})});if(r.status===401&&retry&&await refreshSession())return api(path,opt,false);if(!r.ok){let m='Erro de comunicação com a nuvem';try{const j=await r.json();m=j.message||j.error_description||j.hint||j.details||m}catch{}throw new Error(m)}if(r.status===204)return null;const t=await r.text();return t?JSON.parse(t):null}

  function normalizeSource(x){return String(x?.source||'').toLowerCase()}
  function priority(x){const s=normalizeSource(x);if(s==='cloud')return 100;if(s.includes('official-sheet'))return 90;if(s.includes('sheet-upload'))return 80;if(s.includes('official'))return 70;if(s.includes('manual'))return 30;if(s.includes('quick'))return 20;return 10}
  const fields=['couples','q','nq','notour','sales','cancelled','vgv','vgv_general','gift','attendances'];
  function canonicalLocal(){
    const map=new Map();
    (window.launches||launches||[]).filter(x=>x?.date>=BASE_DATE&&x?.person).forEach(x=>{
      const k=x.date+'|'+x.person,cur=map.get(k);
      if(!cur){map.set(k,{...x});return}
      const px=priority(x),pc=priority(cur);
      if(px>pc){map.set(k,{...x});return}
      if(px<pc)return;
      if(px>=70){map.set(k,{...x});return}
      const merged={...cur};fields.forEach(f=>merged[f]=(Number(cur[f])||0)+(Number(x[f])||0));merged.source=cur.source||x.source||'manual';map.set(k,merged);
    });
    return [...map.values()];
  }
  function toCloud(x){return {attendance_date:x.date,professional:x.person,couples:Number(x.couples)||0,q:Number(x.q)||0,nq:Number(x.nq)||0,notour:Number(x.notour)||0,sales:Number(x.sales)||0,cancelled:Number(x.cancelled)||0,vgv:Number(x.vgv)||0,vgv_general:Number(x.vgv_general)||0,gift:Number(x.gift)||0,attendances:Number(x.attendances??x.couples)||0,source:x.source||'target-x',source_file:x.source_file||null,updated_by:userId()||null}}
  function fromCloud(r){return {id:`cloud-${r.attendance_date}-${r.professional}`,date:r.attendance_date,person:r.professional,couples:Number(r.couples)||0,q:Number(r.q)||0,nq:Number(r.nq)||0,notour:Number(r.notour)||0,sales:Number(r.sales)||0,cancelled:Number(r.cancelled)||0,vgv:Number(r.vgv)||0,vgv_general:Number(r.vgv_general)||0,gift:Number(r.gift)||0,attendances:Number(r.attendances)||0,source:'cloud',cloud_source:r.source||'',source_file:r.source_file||null,cloud_updated_at:r.updated_at||null}}
  function refreshAll(){try{renderDashboard();renderRank();renderSeptember();renderProfile();renderTeams();renderLaunches();if(window.renderCaptain)renderCaptain()}catch(e){console.warn('TARGET X refresh',e)}window.dispatchEvent(new CustomEvent('targetx:data-updated'))}

  async function pushLocal(){const rows=canonicalLocal().map(toCloud);if(!rows.length)return;await api('/rest/v1/targetx_daily_results?on_conflict=attendance_date,professional',{method:'POST',headers:{'Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows)})}
  async function pullCloud(){const rows=await api('/rest/v1/targetx_daily_results?select=*&attendance_date=gte.'+BASE_DATE+'&order=attendance_date.asc')||[];const keys=new Set(rows.map(r=>r.attendance_date+'|'+r.professional));launches=launches.filter(x=>!keys.has((x.date||'')+'|'+(x.person||'')));launches.push(...rows.map(fromCloud));const old=window.__txOriginalSaveState||window.saveState;syncing=true;try{old()}finally{syncing=false}refreshAll();return rows.length}
  async function syncNow(showMessage=false){if(syncing||!token())return false;syncing=true;setStatus('Sincronizando...');try{await pushLocal();const n=await pullCloud();localStorage.setItem('tx_cloud_last_sync',new Date().toISOString());updateBadge();setStatus(`✓ Nuvem atualizada • ${n} registros diários`,true);if(showMessage)setTimeout(()=>setStatus('Dados locais e nuvem estão alinhados.',true),1200);return true}catch(e){console.error(e);setStatus(e.message,false,true);return false}finally{syncing=false}}
  function scheduleSync(){if(syncing||!token())return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>syncNow(false),900)}

  async function signIn(email,password){const r=await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{'apikey':API_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})});const j=await r.json();if(!r.ok)throw new Error(j.error_description||j.msg||j.message||'Não foi possível entrar.');setSession(j);await syncNow(true);return j}
  async function signOut(){try{if(token())await fetch(`${SUPA_URL}/auth/v1/logout`,{method:'POST',headers:headers()})}catch{}setSession(null);setStatus('Modo local/offline. Entre para sincronizar a nuvem.')}

  async function ackAlert(alert){const uid=userId();if(!uid)return false;await api('/rest/v1/targetx_alert_ack?on_conflict=alert_key,acknowledged_by',{method:'POST',headers:{'Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify([{alert_key:alert.key,professional:alert.person||null,alert_type:alert.type,period_end:alert.periodEnd,acknowledged_by:uid}])});return true}
  async function getAcked(){if(!token())return [];try{return await api('/rest/v1/targetx_alert_ack?select=alert_key&period_end=gte.2026-09-01')||[]}catch{return []}}

  function mountBadge(){const right=document.querySelector('.top>div:last-child');if(!right||document.getElementById('txCloudBadge'))return;const b=document.createElement('div');b.id='txCloudBadge';b.innerHTML='<span class="txCloudDot"></span><span id="txCloudLabel">Nuvem</span>';b.onclick=openModal;right.appendChild(b);updateBadge()}
  function updateBadge(){const b=document.getElementById('txCloudBadge'),l=document.getElementById('txCloudLabel');if(!b||!l)return;const s=getSession();b.classList.toggle('on',!!s?.access_token);if(s?.access_token){const dt=localStorage.getItem('tx_cloud_last_sync');l.textContent=dt?'Nuvem • sincronizado':'Nuvem • conectado'}else l.textContent='Nuvem • local'}
  function ensureModal(){let m=document.getElementById('txCloudModal');if(m)return m;m=document.createElement('div');m.id='txCloudModal';m.innerHTML=`<div class="txCloudCard"><div class="label">TARGET X CLOUD</div><h2>Base única na nuvem</h2><div class="meta">Use o mesmo login do ambiente Supabase/CaptaPro. Quando conectado, os resultados diários são sincronizados por Data + Profissional e não duplicam.</div><div class="txCloudForm" id="txCloudLogin"><input id="txCloudEmail" type="email" placeholder="E-mail"><input id="txCloudPassword" type="password" placeholder="Senha"></div><div class="txCloudActions"><button id="txCloudClose">Voltar</button><button class="primary" id="txCloudMain">Entrar e sincronizar</button></div><div class="txCloudStatus" id="txCloudStatus"></div></div>`;document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')});document.getElementById('txCloudClose').onclick=()=>m.classList.remove('open');document.getElementById('txCloudMain').onclick=async()=>{const s=getSession();if(s?.access_token){await syncNow(true);renderModal();return}const email=document.getElementById('txCloudEmail').value.trim(),pw=document.getElementById('txCloudPassword').value;if(!email||!pw)return setStatus('Informe e-mail e senha.',false,true);const btn=document.getElementById('txCloudMain');btn.disabled=true;btn.textContent='Entrando...';try{await signIn(email,pw);renderModal()}catch(e){setStatus(e.message,false,true)}finally{btn.disabled=false}};return m}
  function renderModal(){const m=ensureModal(),s=getSession(),login=document.getElementById('txCloudLogin'),main=document.getElementById('txCloudMain');if(s?.access_token){login.innerHTML=`<div class="card" style="padding:10px"><b>${s.user?.email||'Usuário conectado'}</b><div class="tiny">Sincronização protegida por login.</div></div><button id="txCloudLogout" style="width:100%">Sair da nuvem</button>`;document.getElementById('txCloudLogout').onclick=async()=>{await signOut();renderModal()};main.textContent='Sincronizar agora'}else{login.innerHTML='<input id="txCloudEmail" type="email" placeholder="E-mail"><input id="txCloudPassword" type="password" placeholder="Senha">';main.textContent='Entrar e sincronizar'}updateBadge()}
  function openModal(){const m=ensureModal();renderModal();m.classList.add('open')}
  function setStatus(msg,ok=false,err=false){const e=document.getElementById('txCloudStatus');if(e){e.textContent=msg||'';e.className='txCloudStatus '+(ok?'ok':err?'err':'')} }

  // Intercepta salvamentos novos para manter a nuvem alinhada, sem quebrar o modo offline.
  if(typeof window.saveState==='function'&&!window.__txOriginalSaveState){window.__txOriginalSaveState=window.saveState;window.saveState=function(){window.__txOriginalSaveState();if(!syncing)scheduleSync();window.dispatchEvent(new CustomEvent('targetx:data-updated'))}}

  window.TXCloud={syncNow,signIn,signOut,isConnected:()=>!!token(),ackAlert,getAcked,open:openModal,canonicalLocal};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountBadge);else mountBadge();
  if(token())setTimeout(()=>syncNow(false),1200);
})();
