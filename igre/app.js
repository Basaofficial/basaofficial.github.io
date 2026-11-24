// #Bash igre – aplikacija (sobe, lobi, chat, ruže, Ne ljuti se UI)
'use strict';
if(location.protocol==='http:'&&!/^(localhost|127\.0\.0\.1|192\.168\.|10\.)/.test(location.hostname))location.replace('https:'+location.href.slice(5));

const APP_VER='20261124a';
(async()=>{try{if(!/^https?:/.test(location.protocol))return;const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});const j=await r.json();
 if(j&&j.v&&j.v!==APP_VER){const k='nljc_rl_'+j.v;if(!sessionStorage.getItem(k)){sessionStorage.setItem(k,'1');location.replace(location.pathname+'?v='+j.v+location.hash)}}}catch(e){}})();
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const LS={get(k,d){try{const v=localStorage.getItem('nljc_'+k);return v?JSON.parse(v):d}catch(e){return d}},
 set(k,v){try{localStorage.setItem('nljc_'+k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem('nljc_'+k)}catch(e){}}};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
const rand4=()=>String(1000+Math.floor(Math.random()*9000));
const vib=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};
const isEmoji=t=>/^\p{Extended_Pictographic}(️)?$/u.test(t);
const AVATARS=['🦊','🐻','🐼','🐯','🦁','🐸','🐵','🐱','🐶','🐰','🦄','🐙','🐧','🦉','🐺','🐲','👑','😎','🤠','👻','💀','👽','🤖','💃','🕺','👸','🤴','🧛','🥷','🌸','⚡','🔥','🍀','🌙','⭐','🎮','⚽','🏀','🎸','🚗'];
const DEF_AV=['🦊','🐼','🐯','🐸'];
const EMOJIS=['😂','😡','😘','😎','😱','👏','🔥','💔','🙈','🤬','❤️','🍀'];
const PHRASES=['Ne ljuti se! 😄','Čekaj ti mene…','Bravo! 👏','Hajde, baci!','Brže malo 🐢','Ups 😅','Osveta stiže 😈','Sreća ti je 🍀','Dobra igra 🤝','Volim te ❤️','Haha 😂','Nemoj meni!'];
const THROWS=['🍅','🥚','💋','🌹','💩','👊','🧊','🎉','❤️','🍺'];
const PEER_PREFIX='bashigre-';
const ICE={iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},
 {urls:'turn:openrelay.metered.ca:80',username:'openrelayproject',credential:'openrelayproject'},
 {urls:'turn:openrelay.metered.ca:443',username:'openrelayproject',credential:'openrelayproject'},
 {urls:'turn:openrelay.metered.ca:443?transport=tcp',username:'openrelayproject',credential:'openrelayproject'}]};
const STEP=170,MAXP=5;
const INSTA='https://instagram.com/basa.gtm',DONATE='https://paypal.me/basagtm';
const SK_DEF={rounds:3,time:80,hints:true,cats:Object.keys(typeof WORD_CATS!=='undefined'?WORD_CATS:{})};

const App={role:null,me:LS.get('me',null),peer:null,conn:null,conns:new Map(),lobby:null,game:null,st:null,shown:null,sk:null,skv:null,
 q:Promise.resolve(),pending:0,chat:[],unread:0,rot:0,lastThrow:0,lastRose:0,H:{},pel:{},code:'',profId:null};
if(!App.me||!App.me.id)App.me={id:uid(),nick:'',av:AVATARS[Math.floor(Math.random()*10)]};
if(!App.me.roses||typeof App.me.roses!=='object')App.me.roses={};
LS.set('me',App.me);

// ================= SOUND =================
const SFX={on:LS.get('snd',true)};let AC=null;
function ac(){if(!SFX.on)return null;try{if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){return null}return AC}
function tone(f,d,type,vol,delay,f2){const c=ac();if(!c)return;const t=c.currentTime+(delay||0);const o=c.createOscillator(),g=c.createGain();
 o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol||.2,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.03)}
function noise(d,vol,delay,freq,q){const c=ac();if(!c)return;const t=c.currentTime+(delay||0);const n=Math.max(1,Math.floor(c.sampleRate*d));
 const b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);
 const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=freq||2000;f.Q.value=q||1.5;
 const g=c.createGain();g.gain.value=vol||.4;s.connect(f);f.connect(g);g.connect(c.destination);s.start(t)}
const sfx={
 dice(){for(let i=0;i<9;i++)noise(.035,.6,i*.065+Math.random()*.03,1400+Math.random()*2600,2.2);noise(.09,.7,.66,380,1)},
 step(k){tone(520+k*28,.06,'triangle',.11)},exit(){tone(330,.2,'triangle',.2,0,880)},
 cap(){tone(900,.38,'sawtooth',.1,0,90);noise(.16,.8,.05,240,1)},
 home(){[784,988,1175].forEach((f,i)=>tone(f,.28,'sine',.15,i*.09))},
 win(){[523,659,784,1047,784,1047,1319].forEach((f,i)=>tone(f,.32,'triangle',.17,i*.13))},
 turn(){tone(880,.12,'sine',.12);tone(1320,.22,'sine',.1,.1)},pop(){tone(600,.09,'sine',.1,0,1000)},
 join(){tone(660,.1,'sine',.12);tone(990,.16,'sine',.12,.1)},
 rose(){[1047,1319,1568,2093,1568,2093].forEach((f,i)=>tone(f,.4,'sine',.09,i*.11))},
 ok(){[880,1109,1319].forEach((f,i)=>tone(f,.2,'triangle',.14,i*.07))},tick(){tone(1000,.04,'square',.04)},
 click(){tone(1200,.03,'sine',.05)}};
document.addEventListener('pointerdown',()=>ac(),{once:true});

// ================= UI HELPERS =================
function toast(t,ms){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),ms||2600)}
function showScreen(id){$$('.screen').forEach(s=>s.classList.toggle('on',s.id===id));ovl('drawer',false);window.scrollTo(0,0)}
function onScreen(id){return $('#'+id).classList.contains('on')}
function ovl(id,on){$('#'+id).classList.toggle('on',on)}
function setNet(ok){App.netOk=ok;const e=$('#gNet');if(e)e.classList.toggle('bad',!ok)}
function logoSVG(){return `<svg viewBox="0 0 400 160" aria-label="#Bash igre"><text x="6" y="98" font-size="100">#Bash</text>
 <text class="t2" x="268" y="140" font-size="52">igre</text><path class="ul" d="M24 120 C 110 108, 190 112, 252 118"/></svg>`}
function drawLogo(el){el.innerHTML=logoSVG();el.classList.remove('draw','done');void el.offsetWidth;el.classList.add('draw')}
document.addEventListener('click',e=>{const c=e.target.closest('[data-close]');if(c){ovl(c.dataset.close,false);return}
 const m=e.target.closest('[data-menu]');if(m){openDrawer();return}
 if(e.target.classList&&e.target.classList.contains('ovl')&&e.target.id!=='count')ovl(e.target.id,false)});

// ================= LUDO BOARD =================
(function defs(){let s='';COLORS.forEach((c,i)=>{
 s+=`<linearGradient id="lg${i}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.dark}"/><stop offset=".3" stop-color="${c.light}"/><stop offset=".55" stop-color="${c.hex}"/><stop offset="1" stop-color="${c.dark}"/></linearGradient>
 <radialGradient id="rg${i}" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#fff"/><stop offset=".18" stop-color="${c.light}"/><stop offset=".6" stop-color="${c.hex}"/><stop offset="1" stop-color="${c.dark}"/></radialGradient>`});
 $('#pawnDefs').innerHTML=s})();
const PAWN_IMG={};
function mute(hex,k){const n=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));const g=(n[0]+n[1]+n[2])/3;return '#'+n.map(v=>Math.round(v*(1-k)+g*k*.85).toString(16).padStart(2,'0')).join('')}
function pawnImg(i){if(!PAWN_IMG[i])PAWN_IMG[i]=PAWN3D.render(mute(COLORS[i].hex,.14),128);return PAWN_IMG[i]}
function pawnHTML(i){return `<div class="pr"><div class="pawn"><img src="${pawnImg(i)}" alt="" draggable="false"></div></div>`}
(function pawnVars(){const pw=1.1/.88*.86,ph=pw*PAWN3D.ASPECT,L=$('#layer');
 L.style.setProperty('--pw',(pw*100)+'%');L.style.setProperty('--ph',(ph*100)+'%');L.style.setProperty('--pl',((1-pw)/2*100)+'%');
 L.style.setProperty('--pt',((.5-PAWN3D.ANCHOR*ph)*100)+'%');L.style.setProperty('--pa',(PAWN3D.ANCHOR*100)+'%')})();
function boardSVG(R){
 const C=v=>v*10+5;let o=`<svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg"><defs>
 <radialGradient id="bgg" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#101010"/><stop offset="1" stop-color="#030303"/></radialGradient>
 <radialGradient id="fld" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#262626"/><stop offset=".7" stop-color="#121212"/><stop offset="1" stop-color="#070707"/></radialGradient>
 ${COLORS.map((c,i)=>`<radialGradient id="cf${i}" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="${mute(c.hex,.25)}"/><stop offset="1" stop-color="${c.dark}"/></radialGradient>`).join('')}
 <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.1"/></filter>
 </defs><rect width="110" height="110" fill="url(#bgg)"/>`;
 [[0,0],[9,0],[9,9],[0,9]].forEach(([qx,qy],i)=>{o+=`<rect x="${qx*10+1}" y="${qy*10+1}" width="18" height="18" rx="4.5" fill="#0c0c0c" stroke="#232323" stroke-width=".5"/>
  <rect x="${qx*10+1}" y="${qy*10+1}" width="18" height="18" rx="4.5" fill="none" stroke="${COLORS[i].hex}" stroke-width=".35" opacity=".45"/>`});
 o+=`<polygon points="${TRACK.map(c=>C(c[0])+','+C(c[1])).join(' ')}" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width=".8" stroke-linejoin="round"/>`;
 for(let i=0;i<4;i++){const a=TRACK[(START[i]+39)%40],b=FINISH[i][3];o+=`<line x1="${C(a[0])}" y1="${C(a[1])}" x2="${C(b[0])}" y2="${C(b[1])}" stroke="${COLORS[i].hex}" stroke-width=".9" opacity=".5"/>`}
 const field=(x,y,fill,stroke,sw)=>`<circle cx="${C(x)}" cy="${C(y)}" r="4.1" fill="${fill}" stroke="${stroke||'#2c2c2c'}" stroke-width="${sw||.5}"/>`;
 const star=(x,y)=>{let p='';for(let k=0;k<10;k++){const r=k%2?1.1:2.6,a=-Math.PI/2+k*Math.PI/5;p+=(C(x)+r*Math.cos(a)).toFixed(2)+','+(C(y)+r*Math.sin(a)).toFixed(2)+' '}return `<polygon points="${p}" fill="#7cff01" opacity=".55"/>`};
 TRACK.forEach((c,idx)=>{const si=START.indexOf(idx);o+=field(c[0],c[1],si>=0?`url(#cf${si})`:'url(#fld)',si>=0?COLORS[si].light:null);
  if(si>=0)o+=`<circle cx="${C(c[0])}" cy="${C(c[1])}" r="2.5" fill="none" stroke="#fff" stroke-width=".6" opacity=".7"/>`;
  if(R.safeFields&&SAFE.has(idx)&&si<0)o+=star(c[0],c[1]);
  if(R.safeFields&&si>=0)o+=`<circle cx="${C(c[0])}" cy="${C(c[1])}" r="1" fill="#fff" opacity=".85"/>`});
 for(let i=0;i<4;i++){FINISH[i].forEach(c=>{o+=field(c[0],c[1],'url(#fld)',COLORS[i].hex,.7)+`<circle cx="${C(c[0])}" cy="${C(c[1])}" r="1.5" fill="${COLORS[i].hex}" opacity=".55"/>`});
  HOME[i].forEach(c=>{o+=field(c[0],c[1],'#070707','#2a2a2a',.6)})}
 o+=`<rect x="50.3" y="50.3" width="9.4" height="9.4" rx="1.2" fill="#000" stroke="#7cff01" stroke-opacity=".35" stroke-width=".4"/>
  <g opacity=".6"><polygon points="55,55 50.9,50.9 50.9,59.1" fill="${COLORS[0].hex}"/><polygon points="55,55 50.9,50.9 59.1,50.9" fill="${COLORS[1].hex}"/>
  <polygon points="55,55 59.1,50.9 59.1,59.1" fill="${COLORS[2].hex}"/><polygon points="55,55 50.9,59.1 59.1,59.1" fill="${COLORS[3].hex}"/></g>
  <circle cx="55" cy="55" r="1.5" fill="#000" stroke="#7cff01" stroke-width=".5"/>`;
 return o+'</svg>';
}
const PIPS={1:[5],2:[1,9],3:[1,5,9],4:[1,3,7,9],5:[1,3,5,7,9],6:[1,3,4,6,7,9]};
const DFACE={1:[0,0],6:[0,180],3:[0,-90],4:[0,90],5:[-90,0],2:[90,0]};
$('#dice').innerHTML=[1,2,3,4,5,6].map(v=>`<div class="face f${v}">${PIPS[v].map(n=>`<i style="grid-row:${Math.ceil(n/3)};grid-column:${(n-1)%3+1}"></i>`).join('')}</div>`).join('');
let diceN=0;
function setDice(v,anim){if(!v)v=1;diceN++;const b=DFACE[v],sp=720*diceN,d=$('#dice');
 d.style.transition=anim?'transform .9s cubic-bezier(.15,.75,.25,1)':'none';d.style.transform=`rotateX(${b[0]+sp}deg) rotateY(${b[1]+sp}deg)`}
