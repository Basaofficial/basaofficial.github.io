// #Bash igre – Ne ljuti se čovječe: logika igre
// ================= GAME LOGIC (pure) =================
const TRACK=[[0,4],[1,4],[2,4],[3,4],[4,4],[4,3],[4,2],[4,1],[4,0],[5,0],[6,0],[6,1],[6,2],[6,3],[6,4],[7,4],[8,4],[9,4],[10,4],[10,5],
 [10,6],[9,6],[8,6],[7,6],[6,6],[6,7],[6,8],[6,9],[6,10],[5,10],[4,10],[4,9],[4,8],[4,7],[4,6],[3,6],[2,6],[1,6],[0,6],[0,5]];
const START=[0,10,20,30];
const FINISH=[[[1,5],[2,5],[3,5],[4,5]],[[5,1],[5,2],[5,3],[5,4]],[[9,5],[8,5],[7,5],[6,5]],[[5,9],[5,8],[5,7],[5,6]]];
const HOME=[[[0,0],[1,0],[0,1],[1,1]],[[9,0],[10,0],[9,1],[10,1]],[[9,9],[10,9],[9,10],[10,10]],[[0,9],[1,9],[0,10],[1,10]]];
const SAFE=new Set([0,8,10,18,20,28,30,38]);
const COLORS=[
 {key:'red',name:'Crveni',hex:'#ff2d55',light:'#ff8aa0',dark:'#7a0019'},
 {key:'green',name:'Zeleni',hex:'#1fd65f',light:'#8dffb5',dark:'#06501f'},
 {key:'yellow',name:'Žuti',hex:'#ffd60a',light:'#fff3a6',dark:'#806800'},
 {key:'blue',name:'Plavi',hex:'#2f7bff',light:'#9cc2ff',dark:'#0a2f7a'}];
const MODES={
 '1v1':{label:'1 na 1 – po jedna boja',seats:[0,2],sides:{0:0,2:1},groups:[[0],[2]]},
 '1v1x2':{label:'1 na 1 – po dvije boje',seats:[0,1,2,3],sides:{0:0,2:0,1:1,3:1},groups:[[0,2],[1,3]],teams:true},
 '2v2':{label:'2 na 2 – timovi',seats:[0,1,2,3],sides:{0:0,2:0,1:1,3:1},groups:[[0],[1],[2],[3]],teams:true},
 'ffa3':{label:'Svako za sebe – 3 igrača',seats:[0,1,2],sides:{0:0,1:1,2:2},groups:[[0],[1],[2]]},
 'ffa4':{label:'Svako za sebe – 4 igrača',seats:[0,1,2,3],sides:{0:0,1:1,2:2,3:3},groups:[[0],[1],[2],[3]]}};
const DEFAULT_RULES={rerollOn6:true,threeTries:true,exitOn1:false,mustExit:true,clearStart:true,threeSixes:true,mustCapture:false,
 noJumpFinish:true,safeFields:false,blockades:false,bonusCapture:false,bonusFinish:false,teamNoCapture:true,autoSingle:true,playToEnd:false,stackOwn:false,turnTime:0};
const PRESETS={classic:{rerollOn6:true,threeTries:true,exitOn1:false,mustExit:true,clearStart:true,threeSixes:true,mustCapture:false,noJumpFinish:true,safeFields:false,blockades:false,bonusCapture:false,bonusFinish:false,stackOwn:false},
 king:{rerollOn6:true,threeTries:false,exitOn1:false,mustExit:false,clearStart:false,threeSixes:true,mustCapture:false,noJumpFinish:false,safeFields:true,blockades:false,bonusCapture:true,bonusFinish:true,stackOwn:true,turnTime:30}};
