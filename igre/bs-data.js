// BASH-STRIKE – podaci: oružja, oprema, skinovi, kutije, imena
'use strict';
(function(G){
const U=0.0254; // 1 CS jedinica u metrima
// slot: 1 primarno, 2 pištolj, 3 nož, 4 bombe, 5 C4
// rof = sekundi između metaka, spd = brzina kretanja (jedinice/s), rew = nagrada za kill
// inacc = [stoji, trči, u zraku, čuči] (radijani), rec = [vertikalno, horizontalno] po metku (stepeni)
const W={};
function w(id,o){o.id=id;W[id]=o;return o}
const P={slot:2,cat:'pistol',auto:false,pel:1,rm:.8,range:120,rew:300,spd:240,team:null,scope:null,sil:false,rel:2.2,draw:.6};
const R={slot:1,auto:true,pel:1,rm:.98,range:250,rew:300,team:null,scope:null,sil:false,rel:2.5,draw:1};
// --- pištolji
w('glock',Object.assign({},P,{n:'Glock-18',price:200,team:'T',dmg:30,ap:.47,rof:.15,mag:20,res:120,rm:.85,inacc:[.012,.035,.12,.009],rec:[1.6,.5],rel:2.2,model:'pistol'}));
w('usps',Object.assign({},P,{n:'USP-S',price:200,team:'CT',dmg:35,ap:.505,rof:.17,mag:12,res:24,rm:.91,inacc:[.009,.03,.12,.007],rec:[1.8,.4],sil:true,rel:2.2,model:'pistolS'}));
w('p2000',Object.assign({},P,{n:'P2000',price:200,team:'CT',dmg:35,ap:.505,rof:.17,mag:13,res:52,rm:.91,inacc:[.01,.032,.12,.008],rec:[1.8,.45],model:'pistol'}));
w('dualies',Object.assign({},P,{n:'Dual Berettas',price:300,dmg:38,ap:.575,rof:.12,mag:30,res:120,rm:.79,inacc:[.016,.04,.13,.013],rec:[1.9,.7],rel:3.8,model:'dual'}));
w('p250',Object.assign({},P,{n:'P250',price:300,dmg:38,ap:.64,rof:.15,mag:13,res:26,rm:.85,inacc:[.012,.036,.12,.01],rec:[2.2,.6],model:'pistol'}));
w('tec9',Object.assign({},P,{n:'Tec-9',price:500,team:'T',dmg:33,ap:.906,rof:.12,mag:18,res:90,rm:.83,inacc:[.015,.03,.12,.012],rec:[2,.7],rel:2.5,model:'tec'}));
w('fiveseven',Object.assign({},P,{n:'Five-SeveN',price:500,team:'CT',dmg:32,ap:.911,rof:.15,mag:20,res:100,rm:.81,inacc:[.012,.03,.12,.01],rec:[2,.6],model:'pistol'}));
w('deagle',Object.assign({},P,{n:'Desert Eagle',price:700,dmg:53,ap:.932,rof:.225,mag:7,res:35,rm:.81,spd:230,inacc:[.02,.07,.2,.016],rec:[5.5,1],rew:300,model:'deagle'}));
// --- sačmarice i srednja klasa
w('nova',Object.assign({},R,{n:'Nova',slot:1,cat:'heavy',auto:false,price:1050,dmg:26,pel:9,ap:.5,rof:.88,mag:8,res:32,rm:.7,range:40,spd:220,rew:900,inacc:[.06,.07,.15,.06],rec:[5,1],rel:.5,pump:true,model:'shotgun'}));
w('xm1014',Object.assign({},R,{n:'XM1014',cat:'heavy',auto:true,price:2000,dmg:20,pel:6,ap:.8,rof:.35,mag:7,res:32,rm:.7,range:40,spd:215,rew:900,inacc:[.07,.08,.15,.07],rec:[4,1.2],rel:.45,pump:true,model:'autoshotgun'}));
w('mag7',Object.assign({},R,{n:'MAG-7',cat:'heavy',auto:false,price:1300,team:'CT',dmg:30,pel:8,ap:.75,rof:.85,mag:5,res:32,rm:.45,range:30,spd:225,rew:900,inacc:[.05,.06,.15,.05],rec:[5,1],rel:2.4,model:'shotgun'}));
w('mac10',Object.assign({},R,{n:'MAC-10',cat:'smg',price:1050,team:'T',dmg:29,ap:.575,rof:.075,mag:30,res:100,rm:.8,range:120,spd:240,rew:600,inacc:[.016,.03,.1,.013],rec:[.9,.45],rel:2.6,model:'smgS'}));
w('mp9',Object.assign({},R,{n:'MP9',cat:'smg',price:1250,team:'CT',dmg:26,ap:.6,rof:.07,mag:30,res:120,rm:.87,range:120,spd:240,rew:600,inacc:[.014,.028,.1,.012],rec:[.85,.4],rel:2.1,model:'smgS'}));
w('mp5sd',Object.assign({},R,{n:'MP5-SD',cat:'smg',price:1500,dmg:27,ap:.625,rof:.075,mag:30,res:120,rm:.85,range:120,spd:235,rew:600,inacc:[.013,.026,.1,.011],rec:[.8,.35],sil:true,rel:2.6,model:'smg'}));
w('ump45',Object.assign({},R,{n:'UMP-45',cat:'smg',price:1200,dmg:35,ap:.65,rof:.09,mag:25,res:100,rm:.75,range:120,spd:230,rew:600,inacc:[.015,.03,.1,.012],rec:[1,.45],rel:3.2,model:'smg'}));
w('p90',Object.assign({},R,{n:'P90',cat:'smg',price:2350,dmg:26,ap:.69,rof:.07,mag:50,res:100,rm:.86,range:120,spd:230,rew:300,inacc:[.015,.028,.1,.013],rec:[.75,.35],rel:3.3,model:'p90'}));
// --- puške
w('galil',Object.assign({},R,{n:'Galil AR',price:1800,team:'T',dmg:30,ap:.775,rof:.09,mag:35,res:90,rm:.98,spd:215,inacc:[.006,.06,.15,.0045],rec:[1.05,.5],rel:2.9,model:'rifle'}));
w('famas',Object.assign({},R,{n:'FAMAS',price:1950,team:'CT',dmg:30,ap:.7,rof:.09,mag:25,res:90,rm:.96,spd:220,inacc:[.006,.06,.15,.0045],rec:[1,.45],rel:3.3,model:'bullpup'}));
w('ak47',Object.assign({},R,{n:'AK-47',price:2700,team:'T',dmg:36,ap:.775,rof:.1,mag:30,res:90,rm:.98,spd:215,inacc:[.0048,.07,.17,.0036],rec:[1.25,.55],rel:2.45,model:'ak'}));
w('m4a4',Object.assign({},R,{n:'M4A4',price:2900,team:'CT',dmg:33,ap:.7,rof:.09,mag:30,res:90,rm:.97,spd:225,inacc:[.0042,.06,.16,.0032],rec:[1.1,.45],rel:3.1,model:'m4'}));
w('m4a1s',Object.assign({},R,{n:'M4A1-S',price:2900,team:'CT',dmg:38,ap:.7,rof:.1,mag:20,res:80,rm:.99,spd:225,inacc:[.0038,.06,.16,.003],rec:[.95,.35],sil:true,rel:3.1,model:'m4s'}));
w('sg553',Object.assign({},R,{n:'SG 553',price:3000,team:'T',dmg:30,ap:1,rof:.09,mag:30,res:90,rm:.98,spd:210,inacc:[.0045,.07,.17,.0034],rec:[1.15,.5],scope:[45],rel:2.8,model:'sg'}));
w('aug',Object.assign({},R,{n:'AUG',price:3300,team:'CT',dmg:28,ap:.9,rof:.09,mag:30,res:90,rm:.98,spd:220,inacc:[.0042,.065,.16,.0032],rec:[1.05,.45],scope:[45],rel:3.8,model:'aug'}));
w('ssg08',Object.assign({},R,{n:'SSG 08',cat:'sniper',auto:false,price:1700,dmg:88,ap:.85,rof:1.25,mag:10,res:90,rm:.98,range:400,spd:230,inacc:[.05,.15,.06,.045],scopedInacc:.0012,rec:[3,.5],scope:[40,15],rel:3.7,model:'ssg'}));
w('awp',Object.assign({},R,{n:'AWP',cat:'sniper',auto:false,price:4750,dmg:115,ap:.975,rof:1.46,mag:5,res:30,rm:.99,range:400,spd:200,scopedSpd:100,rew:100,inacc:[.08,.25,.4,.07],scopedInacc:.0009,rec:[5,1],scope:[40,10],rel:3.7,model:'awp'}));
// --- ostalo
w('knife',{n:'Nož',slot:3,cat:'knife',price:0,dmg:40,dmg2:65,ap:.85,rof:.4,rof2:1,mag:0,res:0,spd:250,rew:1500,range:1.9,auto:true,model:'knife',draw:.4});
w('zeus',{n:'Zeus x27',slot:2,cat:'zeus',price:200,dmg:500,ap:1,rof:1,mag:1,res:0,spd:240,rew:0,range:4.2,auto:false,pel:1,rm:1,inacc:[.001,.001,.001,.001],rec:[0,0],model:'zeus',draw:.6,rel:0,extra:true});
w('c4',{n:'C4',slot:5,cat:'c4',price:0,mag:0,res:0,spd:250,model:'c4',draw:.4});
// bombe
const N={slot:4,cat:'nade',mag:0,res:0,spd:245,draw:.5};
w('flash',Object.assign({},N,{n:'Flashbang',price:200,max:2,model:'flash',fuse:1.6,col:'#cfd6dd'}));
w('smoke',Object.assign({},N,{n:'Smoke',price:300,max:1,model:'smoke',fuse:1.6,col:'#9aa7a0'}));
w('he',Object.assign({},N,{n:'HE Grenade',price:300,max:1,model:'he',fuse:1.6,col:'#4f6b39'}));
w('molotov',Object.assign({},N,{n:'Molotov',price:400,max:1,team:'T',model:'molotov',fuse:2,col:'#b56a2a'}));
w('incgrenade',Object.assign({},N,{n:'Incendiary',price:500,max:1,team:'CT',model:'incgrenade',fuse:2,col:'#a33'}));
w('decoy',Object.assign({},N,{n:'Decoy',price:50,max:1,model:'decoy',fuse:2,col:'#7a7a50'}));
const EQUIP={vest:{n:'Kevlar',price:650},vesthelm:{n:'Kevlar + Kaciga',price:1000},defuser:{n:'Defuse kit',price:400,team:'CT'}};
// buy menu kolone (CS2 raspored)
const BUY=[
 {n:'Oprema',items:['vest','vesthelm','zeus','defuser']},
 {n:'Pištolji',items:['glock','usps','p2000','dualies','p250','tec9','fiveseven','deagle']},
 {n:'Srednja klasa',items:['nova','xm1014','mag7','mac10','mp9','mp5sd','ump45','p90']},
 {n:'Puške',items:['galil','famas','ak47','m4a4','m4a1s','ssg08','sg553','aug','awp']},
 {n:'Bombe',items:['flash','smoke','he','molotov','incgrenade','decoy']}];
const RULES={startMoney:800,maxMoney:16000,otMoney:10000,winElim:3250,winBomb:3500,winDefuse:3500,winTime:3250,lossBase:1400,lossStep:500,lossMax:3400,plantLoss:800,plantRew:300,defuseRew:300,
 halfRounds:12,winRounds:13,otHalf:3,warmup:60,freeze:15,buyTime:20,roundTime:115,bombTime:40,plantTime:3.2,defuseTime:10,defuseKit:5,endDelay:6,maxNades:4};
// formati meča: 1v1, 2v2 (wingman) i 5v5 (MR12)
const FORMATS={1:{n:'1v1',size:1,winRounds:9,halfRounds:8,roundTime:75,freeze:8,buyTime:15,bombTime:35,warmup:30},
 2:{n:'2v2',size:2,winRounds:9,halfRounds:8,roundTime:90,freeze:10,buyTime:18,bombTime:40,warmup:40},
 5:{n:'5v5',size:5,winRounds:13,halfRounds:12,roundTime:115,freeze:15,buyTime:20,bombTime:40,warmup:60}};
const TEAMS={T:{n:'Teroristi',unit:'Pustinjski Škorpioni',short:'T',col:'#e2b04a'},CT:{n:'Anti-teroristička jedinica',unit:'Specijalna jedinica SOKO',short:'CT',col:'#5d9cec'}};
const AGENTS={T:[{n:'Kobra',c:['#6b5a3e','#3a3226','#2a2520'],mask:1},{n:'Šakal',c:['#7a3b2a','#3b2b22','#1f1a18'],mask:1},{n:'Gavran',c:['#2f2f33','#4a3b2e','#151515'],mask:1},{n:'Zmaj',c:['#5a6b3a','#3a3a2a','#202018'],mask:0},{n:'Pustinjak',c:['#9a7f55','#5a4a35','#2a2218'],mask:1}],
 CT:[{n:'Soko',c:['#2c3e5c','#1f2a3a','#111821'],helm:1},{n:'Orao',c:['#3d4a3a','#26301f','#121612'],helm:1},{n:'Ris',c:['#4a5560','#2b323a','#14181c'],helm:1},{n:'Medvjed',c:['#1d2b3f','#2a3340','#0d1117'],helm:1},{n:'Jastreb',c:['#5a5f66','#353a40','#191b1e'],helm:0}]};
const BOT_NAMES=['Hamo','Suljo','Mujo','Haso','Fata','Đuro','Pero','Zoki','Keno','Braco','Dino','Edo','Mirza','Kemo','Jasko','Ćiro','Bato','Lepi','Žika','Neno'];
const RADIO={he:'HE Grenade!',flash:'Flashbang!',smoke:'Smoke!',molotov:'Molotov!',incgrenade:'Incendiary!',decoy:'Decoy!',plant:'Postavljam bombu!',defuse:'Defusujem!',enemy:'Neprijatelj uočen!',cover:'Pokrijte me!',go:'Idemo, idemo!',hold:'Držim poziciju.',down:'Neprijatelj pao.',bomb:'Bomba je postavljena!',need:'Treba mi pomoć!',ok:'Razumijem.'};

// ================= SKINOVI =================
const RAR=[{n:'Obični',c:'#4b69ff'},{n:'Bolji',c:'#8847ff'},{n:'Rijetki',c:'#d32ce6'},{n:'Legendarni',c:'#eb4b4b'},{n:'★ Nož',c:'#e4ae39'}];
const WEAR=[{n:'Factory New',s:'FN',max:.07},{n:'Minimal Wear',s:'MW',max:.15},{n:'Field-Tested',s:'FT',max:.38},{n:'Well-Worn',s:'WW',max:.45},{n:'Battle-Scarred',s:'BS',max:1}];
function wearOf(f){for(const x of WEAR)if(f<x.max)return x;return WEAR[4]}
const KNIVES={karambit:'Karambit',leptir:'Leptir nož',bowie:'Bowie nož',bajonet:'Bajonet',lovacki:'Lovački nož'};
const SK={};
function s(id,wp,n,r,pat,c){SK[id]={id,w:wp,n,r,pat,c};return id}
// Kutija 1 – Pustinja
const C1=[s('d1','glock','Pješčana Oluja',0,'camo',['#c9a66b','#8c6a3f','#5a4428']),s('d2','mac10','Kamila',0,'stripes',['#b08a55','#6b4f2a']),s('d3','nova','Suha Rijeka',0,'wave',['#9c8a6c','#5f7c8a']),
 s('d4','p250','Oaza',0,'fade',['#3fae9a','#d8c48a']),s('d5','galil','Fatamorgana',1,'fade',['#f0b35a','#d9475b','#5b2b6b']),s('d6','famas','Škorpion',1,'tiger',['#d6a53c','#2a1d12']),
 s('d7','deagle','Zlatna Dina',2,'marble',['#e8c15a','#9a6a1a','#fff1b8']),s('d8','awp','Sahara Sunce',2,'flames',['#ff8a1e','#ffd34d','#7a1d06']),s('d9','ak47','Pustinjska Zmija',3,'hex',['#c79b4a','#3a2a12','#f4dc94'])];
// Kutija 2 – Neon
const C2=[s('n1','usps','Neon Linija',0,'stripes',['#141a2a','#18e0ff']),s('n2','mp9','Električna Plava',0,'digital',['#1c2c5a','#3f7bff','#0b1020']),s('n3','ump45','Sintetika',0,'carbon',['#222','#555']),
 s('n4','tec9','Kiselina',0,'dots',['#1a1a1a','#a3ff12']),s('n5','p90','Retrovalovi',1,'wave',['#ff2fa8','#2f1b5a','#20e3ff']),s('n6','m4a1s','Hladni Plamen',1,'flames',['#16e0ff','#0b3a66','#e0ffff']),
 s('n7','fiveseven','Laser',2,'stripes',['#ff1d58','#141414']),s('n8','ak47','Neonski Vuk',2,'digital',['#0f0f18','#ff2bd6','#24f0ff']),s('n9','awp','Kiber Zmaj',3,'hex',['#0a0a14','#18f0ff','#ff2bd6'])];
// Kutija 3 – Čaršija
const C3=[s('c1','p2000','Ćilim',0,'dots',['#8a2a2a','#e0c080']),s('c2','mp5sd','Bakar',0,'marble',['#b06a3a','#5a2f18','#e0a070']),s('c3','xm1014','Mozaik',0,'hex',['#1f5a7a','#e0d0a0','#a03a2a']),
 s('c4','dualies','Filigran',0,'wave',['#c0a060','#3a2a18']),s('c5','sg553','Sedef',1,'marble',['#e8e4f0','#a0b8d0','#c0a0d0']),s('c6','m4a4','Sultan',1,'tiger',['#1a3a6a','#d4af37']),
 s('c7','glock','Fenjer',2,'flames',['#ffb020','#5a1a08','#ffe080']),s('c8','aug','Tirkiz',2,'fade',['#14a3a3','#e0f0e8']),s('c9','m4a1s','Zlatni Ćilim',3,'dots',['#7a0f1a','#e8c15a'])];
// Kutija 4 – Zmaj
const C4=[s('z1','mag7','Pepeo',0,'carbon',['#2a2a2a','#7a7a7a']),s('z2','ssg08','Žar',0,'fade',['#3a0a0a','#ff5a1a']),s('z3','p250','Krljušt',0,'hex',['#1d4a2a','#6ad08a']),
 s('z4','mac10','Vatreni Dah',0,'flames',['#ff3a0a','#2a0a04']),s('z5','usps','Zmajev Rep',1,'tiger',['#0f6a3a','#081a10']),s('z6','deagle','Crveni Zmaj',1,'hex',['#8a0a0a','#ff4a2a','#1a0505']),
 s('z7','m4a4','Smaragd',2,'marble',['#0a8a5a','#073a2a','#9affd0']),s('z8','ak47','Vatreni Zmaj',2,'flames',['#ff6a00','#ffe14a','#3a0a00']),s('z9','awp','Zmajevo Oko',3,'fade',['#ff2a0a','#ffd84a','#2a0a6a'])];
// noževi (★) – dijele se po kutijama
const KN=[];const KPAT=[['Fade','fade',['#ff3ad0','#ffd84a','#3a7bff']],['Tigrov Zub','tiger',['#e8a020','#1a1208']],['Plavi Čelik','marble',['#2a4a8a','#8ab0e0','#c0d0ff']],['Pustinjski','camo',['#c9a66b','#8c6a3f','#5a4428']],['Crveni Dim','wave',['#8a0a14','#2a0508']],['Doppler','marble',['#1a0a3a','#ff3ad0','#3a7bff']]];
Object.keys(KNIVES).forEach((k,i)=>KPAT.forEach((p,j)=>{KN.push(s('k_'+k+'_'+j,'knife',p[0],4,p[1],p[2]));SK['k_'+k+'_'+j].knife=k}));
const CASES=[{id:1,n:'Pustinjska kutija',col:'#d9a54a',skins:C1,knives:KN.filter((_,i)=>i%6<3&&i<15)},
 {id:2,n:'Neon kutija',col:'#21d7ff',skins:C2,knives:KN.filter((_,i)=>i%6>=3)},
 {id:3,n:'Kutija Čaršija',col:'#c8423b',skins:C3,knives:KN.filter((_,i)=>i>=12)},
 {id:4,n:'Zmajeva kutija',col:'#3fcf6a',skins:C4,knives:KN.filter((_,i)=>i%2===0)}];
CASES.forEach(c=>{if(!c.knives.length)c.knives=KN.slice(0,6)});
// šanse: Obični 75%, Bolji 19%, Rijetki 5%, Legendarni 0.5%, Nož 0.5%
const ODDS=[.75,.19,.05,.005,.005];
function rollCase(caseId,rnd){rnd=rnd||Math.random;const c=CASES.find(x=>x.id===caseId);if(!c)return null;let r=rnd(),tier=0,acc=0;
 for(let i=0;i<ODDS.length;i++){acc+=ODDS[i];if(r<acc){tier=i;break}tier=i}
 let pool=tier===4?c.knives:c.skins.filter(id=>SK[id].r===tier);if(!pool.length)pool=c.skins.filter(id=>SK[id].r===0);
 const id=pool[Math.floor(rnd()*pool.length)];const wear=Math.pow(rnd(),1.4);return {sk:id,f:+wear.toFixed(4),st:rnd()<.08&&tier<4}}
// drop nakon meča: ključ je VRLO rijedak
const DROPS={keyWin:.03,caseWin:.18,caseLoss:.06};
function skinName(id){const k=SK[id];if(!k)return '';const wn=k.knife?'★ '+KNIVES[k.knife]:W[k.w].n;return wn+' | '+k.n}

G.BS_DATA={U,W,EQUIP,BUY,RULES,FORMATS,TEAMS,AGENTS,BOT_NAMES,RADIO,RAR,WEAR,wearOf,KNIVES,SK,CASES,ODDS,rollCase,DROPS,skinName};
})(typeof window!=='undefined'?window:globalThis);