async function rollAnim(v){sfx.dice();vib(20);const w=$('#dw');w.classList.remove('throw');void w.offsetWidth;w.classList.add('throw');setDice(v,true);await sleep(950)}

// ================= LUDO PIECES / RENDER =================
function scrY(x,y){const k=App.rot||0;return k===0?y:k===1?x:k===2?10-y:10-x}
function pos(el,x,y){el.style.left=((x+.5)/11*100)+'%';el.style.top=((y+.5)/11*100)+'%';el.style.zIndex=Math.round(20+(scrY(x,y)+.5)*10)}
function chipFor(s){return $(`.chip[data-c="${(s+App.rot)%4}"]`)}
function buildGame(st){
 const my=st.seats.find(s=>s.active&&s.owner===App.me.id);
 App.rot=(App.role==='local'||!my)?0:(3-my.i+4)%4;
 const R=$('#rot');R.style.transform=`rotate(${App.rot*90}deg)`;R.style.setProperty('--ra',`${-App.rot*90}deg`);
 $('#boardSvg').innerHTML=boardSVG(st.rules);const L=$('#layer');L.innerHTML='';App.pel={};
 st.seats.forEach(s=>{if(!s.active)return;s.pieces.forEach((r,p)=>{const d=document.createElement('div');d.className='piece';d.dataset.s=s.i;d.dataset.p=p;
  d.innerHTML=pawnHTML(s.i);L.appendChild(d);App.pel[s.i+'-'+p]=d})});
 $('#diceHome').appendChild($('#dw'));
 $$('.chip').forEach(ch=>{const c=+ch.dataset.c,s=(c-App.rot+4)%4;ch.dataset.s=s;
  ch.innerHTML=`<div class="avw"><svg viewBox="0 0 48 48"><circle class="trk" cx="24" cy="24" r="22"/><circle class="tmr" cx="24" cy="24" r="22"/></svg><div class="av"></div></div>
   <div class="info"><div class="nm"></div><div class="sub"></div></div><div class="dslot"></div>`});
 setDice(st.die||1,false);hideWin();showScreen('sGame');
 $('#gRoom').innerHTML=App.role==='local'?'📱 Lokalna igra':`<span class="net${App.netOk===false?' bad':''}" id="gNet"></span>SOBA <b>${esc(App.code||'')}</b>`;
 $('.gchat').style.display=App.role==='local'?'none':'';renderChat();
}
function layout(st){
 const g={};st.seats.forEach(s=>{if(!s.active)return;s.pieces.forEach((r,p)=>{const c=cellOf(s.i,r,p),k=c[0]+','+c[1];(g[k]=g[k]||[]).push({s:s.i,p,c})})});
 const OFF=[[-.2,-.1],[.2,.12],[.2,-.14],[-.2,.15]];
 for(const k in g){const a=g[k];a.forEach((it,j)=>{const o=a.length>1?OFF[j%4]:[0,0];const el=App.pel[it.s+'-'+it.p];if(el)pos(el,it.c[0]+o[0],it.c[1]+o[1])})}
}
async function animMove(st){
 const lm=st.lastMove,el=App.pel[lm.seat+'-'+lm.p];if(!el)return;
 const path=[];if(lm.from===-1)path.push(cellOf(lm.seat,0,lm.p));else for(let r=lm.from+1;r<=lm.to;r++)path.push(cellOf(lm.seat,r,lm.p));
 el.classList.remove('can');el.classList.add('step');if(lm.from===-1)sfx.exit();
 for(let k=0;k<path.length;k++){pos(el,path[k][0],path[k][1]);el.classList.remove('hop');void el.offsetWidth;el.classList.add('hop');sfx.step(k);await sleep(STEP)}
 el.classList.remove('step','hop');
 for(const c of lm.caps||[]){const e2=App.pel[c.seat+'-'+c.p];if(!e2)continue;await sleep(90);sfx.cap();vib([40,40,80]);
  e2.classList.add('fly');const h=HOME[c.seat][c.p];pos(e2,h[0],h[1]);await sleep(560);e2.classList.remove('fly')}
 if(lm.from<40&&lm.to>=40){sfx.home();vib(30)}
}
function onState(st){
 st._recv=Date.now();App.st=st;App.pending++;
 App.q=App.q.then(()=>transition(App.shown,st)).catch(e=>console.error(e)).then(()=>{App.shown=st;App.pending--;if(App.pending===0&&App.st)renderHUD(App.st)});
}
async function transition(prev,st){
 if(!prev||prev.started!==st.started){buildGame(st);layout(st);renderHUD(st);if(st.phase==='over')setTimeout(()=>showWin(st),300);return}
 if(!onScreen('sGame'))showScreen('sGame');
 const fast=App.pending>3||document.hidden;
 if(st.rollId!==prev.rollId){if(fast)setDice(st.die,false);else await rollAnim(st.die)}
 if(st.lastMove&&st.lastMove.id!==(prev.lastMove&&prev.lastMove.id)&&!fast)await animMove(st);
 layout(st);renderHUD(st);
 const cur=st.seats[st.turn];
 if(App.role!=='local'&&cur.owner===App.me.id&&st.phase==='roll'&&(prev.turn!==st.turn||prev.phase!=='roll')){sfx.turn();vib(60)}
 if(st.phase==='over'&&prev.phase!=='over'){await sleep(500);showWin(st)}
}
function mine(st){return st&&st.seats[st.turn].owner===App.me.id&&st.phase!=='over'}
function renderHUD(st){
 if(!st)return;const me=App.me.id,M=MODES[st.mode];
 $$('.chip').forEach(ch=>{const i=+ch.dataset.s,s=st.seats[i];if(!s)return;const side=ch.classList.contains('R')?'R':'L';
  if(!s.active){ch.className='chip off '+side;return}
  const home=s.pieces.filter(r=>r===-1).length,fin=s.pieces.filter(r=>r>=40).length;
  const pl=App.lobby&&App.lobby.players&&App.lobby.players[s.owner];const off=s.owner!=='bot'&&App.role!=='local'&&pl&&!pl.online;
  const team=M.teams?`<span class="tm">${s.side===0?'A':'B'}</span>`:'';const act=st.turn===i&&st.phase!=='over';
  ch.className='chip '+side+(act?' act':'')+(s.fin?' done':'');ch.style.setProperty('--c',COLORS[i].hex);
  ch.querySelector('.av').textContent=s.av;
  ch.querySelector('.nm').innerHTML=`${esc(s.name)}${s.owner===me&&App.role!=='local'?' <em>(ti)</em>':''}${team}`;
  const rz=pl?rosesTotal(pl.roses):0;
  ch.querySelector('.sub').innerHTML=s.fin?`🏆 ${s.fin}. u cilju`:`🏠${home} 🏁${fin}/4${rz?' 🌹'+rz:''}${s.owner==='bot'?' 🤖':''}${off?' <b class="offl">offline</b>':''}`;
  const t=ch.querySelector('.tmr');t.style.transition='none';
  if(act&&st.turnMs>0&&st.turnTotal>0&&(st.phase==='roll'||st.phase==='move')){const rem=st.turnMs-(Date.now()-st._recv);
   if(rem>0){t.style.strokeDashoffset=(139*(1-Math.min(1,rem/st.turnTotal)))+'';void t.getBoundingClientRect();t.style.transition=`stroke-dashoffset ${rem}ms linear`;t.style.strokeDashoffset='139'}}
  else t.style.strokeDashoffset=act?'0':'139';
 });
 $$('.prow').forEach(r=>r.classList.toggle('solo',r.querySelectorAll('.chip:not(.off)').length===1));
 const tc=chipFor(st.turn),ds=tc&&tc.querySelector('.dslot');if(ds&&$('#dw').parentNode!==ds)ds.appendChild($('#dw'));
 $('#names').innerHTML=st.seats.filter(s=>s.active).map(s=>{const c=(s.i+App.rot)%4,L=c===0||c===3,T=c<2;
  const p2=(L?'left':'right')+':1.4%;'+(T?'top:19%':'bottom:25%');
  return `<div class="nlab${st.turn===s.i&&st.phase!=='over'?' act':''}${s.owner===me&&App.role!=='local'?' me':''}" style="--c:${COLORS[s.i].hex};${p2}">${esc(s.av)} ${esc(s.name)}${s.fin?' 🏆':''}</div>`}).join('');
 const cur=st.seats[st.turn],my=mine(st)&&App.pending<=1,canRoll=my&&st.phase==='roll',canMove=my&&st.phase==='move';
 let main,sub=st.msg||'';
 if(st.phase==='over')main='🏁 Kraj igre';
 else if(cur.owner===me){main=canRoll?(App.role==='local'?`${cur.name}, baci kockicu! 🎲`:'Ti si na potezu – baci! 🎲'):canMove?`${App.role==='local'?cur.name+': i':'I'}zaberi figuru (${st.die})`:(st.phase==='pause'?`${cur.name} – ${st.die}`:'…')}
 else main='';
 if(canMove&&!sub)sub='Dodirni figuru koja svijetli';if(canRoll&&!sub)sub='Dodirni kockicu';
 $('#stMain').textContent=main;$('#stSub').textContent=sub;$('#sGame .ctrl').style.visibility=main||sub?'visible':'hidden';
 $('#dw').classList.toggle('can',canRoll);
 Object.values(App.pel).forEach(e=>e.classList.remove('can'));$$('#layer .target').forEach(e=>e.remove());
 if(canMove){const L=$('#layer');st.legal.forEach(m=>{const e=App.pel[st.turn+'-'+m.p];if(e)e.classList.add('can');
  const c=cellOf(st.turn,m.to,m.p),t=document.createElement('div');t.className='target';t.dataset.p=m.p;
  t.style.left=((c[0]+.5)/11*100)+'%';t.style.top=((c[1]+.5)/11*100)+'%';L.appendChild(t)})}
}
function showWin(st){
 const rk=st.ranking||computeRanking(st),w=rk[0],mySeats=st.seats.filter(s=>s.active&&s.owner===App.me.id).map(s=>s.i);
 const iWon=App.role!=='local'&&w&&w.seats.some(i=>mySeats.includes(i));const iLost=App.role!=='local'&&!iWon&&mySeats.length;
 $('#wTro').textContent=iLost?'😤':'🏆';
 $('#wTitle').textContent=iWon?'Pobjeda! 🎉':iLost?'Ne ljuti se! 😄':`${w?w.label:''} pobjeđuje!`;
 $('#wRank').innerHTML=rk.map(r=>`<div class="rk"><span class="pn">${['🥇','🥈','🥉'][r.place-1]||r.place+'.'}</span>${r.seats.map(i=>`<span class="cd" style="background:${COLORS[i].hex}"></span>`).join('')}
  <b>${esc(r.label)}</b><small>💥${r.caps} · 😵${r.lost} · 6️⃣×${r.sixes}</small></div>`).join('')+`<p class="muted" style="margin-top:8px">💥 izbacio · 😵 izbačen · 6️⃣ broj šestica</p>`;
 winButtons();ovl('win',true);sfx.win();vib([80,60,80,60,200]);confetti();
}
function winButtons(){const host=App.role!=='guest';$('#win .btn.ghost').textContent=App.unv||App.rmv?'Pogledaj sto':App.skv?'Pogledaj crtež':'Pogledaj ploču';$('#wAgain').style.display=host?'':'none';$('#wLobby').style.display=host?'':'none';$('#wWait').style.display=host?'none':''}
function hideWin(){ovl('win',false)}
function confetti(){const c=$('#confetti'),x=c.getContext('2d');c.width=innerWidth*devicePixelRatio;c.height=innerHeight*devicePixelRatio;x.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
 const cols=['#7cff01','#ffffff','#a6ff5c','#d0d0d0','#5fcf00'];
 const P=[];for(let i=0;i<170;i++)P.push({x:innerWidth/2+(Math.random()-.5)*80,y:innerHeight*.35,vx:(Math.random()-.5)*12,vy:-Math.random()*13-4,r:Math.random()*6+3,c:cols[i%5],a:Math.random()*6,va:(Math.random()-.5)*.4});
 const t0=performance.now();(function f(t){x.clearRect(0,0,innerWidth,innerHeight);P.forEach(p=>{p.vy+=.32;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;x.save();x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle=p.c;x.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);x.restore()});
  if(t-t0<4500)requestAnimationFrame(f);else x.clearRect(0,0,innerWidth,innerHeight)})(t0)}

