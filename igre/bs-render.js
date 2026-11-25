// BASH-STRIKE – 3D prikaz (three.js): svijet, likovi, oružja, viewmodel, efekti
import * as THREE from 'three';
const D=window.BS_DATA,MP=window.BS_MAPS,INV=window.BS_INV;
const {PH}=MP;
const rnd=INV.srand(12345);
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function hexToRgb(h){const v=parseInt(h.slice(1),16);return [(v>>16)/255,((v>>8)&255)/255,(v&255)/255]}
function mixHex(a,b,t){const A=hexToRgb(a),B=hexToRgb(b);return new THREE.Color(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t)}
function mergeGeos(list){const geos=list.filter(Boolean).map(g=>g.index?g.toNonIndexed():g);if(!geos.length)return null;const attrs=['position','normal','uv','color'];
 const out=new THREE.BufferGeometry();for(const a of attrs){if(!geos.every(g=>g.attributes[a]))continue;const sz=geos[0].attributes[a].itemSize;let n=0;geos.forEach(g=>n+=g.attributes[a].array.length);
  const arr=new Float32Array(n);let o=0;geos.forEach(g=>{arr.set(g.attributes[a].array,o);o+=g.attributes[a].array.length});out.setAttribute(a,new THREE.BufferAttribute(arr,sz))}
 out.computeBoundingSphere();return out}
// ---------- proceduralne teksture ----------
function noiseFill(c,w,h,amt,seed){const r=INV.srand(seed||9);const im=c.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){const n=(r()-.5)*amt;d[i]+=n;d[i+1]+=n;d[i+2]+=n}c.putImageData(im,0,0)}
function texFrom(canvas,rx,ry,aniso){const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=aniso||4;if(rx)t.repeat.set(rx,ry);return t}
function facadeTex(style,S,tall){// 4m x 8m (ili 10m), svijetla baza, prozori
 const W=S,H=S*(tall?2.5:2);const c=cv(W,H),x=c.getContext('2d');const th=tall?10:8;const Y=m=>H-(m/th)*H,X=m=>m/4*W;
 x.fillStyle='#ececec';x.fillRect(0,0,W,H);
 if(style==='desert'){x.strokeStyle='rgba(120,95,60,.35)';x.lineWidth=Math.max(1,S/200);for(let y=0;y<th;y+=.5){x.beginPath();x.moveTo(0,Y(y));x.lineTo(W,Y(y));x.stroke();const off=(y*2)%2?0:.5;for(let k=off;k<4;k+=1){x.beginPath();x.moveTo(X(k),Y(y));x.lineTo(X(k),Y(y+.5));x.stroke()}}
  for(let i=0;i<60;i++){x.fillStyle=`rgba(${150+rnd()*60|0},${120+rnd()*50|0},80,${.05+rnd()*.08})`;x.fillRect(rnd()*W,rnd()*H,S*.1+rnd()*S*.2,S*.05)}}
 else if(style==='italy'){for(let i=0;i<14;i++){x.fillStyle=`rgba(150,90,60,${.25+rnd()*.25})`;const bx=rnd()*W,by=Y(rnd()*2.5);for(let k=0;k<6;k++)x.fillRect(bx+(k%3)*S*.07,by+((k/3)|0)*S*.035,S*.065,S*.03)}
  for(let i=0;i<40;i++){x.fillStyle=`rgba(90,80,70,${.04+rnd()*.06})`;x.beginPath();x.arc(rnd()*W,rnd()*H,S*.03+rnd()*S*.12,0,6.3);x.fill()}}
 else{x.strokeStyle='rgba(110,90,70,.3)';x.lineWidth=Math.max(1,S/220);for(let y=0;y<th;y+=.7){x.beginPath();x.moveTo(0,Y(y));x.lineTo(W,Y(y));x.stroke();for(let k=(y*10%14<7)?0:.6;k<4;k+=1.2){x.beginPath();x.moveTo(X(k),Y(y));x.lineTo(X(k),Y(y+.7));x.stroke()}}
  x.fillStyle='rgba(30,110,120,.55)';x.fillRect(0,Y(2.6),W,(.35/th)*H);x.fillStyle='rgba(200,170,90,.5)';for(let k=0;k<4;k+=.25){x.beginPath();x.arc(X(k+.12),Y(2.43),S*.018,0,6.3);x.fill()}}
 // prljavština pri dnu
 const g=x.createLinearGradient(0,Y(0),0,Y(1.2));g.addColorStop(0,'rgba(60,45,30,.35)');g.addColorStop(1,'rgba(60,45,30,0)');x.fillStyle=g;x.fillRect(0,Y(1.2),W,Y(0)-Y(1.2));
 // prozori
 const rows=tall?[3.4,6.6]:[3.6];for(const ry of rows)for(const wx of [.7,2.5]){const ww=.85,wh=1.5;
  x.fillStyle=style==='italy'?'rgba(70,60,50,.9)':'rgba(60,45,30,.85)';x.fillRect(X(wx-.08),Y(ry+wh+.12),X(ww+.16),Y(0)-Y(wh+.24));
  const gg=x.createLinearGradient(0,Y(ry+wh),0,Y(ry));gg.addColorStop(0,'#2a3440');gg.addColorStop(1,'#0e1318');x.fillStyle=gg;x.fillRect(X(wx),Y(ry+wh),X(ww),Y(0)-Y(wh));
  if(style==='italy'){x.fillStyle='rgba(60,110,70,.95)';x.fillRect(X(wx-.42),Y(ry+wh),X(.36),Y(0)-Y(wh));x.fillRect(X(wx+ww+.06),Y(ry+wh),X(.36),Y(0)-Y(wh));x.strokeStyle='rgba(20,40,25,.6)';for(let k=0;k<8;k++){const yy=Y(ry+k*wh/8);x.beginPath();x.moveTo(X(wx-.42),yy);x.lineTo(X(wx-.06),yy);x.moveTo(X(wx+ww+.06),yy);x.lineTo(X(wx+ww+.42),yy);x.stroke()}}
  else if(style==='bazaar'){x.fillStyle='rgba(40,30,20,.9)';x.beginPath();x.arc(X(wx+ww/2),Y(ry+wh),X(ww/2),Math.PI,0);x.fill();x.strokeStyle='rgba(30,25,20,.8)';x.lineWidth=S/120;for(let k=1;k<4;k++){x.beginPath();x.moveTo(X(wx+k*ww/4),Y(ry+wh));x.lineTo(X(wx+k*ww/4),Y(ry));x.stroke()}}
  else{x.fillStyle='rgba(200,180,140,.8)';x.fillRect(X(wx-.12),Y(ry+.02),X(ww+.24),Y(0)-Y(.14))}}
 // vijenac na vrhu
 x.fillStyle='rgba(255,255,255,.35)';x.fillRect(0,Y(th),W,Y(th-.35)-Y(th));x.fillStyle='rgba(0,0,0,.18)';x.fillRect(0,Y(th-.35),W,Y(th-.45)-Y(th-.35));
 noiseFill(x,W,H,22,3);return c}
