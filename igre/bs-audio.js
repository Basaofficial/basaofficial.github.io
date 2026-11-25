// BASH-STRIKE – sintetizirani zvukovi (WebAudio), pozicijski
'use strict';
(function(G){
const A={ctx:null,master:null,vol:.7,nb:null,lis:{x:0,y:0,z:0,yaw:0},last:{},
 init(){if(this.ctx)return this.ctx;try{const C=window.AudioContext||window.webkitAudioContext;this.ctx=new C();this.master=this.ctx.createGain();this.master.gain.value=this.vol;
  const comp=this.ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;this.master.connect(comp);comp.connect(this.ctx.destination);
  const n=this.ctx.sampleRate*2,b=this.ctx.createBuffer(1,n,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;this.nb=b}catch(e){this.ctx=null}return this.ctx},
 resume(){const c=this.init();if(c&&c.state==='suspended')c.resume().catch(()=>{})},
 setVol(v){this.vol=v;if(this.master)this.master.gain.value=v},
 // pozicija → [gain,pan]
 pos(p){if(!p)return [1,0];const L=this.lis;const dx=p[0]-L.x,dy=(p[1]||0)-L.y,dz=p[2]-L.z;const d=Math.hypot(dx,dy,dz);
  const g=1/(1+Math.max(0,d-1.5)/7);const rx=Math.cos(L.yaw)*dx-Math.sin(L.yaw)*dz;const pan=d>.5?Math.max(-1,Math.min(1,rx/d)):0;return [g,pan*.85]},
 out(p,vol){const c=this.ctx;const [g,pan]=this.pos(p);if(g*vol<.004)return null;const gn=c.createGain();gn.gain.value=g*vol;let node=gn;
  if(c.createStereoPanner){const sp=c.createStereoPanner();sp.pan.value=pan;gn.connect(sp);sp.connect(this.master)}else gn.connect(this.master);return gn},
 noise(dst,t,dur,f,q,type,a,dec){const c=this.ctx;const s=c.createBufferSource();s.buffer=this.nb;s.loopStart=Math.random();const bf=c.createBiquadFilter();bf.type=type||'lowpass';bf.frequency.value=f;bf.Q.value=q||.7;
  const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(a,t+.004);g.gain.exponentialRampToValueAtTime(.0008,t+dur*(dec||1));s.connect(bf);bf.connect(g);g.connect(dst);s.start(t,Math.random()*1.5);s.stop(t+dur+.05);return bf},
 tone(dst,t,dur,f,f2,a,type){const c=this.ctx;const o=c.createOscillator();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(a,t+.005);g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(g);g.connect(dst);o.start(t);o.stop(t+dur+.05)},
 ok(){return this.ctx&&this.ctx.state==='running'},
 // ---------- zvukovi ----------
 shot(w,p,own,delay){if(!this.ok())return;const wd=G.BS_DATA.W[w]||{};const c=this.ctx,t=c.currentTime+(delay||0);const sil=wd.sil;const cat=wd.cat;
  const dist=p?Math.hypot(p[0]-this.lis.x,p[2]-this.lis.z):0;const far=dist>30;
  const dst=this.out(own?null:p,(sil?.35:1)*(own?.75:1));if(!dst)return;
  if(sil){this.noise(dst,t,.12,2600,1.2,'bandpass',.7);this.tone(dst,t,.06,500,120,.25,'triangle');return}
  const big=cat==='sniper'?1.6:cat==='heavy'?1.4:cat==='rifle'||!cat?1:cat==='pistol'?(w==='deagle'?1.3:.75):cat==='smg'?.8:.9;
  this.noise(dst,t,.08*big+.04,far?1200:5200,.8,'lowpass',.9);this.noise(dst,t+.004,(.25+.2*big)*(far?1.6:1),far?500:1400,.6,'lowpass',.6*big,1);
  this.tone(dst,t,.12*big,140*(2-big*.4),40,.7*Math.min(1.2,big),'sine');if(cat==='zeus'){this.noise(dst,t,.4,6000,4,'bandpass',.5);this.tone(dst,t,.3,900,1800,.2,'sawtooth')}},
 dry(){if(!this.ok())return;const d=this.out(null,.4);if(d)this.tone(d,this.ctx.currentTime,.03,1800,900,.3,'square')},
 reload(stage){if(!this.ok())return;const d=this.out(null,.35);if(!d)return;const t=this.ctx.currentTime;this.noise(d,t,.06,stage?2500:1500,2,'bandpass',.8);this.tone(d,t+.01,.04,stage?900:600,null,.25,'square')},
 step(p,own,soft){if(!this.ok())return;const d=this.out(own?null:p,own?.18:.5*(soft?.3:1));if(!d)return;this.noise(d,this.ctx.currentTime,.07,own?700:900,1.2,'lowpass',.9)},
 land(p,own){if(!this.ok())return;const d=this.out(own?null:p,own?.3:.5);if(d)this.noise(d,this.ctx.currentTime,.12,400,1,'lowpass',1)},
 knife(p,hit){if(!this.ok())return;const d=this.out(p,.5);if(!d)return;const t=this.ctx.currentTime;this.noise(d,t,.18,hit?900:3000,1.5,'bandpass',.6);if(hit)this.noise(d,t+.03,.1,500,1,'lowpass',.8)},
 hit(head){if(!this.ok())return;const d=this.out(null,.5);if(!d)return;const t=this.ctx.currentTime;if(head){this.tone(d,t,.18,2400,2200,.35,'sine');this.tone(d,t,.12,3600,null,.15,'sine')}else this.noise(d,t,.06,1200,1,'lowpass',.6)},
 hurt(){if(!this.ok())return;const d=this.out(null,.5);if(d){const t=this.ctx.currentTime;this.noise(d,t,.12,700,1,'lowpass',.9);this.tone(d,t,.1,180,90,.3)}},
 boom(p,big){if(!this.ok())return;const d=this.out(p,big?1.6:1.2);if(!d)return;const t=this.ctx.currentTime;this.noise(d,t,big?2.2:1.2,big?600:900,.5,'lowpass',1);this.tone(d,t,big?1.4:.7,90,25,1,'sine');this.noise(d,t,.25,4000,.5,'lowpass',.6)},
 flashBang(p){if(!this.ok())return;const d=this.out(p,1.1);if(!d)return;const t=this.ctx.currentTime;this.noise(d,t,.5,3000,.5,'lowpass',1);this.tone(d,t,.2,200,60,.6)},
 ring(dur){if(!this.ok()||dur<.8)return;const d=this.out(null,Math.min(.25,dur*.06));if(d)this.tone(d,this.ctx.currentTime,dur,3400,3000,1,'sine')},
 smoke(p){if(!this.ok())return;const d=this.out(p,.6);if(d)this.noise(d,this.ctx.currentTime,2.5,1600,.4,'bandpass',.5,1)},
 fire(p){if(!this.ok())return;const d=this.out(p,.7);if(!d)return;const t=this.ctx.currentTime;this.noise(d,t,.6,600,.5,'lowpass',1);this.noise(d,t+.05,1.4,2000,.4,'bandpass',.35)},
 fireLoop(p){if(!this.ok())return;const d=this.out(p,.22);if(d)this.noise(d,this.ctx.currentTime,.5,1400,.3,'bandpass',.5)},
 bounce(p){if(!this.ok())return;const d=this.out(p,.4);if(d)this.tone(d,this.ctx.currentTime,.06,1100,700,.4,'triangle')},
 throw_(p,own){if(!this.ok())return;const d=this.out(own?null:p,.35);if(d)this.noise(d,this.ctx.currentTime,.18,1800,.8,'bandpass',.6)},
 beep(p,hi){if(!this.ok())return;const d=this.out(p,.55);if(d)this.tone(d,this.ctx.currentTime,.09,hi?1850:1550,null,.5,'square')},
 plantBeep(){if(!this.ok())return;const d=this.out(null,.3);if(d)this.tone(d,this.ctx.currentTime,.05,1200,null,.4,'square')},
 defuse(p){if(!this.ok())return;const d=this.out(p,.4);if(d)this.noise(d,this.ctx.currentTime,.2,3000,3,'bandpass',.5)},
 buy(){if(!this.ok())return;const d=this.out(null,.35);if(d){const t=this.ctx.currentTime;this.tone(d,t,.06,900,null,.3,'triangle');this.tone(d,t+.05,.08,1300,null,.25,'triangle')}},
 deny(){if(!this.ok())return;const d=this.out(null,.35);if(d)this.tone(d,this.ctx.currentTime,.15,220,180,.3,'square')},
 click(){if(!this.ok())return;const d=this.out(null,.25);if(d)this.tone(d,this.ctx.currentTime,.03,1400,null,.3,'triangle')},
 tick(){if(!this.ok())return;const d=this.out(null,.22);if(d)this.tone(d,this.ctx.currentTime,.025,2600,1800,.35,'square')},
 roundStart(){if(!this.ok())return;const d=this.out(null,.45);if(!d)return;const t=this.ctx.currentTime;[523,659,784].forEach((f,i)=>this.tone(d,t+i*.09,.18,f,null,.35,'triangle'))},
 win(good){if(!this.ok())return;const d=this.out(null,.5);if(!d)return;const t=this.ctx.currentTime;(good?[523,659,784,1046]:[440,392,330,262]).forEach((f,i)=>this.tone(d,t+i*.13,.35,f,null,.35,'triangle'))},
 drop(rar){if(!this.ok())return;const d=this.out(null,.6);if(!d)return;const t=this.ctx.currentTime;const base=[523,587,659,784,988][rar||0];[0,4,7,12].forEach((s,i)=>this.tone(d,t+i*.1,.5,base*Math.pow(2,s/12),null,.3,'sine'))},
 radio(){if(!this.ok())return;const d=this.out(null,.18);if(d){const t=this.ctx.currentTime;this.noise(d,t,.08,2500,3,'bandpass',.5);this.tone(d,t+.02,.05,1000,null,.15,'square')}}
};
G.BS_AUDIO=A;
})(typeof window!=='undefined'?window:globalThis);