// ================= CHAT / REACTIONS / THROWS / ROSES =================
function seatOfPlayer(st,id){if(!st)return null;const a=st.seats.filter(s=>s.active&&s.owner===id);return a.find(s=>s.i===st.turn)||a[0]||null}
function pName(id){const p=App.lobby&&App.lobby.players[id];return p?p.nick:'?'}
function showReact(m){
 const st=App.st;let el=null;
 if(st&&onScreen('sGame')){const s=seatOfPlayer(st,m.from);if(s)el=chipFor(s.i)}
 if(!el)return false;
 const r=el.querySelector('.avw').getBoundingClientRect(),b=document.createElement('div');
 const below=r.top<130;b.className='bub'+(isEmoji(m.e)?' big':'')+(below?' below':'');b.textContent=m.e;
 b.style.left=Math.max(120,Math.min(innerWidth-120,r.left+r.width/2))+'px';b.style.top=(below?r.bottom+4:r.top-2)+'px';document.body.appendChild(b);
 setTimeout(()=>b.remove(),2900);return true;
}
function onChat(m){
 if(App.chat.some(x=>x.id===m.id))return;App.chat.push(m);if(App.chat.length>100)App.chat.shift();renderChat();
 if(!m.sys&&m.from!==App.me.id){showReact({from:m.from,e:m.text});sfx.pop();vib(15)}
}
function updBadge(){}
function feedHTML(list){const me=App.me.id;return list.slice(-60).map(m=>m.sys?`<div class="fm sys ${m.sys}">${esc(m.text)}</div>`:
 `<div class="fm${m.from===me?' me':''}${isEmoji(m.text)?' big':''}"><span class="fa">${esc(m.av)}</span><b>${esc(m.nick)}</b><span class="ft">${esc(m.text)}</span></div>`).join('')}
function fillFeed(el,list,empty){const atBottom=el.scrollHeight-el.scrollTop-el.clientHeight<60;el.innerHTML=feedHTML(list)||`<div class="fm sys">${empty}</div>`;if(atBottom||!el._init){el.scrollTop=el.scrollHeight;el._init=1}}
function renderChat(){
 if(onScreen('sLobby'))fillFeed($('#lFeed'),App.chat,'Pozdravi ekipu u sobi 👋');
 if(onScreen('sGame'))fillFeed($('#gFeed'),App.chat,'Chat sobe – piši ovdje 💬');
 if(onScreen('sSketch'))fillFeed($('#skChat'),App.chat,'Pogađaj ovdje ✍️');
 if(onScreen('sUno'))fillFeed($('#unFeed'),App.chat,'Chat stola 💬');
 if(onScreen('sRemi'))fillFeed($('#rmFeed'),App.chat,'Chat stola 💬');
}
function sendChat(t){t=String(t||'').trim();if(!t)return;act('chat',{text:t})}
$('#emoE').innerHTML=EMOJIS.map(e=>`<button>${e}</button>`).join('');$('#emoP').innerHTML=PHRASES.map(e=>`<button>${esc(e)}</button>`).join('');
function chatSend(bar,text){text=String(text||'').trim();if(!text)return;if(bar.dataset.chat==='global'){if(typeof gChat==='function')gChat(text)}else sendChat(text)}
document.addEventListener('click',e=>{
 const eb=e.target.closest('.cbar .eb');const pop=$('#emoPop');
 if(eb){const bar=eb.closest('.cbar');if(pop.parentNode!==bar||!pop.classList.contains('on')){bar.appendChild(pop);pop.classList.add('on')}else pop.classList.remove('on');return}
 const pb=e.target.closest('#emoPop button');if(pb){chatSend(pop.parentNode,pb.textContent);pop.classList.remove('on');return}
 const sb=e.target.closest('.cbar .sb');if(sb){const bar=sb.closest('.cbar'),inp=bar.querySelector('input');chatSend(bar,inp.value);inp.value='';pop.classList.remove('on');return}
 if(!e.target.closest('#emoPop'))pop.classList.remove('on')});
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const inp=e.target.closest&&e.target.closest('.cbar input');if(!inp)return;e.preventDefault();chatSend(inp.closest('.cbar'),inp.value);inp.value=''});
function rosesTotal(r){let n=0;for(const k in (r||{}))n+=(r[k]|0);return n}
function mergeRoses(a,b){const o=Object.assign({},a||{});for(const k in (b||{}))o[k]=Math.max(o[k]|0,b[k]|0);return o}
function cleanRoses(r){const o={};if(!r||typeof r!=='object')return o;Object.keys(r).slice(0,40).forEach(k=>{const v=Math.min(99999,Math.max(0,r[k]|0));if(v)o[String(k).slice(0,14)]=v});return o}
function onRose(m){
 sfx.rose();if(m.to===App.me.id)vib([60,40,60,40,120]);
 const fx=document.createElement('div');fx.className='rosefx';
 let hs='';for(let i=0;i<14;i++)hs+=`<span class="h" style="--dx:${(Math.random()-.5)*300}px;--dy:${-80-Math.random()*260}px;animation-delay:${.3+Math.random()*.8}s">${Math.random()<.5?'❤️':'💖'}</span>`;
 fx.innerHTML=`<div class="r">🌹</div><div class="t">${esc(m.fromNick)} ➜ ${esc(m.toNick)}${m.to===App.me.id?'<br><small style="font-size:20px">Imaš '+m.total+' 🌹</small>':''}</div>${hs}`;
 document.body.appendChild(fx);setTimeout(()=>fx.remove(),3000);
}
function openProfile(id,seat){
 const lb=App.lobby;let name,av,color='#7cff01',st=App.st;
 if(seat!=null&&st){const s=st.seats[seat];name=s.name;av=s.av;color=COLORS[seat].hex;id=s.owner!=='bot'?s.owner:null}
 const p=id&&lb&&lb.players[id];if(!p&&seat==null)return;
 if(seat==null){name=p.nick;av=p.av}
 App.profId=id;App.profSeat=seat;App.profSrc='room';
 $('#prof .panel').style.setProperty('--c',color);$('#pfAv').textContent=av;$('#pfName').textContent=name;
 const parts=[];if(seat!=null)parts.push(COLORS[seat].name);if(id===lb.host&&App.role!=='local')parts.push('👑 domaćin');if(id===App.me.id&&App.role!=='local')parts.push('ti');if(seat!=null&&st.seats[seat].owner==='bot')parts.push('🤖 bot');
 if(p&&!p.online)parts.push('offline');$('#pfSub').textContent=parts.join(' · ');
 const r=id===App.me.id?mergeRoses(App.me.roses,p&&p.roses):(p&&p.roses)||{};const tot=rosesTotal(r);
 $('#pfRoses').innerHTML=id&&App.role!=='local'?`<div class="rosebox"><b>🌹 ${tot}</b>${tot?'ruž'+(tot===1?'a':tot<5?'e':'a')+' · '+Object.entries(r).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`od ${esc(k)} ×${v}`).join(', '):'još nema ruža'}</div>`:'';
 let stats='';
 if(seat!=null&&st){const s=st.seats[seat],fin=s.pieces.filter(x=>x>=40).length,trk=s.pieces.filter(x=>x>=0&&x<40).length;
  stats=[[s.stats.caps,'💥 izbacio'],[s.stats.lost,'😵 izbačen'],[s.stats.sixes,'🎲 šestica'],[s.stats.rolls,'bacanja'],[trk,'na stazi'],[fin+'/4','🏁 u cilju']].map(([v,l])=>`<div><b>${v}</b><span>${l}</span></div>`).join('')}
 else if(App.skv&&id&&App.skv.scores&&App.skv.scores[id]!=null){stats=`<div><b>${App.skv.scores[id]}</b><span>🎨 bodova</span></div>`}
 $('#pfSt').innerHTML=stats;$('#pfSt').style.display=stats?'':'none';
 $('#pfRose').style.display=id&&id!==App.me.id&&App.role!=='local'&&p?'':'none';
 const canThrow=seat!=null&&App.role!=='local'&&st&&st.seats[seat].owner!==App.me.id&&seatOfPlayer(st,App.me.id)&&onScreen('sGame');
 $('#pfThrowW').style.display=canThrow?'':'none';$('#pfThrow').innerHTML=THROWS.map(t=>`<button data-to="${seat}">${t}</button>`).join('');
 ovl('prof',true);
}
function showThrow(m){
 const st=App.st;if(!st||!onScreen('sGame'))return;
 const fs=seatOfPlayer(st,m.from),tc=chipFor(m.to);if(!tc)return;
 const tr=tc.querySelector('.avw').getBoundingClientRect();
 let fr;if(fs)fr=chipFor(fs.i).querySelector('.avw').getBoundingClientRect();else fr={left:innerWidth/2-20,top:innerHeight-80,width:40,height:40};
 const x0=fr.left+fr.width/2-20,y0=fr.top+fr.height/2-20,x1=tr.left+tr.width/2-20,y1=tr.top+tr.height/2-20;
 const e=document.createElement('div');e.className='flyi';e.textContent=m.item;document.body.appendChild(e);tone(300,.5,'sine',.06,0,900);
 const a=e.animate([{transform:`translate(${x0}px,${y0}px) scale(.7) rotate(0)`},{transform:`translate(${(x0+x1)/2}px,${Math.min(y0,y1)-110}px) scale(1.5) rotate(360deg)`},{transform:`translate(${x1}px,${y1}px) scale(1.1) rotate(720deg)`}],{duration:850,easing:'cubic-bezier(.4,0,.6,1)'});
 a.onfinish=()=>{e.style.transform=`translate(${x1}px,${y1}px)`;noise(.18,.9,0,500,1);tone(160,.2,'square',.07);
  tc.classList.remove('hit');void tc.offsetWidth;tc.classList.add('hit');if(st.seats[m.to].owner===App.me.id)vib([60,40,60]);
  e.animate([{transform:`translate(${x1}px,${y1}px) scale(1.1)`,opacity:1},{transform:`translate(${x1}px,${y1+6}px) scale(2.6)`,opacity:.9,offset:.3},{transform:`translate(${x1}px,${y1+30}px) scale(2.2)`,opacity:0}],{duration:1300,easing:'ease-out'}).onfinish=()=>e.remove()};
}

