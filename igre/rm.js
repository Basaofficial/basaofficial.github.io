// #Bash igre – "Remi" (domaći remi: 2 špila + 4 džokera, otvaranje 51), 2–5 igrača + botovi
'use strict';
const RM_DEF={bots:0,open:51,rounds:3,time:60};
const RM_BOTS=[['Bot Mujo','🤖'],['Bot Suljo','👾'],['Bot Fata','🦾'],['Bot Haso','🎰']];
const RM_S={S:'♠',H:'♥',D:'♦',C:'♣'},RM_RED={H:1,D:1};
const RM_RK=['','A','2','3','4','5','6','7','8','9','10','J','Q','K','A'];

// ================= PRAVILA (zajedničko za domaćina i botove) =================
function rmDeck(){const d=[];let id=0;for(let k=0;k<2;k++)for(const s of 'SHDC')for(let r=1;r<=13;r++)d.push({id:id++,s,r});
 for(let k=0;k<4;k++)d.push({id:id++,s:'J',r:0});return shuffle(d)}
const rmJ=c=>c.s==='J';
function rmPosVal(p){return p===1?1:p>=10?10:p}           // vrijednost pozicije u nizu (A dolje = 1, A gore = 10)
function rmRankVal(r){return r===1?10:r>=10?10:r}         // vrijednost u grupi (A = 10)
function rmHandPen(c){return rmJ(c)?20:rmRankVal(c.r)}     // kazneni bodovi karte u ruci
// provjera kombinacije: vraća {ok,type,cards:[{...c,rep:{r,s}}],pts} ili null
function rmCheck(cards){
 if(!cards||cards.length<3)return null;
 const nat=cards.filter(c=>!rmJ(c)),jk=cards.filter(rmJ);
 if(nat.length<2)return null;
 // GRUPA: isti broj, različite boje
 if(nat.every(c=>c.r===nat[0].r)){
  const suits=new Set(nat.map(c=>c.s));
  if(suits.size===nat.length&&cards.length<=4){
   const free=['S','H','D','C'].filter(s=>!suits.has(s));const r=nat[0].r;
   const out=nat.map(c=>Object.assign({},c,{rep:{r,s:c.s}})).concat(jk.map((c,i)=>Object.assign({},c,{rep:{r,s:free[i]}})));
   return {ok:true,type:'set',cards:out,pts:rmRankVal(r)*out.length};
  }
 }
 // NIZ: ista boja, uzastopni brojevi
 const s=nat[0].s;if(!nat.every(c=>c.s===s))return null;
 const hasA=nat.some(c=>c.r===1);let best=null;
 for(const hi of hasA?[false,true]:[false]){
  const pos=nat.map(c=>({c,p:c.r===1&&hi?14:c.r})).sort((a,b)=>a.p-b.p);
  if(new Set(pos.map(x=>x.p)).size!==pos.length)continue;
  const lo=pos[0].p,top=pos[pos.length-1].p,gaps=top-lo+1-pos.length;if(gaps>jk.length)continue;
  let extra=jk.length-gaps,a=lo,b=top;
  while(extra>0&&b<14&&!(a===1&&b+1===14)){b++;extra--}
  while(extra>0&&a>1&&!(b===14&&a-1===1)){a--;extra--}
  if(extra>0)continue;if(a===1&&b===14)continue;
  const out=[];let j=0;
  for(let p=a;p<=b;p++){const n=pos.find(x=>x.p===p);
   if(n)out.push(Object.assign({},n.c,{rep:{r:p===14?1:p,s,p}}));else out.push(Object.assign({},jk[j++],{rep:{r:p===14?1:p,s,p}}))}
  const r={ok:true,type:'run',cards:out,pts:out.reduce((t,c)=>t+rmPosVal(c.rep.p),0)};if(!best||r.pts>best.pts)best=r;
 }
 return best;
}
// botovi / pomoć: pronađi kombinacije u ruci (pohlepno)
function rmFind(hand,useJ){
 let left=hand.slice();const melds=[];
 const take=ids=>{left=left.filter(c=>!ids.includes(c.id))};
 for(;;){const nat=left.filter(c=>!rmJ(c));let best=null;
  const consider=cs=>{const m=rmCheck(cs);if(m&&(!best||m.pts>best.pts||(m.pts===best.pts&&cs.length>best.cards.length)))best={pts:m.pts,cards:cs}};
  // grupe
  const byR={};nat.forEach(c=>{(byR[c.r]=byR[c.r]||[]).push(c)});
  Object.values(byR).forEach(g=>{const u=[],seen=new Set();g.forEach(c=>{if(!seen.has(c.s)){seen.add(c.s);u.push(c)}});if(u.length>=3)consider(u.slice(0,4))});
  // nizovi
  for(const s of 'SHDC'){const cs=nat.filter(c=>c.s===s);for(const hi of [false,true]){
   const byP=new Map();cs.forEach(c=>{const p=c.r===1&&hi?14:c.r;if(!byP.has(p))byP.set(p,c)});const ps=[...byP.keys()].sort((a,b)=>a-b);
   let run=[];for(let i=0;i<ps.length;i++){if(run.length&&ps[i]!==run[run.length-1]+1){if(run.length>=3)consider(run.map(p=>byP.get(p)));run=[]}run.push(ps[i])}
   if(run.length>=3)consider(run.map(p=>byP.get(p)))}}
  if(!best)break;melds.push(best.cards);take(best.cards.map(c=>c.id));
 }
 if(useJ){let jk=left.filter(rmJ);
  // džokerima dopuni parove (isti broj ili susjedni u boji)
  while(jk.length){const nat=left.filter(c=>!rmJ(c));let best=null;
   for(let i=0;i<nat.length;i++)for(let k=i+1;k<nat.length;k++){const m=rmCheck([nat[i],nat[k],jk[0]]);if(m&&(!best||m.pts>best.pts))best={pts:m.pts,cards:[nat[i],nat[k],jk[0]]}}
   if(!best){// ili dodaj džoker na postojeću kombinaciju
    const mi=melds.findIndex(m=>rmCheck(m.concat(jk[0])));if(mi<0)break;melds[mi]=melds[mi].concat(jk[0]);take([jk[0].id]);jk=left.filter(rmJ);continue}
   melds.push(best.cards);take(best.cards.map(c=>c.id));jk=left.filter(rmJ)}
 }
 return {melds,left,pts:melds.reduce((t,m)=>t+rmCheck(m).pts,0)};
}

