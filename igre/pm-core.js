// Pido i Mico – fizika i mehanizmi (bez crtanja, radi i u Node-u za testove).
(function(root){
'use strict';
const W=36,H=22,G=70,JV=Math.sqrt(2*G*3.75),SPEED=8.2,CW=.7,CH=.95,E=1e-4;
const ov=(a,b)=>a.x<b.x+b.w-E&&a.x+a.w>b.x+E&&a.y<b.y+b.h-E&&a.y+a.h>b.y+E;
const deadly=(c,t)=>c==='A'||(c==='L'&&t==='w')||(c==='V'&&t==='f');

function mkChar(t,s){const x=s[0]+.15,y=s[1]+1-CH;
 return{t,ch:1,x,y,w:CW,h:CH,vx:0,vy:0,on:false,coy:0,buf:0,pj:0,face:1,dead:false,rt:0,safe:{x,y},door:false,sq:1,blink:3,ice:false,push:0,fan:null,deaths:0,trail:[]}}

function World(def){
 this.def=def;this.grid=def.grid.map(r=>r.split(''));
 this.gems=def.gems.map(g=>({x:g.x,y:g.y,t:g.t,got:false}));
 this.doors=def.doors;this.movers=[];this.levers=[];this.btns=[];this.bars=[];this.boxes=[];this.fans=[];this.cr=new Map();
 for(const o of def.o){
  if(o[0]==='lev')this.levers.push({x:o[1],y:o[2],g:o[3],on:false,ts:0});
  else if(o[0]==='btn')this.btns.push({x:o[1],y:o[2],g:o[3],p:false,d:0});
  else if(o[0]==='mov'){const[,x,y,w,h,dx,dy,g,op]=o;this.movers.push({x0:x,y0:y,x,y,w,h,dx,dy,g,inv:!!op.inv,spd:op.spd||3,p:0,auto:0,mv:0})}
  else if(o[0]==='auto'){const[,x,y,w,h,dx,dy,per]=o;this.movers.push({x0:x,y0:y,x,y,w,h,dx,dy,per,auto:1,p:0,mv:0})}
  else if(o[0]==='bar')this.bars.push({x:o[1],y:o[2],w:1,h:o[3],el:o[4]});
 }
 for(const b of def.boxes)this.boxes.push({box:1,x:b[0]+.02,y:b[1],w:.96,h:1,vx:0,vy:0,on:false,fan:null,moved:0});
 for(const[fx,fy,range,g,dir]of def.fans){
  let t=fy-1;while(t>=1&&this.grid[t][fx]===' ')t--;// t = prvo puno polje iznad
  const tgt=Math.max(fy-range,t+1+CH+.08),top=Math.max(t+1,tgt-2.5);
  this.fans.push({x:fx,y:fy,g,tgt,top,dir:dir||0});
 }
 this.chars=[mkChar('f',def.st.f),mkChar('w',def.st.w)];
 this.time=0;this.ev=[];
}
World.prototype={
 emit(k,o){this.ev.push(Object.assign({k},o||{}))},
 tile(x,y){if(x<0||y<0||x>=W||y>=H)return'#';const c=this.grid[y][x];if(c==='C'){const s=this.cr.get(y*W+x);if(s&&s.gone)return' '}return c},
 sig(g){if(!g)return true;for(const l of this.levers)if(l.g===g&&l.on)return true;for(const b of this.btns)if(b.g===g&&b.p)return true;return false},
 hits(e,skip){
  const r=[],x0=Math.floor(e.x+E),x1=Math.floor(e.x+e.w-E),y0=Math.floor(e.y+E),y1=Math.floor(e.y+e.h-E);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(this.tile(x,y)!==' ')r.push({x,y,w:1,h:1});
  for(const m of this.movers)if(m!==skip&&ov(e,m))r.push(m);
  for(const b of this.bars)if((e.box||b.el!==e.t)&&ov(e,b))r.push(b);
  for(const b of this.boxes)if(b!==e&&b!==skip&&ov(e,b))r.push(b);
  return r;
 },
 free(e,skip){return!this.hits(e,skip).length},
 move(e,ax,d,skip,depth){
  if(!d)return false;depth=depth||0;
  e[ax]+=d;
  if(ax==='x'&&depth<3&&(e.ch||e.box)){
   for(const b of this.boxes)if(b!==e&&b!==skip&&ov(e,b)&&e.y+e.h>b.y+.3&&e.y<b.y+b.h-.3){
    const pen=d>0?(e.x+e.w)-b.x:e.x-(b.x+b.w);if(Math.abs(pen)>.6)continue;
    const bx=b.x;this.move(b,'x',pen,skip,depth+1);if(b.x!==bx){b.moved+=Math.abs(b.x-bx);b.by=e.ch?e.t:b.by;b.pt=this.time;if(e.ch)e.push=.08}}
  }
  const hs=this.hits(e,skip);if(!hs.length)return false;
  const sz=ax==='x'?'w':'h';
  if(d>0){let m=Infinity;for(const r of hs)m=Math.min(m,r[ax]-e[sz]);e[ax]=Math.min(m,e[ax])}
  else{let m=-Infinity;for(const r of hs)m=Math.max(m,r[ax]+r[sz]);e[ax]=Math.max(m,e[ax])}
  return true;
 },
 isOn(e,r){return Math.abs(e.y+e.h-r.y)<.06&&e.x+e.w>r.x+.02&&e.x<r.x+r.w-.02&&e.vy>-1},
 ents(){const a=[];for(const c of this.chars)if(!c.dead&&!c.remote)a.push(c);for(const b of this.boxes)if(!b.remote)a.push(b);return a},
 tryMove(m,ddx,ddy){
  const ents=this.ents(),snap=ents.map(e=>[e,e.x,e.y]),mx=m.x,my=m.y;
  const rid=[];for(const e of ents)if(this.isOn(e,m))rid.push(e);
  for(let i=0;i<rid.length;i++)if(rid[i].box)for(const e of ents)if(!rid.includes(e)&&this.isOn(e,rid[i]))rid.push(e);
  let ok=true;
  if(ddy){
   if(ddy<0){rid.sort((a,b)=>a.y-b.y);for(const r of rid){const y=r.y;this.move(r,'y',ddy,m);if(Math.abs(r.y-(y+ddy))>1e-3){ok=false;break}}}
   if(ok){m.y+=ddy;for(const e of ents)if(ov(e,m)){const pen=ddy>0?(m.y+m.h)-e.y:m.y-(e.y+e.h);this.move(e,'y',pen,m);if(ov(e,m)){ok=false;break}}}
   if(ok&&ddy>0){rid.sort((a,b)=>b.y-a.y);for(const r of rid)this.move(r,'y',ddy,m)}
  }
  if(ok&&ddx){
   m.x+=ddx;for(const e of ents)if(ov(e,m)){const pen=ddx>0?(m.x+m.w)-e.x:m.x-(e.x+e.w);this.move(e,'x',pen,m);if(ov(e,m)){ok=false;break}}
   if(ok)for(const r of rid)if(!ov(r,m))this.move(r,'x',ddx,m);
  }
  if(!ok){m.x=mx;m.y=my;for(const[e,x,y]of snap){e.x=x;e.y=y}return false}
  if(!m.auto)for(const r of rid)if(r.ch)r.ride=(r.ride||0)+Math.abs(ddx)+Math.abs(ddy);
  return true;
 },
 fanAt(e){const cx=e.x+e.w/2,fy=e.y+e.h;
  for(const f of this.fans){if(cx<f.x||cx>=f.x+1||fy>f.y+.02||fy<f.top)continue;if(f.g&&!this.sig(f.g))continue;return f}return null},
 applyFan(e,f,dt){const ft=e.y+e.h;const a=Math.max(0,Math.min(3*G,G+32*(ft-f.tgt)+5*e.vy));e.vy+=(G-a)*dt;e.vy=Math.max(-12,Math.min(e.vy,14));
  if(f.dir&&Math.abs(ft-f.tgt)<1.2)this.move(e,'x',f.dir*(e.box?1.8:1.2)*dt)},
 kill(c){if(c.dead)return;c.dead=true;c.rt=1.1;c.deaths++;c.door=false;this.emit('die',{c})},
 respawn(c){
  c.dead=false;c.x=c.safe.x;c.y=c.safe.y;c.vx=c.vy=0;c.on=false;c.trail=[];
  if(!this.free(c)){const s=this.def.st[c.t];c.x=s[0]+.15;c.y=s[1]+1-CH}
  this.emit('spawn',{c});
 },
 step(dt,inp,at){
  this.time+=dt;const T=at==null?this.time:at;
  // pokretne platforme i vrata
  for(const m of this.movers){
   let np;
   if(m.auto)np=.5-.5*Math.cos(2*Math.PI*T/m.per);
   else{let tp=this.sig(m.g)?1:0;if(m.inv)tp=1-tp;const len=Math.hypot(m.dx,m.dy)||1,st=m.spd*dt/len;np=Math.abs(tp-m.p)<=st?tp:m.p+Math.sign(tp-m.p)*st}
   m.mv=0;if(Math.abs(np-m.p)<1e-7){if(np!==m.p&&!m.auto&&(np===0||np===1)){m.p=np;m.x=m.x0+m.dx*np;m.y=m.y0+m.dy*np}continue}
   if(this.tryMove(m,m.x0+m.dx*np-m.x,m.y0+m.dy*np-m.y)){m.mv=np>m.p?1:-1;if(!m.auto&&(np===0||np===1))this.emit('stop',{m});m.p=np}
  }
  // likovi
  for(const c of this.chars){if(c.remote)continue;
   if(c.dead){c.rt-=dt;if(c.rt<=0)this.respawn(c);continue}
   const ip=inp[c.t]||{},jEdge=ip.j&&!c.pj;c.pj=ip.j;c.push=Math.max(0,c.push-dt);
   const tgt=((ip.r?1:0)-(ip.l?1:0))*SPEED*(c.push>0?.62:1);
   const k=c.on?(c.ice?2.4:20):(c.ice?4:11);
   c.vx+=(tgt-c.vx)*Math.min(1,dt*k);if(tgt)c.face=Math.sign(tgt);
   c.coy=c.on?.09:c.coy-dt;c.buf=jEdge?.13:c.buf-dt;
   if(c.buf>0&&c.coy>0){c.vy=-JV;c.buf=0;c.coy=0;c.on=false;c.sq=1.25;this.emit('jump',{c})}
   if(!ip.j&&c.vy<-7)c.vy+=G*dt*1.6;
   const f=this.fanAt(c);c.fan=f;
   if(f){this.applyFan(c,f,dt);c.coy=0}else c.vy=Math.min(c.vy+G*dt,26);
   const ox=c.x;
   if(this.move(c,'x',c.vx*dt)&&c.on&&tgt){// mala stepenica (npr. ivica kutije)
    const sy=c.y,sx=c.x;c.y-=.14;c.x=ox;if(!this.move(c,'x',c.vx*dt)&&this.free(c))c.y=sy-.14;else{c.y=sy;c.x=sx}}
   const vy=c.vy,hit=this.move(c,'y',c.vy*dt);
   if(hit){if(vy>0){if(!c.on&&vy>14)c.sq=.72;c.on=true}c.vy=0}else c.on=false;
   c.sq+=(1-c.sq)*Math.min(1,dt*12);
   c.ice=false;
   if(c.on){const fy=Math.floor(c.y+c.h+.02),under=[];
    for(let x=Math.floor(c.x+.15);x<=Math.floor(c.x+c.w-.15);x++)under.push([x,this.tile(x,fy)]);
    for(const[x,t]of under){if(deadly(t,c.t)){this.kill(c);break}if(t==='I')c.ice=true;
     if(t==='C'){const key=fy*W+x;if(!this.cr.has(key)){this.cr.set(key,{t:.45,gone:false,rt:0});this.emit('crack',{x,y:fy})}}}
    if(c.dead)continue;
    if(under.length&&under.every(([,t])=>t==='#'||t==='I')){let safe=true;for(let x=Math.floor(c.x)-1;x<=Math.floor(c.x+c.w)+1;x++){const t=this.tile(x,fy);if(t==='L'||t==='V'||t==='A'||t==='C'){safe=false;break}}
     if(safe&&!c.fan)c.safe={x:c.x,y:c.y}}
   }
   const cx=c.x+c.w/2,cy=c.y+c.h/2;
   for(const g of this.gems)if(!g.got&&g.t===c.t&&Math.abs(g.x-cx)<.62&&Math.abs(g.y-cy)<.8){g.got=true;this.emit('gem',{c,g})}
   for(const l of this.levers)if(cx>l.x&&cx<l.x+1&&c.y+c.h>l.y+.2&&c.y<l.y+1){
    if(c.vx>1.2&&!l.on){l.on=true;l.ts=Date.now();this.emit('lever',{c,l})}else if(c.vx<-1.2&&l.on){l.on=false;l.ts=Date.now();this.emit('lever',{c,l})}}
   const d=this.doors[c.t];c.door=c.on&&Math.abs(cx-(d[0]+.5))<.45&&Math.abs(c.y+c.h-(d[1]+1))<.08;
   c.blink-=dt;if(c.blink<-.12)c.blink=2.5+Math.random()*3;
  }
  // kutije
  for(const b of this.boxes){if(b.remote)continue;
   const f=this.fanAt(b);b.fan=f;if(f)this.applyFan(b,f,dt);else b.vy=Math.min(b.vy+G*dt,26);
   const vy=b.vy;if(this.move(b,'y',b.vy*dt)){if(vy>8)this.emit('thud',{b});b.vy=0;b.on=vy>0}else b.on=false;
  }
  // trošni blokovi
  for(const[key,s]of this.cr){
   if(!s.gone){s.t-=dt;if(s.t<=0){s.gone=true;s.rt=4;this.emit('crumble',{x:key%W,y:Math.floor(key/W)})}}
   else{s.rt-=dt;if(s.rt<=0){const x=key%W,y=Math.floor(key/W),r={x,y,w:1,h:1};
    if(!this.chars.some(c=>!c.dead&&ov(c,r))&&!this.boxes.some(b=>ov(b,r)))this.cr.delete(key);else s.rt=.3}}
  }
  // dugmad
  for(const b of this.btns){
   const pr=this.chars.some(c=>!c.dead&&c.on&&Math.abs(c.y+c.h-(b.y+1))<.12&&c.x+c.w>b.x+.15&&c.x<b.x+.85)||
    this.boxes.some(e=>Math.abs(e.y+e.h-(b.y+1))<.12&&e.x+e.w>b.x+.15&&e.x<b.x+.85);
   if(pr!==b.p)this.emit(pr?'press':'release',{b});b.p=pr;b.d+=((pr?1:0)-b.d)*Math.min(1,dt*15);
  }
 },
};
const PM={W,H,G,JV,SPEED,CW,CH,World,ov,deadly};
root.PM=PM;if(typeof module!=='undefined')module.exports=PM;
})(typeof window!=='undefined'?window:globalThis);
