// #Bash igre – globalni kanal #0001 (svi su tu čim otvore aplikaciju)
// Bez servera: prvi uređaj preuzme ulogu "domaćina kanala"; kad on ode, ostali automatski izaberu novog.
'use strict';
const GID=PEER_PREFIX+'global-0001';
const G={peer:null,host:false,conn:null,conns:new Map(),users:{},chat:[],rooms:{},status:'off',tries:0,gen:0,lastAnn:'',annTs:0};
function gMe(){return {nick:App.me.nick,av:App.me.av,roses:Object.assign({},App.me.roses),room:App.role==='host'&&App.lobby?App.lobby.code||null:null}}
function gStart(){if(typeof Peer==='undefined'||!App.me.nick||G.status!=='off')return;gTryHost()}
function gStop(){G.gen++;clearTimeout(G.rt);try{G.conn&&G.conn.close()}catch(e){}G.conns.forEach(c=>{try{c.close()}catch(e){}});G.conns.clear();
 try{G.peer&&G.peer.destroy()}catch(e){}G.peer=null;G.conn=null;G.host=false}
function gRestart(delay){gStop();G.status='connecting';gRender();G.tries++;
 const d=delay!=null?delay:Math.min(20000,600*Math.pow(1.6,Math.min(G.tries,8)))+Math.random()*1500;G.rt=setTimeout(gTryHost,d)}
function gTryHost(){
 const gen=++G.gen;G.status='connecting';gRender();
 const p=new Peer(GID,{config:ICE,debug:0});G.peer=p;
 p.on('open',()=>{if(gen!==G.gen)return;G.host=true;G.status='on';G.tries=0;G.users={[App.me.id]:Object.assign(gMe(),{ts:Date.now()})};
  gSys('🌐 Kanal #0001 – dobrodošli! Piši svima, pa uđi u neku sobu 🎲');gBState();gRender();gAnnounce(true)});
 p.on('connection',c=>{c.on('data',d=>gHostMsg(c,d));c.on('close',()=>gHostClosed(c));c.on('error',()=>gHostClosed(c))});
 p.on('error',e=>{if(gen!==G.gen)return;if(e.type==='unavailable-id'){try{p.destroy()}catch(_){}gJoin(gen)}else if(!G.host)gRestart()});
 p.on('disconnected',()=>{if(gen!==G.gen)return;setTimeout(()=>{if(gen===G.gen&&!p.destroyed)try{p.reconnect()}catch(_){}},1500)});
}
function gJoin(gen){
 G.host=false;const p=new Peer({config:ICE,debug:0});G.peer=p;
 p.on('open',()=>{if(gen!==G.gen)return;const c=p.connect(GID,{reliable:true,serialization:'json'});G.conn=c;let ok=false;
  const t=setTimeout(()=>{if(!ok&&gen===G.gen)gRestart()},9000);
  c.on('open',()=>{if(gen!==G.gen)return;ok=true;clearTimeout(t);G.status='on';G.tries=0;c.send(Object.assign({t:'g_hello',id:App.me.id},gMe()));gAnnounce(true);gRender()});
  c.on('data',gMsg);
  c.on('close',()=>{if(gen!==G.gen)return;gRestart(300+Math.random()*2000)})});
 p.on('error',e=>{if(gen!==G.gen)return;gRestart(e.type==='peer-unavailable'?300+Math.random()*1500:null)});
}
// ---------- domaćin kanala ----------
function gHostMsg(c,d){
 if(!d||!d.t)return;
 if(d.t==='g_hello'){const id=String(d.id||'').slice(0,40);if(!id)return;const old=G.conns.get(id);if(old&&old!==c)try{old.close()}catch(e){}
  c._gid=id;G.conns.set(id,c);
  G.users[id]={nick:String(d.nick||'?').slice(0,14),av:String(d.av||'🙂').slice(0,4),roses:cleanRoses(d.roses),room:d.room?String(d.room).slice(0,4):null,ts:Date.now()};
  try{c.send({t:'g_init',chat:G.chat.slice(-60),users:G.users,rooms:G.rooms})}catch(e){}
  gBState();return}
 if(c._gid)gHandle(c._gid,d);
}
function gHandle(id,d){
 const u=G.users[id];if(!u)return;const now=Date.now();
 switch(d.t){
  case 'g_chat':{const text=String(d.text||'').replace(/\s+/g,' ').trim().slice(0,140);if(!text||now-(u._lc||0)<500)return;u._lc=now;
   const m={id:uid(),from:id,nick:u.nick,av:u.av,text,ts:now};gBcast({t:'g_chat',m});gOnChat(m);break}
  case 'g_rose':{const to=String(d.to||''),tu=G.users[to];if(!tu||to===id||now-(u._lr||0)<1500)return;u._lr=now;
   tu.roses=tu.roses||{};tu.roses[u.nick]=(tu.roses[u.nick]|0)+1;
   const m={t:'g_rose',from:id,to,fromNick:u.nick,toNick:tu.nick,total:rosesTotal(tu.roses)};gBcast(m);gOnRose(m);
   gSys(`🌹 ${u.nick} je poklonio/la ružu → ${tu.nick} (ukupno ${m.total})`,'rose');gBState();break}
  case 'g_upd':{u.nick=String(d.nick||u.nick).slice(0,14);u.av=String(d.av||u.av).slice(0,4);if(d.roses)u.roses=mergeRoses(u.roses,cleanRoses(d.roses));
   u.room=d.room?String(d.room).slice(0,4):null;gBState();break}
  case 'g_room':{const code=String(d.code||'').replace(/\D/g,'').slice(0,4);if(code.length!==4)return;
   G.rooms[code]={code,host:id,nick:u.nick,av:u.av,game:['sketch','uno'].includes(d.game)?d.game:'ludo',n:Math.min(9,d.n|0),max:Math.min(9,d.max|0)||5,playing:!!d.playing,ts:now};u.room=code;gBState();break}
  case 'g_room_del':{const r=G.rooms[d.code];if(r&&r.host===id){delete G.rooms[d.code];u.room=null;gBState()}break}
 }
}
function gHostClosed(c){const id=c._gid;if(!id||G.conns.get(id)!==c)return;G.conns.delete(id);delete G.users[id];
 Object.keys(G.rooms).forEach(k=>{if(G.rooms[k].host===id)delete G.rooms[k]});gBState()}