// ================= HOST =================
const rmIsBot=p=>String(p).startsWith('bot:');
function rmName(p){const R=App.rm;return rmIsBot(p)?(R&&R.bots[p]?R.bots[p][0]:'Bot'):pName(p)}
function rmAv(p){const R=App.rm;if(rmIsBot(p))return R&&R.bots[p]?R.bots[p][1]:'🤖';const q=App.lobby&&App.lobby.players[p];return q?q.av:'🙂'}
function rmStop(){clearTimeout(App.H.rmT);clearTimeout(App.H.rmN)}
function rmStart(){
 const lb=App.lobby,R=Object.assign({},RM_DEF,lb.rm||{});rmStop();
 const humans=Object.keys(lb.players).filter(id=>skOnline(id));const nb=Math.max(0,Math.min(R.bots|0,5-humans.length));
 const bots=[];for(let i=0;i<nb;i++)bots.push('bot:'+(i+1));const players=shuffle([...humans,...bots]);
 if(players.length<2){toast('Treba bar 2 igrača (ili dodaj bota u postavkama) 🂡');return}
 App.rm={id:Date.now()+Math.random(),players,rules:R,round:0,dealer:players.length-1,score:Object.fromEntries(players.map(p=>[p,0])),hist:[],
  bots:Object.fromEntries(bots.map((b,i)=>[b,RM_BOTS[i]])),seq:0};
 wake();sysAll('🂡 Remi počinje – otvaranje '+R.open+', sretno!');rmDeal();
}
function rmDeal(){const M=App.rm,n=M.players.length;M.round++;M.dealer=(M.dealer+1)%n;
 const deck=rmDeck(),hands={};M.players.forEach(p=>hands[p]=deck.splice(0,14));
 const first=(M.dealer+1)%n;hands[M.players[first]].push(deck.pop());
 Object.assign(M,{deck,discard:[],hands,table:[],opened:{},turn:first,phase:'play',must:null,took:null,fromHand:{},startOpen:{},winner:null,act:{k:'deal',seq:++M.seq},roundPts:null});
 M.startOpen[M.players[first]]=false;rmChanged();
}
function rmCur(){const M=App.rm;return M.players[M.turn]}
function rmNextTurn(){const M=App.rm;M.turn=(M.turn+1)%M.players.length;M.phase='draw';M.must=null;M.took=null;M.startOpen[rmCur()]=!!M.opened[rmCur()]}
function rmCards(pid,ids){const h=App.rm.hands[pid];const out=[];for(const id of ids){const c=h.find(x=>x.id===id);if(!c||out.includes(c))return null;out.push(c)}return out}
function rmRemove(pid,ids){const M=App.rm;M.hands[pid]=M.hands[pid].filter(c=>!ids.includes(c.id))}
function rmErr(pid,msg){if(pid===App.me.id)toast(msg,2200);else sendTo(pid,{t:'rm_err',m:msg})}
function rmDraw(pid,src){const M=App.rm;if(!M||M.phase!=='draw'||rmCur()!==pid||M.winner)return;
 let c;
 if(src==='disc'){c=M.discard[M.discard.length-1];if(!c)return;M.discard.pop();if(!M.opened[pid])M.must=c.id;M.took=c.id}
 else{if(!M.deck.length){const top=M.discard.pop();M.deck=shuffle(M.discard);M.discard=top?[top]:[]}
  if(!M.deck.length){rmEndRound(null);return}c=M.deck.pop()}
 M.hands[pid].push(c);M.phase='play';M.act={k:'draw',who:pid,src,seq:++M.seq,card:src==='disc'?c:null};rmChanged();
}
function rmBack(pid){const M=App.rm;if(!M||M.phase!=='play'||rmCur()!==pid||M.took==null||M.must==null)return;
 const c=M.hands[pid].find(x=>x.id===M.took);if(!c)return;rmRemove(pid,[c.id]);M.discard.push(c);M.phase='draw';M.must=null;M.took=null;
 M.act={k:'back',who:pid,card:c,seq:++M.seq};rmChanged()}
function rmMeld(pid,groups){const M=App.rm;if(!M||M.phase!=='play'||rmCur()!==pid||M.winner)return false;
 if(!Array.isArray(groups)||!groups.length||groups.length>8)return false;
 const all=[],checked=[];for(const g of groups){if(!Array.isArray(g))return false;const cs=rmCards(pid,g.map(x=>x|0));if(!cs)return false;
  if(cs.some(c=>all.includes(c))){rmErr(pid,'Ista karta u dvije kombinacije');return false}all.push(...cs);
  const m=rmCheck(cs);if(!m){rmErr(pid,'Neispravna kombinacija ('+cs.map(rmTxt).join(' ')+')');return false}checked.push(m)}
 if(M.hands[pid].length-all.length<1){rmErr(pid,'Moraš zadržati kartu za bacanje');return false}
 const pts=checked.reduce((t,m)=>t+m.pts,0);
 if(!M.opened[pid]){
  if(pts<M.rules.open){rmErr(pid,`Za otvaranje treba ${M.rules.open} bodova – imaš ${pts}`);return false}
  if(M.must!=null&&!all.some(c=>c.id===M.must)){rmErr(pid,'Karta uzeta sa stola mora biti u otvaranju');return false}
  M.opened[pid]=true;M.must=null}
 rmRemove(pid,all.map(c=>c.id));
 checked.forEach(m=>M.table.push({o:pid,cards:m.cards,type:m.type}));
 M.act={k:'meld',who:pid,pts,n:checked.length,open:M.startOpen[pid]===false&&pts>=M.rules.open,seq:++M.seq,idx:M.table.length-checked.length};
 rmChanged();return true}
