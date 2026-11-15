// #Bash igre – realistične 3D figurice (ray-marching tijela rotacije + Phong/Fresnel osvjetljenje)
'use strict';
const PAWN3D=(()=>{
 const TH=27*Math.PI/180,ST=Math.sin(TH),CT=Math.cos(TH);           // kamera gleda odozgo pod 27°
 const SX0=-.55,SX1=.55,SY1=1.19,SY0=-.28;                         // granice slike (svjetske jedinice)
 const HT=1.3;                                                      // visina figure
 function R(y){                                                     // profil (radijus u visini y)
  if(y<0||y>HT)return 0;const h=y/HT;let r=0;
  if(h<=.1){const q=Math.abs((h-.05)/.05);r=Math.max(r,.44*Math.pow(Math.max(0,1-q*q*q*q),.25))}
  if(h>=.08&&h<=.62){const q=(h-.08)/.54;r=Math.max(r,.10+.30*Math.pow(1-q,2.2))}
  if(Math.abs(h-.62)<=.026){const q=(h-.62)/.026;r=Math.max(r,.19*Math.sqrt(Math.max(0,1-q*q)))}
  if(h>=.6&&h<=.7)r=Math.max(r,.085);
  const dy=y-1.04;if(Math.abs(dy)<=.2)r=Math.max(r,Math.sqrt(.04-dy*dy));
  return r;
 }
 const F=(x,y,z)=>Math.sqrt(x*x+z*z)-R(y);
 const nrm=(x,y,z)=>{const l=Math.hypot(x,y,z)||1;return [x/l,y/l,z/l]};
 const lin=c=>Math.pow(c/255,2.2),enc=v=>Math.round(255*Math.pow(Math.max(0,Math.min(1,v)),1/2.2));
 const hex=h=>[1,3,5].map(i=>lin(parseInt(h.slice(i,i+2),16)));
 const V=[0,ST,CT],L1=nrm(-.55,.9,.6),L2=nrm(.85,.25,.35),H1=nrm(L1[0]+V[0],L1[1]+V[1],L1[2]+V[2]);
 function render(color,W){
  W=W||128;const H=Math.round(W*(SY1-SY0)/(SX1-SX0)),sc=W/(SX1-SX0);
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d');
  // meka kontaktna sjena na podu (svjetlo gore-lijevo → sjena dolje-desno)
  ctx.save();ctx.translate((.07-SX0)*sc,(SY1+.035)*sc);ctx.scale(1,ST*1.15);
  const g=ctx.createRadialGradient(0,0,0,0,0,.5*sc);g.addColorStop(0,'rgba(0,0,0,.75)');g.addColorStop(.55,'rgba(0,0,0,.4)');g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,.5*sc,0,Math.PI*2);ctx.fill();ctx.restore();
  const img=ctx.getImageData(0,0,W,H),D=img.data,base=hex(color),e=.0025,step=.006;
  for(let py=0;py<H;py++){const sy=SY1-(py+.5)/sc;
   for(let px=0;px<W;px++){const sx=SX0+(px+.5)/sc;if(Math.abs(sx)>.445)continue;
    // zraka: O + t*d, d=(0,-ST,-CT)
    const ox=sx,oy=sy*CT+3*ST,oz=-sy*ST+3*CT;
    let t0=(oy-HT)/ST,t1=oy/ST;const zc=Math.sqrt(.445*.445-sx*sx);t0=Math.max(t0,(oz-zc)/CT);t1=Math.min(t1,(oz+zc)/CT);if(t0>=t1)continue;
    let hit=-1,pt=t0;
    for(let t=t0;t<=t1;t+=step){if(F(ox,oy-t*ST,oz-t*CT)<0){let a=pt,b=t;for(let k=0;k<9;k++){const m=(a+b)/2;if(F(ox,oy-m*ST,oz-m*CT)<0)b=m;else a=m}hit=b;break}pt=t}
    if(hit<0)continue;
    const x=ox,y=oy-hit*ST,z=oz-hit*CT;
    const n=nrm(F(x+e,y,z)-F(x-e,y,z),F(x,y+e,z)-F(x,y-e,z),F(x,y,z+e)-F(x,y,z-e));
    const nl=n[0]*L1[0]+n[1]*L1[1]+n[2]*L1[2],nv=Math.max(0,n[0]*V[0]+n[1]*V[1]+n[2]*V[2]),nh=Math.max(0,n[0]*H1[0]+n[1]*H1[1]+n[2]*H1[2]);
    const dif=Math.max(0,nl),wrap=Math.max(0,(nl+.35)/1.35)*.25,fill=Math.max(0,n[0]*L2[0]+n[1]*L2[1]+n[2]*L2[2])*.22;
    const amb=.13+.1*(n[1]*.5+.5),ao=1-.55*Math.exp(-y*10)-.18*Math.exp(-Math.pow((y-.8)/.06,2));
    const spec=Math.pow(nh,90)*1.15+Math.pow(nh,14)*.1,fres=Math.pow(1-nv,4),env=n[1]>0?.5:.04;
    const k=(amb+dif*.95+wrap+fill)*ao,i=(py*W+px)*4;
    for(let c=0;c<3;c++){let v=base[c]*k+spec+fres*env*(.3+base[c]*.5);v=v/(1+v*.12);D[i+c]=enc(v)}D[i+3]=255;
   }}
  ctx.putImageData(img,0,0);
  return cv.toDataURL('image/png');
 }
 // sidro: tačka na podu ispod figure (procenat visine slike)
 const ANCHOR=(SY1-0)/(SY1-SY0),WIDTH=(SX1-SX0)/.86,ASPECT=(SY1-SY0)/(SX1-SX0);
 return {render,ANCHOR,WIDTH,ASPECT};
})();