const RULES=[
 {k:'rerollOn6',t:'Šestica = bacaš ponovo',d:'Poslije šestice ponovo bacaš kockicu.'},
 {k:'threeTries',t:'3 pokušaja za izlazak',d:'Kad nemaš nijednu figuru na stazi, imaš 3 bacanja da dobiješ šesticu.'},
 {k:'exitOn1',t:'Izlazak i na jedinicu',d:'Figura izlazi iz kućice na 6 ili na 1.'},
 {k:'mustExit',t:'Obavezan izlazak',d:'Ako dobiješ broj za izlazak i imaš figuru u kućici, moraš je izvesti.'},
 {k:'clearStart',t:'Oslobodi startno polje',d:'Dok imaš figura u kućici, figura na tvom startu mora se prva pomjeriti.'},
 {k:'threeSixes',t:'3 šestice zaredom = gubiš red',d:'Ako baciš tri šestice zaredom, potez propada.'},
 {k:'mustCapture',t:'Obavezno izbacivanje',d:'Ako možeš nekoga izbaciti, moraš to uraditi.'},
 {k:'noJumpFinish',t:'Bez preskakanja u cilju',d:'U ciljnoj kućici ne možeš preskočiti svoje figure.'},
 {k:'safeFields',t:'Sigurna polja ⭐',d:'Na startnim poljima i zvjezdicama niko ne može biti izbačen.'},
 {k:'stackOwn',t:'Više svojih figura na polju',d:'Možeš stati na svoju figuru – figure stoje zajedno (kao u Ludo King).'},
 {k:'blockades',t:'Blokade (zid)',d:'Dvije tvoje figure na istom polju prave zid koji protivnik ne može preći.'},
 {k:'bonusCapture',t:'Bonus za izbacivanje',d:'Kad izbaciš protivnika, bacaš još jednom.'},
 {k:'bonusFinish',t:'Bonus za ulazak u cilj',d:'Kad figura uđe u cilj, bacaš još jednom.'},
 {k:'teamNoCapture',t:'Ne izbacuj suigrača',d:'U timskoj igri (i kod 2 boje) ne možeš stati na figuru svog tima.'},
 {k:'autoSingle',t:'Automatski potez',d:'Kad je moguć samo jedan potez, odigra se sam.'},
 {k:'playToEnd',t:'Igraj do kraja',d:'Kod 3–4 igrača igra se dok se ne odredi cijeli poredak.'}];

function rnd6(){try{const a=new Uint32Array(1);crypto.getRandomValues(a);return 1+(a[0]%6)}catch(e){return 1+Math.floor(Math.random()*6)}}
function addLog(st,t){st.log.unshift(t);if(st.log.length>40)st.log.pop()}
function cellOf(seat,rel,p){if(rel===-1)return HOME[seat][p];if(rel>=40)return FINISH[seat][rel-40];return TRACK[(START[seat]+rel)%40]}
function sideMap(st){const m={};MODES[st.mode].seats.forEach(i=>{const sd=st.seats[i].side;(m[sd]=m[sd]||[]).push(i)});return m}
function sideLabel(st,seats){return [...new Set(seats.map(i=>st.seats[i].name))].join(' & ')}

function mkState(cfg){
 const M=MODES[cfg.mode];
 const seats=[0,1,2,3].map(i=>({i,active:M.seats.includes(i),owner:cfg.seatCfg[i].owner,name:cfg.seatCfg[i].name||COLORS[i].name,
  av:cfg.seatCfg[i].av||'🙂',side:M.sides[i]!==undefined?M.sides[i]:-1,pieces:[-1,-1,-1,-1],fin:0,stats:{caps:0,lost:0,sixes:0,rolls:0}}));
 const st={v:0,mode:cfg.mode,rules:Object.assign({},DEFAULT_RULES,cfg.rules),seats,turn:M.seats[Math.floor(Math.random()*M.seats.length)],
  phase:'roll',die:0,rollId:0,tries:3,sixes:0,legal:[],lastMove:null,moveId:0,log:[],finCount:0,winner:null,sideOrder:[],ranking:null,
  started:Date.now()+Math.random(),msg:''};
 addLog(st,`🎲 Igra počinje! Prvi baca ${st.seats[st.turn].name}.`);
 return st;
}
function exitVal(st,d){return d===6||(st.rules.exitOn1&&d===1)}
function hasActive(s){return s.pieces.some(r=>r>=0&&r<40)}
function occAt(st,abs,exS,exP){const o=[];for(const s of st.seats){if(!s.active)continue;s.pieces.forEach((r,p)=>{
 if(r>=0&&r<40&&(START[s.i]+r)%40===abs&&!(s.i===exS&&p===exP))o.push({seat:s.i,p})})}return o}

