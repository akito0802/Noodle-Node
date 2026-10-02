(function(){
'use strict';

var STORAGE='noodle-node-v1';
var SETTINGS='noodle-node-settings-v1';

function id(){return 'id-'+Math.random().toString(36).slice(2,9)}
function now(){return new Date().toISOString()}
function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function defaultMap(title){
  var c=id(),a=id(),b=id(),d=id(),e=id();
  return {id:id(),title:title||'無題',updatedAt:now(),view:'mind',zoom:1,conclusion:'',decidedCandidate:null,
    nodes:[
      {id:c,title:title||'中心テーマ',memo:'このマップで考えたいこと',x:370,y:255,color:'red',importance:3,task:false,done:false,due:'',priority:2,tags:['中心'],center:true},
      {id:a,title:'やりたいこと',memo:'',x:130,y:115,color:'pink',importance:2,task:false,done:false,due:'',priority:2,tags:[]},
      {id:b,title:'不安',memo:'',x:620,y:115,color:'blue',importance:2,task:false,done:false,due:'',priority:2,tags:[]},
      {id:d,title:'選択肢',memo:'',x:620,y:410,color:'purple',importance:1,task:false,done:false,due:'',priority:1,tags:[]},
      {id:e,title:'重要ポイント',memo:'',x:130,y:410,color:'gold',importance:3,task:false,done:false,due:'',priority:3,tags:[]}
    ],
    edges:[[c,a],[c,b],[c,d],[c,e]],
    compare:{criteria:[{id:id(),name:'メリット',weight:3},{id:id(),name:'実現性',weight:3},{id:id(),name:'コスト',weight:2}],candidates:[{id:id(),name:'パターンA',scores:[4,3,2]},{id:id(),name:'パターンB',scores:[3,4,4]}]}
  }
}
var seed=[defaultMap('進路の整理'),defaultMap('旅行プラン'),defaultMap('仕事のアイデア')];
seed[0].updatedAt='2026-09-30T10:00:00.000Z';seed[1].updatedAt='2026-09-26T10:00:00.000Z';seed[2].updatedAt='2026-09-25T10:00:00.000Z';

var data;
try{data=JSON.parse(localStorage.getItem(STORAGE))}catch(e){}
if(!data||!data.maps)data={maps:seed,folders:[{id:id(),name:'自分のこと',icon:'✦',color:'gold'},{id:id(),name:'アイデア',icon:'◇',color:'red'}]};
var settings;
try{settings=JSON.parse(localStorage.getItem(SETTINGS))}catch(e){}
settings=settings||{theme:'brand',font:'modern',start:'home'};
var ui={screen:settings.start==='last'?'map':settings.start,currentMapId:data.maps[0]&&data.maps[0].id,query:'',sheetNodeId:null};
if(!['home','map','tasks','compare','summary','settings','templates'].includes(ui.screen))ui.screen='home';

function save(){
  localStorage.setItem(STORAGE,JSON.stringify(data));
  localStorage.setItem(SETTINGS,JSON.stringify(settings));
}
function currentMap(){return data.maps.find(function(m){return m.id===ui.currentMapId})||data.maps[0]}
function touchMap(m){if(m)m.updatedAt=now();save()}
function setTheme(){document.body.dataset.theme=settings.theme;document.body.dataset.font=settings.font}
setTheme();

var app=document.getElementById('app');
var sheetRoot=document.getElementById('sheet-root');

function icon(name){
  var set={home:'⌂',map:'◉',tasks:'✓',compare:'⚖',summary:'▤',settings:'⚙',templates:'▦',search:'⌕',back:'‹',share:'↗',undo:'↶',redo:'↷',plus:'＋'};
  return set[name]||'•'
}

function logo(){
  return '<div class="logo"><span class="logo-mark"><span></span><span></span></span><span>Noodle Node</span></div>';
}
function nav(){
  var items=[['home','ホーム'],['map','マップ'],['tasks','タスク'],['compare','比較'],['settings','設定']];
  return '<nav class="bottom-nav">'+items.map(function(x){return '<button class="nav-btn '+(ui.screen===x[0]?'active':'')+'" data-nav="'+x[0]+'"><b>'+icon(x[0])+'</b><span>'+x[1]+'</span></button>'}).join('')+'</nav>';
}
function shell(inner){return '<main class="shell">'+inner+'</main>'+nav()}

function renderHome(){
  var recent=data.maps.slice().sort(function(a,b){return new Date(b.updatedAt)-new Date(a.updatedAt)}).slice(0,3);
  var cards=recent.map(function(m){return '<article class="map-card" data-open-map="'+m.id+'"><div class="map-preview"></div><h3>'+escapeHtml(m.title)+'</h3><small>'+new Date(m.updatedAt).toLocaleDateString('ja-JP')+' 更新</small></article>'}).join('');
  var folders=data.folders.map(function(f){return '<div class="folder-card"><div class="folder-icon">'+f.icon+'</div><div><b>'+escapeHtml(f.name)+'</b><div class="muted" style="font-size:12px;margin-top:3px">マップを整理</div></div></div>'}).join('');
  return shell('<section class="hero glass">'+logo()+'<p class="tagline">考えがつながる、道がひらける。</p></section>'+
    '<div class="quick-grid"><button class="action primary" data-action="new-map"><b>＋</b><span>新しいマップ</span></button><button class="action" data-nav="templates"><b>▦</b><span>テンプレート</span></button></div>'+
    '<div class="section-title"><h2>最近使ったマップ</h2><span class="muted">3件</span></div><section class="cards">'+cards+'</section>'+
    '<div class="section-title"><h2>フォルダ</h2><button class="chip" data-action="add-folder">＋ 追加</button></div><section class="folders">'+folders+'</section>');
}

function nodePosition(m,n,i){
  if(m.view==='list')return {x:70,y:45+i*88};
  if(m.view==='flow')return {x:70+(i%4)*200,y:80+Math.floor(i/4)*150};
  return {x:n.x,y:n.y};
}
function nodeColor(n){
  var map={red:'#e33a46',pink:'#ff6e98',blue:'#5d8dff',purple:'#b56cff',gold:'#d7a63d',green:'#4fd19a'};
  return map[n.color]||'#5d8dff';
}
function renderEdges(m){
  if(m.view==='list')return '';
  return m.edges.map(function(pair){
    var a=m.nodes.find(function(n){return n.id===pair[0]}),b=m.nodes.find(function(n){return n.id===pair[1]});
    if(!a||!b)return '';
    var ai=m.nodes.indexOf(a),bi=m.nodes.indexOf(b),pa=nodePosition(m,a,ai),pb=nodePosition(m,b,bi);
    var x1=pa.x+71,y1=pa.y+29,x2=pb.x+71,y2=pb.y+29;
    return '<path d="M '+x1+' '+y1+' C '+((x1+x2)/2)+' '+y1+', '+((x1+x2)/2)+' '+y2+', '+x2+' '+y2+'" stroke="rgba(215,166,61,.48)" stroke-width="2.2" fill="none"/>';
  }).join('');
}
function renderNode(m,n,i){
  var p=nodePosition(m,n,i),meta=[];
  if(n.task)meta.push(n.done?'完了':'タスク');
  if(n.importance===3)meta.push('重要');
  if(n.tags&&n.tags.length)meta.push(n.tags.join(' · '));
  return '<div class="node '+(n.center?'center ':'')+(n.importance===3?'important ':'')+(n.done?'task-done ':'')+'" data-node="'+n.id+'" style="left:'+p.x+'px;top:'+p.y+'px;border-color:'+nodeColor(n)+'"><div class="node-title">'+escapeHtml(n.title)+'</div><div class="node-meta">'+escapeHtml(meta.join(' / '))+'</div></div>';
}
function renderMap(){
  var m=currentMap();if(!m)return renderHome();
  var views=[['mind','マインド'],['free','自由配置'],['list','リスト'],['flow','フロー']];
  var chips=views.map(function(v){return '<button class="chip '+(m.view===v[0]?'active':'')+'" data-view="'+v[0]+'">'+v[1]+'</button>'}).join('');
  return shell('<div class="topbar"><button class="icon-btn" data-nav="home">'+icon('back')+'</button><div class="title">'+escapeHtml(m.title)+'</div><button class="icon-btn" data-action="search">'+icon('search')+'</button><button class="icon-btn" data-action="share">'+icon('share')+'</button></div>'+
    '<div class="view-row">'+chips+'<button class="chip" data-action="zoom-out">−</button><button class="chip" data-action="zoom-in">＋</button><button class="chip" data-nav="summary">まとめ</button></div>'+
    '<div class="editor-wrap"><div class="canvas-scroll"><div class="canvas-surface" id="canvas-surface" style="transform:scale('+m.zoom+')"><svg class="edge-layer" viewBox="0 0 900 620">'+renderEdges(m)+'</svg>'+m.nodes.map(function(n,i){return renderNode(m,n,i)}).join('')+'</div></div></div>'+
    '<button class="fab" data-action="add-node">＋</button>');
}
function allTasks(){
  var out=[];data.maps.forEach(function(m){m.nodes.forEach(function(n){if(n.task)out.push({map:m,node:n})})});return out;
}
function renderTasks(){
  var tasks=allTasks();
  var list=tasks.length?tasks.map(function(t){return '<div class="task-item"><button class="check '+(t.node.done?'done':'')+'" data-task-toggle="'+t.node.id+'" data-map-id="'+t.map.id+'">'+(t.node.done?'✓':'')+'</button><div style="flex:1"><b>'+escapeHtml(t.node.title)+'</b><div class="muted" style="font-size:12px">'+escapeHtml(t.map.title)+' · 優先度 '+t.node.priority+(t.node.due?' · '+t.node.due:'')+'</div></div></div>'}).join(''):'<div class="empty">タスクはまだないよ。<br>ノードの詳細からタスク化できる。</div>';
  return shell('<div class="topbar"><div class="title">タスク</div></div><div class="task-list">'+list+'</div>');
}
function candidateTotal(m,c){
  var sum=0,weights=0;m.compare.criteria.forEach(function(cr,i){var w=Number(cr.weight)||1;sum+=(Number(c.scores[i])||0)*w;weights+=w});return weights?sum/weights:0;
}
function renderCompare(){
  var m=currentMap();if(!m)return renderHome();
  var cols=m.compare.candidates.map(function(c){
    var rows=m.compare.criteria.map(function(cr,i){return '<div class="score-row"><span>'+escapeHtml(cr.name)+'</span><input type="number" min="1" max="5" value="'+(c.scores[i]||3)+'" data-score-candidate="'+c.id+'" data-score-index="'+i+'"><span class="muted">×'+cr.weight+'</span></div>'}).join('');
    return '<div class="candidate-card '+(m.decidedCandidate===c.id?'decided':'')+'"><input class="input" value="'+escapeHtml(c.name)+'" data-candidate-name="'+c.id+'">'+rows+'<div class="score-total">'+candidateTotal(m,c).toFixed(2)+'</div><button class="gold-btn" style="width:100%;margin-top:10px" data-decide="'+c.id+'">'+(m.decidedCandidate===c.id?'決定済み':'これに決める')+'</button></div>';
  }).join('');
  var criteria=m.compare.criteria.map(function(cr,i){return '<div class="setting-item"><input class="input" value="'+escapeHtml(cr.name)+'" data-criterion-name="'+i+'"><label class="muted">重み <input style="width:58px" type="number" min="1" max="5" value="'+cr.weight+'" data-criterion-weight="'+i+'"></label></div>'}).join('');
  return shell('<div class="topbar"><div class="title">比較・意思決定</div><button class="icon-btn" data-action="add-candidate">＋</button></div><div class="section-title"><h2>候補</h2><span class="muted">1〜5点 × 重み</span></div><div class="compare-grid">'+cols+'</div><div class="section-title"><h2>評価項目</h2><button class="chip" data-action="add-criterion">＋ 追加</button></div><div class="settings-list">'+criteria+'</div>');
}
function renderSummary(){
  var m=currentMap();if(!m)return renderHome();
  var decided=m.compare.candidates.find(function(c){return c.id===m.decidedCandidate});
  var important=m.nodes.filter(function(n){return n.importance===3});
  var tasks=m.nodes.filter(function(n){return n.task});
  return shell('<div class="topbar"><div class="title">まとめ</div><button class="icon-btn no-print" data-action="print">PDF</button></div>'+
    '<section class="summary-box"><h3>結論</h3><textarea class="textarea" id="conclusion-input" placeholder="結局どうする？">'+escapeHtml(m.conclusion||'')+'</textarea>'+(decided?'<p><span class="chip active">決定済み</span> '+escapeHtml(decided.name)+'</p>':'')+'</section>'+
    '<section class="summary-box"><h3>重要ポイント</h3>'+(important.length?'<ul>'+important.map(function(n){return '<li>'+escapeHtml(n.title)+'</li>'}).join('')+'</ul>':'<p class="muted">重要ポイントはまだない。</p>')+'</section>'+
    '<section class="summary-box"><h3>タスク</h3>'+(tasks.length?'<ul>'+tasks.map(function(n){return '<li>'+(n.done?'☑':'☐')+' '+escapeHtml(n.title)+'</li>'}).join('')+'</ul>':'<p class="muted">タスクはまだない。</p>')+'</section>'+
    '<div class="row no-print"><button class="gold-btn" data-action="copy-summary">テキストをコピー</button><button class="action" data-action="print">印刷 / PDF</button></div>');
}
function renderTemplates(){
  var t=[
    ['悩み整理','事実 → 気持ち → 選択肢 → 結論'],
    ['アイデア出し','中心テーマから自由に発想を広げる'],
    ['比較・意思決定','候補を評価して決める'],
    ['目標整理・計画','目標から必要な行動を分解する']
  ];
  return shell('<div class="topbar"><div class="title">テンプレート</div></div><div class="cards">'+t.map(function(x,i){return '<article class="template-card"><h3>'+x[0]+'</h3><p>'+x[1]+'</p><button class="primary" data-template="'+i+'">この型で始める</button></article>'}).join('')+'</div>');
}
function renderSettings(){
  var themes=[['brand','Noodle Node'],['minimal','Minimal'],['soft','Soft'],['dark','Dark']];
  return shell('<div class="topbar"><div class="title">設定</div></div>'+
    '<div class="settings-list">'+
    '<div class="setting-item"><div><b>テーマ</b><div class="muted" style="font-size:12px">見た目を切り替え</div></div><select class="select" style="width:150px" id="theme-select">'+themes.map(function(t){return '<option value="'+t[0]+'" '+(settings.theme===t[0]?'selected':'')+'>'+t[1]+'</option>'}).join('')+'</select></div>'+
    '<div class="setting-item"><div><b>文字</b><div class="muted" style="font-size:12px">現代的 / レトロ</div></div><select class="select" style="width:150px" id="font-select"><option value="modern" '+(settings.font==='modern'?'selected':'')+'>Modern</option><option value="retro" '+(settings.font==='retro'?'selected':'')+'>Retro</option></select></div>'+
    '<div class="setting-item"><div><b>起動時の画面</b></div><select class="select" style="width:150px" id="start-select"><option value="home" '+(settings.start==='home'?'selected':'')+'>ホーム</option><option value="last" '+(settings.start==='last'?'selected':'')+'>前回のマップ</option><option value="templates" '+(settings.start==='templates'?'selected':'')+'>新規作成</option></select></div>'+
    '<div class="setting-item"><div><b>クラウド同期</b><div class="muted" style="font-size:12px">Googleログイン版で有効化予定</div></div><span class="chip">Prototype</span></div>'+
    '<div class="setting-item"><div><b>バックアップ</b><div class="muted" style="font-size:12px">現在のローカルデータを書き出す</div></div><button class="chip" data-action="export-backup">書き出し</button></div>'+
    '<div class="setting-item"><div><b>データを初期化</b></div><button class="danger" data-action="reset-data">削除</button></div>'+
    '</div>');
}
function render(){
  setTheme();
  var html='';
  if(ui.screen==='home')html=renderHome();
  if(ui.screen==='map')html=renderMap();
  if(ui.screen==='tasks')html=renderTasks();
  if(ui.screen==='compare')html=renderCompare();
  if(ui.screen==='summary')html=renderSummary();
  if(ui.screen==='settings')html=renderSettings();
  if(ui.screen==='templates')html=renderTemplates();
  app.innerHTML=html;
  if(ui.screen==='map')bindDrag();
}

function showToast(msg){
  var t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove()},1600)
}
function openSheet(nodeId){
  var m=currentMap(),n=m.nodes.find(function(x){return x.id===nodeId});if(!n)return;
  ui.sheetNodeId=nodeId;
  sheetRoot.innerHTML='<div class="sheet-backdrop" data-sheet-close></div><section class="sheet"><div class="sheet-handle"></div><h2 style="margin:0 0 8px">ノード詳細</h2>'+
    '<div class="field"><label>タイトル</label><input class="input" id="node-title" value="'+escapeHtml(n.title)+'"></div>'+
    '<div class="field"><label>詳細メモ</label><textarea class="textarea" id="node-memo" placeholder="考えの詳細を書く">'+escapeHtml(n.memo||'')+'</textarea></div>'+
    '<div class="split"><div class="field"><label>重要度</label><select class="select" id="node-importance"><option value="1" '+(n.importance===1?'selected':'')+'>1</option><option value="2" '+(n.importance===2?'selected':'')+'>2</option><option value="3" '+(n.importance===3?'selected':'')+'>3</option></select></div><div class="field"><label>色</label><select class="select" id="node-color">'+['red','pink','blue','purple','gold','green'].map(function(c){return '<option value="'+c+'" '+(n.color===c?'selected':'')+'>'+c+'</option>'}).join('')+'</select></div></div>'+
    '<div class="field"><label>タグ（カンマ区切り）</label><input class="input" id="node-tags" value="'+escapeHtml((n.tags||[]).join(', '))+'"></div>'+
    '<div class="setting-item"><b>タスク化</b><input type="checkbox" id="node-task" '+(n.task?'checked':'')+'></div>'+
    '<div class="split"><div class="field"><label>期限</label><input class="input" type="date" id="node-due" value="'+escapeHtml(n.due||'')+'"></div><div class="field"><label>優先度</label><select class="select" id="node-priority"><option value="1" '+(n.priority===1?'selected':'')+'>1</option><option value="2" '+(n.priority===2?'selected':'')+'>2</option><option value="3" '+(n.priority===3?'selected':'')+'>3</option></select></div></div>'+
    '<div class="row"><button class="gold-btn" data-sheet-save style="flex:1">保存</button><button class="danger" data-sheet-delete>削除</button></div></section>';
}
function closeSheet(){sheetRoot.innerHTML='';ui.sheetNodeId=null}
function saveSheet(){
  var m=currentMap(),n=m.nodes.find(function(x){return x.id===ui.sheetNodeId});if(!n)return;
  n.title=document.getElementById('node-title').value.trim()||'無題';
  n.memo=document.getElementById('node-memo').value;
  n.importance=Number(document.getElementById('node-importance').value);
  n.color=document.getElementById('node-color').value;
  n.tags=document.getElementById('node-tags').value.split(',').map(function(x){return x.trim()}).filter(Boolean);
  n.task=document.getElementById('node-task').checked;
  n.due=document.getElementById('node-due').value;
  n.priority=Number(document.getElementById('node-priority').value);
  touchMap(m);closeSheet();render();showToast('保存したよ');
}
function deleteSheet(){
  if(!confirm('このノードを削除しますか？'))return;
  var m=currentMap();m.nodes=m.nodes.filter(function(n){return n.id!==ui.sheetNodeId});m.edges=m.edges.filter(function(e){return e[0]!==ui.sheetNodeId&&e[1]!==ui.sheetNodeId});touchMap(m);closeSheet();render()
}