function floorTex(style,alt,S){const c=cv(S,S),x=c.getContext('2d');const r=INV.srand(alt*7+1);
 if(style==='desert'){x.fillStyle=alt===1?'#b9a27e':alt===2?'#c8b08a':'#d6c19a';x.fillRect(0,0,S,S);for(let i=0;i<500;i++){x.fillStyle=`rgba(${120+r()*80|0},${100+r()*60|0},${60+r()*40|0},${.08+r()*.1})`;x.beginPath();x.arc(r()*S,r()*S,1+r()*S*.02,0,6.3);x.fill()}
  if(alt===1){x.strokeStyle='rgba(90,70,50,.25)';x.lineWidth=S/100;for(let i=0;i<5;i++){x.beginPath();x.moveTo(0,r()*S);x.bezierCurveTo(S*.3,r()*S,S*.6,r()*S,S,r()*S);x.stroke()}}}
 else if(style==='italy'){x.fillStyle=alt?'#8d8478':'#9b9082';x.fillRect(0,0,S,S);const n=alt===1?10:8,a=S/n;for(let yy=0;yy<n;yy++)for(let xx=0;xx<n+1;xx++){const ox=(yy%2)*a/2;const v=115+r()*45;x.fillStyle=`rgb(${v|0},${v*.94|0},${v*.85|0})`;x.beginPath();x.roundRect(xx*a-ox+a*.06,yy*a+a*.06,a*.88,a*.88,a*.2);x.fill()}}
 else{x.fillStyle=alt===1?'#a88d6a':'#c2a57e';x.fillRect(0,0,S,S);const a=S/(alt===1?6:4);for(let yy=0;yy<S;yy+=a)for(let xx=0;xx<S;xx+=a){x.fillStyle=`rgba(${150+r()*50|0},${125+r()*40|0},${90+r()*30|0},.6)`;x.fillRect(xx+2,yy+2,a-4,a-4)}
  if(alt===1){x.strokeStyle='rgba(40,110,120,.5)';x.lineWidth=S/80;for(let yy=0;yy<S;yy+=a){x.beginPath();x.moveTo(0,yy);x.lineTo(S,yy);x.stroke()}}}
 noiseFill(x,S,S,18,alt+5);return c}
function crateTex(S,col){const c=cv(S,S),x=c.getContext('2d');x.fillStyle=col;x.fillRect(0,0,S,S);const r=INV.srand(4);
 for(let i=0;i<8;i++){x.fillStyle=`rgba(0,0,0,${.05+r()*.12})`;x.fillRect(0,i*S/8,S,S/8-2)}
 x.strokeStyle='rgba(30,20,10,.85)';x.lineWidth=S*.08;x.strokeRect(S*.04,S*.04,S*.92,S*.92);x.lineWidth=S*.07;x.beginPath();x.moveTo(S*.08,S*.92);x.lineTo(S*.92,S*.08);x.stroke();
 x.fillStyle='rgba(0,0,0,.35)';[[.1,.1],[.9,.1],[.1,.9],[.9,.9]].forEach(([a,b])=>{x.beginPath();x.arc(a*S,b*S,S*.02,0,6.3);x.fill()});noiseFill(x,S,S,26,8);return c}
function stoneTex(S,base){const c=cv(S,S),x=c.getContext('2d');x.fillStyle=base;x.fillRect(0,0,S,S);const r=INV.srand(11);const a=S/4;
 for(let yy=0;yy<4;yy++)for(let xx=-1;xx<4;xx++){const ox=yy%2?a/2:0;x.fillStyle=`rgba(${r()<.5?0:255},${r()<.5?0:255},${r()<.5?0:255},.04)`;x.fillRect(xx*a+ox,yy*a,a,a);x.strokeStyle='rgba(60,50,40,.4)';x.lineWidth=S/120;x.strokeRect(xx*a+ox,yy*a,a,a)}noiseFill(x,S,S,20,12);return c}
function woodTex(S){const c=cv(S,S),x=c.getContext('2d');x.fillStyle='#5a4128';x.fillRect(0,0,S,S);for(let i=0;i<8;i++){x.fillStyle=i%2?'rgba(0,0,0,.18)':'rgba(255,255,255,.04)';x.fillRect(i*S/8,0,S/8-2,S)}noiseFill(x,S,S,20,13);return c}
function gradTex(){const c=cv(4,64),x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,64);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,4,64);const t=new THREE.CanvasTexture(c);return t}
function puffTex(){const c=cv(64,64),x=c.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.5,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)}
function letterTex(L,col){const c=cv(256,256),x=c.getContext('2d');x.font='900 200px Arial';x.textAlign='center';x.textBaseline='middle';x.fillStyle=col;x.globalAlpha=.75;x.fillText(L,128,140);x.globalAlpha=.25;x.lineWidth=14;x.strokeStyle=col;x.beginPath();x.arc(128,128,118,0,6.3);x.stroke();return new THREE.CanvasTexture(c)}
// ---------- geometrija kutije s UV-om u svjetskim koordinatama ----------
function boxGeo(x0,y0,z0,x1,y1,z1,uw,uh,col,faces,aoBottom){const P=[],N=[],UV=[],C=[];const c=col||[1,1,1];
 const q=(a,b,cc,d,n,uv)=>{[a,b,cc,a,cc,d].forEach((v,i)=>{P.push(...v);N.push(...n);const k=[0,1,2,0,2,3][i];UV.push(...uv[k]);const dark=aoBottom&&v[1]<=y0+.001&&n[1]===0?aoBottom:1;C.push(c[0]*dark,c[1]*dark,c[2]*dark)})};
 const F=faces||{};
 if(F.top!==false)q([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],[0,1,0],[[x0/uw,z1/uw],[x1/uw,z1/uw],[x1/uw,z0/uw],[x0/uw,z0/uw]]);
 if(F.bottom)q([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,-1,0],[[x0/uw,z0/uw],[x1/uw,z0/uw],[x1/uw,z1/uw],[x0/uw,z1/uw]]);
 if(F.s!==false){
  q([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1],[[x0/uw,y0/uh],[x1/uw,y0/uh],[x1/uw,y1/uh],[x0/uw,y1/uh]]);
  q([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1],[[-x1/uw,y0/uh],[-x0/uw,y0/uh],[-x0/uw,y1/uh],[-x1/uw,y1/uh]]);
  q([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0],[[-z1/uw,y0/uh],[-z0/uw,y0/uh],[-z0/uw,y1/uh],[-z1/uw,y1/uh]]);
  q([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0],[[z0/uw,y0/uh],[z1/uw,y0/uh],[z1/uw,y1/uh],[z0/uw,y1/uh]])}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));return g}
function greedy(M,keyFn){const W=M.W,H=M.H,used=new Uint8Array(W*H),out=[];
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){const i=z*W+x;if(used[i])continue;const k=keyFn(i);if(k==null)continue;
  let w=1;while(x+w<W&&!used[i+w]&&keyFn(i+w)===k)w++;let h=1;outer:while(z+h<H){for(let a=0;a<w;a++){const j=(z+h)*W+x+a;if(used[j]||keyFn(j)!==k)break outer}h++}
  for(let b=0;b<h;b++)for(let a=0;a<w;a++)used[(z+b)*W+x+a]=1;out.push({x,z,w,h,k})}return out}
// ---------- oružje 3D ----------
const _gunGeo=new Map();
function gunGeos(model,knife){const key=model+'|'+(knife||'');if(_gunGeo.has(key))return _gunGeo.get(key);
 const parts=INV.shapeOf(model,knife);const by={b:[],m:[],w:[],g:[]};let tip=0,tipY=0;
 for(const p of parts){let g;if(p.ring){const s=new THREE.Shape();s.absarc(p.ring[0]/100,p.ring[1]/100,p.ring[2]/100,0,Math.PI*2);const h=new THREE.Path();h.absarc(p.ring[0]/100,p.ring[1]/100,p.ring[2]/100*.6,0,Math.PI*2,true);s.holes.push(h);g=new THREE.ExtrudeGeometry(s,{depth:p.d/100,bevelEnabled:false})}
  else{const s=new THREE.Shape(p.pts.map(([a,b])=>new THREE.Vector2(a/100,b/100)));g=new THREE.ExtrudeGeometry(s,{depth:p.d/100,bevelEnabled:true,bevelThickness:.0025,bevelSize:.002,bevelSegments:1});
   for(const [a,b] of p.pts){if(a>tip&&p.m==='m'){tip=a;tipY=b}}}
  g.translate(0,0,-p.d/200+(p.off?p.off/100:0));(by[p.m]||by.b).push(g)}
 const r={};for(const k in by){if(by[k].length)r[k]=mergeGeos(by[k])}
 const sb=parts.find(p=>p.m==='m'&&p.pts&&p.pts.some(q=>q[0]===tip));let ty=tipY;if(sb){const ys=sb.pts.map(q=>q[1]);ty=(Math.min(...ys)+Math.max(...ys))/2}
 r.tip=[tip/100,ty/100];_gunGeo.set(key,r);return r}
