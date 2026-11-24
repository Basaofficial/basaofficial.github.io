// Prolaz za dvoje 3D – fizika iz prvog lica, portali, mehanizmi (bez crtanja, radi i u Node-u).
(function(root){
'use strict';
const GRAV=20,WALK=5,GACC=45,AIRACC=14,JUMP=6.6,TERM=38,PHW=.3,PHH=.85,EYE=.7,CHW=.28;
const AIR=0,MET=1,WHT=2,GLS=3,GOO=4,FIZ=5,EXI=6,PAD=7;
const V=(x,y,z)=>({x,y,z});
const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
const cross=(a,b)=>V(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);
const add=(a,b,s)=>{s=s==null?1:s;return V(a.x+b.x*s,a.y+b.y*s,a.z+b.z*s)};
const sub=(a,b)=>V(a.x-b.x,a.y-b.y,a.z-b.z);
const len=a=>Math.hypot(a.x,a.y,a.z);
const fwd=(yaw,pitch)=>V(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));

/* ---------- graditelj nivoa ---------- */
function Builder(){this.objs=[]}
Builder.prototype={
 size(W,H,D){this.W=W;this.H=H;this.D=D;this.g=new Uint8Array(W*H*D);this.meta={}},
 k(x,y,z){return (y*this.D+z)*this.W+x},
 fill(x0,y0,z0,x1,y1,z1,t){for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++)for(let z=Math.min(z0,z1);z<=Math.max(z0,z1);z++)for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++)
  if(x>=0&&y>=0&&z>=0&&x<this.W&&y<this.H&&z<this.D)this.g[this.k(x,y,z)]=t},
 shell(t){const W=this.W-1,H=this.H-1,D=this.D-1;t=t||MET;
  this.fill(0,0,0,W,0,D,t);this.fill(0,H,0,W,H,D,t);this.fill(0,0,0,0,H,D,t);this.fill(W,0,0,W,H,D,t);this.fill(0,0,0,W,H,0,t);this.fill(0,0,D,W,H,D,t)},
 spawn(r,x,y,z,yaw){this.objs.push({t:'spawn',r,x,y,z,yaw:yaw||0})},
 exit(x0,y0,z0,x1,y1,z1){this.fill(x0,y0,z0,x1,y1,z1,EXI);this.objs.push({t:'exit',x0,y0,z0,x1,y1,z1})},
 button(id,x,y,z){this.objs.push({t:'button',id,x,y,z})},
 door(id,x0,y0,z0,x1,y1,z1){this.fill(x0,y0,z0,x1,y1,z1,AIR);this.objs.push({t:'door',id,x0,y0,z0,x1,y1,z1})},
 pad(x,y,z,vx,vy,vz){this.g[this.k(x,y,z)]=PAD;this.objs.push({t:'pad',x,y,z,v:[vx,vy,vz]})},
 cube(x,y,z,kind,dir){this.objs.push({t:'cube',x,y,z,kind:kind||'',dir:dir||0})},
 laser(x,y,z,dx,dy,dz){this.g[this.k(x,y,z)]=MET;this.objs.push({t:'laser',x,y,z,d:[dx,dy,dz]})},
 receiver(id,x,y,z){this.g[this.k(x,y,z)]=MET;this.objs.push({t:'recv',id,x,y,z})},
 light(x,y,z,c,i){this.objs.push({t:'light',x,y,z,c:c||'#fff4e0',i:i||1})},
 def(info){return Object.assign({W:this.W,H:this.H,D:this.D,g:Array.from(this.g),objs:this.objs},info)}
};

