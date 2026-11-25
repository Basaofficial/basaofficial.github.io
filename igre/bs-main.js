// BASH-STRIKE – glavni modul: meniji, mreža (host/klijent), kontrole, HUD, buy meni, inventar
import {BSRender,BSPreview,loadAssets} from './bs-render.js';
const D=window.BS_DATA,MP=window.BS_MAPS,SIM=window.BS_SIM,BI=window.BS_INV,INV=BI.INV,AU=window.BS_AUDIO;
const {W,RULES:RL}=D,{pmove,pEye}=MP;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const QS=new URLSearchParams(location.search),EMB=window.parent!==window;
const MOB=matchMedia('(pointer:coarse)').matches||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
if(MOB)document.body.classList.add('mob');
const LSget=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},LSset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const SET=Object.assign({sens:1.2,tsens:1,fov:74,vol:.7,q:'auto',xc:'#7cff01',fps:0,nick:'',map:'dina',diff:1,team:'auto'},LSget('bs_set',{}));
const saveSet=()=>LSset('bs_set',SET);
const qual=()=>SET.q==='auto'?(MOB?'low':'high'):SET.q;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const fmtT=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const perf=()=>performance.now()/1000;
let myId=sessionStorage.getItem('bs_id');if(!myId){myId='u'+Math.random().toString(36).slice(2,10);sessionStorage.setItem('bs_id',myId)}
const NETOK=typeof BUS!=='undefined'&&typeof NET!=='undefined';
const R=new BSRender($('#c'),qual());AU.setVol(SET.vol);
let toastT=0;function toast(m,ms){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),ms||2600)}
const nick=()=>(String(QS.get('nick')||SET.nick||'').trim().slice(0,14)||'Igrač');
const agPair=()=>{const a=INV.load().ag||{T:0,CT:0};return (a.T|0)%5+5*((a.CT|0)%5)};
const agOf=(side,ag)=>side==='T'?(ag|0)%5:Math.floor((ag|0)/5)%5;
// ---------- ikone (keš) ----------
const _icon=new Map();
function icon(w,wd,ht,opt){const key=w+'|'+wd+'|'+ht+'|'+JSON.stringify(opt||{});if(_icon.has(key))return _icon.get(key);const c=document.createElement('canvas');c.width=wd;c.height=ht;BI.drawGun(c.getContext('2d'),w,2,2,wd-4,ht-4,opt);_icon.set(key,c);return c}
function putIcon(cv,w,opt){const c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);c.drawImage(icon(w,cv.width,cv.height,opt),0,0)}
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}

// ======================= SESIJA =======================
let S=null;
const TOP=c=>NET.prefix+'bs/'+c,LIST=()=>NET.prefix+'bs/list';
function newMe(){return {x:0,y:0,z:0,vx:0,vy:0,vz:0,yaw:0,pitch:0,duck:0,onGround:true,alive:false,inv:{1:null,2:null,3:{w:'knife',sk:0},4:[],5:false,6:false},cur:3,nsel:0,prev:2,ws:SIM.newWS(),sp:-1,side:'T',team:0,hp:100,ar:0,money:0,jh:0,flash:0}}
function startSession(o){
 AU.resume();stopListPoll();
 S={code:String(o.code),isHost:!!o.host,map:o.map||null,diff:o.diff|0,teamPref:o.team||'auto',game:null,info:null,snaps:[],hostId:o.host?myId:null,lastHost:perf(),off:null,
  me:newMe(),myIdx:0,pending:[],lastSend:0,seen:new Set(),acc:0,lastSnapB:0,lastInfoB:0,lastBeacon:0,helloT:0,startT:perf(),feed:[],rlog:[],dead:0,specIdx:0,spot:{},lastSpot:0,
  buyOpen:false,sbOpen:false,mode:'warmup',over:null,dropDone:{},planting:0,shake:0,lastStep:0,stepDist:0,deathT:0,loadedMap:null,ents:[],prevEnts:new Map(),hud:0,lastC4Beep:0,inspect:0};
 $('#menu').classList.add('hide');$('#hud').classList.add('on');if(MOB)$('#touch').classList.add('on');
 $('#feed').innerHTML='';$('#rlog').innerHTML='';
 if(S.isHost){const g=new SIM.Game({map:o.map||SET.map,diff:S.diff,hostId:myId});S.game=g;S.map=g.mapId;
  const pref=S.teamPref==='T'||S.teamPref==='CT'?g.teamOfSide(S.teamPref):-1;const p=g.join({id:myId,n:nick(),ag:agPair(),skins:INV.skinsMap(),team:pref});g.balance();S.myIdx=p.idx;
  g.onEvent=e=>{S.seen.add(e.id);onEvent(e)};loadMap(g.mapId);S.info=g.info();onInfo(S.info)}
 else{$('#net').textContent='Spajam se na sobu #'+S.code+'…'}
 if(NETOK){try{BUS.init()}catch(e){}
  S.fnH=m=>onHostMsg(m);S.fnC=m=>onClientMsg(m);BUS.sub(TOP(S.code)+'/h',S.fnH);if(S.isHost)BUS.sub(TOP(S.code)+'/c',S.fnC)}
 else if(!S.isHost){toast('Online dio nije učitan – nema interneta?');setTimeout(leaveSession,2500)}
 lockPointer();
}
function loadMap(id){if(!S||S.loadedMap===id)return;S.loadedMap=id;S.M=MP.build(MP.MAPS[id]);R.loadMap(S.M);R.clearRound();radarBase=null;S.me.sp=-1}
function leaveSession(silent){if(!S)return;const s=S;
 if(NETOK&&BUS.links){try{if(s.isHost)BUS.pub(TOP(s.code)+'/h',{k:'hbye',h:myId});else BUS.pub(TOP(s.code)+'/c',{k:'bye',id:myId})}catch(e){}
  try{BUS.unsub(TOP(s.code)+'/h',s.fnH);if(s.isHost||s.fnCsub)BUS.unsub(TOP(s.code)+'/c',s.fnC)}catch(e){}}
 S=null;document.exitPointerLock&&document.exitPointerLock();
 ['#hud','#touch'].forEach(q=>$(q).classList.remove('on'));['#buy','#sb'].forEach(q=>$(q).classList.remove('on'));$$('.ovl').forEach(o=>o.classList.remove('on'));$('#scope').classList.remove('on');$('#flash').style.opacity=0;
 if(EMB&&QS.get('room')){try{parent.postMessage({pm:'exit'},'*')}catch(e){}return}
 showMenu()}
addEventListener('pagehide',()=>{if(S&&NETOK&&BUS.links){try{if(S.isHost)BUS.pub(TOP(S.code)+'/h',{k:'hbye',h:myId});else BUS.pub(TOP(S.code)+'/c',{k:'bye',id:myId})}catch(e){}}});
// ---------- poruke ----------
function hostNow(){if(S.isHost)return S.game.t;return perf()+(S.off||0)}
function onHostMsg(m){if(!S||!m)return;const now=perf();
 if(m.k==='s'||m.k==='i'){
  if(S.isHost){if(m.h!==myId&&m.k==='s'){// dva hosta – niži idx ostaje
    if((m.hi|0)<S.myIdx||((m.hi|0)===S.myIdx&&m.h<myId))demote(m.h)}return}
  if(S.hostId!==m.h){if(S.hostId&&now-S.lastHost<3)return;S.hostId=m.h;S.snaps.length=0;S.off=null}
  S.lastHost=now;$('#net').textContent='';
  if(m.k==='s')onSnap(m);else{S.info=m;onInfo(m)}}
 else if(m.k==='full'&&m.id===myId){toast('Soba je puna (max 10 igrača).',4000);leaveSession()}
 else if(m.k==='hbye'&&m.h===S.hostId){S.lastHost=0;migrate()}}
function onClientMsg(m){if(!S||!S.isHost||!m||!m.id)return;const g=S.game;
 if(m.k==='hello'){const p=g.join({id:String(m.id).slice(0,20),n:String(m.n||'Igrač').slice(0,14),ag:m.ag|0,skins:cleanSkins(m.sk),team:m.tm==='T'||m.tm==='CT'?g.teamOfSide(m.tm):-1});if(!p){BUS.pub(TOP(S.code)+'/h',{k:'full',id:m.id})}else{g.dirty=1;if(m.rejoin==null)g.emit({ty:'msg',txt:p.n+' je ušao u igru'})}}
 else if(m.k==='in')g.input(m.id,m);
 else if(m.k==='bye'){const p=g.byId(m.id);if(p&&!p.bot){g.emit({ty:'msg',txt:p.n+' je izašao'});g.leave(m.id)}}}
function cleanSkins(s){const o={};if(!s||typeof s!=='object')return o;for(const w in s){if(W[w]&&Array.isArray(s[w])&&D.SK[s[w][0]]&&(D.SK[s[w][0]].w===w))o[w]=[s[w][0],clamp(+s[w][1]||0,0,1)]}return o}
function sendClient(o){if(NETOK&&S)BUS.pub(TOP(S.code)+'/c',o)}
// host migracija
function migrate(){if(!S||S.isHost||!S.info)return;const oldH=S.hostId;
 const cands=S.info.pl.filter(p=>!p.b&&p.cn&&p.id!==oldH).sort((a,b)=>a.i-b.i);if(!cands.length)return;
 if(cands[0].id!==myId){S.lastHost=perf()-1.5;S.hostId=null;$('#net').textContent='Domaćin je otišao – čekam novog domaćina…';return}
 const g=new SIM.Game({map:S.info.map,diff:S.info.diff,hostId:myId});g.load(S.info);g.hostId=myId;if(oldH)g.leave(oldH);g.balance();
 g.onEvent=e=>{S.seen.add(e.id);onEvent(e)};S.game=g;S.isHost=true;S.hostId=myId;
 const mp=g.byId(myId);if(mp){S.myIdx=mp.idx;mp.skins=INV.skinsMap()}
 if(NETOK){BUS.sub(TOP(S.code)+'/c',S.fnC)}$('#net').textContent='';toast('Ti si sada domaćin sobe 👑',3000);g.emit({ty:'msg',txt:nick()+' je novi domaćin'})}
function demote(h){if(!S||!S.isHost)return;S.isHost=false;S.game=null;S.hostId=h;if(NETOK)BUS.unsub(TOP(S.code)+'/c',S.fnC);S.lastHost=perf();toast('Spojeno na postojećeg domaćina')}
// ---------- snapshot / info ----------
function onSnap(s){const now=perf();const sample=s.t-now;if(S.off==null)S.off=sample;else if(sample>S.off)S.off=S.off*.7+sample*.3;else S.off=S.off*.995+sample*.005;
 S.snaps.push(s);if(S.snaps.length>40)S.snaps.shift();S.mode=s.md;
 for(const e of s.ev||[]){if(S.seen.has(e.id))continue;S.seen.add(e.id);onEvent(e)}if(S.seen.size>3000)S.seen=new Set([...S.seen].slice(-1500));
 const mine=s.p.find(q=>q[0]===S.myIdx);if(mine)ownFromSnap(mine[1]/100,mine[2]/100,mine[3]/100,mine[4]/1000,mine[7],mine[8],mine[10],mine[11]/10)}