// ================= HOST CORE =================
function seatName(lb,i){const sc=lb.seatCfg[i];if(sc.name)return sc.name;if(sc.owner==='bot')return 'Bot '+COLORS[i].name;const p=lb.players[sc.owner];return p?p.nick:'?'}
function seatAv(lb,i){const sc=lb.seatCfg[i];if(sc.owner==='bot')return '🤖';if(!sc.name&&lb.players[sc.owner])return lb.players[sc.owner].av;return DEF_AV[i]}
function autoAssign(lb){
 const M=MODES[lb.mode];lb.seatCfg=[0,1,2,3].map(()=>({owner:'bot',name:''}));
 if(lb.local){M.groups.forEach((g,gi)=>g.forEach(i=>lb.seatCfg[i]={owner:App.me.id,name:gi===0?'':'Igrač '+(gi+1)}));return}
 const people=[lb.host,...Object.keys(lb.players).filter(id=>id!==lb.host&&lb.players[id].online)];
 M.groups.forEach((g,gi)=>{const o=people[gi]||'bot';g.forEach(i=>lb.seatCfg[i]={owner:o,name:''})});
}
function bcast(m,except){App.conns.forEach((c,id)=>{if(id===except)return;try{if(c.open)c.send(m)}catch(e){}})}
function sendTo(id,m){if(id===App.me.id)return false;const c=App.conns.get(id);if(c&&c.open)try{c.send(m);return true}catch(e){}return false}
function bcastLobby(){if(App.role==='host')bcast({t:'lobby',lb:App.lobby});saveGame();if(onScreen('sLobby'))renderLobby();if(typeof gAnnounce==='function')gAnnounce()}
function saveGame(){if(App.role==='host'||App.role==='local')LS.set('save',{role:App.role,lobby:App.lobby,game:App.game,code:App.code,ts:Date.now()})}
function sysAll(text,kind){const m={id:uid(),sys:kind||'all',text,ts:Date.now()};bcast({t:'chat',m});onChat(m)}
function sysTo(id,text,kind){const m={id:uid(),sys:kind||'priv',text,ts:Date.now()};if(id===App.me.id)onChat(m);else sendTo(id,{t:'chat',m})}
function afterChange(){
 const g=App.game,H=App.H;if(!g)return;g.v++;
 if(g.rollId!==H.rollSeen){H.rollSeen=g.rollId;H.busyUntil=Math.max(H.busyUntil||0,Date.now()+1000)}
 if(g.lastMove&&g.lastMove.id!==H.moveSeen){H.moveSeen=g.lastMove.id;const n=g.lastMove.from===-1?1:g.lastMove.to-g.lastMove.from;
  H.busyUntil=Math.max(H.busyUntil||0,Date.now())+n*STEP+(g.lastMove.caps.length?700:0)+250}
 schedule();
 g.turnMs=H.deadline?Math.max(0,H.deadline-Date.now()):0;g.turnTotal=(g.rules.turnTime||0)*1000;
 const snap=JSON.parse(JSON.stringify(g));bcast({t:'state',st:snap});onState(snap);saveGame();
}
function schedule(){
 const H=App.H,g=App.game;clearTimeout(H.timer);H.deadline=0;if(!g||g.phase==='over')return;
 const wait=b=>Math.max(b,(H.busyUntil||0)-Date.now()+b*.6);
 const run=fn=>()=>{if(App.game!==g)return;fn();afterChange()};
 if(g.phase==='pause'){H.timer=setTimeout(run(()=>nextTurn(g)),wait(1150));return}
 const s=g.seats[g.turn],human=s.owner!=='bot';
 const online=human&&(s.owner===App.me.id||(App.lobby.players[s.owner]&&App.lobby.players[s.owner].online));
 const auto=run(()=>{if(g.phase==='roll')doRoll(g,g.turn);else if(g.phase==='move')doMove(g,g.turn,botPick(g,g.turn))});
 if(!human){H.timer=setTimeout(auto,wait(g.phase==='roll'?850:700));return}
 if(!online){H.timer=setTimeout(auto,wait(2500));return}
 if(g.phase==='move'&&g.rules.autoSingle&&uniqMoves(g.legal)===1){H.timer=setTimeout(run(()=>doMove(g,g.turn,g.legal[0].p)),wait(600));return}
 if(g.rules.turnTime>0){const ms=g.rules.turnTime*1000+Math.max(0,(H.busyUntil||0)-Date.now());H.deadline=Date.now()+ms;H.timer=setTimeout(auto,ms)}
}
function hostChat(id,text){
 text=String(text||'').replace(/\s+/g,' ').trim().slice(0,120);if(!text)return;
 if(typeof skGuess==='function'&&App.sk&&skGuess(id,text))return;
 const p=App.lobby.players[id]||{nick:'?',av:'🙂'};const m={id:uid(),from:id,nick:p.nick,av:p.av,text,ts:Date.now()};bcast({t:'chat',m});onChat(m);
}
function hostRose(from,to){
 const lb=App.lobby;if(!lb||from===to||!lb.players[to]||!lb.players[from])return;
 const now=Date.now();App.H.rz=App.H.rz||{};if(now-(App.H.rz[from]||0)<1500)return;App.H.rz[from]=now;
 const fn=lb.players[from].nick,tn=lb.players[to].nick,L=LS.get('ledger',{});
 L[to]=mergeRoses(L[to],lb.players[to].roses);L[to][fn]=(L[to][fn]|0)+1;LS.set('ledger',L);lb.players[to].roses=L[to];
 if(to===App.me.id){App.me.roses=mergeRoses(App.me.roses,L[to]);LS.set('me',App.me);renderHomeRoses()}
 const m={t:'rose',from,to,fromNick:fn,toNick:tn,total:rosesTotal(L[to])};bcast(m);onRose(m);
 sysAll(`🌹 ${fn} je poklonio/la ružu → ${tn} (ukupno ${m.total})`,'rose');bcastLobby();if(App.st)renderHUD(App.st);
}
function hostAction(id,d){
 if(d.t==='chat'||d.t==='react'){hostChat(id,d.text||d.e);return}
 if(d.t==='rose'){hostRose(id,String(d.to||''));return}
 if(d.t==='throw'){const g=App.game;if(!g)return;const to=d.to|0;if(!g.seats[to]||!g.seats[to].active||!THROWS.includes(d.item))return;
  if(!g.seats.some(s=>s.active&&s.owner===id))return;const now=Date.now();App.H.thr=App.H.thr||{};if(now-(App.H.thr[id]||0)<1200)return;App.H.thr[id]=now;
  const m={t:'throw',from:id,to,item:d.item};bcast(m);showThrow(m);return}
 if(String(d.t).startsWith('sk_')){if(typeof skHostAction==='function')skHostAction(id,d);return}
 if(String(d.t).startsWith('un_')){if(typeof unHostAction==='function')unHostAction(id,d);return}
 if(String(d.t).startsWith('rm_')){if(typeof rmHostAction==='function')rmHostAction(id,d);return}
 const g=App.game;if(!g||g.phase==='over')return;if(g.seats[g.turn].owner!==id)return;
 if(d.t==='roll'&&doRoll(g,g.turn))afterChange();
 if(d.t==='move'&&doMove(g,g.turn,d.p|0))afterChange();
}
function hostMsg(c,d){
 if(!d||typeof d!=='object')return;
 if(d.t==='hello'){const id=String(d.id||'').slice(0,40);if(!id)return;const lb=App.lobby;
  const known=!!lb.players[id],online=Object.values(lb.players).filter(p=>p.online).length;
  if(!known&&online>=MAXP){try{c.send({t:'full'})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},400);return}
  const old=App.conns.get(id);if(old&&old!==c)try{old.close()}catch(e){}
  c._cid=id;App.conns.set(id,c);
  const nick=String(d.nick||'Gost').slice(0,14),av=String(d.av||'🙂').slice(0,4);
  const L=LS.get('ledger',{});const rz=mergeRoses(L[id],cleanRoses(d.roses));if(rosesTotal(rz)){L[id]=rz;LS.set('ledger',L)}
  lb.players[id]=Object.assign(lb.players[id]||{},{nick,av,online:true,roses:rz});if(!known)lb.players[id].ready=false;
  if(!known&&!App.game&&!App.sk&&!App.un&&!App.rm)autoAssign(lb);
  if(App.game){const g=App.game;g.seats.forEach(s=>{if(s.active&&s.owner===id){s.name=nick;s.av=av}});
   if(!g.seats.some(s=>s.active&&s.owner===id)&&g.phase!=='over'){const grp=MODES[g.mode].groups.find(gr=>gr.every(i=>g.seats[i].owner==='bot'));
    if(grp){grp.forEach(i=>{g.seats[i].owner=id;g.seats[i].name=nick;g.seats[i].av=av;lb.seatCfg[i]={owner:id,name:''}});
     addLog(g,`👋 ${nick} preuzima ${grp.map(i=>COLORS[i].name).join(' i ')} od bota!`)}}}
  toast(`${av} ${nick} ${known?'se vratio/la':'je u sobi'}`);sfx.join();
  try{c.send({t:'chatlog',list:App.chat.filter(m=>m.sys!=='priv')});c.send({t:'lobby',lb});c.send({t:'state',st:App.game?JSON.parse(JSON.stringify(App.game)):null})}catch(e){}
  if(App.sk&&typeof skOnJoin==='function')skOnJoin(id);
  if(App.un&&typeof unOnJoin==='function')unOnJoin(id);
  if(App.rm&&typeof rmOnJoin==='function')rmOnJoin(id);
  bcastLobby();if(App.game)afterChange();return}
 if(!c._cid)return;
 if(d.t==='ready'){const p=App.lobby.players[c._cid];if(p){p.ready=!!d.v;if(p.ready){sfx.pop();toast(`✅ ${p.nick} je spreman/na!`)}bcastLobby()}return}
 hostAction(c._cid,d);
}
function hostClosed(c){const id=c._cid;if(!id||App.conns.get(id)!==c)return;App.conns.delete(id);
 const p=App.lobby&&App.lobby.players[id];if(p){p.online=false;p.ready=false;toast(`⚠️ ${p.nick} je izgubio/la vezu…`)}
 if(!App.game&&!App.sk&&!App.un&&!App.rm&&App.lobby&&!App.lobby.local)autoAssign(App.lobby);
 bcastLobby();if(App.game)afterChange();if(App.sk&&typeof skOnLeave==='function')skOnLeave(id);if(App.un&&typeof unOnLeave==='function')unOnLeave(id);if(App.rm&&typeof rmOnLeave==='function')rmOnLeave(id)}
