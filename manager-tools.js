// TARGET X — ferramentas de gestão complementar
// Meta oficial de Setembro/2026
METAS.couples = 400;
METAS.sales = 100;
METAS.vgv = 8500000;

const TX_TEAMS = ['FELIPE','CLACION','A DEFINIR'];
let teamOverrides = JSON.parse(localStorage.getItem('tx_team_overrides_v42') || '{}');
function saveTeamOverrides(){ localStorage.setItem('tx_team_overrides_v42', JSON.stringify(teamOverrides)); }

// Faz a equipe escolhida pelo gestor valer em toda a interface.
const _effectivePerson = effectivePerson;
effectivePerson = function(name){
  const p = _effectivePerson(name);
  if (teamOverrides[name]) p.group = teamOverrides[name];
  return p;
};

function teamOptions(current){
  return TX_TEAMS.map(g=>`<option value="${g}" ${g===(current||'A DEFINIR')?'selected':''}>${g}</option>`).join('');
}

// Tela de equipes: permite definir ou trocar a equipe direto no card de cada profissional.
renderTeams = function(){
  const groups = TX_TEAMS;
  $('teamGrid').innerHTML = groups.map(g=>{
    const members = HIST.filter(x=>x.active).map(x=>effectivePerson(x.name)).filter(x=>(x.group||'A DEFINIR')===g);
    const agg = members.reduce((a,p)=>plus(a,personMonth(p.name,9)),blank());
    const memberHtml = members.length ? members.map(p=>{
      const s = personMonth(p.name,9);
      return `<div class="member" style="display:grid;grid-template-columns:minmax(0,1fr) 185px;gap:10px;align-items:center">
        <div>
          <b>${p.name}</b>
          <span class="tiny">${num(s.couples)} casais • ${num(s.sales)} vendas • ${money(s.vgv)}</span>
        </div>
        <div>
          <div class="tiny" style="margin-bottom:4px">Definir equipe</div>
          <select class="tx-team-picker" data-person="${encodeURIComponent(p.name)}" style="width:100%;padding:8px 10px">${teamOptions(p.group)}</select>
        </div>
      </div>`;
    }).join('') : '<div class="empty">Nenhum profissional nesta equipe.</div>';
    return `<div class="card"><div class="label">Equipe</div><h2>${g}</h2><div class="stats" style="grid-template-columns:repeat(3,1fr)">${stat('Casais',num(agg.couples))}${stat('Vendas',num(agg.sales))}${stat('VGV',money(agg.vgv))}</div><div style="margin-top:10px">${memberHtml}</div></div>`;
  }).join('');

  document.querySelectorAll('.tx-team-picker').forEach(sel=>{
    sel.onchange = ()=>{
      const name = decodeURIComponent(sel.dataset.person);
      teamOverrides[name] = sel.value;
      saveTeamOverrides();
      renderTeams();
      renderRank();
      if (profilePerson && profilePerson.value === name) renderProfile();
    };
  });
};

// Enriquece a ficha individual com seleção de equipe.
const _renderProfile = renderProfile;
renderProfile = function(){
  _renderProfile();
  const n = profilePerson.value || allPeople()[0];
  const p = effectivePerson(n);
  const role = $('profileRole');
  if (!role) return;
  role.innerHTML = `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span>${p.role||'CAPTADOR'} • ${p.active?'ATIVO':'INATIVO'}</span><span class="tiny">Equipe atual:</span><select id="profileGroup" style="padding:7px 10px">${teamOptions(p.group)}</select></div>`;
  const teamSelect = $('profileGroup');
  teamSelect.onchange = ()=>{
    teamOverrides[n] = teamSelect.value;
    saveTeamOverrides();
    renderProfile();
    renderRank();
    renderTeams();
  };
};
profilePerson.onchange = renderProfile;

// Adiciona filtro de mês no ranking (anual + ranking mensal).
function ensureRankMonthFilter(){
  const filters = document.querySelector('#rank .filters');
  if(!filters || document.getElementById('rankMonth')) return;
  filters.insertAdjacentHTML('beforeend', `<select id="rankMonth"><option value="0">Anual 2026</option>${MONTH_NAMES.slice(1).map((m,i)=>`<option value="${i+1}">${m}/26</option>`).join('')}</select>`);
  const monthSel = $('rankMonth');
  monthSel.value = '0';
  monthSel.onchange = ()=>{
    const title = document.querySelector('#rank .section h2');
    if(title){
      title.textContent = monthSel.value === '0' ? 'Ranking Geral 2026' : `Ranking ${MONTH_NAMES[Number(monthSel.value)]} 2026`;
    }
    renderRank();
  };
}