function ownFromSnap(x,y,z,yaw,f,hp,sp,flash){const me=S.me;const alive=!!(f&1);
 if(sp!==me.sp){me.sp=sp;if(alive){me.x=x;me.y=y;me.z=z;me.vx=me.vy=me.vz=0;me.duck=0;me.yaw=yaw;me.pitch=0;me.onGround=true;me.ws=SIM.newWS();me.alive=true;S.dead=0;R.vmEvent('draw',.5);me.ws.draw=perf()+.4;me.cur=me.inv[1]?1:me.inv[2]?2:3;S.spawnT=perf()}}
 if(me.alive&&!alive){me.alive=false;S.deathT=perf()}else if(alive&&!me.alive&&sp===me.sp){me.alive=true}
 me.hp=hp;me.flash=flash;me.planting=!!(f&8);me.defusing=!!(f&16)}
function onInfo(i){if(!S)return;if(i.map&&i.map!==S.loadedMap)loadMap(i.map);S.mode=i.mode;
 const mp=i.pl.find(p=>p.id===myId);
 if(!mp){if(!S.isHost&&perf()-S.helloT>1){S.helloT=perf();sendClient({k:'hello',id:myId,n:nick(),ag:agPair(),sk:INV.skinsMap(),tm:S.teamPref})}return}
 S.myIdx=mp.i;syncMe(mp,i);
 // dim/vatra za kasno pridružene
 for(const s of i.smokes)R.smoke(s.id,[s.x,s.y,s.z],s.t);for(const f of i.fires)R.fire(f.id,[f.x,f.y,f.z],f.r,f.t);
 if(i.over===undefined&&i.mode!=='over'){}
}
function syncMe(mp,i){const me=S.me,now=perf();me.side=mp.sd;me.team=mp.tm;me.ar=mp.ar;me.helm=!!mp.hm;me.kit=!!mp.kt;me.money=mp.$;if(!me.alive||S.isHost)me.hp=mp.hp;me.st=mp.st;
 const quiet=now-me.ws.lastShot>.8&&!me.ws.rl;
 for(const s of [1,2]){const h=mp.inv[s],l=me.inv[s];
  if(!h){if(l&&now-(me.lastLocal||0)>1)me.inv[s]=null}
  else if(!l||l.w!==h[0]){const isNew=!l||l.w!==h[0];me.inv[s]={w:h[0],clip:h[1],res:h[2],sk:h[3]||0};if(isNew&&now-(me.lastLocal||0)>1&&me.alive&&(s===1||!me.inv[1])){selectLocal(s)}}
  else{if(quiet){l.clip=h[1];l.res=h[2]}l.sk=h[3]||0}}
 me.inv[3].sk=mp.inv[3]||0;
 if(now-(me.lastNade||0)>1.2)me.inv[4]=mp.inv[4].slice();
 if(now-(me.lastLocal||0)>1)me.inv[5]=!!mp.inv[5];
 if(now-(me.lastZeus||0)>1.5)me.inv[6]=!!mp.inv[6];
 if(!SIM.hasSlot(me,me.cur))selectLocal(SIM.bestSlot(me))}
function selectLocal(s){const me=S.me;if(!SIM.hasSlot(me,s))return;const before=me.cur;SIM.selectSlot(me,s,perf());if(me.cur!==before||s===4){R.vmEvent('draw',(W[SIM.curW(me)]||{}).draw||.5);S.inspect=0}}

// ======================= DOGAĐAJI =======================
function entPos(idx){const e=S.ents.find(q=>q.idx===idx);return e?[e.x,e.y+1.2,e.z]:null}
function pInfo(idx){return S.info?S.info.pl.find(p=>p.i===idx):null}
function onEvent(e){if(!S)return;const me=S.me;const near=p=>p&&Math.hypot(p[0]-AU.lis.x,p[2]-AU.lis.z);
 switch(e.ty){
  case 'shot':{if(e.p===S.myIdx&&me.alive)break;const ep=entPos(e.p);const mz=R.muzzleOf(e.p)||(ep?{x:ep[0],y:ep[1]+.3,z:ep[2]}:null);
   AU.shot(e.w,e.o,false);if(mz&&!W[e.w].sil)R.muzzle(mz,W[e.w].cat==='sniper');const ent=S.ents.find(q=>q.idx===e.p);if(ent)ent.kick=1;
   for(let i=0;i+3<e.e.length;i+=4){const end=[e.e[i],e.e[i+1],e.e[i+2]],k=e.e[i+3];if(mz&&i<12)R.tracer([mz.x,mz.y,mz.z],end);if(k===3||k===2){const d=[end[0]-e.o[0],end[1]-e.o[1],end[2]-e.o[2]],L=Math.hypot(...d)||1;R.impact(end,k===2?[0,1,0]:[-d[0]/L,-d[1]/L,-d[2]/L],0)}}break}
  case 'hit':{const vp=entPos(e.v);if(vp)R.blood([vp[0],vp[1]+(e.hg==='head'?.5:0),vp[2]]);
   if(e.v===S.myIdx){AU.hurt();dmgDir(e.x,e.z);S.shake=Math.max(S.shake,.15)}
   if(e.a===S.myIdx&&e.v!==S.myIdx){AU.hit(e.hg==='head');const h=$('#hitm');h.className=e.hg==='head'?'hs':'';h.style.opacity=1;clearTimeout(h._t);h._t=setTimeout(()=>h.style.opacity=0,120)}break}
  case 'kill':killfeed(e);if(e.v===S.myIdx){me.alive=false;S.deathT=perf();S.killer=e.k}break;
  case 'radio':{const p=pInfo(e.p);if(!p)break;radioLog(p,e.m,e.zn);AU.radio();break}
  case 'throw':{const p=entPos(e.p);if(e.p!==S.myIdx)AU.throw_(p)}break;
  case 'bnc':{const n=(S.lastNades||[]).find(q=>q[0]===e.id);if(n)AU.bounce([n[2],n[3],n[4]])}break;
  case 'boom':R.explosion([e.x,e.y,e.z],e.w==='fizz'?'fizz':'he');AU.boom([e.x,e.y,e.z],false);{const d=near([e.x,0,e.z]);if(d<14)S.shake=Math.max(S.shake,.5*(1-d/14))}break;
  case 'flashb':R.explosion([e.x,e.y,e.z],'flash');AU.flashBang([e.x,e.y,e.z]);setTimeout(()=>{if(S&&S.me.flash>1.2)AU.ring(S.me.flash)},120);break;
  case 'smoke':R.smoke(e.id,[e.x,e.y,e.z],0);AU.smoke([e.x,e.y,e.z]);break;
  case 'fire':R.fire(e.id,[e.x,e.y,e.z],e.r,0);AU.fire([e.x,e.y,e.z]);break;
  case 'fireout':R.fireOut(e.id);break;
  case 'c4boom':R.explosion([e.x,e.y,e.z],'c4');AU.boom([e.x,e.y,e.z],true);S.shake=1.2;break;
  case 'plant':banner('Bomba je postavljena','Site '+e.site,'#ff5b4b',3.5);AU.beep(null,true);break;
  case 'planting':if(e.p!==S.myIdx){const p=entPos(e.p);AU.plantBeep()}break;
  case 'defusing':{const p=entPos(e.p);AU.defuse(p)}break;
  case 'defused':break;
  case 'round':{const good=me.side===e.win;const why={elim:'Eliminacija',bomb:'Bomba je eksplodirala',defuse:'Bomba je deaktivirana',time:'Vrijeme je isteklo'}[e.why]||'';
   const mv=pInfo(e.mvp);banner(e.win==='T'?'Teroristi pobjeđuju':'Anti-teroristi pobjeđuju',why+(mv?' · MVP: '+mv.n:''),e.win==='T'?'#e2b04a':'#5d9cec',5);AU.win(good);break}
  case 'rs':R.clearRound();S.over=null;$('#end').classList.remove('on');me.ws=SIM.newWS();break;
  case 'go':AU.roundStart();centerMsg('Idemo!','',1.2);if(S.buyOpen&&S.mode!=='warmup'){}break;
  case 'over':matchOver(e);break;
  case 'msg':centerMsg(e.txt,'',3);break;
  case 'knife':if(e.p!==S.myIdx)AU.knife(entPos(e.p),e.hit);else if(e.hit)AU.knife(null,1);break;
  case 'pick':if(e.p===S.myIdx)AU.click();break;
  case 'decoy':AU.shot(e.w,[e.x,e.y,e.z],false,e.d||0);break;
  case 'map':R.clearRound();break;
 }}
function dmgDir(x,z){const me=S.me;const a=Math.atan2(-(x-me.x),-(z-me.z));const rel=a-me.yaw;const el=document.createElement('i');el.style.transform=`rotate(${-rel}rad)`;$('#dmg').appendChild(el);setTimeout(()=>el.style.opacity=0,500);setTimeout(()=>el.remove(),1400)}
let bannerT=0;function banner(t,sub,col,sec){const b=$('#banner');b.querySelector('b').textContent=t;b.querySelector('b').style.color=col||'#fff';b.querySelector('small').textContent=sub||'';b.classList.remove('on');void b.offsetWidth;b.classList.add('on');clearTimeout(bannerT);bannerT=setTimeout(()=>b.classList.remove('on'),(sec||3)*1000)}
let msgT=0;function centerMsg(t,sub,sec){const m=$('#msg');m.innerHTML=esc(t)+(sub?'<small>'+esc(sub)+'</small>':'');clearTimeout(msgT);msgT=setTimeout(()=>m.innerHTML='',(sec||2)*1000)}
function killfeed(e){const k=pInfo(e.k),v=pInfo(e.v),a=pInfo(e.a);const el=document.createElement('div');el.className='kf'+((e.k===S.myIdx||e.v===S.myIdx)&&e.k!==e.v?' me':'');
 const nm=p=>p?`<span class="${p.sd}">${esc(p.n)}</span>`:'';const cvs=mkCanvas(108,40);const wk=W[e.w]?e.w:null;if(wk)putIcon(cvs,wk);
 el.innerHTML=(k&&e.k!==e.v?nm(k)+(a?' + '+nm(a):''):(e.w==='c4'?'💥':e.w==='world'?'☠':''));if(wk)el.appendChild(cvs);else{const s=document.createElement('span');s.textContent=e.w==='c4'?'C4':e.w==='world'?'pad':'';el.appendChild(s)}
 if(e.hs){const s=document.createElement('span');s.className='hs';s.textContent='◎';el.appendChild(s)}if(e.fl){const s=document.createElement('span');s.textContent='✺';el.appendChild(s)}
 el.insertAdjacentHTML('beforeend',nm(v));const f=$('#feed');f.appendChild(el);while(f.children.length>6)f.firstChild.remove();setTimeout(()=>el.style.opacity=0,7000);setTimeout(()=>el.remove(),7600)}
function radioLog(p,m,zn){const el=document.createElement('div');el.innerHTML=`<span class="${p.sd}">[${p.sd}] ${esc(p.n)}</span> <span class="zn">@${esc(zn||'')}</span>: ${esc(m)}`;
 const l=$('#rlog');l.appendChild(el);while(l.children.length>6)l.firstChild.remove();setTimeout(()=>el.style.opacity=0,6500);setTimeout(()=>el.remove(),7200)}