function hostOpen(code){
 if(typeof Peer==='undefined'){toast('Online dio se nije učitao – provjeri internet i osvježi stranicu.',4000);return false}
 App.code=code;const pr=new Peer(PEER_PREFIX+code,{config:ICE,debug:0});App.peer=pr;
 pr.on('open',()=>{if(App.peer!==pr)return;App.lobby.code=code;App.code=code;setNet(true);renderLobby();if(typeof gAnnounce==='function')gAnnounce(true);if(onScreen('sGame'))$('#gRoom').innerHTML=`<span class="net" id="gNet"></span>SOBA <b>${code}</b>`;saveGame()});
 pr.on('connection',c=>{c.on('data',d=>hostMsg(c,d));c.on('close',()=>hostClosed(c));c.on('error',()=>hostClosed(c))});
 pr.on('disconnected',()=>{setNet(false);setTimeout(()=>{if(App.peer===pr&&!pr.destroyed)try{pr.reconnect()}catch(e){}},1500)});
 pr.on('error',e=>{if(App.peer!==pr)return;
  if(e.type==='unavailable-id'){pr.destroy();if((App.resumeTries||0)>0){App.resumeTries--;setTimeout(()=>hostOpen(code),2500)}else hostOpen(rand4())}
  else if(['network','server-error','socket-error','socket-closed'].includes(e.type)){setNet(false);toast('Problem s vezom, pokušavam ponovo…')}});
 return true;
}

// ================= GUEST =================
function guestJoin(code){
 if(typeof Peer==='undefined'){toast('Online dio se nije učitao – provjeri internet i osvježi stranicu.',4000);return}
 App.role='guest';App.code=code;App.leaving=false;LS.set('save',{role:'guest',code,ts:Date.now()});
 if(typeof BUS!=='undefined')BUS.init();
 if(!App.lobby){showScreen('sLobby');$('#lCode').textContent=code;$('#lPlayers').innerHTML=`<p class="muted"><span class="spin"></span> Spajam se na sobu ${esc(code)}…${App.joinFails?' (pokušaj '+(App.joinFails+1)+'/4)':''}<br><span id="lNet">📡 ${App.netN||0}/${NET.brokers.length}</span> servera</p>`;
  ['#bStart','#bReady','#bStartBots'].forEach(s=>$(s).style.display='none');$('#lWait').style.display='none'}
 const go=()=>{const c=App.peer.connect(PEER_PREFIX+code,{reliable:true,serialization:'json'});App.conn=c;let ok=false;
  const t=setTimeout(()=>{if(!ok){try{c.close()}catch(e){}retryJoin()}},11000);
  c.on('open',()=>{ok=true;clearTimeout(t);App.joinFails=0;setNet(true);c.send({t:'hello',id:App.me.id,nick:App.me.nick,av:App.me.av,roses:App.me.roses})});
  c.on('data',guestMsg);
  c.on('close',()=>{if(App.conn===c){setNet(false);if(ok){toast('Veza prekinuta – ponovo se spajam…');retryJoin()}}})};
 if(App.peer&&!App.peer.destroyed&&App.peer.open){go();return}
 if(App.peer)try{App.peer.destroy()}catch(e){}
 const pr=new Peer({config:ICE,debug:0});App.peer=pr;
 pr.on('open',()=>{if(App.peer===pr)go()});
 pr.on('error',e=>{if(App.peer!==pr)return;if(e.type==='peer-unavailable'&&!App.lobby)toast(`Soba ${code} nije pronađena – provjeri kod.`);retryJoin()});
 pr.on('disconnected',()=>{setTimeout(()=>{if(App.peer===pr&&!pr.destroyed)try{pr.reconnect()}catch(e){}},1500)});
}
function retryJoin(){if(App.role!=='guest'||App.leaving)return;App.joinFails=(App.joinFails||0)+1;
 if(!App.lobby&&App.joinFails>=4){toast(App.netN?'Soba nije pronađena. Provjeri kod, i da domaćin ima istu (najnoviju) verziju i da je u sobi.':'Nema veze sa serverima – provjeri internet (probaj i Wi-Fi/mobilne podatke).',6000);leave();return}
 clearTimeout(App.rj);App.rj=setTimeout(()=>{if(App.role==='guest'&&!App.leaving&&!(App.conn&&App.conn.open))guestJoin(App.code)},2500)}
function guestMsg(d){
 if(!d||!d.t)return;
 switch(d.t){
  case 'lobby':{App.lobby=d.lb;const p=d.lb.players[App.me.id];if(p&&p.roses){const before=rosesTotal(App.me.roses);App.me.roses=mergeRoses(App.me.roses,p.roses);if(rosesTotal(App.me.roses)!==before)LS.set('me',App.me)}
   if(!App.st&&!App.skv&&!App.unv&&!App.rmv){if(!onScreen('sLobby'))showScreen('sLobby');renderLobby()}else if(App.st)renderHUD(App.st);
   if($('#settings').classList.contains('on'))renderSettings();break}
  case 'state':if(d.st)onState(d.st);break;
  case 'back':toLobbyView();break;
  case 'chat':if(d.m)onChat(d.m);break;
  case 'chatlog':if(Array.isArray(d.list)){App.chat=d.list.slice(-100);renderChat()}break;
  case 'throw':showThrow(d);break;
  case 'rose':onRose(d);break;
  case 'count':countdown();break;
  case 'pm':pmOpen(d);break;
  case 'full':toast('Soba je puna (najviše 5 igrača).',3500);leave();break;
  case 'bye':toast('Domaćin je zatvorio sobu.');leave();break;
  default:if(String(d.t).startsWith('rm')&&typeof rmOnMsg==='function')rmOnMsg(d);else if(String(d.t).startsWith('sk')&&typeof skOnMsg==='function')skOnMsg(d);else if(String(d.t).startsWith('un')&&typeof unOnMsg==='function')unOnMsg(d);
 }
}
function act(t,extra){
 if((t==='roll'||t==='move')&&App.pending>0)return;const m=Object.assign({t},extra||{});
 if(App.role==='guest'){if(App.conn&&App.conn.open)App.conn.send(m);else toast('Nema veze s domaćinom…')}
 else hostAction(App.me.id,m);
}

// ================= LOBBY =================
function settings(){const s=LS.get('settings',{});return {game:s.game||'ludo',mode:MODES[s.mode]?s.mode:'1v1',rules:Object.assign({},DEFAULT_RULES,s.rules||{}),sk:(()=>{const k=Object.assign({},SK_DEF,s.sk||{});k.cats=(k.cats||[]).filter(c=>WORDS[c]);if(!k.cats.length)k.cats=Object.keys(WORDS);return k})(),uno:Object.assign({},UN_DEF,s.uno||{}),rm:Object.assign({},RM_DEF,s.rm||{})}}
function createRoom(local){
 if(!saveNick())return;const s=settings();
 App.role=local?'local':'host';App.leaving=false;App.game=null;App.st=null;App.shown=null;App.sk=null;App.skv=null;App.H={};App.chat=[];
 const L=LS.get('ledger',{});
 App.lobby={code:'',host:App.me.id,local,game:local?'ludo':s.game,mode:s.mode,rules:s.rules,sk:s.sk,uno:s.uno,rm:s.rm,
  players:{[App.me.id]:{nick:App.me.nick,av:App.me.av,online:true,ready:true,roses:mergeRoses(L[App.me.id],App.me.roses)}},seatCfg:[]};
 autoAssign(App.lobby);showScreen('sLobby');renderLobby();
 if(!local&&!hostOpen(rand4())){App.role=null;showScreen('sHome')}
}
function readyState(lb){
 let ids;if(lb.game==='sketch'||lb.game==='uno'||lb.game==='pm'||lb.game==='remi')ids=Object.keys(lb.players).filter(id=>id!==lb.host&&lb.players[id].online);
 else{const M=MODES[lb.mode];ids=[...new Set(M.seats.map(i=>lb.seatCfg[i].owner))].filter(o=>o!=='bot'&&o!==lb.host)}
 return {guests:ids,ready:ids.filter(id=>lb.players[id]&&lb.players[id].online&&lb.players[id].ready).length}}
