// BASH-STRIKE – simulacija igre (host je autoritativan): runde, ekonomija, oružja, C4, bombe, botovi
'use strict';
(function(G){
const D=G.BS_DATA,MP=G.BS_MAPS;
const {W,RULES:RL,U}=D,{PH,pmove,pHeight,pEye}=MP;
const DEG=Math.PI/180;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const r2=v=>Math.round(v*100)/100,r3=v=>Math.round(v*1000)/1000;
function dirOf(yaw,pitch){const cp=Math.cos(pitch);return [-Math.sin(yaw)*cp,Math.sin(pitch),-Math.cos(yaw)*cp]}
function angTo(dx,dy,dz){return [Math.atan2(-dx,-dz),Math.atan2(dy,Math.hypot(dx,dz))]}
function angDiff(a,b){let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}

// ---------- oružje: trzaj i nepreciznost (zajedničko za klijenta i hosta) ----------
function recoilAng(w,ri){const wd=W[w];if(!wd||!wd.rec)return [0,0];const v=wd.rec[0],h=wd.rec[1];const sg=(hashStr(w)&1)?1:-1;
 const p=v*(Math.min(ri,8)+Math.max(0,ri-8)*.22);const y=ri<5?h*.15*Math.sin(ri*1.7):sg*h*Math.sin((ri-5)*.38)*2.6;return [y*DEG,p*DEG]}
function inaccOf(p,wd){const ws=p.ws||{};const sp=Math.hypot(p.vx,p.vz),mx=(wd.spd||250)*U;
 let base;if(!p.onGround)base=wd.inacc[2];else{const st=p.duck>.5?wd.inacc[3]:wd.inacc[0];const mf=clamp((sp-mx*.34)/(mx*.66),0,1);base=st+(wd.inacc[1]-st)*mf}
 if(wd.cat==='sniper'){if(ws.zoom>0)base=wd.scopedInacc+(p.onGround?clamp(sp/mx,0,1)*wd.inacc[1]:wd.inacc[2])*.9;}
 else if(wd.scope&&ws.zoom>0)base*=.75;
 if(wd.auto&&wd.pel===1)base+=Math.min(ws.ri||0,12)*.0011;return base}
function curW(p){const s=p.cur;if(s===4){const n=p.inv[4];return n.length?n[(p.nsel||0)%n.length]:null}if(s===5)return p.inv[5]?'c4':null;if(s===6)return p.inv[6]?'zeus':null;const it=p.inv[s];return it?it.w:null}
function curItem(p){const s=p.cur;return (s===1||s===2||s===3)?p.inv[s]:null}
function maxSpd(p){const w=curW(p);const wd=W[w]||W.knife;let s=wd.spd;if(wd.scopedSpd&&p.ws&&p.ws.zoom>0)s=wd.scopedSpd;else if(wd.scope&&p.ws&&p.ws.zoom>0)s*=.75;return s*U}
function hasSlot(p,s){return s===4?p.inv[4].length>0:s===5?!!p.inv[5]:s===6?!!p.inv[6]:!!p.inv[s]}
function selectSlot(p,s,now){if(s===4&&p.cur===4&&p.inv[4].length>1){p.nsel=((p.nsel||0)+1)%p.inv[4].length}else if(s===3&&p.cur===3&&p.inv[6])s=6;else if(s===6&&!p.inv[6])s=3;
 if(!hasSlot(p,s))return false;if(s!==p.cur){p.prev=p.cur;p.cur=s;if(s===4)p.nsel=p.nsel||0}
 const ws=p.ws;ws.draw=now+((W[curW(p)]||{}).draw||.5);ws.rl=0;ws.zoom=0;ws.pin=0;ws.ri=0;return true}
function bestSlot(p){for(const s of [1,2,3])if(hasSlot(p,s))return s;return 3}
function newWS(){return {next:0,draw:0,rl:0,ri:0,pp:0,py:0,ah:0,a2h:0,zoom:0,pin:0,lob:0,lastShot:-9}}
// jedan korak oružja; out dobija akcije ('shot','knife','throw','rl','dry','zoom')
function wTick(p,inp,now,dt,out,ctx){
 const ws=p.ws;if(!p.alive)return;
 if(inp.sel)selectSlot(p,inp.sel,now);
 let w=curW(p);if(!w){selectSlot(p,bestSlot(p),now);w=curW(p);if(!w)return}
 const wd=W[w],it=curItem(p);
 // trzaj se oporavlja
 if(!(inp.atk&&wd.auto)||now>ws.next+.12)ws.ri=Math.max(0,ws.ri-dt*(wd.auto?9:4.5));
 const [ty,tp]=recoilAng(w,ws.ri);ws.py+=(ty-ws.py)*Math.min(1,dt*14);ws.pp+=(tp-ws.pp)*Math.min(1,dt*14);
 // reload
 if(it&&wd.mag>0){
  if(ws.rl&&now>=ws.rl){if(wd.pump){if(it.res>0&&it.clip<wd.mag){it.clip++;it.res--}ws.rl=(it.clip<wd.mag&&it.res>0&&!inp.atk)?now+wd.rel:0}
   else{const n=Math.min(wd.mag-it.clip,it.res);it.clip+=n;it.res-=n;ws.rl=0}}
  const want=inp.rl||(inp.atk&&!ws.ah&&it.clip===0);
  if(want&&!ws.rl&&it.clip<wd.mag&&it.res>0&&now>=ws.draw){ws.rl=now+(wd.pump?wd.rel+.3:wd.rel);ws.zoom=0;out.push({k:'rl'})}
  if(wd.pump&&ws.rl&&inp.atk&&it.clip>0&&!ws.ah)ws.rl=0;
 }
 // scope / sekundarni napad
 if(inp.atk2&&!ws.a2h){
  if(wd.scope&&!ws.rl){ws.zoom=(ws.zoom+1)%(wd.scope.length+1);out.push({k:'zoom',z:ws.zoom})}
  else if(wd.cat==='knife'&&now>=ws.next&&now>=ws.draw&&ctx.canFire){ws.next=now+wd.rof2;out.push({k:'knife',alt:1})}
 }
 if(wd.cat==='nade'){
  if((inp.atk||inp.atk2)&&now>=ws.draw&&now>=ws.next&&ctx.canFire){ws.pin=1;ws.lob=inp.atk2&&!inp.atk?1:inp.atk2&&inp.atk?.5:0}
  else if(ws.pin&&!inp.atk&&!inp.atk2){ws.pin=0;const [dx,dy,dz]=dirOf(p.yaw,p.pitch+(ws.lob?.05:.12));const sp=ws.lob===1?7:ws.lob?12:18.5;
   out.push({k:'throw',w,o:[r2(p.x),r2(pEye(p)),r2(p.z)],v:[r2(dx*sp+p.vx*.9),r2(dy*sp+p.vy*.5),r2(dz*sp+p.vz*.9)]});
   const n=p.inv[4],i=n.indexOf(w);if(i>=0)n.splice(i,1);ws.next=now+.5;
   if(!n.length){const s=p.prev&&hasSlot(p,p.prev)&&p.prev!==4?p.prev:bestSlot(p);selectSlot(p,s,now)}}
 } else if(inp.atk&&now>=ws.next&&now>=ws.draw&&ctx.canFire){
  if(wd.cat==='knife'){ws.next=now+wd.rof;out.push({k:'knife',alt:0})}
  else if(wd.cat==='zeus'){ws.next=now+1;const e=pEye(p),d=dirOf(p.yaw,p.pitch);out.push({k:'shot',w,o:[r2(p.x),r2(e),r2(p.z)],ds:[r3(d[0]),r3(d[1]),r3(d[2])],ri:0});p.inv[6]=false;ws.draw=now+.4;setTimeout0(()=>{if(p.cur===6)selectSlot(p,bestSlot(p),now)})}
  else if(it&&wd.mag>0&&(!ws.rl||wd.pump)){
   if(it.clip>0&&(wd.auto||!ws.ah)){
    if(ws.rl)ws.rl=0;it.clip--;ws.next=now+wd.rof;ws.lastShot=now;const ri=Math.floor(ws.ri);const [ry,rp]=recoilAng(w,ri);ws.ri+=1;
    const inacc=inaccOf(p,wd),rnd=ctx.rnd||Math.random,ds=[];const e=pEye(p);
    for(let k=0;k<wd.pel;k++){const r=(wd.pel>1?.045*Math.sqrt(rnd())+inacc*.5:inacc*Math.sqrt(rnd())),th=rnd()*Math.PI*2;
     const d=dirOf(p.yaw+ry+r*Math.cos(th),p.pitch+rp+r*Math.sin(th));ds.push(r3(d[0]),r3(d[1]),r3(d[2]))}
    out.push({k:'shot',w,o:[r2(p.x),r2(e),r2(p.z)],ds,ri});
    if(wd.cat==='sniper'&&ws.zoom>0){ws.zoom=0;ws.rezoom=now+wd.rof*.85;ws.rezoomLvl=1}
   } else if(it.clip===0&&!ws.ah&&it.res===0)out.push({k:'dry'});
  }
 }
 if(ws.rezoom&&now>=ws.rezoom){ws.rezoom=0;if(curW(p)===w&&W[w].cat==='sniper'&&!ws.rl)ws.zoom=ws.rezoomLvl||1}
 ws.ah=inp.atk?1:0;ws.a2h=inp.atk2?1:0;
}
let _later=[];function setTimeout0(f){_later.push(f)}function flushLater(){const l=_later;_later=[];l.forEach(f=>f())}

// ---------- pogoci (vertikalni cilindri + sfera glave) ----------
function rayCyl(ox,oy,oz,dx,dy,dz,cx,cz,r,y0,y1){const px=ox-cx,pz=oz-cz;const a=dx*dx+dz*dz;let best=-1;
 if(a>1e-9){const b=2*(dx*px+dz*pz),c=px*px+pz*pz-r*r,disc=b*b-4*a*c;if(disc>=0){const t=(-b-Math.sqrt(disc))/(2*a);if(t>0){const y=oy+dy*t;if(y>=y0&&y<=y1)best=t}}}
 if(best<0&&Math.abs(dy)>1e-6){for(const yy of [y1,y0]){const t=(yy-oy)/dy;if(t>0){const x=px+dx*t,z=pz+dz*t;if(x*x+z*z<=r*r&&(best<0||t<best))best=t}}}
 return best}
function raySph(ox,oy,oz,dx,dy,dz,cx,cy,cz,r){const px=ox-cx,py=oy-cy,pz=oz-cz;const b=px*dx+py*dy+pz*dz,c=px*px+py*py+pz*pz-r*r,disc=b*b-c;if(disc<0)return -1;const t=-b-Math.sqrt(disc);return t>0?t:-1}
function hitTest(o,d,maxT,x,y,z,duck){const h=PH.H-(PH.H-PH.HC)*duck;
 const th=raySph(o[0],o[1],o[2],d[0],d[1],d[2],x,y+h-.27,z,.21);
 const tb=rayCyl(o[0],o[1],o[2],d[0],d[1],d[2],x,z,.3,y,y+h-.46);
 let t=-1,hg='chest';
 if(th>0&&(tb<0||th<=tb+.05)){t=th;hg='head'}else if(tb>0){t=tb;const f=(o[1]+d[1]*tb-y)/(h-.46);hg=f<.47?'legs':f<.62?'stomach':'chest'}
 return t>0&&t<=maxT?{t,hg}:null}
function segSmoke(smokes,o,e){for(const s of smokes){if(s.t<1)continue;const r=s.r||3.3;const dx=e[0]-o[0],dy=e[1]-o[1],dz=e[2]-o[2],L=Math.hypot(dx,dy,dz)||1;
 const t=clamp(((s.x-o[0])*dx+(s.y-o[1])*dy+(s.z-o[2])*dz)/(L*L),0,1);const px=o[0]+dx*t-s.x,py=o[1]+dy*t-s.y,pz=o[2]+dz*t-s.z;if(px*px+py*py*1.6+pz*pz<r*r)return true}return false}

// ================= GAME (host) =================
const HG={head:4,chest:1,stomach:1.25,legs:.75};
class Game{
 constructor(o){
  this.mapId=o.map in MP.MAPS?o.map:'dina';this.M=MP.build(MP.MAPS[this.mapId]);this.diff=clamp(o.diff|0,0,2);
  this.t=0;this.players=[];this.nextIdx=1;this.ev=[];this.evId=1;this.nades=[];this.smokes=[];this.fires=[];this.drops=[];this.dropId=1;this.nadeId=1;
  this.mode='warmup';this.timer=o.warmup!=null?o.warmup:RL.warmup;this.round=0;this.tscore=[0,0];this.halves=[];this.loss=[0,0];this.swaps=0;
  this.bomb={st:'none'};this.hostId=o.hostId||'';this.rnd=Math.random;this.tPlan='A';this.dirty=1;this.roundStart=0;this.buyEnd=0;this.matchNo=1;
  this.fill=o.fill!==false;
 }
 // ---------- igrači ----------
 sideOfTeam(team){return (team===0)===(this.swaps%2===0)?'T':'CT'}
 teamOfSide(side){return this.sideOfTeam(0)===side?0:1}
 addPlayer(o){
  const p={id:o.id||('b'+this.nextIdx),idx:this.nextIdx++,n:String(o.n||'Igrač').slice(0,16),bot:!!o.bot,team:o.team|0,ag:o.ag|0,skins:o.skins||{},
   alive:false,hp:100,ar:0,helm:false,kit:false,money:RL.startMoney,x:0,y:0,z:0,vx:0,vy:0,vz:0,yaw:0,pitch:0,duck:0,onGround:true,
   inv:{1:null,2:null,3:{w:'knife',sk:0},4:[],5:false,6:false},cur:3,nsel:0,ws:newWS(),st:{k:0,d:0,a:0,hs:0,dmg:0,mvp:0,sc:0},sp:0,flash:0,
   hist:[],btn:0,planting:0,defusing:0,dmgBy:{},conn:true,lastIn:this.t,joinT:this.t,bought:[],lastBuy:[],rk:0};
  p.side=this.sideOfTeam(p.team);p.inv[3].sk=this.skinFor(p,'knife');
  this.players.push(p);
  if(this.mode==='warmup'||this.mode==='freeze'){this.spawn(p)}
  if(p.bot)p.ai=new Bot(this,p);
  this.dirty=1;return p}
 skinFor(p,w){const s=p.skins&&p.skins[w];return s&&D.SK[s[0]]?[s[0],+s[1]||0]:0}
 removePlayer(id){const i=this.players.findIndex(p=>p.id===id);if(i<0)return;const p=this.players[i];if(p.alive)this.dropAll(p);this.players.splice(i,1);this.dirty=1;this.checkEnd()}
 byIdx(i){return this.players.find(p=>p.idx===i)}
 byId(id){return this.players.find(p=>p.id===id)}
 humans(){return this.players.filter(p=>!p.bot)}
 // popuni do 5v5 botovima
 balance(){
  const cnt=[0,0];this.players.forEach(p=>cnt[p.team]++);
  if(!this.fill)return;
  const used=new Set(this.players.map(p=>p.n));
  for(let t=0;t<2;t++){
   while(cnt[t]>5){const b=this.players.filter(p=>p.bot&&p.team===t).sort((a,b)=>a.alive-b.alive)[0];if(!b)break;this.removePlayer(b.id);cnt[t]--}
   while(cnt[t]<5){let nm;const pool=D.BOT_NAMES.filter(n=>!used.has('BOT '+n));nm='BOT '+(pool.length?pool[Math.floor(this.rnd()*pool.length)]:('Bot'+this.nextIdx));used.add(nm);
    const ag=Math.floor(this.rnd()*5);this.addPlayer({bot:true,n:nm,team:t,ag});cnt[t]++}
  }}
 // novi čovjek ulazi: zamijeni bota u timu s manje ljudi
 join(o){let p=this.byId(o.id);if(p){p.conn=true;p.lastIn=this.t;if(p.bot&&p.wasHuman){p.bot=false;p.ai=null;p.n=p.wasHuman;p.wasHuman=null}if(o.skins)p.skins=o.skins;this.dirty=1;return p}
  const hum=[0,0];this.humans().forEach(q=>hum[q.team]++);if(hum[0]+hum[1]>=10)return null;
  let team=o.team!=null&&o.team>=0?o.team:(hum[0]<=hum[1]?0:1);if(hum[team]>=5)team=1-team;
  const bot=this.players.filter(q=>q.bot&&q.team===team).sort((a,b)=>a.alive-b.alive)[0];
  if(bot){ // preuzmi mjesto bota (ali ne njegovo oružje usred runde)
   this.removePlayer(bot.id)}
  p=this.addPlayer({id:o.id,n:o.n,team,ag:o.ag|0,skins:o.skins||{}});
  if(this.mode!=='warmup'&&this.mode!=='freeze'){p.alive=false;p.money=this.avgMoney(team)}
  this.balance();this.dirty=1;return p}
 avgMoney(team){const l=this.players.filter(p=>p.team===team);return l.length?Math.round(l.reduce((s,p)=>s+p.money,0)/l.length/50)*50:RL.startMoney}
 leave(id){const p=this.byId(id);if(!p||p.bot)return;p.wasHuman=p.n;p.bot=true;p.n='BOT '+p.n.replace(/^BOT /,'');p.ai=new Bot(this,p);p.conn=false;this.dirty=1}
 // ---------- spawn i oprema ----------
 spawn(p){const side=p.side;const mates=this.players.filter(q=>q.side===side);const i=mates.indexOf(p);const s=this.M.spawnPos(side,i<0?0:i);
  p.x=s[0];p.y=s[1];p.z=s[2];p.vx=p.vy=p.vz=0;p.duck=0;p.onGround=true;const c=this.M.spawnCenter(side==='T'?'CT':'T');
  p.yaw=Math.atan2(-(c[0]-p.x),-(c[1]-p.z));p.pitch=0;p.alive=true;p.hp=100;p.flash=0;p.planting=0;p.defusing=0;p.dmgBy={};p.sp++;p.ws=newWS();p.hist.length=0;
  if(!p.inv[2]&&!p.inv[1])p.inv[2]={w:side==='T'?'glock':(p.skins&&p.skins.p2000&&!p.skins.usps?'p2000':'usps'),clip:0,res:0,sk:0};
  if(p.inv[2]&&!p.inv[2].clip&&!p.inv[2].res){const wd=W[p.inv[2].w];p.inv[2].clip=wd.mag;p.inv[2].res=wd.res;p.inv[2].sk=this.skinFor(p,p.inv[2].w)}
  // pun municija za preživjele
  for(const s of [1,2]){const it=p.inv[s];if(it){const wd=W[it.w];it.res=wd.res;if(this.mode==='warmup')it.clip=wd.mag}}
  p.cur=p.inv[1]?1:2;p.inv[3].sk=this.skinFor(p,'knife');this.dirty=1}
 stripTeamItems(p){if(p.side==='T'){p.kit=false}else{p.inv[5]=false}
  for(const s of [1,2]){const it=p.inv[s];if(it&&W[it.w].team&&W[it.w].team!==p.side)p.inv[s]=null}
  p.inv[4]=p.inv[4].filter(n=>!W[n].team||W[n].team===p.side)}
 resetInv(p){p.inv={1:null,2:null,3:{w:'knife',sk:this.skinFor(p,'knife')},4:[],5:false,6:false};p.ar=0;p.helm=false;p.kit=false}
 // ---------- tok meča ----------
 startMatch(){this.mode='freeze';this.round=1;this.tscore=[0,0];this.halves=[];this.loss=[0,0];this.swaps=0;this.ev.length=0;
  this.players.forEach(p=>{p.side=this.sideOfTeam(p.team);p.money=RL.startMoney;p.st={k:0,d:0,a:0,hs:0,dmg:0,mvp:0,sc:0};this.resetInv(p);p.lastBuy=[]});
  this.emit({ty:'msg',txt:'Meč počinje! Sretno.'});this.startRound()}
 startRound(){this.mode='freeze';this.timer=RL.freeze;this.nades.length=0;this.fires.length=0;this.smokes.length=0;this.drops.length=0;this.bomb={st:'none'};
  this.roundStart=this.t;this.buyEnd=this.t+RL.freeze+RL.buyTime;this.roundKills={};
  this.players.forEach(p=>{p.lastBuy=p.bought.length?p.bought.map(b=>b.i):p.lastBuy;p.bought=[];if(!p.alive)this.resetInvDead(p);this.stripTeamItems(p);this.spawn(p);p.rk=0});
  // C4 slučajnom T igraču (prednost ljudima nema – kao u CS-u)
  const ts=this.players.filter(p=>p.side==='T');if(ts.length&&this.mode!=='warmup'){const c=ts[Math.floor(this.rnd()*ts.length)];c.inv[5]=true;this.bomb={st:'carried',c:c.idx}}
  this.tPlan=this.rnd()<.5?'A':'B';this.players.forEach(p=>{if(p.ai)p.ai.newRound()});this.dirty=1;this.emit({ty:'rs',r:this.round})}
 resetInvDead(p){const kn=p.inv[3];this.resetInv(p);p.inv[3]=kn}
 endRound(win,why){if(this.mode!=='live'&&this.mode!=='freeze')return;this.mode='end';this.timer=RL.endDelay;const wt=this.teamOfSide(win);this.tscore[wt]++;
  const lose=win==='T'?'CT':'T',lt=1-wt;
  // ekonomija
  const winAmt=why==='bomb'?RL.winBomb:why==='defuse'?RL.winDefuse:why==='time'?RL.winTime:RL.winElim;
  this.loss[wt]=Math.max(0,this.loss[wt]-1);const lb=Math.min(RL.lossMax,RL.lossBase+RL.lossStep*this.loss[lt]);this.loss[lt]=Math.min(4,this.loss[lt]+1);
  const planted=this.bomb.st==='planted'||this.bomb.st==='exploded'||this.bomb.st==='defused';
  this.players.forEach(p=>{if(p.side===win)this.pay(p,winAmt);else{if(why==='time'&&p.side==='T'&&p.alive)return;this.pay(p,lb+(p.side==='T'&&planted?RL.plantLoss:0))}});
  // MVP
  let mvp=null;const wins=this.players.filter(p=>p.side===win);
  if(why==='bomb'&&this.bomb.planter)mvp=this.byIdx(this.bomb.planter);else if(why==='defuse'&&this.bomb.def)mvp=this.byIdx(this.bomb.def);
  if(!mvp)mvp=wins.sort((a,b)=>(b.rk||0)-(a.rk||0))[0];if(mvp){mvp.st.mvp++;mvp.st.sc+=2}
  this.lastWin={win,why,mvp:mvp?mvp.idx:0};
  this.emit({ty:'round',win,why,mvp:mvp?mvp.idx:0,sc:this.scoreBySide()});this.dirty=1}
 pay(p,a){p.money=clamp(p.money+a,0,RL.maxMoney)}
 scoreBySide(){return {T:this.tscore[this.teamOfSide('T')],CT:this.tscore[this.teamOfSide('CT')]}}
 nextRound(){
  const played=this.tscore[0]+this.tscore[1];const a=this.tscore[0],b=this.tscore[1];
  // kraj meča?
  let over=false;if(played<=24){if(a>=RL.winRounds||b>=RL.winRounds)over=true}
  else{const ot=Math.floor((played-24-1)/6),tgt=16+3*ot;if(a>=tgt||b>=tgt)over=true}
  if(over){this.mode='over';this.timer=14;const wt=a>b?0:1;this.emit({ty:'over',wt,ts:[a,b]});this.dirty=1;return}
  this.round=played+1;
  // poluvrijeme / produžeci
  let half=false,money=null;
  if(played===RL.halfRounds){half=true;money=RL.startMoney}
  else if(played>=24&&(played-24)%RL.otHalf===0){half=(played-24)%6===3;if((played-24)%6===0||half)money=RL.otMoney}
  if(half){this.halves.push([a,b]);this.swaps++;this.loss=[0,0];this.players.forEach(p=>{p.side=this.sideOfTeam(p.team);this.resetInv(p);p.alive=false;p.lastBuy=[];p.bought=[]});
   this.emit({ty:'msg',txt:'Poluvrijeme – timovi mijenjaju strane!'})}
  if(money!=null)this.players.forEach(p=>{p.money=money;if(!half){this.resetInv(p);p.alive=false}});
  this.startRound()}
 restartMatch(){this.matchNo++;this.mode='warmup';this.timer=30;this.round=0;this.tscore=[0,0];this.halves=[];this.swaps=0;this.loss=[0,0];this.bomb={st:'none'};
  this.players.forEach(p=>{p.side=this.sideOfTeam(p.team);p.money=16000;this.resetInv(p);p.st={k:0,d:0,a:0,hs:0,dmg:0,mvp:0,sc:0};this.spawn(p)});this.emit({ty:'msg',txt:'Novi meč – zagrijavanje!'});this.dirty=1}
 switchTeam(p){if(this.mode==='over')return;const nt=1-p.team;if(this.humans().filter(q=>q.team===nt).length>=5)return;
  if(p.alive&&this.mode!=='warmup'){this.dropAll(p);p.alive=false;p.st.d++}
  p.team=nt;p.side=this.sideOfTeam(nt);this.resetInv(p);p.money=this.avgMoney(nt);if(this.mode==='warmup'||this.mode==='freeze')this.spawn(p);this.balance();this.emit({ty:'msg',txt:p.n+' prelazi u '+(p.side==='T'?'Teroriste':'Anti-teroriste')});this.dirty=1;this.checkEnd()}
 changeMap(id){if(!(id in MP.MAPS))return;this.mapId=id;this.M=MP.build(MP.MAPS[id]);this.nades.length=0;this.smokes.length=0;this.fires.length=0;this.drops.length=0;this.restartMatch();this.emit({ty:'map',map:id})}
 checkEnd(){if(this.mode!=='live')return;const aT=this.players.filter(p=>p.side==='T'&&p.alive).length,aC=this.players.filter(p=>p.side==='CT'&&p.alive).length;
  const hasT=this.players.some(p=>p.side==='T'),hasC=this.players.some(p=>p.side==='CT');
  if(hasC&&aC===0)this.endRound('T',this.bomb.st==='planted'?'elim':'elim');
  else if(hasT&&aT===0&&this.bomb.st!=='planted')this.endRound('CT','elim')}
 canBuy(p){if(!p.alive)return false;if(this.mode==='warmup')return true;if(this.mode!=='freeze'&&this.mode!=='live')return false;if(this.t>this.buyEnd)return false;
  const c=this.M.spawnCenter(p.side);return Math.hypot(p.x-c[0],p.z-c[1])<16}
 buy(p,i){if(!this.canBuy(p))return false;const E=D.EQUIP[i],wd=W[i];let price=E?E.price:wd?wd.price:null;if(price==null)return false;
  const team=E?E.team:wd.team;if(team&&team!==p.side)return false;
  if(i==='vesthelm'&&p.ar>=100&&!p.helm)price=350;
  if(p.money<price)return false;
  if(i==='vest'){if(p.ar>=100)return false;p.ar=100}
  else if(i==='vesthelm'){if(p.ar>=100&&p.helm)return false;p.ar=100;p.helm=true}
  else if(i==='defuser'){if(p.kit)return false;p.kit=true}
  else if(wd.slot===4){const n=p.inv[4];if(n.length>=RL.maxNades||n.filter(x=>x===i).length>=(wd.max||1))return false;if((i==='molotov'||i==='incgrenade')&&n.some(x=>x==='molotov'||x==='incgrenade'))return false;n.push(i)}
  else if(i==='zeus'){if(p.inv[6])return false;p.inv[6]=true}
  else{const s=wd.slot;const old=p.inv[s];if(old&&old.w===i)return false;if(old)this.dropItem(p,s,true);p.inv[s]={w:i,clip:wd.mag,res:wd.res,sk:this.skinFor(p,i)};p.cur=s;p.ws.draw=this.t+wd.draw;p.ws.zoom=0;p.ws.rl=0}
  p.money-=price;p.bought.push({i,price,t:this.t});this.dirty=1;return true}
 refund(p){if(!this.canBuy(p))return;for(let k=p.bought.length-1;k>=0;k--){const b=p.bought[k];const wd=W[b.i];let ok=false;
   if(b.i==='vest'||b.i==='vesthelm'){if(p.ar>=100){p.ar=0;p.helm=false;ok=true}}
   else if(b.i==='defuser'){if(p.kit){p.kit=false;ok=true}}
   else if(b.i==='zeus'){if(p.inv[6]){p.inv[6]=false;ok=true}}
   else if(wd&&wd.slot===4){const j=p.inv[4].lastIndexOf(b.i);if(j>=0){p.inv[4].splice(j,1);ok=true}}
   else if(wd){const it=p.inv[wd.slot];if(it&&it.w===b.i&&it.clip===wd.mag){p.inv[wd.slot]=null;ok=true;if(p.cur===wd.slot)p.cur=bestSlot(p)}}
   p.bought.splice(k,1);if(ok){p.money=Math.min(RL.maxMoney,p.money+b.price);this.dirty=1;return}}}
 autobuy(p){const s=p.side;const pref=s==='T'?['ak47','galil','mac10']:['m4a1s','m4a4','famas','mp9'];
  if(p.money>=2700+1000||!p.inv[1]){for(const w of pref)if(!p.inv[1]&&this.buy(p,w))break}
  if(p.ar<100||!p.helm)this.buy(p,'vesthelm')||this.buy(p,'vest');
  if(s==='CT')this.buy(p,'defuser');['smoke','flash','he'].forEach(n=>this.buy(p,n))}
 // ---------- bacanje / dropovi ----------
 dropItem(p,s,silent){let it=null;
  if(s===5){if(!p.inv[5])return;p.inv[5]=false;this.bomb={st:'dropped',x:p.x,y:p.y+.05,z:p.z};this.dirty=1;if(p.cur===5)p.cur=bestSlot(p);return}
  if(s===1||s===2){it=p.inv[s];if(!it)return;p.inv[s]=null}
  else if(s===4){const n=p.inv[4];if(!n.length)return;const w=n.splice((p.nsel||0)%n.length,1)[0];it={w,clip:0,res:0,sk:0}}
  else return;
  const [dx,,dz]=dirOf(p.yaw,0);const f=silent?.2:1.2;let x=p.x+dx*f,z=p.z+dz*f;const tr=this.M.raycast(p.x,p.y+1,p.z,dx,0,dz,f+.4);if(tr){x=p.x+dx*Math.max(0,tr.t-.4);z=p.z+dz*Math.max(0,tr.t-.4)}
  this.drops.push({id:this.dropId++,w:it.w,clip:it.clip,res:it.res,sk:it.sk||0,x:r2(x),y:r2(this.M.groundAt(x,z)),z:r2(z),t:this.t,by:p.idx});
  if(this.drops.length>40)this.drops.shift();
  if(p.cur===s&&!hasSlot(p,s))p.cur=bestSlot(p);this.dirty=1}
 dropAll(p){if(p.inv[1])this.dropItem(p,1,true);else if(p.inv[2])this.dropItem(p,2,true);if(p.inv[5])this.dropItem(p,5,true);
  if(p.kit){p.kit=false}}
 pickups(p){if(!p.alive)return;
  for(let i=this.drops.length-1;i>=0;i--){const d=this.drops[i];if(Math.abs(d.x-p.x)>1.1||Math.abs(d.z-p.z)>1.1||Math.abs(d.y-p.y)>1.2)continue;if(d.by===p.idx&&this.t-d.t<1.2)continue;
   const wd=W[d.w];if(wd.slot===4){if(p.inv[4].length<RL.maxNades&&!p.inv[4].includes(d.w)&&(!wd.team||wd.team===p.side)){p.inv[4].push(d.w);this.drops.splice(i,1);this.dirty=1}continue}
   if(!p.inv[wd.slot]){p.inv[wd.slot]={w:d.w,clip:d.clip,res:d.res,sk:d.sk};this.drops.splice(i,1);this.dirty=1;this.emit({ty:'pick',p:p.idx,w:d.w})}}
  if(this.bomb.st==='dropped'&&p.side==='T'&&Math.abs(this.bomb.x-p.x)<1.2&&Math.abs(this.bomb.z-p.z)<1.2&&Math.abs(this.bomb.y-p.y)<1.5){p.inv[5]=true;this.bomb={st:'carried',c:p.idx};this.dirty=1;this.emit({ty:'pick',p:p.idx,w:'c4'})}}
 useSwap(p){// E na oružje ispred: zamijeni
  let best=null,bd=2.2;const [dx,,dz]=dirOf(p.yaw,0);
  for(const d of this.drops){const ex=d.x-p.x,ez=d.z-p.z,dist=Math.hypot(ex,ez);if(dist<bd&&(ex*dx+ez*dz)/(dist||1)>.3&&Math.abs(d.y-p.y)<1.5){bd=dist;best=d}}
  if(!best)return;const wd=W[best.w];if(wd.slot===4)return;if(p.inv[wd.slot])this.dropItem(p,wd.slot,true);
  p.inv[wd.slot]={w:best.w,clip:best.clip,res:best.res,sk:best.sk};this.drops.splice(this.drops.indexOf(best),1);p.cur=wd.slot;p.ws.draw=this.t+wd.draw;this.dirty=1}
 // ---------- šteta ----------
 damage(v,a,dmg,w,hg,opt){if(!v.alive||this.mode==='end'&&false)return;opt=opt||{};
  let hp=dmg;const wd=W[w]||{};
  if(v.ar>0&&!opt.noArmor&&(hg!=='legs')&&(hg!=='head'||v.helm)){const ap=opt.ap!=null?opt.ap:(wd.ap||.5);hp=dmg*ap;let ad=(dmg-hp)*.5;if(ad>v.ar){hp=dmg-v.ar*2;ad=v.ar}v.ar=Math.max(0,Math.round(v.ar-ad))}
  hp=Math.max(1,Math.round(hp));const real=Math.min(hp,v.hp);v.hp-=hp;
  if(a&&a!==v){if(a.side!==v.side){a.st.dmg+=real;v.dmgBy[a.idx]=(v.dmgBy[a.idx]||0)+real}}
  this.emit({ty:'hit',v:v.idx,a:a?a.idx:0,d:real,hg,x:r2(opt.from?opt.from[0]:0),z:r2(opt.from?opt.from[2]:0)});
  if(v.ai&&a)v.ai.hurt(a);
  if(v.hp<=0){v.hp=0;this.kill(v,a,w,hg==='head',opt)}this.dirty=1}
 kill(v,a,w,hs,opt){v.alive=false;v.planting=0;v.defusing=0;v.st.d++;if(this.mode==='live'||this.mode==='freeze')v.st.sc+=0;
  this.dropAll(v);v.inv[4]=[];v.inv[6]=false;v.ar=0;v.helm=false;v.inv[1]=null;v.inv[2]=null;
  let as=0;if(a&&a!==v&&a.side!==v.side){a.st.k++;a.st.sc+=2;a.rk=(a.rk||0)+1;if(hs)a.st.hs++;if(this.mode!=='warmup')this.pay(a,(W[w]&&W[w].rew!=null)?W[w].rew:300)}
  else if(a&&a===v){}
  let best=0;for(const k in v.dmgBy){const q=this.byIdx(+k);if(q&&q!==a&&v.dmgBy[k]>=41&&v.dmgBy[k]>best){best=v.dmgBy[k];as=q.idx}}
  if(as){const q=this.byIdx(as);q.st.a++;q.st.sc+=1}
  this.emit({ty:'kill',k:a?a.idx:0,v:v.idx,a:as,w,hs:hs?1:0,wb:opt&&opt.wb?1:0,fl:a&&a.flash>1?1:0});
  if(this.bomb.def===v.idx)this.bomb.def=0;
  if(this.mode==='warmup')v.respawnAt=this.t+2.5;
  this.dirty=1;this.checkEnd()}
 // ---------- obrada akcija (pucanj itd.) ----------
 action(p,a,local){if(!p||!a)return;const now=this.t;
  switch(a.k){
   case 'shot':{if(!p.alive||this.mode==='end'&&false)return;const wd=W[a.w];if(!wd)return;
    if(!local){const ok=a.w==='zeus'?true:[1,2].some(s=>p.inv[s]&&p.inv[s].w===a.w);if(!ok)return;if(now-(p.lastHostShot||0)<wd.rof*.55&&a.w!=='zeus')return;p.lastHostShot=now;
     if(a.w==='zeus'){if(!p.inv[6]&&!p.zeusPending)return;p.inv[6]=false}}
    let o=a.o;const e=pEye(p);if(!o||Math.hypot(o[0]-p.x,o[1]-e,o[2]-p.z)>2.5)o=[p.x,e,p.z];
    const lt=clamp(a.lt!=null?a.lt:now,now-.35,now);this.fire(p,wd,o,a.ds||[],lt);break}
   case 'knife':if(p.alive)this.knife(p,a.alt,a.lt);break;
   case 'throw':{if(!p.alive)return;const W2=W[a.w];if(!W2||W2.slot!==4)return;if(!local){const i=p.inv[4].indexOf(a.w);if(i<0)return;p.inv[4].splice(i,1)}
    const o=a.o||[p.x,pEye(p),p.z],v=a.v||[0,0,0];const sp=Math.hypot(...v);const k=sp>25?25/sp:1;
    this.nades.push({id:this.nadeId++,w:a.w,o:p.idx,x:o[0],y:o[1],z:o[2],vx:v[0]*k,vy:v[1]*k,vz:v[2]*k,t:0,still:0,side:p.side});
    this.emit({ty:'throw',p:p.idx,w:a.w});if(p.bot||a.radio!==false)this.radio(p,a.w);this.dirty=1;break}
   case 'sel':if(a.s>=1&&a.s<=6&&hasSlot(p,a.s)){p.cur=a.s;if(a.n!=null)p.nsel=a.n|0}break;
   case 'buy':this.buy(p,String(a.i));break;
   case 'rebuy':if(Array.isArray(a.l))a.l.slice(0,12).forEach(i=>this.buy(p,String(i)));else (p.lastBuy||[]).forEach(i=>this.buy(p,i));break;
   case 'auto':this.autobuy(p);break;
   case 'refund':this.refund(p);break;
   case 'drop':if(p.alive)this.dropItem(p,a.s||p.cur);break;
   case 'use':if(p.alive)this.useSwap(p);break;
   case 'zoom':p.ws.zoom=a.z|0;break;
   case 'team':this.switchTeam(p);break;
   case 'radio':if(D.RADIO[a.m]&&now-(p.lastRadio||0)>1.2){p.lastRadio=now;this.radio(p,a.m)}break;
  }}
 radio(p,m){const txt=D.RADIO[m]||m;this.emit({ty:'radio',p:p.idx,m:txt,zn:this.M.zoneName(p.x,p.z)})}
 posAt(q,lt){const h=q.hist;if(!h.length||lt>=this.t-.001)return [q.x,q.y,q.z,q.duck];
  for(let i=h.length-1;i>0;i--){const b=h[i],a=h[i-1];if(a[0]<=lt){const f=(lt-a[0])/((b[0]-a[0])||1);return [a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f,a[3]+(b[3]-a[3])*f,a[4]]}}
  const a=h[0];return [a[1],a[2],a[3],a[4]]}
 fire(p,wd,o,ds,lt){const M=this.M,ends=[];const acc={};const range=wd.range||200;
  for(let i=0;i+2<ds.length&&i<30;i+=3){let d=[ds[i],ds[i+1],ds[i+2]];const L=Math.hypot(...d)||1;d=[d[0]/L,d[1]/L,d[2]/L];
   const wh=M.raycast(o[0],o[1],o[2],d[0],d[1],d[2],range);let maxT=wh?wh.t:range,hit=null,hv=null;
   for(const q of this.players){if(q===p||!q.alive||q.side===p.side)continue;const [x,y,z,du]=this.posAt(q,lt);
    if(Math.abs(x-o[0])>maxT+1&&Math.abs(z-o[2])>maxT+1)continue;const h=hitTest(o,d,maxT,x,y,z,du);if(h&&(!hit||h.t<hit.t)){hit=h;hv=q}}
   const t=hit?hit.t:maxT;ends.push(r2(o[0]+d[0]*t),r2(o[1]+d[1]*t),r2(o[2]+d[2]*t),hit?1:(wh?(wh.k==='ground'?2:3):0));
   if(hit){const dist=hit.t;let dmg=wd.dmg*Math.pow(wd.rm||1,dist/(500*U))*HG[hit.hg];if(wd.cat==='zeus')dmg=dist<=wd.range?500:0;
    if(dmg>0){const k=hv.idx;if(!acc[k])acc[k]={q:hv,d:0,hg:hit.hg};acc[k].d+=dmg;if(hit.hg==='head')acc[k].hg='head'}}}
  this.emit({ty:'shot',p:p.idx,w:wd.id,o:[r2(o[0]),r2(o[1]),r2(o[2])],e:ends});
  for(const k in acc){const a=acc[k];this.damage(a.q,p,a.d,wd.id,a.hg,{from:o})}
  if(p.ai)p.ai.fired=this.t;this.noise(p,wd.sil?8:40)}
 knife(p,alt,lt){const e=pEye(p),d=dirOf(p.yaw,p.pitch);let best=null,bq=null;
  for(const q of this.players){if(q===p||!q.alive||q.side===p.side)continue;const [x,y,z,du]=this.posAt(q,lt!=null?clamp(lt,this.t-.3,this.t):this.t);
   let h=hitTest([p.x,e,p.z],d,2.0,x,y,z,du);if(!h){const dx=x-p.x,dz=z-p.z,dist=Math.hypot(dx,dz);if(dist<1.5&&(dx*d[0]+dz*d[2])/(dist||1)>.7)h={t:dist,hg:'chest'}}
   if(h&&(!best||h.t<best.t)){best=h;bq=q}}
  if(!bq){this.emit({ty:'knife',p:p.idx,hit:0});return}
  const [fx,,fz]=dirOf(bq.yaw,0),[ax,,az]=dirOf(p.yaw,0);const back=fx*ax+fz*az>.5;
  const dmg=alt?(back?180:65):(back?90:(p.ws.ri>0?25:40));p.ws.ri=1;
  this.emit({ty:'knife',p:p.idx,hit:1});this.damage(bq,p,dmg,'knife',best.hg==='head'?'head':'chest',{ap:.85,from:[p.x,e,p.z]})}
 noise(p,r){for(const q of this.players)if(q.ai&&q.alive&&q.side!==p.side){const d=Math.hypot(q.x-p.x,q.z-p.z);if(d<r)q.ai.heard(p)}}
 // ---------- ulaz od klijenta ----------
 input(id,pk){const p=this.byId(id);if(!p||p.bot)return;p.lastIn=this.t;p.conn=true;p.ping=pk.pg|0;
  if(Array.isArray(pk.a)){p.yaw=+pk.a[0]||0;p.pitch=clamp(+pk.a[1]||0,-1.55,1.55)}
  p.btn=pk.b|0;
  if(pk.c!=null&&pk.c>=1&&pk.c<=6&&hasSlot(p,pk.c)){p.cur=pk.c;if(pk.n!=null)p.nsel=pk.n|0}
  if(pk.z!=null)p.ws.zoom=pk.z|0;
  if(p.alive&&Array.isArray(pk.p)&&pk.sp===p.sp){const [x,y,z]=pk.p;const dt=Math.max(.05,this.t-(p.lastPosT||this.t-.05));
   const dist=Math.hypot(x-p.x,z-p.z);const frozen=this.mode==='freeze';
   if(!isFinite(x+y+z)||dist>dt*14+1.5||(frozen&&dist>.6)){p.sp++;this.dirty=1}
   else{p.x=x;p.y=y;p.z=z;if(Array.isArray(pk.v)){p.vx=+pk.v[0]||0;p.vy=+pk.v[1]||0;p.vz=+pk.v[2]||0}p.duck=clamp(+pk.d||0,0,1);p.onGround=!!pk.g}
   p.lastPosT=this.t}
  // municija: dozvoli samo smanjenje ukupne količine
  if(Array.isArray(pk.am)){for(const [w,c,r] of pk.am){for(const s of [1,2]){const it=p.inv[s];if(it&&it.w===w){const wd=W[w];const tot=it.clip+it.res;const c2=clamp(c|0,0,wd.mag),r2_=clamp(r|0,0,wd.res+wd.mag);if(c2+r2_<=tot){it.clip=c2;it.res=r2_}}}}}
  if(Array.isArray(pk.e))for(const a of pk.e.slice(0,40))this.action(p,a,false)}
 // ---------- glavni tick ----------
 tick(dt){this.t+=dt;const M=this.M;flushLater();
  // tajmeri modova
  if(this.mode==='warmup'){this.timer-=dt;this.players.forEach(p=>{if(!p.alive&&p.respawnAt&&this.t>=p.respawnAt){p.respawnAt=0;this.spawn(p)}if(p.money<16000)p.money=16000});if(this.timer<=0)this.startMatch()}
  else if(this.mode==='freeze'){this.timer-=dt;if(this.timer<=0){this.mode='live';this.timer=RL.roundTime;this.dirty=1;this.emit({ty:'go'})}}
  else if(this.mode==='live'){if(this.bomb.st!=='planted'){this.timer-=dt;if(this.timer<=0){this.timer=0;this.endRound('CT','time')}}}
  else if(this.mode==='end'){this.timer-=dt;if(this.timer<=0)this.nextRound()}
  else if(this.mode==='over'){this.timer-=dt;if(this.timer<=0)this.restartMatch()}
  const live=this.mode==='live'||this.mode==='warmup';
  // botovi + fizika botova
  for(const p of this.players){
   if(p.bot&&p.alive){const cmd=p.ai.think(dt);const frozen=this.mode==='freeze'||this.mode==='over';
    const ms=frozen||p.planting>0||p.defusing>0?0:maxSpd(p);pmove(M,p,{fw:cmd.fw,sd:cmd.sd,jump:cmd.jump,duck:cmd.duck,walk:cmd.walk,maxspd:ms},dt);
    const out=[];wTick(p,cmd,this.t,dt,out,{canFire:live||this.mode==='end',rnd:this.rnd});for(const a of out)this.action(p,a,true);
    p.btn=(cmd.atk?1:0)|(cmd.use?4:0)}
   if(p.alive){if(p.hist.length===0||this.t-p.hist[p.hist.length-1][0]>=1/40){p.hist.push([this.t,p.x,p.y,p.z,p.duck]);if(p.hist.length>40)p.hist.shift()}
    this.pickups(p);if(p.flash>0)p.flash=Math.max(0,p.flash-dt);
    if(p.fall){const f=p.fall;p.fall=0;if(f>11.5){const dmg=Math.round((f-11.5)*9);if(dmg>0)this.damage(p,null,dmg,'world','legs',{noArmor:1})}}
    if(p.y<-20){this.damage(p,null,999,'world','chest',{noArmor:1})}}
   if(!p.bot&&p.conn&&this.t-p.lastIn>8&&p.id!==this.hostId)this.leave(p.id)}
  // C4 postavljanje / defuse
  this.bombTick(dt);
  // bombe u letu
  this.nadeTick(dt);
  for(let i=this.smokes.length-1;i>=0;i--){const s=this.smokes[i];s.t+=dt;if(s.t>s.life){this.smokes.splice(i,1);this.dirty=1}}
  for(let i=this.fires.length-1;i>=0;i--){const f=this.fires[i];f.t+=dt;if(f.t>f.life||this.smokes.some(s=>Math.hypot(s.x-f.x,s.z-f.z)<s.r+1.5)){this.fires.splice(i,1);this.emit({ty:'fireout',id:f.id});this.dirty=1;continue}
   if((f.acc=(f.acc||0)+dt)>=.25){f.acc-=.25;for(const p of this.players){if(!p.alive)continue;if(Math.hypot(p.x-f.x,p.z-f.z)<f.r&&p.y-f.y<1.2&&p.y-f.y>-.5){this.damage(p,this.byIdx(f.o),10,f.w,'legs',{noArmor:1})}}}}
  // događaji stariji od 0.6s se brišu
  const cut=this.t-.6;while(this.ev.length&&this.ev[0].t<cut)this.ev.shift();
 }
 bombTick(dt){const b=this.bomb;
  if(this.mode==='live'){
   for(const p of this.players){if(!p.alive)continue;
    const want=p.cur===5&&p.inv[5]&&(p.btn&1)&&p.onGround&&M_site(this.M,p)&&b.st==='carried';
    if(want){if(!p.planting)this.emit({ty:'planting',p:p.idx});p.planting+=dt;if(p.planting>=RL.plantTime){p.planting=0;p.inv[5]=false;p.cur=bestSlot(p);
      this.bomb={st:'planted',x:r2(p.x),y:r2(p.y),z:r2(p.z),t:RL.bombTime,site:M_site(this.M,p),planter:p.idx,def:0,dp:0};this.pay(p,RL.plantRew);p.st.sc+=2;
      this.emit({ty:'plant',p:p.idx,site:this.bomb.site});this.radio(p,'bomb');this.dirty=1}}else p.planting=0}}
  if(b.st==='planted'){b.t-=dt;
   const dp=b.def?this.byIdx(b.def):null;
   if(dp&&(!dp.alive||!(dp.btn&4)||Math.hypot(dp.x-b.x,dp.z-b.z)>2.2)){dp.defusing=0;b.def=0;b.dp=0;this.dirty=1}
   if(!b.def){for(const p of this.players){if(p.alive&&p.side==='CT'&&(p.btn&4)&&p.onGround&&Math.hypot(p.x-b.x,p.z-b.z)<2&&Math.abs(p.y-b.y)<1.6){b.def=p.idx;b.dp=0;b.dlen=p.kit?RL.defuseKit:RL.defuseTime;p.defusing=1;this.emit({ty:'defusing',p:p.idx,kit:p.kit?1:0});this.dirty=1;break}}}
   if(b.def){b.dp+=dt;const q=this.byIdx(b.def);if(q)q.defusing=b.dp;if(b.dp>=b.dlen&&b.t>0){b.st='defused';const q2=this.byIdx(b.def);if(q2){this.pay(q2,RL.defuseRew);q2.st.sc+=2;q2.defusing=0}this.emit({ty:'defused',p:b.def});this.endRound('CT','defuse');return}}
   if(b.t<=0){b.st='exploded';this.explodeBomb();if(this.mode==='live')this.endRound('T','bomb');else this.dirty=1}}}
 explodeBomb(){const b=this.bomb;this.emit({ty:'c4boom',x:b.x,y:b.y,z:b.z});
  for(const p of this.players){if(!p.alive)continue;const d=Math.hypot(p.x-b.x,p.y-b.y,p.z-b.z);const dmg=500*Math.exp(-(d*d)/(2*11*11));if(dmg>1)this.damage(p,null,dmg,'c4','chest',{ap:.5})}}
 nadeTick(dt){const M=this.M;
  for(let i=this.nades.length-1;i>=0;i--){const n=this.nades[i];n.t+=dt;
   if(!n.still){const sub=4,h=dt/sub;for(let s=0;s<sub;s++){n.vy-=PH.G*h;const sp=Math.hypot(n.vx,n.vy,n.vz);if(sp<1e-4)break;const L=sp*h;
     const r=M.raycast(n.x,n.y,n.z,n.vx/sp,n.vy/sp,n.vz/sp,L+.06);
     if(r){n.x=r.x+r.nx*.06;n.y=r.y+r.ny*.06;n.z=r.z+r.nz*.06;const vn=n.vx*r.nx+n.vy*r.ny+n.vz*r.nz;n.vx=(n.vx-2*vn*r.nx)*.45;n.vy=(n.vy-2*vn*r.ny)*.45;n.vz=(n.vz-2*vn*r.nz)*.45;
      if(r.ny>.7){n.vx*=.7;n.vz*=.7;if(n.w==='molotov'||n.w==='incgrenade'){if(n.t>.05){this.nadeFx(n);this.nades.splice(i,1);break}}}
      if(Math.hypot(n.vx,n.vy,n.vz)<.6&&r.ny>.7){n.still=1;n.vx=n.vy=n.vz=0;break}
      this.emit({ty:'bnc',id:n.id})}
     else{n.x+=n.vx*h;n.y+=n.vy*h;n.z+=n.vz*h}}}
   if(this.nades[i]!==n)continue;
   const fuse=W[n.w].fuse;
   if((n.w==='he'||n.w==='flash')&&n.t>=fuse){this.nadeFx(n);this.nades.splice(i,1)}
   else if(n.w==='smoke'&&(n.still&&n.t>1||n.t>6)){this.nadeFx(n);this.nades.splice(i,1)}
   else if((n.w==='molotov'||n.w==='incgrenade')&&n.t>=fuse){this.nadeFx(n);this.nades.splice(i,1)}
   else if(n.w==='decoy'){if(n.still||n.t>3){n.dt=(n.dt||0)+dt;if(!n.next)n.next=n.t+.5;if(n.t>=n.next){n.next=n.t+.25+this.rnd()*1.5;const ow=this.byIdx(n.o);const ww=ow&&ow.inv[1]?ow.inv[1].w:(ow&&ow.side==='T'?'ak47':'m4a4');
      const burst=1+Math.floor(this.rnd()*4);for(let b=0;b<burst;b++)this.emit({ty:'decoy',x:r2(n.x),y:r2(n.y),z:r2(n.z),w:ww,d:b*W[ww].rof});
      for(const q of this.players)if(q.ai&&q.alive&&q.side!==n.side&&Math.hypot(q.x-n.x,q.z-n.z)<30)q.ai.heardPos(n.x,n.y,n.z)}
     if(n.dt>14){this.emit({ty:'boom',x:r2(n.x),y:r2(n.y),z:r2(n.z),w:'decoy'});this.nades.splice(i,1)}}}}}
 nadeFx(n){const M=this.M,o=this.byIdx(n.o);const pos=[n.x,n.y+.15,n.z];
  if(n.w==='he'){this.emit({ty:'boom',x:r2(n.x),y:r2(n.y),z:r2(n.z),w:'he'});
   for(const p of this.players){if(!p.alive)continue;const c=[p.x,p.y+1.1,p.z];const d=Math.hypot(c[0]-pos[0],c[1]-pos[1],c[2]-pos[2]);if(d>9)continue;
    const dx=c[0]-pos[0],dy=c[1]-pos[1],dz=c[2]-pos[2];const tr=M.raycast(pos[0],pos[1],pos[2],dx/d,dy/d,dz/d,d);if(tr&&tr.t<d-.3)continue;
    const dmg=98*Math.pow(1-d/9,1.4);if(dmg<1)continue;if(o&&o.side===p.side&&o!==p)continue;this.damage(p,o,dmg,'he','chest',{ap:.5,from:pos})}}
  else if(n.w==='flash'){this.emit({ty:'flashb',x:r2(n.x),y:r2(n.y),z:r2(n.z)});
   for(const p of this.players){if(!p.alive)continue;const e=[p.x,pEye(p),p.z];const dx=pos[0]-e[0],dy=pos[1]-e[1],dz=pos[2]-e[2];const d=Math.hypot(dx,dy,dz);if(d>45)continue;
    const tr=M.raycast(e[0],e[1],e[2],dx/d,dy/d,dz/d,d);if(tr&&tr.t<d-.25)continue;if(segSmoke(this.smokes,e,pos))continue;
    const v=dirOf(p.yaw,p.pitch);const dot=(v[0]*dx+v[1]*dy+v[2]*dz)/d;const fac=dot>.6?1:dot>.1?.55:dot>-.4?.25:.1;
    const dur=clamp(4.9*fac*(1-Math.max(0,d-8)/45),0,4.9);if(dur>p.flash)p.flash=dur;if(p.ai)p.ai.flashed(dur);
    if(o&&dur>1.5&&o.side!==p.side)o.st.sc+=0}
   this.dirty=1}
  else if(n.w==='smoke'){const s={id:n.id,x:r2(n.x),y:r2(n.y+.4),z:r2(n.z),t:0,life:18,r:3.4};this.smokes.push(s);this.emit({ty:'smoke',id:s.id,x:s.x,y:s.y,z:s.z});
   for(let i=this.fires.length-1;i>=0;i--){const f=this.fires[i];if(Math.hypot(f.x-s.x,f.z-s.z)<s.r+1.5){this.fires.splice(i,1);this.emit({ty:'fireout',id:f.id})}}this.dirty=1}
  else if(n.w==='molotov'||n.w==='incgrenade'){const gy=M.groundAt(n.x,n.z);
   if(this.smokes.some(s=>Math.hypot(s.x-n.x,s.z-n.z)<s.r+1)){this.emit({ty:'boom',x:r2(n.x),y:r2(n.y),z:r2(n.z),w:'fizz'});return}
   if(n.y-gy>2.5&&!n.still){// pukao u zraku
    this.emit({ty:'boom',x:r2(n.x),y:r2(n.y),z:r2(n.z),w:'fizz'});return}
   const f={id:n.id,x:r2(n.x),y:r2(gy),z:r2(n.z),r:3.3,t:0,life:7,o:n.o,w:n.w};this.fires.push(f);this.emit({ty:'fire',id:f.id,x:f.x,y:f.y,z:f.z,r:f.r});this.dirty=1}}
 emit(e){e.id=this.evId++;e.t=this.t;this.ev.push(e);if(this.onEvent)this.onEvent(e)}
 // ---------- serijalizacija ----------
 snap(){const ps=[];for(const p of this.players){let f=0;if(p.alive)f|=1;if(p.onGround)f|=2;if(p.ws.zoom)f|=4;if(p.planting)f|=8;if(p.defusing)f|=16;if(p.ws.rl)f|=32;if(p.flash>0)f|=64;
   ps.push([p.idx,Math.round(p.x*100),Math.round(p.y*100),Math.round(p.z*100),Math.round(p.yaw*1000),Math.round(p.pitch*1000),Math.round(p.duck*100),f,p.hp,p.cur,p.sp,Math.round(p.flash*10),Math.round(p.vx*10),Math.round(p.vz*10),p.cur===4?(p.nsel||0):0])}
  const b=this.bomb;return {k:'s',t:r3(this.t),md:this.mode,tm:r2(this.timer),p:ps,n:this.nades.map(n=>[n.id,n.w,r2(n.x),r2(n.y),r2(n.z)]),
   b:b.st==='planted'?[1,b.x,b.y,b.z,r2(b.t),b.def||0,r2(b.dp||0),b.dlen||10]:b.st==='dropped'?[2,b.x,b.y,b.z]:b.st==='carried'?[3,b.c]:[0],ev:this.ev.slice()}}
 info(){const inv=p=>{const o={};for(const s of [1,2]){const it=p.inv[s];o[s]=it?[it.w,it.clip,it.res,it.sk||0]:0}o[3]=p.inv[3].sk||0;o[4]=p.inv[4].slice();o[5]=p.inv[5]?1:0;o[6]=p.inv[6]?1:0;return o};
  return {k:'i',t:r3(this.t),host:this.hostId,map:this.mapId,diff:this.diff,mode:this.mode,timer:r2(this.timer),round:this.round,ts:this.tscore.slice(),halves:this.halves,loss:this.loss.slice(),swaps:this.swaps,
   bomb:Object.assign({},this.bomb),smokes:this.smokes.map(s=>({id:s.id,x:s.x,y:s.y,z:s.z,t:r2(s.t),life:s.life,r:s.r})),fires:this.fires.map(f=>({id:f.id,x:f.x,y:f.y,z:f.z,r:f.r,t:r2(f.t),life:f.life,o:f.o,w:f.w})),
   drops:this.drops,buyEnd:r2(this.buyEnd),roundStart:r2(this.roundStart),evId:this.evId,nextIdx:this.nextIdx,tPlan:this.tPlan,matchNo:this.matchNo,lastWin:this.lastWin||null,
   pl:this.players.map(p=>({id:p.id,i:p.idx,n:p.n,b:p.bot?1:0,wh:p.wasHuman||0,tm:p.team,sd:p.side,ag:p.ag,al:p.alive?1:0,hp:p.hp,ar:p.ar,hm:p.helm?1:0,kt:p.kit?1:0,$:p.money,inv:inv(p),c:p.cur,st:p.st,cn:p.conn?1:0,sp:p.sp,pg:p.ping|0,
    x:r2(p.x),y:r2(p.y),z:r2(p.z),yw:r3(p.yaw),lb:p.lastBuy||[],bt:p.bought.map(b=>b.i)}))}}
 // učitaj stanje (host migracija)
 load(s){this.t=s.t;this.mode=s.mode;this.timer=s.timer;this.round=s.round;this.tscore=s.ts.slice();this.halves=s.halves||[];this.loss=s.loss||[0,0];this.swaps=s.swaps|0;this.bomb=Object.assign({},s.bomb||{st:'none'});
  this.smokes=(s.smokes||[]).map(x=>Object.assign({},x));this.fires=(s.fires||[]).map(x=>Object.assign({},x));this.drops=(s.drops||[]).map(x=>Object.assign({},x));this.dropId=1+Math.max(0,...this.drops.map(d=>d.id));
  this.buyEnd=s.buyEnd;this.roundStart=s.roundStart;this.evId=(s.evId|0)+1000;this.nextIdx=s.nextIdx;this.tPlan=s.tPlan||'A';this.matchNo=s.matchNo||1;this.lastWin=s.lastWin||null;
  this.players=s.pl.map(q=>{const p={id:q.id,idx:q.i,n:q.n,bot:!!q.b,wasHuman:q.wh||null,team:q.tm,side:q.sd,ag:q.ag,skins:{},alive:!!q.al,hp:q.hp,ar:q.ar,helm:!!q.hm,kit:!!q.kt,money:q.$,
   inv:{1:q.inv[1]?{w:q.inv[1][0],clip:q.inv[1][1],res:q.inv[1][2],sk:q.inv[1][3]}:null,2:q.inv[2]?{w:q.inv[2][0],clip:q.inv[2][1],res:q.inv[2][2],sk:q.inv[2][3]}:null,3:{w:'knife',sk:q.inv[3]||0},4:q.inv[4].slice(),5:!!q.inv[5],6:!!q.inv[6]},
   cur:q.c,nsel:0,ws:newWS(),st:Object.assign({},q.st),sp:q.sp+1,flash:0,hist:[],btn:0,planting:0,defusing:0,dmgBy:{},conn:!!q.cn,lastIn:this.t,joinT:this.t,bought:[],lastBuy:q.lb||[],
   x:q.x,y:q.y,z:q.z,vx:0,vy:0,vz:0,yaw:q.yw,pitch:0,duck:0,onGround:true,rk:0};if(p.bot)p.ai=new Bot(this,p);return p});
  if(this.bomb.st==='planted'){this.bomb.def=0;this.bomb.dp=0}
  this.dirty=1}
}
function M_site(M,p){return M.siteAt(p.x,p.z)}

// ================= BOT =================
const DIFF=[{react:[.5,.85],err:3.2,turn:5,ctrl:.25,hs:.15,see:55},{react:[.28,.5],err:1.8,turn:8,ctrl:.6,hs:.3,see:75},{react:[.16,.3],err:.9,turn:12,ctrl:.9,hs:.5,see:95}];
class Bot{
 constructor(g,p){this.g=g;this.p=p;this.cmd={fw:0,sd:0,jump:0,duck:0,walk:0,atk:0,atk2:0,rl:0,sel:0,use:0};this.newRound()}
 get D(){return DIFF[this.g.diff]}
 newRound(){this.path=null;this.pi=0;this.task=null;this.tgt=null;this.seen=0;this.react=0;this.lastThink=0;this.stuck=0;this.lastPos=null;this.wait=this.g.rnd()*3;this.thrown=false;
  this.route=null;this.rwp=0;this.hold=null;this.lookAt=null;this.burst=0;this.pause=0;this.heardAt=null;this.flashT=0;this.bought=false;this.repath=0;this.aimE=[0,0];this.strafe=0;this.strafeT=0;this.duckT=0;this.lastSeenT=-9}
 hurt(a){if(!this.tgt&&a&&a.alive)this.heardAt={x:a.x,y:a.y,z:a.z,t:this.g.t}}
 heard(a){if(!this.tgt)this.heardAt={x:a.x,y:a.y+1.2,z:a.z,t:this.g.t}}
 heardPos(x,y,z){if(!this.tgt&&this.g.rnd()<.5)this.heardAt={x,y:y+1,z,t:this.g.t}}
 flashed(d){this.flashT=this.g.t+d*.85}
 // kupovina: RANDOM oružje koje bot može platiti
 buy(){const g=this.g,p=this.p;if(this.bought)return;this.bought=true;const rnd=g.rnd;
  const avail=Object.values(W).filter(w=>w.price>0&&(w.slot===1||w.slot===2)&&w.id!=='zeus'&&(!w.team||w.team===p.side));
  if(!p.inv[1]){const pr=avail.filter(w=>w.slot===1&&w.price<=p.money);
   if(pr.length&&(p.money>=1800||rnd()<.6)){const w=pr[Math.floor(rnd()*pr.length)];g.buy(p,w.id)}
   else{const pi=avail.filter(w=>w.slot===2&&w.price<=p.money&&w.price>200&&(!p.inv[2]||p.inv[2].w!==w.id));if(pi.length&&rnd()<.55)g.buy(p,pi[Math.floor(rnd()*pi.length)].id)}}
  if(p.money>=1000&&(!p.helm||p.ar<100))g.buy(p,'vesthelm');else if(p.money>=650&&p.ar<100)g.buy(p,'vest');
  if(p.side==='CT'&&p.money>=400&&rnd()<.45)g.buy(p,'defuser');
  const nd=['flash','smoke','he',p.side==='T'?'molotov':'incgrenade','decoy'];for(let k=0;k<3;k++){if(rnd()<.55){const n=nd[Math.floor(rnd()*nd.length)];if(W[n].price<=p.money)g.buy(p,n)}}
  if(this.g.mode==='warmup'&&rnd()<.15&&p.money>=200)g.buy(p,'zeus')}
 setPath(x,z,noise){const p=this.p;this.path=this.g.M.path(p.x,p.z,x,z,noise||0);this.pi=0;this.goal=[x,z];this.repath=this.g.t}
 // izbor zadatka
 plan(){const g=this.g,p=this.p,M=g.M,def=M.def,rnd=g.rnd;const b=g.bomb;
  if(g.mode==='warmup'){if(!this.path||this.pi>=this.path.length){const s=rnd()<.5?'A':'B';const c=M.cellC(...def.plant[s]);this.setPath(c[0]+(rnd()-.5)*8,c[1]+(rnd()-.5)*8,1.5)}return}
  if(p.side==='T'){
   if(b.st==='planted'){if(this.task!=='guard'){this.task='guard';const a=rnd()*6.28,r=3+rnd()*6;this.setPath(b.x+Math.cos(a)*r,b.z+Math.sin(a)*r,1)}return}
   if(b.st==='dropped'){const mates=g.players.filter(q=>q.side==='T'&&q.alive&&q.bot);const near=mates.sort((a,c)=>Math.hypot(a.x-b.x,a.z-b.z)-Math.hypot(c.x-b.x,c.z-b.z))[0];
    if(near===p){if(this.task!=='pickup'||g.t-this.repath>3){this.task='pickup';this.setPath(b.x,b.z)}return}}
   if(!this.route){const site=p.inv[5]||rnd()<.75?g.tPlan:(g.tPlan==='A'?'B':'A');const rs=def.routes[site];this.route=rs[Math.floor(rnd()*rs.length)];this.site=site;this.rwp=0;this.task='route'}
   if(this.task==='route'&&(!this.path||this.pi>=this.path.length)){
    if(this.rwp<this.route.length){const w=this.route[this.rwp++];const c=M.cellC(w[0],w[1]);this.setPath(c[0],c[1],1.2)}
    else{this.task='site';const c=M.cellC(...def.plant[this.site]);this.setPath(c[0]+(p.inv[5]?0:(rnd()-.5)*10),c[1]+(p.inv[5]?0:(rnd()-.5)*10))}}
   else if(this.task==='site'&&(!this.path||this.pi>=this.path.length)&&!p.inv[5]){this.task='lurk';this.lurkT=g.t+4+rnd()*6}
   else if(this.task==='lurk'&&g.t>this.lurkT){this.huntOrRoam()}
   else if(this.task==='hunt'&&(!this.path||this.pi>=this.path.length))this.huntOrRoam();
  } else {
   if(b.st==='planted'){if(this.task!=='retake'||(!this.path||this.pi>=this.path.length)&&Math.hypot(p.x-b.x,p.z-b.z)>1.6){this.task='retake';this.setPath(b.x,b.z,.5)}return}
   if(!this.hold){const mates=g.players.filter(q=>q.side==='CT');const i=mates.indexOf(p);const key=i<2?'A':i<4?'B':'M';const hs=def.holds[key];const h=hs[(i+Math.floor(rnd()*hs.length))%hs.length];
    this.hold=M.cellC(h[0],h[1]);this.holdKey=key;this.task='hold';this.setPath(this.hold[0],this.hold[1],.8);
    // gledaj prema smjeru odakle dolaze T
    const tc=M.spawnCenter('T');const pt=M.path(this.hold[0],this.hold[1],tc[0],tc[1]);if(pt&&pt.length>3){const q=pt[Math.min(pt.length-1,6)];this.lookAt=[q[0],1.5,q[2]]}}
   if(g.lastSpot&&g.t-g.lastSpot.t<4&&this.task==='hold'&&this.holdKey!==g.lastSpot.site&&g.lastSpot.site&&rnd()<.01){const c=M.cellC(...def.plant[g.lastSpot.site]);this.task='rotate';this.setPath(c[0]+(rnd()-.5)*8,c[1]+(rnd()-.5)*8,1)}
   if(this.task==='rotate'&&(!this.path||this.pi>=this.path.length)){this.task='hold2'}
   const alive=g.players.filter(q=>q.side==='T'&&q.alive).length;if(alive<=2&&g.t-g.roundStart>RL.freeze+40&&this.task!=='hunt')this.huntOrRoam();
   if(this.task==='hunt'&&(!this.path||this.pi>=this.path.length))this.huntOrRoam();
  }}
 huntOrRoam(){const g=this.g,p=this.p;const en=g.players.filter(q=>q.alive&&q.side!==p.side);if(!en.length)return;const e=en[Math.floor(g.rnd()*en.length)];this.task='hunt';this.setPath(e.x+(g.rnd()-.5)*6,e.z+(g.rnd()-.5)*6,1.5)}
 canSee(q){const g=this.g,p=this.p,M=g.M;const e=[p.x,pEye(p),p.z];
  for(const hy of [pHeight(q)-.15,1.0]){const t=[q.x,q.y+hy,q.z];const dx=t[0]-e[0],dy=t[1]-e[1],dz=t[2]-e[2],d=Math.hypot(dx,dy,dz);if(d>this.D.see)return false;
   const r=M.raycast(e[0],e[1],e[2],dx/d,dy/d,dz/d,d);if(r&&r.t<d-.2)continue;if(segSmoke(g.smokes,e,t))continue;return true}return false}
 think(dt){const g=this.g,p=this.p,c=this.cmd,D_=this.D,rnd=g.rnd;c.atk=0;c.atk2=0;c.rl=0;c.sel=0;c.jump=0;c.use=0;c.walk=0;
  if(g.mode==='freeze'||g.mode==='warmup'&&!this.bought){this.buy()}
  if(g.mode==='freeze'||g.mode==='over'){c.fw=0;c.sd=0;return c}
  if(g.mode==='end'){c.fw=0;c.sd=0}
  const now=g.t;
  // percepcija (10x u sekundi)
  if(now-this.lastThink>.1){this.lastThink=now;this.plan();
   const blind=now<this.flashT;let best=null,bd=1e9;
   if(!blind)for(const q of g.players){if(!q.alive||q.side===p.side)continue;const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);if(d>D_.see)continue;
    const fwd=dirOf(p.yaw,0);const dot=(fwd[0]*dx+fwd[2]*dz)/(d||1);const inFov=dot>-.05||d<4||(this.tgt===q);if(!inFov)continue;if(d<bd&&this.canSee(q)){bd=d;best=q}}
   if(best){if(this.tgt!==best){this.tgt=best;this.react=now+D_.react[0]+rnd()*(D_.react[1]-D_.react[0]);this.aimE=[(rnd()-.5)*D_.err*4*DEG,(rnd()-.5)*D_.err*3*DEG];
     if(now-this.lastSeenT>8&&rnd()<.35&&g.mode==='live')g.radio(p,'enemy');g.lastSpot={site:g.M.siteAt(best.x,best.z),t:now}}this.lastSeenT=now;this.tgtSeen=now}
   else if(this.tgt&&(!this.tgt.alive||now-this.tgtSeen>1.2)){if(this.tgt.alive)this.heardAt={x:this.tgt.x,y:this.tgt.y+1.4,z:this.tgt.z,t:now};this.tgt=null}}
  // oružje: najbolje dostupno
  const w=curW(p);const want=p.inv[1]?1:p.inv[2]?2:3;
  if(!this.tgt&&p.inv[5]&&p.side==='T'&&g.bomb.st==='carried'&&g.M.siteAt(p.x,p.z)&&g.mode==='live'&&this.task!=='route'){c.sel=5}
  else if(p.cur!==want&&(p.cur!==5||!p.planting)&&p.cur!==4)c.sel=want;
  else if(p.cur===4&&!this.nadeAim)c.sel=want;
  const it=curItem(p);if(it&&W[it.w].mag&&it.clip<W[it.w].mag*.35&&!this.tgt&&it.res>0)c.rl=1;
  let mvx=0,mvz=0,aimYaw=p.yaw,aimPitch=p.pitch;
  // kretanje po putanji
  if(now>this.wait+g.roundStart+RL.freeze||g.mode==='warmup'){
   if(this.path&&this.pi<this.path.length){const wp=this.path[this.pi];const dx=wp[0]-p.x,dz=wp[2]-p.z,d=Math.hypot(dx,dz);
    if(d<.7||(this.pi+1<this.path.length&&d<1.6&&this.pi+1<this.path.length)){this.pi++}
    else{mvx=dx/d;mvz=dz/d}
    if(this.pi<this.path.length){const la=this.path[Math.min(this.path.length-1,this.pi+2)];const ldx=la[0]-p.x,ldz=la[2]-p.z;if(Math.hypot(ldx,ldz)>.5){aimYaw=Math.atan2(-ldx,-ldz);aimPitch=0}}}
   else if(this.lookAt){const dx=this.lookAt[0]-p.x,dz=this.lookAt[2]-p.z;aimYaw=Math.atan2(-dx,-dz);aimPitch=0}
  }
  if(this.heardAt&&!this.tgt){if(now-this.heardAt.t<3){const dx=this.heardAt.x-p.x,dy=this.heardAt.y-pEye(p),dz=this.heardAt.z-p.z;[aimYaw,aimPitch]=angTo(dx,dy,dz)}else this.heardAt=null}
  // C4: postavljanje
  if(p.cur===5&&p.inv[5]&&g.M.siteAt(p.x,p.z)&&!this.tgt&&g.mode==='live'&&(!this.path||this.pi>=this.path.length||this.task==='site')){mvx=mvz=0;c.atk=1;c.duck=1;if(!this.planting){this.planting=1;g.radio(p,'plant')}}else this.planting=0;
  // defuse
  if(p.side==='CT'&&g.bomb.st==='planted'&&!this.tgt){const b=g.bomb;const d=Math.hypot(p.x-b.x,p.z-b.z);if(d<1.7){mvx=mvz=0;c.use=1;c.duck=1;[aimYaw,aimPitch]=angTo(b.x-p.x,b.y-pEye(p),b.z-p.z);if(!this.defuseSaid){this.defuseSaid=1;g.radio(p,'defuse')}}}
  // bombe: baci prema siteu kad se približi
  if(p.side==='T'&&this.task==='route'&&this.route&&this.rwp>=this.route.length-1&&!this.thrown&&!this.tgt&&p.inv[4].length&&g.mode==='live'){
   const c2=g.M.cellC(...g.M.def.plant[this.site]);const dx=c2[0]-p.x,dz=c2[1]-p.z;const d=Math.hypot(dx,dz);
   if(d<26&&d>8){this.nadeAim=1;if(p.cur!==4){c.sel=4}else{const n=curW(p);if(n==='decoy'||n==='flash'&&rnd()<.3){}
     aimYaw=Math.atan2(-dx,-dz);aimPitch=clamp(.18+d*.012,.15,.6);const ang=Math.abs(angDiff(p.yaw,aimYaw));if(ang<.08){c.atk=1;if(p.ws.pin){if(!this.pin)this.pin=now;if(now-this.pin>.3){c.atk=0;this.thrown=true;this.nadeAim=0;this.pin=0}}}}}
   else if(d<=8){this.thrown=true;this.nadeAim=0}}
  // borba
  if(this.tgt&&this.tgt.alive&&now>=this.flashT){const q=this.tgt;
   if(p.cur===4){c.sel=want}
   const head=this.g.rnd()<D_.hs;const ty=q.y+(this.aimHead!=null?(this.aimHead?pHeight(q)-.27:pHeight(q)*.55):pHeight(q)*.55);
   if(this.aimHead==null)this.aimHead=head;
   const e=pEye(p);let [yy,pp]=angTo(q.x-p.x,ty-e,q.z-p.z);
   // kompenzacija trzaja
   const ws=p.ws;yy-=ws.py*D_.ctrl*2;pp-=ws.pp*D_.ctrl*2;
   // greška nišana opada s vremenom
   this.aimE[0]*=Math.pow(.25,dt*2);this.aimE[1]*=Math.pow(.25,dt*2);aimYaw=yy+this.aimE[0];aimPitch=pp+this.aimE[1];
   const d=Math.hypot(q.x-p.x,q.z-p.z);const wd=W[curW(p)]||W.knife;
   // zaustavi se za precizno pucanje (rifle/pištolj), SMG/shotgun nastavlja
   if(wd.cat!=='smg'&&wd.cat!=='heavy'&&wd.cat!=='knife'){if(now>this.strafeT){this.strafeT=now+.6+rnd();this.strafe=rnd()<.5?0:(rnd()<.5?-1:1)}mvx=mvz=0;
    if(this.strafe&&now%1.2<.35){const r=dirOf(p.yaw+Math.PI/2,0);mvx=r[0]*this.strafe;mvz=r[2]*this.strafe}}
   else if(wd.cat==='knife'){mvx=(q.x-p.x)/(d||1);mvz=(q.z-p.z)/(d||1)}
   if(wd.cat==='sniper'&&!p.ws.zoom&&!p.ws.rl&&now>p.ws.next)c.atk2=1;
   if(d>14&&wd.cat==='rifle'&&now>this.duckT){this.duckT=now+2;this.duckOn=rnd()<.35}c.duck=this.duckOn&&wd.cat!=='sniper'?1:0;
   const err=Math.abs(angDiff(p.yaw,aimYaw))+Math.abs(p.pitch-aimPitch);const tol=Math.max(.012,Math.atan2(.35,d)*1.3);
   if(now>this.react&&err<tol*2.2){
    if(wd.auto){if(this.pause>now){}else{c.atk=1;this.burst++;const maxB=d>25?3:d>12?6:14;if(this.burst>maxB){this.burst=0;this.pause=now+.25+rnd()*.35}}}
    else{if(!p.ws.ah&&now>=p.ws.next)c.atk=1}
    if(wd.cat==='knife'&&d>2.2)c.atk=0}
   if(it&&it.clip===0&&it.res===0&&p.inv[2]&&p.cur===1)c.sel=2;
  } else {this.aimHead=null;this.burst=0;c.duck=(this.planting||c.use)?1:0}
  // okreni se glatko
  const turn=D_.turn*dt*(this.tgt?1.4:.7);const dy=angDiff(p.yaw,aimYaw);p.yaw+=clamp(dy,-turn,turn)+(Math.abs(dy)<turn?0:0);p.pitch+=clamp(aimPitch-p.pitch,-turn,turn);p.pitch=clamp(p.pitch,-1.4,1.4);
  // pretvori pravac kretanja u fw/sd
  const f=dirOf(p.yaw,0),r=[Math.cos(p.yaw),0,-Math.sin(p.yaw)];c.fw=mvx*f[0]+mvz*f[2];c.sd=mvx*r[0]+mvz*r[2];
  if(!this.tgt&&(mvx||mvz))c.walk=0;
  // zaglavljen?
  if(mvx||mvz){const sp=Math.hypot(p.vx,p.vz);if(sp<.6){this.stuck+=dt;if(this.stuck>.7)c.jump=1;if(this.stuck>2){this.stuck=0;if(this.goal)this.setPath(this.goal[0]+(rnd()-.5)*2,this.goal[1]+(rnd()-.5)*2,2)}}else this.stuck=Math.max(0,this.stuck-dt)}
  return c}
}
G.BS_SIM={Game,Bot,wTick,recoilAng,inaccOf,curW,curItem,maxSpd,hasSlot,selectSlot,bestSlot,newWS,dirOf,angTo,angDiff,hitTest,segSmoke,flushLater,clamp};
})(typeof window!=='undefined'?window:globalThis);
