// #Bash igre – vlastito povezivanje (zamjena za PeerJS)
// Poruke idu preko 3 javna MQTT servera ISTOVREMENO (EMQX, HiveMQ, Mosquitto) preko sigurnog WSS-a.
// Ako jedan server zakaže, ostali rade. Duplikati se odbacuju. API je isti kao PeerJS (Peer, connect, on('data'...)).
'use strict';
const NET={brokers:(window.BASH_BROKERS?window.BASH_BROKERS.map((u,i)=>({n:'B'+i,u})):[
 {n:'EMQX',u:'wss://broker.emqx.io:8084/mqtt'},{n:'HiveMQ',u:'wss://broker.hivemq.com:8884/mqtt'},{n:'Mosquitto',u:'wss://test.mosquitto.org:8081/mqtt'},
 {n:'Eclipse',u:'wss://mqtt.eclipseprojects.io:443/mqtt'},{n:'Shiftr',u:'wss://public.cloud.shiftr.io:443',user:'public',pass:'public'}]),prefix:'bashigre/v2/'};
const _te=new TextEncoder(),_td=new TextDecoder();
function _cat(...a){let n=0;a.forEach(x=>n+=x.length);const o=new Uint8Array(n);let p=0;a.forEach(x=>{o.set(x,p);p+=x.length});return o}
function _str(s){const b=_te.encode(s);return _cat(Uint8Array.of(b.length>>8,b.length&255),b)}
function _pkt(h,body){const l=[];let x=body.length;do{let d=x%128;x=Math.floor(x/128);if(x>0)d|=128;l.push(d)}while(x>0);return _cat(Uint8Array.of(h,...l),body)}
const _uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-5);

