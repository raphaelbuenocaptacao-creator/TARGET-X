// TARGET X — importação de planilha para atualização operacional
(function(){
  if(window.__txUploadImportLoaded)return;window.__txUploadImportLoaded=true;
  const css=document.createElement('style');
  css.textContent=`
  #txUploadBar{margin:10px 0 2px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border-color:#28533d}
  #txUploadBar .txUpTitle{font-weight:1000;font-size:13px}.txUpStatus{font-size:10px;color:var(--muted);margin-top:4px}
  #txUploadActions{display:flex;gap:7px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
  #txSheetFile{display:none}#txChooseSheet{background:#102b1f;border-color:#2a6248;color:#c9ffe1}#txImportSheet{background:var(--green);color:#061006;border-color:var(--green)}
  .txFileName{max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:10px;color:var(--muted)}
  @media(max-width:720px){#txUploadBar{grid-template-columns:1fr}#txUploadActions{justify-content:stretch}#txUploadActions button{flex:1}.txFileName{max-width:100%}}
  `;
  document.head.appendChild(css);

  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();}
  function n(v){if(typeof v==='number')return isFinite(v)?v:0;let s=String(v??'').trim();if(!s)return 0;s=s.replace(/R\$|\s/g,'');if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');else if(s.includes(','))s=s.replace(',','.');return Number(s)||0;}
  function ymd(v){
    if(!v)return '';
    if(typeof v==='number'&&window.XLSX?.SSF?.parse_date_code){const d=XLSX.SSF.parse_date_code(v);if(d)return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;}
    let s=String(v).trim();
    if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);
    const m=s.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);if(m)return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
    const d=new Date(s);if(!isNaN(d))return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return '';
  }
  function get(row,...names){const ks=Object.keys(row);for(const name of names){const target=norm(name),k=ks.find(k=>norm(k)===target);if(k!==undefined)return row[k];}return '';}
  const aliases={
    'JOSYENE FREITAS':'JOSYENE APARECIDA DE FREITAS','ANA CAROLINE':'ANA CAROLINE DA SILVA LOPES PEREIRA','ADRIANO MOREIRA':'EDSON ADRIANO PINTO MOREIRA','MARCIO ALFAIA':'MARCIO VINICIOS MARTINS ALFAIA','ANDRE CARRICO':'ANDRE LUIS CARRIÇO DOS SANTOS','JESSICA BARBOSA':'JESSICA GONCALVES BARBOSA','MATHEUS DOMINGOS SANTOS':'MATHEUS DOMINGOS SANTOS DE SOUZA','LETICIA LEANDRA':'LETICIA LEANDRA DE TOLEDO','OTAVIO JOSE DE OLIVEIRA MARTIN':'OTAVIO JOSE DE OLIVEIRA MARTINS'
  };
  function resolvePerson(raw){
    const r=norm(raw);if(!r)return '';
    const ak=Object.keys(aliases).find(k=>norm(k)===r);if(ak)return aliases[ak];
    const exact=(window.HIST||[]).find(p=>norm(p.name)===r);if(exact)return exact.name;
    const toks=r.split(' ').filter(x=>x.length>2);let best=null,score=0;
    (window.HIST||[]).forEach(p=>{const pn=norm(p.name),pt=new Set(pn.split(' '));const hit=toks.filter(t=>pt.has(t)).length;const s=hit/(Math.max(toks.length,1));if(hit>=1&&s>score){score=s;best=p.name;}});
    return score>=0.5?best:String(raw).trim().toUpperCase();
  }
  function countToken(status,token){const m=norm(status).match(new RegExp(`\\b${token}\\b`,'g'));return m?m.length:0;}

  function parseRow(row){
    const detailed=Object.keys(row).some(k=>norm(k)==='VENDAS ATIVAS')||Object.keys(row).some(k=>norm(k)==='VGV ATIVO');
    const date=ymd(get(row,'Data','Data de atendimento'));
    const person=resolvePerson(get(row,'Promotor','Promotor de marketing','Profissional','Captador'));
    if(!date||!person)return null;
    let q=0,nq=0,sales=0,cancelled=0,vgv=0,vgv_general=0,gift=0,notour=0;
    if(detailed){
      const qual=get(row,'Qualificado','Qualificação');
      if(String(qual).trim()!==''){const qn=norm(qual);q=(qn==='Q'||n(qual)>0)?1:0;nq=q?0:1;}
      sales=n(get(row,'Vendas ativas','Vendas Ativas'));
      cancelled=n(get(row,'Canceladas','Cancelamentos'));
      vgv=n(get(row,'VGV ativo','VGV Ativo'));
      vgv_general=n(get(row,'VGV bruto','VGV Geral','Valor vendido'));
      gift=n(get(row,'Brindes','Valor brindes','Valor em brindes'));
      const nt=get(row,'NoTour','No Tour','Descrição de motivo No Tour');notour=String(nt).trim()?1:0;
    }else{
      const qual=norm(get(row,'Qualificação','Qualificado'));
      q=qual==='Q'?1:0;nq=qual==='NQ'?1:0;
      const status=get(row,'Status do contrato','Status contrato');sales=countToken(status,'ATIVO');cancelled=countToken(status,'CANCELADO');
      vgv_general=n(get(row,'Valor vendido','VGV bruto','VGV Geral'));vgv=sales>0?vgv_general:0;
      gift=n(get(row,'Brindes','Valor brindes','Valor em brindes','Valor Brinde'));
      notour=String(get(row,'Descrição de motivo No Tour','Motivo NoTour','NoTour')).trim()?1:0;
    }
    return {date,person,couples:1,q,nq,sales,cancelled,vgv,vgv_general,gift,notour,attendances:1};
  }

  function aggregate(rows){
    const map={};rows.forEach(r=>{const k=r.date+'|'+r.person;if(!map[k])map[k]={...r,id:'sheet-'+norm(k).replace(/ /g,'-'),source:'sheet-upload'};else ['couples','q','nq','sales','cancelled','vgv','vgv_general','gift','notour','attendances'].forEach(f=>map[k][f]=(Number(map[k][f])||0)+(Number(r[f])||0));});return Object.values(map);
  }
  async function ensureXlsx(){if(window.XLSX)return;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
  function refreshAll(){try{renderDashboard();renderRank();renderSeptember();renderProfile();renderTeams();renderLaunches();if(window.renderCaptain)renderCaptain();}catch(e){console.warn(e);}}
  function metaText(){try{const m=JSON.parse(localStorage.getItem('tx_last_import_v44')||'null');if(!m)return 'Nenhuma planilha importada ainda.';return `Última importação: ${m.file} • ${m.rows} registros aplicados • até ${m.latest.split('-').reverse().join('/')} • ${new Date(m.when).toLocaleString('pt-BR')}`;}catch{return 'Nenhuma planilha importada ainda.';}}
  function mount(){
    if(document.getElementById('txUploadBar'))return;
    const nav=document.querySelector('.tabs');if(!nav)return;
    const box=document.createElement('div');box.id='txUploadBar';box.className='card';box.innerHTML=`<div><div class="txUpTitle">📊 Atualizar TARGET X pela planilha</div><div class="txUpStatus" id="txUploadStatus">${esc(metaText())}</div></div><div id="txUploadActions"><input id="txSheetFile" type="file" accept=".xlsx,.xls,.csv"><button id="txChooseSheet">Escolher planilha</button><span class="txFileName" id="txFileName">Nenhum arquivo</span><button id="txImportSheet" disabled>Carregar dados</button></div>`;nav.parentNode.insertBefore(box,nav);
    const fi=document.getElementById('txSheetFile'),choose=document.getElementById('txChooseSheet'),btn=document.getElementById('txImportSheet'),fn=document.getElementById('txFileName'),st=document.getElementById('txUploadStatus');
    choose.onclick=()=>fi.click();fi.onchange=()=>{const f=fi.files?.[0];fn.textContent=f?.name||'Nenhum arquivo';btn.disabled=!f;};
    btn.onclick=async()=>{
      const file=fi.files?.[0];if(!file)return;
      btn.disabled=true;btn.textContent='Lendo...';st.textContent='Processando a planilha e conferindo os dados...';
      try{
        await ensureXlsx();const buf=await file.arrayBuffer();const wb=XLSX.read(buf,{type:'array',cellDates:false});let parsed=[];
        wb.SheetNames.forEach(sn=>{const rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{defval:'',raw:true});rows.forEach(r=>{const p=parseRow(r);if(p)parsed.push(p);});});
        if(!parsed.length)throw new Error('Não encontrei linhas com Data e Profissional/Promotor.');
        const afterBase=parsed.filter(r=>r.date>(window.DATA_META?.through||'0000-00-00'));
        if(!afterBase.length)throw new Error(`A planilha foi lida, mas não há registros posteriores à base atual (${DATA_META.through.split('-').reverse().join('/')}).`);
        const agg=aggregate(afterBase),keys=new Set(agg.map(r=>r.date+'|'+r.person));
        launches=launches.filter(x=>!keys.has((x.date||'')+'|'+(x.person||'')));
        launches.push(...agg);saveState();
        const latest=agg.map(x=>x.date).sort().slice(-1)[0];const meta={file:file.name,rows:afterBase.length,groups:agg.length,latest,when:new Date().toISOString()};localStorage.setItem('tx_last_import_v44',JSON.stringify(meta));
        st.innerHTML=`<span class="green">✓ Importação concluída.</span> ${afterBase.length} registros • ${agg.length} profissionais/dias • dados até ${latest.split('-').reverse().join('/')}.`;
        btn.textContent='Carregado ✓';refreshAll();setTimeout(()=>{btn.textContent='Carregar dados';btn.disabled=false;},1800);
      }catch(e){console.error(e);st.innerHTML=`<span class="red">Erro:</span> ${esc(e.message||e)}`;btn.textContent='Tentar novamente';btn.disabled=false;}
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
