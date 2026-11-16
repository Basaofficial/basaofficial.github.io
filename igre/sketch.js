// #Bash igre – Crtaj & pogađaj (do 5 igrača)
'use strict';
const SK_COLORS=['#111111','#ffffff','#8a8a8a','#e53935','#ff9800','#ffd60a','#7cff01','#1b8f3a','#00c2d1','#2f7bff','#7b3fe4','#ff4fa3','#8d5a3b','#f5c6a5'];
const SK_SIZES=[.006,.013,.026,.05];
const SK_BG='#f7f7f2';
const SK={color:'#111111',size:1,eraser:false,strokes:[],cur:null,sent:0,flushT:0,timerI:0,lastSec:-1};
const r3=v=>Math.round(Math.min(1,Math.max(0,v))*1000)/1000;

function skNorm(s){return String(s).toLowerCase().replace(/đ/g,'dj').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')}
function skVariants(w){return [...new Set([skNorm(w),skNorm(String(w).toLowerCase().replace(/đ/g,'d'))])].filter(Boolean)}
function lev(a,b){const m=a.length,n=b.length;if(Math.abs(m-n)>1)return 9;const d=Array.from({length:m+1},(_,i)=>[i]);for(let j=1;j<=n;j++)d[0][j]=j;
 for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]}
function skMask(word,rev){return [...word].map((ch,i)=>ch===' '?'  ':(rev.includes(i)?ch:'_')).join(' ')}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

// ================= HOST =================
const SK_CAT_OF={};for(const k in WORDS)WORDS[k].forEach(w=>SK_CAT_OF[w]=k);
function skPool(){const lb=App.lobby;let w=[];let cats=(lb.sk.cats||[]).filter(c=>WORDS[c]);if(!cats.length)cats=Object.keys(WORDS);cats.forEach(c=>w.push(...(WORDS[c]||[])));
 const used=new Set(App.sk?App.sk.used:[]);const f=w.filter(x=>!used.has(x));return f.length>=3?f:w}
function skOnline(id){const p=App.lobby&&App.lobby.players[id];return id===App.me.id||!!(p&&p.online)}
function skStop(){clearTimeout(App.H.skT);clearInterval(App.H.skI)}
function skStart(){
 const lb=App.lobby;const ids=shuffle(Object.keys(lb.players).filter(id=>skOnline(id)));skStop();
 App.sk={id:Date.now()+Math.random(),phase:'choose',round:1,rounds:lb.sk.rounds,time:lb.sk.time,hints:lb.sk.hints,order:ids,turn:0,drawer:null,
  word:'',choices:[],revealed:[],scores:{},guessed:{},gain:{},endsAt:0,used:[],strokes:[],hintAt:[]};
 ids.forEach(i=>App.sk.scores[i]=0);wake();sysAll('🎨 Crtaj & pogađaj počinje!');skBeginTurn();
}
function skBeginTurn(){
 const s=App.sk;if(!s)return;let tries=0;
 while(tries<=s.order.length&&!skOnline(s.order[s.turn])){s.turn++;if(s.turn>=s.order.length){s.turn=0;s.round++}tries++}
 if(s.round>s.rounds||s.order.filter(skOnline).length<2){skOver();return}
 s.drawer=s.order[s.turn];s.phase='choose';s.word='';s.choices=shuffle(skPool()).slice(0,3);s.revealed=[];s.guessed={};s.gain={};s.strokes=[];s.reason='';
 s.endsAt=Date.now()+15000;skBcastStrokes();skBroadcast();sysAll(`✏️ Runda ${s.round}/${s.rounds} – crta ${pName(s.drawer)}`);
 skStop();App.H.skT=setTimeout(()=>{if(App.sk===s&&s.phase==='choose')skPick(s.drawer,Math.floor(Math.random()*3))},15200);
}
function skPick(id,i){const s=App.sk;if(!s||s.phase!=='choose'||id!==s.drawer)return;i=Math.max(0,Math.min(2,i|0));
 s.word=s.choices[i];s.used.push(s.word);s.phase='draw';s.endsAt=Date.now()+s.time*1000;s.hintAt=[.45,.65,.82];
 skStop();App.H.skI=setInterval(skTick,500);skBroadcast()}
function skTick(){const s=App.sk;if(!s||s.phase!=='draw'){clearInterval(App.H.skI);return}
 const rem=s.endsAt-Date.now(),frac=1-rem/(s.time*1000);
 if(s.hints&&s.hintAt.length&&frac>=s.hintAt[0]){s.hintAt.shift();const idx=[...s.word].map((c,i)=>c!==' '&&!s.revealed.includes(i)?i:-1).filter(i=>i>=0);
  const letters=[...s.word].filter(c=>c!==' ').length;if(idx.length>1&&s.revealed.length<Math.floor(letters/2)){s.revealed.push(idx[Math.floor(Math.random()*idx.length)]);skBroadcast()}}
 if(rem<=0)skEndTurn('time')}
