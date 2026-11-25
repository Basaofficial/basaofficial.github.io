// BASH-STRIKE – oblici oružja (2D ikone + osnova za 3D), skinovi (teksture), inventar, kutije
'use strict';
(function(G){
const D=G.BS_DATA;
// ---------- parametarski oblici oružja (cm, x naprijed, y gore, 0 = ruka na dršci) ----------
const GS={
 pistol:{body:[-4,14,1,5],slide:1,barrel:[14,15,3.2,.7],grip:[-3,1.5,11,15],mag:null,guard:1},
 pistolS:{body:[-4,14,1,5],slide:1,barrel:[14,16,3.2,.7],sup:[16,31,1.6],grip:[-3,1.5,11,15]},
 deagle:{body:[-5,19,1,6.5],slide:1,barrel:[19,20,4.2,.9],grip:[-4,2,12,12]},
 tec:{body:[-4,16,0,5],barrel:[16,24,2.8,1.1],shroud:[9,21,1.6],grip:[-3,1.5,10,10],mag:{x:4,w:2.6,len:14,ang:0}},
 dual:{body:[-4,14,1,5],slide:1,barrel:[14,15,3.2,.7],grip:[-3,1.5,11,15],dual:1},
 zeus:{body:[-4,12,0,6],barrel:[12,15,3,1.6],grip:[-3,1.5,10,12],col:'#e8c020'},
 smg:{body:[-6,22,0,7],barrel:[22,34,4.5,1],handguard:[10,22,0,5],stock:{t:'fold',l:22},grip:[-3,1.5,11,12],mag:{x:8,w:3,len:16,ang:-8,curve:6}},
 smgS:{body:[-5,17,0,7.5],barrel:[17,22,4.5,1],stock:{t:'fold',l:18},grip:[-2,1.5,10,10],mag:{x:-1,w:2.6,len:17,ang:0}},
 p90:{body:[-18,28,-3,9],p90:1,barrel:[28,32,4,1],grip:[0,1.5,10,8]},
 shotgun:{body:[-6,20,0,6.5],barrel:[20,62,4.5,1.4],tube:[20,52,1.7,1.2],pump:[24,40,0,3.8],stock:{t:'solid',l:32,wood:1},grip:[-3,1.5,11,18],wood:1},
 autoshotgun:{body:[-6,24,0,7],barrel:[24,58,4.8,1.4],tube:[24,52,1.7,1.3],stock:{t:'skel',l:30},grip:[-3,1.5,11,14],rail:1},
 rifle:{body:[-8,24,0,7],barrel:[24,52,4.4,1],handguard:[12,34,.5,6],stock:{t:'skel',l:28},grip:[-3,1.5,11,16],mag:{x:6,w:3.2,len:19,ang:-12,curve:7}},
 bullpup:{body:[-30,24,-1,8],barrel:[24,46,4.5,1],carry:[-8,22,8,11.5],grip:[0,1.5,11,10],mag:{x:-22,w:3,len:14,ang:-5,curve:2}},
 ak:{body:[-8,26,0,7],barrel:[26,58,4.6,1.1],gasTube:[26,40,6.6,1.2],handguard:[14,30,.5,6],stock:{t:'solid',l:30,wood:1},grip:[-3,1.5,11,16],mag:{x:6,w:3.5,len:20,ang:-12,curve:9},wood:1,frontSight:56},
 m4:{body:[-8,24,0,7.5],barrel:[24,54,4.6,1],handguard:[11,34,.3,6.6],stock:{t:'tube',l:28},grip:[-3,1.5,11,16],mag:{x:6,w:3.2,len:18,ang:-6,curve:3},carry:[-4,18,7.5,10.5],frontSight:42},
 m4s:{body:[-8,24,0,7.5],barrel:[24,40,4.6,1],sup:[40,62,2],handguard:[11,34,.3,6.6],stock:{t:'tube',l:28},grip:[-3,1.5,11,16],mag:{x:6,w:3.2,len:16,ang:-6,curve:2},rail:1},
 sg:{body:[-8,26,0,8],barrel:[26,52,4.8,1.1],handguard:[12,36,.5,6.5],stock:{t:'skel',l:30},grip:[-3,1.5,11,16],mag:{x:6,w:3.4,len:18,ang:-6,curve:4},scope:[-2,22,11,2.2]},
 aug:{body:[-30,22,-1,8.5],barrel:[22,44,4.6,1.1],grip:[0,1.5,11,10],fgrip:[14,1,9,6],mag:{x:-22,w:3,len:14,ang:-4,curve:3},scope:[-18,10,11.5,2.4],curvy:1},
 ssg:{body:[-8,22,0,6.5],barrel:[22,70,4.2,.9],stock:{t:'thumb',l:34},grip:[-3,1.5,11,14],mag:{x:6,w:3,len:8,ang:0},scope:[-6,22,10,2.4],bolt:1},
 awp:{body:[-10,26,-1,8],barrel:[26,80,4.4,1.3],stock:{t:'thumb',l:36,big:1},grip:[-3,1.5,11,14],mag:{x:6,w:4,len:9,ang:0},scope:[-8,26,11.5,3],bolt:1,col:'#3f5a3a'},
 knife:{knife:'default'},c4:{c4:1}
};
// poligoni: [{pts,d (debljina cm),m:'b'|'m'|'w'}]
function shapeOf(model,knifeType){const s=GS[model]||GS.rifle;const P=[];
 const R=(x0,x1,y0,y1,d,m)=>P.push({pts:[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],d,m});
 const poly=(pts,d,m)=>P.push({pts,d,m});
 if(s.knife){const k=knifeType||'default';
  if(k==='karambit'){poly([[-2,0],[2,1],[8,2],[16,1],[22,-3],[24,-8],[20,-4],[14,-1],[8,-1],[2,-2]],.5,'b');poly([[-14,-2],[-2,-2],[-2,2],[-14,1],[-16,0]],2.4,'m');P.push({ring:[-17,0,2.2],d:1,m:'m'})}
  else if(k==='leptir'){poly([[0,-1],[18,-1],[24,1.5],[0,2]],.5,'b');R(-14,0,-1.8,2.2,1.4,'m');R(-14,0,-3.2,-1.6,1.4,'m')}
  else if(k==='bowie'){poly([[0,-2],[20,-2],[28,1],[22,3.5],[0,3]],.6,'b');R(-2,0,-4,5,2.2,'m');poly([[-14,-2],[-2,-1.8],[-2,2.6],[-14,2.4]],2.6,'w')}
  else if(k==='bajonet'){poly([[0,-1.6],[22,-1],[27,1],[22,2.2],[0,2.2]],.6,'b');R(-1.5,0,-2.5,3.5,2,'m');poly([[-13,-1.6],[-1.5,-1.4],[-1.5,2.2],[-13,2]],2.4,'m')}
  else if(k==='lovacki'){poly([[0,-1.8],[17,-1.8],[23,0],[19,2.6],[0,2.6]],.6,'b');R(-1.5,0,-2.6,3.6,2,'m');poly([[-12,-1.6],[-1.5,-1.6],[-1.5,2.4],[-12,2.2]],2.4,'w')}
  else{poly([[0,-1.5],[17,-1.5],[22,.5],[17,2.2],[0,2.2]],.55,'b');R(-1.5,0,-2.4,3,2,'m');poly([[-12,-1.5],[-1.5,-1.4],[-1.5,2.2],[-12,2]],2.3,'m')}
  return P}
 if(s.c4){R(-10,10,-2,6,8,'b');return P}
 const [b0,b1,y0,y1]=s.body;const bm=s.wood?'m':'b';
 if(s.p90){poly([[b0,y0+2],[b0+4,y1],[b1-6,y1],[b1,y1-3],[b1,y0+1],[12,y0],[8,y0-6],[2,y0-6],[0,y0],[b0+6,y0-2]],5.5,'b')}
 else if(s.curvy){poly([[b0,y0],[b0,y1-1],[b0+3,y1],[b1-6,y1],[b1,y1-2.5],[b1,y0+1],[b1-3,y0]],4.2,'b')}
 else if(s.slide){R(b0,b1,y0,y1,2.6,'b');R(b0+.5,b1-.5,y1-1.1,y1,2.4,'m')}
 else R(b0,b1,y0,y1,s.p90?5:3.4,'b');
 if(s.barrel){const [x0,x1,yb,r]=s.barrel;R(x0,x1,yb-r,yb+r,r*1.8,'m')}
 if(s.sup){const [x0,x1,r]=s.sup;const yb=s.barrel[2];R(x0,x1,yb-r,yb+r,r*2,'m')}
 if(s.shroud){const [x0,x1,r]=s.shroud;const yb=s.barrel[2];R(x0,x1,yb-r,yb+r,r*2,'b')}
 if(s.tube){const [x0,x1,yb,r]=s.tube;R(x0,x1,yb-r,yb+r,r*1.8,'m')}
 if(s.gasTube){const [x0,x1,yb,r]=s.gasTube;R(x0,x1,yb-r,yb+r,r*1.8,'m')}
 if(s.handguard){const [x0,x1,h0,h1]=s.handguard;R(x0,x1,h0,h1,4,s.wood?'w':'b')}
 if(s.pump){const [x0,x1,h0,h1]=s.pump;R(x0,x1,h0,h1,4.2,s.wood?'w':'b')}
 if(s.carry){const [x0,x1,h0,h1]=s.carry;R(x0,x1,h1-1.2,h1,1.6,'m');R(x0,x0+2,h0,h1,1.6,'m');R(x1-2,x1,h0,h1,1.6,'m')}
 if(s.rail){R(b0+2,b1-2,y1,y1+1,2.2,'m')}
 if(s.frontSight){R(s.frontSight-1,s.frontSight+1,s.barrel[2],s.barrel[2]+3.2,.8,'m')}
 if(s.scope){const [x0,x1,yc,r]=s.scope;R(x0,x1,yc-r,yc+r,r*2,'m');R(x0-2,x0+2,yc-r*1.35,yc+r*1.35,r*2.6,'m');R(x1-3,x1+1,yc-r*1.45,yc+r*1.45,r*2.8,'m');R(x0+8,x0+11,y1,yc-r,1.6,'m');R(x1-10,x1-7,y1,yc-r,1.6,'m')}
 if(s.stock){const st=s.stock,l=st.l;
  if(st.t==='solid')poly([[b0,y1-.5],[b0-l,y1-2],[b0-l,y0-7],[b0-l+6,y0-7],[b0,y0+1]],3.4,st.wood?'w':'b');
  else if(st.t==='thumb')poly([[b0,y1],[b0-l,y1+.5],[b0-l,y0-(st.big?9:7)],[b0-l+7,y0-(st.big?9:7)],[b0-l+12,y0-1],[b0-14,y0-1],[b0-12,y0+3.5],[b0-6,y0+3.5],[b0,y0]],3.4,'b');
  else if(st.t==='skel'){poly([[b0,y1-1],[b0-l,y1-1.5],[b0-l,y0-6],[b0-l+3,y0-6],[b0-l+3,y1-4],[b0,y1-3.5]],2.6,'b');poly([[b0,y0+2],[b0-l+3,y0-4],[b0-l+3,y0-1.5],[b0,y0+4]],2.4,'b')}
  else if(st.t==='tube'){R(b0-l*.55,b0,y0+2.5,y1-1.5,2.6,'m');poly([[b0-l*.55,y1],[b0-l,y1-.5],[b0-l,y0-5],[b0-l+5,y0-5],[b0-l*.55,y0+1.5]],3.2,'b')}
  else if(st.t==='fold')poly([[b0,y1-1.5],[b0-l,y1-1.5],[b0-l,y0-3],[b0-l+1.5,y0-3],[b0-l+1.5,y1-3],[b0,y1-3]],1.6,'m')}
 if(s.grip){const [gx,gw,gl,ga]=s.grip;const a=ga*Math.PI/180;const dx=Math.sin(a)*gl,dy=Math.cos(a)*gl;poly([[gx,y0+.5],[gx+gw*2.2,y0+.5],[gx+gw*2.2-dx,y0-dy],[gx-dx,y0-dy]],2.8,'g')}
 if(s.fgrip){const [x,w,l]=s.fgrip;R(x,x+w*2.2,y0-l,y0+.5,2.6,'b')}
 if(s.mag){const m=s.mag,a=m.ang*Math.PI/180,cv=m.curve||0;const pts=[];const n=6;
  for(let i=0;i<=n;i++){const t=i/n;const y=y0-t*m.len,x=m.x+Math.sin(a)*t*m.len+cv*t*t;pts.push([x,y])}
  const L=pts.map(([x,y])=>[x,y]),Rr=pts.map(([x,y])=>[x+m.w*2,y]).reverse();poly(L.concat(Rr),2.4,'m')}
 if(s.dual){const Q=P.slice();Q.forEach(q=>P.push({pts:q.pts.map(([x,y])=>[x-6,y-3]),d:q.d,m:q.m,off:4.5}))}
 return P}
// ---------- teksture skinova ----------
function srand(seed){let s=seed>>>0||7;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296}}
function hstr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
const _skc=new Map();
function paintSkin(id,size,wear){const key=id+'|'+size+'|'+(wear==null?'':Math.round(wear*20));if(_skc.has(key))return _skc.get(key);
 const sk=D.SK[id];const cv=document.createElement('canvas');cv.width=cv.height=size;const c=cv.getContext('2d');const S=size;
 const col=sk?sk.c:['#555','#333','#777'];const r=srand(hstr(id||'x'));const C=i=>col[i%col.length];
 c.fillStyle=C(0);c.fillRect(0,0,S,S);const pat=sk?sk.pat:'solid';
 if(pat==='camo'){for(let i=0;i<46;i++){c.fillStyle=C(1+(i%2));c.beginPath();const x=r()*S,y=r()*S,rr=S*(.05+r()*.11);for(let k=0;k<9;k++){const a=k/9*6.283,q=rr*(.6+r()*.6);c[k?'lineTo':'moveTo'](x+Math.cos(a)*q,y+Math.sin(a)*q)}c.fill()}}
 else if(pat==='stripes'){c.lineWidth=S*.06;c.strokeStyle=C(1);for(let i=-S;i<S*2;i+=S*.16){c.beginPath();c.moveTo(i,0);c.lineTo(i+S,S);c.stroke()}}
 else if(pat==='fade'){const g=c.createLinearGradient(0,0,S,S*.4);col.forEach((q,i)=>g.addColorStop(i/(col.length-1||1),q));c.fillStyle=g;c.fillRect(0,0,S,S)}
 else if(pat==='hex'){const a=S/10;c.lineWidth=S*.012;for(let y=0;y<S+a;y+=a*.87)for(let x=0;x<S+a;x+=a*1.5){const ox=x+((Math.round(y/(a*.87)))%2?a*.75:0);c.beginPath();for(let k=0;k<6;k++){const an=k*Math.PI/3;c.lineTo(ox+Math.cos(an)*a*.48,y+Math.sin(an)*a*.48)}c.closePath();if(r()<.25){c.fillStyle=C(2);c.fill()}c.strokeStyle=C(1);c.stroke()}}
 else if(pat==='tiger'){c.fillStyle=C(1);for(let i=0;i<14;i++){const y=r()*S;c.beginPath();c.moveTo(0,y);for(let x=0;x<=S;x+=S/12)c.lineTo(x,y+Math.sin(x/S*8+i)*S*.04+(x/S)*S*.1*(r()-.5));for(let x=S;x>=0;x-=S/12)c.lineTo(x,y+S*.03+Math.sin(x/S*7+i)*S*.03);c.fill()}}
 else if(pat==='digital'){const a=S/24;for(let y=0;y<S;y+=a)for(let x=0;x<S;x+=a){const v=r();if(v<.4){c.fillStyle=C(v<.2?1:2);c.fillRect(x,y,a,a)}}}
 else if(pat==='marble'){const im=c.getImageData(0,0,S,S),d=im.data;const cs=col.map(h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);const o=r()*9;
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const u=x/S,v=y/S;let t=Math.sin((u*5+v*3)*3+Math.sin(v*9+o)*2+Math.sin(u*13)*.7);t=(t+1)/2;const i=(y*S+x)*4;const A=cs[0],B=cs[1],Cc=cs[2]||cs[0];const q=t<.5?[A,B,t*2]:[B,Cc,(t-.5)*2];
   for(let k=0;k<3;k++)d[i+k]=q[0][k]+(q[1][k]-q[0][k])*q[2]}c.putImageData(im,0,0)}
 else if(pat==='wave'){c.lineWidth=S*.05;col.slice(1).forEach((q,j)=>{c.strokeStyle=q;for(let i=-2;i<10;i++){c.beginPath();for(let x=0;x<=S;x+=4)c.lineTo(x,i*S*.13+j*S*.05+Math.sin(x/S*12+i)*S*.03);c.stroke()}})}
 else if(pat==='carbon'){const a=S/16;for(let y=0;y<S;y+=a)for(let x=0;x<S;x+=a){const g=c.createLinearGradient(x,y,x+a,y+a);const k=((x+y)/a)%2;g.addColorStop(0,k?C(1):C(0));g.addColorStop(1,k?C(0):C(1));c.fillStyle=g;c.fillRect(x,y,a,a)}}
 else if(pat==='flames'){for(let i=0;i<22;i++){c.fillStyle=C(1+i%2);const x=r()*S,w=S*(.06+r()*.1),h=S*(.3+r()*.6);c.beginPath();c.moveTo(x-w,S);c.quadraticCurveTo(x-w*1.2,S-h*.6,x+(r()-.5)*w,S-h);c.quadraticCurveTo(x+w*1.3,S-h*.5,x+w,S);c.fill()}}
 else if(pat==='dots'){for(let y=S/16;y<S;y+=S/8)for(let x=S/16;x<S;x+=S/8){c.fillStyle=C(1);c.beginPath();c.arc(x+((y/(S/8))|0)%2*S/16,y,S*.035,0,6.283);c.fill();c.strokeStyle=C(1);c.lineWidth=S*.008;c.strokeRect(x-S*.05,y-S*.05,S*.1,S*.1)}}
 // šum + istrošenost
 const nr=srand(77);for(let i=0;i<S*2;i++){c.fillStyle=`rgba(${nr()<.5?0:255},${nr()<.5?0:255},${nr()<.5?0:255},.03)`;c.fillRect(nr()*S,nr()*S,2,2)}
 if(wear!=null&&wear>.07){const n=Math.floor(wear*140);c.strokeStyle='rgba(190,190,190,.5)';for(let i=0;i<n;i++){c.lineWidth=.5+nr()*1.5;c.beginPath();const x=nr()*S,y=nr()*S;c.moveTo(x,y);c.lineTo(x+(nr()-.5)*S*.12,y+(nr()-.5)*S*.05);c.stroke()}
  c.fillStyle=`rgba(120,120,120,${Math.min(.35,wear*.4)})`;for(let i=0;i<n*2;i++)c.fillRect(nr()*S,nr()*S,1+nr()*3,1+nr()*2)}
 _skc.set(key,cv);return cv}
