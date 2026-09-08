// TARGET X — Perfil de Casais / Inteligência Comercial
(function(){
  if(window.__txCouplesProfileV51)return; window.__txCouplesProfileV51=true;
  const STORE='tx_couples_profile_v51', META='tx_couples_profile_meta_v51';
  const MONTHS=['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
  const n=v=>{if(typeof v==='number')return isFinite(v)?v:0;let s=String(v??'').trim().replace(/R\$|\s/g,'');if(!s)return 0;if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');else if(s.includes(','))s=s.replace(',','.');return Number(s)||0};
  const num=v=>new Intl.NumberFormat('pt-BR').format(Math.round(v||0));
  const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(v||0);
  const pct=(a,b)=>b?`${(a/b*100).toFixed(1)}%`:'0%';
  const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
  const median=a=>{if(!a.length)return 0;const b=[...a].sort((x,y)=>x-y),m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2};

  const css=document.createElement('style');
  css.textContent=`
    .cpFilters{display:grid;grid-template-columns:repeat(3,minmax(160px,1fr));gap:8px}.cpGrid{display:grid;grid-template-columns:1fr 1fr;gap:11px}.cpHero{display:grid;grid-template-columns:1.2fr .8fr;gap:11px}.cpHeadline{font-size:clamp(25px,4vw,42px);font-weight:1000;line-height:1.05;color:var(--green);margin:8px 0}.cpHeadline.red{color:var(--red)}.cpTag{display:inline-block;padding:6px 8px;border:1px solid var(--line);border-radius:99px;margin:3px 4px 0 0;font-size:10px}.cpTable{width:100%;border-collapse:collapse}.cpTable th,.cpTable td{padding:8px;border-bottom:1px solid #14271f;text-align:left}.cpTable th{font-size:9px;color:var(--muted);text-transform:uppercase}.cpTable td:nth-child(n+2),.cpTable th:nth-child(n+2){text-align:right}.cpHint{padding:20px;border:1px dashed #315c47;border-radius:14px;background:#06100b}.cpHint b{display:block;font-size:16px;margin-bottom:7px}.cpRisk{border-color:#5d2630!important}.cpRisk .label{color:#ff9da7}.cpGood .label{color:var(--green)}.cpMini{font-size:10px;color:var(--muted);margin-top:5px}
    @media(max-width:900px){.cpGrid,.cpHero{grid-template-columns:1fr}.cpFilters{grid-template-columns:1fr 1fr}}@media(max-width:560px){.cpFilters{grid-template-columns:1fr}.cpTable{font-size:11px}}
  `;
  document.head.appendChild(css);

  function pageHTML(){return `
    <div class="section"><div><h2>Perfil de Casais</h2><div class="meta">Quem atendemos, quem mais compra e quem mais cancela.</div></div><div class="meta" id="cpDataStatus">Aguardando planilha</div></div>
    <div class="card"><div class="cpFilters">
      <select id="cpPeriod"><option value="all">Ano 2026</option></select>
      <select id="cpScope"><option value="all">Todos os casais</option><option value="buyers">Somente compradores</option><option value="cancelled">Somente cancelados</option></select>
      <select id="cpQual"><option value="all">Q + NQ</option><option value="Q">Somente Q</option><option value="NQ">Somente NQ</option></select>
    </div></div>
    <div id="cpNoData" class="cpHint" style="margin-top:11px"><b>Perfil Casais pronto.</b>Use <strong>Escolher planilha</strong> no topo e selecione a planilha oficial. O TARGET X vai analisar renda, profissão, carro, casa própria, relacionamento, idade, cidade, compra e cancelamento.</div>
    <div id="cpBody" style="display:none">
      <div class="section"><h2>Visão geral</h2><span class="meta" id="cpRange"></span></div><div class="stats" id="cpStats"></div>
      <div class="section"><h2>Quem mais compra</h2><span class="meta">perfil dominante entre compradores</span></div>
      <div class="cpHero"><div class="card cpGood"><div class="label">Perfil de compra</div><div class="cpHeadline" id="cpBuyerHeadline">—</div><div id="cpBuyerTags"></div></div><div class="card"><div class="label">Leitura comercial</div><div id="cpBuyerInsights" style="display:grid;gap:8px;margin-top:8px"></div></div></div>
      <div class="section"><h2>Quem mais cancela</h2><span class="meta">perfil dominante + taxa de risco</span></div>
      <div class="cpHero"><div class="card cpRisk"><div class="label">Perfil de cancelamento</div><div class="cpHeadline red" id="cpCancelHeadline">—</div><div id="cpCancelTags"></div></div><div class="card"><div class="label">Leitura de risco</div><div id="cpCancelInsights" style="display:grid;gap:8px;margin-top:8px"></div></div></div>
      <div class="cpGrid" style="margin-top:11px"><div class="card"><div class="section" style="margin-top:0"><h2>Renda x resultado</h2></div><div id="cpIncome"></div></div><div class="card"><div class="section" style="margin-top:0"><h2>Relacionamento</h2></div><div id="cpRelationship"></div></div></div>
      <div class="cpGrid" style="margin-top:11px"><div class="card"><div class="section" style="margin-top:0"><h2>Residência</h2></div><div id="cpHome"></div></div><div class="card"><div class="section" style="margin-top:0"><h2>Carros</h2></div><div id="cpCars"></div></div></div>
      <div class="cpGrid" style="margin-top:11px"><div class="card"><div class="section" style="margin-top:0"><h2>Profissões</h2></div><div id="cpProfessions"></div></div><div class="card"><div class="section" style="margin-top:0"><h2>Cidades / Estados</h2></div><div id="cpCities"></div></div></div>
    </div>`}

  function ensurePage(){
    let page=$('clientprofile');
    if(!page){page=document.createElement('section');page.id='clientprofile';page.className='page';page.innerHTML=pageHTML();const ref=$('profile');(ref?.parentNode||document.querySelector('main'))?.insertBefore(page,ref||null)}
    else if(!page.querySelector('#cpNoData'))page.innerHTML=pageHTML();
    const tab=document.querySelector('.tab[data-page="clientprofile"]');
    if(tab){tab.textContent='Perfil Casais';tab.onclick=()=>openProfile()}
    const prof=document.querySelector('.tab[data-page="profile"]');if(prof)prof.textContent='Profissional';
    ['cpPeriod','cpScope','cpQual'].forEach(id=>{const el=$(id);if(el&&!el.dataset.bound){el.dataset.bound='1';el.addEventListener('change',render)}});
    return page;
  }

  function openProfile(){
    ensurePage();
    document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='clientprofile'));
    document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.page==='clientprofile'));
    render();
  }

  function get(row,...names){const ks=Object.keys(row);for(const name of names){const target=norm(name),k=ks.find(k=>norm(k)===target);if(k!==undefined)return row[k]}return ''}
  function ymd(v){if(!v)return '';if(typeof v==='number'&&window.XLSX?.SSF?.parse_date_code){const d=XLSX.SSF.parse_date_code(v);if(d)return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;}const s=String(v).trim();if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);const m=s.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);if(m)return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;const d=new Date(s);return isNaN(d)?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function rel(v){const x=norm(v);if(!x)return 'NÃO INFORMADO';if(x==='UNIAO ESTAVEL')return 'UNIÃO ESTÁVEL';if(/CASAD/.test(x))return 'CASADO';if(/NOIV/.test(x))return 'NOIVOS';if(/NAMORAD/.test(x))return 'NAMORADOS';if(/SOLTEIR/.test(x))return 'SOLTEIRO';return String(v).trim().toUpperCase()}
  function home(v){const x=norm(v);if(!x||x==='NAO SELECIONADO')return 'NÃO INFORMADO';if(x.includes('PROPRIA')||x.includes('VERIFICADO')||x==='SIM')return 'CASA PRÓPRIA';if(x==='NAO'||x.includes('ALUG'))return 'SEM CASA PRÓPRIA';return String(v).trim().toUpperCase()}
  function qual(v){const x=norm(v);if(/^Q\b/.test(x)||x.includes('PERFIL QUALIFICADO'))return 'Q';if(/^NQ\b/.test(x))return 'NQ';return '—'}
  function compact(row){
    const date=ymd(get(row,'Data de atendimento','Data')); if(!date)return null;
    const status=norm(get(row,'Status do contrato','Status contrato'));
    const buyer=/\bATIVO\b/.test(status)?1:0, cancelled=/CANCEL/.test(status)?1:0;
    return {date,income:n(get(row,'Renda','Renda Bruta','Renda familiar')),car:String(get(row,'Carro 1','Carro','Veículo','Veiculo')||'').trim().toUpperCase(),carYear:Math.round(n(get(row,'Ano carro 1','Ano carro','Ano do carro')))||0,home:home(get(row,'Residência própria','Residencia propria','Casa própria','Casa propria')),rel:rel(get(row,'Tipo de relacionamento','Relacionamento','Estado civil')),p1:String(get(row,'Profissão 1','Profissao 1','Profissão','Profissao')||'').trim(),p2:String(get(row,'Profissão 2','Profissao 2')||'').trim(),city:String(get(row,'Cidade')||'').trim(),uf:String(get(row,'UF','Estado')||'').trim().toUpperCase(),age1:Math.round(n(get(row,'Idade 1','Idade')))||0,age2:Math.round(n(get(row,'Idade 2')))||0,qual:qual(get(row,'Qualificação','Qualificacao','Motivo de qualificação','Motivo de qualificacao')),buyer,cancelled,value:n(get(row,'Valor vendido','VGV','VGV Geral'))};
  }

  function save(rows,file){localStorage.setItem(STORE,JSON.stringify(rows));const dates=rows.map(r=>r.date).sort();localStorage.setItem(META,JSON.stringify({file,rows:rows.length,through:dates.at(-1)||'',when:new Date().toISOString()}))}
  function rows(){try{return JSON.parse(localStorage.getItem(STORE)||'[]')}catch{return []}}
  function metadata(){try{return JSON.parse(localStorage.getItem(META)||'null')}catch{return null}}
  async function ensureXlsx(){if(window.XLSX)return;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=resolve;s.onerror=()=>reject(new Error('Não consegui carregar o leitor da planilha.'));document.head.appendChild(s)})}
  async function importFile(file){
    if(!file)return;ensurePage();$('cpDataStatus').textContent='Lendo planilha...';
    try{await ensureXlsx();const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});const out=[];wb.SheetNames.forEach(sn=>XLSX.utils.sheet_to_json(wb.Sheets[sn],{defval:'',raw:true}).forEach(r=>{const c=compact(r);if(c)out.push(c)}));if(!out.length)throw new Error('Não encontrei casais válidos na planilha.');save(out,file.name);$('cpDataStatus').innerHTML=`<span class="green">✓ ${num(out.length)} casais carregados</span>`;render();}catch(e){$('cpDataStatus').innerHTML=`<span class="red">${esc(e.message||e)}</span>`}
  }
  function hookUpload(){const fi=$('txSheetFile');if(!fi||fi.dataset.cp51)return false;fi.dataset.cp51='1';fi.addEventListener('change',()=>{const f=fi.files?.[0];if(f)importFile(f)});return true}

  function band(v){if(!v)return 'Não informado';if(v<10000)return 'Até R$ 9,9 mil';if(v<15000)return 'R$ 10–14,9 mil';if(v<20000)return 'R$ 15–19,9 mil';if(v<30000)return 'R$ 20–29,9 mil';if(v<50000)return 'R$ 30–49,9 mil';return 'R$ 50 mil+'}
  function grouped(list,keyFn,limit=10){const m={};list.forEach(r=>{const k=keyFn(r)||'NÃO INFORMADO';m[k]||(m[k]={n:0,b:0,c:0,contracts:0});m[k].n++;if(r.buyer)m[k].b++;if(r.cancelled)m[k].c++;if(r.buyer||r.cancelled)m[k].contracts++});return Object.entries(m).sort((a,b)=>b[1].n-a[1].n).slice(0,limit)}
  function table(groups,label){return `<table class="cpTable"><thead><tr><th>${label}</th><th>Atend.</th><th>Compram</th><th>Cancelam</th><th>Conv.</th><th>Cancel.*</th></tr></thead><tbody>${groups.map(([k,v])=>`<tr><td>${esc(k)}</td><td>${num(v.n)}</td><td>${num(v.b)}</td><td>${num(v.c)}</td><td><b>${pct(v.b,v.n)}</b></td><td><b>${pct(v.c,v.contracts)}</b></td></tr>`).join('')}</tbody></table><div class="cpMini">*Cancelamento = cancelados ÷ casais com contrato ativo ou cancelado.</div>`}
  function topValue(list,key){const m={};list.forEach(r=>{const v=String(r[key]||'').trim();if(v&&v!=='NÃO INFORMADO')m[v]=(m[v]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'}
  function topProf(list){const m={};list.forEach(r=>[r.p1,r.p2].forEach(v=>{v=String(v||'').trim();if(v)m[v]=(m[v]||0)+1}));return Object.entries(m).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'}
  function topBand(list){const m={};list.forEach(r=>{const k=band(r.income);if(k!=='Não informado')m[k]=(m[k]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'}
  function risk(list,keyFn){return grouped(list,keyFn,99).filter(([,v])=>v.contracts>=3).sort((a,b)=>(b[1].c/b[1].contracts)-(a[1].c/a[1].contracts)||b[1].c-a[1].c)[0]||null}
  function riskText(g){return g?`${esc(g[0])} • ${pct(g[1].c,g[1].contracts)} (${num(g[1].c)}/${num(g[1].contracts)})`:'Amostra insuficiente'}

  function render(){
    ensurePage();const all=rows(),md=metadata();$('cpDataStatus').textContent=md?`${num(md.rows)} casais • até ${(md.through||'').split('-').reverse().join('/')}`:'Aguardando planilha';
    if(!all.length){$('cpNoData').style.display='block';$('cpBody').style.display='none';return}
    $('cpNoData').style.display='none';$('cpBody').style.display='block';
    const p=$('cpPeriod');if(p&&p.options.length===1)[...new Set(all.map(r=>Number(r.date.slice(5,7))))].sort((a,b)=>a-b).forEach(m=>p.insertAdjacentHTML('beforeend',`<option value="${m}">${MONTHS[m]} 2026</option>`));
    let list=[...all];const pv=p?.value||'all',scope=$('cpScope')?.value||'all',qf=$('cpQual')?.value||'all';if(pv!=='all')list=list.filter(r=>Number(r.date.slice(5,7))===Number(pv));if(scope==='buyers')list=list.filter(r=>r.buyer);if(scope==='cancelled')list=list.filter(r=>r.cancelled);if(qf!=='all')list=list.filter(r=>r.qual===qf);
    const buyers=list.filter(r=>r.buyer),cancels=list.filter(r=>r.cancelled),contracts=list.filter(r=>r.buyer||r.cancelled),inc=list.map(r=>r.income).filter(Boolean),bInc=buyers.map(r=>r.income).filter(Boolean),cInc=cancels.map(r=>r.income).filter(Boolean),ages=list.flatMap(r=>[r.age1,r.age2]).filter(v=>v>=18&&v<=90),cy=list.map(r=>r.carYear).filter(v=>v>=1980&&v<=2030),homeKnown=list.filter(r=>r.home!=='NÃO INFORMADO'),own=homeKnown.filter(r=>r.home==='CASA PRÓPRIA').length;
    $('cpRange').textContent=`${num(list.length)} casais no filtro`;
    $('cpStats').innerHTML=[['Casais atendidos',num(list.length),`${num(buyers.length)} compradores`],['Conversão',pct(buyers.length,list.length),'contrato ATIVO'],['Cancelamentos',num(cancels.length),`${pct(cancels.length,contracts.length)} dos contratos`],['Renda média',money(avg(inc)),`mediana ${money(median(inc))}`],['Renda de quem compra',money(avg(bInc)),`${num(bInc.length)} com renda`],['Renda de quem cancela',money(avg(cInc)),`${num(cInc.length)} com renda`],['Casa própria',pct(own,homeKnown.length),`${num(own)} informados`],['Idade média',ages.length?`${avg(ages).toFixed(1)} anos`:'—','pessoas'],['Ano médio do carro',cy.length?Math.round(avg(cy)):'—',`${num(cy.length)} carros`]].map(([l,v,s])=>`<div class="card stat"><span class="label">${l}</span><b>${v}</b><small>${s}</small></div>`).join('');
    const bBand=topBand(buyers),bRel=topValue(buyers,'rel'),bCar=topValue(buyers,'car'),bProf=topProf(buyers),bHome=buyers.filter(r=>r.home!=='NÃO INFORMADO'),bOwn=bHome.filter(r=>r.home==='CASA PRÓPRIA').length;
    $('cpBuyerHeadline').textContent=buyers.length?`${bBand} • ${bRel}`:'Sem compradores no filtro';$('cpBuyerTags').innerHTML=buyers.length?`<span class="cpTag">Renda ${money(avg(bInc))}</span><span class="cpTag">Casa própria ${pct(bOwn,bHome.length)}</span><span class="cpTag">Carro ${esc(bCar)}</span><span class="cpTag">Profissão ${esc(bProf)}</span>`:'';$('cpBuyerInsights').innerHTML=`<div class="insight"><b>Faixa de renda mais frequente</b>${esc(bBand)}</div><div class="insight"><b>Relacionamento</b>${esc(bRel)}</div><div class="insight"><b>Carro mais comum</b>${esc(bCar)}</div><div class="insight"><b>Profissão mais comum</b>${esc(bProf)}</div>`;
    const cBand=topBand(cancels),cRel=topValue(cancels,'rel'),cCar=topValue(cancels,'car'),cProf=topProf(cancels),ri=risk(list,r=>band(r.income)),rr=risk(list,r=>r.rel),rh=risk(list,r=>r.home);
    $('cpCancelHeadline').textContent=cancels.length?`${cBand} • ${cRel}`:'Sem cancelamentos no filtro';$('cpCancelTags').innerHTML=cancels.length?`<span class="cpTag">Renda ${money(avg(cInc))}</span><span class="cpTag">Carro ${esc(cCar)}</span><span class="cpTag">Profissão ${esc(cProf)}</span>`:'';$('cpCancelInsights').innerHTML=`<div class="insight"><b>Renda de quem cancela</b><span class="red">${money(avg(cInc))}</span></div><div class="insight"><b>Faixa de renda com maior taxa*</b>${riskText(ri)}</div><div class="insight"><b>Relacionamento com maior taxa*</b>${riskText(rr)}</div><div class="insight"><b>Moradia com maior taxa*</b>${riskText(rh)}</div><div class="cpMini">*Somente grupos com pelo menos 3 contratos.</div>`;
    const order=['Até R$ 9,9 mil','R$ 10–14,9 mil','R$ 15–19,9 mil','R$ 20–29,9 mil','R$ 30–49,9 mil','R$ 50 mil+','Não informado'],im=Object.fromEntries(grouped(list,r=>band(r.income),99));$('cpIncome').innerHTML=table(order.filter(k=>im[k]).map(k=>[k,im[k]]),'Faixa de renda');$('cpRelationship').innerHTML=table(grouped(list,r=>r.rel,8),'Relacionamento');$('cpHome').innerHTML=table(grouped(list,r=>r.home,6),'Residência');$('cpCars').innerHTML=table(grouped(list,r=>r.car||'NÃO INFORMADO',10),'Carro');
    const pm={};list.forEach(r=>[r.p1,r.p2].forEach(p=>{p=String(p||'').trim();if(!p)return;pm[p]||(pm[p]={n:0,b:0,c:0,contracts:0});pm[p].n++;if(r.buyer)pm[p].b++;if(r.cancelled)pm[p].c++;if(r.buyer||r.cancelled)pm[p].contracts++}));$('cpProfessions').innerHTML=table(Object.entries(pm).sort((a,b)=>b[1].n-a[1].n).slice(0,12),'Profissão');const cities=grouped(list,r=>r.city||'NÃO INFORMADO',8),ufs=grouped(list,r=>r.uf||'NÃO INFORMADO',8);$('cpCities').innerHTML=`<div class="label">Cidades</div>${cities.map(([k,v])=>`<div class="member"><b>${esc(k)}</b><span class="tiny">${num(v.n)} atendimentos</span></div>`).join('')}<div class="label" style="margin-top:12px">Estados</div>${ufs.map(([k,v])=>`<span class="cpTag">${esc(k)} • ${num(v.n)}</span>`).join('')}`;
  }

  function init(){ensurePage();hookUpload();render();setTimeout(hookUpload,400);setTimeout(hookUpload,1200)}
  document.addEventListener('click',e=>{const t=e.target.closest?.('.tab[data-page="clientprofile"]');if(t){e.preventDefault();openProfile()}},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
