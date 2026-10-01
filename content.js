'use strict';
window.LagoonExpansion = {
  chapters:[
    {name:'Işıklı Sığlık',subtitle:'Dostun Ada ile ilk kulaçlar',tint:'rgba(24,163,128,.08)',color:'#b5ffe1',decor:'buds',enemies:4,pool:['fish','jelly','fish','jelly'],stages:[
      {name:'İlk renkli inciler',type:'pearls',goal:8,intensity:.25,copy:'8 renkli inciyi keşfet. Ada seninle; oka doğru yüz.'},
      {name:'Işık tomurcukları',type:'relay',goal:5,intensity:.30,copy:'5 tomurcuğu sırayla yak. Ok sıradaki ışığı gösterir.'},
      {name:'Mira ile köpük oyunu',type:'rescue',goal:1,friend:'Mira',requiredKills:3,defend:20,intensity:.35,copy:'Mira’yı bul; 20 saniye birlikte yüz ve 3 yaramazı sakinleştir.'}
    ]},
    {name:'Mercan Bahçesi',subtitle:'Yıldızlar ve ipek akıntıları',tint:'rgba(58,164,109,.11)',color:'#c8f4a7',decor:'flowers',enemies:7,pool:['fish','jelly','darter','jelly'],stages:[
      {name:'Akıntının yıldızları',type:'stars',goal:12,intensity:.50,copy:'12 yıldızı topla. İpek akıntıları seni biraz sürükleyebilir.'},
      {name:'Mercan halkaları',type:'rings',goal:6,intensity:.56,copy:'6 halkadan sırayla geç. Atılan balıkların çizgisine dikkat.'},
      {name:'Nara’nın minik sığınağı',type:'rescue',goal:1,friend:'Nara',requiredKills:4,defend:20,intensity:.62,copy:'Nara’yı bul; 20 saniye yanında kal ve 4 yaramazı sakinleştir.'}
    ]},
    {name:'Yıldızlı Lagün',subtitle:'Dostlarınla son bir köpük şenliği',tint:'rgba(89,97,167,.12)',color:'#ded0ff',decor:'stars',enemies:11,pool:['fish','darter','jelly','spitter','guard'],stages:[
      {name:'Lagünün renkleri',type:'pearls',goal:12,requiredKills:3,intensity:.75,copy:'12 inciyi bul ve 3 yaramazı sakinleştir.'},
      {name:'Köpük şenliği',type:'combat',goal:12,intensity:.87,copy:'12 yaramazla köpük oyunu oyna. Dalgalar arasında nefeslen.'},
      {name:'Pofuduk ve yıldız bekçisi',type:'guardian',goal:1,friend:'Pofuduk',bossName:'YILDIZ BEKÇİSİ',pattern:'fans',intensity:1,copy:'Pofuduk’u da yanına al; yıldız bekçisini dostlarınla sakinleştir.'}
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
    {id:'calm',name:'Sakin su molası',color:'#bee5ff',duration:12,copy:'Yaramazlar yavaşladı. Hazinelere bakın!'},
    {id:'current',name:'İpek akıntısı',color:'#b5ffe1',duration:9,copy:'Yumuşak dalgalarla süzül; kulaçlarınla yönünü koru.'},
    {id:'shoal',name:'Minik balık geçidi',color:'#ffd1db',duration:10,copy:'Renkli misafirler geldi! Onlar sadece gezmeye uğradı.'}
  ]
};