function rankPersonData(name, month){
  const person = effectivePerson(name);
  if(!month) return person;
  const monthly = personMonth(name, month);
  return {
    ...person,
    couples: monthly.couples || 0,
    q: monthly.q || 0,
    nq: monthly.nq || 0,
    sales: monthly.sales || 0,
    cancelled: monthly.cancelled || 0,
    vgv: monthly.vgv || 0,
    vgv_general: monthly.vgv_general || 0,
    gift: monthly.gift || 0,
    notour: monthly.notour || 0,
    attendances: monthly.attendances || 0,
  };
}

function selectedRankMonth(){
  const sel = $('rankMonth');
  return sel ? Number(sel.value || 0) : 0;
}

renderRank = function(){
  ensureRankMonthFilter();
  const month = selectedRankMonth();
  let arr = allPeople().map(name=>rankPersonData(name, month));
  const q = $('rankSearch').value.trim().toUpperCase();
  const st = $('rankStatus').value;
  const k = $('rankMetric').value;
  if(q) arr = arr.filter(x=>x.name.includes(q));
  if(st==='active') arr = arr.filter(x=>x.active);
  if(st==='inactive') arr = arr.filter(x=>!x.active);
  arr.sort((x,y)=>k==='conversion'?(y.sales/(convBase(y)||1))-(x.sales/(convBase(x)||1)):(y[k]||0)-(x[k]||0));

  const tot = arr.reduce((z,x)=>plus(z,x),blank());
  const monthLabel = month ? `${MONTH_NAMES[month]}/26` : 'Ano todo';
  $('rankSummary').innerHTML = [
    stat('Profissionais',num(arr.length),monthLabel),
    stat('Casais',num(tot.couples),`${num(tot.q)} Q • ${num(tot.nq)} NQ`),
    stat('Vendas',num(tot.sales),`Conversão ${conv(tot)}`),
    stat('VGV Ativo',money(tot.vgv)),
    stat('VGV Geral',money(tot.vgv_general))
  ].join('');

  $('rankBody').innerHTML = arr.map((x,i)=>`<tr><td><b>${i+1}º</b></td><td><span class="nameLink" data-name="${x.name.replace(/"/g,'&quot;')}">${x.name}</span><div class="tiny">${x.group||''}</div></td><td><span class="pill ${x.active?'':'off'}">${x.active?'ATIVO':'INATIVO'}</span></td><td>${num(x.couples)}</td><td>${num(x.q)}</td><td>${num(x.nq)}</td><td>${num(x.sales)}</td><td>${conv(x)}</td><td>${money(x.vgv_general)}</td><td><b>${money(x.vgv)}</b></td><td>${money(x.gift)}</td><td>${money(x.couples?x.gift/x.couples:0,2)}</td><td>${num(x.notour)}</td><td>${num(x.cancelled)}</td></tr>`).join('') || `<tr><td colspan="14" class="empty">Nenhum resultado encontrado para este filtro.</td></tr>`;
  document.querySelectorAll('.nameLink').forEach(el=>el.onclick=()=>{profilePerson.value=el.dataset.name;show('profile')});
};

$('rankMetric').onchange = $('rankStatus').onchange = $('rankSearch').oninput = renderRank;

const metaCards = document.querySelectorAll('#dashboard .hero .card');
if (metaCards[1]) {
  const line = metaCards[1].querySelector('b');
  if (line) line.textContent = '100 vendas • 400 casais';
}

ensureRankMonthFilter();
renderDashboard();
renderSeptember();
renderProfile();
renderRank();

