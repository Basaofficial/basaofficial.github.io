// Prolaz za dvoje – fizika, portali i mehanizmi (bez crtanja, radi i u Node-u za testove).
(function(root){
'use strict';
const T=40,COLS=32,ROWS=18,PH=40,GRAV=1900,WALK=240,JUMP=640,TERM=1500,PAD_UP=1300,PAD_SIDE=560;
const PW=11,PHH=17,CS=15;
const SOLID='#W=';
const sgn=v=>v>0?1:v<0?-1:0;

function World(def){
 this.def=def;this.g=def.map.map(r=>r.padEnd(COLS,'#').slice(0,COLS).split(''));
 while(this.g.length<ROWS)this.g.push('#'.repeat(COLS).split(''));
 this.buttons=[];this.doors=[];this.disp=[];this.cubes=[];this.exits=[];this.spawn={};this.doorAt=new Map();
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const c=this.g[y][x];
  if(c==='1'||c==='2'){this.spawn[c==='1'?'a':'b']={x:x*T+T/2,y:(y+1)*T-PHH-.01};this.g[y][x]='.'}
  else if(c==='x'||c==='y'||c==='z'){this.buttons.push({cx:x,cy:y,l:c,on:false,t:0});this.g[y][x]='.'}
  else if(c==='X'||c==='Y'||c==='Z'){const d={cx:x,cy:y,l:c.toLowerCase(),open:false,t:0};this.doors.push(d);this.doorAt.set(y*COLS+x,d)}
  else if(c==='C'){const d={cx:x,cy:y,i:this.disp.length};this.disp.push(d);this.g[y][x]='.';
   this.cubes.push({kind:'c',i:this.cubes.length,d,x:x*T+T/2,y:(y+1)*T-CS-.01,hw:CS,hh:CS,vx:0,vy:0,on:false,held:null,gone:0,own:'a',ot:0})}
  else if(c==='E'){this.exits.push({cx:x,cy:y})}
 }
 const mk=(r)=>{const s=this.spawn[r]||{x:80,y:80};return{kind:'p',r,x:s.x,y:s.y,hw:PW,hh:PHH,vx:0,vy:0,on:false,face:r==='a'?1:-1,aim:-.35,
  coy:0,jb:0,hold:null,dead:0,inExit:false,walk:0,lastShot:0,remote:false,deaths:0,tp:0}};
 this.players={a:mk('a'),b:mk('b')};
 this.players.b.aim=Math.PI+.35;
 this.portals={a:[null,null],b:[null,null]};
 this.time=0;this.ev=[];
}
World.prototype={
 emit(k,o){this.ev.push(Object.assign({k},o||{}))},
 at(x,y){if(x<0||y<0||x>=COLS||y>=ROWS)return'#';return this.g[y][x]},
 solid(x,y){const c=this.at(x,y);if(SOLID.indexOf(c)>=0)return true;if(c==='X'||c==='Y'||c==='Z'){const d=this.doorAt.get(y*COLS+x);return !d||!d.open}return false},
 block(x,y){return this.solid(x,y)||this.at(x,y)===':'},
 bodies(){const a=[];for(const r of['a','b']){const p=this.players[r];if(!p.dead)a.push(p)}for(const c of this.cubes)if(!c.gone)a.push(c);return a},
 // ---------- portali ----------
 ray(ox,oy,ang,max){
  const dx=Math.cos(ang),dy=Math.sin(ang);let cx=Math.floor(ox/T),cy=Math.floor(oy/T);
  if(this.block(cx,cy))return{cx,cy,nx:0,ny:0,hx:ox,hy:oy,t:0,inside:true};
  const sx=sgn(dx),sy=sgn(dy);
  let tmx=dx?((cx+(dx>0?1:0))*T-ox)/dx:Infinity,tmy=dy?((cy+(dy>0?1:0))*T-oy)/dy:Infinity;
  const tdx=dx?T/Math.abs(dx):Infinity,tdy=dy?T/Math.abs(dy):Infinity;max=max||2400;
  for(let i=0;i<400;i++){let t,nx=0,ny=0;
   if(tmx<tmy){cx+=sx;t=tmx;tmx+=tdx;nx=-sx}else{cy+=sy;t=tmy;tmy+=tdy;ny=-sy}
   if(t>max)break;
   if(this.block(cx,cy))return{cx,cy,nx,ny,hx:ox+dx*t,hy:oy+dy*t,t};
  }
  return{cx,cy,nx:0,ny:0,hx:ox+dx*max,hy:oy+dy*max,t:max,miss:true};
 },
 canPortal(h){return h&&!h.miss&&!h.inside&&this.at(h.cx,h.cy)==='W'},
 // vrati portal {x,y,nx,ny} ili null
 fitPortal(h,owner,kind){
  if(!this.canPortal(h))return null;
  const {cx,cy,nx,ny}=h,vert=nx!==0;
  const frac=vert?(h.hy-cy*T)/T:(h.hx-cx*T)/T;
  const firsts=frac<.5?[-1,0]:[0,-1];
  for(const o of firsts){
   const a=(vert?cy:cx)+o;let ok=true;
   for(const k of[a,a+1]){const tx=vert?cx:k,ty=vert?k:cy;
    if(this.at(tx,ty)!=='W'||this.block(tx+nx,ty+ny)){ok=false;break}}
   if(!ok)continue;
   const p=vert?{x:nx>0?(cx+1)*T:cx*T,y:(a+1)*T,nx,ny}:{x:(a+1)*T,y:ny>0?(cy+1)*T:cy*T,nx,ny};
   // zid: ako ispod portala ostaje samo jedno polje do poda, spusti ga na pod
   if(vert&&!this._snap){const b=a+2;if(this.at(cx,b)==='W'&&!this.block(cx+nx,b)&&this.block(cx+nx,b+1)){
    this._snap=true;const q=this.fitPortal({cx,cy:b,nx,ny,hx:h.hx,hy:b*T+T*.8},owner,kind);this._snap=false;if(q)return q}}
   let clash=false;
   for(const r of['a','b'])for(let k=0;k<2;k++){if(r===owner&&k===kind)continue;const q=this.portals[r][k];
    if(q&&q.nx===nx&&q.ny===ny&&(vert?Math.abs(q.x-p.x)<1&&Math.abs(q.y-p.y)<2*PH:Math.abs(q.y-p.y)<1&&Math.abs(q.x-p.x)<2*PH))clash=true}
   if(clash)continue;
   return p;
  }
  return null;
 },
 gunPos(p){return{x:p.x+Math.cos(p.aim)*8,y:p.y-5+Math.sin(p.aim)*8}},
 shoot(r,kind){
  const p=this.players[r];if(p.dead)return null;
  const o=this.gunPos(p),h=this.ray(o.x,o.y,p.aim);
  const fit=this.fitPortal(h,r,kind);
  if(fit){fit.owner=r;fit.kind=kind;fit.t=0;this.portals[r][kind]=fit;this.emit('portal',{r,kind,p:fit,ox:o.x,oy:o.y})}
  else this.emit('fizz',{r,kind,hx:h.hx,hy:h.hy,ox:o.x,oy:o.y,nx:h.nx,ny:h.ny});
  return fit;
 },
 clearPortals(r){if(this.portals[r][0]||this.portals[r][1]){this.portals[r]=[null,null];this.emit('clear',{r})}},
 portalOn(coord,nx,ny,along,ext){
  for(const r of['a','b'])for(let k=0;k<2;k++){const p=this.portals[r][k];if(!p||p.nx!==nx||p.ny!==ny)continue;
   const pc=nx?p.x:p.y,pa=nx?p.y:p.x;
   if(Math.abs(pc-coord)<1&&Math.abs(along-pa)<=PH-ext+6){const q=this.portals[r][1-k];if(q)return[p,q]}}
  return null;
 },
 teleport(b,p,q){
  const nin={x:p.nx,y:p.ny},nout={x:q.nx,y:q.ny};
  const vn=b.vx*nin.x+b.vy*nin.y;let s=Math.max(-vn,0);
  const extOut=nout.x?b.hw:b.hh,tanOut=nout.x?b.hh:b.hw,lim=PH-tanOut-1;
  const cl=v=>Math.max(-lim,Math.min(lim,v));
  if(nin.x&&nout.x){b.vx=nout.x*s;b.y=q.y+cl(b.y-p.y);b.x=q.x+nout.x*(extOut+.5)}
  else if(nin.y&&nout.y){b.vy=nout.y*s;if(Math.abs(b.vx)<=WALK+1)b.vx*=.2;b.x=q.x+cl((b.x-p.x)*.5);b.y=q.y+nout.y*(extOut+.5)}
  else{const tin={x:-nin.y,y:nin.x},tout={x:-nout.y,y:nout.x};
   const vt=b.vx*tin.x+b.vy*tin.y,o=(b.x-p.x)*tin.x+(b.y-p.y)*tin.y;
   b.vx=s*nout.x-vt*tout.x;b.vy=s*nout.y-vt*tout.y;
   b.x=q.x+nout.x*(extOut+.5)-cl(o)*tout.x;b.y=q.y+nout.y*(extOut+.5)-cl(o)*tout.y}
  // minimalna izlazna brzina da se ne zaglavi u otvoru
  const vo=b.vx*nout.x+b.vy*nout.y,mn=nout.y<0?260:140;
  if(vo<mn){b.vx+=nout.x*(mn-vo);b.vy+=nout.y*(mn-vo)}
  b.on=false;b.jmp=false;b.tp=(b.tp||0)+1;
  if(b.kind==='p'&&b.hold){const c=b.hold;c.x=b.x;c.y=b.y;c.vx=b.vx;c.vy=b.vy}
  this.emit('tp',{b,p,q});
 },
 // ---------- kretanje ----------
 hitSolid(b){
  const x0=Math.floor((b.x-b.hw)/T),x1=Math.floor((b.x+b.hw-1e-6)/T),y0=Math.floor((b.y-b.hh)/T),y1=Math.floor((b.y+b.hh-1e-6)/T);
  let r=null;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(this.solid(x,y)){if(!r)r={x0:x,x1:x,y0:y,y1:y};else{r.x0=Math.min(r.x0,x);r.x1=Math.max(r.x1,x);r.y0=Math.min(r.y0,y);r.y1=Math.max(r.y1,y)}}
  return r;
 },
 axis(b,d,ax){
  if(!d)return;
  if(ax==='x'){b.x+=d;const h=this.hitSolid(b);if(!h)return;
   const face=d>0?h.x0*T:(h.x1+1)*T,nx=d>0?-1:1;
   const pq=b.held?null:this.portalOn(face,nx,0,b.y,b.hh);if(pq){this.teleport(b,pq[0],pq[1]);return 'tp'}
   b.x=d>0?face-b.hw-1e-3:face+b.hw+1e-3;
   if(b.kind==='c'&&Math.abs(b.vx)>300&&!b.held)b.vx*=-.25;else b.vx=0;return 'hit'}
  const py=b.y;b.y+=d;const h=this.hitSolid(b);
  if(h){const face=d>0?h.y0*T:(h.y1+1)*T,ny=d>0?-1:1;
   const pq=b.held?null:this.portalOn(face,0,ny,b.x,b.hw);if(pq){this.teleport(b,pq[0],pq[1]);return 'tp'}
   b.y=d>0?face-b.hh-1e-3:face+b.hh+1e-3;
   if(d>0){if(b.vy>700)this.emit('land',{b,v:b.vy});b.on=true}b.vy=0;return 'hit'}
  if(d>0){// stajanje na drugim tijelima (glava partnera, kocka)
   for(const o of this.bodies()){if(o===b||o===b.hold||o.hold===b||b.held===o)continue;
    if(o.kind==='c'&&o.held)continue;
    if(Math.abs(b.x-o.x)<b.hw+o.hw-2){const top=o.y-o.hh;
     if(py+b.hh<=top+.5&&b.y+b.hh>top){b.y=top-b.hh-1e-3;if(b.vy>700)this.emit('land',{b,v:b.vy});b.vy=Math.min(0,o.vy);b.on=true;b.ride=o;return 'hit'}}}
  }
 },
 move(b,dt){
  const n=Math.max(1,Math.ceil(Math.max(Math.abs(b.vx),Math.abs(b.vy))*dt/8));const sd=dt/n;
  for(let i=0;i<n;i++){
   if(this.axis(b,b.vx*sd,'x')==='tp')continue;
   if(this.axis(b,b.vy*sd,'y')==='tp')continue;
  }
 },
 overCells(b,fn){
  const x0=Math.floor((b.x-b.hw)/T),x1=Math.floor((b.x+b.hw-1e-6)/T),y0=Math.floor((b.y-b.hh)/T),y1=Math.floor((b.y+b.hh-1e-6)/T);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const r=fn(x,y,this.at(x,y));if(r)return r}
 },
 hazards(b){
  if(b.y>ROWS*T+60||b.y<-200||b.x<-100||b.x>COLS*T+100)return'out';
  return this.overCells(b,(x,y,c)=>{
   if(c==='~'&&b.y+b.hh>y*T+12)return'goo';
   if(c===':'&&Math.abs(b.x-(x*T+T/2))<b.hw+4)return'fizz';
   return null});
 },
 pad(b){if(b.vy<0)return;const cx=Math.floor(b.x/T),cy=Math.floor((b.y+b.hh-2)/T),c=this.at(cx,cy);
  if((c==='^'||c==='<'||c==='>')&&b.y+b.hh>cy*T+T-14){
   b.vy=-PAD_UP;b.jmp=false;if(c==='>')b.vx=PAD_SIDE;else if(c==='<')b.vx=-PAD_SIDE;else b.vx*=.3;b.on=false;b.y=Math.min(b.y,cy*T+T-14-b.hh);
   if(b.kind==='c'&&b.held){}this.emit('pad',{b,cx,cy})}},
 kill(b,why){
  if(b.kind==='p'){if(b.dead)return;b.dead=.9;b.deaths++;if(b.hold)this.drop(b);this.emit('die',{b,why,x:b.x,y:b.y})}
  else{if(b.gone)return;if(b.held)this.drop(b.held);b.gone=.8;this.emit('dissolve',{b,why,x:b.x,y:b.y})}
 },
 respawn(p){const s=this.spawn[p.r];p.x=s.x;p.y=s.y;p.vx=p.vy=0;p.dead=0;p.on=false;this.emit('spawn',{b:p})},
 respawnCube(c){c.x=c.d.cx*T+T/2;c.y=(c.d.cy+1)*T-CS-.01;c.vx=c.vy=0;c.gone=0;c.held=null;c.on=false;this.emit('cube',{b:c})},
 grab(p){
  if(p.hold){this.drop(p);return}
  let best=null,bd=60;
  for(const c of this.cubes){if(c.gone||c.held||c.remote)continue;const d=Math.hypot(c.x-p.x,c.y-p.y);if(d<bd){bd=d;best=c}}
  if(best){best.held=p;p.hold=best;best.own=p.r;best.ot=this.time;this.emit('grab',{b:p,c:best})}
 },
 drop(p){const c=p.hold;if(!c)return;c.held=null;p.hold=null;c.vx=p.on?p.vx*.3:p.vx;c.vy=Math.min(p.vy,0);this.emit('drop',{b:p,c})},
 // ---------- korak ----------
 stepPlayer(p,inp,dt){
  if(p.dead){p.dead-=dt;if(p.dead<=0)this.respawn(p);return}
  inp=inp||{};const dir=(inp.r?1:0)-(inp.l?1:0);
  if(dir&&dir!==p.face){p.face=dir;p.aim=Math.PI-p.aim}
  if(typeof inp.aim==='number'&&isFinite(inp.aim)){p.aim=inp.aim;const fx=Math.cos(p.aim);if(Math.abs(fx)>.05&&!dir)p.face=fx>0?1:-1}
  else if(inp.ar){p.aim+=inp.ar*p.face*2.6*dt}
  p.aim=Math.atan2(Math.sin(p.aim),Math.cos(p.aim));
  if(p.on){const tg=dir*WALK,a=2600*dt;p.vx=p.vx<tg?Math.min(tg,p.vx+a):Math.max(tg,p.vx-a);p.coy=.1}
  else{p.coy-=dt;
   if(dir){if(dir*p.vx<WALK)p.vx=dir>0?Math.min(WALK,p.vx+1500*dt):Math.max(-WALK,p.vx-1500*dt)}
   else if(Math.abs(p.vx)<=WALK+1){const a=380*dt;p.vx=Math.abs(p.vx)<a?0:p.vx-sgn(p.vx)*a}}
  if(inp.jp)p.jb=.12;else p.jb-=dt;
  if(p.jb>0&&p.coy>0){p.vy=-JUMP;p.jmp=true;p.on=false;p.coy=0;p.jb=0;this.emit('jump',{b:p})}
  if(!inp.j&&p.jmp&&p.vy<-JUMP*.45)p.vy=-JUMP*.45;
  p.vy=Math.min(p.vy+GRAV*dt,TERM);if(p.vy>=0)p.jmp=false;
  const wasOn=p.on;p.on=false;p.ride=null;
  this.move(p,dt);
  if(!p.on&&wasOn&&p.vy>=0){}// sišao s ruba
  p.walk=p.on?p.walk+Math.abs(p.vx)*dt:p.walk;
  const hz=this.hazards(p);
  if(hz==='fizz')this.clearPortals(p.r);
  else if(hz){this.kill(p,hz);return}
  const tp0=p.tp;this.pad(p);
  if(inp.gp)this.grab(p);
  if(inp.f0)this.shoot(p.r,0);
  if(inp.f1)this.shoot(p.r,1);
  p.inExit=!!this.overCells(p,(x,y,c)=>c==='E'&&Math.abs(p.x-(x*T+T/2))<T*.75);
 },
 stepCube(c,dt){
  if(c.gone){c.gone-=dt;if(c.gone<=0)this.respawnCube(c);return}
  if(c.remote)return;
  if(c.held){const p=c.held;if(p.dead||p.remote&&false){this.drop(p);return}
   const tx=p.x+p.face*30,ty=p.y-6;
   c.vx=Math.max(-1600,Math.min(1600,(tx-c.x)*20));c.vy=Math.max(-1600,Math.min(1600,(ty-c.y)*20));
   this.move(c,dt);c.on=false;
   if(Math.hypot(c.x-p.x,c.y-p.y)>110&&p.hold===c)this.drop(p);
  }else{
   if(c.on){const a=1400*dt;c.vx=Math.abs(c.vx)<a?0:c.vx-sgn(c.vx)*a}
   c.vy=Math.min(c.vy+GRAV*dt,TERM);c.on=false;this.move(c,dt);
  }
  const hz=this.hazards(c);if(hz){this.kill(c,hz);return}
  if(!c.held)this.pad(c);
 },
 stepMech(dt){
  const bs=this.bodies();
  for(const b of this.buttons){const x0=b.cx*T+3,x1=b.cx*T+T-3,y0=b.cy*T+T-16,y1=b.cy*T+T;
   const on=bs.some(o=>o.x+o.hw>x0&&o.x-o.hw<x1&&o.y+o.hh>y0&&o.y-o.hh<y1);
   if(on!==b.on){b.on=on;this.emit(on?'press':'release',{btn:b})}
   b.t+=((on?1:0)-b.t)*Math.min(1,dt*14)}
  for(const d of this.doors){
   let open=this.buttons.some(b=>b.l===d.l&&b.on);
   if(!open&&d.open){// ne zatvaraj na nekome
    const x0=d.cx*T,y0=d.cy*T;if(bs.some(o=>o.x+o.hw>x0&&o.x-o.hw<x0+T&&o.y+o.hh>y0&&o.y-o.hh<y0+T))open=true}
   if(open!==d.open){d.open=open;this.emit(open?'open':'close',{door:d})}
   d.t+=((open?1:0)-d.t)*Math.min(1,dt*9)}
  for(const r of['a','b'])for(const p of this.portals[r])if(p)p.t=Math.min(1,p.t+dt*5);
 },
 step(dt,inputs){
  this.time+=dt;
  for(const r of['a','b']){const p=this.players[r];if(!p.remote)this.stepPlayer(p,inputs&&inputs[r],dt)}
  for(const c of this.cubes)this.stepCube(c,dt);
  this.stepMech(dt);
 }
};
const PT={World,T,COLS,ROWS,PH,GRAV,WALK,JUMP};
if(typeof module!=='undefined'&&module.exports)module.exports=PT;else root.PT=PT;
})(this);