function evalMove(st,seat,p,d){
 const R=st.rules,s=st.seats[seat],rel=s.pieces[p];let to;
 if(rel===-1){if(!exitVal(st,d))return null;to=0}else{to=rel+d;if(to>43)return null}
 const steps=[];if(rel===-1)steps.push(0);else for(let r=rel+1;r<=to;r++)steps.push(r);
 let cap=[];
 for(const r of steps){
  const last=r===to;
  if(r>=40){const own=s.pieces.some((x,j)=>j!==p&&x===r);if(own&&(last||R.noJumpFinish))return null;continue}
  const abs=(START[seat]+r)%40,occ=occAt(st,abs,seat,p);
  if(R.blockades){const c={};occ.forEach(o=>c[o.seat]=(c[o.seat]||0)+1);for(const k in c)if(+k!==seat&&c[k]>=2)return null}
  if(last){
   const own=occ.filter(o=>o.seat===seat);
   if(own.length&&!R.stackOwn&&(!R.blockades||own.length>=2))return null;
   const oth=occ.filter(o=>o.seat!==seat);
   if(oth.length){
    const safe=R.safeFields&&SAFE.has(abs);
    if(!safe){
     if(R.teamNoCapture&&oth.some(o=>st.seats[o.seat].side===s.side))return null;
     cap=oth;
    }
   }
  }
 }
 return {p,from:rel,to,cap};
}
function legalMoves(st,seat,d){
 const R=st.rules,s=st.seats[seat];let mv=[];
 s.pieces.forEach((r,p)=>{const m=evalMove(st,seat,p,d);if(m)mv.push(m)});
 if(R.mustExit&&exitVal(st,d)&&mv.some(m=>m.from===-1))mv=mv.filter(m=>m.from===-1);
 else if(R.clearStart&&s.pieces.includes(-1)){const a=mv.filter(m=>m.from===0);if(a.length)mv=a}
 if(R.mustCapture&&mv.some(m=>m.cap.length))mv=mv.filter(m=>m.cap.length);
 return mv;
}
function uniqMoves(mv){return new Set(mv.map(m=>m.from+'>'+m.to)).size}