// ---------------- ATIVOS + CAPITÃO DA SEMANA ----------------
(function(){
  const renan = HIST.find(x=>x.name==='RENAN MARCONDES JOHAS');
  if(renan){renan.active=true;renan.group='FELIPE';}

  const style=document.createElement('style');
  style.textContent=`.captainHero{display:grid;grid-template-columns:1.35fr .65fr;gap:11px}.captainName{font-size:clamp(30px,6vw,58px);line-height:1;font-weight:1000;letter-spacing:-2px;margin:10px 0;color:var(--green)}.quick3{display:grid;grid-template-columns:160px minmax(220px,1fr) 140px;gap:8px}.weekNav{display:flex;gap:7px;flex-wrap:wrap;align-items:center}.weekNav input{min-width:155px}@media(max-width:720px){.captainHero,.quick3{grid-template-columns:1fr}.captainName{font-size:36px}}`;
  document.head.appendChild(style);

  const nav=document.querySelector('.tabs');
  if(nav && !$('captainTab')){
    const b=document.createElement('button');
    b.className='tab';b.id='captainTab';b.dataset.page='captain';b.textContent='Capitão da Semana';
    const diaryTab=[...nav.querySelectorAll('.tab')].find(x=>x.dataset.page==='diary');
    nav.insertBefore(b,diaryTab||null);
    b.onclick=()=>{show('captain');renderCaptain();};
  }
  if(!$('captain')){
    const page=document.createElement('section');page.className='page';page.id='captain';
    page.innerHTML=`<div class="section"><div><h2>Capitão da Semana</h2><div class="meta">Sempre de segunda a domingo • maior número de casais</div></div></div>
    <div class="weekNav card"><button id="weekPrev">← Semana anterior</button><input id="weekAnchor" type="date"><button id="weekLatest" class="primary">Último resultado</button><button id="weekCurrent">Semana atual</button><button id="weekNext">Próxima semana →</button><span class="meta" id="weekRange"></span></div>
    <div class="captainHero" style="margin-top:11px"><div class="card"><div class="label" id="captainStatus">Líder da semana</div><div class="captainName" id="captainName">—</div><b id="captainResult">0 casais</b><div class="meta" style="margin-top:8px">Desempate por vendas.</div></div><div class="card"><div class="label">Premiação</div><b style="display:block;font-size:27px;margin:9px 0">R$ 200</b><div>Voucher</div><div class="green" style="font-weight:900;margin-top:9px">✓ Livre na semana</div></div></div>
    <div class="section"><div><h2>Lançamento rápido de casais</h2><div class="meta">Complete os casais do dia sem preencher os demais indicadores.</div></div></div>
    <div class="card"><div class="quick3"><input id="quickDate" type="date" min="2026-09-01"><select id="quickPerson"></select><input id="quickCouples" type="number" min="1" placeholder="Qtd. casais"></div><div class="actions"><button class="primary" id="quickSave">Adicionar casais</button></div><div class="tiny" style="margin-top:8px">Entra no ranking semanal e também atualiza mês, ano e ficha do profissional.</div></div>
    <div class="section"><h2>Ranking da semana</h2><span class="meta" id="weeklyTotal"></span></div><div class="card"><div class="tablewrap"><table class="table" style="min-width:650px"><thead><tr><th>#</th><th>Profissional</th><th>Equipe</th><th>Casais</th><th>Vendas</th></tr></thead><tbody id="weeklyBody"></tbody></table></div></div>
    <div class="section"><h2>Lançamentos rápidos da semana</h2></div><div class="card"><div class="tablewrap"><table class="table" style="min-width:650px"><thead><tr><th>Data</th><th>Profissional</th><th>Casais</th><th></th></tr></thead><tbody id="quickBody"></tbody></table></div></div>`;
    $('teams').parentNode.insertBefore(page,$('teams'));
  }

  function localDate(s){return s?new Date(s+'T12:00:00'):new Date();}
  function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function br(d){return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;}
  function weekBounds(anchor){const d=localDate(anchor),offset=(d.getDay()+6)%7;const start=new Date(d);start.setDate(d.getDate()-offset);const end=new Date(start);end.setDate(start.getDate()+6);return {start,end,startISO:iso(start),endISO:iso(end)};}
  function inWeek(x,w){return x.date>=w.startISO&&x.date<=w.endISO;}
  function weekEntries(w){return launches.filter(x=>x.date&&inWeek(x,w));}

  function latestDataDate(){
    let latest=DATA_META.through;
    launches.forEach(x=>{if(x.date&&x.date>latest)latest=x.date;});
    return latest;
  }

  function baseWeekRanking(w){
    const map={};
    const through=DATA_META.through;
    const throughDate=localDate(through);
    const sameWeek=through>=w.startISO&&through<=w.endISO;
    if(!sameWeek)return map;
    if(throughDate.getFullYear()===2026&&throughDate.getMonth()===8){
      HIST.forEach(p=>{
        const m=personMonth(p.name,9);
        if((m.couples||0)>0||(m.sales||0)>0)map[p.name]={name:p.name,couples:Number(m.couples)||0,sales:Number(m.sales)||0};
      });
    }
    return map;
  }

  function weeklyRanking(w){
    const map=baseWeekRanking(w);
    weekEntries(w).forEach(x=>{
      if(!x.person)return;
      map[x.person]||(map[x.person]={name:x.person,couples:0,sales:0});
      map[x.person].couples+=Number(x.couples)||0;
      map[x.person].sales+=Number(x.sales)||0;
    });
    return Object.values(map).filter(x=>x.couples>0||x.sales>0).map(x=>{const p=effectivePerson(x.name);return {...x,group:p.group||'A DEFINIR'};}).sort((a,b)=>b.couples-a.couples||b.sales-a.sales||a.name.localeCompare(b.name));
  }

  function refreshQuickPeople(){
    const current=$('quickPerson')?.value;
    $('quickPerson').innerHTML=HIST.filter(x=>x.active).map(x=>effectivePerson(x.name)).sort((a,b)=>a.name.localeCompare(b.name)).map(x=>`<option>${x.name}</option>`).join('');
    if(current&&[...$('quickPerson').options].some(o=>o.value===current))$('quickPerson').value=current;
  }
  function selectedWeek(){return weekBounds($('weekAnchor').value||latestDataDate());}

  window.renderCaptain=function(){
    if(!$('captain'))return;
    if(!$('weekAnchor').value)$('weekAnchor').value=latestDataDate();
    if(!$('quickDate').value)$('quickDate').value=latestDataDate();
    refreshQuickPeople();
    const w=selectedWeek(),rank=weeklyRanking(w),now=new Date(),closed=now>new Date(w.endISO+'T23:59:59');
    $('weekRange').textContent=`${br(w.start)} → ${br(w.end)} • segunda a domingo`;
    $('captainStatus').textContent=closed?'CAPITÃO/CAPITÃ DA SEMANA':'LÍDER PROVISÓRIO DA SEMANA';
    const leader=rank[0];
    $('captainName').textContent=leader?leader.name:'—';
    $('captainResult').textContent=leader?`${num(leader.couples)} casais • ${num(leader.sales)} vendas`:'Nenhum resultado disponível nesta semana';
    $('weeklyTotal').textContent=`${num(rank.reduce((a,x)=>a+x.couples,0))} casais no período`;
    $('weeklyBody').innerHTML=rank.length?rank.map((x,i)=>`<tr><td><b>${i+1}º</b></td><td><span class="nameLink" data-week-person="${x.name.replace(/"/g,'&quot;')}">${x.name}</span></td><td>${x.group}</td><td><b>${num(x.couples)}</b></td><td>${num(x.sales)}</td></tr>`).join(''):'<tr><td colspan="5" class="empty">Sem resultado disponível para esta semana.</td></tr>';
    document.querySelectorAll('[data-week-person]').forEach(el=>el.onclick=()=>{profilePerson.value=el.dataset.weekPerson;show('profile')});
    const quick=weekEntries(w).filter(x=>x.source==='quick-couples').sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
    $('quickBody').innerHTML=quick.length?quick.map(x=>`<tr><td>${x.date.split('-').reverse().join('/')}</td><td>${x.person}</td><td><b>${num(x.couples)}</b></td><td><button data-del-quick="${x.id}">Excluir</button></td></tr>`).join(''):'<tr><td colspan="4" class="empty">Nenhum lançamento rápido nesta semana.</td></tr>';
    document.querySelectorAll('[data-del-quick]').forEach(b=>b.onclick=()=>{launches=launches.filter(x=>x.id!==b.dataset.delQuick);saveState();renderCaptain();renderDashboard();renderRank();renderSeptember();renderLaunches();});
  };

  $('weekAnchor').onchange=renderCaptain;
  $('weekPrev').onclick=()=>{const w=selectedWeek(),d=new Date(w.start);d.setDate(d.getDate()-7);$('weekAnchor').value=iso(d);renderCaptain();};
  $('weekNext').onclick=()=>{const w=selectedWeek(),d=new Date(w.start);d.setDate(d.getDate()+7);$('weekAnchor').value=iso(d);renderCaptain();};
  $('weekLatest').onclick=()=>{$('weekAnchor').value=latestDataDate();renderCaptain();};
  $('weekCurrent').onclick=()=>{$('weekAnchor').value=iso(new Date());renderCaptain();};
  $('quickSave').onclick=()=>{const date=$('quickDate').value,person=$('quickPerson').value,couples=Number($('quickCouples').value)||0;if(!date||!person||couples<=0)return alert('Escolha a data, o profissional e informe a quantidade de casais.');launches.push({id:String(Date.now()),date,person,couples,sales:0,vgv:0,vgv_general:0,q:0,nq:0,notour:0,gift:0,cancelled:0,attendances:couples,source:'quick-couples'});saveState();$('quickCouples').value='';$('weekAnchor').value=date;renderCaptain();renderDashboard();renderRank();renderSeptember();renderLaunches();renderProfile();};

  setupSelects();renderRank();renderTeams();renderCaptain();
})();