function lobbySummary(lb){
 if(lb.game==='remi'){const r=Object.assign({},RM_DEF,lb.rm);return `🂡 Remi · otvaranje ${r.open} · ${r.rounds} ${r.rounds===1?'runda':r.rounds<5?'runde':'rundi'} · ⏱ ${r.time?r.time+'s':'bez limita'}${r.bots?' · 🤖 '+r.bots+' bot'+(r.bots>1?'a':''):''}`}
 if(lb.game==='pm'){const ht=(lb.pm&&lb.pm.hostT)==='w'?'w':'f';return `🔥💧 Pido i Mico · 30 nivoa · domaćin je ${ht==='f'?'🔴 Mico':'🔵 Pido'}`}
 if(lb.game==='uno'){const u=Object.assign({},UN_DEF,lb.uno);return `🃏 ${u.start} karata · ⏱ ${u.time?u.time+'s':'bez limita'}${u.bots?' · 🤖 '+u.bots+' bot'+(u.bots>1?'a':''):''}${u.stack?' · slaganje +2/+4':''}${u.drawMatch?' · vuci dok ne možeš':''}`}
 if(lb.game==='sketch'){const s=lb.sk;return `🎨 ${s.rounds} ${s.rounds<5?'runde':'rundi'} · ⏱ ${s.time}s po crtanju · ${s.hints?'💡 nagovještaji':'bez nagovještaja'} · ${s.cats.length===Object.keys(WORD_CATS).length?'sve kategorije':s.cats.length+' kategorija'}`}
 const R=lb.rules,king=Object.keys(PRESETS.king).every(k=>k==='turnTime'||R[k]===PRESETS.king[k]);
 return `🎲 ${MODES[lb.mode].label} · ${king?'👑 Ludo King pravila':'klasična pravila'}${R.turnTime?' · ⏱ '+R.turnTime+'s':''}`;
}
function renderLobby(){
 const lb=App.lobby;if(!lb)return;const isHost=App.role!=='guest',local=App.role==='local',M=MODES[lb.mode];
 $('#lLbl').textContent=local?'Lokalna igra':'Kod sobe';
 $('#lCode').innerHTML=local?'📱':(lb.code?esc(lb.code):'<span class="spin"></span>');
 $('#lShare').style.visibility=local?'hidden':'visible';$('#lChatC').style.display=local?'none':'';renderChat();
 const ps=Object.entries(lb.players);const onl=ps.filter(([,p])=>p.online).length;
 $('#lPh').textContent=local?'Igrači':`Igrači ${onl}/${MAXP}`;
 const seatsOf=id=>lb.game==='ludo'?M.seats.filter(i=>lb.seatCfg[i].owner===id):[];
 if(local)$('#lPlayers').innerHTML='<p class="muted" style="margin:0">Igrate na ovom mobitelu i dodajete ga jedno drugom. Imena i botove podesi u ⚙️ Postavke igre.</p>';
 else{
  $('#lPlayers').innerHTML=ps.sort((a,b)=>(b[0]===lb.host)-(a[0]===lb.host)).map(([id,p])=>{const cs=seatsOf(id),rz=rosesTotal(id===App.me.id?mergeRoses(App.me.roses,p.roses):p.roses);
   const watch=lb.game==='ludo'&&!cs.length&&id!==lb.host;
   return `<div class="pl${p.online?'':' offp'}" data-pid="${esc(id)}"><div class="pav">${esc(p.av)}<span class="od${p.online?' y':''}"></span></div>
   <div class="pn"><b>${esc(p.nick)}${id===App.me.id?' <span class="tag g">ti</span>':''}<span class="cds">${cs.map(i=>`<i style="background:${COLORS[i].hex}"></i>`).join('')}</span></b>
   <small>${[rz?'🌹 '+rz:'',id===lb.host?'👑 domaćin':!p.online?'offline':watch?'👀 gleda':''].filter(Boolean).join(' · ')}</small></div>
   ${id===lb.host?'':!p.online?'':watch?'':p.ready?'<span class="rdy y">✓ spreman/na</span>':'<span class="rdy">čeka…</span>'}</div>`}).join('')+
   Array.from({length:Math.max(0,MAXP-onl)}).map((_,i)=>`<div class="slot"><div class="pav"></div><span class="muted">${i===0&&onl<2?'<span class="spin"></span> Čekam igrača… pošalji kod <b style="color:var(--g)">'+esc(lb.code||'…')+'</b>':'slobodno mjesto'}</span></div>`).join('');
 }
 $$('#lGames .gcard').forEach(g=>{g.classList.toggle('sel',g.dataset.game===lb.game);g.classList.toggle('dis',local&&g.dataset.game!=='ludo')});
 $('#lSum').textContent=lobbySummary(lb);$('#lSet').textContent=isHost?'⚙️ Postavke igre':'👁 Pogledaj postavke';
 const rs=readyState(lb),bs=$('#bStart'),bb=$('#bStartBots'),br=$('#bReady'),w=$('#lWait');
 bs.style.display=isHost?'':'none';br.style.display=isHost?'none':'';bb.style.display='none';w.style.display=isHost?'none':'';
 if(isHost){
  if(local){bs.disabled=false;bs.textContent='▶ Počni igru'}
  else if(!rs.guests.length){bs.disabled=true;bs.textContent='⏳ Čekam igrače…';if(lb.game==='ludo'){bb.style.display='';bb.textContent='🤖 Počni odmah (botovi)'}else if(lb.game==='uno'){bb.style.display='';bb.textContent=(lb.uno&&lb.uno.bots)?'🤖 Igraj sa botovima':'🤖 Dodaj bota u ⚙️ postavkama'}else if(lb.game==='remi'){bb.style.display='';bb.textContent=(lb.rm&&lb.rm.bots)?'🤖 Igraj sa botovima':'🤖 Dodaj bota u ⚙️ postavkama'}}
  else if(rs.ready<rs.guests.length){bs.disabled=true;bs.textContent=`⏳ Spremni ${rs.ready}/${rs.guests.length}`;bb.style.display='';bb.textContent='▶ Počni svejedno'}
  else{bs.disabled=false;bs.textContent='▶ Svi su spremni – kreni!'}
 }else{
  const me=lb.players[App.me.id],mySeats=lb.game==='ludo'?M.seats.filter(i=>lb.seatCfg[i].owner===App.me.id):[1];
  if(!mySeats.length){br.style.display='none';w.innerHTML='👀 Domaćin ti još nije dao boju – možeš gledati.'}
  else{br.className=me&&me.ready?'btn ghost':'btn fill';br.textContent=me&&me.ready?'✕ Ipak nisam spreman/na':'✓ Spreman/na sam!';
   w.innerHTML=me&&me.ready?'<span class="spin"></span> Čekamo da domaćin pokrene igru…':(lb.game==='ludo'?'Tvoja boja: '+mySeats.map(i=>COLORS[i].name).join(' + '):lb.game==='uno'?'Igra: Jedna! 🃏':lb.game==='remi'?'Igra: Remi 🂡':lb.game==='pm'?'Igra: Pido i Mico 🔥💧 – ti si '+(pmRoleOf(lb,App.me.id)==='w'?'🔵 Pido':'🔴 Mico'):'Igra: Crtaj & pogađaj')}
 }
}
function lobbyChanged(){if(!App.lobby)return;LS.set('settings',{game:App.lobby.game,mode:App.lobby.mode,rules:App.lobby.rules,sk:App.lobby.sk,uno:App.lobby.uno,rm:App.lobby.rm});bcastLobby();if($('#settings').classList.contains('on'))renderSettings()}
$('#lGames').addEventListener('click',e=>{const g=e.target.closest('.gcard');if(!g||App.role==='guest'||!App.lobby)return;
 if(App.role==='local'&&g.dataset.game!=='ludo'){toast('Ova igra se igra online – napravi sobu 🙂');return}
 App.lobby.game=g.dataset.game;Object.values(App.lobby.players).forEach(p=>{if(p!==App.lobby.players[App.lobby.host])p.ready=false});sfx.click();lobbyChanged()});
$('#lPlayers').addEventListener('click',e=>{const p=e.target.closest('[data-pid]');if(p)openProfile(p.dataset.pid)});
// settings sheet
function renderSettings(){
 const lb=App.lobby;if(!lb)return;const ro=App.role==='guest',dis=ro?' disabled':'';const local=App.role==='local';
 $('#setT').textContent=lb.game==='remi'?'🂡 Remi':lb.game==='pm'?'🔥💧 Pido i Mico':lb.game==='sketch'?'🎨 Crtaj & pogađaj':lb.game==='uno'?'🃏 Jedna!':'🎲 Ne ljuti se';
 let h='';
 if(lb.game==='remi'){const r=lb.rm=Object.assign({},RM_DEF,lb.rm);
  h+=`<label class="l">🤖 Botovi</label><div class="seg" data-rmv="bots">${[0,1,2,3].map(v=>`<button${r.bots===v?' class="on"':''} data-v="${v}"${dis}>${v||'bez'}</button>`).join('')}</div>`;
  h+=`<label class="l">Otvaranje (min. bodova)</label><div class="seg" data-rmv="open">${[41,51,61,71].map(v=>`<button${r.open===v?' class="on"':''} data-v="${v}"${dis}>${v}</button>`).join('')}</div>`;
  h+=`<label class="l">Broj rundi</label><div class="seg" data-rmv="rounds">${[1,3,5,7].map(v=>`<button${r.rounds===v?' class="on"':''} data-v="${v}"${dis}>${v}</button>`).join('')}</div>`;
  h+=`<label class="l">⏱ Vrijeme za potez</label><div class="seg" data-rmv="time">${[0,45,60,90,120].map(v=>`<button${r.time===v?' class="on"':''} data-v="${v}"${dis}>${v?v+'s':'∞'}</button>`).join('')}</div>`;
  h+=`<p class="muted">2 špila + 4 džokera, 14 karata (prvi 15). Neotvoren +100, pobjednik runde −40, remi iz ruke duplo.</p>`;
 }else if(lb.game==='pm'){const ht=(lb.pm&&lb.pm.hostT)==='w'?1:0;
  h+=`<label class="l">Domaćin igra kao</label><div class="seg" data-pm="hostT">${[[0,'🔴 Mico (vatra)'],[1,'🔵 Pido (voda)']].map(([v,l])=>`<button${ht===v?' class="on"':''} data-v="${v}"${dis}>${l}</button>`).join('')}</div>`;
  h+=`<p class="muted">Co-op za tačno 2 igrača. Mico ide kroz lavu, Pido kroz vodu, zelena kiselina ubija oba. Nivo birate u igri.</p>`;
 }else if(lb.game==='uno'){const u=lb.uno=Object.assign({},UN_DEF,lb.uno);
  h+=`<label class="l">🤖 Botovi (popune sto)</label><div class="seg" data-un="bots">${[0,1,2,3].map(v=>`<button${u.bots===v?' class="on"':''} data-v="${v}"${dis}>${v||'bez'}</button>`).join('')}</div>`;
  h+=`<label class="l">Karata na početku</label><div class="seg" data-un="start">${[5,7,10].map(v=>`<button${u.start===v?' class="on"':''} data-v="${v}"${dis}>${v}</button>`).join('')}</div>`;
  h+=`<label class="l">⏱ Vrijeme za potez</label><div class="seg" data-un="time">${[0,15,20,30,45].map(v=>`<button${u.time===v?' class="on"':''} data-v="${v}"${dis}>${v?v+'s':'∞'}</button>`).join('')}</div>`;
  h+=`<label class="rule" style="margin-top:8px"><input type="checkbox" data-unc="stack"${u.stack?' checked':''}${dis}><span class="sw"></span><span class="rt"><b>Slaganje +2 / +4</b><small>Na +2 možeš staviti +2 (ili +4), pa sljedeći vuče sve.</small></span></label>`;
  h+=`<label class="rule"><input type="checkbox" data-unc="jedna"${u.jedna?' checked':''}${dis}><span class="sw"></span><span class="rt"><b>JEDNA! dugme (teže)</b><small>Moraš sam stisnuti JEDNA! kad ti ostanu 2 karte – ako zaboraviš, drugi te uhvate i vučeš +2.</small></span></label>`;
  h+=`<label class="rule"><input type="checkbox" data-unc="drawMatch"${u.drawMatch?' checked':''}${dis}><span class="sw"></span><span class="rt"><b>Vuci dok ne možeš igrati</b><small>Umjesto jedne karte, vučeš dok ne dobiješ kartu koja odgovara.</small></span></label>`;
 }else if(lb.game==='sketch'){const s=lb.sk;
  h+=`<label class="l">Broj rundi (svako crta po jednom u rundi)</label><div class="seg" data-sk="rounds">${[2,3,4,5,6].map(v=>`<button${s.rounds===v?' class="on"':''} data-v="${v}"${dis}>${v}</button>`).join('')}</div>`;
  h+=`<label class="l">Vrijeme za crtanje</label><div class="seg" data-sk="time">${[45,60,80,100,120].map(v=>`<button${s.time===v?' class="on"':''} data-v="${v}"${dis}>${v}s</button>`).join('')}</div>`;
  h+=`<label class="rule" style="margin-top:8px"><input type="checkbox" data-skc="hints"${s.hints?' checked':''}${dis}><span class="sw"></span><span class="rt"><b>💡 Nagovještaji</b><small>Kako vrijeme ističe, otkrivaju se slova.</small></span></label>`;
  h+=`<label class="l">Kategorije riječi</label><div class="chk">${Object.entries(WORD_CATS).map(([k,l])=>`<label><input type="checkbox" data-cat="${k}"${s.cats.includes(k)?' checked':''}${dis}>${l}</label>`).join('')}</div>`;
 }else{const M=MODES[lb.mode];
  h+=`<label class="l">Način igre</label><select id="sMode"${dis}>${Object.entries(MODES).map(([k,m])=>`<option value="${k}"${k===lb.mode?' selected':''}>${m.label}</option>`).join('')}</select>`;
  const opts=local?[[App.me.id,'👤 Čovjek'],['bot','🤖 Bot']]:[...Object.entries(lb.players).filter(([,p])=>p.online).map(([id,p])=>[id,p.av+' '+p.nick]),['bot','🤖 Bot']];
  h+=M.seats.map(i=>{const sc=lb.seatCfg[i];const tm=M.teams?`<small>${M.groups.length===2?'Strana':'Tim'} ${M.sides[i]===0?'A':'B'}</small>`:'';
   return `<div class="seat" style="--c:${COLORS[i].hex}"><span class="cdot"></span><span class="cn">${COLORS[i].name}${tm}</span>
   <select data-seat="${i}"${dis}>${opts.map(([v,l])=>`<option value="${esc(v)}"${v===sc.owner?' selected':''}>${esc(l)}</option>`).join('')}${opts.some(o=>o[0]===sc.owner)?'':`<option selected>${esc(seatName(lb,i))}</option>`}</select>
   ${local&&sc.owner!=='bot'?`<input data-sname="${i}" maxlength="14" value="${esc(sc.name)}" placeholder="${esc(App.me.nick)}">`:''}</div>`}).join('');
  h+=`<label class="l">Brzi izbor pravila</label><div class="row">${ro?'':`<button class="btn ghost" data-preset="classic" style="margin:0">🎲 Klasična</button><button class="btn ghost" data-preset="king" style="margin:0">👑 Ludo King</button>`}</div>`;
  h+=`<label class="l">Pravila</label>`+RULES.map(r=>`<label class="rule"><input type="checkbox" data-rule="${r.k}"${lb.rules[r.k]?' checked':''}${dis}><span class="sw"></span><span class="rt"><b>${r.t}</b><small>${r.d}</small></span></label>`).join('');
  h+=`<label class="l">⏱ Vrijeme za potez</label><div class="seg" data-time="1">${[0,15,20,30,45,60].map(v=>`<button${(lb.rules.turnTime||0)===v?' class="on"':''} data-v="${v}"${dis}>${v?v+'s':'∞'}</button>`).join('')}</div>`;
 }
 if(ro)h=`<p class="muted" style="margin-top:0">Postavke mijenja domaćin.</p>`+h;
 $('#setBody').innerHTML=h;
}
function openSettings(){if(!App.lobby)return;renderSettings();ovl('settings',true)}
$('#setBody').addEventListener('change',e=>{
 if(App.role==='guest'||!App.lobby)return;const t=e.target,lb=App.lobby;
 if(t.id==='sMode'){lb.mode=t.value;autoAssign(lb)}
 else if(t.dataset.seat){lb.seatCfg[+t.dataset.seat].owner=t.value;if(t.value==='bot')lb.seatCfg[+t.dataset.seat].name=''}
 else if(t.dataset.rule){lb.rules[t.dataset.rule]=t.checked}
 else if(t.dataset.skc){lb.sk[t.dataset.skc]=t.checked}
 else if(t.dataset.unc){lb.uno[t.dataset.unc]=t.checked}
 else if(t.dataset.cat){const c=t.dataset.cat;lb.sk.cats=t.checked?[...new Set([...lb.sk.cats,c])]:lb.sk.cats.filter(x=>x!==c);if(!lb.sk.cats.length){lb.sk.cats=[c];t.checked=true;toast('Bar jedna kategorija 🙂')}}
 else if(t.dataset.sname!==undefined){lb.seatCfg[+t.dataset.sname].name=t.value.trim().slice(0,14);LS.set('settings',{game:lb.game,mode:lb.mode,rules:lb.rules,sk:lb.sk});bcastLobby();return}
 lobbyChanged();
});
$('#setBody').addEventListener('input',e=>{const t=e.target;if(t.dataset.sname!==undefined&&App.lobby)App.lobby.seatCfg[+t.dataset.sname].name=t.value.trim().slice(0,14)});
$('#setBody').addEventListener('click',e=>{if(App.role==='guest'||!App.lobby)return;const lb=App.lobby;
 const pr=e.target.closest('[data-preset]');if(pr){Object.assign(lb.rules,PRESETS[pr.dataset.preset]);if(pr.dataset.preset==='classic')lb.rules.turnTime=0;toast(pr.dataset.preset==='king'?'👑 Ludo King pravila':'🎲 Klasična pravila');lobbyChanged();return}
 const b=e.target.closest('.seg button');if(!b)return;const seg=b.parentNode,v=+b.dataset.v;
 if(seg.dataset.rmv){lb.rm=Object.assign({},RM_DEF,lb.rm,{[seg.dataset.rmv]:v})}else if(seg.dataset.pm){lb.pm=Object.assign({},lb.pm,{hostT:v?'w':'f'})}else if(seg.dataset.sk)lb.sk[seg.dataset.sk]=v;else if(seg.dataset.un)lb.uno[seg.dataset.un]=v;else if(seg.dataset.time)lb.rules.turnTime=v;sfx.click();lobbyChanged()});