function gBcast(m){G.conns.forEach(c=>{try{if(c.open)c.send(m)}catch(e){}})}
function gSys(text,kind){const m={id:uid(),sys:kind||'all',text,ts:Date.now()};if(G.host)gBcast({t:'g_chat',m});gOnChat(m)}
let gST=0;function gBState(){if(!G.host)return;clearTimeout(gST);gST=setTimeout(()=>{
 const users={};for(const k in G.users){const u=G.users[k];users[k]={nick:u.nick,av:u.av,roses:u.roses,room:u.room}}
 gBcast({t:'g_state',users,rooms:G.rooms});gRender()},150)}
setInterval(()=>{if(!G.host)return;const now=Date.now();let ch=false;Object.keys(G.rooms).forEach(k=>{if(now-G.rooms[k].ts>75000){delete G.rooms[k];ch=true}});if(ch)gBState()},15000);
// ---------- svi ----------
function gMsg(d){
 if(!d||!d.t)return;
 if(d.t==='g_init'){G.users=d.users||{};G.rooms=d.rooms||{};(d.chat||[]).forEach(m=>{if(!G.chat.some(x=>x.id===m.id))G.chat.push(m)});G.chat.sort((a,b)=>a.ts-b.ts);gRender()}
 else if(d.t==='g_state'){G.users=d.users||{};G.rooms=d.rooms||{};gRender()}
 else if(d.t==='g_chat')gOnChat(d.m);
 else if(d.t==='g_rose')gOnRose(d);
}
function gSend(m){if(G.host)gHandle(App.me.id,m);else if(G.conn&&G.conn.open){try{G.conn.send(m)}catch(e){}}else if(m.t==='g_chat'||m.t==='g_rose')toast('Kanal se još spaja… 🔄')}
function gChat(text){if(!App.me.nick){toast('Upiši nadimak 🙂');$('#nick').focus();return}if(G.status==='off')gStart();gSend({t:'g_chat',text})}
function gOnChat(m){if(!m||G.chat.some(x=>x.id===m.id))return;G.chat.push(m);if(G.chat.length>120)G.chat.shift();gRenderFeed();
 if(!m.sys&&m.from!==App.me.id&&onScreen('sHome'))sfx.pop()}