const _mats=new Map();
function mat(key,mk){if(!_mats.has(key))_mats.set(key,mk());return _mats.get(key)}
function skinMat(sk,wear,def){if(!sk)return mat('def|'+def,()=>new THREE.MeshLambertMaterial({color:def||'#3a3c40'}));
 return mat('sk|'+sk+'|'+Math.round((wear||0)*20),()=>{const t=texFrom(INV.paintSkin(sk,256,wear),6,6);return new THREE.MeshLambertMaterial({map:t})})}
function makeGun(w,sk){// sk = [skinId,wear] ili 0
 const wd=D.W[w];const g=new THREE.Group();if(!wd)return g;g.userData.w=w;
 if(wd.slot===4){const col=wd.col||'#556';let m;
  if(wd.model==='molotov'){m=new THREE.Mesh(new THREE.CylinderGeometry(.035,.04,.16,10),mat('glass',()=>new THREE.MeshLambertMaterial({color:'#6a4a20',transparent:true,opacity:.85})));const n=new THREE.Mesh(new THREE.CylinderGeometry(.012,.014,.06,6),mat('rag',()=>new THREE.MeshLambertMaterial({color:'#ddd'})));n.position.y=.1;g.add(n)}
  else{m=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.11,10),mat('nade'+w,()=>new THREE.MeshLambertMaterial({color:col})));const t=new THREE.Mesh(new THREE.BoxGeometry(.025,.03,.02),mat('dark',()=>new THREE.MeshLambertMaterial({color:'#222'})));t.position.y=.07;g.add(t)}
  g.add(m);g.userData.tip=[0,0];return g}
 if(wd.model==='c4'){const b=new THREE.Mesh(new THREE.BoxGeometry(.22,.07,.14),mat('c4',()=>new THREE.MeshLambertMaterial({color:'#6b6a3a'})));const s=new THREE.Mesh(new THREE.BoxGeometry(.08,.012,.05),mat('c4s',()=>new THREE.MeshLambertMaterial({color:'#1a2a1a',emissive:'#103010'})));s.position.set(-.03,.04,0);
  const led=new THREE.Mesh(new THREE.BoxGeometry(.012,.012,.012),mat('led',()=>new THREE.MeshBasicMaterial({color:'#ff2020'})));led.position.set(.06,.04,.03);g.add(b,s,led);g.userData.led=led;g.userData.tip=[0,0];return g}
 const knife=wd.model==='knife'&&sk&&D.SK[sk[0]]&&D.SK[sk[0]].knife;
 const G=gunGeos(wd.model,knife);const inner=new THREE.Group();inner.rotation.y=Math.PI/2;
 const defC=wd.model==='knife'?'#9aa0a8':(INV.GS[wd.model]&&INV.GS[wd.model].col)||'#34373b';
 const mb=skinMat(sk?sk[0]:0,sk?sk[1]:0,defC);
 if(G.b)inner.add(new THREE.Mesh(G.b,mb));
 if(G.m)inner.add(new THREE.Mesh(G.m,mat('metal',()=>new THREE.MeshLambertMaterial({color:'#1f2124'}))));
 if(G.w)inner.add(new THREE.Mesh(G.w,mat('wood',()=>new THREE.MeshLambertMaterial({color:'#6b4526'}))));
 if(G.g)inner.add(new THREE.Mesh(G.g,mat('grip',()=>new THREE.MeshLambertMaterial({color:'#18191b'}))));
 g.add(inner);g.userData.tip=G.tip;return g}
// ---------- likovi ----------
const _cg={};function cgeo(){if(_cg.ok)return _cg;_cg.ok=1;
 _cg.torso=new THREE.BoxGeometry(.4,.52,.24);_cg.vest=new THREE.BoxGeometry(.44,.4,.3);_cg.head=new THREE.SphereGeometry(.13,12,10);_cg.helm=new THREE.SphereGeometry(.145,12,8,0,Math.PI*2,0,Math.PI*.55);
 _cg.limb=new THREE.CapsuleGeometry(.07,.3,3,8);_cg.limbS=new THREE.CapsuleGeometry(.06,.28,3,8);_cg.foot=new THREE.BoxGeometry(.12,.08,.26);_cg.hand=new THREE.BoxGeometry(.08,.08,.1);
 _cg.visor=new THREE.BoxGeometry(.2,.05,.06);_cg.pelvis=new THREE.BoxGeometry(.36,.18,.22);_cg.pouch=new THREE.BoxGeometry(.1,.12,.06);_cg.blob=new THREE.CircleGeometry(.45,16);return _cg}
function lam(c){return mat('c|'+c,()=>new THREE.MeshLambertMaterial({color:c}))}
function makeChar(side,ag){const g=cgeo();const A=D.AGENTS[side][ag%5];const [c0,c1,c2]=A.c;const root=new THREE.Group();
 const hips=new THREE.Group();hips.position.y=.95;root.add(hips);
 const pel=new THREE.Mesh(g.pelvis,lam(c1));hips.add(pel);
 const spine=new THREE.Group();spine.position.y=.08;hips.add(spine);
 const torso=new THREE.Mesh(g.torso,lam(c0));torso.position.y=.3;spine.add(torso);const vest=new THREE.Mesh(g.vest,lam(c2));vest.position.set(0,.33,-.01);spine.add(vest);
 for(const px of [-.12,0,.12]){const pc=new THREE.Mesh(g.pouch,lam(c1));pc.position.set(px,.26,-.17);spine.add(pc)}
 const neck=new THREE.Group();neck.position.y=.62;spine.add(neck);
 const head=new THREE.Mesh(g.head,lam(side==='T'&&A.mask?'#1c1c1c':'#c99a78'));head.position.y=.12;neck.add(head);
 if(side==='CT'&&A.helm){const h=new THREE.Mesh(g.helm,lam(c1));h.position.y=.135;neck.add(h);const v=new THREE.Mesh(g.visor,lam('#111'));v.position.set(0,.14,-.11);neck.add(v)}
 else if(side==='T'){const v=new THREE.Mesh(g.visor,lam(A.mask?'#c99a78':'#3a2a1a'));v.scale.set(.85,.7,1);v.position.set(0,.14,-.1);neck.add(v);if(!A.mask){const cap=new THREE.Mesh(g.helm,lam(c2));cap.scale.y=.6;cap.position.y=.16;neck.add(cap)}}
 else{const cap=new THREE.Mesh(g.helm,lam(c2));cap.scale.y=.55;cap.position.y=.16;neck.add(cap)}
 const mkArm=(sx)=>{const sh=new THREE.Group();sh.position.set(sx*.25,.52,0);spine.add(sh);const up=new THREE.Mesh(g.limbS,lam(c0));up.position.y=-.17;sh.add(up);
  const el=new THREE.Group();el.position.y=-.34;sh.add(el);const lo=new THREE.Mesh(g.limbS,lam(c0));lo.position.y=-.15;el.add(lo);const hd=new THREE.Mesh(g.hand,lam('#2a2622'));hd.position.y=-.32;el.add(hd);return {sh,el}};
 const aR=mkArm(1),aL=mkArm(-1);
 const mkLeg=(sx)=>{const hp=new THREE.Group();hp.position.set(sx*.11,-.05,0);hips.add(hp);const th=new THREE.Mesh(g.limb,lam(c1));th.position.y=-.21;hp.add(th);
  const kn=new THREE.Group();kn.position.y=-.43;hp.add(kn);const sh=new THREE.Mesh(g.limb,lam(c1));sh.position.y=-.2;kn.add(sh);const ft=new THREE.Mesh(g.foot,lam('#1a1714'));ft.position.set(0,-.43,-.05);kn.add(ft);return {hp,kn}};
 const lR=mkLeg(1),lL=mkLeg(-1);
 const blob=new THREE.Mesh(g.blob,mat('blob',()=>new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.35,depthWrite:false})));blob.rotation.x=-Math.PI/2;blob.position.y=.02;root.add(blob);
 const hand=new THREE.Group();spine.add(hand);hand.position.set(.2,.38,-.55);
 // ruke drže oružje naprijed
 aR.sh.rotation.x=1.2;aR.el.rotation.x=.25;aL.sh.rotation.x=1.25;aL.sh.rotation.z=.55;aL.el.rotation.x=.3;
 root.traverse(o=>{if(o.isMesh&&o!==blob)o.castShadow=false});
 root.userData={hips,spine,neck,aR,aL,lR,lL,hand,blob,phase:0,side,ag};return root}
