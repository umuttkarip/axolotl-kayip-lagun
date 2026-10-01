'use strict';
window.LagoonExpansion = {
  chapters:[
    {name:'Işıklı Sığlık',subtitle:'Sığlığın ışıklarını koru',tint:'rgba(0,120,105,.04)',color:'#99ffe0',decor:'buds',enemies:14,pool:['fish','fish','jelly','jelly'],stages:[
      {name:'Dağılmış inciler',type:'pearls',goal:18,requiredKills:12,copy:'18 inci topla; yolunu kesen 12 düşmanı sakinleştir.'},
      {name:'Sığlığa gelen sürü',type:'combat',goal:24,copy:'Gelen sürüdeki 24 düşmanı sakinleştir. Takviye dalgalarına dikkat!'},
      {name:'Ada’yı koru',type:'rescue',goal:1,friend:'Ada',requiredKills:12,defend:50,copy:'Ada’yı bul, 50 saniye yanında savaş ve 12 düşmanı yen.'},
      {name:'Işık zinciri',type:'relay',goal:9,requiredKills:12,copy:'9 ışığı sırayla yak ve 12 düşmanı sakinleştir.'},
      {name:'Sığlığın bekçisi',type:'guardian',goal:1,bossName:'SIĞLIĞIN BEKÇİSİ',pattern:'fans',copy:'Bekçiyi ve yanındaki sürüyü aş. Bölgenin tek geçidi seni bekliyor.'}
    ]},
    {name:'Mercan Bahçesi',subtitle:'Mercanların arasındaki pusu',tint:'rgba(27,144,102,.12)',color:'#a4efbd',decor:'flowers',enemies:17,pool:['fish','darter','jelly','spitter'],stages:[
      {name:'Mercan yıldızları',type:'stars',goal:24,requiredKills:16,copy:'24 yıldızı bul ve 16 düşmanı yen. Çizgi çizen balıklar atılmaya hazırlanıyor!'},
      {name:'Bahçenin saldırı dalgaları',type:'combat',goal:30,copy:'30 düşmanı yen. Uzaktan köpük atan balıklardan sıyrıl.'},
      {name:'Mira’nın savunması',type:'rescue',goal:1,friend:'Mira',requiredKills:16,defend:60,copy:'Mira’yı bul, 60 saniye koru ve 16 düşmanı yen.'},
      {name:'Mercan halkaları',type:'rings',goal:10,requiredKills:16,copy:'10 halkadan sırayla yüz; 16 düşmanı sakinleştir.'},
      {name:'Mercan bekçisi',type:'guardian',goal:1,bossName:'MERCAN BEKÇİSİ',pattern:'spiral',copy:'Dönen saldırıların arasından mercan bekçisini yen.'}
    ]},
    {name:'Kristal Mağaralar',subtitle:'Dayanıklı muhafızların bölgesi',tint:'rgba(22,132,143,.18)',color:'#a2f2ee',decor:'crystals',enemies:20,pool:['darter','spitter','guard','jelly','fish'],stages:[
      {name:'Kristal hazineleri',type:'pearls',goal:24,requiredKills:20,copy:'24 inci ve 20 düşman. Büyük muhafızlar daha fazla baloncuk ister.'},
      {name:'Mağaranın kuşatması',type:'combat',goal:36,copy:'36 düşmanı yen; hızlı balıklarla muhafızlar birlikte geliyor.'},
      {name:'Nara’nın sığınağı',type:'rescue',goal:1,friend:'Nara',requiredKills:20,defend:65,copy:'Nara’yı bul, 65 saniye birlikte diren ve 20 düşmanı yen.'},
      {name:'Kristal mühürleri',type:'relay',goal:11,requiredKills:20,copy:'11 kristal mührünü sırayla yak ve 20 düşmanı yen.'},
      {name:'Kristal bekçisi',type:'guardian',goal:1,bossName:'KRİSTAL BEKÇİSİ',pattern:'fans',copy:'Bekçinin geniş saldırı yelpazesinden ve muhafızlarından kaçın.'}
    ]},
    {name:'Derinliğin Kalbi',subtitle:'Son ve en yoğun dalış',tint:'rgba(3,5,53,.28)',color:'#d0c3ff',decor:'hearts',enemies:22,pool:['guard','spitter','darter','darter','jelly'],stages:[
      {name:'Kalbin parıltıları',type:'stars',goal:30,requiredKills:24,copy:'30 yıldız ve 24 düşman. Derinliğin sürüsü seni arıyor.'},
      {name:'Derinliğin son sürüsü',type:'combat',goal:42,copy:'42 düşmanı yen. Yoğun dalgalarda atılmayı ve mesafeni kullan.'},
      {name:'Pofuduk’un son çağrısı',type:'rescue',goal:1,friend:'Pofuduk',requiredKills:24,defend:70,copy:'Pofuduk’u bul, 70 saniye diren ve 24 düşmanı yen.'},
      {name:'Kalbe giden halkalar',type:'rings',goal:12,requiredKills:24,copy:'12 halkadan sırayla geç ve 24 düşmanı sakinleştir.'},
      {name:'Derinliğin koruyucusu',type:'guardian',goal:1,bossName:'DERİNLİĞİN KORUYUCUSU',pattern:'petals',copy:'Son koruyucuyu dostlarınla yen. Düşük canında saldırıları hızlanır!'}
    ]}
  ],
  powers:{
    rainbow:{name:'Gökkuşağı köpüğü',symbol:'✿',color:'#ffc1e1',duration:10,copy:'Üç renkli baloncuk birden!'},
    shield:{name:'Pofuduk kalkan',symbol:'♡',color:'#bdeeff',duration:12,copy:'Üç dokunuşa karşı koruma.'},
    magnet:{name:'İnci mıknatısı',symbol:'⌁',color:'#ffe4ab',duration:12,copy:'Yakındaki hazineler sana yüzüyor.'},
    hurry:{name:'Jöle kulaç',symbol:'≈',color:'#aff3d5',duration:10,copy:'Hızlı yüz, az enerjiyle atıl.'},
    double:{name:'Çifte parıltı',symbol:'×2',color:'#d5c1ff',duration:12,copy:'Topladığın puanlar iki kat!'}
  },
  events:[
    {id:'rain',name:'İnci yağmuru',color:'#ffd7b1',duration:14,copy:'Yakında bir avuç renkli hazine belirdi!'},
    {id:'party',name:'Baloncuk şenliği',color:'#ffbdd9',duration:15,copy:'Gülen baloncukları patlat, sürpriz puan topla!'},
    {id:'trail',name:'Yıldız yolu',color:'#ffe5ac',duration:16,copy:'Sekiz yıldızı da bul: yolun sonunda +600!'},
    {id:'picnic',name:'Minik piknik',color:'#baffd8',duration:13,copy:'Biraz lokma, biraz can, biraz neşe.'},
    {id:'calm',name:'Sakin su molası',color:'#bee5ff',duration:12,copy:'Yaramazlar yavaşladı. Hazinelere bakın!'}
  ]
};
