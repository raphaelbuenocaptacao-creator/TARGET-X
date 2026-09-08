// TARGET X — fechamento oficial de 06/09 e 07/09/2026 pela planilha enviada em 08/09/2026
(function(){
  const rows=[
    // 06/09/2026 — 17 casais | 9 Q | 8 NQ | 1 venda | VGV 79.000 | brindes 3.757,63
    {id:'official-2026-09-06-andre',date:'2026-09-06',person:'ANDRE LUIS CARRIÇO DOS SANTOS',couples:3,q:1,nq:2,notour:0,sales:0,cancelled:0,vgv:0,vgv_general:0,gift:503.94,attendances:3,source:'official-sheet-0607'},
    {id:'official-2026-09-06-clacion',date:'2026-09-06',person:'CLACION DE SOUZA BRAGA FILHO',couples:1,q:1,nq:0,notour:0,sales:0,cancelled:0,vgv:0,vgv_general:0,gift:419.95,attendances:1,source:'official-sheet-0607'},
    {id:'official-2026-09-06-josyene',date:'2026-09-06',person:'JOSYENE APARECIDA DE FREITAS',couples:2,q:1,nq:1,notour:0,sales:1,cancelled:0,vgv:79000,vgv_general:79000,gift:300.00,attendances:2,source:'official-sheet-0607'},
    {id:'official-2026-09-06-larissa',date:'2026-09-06',person:'LARISSA MARIA RIBEIRO',couples:3,q:1,nq:2,notour:0,sales:0,cancelled:0,vgv:0,vgv_general:0,gift:503.94,attendances:3,source:'official-sheet-0607'},
    {id:'official-2026-09-06-leandra',date:'2026-09-06',person:'LETICIA LEANDRA DE TOLEDO',couples:1,q:1,nq:0,notour:0,sales:0,cancelled:0,vgv:0,vgv_general:0,gift:167.98,attendances:1,source:'official-sheet-0607'},
    {id:'official-2026-09-06-manara',date:'2026-09-06',person:'MANARA ALEXANDRE SOUSA',couples:1,q:1,nq:0,notour:0,sales:0,cancelled:0,vgv:0,vgv_general:0,gift:335.96,attendances:1,source:'official-sheet-0607'},
    {id:'official-2026-09-06-marcio',date:'2026-09-06',person:'MARCIO VINICIOS MARTINS ALFAIA',couples:3,q:1,nq:2,notour:0,sales:0,cancelled:0,vgv:0,vgv_general:0,gift:685.96,attendances:3,source:'official-sheet-0607'},
    {id:'official-2026-09-06-otavio',date:'2026-09-06',person:'OTAVIO JOSE DE OLIVEIRA MARTINS',couples:2,q:1,nq:1,notour:0,sales:0,cancelled:0,vgv:0,vgv_general:0,gift:503.94,attendances:2,source:'official-sheet-0607'},
    {id:'official-2026-09-06-renan',date:'2026-09-06',person:'RENAN MARCONDES JOHAS',couples:1,q:1,nq:0,notour:0,sales:0,cancelled:0,vgv:0,vgv_general:0,gift:335.96,attendances:1,source:'official-sheet-0607'},

    // 07/09/2026 — 19 casais | 15 Q | 3 NQ | 1 sem qualificação | 2 vendas | VGV 171.000 | brindes 5.265,41
    {id:'official-2026-09-07-carol',date:'2026-09-07',person:'ANA CAROLINE DA SILVA LOPES PEREIRA',couples:1,q:1,nq:0,notour:0,sales:1,cancelled:0,vgv:79000,vgv_general:79000,gift:671.92,attendances:1,source:'official-sheet-0607'},
    {id:'official-2026-09-07-andre',date:'2026-09-07',person:'ANDRE LUIS CARRIÇO DOS SANTOS',couples:4,q:4,nq:0,notour:0,sales:0,cancelled:0,vgv:0,vgv_general:0,gift:1175.86,attendances:4,source:'official-sheet-0607'},
    {id:'official-2026-09-07-clacion',date:'2026-09-07',person:'CLACION DE SOUZA BRAGA FILHO',couples:1,q:1,nq:0,notour:0,sales:0,cancelled:0,vgv:0,vgv_general:0,gift:503.94,attendances:1,source:'official-sheet-0607'},
    {id:'official-2026-09-07-josyene',date:'2026-09-07',person:'JOSYENE APARECIDA DE FREITAS',couples:1,q:1,nq:0,notour:0,sales:1,cancelled:0,vgv:92000,vgv_general:92000,gift:160.00,attendances:1,source:'official-sheet-0607'},
    {id:'official-2026-09-07-leandra',date:'2026-09-07',person:'LETICIA LEANDRA DE TOLEDO',couples:1,q:1,nq:0,notour:0,sales:0,cancelled:0,vgv:0,vgv_general:0,gift:335.96,attendances:1,source:'official-sheet-0607'},
    {id:'official-2026-09-07-manara',date:'2026-09-07',person:'MANARA ALEXANDRE SOUSA',couples:2,q:2,nq:0,notour:0,sales:0,cancelled:0,vgv:0,vgv_general:0,gift:587.93,attendances:2,source:'official-sheet-0607'},
    {id:'official-2026-09-07-otavio',date:'2026-09-07',person:'OTAVIO JOSE DE OLIVEIRA MARTINS',couples:4,q:2,nq:1,notour:0,sales:0,cancelled:0,vgv:0,vgv_general:0,gift:839.90,attendances:4,source:'official-sheet-0607'},
    {id:'official-2026-09-07-paulo',date:'2026-09-07',person:'PAULO VICTOR ORTIZ',couples:2,q:1,nq:1,notour:0,sales:0,cancelled:0,vgv:0,vgv_general:0,gift:503.94,attendances:2,source:'official-sheet-0607'},
    {id:'official-2026-09-07-renan',date:'2026-09-07',person:'RENAN MARCONDES JOHAS',couples:3,q:2,nq:1,notour:0,sales:0,cancelled:0,vgv:0,vgv_general:0,gift:485.96,attendances:3,source:'official-sheet-0607'}
  ];

  rows.forEach(r=>{
    const i=launches.findIndex(x=>x.id===r.id);
    if(i>=0) launches[i]={...launches[i],...r};
    else launches.push(r);
  });
  saveState();
  setTimeout(()=>{
    try{
      renderDashboard();renderRank();renderSeptember();renderProfile();renderTeams();renderLaunches();
      if(window.renderCaptain)renderCaptain();
    }catch(e){}
  },0);
})();
