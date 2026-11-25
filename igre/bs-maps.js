// BASH-STRIKE – mape (originalne), fizika kretanja, raycast, navigacija
'use strict';
(function(G){
const CELL=2;
// legenda: h = visina stupca (m), roof = [od,do] (tunel/lučni prolaz), k = vrsta
const LEG={
 '.':{h:0,k:'floor'},',':{h:0,k:'floor',alt:1},'t':{h:0,k:'floor',alt:2},'k':{h:0,k:'floor',alt:2},
 '1':{h:.5,k:'level'},'2':{h:1,k:'level'},'3':{h:1.5,k:'level'},'4':{h:2,k:'level'},
 'c':{h:1.05,k:'crate'},'C':{h:2.1,k:'crate'},'K':{h:3.1,k:'crate'},'w':{h:1.05,k:'lowwall'},'o':{h:1.15,k:'barrel'},
 '#':{h:7,k:'wall'},'H':{h:10,k:'wall',tall:1},'X':{h:12,k:'border'},
 'T':{h:0,k:'floor',roof:[3.3,7],tun:1},'D':{h:0,k:'floor',roof:[3.1,7],door:1}};
const MAPS={};
MAPS.dina={id:'dina',n:'Dina',full:'bs_dina',desc:'Pustinjski grad – široka duga ulica do A, uski tuneli do B.',
 theme:{wall:['#d9b98a','#c9a46f'],wallTall:'#cfae7d',floor:'#cbb28a',floorAlt:'#b89c74',floorSpawn:'#bfa47c',level:'#cdb08a',crate:'#8a6a42',trim:'#a8875a',sky:['#7db7e8','#f3dcb6'],fog:'#e9d6b4',sun:[.55,.8,.35],sunCol:'#fff1d6',amb:.62,style:'desert'},
 ops:[['#',1,1,58,58],['t',22,50,37,56],['k',25,3,34,8],['.',19,9,34,13],[',',28,14,31,49],['#',28,17,28,17],['#',31,17,31,17],['D',29,17,30,17],
  ['c',28,32,28,33],['C',31,26,31,26],['.',36,42,45,52],['.',36,33,45,39],['D',43,40,44,41],['.',46,15,55,38],['1',46,14,55,14],
  ['C',50,30,51,31],['c',47,22,47,22],['c',54,25,54,26],['o',53,17,53,17],['2',37,3,55,13],['K',44,6,45,7],['C',50,9,50,10],['C',40,10,41,10],
  ['1',35,4,35,7],['2',36,4,36,7],['1',32,22,32,24],['2',33,22,33,24],['3',34,22,34,24],['4',35,21,39,24],['4',37,15,39,20],['3',37,14,39,14],
  ['.',10,48,21,54],['T',10,26,13,47],['T',14,37,27,39],['.',10,19,13,25],['.',3,3,18,18],['2',3,3,7,6],['1',8,3,8,6],
  ['C',8,9,9,10],['c',14,13,14,13],['C',15,6,16,7],['c',5,14,6,14],['o',17,17,17,17],['#',21,9,22,9],['#',21,12,22,13],['D',21,10,22,11],
  ['c',26,53,27,53],['C',33,52,33,52],['c',39,45,40,45],['o',44,50,44,50],['H',40,16,44,30],['H',15,20,26,34]],
 zones:[['CT Spawn',25,3,34,8],['A Site',37,3,55,13],['CT prolaz',35,4,36,7],['Catwalk',32,14,39,24],['Long A',46,14,55,38],['Long vrata',36,33,45,41],['Dvorište',36,42,45,52],
  ['T Spawn',22,50,37,56],['Sredina',28,14,31,49],['CT sredina',23,9,34,13],['B vrata',19,9,22,13],['Vanjski tuneli',10,48,21,54],['Gornji tunel',10,26,13,47],['Donji tunel',14,37,27,39],['Izlaz tunela',10,19,13,25],['B Site',3,3,18,18]],
 sites:{A:[37,3,55,13],B:[3,3,18,18]},plant:{A:[46,9],B:[11,10]},
 spawns:{T:[[24,52],[26,54],[29,52],[32,54],[35,52],[30,55],[23,55]],CT:[[26,4],[28,6],[30,4],[32,6],[33,4],[27,7]]},
 routes:{A:[[[30,52],[40,47],[43,41],[43,36],[48,30],[50,20],[48,9]],[[29,48],[29,24],[33,23],[37,22],[38,16],[44,10]]],
  B:[[[16,51],[11,46],[11,30],[11,22],[10,12]],[[29,48],[29,40],[20,38],[12,36],[11,22],[8,12]]]},
 holds:{A:[[44,10],[52,12],[40,5],[38,12],[48,4]],B:[[8,7],[15,10],[5,12],[17,5],[12,16]],M:[[29,12],[30,15]]}};
MAPS.vinograd={id:'vinograd',n:'Vinograd',full:'bs_vinograd',desc:'Talijansko selo – trg s fontanom, vinova loza do B i apartmani do A.',
 theme:{wall:['#e8d3b0','#d9b48c'],wallTall:'#cfa27a',floor:'#a89a88',floorAlt:'#9a8f80',floorSpawn:'#b0a084',level:'#b9a58a',crate:'#7a5a36',trim:'#9c6b46',sky:['#8ec3ee','#fbe9cf'],fog:'#e7dccb',sun:[-.4,.75,.5],sunCol:'#fff4e0',amb:.66,style:'italy'},
 ops:[['#',1,1,58,58],['t',3,45,12,56],['k',46,3,56,11],['.',3,3,17,16],['4',3,3,7,5],['3',8,3,8,5],['2',9,3,9,5],['1',10,3,10,5],
  ['.',5,17,8,44],['c',8,30,8,31],['o',5,24,5,24],['w',5,36,6,36],['.',9,17,23,19],[',',20,20,23,27],[',',20,24,34,36],['w',26,29,28,31],['#',27,30,27,30],
  ['T',35,31,37,34],['.',13,50,42,54],['.',13,46,24,48],['.',21,37,24,45],['.',38,43,42,49],['.',38,28,56,42],
  ['C',45,34,46,35],['c',50,38,51,38],['K',53,30,55,31],['w',40,30,41,30],['o',48,29,48,29],['.',50,12,54,27],['.',18,5,45,8],['.',30,9,33,23],
  ['C',11,9,12,10],['c',15,13,15,13],['c',5,12,6,12],['o',16,4,16,4],['c',22,33,22,33],['C',32,25,33,25],['c',25,51,25,52],['C',33,53,34,53],['o',40,51,40,51],['c',28,6,28,6],['o',38,7,38,7],
  ['H',34,9,37,13],['H',10,22,17,40]],
 zones:[['B balkon',3,3,10,5],['B Site',3,3,17,16],['Vinova loza',5,17,8,44],['Pekara',9,17,23,19],['Uska ulica',20,20,23,27],['Trg',20,24,34,36],['Apartmani',35,31,37,34],
  ['A Site',38,28,56,42],['A ulica',38,43,42,49],['Glavna cesta',13,50,42,54],['Mid ulica',13,37,24,48],['T Spawn',3,45,12,56],['CT Spawn',46,3,56,11],['CT cesta',50,12,54,27],['Crkveni prolaz',30,9,33,23],['Gornja cesta',18,5,45,8]],
 sites:{A:[38,28,56,42],B:[3,3,17,16]},plant:{A:[46,37],B:[9,10]},
 spawns:{T:[[5,47],[8,48],[11,47],[5,52],[9,53],[11,55],[6,55]],CT:[[48,5],[51,4],[54,6],[49,9],[53,9],[55,4]]},
 routes:{A:[[[10,51],[30,52],[40,48],[44,38]],[[13,47],[22,42],[27,34],[36,32],[45,33]]],B:[[[6,44],[6,30],[7,20],[10,10]],[[13,47],[22,42],[22,30],[21,18],[12,18],[10,10]]]},
 holds:{A:[[47,30],[54,35],[40,36],[50,40],[44,29]],B:[[5,4],[12,6],[15,14],[4,13],[8,9]],M:[[31,20],[32,12]]}};
MAPS.carsija={id:'carsija',n:'Čaršija',full:'bs_carsija',desc:'Bliskoistočna čaršija – rampa i palata do A, stanovi i pijaca do B.',
 theme:{wall:['#e2c9a0','#cfa978'],wallTall:'#b98d5f',floor:'#c2a57e',floorAlt:'#a88d6a',floorSpawn:'#b79c76',level:'#c9ad86',crate:'#6e4f2e',trim:'#2f7f86',sky:['#86b9e0','#f6d8a8'],fog:'#eed8b0',sun:[.3,.85,-.45],sunCol:'#ffe9c8',amb:.6,style:'bazaar'},
 ops:[['#',1,1,58,58],['t',20,51,39,56],['k',22,3,37,8],['2',41,10,56,25],['.',38,47,45,50],['.',41,40,45,46],['1',41,36,45,39],['2',41,26,45,35],
  ['.',40,52,56,55],['.',52,39,56,51],['1',52,38,56,38],['2',52,37,56,37],['3',52,36,56,36],['4',52,26,56,35],
  ['K',47,15,48,16],['C',53,20,54,21],['C',43,12,43,13],['.',38,4,45,6],['1',41,7,45,7],['2',41,8,45,9],
  [',',27,26,32,50],['c',27,40,27,41],['C',32,34,32,35],['o',29,30,29,30],['.',28,9,31,25],['D',28,18,31,18],
  ['T',33,30,38,32],['1',39,30,39,32],['2',40,30,40,32],['.',3,10,17,24],['.',3,46,19,55],['T',4,28,8,45],['.',4,25,8,27],['T',9,35,26,37],['.',8,4,21,9],
  ['C',10,15,11,16],['c',14,20,14,21],['K',4,11,5,12],['c',16,12,16,12],['o',7,22,7,22],['c',8,50,9,50],['C',14,53,15,53],['o',17,48,17,48],['c',24,53,25,53],['C',35,52,35,53],
  ['H',46,27,51,45],['H',18,11,25,32]],
 zones:[['CT Spawn',22,3,37,8],['CT → A',38,4,45,9],['A Site',41,10,56,25],['Ulaz rampe',38,46,45,50],['A rampa',41,26,45,46],['Palata ulaz',40,51,56,56],['Palata',46,26,56,50],
  ['Konektor',33,30,40,32],['Kafana',28,9,31,25],['Sredina',27,26,32,50],['B kratki',9,35,26,37],['Stanovi',4,25,8,45],['B pijaca',3,46,19,55],['B Site',3,10,17,24],['CT → B',8,4,21,9],['T Spawn',20,51,39,56]],
 sites:{A:[41,10,56,25],B:[3,10,17,24]},plant:{A:[48,18],B:[10,17]},
 spawns:{T:[[22,53],[25,55],[28,53],[31,55],[34,53],[37,55],[30,52]],CT:[[24,4],[27,6],[30,4],[33,6],[36,4],[29,7]]},
 routes:{A:[[[30,52],[40,49],[43,40],[43,28],[48,18]],[[29,50],[29,36],[30,31],[36,31],[43,30],[47,18]],[[38,53],[54,50],[54,40],[54,30],[52,20]]],
  B:[[[19,51],[10,50],[6,44],[6,30],[6,25],[10,17]],[[29,48],[29,38],[26,36],[12,36],[6,34],[6,26],[10,17]]]},
 holds:{A:[[47,12],[54,24],[43,22],[50,18],[44,11]],B:[[4,10],[12,12],[16,22],[6,18],[15,11]],M:[[29,14],[30,22]]}};

// ---------- izgradnja ----------
function build(def){
 const W=60,H=60,n=W*H,ch=new Array(n).fill('X');
 for(const [c,x0,z0,x1,z1] of def.ops)for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)if(x>0&&z>0&&x<W-1&&z<H-1)ch[z*W+x]=c;
 const hgt=new Float32Array(n),r0=new Float32Array(n),r1=new Float32Array(n),walk=new Uint8Array(n),zone=new Int16Array(n).fill(-1);
 for(let i=0;i<n;i++){const L=LEG[ch[i]];hgt[i]=L.h;if(L.roof){r0[i]=L.roof[0];r1[i]=L.roof[1]}walk[i]=(L.k==='floor'||L.k==='level')?1:0}
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){for(let k=0;k<def.zones.length;k++){const q=def.zones[k];if(x>=q[1]&&x<=q[3]&&z>=q[2]&&z<=q[4]){zone[z*W+x]=k;break}}}
 const M={def,id:def.id,W,H,C:CELL,ch,hgt,r0,r1,walk,zone,theme:def.theme};
 M.cellC=(x,z)=>[(x+.5)*CELL,(z+.5)*CELL];
 M.idx=(x,z)=>{const i=Math.floor(x/CELL),k=Math.floor(z/CELL);return (i<0||k<0||i>=W||k>=H)?-1:k*W+i};
 M.groundAt=(x,z)=>{const i=M.idx(x,z);return i<0?0:hgt[i]};
 M.zoneName=(x,z)=>{const i=M.idx(x,z);return i<0||zone[i]<0?'':def.zones[zone[i]][0]};
 M.siteAt=(x,z)=>{const cx=x/CELL,cz=z/CELL;for(const k in def.sites){const s=def.sites[k];if(cx>=s[0]&&cx<s[2]+1&&cz>=s[1]&&cz<s[3]+1)return k}return null};
 M.spawnPos=(side,i)=>{const s=def.spawns[side][i%def.spawns[side].length];const c=M.cellC(s[0],s[1]);return [c[0],M.groundAt(c[0],c[1]),c[1]]};
 M.spawnCenter=side=>{let x=0,z=0;const s=def.spawns[side];s.forEach(p=>{x+=p[0];z+=p[1]});return [(x/s.length+.5)*CELL,(z/s.length+.5)*CELL]};
 // boxes u ćelijama koje presijeca AABB
 M.boxes=(x0,z0,x1,z1,out)=>{out.length=0;const i0=Math.max(0,Math.floor(x0/CELL)),i1=Math.min(W-1,Math.floor(x1/CELL)),k0=Math.max(0,Math.floor(z0/CELL)),k1=Math.min(H-1,Math.floor(z1/CELL));
  for(let k=k0;k<=k1;k++)for(let i=i0;i<=i1;i++){const j=k*W+i,bx=i*CELL,bz=k*CELL;if(hgt[j]>0)out.push(bx,0,bz,bx+CELL,hgt[j],bz+CELL);if(r1[j]>0)out.push(bx,r0[j],bz,bx+CELL,r1[j],bz+CELL)}
  if(i0>i1||k0>k1)out.push(-100,0,-100,1000,99,1000);return out};
 M.raycast=(ox,oy,oz,dx,dy,dz,maxT)=>raycast(M,ox,oy,oz,dx,dy,dz,maxT);
 // navigacija
 M.navOK=new Uint8Array(n);for(let i=0;i<n;i++)M.navOK[i]=walk[i];
 M.path=(sx,sz,tx,tz,noise)=>astar(M,sx,sz,tx,tz,noise||0);
 return M;
}
// ---------- raycast (DDA kroz mrežu) ----------
function raycast(M,ox,oy,oz,dx,dy,dz,maxT){
 const C=M.C,W=M.W,H=M.H;let ix=Math.floor(ox/C),iz=Math.floor(oz/C);
 const sx=dx>0?1:-1,sz=dz>0?1:-1;const tdx=dx!==0?Math.abs(C/dx):1e9,tdz=dz!==0?Math.abs(C/dz):1e9;
 let tmx=dx!==0?((dx>0?(ix+1)*C-ox:ox-ix*C)/Math.abs(dx)):1e9,tmz=dz!==0?((dz>0?(iz+1)*C-oz:oz-iz*C)/Math.abs(dz)):1e9;
 let tEnter=0,side=-1;let best=null;
 const ground=dy<0?-oy/dy:1e9;
 for(let it=0;it<400&&tEnter<=maxT;it++){
  if(ix<0||iz<0||ix>=W||iz>=H)break;
  const j=iz*W+ix,tExit=Math.min(tmx,tmz,maxT);
  const test=(y0,y1,kind)=>{let a,b;if(dy===0){if(oy<y0||oy>y1)return null;a=-1e9;b=1e9}else{a=(y0-oy)/dy;b=(y1-oy)/dy;if(a>b){const q=a;a=b;b=q}}
   const lo=Math.max(a,tEnter),hi=Math.min(b,tExit);if(lo>hi||hi<0)return null;
   let nx=0,ny=0,nz=0;if(lo===tEnter&&tEnter>0){if(side===0)nx=-sx;else nz=-sz}else ny=dy>0?-1:1;return {t:Math.max(0,lo),nx,ny,nz,k:kind}};
  let h=null;if(M.hgt[j]>0)h=test(0,M.hgt[j],M.ch[j]);if(M.r1[j]>0){const r=test(M.r0[j],M.r1[j],'roof');if(r&&(!h||r.t<h.t))h=r}
  if(h&&(!best||h.t<best.t)){best=h;break}
  if(tmx<tmz){tEnter=tmx;tmx+=tdx;ix+=sx;side=0}else{tEnter=tmz;tmz+=tdz;iz+=sz;side=1}
 }
 if(ground<=maxT&&(!best||ground<best.t))best={t:ground,nx:0,ny:1,nz:0,k:'ground'};
 if(!best)return null;best.x=ox+dx*best.t;best.y=oy+dy*best.t;best.z=oz+dz*best.t;return best;
}
// ---------- A* ----------
function astar(M,sx,sz,tx,tz,noise){
 const W=M.W,C=M.C,n=W*M.H;let s=Math.floor(sz/C)*W+Math.floor(sx/C),t=Math.floor(tz/C)*W+Math.floor(tx/C);
 const fix=i=>{if(i>=0&&i<n&&M.navOK[i])return i;const x=i%W,z=(i/W)|0;for(let r=1;r<4;r++)for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){const q=(z+b)*W+x+a;if(q>=0&&q<n&&M.navOK[q])return q}return -1};
 s=fix(s);t=fix(t);if(s<0||t<0)return null;
 const g=new Float32Array(n).fill(1e9),from=new Int32Array(n).fill(-1),closed=new Uint8Array(n);const heap=[];
 const hx=t%W,hz=(t/W)|0;const hf=i=>{const dx=Math.abs(i%W-hx),dz=Math.abs(((i/W)|0)-hz);return Math.max(dx,dz)+.414*Math.min(dx,dz)};
 const push=(f,i)=>{heap.push([f,i]);let k=heap.length-1;while(k>0){const p=(k-1)>>1;if(heap[p][0]<=heap[k][0])break;[heap[p],heap[k]]=[heap[k],heap[p]];k=p}};
 const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];k=m}}return top};
 g[s]=0;push(hf(s),s);const D=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
 let iter=0;
 while(heap.length&&iter++<20000){const [,c]=pop();if(closed[c])continue;closed[c]=1;if(c===t)break;const cx=c%W,cz=(c/W)|0,ch=M.hgt[c];
  for(const [ax,az,cost] of D){const x=cx+ax,z=cz+az;if(x<0||z<0||x>=W||z>=M.H)continue;const q=z*W+x;if(!M.navOK[q]||closed[q])continue;
   const dh=M.hgt[q]-ch;if(dh>.55)continue;if(dh<-1.1)continue;
   if(ax&&az&&(!M.navOK[cz*W+x]||!M.navOK[z*W+cx]))continue;
   // izbjegavaj ćelije uz zid (bolje kretanje)
   let pen=0;for(const [bx,bz] of [[1,0],[-1,0],[0,1],[0,-1]]){const w=(z+bz)*W+x+bx;if(w>=0&&w<n&&!M.navOK[w])pen+=.35}
   if(noise)pen+=((Math.sin(q*12.9898+noise*78.233)*43758.5453)%1+1)%1*noise;
   const ng=g[c]+cost+pen;if(ng<g[q]){g[q]=ng;from[q]=c;push(ng+hf(q),q)}}}
 if(from[t]<0&&s!==t)return null;
 const out=[];for(let c=t;c>=0;c=from[c]){out.push(c);if(c===s)break}out.reverse();
 return out.map(i=>[(i%W+.5)*C,M.hgt[i],(((i/W)|0)+.5)*C]);
}