function rmAdd(pid,mi,ids){const M=App.rm;if(!M||M.phase!=='play'||rmCur()!==pid||M.winner)return false;
 if(!M.opened[pid]){rmErr(pid,'Prvo se moraš otvoriti');return false}
 const t=M.table[mi|0];if(!t)return false;const cs=rmCards(pid,(ids||[]).map(x=>x|0));if(!cs||!cs.length)return false;
 if(M.hands[pid].length-cs.length<1){rmErr(pid,'Moraš zadržati kartu za bacanje');return false}
 const m=rmCheck(t.cards.map(c=>({id:c.id,s:c.s,r:c.r})).concat(cs));if(!m){rmErr(pid,'Ne može se dodati na tu kombinaciju');return false}
 rmRemove(pid,cs.map(c=>c.id));t.cards=m.cards;t.type=m.type;M.act={k:'add',who:pid,mi:mi|0,seq:++M.seq};rmChanged();return true}
function rmSwap(pid,mi,id){const M=App.rm;if(!M||M.phase!=='play'||rmCur()!==pid||M.winner)return false;
 if(!M.opened[pid]){rmErr(pid,'Džoker možeš uzeti tek kad se otvoriš');return false}
 const t=M.table[mi|0];if(!t)return false;const cs=rmCards(pid,[id|0]);if(!cs)return false;const c=cs[0];if(rmJ(c))return false;
 const js=t.cards.filter(x=>rmJ(x));if(!js.length){rmErr(pid,'Na toj kombinaciji nema džokera');return false}
 const jk=js.find(x=>x.rep&&x.rep.r===c.r&&x.rep.s===c.s)||(t.type==='set'&&c.r===js[0].rep.r?js[0]:null);
 if(!jk){rmErr(pid,'Ta karta ne mijenja džokera');return false}
 const rest=t.cards.filter(x=>x!==jk).map(x=>({id:x.id,s:x.s,r:x.r}));const m=rmCheck(rest.concat(c));if(!m||m.cards.length!==t.cards.length){rmErr(pid,'Ta karta ne mijenja džokera');return false}
 rmRemove(pid,[c.id]);M.hands[pid].push({id:jk.id,s:'J',r:0});t.cards=m.cards;M.act={k:'swap',who:pid,mi:mi|0,seq:++M.seq};rmChanged();return true}
function rmDisc(pid,id){const M=App.rm;if(!M||M.phase!=='play'||rmCur()!==pid||M.winner)return;
 const h=M.hands[pid],c=h.find(x=>x.id===(id|0));if(!c)return;
 if(M.must!=null&&h.some(x=>x.id===M.must)){rmErr(pid,'Kartu sa stola moraš iskoristiti u otvaranju (ili je vrati)');return}
 rmRemove(pid,[c.id]);M.discard.push(c);if(M.discard.length>80)M.discard.splice(0,M.discard.length-80).forEach(x=>M.deck.unshift(x));
 M.act={k:'disc',who:pid,card:c,seq:++M.seq};
 if(!M.hands[pid].length){rmEndRound(pid);return}
 rmNextTurn();rmChanged()}
function rmEndRound(w){const M=App.rm;M.winner=w||'-';M.phase='over';
 const iz=w&&M.startOpen[w]===false;const pts={};
 M.players.forEach(p=>{if(p===w){pts[p]=iz?-80:-40;return}let v=M.opened[p]?M.hands[p].reduce((t,c)=>t+rmHandPen(c),0):100;if(iz)v*=2;pts[p]=v});
 M.players.forEach(p=>M.score[p]+=pts[p]);M.roundPts=pts;M.iz=!!iz;M.hist.push(pts);
 M.final=M.round>=M.rules.rounds;
 if(w)sysAll(iz?`🔥 ${rmName(w)} je zatvorio/la REMI IZ RUKE – duplo!`:`🂡 ${rmName(w)} je završio/la rundu ${M.round}`);
 if(M.final)M.rank=M.players.map(p=>({p,pts:M.score[p]})).sort((a,b)=>a.pts-b.pts);
 M.act={k:'end',who:w,seq:++M.seq};rmChanged();
 if(M.final){setTimeout(()=>{if(App.rm===M)sysAll(`🏆 ${rmName(M.rank[0].p)} pobjeđuje u remiju!`)},400)}

}
function rmNext(pid){const M=App.rm;if(!M||M.phase!=='over'||M.final)return;if(pid!==App.lobby.host)return;rmDeal()}
function rmTxt(c){return rmJ(c)?'🃏':RM_RK[c.r]+RM_S[c.s]}
function rmView(id){const M=App.rm,me=M.players.indexOf(id);
 return {id:M.id,me:id,round:M.round,rounds:M.rules.rounds,open:M.rules.open,
  players:M.players.map(p=>({id:p,name:rmName(p),av:rmAv(p),n:M.hands[p].length,bot:rmIsBot(p),on:rmIsBot(p)||skOnline(p),opened:!!M.opened[p],score:M.score[p]})),
  hand:M.hands[id]?M.hands[id].slice():null,table:M.table,top:M.discard[M.discard.length-1]||null,under:M.discard.slice(-3,-1),deckN:M.deck.length,
  turn:M.turn,phase:M.phase,must:me===M.turn?M.must:null,took:me===M.turn?M.took:null,winner:M.winner,act:M.act,iz:!!M.iz,roundPts:M.roundPts,final:!!M.final,
  isHost:id===App.lobby.host,remain:M.endsAt?Math.max(0,M.endsAt-Date.now()):0,total:(M.rules.time||0)*1000,
  rank:M.final&&M.rank?M.rank.map(r=>({id:r.p,name:rmName(r.p),av:rmAv(r.p),pts:r.pts})):null}}
