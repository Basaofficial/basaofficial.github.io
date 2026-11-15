// #Bash igre – "Jedna!" (kartaška igra po UNO pravilima), 2–5 igrača + botovi
'use strict';
const UN_DEF={bots:0,start:7,time:30,stack:false,drawMatch:false};
const UN_COL={r:'Crvena',y:'Žuta',g:'Zelena',b:'Plava'};
const UN_BOTS=[['Bot Mujo','🤖'],['Bot Suljo','👾'],['Bot Fata','🦾'],['Bot Haso','🎰']];
const UN_SYM={s:'⊘',r:'⇄',d2:'+2',w:'',w4:'+4'};

// ================= HOST =================
function unDeck(){let id=0;const d=[];for(const c of ['r','y','g','b']){d.push({id:id++,c,v:'0'});
 for(let k=0;k<2;k++){for(let n=1;n<=9;n++)d.push({id:id++,c,v:String(n)});for(const v of ['s','r','d2'])d.push({id:id++,c,v})}}
 for(let k=0;k<4;k++){d.push({id:id++,c:'w',v:'w'});d.push({id:id++,c:'w',v:'w4'})}return shuffle(d)}
const unIsBot=p=>String(p).startsWith('bot:');
function unName(p){const U=App.un;return unIsBot(p)?(U&&U.bots[p]?U.bots[p][0]:'Bot'):pName(p)}
function unAv(p){const U=App.un;if(unIsBot(p))return U&&U.bots[p]?U.bots[p][1]:'🤖';const q=App.lobby&&App.lobby.players[p];return q?q.av:'🙂'}
function unTop(){const U=App.un;return U.discard[U.discard.length-1]}
function unNext(k){const U=App.un,n=U.players.length;return ((U.turn+U.dir*k)%n+n)%n}
function unCanPlay(c){const U=App.un,t=unTop();if(U.pend>0){if(!U.rules.stack)return false;return c.v==='w4'||(c.v==='d2'&&t.v==='d2')}return c.c==='w'||c.c===U.color||c.v===t.v}
function unPts(c){return /^\d$/.test(c.v)?+c.v:(c.c==='w'?50:20)}
function unStop(){clearTimeout(App.H.unT);clearTimeout(App.H.unC)}
function unStart(){
 const lb=App.lobby,R=Object.assign({},UN_DEF,lb.uno||{});unStop();
 const humans=Object.keys(lb.players).filter(id=>skOnline(id));const nb=Math.max(0,Math.min(R.bots|0,5-humans.length));
 const bots=[];for(let i=0;i<nb;i++)bots.push('bot:'+(i+1));const players=shuffle([...humans,...bots]);
 if(players.length<2){toast('Treba bar 2 igrača (ili dodaj bota u postavkama) 🃏');return}
 let deck=unDeck();const hands={};players.forEach(p=>hands[p]=deck.splice(0,R.start));
 let top=deck.shift();while(top.v==='w4'){deck.push(top);deck=shuffle(deck);top=deck.shift()}
 App.un={id:Date.now()+Math.random(),players,hands,deck,discard:[top],color:top.c==='w'?['r','y','g','b'][Math.floor(Math.random()*4)]:top.c,
  dir:1,turn:0,phase:'play',drawn:null,pend:0,said:{},unoP:null,winner:null,seq:0,act:null,rules:R,bots:Object.fromEntries(bots.map((b,i)=>[b,UN_BOTS[i]])),endsAt:0};
 const U=App.un;
 if(top.v==='s')U.turn=unNext(1);else if(top.v==='r'){U.dir=-1;if(players.length===2)U.turn=unNext(1)}
 else if(top.v==='d2'){unDraw(players[0],2);U.turn=unNext(1)}
 wake();sysAll('🃏 Jedna! počinje – sretno!');unChanged();
}
function unDraw(pid,n){const U=App.un,out=[];
 for(let i=0;i<n;i++){if(!U.deck.length){const top=U.discard.pop();U.deck=shuffle(U.discard);U.discard=[top];if(!U.deck.length)break}out.push(U.deck.pop())}
 U.hands[pid].push(...out);if(U.hands[pid].length>2)U.said[pid]=false;return out}