function matchOver(e){const me=S.me;const info=S.info;const mp=info&&info.pl.find(p=>p.id===myId);const myTeam=mp?mp.tm:me.team;const won=e.wt===myTeam;
 const mn=info?info.matchNo:0;let drops=[];if(!S.dropDone[mn]){S.dropDone[mn]=1;drops=INV.matchDrop(won)}
 $('#endT').textContent=won?'🏆 POBJEDA!':'Poraz';$('#endT').style.color=won?'#7cff01':'#ff6b6b';
 const my=e.ts[myTeam],op=e.ts[1-myTeam];$('#endScore').textContent=my+' : '+op;
 const st=mp?mp.st:{k:0,d:0,a:0};$('#endMe').innerHTML=`<small style="color:var(--mut)">Tvoj učinak</small><br><b>${st.k}</b> ubistava · <b>${st.a}</b> asistencija · <b>${st.d}</b> smrti · MVP ×${st.mvp||0}`;
 const ed=$('#endDrops');ed.innerHTML='';if(drops.length){drops.forEach(it=>ed.appendChild(itemCard(it,true)));AU.drop(it0rar(drops))}else ed.innerHTML='<small style="color:var(--mut)">Ovaj put nema dropa. Ključevi padaju vrlo rijetko – samo nakon pobjede!</small>';
 $('#end').classList.add('on');document.exitPointerLock&&document.exitPointerLock();S.over={t:perf()};AU.win(won)}
function it0rar(l){return l.some(i=>i.t==='key')?3:1}

// ======================= KONTROLE =======================
const K={};let mouseAtk=0,mouseAtk2=0;const inp={fw:0,sd:0,jump:0,duck:0,walk:0,atk:0,atk2:0,use:0};const press={};
const touch={fw:0,sd:0,atk:0,atk2:0,jump:0,duck:0,use:0,duckT:0};
function locked(){return document.pointerLockElement===$('#c')}
function lockPointer(){if(MOB||!S)return;try{const r=$('#c').requestPointerLock({unadjustedMovement:true});if(r&&r.catch)r.catch(()=>{try{$('#c').requestPointerLock()}catch(e){}})}catch(e){try{$('#c').requestPointerLock()}catch(_){}}}
function anyOverlay(){return S&&(S.buyOpen||$('#pause').classList.contains('on')||$('#pset').classList.contains('on')||$('#pmap').classList.contains('on')||$('#end').classList.contains('on'))}
document.addEventListener('pointerlockchange',()=>{if(!S)return;if(!locked()&&!anyOverlay()&&!MOB){openPause()}});
$('#c').addEventListener('mousedown',e=>{AU.resume();if(!S)return;if(!locked()&&!MOB){if(!anyOverlay())lockPointer();return}if(e.button===0)mouseAtk=1;if(e.button===2)mouseAtk2=1;e.preventDefault()});
addEventListener('mouseup',e=>{if(e.button===0)mouseAtk=0;if(e.button===2)mouseAtk2=0});
addEventListener('contextmenu',e=>{if(S)e.preventDefault()});
addEventListener('mousemove',e=>{if(!S||!locked()||S.buyOpen)return;look(e.movementX,e.movementY,SET.sens*.0022)});
addEventListener('wheel',e=>{if(!S||!locked())return;cycleWeapon(e.deltaY>0?1:-1)},{passive:true});
function look(dx,dy,k){const me=S.me;const z=zoomFov()/SET.fov;me.yaw-=dx*k*z;me.pitch=clamp(me.pitch-dy*k*z,-1.55,1.55);if(!me.alive&&Math.abs(dx)>40&&!MOB){}}
function cycleWeapon(d){const me=S.me;if(!me.alive)return;const order=[1,2,3,6,4,5].filter(s=>SIM.hasSlot(me,s));let i=order.indexOf(me.cur);if(i<0)i=0;const n=order[(i+d+order.length)%order.length];if(n)selectLocal(n)}
addEventListener('keydown',e=>{const c=e.code;if(e.target&&e.target.tagName==='INPUT')return;
 if(!S)return;AU.resume();
 if(['Tab','F3','F4','Space'].includes(c)||(c.startsWith('Digit')&&!e.ctrlKey)||c==='Delete')e.preventDefault();
 if(K[c])return;K[c]=1;
 if(c==='Escape'){if(S.buyOpen){toggleBuy(false);return}}
 if(c==='KeyB'){toggleBuy();return}
 if(c==='Tab'){S.sbOpen=true;$('#sb').classList.add('on');renderSB();return}
 if(S.buyOpen&&c.startsWith('Digit')){buyKey(+c.slice(5));return}
 if(c==='F3'){act({k:'auto'});return}if(c==='F4'){act({k:'rebuy'});return}if(c==='Delete'){act({k:'refund'});return}
 if(anyOverlay())return;
 if(c.startsWith('Digit')){const n=+c.slice(5);if(n>=1&&n<=5)selectLocal(n);return}
 if(c==='KeyQ'){const me=S.me;if(SIM.hasSlot(me,me.prev))selectLocal(me.prev);return}
 if(c==='KeyR')press.rl=1;if(c==='KeyE'){act({k:'use'})}
 if(c==='KeyG')dropCur();if(c==='KeyF')S.inspect=perf();
 if(c==='KeyZ')act({k:'radio',m:'go'});if(c==='KeyX')act({k:'radio',m:'enemy'});if(c==='KeyV')act({k:'radio',m:'need'});
});
addEventListener('keyup',e=>{K[e.code]=0;if(e.code==='Tab'&&S){S.sbOpen=false;$('#sb').classList.remove('on')}});
addEventListener('blur',()=>{for(const k in K)K[k]=0;mouseAtk=mouseAtk2=0});
function dropCur(){const me=S.me;if(!me.alive)return;const s=me.cur;if(s===3||s===6)return;act({k:'drop',s});me.lastLocal=perf();
 if(s===1||s===2)me.inv[s]=null;else if(s===4){me.inv[4].splice((me.nsel||0)%Math.max(1,me.inv[4].length),1);me.lastNade=perf()}else if(s===5)me.inv[5]=false;if(!SIM.hasSlot(me,me.cur))selectLocal(SIM.bestSlot(me))}
function act(a){if(!S)return;S.pending.push(a);if(a.k==='buy'||a.k==='rebuy'||a.k==='auto')AU.buy();if(a.k==='refund')AU.click()}
// ---------- dodir ----------
(function(){const T=$('#touch');const joy=$('#joy'),knob=joy.querySelector('i');let jId=null,jx=0,jy=0,lookId=null,lx=0,ly=0;const fires=new Map();
 T.addEventListener('pointerdown',e=>{AU.resume();if(!S)return;const b=e.target.closest('.tb');
  if(b){e.preventDefault();b.classList.add('act');const k=b.dataset.k;b.setPointerCapture(e.pointerId);
   if(k==='atk'){touch.atk=1;fires.set(e.pointerId,{x:e.clientX,y:e.clientY,b})}else if(k==='atk2')touch.atk2=1;else if(k==='jump')touch.jump=1;else if(k==='duck'){touch.duck=touch.duck?0:1;b.classList.toggle('on',!!touch.duck)}
   else if(k==='use'){touch.use=1;act({k:'use'})}else if(k==='rl')press.rl=1;else if(k==='next')cycleWeapon(1);else if(k==='nade'){if(SIM.hasSlot(S.me,4))selectLocal(4);else if(SIM.hasSlot(S.me,5))selectLocal(5)}
   else if(k==='buy')toggleBuy();else if(k==='tab'){S.sbOpen=!S.sbOpen;$('#sb').classList.toggle('on',S.sbOpen);if(S.sbOpen)renderSB()}else if(k==='menu')openPause();return}
  if(e.clientX<innerWidth*.42&&jId==null){jId=e.pointerId;jx=e.clientX;jy=e.clientY;joy.style.display='block';joy.style.left=(jx-60)+'px';joy.style.top=(jy-60)+'px';knob.style.transform='';T.setPointerCapture(e.pointerId)}
  else if(lookId==null){lookId=e.pointerId;lx=e.clientX;ly=e.clientY;T.setPointerCapture(e.pointerId);if(S&&!S.me.alive)S.specNext=1}});
 T.addEventListener('pointermove',e=>{if(!S)return;
  if(e.pointerId===jId){let dx=e.clientX-jx,dy=e.clientY-jy;const d=Math.hypot(dx,dy),m=50;if(d>m){dx*=m/d;dy*=m/d}knob.style.transform=`translate(${dx}px,${dy}px)`;touch.sd=dx/m;touch.fw=-dy/m;
   const mag=Math.hypot(touch.sd,touch.fw);if(mag<.18){touch.sd=touch.fw=0}touch.walk=mag<.55}
  else if(e.pointerId===lookId){look(e.clientX-lx,e.clientY-ly,SET.tsens*.0048);lx=e.clientX;ly=e.clientY}
  else if(fires.has(e.pointerId)){const f=fires.get(e.pointerId);look(e.clientX-f.x,e.clientY-f.y,SET.tsens*.0048);f.x=e.clientX;f.y=e.clientY}});
 const up=e=>{const b=e.target.closest&&e.target.closest('.tb');
  if(fires.has(e.pointerId)){fires.get(e.pointerId).b.classList.remove('act');fires.delete(e.pointerId);if(!fires.size)touch.atk=0;return}
  if(b){b.classList.remove('act');const k=b.dataset.k;if(k==='atk2')touch.atk2=0;if(k==='jump')touch.jump=0;if(k==='use')touch.use=0;return}
  if(e.pointerId===jId){jId=null;joy.style.display='none';touch.fw=touch.sd=0}if(e.pointerId===lookId)lookId=null};
 T.addEventListener('pointerup',up);T.addEventListener('pointercancel',up);
 $('#slots').addEventListener('pointerdown',e=>{const s=e.target.closest('.sl');if(s&&S)selectLocal(+s.dataset.s)})})();
function readInput(){const me=S.me;let fw=0,sd=0;if(K.KeyW||K.ArrowUp)fw+=1;if(K.KeyS||K.ArrowDown)fw-=1;if(K.KeyD||K.ArrowRight)sd+=1;if(K.KeyA||K.ArrowLeft)sd-=1;
 if(MOB){fw+=touch.fw;sd+=touch.sd}
 inp.fw=clamp(fw,-1,1);inp.sd=clamp(sd,-1,1);inp.jump=!!(K.Space||touch.jump);inp.duck=!!(K.ControlLeft||K.ControlRight||K.KeyC||touch.duck);inp.walk=!!(K.ShiftLeft||K.ShiftRight||(MOB&&touch.walk&&(touch.fw||touch.sd)));
 inp.atk=!!((locked()&&mouseAtk)||touch.atk||window.__bsAtk);inp.atk2=!!((locked()&&mouseAtk2)||touch.atk2);inp.use=!!(K.KeyE||touch.use)}