function rmChanged(){const M=App.rm;if(!M)return;
 const cur=rmCur(),human=!rmIsBot(cur)&&skOnline(cur);M.endsAt=M.phase!=='over'&&human&&M.rules.time>0?Date.now()+M.rules.time*1000:0;
 App.conns.forEach((c,id)=>{if(c.open)try{c.send({t:'rm',s:rmView(id)})}catch(e){}});rmOnView(rmView(App.me.id));rmSched()}
function rmSched(){
 clearTimeout(App.H.rmT);const M=App.rm;if(!M||M.phase==='over')return;const pid=rmCur(),bot=rmIsBot(pid)||!skOnline(pid);
 if(bot)App.H.rmT=setTimeout(()=>{if(App.rm===M&&rmCur()===pid&&M.phase!=='over')rmBot(pid)},900+Math.random()*700);
 else if(M.rules.time>0)App.H.rmT=setTimeout(()=>{if(App.rm!==M||rmCur()!==pid||M.phase==='over')return;rmAuto(pid)},M.rules.time*1000+400);
}
function rmAuto(pid){const M=App.rm;
 if(M.phase==='draw')rmDraw(pid,'deck');if(App.rm!==M||M.phase!=='play'||rmCur()!==pid)return;
 if(M.must!=null){rmBack(pid);rmDraw(pid,'deck')}if(M.phase!=='play'||rmCur()!==pid)return;
 rmDisc(pid,rmWorst(M.hands[pid]).id)}
function rmUse(c,h){if(rmJ(c))return 99;let u=0;for(const x of h){if(x===c||rmJ(x))continue;if(x.r===c.r&&x.s!==c.s)u+=2;if(x.s===c.s&&x.r!==c.r&&Math.abs(x.r-c.r)<=2)u+=Math.abs(x.r-c.r)===1?2:1.2}return u}
function rmWorst(h){return h.slice().sort((a,b)=>(rmUse(a,h)-rmUse(b,h))||(rmHandPen(b)-rmHandPen(a)))[0]}
function rmFitsTable(c){const M=App.rm;return M.table.findIndex(t=>rmCheck(t.cards.map(x=>({id:x.id,s:x.s,r:x.r})).concat(c)))}
function rmBot(pid){const M=App.rm;
 if(M.phase==='draw'){const top=M.discard[M.discard.length-1];let take=false;
  if(top&&!rmJ(top)){if(M.opened[pid]){const f=rmFind(M.hands[pid].concat(top),false);take=f.melds.some(m=>m.includes(top))||rmFitsTable(top)>=0}
   else{const f=rmFind(M.hands[pid].concat(top),true);take=f.pts>=M.rules.open&&f.melds.some(m=>m.includes(top))&&f.left.length>=1}}
  else if(top&&rmJ(top))take=true;
  if(top&&rmJ(top)&&!M.opened[pid]){const f=rmFind(M.hands[pid].concat(top),true);take=f.pts>=M.rules.open&&f.left.length>=1}
  rmDraw(pid,take?'disc':'deck');if(App.rm!==M||M.phase!=='play')return;
  App.H.rmT=setTimeout(()=>{if(App.rm===M&&rmCur()===pid&&M.phase==='play')rmBot(pid)},700+Math.random()*500);return}
 const h=M.hands[pid];
 if(!M.opened[pid]){const f=rmFind(h,true);if(f.pts>=M.rules.open&&f.left.length>=1&&(M.must==null||f.melds.some(m=>m.some(c=>c.id===M.must))))rmMeld(pid,f.melds.map(m=>m.map(c=>c.id)))}
 else{const f=rmFind(h,h.length>4);const ms=f.melds.filter(()=>true);let keep=h.length-ms.reduce((t,m)=>t+m.length,0);
  if(ms.length&&keep>=1)rmMeld(pid,ms.map(m=>m.map(c=>c.id)));
  // dodaj na sto
  let again=true;while(again&&M.hands[pid].length>1){again=false;for(const c of M.hands[pid]){if(rmJ(c))continue;const mi=rmFitsTable(c);if(mi>=0&&rmAdd(pid,mi,[c.id])){again=true;break}}}}
 if(App.rm!==M||M.phase!=='play'||rmCur()!==pid)return;
 if(M.must!=null&&M.hands[pid].some(x=>x.id===M.must)){rmBack(pid);rmDraw(pid,'deck')}
 if(App.rm!==M||M.phase!=='play'||rmCur()!==pid)return;
 const hh=M.hands[pid];rmDisc(pid,(hh.length===1?hh[0]:rmWorst(hh.filter(c=>!rmJ(c)).length?hh.filter(c=>!rmJ(c)):hh)).id)}
function rmOnJoin(id){const M=App.rm;if(!M)return;sendTo(id,{t:'rm',s:rmView(id)});rmChanged()}
function rmOnLeave(id){if(App.rm)rmChanged()}
function rmHostAction(id,d){
 if(d.t==='rm_draw')rmDraw(id,d.src==='disc'?'disc':'deck');else if(d.t==='rm_back')rmBack(id);
 else if(d.t==='rm_meld')rmMeld(id,d.g);else if(d.t==='rm_add')rmAdd(id,d.m,d.ids);else if(d.t==='rm_swap')rmSwap(id,d.m,d.id);
 else if(d.t==='rm_disc')rmDisc(id,d.id);else if(d.t==='rm_next')rmNext(id)}