function unAdv(skip){const U=App.un;U.turn=unNext(skip?2:1);U.drawn=null}
function unClearP(pid){const U=App.un;if(U.unoP&&U.unoP!==pid)U.unoP=null}
function unPlay(pid,cid,col){
 const U=App.un;if(!U||U.phase!=='play'||U.players[U.turn]!==pid)return;
 const h=U.hands[pid],i=h.findIndex(c=>c.id===cid);if(i<0)return;const c=h[i];
 if(U.drawn!=null&&U.drawn!==cid)return;if(!unCanPlay(c))return;if(c.c==='w'&&!UN_COL[col])return;
 unClearP(pid);h.splice(i,1);U.discard.push(c);if(U.discard.length>60)U.discard.splice(0,U.discard.length-60).forEach(x=>U.deck.unshift(x));
 U.color=c.c==='w'?col:c.c;U.act={k:'play',who:pid,card:c,col:U.color,seq:++U.seq};
 if(h.length===1&&!U.said[pid])U.unoP=pid;
 if(!h.length){unWin(pid);return}
 const n=U.players.length;
 if(c.v==='s'){U.act.skip=U.players[unNext(1)];unAdv(true)}
 else if(c.v==='r'){U.dir*=-1;if(n===2){U.act.skip=U.players[unNext(1)];unAdv(true)}else unAdv(false)}
 else if(c.v==='d2'||c.v==='w4'){const a=c.v==='d2'?2:4;
  if(U.rules.stack){U.pend+=a;unAdv(false)}else{const vic=U.players[unNext(1)];unDraw(vic,a);U.act.hit={who:vic,n:a};unAdv(true)}}
 else unAdv(false);
 unChanged();
}
function unDrawAct(pid){
 const U=App.un;if(!U||U.phase!=='play'||U.players[U.turn]!==pid||U.drawn!=null)return;unClearP(pid);
 if(U.pend>0){const n=U.pend;U.pend=0;unDraw(pid,n);U.act={k:'draw',who:pid,n,seq:++U.seq,big:1};unAdv(false);unChanged();return}
 const got=[];do{const c=unDraw(pid,1);if(!c.length)break;got.push(c[0])}while(U.rules.drawMatch&&!unCanPlay(got[got.length-1])&&got.length<20);
 U.act={k:'draw',who:pid,n:got.length,seq:++U.seq};const last=got[got.length-1];
 if(last&&unCanPlay(last))U.drawn=last.id;else unAdv(false);unChanged();
}
function unPass(pid){const U=App.un;if(!U||U.phase!=='play'||U.players[U.turn]!==pid||U.drawn==null)return;U.act={k:'pass',who:pid,seq:++U.seq};unAdv(false);unChanged()}
function unSay(pid){const U=App.un;if(!U||U.phase!=='play')return;const h=U.hands[pid];if(!h||h.length>2||U.said[pid])return;
 U.said[pid]=true;if(U.unoP===pid)U.unoP=null;U.act={k:'uno',who:pid,seq:++U.seq};unChanged()}
function unCatch(pid){const U=App.un;if(!U||!U.unoP||U.unoP===pid||!U.players.includes(pid))return;const v=U.unoP;U.unoP=null;unDraw(v,2);
 U.act={k:'catch',who:pid,vic:v,seq:++U.seq};sysAll(`😈 ${unName(pid)} je uhvatio/la ${unName(v)} – +2 karte!`);unChanged()}