// ======================= GLAVNA PETLJA =======================
let last=perf(),fpsA=60,fpsT=0,fpsN=0,lowFps=0;
function frame(){requestAnimationFrame(frame);const now=perf();let dt=Math.min(.1,now-last);last=now;
 fpsN++;fpsT+=dt;if(fpsT>=1){fpsA=fpsN/fpsT;fpsN=0;fpsT=0;if(SET.fps)$('#fps').textContent=Math.round(fpsA)+' fps';else $('#fps').textContent='';
  if(SET.q==='auto'&&S&&fpsA<40){if(++lowFps>=4){lowFps=0;const q=R.q==='high'?'med':R.q==='med'?'low':null;if(q){R.setQuality(q);toast('Grafika automatski smanjena ('+q+')')}}}else lowFps=0}
 if(!S){menuFrame(dt);return}
 const c0=performance.now();try{gameFrame(dt,now)}catch(err){console.error(err);if(!frame._e){frame._e=1;toast('⚠️ '+err.message,6000)}}cpuMs=cpuMs*.95+(performance.now()-c0)*.05}
let cpuMs=0;
function gameFrame(dt,now){const me=S.me;readInput();
 if(S.isHost){S.game.input(myId,buildPkt(true));S.acc+=dt;let n=0;while(S.acc>=1/64&&n<8){S.game.tick(1/64);S.acc-=1/64;n++}if(n>=8)S.acc=0;hostNet(now)}
 else{clientNet(now)}
 if(!S)return;
 if(!S.loadedMap||!S.M){R.r.clear();return}
 // lokalno kretanje
 const mode=S.isHost?S.game.mode:S.mode;const frozen=mode==='freeze'||mode==='over';
 const onSite=S.M.siteAt(me.x,me.z);const bomb=curBomb();
 S.planting=me.alive&&me.cur===5&&me.inv[5]&&inp.atk&&me.onGround&&onSite&&mode==='live'&&bomb&&bomb.st==='carried';
 const defusing=me.alive&&me.side==='CT'&&inp.use&&bomb&&bomb.st==='planted'&&Math.hypot(me.x-bomb.x,me.z-bomb.z)<2;
 if(me.alive){const ms=frozen||S.planting||defusing?0:SIM.maxSpd(me);const cmd={fw:S.buyOpen?0:inp.fw,sd:S.buyOpen?0:inp.sd,jump:!S.buyOpen&&inp.jump,duck:inp.duck||S.planting||defusing,walk:inp.walk,maxspd:ms};
  let left=dt;const wasG=me.onGround;while(left>1e-4){const h=Math.min(left,1/90);pmove(S.M,me,cmd,h);left-=h}
  if(!wasG&&me.onGround)AU.land(null,true);
  // koraci
  const sp=Math.hypot(me.vx,me.vz);if(me.onGround&&sp>3.2&&!inp.walk&&me.duck<.5){S.stepDist+=sp*dt;if(S.stepDist>2.2){S.stepDist=0;AU.step(null,true)}}
  // oružje
  const out=[];const canFire=(mode==='live'||mode==='warmup'||mode==='end')&&!S.buyOpen&&!defusing&&!(anyOverlay());
  SIM.wTick(me,{atk:inp.atk&&!S.planting,atk2:inp.atk2,rl:press.rl,sel:0},now,dt,out,{canFire,rnd:Math.random});press.rl=0;SIM.flushLater&&SIM.flushLater();
  for(const a of out)localAction(a,now);
  if(S.planting){if(!S.plantT)S.plantT=now;if(now-(S.lastPB||0)>.45){S.lastPB=now;AU.plantBeep()}}else S.plantT=0;
 }
 // spektator / kamera
 buildEnts(dt);R.syncPlayers(S.ents,me.alive?S.myIdx:(S.specIdx&&S.spec&&perf()-S.deathT>=2.2?S.specIdx:-1),me.side,dt,now);
 const snapLast=S.isHost?null:S.snaps[S.snaps.length-1];
 R.syncNades(S.isHost?S.game.nades.map(n=>[n.id,n.w,n.x,n.y,n.z]):(snapLast?snapLast.n:[]));S.lastNades=S.isHost?S.game.nades.map(n=>[n.id,n.w,n.x,n.y,n.z]):(snapLast?snapLast.n:[]);
 R.syncDrops(S.isHost?S.game.drops:(S.info?S.info.drops:[]),bomb);
 const cam=camera(dt,now);
 // C4 bip
 let blink=null;if(bomb&&bomb.st==='planted'){const left=bomb.t;const iv=left>10?1:left>5?.5:left>2?.25:.12;if(now-S.lastC4Beep>iv){S.lastC4Beep=now;AU.beep([bomb.x,bomb.y,bomb.z],left<10)}blink=(now-S.lastC4Beep)<.12}
 cam.c4blink=blink;
 AU.lis.x=cam.x;AU.lis.y=cam.y;AU.lis.z=cam.z;AU.lis.yaw=cam.yaw;
 const w=SIM.curW(me);const it=SIM.curItem(me);
 const wd=W[w]||{};const scoped=me.alive&&wd.scope&&me.ws.zoom>0;
 if(me.alive&&!S.spec)R.setVM(w,it?it.sk:(w==='knife'?me.inv[3].sk:0),me.side,agOf(me.side,(pInfo(S.myIdx)||{}).ag));
 else{const t=S.ents.find(e=>e.idx===S.specIdx);if(t&&t.alive)R.setVM(t.w,t.sk,t.side,agOf(t.side,t.ag));else R.setVM(null)}
 if(me.ws.pin&&R.vm.anim!=='pin')R.vmEvent('pin',1);
 R.frame(cam,dt,{speed:Math.hypot(me.vx,me.vz),og:me.onGround,yaw:cam.yaw,pitch:cam.pitch,hide:scoped&&me.alive||(!me.alive&&!S.specIdx),inspect:S.inspect&&now-S.inspect<2.5});
 hudFrame(dt,now,scoped,wd);if(S.buyOpen&&prev)prev.render(dt);}
function curBomb(){if(S.isHost)return S.game.bomb;const s=S.snaps[S.snaps.length-1];if(!s)return null;const b=s.b;if(b[0]===1)return {st:'planted',x:b[1],y:b[2],z:b[3],t:b[4]-(hostNow()-s.t),def:b[5],dp:b[6],dlen:b[7]};if(b[0]===2)return {st:'dropped',x:b[1],y:b[2],z:b[3]};if(b[0]===3)return {st:'carried',c:b[1]};return {st:'none'}}
function localAction(a,now){const me=S.me;const lt=S.isHost?S.game.t:hostNow()-.1;
 if(a.k==='shot'){a.lt=+lt.toFixed(3);S.pending.push(a);R.vmEvent('fire');AU.shot(a.w,null,true);
  const wd=W[a.w];const mz=R.vmMuzzleWorld();if(mz&&!wd.sil)R.muzzle(mz,wd.cat==='sniper');
  for(let i=0;i+2<a.ds.length;i+=3){const d=[a.ds[i],a.ds[i+1],a.ds[i+2]];const h=S.M.raycast(a.o[0],a.o[1],a.o[2],d[0],d[1],d[2],wd.range||200);let t=h?h.t:(wd.range||200);
   // pogodak u igrača (samo vizuelno)
   let hitP=false;for(const e of S.ents){if(!e.alive||e.idx===S.myIdx||e.side===me.side)continue;const r=SIM.hitTest(a.o,d,t,e.x,e.y,e.z,e.duck||0);if(r&&r.t<t){t=r.t;hitP=true}}
   const end=[a.o[0]+d[0]*t,a.o[1]+d[1]*t,a.o[2]+d[2]*t];if(mz&&(i===0||wd.pel>1&&i<12))R.tracer([mz.x,mz.y,mz.z],end,true);if(h&&!hitP&&t<(wd.range||200)-.01)R.impact(end,[h.nx,h.ny,h.nz],0);if(hitP)R.blood(end)}
  if(a.w==='zeus'){me.lastZeus=now}}
 else if(a.k==='knife'){a.lt=+lt.toFixed(3);S.pending.push(a);R.vmEvent(a.alt?'knife2':'knife',a.alt?.5:.35);AU.knife(null,0)}
 else if(a.k==='throw'){S.pending.push(a);R.vmEvent('throw',.35);AU.throw_(null,true);me.lastNade=now}
 else if(a.k==='rl'){const wd=W[SIM.curW(me)];R.vmEvent('reload',wd.pump?wd.rel+.3:wd.rel);AU.reload(0);setTimeout(()=>AU.reload(1),wd.rel*600)}
 else if(a.k==='zoom'){S.pending.push(a);AU.click()}
 else if(a.k==='dry')AU.dry()}
function buildPkt(full){const me=S.me;const r2=v=>Math.round(v*100)/100;
 const pk={k:'in',id:myId,sp:me.sp,p:[r2(me.x),r2(me.y),r2(me.z)],v:[r2(me.vx),r2(me.vy),r2(me.vz)],a:[+me.yaw.toFixed(3),+me.pitch.toFixed(3)],d:+me.duck.toFixed(2),g:me.onGround?1:0,
  b:(inp.atk&&!S.buyOpen?1:0)|(inp.use?4:0),c:me.cur,n:me.nsel|0,z:me.ws.zoom|0,am:[1,2].filter(s=>me.inv[s]).map(s=>[me.inv[s].w,me.inv[s].clip,me.inv[s].res])};
 if(S.pending.length){pk.e=S.pending;S.pending=[]}return pk}
function hostNet(now){const g=S.game;S.mode=g.mode;
 if(g.dirty&&now-S.lastInfoB>.15||now-S.lastInfoB>1){S.lastInfoB=now;g.dirty=0;const i=g.info();i.h=myId;S.info=i;onInfo(i);if(NETOK&&BUS.ready())BUS.pub(TOP(S.code)+'/h',i)}
 // vlastiti spawn/zdravlje direktno iz igre
 const p=g.byId(myId);if(p)ownFromSnap(p.x,p.y,p.z,p.yaw,(p.alive?1:0)|(p.planting?8:0)|(p.defusing?16:0),p.hp,p.sp,p.flash);
 if(NETOK&&BUS.ready()){if(now-S.lastSnapB>=.05){S.lastSnapB=now;const s=g.snap();s.h=myId;s.hi=S.myIdx;BUS.pub(TOP(S.code)+'/h',s)}
  if(now-S.lastBeacon>3){S.lastBeacon=now;const hum=g.humans().length;BUS.pub(LIST(),{k:'room',code:S.code,map:g.mapId,n:hum,nb:g.players.length-hum,max:10,hn:nick(),sc:[g.scoreBySide().T,g.scoreBySide().CT],md:g.mode,h:myId,emb:EMB?1:0})}}}
function clientNet(now){
 if(perf()-S.helloT>1&&!(S.info&&S.info.pl.some(p=>p.id===myId))){S.helloT=perf();sendClient({k:'hello',id:myId,n:nick(),ag:agPair(),sk:INV.skinsMap(),tm:S.teamPref})}
 const joined=S.info&&S.info.pl.some(p=>p.id===myId);if(!joined)S.pending=[];
 if(joined&&(now-S.lastSend>=.05||(S.pending.length&&now-S.lastSend>.025))){S.lastSend=now;sendClient(buildPkt())}
 const silent=now-S.lastHost;
 if(!S.info&&now-S.startT>14){toast('Soba #'+S.code+' nije pronađena.',4000);leaveSession();return}
 if(S.info&&silent>2.5)$('#net').textContent='Veza s domaćinom je prekinuta… ('+Math.round(silent)+'s)';
 if(S.info&&silent>5&&NETOK&&BUS.ready())migrate()}
