// TARGET X — proteção da base oficial consolidada até 07/09/2026
// 06/09 e 07/09 já fazem parte de hist-2026.js. Este módulo legado agora apenas
// elimina lançamentos antigos duplicados e restaura as metas oficiais.
(function(){
  const cutoff=String(window.DATA_META?.through||'0000-00-00');
  const nextDay=(s)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  try{
    if(typeof launches!=='undefined'){
      launches=launches.filter(x=>!x?.date||String(x.date)>cutoff);
      if(typeof saveState==='function')saveState();
    }
    if(typeof METAS==='object'){
      METAS.couples=370;
      METAS.sales=101;
      METAS.vgv=8500000;
    }
    const metaCards=document.querySelectorAll('#dashboard .hero .card');
    if(metaCards[1]){
      const line=metaCards[1].querySelector('b');
      if(line)line.textContent='101 vendas • 370 casais';
    }
    const qd=document.getElementById('quickDate');
    const qb=document.getElementById('quickSave');
    const firstAllowed=nextDay(cutoff);
    if(qd){
      qd.min=firstAllowed;
      if(!qd.value||qd.value<=cutoff)qd.value=firstAllowed;
    }
    if(qb&&typeof qb.onclick==='function'&&!qb.dataset.baseGuard){
      const old=qb.onclick;
      qb.dataset.baseGuard='1';
      qb.onclick=function(e){
        if(qd&&qd.value<=cutoff)return alert(`A base oficial já contém dados até ${cutoff.split('-').reverse().join('/')}. Use uma data posterior.`);
        return old.call(this,e);
      };
    }
    setTimeout(()=>{
      try{
        if(typeof renderDashboard==='function')renderDashboard();
        if(typeof renderRank==='function')renderRank();
        if(typeof renderSeptember==='function')renderSeptember();
        if(typeof renderProfile==='function')renderProfile();
        if(typeof renderTeams==='function')renderTeams();
        if(typeof renderLaunches==='function')renderLaunches();
        if(typeof window.renderCaptain==='function')window.renderCaptain();
      }catch(e){console.warn('TARGET X base guard:',e);}
    },0);
  }catch(e){console.warn('TARGET X base guard:',e);}
})();