function unWin(pid){const U=App.un;U.phase='over';U.winner=pid;U.drawn=null;U.unoP=null;
 const others=U.players.filter(p=>p!==pid).map(p=>({p,pts:U.hands[p].reduce((a,c)=>a+unPts(c),0),n:U.hands[p].length})).sort((a,b)=>a.pts-b.pts);
 U.rank=[{p:pid,pts:others.reduce((a,o)=>a+o.pts,0),n:0,win:1},...others];sysAll(`🏆 ${unName(pid)} je pobijedio/la u Jedna!`);unChanged()}
function unView(id){const U=App.un;
 return {id:U.id,me:id,players:U.players.map(p=>({id:p,name:unName(p),av:unAv(p),n:U.hands[p].length,bot:unIsBot(p),said:!!U.said[p],on:unIsBot(p)||skOnline(p)})),
  hand:U.hands[id]?U.hands[id].slice():null,top:unTop(),under:U.discard.slice(-4,-1),color:U.color,dir:U.dir,turn:U.turn,phase:U.phase,
  drawn:U.players[U.turn]===id?U.drawn:null,pend:U.pend,unoP:U.unoP,deckN:U.deck.length,winner:U.winner,act:U.act,
  remain:U.endsAt?Math.max(0,U.endsAt-Date.now()):0,total:(U.rules.time||0)*1000,stack:U.rules.stack,
  rank:U.phase==='over'?U.rank.map(r=>({id:r.p,name:unName(r.p),av:unAv(r.p),pts:r.pts,n:r.n,win:!!r.win})):null}}
function unChanged(){const U=App.un;if(!U)return;
 const cur=U.players[U.turn],human=!unIsBot(cur)&&skOnline(cur);U.endsAt=U.phase==='play'&&human&&U.rules.time>0?Date.now()+U.rules.time*1000:0;
 App.conns.forEach((c,id)=>{if(c.open)try{c.send({t:'un',s:unView(id)})}catch(e){}});unOnView(unView(App.me.id));unSched()}
function unSched(){
 unStop();const U=App.un;if(!U||U.phase!=='play')return;const pid=U.players[U.turn],bot=unIsBot(pid)||!skOnline(pid);
 if(bot)App.H.unT=setTimeout(()=>{if(App.un===U&&U.players[U.turn]===pid&&U.phase==='play')unBot(pid)},1000+Math.random()*800);
 else if(U.rules.time>0)App.H.unT=setTimeout(()=>{if(App.un!==U||U.players[U.turn]!==pid||U.phase!=='play')return;
  if(U.drawn!=null)unPass(pid);else{unDrawAct(pid);if(App.un===U&&U.drawn!=null&&U.players[U.turn]===pid)unPass(pid)}},U.rules.time*1000+400);
 if(U.unoP&&!unIsBot(U.unoP)){const cs=U.players.filter(p=>unIsBot(p)&&p!==U.unoP);
  if(cs.length&&Math.random()<.55)App.H.unC=setTimeout(()=>{if(App.un===U&&U.unoP)unCatch(cs[0])},1300+Math.random()*1500)}
}
function unBotColor(h){const cnt={r:0,y:0,g:0,b:0};h.forEach(c=>{if(cnt[c.c]!=null)cnt[c.c]++});return Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a]||Math.random()-.5)[0]}
function unBot(pid){
 const U=App.un,h=U.hands[pid];
 if(U.drawn!=null){const c=h.find(x=>x.id===U.drawn);if(c&&unCanPlay(c))unPlay(pid,c.id,unBotColor(h.filter(x=>x!==c)));else unPass(pid);return}
 const ok=h.filter(unCanPlay);
 if(!ok.length){unDrawAct(pid);if(App.un===U&&U.drawn!=null&&U.players[U.turn]===pid)App.H.unT=setTimeout(()=>{if(App.un===U&&U.players[U.turn]===pid)unBot(pid)},900);return}
 if(h.length===2&&!U.said[pid]&&Math.random()<.88){unSay(pid);return}
 const nextN=U.hands[U.players[unNext(1)]].length;
 const sc=c=>(c.c==='w'?(h.length<=2?50:-30):0)+(['s','r','d2'].includes(c.v)?(nextN<=2?40:5):0)+(c.c===U.color?8:0)+h.filter(x=>x.c===c.c).length*3+Math.random()*4;
 const c=ok.sort((a,b)=>sc(b)-sc(a))[0];unPlay(pid,c.id,unBotColor(h.filter(x=>x!==c)));
}
function unOnJoin(id){const U=App.un;if(!U)return;sendTo(id,{t:'un',s:unView(id)});unChanged()}
function unOnLeave(id){if(App.un)unChanged()}
function unHostAction(id,d){
 if(d.t==='un_play')unPlay(id,d.id|0,d.col);else if(d.t==='un_draw')unDrawAct(id);else if(d.t==='un_pass')unPass(id);
 else if(d.t==='un_uno')unSay(id);else if(d.t==='un_catch')unCatch(id)}

