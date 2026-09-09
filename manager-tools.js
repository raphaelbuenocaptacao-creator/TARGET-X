// TARGET X v6 — gestão limpa: equipes + Capitão da Semana, sem lançamentos manuais
(function(){
  const $=id=>document.getElementById(id);
  const TEAM_STORE='tx_team_overrides_v60';
  let overrides={};try{overrides=JSON.parse(localStorage.getItem(TEAM_STORE)||'{}')}catch{}
  const save=()=>localStorage.setItem(TEAM_STORE,JSON.stringify(overrides));
  const TEAMS=['CLACION','FELIPE','A DEFINIR'];

  // Pessoas que permanecem na base histórica para preservar os totais anuais,
  // mas não devem aparecer como profissionais no Perfil, Ranking, Equipes,
  // Inativos ou Capitão da Semana.
  const HIDDEN_PROFESSIONALS=new Set([
    'RAPHAEL BUENO DA SILVA',
    'RAFAEL HENRIQUE MEDEIROS',
    'MATEUS SANTOS SANTA ROSA'
  ]);
  const baseAllPeople=allPeople;
  allPeople=function(){return baseAllPeople().filter(n=>!HIDDEN_PROFESSIONALS.has(n))};

  const baseEffective=effectivePerson;
  effectivePerson=function(name){const p=baseEffective(name);if(overrides[name])p.group=overrides[name];return p};
  const teamOptions=g=>TEAMS.map(x=>`<option value="${x}" ${x===(g||'A DEFINIR')?'selected':''}>${x}</option>`).join('');

  // Recria o seletor porque o app.js monta a lista antes deste módulo carregar.
  setupSelects();

  const baseRenderTeams=renderTeams;
  renderTeams=function(){
    const root=$('teamGrid');if(!root)return;
    root.innerHTML=TEAMS.map(g=>{
      const members=allPeople().filter(n=>effectivePerson(n).active&&(effectivePerson(n).group||'A DEFINIR')===g);
      const a=members.reduce((z,n)=>plus(z,personMonth(n,9)),blank());
      return `<div class="card"><div class="label">Equipe</div><h2>${g}</h2><div class="stats" style="grid-template-columns:repeat(3,1fr)">${stat('Casais',num(a.couples))}${stat('Vendas',num(a.sales))}${stat('VGV',money(a.vgv))}</div><div style="margin-top:10px">${members.map(n=>{const s=personMonth(n,9),p=effectivePerson(n);return `<div class="member" style="display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:8px;align-items:center"><div><b>${esc(n)}</b><span class="tiny">${num(s.couples)} casais • ${num(s.sales)} vendas • ${money(s.vgv)}</span></div><select class="txTeam" data-name="${encodeURIComponent(n)}">${teamOptions(p.group)}</select></div>`}).join('')||'<div class="empty">Nenhum profissional.</div>'}</div></div>`;
    }).join('');
    document.querySelectorAll('.txTeam').forEach(s=>s.onchange=()=>{const n=decodeURIComponent(s.dataset.name);overrides[n]=s.value;save();renderTeams();renderRank();if($('profilePerson')?.value===n)renderProfile()});
  };

  const baseRenderProfile=renderProfile;
  renderProfile=function(){baseRenderProfile();const n=$('profilePerson')?.value,p=effectivePerson(n),role=$('profileRole');if(!n||!role)return;role.innerHTML=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span>${esc(p.role||'CAPTADOR')} • ${p.active?'ATIVO':'INATIVO'}</span><span class="tiny">Equipe:</span><select id="profileGroup">${teamOptions(p.group)}</select></div>`;$('profileGroup').onchange=()=>{overrides[n]=$('profileGroup').value;save();renderProfile();renderRank();renderTeams()}};

  let WEEK_HISTORY={};
  const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const dlocal=s=>new Date(s+'T12:00:00');
  const weekStartFor=s=>{const d=dlocal(s),off=(d.getDay()+6)%7;d.setDate(d.getDate()-off);return iso(d)};
  const weekEnd=s=>{const d=dlocal(s);d.setDate(d.getDate()+6);return iso(d)};
  const br=s=>String(s||'').split('-').reverse().join('/');
  function availableWeeks(){const set=new Set(Object.keys(WEEK_HISTORY));const rows=window.TX?.getRows?.()||[];rows.forEach(r=>r.date&&set.add(weekStartFor(r.date)));const through=window.TX?.getMeta?.().through||DATA_META.through;if(!set.size&&through)set.add(weekStartFor(through));return [...set].sort()}
  function rankingFromRows(start){const end=weekEnd(start),rows=(window.TX?.getRows?.()||[]).filter(r=>r.date>=start&&r.date<=end),m={};rows.forEach(r=>{const n=r.person;if(!n)return;m[n]||(m[n]={name:n,couples:0,sales:0});m[n].couples+=Number(r.couples)||0;m[n].sales+=Number(r.sales)||0});return Object.values(m)}
  function rankingFor(start){const fresh=rankingFromRows(start);const src=fresh.length?fresh:(WEEK_HISTORY[start]||[]).map(x=>({name:x[0],couples:Number(x[1])||0,sales:Number(x[2])||0}));return src.filter(x=>!HIDDEN_PROFESSIONALS.has(x.name)&&effectivePerson(x.name).active).sort((a,b)=>b.couples-a.couples||b.sales-a.sales||a.name.localeCompare(b.name))}
  function fillWeeks(prefer){const sel=$('weekSelect');if(!sel)return;const weeks=availableWeeks(),keep=prefer||sel.value||weeks.at(-1);sel.innerHTML=weeks.map(s=>`<option value="${s}">${br(s)} → ${br(weekEnd(s))}</option>`).join('');sel.value=weeks.includes(keep)?keep:weeks.at(-1)||''}
  window.renderCaptain=function(){const sel=$('weekSelect');if(!sel)return;if(!sel.options.length)fillWeeks();const start=sel.value;if(!start)return;const rr=rankingFor(start),top=rr[0];$('weekRange').textContent=`${br(start)} → ${br(weekEnd(start))} • segunda a domingo`;$('captainName').textContent=top?.name||'—';$('captainResult').textContent=top?`${num(top.couples)} casais • ${num(top.sales)} vendas`:'Sem dados';$('weeklyTotal').textContent=`${num(rr.reduce((s,x)=>s+x.couples,0))} casais na semana`;$('weeklyBody').innerHTML=rr.length?rr.map((x,i)=>`<tr><td><b>${i+1}º</b></td><td>${esc(x.name)}</td><td>${esc(effectivePerson(x.name).group||'A DEFINIR')}</td><td><b>${num(x.couples)}</b></td><td>${num(x.sales)}</td></tr>`).join(''):'<tr><td colspan="5" class="empty">Sem dados para esta semana.</td></tr>'};
  if($('weekSelect'))$('weekSelect').onchange=()=>window.renderCaptain();
  fetch('weekly-history.json?v=60',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(j=>{WEEK_HISTORY=j||{};fillWeeks();window.renderCaptain()}).catch(()=>{fillWeeks();window.renderCaptain()});
  window.addEventListener('targetx:data-updated',()=>{setupSelects();fillWeeks($('weekSelect')?.value);renderTeams();renderRank();window.renderCaptain()});
  renderTeams();renderRank();window.renderCaptain();
})();