function skEndTurn(reason){const s=App.sk;if(!s||(s.phase!=='draw'&&s.phase!=='choose'))return;skStop();
 const n=Object.keys(s.guessed).length;if(s.phase==='draw'&&n){const dp=Math.min(320,n*80);s.gain[s.drawer]=dp;s.scores[s.drawer]=(s.scores[s.drawer]||0)+dp}
 const w=s.word;s.phase='reveal';s.reason=reason;s.endsAt=Date.now()+5500;if(w)sysAll(`💡 Riječ je bila: ${w.toUpperCase()}`);
 skBroadcast();App.H.skT=setTimeout(skNext,5500)}
function skNext(){const s=App.sk;if(!s)return;s.turn++;if(s.turn>=s.order.length){s.turn=0;s.round++}skBeginTurn()}
function skOver(){const s=App.sk;skStop();s.phase='over';s.endsAt=0;s.strokes=s.strokes||[];skBroadcast();
 const best=s.order.slice().sort((a,b)=>(s.scores[b]||0)-(s.scores[a]||0))[0];if(best)sysAll(`🏆 Pobjednik: ${pName(best)} (${s.scores[best]} bodova)`)}
function skGuess(id,text){
 const s=App.sk;if(!s||s.phase!=='draw')return false;
 const g=skNorm(text),vars=skVariants(s.word),has=vars.some(v=>v.length>2&&g.includes(v));
 if(id===s.drawer){if(has){sysTo(id,'🤫 Ne smiješ napisati riječ!');return true}return false}
 if(s.guessed[id]){if(has){sysTo(id,'🤫 Već si pogodio/la – ne odaj riječ!');return true}return false}
 if(vars.includes(g)){const rem=Math.max(0,s.endsAt-Date.now())/(s.time*1000),order=Object.keys(s.guessed).length;
  const pts=Math.round(60+240*rem)+(order===0?40:0);s.guessed[id]=order+1;s.gain[id]=pts;s.scores[id]=(s.scores[id]||0)+pts;
  sysAll(`✅ ${pName(id)} je pogodio/la! +${pts}`);bcast({t:'sk_ok',id});skOk(id);
  const need=s.order.filter(x=>x!==s.drawer&&skOnline(x));if(need.every(x=>s.guessed[x]))skEndTurn('all');else skBroadcast();return true}
 if(g.length>=3&&vars.some(v=>lev(v,g)===1))sysTo(id,`🔥 „${text}” je blizu!`);
 return false;
}
function skView(id){const s=App.sk;if(!s)return null;const see=id===s.drawer||!!s.guessed[id]||s.phase==='reveal'||s.phase==='over';
 return {id:s.id,phase:s.phase,round:Math.min(s.round,s.rounds),rounds:s.rounds,time:s.time,order:s.order,drawer:s.drawer,
  cat:s.word&&SK_CAT_OF[s.word]?WORD_CATS[SK_CAT_OF[s.word]]:'',word:see?s.word:'',mask:s.word?skMask(s.word,s.revealed):'',len:[...s.word].filter(c=>c!==' ').length,
  choices:id===s.drawer&&s.phase==='choose'?s.choices:null,scores:s.scores,guessed:s.guessed,gain:s.gain,remain:Math.max(0,s.endsAt-Date.now()),reason:s.reason}}
function skBroadcast(){const s=App.sk;if(!s)return;App.conns.forEach((c,id)=>{if(c.open)try{c.send({t:'sk',s:skView(id)})}catch(e){}});skOnView(skView(App.me.id))}
function skBcastStrokes(to){const m={t:'sk_strokes',list:App.sk?App.sk.strokes:[]};if(to)sendTo(to,m);else{bcast(m);skSetStrokes(m.list)}}
function skOnJoin(id){const s=App.sk;if(!s)return;if(!s.order.includes(id)){s.order.push(id);s.scores[id]=0;sysAll(`👋 ${pName(id)} se pridružio/la igri`)}
 sendTo(id,{t:'sk',s:skView(id)});skBcastStrokes(id)}