// ================= CLIENT =================
function unCard(c,cls){const col=c.c,s=UN_SYM[c.v]!=null?UN_SYM[c.v]:c.v;
 const mid=c.c==='w'?`<span class="wh">${c.v==='w4'?'+4':''}</span>`:`<span class="cv">${s}</span>`;
 return `<div class="ucard ${col}${cls?' '+cls:''}" data-id="${c.id}"><span class="k tl">${c.c==='w'?(c.v==='w4'?'+4':'★'):s}</span>${mid}<span class="k br">${c.c==='w'?(c.v==='w4'?'+4':'★'):s}</span></div>`}
function unOk(v,c){if(v.drawn!=null&&c.id!==v.drawn)return false;const t=v.top;if(v.pend>0){if(!v.stack)return false;return c.v==='w4'||(c.v==='d2'&&t.v==='d2')}return c.c==='w'||c.c===v.color||c.v===t.v}
function unOnMsg(d){if(d.t==='un'&&d.s)unOnView(d.s)}
function unOnView(v){
 const prev=App.unv&&App.unv.id===v.id?App.unv:null;v._recv=Date.now();
 if(!onScreen('sUno')){hideWin();showScreen('sUno');renderChat()}
 if(!SK.unI)SK.unI=setInterval(unTimer,250);
 const a=v.act,fresh=a&&prev&&(!prev.act||prev.act.seq!==a.seq);let src=null;
 if(fresh&&a.k==='play'&&a.who===v.me){const el=$(`#unHand [data-id="${a.card.id}"]`);if(el)src=el.getBoundingClientRect()}
 const newIds=prev&&prev.hand&&v.hand?v.hand.filter(c=>!prev.hand.some(x=>x.id===c.id)).map(c=>c.id):[];
 App.unv=v;unRender(v,newIds,fresh&&a.k==='play');
 if(fresh)unAnim(v,a,src);
 const me=v.players.findIndex(p=>p.id===v.me);
 if(v.phase==='play'&&v.turn===me&&(!prev||prev.turn!==me)){sfx.turn();vib(50)}
 if(v.phase==='over'&&(!prev||prev.phase!=='over'))setTimeout(()=>unWinUI(v),1100);
}
function unOrder(v){const i=v.players.findIndex(p=>p.id===v.me);const n=v.players.length,out=[];
 if(i<0)return v.players.map((p,k)=>[p,k]);for(let k=1;k<n;k++){const j=(i+k)%n;out.push([v.players[j],j])}return out}
