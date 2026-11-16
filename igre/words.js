// #Bash igre – riječi za "Crtaj & pogađaj": lagane, svakodnevne, kako se priča po Bosni
const WORD_CATS={
 stvari:'📱 Stvari',hrana:'🍽️ Hrana i piće',grad:'🏙️ Grad',zivotinje:'🐾 Životinje',
 radnje:'🏃 Radnje',priroda:'🌳 Priroda',fora:'😎 Raja i fora'
};
const WORDS={
stvari:['mobitel','punjač','slušalice','laptop','televizor','daljinski','džojstik','naočale','sat','ključ','novčanik','ranac','torba','kišobran',
 'patike','majica','trenerka','kapa','šal','jakna','čarape','papuče','pidžama','jastuk','deka','krevet','kauč','stolica','sto','lampa',
 'ogledalo','četkica za zube','peškir','fen','pegla','frižider','šporet','tava','lonac','šolja','čaša','flaša','viljuška','nož','kašika',
 'tanjir','makaze','olovka','sveska','knjiga','lopta','bicikl','romobil','auto','motor','avion','brod','kamion','svijeća','balon',
 'poklon','kamera','zvučnik','mikrofon','gitara','bubanj','kofer','pasoš','kutija','kanta','metla','četka','češalj','sapun','kada',
 'prozor','vrata','stepenice','ograda','merdevine','čekić','ekser','šrafciger','baterija','sijalica','tepih','zavjesa','vješalica','budilnik','novine'],
hrana:['ćevapi','somun','burek','pita','sirnica','kafa','džezva','fildžan','čaj','sok','pivo','voda','sladoled','pizza','hamburger',
 'pomfrit','sendvič','kroasan','jogurt','kifla','hljeb','jaje','sir','banana','jabuka','kruška','šljiva','lubenica','grožđe','jagoda',
 'limun','narandža','kokice','čips','čokolada','torta','palačinke','krofna','lizalica','kolač','baklava','sarma','grah','supa','pileći batak',
 'kobasica','špageti','riža','salata','paradajz','krastavac','paprika','luk','mrkva','krompir','kukuruz','gljiva','med','kečap','majoneza',
 'žvaka','bombona','keks','kokta','limunada','mlijeko','kajmak','ajvar','pljeskavica','roštilj'],
grad:['tramvaj','autobus','taksi','semafor','zebra','parking','most','zgrada','lift','balkon','džamija','crkva','pijaca','pekara','kafić',
 'trafika','benzinska','apoteka','bolnica','škola','park','klupa','fontana','česma','golubovi','ulica','kanta za smeće','bankomat','kino','teretana',
 'stadion','aerodrom','žičara','tržni centar','pošta','policija','hitna pomoć','vatrogasci','kafana','hotel','restoran','frizer','prodavnica','kasa','korpa',
 'igralište','tobogan','ljuljačka','garaža','krov','dimnjak','antena','ograda','tunel','autoput','stanica','voz','biciklistička staza','grafit','ulična lampa'],
zivotinje:['pas','mačka','krava','konj','ovca','koza','svinja','kokoš','pijetao','patka','zec','miš','riba','ptica','golub','sova','medvjed',
 'vuk','lisica','jež','zmija','žaba','kornjača','puž','pčela','leptir','mrav','pauk','komarac','muha','lav','tigar','slon','žirafa','majmun',
 'krokodil','ajkula','delfin','hobotnica','pingvin','papagaj','kamila','panda','kit','rak','bubamara','vjeverica','magarac','labud','dinosaurus'],
radnje:['spavati','jesti','piti','trčati','plivati','plesati','pjevati','plakati','smijati se','voziti','letjeti','kuhati','čitati','pisati',
 'crtati','pecati','skakati','slikati se','zijevati','kihati','grliti','ljubiti','mahati','tuširati se','brijati se','gledati tv','telefonirati',
 'igrati fudbal','penjati se','vikati','šaptati','hodati','sjediti','padati','gurati','vući','bacati','hvatati','kopati','sanjati'],
priroda:['sunce','mjesec','zvijezda','oblak','kiša','snijeg','snješko','munja','duga','vjetar','drvo','cvijet','ruža','trava','list',
 'planina','rijeka','more','plaža','talas','ostrvo','vulkan','vatra','kamen','pećina','šuma','jezero','vodopad','pustinja','kaktus',
 'palma','jabuka na grani','gljiva','led','magla','zalazak sunca','pahulja','školjka','pijesak','zemlja'],
fora:['raja','žurka','roštilj','đir','komšija','nana','dedo','svekrva','punica','mladenci','svadba','bajram','sofra','sevdah','harmonika',
 'navijač','baklja','derbi','gol','selfi','lajk','wifi','lova','kusur','tiket','kladionica','golf dvojka','mercedes','gastarbajter','vikendica',
 'kafa s rajom','ćevabdžinica','pivo na balkonu','trenerka i papuče','buregdžinica','smeće na ulici','gužva','fudbal na livadi',
 'sijelo','tavla','remi','šah','kockica','ljetovanje','more u Neumu','auto pun stvari','mama zove','ispit','fakultet','plata','penzija','posao','šef']
};