// start / countdown / back
function startGame(force){
 const lb=App.lobby;if(!lb||App.starting)return;
 if(App.role==='host'&&!lb.code){toast('Soba se još otvara…');return}
 if(App.role==='host'&&!force){const rs=readyState(lb);if(!(lb.game==='uno'&&!rs.guests.length&&(lb.uno&&lb.uno.bots))&&!(lb.game==='remi'&&!rs.guests.length&&(lb.rm&&lb.rm.bots))&&(!rs.guests.length||rs.ready<rs.guests.length)){toast('Čekamo da svi budu spremni');return}}
 if(lb.game==='remi'&&Object.values(lb.players).filter(p=>p.online).length+((lb.rm&&lb.rm.bots)|0)<2){toast('Treba bar 2 igrača – ili dodaj bota u ⚙️ postavkama 🂡');return}
 if(lb.game==='pm'&&Object.values(lb.players).filter(p=>p.online).length!==2){toast('Pido i Mico je za tačno 2 igrača 🔥💧');return}
 if(lb.game==='sketch'&&Object.values(lb.players).filter(p=>p.online).length<2){toast('Za crtanje trebaju bar 2 igrača 🎨');return}
 if(lb.game==='uno'&&Object.values(lb.players).filter(p=>p.online).length+((lb.uno&&lb.uno.bots)|0)<2){toast('Treba bar 2 igrača – ili dodaj bota u ⚙️ postavkama 🃏');return}
 App.starting=true;bcast({t:'count'});ovl('settings',false);
 countdown(()=>{App.starting=false;if(App.lobby!==lb||!App.role)return;
  if(typeof gAnnounce==='function')setTimeout(gAnnounce,300);
  if(lb.game==='sketch'){skStart();return}
  if(lb.game==='uno'){unStart();return}
  if(lb.game==='pm'){pmStart();return}
  if(lb.game==='remi'){rmStart();return}
  const seatCfg=[0,1,2,3].map(i=>({owner:lb.seatCfg[i].owner,name:seatName(lb,i),av:seatAv(lb,i)}));
  clearTimeout(App.H.timer);App.H={};App.game=mkState({mode:lb.mode,rules:lb.rules,seatCfg});wake();afterChange()});
}
function countdown(cb){hideWin();ovl('count',true);const n=$('#cnum');let k=3;
 const tick=()=>{n.textContent=k>0?k:'kreni!';n.style.animation='none';void n.offsetWidth;n.style.animation='';
  if(k>0){tone(660,.15,'sine',.15);vib(30)}else{tone(990,.3,'triangle',.18);vib(80)}
  if(k-->0)setTimeout(tick,850);else setTimeout(()=>{ovl('count',false);cb&&cb()},650)};tick()}
function toLobbyView(){pmClose();if(typeof rmResetUI==='function')rmResetUI();App.st=null;App.shown=null;App.skv=null;if(typeof skResetUI==='function')skResetUI();if(typeof unResetUI==='function')unResetUI();hideWin();showScreen('sLobby');renderLobby()}
function backToLobby(){if(App.role==='guest'||!App.lobby)return;clearTimeout(App.H.timer);if(typeof skStop==='function')skStop();if(typeof unStop==='function')unStop();if(typeof rmStop==='function')rmStop();
 App.game=null;App.sk=null;App.un=null;App.rm=null;App.H={};Object.entries(App.lobby.players).forEach(([id,p])=>{if(id!==App.lobby.host)p.ready=false});
 bcast({t:'back'});bcastLobby();toLobbyView();saveGame()}
function leave(){
 if(App.role==='host'&&App.lobby&&App.lobby.code&&typeof gSend==='function')gSend({t:'g_room_del',code:App.lobby.code});
 App.leaving=true;clearTimeout(App.H.timer);clearTimeout(App.rj);if(typeof skStop==='function')skStop();if(typeof unStop==='function')unStop();if(typeof unResetUI==='function')unResetUI();if(typeof rmStop==='function')rmStop();if(typeof rmResetUI==='function')rmResetUI();
 if(App.role==='host')bcast({t:'bye'});
 const pr=App.peer;setTimeout(()=>{try{App.conns.forEach(c=>c.close())}catch(e){}App.conns.clear();try{pr&&pr.destroy()}catch(e){}},300);
 Object.assign(App,{peer:null,conn:null,role:null,game:null,st:null,shown:null,sk:null,skv:null,un:null,unv:null,rm:null,rmv:null,lobby:null,H:{},code:'',chat:[],unread:0});
 ['prof','settings','win','drawer'].forEach(i=>ovl(i,false));pmClose();
 LS.del('save');showScreen('sHome');renderHome();
}

// ================= DRAWER =================
function openDrawer(){
 const inRoom=!!App.role,host=App.role==='host'||App.role==='local',inGame=onScreen('sGame')||onScreen('sSketch')||onScreen('sUno')||onScreen('sRemi');
 const it=(ic,t,act,cls,href)=>href?`<a class="di ${cls||''}" href="${href}" target="_blank" rel="noopener noreferrer"><span class="ic">${ic}</span>${t}</a>`:`<button class="di ${cls||''}" data-act="${act}"><span class="ic">${ic}</span>${t}</button>`;
 let h=`<div class="logo done" style="width:190px;margin-bottom:12px">${logoSVG()}</div>`;
 if(inRoom){
  if(App.role!=='local')h+=it('📤','Pozovi u sobu','share','g');
  h+=it('⚙️',host?'Postavke igre':'Postavke (pregled)','settings');
  if(inGame&&host)h+=it('🏠','Nazad u sobu','lobby');
  h+=it('📖','Pravila igre','help');
  h+=it('🚪',App.role==='local'?'Izađi iz igre':'Izađi iz sobe','quit','r');
 }else h+=it('📖','Pravila igara','help');
 h+=`<div class="dsep"></div>`+it(SFX.on?'🔊':'🔇','Zvuk: '+(SFX.on?'uključen':'isključen'),'snd')+
  it('📸','Instagram @basa.gtm','', '',INSTA)+it('☕','Častiš kafu? (PayPal)','','g',DONATE)+
  it('📡','Stanje veze','net')+`<div class="dfoot">#Bash igre · napravljeno sa 💚<br>sigurna veza (HTTPS/WSS) · ${NET.brokers.length} servera za rezervu<br>verzija ${APP_VER}</div>`;
 $('#dpanel').innerHTML=h;ovl('drawer',true);
}
$('#dpanel').addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;
 if(a==='snd'){SFX.on=!SFX.on;LS.set('snd',SFX.on);sndBtns();if(SFX.on)sfx.pop();openDrawer();return}
 ovl('drawer',false);
 if(a==='net'){netReport();return}
 if(a==='share')share();else if(a==='settings')openSettings();else if(a==='lobby')backToLobby();else if(a==='help')openHelp();
 else if(a==='quit'){if(confirm(App.role==='host'?'Zatvoriti sobu za sve?':'Sigurno želiš izaći?'))leave()}});
function netReport(){const i=BUS.info();toast(i.length?'📡 '+i.map(x=>(x.ok?'✅ ':'❌ ')+x.n).join('  '):'📡 Veza još nije pokrenuta',6000)}
window.onNetState=(n,t)=>{App.netN=n;App.netT=t;if(typeof gRender==='function')gRender();const e=$('#lNet');if(e)e.textContent=`📡 ${n}/${t}`};
function sndBtns(){$('#hSnd').textContent=SFX.on?'🔊':'🔇'}

// ================= HOME =================
function renderHomeRoses(){const n=rosesTotal(App.me.roses),e=$('#hRoses');e.style.display=n?'':'none';
 e.innerHTML=`🌹 ${n} ${n===1?'ruža':n<5?'ruže':'ruža'} <span style="opacity:.7">· ${Object.entries(App.me.roses).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k,v])=>'od '+esc(k)).join(', ')}</span>`}