function unRender(v,newIds,hideTop){
 const meI=v.players.findIndex(p=>p.id===v.me),myTurn=v.phase==='play'&&v.turn===meI,cur=v.players[v.turn];
 $('#unInfo').innerHTML=`🃏 JEDNA! · ${v.players.length} igrača · ${v.dir>0?'↻':'↺'}`;
 $('#unOps').innerHTML=unOrder(v).map(([p,j])=>`<div class="uop${j===v.turn&&v.phase==='play'?' act':''}${p.on?'':' offp'}" data-pid="${esc(p.id)}" data-i="${j}">
  <div class="avw"><svg viewBox="0 0 48 48"><circle class="trk" cx="24" cy="24" r="22"/><circle class="tmr" cx="24" cy="24" r="22"/></svg><div class="av">${esc(p.av)}</div>
  ${p.n===1&&p.said?'<span class="unb">JEDNA!</span>':''}${v.unoP===p.id?'<span class="unb warn">!</span>':''}</div>
  <b>${esc(p.name)}</b><div class="fan">${Array.from({length:Math.min(p.n,8)}).map(()=>'<i></i>').join('')}<small>${p.n}</small></div></div>`).join('');
 const cc={r:'#ff3b5c',y:'#ffd23f',g:'#3ddc84',b:'#3d8bff'}[v.color]||'#7cff01';
 $('#unTable').style.setProperty('--cur',cc);$('#unDir').classList.toggle('rev',v.dir<0);
 $('#unDeckN').textContent=v.deckN;
 $('#unDisc').innerHTML=v.under.map((c,k)=>`<div class="ul" style="--r:${((c.id*37)%31)-15}deg">${unCard(c)}</div>`).join('')+`<div class="ul top${hideTop?' hid':''}" style="--r:${((v.top.id*37)%21)-10}deg">${unCard(v.top)}</div>`;
 $('#unPend').textContent=v.pend?`+${v.pend}`:'';$('#unPend').classList.toggle('on',v.pend>0);
 $('#unColor').textContent=UN_COL[v.color]||'';
 let st;if(v.phase==='over')st=`🏆 ${esc(v.players.find(p=>p.id===v.winner).name)} pobjeđuje!`;
 else if(myTurn)st=v.pend?`Na tebe je <b>+${v.pend}</b> – složi ili vuci`:v.drawn!=null?'Izvukao/la si kartu – odigraj je ili dalje':'<b>Tvoj red!</b> Odigraj kartu ili vuci';
 else st='';
 $('#unSt').innerHTML=st;
 const H=$('#unHand');
 if(v.hand){const n=v.hand.length;H.classList.toggle('many',n>8);H.classList.toggle('lots',n>13);
  const sorted=v.hand.slice().sort((a,b)=>('rygbw'.indexOf(a.c)-'rygbw'.indexOf(b.c))||(a.v<b.v?-1:1));
  H.innerHTML=`<div class="inner">${sorted.map(c=>unCard(c,(myTurn?(unOk(v,c)?'ok':'no'):'')+(newIds.includes(c.id)?' new':'')+(v.drawn===c.id?' drawn':''))).join('')}</div>`}
 else H.innerHTML='<p class="muted">👀 Gledaš igru</p>';
 const mine=v.hand||[];
 $('#unDrawB').style.display=myTurn&&v.drawn==null?'':'none';$('#unDrawB').textContent=v.pend?`Vuci +${v.pend}`:'🂠 Vuci';
 $('#unPassB').style.display=myTurn&&v.drawn!=null?'':'none';
 $('#unUnoB').style.display=v.phase==='play'&&mine.length&&mine.length<=2&&!(v.players[meI]&&v.players[meI].said)&&(myTurn||v.unoP===v.me)?'':'none';
 $('#unCatchB').style.display=v.phase==='play'&&v.unoP&&v.unoP!==v.me&&meI>=0?'':'none';
 $('#unDeck').classList.toggle('can',myTurn&&v.drawn==null);
}
function unRectOf(pid){const v=App.unv;if(pid===v.me)return $('#unHand').getBoundingClientRect();const e=$(`#unOps [data-pid="${CSS.escape(pid)}"] .avw`);return e?e.getBoundingClientRect():null}
function unFly(html,from,to,dur,cb){const e=document.createElement('div');e.className='unfly';e.innerHTML=html;document.body.appendChild(e);
 const w=e.firstElementChild.offsetWidth||64,h=e.firstElementChild.offsetHeight||96;
 const x0=from.left+from.width/2-w/2,y0=from.top+from.height/2-h/2,x1=to.left+to.width/2-w/2,y1=to.top+to.height/2-h/2;
 const an=e.animate([{transform:`translate(${x0}px,${y0}px) rotate(-12deg) scale(.9)`},{transform:`translate(${(x0+x1)/2}px,${Math.min(y0,y1)-40}px) rotate(8deg) scale(1.1)`},{transform:`translate(${x1}px,${y1}px) rotate(0) scale(1)`}],{duration:dur||420,easing:'cubic-bezier(.3,.7,.3,1)'});
 an.onfinish=()=>{e.remove();cb&&cb()}}