// ================= CLIENT =================
const RMC={sel:new Set(),stage:[],sort:'s',order:null};
const RM_PIPS={2:[[50,18],[50,82,1]],3:[[50,18],[50,50],[50,82,1]],4:[[30,18],[70,18],[30,82,1],[70,82,1]],
 5:[[30,18],[70,18],[50,50],[30,82,1],[70,82,1]],6:[[30,18],[70,18],[30,50],[70,50],[30,82,1],[70,82,1]],
 7:[[30,18],[70,18],[50,34],[30,50],[70,50],[30,82,1],[70,82,1]],8:[[30,18],[70,18],[50,34],[30,50],[70,50],[50,66,1],[30,82,1],[70,82,1]],
 9:[[30,18],[70,18],[30,39],[70,39],[50,50],[30,61,1],[70,61,1],[30,82,1],[70,82,1]],10:[[30,18],[70,18],[50,29],[30,39],[70,39],[30,61,1],[70,61,1],[50,71,1],[30,82,1],[70,82,1]]};
function rmCard(c,cls,rep){
 if(rmJ(c)){const r=rep&&rep.r?`<span class="jr">${RM_RK[rep.r]}${RM_S[rep.s]}</span>`:'';
  return `<div class="rc jk${cls?' '+cls:''}" data-id="${c.id}"><span class="jx tl">J<br>O<br>K<br>E<br>R</span><span class="jst">★</span><span class="jx br">J<br>O<br>K<br>E<br>R</span>${r}</div>`}
 const s=RM_S[c.s],rk=RM_RK[c.r],red=RM_RED[c.s]?' red':'';let mid;
 if(c.r===1)mid=`<span class="ace">${s}</span>`;
 else if(c.r>10)mid=`<span class="face f${c.r}"><b>${rk}</b><i>${s}</i><em>${c.r===13?'♚':c.r===12?'♛':'⚜'}</em></span>`;
 else mid=`<span class="pips">${RM_PIPS[c.r].map(([x,y,f])=>`<i style="left:${x}%;top:${y}%"${f?' class="f"':''}>${s}</i>`).join('')}</span><span class="one">${s}</span>`;
 return `<div class="rc${red}${cls?' '+cls:''}" data-id="${c.id}"><span class="ix tl"><b>${rk}</b>${s}</span>${mid}<span class="ix br"><b>${rk}</b>${s}</span></div>`}
function rmOnMsg(d){if(d.t==='rm'&&d.s)rmOnView(d.s);else if(d.t==='rm_err'&&d.m)toast(d.m,2200)}
function rmMyTurn(v){const i=v.players.findIndex(p=>p.id===v.me);return v.phase!=='over'&&v.turn===i}
function rmOnView(v){
 const prev=App.rmv&&App.rmv.id===v.id?App.rmv:null;v._recv=Date.now();
 if(!onScreen('sRemi')){hideWin();showScreen('sRemi');renderChat()}
 if(!SK.rmI)SK.rmI=setInterval(rmTimer,250);
 if(prev&&prev.round!==v.round){RMC.sel.clear();RMC.stage=[];RMC.order=null}
 if(v.hand){const ids=new Set(v.hand.map(c=>c.id));for(const id of [...RMC.sel])if(!ids.has(id))RMC.sel.delete(id);
  RMC.stage=RMC.stage.map(g=>g.filter(id=>ids.has(id))).filter(g=>g.length);
  if(RMC.order){RMC.order=RMC.order.filter(id=>ids.has(id));v.hand.forEach(c=>{if(!RMC.order.includes(c.id))RMC.order.push(c.id)})}}
 const a=v.act,fresh=a&&prev&&(!prev.act||prev.act.seq!==a.seq);
 const newIds=prev&&prev.hand&&v.hand&&prev.round===v.round?v.hand.filter(c=>!prev.hand.some(x=>x.id===c.id)).map(c=>c.id):[];
 let src=null;if(fresh&&a.k==='disc'&&a.who===v.me){const el=$(`#rmHand [data-id="${a.card.id}"]`);if(el)src=el.getBoundingClientRect()}
 App.rmv=v;rmRender(v,newIds,fresh&&a.k==='disc');
 if(fresh)rmAnim(v,a,src);
 if(rmMyTurn(v)&&(!prev||!rmMyTurn(prev))){sfx.turn();vib(50)}
 if(v.phase==='over'&&(!prev||prev.phase!=='over'))setTimeout(()=>rmRoundUI(v),900);
 if(v.phase!=='over')ovl('rmRound',false);
}
function rmOrder(v){const i=v.players.findIndex(p=>p.id===v.me);const n=v.players.length,out=[];
 if(i<0)return v.players.map((p,k)=>[p,k]);for(let k=1;k<n;k++){const j=(i+k)%n;out.push([v.players[j],j])}return out}
function rmSortHand(v){const h=v.hand.slice();
 if(RMC.order){const m=new Map(h.map(c=>[c.id,c]));return RMC.order.map(id=>m.get(id)).filter(Boolean)}
 const so={S:0,H:1,C:2,D:3,J:4};
 return RMC.sort==='s'?h.sort((a,b)=>so[a.s]-so[b.s]||a.r-b.r):h.sort((a,b)=>(rmJ(a)-rmJ(b))||a.r-b.r||so[a.s]-so[b.s])}