function renderHome(){
 $('#nick').value=App.me.nick||'';$('#hAv').textContent=App.me.av;renderHomeRoses();
 const sv=LS.get('save',null),b=$('#bResume');
 if(sv&&Date.now()-sv.ts<8*3600e3&&(sv.role==='guest'||sv.game)){b.style.display='';b.textContent=sv.role==='guest'?`↩ Vrati se u sobu ${sv.code}`:sv.role==='local'?'↩ Nastavi lokalnu igru':`↩ Nastavi igru (soba ${sv.code})`}
 else b.style.display='none';
 if(typeof gRender==='function')gRender();
}
function saveNick(){const n=$('#nick').value.trim().slice(0,14);if(!n){toast('Upiši svoj nadimak 🙂');$('#nick').focus();return false}const ch=n!==App.me.nick;App.me.nick=n;LS.set('me',App.me);if(typeof gOnMe==='function')gOnMe(ch);return true}
$('#hAv').onclick=()=>{$('#avList').innerHTML=AVATARS.map(a=>`<button data-av="${a}" style="width:52px;height:52px;font-size:30px;border:1.5px solid ${a===App.me.av?'var(--g)':'#1c1c1c'};border-radius:14px">${a}</button>`).join('');ovl('avP',true)};
$('#avList').addEventListener('click',e=>{const b=e.target.closest('[data-av]');if(!b)return;App.me.av=b.dataset.av;LS.set('me',App.me);$('#hAv').textContent=App.me.av;ovl('avP',false);sfx.click();if(typeof gOnMe==='function')gOnMe(true)});
$('#bHost').onclick=()=>createRoom(false);$('#bLocal').onclick=()=>createRoom(true);
$('#bJoin').onclick=()=>{if(!saveNick())return;const c=$('#code').value.replace(/\D/g,'');if(c.length!==4){toast('Kod sobe ima 4 broja');return}
 Object.assign(App,{lobby:null,st:null,shown:null,skv:null,joinFails:0,chat:[]});guestJoin(c)};
$('#code').addEventListener('keydown',e=>{if(e.key==='Enter')$('#bJoin').click()});
$('#bResume').onclick=()=>{const sv=LS.get('save',null);if(!sv)return;if(!App.me.nick&&!saveNick())return;
 if(sv.role==='guest'){Object.assign(App,{lobby:null,joinFails:0,chat:[]});guestJoin(sv.code);return}
 Object.assign(App,{role:sv.role,lobby:sv.lobby,game:sv.game,H:{},st:null,shown:null,leaving:false,chat:[]});
 Object.keys(App.lobby.players).forEach(id=>App.lobby.players[id].online=id===App.me.id);
 if(sv.role==='host'){App.resumeTries=5;hostOpen(sv.code||App.lobby.code)}
 if(App.game){wake();afterChange()}else{showScreen('sLobby');renderLobby()}};
$('#nick').addEventListener('change',()=>{if($('#nick').value.trim())saveNick()});
$('#hSnd').onclick=()=>{SFX.on=!SFX.on;LS.set('snd',SFX.on);sndBtns();if(SFX.on)sfx.pop()};
$('#lShare').onclick=share;$('#lSet').onclick=openSettings;
$('#bStart').onclick=()=>startGame(false);$('#bStartBots').onclick=()=>{const lb=App.lobby;if(lb&&lb.game==='uno'&&!(lb.uno&&lb.uno.bots)){openSettings();return}if(lb&&lb.game==='remi'&&!(lb.rm&&lb.rm.bots)){openSettings();return}startGame(true)};
$('#bReady').onclick=()=>{const p=App.lobby&&App.lobby.players[App.me.id];const v=!(p&&p.ready);if(p)p.ready=v;renderLobby();
 if(App.conn&&App.conn.open)App.conn.send({t:'ready',v});else toast('Nema veze s domaćinom…');if(v){sfx.pop();vib(30)}};
function share(){const code=App.lobby&&App.lobby.code;if(!code)return;
 const url=location.href.split('#')[0]+'#'+code,text=`Hajmo igrati #Bash igre! 🎲🎨 Kod sobe: ${code}`;
 if(navigator.share)navigator.share({title:'#Bash igre',text,url}).catch(()=>{});
 else{const s=text+'\n'+url;(navigator.clipboard?navigator.clipboard.writeText(s):Promise.reject()).then(()=>toast('Pozivnica kopirana! 📋')).catch(()=>prompt('Kopiraj i pošalji:',s))}}
function openHelp(){const lb=App.lobby;
 if(lb&&lb.game==='uno'&&typeof unHelp==='function'){$('#helpBody').innerHTML=unHelp();ovl('help',true);return}
 if(lb&&lb.game==='remi'&&typeof rmHelp==='function'){$('#helpBody').innerHTML=rmHelp();ovl('help',true);return}
 if(lb&&lb.game==='sketch'){$('#helpBody').innerHTML=`<h4>🎨 Crtaj &amp; pogađaj</h4><ul><li>Svako redom dobije 3 riječi i izabere jednu koju crta.</li><li>Ostali pogađaju pišući u chat – mala/velika slova i č/ć/š/ž/đ nisu bitni.</li><li>Što brže pogodiš, više bodova. Crtač dobija bodove za svakog ko pogodi.</li><li>Kad si blizu, dobiješ poruku „blizu si” 🔥.</li><li>Kad vrijeme ističe, otkrivaju se slova (ako su nagovještaji uključeni).</li><li>Crtač ne smije napisati riječ u chat 😉</li></ul>`;ovl('help',true);return}
 const R=(App.st&&App.st.rules)||(lb&&lb.rules)||DEFAULT_RULES;
 $('#helpBody').innerHTML=`<h4>🎲 Ne ljuti se čovječe</h4><p>Dovedi sve 4 figure iz kućice oko ploče u svoj cilj (obojena polja prema sredini).</p>
 <ul><li>Figura izlazi na <b>${R.exitOn1?'6 ili 1':'6'}</b>.</li><li>Kad staneš tačno na protivnika, vraćaš ga u kućicu.</li><li>U cilj se ulazi tačnim brojem.</li><li>Dodirni avatar igrača: profil, 🌹 ruža, bacanje 🍅.</li></ul>
 <h4>Uključena pravila</h4><ul>${RULES.filter(r=>R[r.k]).map(r=>`<li><b>${r.t}</b> – ${r.d}</li>`).join('')||'<li>Samo osnovna</li>'}${R.turnTime?`<li><b>⏱ ${R.turnTime}s za potez</b></li>`:''}</ul>
 <h4>🎨 Crtaj &amp; pogađaj</h4><p>Izaberi tu igru u sobi – jedan crta, ostali pogađaju. Do 5 igrača.</p><h4>🃏 Jedna!</h4><p>Kartaška igra po UNO pravilima, 2–5 igrača + botovi.</p>`;ovl('help',true)}
async function wake(){try{if('wakeLock' in navigator)App.wl=await navigator.wakeLock.request('screen')}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')return;
 if(App.st||App.skv||App.unv||App.rmv)wake();if(App.peer&&App.peer.disconnected&&!App.peer.destroyed)try{App.peer.reconnect()}catch(e){}
 if(App.role==='guest'&&!(App.conn&&App.conn.open))retryJoin()});

// ================= GAME EVENTS (ludo, chat, profile) =================
$('#dw').onclick=()=>{const st=App.st;if(!st||App.pending>0)return;if(mine(st)&&st.phase==='roll'){ac();act('roll')}
 else if(st.phase==='roll'&&st.seats[st.turn].owner!==App.me.id)toast('Nisi na potezu 🙂',1400)};
$('#layer').addEventListener('click',e=>{const t=e.target.closest('.piece,.target');const st=App.st;if(!t||!st||App.pending>0)return;
 if(!(mine(st)&&st.phase==='move'))return;const p=+t.dataset.p;if(t.classList.contains('piece')&&+t.dataset.s!==st.turn)return;
 if(st.legal.some(m=>m.p===p))act('move',{p});else vib(20)});
$('#sGame').addEventListener('click',e=>{const a=e.target.closest('.avw');if(!a)return;const ch=a.closest('.chip');if(ch)openProfile(null,+ch.dataset.s)});
$('#gHelp').onclick=openHelp;
$('#pfRose').onclick=()=>{const now=Date.now();if(now-App.lastRose<1500)return;App.lastRose=now;if(!App.profId)return;if(App.profSrc==='g'){if(typeof gSend==='function')gSend({t:'g_rose',to:App.profId})}else act('rose',{to:App.profId});ovl('prof',false)};
$('#prof').addEventListener('click',e=>{const b=e.target.closest('#pfThrow button');if(!b)return;const now=Date.now();if(now-App.lastThrow<1200)return;App.lastThrow=now;
 act('throw',{to:+b.dataset.to,item:b.textContent});ovl('prof',false)});
$('#wLobby').onclick=backToLobby;$('#wAgain').onclick=()=>{hideWin();startGame(true)};

// ================= INIT =================
sndBtns();renderHome();
(function(){const h=(location.hash||'').replace(/\D/g,'');if(h.length===4){$('#code').value=h;setTimeout(()=>toast(App.me.nick?'Klikni "Uđi" da se pridružiš sobi '+h:'Upiši nadimak i klikni "Uđi" 🎲',4000),3000)}})();
(function loader(){drawLogo($('#ldLogo'));const t0=Date.now();
 setTimeout(()=>{for(let i=0;i<4;i++)pawnImg(i)},250);
 const done=()=>{const left=Math.max(0,2700-(Date.now()-t0));setTimeout(()=>{if(typeof gStart==='function')gStart();$('#loader').classList.add('hide');showScreen('sHome');drawLogo($('#hLogo'));setTimeout(()=>$('#loader').remove(),700)},left)};
 const fr=document.fonts&&document.fonts.load?Promise.race([document.fonts.load('100px "Kaushan Script"'),sleep(1800)]):Promise.resolve();
 fr.then(()=>{drawLogo($('#ldLogo'));done()},done)})();
if(typeof Peer==='undefined')setTimeout(()=>{if(typeof Peer==='undefined')toast('⚠️ Online dio nije učitan (nema interneta?). Lokalna igra radi.',4000)},3500);

// ================= PIDO I MICO (vatra & voda, co-op za 2) =================
function pmRoleOf(lb,id){const ht=(lb.pm&&lb.pm.hostT)==='w'?'w':'f';return id===lb.host?ht:(ht==='f'?'w':'f')}
function pmStart(){const lb=App.lobby;if(!lb||!lb.code)return;
 const d={t:'pm',code:lb.code,s:Date.now()};bcast(d);pmOpen(d,true)}
function pmOpen(d,host){const lb=App.lobby;if(!lb||!d||!/^\d{3,6}$/.test(String(d.code||'')))return;
 const me=pmRoleOf(lb,App.me.id),f=$('#pmFrame');
 f.src='pidomico.html?v='+APP_VER+'&room='+d.code+'&me='+me+(host?'&host=1':'')+'&nick='+encodeURIComponent(App.me.nick||'')+'&s='+(d.s|0);
 $('#sPM').classList.add('on');App.pmOn=true}
function pmClose(){const p=$('#sPM');if(!p||!App.pmOn)return;App.pmOn=false;p.classList.remove('on');$('#pmFrame').src='about:blank'}
window.addEventListener('message',e=>{if(e.source!==($('#pmFrame')||{}).contentWindow||!e.data||e.data.pm!=='exit')return;
 pmClose();if(App.role==='host')backToLobby();else{showScreen('sLobby');renderLobby()}});
