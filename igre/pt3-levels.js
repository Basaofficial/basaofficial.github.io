// Prolaz za dvoje 3D – nivoi. y je gore, pod je sloj y=0, hoda se od y=1.
(function(root){
'use strict';
const PI=Math.PI,E=-PI/2,Wd=PI/2;// E: gleda prema +x, Wd: prema -x
const L=[];
function lv(name,hint,fn){L.push({name,hint,build:B=>{fn(B);return B.def({name,hint})}})}
const M=1,W=2,G=3,GOO=4,FIZ=5;

lv('Prvi prolaz','Lijevi klik i desni klik prave tvoja dva portala. Jedan visoko na bijeli zid desno, drugi na bijeli zid iza vas – pa prođi kroz njega.',b=>{
 b.size(16,9,8);b.shell();
 b.fill(10,1,1,14,3,6,M);b.exit(11,4,3,13,5,4);
 b.fill(15,4,2,15,7,5,W);b.fill(0,1,2,0,3,5,W);
 b.spawn('a',3,1,3,E);b.spawn('b',3,1,5,E);
});
lv('Zajedno','Jedno stane na dugme da drugo prođe kroz vrata – pa obrnuto. Na policu s izlazom ide se kroz pod i strop.',b=>{
 b.size(20,9,9);b.shell();
 b.fill(10,1,1,10,7,7,M);b.door('x',10,1,4,10,2,4);
 b.button('x',6,1,4);b.button('x',13,1,7);
 b.fill(15,1,1,18,3,7,M);b.exit(16,4,3,17,5,5);
 b.fill(15,8,2,18,8,6,W);b.fill(12,0,2,13,0,5,W);
 b.spawn('a',3,1,3,E);b.spawn('b',3,1,5,E);
});
lv('Kocka','Kocka drži dugme umjesto vas (E da je uzmeš). Do police s kockom stigni kroz strop iznad nje – nišani iz daljine.',b=>{
 b.size(18,10,9);b.shell();
 b.fill(1,5,1,5,5,7,M);b.cube(2,6,4);b.fill(1,9,2,5,9,6,W);
 b.fill(7,0,6,9,0,7,W);
 b.fill(13,1,1,13,8,7,M);b.door('x',13,1,4,13,2,4);b.button('x',11,1,2);
 b.exit(15,1,3,16,2,5);
 b.spawn('a',7,1,3,E);b.spawn('b',7,1,5,E);
});
lv('Skok vjere','Brzina ulazi, brzina izlazi! Portal na dno jame, drugi VISOKO na bijeli zid lijevo – pa skoči s ruba u jamu.',b=>{
 b.size(24,12,7);b.shell();
 b.fill(0,2,1,0,8,5,W);b.fill(1,1,1,5,1,5,GOO);
 b.fill(6,1,1,11,1,5,M);b.exit(8,2,2,10,3,4);
 b.fill(12,1,1,12,3,5,M);b.fill(13,0,1,15,0,5,W);
 b.fill(16,1,1,22,6,5,M);
 b.spawn('a',19,7,2,Wd);b.spawn('b',19,7,4,Wd);
});
lv('Odskočna ploča','Žuta ploča te baci u zrak – usmjeri se na policu. Odatle: portal na bijeli pod police i na strop iznad izlaza.',b=>{
 b.size(22,12,7);b.shell();
 b.pad(5,1,3,3,13,0);
 b.fill(8,1,1,14,4,5,M);b.fill(11,4,2,12,4,4,W);
 b.fill(15,1,1,16,1,5,GOO);
 b.fill(17,1,1,20,8,5,M);b.exit(18,9,2,19,10,4);b.fill(17,11,1,20,11,5,W);
 b.spawn('a',2,1,2,E);b.spawn('b',2,1,4,E);
});
lv('Polje','Plavo polje briše vaše portale i topi kocke. Kocku prenesi kroz portal: jedan na zid kraj kocke, drugi preko polja u strop.',b=>{
 b.size(20,10,8);b.shell();
 b.fill(0,1,2,0,3,5,W);b.cube(3,1,4);
 b.fill(10,1,1,10,5,6,FIZ);
 b.fill(13,9,2,16,9,5,W);b.button('x',15,1,2);
 b.fill(17,1,1,17,8,6,M);b.door('x',17,1,4,17,2,4);b.exit(18,1,3,18,2,5);
 b.spawn('a',5,1,2,E);b.spawn('b',5,1,6,E);
});
lv('Beskrajni pad','Portal u pod i portal u strop tačno iznad – padaj dok ne poletiš. U padu prebaci gornji portal VISOKO na bijeli zid lijevo.',b=>{
 b.size(24,12,7);b.shell();
 b.fill(3,0,2,4,0,4,W);b.fill(3,11,2,4,11,4,W);b.fill(0,6,1,0,9,5,W);
 b.fill(7,1,1,19,1,5,GOO);b.fill(12,2,1,13,4,5,M);
 b.exit(21,1,2,22,2,4);
 b.spawn('a',1,1,2,E);b.spawn('b',1,1,4,E);
});
lv('Završni test','Kocka je u sobici gore lijevo: s visoke police portal na njen bijeli zid i na bijeli pod police. Kocku nosi na ploču, pa na dugme – otvoriće se rupa do izlaza.',b=>{
 b.size(24,12,9);b.shell();
 b.fill(1,6,1,6,6,7,M);b.fill(6,7,1,6,10,7,M);b.fill(6,7,3,6,8,5,0);b.fill(0,7,2,0,9,6,W);b.cube(2,7,4);
 b.pad(10,1,4,2.5,16.5,0);
 b.fill(12,5,1,22,6,7,M);b.fill(12,1,1,12,4,7,M);b.door('x',14,5,3,15,6,4);
 b.button('x',18,7,4);b.fill(20,6,2,21,6,6,W);
 b.exit(20,1,3,21,2,5);
 b.spawn('a',3,1,3,E);b.spawn('b',3,1,5,E);
});
lv('Crveni zrak','Laser peče – ne stoj u njemu! Uhvati zrak portalom na desnom zidu i pošalji ga drugim portalom u metu na zadnjem zidu. Meta otvara vrata.',b=>{
 b.size(18,8,12);b.shell();
 b.laser(0,2,3,1,0,0);b.fill(17,1,2,17,4,5,W);b.fill(7,1,0,11,4,0,W);
 for(let x=8;x<=10;x++)for(let y=1;y<=3;y++)b.receiver('x',x,y,11);
 b.fill(1,1,7,4,6,7,M);b.fill(4,1,8,4,6,10,M);b.door('x',4,1,9,4,2,9);b.exit(1,1,8,3,2,10);
 b.spawn('a',6,1,8,E);b.spawn('b',6,1,10,E);
});
lv('Prizma','Prozirna kocka s okom skreće laser u smjeru u kojem gledaš dok je nosiš. Spusti je u zrak okrenutu prema meti.',b=>{
 b.size(16,8,12);b.shell();
 b.laser(0,1,6,1,0,0);
 for(let x=11;x<=13;x++)for(let y=1;y<=2;y++)b.receiver('x',x,y,11);
 b.cube(4,1,9,'prism',0);
 b.fill(11,1,1,11,7,3,M);b.fill(12,1,3,14,7,3,M);b.door('x',11,1,2,11,2,2);b.exit(12,1,1,14,2,2);
 b.spawn('a',3,1,9,E);b.spawn('b',3,1,10,E);
});
lv('Zrak sa stropa','Laser udara u pod. Portal ispod zraka, drugi visoko na bijeli zid lijevo – pa zrak leti ravno u metu desno.',b=>{
 b.size(18,10,10);b.shell();
 b.laser(5,9,5,0,-1,0);b.fill(3,0,3,7,0,7,W);b.fill(0,5,3,0,8,7,W);
 for(let z=4;z<=6;z++)for(let y=6;y<=8;y++)b.receiver('x',17,y,z);
 b.fill(12,1,1,12,9,2,M);b.fill(12,1,3,16,9,3,M);b.door('x',12,1,2,12,2,2);b.exit(13,1,1,16,2,2);
 b.spawn('a',9,1,7,E);b.spawn('b',9,1,8,E);
});
lv('Kocka na letu','Vrata kod vas otvara dugme preko otrova. Baci kocku s ruba u portal na dnu jame – izletjeće iz zida i pasti na dugme.',b=>{
 b.size(24,12,7);b.shell();
 b.fill(0,2,1,0,8,5,W);b.fill(1,1,1,5,1,5,GOO);
 b.fill(6,1,1,11,1,5,M);for(let x=7;x<=11;x++)for(let z=1;z<=5;z++)b.button('x',x,2,z);
 b.fill(12,1,1,12,3,5,M);b.fill(13,0,1,15,0,5,W);
 b.fill(16,1,1,22,6,5,M);b.cube(18,7,3);
 b.fill(19,7,3,22,10,3,M);b.fill(19,7,1,19,10,2,M);b.door('x',19,7,2,19,8,2);b.exit(20,7,1,22,8,2);
 b.spawn('a',17,7,2,Wd);b.spawn('b',17,7,4,Wd);
});
lv('Finale svjetla','Zrak: desni zid → portal → prednji zid → prizma → kroz staklo u metu. Prizma je na polici gore lijevo (pod + strop). Jedno može držati prizmu dok drugo uđe i stane na dugme unutra.',b=>{
 b.size(20,10,12);b.shell();
 b.laser(0,2,2,1,0,0);b.fill(19,2,1,19,4,4,W);b.fill(3,1,0,6,4,0,W);
 b.fill(13,1,4,13,4,8,G);b.fill(14,1,4,18,4,4,G);b.fill(14,1,8,18,4,8,G);
 for(let z=5;z<=7;z++)for(let y=1;y<=3;y++)b.receiver('x',19,y,z);
 b.fill(1,4,9,4,4,10,M);b.cube(2,5,10,'prism',0);b.fill(1,9,9,4,9,10,W);b.fill(7,0,9,8,0,10,W);
 b.fill(1,1,8,4,4,8,M);b.fill(5,1,8,5,4,10,M);b.door('x',2,1,8,2,2,8);b.button('x',3,1,10);b.exit(1,1,9,2,2,10);
 b.spawn('a',9,1,5,E);b.spawn('b',9,1,6,E);
});
if(typeof module!=='undefined'&&module.exports)module.exports=L;else root.PT3_LEVELS=L;
})(this);