class MqttLink{
 constructor(b,bus){this.b=b;this.url=b.u;this.name=b.n;this.bus=bus;this.subs=new Set();this.ok=false;this.buf=new Uint8Array(0);this.tries=0;this.pid=0;this.connect()}
 connect(){let ws;try{ws=new WebSocket(this.url,['mqtt'])}catch(e){this.retry();return}
  ws.binaryType='arraybuffer';this.ws=ws;this.buf=new Uint8Array(0);
  const to=setTimeout(()=>{if(this.ws===ws&&!this.ok)try{ws.close()}catch(e){}},9000);
  ws.onopen=()=>{const b=this.b,fl=2|(b.user?0x80:0)|(b.pass?0x40:0);ws.send(_pkt(0x10,_cat(_str('MQTT'),Uint8Array.of(4,fl,0,40),_str('bi'+_uid()),b.user?_str(b.user):new Uint8Array(0),b.pass?_str(b.pass):new Uint8Array(0))))};
  ws.onmessage=e=>{if(this.ws===ws)this.data(new Uint8Array(e.data))};
  const down=()=>{clearTimeout(to);if(this.ws!==ws)return;this.ws=null;const was=this.ok;this.ok=false;clearInterval(this.pi);if(was)this.bus.state();this.retry()};
  ws.onclose=down;ws.onerror=down;
 }
 retry(){clearTimeout(this.rt);this.tries++;this.rt=setTimeout(()=>this.connect(),Math.min(15000,600*Math.pow(2,Math.min(this.tries,5))))}
 data(chunk){let b=_cat(this.buf,chunk);
  for(;;){if(b.length<2)break;let mul=1,len=0,i=1,c,ok=true;do{if(i>=b.length){ok=false;break}c=b[i++];len+=(c&127)*mul;mul*=128}while(c&128);
   if(!ok||b.length<i+len)break;const t=b[0]>>4,f=b[0]&15,body=b.subarray(i,i+len);b=b.slice(i+len);this.handle(t,f,body)}
  this.buf=b}
 handle(t,f,body){
  if(t===2){if(body[1]===0){this.ok=true;this.tries=0;this.subs.forEach(s=>this._sub(s));clearInterval(this.pi);
    this.pi=setInterval(()=>{try{this.ws&&this.ws.send(Uint8Array.of(0xC0,0))}catch(e){}},20000);this.bus.state()}else try{this.ws.close()}catch(e){}}
  else if(t===3){const tl=(body[0]<<8)|body[1],topic=_td.decode(body.subarray(2,2+tl));let p=2+tl;if((f>>1)&3)p+=2;this.bus.recv(topic,_td.decode(body.subarray(p)))}
 }
 _sub(t){if(!this.ws)return;this.pid=this.pid%60000+1;try{this.ws.send(_pkt(0x82,_cat(Uint8Array.of(this.pid>>8,this.pid&255),_str(t),Uint8Array.of(0))))}catch(e){}}
 sub(t){this.subs.add(t);if(this.ok)this._sub(t)}
 unsub(t){this.subs.delete(t);if(!this.ok||!this.ws)return;this.pid=this.pid%60000+1;try{this.ws.send(_pkt(0xA2,_cat(Uint8Array.of(this.pid>>8,this.pid&255),_str(t))))}catch(e){}}
 pub(t,s){if(!this.ok||!this.ws)return false;try{this.ws.send(_pkt(0x30,_cat(_str(t),_te.encode(s))));return true}catch(e){return false}}
}
const BUS={links:null,h:new Map(),seen:new Map(),wait:[],
 init(){if(this.links)return;this.links=NET.brokers.map(b=>new MqttLink(b,this));setInterval(()=>{const now=Date.now();for(const [k,t] of this.seen)if(now-t>60000)this.seen.delete(k)},20000)},
 ready(){return !!this.links&&this.links.some(l=>l.ok)},
 state(){if(this.ready()){const w=this.wait;this.wait=[];w.forEach(f=>f())}if(typeof window.onNetState==='function')window.onNetState(this.links.filter(l=>l.ok).length,this.links.length)},
 info(){return this.links?this.links.map(l=>({n:l.name,ok:l.ok})):[]},
 whenReady(cb){if(this.ready())cb();else this.wait.push(cb)},
 sub(t,fn){if(!this.h.has(t)){this.h.set(t,new Set());this.links.forEach(l=>l.sub(t))}this.h.get(t).add(fn)},
 unsub(t,fn){const s=this.h.get(t);if(!s)return;s.delete(fn);if(!s.size){this.h.delete(t);this.links.forEach(l=>l.unsub(t))}},
 pub(t,o){o.m=_uid();const s=JSON.stringify(o);let n=0;this.links.forEach(l=>{if(l.pub(t,s))n++});return n},
 recv(t,s){let o;try{o=JSON.parse(s)}catch(e){return}if(!o||!o.m)return;const k=t+'|'+o.m;if(this.seen.has(k))return;this.seen.set(k,Date.now());
  const hs=this.h.get(t);if(hs)hs.forEach(fn=>{try{fn(o)}catch(e){console.error(e)}})}
};
const _topic=id=>NET.prefix+'p/'+id;
class DConn{
 constructor(peer,cid,rid){this.p=peer;this.cid=cid;this.peer=rid;this.open=false;this.h={};this.seq=0;this.next=1;this.ob=new Map();this.last=Date.now();this.sent=0}
 on(e,f){(this.h[e]=this.h[e]||[]).push(f)}
 emit(e,...a){(this.h[e]||[]).forEach(f=>{try{f(...a)}catch(err){console.error(err)}})}
 _raw(o){o.cid=this.cid;o.i=this.p.inst;this.sent=Date.now();BUS.pub(_topic(this.peer),o)}
 send(d){if(this.dead)return;if(!this.open){(this.q=this.q||[]).push(d);return}this._raw({k:'d',s:++this.seq,d})}
 _in(o){this.last=Date.now();if(o.k!=='d')return;
  if(o.s<this.next)return;if(o.s>this.next){this.ob.set(o.s,o.d);if(!this.gt)this.gt=setTimeout(()=>this._skip(),900);return}
  this.next++;this.emit('data',o.d);this._flush()}
 _flush(){while(this.ob.has(this.next)){const d=this.ob.get(this.next);this.ob.delete(this.next);this.next++;this.emit('data',d)}if(!this.ob.size){clearTimeout(this.gt);this.gt=0}}
 _skip(){this.gt=0;if(!this.ob.size)return;this.next=Math.min(...this.ob.keys());this._flush()}
 _open(){if(this.opened)return;this.opened=true;this.open=true;this.last=Date.now();const q=this.q||[];this.q=null;q.forEach(d=>this.send(d));this.emit('open')}
 _close(){if(this.dead)return;this.dead=true;const was=this.open;this.open=false;this.p.conns.delete(this.cid);clearTimeout(this.gt);if(was||this.p.conns)this.emit('close')}
 close(){if(this.dead)return;try{this._raw({k:'fin'})}catch(e){}this._close()}
}
const _peers=new Set();function PEERS(){return [..._peers].filter(p=>!p.destroyed)}
class Peer{
 constructor(id,opts){_peers.add(this);if(typeof id!=='string'){id=null}this.claim=!!id;this.id=id||('p'+_uid());this.inst=_uid();this.h={};this.open=false;this.destroyed=false;this.disconnected=false;
  this.conns=new Map();this.fn=o=>this._msg(o);BUS.init();
  this.nt=setTimeout(()=>{if(!this.open&&!this.destroyed)this.emit('error',{type:'network'})},15000);
  BUS.whenReady(()=>this._start())}
 on(e,f){(this.h[e]=this.h[e]||[]).push(f)}
 emit(e,...a){(this.h[e]||[]).forEach(f=>{try{f(...a)}catch(err){console.error(err)}})}
 _start(){if(this.destroyed)return;BUS.sub(_topic(this.id),this.fn);
  if(!this.claim){setTimeout(()=>this._ok(),400);return}
  this.probe=_uid();this.taken=false;this.probing=true;
  const ask=()=>BUS.pub(_topic(this.id),{k:'probe',pid:this.probe,i:this.inst});ask();setTimeout(ask,600);
  setTimeout(()=>{this.probing=false;if(this.destroyed)return;if(this.taken){BUS.unsub(_topic(this.id),this.fn);this.emit('error',{type:'unavailable-id'})}else this._ok()},1600)}
 _ok(){if(this.destroyed||this.open)return;clearTimeout(this.nt);this.open=true;this.emit('open',this.id);
  if(this.claim)this.bt=setInterval(()=>BUS.pub(_topic(this.id),{k:'beacon',i:this.inst}),10000)}
 _msg(o){if(this.destroyed||o.i===this.inst)return;
  switch(o.k){
   case 'probe':if(this.open)BUS.pub(_topic(this.id),{k:'taken',pid:o.pid,i:this.inst});else if(this.probing&&o.i<this.inst)this.taken=true;break;
   case 'taken':if(o.pid===this.probe)this.taken=true;break;
   case 'beacon':if(this.open&&this.claim&&o.i<this.inst){this.destroy();this.emit('error',{type:'unavailable-id'})}break;
   case 'syn':{if(!this.open||!o.from)return;let c=this.conns.get(o.cid);
    if(!c){c=new DConn(this,o.cid,o.from);this.conns.set(o.cid,c);c.open=true;this.emit('connection',c);setTimeout(()=>{c.open=false;c._open()},0)}
    c._raw({k:'ack'});break}
   case 'ack':{const c=this.conns.get(o.cid);if(c){c.last=Date.now();c._open()}break}
   case 'fin':{const c=this.conns.get(o.cid);if(c)c._close();break}
   default:{const c=this.conns.get(o.cid);if(c)c._in(o)}
  }}
 connect(rid){const cid=_uid(),c=new DConn(this,cid,rid);this.conns.set(cid,c);let n=0;
  const syn=()=>{if(c.open||c.dead||this.destroyed)return;if(n++>=5){this.conns.delete(cid);this.emit('error',{type:'peer-unavailable'});return}
   BUS.pub(_topic(rid),{k:'syn',from:this.id,cid,i:this.inst});setTimeout(syn,1300)};
  BUS.whenReady(syn);return c}
 destroy(){if(this.destroyed)return;this.destroyed=true;_peers.delete(this);this.open=false;clearInterval(this.bt);clearTimeout(this.nt);
  [...this.conns.values()].forEach(c=>c.close());if(BUS.links)BUS.unsub(_topic(this.id),this.fn)}
 reconnect(){}
}
// održavanje veza: heartbeat + otkrivanje prekinutih
setInterval(()=>{const now=Date.now();
 for(const p of PEERS())for(const c of [...p.conns.values()]){if(!c.open)continue;if(now-c.sent>4000)c._raw({k:'hb'});if(now-c.last>17000)c._close()}},2000);