// entiteti za prikaz (interpolacija)
function buildEnts(dt){const out=[];const info=S.info;const pl=info?info.pl:[];const byI=new Map(pl.map(p=>[p.i,p]));
 const wOf=(p,cur,ns)=>{if(!p)return ['knife',0];const iv=p.inv;if(cur===1&&iv[1])return [iv[1][0],iv[1][3]||0];if(cur===2&&iv[2])return [iv[2][0],iv[2][3]||0];if(cur===4)return [iv[4][ns%Math.max(1,iv[4].length)]||'he',0];if(cur===5)return ['c4',0];if(cur===6)return ['zeus',0];return ['knife',iv[3]||0]};
 if(S.isHost){for(const p of S.game.players){const ip=byI.get(p.idx);const [w,sk]=wOf(ip,p.cur,p.nsel||0);
   const pv=S.prevEnts.get(p.idx);const e={idx:p.idx,side:p.side,ag:p.ag,alive:p.alive,x:p.x,y:p.y,z:p.z,yaw:p.yaw,pitch:p.pitch,duck:p.duck,vx:p.vx,vz:p.vz,og:p.onGround,w,sk,name:p.n,plant:p.planting>0,defuse:p.defusing>0};
   if(pv&&p.bot&&Math.hypot(e.x-pv.x,e.z-pv.z)<2){const k=Math.min(1,dt*30);e.x=pv.x+(e.x-pv.x)*k;e.z=pv.z+(e.z-pv.z)*k;e.y=pv.y+(e.y-pv.y)*k}S.prevEnts.set(p.idx,{x:e.x,y:e.y,z:e.z});out.push(e)}}
 else{const sn=S.snaps;if(sn.length){const rt=hostNow()-.1;let a=sn[sn.length-1],b=a;for(let i=sn.length-1;i>0;i--){if(sn[i-1].t<=rt){a=sn[i-1];b=sn[i];break}}if(rt<sn[0].t){a=b=sn[0]}
   const f=b.t>a.t?clamp((rt-a.t)/(b.t-a.t),0,1.15):1;const am=new Map(a.p.map(q=>[q[0],q]));
   for(const q of b.p){const p0=am.get(q[0])||q;const ip=byI.get(q[0]);const L=(i,s)=>(p0[i]+(q[i]-p0[i])*f)/s;let dy=(q[4]-p0[4])/1000;while(dy>Math.PI)dy-=2*Math.PI;while(dy<-Math.PI)dy+=2*Math.PI;
    const [w,sk]=wOf(ip,q[9],q[14]|0);
    out.push({idx:q[0],side:ip?ip.sd:'T',ag:ip?ip.ag:0,alive:!!(q[7]&1),x:L(1,100),y:L(2,100),z:L(3,100),yaw:p0[4]/1000+dy*f,pitch:L(5,1000),duck:L(6,100),vx:q[12]/10,vz:q[13]/10,og:!!(q[7]&2),w,sk,name:ip?ip.n:'?',plant:!!(q[7]&8),defuse:!!(q[7]&16)})}}}
 // moj lik: koristi lokalnu poziciju
 const mi=out.find(e=>e.idx===S.myIdx);const me=S.me;if(mi&&me.alive){mi.x=me.x;mi.y=me.y;mi.z=me.z;mi.yaw=me.yaw;mi.pitch=me.pitch;mi.duck=me.duck}
 // trzaj tuđeg oružja
 for(const e of out){const old=S.ents.find(q=>q.idx===e.idx);e.kick=old&&old.kick?Math.max(0,old.kick-dt*8):0}
 S.ents=out}
function zoomFov(){const me=S.me;if(!me.alive)return SET.fov;const wd=W[SIM.curW(me)];if(wd&&wd.scope&&me.ws.zoom>0)return SET.fov*wd.scope[me.ws.zoom-1]/90;return SET.fov}
function camera(dt,now){const me=S.me;let c;
 S.shake=Math.max(0,S.shake-dt*1.8);const sh=S.shake*S.shake;const jx=(Math.random()-.5)*sh*.25,jy=(Math.random()-.5)*sh*.25;
 if(me.alive){S.spec=0;S.specIdx=0;c={x:me.x,y:pEye(me),z:me.z,yaw:me.yaw+me.ws.py*.5+jx,pitch:me.pitch+me.ws.pp*.5+jy,fov:zoomFov()};return c}
 // mrtav
 const alive=S.ents.filter(e=>e.alive&&e.idx!==S.myIdx);const mates=alive.filter(e=>e.side===me.side);const pool=mates.length?mates:alive;
 if(now-S.deathT<2.2&&S.deathT){const a=now*.3;const cx=me.x,cz=me.z;S.spec=1;return {x:cx+Math.sin(a)*3,y:me.y+2.6,z:cz+Math.cos(a)*3,yaw:Math.atan2(Math.sin(a),Math.cos(a)),pitch:-.55,fov:SET.fov}}
 if(!pool.length){S.spec=1;S.specIdx=0;const c2=S.M.spawnCenter(me.side||'T');return {x:60,y:55,z:75,yaw:0,pitch:-.9,fov:SET.fov}}
 if(!pool.some(e=>e.idx===S.specIdx)||S.specNext||(locked()&&mouseAtk&&!S.lastSpecClick)){let i=pool.findIndex(e=>e.idx===S.specIdx);S.specIdx=pool[(i+1)%pool.length].idx;S.specNext=0}
 S.lastSpecClick=mouseAtk;S.spec=1;const t=pool.find(e=>e.idx===S.specIdx);const eye=t.y+1.64-(1.64-1.17)*(t.duck||0);
 return {x:t.x,y:eye,z:t.z,yaw:t.yaw,pitch:t.pitch,fov:SET.fov}}

// ======================= HUD =======================
let radarBase=null;
function drawRadarBase(M,cv){const c=cv.getContext('2d');const s=cv.width/60;c.clearRect(0,0,cv.width,cv.height);const L=MP.LEG;
 for(let z=0;z<60;z++)for(let x=0;x<60;x++){const l=L[M.ch[z*60+x]];let col=null;
  if(l.k==='floor')col=l.roof?'rgba(150,150,150,.55)':'rgba(205,205,205,.6)';else if(l.k==='level')col='rgba(230,230,230,.75)';else if(l.k==='crate'||l.k==='barrel'||l.k==='lowwall')col='rgba(120,120,120,.75)';
  if(col){c.fillStyle=col;c.fillRect(x*s,z*s,s+.5,s+.5)}}
 for(const k of ['A','B']){const st=M.def.sites[k];c.fillStyle='rgba(200,40,30,.22)';c.fillRect(st[0]*s,st[1]*s,(st[2]-st[0]+1)*s,(st[3]-st[1]+1)*s);const p=M.def.plant[k];c.fillStyle='#ff5040';c.font=`bold ${s*4}px Arial`;c.textAlign='center';c.textBaseline='middle';c.fillText(k,(p[0]+.5)*s,(p[1]+.5)*s)}
 return cv}
