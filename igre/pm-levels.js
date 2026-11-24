// Pido i Mico – ručno dizajnirani nivoi (36 x 22 polja).
// Svaki nivo se gradi koordinatama: p(x,y,širina,tip) = vodoravni red, v(x,y,visina) = stub, itd.
// Tipovi polja: '#' kamen, 'L' lava, 'V' voda, 'A' kiselina, 'I' led, 'C' trošni blok, '^' ventilator.
(function(root){
'use strict';
const W=36,H=22;
function Bd(){
 this.g=[];for(let y=0;y<H;y++)this.g.push(Array(W).fill(' '));
 for(let x=0;x<W;x++){this.g[0][x]='#';this.g[H-1][x]='#'}for(let y=0;y<H;y++){this.g[y][0]='#';this.g[y][W-1]='#'}
 this.o=[];this.gems=[];this.boxes=[];this.fans=[];this.s={};this.d={};
}
Bd.prototype={
 at(x,y,c){if(x>=0&&y>=0&&x<W&&y<H)this.g[y][x]=c;return this},
 p(x,y,w,c){for(let i=0;i<w;i++)this.at(x+i,y,c||'#');return this},
 v(x,y,h,c){for(let i=0;i<h;i++)this.at(x,y+i,c||'#');return this},
 rect(x,y,w,h,c){for(let j=0;j<h;j++)this.p(x,y+j,w,c);return this},
 st(fx,wx,y){this.s.f=[fx,y];this.s.w=[wx,y];return this},
 stf(x,y){this.s.f=[x,y];return this},stw(x,y){this.s.w=[x,y];return this},
 door(mx,px,y,py){this.d.f=[mx,y];this.d.w=[px,py==null?y:py];return this},
 r(x,y){this.gems.push({x:x+.5,y:y+.5,t:'f'});return this},
 b(x,y){this.gems.push({x:x+.5,y:y+.5,t:'w'});return this},
 box(x,y){this.boxes.push([x,y]);return this},
 fan(x,y,w,range,g,dir){for(let i=0;i<w;i++){this.at(x+i,y,'^');this.fans.push([x+i,y,range,g||null,dir||0])}return this},
 lev(x,y,g){this.o.push(['lev',x,y,g]);return this},
 btn(x,y,g){this.o.push(['btn',x,y,g]);return this},
 mov(x,y,w,h,dx,dy,g,opt){this.o.push(['mov',x,y,w,h,dx,dy,g,opt||{}]);return this},
 auto(x,y,w,h,dx,dy,per){this.o.push(['auto',x,y,w,h,dx,dy,per]);return this},
 bar(x,y,h,el){this.o.push(['bar',x,y,h,el]);return this},
 // vrata koja se podižu u zatvoreni "džep" iznad sebe (zid lijevo i desno od džepa)
 gate(x,y,h,g){for(let i=1;i<=h;i++){this.at(x,y-i,' ');this.at(x-1,y-i,'#');this.at(x+1,y-i,'#')}this.at(x,y-h-1,'#');return this.mov(x,y,1,h,0,-h,g)},
};
const LV=[];
function lv(name,world,par,hint,fn){const b=new Bd();fn(b);
 LV.push({name,world,par,hint,grid:b.g.map(r=>r.join('')),gems:b.gems,st:b.s,doors:b.d,o:b.o,boxes:b.boxes,fans:b.fans})}

/* =================== SVIJET 1 · STARI HRAM =================== */
lv('Prvi koraci',0,30,'Mico (crveni) hoda po lavi, Pido (plavi) po vodi. Zelena kiselina ubija oba. Svako do svojih vrata!',b=>{
 b.p(6,21,3,'L').p(16,21,3,'V').p(30,18,4);
 b.p(1,15,9).p(10,15,2,'L').p(12,15,4).p(16,15,2,'V').p(18,15,11);
 b.p(1,12,6).p(9,9,5).p(1,6,7).p(16,6,19);
 b.st(2,3,20).door(30,33,5);
 b.r(3,5).b(6,5).r(7,19).b(17,19).r(10,13).b(16,13);
});
lv('Dva puta',0,35,'Svako ima svoj put. Lijevo je lava za Mica, desno voda za Pida.',b=>{
 b.p(11,18,3).p(22,18,3);
 b.p(1,15,2).p(3,15,4,'L').p(7,15,4).p(25,15,4).p(29,15,4,'V').p(33,15,2);
 b.p(10,12,4).p(22,12,4);
 b.p(1,9,6,'L').p(7,9,3).p(26,9,3).p(29,9,6,'V');
 b.p(4,6,5).p(27,6,5).p(13,5,10);
 b.st(17,18,20).door(16,19,4);
 b.r(6,5).b(29,5).r(3,13).b(32,13).r(12,16).b(23,16);
});
lv('Poluga',0,45,'Prođi preko poluge da je prebaciš. Poluga podiže kamena vrata.',b=>{
 b.p(5,21,3,'L').p(9,21,3,'V');
 b.v(18,1,12).gate(18,17,4,'a');
 b.p(14,18,3).p(8,15,5).p(13,12,5).p(1,9,10);
 b.p(31,18,4).p(25,15,4).p(29,12,4).p(22,9,5).p(28,6,7);
 b.lev(15,11,'a');
 b.st(2,3,20).door(30,33,5);
 b.r(3,8).b(6,8).b(24,8).r(30,11).r(26,14).b(33,17).r(6,19).b(10,19);
});
lv('Dugmad',0,45,'Dugme drži vrata otvorena samo dok neko stoji na njemu. Pomozite jedno drugom!',b=>{
 b.v(12,1,12).gate(12,17,4,'a');
 b.btn(9,20,'a').btn(14,20,'a');
 b.p(16,21,3,'A').p(2,18,4);
 b.p(23,18,3).p(28,15,4).p(22,12,5).p(29,9,6);
 b.st(4,6,20).door(30,33,8);
 b.r(3,17).b(4,17).b(17,19).r(24,11).b(29,14).r(32,13);
});
lv('Obojene barijere',0,60,'Narandžasta barijera propušta samo Mica, plava samo Pida. Svako otvara put drugom.',b=>{
 b.v(9,1,16).bar(9,17,4,'f').lev(3,20,'a');
 b.v(23,1,12).gate(23,17,4,'a');
 b.p(16,21,2,'A').p(13,18,2).p(19,18,2);
 b.p(31,16,4).bar(31,17,4,'w').lev(33,20,'b');
 b.p(25,18,3).p(28,15,3).p(25,12,3).p(28,9,7);
 b.mov(28,5,1,4,0,-4,'b');
 b.st(11,12,20).door(31,33,8);
 b.r(6,19).b(32,19).r(14,17).b(19,17).r(26,11).b(29,13);
});
lv('Splav preko kiseline',0,70,'Kamena splav vozi dok neko stoji na dugmetu. Jedno drži, drugo vozi, pa obrnuto.',b=>{
 b.p(11,21,2,'A').p(18,21,3,'V').p(24,21,3,'L');
 b.p(1,18,2).p(5,15,7).p(12,15,10,'A').p(22,15,13);
 b.mov(9,14,3,1,10,0,'a');
 b.btn(6,14,'a').btn(25,14,'a');
 b.p(29,12,3).p(1,9,26).p(10,9,2,'V').p(18,9,2,'L');
 b.st(32,33,20).door(3,5,8);
 b.r(25,19).b(19,19).r(16,12).b(18,12).r(18,7).b(10,7);
});

/* =================== SVIJET 2 · KRISTALNA PEĆINA =================== */
lv('Lift',1,40,'Poluga pokreće lift. Uskočite oboje prije nego ode gore!',b=>{
 b.p(9,21,2,'V').p(14,21,2,'L').p(20,21,2,'A');
 b.p(1,7,30).p(10,7,3,'L').p(18,7,3,'V').p(24,7,2,'A');
 b.lev(27,20,'a').mov(31,20,3,1,0,-13,'a');
 b.p(4,18,3);
 b.st(2,3,20).door(3,6,6);
 b.b(9,19).r(14,19).r(32,13).b(32,10).r(11,5).b(19,5).r(5,17);
});
lv('Kutija',1,50,'Gurajte kutiju zajedno: Mico preko lave, Pido preko vode. Od nje je stepenica, a drži i dugme.',b=>{
 b.p(9,21,2,'L').p(13,21,2,'V');
 b.rect(18,17,17,4);
 b.box(6,20).box(20,16);
 b.btn(23,16,'a').mov(27,13,1,4,0,-4,'a');
 b.p(32,14,3).p(28,11,3).p(32,8,3);
 b.st(2,3,20).door(32,34,7);
 b.r(9,19).b(13,19).r(29,10).b(33,13).b(25,15).r(21,15);
});
lv('Dva lifta',1,50,'Svako dugme diže lift onog drugog. Dogovorite se ko ide prvi.',b=>{
 b.p(11,21,2,'V').p(22,21,2,'L');
 b.p(8,8,20).p(14,8,2,'L').p(20,8,2,'V');
 b.mov(5,20,3,1,0,-12,'b').mov(28,20,3,1,0,-12,'a');
 b.btn(17,20,'a').btn(23,7,'b');
 b.st(15,19,20).door(25,10,7);
 b.b(11,19).r(22,19).r(14,6).b(20,6).b(6,14).r(29,14);
});
lv('Teret',1,70,'Prvo kutija i Mico na lift, tek onda Pido na dugme. Gore kutija drži vrata.',b=>{
 b.p(1,20,12).p(5,20,1,'L');
 b.rect(17,14,18,7);
 b.box(7,19).btn(4,19,'a');
 b.mov(13,20,4,1,0,-6,'a');
 b.btn(18,13,'a').btn(22,13,'b');
 b.mov(27,10,1,4,0,-4,'b');
 b.p(29,11,3).p(32,8,3);
 b.st(2,3,19).door(32,34,7);
 b.b(9,18).r(14,16).b(15,17).r(24,12).b(30,9).r(33,6);
});
lv('Kristalni splav',1,75,'Pido pali splav u plavoj sobi, Mico otvara vrata iz narandžaste.',b=>{
 b.p(1,17,4).bar(4,18,3,'w').lev(2,20,'a');
 b.p(9,21,15,'A');
 b.mov(6,20,3,1,15,0,'a',{spd:2});
 b.p(29,16,6).bar(29,17,4,'f').lev(33,20,'b');
 b.p(25,18,2).p(10,15,14);
 b.mov(14,11,1,4,0,-4,'b');
 b.p(6,12,3).p(1,9,4);
 b.stf(5,20).stw(7,19).door(2,4,8);
 b.b(1,19).r(31,19).r(13,18).b(17,18).r(20,13).b(11,13).r(7,10);
});
lv('Klackalica',1,60,'Dugme diže jedan lift, a spušta drugi. Na vrhu je još jedno dugme.',b=>{
 b.mov(2,20,3,1,0,-12,'a');
 b.p(5,8,24).p(12,8,2,'L').p(22,8,2,'V');
 b.mov(29,8,3,1,0,12,'a');
 b.btn(16,20,'a').btn(17,7,'a');
 b.p(20,21,2,'L').p(24,21,2,'V');
 b.st(10,11,20).door(7,26,7);
 b.r(20,19).b(24,19).r(12,6).b(22,6).b(3,14).r(30,14);
});

/* =================== SVIJET 3 · DŽUNGLA =================== */
lv('Leteće platforme',2,50,'Platforme se same kreću. Sačekaj pravi trenutak za skok.',b=>{
 b.p(6,21,24,'A');
 b.auto(6,18,3,1,8,0,4).auto(17,15,3,1,9,0,5);
 b.p(30,15,5).auto(31,14,3,1,0,-6,4);
 b.p(14,8,17).p(22,8,2,'L').p(26,8,2,'V');
 b.st(2,3,20).door(16,19,7);
 b.r(10,16).b(13,16).r(21,13).b(24,13).r(22,6).b(26,6).b(34,11);
});
lv('Trošni most',2,45,'Napukli blokovi padaju kad stanete na njih, pa se vrate za par sekundi.',b=>{
 b.p(5,21,30,'A');
 b.p(5,18,24,'C').p(30,15,5).p(26,12,3,'C').p(21,9,3,'C');
 b.p(2,6,17).p(12,6,2,'A');
 b.st(2,3,20).door(4,7,5);
 b.r(10,16).b(15,16).r(20,16).b(25,16).r(27,10).b(22,7);
});
lv('Kamen na dugme',2,50,'Bez kutije jedno od vas ostaje zarobljeno iza vrata.',b=>{
 b.v(18,1,12).gate(18,17,4,'a');
 b.box(6,20).btn(12,20,'a');
 b.p(2,18,3);
 b.auto(20,20,3,1,0,-9,5);
 b.p(23,21,12,'A');
 b.p(23,11,5,'C').p(28,11,7);
 b.st(2,3,20).door(30,33,10);
 b.r(3,17).b(4,17).r(21,14).b(21,16).r(25,9).b(27,9);
});
lv('Kroz krošnje',2,60,'Silazite dolje. Poluga na srednjem spratu otvara izlaz.',b=>{
 b.p(1,5,8);
 b.p(11,9,6).p(13,9,2,'L');
 b.auto(18,9,3,1,8,0,4);
 b.p(30,9,5).p(31,9,3,'C');
 b.p(24,14,11).p(26,14,2,'V');
 b.lev(33,13,'a');
 b.p(10,18,10,'C').p(10,21,10,'A');
 b.gate(8,17,4,'a');
 b.st(2,3,4).door(3,5,20);
 b.r(13,7).b(27,12).r(14,16).b(16,16).r(22,7).b(24,7);
});
lv('Tunel',2,60,'U niskom tunelu nema skakanja. Gurni kutije u rupe da napraviš most.',b=>{
 b.rect(1,18,34,3);
 b.p(9,16,14);
 b.at(13,18,' ').at(13,19,'A').at(18,18,' ').at(18,19,'A');
 b.box(6,17).box(15,17);
 b.p(25,18,2,'L').p(28,18,2,'V');
 b.p(31,15,3).p(25,12,4).p(17,9,6).p(19,9,2,'L');
 b.p(2,6,13).p(10,6,2,'V');
 b.st(2,3,17).door(4,7,5);
 b.b(16,17).r(25,16).b(28,16).r(12,15).b(20,15).r(19,7).b(10,4);
});
lv('Hram drveća',2,75,'Počinjete odvojeno. Pido drži dugme za Mica, Mico povlači polugu za Pida.',b=>{
 b.v(17,8,13).v(18,8,13);
 b.p(13,7,10);
 b.mov(13,3,1,4,0,-2,'b').mov(22,3,1,4,0,-2,'a');
 b.p(8,21,3,'L').p(25,21,3,'V');
 b.p(12,18,4).p(7,15,3).p(1,12,4).p(6,9,5,'C');
 b.p(20,18,4).p(26,15,3).p(31,12,4).p(25,9,5,'C');
 b.lev(8,8,'a').btn(28,20,'b');
 b.stf(2,20).stw(33,20).door(15,20,6);
 b.r(8,13).r(2,10).b(27,13).b(33,10).r(16,5).b(19,5);
});

/* =================== SVIJET 4 · LEDENI DVOR =================== */
lv('Klizalište',3,50,'Led je klizav: teško se kreće i teško staje. Ventilator te diže uvis.',b=>{
 b.p(1,21,34,'I').p(10,21,3,'L').p(18,21,3,'V');
 b.p(31,18,3,'I');
 b.p(1,15,28,'I').p(12,15,2,'A').p(20,15,2,'L').fan(3,15,2,9);
 b.p(6,9,29,'I').p(15,9,2,'V').p(24,9,2,'L');
 b.st(6,7,20).door(31,33,8);
 b.r(11,19).b(19,19).r(20,13).b(13,13).r(3,10).b(4,8).r(24,7).b(15,7);
});
lv('Vjetrovi',3,45,'Lebdi na vjetru i pusti se u pravom trenutku.',b=>{
 b.p(11,21,24,'A');
 b.fan(7,21,2,8);
 b.p(10,14,8,'I').fan(15,14,2,7);
 b.p(17,8,7,'I');
 b.p(24,8,6,'C').p(30,8,5);
 b.st(2,3,20).door(31,33,7);
 b.r(7,16).b(8,18).r(15,10).b(16,12).r(26,6).b(28,6).r(20,6);
});
lv('Zaleđeno jezero',3,90,'Četvora vrata, četiri dugmeta. Na ledu se teško stoji mirno!',b=>{
 b.p(1,21,34,'I').at(6,21,'V').at(10,21,'L').at(14,21,'A').at(22,21,'V').at(26,21,'L').at(30,21,'A');
 b.p(31,18,3,'I').p(1,15,28,'I');
 b.mov(10,11,1,4,0,-4,'a').mov(20,11,1,4,0,-4,'b');
 b.btn(25,14,'b').btn(16,14,'b').btn(13,14,'a').btn(6,14,'a');
 b.p(2,12,3,'I').p(6,9,3,'I').p(10,6,21,'I').v(31,1,5);
 b.at(14,6,'L').at(19,6,'V').at(23,6,'A');
 b.st(2,3,20).door(27,30,5);
 b.r(10,19).b(6,19).r(26,19).b(22,19).r(14,4).b(19,4);
});
lv('Oluja',3,60,'Svaki ventilator pali dugme onog drugog.',b=>{
 b.p(1,21,34,'I').p(14,21,3,'V').p(19,21,3,'L');
 b.fan(10,21,2,10,'a').fan(24,21,2,10,'b');
 b.p(1,11,9,'I').p(26,11,9,'I');
 b.btn(5,20,'b').btn(30,10,'a');
 b.p(6,8,3).p(27,8,3).p(11,6,14,'I');
 b.st(3,32,20).door(15,20,5);
 b.r(10,14).b(25,14).b(15,19).r(20,19).r(13,4).b(22,4);
});
lv('Leteća kutija',3,60,'Vjetar diže i nosi kutije. Ubaci kutiju u vjetar, pa je gurni na dugme.',b=>{
 b.box(5,20);
 b.p(8,21,2,'L');
 b.fan(12,21,2,9,null,1);
 b.p(14,12,6).btn(18,11,'a');
 b.v(24,1,12).gate(24,17,4,'a');
 b.p(27,21,2,'A');
 b.st(2,3,20).door(30,33,20);
 b.r(12,16).b(13,14).r(9,19).b(28,19).r(16,10).b(20,18);
});
lv('Ledeni vrh',3,75,'Opet odvojeno: Pido pali Micov vjetar dugmetom, Mico Pidov polugom.',b=>{
 b.v(17,8,13).v(18,8,13);
 b.p(13,7,10);
 b.p(1,21,16,'I').p(19,21,16,'I').p(5,21,2,'L').p(29,21,2,'V');
 b.fan(9,21,2,9,'b').p(11,12,6,'I').fan(11,12,2,7);
 b.lev(15,11,'a');
 b.fan(25,21,2,9,'a').p(19,12,6,'I').fan(23,12,2,7);
 b.btn(31,20,'b');
 b.stf(2,20).stw(33,20).door(15,20,6);
 b.r(9,15).b(25,15).r(11,8).b(24,8).r(5,19).b(29,19);
});

/* =================== SVIJET 5 · VULKAN =================== */
lv('Užarena rijeka',4,75,'Mico gazi lavu i šalje splav po Pida. Pido gazi vodu i vozi Mica.',b=>{
 b.p(4,21,12,'L').p(20,21,12,'V');
 b.mov(13,20,3,1,-9,0,'a').lev(17,20,'a');
 b.mov(20,20,3,1,9,0,'b');
 b.rect(32,18,3,3).lev(33,17,'b');
 b.p(26,15,4).p(16,12,8);
 b.st(1,2,20).door(18,21,11);
 b.r(8,19).b(25,19).r(10,17).b(27,17).r(17,10).b(22,10);
});
lv('Kamen u lavu',4,80,'Kutije u jami prave most. Lava jama je za Pida, vodena za Mica.',b=>{
 b.rect(1,18,34,3);
 for(let x=8;x<=12;x++)b.at(x,18,' ').at(x,19,'L');
 for(let x=16;x<=19;x++)b.at(x,18,' ').at(x,19,'V');
 for(let x=24;x<=26;x++)b.at(x,18,' ').at(x,19,'A');
 b.box(3,17).box(5,17).box(14,17);
 b.p(31,15,3).p(25,12,4).p(14,9,9).p(19,9,2,'C');
 b.st(1,2,17).door(15,17,8);
 b.r(10,16).b(18,16).r(25,16).b(26,16).r(21,7).b(19,7);
});
lv('Gejziri',4,55,'Vreli gejziri te bacaju uvis. Ne promaši platformu!',b=>{
 b.p(5,21,26,'A');
 b.p(5,18,2);
 b.rect(9,17,2,4).fan(9,17,2,7);
 b.p(12,11,3);
 b.auto(16,11,3,1,6,0,3.5);
 b.rect(26,15,2,6).fan(26,15,2,9);
 b.p(28,7,7);
 b.st(2,3,20).door(30,33,6);
 b.r(9,13).b(10,15).r(19,9).b(21,9).r(26,10).b(27,8);
});
lv('Krater',4,40,'Sve se ruši! Mico ide lijevo kroz lavu, Pido desno kroz vodu.',b=>{
 b.p(12,5,12).p(17,5,2,'C');
 b.p(4,10,28).p(7,10,5,'L').p(24,10,5,'V').p(4,10,2,'C').p(30,10,2,'C');
 b.p(1,15,34).p(15,15,6,'A').p(9,15,2,'C').p(25,15,2,'C');
 b.p(12,21,12,'A');
 b.st(14,21,4).door(5,30,20);
 b.r(9,8).b(26,8).r(3,13).b(32,13).r(7,19).b(28,19);
});
lv('Težak teret',4,90,'Vjetar, lift pa dugme. Kutija mora stići do samog vrha.',b=>{
 b.box(5,20);
 b.fan(9,21,2,7,null,1);
 b.p(11,15,6).lev(13,14,'a');
 b.mov(17,15,3,1,0,-6,'a');
 b.p(20,9,15).btn(23,8,'b');
 b.mov(27,5,1,4,0,-4,'b');
 b.p(12,21,3,'L').p(17,21,3,'V');
 b.st(2,3,20).door(30,33,8);
 b.r(9,17).b(10,16).r(18,12).b(18,11).r(13,19).b(18,19);
});
lv('Srce vulkana',4,110,'Sve što ste naučili: splav, kutija, vjetar i trošni blokovi.',b=>{
 b.p(5,21,10,'L');
 b.mov(5,20,3,1,7,0,'a').lev(17,20,'a');
 b.box(20,20);
 b.p(24,21,3,'V').p(29,21,2,'A');
 b.fan(32,21,2,9,null,-1);
 b.p(24,13,8).btn(26,12,'b');
 b.p(19,10,3,'C');
 b.p(1,7,16).mov(15,3,1,4,0,-2,'b');
 b.st(1,2,20).door(3,6,6);
 b.r(9,18).b(10,18).b(25,19).r(32,15).b(33,17).r(20,8).b(21,8).r(8,5).b(11,5);
});

const WORLDS=[
 {n:'Stari hram',b1:'#1c140d',b2:'#3d2b1a',st:'#6b5944',dk:'#3e3225',ed:'#b99b72',moss:'#7d9a3a',ic:'🏛️'},
 {n:'Kristalna pećina',b1:'#0b0920',b2:'#2a1d55',st:'#41386d',dk:'#251f45',ed:'#a493ff',moss:null,ic:'💎'},
 {n:'Džungla',b1:'#06150e',b2:'#173d27',st:'#45603d',dk:'#26381f',ed:'#9fcf5e',moss:'#5fae3a',ic:'🌿'},
 {n:'Ledeni dvor',b1:'#09162a',b2:'#22476b',st:'#5f84a6',dk:'#36536f',ed:'#d9f0ff',moss:null,ic:'❄️'},
 {n:'Vulkan',b1:'#170505',b2:'#421111',st:'#4d3131',dk:'#2b1a1a',ed:'#d07a4c',moss:null,ic:'🌋'}];

root.PM_LEVELS=LV;root.PM_WORLDS=WORLDS;
if(typeof module!=='undefined')module.exports={LV,WORLDS};
})(typeof window!=='undefined'?window:globalThis);
