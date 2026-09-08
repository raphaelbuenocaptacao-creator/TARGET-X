// TARGET X — Explorador de Renda + Universo Oficial 3.601 — v5.7 SAFE
(function(){
  if(window.__txProfileExplorerV57)return;window.__txProfileExplorerV57=true;

  const CORE_URL='https://raw.githubusercontent.com/raphaelbuenocaptacao-creator/CaptaUP-Analytics-/main/data-2026.json';
  const RICH_STORE='tx_couples_profile_v54';
  const $=id=>document.getElementById(id);
  const num=v=>new Intl.NumberFormat('pt-BR').format(Math.round(Number(v)||0));
  const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(Number(v)||0);
  const pct=(a,b)=>b?`${(a/b*100).toFixed(1)}%`:'0%';
  const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const parseMoney=v=>{if(typeof v==='number')return Number(v)||0;let s=String(v??'').replace(/R\$|\s/g,'');if(!s)return 0;if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');else if(s.includes(','))s=s.replace(',','.');return Number(s)||0};
  const officialTotal=()=>Number(window.DATA_META?.records)||3601;

  let core=[],coreMeta=null,loading=false;

  const css=document.createElement('style');
  css.textContent=`
    .incomeLab{margin-top:12px;border:1px solid #315c47;background:linear-gradient(180deg,#0b1b13,#07100c);border-radius:18px;padding:15px}
    .incomeLabTop{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap}
    .incomeLabTitle{font-size:16px;font-weight:1000;text-transform:uppercase;letter-spacing:1px}
    .incomeLabSub{font-size:11px;color:var(--muted);margin-top:4px}
    .incomeControls{display:grid;grid-template-columns:minmax(180px,1fr) minmax(170px,.7fr) auto;gap:8px;margin-top:12px}
    .incomeQuick{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.incomeQuick button{padding:7px 9px;font-size:10px}
    .incomeResult{display:none;margin-top:13px}.incomeResult.show{display:block}
    .incomeHero{display:grid;grid-template-columns:1.1fr .9fr;gap:10px}
    .incomeScore{font-size:30px;font-weight:1000;margin:6px 0}.incomeScore.good{color:var(--green)}.incomeScore.risk{color:var(--red)}.incomeScore.mid{color:var(--amber)}
    .incomeStats{display:grid;grid-template-columns:repeat(4,minmax(130px,1fr));gap:8px;margin-top:10px}
    .incomeStat{border:1px solid var(--line);background:#06100b;border-radius:13px;padding:11px}.incomeStat span{display:block;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:1px}.incomeStat b{display:block;font-size:19px;margin-top:5px}
    .incomeProfile{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.incomeProfile .insight{min-height:75px}
    .incomeNear{overflow:auto;margin-top:10px}.incomeNear table{width:100%;border-collapse:collapse;min-width:620px}.incomeNear th,.incomeNear td{padding:7px;border-bottom:1px solid var(--line);text-align:right}.incomeNear th:first-child,.incomeNear td:first-child{text-align:left}.incomeNear th{font-size:9px;color:var(--muted);text-transform:uppercase}
    .incomeCoverage{font-size:10px;color:var(--muted);margin-top:8px}.officialUniverse{color:var(--green);font-weight:900}
    @media(max-width:900px){.incomeHero,.incomeProfile{grid-template-columns:1fr}.incomeStats{grid-template-columns:1fr 1fr}}
    @media(max-width:560px){.incomeControls{grid-template-columns:1fr}.incomeStats{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(css);

  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
  function setHTML(el,html){if(el&&el.innerHTML!==html)el.innerHTML=html}

  function parseCore(payload){
    if(!payload||!Array.isArray(payload.r)||!Array.isArray(payload.d))return[];
    const D=payload.d,Q=D[4]||[],CITY=D[5]||[],PROF=D[6]||[],INC=D[7]||[];
    return payload.r.map(a=>{
      const contracts=Number(a[7])||0,activeContracts=Number(a[9])||0,cancelContracts=Math.max(0,contracts-activeContracts);
      return{
        date:String(a[0]||''),q:Q[a[6]]||'',grossVgv:Number(a[5])||0,contracts,
        activeVgv:Number(a[8])||0,activeContracts,cancelContracts,
        buyer:activeContracts>0,cancelled:cancelContracts>0,city:CITY[a[12]]||'',profession:PROF[a[13]]||'',
        income:parseMoney(INC[a[14]]||''),age:Number(a[15])||0
      };
    }).filter(r=>/^2026-\d{2}-\d{2}$/.test(r.date));
  }

  async function loadCore(){
    if(core.length||loading)return;loading=true;
    try{
      const r=await fetch(`${CORE_URL}?v=20260908-profile57`,{cache:'no-store'});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const p=await r.json();core=parseCore(p);coreMeta={from:p.from||'',to:p.to||'',rows:core.length};
    }catch(e){console.warn('TARGET X renda:',e);core=[];coreMeta={error:true};}
    finally{loading=false;mount();patchOfficial();}
  }

  function richRows(){try{return JSON.parse(localStorage.getItem(RICH_STORE)||'[]')}catch{return[]}}
  function top(list,key){const m={};list.forEach(r=>{const v=String(typeof key==='function'?key(r):r[key]||'').trim();if(v&&v!=='NÃO INFORMADO'&&v!=='—')m[v]=(m[v]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1])[0]||['—',0]}
  function topList(list,key,limit=5){const m={};list.forEach(r=>{const v=String(typeof key==='function'?key(r):r[key]||'').trim();if(v&&v!=='NÃO INFORMADO'&&v!=='—')m[v]=(m[v]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,limit)}
  function agg(list){const a={n:list.length,buyers:0,active:0,cancel:0,contracts:0,activeVgv:0,grossVgv:0};list.forEach(r=>{if(r.buyer)a.buyers++;a.active+=r.activeContracts||0;a.cancel+=r.cancelContracts||0;a.contracts+=r.contracts||0;a.activeVgv+=r.activeVgv||0;a.grossVgv+=r.grossVgv||0});a.conv=a.n?a.buyers/a.n:0;a.cancelRate=a.contracts?a.cancel/a.contracts:0;a.ticket=a.active?a.activeVgv/a.active:0;a.vgvCouple=a.n?a.activeVgv/a.n:0;return a}

  function incomeBand(v){if(v<10000)return[0,9999,'Até R$ 9,9 mil'];if(v<15000)return[10000,14999,'R$ 10–14,9 mil'];if(v<20000)return[15000,19999,'R$ 15–19,9 mil'];if(v<30000)return[20000,29999,'R$ 20–29,9 mil'];if(v<50000)return[30000,49999,'R$ 30–49,9 mil'];return[50000,Infinity,'R$ 50 mil+']}
  function ruleFor(value,mode){if(mode==='exact')return{min:value,max:value,label:money(value)+' exatos'};if(mode==='1000')return{min:Math.max(0,value-1000),max:value+1000,label:`${money(value-1000)} a ${money(value+1000)}`};if(mode==='2500')return{min:Math.max(0,value-2500),max:value+2500,label:`${money(value-2500)} a ${money(value+2500)}`};if(mode==='5000')return{min:Math.max(0,value-5000),max:value+5000,label:`${money(value-5000)} a ${money(value+5000)}`};const b=incomeBand(value);return{min:b[0],max:b[1],label:b[2]}}
  function selectedBase(list){const period=$('cpPeriod')?.value||'all',q=$('cpQual')?.value||'all';return list.filter(r=>(period==='all'||Number(r.date.slice(5,7))===Number(period))&&(q==='all'||r.q===q))}

  function officialForFilters(){
    const scope=$('cpScope')?.value||'all';if(scope!=='all')return null;
    const p=$('cpPeriod')?.value||'all',q=$('cpQual')?.value||'all',months=Array.isArray(window.MONTHS)?window.MONTHS:[];
    if(p==='all'){
      if(q==='Q')return months.reduce((s,m)=>s+(Number(m.q)||0),0);
      if(q==='NQ')return months.reduce((s,m)=>s+(Number(m.nq)||0),0);
      return officialTotal();
    }
    const m=months.find(x=>Number(x.month)===Number(p));if(!m)return null;
    if(q==='Q')return Number(m.q)||0;if(q==='NQ')return Number(m.nq)||0;return Number(m.couples)||0;
  }

  function patchOfficial(){
    const off=officialForFilters();if(!off)return;
    const stats=$('cpStats');
    if(stats){
      const card=[...stats.querySelectorAll('.stat')].find(c=>/CASAIS ATENDIDOS/i.test(c.querySelector('.label')?.textContent||''));
      if(card){
        const b=card.querySelector('b'),sm=card.querySelector('small');
        setText(b,num(off));
        setHTML(sm,`<span class="officialUniverse">universo oficial</span> • ${num(core.length||0)} registros na base analítica`);
      }
    }
    setText($('cpRange'),`${num(off)} casais no universo oficial • análise detalhada conforme cobertura dos campos`);
    const warn=$('cpBaseWarning');if(warn){const to=coreMeta?.to?coreMeta.to.split('-').reverse().join('/'):'—';setHTML(warn,`<b>Universo oficial:</b> ${num(off)} casais ${($('cpPeriod')?.value||'all')==='all'?'até 07/09/2026':'no período selecionado'}. <b>Base analítica:</b> ${num(core.length)} registros disponíveis até ${to}. O TARGET X mostra a cobertura real de cada campo e não inventa dados ausentes.`)}
  }

  function mount(){
    const page=$('clientprofile');if(!page||$('incomeLab'))return;
    const filterCard=page.querySelector('.card');if(!filterCard)return;
    const box=document.createElement('div');box.id='incomeLab';box.className='incomeLab';
    box.innerHTML=`
      <div class="incomeLabTop"><div><div class="incomeLabTitle">🔎 Explorar uma renda</div><div class="incomeLabSub">Digite uma renda e o TARGET X descobre o perfil, compra, cancelamento e valor daquele público.</div></div><div class="cpBadge">RAIO-X DE RENDA</div></div>
      <div class="incomeControls"><input id="incomeValue" inputmode="numeric" placeholder="Ex.: 20000"><select id="incomeMode"><option value="band">Faixa comercial automática</option><option value="exact">Renda exata</option><option value="1000">Renda ± R$ 1.000</option><option value="2500">Renda ± R$ 2.500</option><option value="5000">Renda ± R$ 5.000</option></select><button class="primary" id="incomeAnalyze">Analisar renda</button></div>
      <div class="incomeQuick"><button data-inc="10000">R$ 10 mil</button><button data-inc="15000">R$ 15 mil</button><button data-inc="20000">R$ 20 mil</button><button data-inc="30000">R$ 30 mil</button><button data-inc="50000">R$ 50 mil</button></div>
      <div id="incomeResult" class="incomeResult"></div>`;
    filterCard.insertAdjacentElement('afterend',box);
    $('incomeAnalyze').onclick=analyzeIncome;
    $('incomeValue').addEventListener('keydown',e=>{if(e.key==='Enter')analyzeIncome()});
    box.querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>{$('incomeValue').value=b.dataset.inc;analyzeIncome()});
    ['cpPeriod','cpScope','cpQual'].forEach(id=>$(id)?.addEventListener('change',()=>setTimeout(()=>{patchOfficial();if($('incomeResult')?.classList.contains('show'))analyzeIncome()},0)));
    // IMPORTANTE: sem MutationObserver aqui. A versão anterior observava e reescrevia cpStats em loop, congelando os cliques.
    patchOfficial();
  }

  function analyzeIncome(){
    const value=parseMoney($('incomeValue')?.value),result=$('incomeResult');if(!result)return;
    if(!value){result.classList.add('show');result.innerHTML='<div class="cpWarn">Digite uma renda válida, por exemplo <b>20000</b>.</div>';return}
    if(!core.length){result.classList.add('show');result.innerHTML='<div class="cpWarn">A base de renda ainda está carregando. Tente novamente em alguns segundos.</div>';loadCore();return}

    const mode=$('incomeMode')?.value||'band',rule=ruleFor(value,mode),base=selectedBase(core),known=base.filter(r=>r.income>0),seg=known.filter(r=>r.income>=rule.min&&r.income<=rule.max),A=agg(seg),B=agg(known);
    if(!seg.length){result.classList.add('show');result.innerHTML=`<div class="cpWarn"><b>Nenhum casal encontrado em ${esc(rule.label)}.</b> Tente uma faixa maior, como ± R$ 2.500 ou ± R$ 5.000.</div>`;return}

    const ages=seg.map(r=>r.age).filter(a=>a>=18&&a<=90),[prof,profN]=top(seg,'profession'),[city,cityN]=top(seg,'city'),qKnown=seg.filter(r=>r.q==='Q'||r.q==='NQ'),qN=seg.filter(r=>r.q==='Q').length;
    const rich=richRows().filter(r=>{const inc=Number(r.income)||0,period=$('cpPeriod')?.value||'all',q=$('cpQual')?.value||'all';return inc>=rule.min&&inc<=rule.max&&(period==='all'||Number(String(r.date||'').slice(5,7))===Number(period))&&(q==='all'||r.qual===q)});
    const [car,carN]=top(rich,'car'),[rel,relN]=top(rich,'rel'),homeKnown=rich.filter(r=>r.home&&r.home!=='NÃO INFORMADO'),own=homeKnown.filter(r=>r.home==='CASA PRÓPRIA').length;

    const convDelta=(A.conv-B.conv)*100,cancelDelta=(A.cancelRate-B.cancelRate)*100;
    let grade='Perfil intermediário',klass='mid',read='Performance próxima da média da base conhecida.';
    if(A.conv>=B.conv+.02&&A.cancelRate<=B.cancelRate+.01){grade='Perfil forte';klass='good';read='Converte acima da média sem elevar o risco de cancelamento.'}
    if(A.cancelRate>B.cancelRate+.05){grade='Perfil de atenção';klass='risk';read='Apresenta cancelamento acima da média e merece abordagem/qualificação mais cuidadosa.'}

    const universe=officialForFilters()||officialTotal(),nearGroups={};
    known.filter(r=>Math.abs(r.income-value)<=5000).forEach(r=>{const k=Math.round(r.income);(nearGroups[k]||(nearGroups[k]=[])).push(r)});
    const near=Object.entries(nearGroups).map(([k,v])=>[Number(k),agg(v)]).filter(([,a])=>a.n>=3).sort((a,b)=>a[0]-b[0]).slice(0,15),proflist=topList(seg,'profession',5),citylist=topList(seg,'city',5);

    result.classList.add('show');
    result.innerHTML=`
      <div class="incomeHero"><div class="card"><span class="label">Renda analisada</span><div class="incomeScore ${klass}">${esc(rule.label)}</div><div class="cpTag">${num(A.n)} casais encontrados</div><div class="cpTag">${pct(A.n,universe)} do universo oficial</div><div class="cpTag">${pct(A.n,known.length)} da base com renda</div></div><div class="card"><span class="label">Diagnóstico</span><div class="incomeScore ${klass}" style="font-size:24px">${grade}</div><div>${read}</div><div class="incomeCoverage">Conversão: ${convDelta>=0?'+':''}${convDelta.toFixed(1)} p.p. vs. média • Cancelamento: ${cancelDelta>=0?'+':''}${cancelDelta.toFixed(1)} p.p. vs. média</div></div></div>
      <div class="incomeStats"><div class="incomeStat"><span>Casais</span><b>${num(A.n)}</b></div><div class="incomeStat"><span>Compradores</span><b>${num(A.buyers)}</b><small>Conv. ${pct(A.buyers,A.n)}</small></div><div class="incomeStat"><span>Contratos ativos</span><b>${num(A.active)}</b></div><div class="incomeStat"><span>Contratos cancelados</span><b>${num(A.cancel)}</b><small>Taxa ${pct(A.cancel,A.contracts)}</small></div><div class="incomeStat"><span>VGV ativo</span><b>${money(A.activeVgv)}</b></div><div class="incomeStat"><span>Ticket</span><b>${money(A.ticket)}</b></div><div class="incomeStat"><span>VGV / casal</span><b>${money(A.vgvCouple)}</b></div><div class="incomeStat"><span>Idade média</span><b>${ages.length?avg(ages).toFixed(1)+' anos':'—'}</b></div></div>
      <div class="incomeProfile"><div class="insight"><b>Profissão dominante</b>${esc(prof)}<div class="tiny">${num(profN)} ocorrências • Top: ${proflist.map(x=>esc(x[0])+' ('+num(x[1])+')').join(', ')||'—'}</div></div><div class="insight"><b>Cidade dominante</b>${esc(city)}<div class="tiny">${num(cityN)} ocorrências • Top: ${citylist.map(x=>esc(x[0])+' ('+num(x[1])+')').join(', ')||'—'}</div></div><div class="insight"><b>Qualificação</b>${pct(qN,qKnown.length)} Q<div class="tiny">${num(qN)} Q de ${num(qKnown.length)} com Q/NQ informado</div></div><div class="insight"><b>Carro mais comum</b>${esc(car)}<div class="tiny">${num(carN)} ocorrências em ${num(rich.length)} perfis ricos</div></div><div class="insight"><b>Relacionamento</b>${esc(rel)}<div class="tiny">${num(relN)} ocorrências</div></div><div class="insight"><b>Casa própria</b>${pct(own,homeKnown.length)}<div class="tiny">${num(own)} de ${num(homeKnown.length)} com residência informada</div></div></div>
      <div class="incomeCoverage"><b>Cobertura:</b> universo oficial ${num(universe)} • ${num(known.length)} registros com renda utilizável no período/filtro • ${num(rich.length)} registros com perfil patrimonial/relacionamento para esta renda. Onde não existe informação, o TARGET X não estima.</div>
      ${near.length?`<div class="section" style="margin-top:14px"><h2>Rendas próximas</h2><span class="meta">comparação dentro de ± R$ 5 mil</span></div><div class="incomeNear"><table><thead><tr><th>Renda</th><th>Casais</th><th>Conversão</th><th>Cancelamento</th><th>Ticket</th><th>VGV/casal</th></tr></thead><tbody>${near.map(([k,a])=>`<tr><td>${money(k)}</td><td>${num(a.n)}</td><td>${pct(a.buyers,a.n)}</td><td>${pct(a.cancel,a.contracts)}</td><td>${money(a.ticket)}</td><td>${money(a.vgvCouple)}</td></tr>`).join('')}</tbody></table></div>`:''}`;
  }

  function boot(){
    let tries=0;
    const t=setInterval(()=>{tries++;if($('clientprofile')){clearInterval(t);mount();loadCore();setTimeout(patchOfficial,400)}else if(tries>30)clearInterval(t)},200);
    document.addEventListener('click',e=>{if(e.target?.dataset?.page==='clientprofile')setTimeout(()=>{mount();patchOfficial()},80)});
  }
  boot();
})();