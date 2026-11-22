/* bashlab mini MQTT 3.1.1 klijent preko WebSocketa – zamjena za mqtt.js (bez CDN-a).
   API: mqtt.connect(url,{clientId,keepalive,reconnectPeriod,connectTimeout,will}) →
   .on('connect'|'message'|'close'|'offline'|'error'), .subscribe(t|[t]), .publish(t,str|Uint8Array,{qos,retain}), .reconnect(), .end(), .connected */
(function(){
if(window.mqtt)return;
const te=new TextEncoder(),td=new TextDecoder();
const cat=(...a)=>{let n=0;a.forEach(x=>n+=x.length);const o=new Uint8Array(n);let p=0;a.forEach(x=>{o.set(x,p);p+=x.length;});return o;};
const bytes=m=>m instanceof Uint8Array?m:(m instanceof ArrayBuffer?new Uint8Array(m):te.encode(String(m)));
const lstr=b=>cat(Uint8Array.of(b.length>>8,b.length&255),b);
const str=s=>lstr(te.encode(s));
const pkt=(h,body)=>{const l=[];let x=body.length;do{let d=x%128;x=Math.floor(x/128);if(x>0)d|=128;l.push(d);}while(x>0);return cat(Uint8Array.of(h,...l),body);};
class Client{
  constructor(url,o){this.url=url;this.o=o||{};this.h={};this.subs=new Set();this.q=[];this.connected=false;this.pid=0;this.buf=new Uint8Array(0);this.tries=0;this.ended=false;this._open();}
  on(e,f){(this.h[e]=this.h[e]||[]).push(f);return this;}
  _emit(e,...a){(this.h[e]||[]).forEach(f=>{try{f(...a);}catch(x){}});}
  _open(){if(this.ended)return;let ws;try{ws=new WebSocket(this.url,['mqtt']);}catch(e){this._retry();return;}
    ws.binaryType='arraybuffer';this.ws=ws;this.buf=new Uint8Array(0);
    const to=setTimeout(()=>{if(this.ws===ws&&!this.connected)try{ws.close();}catch(e){}},this.o.connectTimeout||8000);
    ws.onopen=()=>{const o=this.o,w=o.will,ka=o.keepalive||30;let fl=2,wp=new Uint8Array(0);
      if(w&&w.topic){fl|=4|((w.qos?1:0)<<3)|(w.retain?0x20:0);wp=cat(str(w.topic),lstr(bytes(w.payload||'')));}
      ws.send(pkt(0x10,cat(str('MQTT'),Uint8Array.of(4,fl,ka>>8,ka&255),str(o.clientId||('c'+Math.random().toString(36).slice(2,10))),wp)));};
    ws.onmessage=e=>{if(this.ws===ws)this._data(new Uint8Array(e.data));};
    const down=()=>{clearTimeout(to);if(this.ws!==ws)return;this.ws=null;const was=this.connected;this.connected=false;clearInterval(this.pi);this._emit('close');if(was)this._emit('offline');this._retry();};
    ws.onclose=down;ws.onerror=()=>{this._emit('error',new Error('ws'));down();};}
  _retry(){if(this.ended)return;clearTimeout(this.rt);this.tries++;this.rt=setTimeout(()=>this._open(),Math.min(30000,(this.o.reconnectPeriod||5000)*Math.min(this.tries,4)));}
  reconnect(){if(this.ended||this.connected)return;clearTimeout(this.rt);const w=this.ws;this.ws=null;try{w&&w.close();}catch(e){}this._open();}
  _data(chunk){let b=cat(this.buf,chunk);
    for(;;){if(b.length<2)break;let mul=1,len=0,i=1,c,ok=true;do{if(i>=b.length){ok=false;break;}c=b[i++];len+=(c&127)*mul;mul*=128;}while(c&128);
      if(!ok||b.length<i+len)break;const t=b[0]>>4,f=b[0]&15,body=b.subarray(i,i+len);b=b.slice(i+len);this._handle(t,f,body);}
    this.buf=b;}
  _handle(t,f,body){
    if(t===2){if(body[1]===0){this.connected=true;this.tries=0;clearInterval(this.pi);const ka=this.o.keepalive||30;this.pi=setInterval(()=>{try{this.ws&&this.ws.send(Uint8Array.of(0xC0,0));}catch(e){}},ka*800);
        if(this.subs.size)this._sub([...this.subs]);this._emit('connect');const q=this.q.splice(0);q.forEach(a=>this.publish(...a));}
      else try{this.ws.close();}catch(e){}}
    else if(t===3){const tl=(body[0]<<8)|body[1],topic=td.decode(body.subarray(2,2+tl));let p=2+tl;const qos=(f>>1)&3;
      if(qos){const id=(body[p]<<8)|body[p+1];p+=2;try{this.ws.send(Uint8Array.of(0x40,2,id>>8,id&255));}catch(e){}}
      const u=body.slice(p);u.toString=()=>td.decode(u);this._emit('message',topic,u);}
  }
  _id(){this.pid=this.pid%60000+1;return Uint8Array.of(this.pid>>8,this.pid&255);}
  _sub(list){if(!this.ws||!this.connected)return;try{this.ws.send(pkt(0x82,cat(this._id(),...list.map(t=>cat(str(t),Uint8Array.of(0))))));}catch(e){}}
  subscribe(t){const list=Array.isArray(t)?t:[t];list.forEach(x=>this.subs.add(x));this._sub(list);return this;}
  unsubscribe(t){const list=Array.isArray(t)?t:[t];list.forEach(x=>this.subs.delete(x));if(this.ws&&this.connected)try{this.ws.send(pkt(0xA2,cat(this._id(),...list.map(x=>str(x)))));}catch(e){}return this;}
  publish(topic,msg,o){o=o||{};if(!this.connected||!this.ws){if(this.q.length<200)this.q.push([topic,msg,o]);return this;}
    const qos=o.qos?1:0,h=0x30|(qos<<1)|(o.retain?1:0);
    try{this.ws.send(pkt(h,cat(str(topic),qos?this._id():new Uint8Array(0),bytes(msg))));}catch(e){this.q.push([topic,msg,o]);}return this;}
  end(){this.ended=true;clearTimeout(this.rt);clearInterval(this.pi);this.connected=false;try{this.ws&&this.ws.send(Uint8Array.of(0xE0,0));this.ws&&this.ws.close();}catch(e){}return this;}
}
window.mqtt={__mini:true,connect:(url,o)=>new Client(url,o)};
})();
