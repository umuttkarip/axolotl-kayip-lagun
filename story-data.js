'use strict';
window.LagoonStory = {
  width:4400,height:1850,
  opening:{id:'opening',speaker:'Axo',title:'Su başka türlü akıyor.',pages:[
    'Her sabah aynı kökün altında uyanırdım. Sazların arasından düşen ışık önce kuyruğuma, sonra burnuma değirdi. Ada çoktan yiyecek aramaya çıkmış olurdu. Mira suyun taşıdığı sesleri dinler, Nara ise neden her taşın başka bir rengi olduğunu sorardı. O sabah köklerin altında yalnızdım.',
    'Su bulanık değildi. Yalnızca alıştığım yönde akmıyordu. Dipte duran bir yaprak, yıllardır hiç gitmediği bir yöne sürükleniyordu. Arkadaşlarımın izini aramak için yola çıktım. Acele etmem gerekmiyordu; lagünde kaybolan bir yolu bulmak için bazen önce durup dinlemek gerekir.'
  ]},
  regions:[
    {name:'Sazların Fısıltısı',subtitle:'Evin kıyısında',art:'forest',grade:'rgba(110,94,25,.05)',flow:14,npc:'Ulu',npcAt:[760,890],friend:null,stages:[
      {title:'Ulu ile konuş',type:'talk',x:760,y:890,speaker:'Ulu',heading:'Yaprağın gittiği yer',pages:[
        '“Bu sabah sen de fark ettin, değil mi?” Ulu kökün dibinde duruyordu. Solungaçlarına takılan küçük bir yaprağı yavaşça silkeledi. “Ana kaynak eskisi kadar su getirmiyor. Küçük kolların yönü değişmiş. Arkadaşların doğudaki geniş havuza gitmiş olabilir. Ama bir akıntının nereye gittiğini anlamadan peşine düşme.”',
        'Ulu yüzeydeki ışığa değil, suyun içindeki zerrelere bakmamı söyledi. “Işık bazen gözü yanıltır. Zerreler ise suyla birlikte hareket eder. Eski kök işaretini bul. Biz gençken yolu oradan okurduk.” İlk defa evimin sadece birkaç taş ve sazdan ibaret olmadığını düşündüm. Etrafım, birbirine bağlı sayısız küçük yoldu.'
      ]},
      {title:'Eski kök işaretini incele',type:'talk',x:1900,y:610,speaker:'Axo',heading:'Kökün tuttuğu hatıra',pages:[
        'İki kalın kökün birleştiği yerde, sığ bir çentik vardı. Çocukken Ada ile burayı bir geçit sanırdık. İçinden yüzmeye çalışır, kuyruğumuzu sıkıştırır, sonra da gülerek başka bir yol bulurduk. Şimdi çentiğin altında biriken ince kum, batıya değil doğuya uzanıyordu.',
        'Kumun içinde üç küçük iz seçtim. Birbirine yakın başlayıp ayrılan üç kuyruk izi. Ada, Mira ve Nara buradan geçmiş olmalıydı. Yakınlardaki açık taşı hatırladım; annem, uzun yollara çıkmadan önce orada dinlenirdi. Suyun yeni yönünü anlamak için ben de biraz duracaktım.'
      ]},
      {title:'Açık taşta durup suyu dinle',type:'rest',x:2450,y:1260,speaker:'Axo',heading:'Yavaşlamak da bir yol',pages:[
        'Taşın üzerinde hareketsiz kaldığımda dünya susmadı. Daha önce duymadığım kadar çok ses vardı: bir yaprağın kayaya sürtünmesi, kökler arasından geçen su, uzakta kıpırdayan küçük bir balık sürüsü. Kuyruğumu oynatmayı bıraktım. Beni hafifçe doğuya çeken suyu bedenimde hissettim.',
        'Ulu haklıydı. Yüzmek yalnızca ileri gitmek değildi; bazen suyun seni nasıl taşıdığını anlamaktı. Uzaktaki saz açıklığı artık bir duvar gibi görünmüyordu. Oraya götüren ince bir yol vardı. Arkadaşlarımın izini bulduğum için sevindim, ama ilk kez bu yolu gerçekten görmüş olduğum için daha çok sevindim.'
      ]},
      {title:'Saz açıklığındaki izi takip et',type:'talk',x:3550,y:850,speaker:'Axo',heading:'İlk eşik',pages:[
        'Sazların arasında Ada’nın sevdiği küçük beyaz kabuklardan biri duruyordu. Onları hep biriktirir, hangi havuzdan geldiğini hatırlardı. Kabuğun yanına kendi bulduğum düz taşı bıraktım. Eğer arkadaşlarımdan biri geri dönerse, benim de buradan geçtiğimi anlayacaktı.',
        'Ev arkamda kalmıştı ama kaybolmuş değildi. Onun izini artık yanımda taşıyordum. Açıklığın ötesinde kökler daha uzundu, su daha serindi. Bir süre sonra, dipten gelen tanıdık bir kıpırtı gördüm. Ada mıydı? Görmek için yaklaşmam gerekecekti.'
      ]}
    ]},
    {name:'Köklerin Arasında',subtitle:'Bir dosta yetişmek',art:'forest',grade:'rgba(3,76,63,.20)',flow:23,npc:'Ada',npcAt:[1100,660],friend:'Ada',stages:[
      {title:'Kökler arasında Ada’yı bul',type:'talk',x:1100,y:660,speaker:'Ada',heading:'Bırakılan beyaz kabuk',pages:[
        'Ada beni görünce saklandığı kökün arkasından çıktı. “Kabuğumu bulmuşsun.” Sesi her zamankinden daha kısıktı. “Mira, kaynağın sesini duyamadığını söyledi. Nara onun peşinden gitti. Ben de buradaki geçidi kontrol edecektim ama su beni köklerin arasına sürükledi.”',
        'Onu hemen yola çıkmaya zorlamadım. Küçük ayaklarıyla köke tutunurken yorulduğunu gördüm. “Biraz yiyecek bulabiliriz,” dedim. Ada başını salladı. “Üç küçük lokma yeter. Sonra geniş, sakin havuza birlikte gideriz.” İlk kez birini bulmanın, hemen yoluna devam etmek anlamına gelmediğini anladım.'
      ]},
      {title:'Ada için 3 küçük lokma bul',type:'feed',x:1100,y:660,speaker:'Ada',heading:'Yol arkadaşının payı',pages:[
        'Yiyecekleri getirdiğimde Ada birini bana doğru itti. “Sen de epey yüzdün.” Birlikte yedik. Köklerin arasında ışık ince çizgiler halinde ilerliyordu. Bir balık sürüsü yanımızdan geçerken ikimiz de sessizce kenara çekildik. Burada herkesin geçeceği bir yol vardı.',
        'Ada kuyruğunu birkaç kez yavaşça hareket ettirdi. “Şimdi hazırım. Yalnız çok hızlı gitme, olur mu?” Ona yetişmesini bekleyeceğimi söyledim. Sakin havuz doğudaydı. Bu kez yönümü yalnızca gideceğim yere göre değil, yanımda yüzen dostuma göre de seçecektim.'
      ]},
      {title:'Ada’yı sakin havuza götür',type:'escort',x:3150,y:1280,speaker:'Ada',heading:'Aynı hızda',pages:[
        'Havuza vardığımızda Ada yanımda durdu. Köklerin arasında her dönüşte biraz yavaşlamış, akıntı güçlendiğinde onu beklemiştim. Şimdi solungaçları daha rahat hareket ediyordu. “Eskiden hep hangimizin daha hızlı olduğunu konuşurduk,” dedi. “Bugün aynı hızda yüzmek daha güzelmiş.”',
        'Mira’nın taşların arasındaki eski geçide gittiğini anlattı. Orada suyun birbirine karıştığı üç küçük kaynak vardı. Ada, geçitteki düz taşı gösteren eski bir çizgiyi hatırlıyordu. “Ben de seninle geleceğim. Burada oturup diğerlerinin dönmesini beklemek istemiyorum.” Artık yolculuk yalnızca benim değildi.'
      ]},
      {title:'Taşlı geçidin yolunu oku',type:'talk',x:3720,y:730,speaker:'Axo',heading:'Taşlara doğru',pages:[
        'Düz taşın üstündeki ince kum çizgisi, kök ormanının bittiği yeri gösteriyordu. Ada yanıma geldi ve bulduğu iki beyaz kabuğu çizginin kenarına bıraktı. “Dönüş yolu için,” dedi. Onu izlerken kabuklarını neden bu kadar sevdiğini anladım. Her biri küçük bir hatırlama biçimiydi.',
        'Önümüzde bitkiler seyrekleşiyor, büyük taşlar başlıyordu. Akıntının içindeki serinlik artmıştı. Mira bir şeyi dinlemek için buraya kadar geldiyse, bulacağı ses sıradan bir ses değildi. Birbirimize baktık, sonra aynı yöne döndük. Su bu kez ikimizi taşıyordu.'
      ]}
    ]},
    {name:'Taşların Belleği',subtitle:'Suyun sırasını öğrenmek',art:'cave',grade:'rgba(15,27,46,.10)',flow:29,npc:'Mira',npcAt:[3360,1130],friend:'Mira',stages:[
      {title:'Girişteki üç taş izini incele',type:'talk',x:850,y:1020,speaker:'Axo',heading:'Küçükten büyüğe',pages:[
        'Taşların yüzeyinde ince su kanalları vardı. En küçüğü bir damla kadar dardı; ikincisi bir parmak kadar, üçüncüsü ise iki kökün arasındaki boşluk kadar genişti. Ada, “Ulu bunları bir sıra gibi anlatırdı,” dedi. “Önce damla, sonra sızıntı, en son dere.”',
        'Üç kaynağın ağzında küçük yapraklar birikmişti. Her biri tek başına akıyor, ama birbirine ulaşamıyordu. En küçük ağızdan başlayıp sırayla yaklaşırsam suyu yeniden birleştirebilirdim. Bunun için güç değil, dikkat gerekiyordu. Haritadaki üç halka farklı büyüklükteydi; taşlar bize sırayı zaten gösteriyordu.'
      ]},
      {title:'Kaynakları küçükten büyüğe bağla',type:'puzzle',x:2350,y:930,speaker:'Axo',heading:'Birbirini bulan sular',pages:[
        'Küçük ağzın kenarındaki yaprağı kaldırdım, sonra ortadaki ve büyük olanı açtım. Su, acele etmeden kendi yolunu buldu. Önce ince bir kum çizgisi hareket etti. Ardından iki küçük akıntı birleşti. Taşların altında uzun zamandır duyulmayan derin bir uğultu başladı.',
        'Ada, “Mira’nın aradığı ses bu olabilir,” dedi. Ama uğultunun içinde bir eksiklik vardı. Sanki bir şarkının yalnızca başlangıcını duymuştuk. Doğudaki kayaların arasında küçük bir gölge kıpırdadı. Solungaçlarının rengi tanıdıktı. Bir sonraki cevabı bulmak için o gölgeye yaklaşmalıydık.'
      ]},
      {title:'Kayaların arasında Mira’ya ulaş',type:'talk',x:3360,y:1130,speaker:'Mira',heading:'Duyulmayan üçüncü ses',pages:[
        '“Başladınız,” dedi Mira. “Suyun değiştiğini hissettim.” Bizi beklemiyormuş gibi görünüyordu ama yüzündeki rahatlamayı saklayamadı. “Üç kaynağı dinledim. İkisi hâlâ buraya su getiriyor. Üçüncüsü neredeyse susmuş. Nara onun izini takip etti. Ben geri dönüp sizi arayacaktım.”',
        'Ada yanına yüzdü. “O zaman artık birlikte arayacağız.” Mira karanlık geçide baktı. “Orası korkutucu görünüyor. Ama karanlık olan her yer boş değildir. Biraz dinlerseniz, içindeki hayatı fark edersiniz.” Üçümüz yan yana durduk. Artık yalnızca ayak izlerini değil, duyulmayan bir sesi de takip edecektik.'
      ]},
      {title:'Karanlık geçitteki suyu dinle',type:'talk',x:3800,y:720,speaker:'Mira',heading:'Karanlığa alışmak',pages:[
        'Geçidin ağzında durduk. İlk bakışta önümde yalnızca koyu bir boşluk vardı. Bekleyince taşların kenarlarını, yukarıdaki dar açıklığı ve akıntının taşıdığı ince zerreleri seçmeye başladım. Gözlerimin alışması için suyun değil, benim biraz zamana ihtiyacım vardı.',
        'Mira yüzgecini hafifçe oynattı. “Bir sonraki havuzda duvarlar sesi geri verir. Kendi sesinle başkasının sesini karıştırabilirsin. Birbirimizden uzaklaşmayalım.” Ada yakın kalacağını söyledi. Sonra hiçbirimiz konuşmadık. Birlikte, birbirimizin hareketini izleyerek karanlığa girdik.'
      ]}
    ]},
    {name:'Derin Sessizlik',subtitle:'Görmeden de yol bulmak',art:'cave',grade:'rgba(3,9,35,.40)',flow:37,npc:'Mira',npcAt:[890,890],friend:null,stages:[
      {title:'Mira’nın işaret ettiği duvarı dinle',type:'talk',x:890,y:890,speaker:'Mira',heading:'Yankının ardındaki hayat',pages:[
        'Duvarın kenarında suyu dinlerken kendi hareketlerimizin sesi bize geri dönüyordu. Mira, “Bu yankı,” dedi. “Aradığımız ses daha aşağıdan geliyor. Çok küçük ama düzenli. Taşların arasından geçen su gibi.” Ada kuyruğunu oynatmayı bıraktı. Ben de bıraktım. O zaman duydum.',
        'Ses bir çağrı değildi; yalnızca hâlâ akmakta olan suyun iziydi. Bazen birini bulmak için onun yardım istemesini beklememek gerektiğini düşündüm. Mira daha derindeki düz kayayı gösterdi. Orada akıntı yavaşlıyor, suyun içindeki ince çizgiler daha kolay seçiliyordu. Biraz dinlenip gözlerimizi alıştıracaktık.'
      ]},
      {title:'Düz kayada soluklan ve dinle',type:'rest',x:1740,y:1200,speaker:'Ada',heading:'Burada da bir dünya var',pages:[
        'Ada, kayadaki küçük bir çatlağı gösterdi. İçinde soluk renkli bir yaprak birikmişti. “Bunun buraya gelmesi ne kadar sürmüştür?” diye sordu. Cevabı bilmiyordum. Üçümüz de yaprağa baktık. Evimizdeki bir ağacın parçası, hiç görmediğimiz bu yerde duruyordu.',
        'Mira, geçidin ilerisindeki üç küçük oyukta aynı türden yapraklar gördüğünü söyledi. Bunlar ana kaynağın eski yolunu gösterebilirdi. Oyuğun biri yukarıda, biri dipte, biri ise uzak duvardaydı. Her birinde neyin biriktiğini inceleyip suyun nereden geldiğini anlayacaktık. Küçük şeyler bazen en uzun yolu anlatır.'
      ]},
      {title:'Üç oyuktaki izleri incele',type:'search',x:2750,y:930,speaker:'Axo',heading:'Yaprak, kum ve kabuk',pages:[
        'Birinci oyukta yaprak, ikincisinde açık renkli kum, üçüncüsünde ince bir kabuk parçası buldum. Hepsi farklı yerlerden gelmiş ama aynı dar geçitte birikmişti. Bir zamanlar burada güçlü bir su yolu olmalıydı. Şimdi yolun yalnızca en ince çizgisi kalmıştı.',
        'Mira duvarın ardındaki serinliği hissetti. “Kaynak hâlâ var,” dedi. “Sadece yolunu değiştirmiş.” Ada beyaz kabuğa yaklaştı. “Nara bunu tanır. Benimkilerden biri.” Üç küçük buluntu bir araya gelince karanlık, bilinmeyen bir yer olmaktan çıktı. Arkadaşımızın geçtiği bir yola dönüştü.'
      ]},
      {title:'Yüzeyden gelen ışığa yaklaş',type:'talk',x:3710,y:710,speaker:'Axo',heading:'Bir başka gökyüzü',pages:[
        'Uzakta önce bir çizgi, sonra geniş bir ışık gördüm. Suya baktığım için güneşin çoktan alçaldığını fark etmemiştim. Işık artık yeşil değil, gümüş gibiydi. Ada ile Mira yanıma geldi. İkisi de bir süre açıklığa bakıp hiçbir şey söylemedi.',
        'Yolun bizi evimizden uzaklaştırdığını düşünmüştüm. Oysa her yeni yerde eve ait bir şey buluyorduk: yapraklarımız, kabuklarımız, suyumuz. Açıklığın ötesinden küçük bir kuyruk izi geçti. Bu kez beklemedik ama acele de etmedik. Birlikte, gümüş ışığın altına yüzdük.'
      ]}
    ]},
    {name:'Ay Suyu',subtitle:'Son dosta ulaşmak',art:'forest',grade:'rgba(15,33,72,.40)',flow:18,npc:'Nara',npcAt:[920,740],friend:'Nara',stages:[
      {title:'Gümüş ışığın altında Nara’yı bul',type:'talk',x:920,y:740,speaker:'Nara',heading:'En uzak soru',pages:[
        'Nara önce Mira’yı, sonra Ada’yı, en son beni gördü. Üçümüze birden yetişmeye çalışırken kendi kuyruğuna dolanacak gibi oldu. “Kaynağı buldum,” dedi. “Ama sandığımız yerde değil. Büyük kök devrilmiş, su başka bir aralıktan geliyor. Eski yatağa dönmek için iki kola daha bağlanması gerekiyor.”',
        'Onu dinlerken ne kadar yorulduğunu gördüm. Sorularını hiç bitirmeyen Nara bile cümlesinin ortasında durmuştu. Ada hemen yanına gitti. “Önce bir şey yiyelim,” dedi. Ben de çevredeki küçük yiyecekleri aramaya başladım. Kaynak bekleyebilirdi. Nara bizi bütün gün beklemişti.'
      ]},
      {title:'Nara’ya 3 lokma getir',type:'feed',x:920,y:740,speaker:'Nara',heading:'Cevaptan önce',pages:[
        'Nara yiyecekleri yavaşça yedi. “Geri dönemeyeceğim sandım,” dedi. “Sonra suya karışan bir beyaz kabuk buldum. Ada’nın kabuğuydu. Onu görünce sizden çok uzakta olmadığımı düşündüm.” Ada küçük kabuk parçasına baktı, sonra gülümsedi.',
        'Mira, “Bazen bir işaret, işaret olduğunu bile bilmez,” dedi. Nara toparlanınca bizi kaynağın yakınındaki geniş çanağa götürmeyi önerdi. Çanakta su sakin, kökler seyrek olacaktı. Bu kez önden birimiz değil, dördümüz birlikte gidecektik. Ne kadar hızlı olduğumuzun hiç önemi yoktu.'
      ]},
      {title:'Nara ile geniş çanağa yüz',type:'escort',x:3070,y:1180,speaker:'Nara',heading:'Dört gölge',pages:[
        'Çanağın kumuna dört gölge düştü. Yüzeydeki dalgalar gölgeleri uzatıp kısaltıyordu. Nara bir süre onlara baktı. “Sabah burada yalnızca benim gölgem vardı.” Sonra benim yanıma geldi. Söyleyecek başka bir şeyi yoktu; bazen yan yana durmak, bir cümlenin yapabileceğinden fazlasını yapar.',
        'Çanağın doğusunda suyun serinliği belirginleşti. Ana kaynak çok yakındı. Nara üç kolun yerini gösterdi: önce sığ damlacık, sonra taş altındaki sızıntı, en son kökün ardındaki geniş dere. Taşların öğrettiği sırayı hatırladım. Kaynağı bulmuştuk; şimdi onun eve giden yolunu yeniden açacaktık.'
      ]},
      {title:'Kaynağın girişini incele',type:'talk',x:3730,y:800,speaker:'Axo',heading:'Dönüş yolu',pages:[
        'Girişin önünde dörtümüz de durduk. Su buradan çıkıyor ama iki yan kola ulaşamıyordu. Devrilen kökün ince dalları aralıkları kapatmıştı. Büyük bir şeyi yerinden oynatamazdık. Buna gerek de yoktu; suya küçük, doğru bir aralık açmak yeterli olabilirdi.',
        'Eve giden yolun tek bir yolu olmadığını şimdi anlıyordum. Kökler değişebilir, taşlar kayabilir, akıntılar başka yönlere dönebilirdi. Biz de onları dinlemeyi öğrenebilirdik. Arkadaşlarıma baktım. Hazırdık. Son geçidin ötesine, suyun başladığı yere birlikte yüzdük.'
      ]}
    ]},
    {name:'Suyun Eve Dönüşü',subtitle:'Bir yolun yeniden başlaması',art:'cave',grade:'rgba(25,85,81,.03)',flow:20,npc:'Nara',npcAt:[950,950],friend:null,stages:[
      {title:'Kaynağın çevresindeki yolu incele',type:'talk',x:950,y:950,speaker:'Mira',heading:'Bir kahraman gerekmiyordu',pages:[
        '“Burada savaşacak bir şey yok,” dedi Mira. “Yalnızca birbirine ulaşamayan sular var.” Kaynağın çevresini dolaştık. Devrilen kökün altında ince dallar, taşların arasında yapraklar birikmişti. Ne lagün bize kızmıştı ne de bir karanlık onu ele geçirmişti. Bir yol kapanmıştı; birlikte başka bir yol bulacaktık.',
        'Ulu’nun sözlerini hatırladım. Önce damla, sonra sızıntı, en son dere. Bu sırayla üç ağza yaklaşarak suyun yeniden birbirini bulmasını sağlayacaktım. Ada, Mira ve Nara yanımda duruyordu. Evden çıkarken aradığım şey arkadaşlarımdı. Şimdi arkadaşlarımla birlikte eve dönen bir akıntıyı arıyordum.'
      ]},
      {title:'Üç kolu yeniden birbirine bağla',type:'puzzle',x:2310,y:930,speaker:'Axo',heading:'Yeni bir eski yol',pages:[
        'Son ağzın önündeki yaprakları araladığımda kum çizgileri birleşti. Su önce hafifçe, sonra daha kararlı bir şekilde eski yatağa doğru dönmeye başladı. Büyük kök hâlâ yerindeydi. Manzara değişmemişti belki, ama akıntının yönü değişmişti. Bazen bir dünyayı onarmak böyle küçük görünür.',
        'Nara kuyruğunu sevinçle salladı; Ada’nın beyaz kabuğu yeniden hareket etti. Mira hiçbir şey söylemeden gözlerini kapattı. Üç ses artık birbirine cevap veriyordu. Hemen yola çıkmadık. Kaynağın yanındaki düz taşı bulup bu yeni sesi bir süre dinlemek istedik. Eve dönecek suyu aceleye getirmeyecektik.'
      ]},
      {title:'Dostlarınla kaynağın yanında dinlen',type:'rest',x:3320,y:1190,speaker:'Ada',heading:'Yan yana kalmak',pages:[
        'Ada yanıma küçük beyaz kabuğunu bıraktı. Nara düz, koyu bir taş getirdi. Mira yalnızca suyu dinledi. Ben de köklerin altında bulduğum ince yaprağı taşın kenarına yerleştirdim. Birlikte geçirdiğimiz yolun küçük bir izi oluşmuştu. Onu kimsenin görmesi gerekmiyordu; bizim hatırlamamız yeterliydi.',
        '“Eve dönünce ne anlatacaksın?” diye sordu Ada. Bir süre düşündüm. Çok uzaklara yüzmüştük ama aklımda kalan şey uzaklık değildi. Beklediğimiz anlar, birbirimizi bulduğumuz köşeler ve suyun değişen sesi vardı. Belki bunlardan yalnızca birini seçmek gerekmiyordu. Yine de bu yolculuğun ilk hatırasını ben seçecektim.'
      ]},
      {title:'Bu yolculuğun hatırasını seç',type:'ending',x:3780,y:800,speaker:'Axo',heading:'Suyun hatırladığı',pages:[
        'Yüzeyde sabahın ilk ışığı görünüyordu. Bir gün ve bir gece geçmişti. Eve giderken akıntı yanımızda olacaktı. Bir zamanlar yalnızca kendi taşımı, kendi kökümü, kendi yolumu biliyordum. Şimdi lagünün başka kıyılarında da kendimden bir iz vardı.',
        'Arkadaşlarım yanımda bekledi. Yolculuk bitmişti ama lagün bitmemişti. İster eve dönebilir, ister bildiğimiz yerleri yeniden ziyaret edebilirdik. Bu kez kimse kayıp değildi. Bu yolculuktan ilk olarak neyi hatırlamak istediğimi düşündüm: bizi taşıyan suyun sesini mi, yanımda yüzen dostlarımı mı?'
      ]}
    ]}
  ],
  endings:{
    water:['Gözlerimi kapattım. Kaynağın sesi, taşların arasındaki yankıyla ve evimizin sazlarıyla birleşti. Dünyanın bir dili vardı; onu anlamak için daha yüksek sesle konuşmak değil, bazen daha sessiz kalmak gerekiyordu. Artık yeni bir yere gittiğimde önce suyu dinleyecektim.','Dördümüz yola çıktık. Kimse öne geçmedi. Akıntı bizi taşırken yol boyunca gördüğüm her küçük şeyi hatırlamaya çalışmadım. Bazılarını unutabilirdim. Ama suyun bizi yeniden birbirimize götürdüğünü unutmayacaktım.'],
    friends:['Ada’nın, Mira’nın ve Nara’nın gölgelerine baktım. Yola çıktığımda tek bir gölgem vardı. Şimdi dört gölge aynı kuma düşüyordu. Birini bulmak, onu bir yerden çıkarmak değildi yalnızca. Bazen onun hızına inmek, sorusunu dinlemek, yorulduğunda yanında durmaktı.','Dördümüz yola çıktık. Kimse öne geçmedi. Eve döneceğimiz için değil, birlikte döneceğimiz için sevindim. Lagün ertesi gün yine değişebilirdi. Bir kök daha devrilebilir, bir akıntı başka yöne dönebilirdi. Ama artık birbirimizi nasıl arayacağımızı biliyorduk.']
  }
};