/* ---------- svijet ---------- */
function World(def){
 this.def=def;this.W=def.W;this.H=def.H;this.D=def.D;this.g=Uint8Array.from(def.g);
 this.doors=[];this.doorAt=new Map();this.buttons=[];this.pads=new Map();this.cubes=[];this.spawn={};this.lights=[];this.lasers=[];this.recvs=[];this.recvAt=new Map();this.beams=[];
 let did=0;
 for(const o of def.objs){
  if(o.t==='spawn')this.spawn[o.r]={p:V(o.x+.5,o.y+PHH+.001,o.z+.5),yaw:o.yaw};
  else if(o.t==='button')this.buttons.push({id:o.id,x:o.x,y:o.y,z:o.z,on:false,t:0});
  else if(o.t==='door'){const d={id:o.id,i:did++,cells:[],open:false,t:0,box:o};
   for(let y=o.y0;y<=o.y1;y++)for(let z=o.z0;z<=o.z1;z++)for(let x=o.x0;x<=o.x1;x++){const k=this.key(x,y,z);d.cells.push(k);this.doorAt.set(k,d)}
   this.doors.push(d)}
  else if(o.t==='pad')this.pads.set(this.key(o.x,o.y,o.z),{x:o.x,y:o.y,z:o.z,v:V(o.v[0],o.v[1],o.v[2])});
  else if(o.t==='cube'){const c={kind:'c',i:this.cubes.length,home:V(o.x+.5,o.y+CHW+.001,o.z+.5),p:V(o.x+.5,o.y+CHW+.001,o.z+.5),v:V(0,0,0),hw:CHW,hh:CHW,on:false,held:null,gone:0,tp:0,ot:0,prism:o.kind==='prism',dir:o.dir||0};this.cubes.push(c)}
  else if(o.t==='laser')this.lasers.push({x:o.x,y:o.y,z:o.z,d:V(o.d[0],o.d[1],o.d[2]),o:V(o.x+.5+o.d[0]*.51,o.y+.5+o.d[1]*.51,o.z+.5+o.d[2]*.51)});
  else if(o.t==='recv'){const r={id:o.id,x:o.x,y:o.y,z:o.z,on:false,hold:0,t:0};this.recvs.push(r);this.recvAt.set(this.key(o.x,o.y,o.z),r)}
  else if(o.t==='light')this.lights.push(o);
 }
 const mk=r=>{const s=this.spawn[r]||{p:V(2,2,2),yaw:0};return{kind:'p',r,p:V(s.p.x,s.p.y,s.p.z),v:V(0,0,0),hw:PHW,hh:PHH,yaw:s.yaw,pitch:0,on:false,coy:0,jb:0,
  hold:null,dead:0,inExit:false,deaths:0,tp:0,walk:0,remote:false}};
 this.players={a:mk('a'),b:mk('b')};
 this.portals={a:[null,null],b:[null,null]};this.pid=0;this.rev=0;
 this.time=0;this.ev=[];
}
World.prototype={
 emit(k,o){this.ev.push(Object.assign({k},o||{}))},
 key(x,y,z){return (y*this.D+z)*this.W+x},
 cell(x,y,z){if(x<0||y<0||z<0||x>=this.W||y>=this.H||z>=this.D)return MET;return this.g[(y*this.D+z)*this.W+x]},
 solid(x,y,z){const c=this.cell(x,y,z);if(c===MET||c===WHT||c===GLS)return true;const d=this.doorAt.get(this.key(x,y,z));return !!(d&&!d.open&&x>=0)},
 block(x,y,z){return this.solid(x,y,z)||this.cell(x,y,z)===FIZ},
 eye(p){return V(p.p.x,p.p.y+p.hh-.15,p.p.z)},
 fwd(p){return fwd(p.yaw,p.pitch)},
 bodies(){const a=[];for(const r of['a','b']){const p=this.players[r];if(!p.dead)a.push(p)}for(const c of this.cubes)if(!c.gone)a.push(c);return a},
 /* ----- portali ----- */
 linked(){const L=[];for(const r of['a','b']){const P=this.portals[r];if(P[0]&&P[1]){L.push([P[0],P[1]]);L.push([P[1],P[0]])}}return L},
 local(P,q){const d=sub(q,P.c);return V(dot(d,P.r),dot(d,P.u),dot(d,P.n))},
 xp(P,Q,q){const l=this.local(P,q);return add(add(add(Q.c,Q.r,-l.x),Q.u,l.y),Q.n,-l.z)},
 xd(P,Q,v){const l=V(dot(v,P.r),dot(v,P.u),dot(v,P.n));return add(add(V(Q.r.x*-l.x,Q.r.y*-l.x,Q.r.z*-l.x),Q.u,l.y),Q.n,-l.z)},
 ray(o,d,max){
  max=max||80;let x=Math.floor(o.x),y=Math.floor(o.y),z=Math.floor(o.z);
  if(this.block(x,y,z))return{x,y,z,n:V(0,0,0),h:o,t:0,inside:true};
  const sx=Math.sign(d.x),sy=Math.sign(d.y),sz=Math.sign(d.z);
  const tm=(o,c,dd)=>dd?((c+(dd>0?1:0))-o)/dd:Infinity;
  let tx=tm(o.x,x,d.x),ty=tm(o.y,y,d.y),tz=tm(o.z,z,d.z);
  const dx=d.x?1/Math.abs(d.x):Infinity,dy=d.y?1/Math.abs(d.y):Infinity,dz=d.z?1/Math.abs(d.z):Infinity;
  for(let i=0;i<600;i++){let t,n;
   if(tx<ty&&tx<tz){x+=sx;t=tx;tx+=dx;n=V(-sx,0,0)}else if(ty<tz){y+=sy;t=ty;ty+=dy;n=V(0,-sy,0)}else{z+=sz;t=tz;tz+=dz;n=V(0,0,-sz)}
   if(t>max)break;
   if(this.block(x,y,z))return{x,y,z,n,h:add(o,d,t),t};
  }
  return{miss:true,h:add(o,d,max),t:max,n:V(0,0,0)};
 },
 fitPortal(h,owner,kind,look){
  if(!h||h.miss||h.inside||this.cell(h.x,h.y,h.z)!==WHT)return null;
  const n=h.n;let u;
  if(n.y===0)u=V(0,1,0);
  else{const f=look||V(0,0,-1);u=Math.abs(f.x)>Math.abs(f.z)?V(Math.sign(f.x)||1,0,0):V(0,0,Math.sign(f.z)||-1);if(n.y<0)u=V(-u.x,-u.y,-u.z)}
  const r=cross(u,n);
  const cc=V(h.x+.5,h.y+.5,h.z+.5),t=dot(sub(h.h,cc),u);
  const ok=(cx,cy,cz)=>this.cell(cx,cy,cz)===WHT&&!this.solid(cx+n.x,cy+n.y,cz+n.z)&&this.cell(cx+n.x,cy+n.y,cz+n.z)!==FIZ;
  const tryPair=(o)=>{// o: pomak donje ćelije od pogođene (u smjeru u)
   const a=V(h.x+u.x*o,h.y+u.y*o,h.z+u.z*o),b=add(a,u);
   if(!ok(a.x,a.y,a.z)||!ok(b.x,b.y,b.z))return null;
   const c=add(V((a.x+b.x)/2+.5,(a.y+b.y)/2+.5,(a.z+b.z)/2+.5),n,.5);
   const cells=[this.key(a.x,a.y,a.z),this.key(b.x,b.y,b.z)];
   for(const rr of['a','b'])for(let k=0;k<2;k++){if(rr===owner&&k===kind)continue;const q=this.portals[rr][k];
    if(q&&q.n.x===n.x&&q.n.y===n.y&&q.n.z===n.z&&q.cells.some(x=>cells.includes(x)))return null}
   return{c,n,u,r,cells,a,b};
  };
  const order=t>=0?[0,-1]:[-1,0];
  for(const o of order){let P=tryPair(o);if(!P)continue;
   // zid: ako ispod ostaje jedna ćelija do poda – spusti portal na pod
   if(n.y===0){const below=V(P.a.x,P.a.y-1,P.a.z);
    if(ok(below.x,below.y,below.z)&&this.solid(below.x+n.x,below.y-1,below.z+n.z)){const Q=tryPair(o-1);if(Q)P=Q}}
   return P}
  return null;
 },
 shoot(r,kind){
  const p=this.players[r];if(p.dead)return null;
  const o=this.eye(p),f=this.fwd(p),h=this.ray(o,f);
  const P=this.fitPortal(h,r,kind,f);
  if(P){P.owner=r;P.kind=kind;P.t=0;P.id=++this.pid;this.portals[r][kind]=P;this.rev++;this.emit('portal',{r,kind,P,o,h:h.h})}
  else this.emit('fizz',{r,kind,o,h:h.h,n:h.n});
  return P;
 },
 setPortal(r,kind,P){if(P){P.owner=r;P.kind=kind;P.t=P.t||0;P.id=P.id||++this.pid}this.portals[r][kind]=P;this.rev++},
 clearPortals(r){if(this.portals[r][0]||this.portals[r][1]){this.portals[r]=[null,null];this.rev++;this.emit('clear',{r})}},
 /* ----- sudari ----- */
 hole(b,k){
  for(const r of['a','b']){const P=this.portals[r];if(!P[0]||!P[1])continue;
   for(const X of P)if(X.cells[0]===k||X.cells[1]===k){const l=this.local(X,b.p);
    const ex=Math.abs(dot(V(b.hw,b.hh,b.hw),V(Math.abs(X.r.x),Math.abs(X.r.y),Math.abs(X.r.z)))),ey=Math.abs(dot(V(b.hw,b.hh,b.hw),V(Math.abs(X.u.x),Math.abs(X.u.y),Math.abs(X.u.z))));
    if(Math.abs(l.x)<=.5-ex+.02&&Math.abs(l.y)<=1-ey+.02&&l.z>-1.6&&l.z<1.6)return true}}
  return false;
 },
 hits(b){
  const x0=Math.floor(b.p.x-b.hw+1e-6),x1=Math.floor(b.p.x+b.hw-1e-6),y0=Math.floor(b.p.y-b.hh+1e-6),y1=Math.floor(b.p.y+b.hh-1e-6),z0=Math.floor(b.p.z-b.hw+1e-6),z1=Math.floor(b.p.z+b.hw-1e-6);
  for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)if(this.solid(x,y,z)&&!this.hole(b,this.key(x,y,z)))return true;
  return false;
 },
 boxHit(b,ax,d){// kocke kao prepreke za igrače / igrači i kocke kao podloga odozgo
  for(const o of this.bodies()){if(o===b||o===b.hold||b.held===o||o.held)continue;
   if(Math.abs(b.p.x-o.p.x)>=b.hw+o.hw-1e-4||Math.abs(b.p.z-o.p.z)>=b.hw+o.hw-1e-4||Math.abs(b.p.y-o.p.y)>=b.hh+o.hh-1e-4)continue;
   if(ax==='y'&&d<0&&b.p.y-b.hh-d>=o.p.y+o.hh-.02)return o;
   if(ax!=='y'&&o.kind==='c'&&b.p.y-b.hh<o.p.y+o.hh-.25)return o;
  }
  return null;
 },
 axis(b,ax,d){
  if(!d)return;const old=b.p[ax];b.p[ax]+=d;
  if(this.hits(b)){
   const h=ax==='y'?b.hh:b.hw;
   if(d>0)b.p[ax]=Math.floor(b.p[ax]+h-1e-6)-h-1e-4;else b.p[ax]=Math.floor(b.p[ax]-h+1e-6)+1+h+1e-4;
   if(this.hits(b))b.p[ax]=old;
   if(ax==='y'){if(d<0){if(b.v.y<-9)this.emit('land',{b,v:-b.v.y});if(b.kind==='c'&&!b.held&&!b.on&&b.v.y<-4){b.v.x*=.5;b.v.z*=.5}b.on=true}b.v.y=0}
   else{b.v[ax]=b.kind==='c'&&!b.held?-b.v[ax]*.2:0}
   return;
  }
  const o=this.boxHit(b,ax,d);
  if(o){if(ax==='y'){b.p.y=o.p.y+o.hh+b.hh+1e-4;if(b.v.y<-9)this.emit('land',{b,v:-b.v.y});b.v.y=Math.max(0,o.v.y);b.on=true;b.ride=o}
   else{// guranje kocke
    if(b.kind==='p'&&o.kind==='c'&&!o.remote&&!this._push){this._push=true;const ov=o.p[ax];this.axis(o,ax,d*.92);this._push=false;
     if(o.p[ax]!==ov){o.v[ax]=b.v[ax]*.9;b.p[ax]=old+d*.92;if(this.hits(b)||this.boxHit(b,ax,0))b.p[ax]=old;b.v[ax]*=.9;return}}
    b.p[ax]=old;b.v[ax]=0}}
 },
 portalCross(b,prev){
  if(b.held)return false;
  for(const[P,Q]of this.linked()){
   const l0=this.local(P,prev),l1=this.local(P,b.p);
   if(l0.z>=-.001&&l1.z<0&&Math.abs(l1.x)<.5&&Math.abs(l1.y)<1){this.teleport(b,P,Q);return true}}
  return false;
 },
 teleport(b,P,Q){
  b.p=this.xp(P,Q,b.p);b.v=this.xd(P,Q,b.v);
  const vn=dot(b.v,Q.n),mn=Q.n.y>.5?4.6:2;if(vn<mn)b.v=add(b.v,Q.n,mn-vn);
  {// tijelo mora stati u izlazni otvor
   const l=this.local(Q,b.p),ab=v=>Math.abs(v);
   const ex=b.hw*(ab(Q.r.x)+ab(Q.r.z))+b.hh*ab(Q.r.y),ey=b.hw*(ab(Q.u.x)+ab(Q.u.z))+b.hh*ab(Q.u.y);
   const lx=Math.max(-(.5-ex),Math.min(.5-ex,l.x)),ly=Math.max(-(1-ey),Math.min(1-ey,l.y));
   b.p=add(add(add(Q.c,Q.r,lx),Q.u,ly),Q.n,Math.max(l.z,0)+.002)}
  if(b.kind==='p'){const f=this.xd(P,Q,fwd(b.yaw,b.pitch));let pt=Math.asin(Math.max(-1,Math.min(1,f.y)));
   const hz=Math.hypot(f.x,f.z);if(hz>.05)b.yaw=Math.atan2(-f.x,-f.z);else{const uu=this.xd(P,Q,V(-Math.sin(b.yaw),0,-Math.cos(b.yaw)));b.yaw=Math.atan2(-uu.x,-uu.z)}
   b.pitch=Math.max(-.9,Math.min(.9,pt));
   if(b.hold){const c=b.hold;c.p=V(b.p.x,b.p.y,b.p.z);c.v=V(b.v.x,b.v.y,b.v.z);c.tpGrace=.4}}
  b.on=false;b.jmp=false;b.tp++;this.emit('tp',{b,P,Q});
 },
 move(b,dt){
  const sp=Math.max(Math.abs(b.v.x),Math.abs(b.v.y),Math.abs(b.v.z));
  const n=Math.max(1,Math.ceil(sp*dt/.04)),sd=dt/n;
  for(let i=0;i<n;i++){
   const prev=V(b.p.x,b.p.y,b.p.z);
   this.axis(b,'y',b.v.y*sd);this.axis(b,'x',b.v.x*sd);this.axis(b,'z',b.v.z*sd);
   if(this.portalCross(b,prev))continue;
  }
 },
 // ispred portala blago centriraj tijelo da lakše prođe
 funnel(b,dt){
  if(b.held)return;
  for(const[P]of this.linked()){const l=this.local(P,b.p);
   const ab=Math.abs,ex=b.hw*(ab(P.r.x)+ab(P.r.z))+b.hh*ab(P.r.y),ey=b.hw*(ab(P.u.x)+ab(P.u.z))+b.hh*ab(P.u.y);
   const vin=-dot(b.v,P.n);if(P.n.y===0&&vin<.5)continue;
   const reach=(P.n.y!==0?b.hh+.15:b.hw+.6)+Math.max(0,vin)*.12;
   if(l.z<0||l.z>reach||ab(l.x)>.5+ex-.02||ab(l.y)>1+ey-.02)continue;
   const sp=(3+Math.max(0,vin)*1.5)*dt;
   for(const[ax,val,lim]of[[P.r,l.x,.5-ex-.01],[P.u,l.y,1-ey-.01]]){if(lim<=0||ab(val)<=lim)continue;
    const want=Math.sign(val)*lim-val,s=Math.sign(want)*Math.min(ab(want),sp);
    const old=V(b.p.x,b.p.y,b.p.z);b.p=add(b.p,ax,s);if(this.hits(b))b.p=old}
  }
 },
 cellAt(q){return this.cell(Math.floor(q.x),Math.floor(q.y),Math.floor(q.z))},
 hazards(b){
  if(b.p.y<-6)return'out';
  const foot=V(b.p.x,b.p.y-b.hh+.05,b.p.z);
  if(this.cellAt(foot)===GOO&&foot.y-Math.floor(foot.y)<.6)return'goo';
  if(this.cellAt(b.p)===GOO)return'goo';
  if(this.cellAt(b.p)===FIZ||this.cellAt(V(b.p.x,b.p.y+b.hh*.6,b.p.z))===FIZ)return'fizz';
  return null;
 },
 pad(b){if(b.v.y>.5)return;const fx=Math.floor(b.p.x),fz=Math.floor(b.p.z),fy=Math.floor(b.p.y-b.hh+.05);
  const P=this.pads.get(this.key(fx,fy,fz));if(!P||b.p.y-b.hh>fy+.3)return;
  b.v=V(P.v.x,P.v.y,P.v.z);b.on=false;b.jmp=false;this.emit('pad',{b,P})},
 kill(b,why){
  if(b.kind==='p'){if(b.dead)return;b.dead=1;b.deaths++;if(b.hold)this.drop(b);this.emit('die',{b,why,p:V(b.p.x,b.p.y,b.p.z)})}
  else{if(b.gone)return;if(b.held)this.drop(b.held);b.gone=.9;this.emit('dissolve',{b,why,p:V(b.p.x,b.p.y,b.p.z)})}
 },
 respawn(p){const s=this.spawn[p.r];p.p=V(s.p.x,s.p.y,s.p.z);p.v=V(0,0,0);p.yaw=s.yaw;p.pitch=0;p.dead=0;p.on=false;this.emit('spawn',{b:p})},
 respawnCube(c){c.p=V(c.home.x,c.home.y+.6,c.home.z);c.v=V(0,0,0);c.gone=0;c.held=null;this.emit('cube',{b:c})},
 grab(p){
  if(p.hold){this.drop(p);return}
  const e=this.eye(p),f=this.fwd(p);let best=null,bs=-1;
  for(const c of this.cubes){if(c.gone||c.held||c.locked)continue;const d=sub(c.p,e),L=len(d);if(L>7)continue;const s=dot(d,f)/L;
   const need=L<2.4?.6:.93;if(s<need)continue;
   if(L>1.2){const h=this.ray(e,V(d.x/L,d.y/L,d.z/L),L);if(!h.miss&&h.t<L-.35)continue}
   const sc=s-L*.01;if(sc>bs){bs=sc;best=c}}
  if(best){best.held=p;p.hold=best;best.ot=this.time;best.grabT=.8;this.emit('grab',{b:p,c:best,far:len(sub(best.p,e))>2.4})}
  else this.emit('nograb',{b:p})
 },
 throwCube(p){const c=p.hold;if(!c)return;const f=this.fwd(p);c.held=null;p.hold=null;c.v=V(p.v.x+f.x*13,p.v.y+f.y*13+1.5,p.v.z+f.z*13);c.spin=1;this.emit('throw',{b:p,c})},
 drop(p){const c=p.hold;if(!c)return;c.held=null;p.hold=null;c.v=V(p.v.x*.5,Math.min(p.v.y,0),p.v.z*.5);this.emit('drop',{b:p,c})},
 crouch(p,want){
  if(want&&!p.crouch){p.crouch=true;const d=PHH-.55;p.hh=.55;if(p.on||p.on0)p.p.y-=d;else p.p.y+=d*0;}
  else if(!want&&p.crouch){const old=p.p.y,d=PHH-.55;p.hh=PHH;if(p.on||p.on0)p.p.y+=d;if(this.hits(p)){p.p.y=old-(p.on||p.on0?0:d);p.hh=PHH;if(this.hits(p)){p.p.y=old;p.hh=.55;p.crouchBlock=true;return}}p.crouch=false}
  p.crouchBlock=false;
 },
 separate(p){
  for(const r of['a','b']){const o=this.players[r];if(o===p||o.dead||o.hidden)continue;
   const dx=p.p.x-o.p.x,dz=p.p.z-o.p.z,d=Math.hypot(dx,dz),m=p.hw+o.hw;
   if(d>=m||Math.abs(p.p.y-o.p.y)>=p.hh+o.hh-.2)continue;
   const k=(m-d)*.5/(d||1),old=V(p.p.x,p.p.y,p.p.z);p.p.x+=(d?dx:1)*k;p.p.z+=(d?dz:0)*k;if(this.hits(p))p.p=old}
 },
 /* ----- korak ----- */
 stepPlayer(p,I,dt){
  if(p.dead){p.dead-=dt;if(p.dead<=0)this.respawn(p);return}
  I=I||{};
  if(typeof I.yaw==='number'&&isFinite(I.yaw))p.yaw=I.yaw;
  if(typeof I.pitch==='number'&&isFinite(I.pitch))p.pitch=Math.max(-1.5,Math.min(1.5,I.pitch));
  const mx=I.mx||0,mz=I.mz||0,sy=Math.sin(p.yaw),cy=Math.cos(p.yaw);
  let wx=-sy*mz+cy*mx,wz=-cy*mz-sy*mx;let wl=Math.hypot(wx,wz);if(wl>1){wx/=wl;wz/=wl;wl=1}
  // čučanj
  this.crouch(p,!!I.c);
  const maxs=(p.crouch?2.4:I.walk?2.6:WALK)*wl,dx=wl>1e-3?wx/wl:0,dz=wl>1e-3?wz/wl:0;
  const accel=(ws,acc,cap)=>{const cur=p.v.x*dx+p.v.z*dz,add=Math.min(ws,cap)-cur;if(add<=0)return;const a=Math.min(acc*ws*dt,add);p.v.x+=dx*a;p.v.z+=dz*a};
  if(p.on){const hs=Math.hypot(p.v.x,p.v.z);if(hs>0){const ctl=Math.max(hs,1.6),drop=ctl*7*dt,ns=Math.max(0,hs-drop)/hs;p.v.x*=ns;p.v.z*=ns}
   accel(maxs,11,maxs);p.coy=.12}
  else{p.coy-=dt;accel(maxs,10,2)}
  if(I.jp)p.jb=.12;else p.jb-=dt;
  if(p.jb>0&&p.coy>0&&!p.crouchBlock){p.v.y=JUMP;p.jmp=true;p.on=false;p.coy=0;p.jb=0;this.emit('jump',{b:p})}
  if(!I.j&&p.jmp&&p.v.y>JUMP*.45)p.v.y=JUMP*.45;
  p.v.y=Math.max(p.v.y-GRAV*dt,-TERM);if(p.v.y<=0)p.jmp=false;
  p.on=false;p.ride=null;
  const wasOn=p.on0;
  this.move(p,dt);this.funnel(p,dt);this.separate(p);p.on0=p.on;
  if(p.on){const st=Math.hypot(p.v.x,p.v.z)*dt;p.walk+=st;p.stepD=(p.stepD||0)+st;if(p.stepD>1.9){p.stepD=0;this.emit('step',{b:p})}}
  const hz=this.hazards(p);
  if(hz==='fizz')this.clearPortals(p.r);else if(hz){this.kill(p,hz);return}
  this.pad(p);
  if(I.th&&p.hold)this.throwCube(p);else if(I.gp)this.grab(p);
  if(I.f0)this.shoot(p.r,0);
  if(I.f1)this.shoot(p.r,1);
  p.inExit=this.cellAt(p.p)===EXI||this.cellAt(V(p.p.x,p.p.y-.6,p.p.z))===EXI;
 },
 stepCube(c,dt){
  if(c.gone){c.gone-=dt;if(c.gone<=0)this.respawnCube(c);return}
  if(c.remote)return;
  if(c.held){const p=c.held;if(p.dead){this.drop(p);return}
   const e=this.eye(p),f=this.fwd(p),t=add(e,f,1.45);t.y=Math.max(t.y,p.p.y-p.hh+c.hh+.02);
   const d=sub(t,c.p);c.v=V(d.x*16,d.y*16,d.z*16);const L=len(c.v);if(L>30)c.v=V(c.v.x*30/L,c.v.y*30/L,c.v.z*30/L);
   this.move(c,dt);c.on=false;
   if(c.grabT>0)c.grabT-=dt;
   if(c.tpGrace>0)c.tpGrace-=dt;else if(c.grabT<=0&&len(sub(c.p,t))>3.2)this.drop(p);
  }else{
   if(c.on){const hs=Math.hypot(c.v.x,c.v.z),a=Math.min(hs,30*dt);if(hs>0){c.v.x-=c.v.x/hs*a;c.v.z-=c.v.z/hs*a}}
   c.v.y=Math.max(c.v.y-GRAV*dt,-TERM);c.on=false;this.move(c,dt);this.funnel(c,dt);
   this.pad(c);
  }
  const hz=this.hazards(c);if(hz)this.kill(c,hz);
 },
 laserBlock(x,y,z){const c=this.cell(x,y,z);if(c===MET||c===WHT)return true;const d=this.doorAt.get(this.key(x,y,z));return !!(d&&!d.open)},
 laserWall(o,d){let x=Math.floor(o.x),y=Math.floor(o.y),z=Math.floor(o.z);
  if(this.laserBlock(x,y,z))return{x,y,z,t:0};
  const sx=Math.sign(d.x),sy=Math.sign(d.y),sz=Math.sign(d.z);const tm=(o,c,dd)=>dd?((c+(dd>0?1:0))-o)/dd:Infinity;
  let tx=tm(o.x,x,d.x),ty=tm(o.y,y,d.y),tz=tm(o.z,z,d.z);const dx=d.x?1/Math.abs(d.x):Infinity,dy=d.y?1/Math.abs(d.y):Infinity,dz=d.z?1/Math.abs(d.z):Infinity;
  for(let i=0;i<400;i++){let t;if(tx<ty&&tx<tz){x+=sx;t=tx;tx+=dx}else if(ty<tz){y+=sy;t=ty;ty+=dy}else{z+=sz;t=tz;tz+=dz}
   if(t>120)break;if(this.laserBlock(x,y,z))return{x,y,z,t}}
  return{t:120}},
 slab(o,d,b){let t0=1e-4,t1=1e9;for(const ax of['x','y','z']){const h=ax==='y'?b.hh:b.hw,mn=b.p[ax]-h,mx=b.p[ax]+h;
  if(Math.abs(d[ax])<1e-9){if(o[ax]<mn||o[ax]>mx)return null;continue}let a=(mn-o[ax])/d[ax],c=(mx-o[ax])/d[ax];if(a>c){const q=a;a=c;c=q}t0=Math.max(t0,a);t1=Math.min(t1,c);if(t0>t1)return null}
  return t0},
 trace(L){
  const segs=[];let o=L.o,d=L.d,skip=null;
  for(let i=0;i<12;i++){
   const w=this.laserWall(o,d);let best={t:w.t,k:'wall',w};
   for(const b of this.bodies()){if(b===skip||b.hidden)continue;const t=this.slab(o,d,b);if(t!=null&&t<best.t)best={t,k:'body',b}}
   for(const[P,Q]of this.linked()){const dn=dot(d,P.n);if(dn>-1e-6)continue;const t=dot(sub(P.c,o),P.n)/dn;if(t<1e-4||t>best.t+1e-3)continue;
    const h=add(o,d,t),l=this.local(P,h);if(Math.abs(l.x)<.5&&Math.abs(l.y)<1)best={t,k:'portal',P,Q,h}}
   const e=add(o,d,best.t);segs.push({a:o,b:e,k:best.k});
   if(best.k==='portal'){o=add(this.xp(best.P,best.Q,best.h),best.Q.n,.003);d=this.xd(best.P,best.Q,d);const l=len(d);d=V(d.x/l,d.y/l,d.z/l);skip=null;continue}
   if(best.k==='body'){const b=best.b;if(b.kind==='p'){b.laser=true;break}
    if(b.prism&&!b.gone){const yw=b.held?b.held.yaw:b.dir;d=V(-Math.sin(yw),0,-Math.cos(yw));o=V(b.p.x,b.p.y,b.p.z);skip=b;b.lit=true;continue}break}
   if(best.w&&best.w.x!=null){const r=this.recvAt.get(this.key(best.w.x,best.w.y,best.w.z));if(r)r.hitNow=true}
   break}
  return segs;
 },
 stepLasers(dt){
  if(!this.lasers.length){this.beams=[];return}
  for(const p of Object.values(this.players))p.laser=false;for(const c of this.cubes){c.lit=false;if(c.prism&&c.held)c.dir=c.held.yaw}for(const r of this.recvs)r.hitNow=false;
  const B=[];for(const L of this.lasers)B.push(...this.trace(L));this.beams=B;
  for(const r of this.recvs){if(r.hitNow)r.hold=.12;else r.hold-=dt;const on=r.hold>0;if(on!==r.on){r.on=on;this.emit(on?'press':'release',{btn:r})}r.t+=((on?1:0)-r.t)*Math.min(1,dt*10)}
  for(const r of['a','b']){const p=this.players[r];if(p.remote||p.dead)continue;
   if(p.laser){p.heat=(p.heat||0)+dt;if(p.heat>.55){p.heat=0;this.kill(p,'laser')}}else p.heat=Math.max(0,(p.heat||0)-dt*1.5)}
 },
 stepMech(dt){
  this.stepLasers(dt);
  const bs=this.bodies();
  for(const b of this.buttons){
   const on=bs.some(o=>o.p.x+o.hw>b.x+.12&&o.p.x-o.hw<b.x+.88&&o.p.z+o.hw>b.z+.12&&o.p.z-o.hw<b.z+.88&&o.p.y-o.hh<b.y+.35&&o.p.y+o.hh>b.y);
   if(on!==b.on){b.on=on;this.emit(on?'press':'release',{btn:b})}
   b.t+=((on?1:0)-b.t)*Math.min(1,dt*14)}
  for(const d of this.doors){
   let open=this.buttons.some(b=>b.id===d.id&&b.on)||this.recvs.some(b=>b.id===d.id&&b.on);
   if(!open&&d.open){const o=d.box;if(bs.some(q=>q.p.x+q.hw>o.x0&&q.p.x-q.hw<o.x1+1&&q.p.y+q.hh>o.y0&&q.p.y-q.hh<o.y1+1&&q.p.z+q.hw>o.z0&&q.p.z-q.hw<o.z1+1))open=true}
   if(open!==d.open){d.open=open;this.emit(open?'open':'close',{door:d})}
   d.t+=((open?1:0)-d.t)*Math.min(1,dt*6)}
  for(const r of['a','b'])for(const P of this.portals[r])if(P)P.t=Math.min(1,P.t+dt*4);
 },
 step(dt,inputs){
  this.time+=dt;
  for(const r of['a','b']){const p=this.players[r];if(!p.remote)this.stepPlayer(p,inputs&&inputs[r],dt)}
  for(const c of this.cubes)this.stepCube(c,dt);
  this.stepMech(dt);
 }
};
const PT3={World,Builder,V,dot,cross,add,sub,len,fwd,T:{AIR,MET,WHT,GLS,GOO,FIZ,EXI,PAD},PHW,PHH,EYE,CHW,WALK,GRAV,JUMP};
if(typeof module!=='undefined'&&module.exports)module.exports=PT3;else root.PT3=PT3;
})(this);
