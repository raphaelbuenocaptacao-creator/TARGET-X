// TARGET X — Perfil de Casais / Inteligência Comercial v5.4
(function(){
  if(window.__txCouplesProfileV54)return; window.__txCouplesProfileV54=true;

  const STORE='tx_couples_profile_v54';
  const META='tx_couples_profile_meta_v54';
  const AUTO_URL='https://raw.githubusercontent.com/raphaelbuenocaptacao-creator/RASULTADOS-E-PERFOMANCE/main/Document1111.csv';
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
    .cpFilters{display:grid;grid-template-columns:repeat(3,minmax(160px,1fr));gap:8px}.cpGrid{display:grid;grid-template-columns:1fr 1fr;gap:11px}.cpGrid3{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}.cpHero{display:grid;grid-template-columns:1.15fr .85fr;gap:11px}.cpHeadline{font-size:clamp(24px,4vw,39px);font-weight:1000;line-height:1.05;color:var(--green);margin:8px 0}.cpHeadline.red{color:var(--red)}.cpTag{display:inline-block;padding:6px 8px;border:1px solid var(--line);border-radius:99px;margin:3px 4px 0 0;font-size:10px}.cpTableWrap{overflow:auto;border:1px solid var(--line);border-radius:12px}.cpTable{width:100%;border-collapse:collapse;min-width:880px}.cpTable th,.cpTable td{padding:8px;border-bottom:1px solid #14271f;text-align:left;white-space:nowrap}.cpTable th{font-size:9px;color:var(--muted);text-transform:uppercase;position:sticky;top:0;background:#09140f}.cpTable td:nth-child(n+2),.cpTable th:nth-child(n+2){text-align:right}.cpHint{padding:18px;border:1px dashed #315c47;border-radius:14px;background:#06100b}.cpHint b{display:block;font-size:15px;margin-bottom:7px}.cpRisk{border-color:#5d2630!important}.cpRisk .label{color:#ff9da7}.cpGood .label{color:var(--green)}.cpMini{font-size:10px;color:var(--muted);margin-top:5px}.cpAuto{display:inline-flex;align-items:center;gap:6px;padding:5px 8px;border:1px solid var(--line);border-radius:99px;font-size:10px;color:var(--muted)}.cpDot{width:7px;height:7px;border-radius:50%;background:var(--green)}.cpCompareTitle{font-size:18px;font-weight:1000;margin:5px 0}.cpCompareRows{display:grid;gap:5px;margin-top:10px}.cpCompareRows div{display:flex;justify-content:space-between;gap:12px;border-top:1px solid var(--line);padding-top:6px}.cpCompareRows span{color:var(--muted);font-size:10px}.cpCompareRows b{font-size:12px}.cpWarn{border-left:3px solid var(--amber);padding:9px 11px;background:#181509;border-radius:9px;color:#ffe7a7}.cpQuality{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.cpQuality .insight{min-height:74px}.cpBadge{font-size:9px;border-radius:99px;padding:4px 7px;background:#102b1f;color:#aef5c7}.cpBadge.red{background:#2b151a;color:#ff9da7}
    @media(max-width:980px){.cpGrid,.cpHero,.cpGrid3{grid-template-columns:1fr}.cpQuality{grid-template-columns:1fr 1fr}.cpFilters{grid-template-columns:1fr 1fr}}@media(max-width:560px){.cpFilters,.cpQuality{grid-template-columns:1fr}.cpTable{font-size:11px}.cpHeadline{font-size:27px}}
  `;
  document.head.appendChild(css);

  function pageHTML(){return `
    <div class="section"><div><h2>Perfil de Casais</h2><div class="meta">Quem compra, quem cancela e quais perfis geram mais valor.</div></div><div class="cpAuto"><i class="cpDot"></i><span id="cpDataStatus">Carregando base detalhada...</span></div></div>
    <div class="card"><div class="cpFilters">
      <select id="cpPeriod"><option value="all">Ano 2026</option></select>
      <select id="cpScope"><option value="all">Todos os casais</option><option value="buyers">Somente compradores</option><option value="cancelled">Somente casais com cancelamento</option></select>
      <select id="cpQual"><option value="all">Q + NQ</option><option value="Q">Somente Q</option><option value="NQ">Somente NQ</option></select>
    </div></div>
    <div id="cpNoData" class="cpHint" style="margin-top:11px"><b>Carregando Perfil Casais automaticamente...</b>O TARGET X está buscando a base detalhada. Você não precisa selecionar planilha para consultar este relatório.</div>
    <div id="cpBody" style="display:none">
      <div class="cpWarn" id="cpBaseWarning" style="margin-top:11px"></div>
      <div class="section"><h2>Visão geral</h2><span class="meta" id="cpRange"></span></div><div class="stats" id="cpStats"></div>

      <div class="section"><h2>Todos × Compradores × Cancelados</h2><span class="meta">comparação direta de perfil e valor</span></div>
      <div class="cpGrid3" id="cpCompare"></div>

      <div class="section"><h2>Perfil combinado de quem compra</h2><span class="meta">maior volume com amostra mínima</span></div>
      <div class="cpHero"><div class="card cpGood"><div class="label">Perfil campeão de compra</div><div class="cpHeadline" id="cpBuyerHeadline">—</div><div id="cpBuyerTags"></div></div><div class="card"><div class="label">Leitura comercial</div><div id="cpBuyerInsights" style="display:grid;gap:8px;margin-top:8px"></div></div></div>

      <div class="section"><h2>Perfil combinado de cancelamento</h2><span class="meta">maior risco com amostra mínima</span></div>
      <div class="cpHero"><div class="card cpRisk"><div class="label">Perfil de maior risco</div><div class="cpHeadline red" id="cpCancelHeadline">—</div><div id="cpCancelTags"></div></div><div class="card"><div class="label">Leitura de risco</div><div id="cpCancelInsights" style="display:grid;gap:8px;margin-top:8px"></div></div></div>

      <div class="section"><h2>Renda e idade</h2><span class="meta">atendimento, venda, VGV, ticket e cancelamento</span></div>
      <div class="cpGrid"><div class="card"><div class="section" style="margin-top:0"><h2>Renda</h2></div><div id="cpIncome"></div></div><div class="card"><div class="section" style="margin-top:0"><h2>Faixa etária</h2></div><div id="cpAge"></div></div></div>

      <div class="section"><h2>Perfil patrimonial e relacionamento</h2></div>
      <div class="cpGrid"><div class="card"><div class="section" style="margin-top:0"><h2>Residência</h2></div><div id="cpHome"></div></div><div class="card"><div class="section" style="margin-top:0"><h2>Relacionamento</h2></div><div id="cpRelationship"></div></div></div>

      <div class="section"><h2>Profissão e carro</h2></div>
      <div class="cpGrid"><div class="card"><div class="section" style="margin-top:0"><h2>Profissões</h2></div><div id="cpProfessions"></div></div><div class="card"><div class="section" style="margin-top:0"><h2>Carros</h2></div><div id="cpCars"></div></div></div>

      <div class="section"><h2>Origem geográfica</h2></div>
      <div class="card"><div id="cpCities"></div></div>

      <div class="section"><h2>Qualidade da base</h2><span class="meta">quanto do perfil está realmente preenchido</span></div>
      <div class="cpQuality" id="cpQuality"></div>
    </div>`}

  function ensurePage(){
    let page=$('clientprofile');
    if(!page){page=document.createElement('section');page.id='clientprofile';page.className='page';const ref=$('profile');(ref?.parentNode||document.querySelector('main'))?.insertBefore(page,ref||null)}
    if(!page.dataset.cp54){page.dataset.cp54='1';page.innerHTML=pageHTML()}
    const tab=document.querySelector('.tab[data-page="clientprofile"]');if(tab){tab.textContent='Perfil Casais';tab.onclick=openProfile}
    const prof=document.querySelector('.tab[data-page="profile"]');if(prof)prof.textContent='Profissional';
    ['cpPeriod','cpScope','cpQual'].forEach(id=>{const el=$(id);if(el&&!el.dataset.cp54){el.dataset.cp54='1';el.addEventListener('change',render)}});
    return page;
  }

  function openProfile(){ensurePage();document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='clientprofile'));document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.page==='clientprofile'));render()}

  function get(row,...names){const ks=Object.keys(row);for(const name of names){const target=norm(name),k=ks.find(k=>norm(k)===target);if(k!==undefined)return row[k]}return ''}
  function ymd(v){if(!v)return '';const s=String(v).trim();if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);const m=s.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);if(m)return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;const d=new Date(s);return isNaN(d)?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function rel(v){const x=norm(v);if(!x)return 'NÃO INFORMADO';if(x==='UNIAO ESTAVEL')return 'UNIÃO ESTÁVEL';if(/CASAD/.test(x))return 'CASADO';if(/NOIV/.test(x))return 'NOIVOS';if(/NAMORAD/.test(x))return 'NAMORADOS';if(/SOLTEIR/.test(x))return 'SOLTEIRO';return String(v).trim().toUpperCase()}
  function home(v){const x=norm(v);if(!x||x==='NAO SELECIONADO')return 'NÃO INFORMADO';if(x.includes('PROPRIA')||x.includes('VERIFICADO')||x==='SIM')return 'CASA PRÓPRIA';if(x==='NAO'||x.includes('ALUG'))return 'SEM CASA PRÓPRIA';return String(v).trim().toUpperCase()}
  function qual(v){const x=norm(v);if(/^Q\b/.test(x)||x.includes('PERFIL QUALIFICADO'))return 'Q';if(/^NQ\b/.test(x))return 'NQ';return '—'}
  function contractCounts(status){const parts=String(status||'').split('#').map(x=>norm(x)).filter(Boolean);let active=0,cancel=0;parts.forEach(p=>{if(/^ATIVO\b/.test(p))active++;else if(/^CANCEL/.test(p))cancel++});return {active,cancel,total:active+cancel}}
  function validAge(v){return v>=18&&v<=90?v:0}
  function rowAge(a,b){const x=[validAge(a),validAge(b)].filter(Boolean);return x.length?avg(x):0}
  function incomeBand(v){if(!v)return 'Não informado';if(v<10000)return 'Até R$ 9,9 mil';if(v<15000)return 'R$ 10–14,9 mil';if(v<20000)return 'R$ 15–19,9 mil';if(v<30000)return 'R$ 20–29,9 mil';if(v<50000)return 'R$ 30–49,9 mil';return 'R$ 50 mil+'}
  function ageBand(v){if(!v)return 'Não informado';if(v<=25)return '18–25';if(v<=35)return '26–35';if(v<=45)return '36–45';if(v<=55)return '46–55';return '56+'}
  function carYearBand(v){if(!v)return 'Ano não informado';if(v>=2021)return '2021+';if(v>=2016)return '2016–2020';if(v>=2011)return '2011–2015';return 'Até 2010'}

  function compact(row){
    const date=ymd(get(row,'Data de atendimento','Data'));if(!date)return null;
    const cc=contractCounts(get(row,'Status do contrato','Status contrato'));
    const gross=n(get(row,'Valor vendido','VGV','VGV Geral','VGV bruto'));
    const explicitActive=n(get(row,'VGV ativo','VGV Ativo'));
    const activeVgv=explicitActive||((cc.total&&gross)?gross*(cc.active/cc.total):0);
    const cancelVgv=(cc.total&&gross)?gross*(cc.cancel/cc.total):0;
    const age1=Math.round(n(get(row,'Idade 1','Idade')))||0,age2=Math.round(n(get(row,'Idade 2')))||0;
    return {date,income:n(get(row,'Renda','Renda Bruta','Renda familiar')),car:String(get(row,'Carro 1','Carro','Veículo','Veiculo')||'').trim().toUpperCase(),carYear:Math.round(n(get(row,'Ano carro 1','Ano carro','Ano do carro')))||0,home:home(get(row,'Residência própria','Residencia propria','Casa própria','Casa propria')),rel:rel(get(row,'Tipo de relacionamento','Relacionamento','Estado civil')),p1:String(get(row,'Profissão 1','Profissao 1','Profissão','Profissao')||'').trim(),p2:String(get(row,'Profissão 2','Profissao 2')||'').trim(),city:String(get(row,'Cidade')||'').trim(),uf:String(get(row,'UF','Estado')||'').trim().toUpperCase(),age1,age2,ageAvg:rowAge(age1,age2),qual:qual(get(row,'Qualificação','Qualificacao','Motivo de qualificação','Motivo de qualificacao')),buyer:cc.active>0,cancelled:cc.cancel>0,activeCount:cc.active,cancelCount:cc.cancel,contractCount:cc.total,value:gross,activeVgv,cancelVgv};
  }

  function save(data,source){const dates=data.map(r=>r.date).filter(Boolean).sort();localStorage.setItem(STORE,JSON.stringify(data));localStorage.setItem(META,JSON.stringify({source:source||'manual',rows:data.length,through:dates.at(-1)||'',from:dates[0]||'',when:new Date().toISOString()}))}
  function rows(){try{return JSON.parse(localStorage.getItem(STORE)||'[]')}catch{return []}}
  function metadata(){try{return JSON.parse(localStorage.getItem(META)||'null')}catch{return null}}

  function parseDelimited(text,delimiter=';'){
    const out=[];let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){
      const ch=text[i];
      if(ch==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}
      else if(ch===delimiter&&!quoted){row.push(cell);cell=''}
      else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);cell='';if(row.some(v=>String(v).trim()!==''))out.push(row);row=[]}
      else cell+=ch;
    }
    if(cell||row.length){row.push(cell);if(row.some(v=>String(v).trim()!==''))out.push(row)}
    return out;
  }
  function matrixToObjects(matrix){const hi=matrix.findIndex(r=>r.some(c=>norm(c)==='PROMOTOR DE MARKETING')&&r.some(c=>norm(c)==='DATA DE ATENDIMENTO'));if(hi<0)return [];const headers=matrix[hi].map((h,i)=>String(h||`campo_${i}`).trim()||`campo_${i}`),out=[];for(let i=hi+1;i<matrix.length;i++){const a=matrix[i];if(!a||!a.some(v=>String(v).trim()))continue;const o={};headers.forEach((h,j)=>o[h]=a[j]??'');out.push(o)}return out}

  async function loadAutomaticBase(force=false){
    ensurePage();const current=rows();if(current.length&&!force){render();return true}
    $('cpDataStatus').textContent='Carregando base detalhada...';
    try{const res=await fetch(`${AUTO_URL}?v=20260908-54`,{cache:'no-store'});if(!res.ok)throw new Error(`HTTP ${res.status}`);const data=matrixToObjects(parseDelimited(await res.text(),';')).map(compact).filter(Boolean);if(!data.length)throw new Error('base vazia');save(data,'Base detalhada automática');render();return true}
    catch(e){console.warn('Perfil Casais automático:',e);$('cpDataStatus').textContent='Base automática indisponível';$('cpNoData').style.display='block';$('cpNoData').innerHTML='<b>Não consegui carregar a base detalhada agora.</b>Você ainda pode usar “Escolher planilha” no topo para atualizar o relatório.';return false}
  }

  async function ensureXlsx(){if(window.XLSX)return;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=resolve;s.onerror=()=>reject(new Error('Não consegui carregar o leitor da planilha.'));document.head.appendChild(s)})}
  async function importFile(file){if(!file)return;ensurePage();$('cpDataStatus').textContent='Atualizando perfil...';try{await ensureXlsx();const wb=XLSX.read(await file.arrayBuffer(),{type:'array'}),out=[];wb.SheetNames.forEach(sn=>XLSX.utils.sheet_to_json(wb.Sheets[sn],{defval:'',raw:true}).forEach(r=>{const c=compact(r);if(c)out.push(c)}));if(!out.length)throw new Error('Não encontrei casais válidos.');save(out,`Planilha: ${file.name}`);render()}catch(e){$('cpDataStatus').innerHTML=`<span class="red">${esc(e.message||e)}</span>`}}
  function hookUpload(){const fi=$('txSheetFile');if(!fi||fi.dataset.cp54)return false;fi.dataset.cp54='1';fi.addEventListener('change',()=>{const f=fi.files?.[0];if(f)importFile(f)});return true}

  function baseAgg(){return {n:0,buyers:0,cancelCouples:0,contractCouples:0,activeContracts:0,cancelContracts:0,contracts:0,grossVgv:0,activeVgv:0,cancelVgv:0}}
  function addAgg(a,r){a.n++;if(r.buyer)a.buyers++;if(r.cancelled)a.cancelCouples++;if(r.contractCount>0)a.contractCouples++;a.activeContracts+=r.activeCount||0;a.cancelContracts+=r.cancelCount||0;a.contracts+=r.contractCount||0;a.grossVgv+=r.value||0;a.activeVgv+=r.activeVgv||0;a.cancelVgv+=r.cancelVgv||0;return a}
  function aggregate(list){return list.reduce((a,r)=>addAgg(a,r),baseAgg())}
  function grouped(list,keyFn,limit=99){const m={};list.forEach(r=>{const k=keyFn(r)||'NÃO INFORMADO';m[k]||(m[k]=baseAgg());addAgg(m[k],r)});return Object.entries(m).sort((a,b)=>b[1].n-a[1].n).slice(0,limit)}
  function metrics(a){return {conv:a.n?a.buyers/a.n:0,cancelCouple:a.contractCouples?a.cancelCouples/a.contractCouples:0,cancelContract:a.contracts?a.cancelContracts/a.contracts:0,ticket:a.activeContracts?a.activeVgv/a.activeContracts:0,vgvPerCouple:a.n?a.activeVgv/a.n:0}}

  function table(groups,label){return `<div class="cpTableWrap"><table class="cpTable"><thead><tr><th>${label}</th><th>Atend.</th><th>Compradores</th><th>Conv.</th><th>VGV ativo*</th><th>Ticket*</th><th>Contr. canc.</th><th>Taxa canc.</th></tr></thead><tbody>${groups.map(([k,a])=>{const m=metrics(a);return `<tr><td>${esc(k)}</td><td>${num(a.n)}</td><td>${num(a.buyers)}</td><td><b>${pct(a.buyers,a.n)}</b></td><td>${money(a.activeVgv)}</td><td>${money(m.ticket)}</td><td>${num(a.cancelContracts)}</td><td><b>${pct(a.cancelContracts,a.contracts)}</b></td></tr>`}).join('')}</tbody></table></div><div class="cpMini">*Quando a fonte não traz VGV ativo separado, o TARGET X estima proporcionalmente pelos contratos ativos/cancelados da linha.</div>`}

  function profGroups(list,limit=15){const m={};list.forEach(r=>{[r.p1,r.p2].map(x=>String(x||'').trim()).filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i).forEach(p=>{m[p]||(m[p]=baseAgg());addAgg(m[p],r)})});return Object.entries(m).sort((a,b)=>b[1].n-a[1].n).slice(0,limit)}
  function topValue(list,key){const m={};list.forEach(r=>{const v=String(r[key]||'').trim();if(v&&v!=='NÃO INFORMADO')m[v]=(m[v]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'}
  function topProf(list){const m={};list.forEach(r=>[r.p1,r.p2].forEach(v=>{v=String(v||'').trim();if(v)m[v]=(m[v]||0)+1}));return Object.entries(m).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'}
  function combinedKey(r){return [incomeBand(r.income),ageBand(r.ageAvg),r.rel||'NÃO INFORMADO',r.home||'NÃO INFORMADO'].join(' • ')}
  function combinedProfiles(list){return grouped(list,combinedKey,999)}
  function buyerProfile(list){const g=combinedProfiles(list).filter(([,a])=>a.n>=8&&a.activeContracts>=3);return g.sort((x,y)=>y[1].activeContracts-x[1].activeContracts||metrics(y[1]).conv-metrics(x[1]).conv)[0]||null}
  function riskProfile(list){const g=combinedProfiles(list).filter(([,a])=>a.n>=8&&a.contracts>=5&&a.cancelContracts>=3);return g.sort((x,y)=>metrics(y[1]).cancelContract-metrics(x[1]).cancelContract||y[1].cancelContracts-x[1].cancelContracts)[0]||null}

  function comparisonCard(title,list,kind){const a=aggregate(list),m=metrics(a),incs=list.map(r=>r.income).filter(Boolean),ages=list.map(r=>r.ageAvg).filter(Boolean),homeKnown=list.filter(r=>r.home!=='NÃO INFORMADO'),own=homeKnown.filter(r=>r.home==='CASA PRÓPRIA').length;return `<div class="card"><span class="cpBadge ${kind==='cancel'?'red':''}">${esc(kind==='all'?'BASE':kind==='buyer'?'COMPRA':'CANCELAMENTO')}</span><div class="cpCompareTitle">${esc(title)}</div><div class="cpCompareRows"><div><span>Casais</span><b>${num(a.n)}</b></div><div><span>Renda mediana</span><b>${money(median(incs))}</b></div><div><span>Idade média</span><b>${ages.length?avg(ages).toFixed(1)+' anos':'—'}</b></div><div><span>Casa própria</span><b>${pct(own,homeKnown.length)}</b></div><div><span>VGV ativo*</span><b>${money(a.activeVgv)}</b></div><div><span>Ticket*</span><b>${money(m.ticket)}</b></div><div><span>Taxa canc. contratos</span><b>${pct(a.cancelContracts,a.contracts)}</b></div></div></div>`}

  function qualityItem(label,known,total){const p=total?known/total:0;return `<div class="insight"><b>${label}</b><div style="font-size:20px;font-weight:1000;margin-top:5px">${pct(known,total)}</div><div class="tiny">${num(known)} de ${num(total)} casais</div><div class="progress ${p<.6?'amber':''}"><i style="width:${Math.min(100,p*100)}%"></i></div></div>`}

  function render(){
    ensurePage();const all=rows(),md=metadata();
    if(!all.length){$('cpNoData').style.display='block';$('cpBody').style.display='none';return}
    $('cpNoData').style.display='none';$('cpBody').style.display='block';
    const through=md?.through||'',from=md?.from||'';$('cpDataStatus').textContent=`Base detalhada até ${through?through.split('-').reverse().join('/'):'—'}`;
    $('cpBaseWarning').innerHTML=`<b>Base do Perfil Casais:</b> ${esc(md?.source||'base detalhada')} • ${num(md?.rows||all.length)} casais • ${from?from.split('-').reverse().join('/'):'—'} até ${through?through.split('-').reverse().join('/'):'—'}. O Dashboard geral pode ter uma data mais recente; este relatório usa somente registros com informações detalhadas de perfil.`;

    const p=$('cpPeriod');if(p&&p.options.length===1)[...new Set(all.map(r=>Number(r.date.slice(5,7))))].filter(Boolean).sort((a,b)=>a-b).forEach(m=>p.insertAdjacentHTML('beforeend',`<option value="${m}">${MONTHS[m]} 2026</option>`));
    let list=[...all];const pv=p?.value||'all',scope=$('cpScope')?.value||'all',qf=$('cpQual')?.value||'all';if(pv!=='all')list=list.filter(r=>Number(r.date.slice(5,7))===Number(pv));if(scope==='buyers')list=list.filter(r=>r.buyer);if(scope==='cancelled')list=list.filter(r=>r.cancelled);if(qf!=='all')list=list.filter(r=>r.qual===qf);

    const a=aggregate(list),m=metrics(a),buyers=list.filter(r=>r.buyer),cancels=list.filter(r=>r.cancelled),incs=list.map(r=>r.income).filter(Boolean),bInc=buyers.map(r=>r.income).filter(Boolean),cInc=cancels.map(r=>r.income).filter(Boolean),ages=list.map(r=>r.ageAvg).filter(Boolean),homeKnown=list.filter(r=>r.home!=='NÃO INFORMADO'),own=homeKnown.filter(r=>r.home==='CASA PRÓPRIA').length;
    $('cpRange').textContent=`${num(list.length)} casais no filtro`;
    $('cpStats').innerHTML=[['Casais atendidos',num(a.n),`${num(a.contractCouples)} com contrato`],['Compradores',num(a.buyers),`Conversão ${pct(a.buyers,a.n)}`],['Contratos ativos',num(a.activeContracts),`VGV ativo* ${money(a.activeVgv)}`],['Contratos cancelados',num(a.cancelContracts),`Taxa ${pct(a.cancelContracts,a.contracts)}`],['Casais c/ cancelamento',num(a.cancelCouples),`${pct(a.cancelCouples,a.contractCouples)} dos casais com contrato`],['Ticket ativo*',money(m.ticket),`${money(m.vgvPerCouple)} VGV/casal`],['Renda média',money(avg(incs)),`Mediana ${money(median(incs))}`],['Renda compradores',money(avg(bInc)),`Mediana ${money(median(bInc))}`],['Renda cancelados',money(avg(cInc)),`Mediana ${money(median(cInc))}`],['Casa própria',pct(own,homeKnown.length),`${num(own)} de ${num(homeKnown.length)}`],['Idade média',ages.length?avg(ages).toFixed(1)+' anos':'—',`${num(ages.length)} casais com idade`]].map(([l,v,s])=>`<div class="card stat"><span class="label">${l}</span><b>${v}</b><small>${s}</small></div>`).join('');

    $('cpCompare').innerHTML=comparisonCard('Todos os casais',list,'all')+comparisonCard('Compradores',buyers,'buyer')+comparisonCard('Com cancelamento',cancels,'cancel');

    const bp=buyerProfile(list);if(bp){const [key,ba]=bp,bm=metrics(ba),sample=list.filter(r=>combinedKey(r)===key),bpCar=topValue(sample.filter(r=>r.buyer),'car'),bpProf=topProf(sample.filter(r=>r.buyer));$('cpBuyerHeadline').textContent=key;$('cpBuyerTags').innerHTML=`<span class="cpTag">${num(ba.n)} atendidos</span><span class="cpTag">${num(ba.activeContracts)} contratos ativos</span><span class="cpTag">Conv. ${pct(ba.buyers,ba.n)}</span><span class="cpTag">VGV ${money(ba.activeVgv)}</span>`;$('cpBuyerInsights').innerHTML=`<div class="insight"><b>Volume ativo</b>${num(ba.activeContracts)} contratos • ${money(ba.activeVgv)} VGV*</div><div class="insight"><b>Ticket</b>${money(bm.ticket)}</div><div class="insight"><b>Carro mais comum</b>${esc(bpCar)}</div><div class="insight"><b>Profissão mais comum</b>${esc(bpProf)}</div>`}else{$('cpBuyerHeadline').textContent='Amostra insuficiente';$('cpBuyerTags').innerHTML='';$('cpBuyerInsights').innerHTML='<div class="insight">Não há grupo combinado com volume mínimo suficiente neste filtro.</div>'}

    const rp=riskProfile(list);if(rp){const [key,ra]=rp,rm=metrics(ra),sample=list.filter(r=>combinedKey(r)===key&&r.cancelled),rpCar=topValue(sample,'car'),rpProf=topProf(sample);$('cpCancelHeadline').textContent=key;$('cpCancelTags').innerHTML=`<span class="cpTag">${num(ra.n)} atendidos</span><span class="cpTag">${num(ra.cancelContracts)} contratos cancelados</span><span class="cpTag">Risco ${pct(ra.cancelContracts,ra.contracts)}</span>`;$('cpCancelInsights').innerHTML=`<div class="insight"><b>Taxa de cancelamento por contrato</b><span class="red">${pct(ra.cancelContracts,ra.contracts)}</span> • ${num(ra.cancelContracts)}/${num(ra.contracts)}</div><div class="insight"><b>Casais com cancelamento</b>${num(ra.cancelCouples)} de ${num(ra.contractCouples)} com contrato</div><div class="insight"><b>Carro mais comum</b>${esc(rpCar)}</div><div class="insight"><b>Profissão mais comum</b>${esc(rpProf)}</div>`}else{$('cpCancelHeadline').textContent='Amostra insuficiente';$('cpCancelTags').innerHTML='';$('cpCancelInsights').innerHTML='<div class="insight">Não há grupo combinado com pelo menos 8 atendimentos, 5 contratos e 3 cancelamentos neste filtro.</div>'}

    const incomeOrder=['Até R$ 9,9 mil','R$ 10–14,9 mil','R$ 15–19,9 mil','R$ 20–29,9 mil','R$ 30–49,9 mil','R$ 50 mil+','Não informado'],im=Object.fromEntries(grouped(list,r=>incomeBand(r.income),99));$('cpIncome').innerHTML=table(incomeOrder.filter(k=>im[k]).map(k=>[k,im[k]]),'Faixa de renda');
    const ageOrder=['18–25','26–35','36–45','46–55','56+','Não informado'],am=Object.fromEntries(grouped(list,r=>ageBand(r.ageAvg),99));$('cpAge').innerHTML=table(ageOrder.filter(k=>am[k]).map(k=>[k,am[k]]),'Faixa etária');
    $('cpHome').innerHTML=table(grouped(list,r=>r.home,8),'Residência');$('cpRelationship').innerHTML=table(grouped(list,r=>r.rel,10),'Relacionamento');$('cpProfessions').innerHTML=table(profGroups(list,15),'Profissão');
    $('cpCars').innerHTML=`<div class="label" style="margin-bottom:7px">Modelo</div>${table(grouped(list,r=>r.car||'NÃO INFORMADO',12),'Carro')}<div class="label" style="margin:14px 0 7px">Ano do carro</div>${table(grouped(list,r=>carYearBand(r.carYear),8),'Ano')}`;
    $('cpCities').innerHTML=table(grouped(list,r=>r.city||'NÃO INFORMADO',15),'Cidade');

    $('cpQuality').innerHTML=qualityItem('Renda',list.filter(r=>r.income>0).length,list.length)+qualityItem('Idade',list.filter(r=>r.ageAvg>0).length,list.length)+qualityItem('Carro',list.filter(r=>r.car).length,list.length)+qualityItem('Residência',list.filter(r=>r.home!=='NÃO INFORMADO').length,list.length)+qualityItem('Relacionamento',list.filter(r=>r.rel!=='NÃO INFORMADO').length,list.length)+qualityItem('Profissão',list.filter(r=>r.p1||r.p2).length,list.length)+qualityItem('Cidade',list.filter(r=>r.city).length,list.length)+qualityItem('Status contrato',list.filter(r=>r.contractCount>0).length,list.length);
  }

  function init(){ensurePage();hookUpload();loadAutomaticBase();setTimeout(hookUpload,500);setTimeout(hookUpload,1400)}
  document.addEventListener('click',e=>{const t=e.target.closest?.('.tab[data-page="clientprofile"]');if(t){e.preventDefault();openProfile()}},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