function rmStageCards(v){const m=new Map(v.hand.map(c=>[c.id,c]));return RMC.stage.map(g=>g.map(id=>m.get(id)).filter(Boolean))}
function rmRender(v,newIds,hideTop){
 const meI=v.players.findIndex(p=>p.id===v.me),my=rmMyTurn(v),me=v.players[meI];
 $('#rmInfo').innerHTML=`🂡 REMI · runda ${v.round}/${v.rounds} · otvaranje ${v.open}`;
 $('#rmOps').innerHTML=rmOrder(v).map(([p,j])=>`<div class="uop${j===v.turn&&v.phase!=='over'?' act':''}${p.on?'':' offp'}" data-pid="${esc(p.id)}" data-i="${j}">
  <div class="avw"><svg viewBox="0 0 48 48"><circle class="trk" cx="24" cy="24" r="22"/><circle class="tmr" cx="24" cy="24" r="22"/></svg><div class="av">${esc(p.av)}</div>
  ${p.opened?'<span class="unb">OTVOREN</span>':''}</div>
  <b>${esc(p.name)}</b><div class="fan rmfan">${Array.from({length:Math.min(p.n,9)}).map(()=>'<i></i>').join('')}<small>${p.n}</small></div><small class="rmsc">${p.score} b.</small></div>`).join('');
 // sto
 const T=$('#rmTable');
 T.innerHTML=v.table.length?v.table.map((t,i)=>{const o=v.players.find(p=>p.id===t.o);
  return `<div class="rmm${t.o===v.me?' mine':''}" data-m="${i}"><div class="rmmc">${t.cards.map(c=>rmCard(c,'sm',c.rep)).join('')}</div><small>${esc(o?o.av:'')} ${t.cards.length}</small></div>`}).join('')
  :`<div class="rmempty">${v.phase==='over'?'':'Sto je prazan – prvi koji skupi '+v.open+' bodova se otvara'}</div>`;
 $('#rmDeckN').textContent=v.deckN;
 $('#rmDisc').innerHTML=(v.under||[]).map(c=>`<div class="ul" style="--r:${((c.id*37)%17)-8}deg">${rmCard(c)}</div>`).join('')+(v.top?`<div class="ul top${hideTop?' hid':''}" style="--r:${((v.top.id*37)%13)-6}deg">${rmCard(v.top)}</div>`:'<div class="rmslot">baci ovdje</div>');
 const canDraw=my&&v.phase==='draw';
 $('#rmDeck').classList.toggle('can',canDraw);$('#rmDisc').classList.toggle('can',canDraw&&!!v.top);
 // status
 let st='';const stc=rmStageCards(v),stPts=stc.reduce((t,g)=>{const m=rmCheck(g);return t+(m?m.pts:0)},0);
 if(v.phase==='over')st=v.winner&&v.winner!=='-'?`🏆 ${esc((v.players.find(p=>p.id===v.winner)||{}).name||'')} je završio/la rundu`:'Špil je prazan – runda gotova';
 else if(my&&v.phase==='draw')st='<b>Tvoj red!</b> Vuci iz špila ili uzmi kartu sa stola';
 else if(my&&v.must!=null)st=`Iskoristi uzetu kartu u otvaranju (${stPts}/${v.open}) ili je vrati`;
 else if(my&&!me.opened)st=RMC.stage.length?`Otvaranje: <b>${stPts}</b> / ${v.open} bodova`:'Složi kombinacije za otvaranje ili baci kartu';
 else if(my)st='Spuštaj/dodaj karte, pa <b>baci</b> jednu da završiš potez';
 else{const c=v.players[v.turn];st=c?`${esc(c.name)} je na potezu…`:''}
 $('#rmSt').innerHTML=st;
 // pripremljene kombinacije (otvaranje)
 $('#rmStage').innerHTML=stc.map((g,i)=>{const m=rmCheck(g);return `<div class="rmg${m?'':' bad'}" data-g="${i}">${(m?m.cards:g).map(c=>rmCard(c,'sm',m&&c.rep)).join('')}<small>${m?m.pts+' b.':'✕'}</small></div>`}).join('');
 $('#rmStage').style.display=stc.length?'':'none';
 // ruka
 const H=$('#rmHand');
 if(v.hand){const hand=rmSortHand(v),staged=new Set(RMC.stage.flat());const vis=hand.filter(c=>!staged.has(c.id));
  const n=vis.length,av=Math.max(220,(H.clientWidth||340)-40),w=66,step=n>1?Math.max(16,Math.min(w-6,(av-w)/(n-1))):w;H.style.setProperty('--ov',(-(w-step))+'px');
  H.innerHTML=`<div class="inner">${vis.map(c=>rmCard(c,(RMC.sel.has(c.id)?'sel':'')+(newIds.includes(c.id)?' new':'')+(v.must===c.id?' must':''))).join('')}</div>`}
 else H.innerHTML='<p class="muted">👀 Gledaš igru</p>';
 // dugmad
 const ns=RMC.sel.size,play=my&&v.phase==='play';
 $('#rmMeldB').style.display=play&&ns>=3?'':'none';
 $('#rmOpenB').style.display=play&&!me.opened&&RMC.stage.length?'':'none';$('#rmOpenB').textContent=`Otvori se (${stPts})`;$('#rmOpenB').disabled=stPts<v.open;
 $('#rmClrB').style.display=RMC.stage.length?'':'none';
 $('#rmDiscB').style.display=play&&ns===1?'':'none';
 $('#rmBackB').style.display=play&&v.must!=null?'':'none';
 $('#rmSortB').textContent=RMC.order?'↕ Moj red':RMC.sort==='s'?'♠♥ Po boji':'🔢 Po broju';
 $('#rmHint').textContent=play&&ns&&me.opened&&v.table.length?'Tip: dodirni kombinaciju na stolu da dodaš označene karte':'';
}
function rmRectOf(pid){const v=App.rmv;if(pid===v.me)return $('#rmHand').getBoundingClientRect();const e=$(`#rmOps [data-pid="${CSS.escape(pid)}"] .avw`);return e?e.getBoundingClientRect():null}
function rmAnim(v,a,src){
 const disc=$('#rmDisc').getBoundingClientRect(),deck=$('#rmDeck').getBoundingClientRect();
 if(a.k==='disc'){const from=src||rmRectOf(a.who)||deck;noise(.1,.45,0,2600,1);
  unFly(rmCard(a.card),from,disc,420,()=>{const t=$('#rmDisc .top');if(t)t.classList.remove('hid')})}
 else if(a.k==='draw'){const to=rmRectOf(a.who);if(!to)return;noise(.06,.35,0,3000,1);
  unFly(a.card?rmCard(a.card):'<div class="rc back"></div>',a.src==='disc'?disc:deck,to,380)}
 else if(a.k==='meld'){tone(520,.12,'triangle',.08);tone(780,.18,'triangle',.08,.1);
  if(a.open){unShout('OTVOREN!',unName2(v,a.who)+' · '+a.pts+' bodova');[523,659,784].forEach((f,i)=>tone(f,.22,'triangle',.07,i*.09));vib(40)}
  setTimeout(()=>{$$('#rmTable .rmm').forEach((e,i)=>{if(i>=a.idx){e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop')}})},20)}
 else if(a.k==='add'||a.k==='swap'){tone(660,.12,'triangle',.07);const e=$(`#rmTable [data-m="${a.mi}"]`);if(e){e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop')}
  if(a.k==='swap')unShout('🃏','džoker zamijenjen')}
 else if(a.k==='deal'){for(let i=0;i<6;i++)setTimeout(()=>noise(.05,.3,0,3200,1),i*90)}
 else if(a.k==='end'&&a.who&&v.iz)unShout('REMI!','iz ruke – duplo 🔥');
}
function rmRoundUI(v){if(!App.rmv||App.rmv.phase!=='over')return;
 if(v.final){const me=v.me,w=v.rank[0];
  $('#wTro').textContent=w.id===me?'🏆':'🂡';$('#wTitle').textContent=w.id===me?'Pobjeda! 🎉':`${w.name} pobjeđuje!`;
  $('#wRank').innerHTML=v.rank.map((r,i)=>`<div class="rk"><span class="pn">${['🥇','🥈','🥉'][i]||i+1+'.'}</span><span style="font-size:20px">${esc(r.av)}</span><b>${esc(r.name)}${r.id===me?' (ti)':''}</b><small>${r.pts} bod.</small></div>`).join('')+
   '<p class="muted" style="margin-top:8px">Najmanje bodova pobjeđuje.</p>';
  winButtons();ovl('win',true);sfx.win();if(w.id===me)confetti();return}
 const w=v.players.find(p=>p.id===v.winner);
 $('#rmRT').textContent=w?(v.iz?'🔥 Remi iz ruke!':`${w.name} završava rundu ${v.round}`):'Špil je prazan';
 $('#rmRB').innerHTML=v.players.slice().sort((a,b)=>a.score-b.score).map(p=>{const d=v.roundPts?v.roundPts[p.id]:0;
  return `<div class="rk"><span style="font-size:20px">${esc(p.av)}</span><b>${esc(p.name)}${p.id===v.me?' (ti)':''}</b><small><span style="color:${d<0?'var(--g)':'#ff8f8f'};font-weight:800">${d>0?'+':''}${d}</span> · ukupno ${p.score}</small></div>`}).join('')+
  `<p class="muted">Pobjednik runde −40 (iz ruke −80). Ko se nije otvorio +100, ostali zbir karata u ruci (džoker 20). Najmanje bodova na kraju pobjeđuje.</p>`;
 $('#rmNextB').style.display=v.isHost?'':'none';$('#rmWaitP').style.display=v.isHost?'none':'';
 ovl('rmRound',true);if(w&&w.id===v.me){sfx.win()}
}
function rmTimer(){const v=App.rmv;if(!v||!onScreen('sRemi'))return;
 $$('#rmOps .uop').forEach(o=>{const t=o.querySelector('.tmr');const act=+o.dataset.i===v.turn&&v.phase!=='over';
  if(!act){t.style.strokeDashoffset='139';return}const rem=v.total?Math.max(0,v.remain-(Date.now()-v._recv)):v.total;t.style.strokeDashoffset=v.total?String(139*(1-rem/v.total)):'0'});
 const b=$('#rmTimeMe');if(rmMyTurn(v)&&v.total){const s=Math.ceil(Math.max(0,v.remain-(Date.now()-v._recv))/1000);b.textContent=s+'s';b.classList.toggle('low',s<=10)}else b.textContent=''}
function rmResetUI(){clearInterval(SK.rmI);SK.rmI=0;App.rmv=null;RMC.sel.clear();RMC.stage=[];RMC.order=null;ovl('rmRound',false)}
// events
let rmDrag=null;
$('#rmHand').addEventListener('click',e=>{const el=e.target.closest('.rc');const v=App.rmv;if(!el||!v||!v.hand)return;if(rmDrag&&rmDrag.moved)return;
 const id=+el.dataset.id;if(RMC.sel.has(id))RMC.sel.delete(id);else RMC.sel.add(id);noise(.03,.25,0,4000,1);rmRender(v,[],false)});
// premještanje karata u ruci (drži i povuci)
$('#rmHand').addEventListener('pointerdown',e=>{const el=e.target.closest('.rc');if(!el)return;rmDrag={id:+el.dataset.id,x:e.clientX,y:e.clientY,moved:false,el,t:setTimeout(()=>{if(rmDrag&&!rmDrag.moved){rmDrag.armed=true;el.classList.add('lift');vib(15)}},280)}});
addEventListener('pointermove',e=>{if(!rmDrag)return;const dx=e.clientX-rmDrag.x;if(!rmDrag.armed){if(Math.abs(dx)>8||Math.abs(e.clientY-rmDrag.y)>8)clearTimeout(rmDrag.t);return}
 rmDrag.moved=true;e.preventDefault();rmDrag.el.style.transform=`translate(${dx}px,-20px)`});
addEventListener('pointerup',e=>{if(!rmDrag)return;const d=rmDrag;clearTimeout(d.t);
 if(d.armed&&d.moved){const v=App.rmv;const hand=rmSortHand(v).map(c=>c.id);const els=[...$$('#rmHand .rc')];
  let to=els.findIndex(x=>{const r=x.getBoundingClientRect();return e.clientX<r.left+r.width/2&&x!==d.el});if(to<0)to=els.length;
  const vis=els.map(x=>+x.dataset.id).filter(id=>id!==d.id);const before=vis[to-(els.indexOf(d.el)<to?1:0)];
  const ord=hand.filter(id=>id!==d.id);let at=before==null?ord.length:ord.indexOf(before);if(at<0)at=ord.length;ord.splice(at,0,d.id);RMC.order=ord;
  setTimeout(()=>{rmDrag=null;rmRender(App.rmv,[],false)},0);return}
 if(d.el)d.el.classList.remove('lift');rmDrag=null});
addEventListener('pointercancel',()=>{if(rmDrag){clearTimeout(rmDrag.t);if(rmDrag.el)rmDrag.el.classList.remove('lift');rmDrag=null}});
$('#rmDeck').onclick=()=>{const v=App.rmv;if(v&&$('#rmDeck').classList.contains('can'))act('rm_draw',{src:'deck'})};
$('#rmDisc').onclick=()=>{const v=App.rmv;if(!v)return;
 if($('#rmDisc').classList.contains('can')){act('rm_draw',{src:'disc'});return}
 if(rmMyTurn(v)&&v.phase==='play'&&RMC.sel.size===1)rmDiscSel()};
function rmDiscSel(){const id=[...RMC.sel][0];RMC.sel.clear();act('rm_disc',{id})}
$('#rmDiscB').onclick=rmDiscSel;
$('#rmMeldB').onclick=()=>{const v=App.rmv;if(!v)return;const ids=[...RMC.sel];const m=new Map(v.hand.map(c=>[c.id,c]));const cs=ids.map(id=>m.get(id)).filter(Boolean);
 if(!rmCheck(cs)){toast('To nije ispravna kombinacija (grupa istog broja ili niz u boji, min. 3 karte)',2600);return}
 const me=v.players.find(p=>p.id===v.me);RMC.sel.clear();
 if(!me.opened){RMC.stage.push(ids);rmRender(v,[],false);return}
 act('rm_meld',{g:[ids]})};
$('#rmOpenB').onclick=()=>{const v=App.rmv;if(!v||!RMC.stage.length)return;act('rm_meld',{g:RMC.stage.map(g=>g.slice())});RMC.stage=[]};
$('#rmClrB').onclick=()=>{RMC.stage=[];if(App.rmv)rmRender(App.rmv,[],false)};
$('#rmStage').addEventListener('click',e=>{const g=e.target.closest('[data-g]');if(!g)return;RMC.stage.splice(+g.dataset.g,1);rmRender(App.rmv,[],false)});
$('#rmBackB').onclick=()=>act('rm_back');
$('#rmSortB').onclick=()=>{if(RMC.order){RMC.order=null;RMC.sort='s'}else RMC.sort=RMC.sort==='s'?'r':'s';if(App.rmv)rmRender(App.rmv,[],false)};
$('#rmTable').addEventListener('click',e=>{const m=e.target.closest('[data-m]');const v=App.rmv;if(!m||!v)return;
 if(!rmMyTurn(v)||v.phase!=='play'||!RMC.sel.size){toast(RMC.sel.size?'Nisi na potezu':'Označi karte u ruci pa dodirni kombinaciju da ih dodaš',1800);return}
 const ids=[...RMC.sel],t=v.table[+m.dataset.m];const hm=new Map(v.hand.map(c=>[c.id,c]));
 if(ids.length===1&&t.cards.some(rmJ)&&!rmJ(hm.get(ids[0]))){const c=hm.get(ids[0]);const j=t.cards.find(x=>rmJ(x)&&x.rep&&x.rep.r===c.r&&(x.rep.s===c.s||t.type==='set'));
  if(j){RMC.sel.clear();act('rm_swap',{m:+m.dataset.m,id:ids[0]});return}}
 RMC.sel.clear();act('rm_add',{m:+m.dataset.m,ids})});
$('#rmNextB').onclick=()=>{ovl('rmRound',false);act('rm_next')};
$('#rmOps').addEventListener('click',e=>{const o=e.target.closest('[data-pid]');if(o&&!o.dataset.pid.startsWith('bot:'))openProfile(o.dataset.pid)});
$('#rmHelp').onclick=()=>{$('#helpBody').innerHTML=rmHelp();ovl('help',true)};
function rmHelp(){const o=(App.rmv&&App.rmv.open)||51;return `<h4>🂡 Remi (domaći)</h4><p>2 špila + 4 džokera. Svako dobije 14 karata, prvi igrač 15 i odmah baca.</p><ul>
 <li><b>Potez:</b> vuci kartu iz špila <i>ili</i> uzmi gornju sa stola → spusti/dodaj karte → <b>baci jednu</b>.</li>
 <li><b>Kombinacije:</b> grupa (3–4 ista broja, različite boje) ili niz (3+ uzastopne iste boje). As ide A-2-3 ili Q-K-A.</li>
 <li><b>Otvaranje:</b> prvo spuštanje mora imati najmanje <b>${o} bodova</b> (2–9 koliko piše, 10/J/Q/K/A = 10, as u A-2-3 = 1, džoker vrijedi kartu koju mijenja).</li>
 <li>Ako uzmeš kartu sa stola prije otvaranja, <b>mora</b> ući u otvaranje (ili je vrati).</li>
 <li>Kad si otvoren: <b>dodaješ</b> karte na bilo koju kombinaciju na stolu i možeš <b>uzeti džokera</b> ako staviš pravu kartu umjesto njega.</li>
 <li>Rundu završava ko baci zadnju kartu. <b>Remi iz ruke</b> (sve odjednom bez ranijeg otvaranja) = duplo.</li>
 <li><b>Bodovi:</b> pobjednik runde −40, neotvoren +100, ostali zbir karata u ruci. Najmanje bodova nakon zadnje runde pobjeđuje.</li>
 <li><b>Kako se igra na telefonu:</b> dodirni karte da ih označiš → <i>Spusti</i>. Prije otvaranja kombinacije se skupljaju dok ne dođeš do ${o}, pa <i>Otvori se</i>. Drži i povuci kartu da je premjestiš u ruci.</li></ul>`}