// ---------- fizika kretanja (CS stil) ----------
const PH={G:20.3,JUMP:7.55,STEP:.55,R:.4,H:1.83,HC:1.37,EYE:1.64,EYEC:1.17,FRIC:5.2,ACC:5.5,AIRACC:12,AIRCAP:.76,STOP:2.03,WALK:.52,DUCK:.34};
const _b=[];
function pHeight(p){return PH.H-(PH.H-PH.HC)*p.duck}
function pEye(p){return p.y+PH.EYE-(PH.EYE-PH.EYEC)*p.duck}
function overlap(M,x,y,z,h){M.boxes(x-PH.R,z-PH.R,x+PH.R,z+PH.R,_b);
 for(let i=0;i<_b.length;i+=6){if(x+PH.R>_b[i]&&x-PH.R<_b[i+3]&&y+h>_b[i+1]&&y<_b[i+4]&&z+PH.R>_b[i+2]&&z-PH.R<_b[i+5])return i}return -1}
function moveAxis(M,p,ax,d,h){if(!d)return;const old=ax===0?p.x:p.z;if(ax===0)p.x+=d;else p.z+=d;
 for(let g=0;g<4;g++){const i=overlap(M,p.x,p.y,p.z,h);if(i<0)return;const top=_b[i+4];
  if(p.onGround&&top-p.y<=PH.STEP&&top>p.y&&overlap(M,p.x,top+.001,p.z,h)<0){p.y=top;continue}
  if(ax===0){p.x=d>0?_b[i]-PH.R-1e-4:_b[i+3]+PH.R+1e-4;p.vx=0}else{p.z=d>0?_b[i+2]-PH.R-1e-4:_b[i+5]+PH.R+1e-4;p.vz=0}
  if(Math.abs((ax===0?p.x:p.z)-old)>Math.abs(d)+.01){if(ax===0)p.x=old;else p.z=old}}}
