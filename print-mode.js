// TARGET X — modo compacto para print do ranking semanal
(function(){
  const css=document.createElement('style');
  css.textContent=`
  #txPrintBtn{margin-left:auto;background:var(--green);color:#051006;border-color:var(--green)}
  #txPrintOverlay{display:none;position:fixed;inset:0;z-index:9999;background:#020604;overflow:auto;padding:10px}
  #txPrintOverlay.open{display:block}
  .txPrintCard{max-width:760px;margin:0 auto;background:linear-gradient(180deg,#0b1b13,#07100c);border:1px solid #183b2b;border-radius:18px;padding:14px}
  .txPrintTop{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;border-bottom:1px solid #183b2b;padding-bottom:10px;margin-bottom:10px}
  .txPrintBrand{font-size:11px;letter-spacing:1.4px;color:#85aa98}.txPrintTitle{font-size:23px;font-weight:1000;margin:2px 0}.txPrintWeek{font-size:12px;color:#b8ff2c;font-weight:900}
  .txPrintCaptain{text-align:right}.txPrintCaptain small{display:block;color:#85aa98;text-transform:uppercase;font-size:8px;letter-spacing:1px}.txPrintCaptain b{display:block;color:#b8ff2c;font-size:13px;max-width:250px}.txPrintCaptain span{font-size:11px;color:#f4fbf6}
  .txPrintSummary{display:flex;justify-content:space-between;align-items:center;margin:8px 0 10px;font-size:11px;color:#85aa98}.txPrintSummary b{font-size:14px;color:#f4fbf6}
  .txPrintGrid{display:grid;grid-template-columns:1fr 1fr;gap:5px 8px}
  .txPrintRow{display:grid;grid-template-columns:28px minmax(0,1fr) 34px;align-items:center;gap:5px;border:1px solid #183b2b;border-radius:9px;padding:6px 7px;min-height:34px;background:#07120d}
  .txPrintPos{font-weight:1000;color:#85aa98;font-size:11px}.txPrintName{font-size:10px;font-weight:900;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.txPrintCouples{font-size:15px;font-weight:1000;text-align:right;color:#b8ff2c}
  .txPrintFoot{margin-top:10px;padding-top:8px;border-top:1px solid #183b2b;display:flex;justify-content:space-between;font-size:9px;color:#85aa98}
  .txPrintActions{max-width:760px;margin:8px auto;display:flex;gap:8px}.txPrintActions button{flex:1}
  @media(max-width:480px){#txPrintOverlay{padding:5px}.txPrintCard{padding:9px;border-radius:12px}.txPrintTitle{font-size:19px}.txPrintTop{margin-bottom:6px;padding-bottom:7px}.txPrintGrid{gap:3px 5px}.txPrintRow{padding:4px 5px;min-height:29px;grid-template-columns:24px minmax(0,1fr) 28px}.txPrintName{font-size:8.8px}.txPrintCouples{font-size:13px}.txPrintCaptain b{font-size:10px;max-width:155px}.txPrintCaptain span{font-size:9px}.txPrintSummary{margin:5px 0 7px}}
  `;
  document.head.appendChild(css);

  function ensureButton(){
    const section=document.querySelector('#captain .section');
    if(!section||document.getElementById('txPrintBtn'))return;
    const btn=document.createElement('button');
    btn.id='txPrintBtn';btn.textContent='📸 Modo Print';
    section.appendChild(btn);
    btn.onclick=openPrint;
  }

  function readRanking(){
    return [...document.querySelectorAll('#weeklyBody tr')].map(tr=>{
      const td=tr.querySelectorAll('td');
      if(td.length<5)return null;
      return {pos:td[0].innerText.trim(),name:td[1].innerText.trim(),couples:td[3].innerText.trim()};
    }).filter(Boolean);
  }

  function openPrint(){
    const rows=readRanking();
    if(!rows.length){alert('Não há ranking nesta semana.');return;}
    let ov=document.getElementById('txPrintOverlay');
    if(!ov){ov=document.createElement('div');ov.id='txPrintOverlay';document.body.appendChild(ov);}
    const week=(document.getElementById('weekRange')?.innerText||'').replace(' • segunda a domingo','');
    const captain=document.getElementById('captainName')?.innerText||'—';
    const result=document.getElementById('captainResult')?.innerText||'';
    const total=document.getElementById('weeklyTotal')?.innerText||'';
    ov.innerHTML=`<div class="txPrintCard">
      <div class="txPrintTop"><div><div class="txPrintBrand">TARGET X • PERFORMANCE COMMAND</div><div class="txPrintTitle">RANKING DA SEMANA</div><div class="txPrintWeek">${week}</div></div><div class="txPrintCaptain"><small>Capitão/Capitã</small><b>${captain}</b><span>${result}</span></div></div>
      <div class="txPrintSummary"><span>SEGUNDA → DOMINGO</span><b>${total}</b></div>
      <div class="txPrintGrid">${rows.map(r=>`<div class="txPrintRow"><span class="txPrintPos">${r.pos}</span><span class="txPrintName">${r.name}</span><span class="txPrintCouples">${r.couples}</span></div>`).join('')}</div>
      <div class="txPrintFoot"><span>R$ 200 VOUCHER • LIVRE NA SEMANA</span><span>TARGET X</span></div>
    </div><div class="txPrintActions"><button id="txClosePrint">← Voltar</button><button class="primary" id="txFullscreenPrint">Tela cheia</button></div>`;
    ov.classList.add('open');
    document.getElementById('txClosePrint').onclick=()=>ov.classList.remove('open');
    document.getElementById('txFullscreenPrint').onclick=()=>{document.documentElement.requestFullscreen?.();document.getElementById('txFullscreenPrint').style.display='none';};
    window.scrollTo(0,0);
  }

  const oldRender=window.renderCaptain;
  if(typeof oldRender==='function')window.renderCaptain=function(){oldRender();setTimeout(ensureButton,0);};
  document.addEventListener('click',e=>{if(e.target?.id==='captainTab')setTimeout(ensureButton,0)});
  setTimeout(ensureButton,500);
})();