function hudFrame(dt,now,scoped,wd){const me=S.me;const info=S.info;
 // nišan
 const xh=$('#xh');const show=me.alive&&!scoped&&!(wd&&wd.cat==='sniper')&&!S.spec;xh.style.display=show?'':'none';
 if(show){const inacc=wd&&wd.inacc?SIM.inaccOf(me,wd):.01;const gap=3+Math.min(40,inacc*600);if(!xh._b){xh._b=1;xh.innerHTML='<i></i><i></i><i></i><i></i><i></i>'}const L=7,T=2;const is=xh.children;
  is[0].style.cssText=`left:${-T/2}px;top:${-gap-L}px;width:${T}px;height:${L}px`;is[1].style.cssText=`left:${-T/2}px;top:${gap}px;width:${T}px;height:${L}px`;is[2].style.cssText=`left:${-gap-L}px;top:${-T/2}px;width:${L}px;height:${T}px`;is[3].style.cssText=`left:${gap}px;top:${-T/2}px;width:${L}px;height:${T}px`;is[4].style.cssText='display:none';xh.style.setProperty('--xc',SET.xc)}
 // scope
 const sc=$('#scope');const scOn=!!scoped&&!anyOverlay();sc.classList.toggle('on',scOn);sc.classList.toggle('dot',!!(scOn&&wd.cat!=='sniper'));
 // flash
 const fl=me.alive?clamp(me.flash/2.2,0,1):0;$('#flash').style.opacity=fl;
 // napredak (plant/defuse)
 const bomb=curBomb();const pr=$('#prog');
 if(S.planting){pr.classList.add('on');pr.querySelector('span').textContent='Postavljam bombu…';pr.querySelector('i').style.width=clamp((now-S.plantT)/RL.plantTime*100,0,100)+'%'}
 else if(bomb&&bomb.st==='planted'&&bomb.def===S.myIdx){pr.classList.add('on');pr.querySelector('span').textContent='Deaktiviram bombu… '+Math.max(0,bomb.dlen-bomb.dp).toFixed(1)+'s';pr.querySelector('i').style.width=clamp(bomb.dp/bomb.dlen*100,0,100)+'%'}
 else pr.classList.remove('on');
 S.hud+=dt;if(S.hud<.1)return;S.hud=0;
 const mode=S.isHost?S.game.mode:S.mode;
 // vrijeme
 let tm=0;if(S.isHost)tm=S.game.timer;else{const s=S.snaps[S.snaps.length-1];if(s)tm=s.tm-(hostNow()-s.t)}
 const T=$('#tmr');if(bomb&&bomb.st==='planted'){T.textContent='💣';T.className='red'}else{T.textContent=fmtT(tm);T.className=mode==='live'&&tm<10?'red':''}
 $('#rnd').textContent=mode==='warmup'?'ZAGRIJAVANJE':mode==='freeze'?'KUPOVINA':info?('RUNDA '+info.round):'';
 $('#warm').textContent=mode==='warmup'?'Warmup '+fmtT(tm):mode==='freeze'?'Runda počinje za '+Math.ceil(tm)+'s · B za kupovinu':mode==='over'?'Kraj meča':'';
 if(!info)return;
 const sbs={T:info.ts[info.swaps%2===0?0:1],CT:info.ts[info.swaps%2===0?1:0]};$('#scCT').textContent=sbs.CT;$('#scT').textContent=sbs.T;
 // avatari
 const alive=new Map(S.ents.map(e=>[e.idx,e.alive]));
 for(const sd of ['CT','T']){const l=info.pl.filter(p=>p.sd===sd).sort((a,b)=>a.i-b.i).slice(0,5);const el=$('#av'+sd);const key=l.map(p=>p.i+':'+(alive.get(p.i)?1:0)+':'+p.hp).join(',');if(el._k===key)continue;el._k=key;
  el.innerHTML=l.map(p=>`<div class="av ${sd.toLowerCase()}${alive.get(p.i)?'':' dead'}" title="${esc(p.n)}"><span>${esc(p.n.replace(/^BOT /,'')[0]||'?')}</span>${alive.get(p.i)?`<i style="width:${p.hp}%"></i>`:''}</div>`).join('')}
 // novac, hp, oklop, municija
 $('#money').innerHTML='$'+me.money;
 const hp=me.alive?me.hp:0;$('#sHp span').textContent=hp;$('#sHp').classList.toggle('low',hp<=20);$('#sAr span').textContent=me.alive?me.ar:0;$('#bl').style.display=me.alive?'':'none';$('#br').style.display=me.alive?'':'none';
 const it=SIM.curItem(me),w=SIM.curW(me);
 if(it&&W[it.w].mag){$('#ammo').innerHTML=`${it.clip} <small>| ${it.res}</small>`}else if(w===null)$('#ammo').textContent='';else $('#ammo').innerHTML=w==='zeus'?'1':(w&&W[w].slot===4?'1':'');
 $('#wname').textContent=w?(W[w].n+(it&&it.sk&&D.SK[it.sk[0]]?' | '+D.SK[it.sk[0]].n:'')):'';
 // zona
 const zp=me.alive?me:(S.ents.find(e=>e.idx===S.specIdx)||me);$('#zone').textContent=S.M.zoneName(zp.x,zp.z);
 // slotovi
 const sk=[1,2,3,6,4,5].map(s=>s+':'+(s===1||s===2?(me.inv[s]?me.inv[s].w:''):s===4?me.inv[4].join(','):SIM.hasSlot(me,s)?1:0)).join('|')+'|'+me.cur+(me.alive?1:0);
 const SL=$('#slots');if(SL._k!==sk){SL._k=sk;SL.innerHTML='';if(me.alive)for(const s of [1,2,3,6,4,5]){if(!SIM.hasSlot(me,s))continue;const d=document.createElement('div');d.className='sl'+(me.cur===s?' on':'');d.dataset.s=s===6?3:s;
   const cvs=mkCanvas(192,60);const ww=s===1||s===2?me.inv[s].w:s===3?'knife':s===6?'zeus':s===4?me.inv[4][(me.nsel||0)%me.inv[4].length]:'c4';putIcon(cvs,ww,s===3&&me.inv[3].sk?{knife:D.SK[me.inv[3].sk[0]].knife}:null);d.appendChild(cvs);
   const b=document.createElement('b');b.textContent=s===6?3:s;d.appendChild(b);if(s===4&&me.inv[4].length>1){const x=document.createElement('small');x.textContent='×'+me.inv[4].length;d.insertBefore(x,b)}SL.appendChild(d)}}
 // spektator
 const sp=$('#spec');if(!me.alive){const t=S.ents.find(e=>e.idx===S.specIdx);sp.classList.add('on');sp.innerHTML=t?`Gledaš: <b style="color:${t.side==='T'?'var(--t)':'var(--ct)'}">${esc(t.name)}</b><br><small style="color:var(--mut)">${MOB?'Dodirni ekran':'Klikni'} za sljedećeg igrača</small>`:'Mrtav si – čekaj sljedeću rundu'}else sp.classList.remove('on');
 // savjet
 const hint=$('#hint');let h='';if(me.alive){if(bomb&&bomb.st==='planted'&&me.side==='CT'&&Math.hypot(me.x-bomb.x,me.z-bomb.z)<2.5&&bomb.def!==S.myIdx)h=(MOB?'Drži E':'Drži E')+' za deaktivaciju'+(me.kit?' (kit: 5s)':' (10s)');
  else if(me.cur===5&&me.inv[5]&&!S.M.siteAt(me.x,me.z))h='Bombu možeš postaviti samo na A ili B siteu';
  else if(me.cur===5&&me.inv[5]&&mode==='live')h=(MOB?'Drži dugme za pucanje':'Drži lijevi klik')+' da postaviš bombu';
  else{const dr=(S.isHost?S.game.drops:info.drops).find(d=>Math.hypot(d.x-me.x,d.z-me.z)<1.8&&W[d.w].slot!==4);if(dr)h='E – uzmi '+W[dr.w].n}}
 hint.textContent=h;hint.classList.toggle('on',!!h);
 // radar
 drawRadar();
 if(S.buyOpen)refreshBuy();if(S.sbOpen)renderSB();
 if(S.over){$('#endNext').textContent=mode==='over'?'Novi meč počinje za '+Math.ceil(tm)+'s':'';if(mode!=='over'&&perf()-S.over.t>3){S.over=null;$('#end').classList.remove('on')}}
 // ako je kupovina zatvorena
 if(S.buyOpen&&!canBuyLocal()&&mode!=='warmup'){toggleBuy(false)}}
function drawRadar(){const cv=$('#rad');const c=cv.getContext('2d');if(!radarBase){radarBase=drawRadarBase(S.M,mkCanvas(240,240))}c.clearRect(0,0,240,240);c.drawImage(radarBase,0,0);const s=4/2;// 4px po ćeliji = 2px po metru
 const me=S.me;const now=perf();
 // uočeni neprijatelji (LOS od bilo kog saigrača)
 if(now-S.lastSpot>.25){S.lastSpot=now;const mates=S.ents.filter(e=>e.alive&&e.side===me.side);for(const en of S.ents){if(!en.alive||en.side===me.side)continue;
   for(const m of mates){const dx=en.x-m.x,dy=(en.y+1.2)-(m.y+1.6),dz=en.z-m.z,d=Math.hypot(dx,dy,dz);if(d>70)continue;const r=S.M.raycast(m.x,m.y+1.6,m.z,dx/d,dy/d,dz/d,d);if(!r||r.t>=d-.3){S.spot[en.idx]=now;break}}}}
 const bomb=curBomb();
 for(const e of S.ents){if(!e.alive)continue;const mine=e.side===me.side;if(!mine&&!(now-(S.spot[e.idx]||0)<1.5))continue;const x=e.x*s,y=e.z*s;
  c.fillStyle=e.idx===S.myIdx?'#fff':mine?(e.side==='T'?'#f0c050':'#6ab0ff'):'#ff3030';c.beginPath();c.arc(x,y,e.idx===S.myIdx?4.5:4,0,6.3);c.fill();
  c.strokeStyle=c.fillStyle;c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.sin(e.yaw)*9,y-Math.cos(e.yaw)*9);c.stroke();
  if(bomb&&bomb.st==='carried'&&bomb.c===e.idx&&me.side==='T'){c.fillStyle='#ff4030';c.fillRect(x+4,y-8,6,4)}}
 if(bomb&&(bomb.st==='planted'||bomb.st==='dropped'&&me.side==='T')){const on=bomb.st!=='planted'||Math.floor(now*3)%2;if(on){c.fillStyle='#ff3020';c.fillRect(bomb.x*s-5,bomb.z*s-3.5,10,7)}}}
function canBuyLocal(){if(!S||!S.me.alive)return false;const mode=S.isHost?S.game.mode:S.mode;if(mode==='warmup')return true;if(mode!=='freeze'&&mode!=='live')return false;if(!S.info||hostNow()>S.info.buyEnd)return false;const c=S.M.spawnCenter(S.me.side);return Math.hypot(S.me.x-c[0],S.me.z-c[1])<16}

// ======================= BUY MENI =======================
let prev=null,buyHover=null,buyCol=0;
function buildBuy(){const cols=$('#buyCols');cols.innerHTML='';D.BUY.forEach((col,ci)=>{const d=document.createElement('div');d.className='bc';d.innerHTML=`<h4>${ci+1}. ${col.n}</h4>`;
  col.items.forEach((id,ii)=>{const b=document.createElement('button');b.className='bi';b.dataset.id=id;const E=D.EQUIP[id],wd=W[id];const name=E?E.n:wd.n,price=E?E.price:wd.price;
   const cvs=mkCanvas(220,68);if(wd)putIcon(cvs,id);else{const c=cvs.getContext('2d');c.fillStyle='#fff';c.font='bold 30px Arial';c.textAlign='center';c.fillText(id==='defuser'?'✂':'⛨',110,46)}
   b.innerHTML=`<kbd>${ii+1}</kbd>`;b.appendChild(cvs);const n=document.createElement('div');n.className='n';n.innerHTML=`<b>${esc(name)}</b><span>$${price}</span>`;b.appendChild(n);
   b.onclick=()=>{if(!b.classList.contains('no'))act({k:'buy',i:id});else AU.deny()};b.onmouseenter=()=>{buyHover=id;buyInfo(id)};d.appendChild(b)});cols.appendChild(d)});}
function buyInfo(id){const E=D.EQUIP[id],wd=W[id];const el=$('#buyInfo');if(E){el.innerHTML=`<b>${E.n}</b>Cijena: $${E.price}${id==='vesthelm'?'<br>Štiti i glavu od pogodaka.':id==='defuser'?'<br>Deaktivacija za 5s umjesto 10s.':'<br>Smanjuje štetu od metaka.'}`;return}
 el.innerHTML=`<b>${wd.n}</b>Cijena: $${wd.price}${wd.dmg&&wd.slot<3?`<br>Šteta: ${wd.dmg}${wd.pel>1?' ×'+wd.pel:''} · Probojnost oklopa: ${Math.round(wd.ap*100)}%<br>Brzina paljbe: ${Math.round(60/wd.rof)} RPM<br>Okvir: ${wd.mag} / ${wd.res}<br>Nagrada za ubistvo: $${wd.rew}`:''}${wd.slot===4?'<br>Bomba – baci lijevim klikom (desni = kratko)':''}`;
 if(prev){const me=S.me;const sk=INV.skinsMap()[id];prev.show(me.side,agOf(me.side,agPair()),wd.slot<=2?id:(me.side==='T'?'ak47':'m4a4'),sk||0)}}
function refreshBuy(){const me=S.me,info=S.info;if(!info)return;const mode=S.isHost?S.game.mode:S.mode;
 $('#bMoney').textContent='$'+me.money;const left=info.buyEnd-hostNow();$('#bTime').textContent=mode==='warmup'?'∞':Math.max(0,Math.ceil(left))+'s';
 const myT=me.team;const loss=info.loss?info.loss[myT]:0;$('#bMin').textContent='$'+Math.min(RL.maxMoney,me.money+Math.min(RL.lossMax,RL.lossBase+RL.lossStep*loss));
 $$('#buyCols .bi').forEach(b=>{const id=b.dataset.id;const E=D.EQUIP[id],wd=W[id];const team=E?E.team:wd.team;b.classList.toggle('team',!!team&&team!==me.side);
  let price=E?E.price:wd.price;if(id==='vesthelm'&&me.ar>=100&&!me.helm)price=350;
  let own=false;if(id==='vest')own=me.ar>=100;else if(id==='vesthelm')own=me.ar>=100&&me.helm;else if(id==='defuser')own=me.kit;else if(id==='zeus')own=me.inv[6];else if(wd&&wd.slot===4)own=me.inv[4].filter(n=>n===id).length>=(wd.max||1);else if(wd)own=!!(me.inv[wd.slot]&&me.inv[wd.slot].w===id);
  b.classList.toggle('own',own);b.classList.toggle('no',price>me.money||own||!canBuyLocal());b.querySelector('.n span').textContent='$'+price});
 const dd=$('#buyDrops');const drops=(S.isHost?S.game.drops:info.drops).filter(d=>Math.hypot(d.x-me.x,d.z-me.z)<25).slice(0,8);const key=drops.map(d=>d.id).join(',');if(dd._k!==key){dd._k=key;dd.innerHTML='';drops.forEach(d=>{const c=mkCanvas(140,52);putIcon(c,d.w,d.sk?{skin:d.sk[0],wear:d.sk[1]}:null);c.title=W[d.w].n;dd.appendChild(c)});if(!drops.length)dd.innerHTML='<small>—</small>'}}