function unShout(t,sub){const e=$('#unShout');e.innerHTML=`${t}${sub?`<small>${esc(sub)}</small>`:''}`;e.classList.remove('on');void e.offsetWidth;e.classList.add('on')}
function unPop(pid,t){const r=unRectOf(pid);if(!r)return;const b=document.createElement('div');b.className='bub big';b.textContent=t;b.style.left=(r.left+r.width/2)+'px';b.style.top=(pid===App.unv.me?r.top:r.bottom+4)+'px';if(pid!==App.unv.me)b.classList.add('below');document.body.appendChild(b);setTimeout(()=>b.remove(),2900)}
function unAnim(v,a,src){
 const disc=$('#unDisc').getBoundingClientRect(),deck=$('#unDeck').getBoundingClientRect();
 if(a.k==='play'){const from=src||unRectOf(a.who)||deck;noise(.12,.5,0,2600,1);noise(.05,.6,.35,900,1);
  unFly(unCard(a.card),from,disc,430,()=>{const t=$('#unDisc .top');if(t)t.classList.remove('hid')});
  if(a.card.c==='w')setTimeout(()=>unPop(a.who,{r:'🔴',y:'🟡',g:'🟢',b:'🔵'}[a.col]||'🎨'),450);
  if(a.hit)setTimeout(()=>{unPop(a.hit.who,'+'+a.hit.n);tone(220,.25,'sawtooth',.08,0,110);if(a.hit.who===v.me)vib([60,40,60])},500);
  if(a.skip)setTimeout(()=>{unPop(a.skip,'⊘');tone(300,.15,'square',.05)},500);
  if(a.card.v==='r')setTimeout(()=>tone(500,.2,'triangle',.08,0,900),400)}
 else if(a.k==='draw'){const to=unRectOf(a.who);if(!to)return;const n=Math.min(a.n,5);
  for(let i=0;i<n;i++)setTimeout(()=>{unFly('<div class="ucard back"></div>',deck,to,380);noise(.06,.35,0,3000,1)},i*120);
  if(a.big)setTimeout(()=>unPop(a.who,'+'+a.n),300)}
 else if(a.k==='uno'){unShout('JEDNA!',unName2(v,a.who));[784,988,1319].forEach((f,i)=>tone(f,.25,'square',.06,i*.08));vib(40)}
 else if(a.k==='catch'){unShout('UHVAĆEN! 😈',unName2(v,a.vic)+' vuče +2');tone(200,.4,'sawtooth',.1,0,80)}
}
function unName2(v,id){const p=v.players.find(x=>x.id===id);return p?p.name:''}
function unTimer(){const v=App.unv;if(!v||!onScreen('sUno'))return;
 $$('#unOps .uop').forEach(o=>{const t=o.querySelector('.tmr');const act=+o.dataset.i===v.turn&&v.phase==='play';
  if(!act){t.style.strokeDashoffset='139';return}const rem=v.total?Math.max(0,v.remain-(Date.now()-v._recv)):v.total;t.style.strokeDashoffset=v.total?String(139*(1-rem/v.total)):'0'});
 const meI=v.players.findIndex(p=>p.id===v.me),b=$('#unTimeMe');
 if(v.phase==='play'&&v.turn===meI&&v.total){const s=Math.ceil(Math.max(0,v.remain-(Date.now()-v._recv))/1000);b.textContent=s+'s';b.classList.toggle('low',s<=5)}else b.textContent=''}
