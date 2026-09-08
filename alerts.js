// TARGET X — Alertas Semanais • segunda-feira às 10:00
(function(){
  if(window.__txAlertsWeekly60)return; window.__txAlertsWeekly60=true;

  const ACK_KEY='tx_alert_ack_weekly_v60';
  let alerts=[];
  let lastAutoWindow='';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const num=v=>new Intl.NumberFormat('pt-BR').format(Math.round(Number(v)||0));
  const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(Number(v)||0);
  const pct=(a,b)=>b?`${(a/b*100).toFixed(1)}%`:'0%';

  const css=document.createElement('style');
  css.textContent=`
    #alertTab{position:relative}.txAlertCount{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 5px;margin-left:5px;border-radius:999px;background:#ff697d;color:#fff;font-size:9px;font-weight:1000}
    .txAlertGrid{display:grid;gap:9px}.txAlertCard{border:1px solid var(--line);border-radius:14px;padding:12px;background:#07120d}.txAlertCard.critical{border-color:#7f2634;background:#18090d}.txAlertCard.warning{border-color:#6d5d22;background:#151308}.txAlertCard.positive{border-color:#315c47;background:#07150d}.txAlertTop{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.txAlertLevel{font-size:8px;letter-spacing:1px;font-weight:1000}.critical .txAlertLevel{color:#ff697d}.warning .txAlertLevel{color:#ffd166}.positive .txAlertLevel{color:#b8ff2c}.txAlertTitle{font-size:15px;font-weight:1000;margin:4px 0}.txAlertText{color:#d4e6dc;font-size:11px;line-height:1.45}.txAlertActions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.txAlertActions button{padding:7px 9px;font-size:10px}
    .txSchedule{border:1px solid #315c47;border-radius:16px;padding:14px;background:#07150d}.txSchedule b{display:block;font-size:18px;margin:5px 0}.txSchedule .next{color:var(--green)}
    #txAlertOverlay{display:none;position:fixed;inset:0;z-index:13000;background:#020604e8;backdrop-filter:blur(8px);padding:14px}#txAlertOverlay.open{display:grid;place-items:center}.txAlertPopup{width:min(560px,100%);border-radius:20px;padding:18px;background:linear-gradient(180deg,#160b0f,#07100c);border:1px solid #7f2634;box-shadow:0 22px 80px #000}.txAlertPopup.warning{border-color:#6d5d22;background:linear-gradient(180deg,#171407,#07100c)}.txAlertPopup.positive{border-color:#315c47;background:linear-gradient(180deg,#0b1b13,#07100c)}.txAlertPopup h2{margin:5px 0 8px;font-size:24px}.txAlertPopup .txAlertText{font-size:13px}.txAlertPopup .txAlertActions button{font-size:12px;padding:10px 12px}
    .txAlertRules{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.txRule{border:1px solid var(--line);border-radius:12px;padding:10px;background:#06100b}.txRule b{display:block;margin-bottom:4px}.txRule span{font-size:10px;color:var(--muted)}
    @media(max-width:620px){.txAlertRules{grid-template-columns:1fr}.txAlertPopup{padding:14px}.txAlertPopup h2{font-size:20px}}
  `;
  document.head.appendChild(css);

  function cleanupMenu(){
    document.querySelectorAll('.tab[data-page="diary"],.tab[data-page="launch"]').forEach(x=>x.remove());
    ['diary','launch'].forEach(id=>{const p=$(id);if(p){p.classList.remove('active');p.style.display='none'}});
    const dash=document.querySelector('#dashboard .hero .card .meta');if(dash&&/lançamento/i.test(dash.textContent))dash.textContent='Planilha oficial consolidada.';
    const sep=document.querySelector('#september .section .meta');if(sep&&/lançamento/i.test(sep.textContent))sep.textContent='01/09 até a última planilha carregada.';
  }

  function localMondayKey(d=new Date()){
    const x=new Date(d);const diff=(x.getDay()+6)%7;x.setDate(x.getDate()-diff);
    return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  }
  function inAlertWindow(d=new Date()){return d.getDay()===1&&d.getHours()===10}
  function nextMonday10(d=new Date()){
    const x=new Date(d);x.setSeconds(0,0);x.setMinutes(0);x.setHours(10);
    let add=(1-x.getDay()+7)%7;
    if(add===0&&d.getHours()>=11)add=7;
    if(add===0&&d.getHours()<10)return x;
    if(add===0&&d.getHours()===10)return x;
    x.setDate(x.getDate()+add);return x;
  }
  function fmtDateTime(d){return d.toLocaleString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
  function latestDataDate(){
    const dates=[];if(window.DATA_META?.through)dates.push(DATA_META.through);
    try{(window.launches||launches||[]).forEach(x=>{if(x?.date)dates.push(x.date)})}catch{}
    return dates.sort().at(-1)||'2026-09-07';
  }
  function dateDiffDays(a,b){const A=new Date(a+'T12:00:00'),B=new Date(b+'T12:00:00');return Math.round((B-A)/86400000)}
  function getAck(){try{return new Set(JSON.parse(localStorage.getItem(ACK_KEY)||'[]'))}catch{return new Set()}}
  function saveAck(s){localStorage.setItem(ACK_KEY,JSON.stringify([...s]))}
  function key(type,person){return `${localMondayKey()}|${type}|${person||'GERAL'}`}
  function activePeople(){try{return HIST.filter(x=>x.active)}catch{return []}}
  function monthData(name,month){try{return personMonth(name,month)}catch{return null}}
  function openPerson(name){if(!name)return;try{if([...profilePerson.options].some(o=>o.value===name)){profilePerson.value=name;show('profile')}}catch{}}

  function computeAlerts(){
    const end=latestDataDate(),month=Number(end.slice(5,7))||9,day=Math.max(1,Number(end.slice(8,10))||1),people=activePeople(),out=[];
    const current=people.map(p=>({name:p.name,group:p.group||'',d:monthData(p.name,month)})).filter(x=>x.d);
    const totalCouples=current.reduce((s,x)=>s+(Number(x.d.couples)||0),0),totalGift=current.reduce((s,x)=>s+(Number(x.d.gift)||0),0),avgGift=totalCouples?totalGift/totalCouples:0;

    current.forEach(({name,d})=>{
      const couples=Number(d.couples)||0,q=Number(d.q)||0,nq=Number(d.nq)||0,sales=Number(d.sales)||0,notour=Number(d.notour)||0,gift=Number(d.gift)||0;
      const qual=q+nq,nqRate=qual?nq/qual:0,convBase=Math.max(0,couples-notour),conv=convBase?sales/convBase:0,giftPer=couples?gift/couples:0;
      const expected=22*Math.min(day,30)/30;
      if(day>=7&&couples<expected*.65){const level=couples<expected*.45?'critical':'warning';out.push({key:key('ritmo_casais',name),level,person:name,title:'Ritmo de casais abaixo do esperado',text:`${name} está com ${num(couples)} casais no mês. Pela marca de 22 casais, o ritmo de referência até o dia ${day} é ${expected.toFixed(1)}.`,metric:`${num(couples)} casais`})}
      if(qual>=5&&nqRate>=.40){out.push({key:key('nq_alto',name),level:nqRate>=.55?'critical':'warning',person:name,title:'NQ elevado',text:`${name} está com ${(nqRate*100).toFixed(0)}% de NQ (${num(nq)} NQ de ${num(qual)} qualificados).`,metric:`Q ${num(q)} • NQ ${num(nq)}`})}
      if(couples>=8&&conv<.10){out.push({key:key('conversao_baixa',name),level:'warning',person:name,title:'Conversão baixa',text:`${name} tem ${num(couples)} casais e ${num(sales)} venda(s). Conversão de ${pct(sales,convBase)} considerando NoTour fora da base.`,metric:`${num(sales)} vendas`})}
      if(couples>=5&&giftPer>Math.max(250,avgGift*1.35)){out.push({key:key('brinde_alto',name),level:giftPer>Math.max(350,avgGift*1.7)?'critical':'warning',person:name,title:'Custo de brinde elevado',text:`${name} está em ${money(giftPer)} por casal, acima da referência atual de ${money(avgGift)}.`,metric:`${money(gift)} em brindes`})}
      if(couples>=18&&couples<22){out.push({key:key('perto_22',name),level:'positive',person:name,title:'Perto dos 22 casais',text:`${name} está com ${num(couples)} casais. Faltam ${num(22-couples)} para chegar aos 22.`,metric:`${num(couples)}/22`})}
    });

    try{
      const s=sepTotal(),proj=(Number(s.vgv)||0)/day*30;
      if(proj<METAS.vgv*.90)out.push({key:key('vgv_empresa'),level:'critical',person:null,title:'VGV abaixo do ritmo da meta',text:`A projeção está em ${money(proj)} contra meta de ${money(METAS.vgv)}.`,metric:`Atual ${money(s.vgv)}`});
      else if(proj<METAS.vgv)out.push({key:key('vgv_empresa'),level:'warning',person:null,title:'Atenção ao ritmo de VGV',text:`A projeção está em ${money(proj)} contra meta de ${money(METAS.vgv)}.`,metric:`Atual ${money(s.vgv)}`});
    }catch{}

    const today=`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;
    const stale=dateDiffDays(end,today);if(stale>=3)out.unshift({key:key('base_desatualizada'),level:'critical',person:null,title:'Planilha precisa ser atualizada',text:`A base oficial está em ${end.split('-').reverse().join('/')} e já está ${stale} dia(s) atrás da data atual. Carregue a planilha mais recente no topo do TARGET X antes de usar os alertas.`,metric:`Base ${end.split('-').reverse().join('/')}`});

    const sev={critical:0,warning:1,positive:2};return out.sort((a,b)=>sev[a.level]-sev[b.level]||String(a.person||'').localeCompare(String(b.person||'')));
  }

  function pendingAlerts(){const ack=getAck();alerts=computeAlerts();return alerts.filter(a=>!ack.has(a.key))}
  function acknowledge(a){const ack=getAck();ack.add(a.key);saveAck(ack);const ov=$('txAlertOverlay');if(ov){ov.classList.remove('open');ov.innerHTML='';ov.dataset.key=''}renderAlerts();setTimeout(()=>showNextPopup(),120)}
  function alertHtml(a){const icon=a.level==='critical'?'🔴':a.level==='warning'?'🟡':'🟢';return `<div class="txAlertCard ${a.level}"><div class="txAlertTop"><div><div class="txAlertLevel">${icon} ${a.level==='critical'?'CRÍTICO':a.level==='warning'?'ATENÇÃO':'OPORTUNIDADE'}</div><div class="txAlertTitle">${esc(a.title)}</div></div><b>${esc(a.metric||'')}</b></div><div class="txAlertText">${esc(a.text)}</div><div class="txAlertActions">${a.person?`<button data-open-alert-person="${encodeURIComponent(a.person)}">Abrir profissional</button>`:''}<button class="primary" data-ack-alert="${encodeURIComponent(a.key)}">Entendido</button></div></div>`}

  function renderSchedule(){
    const list=$('txAlertList'),sum=$('txAlertSummary'),period=$('txAlertPeriod'),count=$('txAlertCount');
    if(count)count.style.display='none';if(sum)sum.innerHTML='';if(period)period.textContent='Rotina semanal';
    if(list)list.innerHTML=`<div class="txSchedule"><span class="label">ROTINA AUTOMÁTICA</span><b>Alertas somente segunda-feira às 10:00</b><div>Próxima análise: <span class="next">${esc(fmtDateTime(nextMonday10()))}</span></div><div class="tiny" style="margin-top:8px">Use a planilha mais recente antes do horário. A janela automática do TARGET X é de 10:00 até 10:59.</div></div>`;
  }
  function bindActions(){document.querySelectorAll('[data-ack-alert]').forEach(b=>b.onclick=()=>{const a=alerts.find(x=>x.key===decodeURIComponent(b.dataset.ackAlert));if(a)acknowledge(a)});document.querySelectorAll('[data-open-alert-person]').forEach(b=>b.onclick=()=>openPerson(decodeURIComponent(b.dataset.openAlertPerson)))}
  function renderAlerts(){
    cleanupMenu();if(!inAlertWindow()){renderSchedule();return []}
    const pending=pendingAlerts(),count=$('txAlertCount');if(count){count.textContent=pending.length;count.style.display=pending.length?'inline-grid':'none'}
    const sum=$('txAlertSummary');if(sum)sum.innerHTML=[['Críticos',pending.filter(x=>x.level==='critical').length],['Atenção',pending.filter(x=>x.level==='warning').length],['Positivos',pending.filter(x=>x.level==='positive').length],['Total',pending.length]].map(([l,v])=>`<div class="card stat"><span class="label">${l}</span><b>${v}</b></div>`).join('');
    const period=$('txAlertPeriod');if(period)period.textContent=`Segunda 10:00 • base até ${latestDataDate().split('-').reverse().join('/')}`;
    const list=$('txAlertList');if(list)list.innerHTML=pending.length?pending.map(alertHtml).join(''):'<div class="card empty">Nenhum alerta pendente para esta segunda-feira.</div>';bindActions();return pending;
  }
  function showNextPopup(){
    if(!inAlertWindow())return;const pending=renderAlerts(),ov=$('txAlertOverlay');if(!ov||ov.classList.contains('open'))return;const a=pending.find(x=>x.level!=='positive')||pending[0];if(!a)return;
    ov.dataset.key=a.key;ov.innerHTML=`<div class="txAlertPopup ${a.level}"><div class="label">ALERTA DE GESTÃO • SEGUNDA 10:00</div><h2>${esc(a.title)}</h2><div class="txAlertText">${esc(a.text)}</div><div class="card" style="margin-top:12px;padding:10px"><span class="label">Ponto principal</span><b style="display:block;margin-top:4px">${esc(a.metric||'')}</b></div><div class="txAlertActions">${a.person?'<button id="txAlertOpenPerson">Abrir profissional</button>':''}<button class="primary" id="txAlertUnderstood">✓ Entendido</button></div></div>`;ov.classList.add('open');$('txAlertUnderstood').onclick=()=>acknowledge(a);const p=$('txAlertOpenPerson');if(p)p.onclick=()=>openPerson(a.person)
  }
  function showAlertsPage(){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='alerts'));document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.page==='alerts'));renderAlerts()}

  function mount(){
    cleanupMenu();const nav=document.querySelector('.tabs');if(!nav)return;
    let tab=$('alertTab');if(!tab){tab=document.createElement('button');tab.className='tab';tab.id='alertTab';tab.dataset.page='alerts';tab.innerHTML='Alertas <span class="txAlertCount" id="txAlertCount" style="display:none">0</span>';const teams=nav.querySelector('.tab[data-page="teams"]');nav.insertBefore(tab,teams||null)}tab.onclick=showAlertsPage;
    if(!$('alerts')){const page=document.createElement('section');page.className='page';page.id='alerts';page.innerHTML=`<div class="section"><div><h2>Central de Alertas</h2><div class="meta">Análise automática semanal de performance.</div></div><span class="cpBadge">SEGUNDA • 10:00</span></div><div class="stats" id="txAlertSummary"></div><div class="section"><h2>Alertas</h2><span class="meta" id="txAlertPeriod"></span></div><div class="txAlertGrid" id="txAlertList"></div><div class="section"><h2>O que o TARGET X verifica</h2></div><div class="txAlertRules"><div class="txRule"><b>Ritmo de casais</b><span>Compara o andamento com a marca de 22 casais.</span></div><div class="txRule"><b>Perfil / NQ</b><span>Destaca NQ elevado.</span></div><div class="txRule"><b>Conversão</b><span>Identifica muitos casais com poucas vendas.</span></div><div class="txRule"><b>Brindes</b><span>Compara custo por casal com a equipe.</span></div><div class="txRule"><b>VGV</b><span>Compara projeção do mês com a meta.</span></div><div class="txRule"><b>Atualização da base</b><span>Avisa quando a planilha está desatualizada.</span></div></div>`;document.querySelector('footer')?.parentNode.insertBefore(page,document.querySelector('footer'))}
    if(!$('txAlertOverlay')){const ov=document.createElement('div');ov.id='txAlertOverlay';document.body.appendChild(ov)}
    renderAlerts();tick();setInterval(tick,30000)
  }
  function tick(){
    cleanupMenu();const windowKey=inAlertWindow()?`${localMondayKey()}|10`:'';
    if(windowKey&&windowKey!==lastAutoWindow){lastAutoWindow=windowKey;renderAlerts();setTimeout(showNextPopup,250)}
    if(!windowKey){lastAutoWindow='';const ov=$('txAlertOverlay');if(ov){ov.classList.remove('open');ov.innerHTML=''}renderAlerts()}
  }

  window.TXAlerts={compute:computeAlerts,render:renderAlerts,showNext:showNextPopup,isWindow:inAlertWindow};
  window.addEventListener('targetx:data-updated',()=>{if(inAlertWindow()){renderAlerts();setTimeout(showNextPopup,250)}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();