function skOnLeave(id){const s=App.sk;if(!s)return;
 if(s.drawer===id&&(s.phase==='draw'||s.phase==='choose')){sysAll(`⚠️ ${pName(id)} je izašao/la – ide sljedeći`);skEndTurn('left');return}
 if(s.phase==='draw'){const need=s.order.filter(x=>x!==s.drawer&&skOnline(x));if(need.length&&need.every(x=>s.guessed[x])){skEndTurn('all');return}
  if(!need.length){skEndTurn('left');return}}
 skBroadcast()}
function skHostAction(id,d){const s=App.sk;if(!s)return;
 if(d.t==='sk_pick'){skPick(id,d.i);return}
 if(id!==s.drawer||s.phase!=='draw')return;
 if(d.t==='sk_draw'){if(!d.id||!Array.isArray(d.p))return;let st=s.strokes.find(x=>x.id===d.id);
  if(!st){if(s.strokes.length>3000)return;st={id:String(d.id).slice(0,20),c:/^#[0-9a-f]{6}$/i.test(d.c)?d.c:'#111111',w:Math.min(.12,Math.max(.002,+d.w||.01)),p:[]};s.strokes.push(st)}
  if(st.p.length>20000)return;const pts=d.p.slice(0,400).map(v=>r3(+v||0));if(pts.length%2)pts.pop();st.p.push(...pts);
  const m={t:'sk_draw',id:st.id,c:st.c,w:st.w,p:pts};bcast(m,id);if(id!==App.me.id)skApplyDraw(m);return}
 if(d.t==='sk_undo'){s.strokes.pop();skBcastStrokes();return}
 if(d.t==='sk_clear'){s.strokes=[];skBcastStrokes();return}
}

// ================= CLIENT =================
const cv=$('#skCv'),cx=cv.getContext('2d');
function skOnMsg(d){if(d.t==='sk'){if(d.s)skOnView(d.s)}else if(d.t==='sk_strokes')skSetStrokes(d.list||[]);else if(d.t==='sk_draw')skApplyDraw(d);else if(d.t==='sk_ok')skOk(d.id)}
function skOnView(v){
 const prev=App.skv;v._recv=Date.now();App.skv=v;
 if(!onScreen('sSketch')){hideWin();showScreen('sSketch');requestAnimationFrame(skResize);renderChat()}
 if(!SK.timerI)SK.timerI=setInterval(skTimer,250);
 const me=App.me.id,ph=!prev||prev.phase!==v.phase||prev.drawer!==v.drawer;
 if(ph){
  if(v.phase==='choose'&&v.drawer===me){sfx.turn();vib([50,40,50])}
  if(v.phase==='draw'&&v.drawer===me){SK.eraser=false;skTools()}
  if(v.phase==='reveal')tone(520,.25,'triangle',.12);
  if(v.phase==='over'){setTimeout(()=>skWin(v),600)}
  if(v.phase!=='draw'){SK.cur=null}
 }
 skRender();
}
function skRender(){
 const v=App.skv;if(!v)return;const me=App.me.id,dr=v.drawer===me;
 $('#skRound').textContent=v.phase==='over'?'KRAJ IGRE':`RUNDA ${v.round}/${v.rounds} · ✏️ ${pName(v.drawer)}${v.phase==='draw'&&v.cat?' · '+v.cat:''}`;
 const w=$('#skWord');
 if(v.phase==='choose'){w.className='skw plain';w.innerHTML=dr?'Izaberi riječ 👇':'bira riječ…'}
 else if(v.word&&(dr||v.guessed[me]||v.phase!=='draw')){w.className='skw word';w.textContent=v.word.toUpperCase()}
 else{w.className='skw';w.innerHTML=`${esc(v.mask)}<small>(${v.len})</small>`}
 $('#skCw').classList.toggle('me',dr&&v.phase==='draw');
 $('#skTools').classList.toggle('on',dr&&v.phase==='draw');
 const ov=$('#skOv');let h='';
 if(v.phase==='choose'){
  if(dr&&v.choices)h=`<h3>Tvoj red! Izaberi šta ćeš crtati:</h3>${v.choices.map((c,i)=>`<button class="btn" data-pick="${i}">${esc(c)} <small>${esc((WORD_CATS[SK_CAT_OF[c]]||'').split(' ')[0])}</small></button>`).join('')}<p class="muted" id="skCnt"></p>`;
  else h=`<div class="big">✏️</div><h3>${esc(pName(v.drawer))} bira riječ…</h3><p class="muted">Spremi se da pogađaš!</p>`;
 }else if(v.phase==='reveal'){
  const rs={all:'Svi su pogodili! 🎉',time:'Isteklo je vrijeme ⏱',left:'Crtač je izašao 😕'}[v.reason]||'';
  const g=Object.entries(v.gain||{}).sort((a,b)=>b[1]-a[1]).map(([id,p])=>`${esc(pName(id))} <b style="color:var(--g)">+${p}</b>${id===v.drawer?' ✏️':''}`).join('<br>');
  h=`<p class="muted" style="margin:0">${rs}</p><h3>Riječ je bila</h3><div class="big">${esc(v.word||'')}</div><div class="skgain">${g||'Niko nije pogodio 😅'}</div>`;
 }else if(v.phase==='over')h=`<div class="big">🏆</div><h3>Kraj igre!</h3>`;
 ov.innerHTML=h;ov.classList.toggle('on',!!h);
 $('#skPl').innerHTML=v.order.map(id=>{const p=App.lobby&&App.lobby.players[id];if(!p)return '';const ok=v.guessed&&v.guessed[id];
  return `<div class="skp${id===v.drawer?' dr':''}${ok?' ok':''}${p.online?'':' offp'}" data-pid="${esc(id)}" style="${p.online?'':'opacity:.4'}"><span class="a">${esc(p.av)}</span><div><b>${esc(p.nick)}${id===me?' (ti)':''}</b><small>${v.scores[id]||0}</small></div>${id===v.drawer?'<span class="st">✏️</span>':ok?'<span class="st">✅</span>':''}</div>`}).join('');
 const inp=$('#skIn');inp.placeholder=dr&&v.phase==='draw'?'Ti crtaš – samo chat 💬':v.guessed&&v.guessed[me]?'Pogodio/la si! 🎉 Piši u chat…':v.phase==='draw'?'Pogodi riječ…':'Chat…';
}
function skTimer(){
 const v=App.skv;if(!v||!onScreen('sSketch'))return;const el=$('#skTime');
 if(v.phase==='over'){el.textContent='🏁';el.classList.remove('low');return}
 const rem=Math.max(0,v.remain-(Date.now()-v._recv)),sec=Math.ceil(rem/1000);el.textContent=sec;
 el.classList.toggle('low',v.phase==='draw'&&sec<=10);
 const c=$('#skCnt');if(c)c.textContent=`Automatski izbor za ${sec}s`;
 if(v.phase==='draw'&&sec<=5&&sec>0&&sec!==SK.lastSec)sfx.tick();SK.lastSec=sec;
}
function skOk(id){if(id===App.me.id){sfx.ok();vib([40,30,80])}else tone(880,.12,'triangle',.08)}
function skWin(v){
 if(!App.skv||App.skv.phase!=='over')return;const me=App.me.id;
 const rk=v.order.map(id=>({id,s:v.scores[id]||0})).sort((a,b)=>b.s-a.s);const w=rk[0];
 $('#wTro').textContent=w&&w.id===me?'🏆':'🎨';$('#wTitle').textContent=w&&w.id===me?'Pobjeda! 🎉':`${pName(w&&w.id)} pobjeđuje!`;
 $('#wRank').innerHTML=rk.map((r,i)=>{const p=App.lobby.players[r.id]||{};return `<div class="rk"><span class="pn">${['🥇','🥈','🥉'][i]||i+1+'.'}</span><span style="font-size:20px">${esc(p.av||'')}</span><b>${esc(p.nick||'?')}${r.id===me?' (ti)':''}</b><small style="color:var(--g);font-weight:800">${r.s} bod.</small></div>`}).join('');
 winButtons();ovl('win',true);sfx.win();confetti();
}
function skResetUI(){clearInterval(SK.timerI);SK.timerI=0;SK.strokes=[];SK.cur=null;App.skv=null;$('#skOv').classList.remove('on')}
// ---------- canvas ----------
function skResize(){const r=cv.getBoundingClientRect();if(!r.width)return;const dpr=Math.min(2,window.devicePixelRatio||1);
 const W=Math.round(r.width*dpr),H=Math.round(r.height*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}skRedraw()}
window.addEventListener('resize',()=>{if(onScreen('sSketch'))skResize()});
function skRedraw(){cx.fillStyle=SK_BG;cx.fillRect(0,0,cv.width,cv.height);SK.strokes.forEach(st=>skDrawStroke(st,0))}
function skDrawStroke(st,from){
 const W=cv.width,H=cv.height,p=st.p,n=p.length/2;if(!n)return;
 cx.strokeStyle=st.c;cx.fillStyle=st.c;cx.lineWidth=Math.max(1,st.w*W);cx.lineCap='round';cx.lineJoin='round';
 if(n===1){cx.beginPath();cx.arc(p[0]*W,p[1]*H,Math.max(.5,st.w*W/2),0,Math.PI*2);cx.fill();return}
 let i=Math.max(1,from);cx.beginPath();cx.moveTo(p[(i-1)*2]*W,p[(i-1)*2+1]*H);for(;i<n;i++)cx.lineTo(p[i*2]*W,p[i*2+1]*H);cx.stroke();
}
function skApplyDraw(m){let st=SK.strokes.find(x=>x.id===m.id);if(!st){st={id:m.id,c:m.c,w:m.w,p:[]};SK.strokes.push(st)}
 const from=st.p.length/2;st.p.push(...(m.p||[]));skDrawStroke(st,from)}
function skSetStrokes(list){SK.strokes=JSON.parse(JSON.stringify(list||[]));if(SK.cur&&!SK.strokes.some(s=>s.id===SK.cur.id))SK.cur=null;skRedraw()}
function skPt(e){const r=cv.getBoundingClientRect();return [r3((e.clientX-r.left)/r.width),r3((e.clientY-r.top)/r.height)]}
function canDraw(){const v=App.skv;return v&&v.phase==='draw'&&v.drawer===App.me.id}
cv.addEventListener('pointerdown',e=>{if(!canDraw())return;e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}
 const [x,y]=skPt(e);const st={id:uid().slice(0,12),c:SK.eraser?SK_BG:SK.color,w:SK_SIZES[SK.size]*(SK.eraser?2.2:1),p:[x,y]};
 SK.strokes.push(st);SK.cur=st;SK.sent=0;skDrawStroke(st,0);skQueue()});
cv.addEventListener('pointermove',e=>{const st=SK.cur;if(!st||!canDraw())return;e.preventDefault();
 const evs=e.getCoalescedEvents?e.getCoalescedEvents():[e];const from=st.p.length/2;
 for(const ev of (evs.length?evs:[e])){const [x,y]=skPt(ev),n=st.p.length;if(Math.abs(st.p[n-2]-x)+Math.abs(st.p[n-1]-y)<.002)continue;st.p.push(x,y)}
 if(st.p.length/2>from)skDrawStroke(st,from);skQueue()});
const skUp=()=>{if(SK.cur){skFlush();SK.cur=null}};
cv.addEventListener('pointerup',skUp);cv.addEventListener('pointercancel',skUp);cv.addEventListener('pointerleave',skUp);
function skQueue(){if(!SK.flushT)SK.flushT=setTimeout(skFlush,40)}
function skFlush(){clearTimeout(SK.flushT);SK.flushT=0;const st=SK.cur;if(!st)return;const pts=st.p.slice(SK.sent);if(!pts.length)return;SK.sent=st.p.length;
 act('sk_draw',{id:st.id,c:st.c,w:st.w,p:pts})}
function skTools(){$('#skTools').innerHTML=SK_COLORS.map(c=>`<span class="col${!SK.eraser&&SK.color===c?' on':''}" data-col="${c}" style="background:${c}"></span>`).join('')+
 SK_SIZES.map((s,i)=>`<button class="tb${SK.size===i?' on':''}" data-size="${i}"><span class="dot" style="width:${4+i*5}px;height:${4+i*5}px"></span></button>`).join('')+
 `<button class="tb${SK.eraser?' on':''}" data-tool="eraser">🧽</button><button class="tb" data-tool="undo">↶</button><button class="tb" data-tool="clear">🗑</button>`}
skTools();
$('#skTools').addEventListener('click',e=>{const c=e.target.closest('[data-col]'),s=e.target.closest('[data-size]'),t=e.target.closest('[data-tool]');
 if(c){SK.color=c.dataset.col;SK.eraser=false}else if(s)SK.size=+s.dataset.size;
 else if(t){if(t.dataset.tool==='eraser')SK.eraser=!SK.eraser;else if(t.dataset.tool==='undo'&&canDraw())act('sk_undo');
  else if(t.dataset.tool==='clear'&&canDraw()&&SK.strokes.length&&confirm('Obrisati cijeli crtež?'))act('sk_clear')}
 sfx.click();skTools()});
$('#skOv').addEventListener('click',e=>{const b=e.target.closest('[data-pick]');if(b){$$('#skOv [data-pick]').forEach(x=>x.disabled=true);act('sk_pick',{i:+b.dataset.pick})}});
$('#skPl').addEventListener('click',e=>{const p=e.target.closest('[data-pid]');if(p)openProfile(p.dataset.pid)});
const skSend=()=>{const v=$('#skIn').value;if(!v.trim())return;sendChat(v);$('#skIn').value=''};
$('#skGo').onclick=skSend;$('#skIn').addEventListener('keydown',e=>{if(e.key==='Enter')skSend()});
