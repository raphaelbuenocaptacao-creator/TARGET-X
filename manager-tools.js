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

// Corrige também a meta textual que já está renderizada no HTML.
const metaCards = document.querySelectorAll('#dashboard .hero .card');
if (metaCards[1]) {
  const line = metaCards[1].querySelector('b');
  if (line) line.textContent = '100 vendas • 400 casais';
}

renderDashboard();
renderSeptember();
renderProfile();