function nameSprite(txt,col){const c=cv(256,48),x=c.getContext('2d');x.font='bold 26px Arial';x.textAlign='center';x.textBaseline='middle';x.lineWidth=5;x.strokeStyle='rgba(0,0,0,.8)';x.strokeText(txt,128,24);x.fillStyle=col;x.fillText(txt,128,24);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.scale.set(1.3,.24,1);s.renderOrder=10;return s}

// ================= RENDERER =================
export class BSRender{
 constructor(canvas,q){this.canvas=canvas;this.q=q||'high';
  this.r=new THREE.WebGLRenderer({canvas,antialias:this.q!=='low',powerPreference:'high-performance',alpha:false});
  this.r.outputColorSpace=THREE.SRGBColorSpace;this.r.toneMapping=THREE.ACESFilmicToneMapping;this.r.toneMappingExposure=1.05;
  this.setPR();this.scene=new THREE.Scene();this.cam=new THREE.PerspectiveCamera(74,1,.05,600);this.cam.rotation.order='YXZ';
  this.vmScene=new THREE.Scene();this.vmCam=new THREE.PerspectiveCamera(58,1,.01,10);this.vmScene.add(new THREE.HemisphereLight('#fff','#556',1.3));const vd=new THREE.DirectionalLight('#fff',1.4);vd.position.set(.5,1,.4);this.vmScene.add(vd);
  this.ents=new Map();this.fx=[];this.puff=puffTex();this.dropM=new Map();this.nadeM=new Map();this.smokes=new Map();this.fires=new Map();
  this.menuScene=null;this.resize();addEventListener('resize',()=>this.resize());
  this.vm={g:null,w:null,sk:null,kick:0,kickR:0,bob:0,sway:[0,0],anim:null,animT:0,animD:1,draw:0,lastYaw:0,lastPitch:0};
  this.flashL=new THREE.PointLight('#ffcf80',0,8,2);this.scene.add(this.flashL);
 }
 setPR(){const dpr=window.devicePixelRatio||1;this.r.setPixelRatio(this.q==='low'?Math.min(dpr,1):this.q==='med'?Math.min(dpr,1.25):Math.min(dpr,2))}
 setQuality(q){if(q===this.q)return;this.q=q;this.setPR();this.resize();if(this.M){const M=this.M;this.M=null;this.loadMap(M)}}
 resize(){const w=innerWidth,h=innerHeight;this.r.setSize(w,h,false);this.cam.aspect=w/h;this.cam.updateProjectionMatrix();this.vmCam.aspect=w/h;this.vmCam.updateProjectionMatrix()}
 // ---------- svijet ----------
 loadMap(M){this.M=M;const th=M.theme,S=this.q==='low'?256:this.q==='med'?384:512;const sc=this.scene;
  // očisti stari svijet
  if(this.world){sc.remove(this.world);this.world.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
  for(const e of this.ents.values())sc.remove(e.root);this.ents.clear();
  const W=new THREE.Group();this.world=W;sc.add(W);
  sc.background=new THREE.Color(th.sky[0]);sc.fog=new THREE.Fog(th.fog,this.q==='low'?45:70,this.q==='low'?150:240);
  // nebo
  const skyG=new THREE.SphereGeometry(400,24,12);const top=new THREE.Color(th.sky[0]),hor=new THREE.Color(th.sky[1]);const cols=[];const pos=skyG.attributes.position;
  for(let i=0;i<pos.count;i++){const y=pos.getY(i)/400;const t=Math.max(0,Math.min(1,y*1.6+.05));const c=hor.clone().lerp(top,t);cols.push(c.r,c.g,c.b)}skyG.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  const sky=new THREE.Mesh(skyG,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));sky.position.set(60,0,60);W.add(sky);
  const sunDir=new THREE.Vector3(...th.sun).normalize();
  const sunS=new THREE.Sprite(new THREE.SpriteMaterial({map:this.puff,color:'#fff8e0',fog:false,depthWrite:false,transparent:true}));sunS.scale.set(60,60,1);sunS.position.copy(sunDir.clone().multiplyScalar(380)).add(new THREE.Vector3(60,0,60));W.add(sunS);
  // svjetla
  const hemi=new THREE.HemisphereLight(th.sky[0],'#8a7a60',th.amb*1.6);W.add(hemi);
  const sun=new THREE.DirectionalLight(th.sunCol,2.2);sun.position.copy(sunDir.clone().multiplyScalar(90)).add(new THREE.Vector3(60,0,60));sun.target.position.set(60,0,60);W.add(sun,sun.target);
  const shadows=this.q!=='low';this.r.shadowMap.enabled=shadows;
  if(shadows){sun.castShadow=true;const ss=this.q==='high'?4096:2048;sun.shadow.mapSize.set(ss,ss);const c=sun.shadow.camera;c.left=-90;c.right=90;c.top=90;c.bottom=-90;c.near=1;c.far=260;sun.shadow.bias=-.0006;sun.shadow.normalBias=.04;
   this.r.shadowMap.type=THREE.PCFSoftShadowMap;this.r.shadowMap.autoUpdate=false;this.r.shadowMap.needsUpdate=true}
  // materijali
  const style=th.style;const facade=texFrom(facadeTex(style,S,false),1,1,8),facadeT=texFrom(facadeTex(style,S,true),1,1,8);
  const mFac=new THREE.MeshLambertMaterial({map:facade,vertexColors:true}),mFacT=new THREE.MeshLambertMaterial({map:facadeT,vertexColors:true});
  const fl=[0,1,2].map(a=>new THREE.MeshLambertMaterial({map:texFrom(floorTex(style,a,S),1,1,8)}));
  const mStone=new THREE.MeshLambertMaterial({map:texFrom(stoneTex(S,th.level),1,1,8),vertexColors:true});
  const mCrate=new THREE.MeshLambertMaterial({map:texFrom(crateTex(S/2,th.crate)),vertexColors:true});
  const mRoof=new THREE.MeshLambertMaterial({map:texFrom(woodTex(S/2),1,1),vertexColors:true});
  const mTop=new THREE.MeshLambertMaterial({map:texFrom(stoneTex(S/2,'#b8a58a'),1,1),vertexColors:true});
  const wallCols=th.wall;
  const geos={fac:[],facT:[],stone:[],crate:[],roof:[],top:[],fl0:[],fl1:[],fl2:[],barrel:[]};
  // zidovi (spojeni)
  const L=MP.LEG;
  const keyWall=i=>{const ch=M.ch[i];const l=L[ch];return l.k==='wall'||l.k==='border'?ch:null};
  for(const r of greedy(M,keyWall)){const l=L[r.k];const x0=r.x*2,z0=r.z*2,x1=(r.x+r.w)*2,z1=(r.z+r.h)*2;const tint=mixHex(wallCols[0],wallCols[1],rnd());const c=[tint.r,tint.g,tint.b];
   const tall=l.tall||l.k==='border';(tall?geos.facT:geos.fac).push(boxGeo(x0,0,z0,x1,l.h,z1,4,tall?10:8,c,{top:false},.75));
   geos.top.push(boxGeo(x0,l.h-.001,z0,x1,l.h,z1,4,4,[.85,.8,.75],{s:false}))}
  // platforme i niski zidovi
  const keyLvl=i=>{const l=L[M.ch[i]];return l.k==='level'||l.k==='lowwall'?M.ch[i]:null};
  for(const r of greedy(M,keyLvl)){const l=L[r.k];geos.stone.push(boxGeo(r.x*2,0,r.z*2,(r.x+r.w)*2,l.h,(r.z+r.h)*2,2,2,l.k==='lowwall'?[.85,.85,.85]:[1,1,1],null,.8))}
  // sanduci, bačve
  for(let i=0;i<M.ch.length;i++){const l=L[M.ch[i]];const x=(i%M.W)*2,z=((i/M.W)|0)*2;
   if(l.k==='crate'){const lvl=[0,.5,1,1.5,2];let base=0;// sanduk na platformi
    const nb=[i-1,i+1,i-M.W,i+M.W].map(j=>L[M.ch[j]]).filter(q=>q&&q.k==='level');if(nb.length)base=Math.max(...nb.map(q=>q.h));if(base>=l.h)base=0;
    const t=.92+rnd()*.12;let y=base;if(base>0){geos.stone.push(boxGeo(x,0,z,x+2,base,z+2,2,2,[1,1,1],null,.8))}
    while(y<l.h-.01){const hh=Math.min(l.h-y,y===base&&l.h-y>1.2?1.05:l.h-y);geos.crate.push(boxGeo(x+.04,y,z+.04,x+1.96,y+hh,z+1.96,1.92,hh,[t,t*.97,t*.92],null,.85));y+=hh}}
   else if(l.k==='barrel'){for(const [bx,bz] of [[.55,.55],[1.45,.6],[1,1.4]]){const g=new THREE.CylinderGeometry(.42,.42,1.15,12);g.translate(x+bx,.575,z+bz);geos.barrel.push(g)}}
   if(l.roof)geos.roof.push(boxGeo(x,l.roof[0],z,x+2,l.roof[1],z+2,2,2,[.9,.9,.9],{bottom:true,top:true}))}
  // tlo
  const keyFl=i=>{const l=L[M.ch[i]];if(l.k!=='floor')return null;return l.alt===1?1:l.alt===2?2:0};
  for(const r of greedy(M,keyFl)){const g=boxGeo(r.x*2,-.001,r.z*2,(r.x+r.w)*2,0,(r.z+r.h)*2,4,4,[1,1,1],{s:false});geos['fl'+r.k].push(g)}
  const add=(arr,m,cast,recv)=>{const g=mergeGeos(arr);if(!g)return;const ms=new THREE.Mesh(g,m);ms.castShadow=!!cast&&shadows;ms.receiveShadow=!!recv&&shadows;ms.matrixAutoUpdate=false;W.add(ms);return ms};
  add(geos.fac,mFac,1,1);add(geos.facT,mFacT,1,1);add(geos.top,mTop,0,1);add(geos.stone,mStone,1,1);add(geos.crate,mCrate,1,1);add(geos.roof,mRoof,1,1);
  add(geos.fl0,fl[0],0,1);add(geos.fl1,fl[1],0,1);add(geos.fl2,fl[2],0,1);
  if(geos.barrel.length){const bc={desert:'#3c5d8a',italy:'#7a3324',bazaar:'#2f6a5a'}[style]||'#555';add(geos.barrel,new THREE.MeshLambertMaterial({color:bc}),1,1)}
  // kontaktne sjene uz zidove
  const ao=[],gt=gradTex();const isSolid=j=>{const l=L[M.ch[j]];return l&&l.h>0};
  for(let i=0;i<M.ch.length;i++){const l=L[M.ch[i]];if(l.k!=='floor')continue;const x=(i%M.W)*2,z=((i/M.W)|0)*2;const y=.012,w=.7;
   const quad=(a,b,c,d)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2));g.setAttribute('normal',new THREE.Float32BufferAttribute(Array(18).fill(0).map((_,k)=>k%3===1?1:0),3));ao.push(g)};
   if(isSolid(i-M.W))quad([x+2,y,z],[x,y,z],[x,y,z+w],[x+2,y,z+w]);if(isSolid(i+M.W))quad([x,y,z+2],[x+2,y,z+2],[x+2,y,z+2-w],[x,y,z+2-w]);
   if(isSolid(i-1))quad([x,y,z],[x,y,z+2],[x+w,y,z+2],[x+w,y,z]);if(isSolid(i+1))quad([x+2,y,z+2],[x+2,y,z],[x+2-w,y,z],[x+2-w,y,z+2])}
  if(ao.length){const g=mergeGeos(ao);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:gt,transparent:true,depthWrite:false,color:0}));m.renderOrder=1;W.add(m)}
  // oznake A/B
  for(const k of ['A','B']){const p=M.def.plant[k];const c=M.cellC(p[0],p[1]);const y=M.groundAt(c[0],c[1])+.02;const m=new THREE.Mesh(new THREE.PlaneGeometry(5,5),new THREE.MeshBasicMaterial({map:letterTex(k,k==='A'?'#d23a2a':'#d8a020'),transparent:true,depthWrite:false}));
   m.rotation.x=-Math.PI/2;m.position.set(c[0],y,c[1]);m.renderOrder=2;W.add(m)}
  this.decor(M,W,style,shadows);
  if(shadows)this.r.shadowMap.needsUpdate=true}
 decor(M,W,style,shadows){const L=MP.LEG;const r=INV.srand(99);const many=this.q==='low'?.5:1;
  const cloth=['#b83a2a','#2a6ab8','#d8a020','#3a8a4a','#8a2a7a','#e06a20'];const parts={trunk:[],leaf:[],cloth:[],lamp:[],pot:[],green:[],wire:[]};
  const floorAt=i=>{const l=L[M.ch[i]];return l&&l.k==='floor'&&!l.roof};
  for(let i=0;i<M.ch.length;i++){if(!floorAt(i))continue;const x=(i%M.W)*2,z=((i/M.W)|0)*2;
   const wallN=[[-M.W,0,-1],[M.W,0,1],[-1,-1,0],[1,1,0]].filter(([d])=>{const l=L[M.ch[i+d]];return l&&l.k==='wall'});
   if(!wallN.length)continue;if(r()>.16*many)continue;const [d,nx,nz]=wallN[Math.floor(r()*wallN.length)];
   const wx=x+1+nx*1,wz=z+1+nz*1;// tačka na zidu
   const k=r();
   if(style==='desert'&&k<.25&&wallN.length===1){const tr=new THREE.CylinderGeometry(.12,.2,5.5,6);tr.translate(x+1-nx*.3,2.75,z+1-nz*.3);parts.trunk.push(tr);for(let a=0;a<6;a++){const lf=new THREE.ConeGeometry(.35,2.6,4);lf.rotateZ(Math.PI/2.4);lf.rotateY(a*1.05);lf.translate(x+1-nx*.3,5.4,z+1-nz*.3);parts.leaf.push(lf)}}
   else if(k<.6){// tenda
    const w=1.6,dep=1.1;const g=new THREE.PlaneGeometry(w,dep);g.rotateX(-Math.PI/2+.45);if(nx)g.rotateY(Math.PI/2);const ox=wx-nx*dep*.45,oz=wz-nz*dep*.45;g.translate(ox,2.9+r()*.6,oz);
    const cc=new THREE.Color(cloth[Math.floor(r()*cloth.length)]);const n=g.attributes.position.count,cols=[];for(let j=0;j<n;j++)cols.push(cc.r,cc.g,cc.b);g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));parts.cloth.push(g)}
   else if(style==='bazaar'||k<.8){const g=new THREE.BoxGeometry(.18,.28,.18);g.translate(wx-nx*.4,3.2,wz-nz*.4);parts.lamp.push(g);const w2=new THREE.BoxGeometry(.02,.5,.02);w2.translate(wx-nx*.4,3.55,wz-nz*.4);parts.wire.push(w2)}
   else if(style==='italy'){const g=new THREE.BoxGeometry(nx?.25:.9,.22,nz?.25:.9);g.translate(wx-nx*.15,3.4,wz-nz*.15);parts.pot.push(g);const gg=new THREE.SphereGeometry(.28,6,5);gg.scale(nx?.6:1.6,.6,nz?.6:1.6);gg.translate(wx-nx*.15,3.6,wz-nz*.15);parts.green.push(gg)}
   else{const g=new THREE.SphereGeometry(.7,7,6);g.scale(1,.6,1);g.translate(x+1-nx*.4,.35,z+1-nz*.4);parts.green.push(g)}}
  const add=(arr,m,cast)=>{const g=mergeGeos(arr);if(!g)return;const ms=new THREE.Mesh(g,m);ms.castShadow=shadows&&!!cast;ms.receiveShadow=false;ms.matrixAutoUpdate=false;W.add(ms)};
  add(parts.trunk,new THREE.MeshLambertMaterial({color:'#6a5036'}),1);add(parts.leaf,new THREE.MeshLambertMaterial({color:'#4a7a2a'}),1);
  add(parts.cloth,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),1);add(parts.lamp,new THREE.MeshLambertMaterial({color:'#c8a040',emissive:'#a06010',emissiveIntensity:.6}));
  add(parts.wire,new THREE.MeshBasicMaterial({color:'#222'}));add(parts.pot,new THREE.MeshLambertMaterial({color:'#9a4a2a'}));add(parts.green,new THREE.MeshLambertMaterial({color:'#4f7a34'}))}
 // ---------- igrači ----------
 syncPlayers(list,myIdx,mySide,dt,now){const seen=new Set();
  for(const p of list){seen.add(p.idx);let e=this.ents.get(p.idx);
   if(!e||e.side!==p.side||e.ag!==p.ag){if(e)this.scene.remove(e.root);const root=makeChar(p.side,p.ag);this.scene.add(root);e={root,side:p.side,ag:p.ag,gunKey:'',name:null,nameKey:'',dead:0,idx:p.idx};this.ents.set(p.idx,e)}
   const R=e.root,U=R.userData;const me=p.idx===myIdx;R.visible=!me&&(p.alive||e.dead<30);
   if(!R.visible)continue;
   R.position.set(p.x,p.y,p.z);R.rotation.y=p.yaw;
   // oružje
   const gk=p.w+'|'+(p.sk?p.sk.join(','):'');if(gk!==e.gunKey){if(e.gun)U.hand.remove(e.gun);e.gun=makeGun(p.w||'knife',p.sk);e.gun.position.set(0,0,0);U.hand.add(e.gun);e.gunKey=gk}
   // ime (samo saigrači)
   const showName=p.side===mySide&&p.alive;const nk=p.name+p.side;if(showName&&e.nameKey!==nk){if(e.name)R.remove(e.name);e.name=nameSprite(p.name,p.side==='T'?'#f0c060':'#8ec5ff');e.name.position.y=2.15;R.add(e.name);e.nameKey=nk}
   if(e.name)e.name.visible=showName;
   if(!p.alive){e.dead+=dt;const t=Math.min(1,e.dead/.45);R.rotation.x=0;U.hips.rotation.x=-t*1.45;U.hips.position.y=.95-t*.72;U.spine.rotation.x=-t*.2;U.lL.hp.rotation.x=t*.3;U.lR.hp.rotation.x=t*.2;U.lL.kn.rotation.x=0;U.lR.kn.rotation.x=0;U.blob.visible=false;if(e.gun)e.gun.visible=false;continue}
   e.dead=0;U.blob.visible=true;if(e.gun)e.gun.visible=true;
   const sp=Math.hypot(p.vx||0,p.vz||0);U.phase+=dt*sp*1.55;const sw=Math.min(1,sp/4)*.75;const ph=U.phase;
   const du=p.duck||0;U.hips.position.y=.95-du*.42;U.hips.rotation.x=0;
   U.lL.hp.rotation.x=Math.sin(ph)*sw+du*1.2;U.lR.hp.rotation.x=-Math.sin(ph)*sw+du*1.2;
   U.lL.kn.rotation.x=-(Math.max(0,-Math.sin(ph+1.2))*sw*1.2+du*2.1);U.lR.kn.rotation.x=-(Math.max(0,Math.sin(ph+1.2))*sw*1.2+du*2.1);
   if(!p.og){U.lL.hp.rotation.x=.7;U.lR.hp.rotation.x=.25;U.lL.kn.rotation.x=-1.1;U.lR.kn.rotation.x=-.6}
   U.spine.rotation.x=(p.pitch||0)*.7-du*.3;U.neck.rotation.x=(p.pitch||0)*.3;
   if(p.plant||p.defuse){U.spine.rotation.x=-.6;U.aR.sh.rotation.x=.6}else U.aR.sh.rotation.x=1.2+(p.kick||0)*.3}
  for(const [k,e] of this.ents)if(!seen.has(k)){this.scene.remove(e.root);this.ents.delete(k)}}
 muzzleOf(idx){const e=this.ents.get(idx);if(!e||!e.gun||!e.root.visible)return null;const t=e.gun.userData.tip||[0,0];const v=new THREE.Vector3(0,t[1],-t[0]);e.gun.localToWorld(v);return v}
 // ---------- viewmodel ----------
 setVM(w,sk,side,ag){const vm=this.vm;const key=w+'|'+(sk?sk.join(','):'')+'|'+side+ag;if(vm.key===key)return;vm.key=key;
  if(vm.g)this.vmScene.remove(vm.g);if(!w){vm.g=null;return}const g=new THREE.Group();const gun=makeGun(w,sk);g.add(gun);vm.gun=gun;
  const A=D.AGENTS[side||'T'][(ag||0)%5];const sleeve=lam(A.c[0]),glove=lam('#25221f');
  const mkA=(x,y,z,ry,rx)=>{const a=new THREE.Group();const s=new THREE.Mesh(new THREE.CylinderGeometry(.034,.04,.3,8),sleeve);s.rotation.x=Math.PI/2-.5;s.position.set(0,-.07,.14);a.add(s);const h=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,.075),glove);h.position.y=-.035;a.add(h);a.position.set(x,y,z);a.rotation.set(rx||0,ry||0,0);g.add(a);return a};
  const wd=D.W[w]||{};
  if(wd.slot===4||wd.model==='c4'){mkA(0,-.03,.06,.1,.2);gun.position.set(0,.02,-.02)}
  else if(wd.model==='knife'){mkA(0,-.02,.08,0,0);gun.rotation.set(0,0,0);gun.position.set(0,0,0)}
  else if(wd.model==='dual'){mkA(0,-.02,.08,0,0);mkA(-.24,-.02,.06,0,0)}
  else{mkA(0,-.03,.08,0,0);const fw=(INV.GS[wd.model]&&INV.GS[wd.model].handguard)?INV.GS[wd.model].handguard[0]/100+.08:.16;mkA(-.06,-.02,-fw,-.5,.1)}
  vm.base=wd.model==='knife'?[.2,-.24,-.4]:wd.slot===4?[.2,-.25,-.36]:wd.model==='c4'?[.05,-.3,-.42]:wd.cat==='pistol'||wd.cat==='zeus'?[.16,-.19,-.44]:[.19,-.2,-.46];
  vm.g=g;this.vmScene.add(g);vm.w=w}
 vmEvent(k,dur){const vm=this.vm;if(k==='fire'){vm.kick=1;vm.flashT=.05}else{vm.anim=k;vm.animT=0;vm.animD=dur||1}}
 updVM(dt,state){const vm=this.vm;if(!vm.g)return;const g=vm.g;vm.kick=Math.max(0,vm.kick-dt*9);vm.animT+=dt;
  const sp=state.speed||0;vm.bob+=dt*(sp>.5&&state.og?sp*1.5:0);const ba=Math.min(1,sp/6)*(state.og?1:0);
  const dy=state.yaw-vm.lastYaw,dp=state.pitch-vm.lastPitch;vm.lastYaw=state.yaw;vm.lastPitch=state.pitch;
  vm.sway[0]+=(Math.max(-.08,Math.min(.08,dy*2))-vm.sway[0])*Math.min(1,dt*10);vm.sway[1]+=(Math.max(-.08,Math.min(.08,dp*2))-vm.sway[1])*Math.min(1,dt*10);
  const b=vm.base||[.17,-.21,-.36];let x=b[0]+Math.sin(vm.bob)*.012*ba+vm.sway[0]*.25,y=b[1]+Math.abs(Math.cos(vm.bob))*.012*ba-vm.sway[1]*.2,z=b[2]+vm.kick*.045;
  let rx=vm.kick*.09,ry=vm.sway[0]*.6,rz=0;
  const t=Math.min(1,vm.animT/vm.animD);
  if(vm.anim==='draw'){y-=(1-t)*.25;rx-=(1-t)*.6;if(t>=1)vm.anim=null}
  else if(vm.anim==='reload'){const k=Math.sin(t*Math.PI);y-=k*.08;rx-=k*.55;rz+=k*.35;if(t>=1)vm.anim=null}
  else if(vm.anim==='knife'||vm.anim==='knife2'){const k=Math.sin(t*Math.PI);rz+=k*(vm.anim==='knife'?1.1:.2);ry+=k*.6;z-=k*.12;x-=k*.12;if(t>=1)vm.anim=null}
  else if(vm.anim==='pin'){y+=.03;z+=.08;rx+=.4}
  else if(vm.anim==='throw'){const k=Math.sin(t*Math.PI);z-=k*.25;y+=k*.08;rx-=k*.6;if(t>=1)vm.anim=null}
  else if(vm.anim==='plant'){y-=.05;rx+=.5}
  if(state.inspect){ry+=.9;rz+=.4;x-=.05}
  g.position.set(x,y,z);g.rotation.set(rx,ry,rz);g.visible=!state.hide}
 // ---------- efekti ----------
 addFx(o){this.fx.push(o);this.scene.add(o.obj);if(this.fx.length>220){const f=this.fx.shift();this.scene.remove(f.obj);if(f.dispose)f.dispose()}}
 tracer(a,b,own){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]);const m=new THREE.LineBasicMaterial({color:'#ffe9a0',transparent:true,opacity:own?.35:.6});
  const l=new THREE.Line(g,m);this.addFx({obj:l,t:0,life:.09,upd:(f,d)=>{m.opacity*=.75},dispose:()=>{g.dispose();m.dispose()}})}
 impact(p,n,kind){// rupa + prašina
  const m=mat('hole',()=>new THREE.MeshBasicMaterial({color:'#1a140e',transparent:true,opacity:.8,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));const g=mat('holeG',()=>new THREE.CircleGeometry(.045,6));
  if(kind!==1){const d=new THREE.Mesh(g,m);d.position.set(p[0]+n[0]*.01,p[1]+n[1]*.01,p[2]+n[2]*.01);d.lookAt(p[0]+n[0],p[1]+n[1],p[2]+n[2]);this.addFx({obj:d,t:0,life:12})}
  this.puffs(p,kind===1?'#8a1010':'#c8b090',kind===1?5:4,kind===1?.35:.25,.5)}
 puffs(p,col,n,size,life,vel){for(let i=0;i<n;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:this.puff,color:col,transparent:true,opacity:.8,depthWrite:false}));s.position.set(p[0],p[1],p[2]);s.scale.setScalar(size*(.6+Math.random()*.6));
  const v=[(Math.random()-.5)*(vel||1.5),Math.random()*(vel||1.5),(Math.random()-.5)*(vel||1.5)];this.addFx({obj:s,t:0,life:life*(.7+Math.random()*.6),upd:(f,d)=>{s.position.x+=v[0]*d;s.position.y+=v[1]*d;s.position.z+=v[2]*d;s.material.opacity=.8*(1-f.t/f.life);s.scale.multiplyScalar(1+d*1.2)},dispose:()=>s.material.dispose()})}}
 muzzle(pos,big){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:this.puff,color:'#ffd070',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));s.position.copy(pos);s.scale.setScalar(big?.7:.45);
  this.addFx({obj:s,t:0,life:.05,dispose:()=>s.material.dispose()});this.flashL.position.copy(pos);this.flashL.intensity=6;}
 explosion(p,kind){const big=kind==='c4';const col=kind==='flash'?'#ffffff':kind==='fizz'?'#888':'#ffb050';
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:this.puff,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));s.position.set(p[0],p[1]+.3,p[2]);s.scale.setScalar(big?14:kind==='flash'?5:4);
  this.addFx({obj:s,t:0,life:big?.7:.35,upd:(f)=>{s.material.opacity=1-f.t/f.life},dispose:()=>s.material.dispose()});
  if(kind!=='flash')this.puffs([p[0],p[1]+.4,p[2]],kind==='fizz'?'#777':'#4a4038',big?26:12,big?4:1.6,big?3:1.6,big?6:3);
  this.flashL.position.set(p[0],p[1]+1,p[2]);this.flashL.intensity=big?60:kind==='flash'?40:25;this.flashL.distance=big?60:18}
 blood(p){this.puffs(p,'#7a0808',6,.3,.45,1.2)}
 // dim (18s)
 smoke(id,p,age){if(this.smokes.has(id))return;const g=new THREE.Group();const n=this.q==='low'?14:26;const parts=[];
  for(let i=0;i<n;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:this.puff,color:new THREE.Color().setHSL(0,0,.62+Math.random()*.1),transparent:true,opacity:0,depthWrite:false,fog:true}));
   const a=Math.random()*6.28,r=Math.random()*2.6,h=Math.random()*2.6;s.userData.t=[Math.cos(a)*r,h,Math.sin(a)*r];s.userData.sz=2.6+Math.random()*1.8;g.add(s);parts.push(s)}
  g.position.set(p[0],p[1]-.3,p[2]);this.scene.add(g);this.smokes.set(id,{g,parts,t:age||0,life:18})}
 fire(id,p,r,age){if(this.fires.has(id))return;const g=new THREE.Group();const n=this.q==='low'?10:20;const parts=[];
  for(let i=0;i<n;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:this.puff,color:'#ff8a20',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));const a=Math.random()*6.28,rr=Math.sqrt(Math.random())*r;s.userData.b=[Math.cos(a)*rr,0,Math.sin(a)*rr];s.userData.ph=Math.random()*6;g.add(s);parts.push(s)}
  const l=new THREE.PointLight('#ff7a20',8,10,2);l.position.y=1;g.add(l);g.position.set(p[0],p[1],p[2]);this.scene.add(g);this.fires.set(id,{g,parts,l,t:age||0})}
 fireOut(id){const f=this.fires.get(id);if(f){this.scene.remove(f.g);f.parts.forEach(s=>s.material.dispose());this.fires.delete(id)}}
 clearRound(){for(const [id,s] of this.smokes){this.scene.remove(s.g);s.parts.forEach(q=>q.material.dispose())}this.smokes.clear();for(const id of [...this.fires.keys()])this.fireOut(id)}
 // bombe u letu i dropovi
 syncNades(list){const seen=new Set();for(const n of list){seen.add(n[0]);let m=this.nadeM.get(n[0]);if(!m){m=makeGun(n[1],0);this.scene.add(m);this.nadeM.set(n[0],m)}m.position.set(n[2],n[3],n[4]);m.rotation.x+=.2;m.rotation.z+=.13}
  for(const [k,m] of this.nadeM)if(!seen.has(k)){this.scene.remove(m);this.nadeM.delete(k)}}
 syncDrops(list,bomb){const seen=new Set();for(const d of list){seen.add(d.id);let m=this.dropM.get(d.id);if(!m){m=makeGun(d.w,d.sk);m.rotation.z=Math.PI/2;m.rotation.order='YXZ';m.rotation.y=(d.id*1.7)%6.28;this.scene.add(m);this.dropM.set(d.id,m)}m.position.set(d.x,d.y+.06,d.z)}
  for(const [k,m] of this.dropM)if(!seen.has(k)){this.scene.remove(m);this.dropM.delete(k)}
  if(bomb&&(bomb.st==='planted'||bomb.st==='dropped')){if(!this.c4){this.c4=makeGun('c4',0);this.scene.add(this.c4)}this.c4.visible=true;this.c4.position.set(bomb.x,bomb.y+.04,bomb.z)}else if(this.c4)this.c4.visible=false}
 // ---------- kadar ----------
 frame(cam,dt,vmState){const c=this.cam;c.position.set(cam.x,cam.y,cam.z);c.rotation.set(cam.pitch,cam.yaw,cam.roll||0);if(c.fov!==cam.fov){c.fov=cam.fov;c.updateProjectionMatrix()}
  this.flashL.intensity*=Math.pow(.002,dt);
  for(let i=this.fx.length-1;i>=0;i--){const f=this.fx[i];f.t+=dt;if(f.upd)f.upd(f,dt);if(f.t>=f.life){this.scene.remove(f.obj);if(f.dispose)f.dispose();this.fx.splice(i,1)}}
  for(const [id,s] of this.smokes){s.t+=dt;const k=s.t<1?s.t:s.t>s.life-3?Math.max(0,(s.life-s.t)/3):1;s.parts.forEach((p,i)=>{const u=p.userData;const grow=Math.min(1,s.t/1.2);p.position.set(u.t[0]*grow,u.t[1]*grow+.6,u.t[2]*grow);p.scale.setScalar(u.sz*(.5+grow*.6));p.material.opacity=.92*k;p.material.rotation+=dt*.05});
   if(s.t>s.life){this.scene.remove(s.g);s.parts.forEach(q=>q.material.dispose());this.smokes.delete(id)}}
  for(const [,f] of this.fires){f.t+=dt;f.parts.forEach(p=>{const u=p.userData;const k=(f.t*3+u.ph)%1;p.position.set(u.b[0],k*1.4,u.b[2]);p.scale.setScalar(.9*(1-k)+.3);p.material.opacity=1-k});f.l.intensity=6+Math.sin(f.t*20)*2}
  if(this.c4&&this.c4.visible&&cam.c4blink!=null)this.c4.userData.led.visible=cam.c4blink;
  this.r.autoClear=true;this.r.render(this.scene,c);
  if(vmState&&this.vm.g&&!vmState.hide){this.updVM(dt,vmState);this.r.autoClear=false;this.r.clearDepth();this.r.render(this.vmScene,this.vmCam)}else if(vmState)this.updVM(dt,vmState)}
 vmMuzzleWorld(){const vm=this.vm;if(!vm.gun||!vm.g||!vm.g.visible)return null;const t=vm.gun.userData.tip||[0,0];vm.g.updateMatrixWorld(true);const v=new THREE.Vector3(0,t[1],-t[0]);vm.gun.localToWorld(v);
  // vm kamera je u ishodištu → tačka je u prostoru pogleda; prebaci u svijet
  this.cam.updateMatrixWorld();const k=Math.tan(this.cam.fov*Math.PI/360)/Math.tan(this.vmCam.fov*Math.PI/360);v.x*=k;v.y*=k;return v.applyMatrix4(this.cam.matrixWorld)}
 // ---------- meni scena ----------
 menu(side,ag,dt,w,sk){if(!this.menuScene){const s=new THREE.Scene();s.background=new THREE.Color('#0d1016');s.fog=new THREE.Fog('#0d1016',8,30);
   s.add(new THREE.HemisphereLight('#c8d8ff','#302820',1.4));const k=new THREE.DirectionalLight('#ffe2c0',2.4);k.position.set(3,5,4);s.add(k);const rim=new THREE.DirectionalLight('#5a8aff',1.6);rim.position.set(-4,3,-3);s.add(rim);
   const fl=new THREE.Mesh(new THREE.CircleGeometry(2.2,40),new THREE.MeshLambertMaterial({color:'#1b1f27'}));fl.rotation.x=-Math.PI/2;s.add(fl);
   const ring=new THREE.Mesh(new THREE.RingGeometry(2.1,2.18,48),new THREE.MeshBasicMaterial({color:'#7cff01',transparent:true,opacity:.5}));ring.rotation.x=-Math.PI/2;ring.position.y=.01;s.add(ring);
   this.menuScene=s;this.menuCam=new THREE.PerspectiveCamera(36,1,.1,100);this.menuT=0}
  const s=this.menuScene;const key=side+ag+(w||'')+(sk?sk.join(','):'');if(this.menuKey!==key){if(this.menuChar)s.remove(this.menuChar);this.menuChar=makeChar(side,ag);const U=this.menuChar.userData;const gun=makeGun(w||(side==='T'?'ak47':'m4a4'),sk);U.hand.add(gun);s.add(this.menuChar);this.menuKey=key}
  this.menuT+=dt;const ch=this.menuChar;ch.rotation.y=Math.PI*1.18+Math.sin(this.menuT*.4)*.35;const U=ch.userData;U.spine.rotation.x=Math.sin(this.menuT*1.3)*.02;
  const wide=innerWidth/innerHeight;const mc=this.menuCam;mc.aspect=wide;mc.updateProjectionMatrix();const off=wide>1.2?-1.25:0;mc.position.set(off+0,1.25,5.2);mc.lookAt(off,1.0,0);
  this.r.autoClear=true;this.r.render(s,mc)}
 shadowsDirty(){if(this.r.shadowMap.enabled)this.r.shadowMap.needsUpdate=true}
}
// mali prikaz lika (buy meni)
export class BSPreview{
 constructor(canvas){this.c=canvas;this.r=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});this.r.outputColorSpace=THREE.SRGBColorSpace;this.r.setPixelRatio(Math.min(2,devicePixelRatio||1));
  this.s=new THREE.Scene();this.s.add(new THREE.HemisphereLight('#dfe8ff','#3a3026',1.5));const k=new THREE.DirectionalLight('#fff',2.2);k.position.set(2,3,3);this.s.add(k);
  this.cam=new THREE.PerspectiveCamera(30,1,.1,50);this.cam.position.set(0,1.15,4.6);this.cam.lookAt(0,.95,0);this.t=0;this.key=''}
 show(side,ag,w,sk){const key=side+ag+w+(sk?sk.join(','):'');if(key===this.key)return;this.key=key;if(this.ch)this.s.remove(this.ch);this.ch=makeChar(side,ag);const gun=makeGun(w||'knife',sk);this.ch.userData.hand.add(gun);this.s.add(this.ch)}
 render(dt){const w=this.c.clientWidth,h=this.c.clientHeight;if(!w||!h)return;if(this.c.width!==Math.floor(w*this.r.getPixelRatio())){this.r.setSize(w,h,false);this.cam.aspect=w/h;this.cam.updateProjectionMatrix()}
  this.t+=dt;if(this.ch)this.ch.rotation.y=Math.PI+.5+Math.sin(this.t*.6)*.4;this.r.render(this.s,this.cam)}
}
export {makeGun};