function newMap(title){
  var m=defaultMap(title||'無題');data.maps.unshift(m);ui.currentMapId=m.id;ui.screen='map';save();render()
}
function useTemplate(i){
  var names=['悩み整理','アイデア出し','比較・意思決定','目標整理・計画'];newMap(names[i])
}
function addNode(){
  var m=currentMap(),center=m.nodes.find(function(n){return n.center});
  var n={id:id(),title:'新しい考え',memo:'',x:220+(m.nodes.length*113)%510,y:80+(m.nodes.length*91)%430,color:'blue',importance:1,task:false,done:false,due:'',priority:2,tags:[]};
  m.nodes.push(n);if(center)m.edges.push([center.id,n.id]);touchMap(m);render();openSheet(n.id)
}
function addCandidate(){
  var m=currentMap();m.compare.candidates.push({id:id(),name:'新しい候補',scores:m.compare.criteria.map(function(){return 3})});touchMap(m);render()
}
function addCriterion(){
  var m=currentMap();m.compare.criteria.push({id:id(),name:'新しい項目',weight:2});m.compare.candidates.forEach(function(c){c.scores.push(3)});touchMap(m);render()
}
function summaryText(m){
  var c=m.compare.candidates.find(function(x){return x.id===m.decidedCandidate});
  var lines=['# '+m.title,'','## 結論',m.conclusion||'(未記入)'];
  if(c)lines.push('決定: '+c.name);
  lines.push('','## 重要ポイント');m.nodes.filter(function(n){return n.importance===3}).forEach(function(n){lines.push('- '+n.title)});
  lines.push('','## タスク');m.nodes.filter(function(n){return n.task}).forEach(function(n){lines.push('- ['+(n.done?'x':' ')+'] '+n.title)});
  return lines.join('\n')
}
function exportBackup(){
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='noodle-node-backup.json';a.click();URL.revokeObjectURL(a.href)
}
function bindDrag(){
  var m=currentMap();if(!m||m.view==='list')return;
  document.querySelectorAll('.node').forEach(function(el){
    var node=m.nodes.find(function(n){return n.id===el.dataset.node});if(!node)return;
    var sx,sy,ox,oy,moved=false;
    el.addEventListener('pointerdown',function(ev){sx=ev.clientX;sy=ev.clientY;ox=node.x;oy=node.y;moved=false;el.setPointerCapture(ev.pointerId)});
    el.addEventListener('pointermove',function(ev){if(sx===undefined)return;var dx=(ev.clientX-sx)/(m.zoom||1),dy=(ev.clientY-sy)/(m.zoom||1);if(Math.abs(dx)+Math.abs(dy)>6)moved=true;node.x=clamp(ox+dx,0,750);node.y=clamp(oy+dy,0,550);el.style.left=node.x+'px';el.style.top=node.y+'px'});
    el.addEventListener('pointerup',function(){if(moved){touchMap(m);render()}sx=undefined});
  })
}