// ---------- 2D ikona oružja ----------
function drawGun(c,w,x,y,W_,H_,opt){opt=opt||{};const wd=D.W[w];if(!wd)return;const model=wd.model;
 c.save();
 if(wd.slot===4||model==='c4'){const cx=x+W_/2,cy=y+H_/2,s=Math.min(W_,H_)*.42;c.fillStyle=opt.fill||'#fff';
  if(model==='c4'){c.fillRect(cx-s*1.2,cy-s*.6,s*2.4,s*1.2);c.fillStyle='#000';c.fillRect(cx-s*.8,cy-s*.4,s*.9,s*.5)}
  else if(model==='molotov'){c.beginPath();c.moveTo(cx-s*.25,cy-s);c.lineTo(cx+s*.25,cy-s);c.lineTo(cx+s*.25,cy-s*.3);c.quadraticCurveTo(cx+s*.6,cy-s*.1,cx+s*.55,cy+s);c.lineTo(cx-s*.55,cy+s);c.quadraticCurveTo(cx-s*.6,cy-s*.1,cx-s*.25,cy-s*.3);c.fill()}
  else{c.beginPath();c.roundRect(cx-s*.42,cy-s*.75,s*.84,s*1.65,s*.3);c.fill();c.fillRect(cx-s*.2,cy-s*1.05,s*.55,s*.35);c.beginPath();c.arc(cx+s*.45,cy-s*.8,s*.22,0,6.3);c.lineWidth=s*.1;c.strokeStyle=opt.fill||'#fff';c.stroke();
   if(model==='flash'||model==='smoke'||model==='decoy'){c.fillStyle='rgba(0,0,0,.35)';c.fillRect(cx-s*.42,cy-s*.1,s*.84,s*.18)}}
  c.restore();return}
 const P=shapeOf(model,opt.knife);let mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;P.forEach(p=>{(p.pts||[[p.ring[0]-p.ring[2],p.ring[1]-p.ring[2]],[p.ring[0]+p.ring[2],p.ring[1]+p.ring[2]]]).forEach(([a,b])=>{mnx=Math.min(mnx,a);mxx=Math.max(mxx,a);mny=Math.min(mny,b);mxy=Math.max(mxy,b)})});
 const sc=Math.min(W_/(mxx-mnx),H_/(mxy-mny))*.94;const ox=x+(W_-(mxx-mnx)*sc)/2-mnx*sc,oy=y+(H_+(mxy-mny)*sc)/2+mny*sc;
 const tx=a=>ox+a*sc,ty=b=>oy-b*sc;
 let fill=opt.fill||'#fff';if(opt.skin){const pt=c.createPattern(paintSkin(opt.skin,128,opt.wear),'repeat');fill=pt}
 const order=P.slice().sort((a,b)=>(a.m==='b')-(b.m==='b'));
 for(const p of order){c.beginPath();if(p.ring){c.arc(tx(p.ring[0]),ty(p.ring[1]),p.ring[2]*sc,0,6.283);c.lineWidth=sc*.8;c.strokeStyle=opt.skin?'#333':fill;c.stroke();continue}
  p.pts.forEach(([a,b],i)=>c[i?'lineTo':'moveTo'](tx(a),ty(b)));c.closePath();
  if(opt.skin){c.fillStyle=p.m==='b'?fill:p.m==='w'?'#6b4a2b':'#2b2d30'}else c.fillStyle=fill;c.fill();
  if(opt.skin&&p.m!=='b'){c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1;c.stroke()}}
 c.restore()}
