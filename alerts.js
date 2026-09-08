// TARGET X — Central de Alertas Inteligentes
(function(){
  if(window.__txAlertsLoaded)return;window.__txAlertsLoaded=true;
  const ACK_LOCAL='tx_alert_ack_v45';
  let alerts=[];

  const css=document.createElement('style');
  css.textContent=`
  #alertTab{position:relative}.txAlertCount{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 5px;margin-left:5px;border-radius:999px;background:#ff697d;color:#fff;font-size:9px;font-weight:1000}
  .txAlertGrid{display:grid;gap:9px}.txAlertCard{border:1px solid var(--line);border-radius:14px;padding:12px;background:#07120d}.txAlertCard.critical{border-color:#7f2634;background:#18090d}.txAlertCard.warning{border-color:#6d5d22;background:#151308}.txAlertCard.positive{border-color:#315c47;background:#07150d}.txAlertTop{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.txAlertLevel{font-size:8px;letter-spacing:1px;font-weight:1000}.critical .txAlertLevel{color:#ff697d}.warning .txAlertLevel{color:#ffd166}.positive .txAlertLevel{color:#b8ff2c}.txAlertTitle{font-size:15px;font-weight:1000;margin:4px 0}.txAlertText{color:#d4e6dc;font-size:11px;line-height:1.45}.txAlertActions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.txAlertActions button{padding:7px 9px;font-size:10px}
  #txAlertOverlay{display:none;position:fixed;inset:0;z-index:13000;background:#020604e8;backdrop-filter:blur(8px);padding:14px}#txAlertOverlay.open{display:grid;place-items:center}.txAlertPopup{width:min(560px,100%);border-radius:20px;padding:18px;background:linear-gradient(180deg,#160b0f,#07100c);border:1px solid #7f2634;box-shadow:0 22px 80px #000}.txAlertPopup.warning{border-color:#6d5d22;background:linear-gradient(180deg,#171407,#07100c)}.txAlertPopup.positive{border-color:#315c47;background:linear-gradient(180deg,#0b1b13,#07100c)}.txAlertPopup.pulse{animation:txAlertPulse 1.15s ease-in-out infinite alternate}.txAlertPopup.settled{animation:none}@keyframes txAlertPulse{from{transform:scale(1);box-shadow:0 22px 80px #000}to{transform:scale(1.012);box-shadow:0 22px 90px #ff697d22}}
  .txAlertPopup h2{margin:5px 0 8px;font-size:24px}.txAlertPopup .txAlertText{font-size:13px}.txAlertPopup .txAlertActions button{font-size:12px;padding:10px 12px}.txAlertRules{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.txRule{border:1px solid var(--line);border-radius:12px;padding:10px;background:#06100b}.txRule b{display:block;margin-bottom:4px}.txRule span{font-size:10px;color:var(--muted)}
  @media(max-width:620px){.txAlertRules{grid-template-columns:1fr}.txAlertPopup{padding:14px}.txAlertPopup h2{font-size:20px}}
  `;document.head.appendChild(css);

  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function moneyBR(v){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(Number(v)||0)}
  function getAck(){try{return new Set(JSON.parse(localStorage.getItem(ACK_LOCAL)||'[]'))}catch{return new Set()}}
  function saveAck(set){localStorage.setItem(ACK_LOCAL,JSON.stringify([...set]))}
  function maxDate(){const dates=(window.launches||launches||[]).map(x=>x?.date).filter(Boolean).sort();return dates[dates.length-1]||'2026-09-07'}
  function addDays(s,n){const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function recentRows(days=7){const end=maxDate(),start=addDays(end,-(days-1));return (window.launches||launches||[]).filter(x=>x?.date>=start&&x?.date<=end&&x?.person)}
  function aggByPerson(rows){const map={};rows.forEach(x=>{const n=x.person;map[n]||(map[n]={person:n,couples:0,q:0,nq:0,notour:0,sales:0,vgv:0,gift:0,days:new Map()});const a=map[n];for(const f of ['couples','q','nq','notour','sales','vgv','gift'])a[f]+=Number(x[f])||0;const d=a.days.get(x.date)||0;a.days.set(x.date,d+(Number(x.couples)||0))});return Object.values(map)}
  function teamAverageGift(rows){const c=rows.reduce((s,x)=>s+(Number(x.couples)||0),0),g=rows.reduce((s,x)=>s+(Number(x.gift)||0),0);return c?g/c:0}
  function active(name){try{return !!effectivePerson(name).active}catch{return true}}
  function team(name){try{return effectivePerson(name).group||'A DEFINIR'}catch{return 'A DEFINIR'}}
  function key(type,person,end){return [type,person||'GERAL',end].join('|')}

  function computeAlerts(){
    const end=maxDate(),rows=recentRows(7),people=aggByPerson(rows).filter(x=>active(x.person)),avgGift=teamAverageGift(rows),out=[];
    people.forEach(p=>{
      const qual=p.q+p.nq,nqRate=qual?p.nq/qual:0,giftPer=p.couples?p.gift/p.couples:0,conv=p.couples?p.sales/p.couples:0,dayVals=[...p.days.values()];
      const lowDays=dayVals.filter(v=>v<=1).length;
      if(dayVals.length>=3&&lowDays>=3){out.push({key:key('low_couples',p.person,end),type:'low_couples',level:'critical',person:p.person,periodEnd:end,title:'Baixa produção recorrente',text:`${p.person} teve ${lowDays} dias recentes com 0 ou 1 casal registrado. Média nos dias com registro: ${(p.couples/dayVals.length).toFixed(1)} casal/dia.`,metric:`${p.couples} casais em ${dayVals.length} dias`})}
      if(qual>=5&&nqRate>=0.40){out.push({key:key('low_profile',p.person,end),type:'low_profile',level:nqRate>=0.55?'critical':'warning',person:p.person,periodEnd:end,title:'Perfil baixo / NQ elevado',text:`${p.person} está com ${(nqRate*100).toFixed(0)}% de NQ nos últimos registros (${p.nq} NQ de ${qual} qualificados).`,metric:`Q ${p.q} • NQ ${p.nq}`})}
      if(p.couples>=3&&giftPer>Math.max(250,avgGift*1.35)){out.push({key:key('gift_high',p.person,end),type:'gift_high',level:giftPer>Math.max(350,avgGift*1.7)?'critical':'warning',person:p.person,periodEnd:end,title:'Custo de brinde elevado',text:`${p.person} está em ${moneyBR(giftPer)} por casal no período, acima da referência da equipe de ${moneyBR(avgGift)} por casal.`,metric:`${moneyBR(p.gift)} em brindes`})}
      if(p.couples>=8&&conv<0.10){out.push({key:key('low_conversion',p.person,end),type:'low_conversion',level:'warning',person:p.person,periodEnd:end,title:'Conversão baixa',text:`${p.person} levou ${p.couples} casais e fez ${p.sales} venda(s) no período. Conversão aproximada de ${(conv*100).toFixed(1)}%.`,metric:`${p.sales} vendas • ${p.couples} casais`})}
      const sep=(()=>{try{return personMonth(p.person,9)}catch{return null}})();
      if(sep&&sep.couples>=18&&sep.couples<22){out.push({key:key('near_22',p.person,end),type:'near_22',level:'positive',person:p.person,periodEnd:end,title:'Perto dos 22 casais',text:`${p.person} está com ${Math.round(sep.couples)} casais em setembro. Faltam ${Math.max(0,22-Math.round(sep.couples))} para chegar aos 22.`,metric:`${Math.round(sep.couples)}/22 casais`})}
    });

    // Ritmo global de setembro, usando o mesmo cálculo do app quando disponível.
    try{
      const s=sepTotal(),day=Math.max(1,Number(end.slice(8,10))),projVgv=s.vgv/day*30;
      if(projVgv<METAS.vgv*0.90){out.push({key:key('company_vgv',null,end),type:'company_vgv',level:'critical',person:null,periodEnd:end,title:'VGV abaixo do ritmo da meta',text:`A projeção atual de setembro está em ${moneyBR(projVgv)}, abaixo da meta de ${moneyBR(METAS.vgv)}.`,metric:`Atual: ${moneyBR(s.vgv)}`})}
      else if(projVgv<METAS.vgv){out.push({key:key('company_vgv',null,end),type:'company_vgv',level:'warning',person:null,periodEnd:end,title:'Atenção ao ritmo de VGV',text:`A projeção atual de setembro está em ${moneyBR(projVgv)}. A meta é ${moneyBR(METAS.vgv)}.`,metric:`Atual: ${moneyBR(s.vgv)}`})}
    }catch{}

    const severity={critical:0,warning:1,positive:2};
    return out.sort((a,b)=>severity[a.level]-severity[b.level]||String(a.person||'').localeCompare(String(b.person||'')));
  }

  async function ackedSet(){const s=getAck();if(window.TXCloud?.isConnected?.()){try{const cloud=await window.TXCloud.getAcked();cloud.forEach(x=>s.add(x.alert_key));saveAck(s)}catch{}}return s}
  async function acknowledge(a){
    const s=getAck();
    s.add(a.key);
    saveAck(s);

    // Fecha o popup imediatamente para o botão "Entendido" responder na hora.
    const ov=document.getElementById('txAlertOverlay');
    if(ov){ov.classList.remove('open');ov.dataset.key='';ov.innerHTML=''}

    // Atualiza a interface sem esperar a sincronização em nuvem.
    await renderAlerts();

    // Persiste na nuvem em segundo plano quando disponível.
    try{if(window.TXCloud?.isConnected?.())await window.TXCloud.ackAlert(a)}catch(e){console.warn('TARGET X: falha ao sincronizar confirmação do alerta',e)}
  }
  function openPerson(name){if(!name)return;try{if([...profilePerson.options].some(o=>o.value===name)){profilePerson.value=name;show('profile')}}catch{}}

  function mount(){
    const nav=document.querySelector('.tabs');if(!nav)return;
    if(!document.getElementById('alertTab')){const b=document.createElement('button');b.className='tab';b.id='alertTab';b.dataset.page='alerts';b.innerHTML='Alertas <span class="txAlertCount" id="txAlertCount">0</span>';const diary=[...nav.querySelectorAll('.tab')].find(x=>x.dataset.page==='diary');nav.insertBefore(b,diary||null);b.onclick=()=>{showAlertsPage();renderAlerts()}}
    if(!document.getElementById('alerts')){const page=document.createElement('section');page.className='page';page.id='alerts';page.innerHTML=`<div class="section"><div><h2>Central de Alertas</h2><div class="meta">TARGET X identifica automaticamente onde a gestão precisa agir.</div></div><button id="txRecheckAlerts">Reanalisar agora</button></div><div class="stats" id="txAlertSummary"></div><div class="section"><h2>Alertas pendentes</h2><span class="meta" id="txAlertPeriod"></span></div><div class="txAlertGrid" id="txAlertList"></div><div class="section"><h2>Regras inteligentes</h2></div><div class="txAlertRules"><div class="txRule"><b>Baixa produção</b><span>Vários dias recentes com 0 ou 1 casal.</span></div><div class="txRule"><b>Perfil baixo</b><span>NQ elevado nos atendimentos recentes.</span></div><div class="txRule"><b>Brinde alto</b><span>Custo por casal muito acima da referência da equipe.</span></div><div class="txRule"><b>Conversão baixa</b><span>Muitos casais e poucas vendas.</span></div><div class="txRule"><b>Meta 22 casais</b><span>Mostra quem está muito perto da marca.</span></div><div class="txRule"><b>Ritmo de VGV</b><span>Compara a projeção do mês com a meta de R$ 8,5 mi.</span></div></div>`;document.querySelector('footer')?.parentNode.insertBefore(page,document.querySelector('footer'));document.getElementById('txRecheckAlerts').onclick=()=>{renderAlerts();showNextPopup(true)}}
    if(!document.getElementById('txAlertOverlay')){const ov=document.createElement('div');ov.id='txAlertOverlay';document.body.appendChild(ov)}
    renderAlerts();setTimeout(()=>showNextPopup(),1600)
  }
  function showAlertsPage(){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='alerts'));document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.page==='alerts'))}
  function alertHtml(a){const icon=a.level==='critical'?'🔴':a.level==='warning'?'🟡':'🟢';return `<div class="txAlertCard ${a.level}"><div class="txAlertTop"><div><div class="txAlertLevel">${icon} ${a.level==='critical'?'CRÍTICO':a.level==='warning'?'ATENÇÃO':'OPORTUNIDADE'}</div><div class="txAlertTitle">${esc(a.title)}</div></div><b>${esc(a.metric||'')}</b></div><div class="txAlertText">${esc(a.text)}</div><div class="txAlertActions">${a.person?`<button data-open-alert-person="${encodeURIComponent(a.person)}">Abrir profissional</button>`:''}<button class="primary" data-ack-alert="${encodeURIComponent(a.key)}">Entendido</button></div></div>`}
  async function renderAlerts(){
    alerts=computeAlerts();const ack=await ackedSet(),pending=alerts.filter(a=>!ack.has(a.key));
    const c=document.getElementById('txAlertCount');if(c){c.textContent=pending.length;c.style.display=pending.length?'inline-grid':'none'}
    const sum=document.getElementById('txAlertSummary');if(sum)sum.innerHTML=[['Críticos',pending.filter(x=>x.level==='critical').length],['Atenção',pending.filter(x=>x.level==='warning').length],['Positivos',pending.filter(x=>x.level==='positive').length],['Total pendente',pending.length]].map(([l,v])=>`<div class="card stat"><span class="label">${l}</span><b>${v}</b></div>`).join('');
    const period=document.getElementById('txAlertPeriod');if(period)period.textContent=`Análise até ${maxDate().split('-').reverse().join('/')}`;
    const list=document.getElementById('txAlertList');if(list)list.innerHTML=pending.length?pending.map(alertHtml).join(''):'<div class="card empty">Nenhum alerta pendente. Tudo entendido.</div>';
    document.querySelectorAll('[data-ack-alert]').forEach(b=>b.onclick=()=>{const a=alerts.find(x=>x.key===decodeURIComponent(b.dataset.ackAlert));if(a)acknowledge(a)});document.querySelectorAll('[data-open-alert-person]').forEach(b=>b.onclick=()=>openPerson(decodeURIComponent(b.dataset.openAlertPerson)));
    return pending;
  }
  async function showNextPopup(force=false){
    const pending=await renderAlerts(),ov=document.getElementById('txAlertOverlay');if(!ov)return;const current=ov.dataset.key;if(!force&&ov.classList.contains('open')&&current)return;const a=pending.find(x=>x.level!=='positive')||pending[0];if(!a){ov.classList.remove('open');ov.dataset.key='';return}
    const icon=a.level==='critical'?'⚠️':a.level==='warning'?'🟡':'🟢';ov.dataset.key=a.key;ov.innerHTML=`<div class="txAlertPopup ${a.level} pulse" id="txAlertPopup"><div class="label">${icon} ALERTA DE GESTÃO</div><h2>${esc(a.title)}</h2><div class="txAlertText">${esc(a.text)}</div><div class="card" style="margin-top:12px;padding:10px"><span class="label">Ponto principal</span><b style="display:block;margin-top:4px">${esc(a.metric||'')}</b>${a.person?`<div class="tiny" style="margin-top:4px">${esc(a.person)} • ${esc(team(a.person))}</div>`:''}</div><div class="txAlertActions">${a.person?`<button id="txAlertOpenPerson">Abrir profissional</button>`:''}<button class="primary" id="txAlertUnderstood">✓ Entendido</button></div><div class="tiny" style="margin-top:9px">Este aviso continua na tela até você marcar Entendido. Depois de 30 segundos ele para de pulsar, mas não desaparece sozinho.</div></div>`;ov.classList.add('open');const pop=document.getElementById('txAlertPopup');setTimeout(()=>pop?.classList.add('settled'),30000);const u=document.getElementById('txAlertUnderstood');if(u)u.onclick=()=>acknowledge(a);const p=document.getElementById('txAlertOpenPerson');if(p)p.onclick=()=>openPerson(a.person)
  }

  window.TXAlerts={compute:computeAlerts,render:renderAlerts,showNext:showNextPopup};
  window.addEventListener('targetx:data-updated',()=>{renderAlerts();setTimeout(()=>showNextPopup(),250)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();