function toggleBuy(on){if(!S)return;if(on==null)on=!S.buyOpen;if(on&&!canBuyLocal()){toast(S.me.alive?'Kupovina nije moguća (izvan zone ili je isteklo vrijeme)':'Mrtav si');AU.deny();return}
 S.buyOpen=on;$('#buy').classList.toggle('on',on);if(on){if(!$('#buyCols').children.length)buildBuy();if(!prev&&!MOB){try{prev=new BSPreview($('#buyPrev'))}catch(e){prev=null}}refreshBuy();buyInfo(buyHover||(S.me.side==='T'?'ak47':'m4a4'));document.exitPointerLock&&document.exitPointerLock();buyCol=0}
 else{lockPointer()}}
function buyKey(n){if(!buyCol){if(n>=1&&n<=5)buyCol=n;return}const col=D.BUY[buyCol-1];const vis=col.items.filter(id=>{const E=D.EQUIP[id],wd=W[id];const t=E?E.team:wd.team;return !t||t===S.me.side});const id=vis[n-1];buyCol=0;if(id)act({k:'buy',i:id})}
$('#bClose').onclick=()=>toggleBuy(false);$('#bRebuy').onclick=()=>act({k:'rebuy'});$('#bAuto').onclick=()=>act({k:'auto'});$('#bRefund').onclick=()=>act({k:'refund'});
// ======================= SCOREBOARD =======================
function renderSB(){const info=S&&S.info;if(!info)return;const sb=$('#sb');const by=sd=>info.pl.filter(p=>p.sd===sd).sort((a,b)=>b.st.sc-a.st.sc||b.st.k-a.st.k);
 const played=Math.max(1,info.ts[0]+info.ts[1]);const me=S.me;const alive=new Map(S.ents.map(e=>[e.idx,e.alive]));
 const sideScore=sd=>info.ts[(info.swaps%2===0)===(sd==='T')?0:1];const lossOf=sd=>{const t=(info.swaps%2===0)===(sd==='T')?0:1;return Math.min(RL.lossMax,RL.lossBase+RL.lossStep*info.loss[t])};
 const tbl=sd=>`<div class="hdr"><b class="${sd}">${sideScore(sd)}</b><div><b class="${sd}" style="font-size:15px">${D.TEAMS[sd].n}</b><br><small>${D.TEAMS[sd].unit} · Loss bonus: $${lossOf(sd)}</small></div></div>
  <table><tr><th>Igrač</th><th>Novac</th><th>K</th><th>A</th><th>D</th><th>HS%</th><th>DMG</th><th>MVP</th><th>Bodovi</th></tr>${by(sd).map(p=>`<tr class="${p.i===S.myIdx?'me':''}${alive.get(p.i)?'':' dead'}"><td>${esc(p.n)}${p.b?'':' 🎮'}</td><td>${sd===me.side?'$'+p.$:'–'}</td><td>${p.st.k}</td><td>${p.st.a}</td><td>${p.st.d}</td><td>${p.st.k?Math.round(p.st.hs/p.st.k*100):0}%</td><td>${Math.round(p.st.dmg/played)}</td><td>${p.st.mvp?'★'+p.st.mvp:''}</td><td>${p.st.sc}</td></tr>`).join('')}</table>`;
 const halves=(info.halves||[]).map((h,i)=>`${i+1}. pol.: ${h[0]}:${h[1]}`).join(' · ');
 sb.innerHTML=`<div id="sbTop"><b>${esc(MP.MAPS[info.map].full)} · ${esc(MP.MAPS[info.map].n)}</b><small>Soba #${esc(S.code)} · Runda ${info.round||'-'} · ${info.mode==='warmup'?'Zagrijavanje':'MR12 – prvi do 13'}${halves?' · '+halves:''}</small></div>${tbl('CT')}${tbl('T')}`}
// ======================= PAUZA =======================
function openPause(){if(!S)return;$('#pCode').innerHTML=`Soba <b style="color:var(--g)">#${esc(S.code)}</b> · ${S.isHost?'ti si domaćin 👑':'domaćin: '+esc(((S.info&&S.info.pl.find(p=>p.id===S.hostId))||{}).n||'?')}`;$$('#pause .host').forEach(b=>b.style.display=S.isHost?'':'none');$('#pause').classList.add('on')}
$('#pRes').onclick=()=>{$('#pause').classList.remove('on');lockPointer()};
$('#pLeave').onclick=()=>{$('#pause').classList.remove('on');leaveSession()};
$('#pTeam').onclick=()=>{act({k:'team'});$('#pause').classList.remove('on');lockPointer()};
$('#pWarm').onclick=()=>{if(S&&S.isHost&&S.game.mode==='warmup'){S.game.timer=.01;toast('Meč počinje!')}$('#pause').classList.remove('on');lockPointer()};
$('#pMap').onclick=()=>{$('#pause').classList.remove('on');mapPicker($('#mapPick2'),id=>{if(S&&S.isHost){S.game.changeMap(id);loadMap(id)}$('#pmap').classList.remove('on');lockPointer()});$('#pmap').classList.add('on')};
$('#pSet').onclick=()=>{$('#pause').classList.remove('on');const b=$('#psetBody');b.innerHTML='';b.appendChild($('#p-set').firstElementChild.cloneNode(true));bindSettings(b);$('#pset').classList.add('on')};
$('#psetOk').onclick=()=>{$('#pset').classList.remove('on');lockPointer()};
$$('.ovl').forEach(o=>o.addEventListener('click',e=>{if(e.target===o&&o.id!=='end'&&o.id!=='caseO'||e.target===o&&o.id==='caseO'&&!rolling){o.classList.remove('on');if(S&&o.id!=='caseO')lockPointer()}}));
$('#endStay').onclick=()=>{$('#end').classList.remove('on');lockPointer()};$('#endLeave').onclick=()=>{$('#end').classList.remove('on');leaveSession()};

// ======================= MENI =======================
function showMenu(){$('#menu').classList.remove('hide');$('#hud').classList.remove('on');$('#touch').classList.remove('on');$('#nick').value=SET.nick||'';navTo(curPage)}
let curPage='home';
function navTo(p){curPage=p;$$('#nav .nb[data-p]').forEach(b=>b.classList.toggle('on',b.dataset.p===p));$$('.mp').forEach(m=>m.classList.toggle('on',m.id==='p-'+p));
 if(p==='list')startListPoll();else stopListPoll();if(p==='inv')renderInv();if(p==='create')mapPicker($('#mapPick'),id=>{SET.map=id;saveSet()},SET.map);if(p==='set')bindSettings($('#p-set'))}
$$('#nav .nb[data-p]').forEach(b=>b.onclick=()=>{AU.resume();AU.click();navTo(b.dataset.p)});
$('#bExit').onclick=()=>{if(EMB){try{parent.postMessage({pm:'exit'},'*')}catch(e){}}else location.href='index.html'};
$('#nick').oninput=e=>{SET.nick=e.target.value.trim().slice(0,14);saveSet()};
const rcode=()=>String(1000+Math.floor(Math.random()*9000));
$('#bQuick').onclick=()=>{AU.resume();startSession({code:rcode(),host:true,map:SET.map||'dina',diff:SET.diff,team:SET.team})};
$('#bCreate').onclick=()=>{AU.resume();startSession({code:rcode(),host:true,map:SET.map,diff:SET.diff,team:SET.team})};
$('#bJoin').onclick=()=>{const c=$('#joinCode').value.replace(/\D/g,'');if(c.length!==4){toast('Upiši kod od 4 cifre');return}AU.resume();startSession({code:c,host:false,team:SET.team})};
function seg(root,sel,key,conv,cb){const el=root.querySelector?root.querySelector(sel):$(sel);if(!el)return;el.querySelectorAll('button').forEach(b=>{b.classList.toggle('on',String(SET[key])===b.dataset.v);b.onclick=()=>{SET[key]=conv?conv(b.dataset.v):b.dataset.v;saveSet();el.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));AU.click();if(cb)cb()}})}
seg(document,'#diffSeg','diff',v=>+v);seg(document,'#teamSeg','team');
function bindSettings(root){const rng=(id,key,fmt,cb)=>{const i=root.querySelector('#'+id);if(!i)return;i.value=SET[key];const lab=root.querySelector('#v'+id.slice(1));const up=()=>{if(lab)lab.textContent=fmt(SET[key])};up();i.oninput=()=>{SET[key]=+i.value;up();saveSet();if(cb)cb()}};
 rng('sSens','sens',v=>v.toFixed(2));rng('sTSens','tsens',v=>v.toFixed(2));rng('sFov','fov',v=>v+'°');rng('sVol','vol',v=>Math.round(v*100)+'%',()=>AU.setVol(SET.vol));
 seg(root,'#qSeg','q',null,()=>R.setQuality(qual()));seg(root,'#xcSeg','xc');seg(root,'#fpsSeg','fps',v=>+v)}
function mapPicker(el,cb,sel){el.innerHTML='';for(const id in MP.MAPS){const m=MP.MAPS[id];const b=document.createElement('button');b.className='mapc'+(id===sel?' on':'');const cvs=mkCanvas(240,240);drawRadarBase(MP.build(m),cvs);const c=cvs.getContext('2d');c.globalCompositeOperation='destination-over';c.fillStyle=m.theme.wall[1];c.fillRect(0,0,240,240);
  b.appendChild(cvs);b.insertAdjacentHTML('beforeend',`<b>${esc(m.n)}</b><small>${esc(m.desc)}</small>`);b.onclick=()=>{el.querySelectorAll('.mapc').forEach(x=>x.classList.remove('on'));b.classList.add('on');AU.click();cb(id)};el.appendChild(b)}}
// lista soba
let listOn=false,rooms={};const onRoom=m=>{if(!m||m.k!=='room'||!/^\d{4}$/.test(String(m.code)))return;rooms[m.code]=Object.assign(m,{seen:Date.now()});renderRooms()};
function startListPoll(){if(!NETOK){$('#rooms').innerHTML='<small>Online nije dostupan.</small>';return}if(listOn)return;listOn=true;try{BUS.init();BUS.sub(LIST(),onRoom)}catch(e){}renderRooms();clearInterval(startListPoll.t);startListPoll.t=setInterval(renderRooms,2000)}
function stopListPoll(){if(!listOn)return;listOn=false;try{BUS.unsub(LIST(),onRoom)}catch(e){}clearInterval(startListPoll.t)}
function renderRooms(){const el=$('#rooms');const now=Date.now();const l=Object.values(rooms).filter(r=>now-r.seen<10000).sort((a,b)=>b.n-a.n);
 el.innerHTML=l.length?l.map(r=>`<div class="ri"><div><b>#${esc(r.code)} · ${esc((MP.MAPS[r.map]||{}).n||r.map)}</b><br><small>Domaćin: ${esc(r.hn)} · ${r.n}/10 igrača (+${r.nb} botova) · ${r.md==='warmup'?'zagrijavanje':r.sc.join(':')}</small></div><button class="btn g" data-j="${esc(r.code)}">Uđi</button></div>`).join(''):'<small>Trenutno nema otvorenih soba. Napravi svoju! '+(NETOK&&BUS.ready&&BUS.ready()?'':'(spajam se na servere…)')+'</small>';
 el.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{AU.resume();startSession({code:b.dataset.j,host:false,team:SET.team})})}
