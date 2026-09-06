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

// ---------------- RANKING ANUAL + MENSAL ----------------
const rankPage = $('rank');
const rankFilters = rankPage ? rankPage.querySelector('.filters') : null;
if (rankFilters && !$('rankPeriod')) {
  const periodWrap = document.createElement('div');
  periodWrap.className = 'card';
  periodWrap.style.marginBottom = '10px';
  periodWrap.innerHTML = `<div class="label" style="margin-bottom:7px">Período do ranking</div>
    <select id="rankPeriod" style="width:100%">
      <option value="year">Ano 2026</option>
      <option value="1">Janeiro 2026</option>
      <option value="2">Fevereiro 2026</option>
      <option value="3">Março 2026</option>
      <option value="4">Abril 2026</option>
      <option value="5">Maio 2026</option>
      <option value="6">Junho 2026</option>
      <option value="7">Julho 2026</option>
      <option value="8">Agosto 2026</option>
      <option value="9">Setembro 2026</option>
    </select>`;
  rankFilters.parentNode.insertBefore(periodWrap, rankFilters);
}

function txRankPerson(name){
  const period = $('rankPeriod') ? $('rankPeriod').value : 'year';
  const base = effectivePerson(name);
  if (period === 'year') return base;
  const m = Number(period);
  const metrics = personMonth(name,m);
  return {...base,...metrics,name:base.name,active:base.active,group:base.group,role:base.role};
}

function txRankLabel(){
  const period = $('rankPeriod') ? $('rankPeriod').value : 'year';
  if (period === 'year') return 'Ranking Geral 2026';
  return `Ranking ${MONTH_NAMES[Number(period)]} 2026`;
}

filteredRank = function(){
  let arr=allPeople().map(txRankPerson),q=$('rankSearch').value.trim().toUpperCase(),st=$('rankStatus').value,k=$('rankMetric').value;
  if(q)arr=arr.filter(x=>x.name.includes(q));
  if(st==='active')arr=arr.filter(x=>x.active);
  if(st==='inactive')arr=arr.filter(x=>!x.active);
  arr.sort((x,y)=>k==='conversion'?(y.sales/(convBase(y)||1))-(x.sales/(convBase(x)||1)):(y[k]||0)-(x[k]||0));
  return arr;
};

renderRank = function(){
  const a=filteredRank(),tot=a.reduce((z,x)=>plus(z,x),blank());
  const title = rankPage ? rankPage.querySelector('.section h2') : null;
  if(title) title.textContent = txRankLabel();
  $('rankSummary').innerHTML=[
    stat('Profissionais',num(a.length)),
    stat('Casais',num(tot.couples)),
    stat('Vendas',num(tot.sales)),
    stat('VGV Ativo',money(tot.vgv)),
    stat('VGV Geral',money(tot.vgv_general)),
    stat('NoTour',num(tot.notour)),
    stat('Brindes',money(tot.gift),`Custo/casal ${money(tot.couples?tot.gift/tot.couples:0,2)}`)
  ].join('');
  $('rankBody').innerHTML=a.map((x,i)=>`<tr>
    <td><b>${i+1}º</b></td>
    <td><span class="nameLink" data-name="${x.name.replace(/"/g,'&quot;')}">${x.name}</span><div class="tiny">${x.group||''}</div></td>
    <td><span class="pill ${x.active?'':'off'}">${x.active?'ATIVO':'INATIVO'}</span></td>
    <td>${num(x.couples)}</td><td>${num(x.q)}</td><td>${num(x.nq)}</td><td>${num(x.sales)}</td><td>${conv(x)}</td>
    <td>${money(x.vgv_general)}</td><td><b>${money(x.vgv)}</b></td><td>${money(x.gift)}</td><td>${money(x.couples?x.gift/x.couples:0,2)}</td><td>${num(x.notour)}</td><td>${num(x.cancelled)}</td>
  </tr>`).join('');
  document.querySelectorAll('#rank .nameLink').forEach(el=>el.onclick=()=>{profilePerson.value=el.dataset.name;show('profile')});
};

if ($('rankPeriod')) $('rankPeriod').onchange = renderRank;
$('rankMetric').onchange = renderRank;
$('rankStatus').onchange = renderRank;
$('rankSearch').oninput = renderRank;

// Corrige também a meta textual que já está renderizada no HTML.
const metaCards = document.querySelectorAll('#dashboard .hero .card');
if (metaCards[1]) {
  const line = metaCards[1].querySelector('b');
  if (line) line.textContent = '100 vendas • 400 casais';
}

renderDashboard();
renderSeptember();
renderProfile();
renderRank();
