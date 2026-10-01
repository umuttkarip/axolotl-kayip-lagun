'use strict';
window.LagoonExpansion = {
  chapters:[
    {name:'Işıklı Sığlık',subtitle:'Minik bir ışık, büyük bir başlangıç',tint:'rgba(0,120,105,.04)',color:'#99ffe0',decor:'buds',enemies:5,stages:[
      {name:'İlk parıltılar',type:'pearls',goal:4,copy:'Dört renkli inciyi bul.'},
      {name:'Ada’nın saklandığı yer',type:'rescue',goal:1,copy:'Ada’yı bul; minik baloncuklarıyla sana yardım etsin.',friend:'Ada'},
      {name:'Sığlığın ışık zinciri',type:'relay',goal:3,copy:'Üç ışık tomurcuğunu sırayla yak.'}
    ]},
    {name:'Mercan Bahçesi',subtitle:'Her yaprağın altında başka bir sürpriz',tint:'rgba(27,144,102,.12)',color:'#a4efbd',decor:'flowers',enemies:6,stages:[
      {name:'Bahçenin uyanışı',type:'relay',goal:4,copy:'Mercan tomurcuklarını sırayla aydınlat.'},
      {name:'Yaprak arası hazineler',type:'pearls',goal:5,copy:'Bahçedeki beş renkli inciyi topla.'},
      {name:'Bahçenin yaramazları',type:'combat',goal:5,copy:'Beş yaramazı tatlı baloncuklarla sakinleştir.'}
    ]},
    {name:'Unutulmuş Tapınak',subtitle:'Eski taşlarda yeni ışıklar',tint:'rgba(53,36,120,.19)',color:'#c4b1ff',decor:'runes',enemies:7,stages:[
      {name:'Taşların sakladığı inciler',type:'pearls',goal:5,copy:'Taşların arasındaki beş inciyi bul.'},
      {name:'Tapınağın uyuyan yolu',type:'relay',goal:4,copy:'Dört ışık mührünü sırayla uyandır.'},
      {name:'Mor bekçinin uykusu',type:'guardian',goal:1,copy:'Mor bekçiyi baloncuklarla sakinleştir.',bossName:'MOR BEKÇİ',pattern:'spiral'}
    ]},
    {name:'Şeker Kabuk Koyu',subtitle:'Pembe kabuklar, neşeli dostlar',tint:'rgba(179,73,112,.12)',color:'#ffbdd5',decor:'shells',enemies:7,stages:[
      {name:'Mira’nın küçük yardım çağrısı',type:'rescue',goal:1,copy:'Mira’yı bul; birlikte yüzmek daha eğlenceli.',friend:'Mira'},
      {name:'Kabukların yıldız sepeti',type:'stars',goal:10,copy:'Kabukların arasındaki on yıldızı topla.'},
      {name:'Koyun köpük oyunu',type:'combat',goal:6,copy:'Altı yaramazı köpük oyununa kat.'}
    ]},
    {name:'Deniz Feneri Yolu',subtitle:'Sarı ışıklar eve giden yolu gösterir',tint:'rgba(122,116,23,.10)',color:'#ffe0a1',decor:'lanterns',enemies:8,stages:[
      {name:'Fenerlerin selamı',type:'relay',goal:5,copy:'Beş küçük feneri sırayla yak.'},
      {name:'Kulaç halkaları',type:'rings',goal:4,copy:'Dört su halkasının içinden sırayla yüz.'},
      {name:'Fenerin inci sandığı',type:'pearls',goal:6,copy:'Fener yolundaki altı inciyi topla.'}
    ]},
    {name:'Yıldızlı Akıntı',subtitle:'Suyun içinde bir avuç gökyüzü',tint:'rgba(30,61,137,.22)',color:'#b7d5ff',decor:'stars',enemies:8,stages:[
      {name:'Minik gökyüzü',type:'stars',goal:12,copy:'Akıntının taşıdığı on iki yıldızı bul.'},
      {name:'Nara ve yıldız izi',type:'rescue',goal:1,copy:'Nara’yı kurtar; üçüncü minik yol arkadaşın olsun.',friend:'Nara'},
      {name:'Yıldız dansı',type:'guardian',goal:1,copy:'Yıldız bekçisinin dansını baloncuklarla tamamla.',bossName:'YILDIZ BEKÇİSİ',pattern:'fans'}
    ]},
    {name:'Kristal Mağaralar',subtitle:'Her köşede farklı bir renk',tint:'rgba(22,132,143,.18)',color:'#a2f2ee',decor:'crystals',enemies:9,stages:[
      {name:'Kristal kıvrımları',type:'rings',goal:5,copy:'Beş kristal halkasından sırayla geç.'},
      {name:'Mağaranın köpük şenliği',type:'combat',goal:7,copy:'Yedi yaramazı renkli köpüklerle sakinleştir.'},
      {name:'Kristal ışık korosu',type:'relay',goal:5,copy:'Beş kristali sırayla aydınlat.'}
    ]},
    {name:'Derinliğin Kalbi',subtitle:'Dostlarınla son ışığı koru',tint:'rgba(3,5,53,.28)',color:'#d0c3ff',decor:'hearts',enemies:10,stages:[
      {name:'Kalbin renkleri',type:'pearls',goal:7,copy:'Son kıyının yedi renkli incisini bul.'},
      {name:'Son küçük dost',type:'rescue',goal:1,copy:'Kayıp minik dostu güvenli kıyıya ulaştır.',friend:'Pofuduk'},
      {name:'Lagünün birlikte atan kalbi',type:'guardian',goal:1,copy:'Dostlarınla derinliğin koruyucusunu sakinleştir.',bossName:'DERİNLİĞİN KORUYUCUSU',pattern:'petals'}
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