app.addEventListener('click',function(e){
  var navEl=e.target.closest('[data-nav]');if(navEl){ui.screen=navEl.dataset.nav;render();return}
  var open=e.target.closest('[data-open-map]');if(open){ui.currentMapId=open.dataset.openMap;ui.screen='map';render();return}
  var node=e.target.closest('[data-node]');if(node){openSheet(node.dataset.node);return}
  var action=e.target.closest('[data-action]');
  if(action){
    var a=action.dataset.action,m=currentMap();
    if(a==='new-map')newMap('無題');
    if(a==='add-node')addNode();
    if(a==='add-candidate')addCandidate();
    if(a==='add-criterion')addCriterion();
    if(a==='zoom-in'){m.zoom=clamp((m.zoom||1)+.1,.6,1.5);touchMap(m);render()}
    if(a==='zoom-out'){m.zoom=clamp((m.zoom||1)-.1,.6,1.5);touchMap(m);render()}
    if(a==='share'){navigator.clipboard&&navigator.clipboard.writeText(location.href);showToast('共有リンクをコピーしたよ')}
    if(a==='search'){var q=prompt('ノードを検索');if(q){var hit=m.nodes.find(function(n){return (n.title+' '+n.memo+' '+(n.tags||[]).join(' ')).toLowerCase().includes(q.toLowerCase())});if(hit)openSheet(hit.id);else showToast('見つからなかった')}}
    if(a==='copy-summary'){navigator.clipboard.writeText(summaryText(m));showToast('まとめをコピーしたよ')}
    if(a==='print')window.print();
    if(a==='export-backup')exportBackup();
    if(a==='reset-data'){if(confirm('Noodle Nodeのローカルデータを初期化しますか？')){localStorage.removeItem(STORAGE);location.reload()}}
    if(a==='add-folder'){var name=prompt('フォルダ名');if(name){data.folders.push({id:id(),name:name,icon:'◇',color:'gold'});save();render()}}
    return
  }
  var view=e.target.closest('[data-view]');if(view){var mm=currentMap();mm.view=view.dataset.view;touchMap(mm);render();return}
  var task=e.target.closest('[data-task-toggle]');if(task){var mp=data.maps.find(function(x){return x.id===task.dataset.mapId}),nn=mp.nodes.find(function(x){return x.id===task.dataset.taskToggle});nn.done=!nn.done;touchMap(mp);render();return}
  var dec=e.target.closest('[data-decide]');if(dec){var md=currentMap();md.decidedCandidate=dec.dataset.decide;touchMap(md);render();showToast('決定したよ');return}
  var temp=e.target.closest('[data-template]');if(temp){useTemplate(Number(temp.dataset.template));return}
});
app.addEventListener('change',function(e){
  var m=currentMap();
  if(e.target.id==='theme-select'){settings.theme=e.target.value;save();render()}
  if(e.target.id==='font-select'){settings.font=e.target.value;save();render()}
  if(e.target.id==='start-select'){settings.start=e.target.value;save()}
  if(e.target.dataset.candidateName){var c=m.compare.candidates.find(function(x){return x.id===e.target.dataset.candidateName});c.name=e.target.value;touchMap(m)}
  if(e.target.dataset.scoreCandidate){var cc=m.compare.candidates.find(function(x){return x.id===e.target.dataset.scoreCandidate});cc.scores[Number(e.target.dataset.scoreIndex)]=clamp(Number(e.target.value)||1,1,5);touchMap(m);render()}
  if(e.target.dataset.criterionName!==undefined){m.compare.criteria[Number(e.target.dataset.criterionName)].name=e.target.value;touchMap(m)}
  if(e.target.dataset.criterionWeight!==undefined){m.compare.criteria[Number(e.target.dataset.criterionWeight)].weight=clamp(Number(e.target.value)||1,1,5);touchMap(m);render()}
  if(e.target.id==='conclusion-input'){m.conclusion=e.target.value;touchMap(m)}
});
sheetRoot.addEventListener('click',function(e){
  if(e.target.matches('[data-sheet-close]'))closeSheet();
  if(e.target.closest('[data-sheet-save]'))saveSheet();
  if(e.target.closest('[data-sheet-delete]'))deleteSheet();
});
render();
})();