if(NETOK)window.onNetState=(n,t)=>{$('#netSt').textContent=n?'🟢 online ('+n+'/'+t+')':'🟠 spajam se…'};
// ======================= INVENTAR =======================
let invFilter='all';
$$('#invTabs button').forEach(b=>b.onclick=()=>{invFilter=b.dataset.f;$$('#invTabs button').forEach(x=>x.classList.toggle('on',x===b));renderInv()});
function rarOf(it){return it.t==='skin'?D.SK[it.sk].r:it.t==='key'?3:1}
function itemCard(it,big){const d=INV.load();const el=document.createElement('div');el.className='it';const rar=D.RAR[rarOf(it)];const cvs=mkCanvas(256,140);const c=cvs.getContext('2d');
 if(it.t==='skin'){const sk=D.SK[it.sk];BI.drawGun(c,sk.w,8,8,240,124,{skin:it.sk,wear:it.f,knife:sk.knife})}
 else{const cs=D.CASES.find(x=>x.id===it.c);c.fillStyle=cs.col;if(it.t==='case'){c.fillRect(58,30,140,86);c.fillStyle='rgba(0,0,0,.3)';c.fillRect(58,62,140,10);c.fillStyle='#fff';c.font='bold 22px Arial';c.textAlign='center';c.fillText('#'+cs.id,128,104)}
  else{c.beginPath();c.arc(90,70,26,0,6.3);c.fill();c.fillRect(110,62,90,16);c.fillRect(170,78,10,18);c.fillRect(188,78,10,14);c.fillStyle='#000';c.beginPath();c.arc(90,70,10,0,6.3);c.fill()}}
 el.appendChild(cvs);const nm=document.createElement('div');nm.className='nm';
 if(it.t==='skin'){const sk=D.SK[it.sk];nm.innerHTML=`<b style="color:${rar.c}">${esc(sk.n)}</b>${esc(sk.knife?'★ '+D.KNIVES[sk.knife]:W[sk.w].n)}${it.st?' <span style="color:#cf6a32">StatTrak™</span>':''}`;el.appendChild(nm);const wr=document.createElement('div');wr.className='wr';wr.textContent=D.wearOf(it.f).n+' · '+it.f.toFixed(4);el.appendChild(wr);
  if(Object.values(d.eq).includes(it.u)){const e=document.createElement('span');e.className='eq';e.textContent='OPREMLJENO';el.appendChild(e)}}
 else{const cs=D.CASES.find(x=>x.id===it.c);nm.innerHTML=`<b>${it.t==='case'?esc(cs.n):'Ključ – '+esc(cs.n)}</b>${it.t==='case'?'Kutija':'Ključ #'+cs.id}`;el.appendChild(nm)}
 const bar=document.createElement('div');bar.className='bar';bar.style.background=it.t==='skin'?rar.c:it.t==='key'?'#e4ae39':'#888';el.appendChild(bar);return el}
function renderInv(){const d=INV.load();const g=$('#invGrid');g.innerHTML='';
 const items=d.items.filter(i=>invFilter==='all'||(invFilter==='skin'?i.t==='skin':i.t!=='skin')).sort((a,b)=>(b.t==='skin')-(a.t==='skin')||rarOf(b)-rarOf(a)||b.at-a.at);
 // kutije grupiši po vrsti
 const shown=new Set();
 for(const it of items){if(it.t!=='skin'){const k=it.t+it.c;if(shown.has(k))continue;shown.add(k)}const el=itemCard(it);if(it.t!=='skin'){const n=INV.count(it.t,it.c);if(n>1){const s=document.createElement('span');s.className='cnt';s.textContent='×'+n;el.appendChild(s)}}
  el.onclick=()=>{AU.click();if(it.t==='skin'){INV.equip(it.u);renderInv()}else openCase(it.c)};g.appendChild(el)}
 if(!items.length)g.innerHTML='<small style="color:var(--mut)">Prazno. Igraj mečeve – kutije i ključevi padaju nakon meča.</small>';
 $('#invStat').textContent=`Mečeva: ${d.stats.matches} · Pobjeda: ${d.stats.wins} · Otvoreno kutija: ${d.stats.opened}. Klikni skin da ga opremiš (vide ga i drugi igrači u meču).`;
 const ag=d.ag||{T:0,CT:0};for(const sd of ['T','CT']){const el=$('#ag'+sd);el.innerHTML=D.AGENTS[sd].map((a,i)=>`<button class="${(ag[sd]|0)===i?'on':''}" data-i="${i}">${esc(a.n)}</button>`).join('');el.querySelectorAll('button').forEach(b=>b.onclick=()=>{d.ag=d.ag||{T:0,CT:0};d.ag[sd]=+b.dataset.i;INV.save();menuSide=sd;AU.click();renderInv()})}}
let rolling=false;
function openCase(cid){const cs=D.CASES.find(c=>c.id===cid);const d=INV.load();const nCase=INV.count('case',cid),nKey=INV.count('key',cid);$('#caseT').textContent=cs.n;
 const body=$('#caseBody');body.innerHTML=`<div style="color:var(--mut);margin-bottom:8px">Kutija: ${nCase} · Ključ: ${nKey} · Šanse: Obični 75% · Bolji 19% · Rijetki 5% · Legendarni 0,5% · ★ Nož 0,5%</div><div id="roll" class="hide"><div id="rollStrip"></div></div><div id="caseRes"></div><div id="invGrid2" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:6px"></div><div class="row" style="margin-top:12px"><button class="big" id="bOpen" ${nCase&&nKey?'':'disabled'}>${nCase?(nKey?'Otvori kutiju':'Treba ti Ključ #'+cid):'Nemaš ovu kutiju'}</button></div>`;
 const g=body.querySelector('#invGrid2');cs.skins.concat(['★']).forEach(id=>{if(id==='★'){const e=document.createElement('div');e.className='it';e.innerHTML='<div style="height:70px;display:grid;place-items:center;font-size:34px;color:#e4ae39">★</div><div class="nm"><b style="color:#e4ae39">Izuzetno rijedak predmet</b>Nož</div><div class="bar" style="background:#e4ae39"></div>';g.appendChild(e);return}
  g.appendChild(itemCard({t:'skin',sk:id,f:.05,u:'x'}))});
 body.querySelector('#bOpen').onclick=()=>{if(rolling)return;const res=INV.open(INV.load().items.find(i=>i.t==='case'&&i.c===cid).u);if(!res){toast('Ne može se otvoriti');return}roll(cs,res)};
 $('#caseO').classList.add('on')}
function roll(cs,res){rolling=true;const strip=$('#rollStrip');$('#roll').classList.remove('hide');$('#invGrid2').classList.add('hide');$('#bOpen').disabled=true;strip.innerHTML='';strip.style.transition='none';strip.style.transform='translateX(0)';
 const N=50,WIN=44,CW=126;for(let i=0;i<N;i++){let it;if(i===WIN)it=res;else{const r=D.rollCase(cs.id);it={t:'skin',sk:r.sk,f:r.f,u:'x'}}const el=itemCard(it);if(i===WIN&&D.SK[res.sk].r===4){}strip.appendChild(el)}
 const box=$('#roll').clientWidth;const off=WIN*CW+60-box/2+(Math.random()-.5)*90;requestAnimationFrame(()=>{strip.style.transition='transform 6.2s cubic-bezier(.08,.75,.16,1)';strip.style.transform=`translateX(${-off}px)`});
 let lastI=-1;const t0=perf();const tick=()=>{const m=new DOMMatrix(getComputedStyle(strip).transform);const i=Math.floor((-m.m41+box/2)/CW);if(i!==lastI){lastI=i;AU.tick()}if(perf()-t0<6.3)requestAnimationFrame(tick)};tick();
 setTimeout(()=>{rolling=false;const sk=D.SK[res.sk];const rar=D.RAR[sk.r];AU.drop(sk.r);
  $('#caseRes').innerHTML=`<div class="result"><div style="font-size:12px;color:var(--mut)">DOBIO SI</div><h2 style="color:${rar.c};margin:4px 0">${esc(D.skinName(res.sk))}</h2><div style="color:var(--mut)">${rar.n} · ${D.wearOf(res.f).n} · float ${res.f.toFixed(4)}${res.st?' · StatTrak™':''}</div></div>`;
  const c=mkCanvas(560,240);BI.drawGun(c.getContext('2d'),sk.w,20,20,520,200,{skin:res.sk,wear:res.f,knife:sk.knife});c.style.cssText='width:280px;height:120px;display:block;margin:8px auto';$('#caseRes .result').appendChild(c);
  const row=document.createElement('div');row.className='row';row.style.justifyContent='center';row.innerHTML='<button class="btn g">Opremi</button><button class="btn">Zatvori</button>';row.children[0].onclick=()=>{INV.equip(res.u);toast('Opremljeno: '+D.skinName(res.sk));$('#caseO').classList.remove('on');renderInv()};row.children[1].onclick=()=>{$('#caseO').classList.remove('on');renderInv()};$('#caseRes').appendChild(row);
  $('#roll').classList.add('hide');$('#bOpen').closest('.row').remove();renderInv()},6500)}
// meni scena (lik desno)
let menuSide='T';setInterval(()=>{menuSide=menuSide==='T'?'CT':'T'},8000);
function menuFrame(dt){const d=INV.load();const ag=d.ag||{T:0,CT:0};const sm=INV.skinsMap();const w=menuSide==='T'?'ak47':'m4a1s';R.menu(menuSide,ag[menuSide]|0,dt,w,sm[w]||0)}

// ======================= START =======================
function boot(){let done=false;const sm=$('#load small'),bar=$('#load .bar i');
 const go=()=>{if(done)return;done=true;clearTimeout(to);start()};const to=setTimeout(go,30000);
 loadAssets(f=>{if(sm)sm.textContent='učitavam modele… '+Math.round(f*100)+'%';if(bar){bar.style.animation='none';bar.style.width=Math.round(5+f*95)+'%'}}).then(go,e=>{console.warn('Modeli nisu učitani',e);go()})}
function start(){$('#load').style.opacity=0;setTimeout(()=>$('#load').remove(),500);
 const room=QS.get('room');
 if(room&&/^\d{3,6}$/.test(room)){const host=QS.get('host')==='1';startSession({code:room,host,map:QS.get('map')||SET.map,diff:QS.get('diff')!=null?+QS.get('diff'):SET.diff,team:'auto'})}
 else showMenu();
 requestAnimationFrame(frame)}
document.addEventListener('visibilitychange',()=>{last=perf()});
window.__bs={cpu:()=>cpuMs,S:()=>S,SET,INV,toggleBuy,act,selectLocal,startSession,leaveSession};
boot();