// ---------- INVENTAR (localStorage) ----------
const LSK='bs_inv_v1';
function uid(){return Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4)}
const INV={data:null,
 load(){if(this.data)return this.data;let d=null;try{d=JSON.parse(localStorage.getItem(LSK)||'null')}catch(e){}
  if(!d||!Array.isArray(d.items))d={items:[],eq:{},ag:{T:0,CT:0},stats:{matches:0,wins:0,opened:0},gift:0};
  if(!d.gift){d.gift=1;d.items.push({u:uid(),t:'case',c:1,at:Date.now()})}
  d.items=d.items.filter(i=>i&&(i.t==='case'&&D.CASES.some(c=>c.id===i.c)||i.t==='key'&&D.CASES.some(c=>c.id===i.c)||i.t==='skin'&&D.SK[i.sk]));
  this.data=d;this.save();return d},
 save(){try{localStorage.setItem(LSK,JSON.stringify(this.data))}catch(e){}},
 add(it){it.u=uid();it.at=Date.now();this.load().items.push(it);this.save();return it},
 remove(u){const d=this.load();d.items=d.items.filter(i=>i.u!==u);for(const k in d.eq)if(d.eq[k]===u)delete d.eq[k];this.save()},
 equip(u){const d=this.load();const it=d.items.find(i=>i.u===u);if(!it||it.t!=='skin')return;const w=D.SK[it.sk].w;if(d.eq[w]===u)delete d.eq[w];else d.eq[w]=u;this.save()},
 skinsMap(){const d=this.load(),o={};for(const w in d.eq){const it=d.items.find(i=>i.u===d.eq[w]);if(it)o[w]=[it.sk,it.f]}return o},
 count(t,c){return this.load().items.filter(i=>i.t===t&&i.c===c).length},
 open(caseU){const d=this.load();const cs=d.items.find(i=>i.u===caseU&&i.t==='case');if(!cs)return null;const key=d.items.find(i=>i.t==='key'&&i.c===cs.c);if(!key)return null;
  const res=D.rollCase(cs.c);if(!res)return null;d.items=d.items.filter(i=>i.u!==cs.u&&i.u!==key.u);const it={u:uid(),t:'skin',sk:res.sk,f:res.f,st:res.st?1:0,at:Date.now()};d.items.push(it);d.stats.opened++;this.save();return it},
 // drop nakon meča
 matchDrop(won){const d=this.load();d.stats.matches++;if(won)d.stats.wins++;const out=[];const rc=()=>D.CASES[Math.floor(Math.random()*D.CASES.length)].id;
  if(won&&Math.random()<D.DROPS.keyWin)out.push(this.add({t:'key',c:rc()}));
  if(Math.random()<(won?D.DROPS.caseWin:D.DROPS.caseLoss))out.push(this.add({t:'case',c:rc()}));this.save();return out}
};
G.BS_INV={GS,shapeOf,paintSkin,drawGun,INV,srand,hstr};
})(typeof window!=='undefined'?window:globalThis);