function gOnRose(m){
 if(m.to===App.me.id){App.me.roses[m.fromNick]=(App.me.roses[m.fromNick]|0)+1;LS.set('me',App.me);renderHomeRoses()}
 if(onScreen('sHome')||m.to===App.me.id)onRose(m);
}
function gOnMe(changed){if(G.status==='off'){gStart();return}if(changed)gSend({t:'g_upd',nick:App.me.nick,av:App.me.av,roses:App.me.roses,room:gMe().room});gRender()}
function gAnnounce(force){
 if(!G.peer||G.status!=='on')return;
 if(App.role==='host'&&App.lobby&&App.lobby.code){const lb=App.lobby;const n=Object.values(lb.players).filter(p=>p.online).length;
  const m={t:'g_room',code:lb.code,game:lb.game,n,max:lb.game==='ludo'?4:5,playing:!!(App.game||App.sk||App.un)};const key=JSON.stringify(m);
  if(force||key!==G.lastAnn||Date.now()-G.annTs>20000){G.lastAnn=key;G.annTs=Date.now();gSend(m)}}
}
setInterval(()=>gAnnounce(),20000);
// ---------- UI ----------
function gRenderFeed(){const el=$('#hFeed');if(el)fillFeed(el,G.chat,G.status==='on'?'Tišina u kanalu… javi se prvi! 👋':'Spajam se na kanal…')}
function gRender(){
 const st=$('#gStat');if(!st)return;const users=Object.entries(G.users);
 const nt=App.netT?` · 📡${App.netN||0}/${App.netT}`:'';st.innerHTML=!App.me.nick?'upiši nadimak ⤴':G.status==='on'?`<i></i>${users.length} online${nt}`:G.status==='connecting'?`<span class="spin"></span> spajam se…${nt}`:'offline';
 const me=App.me.id;users.sort((a,b)=>(b[0]===me)-(a[0]===me)||rosesTotal(b[1].roses)-rosesTotal(a[1].roses));
 $('#gUsers').innerHTML=users.map(([id,u])=>{const rz=id===me?rosesTotal(mergeRoses(App.me.roses,u.roses)):rosesTotal(u.roses);
  return `<div class="gu${id===me?' me':''}" data-gid="${esc(id)}"><div class="ga">${esc(u.av)}${rz?`<span class="gr">🌹${rz}</span>`:''}</div><small>${esc(id===me?'ti':u.nick)}</small></div>`}).join('');
 const rooms=Object.values(G.rooms).sort((a,b)=>a.playing-b.playing||b.ts-a.ts);
 $('#gRooms').innerHTML=rooms.length?rooms.map(r=>{const mine=App.lobby&&App.lobby.code===r.code;
  return `<div class="room-i"><span class="ri">${{sketch:'🎨',uno:'🃏'}[r.game]||'🎲'}</span><div class="rn"><b>${esc(r.av)} Soba od ${esc(r.nick)}</b>
   <small>#${esc(r.code)} · ${{sketch:'Crtaj & pogađaj',uno:'Jedna!'}[r.game]||'Ne ljuti se'} · ${r.n}/${r.max}${r.playing?' · u igri':''}</small></div>
   ${mine?'<span class="tag g">tvoja</span>':`<button class="btn" data-join="${esc(r.code)}">Uđi</button>`}</div>`}).join('')
  :'<p class="muted" style="margin:0">Nema otvorenih soba – napravi svoju i pojaviće se ovdje za sve u kanalu 👇</p>';
 gRenderFeed();
}
function openGProfile(id){
 const u=G.users[id];if(!u)return;const me=id===App.me.id;
 App.profId=id;App.profSeat=null;App.profSrc='g';
 $('#prof .panel').style.setProperty('--c','#7cff01');$('#pfAv').textContent=u.av;$('#pfName').textContent=u.nick;
 $('#pfSub').textContent='🌐 kanal #0001'+(u.room?` · u sobi #${u.room}`:'')+(me?' · ti':'');
 const r=me?mergeRoses(App.me.roses,u.roses):(u.roses||{}),tot=rosesTotal(r);
 $('#pfRoses').innerHTML=`<div class="rosebox"><b>🌹 ${tot}</b>${tot?Object.entries(r).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`od ${esc(k)} ×${v}`).join(', '):'još nema ruža'}</div>`;
 $('#pfSt').style.display='none';$('#pfThrowW').style.display='none';$('#pfRose').style.display=me?'none':'';ovl('prof',true);
}
$('#gUsers').addEventListener('click',e=>{const u=e.target.closest('[data-gid]');if(u)openGProfile(u.dataset.gid)});
$('#gRooms').addEventListener('click',e=>{const b=e.target.closest('[data-join]');if(!b)return;if(!saveNick())return;$('#code').value=b.dataset.join;$('#bJoin').click()});
window.addEventListener('pagehide',()=>{if(App.role==='host'&&App.lobby&&App.lobby.code)gSend({t:'g_room_del',code:App.lobby.code})});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&App.me.nick&&G.status!=='on'&&G.status!=='off'){}
 if(document.visibilityState==='visible'&&G.peer&&G.peer.disconnected&&!G.peer.destroyed)try{G.peer.reconnect()}catch(e){}});