function doRoll(st,seat,forced){
 if(st.phase!=='roll'||st.turn!==seat)return false;
 const d=forced||rnd6(),s=st.seats[seat];
 st.die=d;st.rollId++;s.stats.rolls++;st.msg='';
 if(d===6){s.stats.sixes++;st.sixes++}else st.sixes=0;
 if(d===6&&st.rules.threeSixes&&st.sixes>=3){addLog(st,`😬 ${s.name}: tri šestice zaredom – gubi red!`);st.msg='Tri šestice zaredom – potez propada!';st.phase='pause';return true}
 const mv=legalMoves(st,seat,d);
 if(!mv.length){
  const canTry=st.rules.threeTries&&!hasActive(s)&&s.pieces.includes(-1);
  if(canTry){st.tries--;if(st.tries>0){st.msg=`Nema šestice – još ${st.tries} ${st.tries===1?'pokušaj':'pokušaja'}`;return true}}
  else if(d===6&&st.rules.rerollOn6){st.msg='Nema poteza, ali bacaš ponovo';return true}
  st.msg=`${d} – nema mogućeg poteza`;st.phase='pause';return true;
 }
 st.legal=mv;st.phase='move';return true;
}
function doMove(st,seat,p){
 if(st.phase!=='move'||st.turn!==seat)return false;
 const m=st.legal.find(x=>x.p===p);if(!m)return false;
 const s=st.seats[seat],d=st.die;
 s.pieces[p]=m.to;
 for(const c of m.cap){st.seats[c.seat].pieces[c.p]=-1;st.seats[c.seat].stats.lost++;s.stats.caps++;addLog(st,`💥 ${s.name} izbacuje ${st.seats[c.seat].name}!`)}
 st.moveId++;st.lastMove={id:st.moveId,seat,p,from:m.from,to:m.to,caps:m.cap};st.legal=[];st.msg='';
 const entered=m.from<40&&m.to>=40;
 if(m.from===-1)addLog(st,`🚪 ${s.name} izvodi novu figuru.`);
 if(entered)addLog(st,`🏠 ${s.name} uvodi figuru u cilj!`);
 if(!s.fin&&s.pieces.every(r=>r>=40)){st.finCount++;s.fin=st.finCount;addLog(st,`🏆 ${s.name} je doveo sve figure u cilj!`)}
 if(checkWin(st))return true;
 const extra=!s.fin&&((d===6&&st.rules.rerollOn6)||(m.cap.length&&st.rules.bonusCapture)||(entered&&st.rules.bonusFinish));
 if(extra){st.phase='roll';st.tries=3;st.msg=d===6&&st.rules.rerollOn6?'Šestica – baci ponovo!':'Bonus bacanje! 🎁'}
 else nextTurn(st);
 return true;
}
function checkWin(st){
 const sides=sideMap(st);
 for(const sd in sides){if(!st.sideOrder.includes(+sd)&&sides[sd].every(i=>st.seats[i].fin)){
  st.sideOrder.push(+sd);if(st.winner===null)st.winner=+sd;
  const lb=sideLabel(st,sides[sd]),pl=sides[sd].length>1&&MODES[st.mode].groups.length>2;
  addLog(st,st.sideOrder.length===1?`🎉 ${lb} ${pl?'pobjeđuju':'pobjeđuje'}!`:`🏅 ${lb} – ${st.sideOrder.length}. mjesto`)}}
 if(st.winner!==null){const left=Object.keys(sides).length-st.sideOrder.length;
  if(!st.rules.playToEnd||left<=1){st.phase='over';st.ranking=computeRanking(st);return true}}
 return false;
}
function computeRanking(st){
 const sides=sideMap(st);
 const a=Object.keys(sides).map(sd=>{const seats=sides[sd],o=st.sideOrder.indexOf(+sd);
  const prog=seats.reduce((x,i)=>x+st.seats[i].pieces.reduce((y,r)=>y+r+1,0),0);
  const sum=k=>seats.reduce((x,i)=>x+st.seats[i].stats[k],0);
  return {side:+sd,seats,ord:o<0?99:o,prog,label:sideLabel(st,seats),caps:sum('caps'),lost:sum('lost'),sixes:sum('sixes')}});
 a.sort((x,y)=>x.ord-y.ord||y.prog-x.prog);a.forEach((r,i)=>r.place=i+1);return a;
}
function nextTurn(st){
 const S=MODES[st.mode].seats;let idx=S.indexOf(st.turn);
 for(let k=1;k<=S.length;k++){const n=S[(idx+k)%S.length];if(!st.seats[n].fin){st.turn=n;break}}
 st.phase='roll';st.sixes=0;st.tries=3;st.legal=[];
}
function danger(st,seat,rel){
 if(rel<0||rel>=40)return 0;const abs=(START[seat]+rel)%40;if(st.rules.safeFields&&SAFE.has(abs))return 0;
 let n=0;const me=st.seats[seat];
 for(const o of st.seats){if(!o.active||o.side===me.side)continue;
  o.pieces.forEach(r=>{if(r>=0&&r<40){const dist=(abs-(START[o.i]+r)%40+40)%40;if(dist>=1&&dist<=6&&r+dist<=39)n++}
   else if(r===-1&&abs===START[o.i])n+=.6})}
 return n;
}
function botPick(st,seat){
 const s=st.seats[seat];let best=st.legal[0],bs=-1e9;
 for(const m of st.legal){let sc=0;
  if(m.cap.length)sc+=100+m.cap.reduce((a,c)=>a+st.seats[c.seat].pieces[c.p],0)*.8;
  if(m.from===-1)sc+=60;
  if(m.to>=40&&m.from<40)sc+=55;
  if(m.to>=40)sc+=(m.to-40)*2;
  if(m.from===0&&s.pieces.includes(-1))sc+=12;
  sc+=danger(st,seat,m.from)*16-danger(st,seat,m.to)*24+m.to*.4+Math.random()*3;
  if(sc>bs){bs=sc;best=m}}
 return best.p;
}