function pmove(M,p,cmd,dt){
 // cmd: {fw,sd,jump,duck,walk,yaw,maxspd}
 const wantDuck=cmd.duck?1:0;
 if(!p.onGround){if(wantDuck&&p.duck<1){const up=(PH.H-PH.HC)*(1-p.duck);p.duck=1;p.y+=up}
  else if(!wantDuck&&p.duck>0){const dn=(PH.H-PH.HC)*p.duck;if(overlap(M,p.x,p.y-dn,p.z,PH.H)<0&&p.y-dn>=0){p.y-=dn;p.duck=0}}}
 else{if(wantDuck)p.duck=Math.min(1,p.duck+dt/.18);else if(p.duck>0){const nd=Math.max(0,p.duck-dt/.18);if(overlap(M,p.x,p.y,p.z,PH.H-(PH.H-PH.HC)*nd)<0)p.duck=nd}}
 const h=pHeight(p);
 const sy=Math.sin(p.yaw),cy=Math.cos(p.yaw);
 let wx=-sy*cmd.fw+cy*cmd.sd,wz=-cy*cmd.fw-sy*cmd.sd;const wl=Math.hypot(wx,wz);if(wl>0){wx/=wl;wz/=wl}
 let wish=wl>0?cmd.maxspd*(p.duck>.5&&p.onGround?PH.DUCK:cmd.walk?PH.WALK:1):0;
 if(p.onGround){
  if(cmd.jump&&!p.jh){p.vy=PH.JUMP;p.onGround=false;p.jh=1;p.jumped=1}
  else{const sp=Math.hypot(p.vx,p.vz);if(sp>.001){const ctl=Math.max(sp,PH.STOP),drop=ctl*PH.FRIC*dt,ns=Math.max(0,sp-drop)/sp;p.vx*=ns;p.vz*=ns}
   if(wish>0){const cur=p.vx*wx+p.vz*wz,add=wish-cur;if(add>0){const ac=Math.min(add,PH.ACC*dt*wish);p.vx+=ac*wx;p.vz+=ac*wz}}}
 }
 if(!p.onGround&&wish>0){const ws=Math.min(wish,PH.AIRCAP),cur=p.vx*wx+p.vz*wz,add=ws-cur;if(add>0){const ac=Math.min(add,PH.AIRACC*wish*dt);p.vx+=ac*wx;p.vz+=ac*wz}}
 if(!cmd.jump)p.jh=0;
 // ograniči horizontalnu brzinu (sigurnost)
 const hs=Math.hypot(p.vx,p.vz),cap=Math.max(cmd.maxspd*1.6,4);if(hs>cap){p.vx*=cap/hs;p.vz*=cap/hs}
 if(!p.onGround)p.vy-=PH.G*dt;
 const wasG=p.onGround;
 moveAxis(M,p,0,p.vx*dt,h);moveAxis(M,p,1,p.vz*dt,h);
 // vertikalno
 p.y+=p.vy*dt;let land=false;
 const i=overlap(M,p.x,p.y,p.z,h);
 if(i>=0){if(p.vy<=0){p.y=_b[i+4];land=true}else{p.y=_b[i+1]-h-1e-3;p.vy=0}}
 if(p.y<=0){p.y=0;land=true}
 if(land){if(p.vy<-9)p.fall=-p.vy;p.vy=0;p.onGround=true}
 else if(wasG&&p.vy<=0){ // prati tlo niz stepenice
  let best=-1;for(let d=.02;d<=PH.STEP+.01;d+=.1){if(overlap(M,p.x,p.y-d,p.z,h)>=0||p.y-d<0){best=d;break}}
  if(best>0){const k=overlap(M,p.x,p.y-best,p.z,h);p.y=k>=0?Math.max(_b[k+4],p.y-best):0;p.onGround=true;p.vy=0}else p.onGround=false}
 else if(!land)p.onGround=false;
}
G.BS_MAPS={MAPS,build,PH,pmove,pHeight,pEye,CELL,LEG};
})(typeof window!=='undefined'?window:globalThis);