function unWinUI(v){
 if(!App.unv||App.unv.phase!=='over')return;const me=v.me,w=v.rank[0];
 $('#wTro').textContent=w.id===me?'🏆':'🃏';$('#wTitle').textContent=w.id===me?'Pobjeda! 🎉':`${w.name} pobjeđuje!`;
 $('#wRank').innerHTML=v.rank.map((r,i)=>`<div class="rk"><span class="pn">${['🥇','🥈','🥉'][i]||i+1+'.'}</span><span style="font-size:20px">${esc(r.av)}</span><b>${esc(r.name)}${r.id===me?' (ti)':''}</b><small>${r.win?`<span style="color:var(--g);font-weight:800">+${r.pts} bod.</span>`:`${r.n} karata · ${r.pts} bod.`}</small></div>`).join('')+
  '<p class="muted" style="margin-top:8px">Pobjednik dobija bodove od karata koje su ostale drugima.</p>';
 winButtons();ovl('win',true);sfx.win();confetti();
}
function unResetUI(){clearInterval(SK.unI);SK.unI=0;App.unv=null}
// events
$('#unHand').addEventListener('click',e=>{const el=e.target.closest('.ucard');const v=App.unv;if(!el||!v)return;const id=+el.dataset.id,c=v.hand.find(x=>x.id===id);
 const meI=v.players.findIndex(p=>p.id===v.me);if(v.phase!=='play'||v.turn!==meI){toast('Nisi na potezu 🙂',1200);return}
 if(!unOk(v,c)){el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');vib(20);return}
 if(c.c==='w'){App.unPickId=id;ovl('unPick',true);return}act('un_play',{id})});
$('#unPick').addEventListener('click',e=>{const b=e.target.closest('[data-col]');if(!b)return;ovl('unPick',false);if(App.unPickId!=null)act('un_play',{id:App.unPickId,col:b.dataset.col});App.unPickId=null});
$('#unDrawB').onclick=()=>act('un_draw');$('#unDeck').onclick=()=>{const v=App.unv;if(v&&$('#unDeck').classList.contains('can'))act('un_draw')};
$('#unPassB').onclick=()=>act('un_pass');$('#unUnoB').onclick=()=>act('un_uno');$('#unCatchB').onclick=()=>act('un_catch');
$('#unOps').addEventListener('click',e=>{const o=e.target.closest('[data-pid]');if(o&&!o.dataset.pid.startsWith('bot:'))openProfile(o.dataset.pid)});
$('#unHelp').onclick=()=>{$('#helpBody').innerHTML=unHelp();ovl('help',true)};
function unHelp(){return `<h4>🃏 Jedna!</h4><p>Cilj: prvi ostani bez karata.</p><ul>
 <li>Igraš kartu iste <b>boje</b> ili istog <b>broja/znaka</b> kao gornja karta.</li><li>Ako nemaš šta – <b>vuci</b>. Ako izvučena karta odgovara, možeš je odmah odigrati.</li>
 <li><b>⊘ Preskoči</b> – sljedeći igrač gubi red. <b>⇄ Okreni</b> – mijenja smjer (u 2 igrača = preskoči).</li>
 <li><b>+2</b> – sljedeći vuče 2 i gubi red. <b>★ Džoker</b> – biraš boju. <b>+4</b> – biraš boju, sljedeći vuče 4.</li>
 <li>Kad ostaneš na 2 karte, pritisni <b>JEDNA!</b> Ako zaboraviš, drugi te mogu <b>uhvatiti</b> – vučeš +2 😈</li>
 <li>Opcije u sobi: slaganje +2/+4, vuci dok ne možeš igrati, botovi, broj karata, vrijeme za potez.</li></ul>`}
