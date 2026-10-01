'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const canvas = $('world'), ctx = canvas.getContext('2d', {alpha:false});
  const map = $('minimap'), mctx = map.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const W = 2400, H = 1350;
  const rand = (a,b) => a + Math.random() * (b-a);
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const lerp = (a,b,t) => a+(b-a)*t;
  const image = source => {const im=new Image();im.src=source;return im;};
  const art = {background:image('lagoon.png'), sheet:image('creatures.png'), axo:image('axolotl.png')};
  const crops = {jelly:[40,20,555,655], fish:[635,95,615,490], pearl:[25,675,585,540], baby:[625,695,625,510]};
  const content=window.LagoonExpansion,chapters=content.chapters;
  const colors=['#ffe0a1','#ffb7db','#a6e8ff','#c6bdff','#a6f2cf'];
  let width=1280,height=720,scale=1,viewW=1280,viewH=850,last=0,time=0,accumulator=0,ready=false;
  let mode='menu',playMode='adventure',chapter=0,score=0,totalRescues=0,runTime=0,sprintLeft=60;
  let pearls=0,rescues=0,kills=0,combo=0,comboTimer=0,xp=0,level=1,nextXP=150,damage=20,speedBonus=0;
  let player={x:470,y:720,vx:0,vy:0,face:1,hp:100,maxHp:100,energy:100,inv:0,dash:0,fire:0};
  let camera={x:1000,y:650},keys=new Set(),joystick={x:0,y:0},joyPointer=null,shootHeld=false;
  let enemies=[],collectibles=[],shots=[],hostileShots=[],particles=[],texts=[],followers=[],ghosts=[],boss=null;
  let portal={x:2130,y:680,open:false},shake=0,flash=0,bannerUntil=0,toastUntil=0,hudAt=0,ambientAt=0,transition=0;
  let sound=false,audio=null,master=null,best=0,spawnTick=0;
  let stage=0,stageCount=0,stageKills=0,stageHits=0,stageElapsed=0,stageAwarded=false,completedStages=0;
  let abilityRanks=[0,0,0,0,0,0],difficulty=1,comfort=1,buffs={},shieldCharges=0;
  let powerDrops=[],powerTimer=7,eventTimer=22,event=null,lastEvent=-1,lastPower='',eventSerial=0,eventCollected=0;
  let decor=[],shotSerial=0,popAt=0,checkpoint=null;
  let defenceTime=0,reinforceTimer=9,surgeTimer=35,surgeLeft=0,enemySerial=0;
  let friendHelpUsed=false,friendHelpTimer=12,healingTrails=[];
  const checkpointKey='axolotl-adventure-v6';
  try{checkpoint=readCheckpoint(JSON.parse(localStorage.getItem(checkpointKey)));}catch{}
  try {best=Number(localStorage.getItem('axolotl-best-v2'))||0;} catch {}

  function resize(){width=canvas.clientWidth||innerWidth;height=canvas.clientHeight||innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);scale=height/850;viewH=850;viewW=width/scale;ctx.setTransform(dpr,0,0,dpr,0,0);if(['playing','paused','upgrade'].includes(mode)){camera.x=player.x;camera.y=player.y;boundCamera();setControls(true);}}
  new ResizeObserver(resize).observe(canvas);resize();
  function boundCamera(){camera.x=clamp(camera.x,Math.min(viewW/2,W/2),Math.max(W-viewW/2,W/2));camera.y=clamp(camera.y,viewH/2,H-viewH/2);}
  function tone(freq,duration=.16,type='sine',volume=.035,end=freq){if(!sound)return;try {audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();if(!master){master=audio.createGain();master.gain.value=.55;master.connect(audio.destination);}const osc=audio.createOscillator(),gain=audio.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(Math.max(30,end),audio.currentTime+duration);gain.gain.setValueAtTime(.001,audio.currentTime);gain.gain.linearRampToValueAtTime(volume,audio.currentTime+.015);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.connect(gain);gain.connect(master);osc.start();osc.stop(audio.currentTime+duration+.03);}catch{}}
  function chime(){tone(659,.2);setTimeout(()=>tone(880,.32),90);}
  function toast(message){$('toast').textContent=message;$('toast').style.opacity='1';toastUntil=time+3.5;}
  function banner(title,subtitle){$('banner-title').textContent=title;$('banner-small').textContent=subtitle;$('region-banner').style.opacity='1';bannerUntil=time+2.4;}
  function clearInput(){keys.clear();joystick.x=0;joystick.y=0;shootHeld=false;joyPointer=null;$('stick').style.transform='translate(0px,0px)';}
  function burst(x,y,color,count=16,power=100){for(let i=0;i<count;i++){const angle=rand(0,Math.PI*2),v=rand(power*.2,power);particles.push({x,y,vx:Math.cos(angle)*v,vy:Math.sin(angle)*v,life:rand(.4,1),max:1,r:rand(1.5,4),color});}if(particles.length>350)particles.splice(0,particles.length-350);}
  function floatText(x,y,text,color='#ceffe4'){texts.push({x,y,text,color,life:1.3});if(texts.length>45)texts.shift();}
  function addScore(value,x,y,color='#ceffe4',word=''){combo++;comboTimer=6;const multiplier=Math.min(5,1+Math.floor(combo/6))*(buffs.double>0?2:1),points=Math.round(value*multiplier);score+=points;floatText(x,y,'+'+points+(multiplier>1?' ✦':''),color);if(word&&combo%3===1)floatText(x,y-27,word,color);return points;}
  function gainXP(value){xp+=value;}
  function setControls(visible){$('hud').hidden=!visible;$('minimap-wrap').hidden=!visible;$('hint').hidden=!visible;$('pause').hidden=!visible;$('power-strip').hidden=!visible;$('event-status').hidden=!visible;$('goal-guide').hidden=!(visible&&mode==='playing');$('touch').hidden=!(visible&&mode==='playing'&&(coarse||width<700));$('sprint-timer').hidden=!(visible&&playMode==='sprint');}
  function showDialog(kicker,title,copy,button,kind){$('dialog-kicker').textContent=kicker;$('dialog-title').textContent=title;$('dialog-copy').textContent=copy;$('dialog-main').textContent=button;$('dialog-main').hidden=kind==='upgrade';$('results').hidden=true;$('upgrade-options').hidden=kind!=='upgrade';$('dialog').hidden=false;}
  function stageSpec(){return playMode==='sprint'?{name:'Renkli akıntı',type:'sprint',goal:6,copy:'60 saniyede olabildiğince çok ışık topla.'}:chapters[chapter].stages[stage];}
  function readCheckpoint(s){if(!s||s.version!==6||s.completed||!Number.isInteger(s.chapter)||s.chapter<0||s.chapter>=chapters.length||!Number.isInteger(s.stage)||s.stage<0||s.stage>=chapters[s.chapter].stages.length||!Array.isArray(s.ranks)||s.ranks.length!==6||s.ranks.some(v=>!Number.isInteger(v)||v<0||v>5))return null;return {...s,friendHelpUsed:s.friendHelpUsed===true,score:clamp(Number(s.score)||0,0,1e9),xp:clamp(Number(s.xp)||0,0,1e6),totalRescues:clamp(Number(s.totalRescues)||0,0,4),comfort:clamp(Number(s.comfort)||1,.9,1.12),friends:Array.isArray(s.friends)?[...new Set(s.friends.filter(n=>['Ada','Mira','Nara','Pofuduk'].includes(n)))].slice(0,4):[]};}
  function saveCheckpoint(){if(playMode!=='adventure')return;const s={version:6,chapter,stage,friendHelpUsed,ranks:[...abilityRanks],score,xp,totalRescues,comfort,friends:followers.map(f=>f.name)};try{localStorage.setItem(checkpointKey,JSON.stringify(s));checkpoint=s;$('continue-run').hidden=false;}catch{}}
  function computeDifficulty(){return playMode==='sprint'?.5:stageSpec().intensity;}
  function deriveAbilities(){player.maxHp=100+abilityRanks[0]*25;damage=Math.min(95,Math.round(20*Math.pow(1.35,abilityRanks[1])));speedBonus=Math.min(120,abilityRanks[2]*28);level=1+abilityRanks.reduce((a,b)=>a+b,0);nextXP=150+(level-1)*70;}
  function createEnemy(i,near=false){const pool=playMode==='sprint'?['fish','jelly']:chapters[chapter].pool,type=pool[i%pool.length],stats={fish:[75,165],jelly:[65,90],darter:[70,125],spitter:[95,105],guard:[180,120]}[type],hp=Math.round(stats[0]*(.5+.5*difficulty));let x,y;for(let tries=0;tries<16;tries++){const a=rand(-Math.PI,Math.PI),r=rand(near?430:550,near?700:1050);x=clamp(player.x+Math.cos(a)*r,140,W-140);y=clamp(player.y+Math.sin(a)*r,220,H-140);if(Math.hypot(x-player.x,y-player.y)>360)break;}return {x,y,type,hp,maxHp:hp,speed:stats[1],phase:rand(0,7),hit:0,vx:0,vy:0,attack:rand(2.4,4.5),windup:0,charge:0,aimX:0,aimY:0,reward:Math.round(65+chapter*18+stats[0]*.3)};}
  function buildChapter(continuing=false){
    const s=stageSpec(),mirror=stage%2===1,px=x=>mirror?W-x:x;
    pearls=0;rescues=0;stageCount=0;stageKills=0;stageHits=0;stageElapsed=0;stageAwarded=false;defenceTime=0;
    collectibles=continuing?collectibles.filter(i=>i.alive&&!i.quest):[];boss=null;portal={x:2140,y:680,open:false};
    if(!continuing){shots=[];hostileShots=[];particles=[];texts=[];ghosts=[];buffs={};shieldCharges=0;powerDrops=[];powerTimer=12;event=null;eventTimer=rand(30,45);eventCollected=0;reinforceTimer=9;surgeTimer=rand(38,48);surgeLeft=0;enemySerial=0;friendHelpTimer=12;healingTrails=[];player.x=420;player.y=700;player.vx=0;player.vy=0;player.inv=3.5;player.energy=100;camera.x=player.x;camera.y=player.y;boundCamera();followers.forEach((f,i)=>{f.x=player.x-(i+1)*72;f.y=player.y+20;f.fire=rand(.4,1.4);});}
    difficulty=computeDifficulty();
    const enemyCount=playMode==='sprint'?6:s.type==='guardian'?5:Math.max(3,Math.round(14*difficulty));
    enemies=continuing?enemies.filter(e=>e.hp>0).slice(0,enemyCount):[];while(enemies.length<enemyCount)enemies.push(createEnemy(enemySerial++));
    const places=Array.from({length:30},(_,i)=>[350+(i%6)*330,300+Math.floor(i/6)*205]);
    if(['pearls','sprint'].includes(s.type))for(let i=0;i<s.goal;i++){const [x,y]=places[(i*7)%places.length],tier=(i+chapter+stage)%3;collectibles.push({x:px(x)+rand(-42,42),y:y+rand(-32,32),kind:'pearl',phase:i,alive:true,quest:true,value:[110,160,220][tier],color:colors[(i+chapter)%colors.length]});}
    if(s.type==='rescue')collectibles.push({x:px(1720),y:620,kind:'baby',phase:2,alive:true,quest:true,name:s.friend});
    if(['relay','rings'].includes(s.type))for(let i=0;i<s.goal;i++)collectibles.push({x:px(620+i*(1380/(s.goal-1))),y:660+Math.sin(i*1.8+chapter)*260,kind:s.type==='relay'?'lantern':'ring',order:i,phase:i,alive:true,quest:true,color:chapters[chapter].color});
    if(s.type==='stars')for(let i=0;i<s.goal;i++)collectibles.push({x:px(620+i*(1350/(s.goal-1))),y:620+Math.sin(i*1.3+chapter)*300,kind:'star',phase:i,alive:true,quest:true,value:70+(i%3)*35,color:colors[i%colors.length]});
    if(s.type==='guardian'&&s.friend&&!followers.some(f=>f.name===s.friend))collectibles.push({x:760,y:780,kind:'baby',phase:2,alive:true,quest:false,name:s.friend});
    if(!continuing)for(let i=0;i<12;i++)collectibles.push({x:rand(300,W-280),y:rand(250,H-170),kind:i<3?'food':'gem',phase:rand(0,7),alive:true,value:40+(i%4)*20,color:colors[i%colors.length]});
    decor=Array.from({length:34},(_,i)=>({x:100+i*67+(chapter%3)*17,y:1170+Math.sin(i*1.8+chapter)*58,size:16+(i%4)*5,phase:i*.9}));
    if(s.type==='guardian')spawnBoss();else $('boss-hud').hidden=true;
    banner(s.name,('0'+(chapter+1))+' / '+('0'+chapters.length)+' · GÖREV '+(stage+1)+' / '+chapters[chapter].stages.length);
    toast(chapter===0&&stage===0?(coarse||width<700?'Sol kontrolle yüz. AT baloncuk gönderir; ATIL tehlikeden sıyrılır.':s.copy+' Boşluk ile baloncuk, Shift ile atıl.') :s.copy);
    saveCheckpoint();updateHUD();
  }
  function start(which='adventure',resume=false){
    if(!ready)return;if(!['adventure','sprint'].includes(which))throw new Error('Geçersiz oyun modu');playMode=which;mode='playing';accumulator=0;chapter=0;stage=0;score=0;totalRescues=0;kills=0;combo=0;comboTimer=0;xp=0;level=1;nextXP=150;damage=20;speedBonus=0;runTime=0;sprintLeft=60;transition=0;completedStages=0;comfort=1;abilityRanks=[0,0,0,0,0,0];friendHelpUsed=false;followers=which==='adventure'?[{name:'Ada',x:350,y:720,phase:0,fire:1.4,cheer:1}]:[];lastEvent=-1;lastPower='';eventSerial=0;shotSerial=0;
    player={x:420,y:700,vx:0,vy:0,face:1,hp:100,maxHp:100,energy:100,inv:0,dash:0,fire:0};
    if(resume&&which==='adventure'&&checkpoint){const s=readCheckpoint(checkpoint);if(s){chapter=s.chapter;stage=s.stage;abilityRanks=[...s.ranks];score=s.score;xp=s.xp;totalRescues=s.totalRescues;comfort=s.comfort;completedStages=chapter*3+stage;friendHelpUsed=s.friendHelpUsed;followers=s.friends.map((name,i)=>({name,x:player.x,y:player.y,phase:i,fire:1}));deriveAbilities();player.hp=player.maxHp;}}
    else if(which==='adventure'&&checkpoint){try{localStorage.setItem(checkpointKey+'-previous',JSON.stringify(checkpoint));}catch{}}
    clearInput();buildChapter();$('menu').hidden=true;$('dialog').hidden=true;setControls(true);canvas.focus({preventScroll:true});chime();updateHUD();
  }
  function home(){mode='menu';clearInput();$('dialog').hidden=true;$('menu').hidden=false;setControls(false);$('boss-hud').hidden=true;$('region-banner').style.opacity='0';$('toast').style.opacity='0';camera={x:1050,y:650};$('continue-run').hidden=!checkpoint;}
  function resumeGameplay(){mode='playing';clearInput();$('dialog').hidden=true;setControls(true);canvas.focus({preventScroll:true});}
  function pause(){if(mode==='playing'){mode='paused';clearInput();setControls(true);showDialog('MOLA','Sular sakinleşsin.','Hazır olduğunda devam et. Ana menüye dönersen bu aşamanın başındaki kayıt noktasından başlayabilirsin.','Devam et','pause');$('dialog-main').focus({preventScroll:true});}else if(mode==='paused')resumeGameplay();}
  function finish(won){mode=won?'won':'lost';clearInput();if(score>best){best=score;try{localStorage.setItem('axolotl-best-v2',String(best));}catch{}}setControls(false);$('boss-hud').hidden=true;
    if(!won&&playMode==='adventure'&&checkpoint){checkpoint={...checkpoint,comfort:clamp(checkpoint.comfort-.035,.9,1.12)};try{localStorage.setItem(checkpointKey,JSON.stringify(checkpoint));}catch{}}
    const title=playMode==='sprint'&&won?'Akıntıyı yakaladın.':won?'Lagün yeniden ışıldıyor.':'Birlikte yeniden deneyelim.';
    const copy=playMode==='sprint'&&won?'60 saniyelik rengârenk dalış tamamlandı. Yeni bir akıntıda yeni sürprizler var.':won?'Üç bölgeyi ve dokuz alt seviyeyi dostlarınla tamamladın. Lagün şimdi rengârenk! Lagünün ışıkları birlikte daha güzel.':'Dostların yanında. Kayıt noktasından bu alt seviyeyi yeniden deneyebilirsin.';
    if(won&&playMode==='adventure'){try{localStorage.setItem(checkpointKey,JSON.stringify({...checkpoint,completed:true}));checkpoint=null;}catch{}}
    showDialog(won?'YOLCULUK TAMAMLANDI':'YENİ BİR DALIŞ',title,copy,!won&&checkpoint&&playMode==='adventure'?'Kayıt noktasından dene':'Yeniden oyna','end');$('results').hidden=false;$('results').innerHTML='<div><b>'+score+'</b><span>Puan</span></div><div><b>'+best+'</b><span>En iyi</span></div><div><b>'+totalRescues+'</b><span>Kurtarılan dost</span></div>';tone(won?880:220,.5);$('dialog-main').focus({preventScroll:true});
  }
  const upgrades=[
    {symbol:'✚',name:'Yaşamın ışığı',copy:'+25 azami can ve 25 can iyileşme'},
    {symbol:'◉',name:'Güçlü baloncuk',copy:'Baloncukların gücü artar'},
    {symbol:'≈',name:'Akıntının çocuğu',copy:'Daha hızlı yüz; atılma enerjini doldur'},
    {symbol:'✿',name:'Köpük ritmi',copy:'Baloncukları daha sık gönder'},
    {symbol:'⌁',name:'Hazine kokusu',copy:'Yakındaki puanları daha uzaktan topla'},
    {symbol:'♡',name:'Dost eli',copy:'Dostlarının küçük baloncukları biraz güçlensin'}
  ];
  let offered=[];
  function offerUpgrade(){mode='upgrade';clearInput();setControls(true);showDialog('SEVİYE '+(level+1),'İçindeki ışık büyüyor.','Bir güç seç. Sonraki aşamanın zorluğu yeteneklerin ve ilerleyişinle dengelenir.','','upgrade');$('upgrade-options').innerHTML='';const pool=upgrades.map((_,i)=>i).filter(i=>abilityRanks[i]<5);offered=level===1?[0,1,2]:pool.sort((a,b)=>((a+level*3)%6)-((b+level*3)%6)).slice(0,3);if(player.hp<player.maxHp*.55&&pool.includes(0)&&!offered.includes(0))offered[0]=0;if(!offered.length){xp=0;resumeGameplay();return;}offered.forEach((i,n)=>{const u=upgrades[i],b=document.createElement('button');b.innerHTML='<b>'+u.symbol+'</b><span><strong>'+u.name+'</strong><small>'+u.copy+'</small></span>';b.onclick=()=>chooseUpgrade(i);$('upgrade-options').appendChild(b);if(n===0)b.focus({preventScroll:true});});}
  function chooseUpgrade(index){if(mode!=='upgrade'||!Number.isInteger(index)||!offered.includes(index))throw new Error('Geçersiz güç seçimi');xp=Math.max(0,xp-nextXP);abilityRanks[index]++;deriveAbilities();if(index===0)player.hp=Math.min(player.maxHp,player.hp+25);if(index===2)player.energy=100;resumeGameplay();burst(player.x,player.y,'#fff0ad',30,180);chime();toast(upgrades[index].name+' kazanıldı.');updateHUD();}
  function dash(){const cost=buffs.hurry>0?20:40;if(mode!=='playing'||player.energy<cost||player.dash>0)return;let dx=joystick.x+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),dy=joystick.y+(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);if(!dx&&!dy){dx=player.face;dy=0;}const length=Math.hypot(dx,dy);player.vx=dx/length*880;player.vy=dy/length*880;player.energy-=cost;player.dash=.27;player.inv=Math.max(player.inv,.35);burst(player.x,player.y,'#8fffe6',14,110);tone(230,.18,'sine',.022,100);}
  function nearestEnemy(origin,range=650){const candidates=enemies.filter(e=>e.hp>0&&dist(e,origin)<range);if(boss&&boss.hp>0&&dist(boss,origin)<range+120)candidates.push(boss);return candidates.sort((a,b)=>dist(a,origin)-dist(b,origin))[0];}
  function sendBubble(origin,target,strength,friend=false,angleOffset=0){const a=Math.atan2(target?target.y-origin.y:0,target?target.x-origin.x:player.face)+angleOffset,speed=friend?470:640;shots.push({x:origin.x+Math.cos(a)*32,y:origin.y+Math.sin(a)*32,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:friend?1.35:1.5,r:friend?8:12,damage:strength,friend,friendStyle:friend?origin.name:null,color:friend?({Ada:'#a7ffe0',Mira:'#ffc1de',Nara:'#bfd9ff',Pofuduk:'#e1c5ff'}[origin.name]||'#ffc8e5'):colors[shotSerial++%colors.length],phase:rand(0,7)});}
  function fire(){if(mode!=='playing'||player.fire>0)return;player.fire=Math.max(.17,.3-abilityRanks[3]*.025);const target=nearestEnemy(player);if(buffs.rainbow>0)[-.15,0,.15].forEach(a=>sendBubble(player,target,Math.round(damage*.65),false,a));else sendBubble(player,target,damage);if(target)player.face=target.x>player.x?1:-1;tone(570+shotSerial%4*45,.11,'sine',.018,270);}
  function hurt(amount){if(player.inv>0||mode!=='playing')return;if(buffs.shield>0&&shieldCharges>0){shieldCharges--;player.inv=.55;burst(player.x,player.y,'#bdeeff',18,130);floatText(player.x,player.y-45,'Pof!', '#c9edff');tone(440,.16,'sine',.02,210);if(!shieldCharges)buffs.shield=0;return;}stageHits++;player.hp=Math.max(0,player.hp-amount);player.inv=1;shake=reduced?0:2+Math.round(2*difficulty);flash=.08;combo=0;comboTimer=0;burst(player.x,player.y,'#ffa5cf',20,140);tone(320,.12,'sine',.016,240);tryFriendHelp();if(player.hp<=0)finish(false);}
  function damageEnemy(e,amount){if(e.hp<=0)return;e.hp-=amount;e.hit=.18;burst(e.x,e.y,'#bbf7ff',8,70);if(e.hp<=0){kills++;stageKills++;addScore(e.reward||70,e.x,e.y,colors[kills%colors.length],'Köpük dostu!');gainXP(28);burst(e.x,e.y,e.type==='fish'?'#ffd386':'#cca6ff',22,140);if(runTime>popAt){popAt=runTime+.13;tone(390+Math.random()*120,.12,'sine',.02,650);}if(Math.random()<.55)collectibles.push({x:e.x,y:e.y,kind:Math.random()<.12?'food':'gem',alive:true,phase:0,value:65,color:colors[kills%5]});}}
  function collect(item){
    if(!item.alive)return;const s=stageSpec();if(['lantern','ring'].includes(item.kind)&&item.order!==stageCount)return;item.alive=false;
    if(item.quest)stageCount++;
    if(item.kind==='pearl'){pearls++;addScore(item.value||110,item.x,item.y,item.color,'Pırıl pırıl!');gainXP(25);burst(item.x,item.y,item.color||'#ffe9a2',22,150);tone([523,587,659,784,880][pearls%5],.18,'sine',.027);}
    else if(item.kind==='baby'){rescues++;totalRescues++;if(!followers.some(f=>f.name===item.name)&&followers.length<4)followers.push({name:item.name,x:item.x,y:item.y,phase:rand(0,7),fire:.7});addScore(350+chapter*45,item.x,item.y,'#ffb7d6','Birlikte!');gainXP(55);burst(item.x,item.y,'#ffb7d6',28,170);toast(item.name+' yanında! Minik baloncuklarıyla sana yardım ediyor.');chime();}
    else if(['lantern','ring'].includes(item.kind)){addScore(130+chapter*15,item.x,item.y,item.color,'Işık uyandı!');gainXP(22);burst(item.x,item.y,item.color,25,140);tone(330+item.order*75,.24,'sine',.027);}
    else if(item.kind==='food'){player.hp=Math.min(player.maxHp,player.hp+7);addScore(item.value||25,item.x,item.y,'#b7ffe1');gainXP(3);burst(item.x,item.y,'#b7ffe1',6,55);tone(700,.09,'sine',.012,1000);}
    else{addScore(item.value||85,item.x,item.y,item.color||'#ffdea4',item.kind==='party'?'Pof pof!':'Minik hazine!');gainXP(item.quest?8:3);burst(item.x,item.y,item.color||'#ffdea4',12,95);tone(650+(combo%5)*60,.12,'sine',.017,900);}
    if(item.eventToken&&event&&item.eventToken===event.token&&event.id==='trail'){eventCollected++;if(eventCollected===8){score+=600;floatText(player.x,player.y-45,'Yıldız yolu +600','#ffe4a6');toast('Sekiz yıldız, tek iz. +600 parıltı!');chime();}}
  }
  function spawnBoss(){const s=stageSpec(),hp=Math.round(900*difficulty);boss={x:1300,y:870,hp,maxHp:hp,phase:0,attack:2,hit:0,pattern:s.pattern,name:s.bossName};$('boss-name').textContent=s.bossName;$('boss-hud').hidden=false;}
  function objectiveDone(){const s=stageSpec();return (s.type==='combat'?stageKills:stageCount)>=s.goal&&stageKills>=(s.requiredKills||0)&&defenceTime>=(s.defend||0);}
  function completeStage(){if(stageAwarded||playMode!=='adventure')return;stageAwarded=true;completedStages++;const last=stage===chapters[chapter].stages.length-1;portal.open=last;const bonus=350+chapter*90+stage*65+(stageHits===0?200:0);score+=bonus;floatText(player.x,player.y-55,'Görev tamam! +'+bonus,chapters[chapter].color);burst(player.x,player.y,chapters[chapter].color,34,190);toast(last?'Bölge temizlendi. Tek geçit açıldı!':'Görev tamam. Aynı bölgede devam!');chime();if(stageHits>=4||player.hp<player.maxHp*.45)comfort=clamp(comfort-.035,.9,1.12);else if(stageHits===0)comfort=clamp(comfort+.025,.9,1.12);if(!last){stage++;buildChapter(true);}}
  function nextStage(){if(chapter===chapters.length-1){finish(true);return;}stage=0;chapter++;friendHelpUsed=false;player.hp=Math.min(player.maxHp,player.hp+15);transition=.6;clearInput();buildChapter();setControls(true);}
  function spawnPower(id){const pool=Object.keys(content.powers).filter(k=>k!==lastPower);id=id||pool[Math.floor(rand(0,pool.length))];const a=rand(-Math.PI,Math.PI),r=rand(190,280);powerDrops.push({id,x:clamp(player.x+Math.cos(a)*r,Math.max(180,camera.x-viewW/2+55/scale),Math.min(W-180,camera.x+viewW/2-55/scale)),y:clamp(player.y+Math.sin(a)*r,Math.max(250,camera.y-viewH/2+180/scale),Math.min(H-180,camera.y+viewH/2-130/scale)),ttl:id==='shield'?3.5:4.5,phase:rand(0,7)});lastPower=id;if(powerDrops.length>3)powerDrops.shift();}
  function takePower(drop){const p=content.powers[drop.id];buffs[drop.id]=p.duration;if(drop.id==='shield')shieldCharges=3;drop.ttl=0;burst(drop.x,drop.y,p.color,28,170);addScore(120,drop.x,drop.y,p.color,p.name);toast(p.name+' · '+p.duration+' sn · '+p.copy);tone(523,.23,'sine',.027,784);}
  function triggerEvent(index){const choices=content.events.map((_,i)=>i).filter(i=>i!==lastEvent);index=index??choices[Math.floor(rand(0,choices.length))];const config=content.events[index];event={...config,left:config.duration,token:++eventSerial};lastEvent=index;eventCollected=0;toast(config.name+'! '+config.copy);tone(440,.3,'sine',.027,880);
    event.x=player.x;event.y=player.y;if(['calm','current','shoal'].includes(config.id))return;const count=config.id==='trail'?8:config.id==='picnic'?2:12;
    for(let i=0;i<count;i++){const a=config.id==='trail'?(i/count-.5)*2.1:i/count*Math.PI*2,r=config.id==='trail'?100+i*35:rand(90,280);collectibles.push({x:clamp(player.x+Math.cos(a)*r,170,W-170),y:clamp(player.y+Math.sin(a)*r,250,H-160),kind:config.id==='picnic'?'food':config.id==='party'?'party':config.id==='rain'?'gem':'star',alive:true,phase:i,color:colors[i%5],value:config.id==='picnic'?35:70+i%4*25,ttl:config.duration,eventToken:event.token});}
  }
  function updateSurprises(dt){for(const k of Object.keys(buffs))buffs[k]=Math.max(0,buffs[k]-dt);powerTimer-=dt;eventTimer-=dt;if(powerTimer<=0){spawnPower();powerTimer=rand(28,40);}if(eventTimer<=0){triggerEvent();eventTimer=rand(28,40);}if(event){event.left-=dt;if(event.left<=0)event=null;}powerDrops.forEach(p=>{p.ttl-=dt;if(p.ttl>0&&dist(p,player)<48)takePower(p);});powerDrops=powerDrops.filter(p=>p.ttl>0);collectibles.forEach(i=>{if(i.ttl!==undefined){i.ttl-=dt;if(i.ttl<=0)i.alive=false;}});collectibles=collectibles.filter(i=>i.alive||i.quest);}
  function enemyVolley(e,count,speed){const predicted={x:player.x+player.vx*.28,y:player.y+player.vy*.28},base=Math.atan2(predicted.y-e.y,predicted.x-e.x);for(let i=0;i<count&&hostileShots.length<150;i++){const a=base+(i-(count-1)/2)*.22;hostileShots.push({x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:5,r:7,damage:Math.max(3,Math.round(12*difficulty))});}burst(e.x,e.y,'#ffcfab',5,40);}
  function updateThreats(dt){
    if(playMode!=='adventure'||portal.open)return;reinforceTimer-=dt;surgeTimer-=dt;surgeLeft=Math.max(0,surgeLeft-dt);
    if(surgeTimer<=0){surgeLeft=6+Math.round(difficulty*4);surgeTimer=rand(40,55);reinforceTimer=0;toast('Köpük dalgası! Birkaç yaramaz daha oyuna katıldı.');tone(440,.2,'sine',.015,660);}
    const baseline=stageSpec().type==='guardian'?5:Math.round(14*difficulty),cap=baseline+(surgeLeft>0?Math.ceil(difficulty*2):0);
    if(reinforceTimer<=0){reinforceTimer=surgeLeft>0?12:24-17*difficulty;const count=Math.min(cap-enemies.filter(e=>e.hp>0).length,Math.max(1,Math.round(3*difficulty)));for(let i=0;i<count;i++)enemies.push(createEnemy(enemySerial++,true));}
  }
  function tryFriendHelp(){
    if(playMode!=='adventure'||mode!=='playing'||friendHelpUsed||friendHelpTimer>0||!followers.length||player.hp<=0||player.hp>player.maxHp*.22)return false;
    friendHelpUsed=true;const f=followers.reduce((a,b)=>dist(a,player)<dist(b,player)?a:b),amount=Math.max(25,Math.round(player.maxHp*.28));player.hp=Math.min(player.maxHp,player.hp+amount);f.heal=1.5;f.cheer=1.5;healingTrails.push({x:f.x,y:f.y,life:1.2,color:'#b4ffe4'});burst(player.x,player.y,'#b4ffe4',22,90);floatText(player.x,player.y-48,'♡ +'+amount,'#b4ffe4');toast(f.name+' sana can verdi! Bu bölgede bir kez yardım edebilir.');tone(659,.3,'sine',.02,880);
    if(checkpoint){checkpoint={...checkpoint,friendHelpUsed:true};try{localStorage.setItem(checkpointKey,JSON.stringify(checkpoint));}catch{}}return true;
  }
  function update(dt){
    runTime+=dt;stageElapsed+=dt;friendHelpTimer=Math.max(0,friendHelpTimer-dt);tryFriendHelp();player.inv=Math.max(0,player.inv-dt);player.dash=Math.max(0,player.dash-dt);player.fire=Math.max(0,player.fire-dt);player.energy=Math.min(100,player.energy+dt*(buffs.hurry>0?30:18));comboTimer=Math.max(0,comboTimer-dt);if(!comboTimer)combo=0;
    if(playMode==='sprint'){sprintLeft=Math.max(0,sprintLeft-dt);if(!sprintLeft){finish(true);return;}}
    updateSurprises(dt);
    let dx=joystick.x+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),dy=joystick.y+(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);const length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}
    if(player.dash<=0){const speed=(260+speedBonus)*(buffs.hurry>0?1.35:1),current=event?.id==='current'?Math.sin(runTime*.8)*85:0;player.vx=lerp(player.vx,dx*speed+current,1-Math.exp(-dt*5.5));player.vy=lerp(player.vy,dy*speed+current*.2,1-Math.exp(-dt*5.5));}
    player.x=clamp(player.x+player.vx*dt,70,W-70);player.y=clamp(player.y+player.vy*dt,180,H-115);if(Math.abs(player.vx)>20)player.face=player.vx>0?1:-1;
    if(keys.has(' ')||shootHeld)fire();
    spawnTick+=dt;if(spawnTick>.05&&Math.hypot(player.vx,player.vy)>70){spawnTick=0;particles.push({x:player.x-player.face*45,y:player.y+rand(-12,12),vx:-player.vx*.12,vy:rand(-15,15),life:.65,max:.65,r:rand(1,3),color:buffs.hurry>0?'#ffe0c2':'#b4fff0'});if(player.dash>0)ghosts.push({x:player.x,y:player.y,face:player.face,life:.22});}
    camera.x=lerp(camera.x,player.x+player.vx*.22,1-Math.exp(-dt*3.2));camera.y=lerp(camera.y,player.y+player.vy*.16,1-Math.exp(-dt*3.2));boundCamera();
    collectibles.forEach(item=>{if(!item.alive)return;const special=['baby','ring','lantern'].includes(item.kind),d=dist(item,player);if(!special&&buffs.magnet>0&&d<260){const response=1-Math.exp(-dt*4);item.x=lerp(item.x,player.x,response);item.y=lerp(item.y,player.y,response);}const radius=special?(item.kind==='ring'?65:46):(item.kind==='food'?28:42)+abilityRanks[4]*14;if(dist(item,player)<radius)collect(item);});
    const slow=event?.id==='calm'?.58:1;
    updateThreats(dt);
    enemies.forEach(e=>{
      if(e.hp<=0)return;e.hit=Math.max(0,e.hit-dt);const d=dist(e,player),tx=(player.x-e.x)/(d||1),ty=(player.y-e.y)/(d||1),pressure=surgeLeft>0?1+.12*difficulty:1,sp=e.speed*(.6+.4*difficulty)*slow*pressure;
      e.attack-=dt*slow*pressure;
      if(e.type==='darter'){
        if(e.windup>0){e.windup=Math.max(0,e.windup-dt);e.vx*=Math.exp(-dt*8);e.vy*=Math.exp(-dt*8);if(e.windup===0){e.charge=.52;e.vx=e.aimX*(400+100*difficulty);e.vy=e.aimY*(400+100*difficulty);}}
        else if(e.charge>0){e.charge=Math.max(0,e.charge-dt);if(!e.charge)e.attack=3;}
        else if(e.attack<=0&&d<1000){e.windup=.95;e.aimX=tx;e.aimY=ty;}
        else{e.vx=lerp(e.vx,tx*sp,1-Math.exp(-dt*2.5));e.vy=lerp(e.vy,ty*sp,1-Math.exp(-dt*2.5));}
      }else if(e.type==='spitter'){
        const advance=d>480?1:d<320?-1:0,orbit=.25;e.vx=lerp(e.vx,(tx*advance-ty*orbit)*sp,1-Math.exp(-dt*2.5));e.vy=lerp(e.vy,(ty*advance+tx*orbit)*sp,1-Math.exp(-dt*2.5));if(e.attack<=0&&d<1050){enemyVolley(e,2,150+75*difficulty);e.attack=4.5-1.7*difficulty;}
      }else if(e.type==='jelly'){
        const approach=d>340?.9:.2,orbit=Math.sin(e.phase)>0?.55:-.55;e.vx=lerp(e.vx,(tx*approach-ty*orbit)*sp,1-Math.exp(-dt*2));e.vy=lerp(e.vy,(ty*approach+tx*orbit)*sp,1-Math.exp(-dt*2));if(difficulty>=.3&&e.attack<=0&&d<750){enemyVolley(e,1,115+80*difficulty);e.attack=5.5-2.3*difficulty;}
      }else{e.vx=lerp(e.vx,tx*sp,1-Math.exp(-dt*3));e.vy=lerp(e.vy,ty*sp,1-Math.exp(-dt*3));}
      e.x=clamp(e.x+e.vx*dt*slow,140,W-140);e.y=clamp(e.y+e.vy*dt*slow,220,H-140);
      if(dist(e,player)<(e.type==='guard'?58:e.type==='jelly'?38:47)){if(player.dash>0)damageEnemy(e,60);else hurt(Math.round((e.type==='darter'?24:e.type==='guard'?22:e.type==='jelly'?12:16)*difficulty));}
    });enemies=enemies.filter(e=>e.hp>0);if(mode!=='playing')return;
    if(boss&&boss.hp>0){boss.hit=Math.max(0,boss.hit-dt);boss.phase+=dt*slow;boss.x=1300+Math.sin(boss.phase*.6)*380;boss.y=650+Math.cos(boss.phase*.9)*220;boss.attack-=dt*slow;if(boss.attack<=0){boss.attack=boss.hp<boss.maxHp*.45?2.3:3.2;const base=Math.atan2(player.y-boss.y,player.x-boss.x),count=boss.pattern==='spiral'?5:boss.pattern==='fans'?3:5;for(let i=0;i<count;i++){const a=boss.pattern==='spiral'?boss.phase*.7+i*Math.PI/2:base+(i-(count-1)/2)*.26;hostileShots.push({x:boss.x,y:boss.y,vx:Math.cos(a)*(170+30*difficulty),vy:Math.sin(a)*(170+30*difficulty),life:4.5,r:9});}burst(boss.x,boss.y,'#deb0ff',12,90);}if(dist(player,boss)<95)hurt(Math.round(16*difficulty));}
    followers.forEach((f,i)=>{const ahead=i?followers[i-1]:player,tx=ahead.x-player.face*73,ty=ahead.y+Math.sin(runTime*2+f.phase)*14;f.x=lerp(f.x,tx,1-Math.exp(-dt*3));f.y=lerp(f.y,ty,1-Math.exp(-dt*3));f.cheer=Math.max(0,(f.cheer||0)-dt);f.heal=Math.max(0,(f.heal||0)-dt);f.play=(f.play??rand(12,20))-dt;if(f.play<=0){f.cheer=.8;f.play=rand(16,25);burst(f.x,f.y,colors[i%5],5,35);}f.fire=Math.max(0,(f.fire||0)-dt);if(f.fire<=0){const target=nearestEnemy(f,480);if(target){sendBubble(f,target,Math.min(8,4+abilityRanks[5]),true);f.cheer=.55;f.fire=2.2+rand(0,.6);}}});
    shots.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(s.life>0&&!s.friend){const gift=collectibles.find(i=>i.alive&&i.kind==='party'&&dist(i,s)<26);if(gift){collect(gift);s.life=0;}}for(const e of enemies){if(e.hp>0&&s.life>0&&dist(e,s)<(e.type==='fish'?40:33)){damageEnemy(e,s.damage);s.life=0;}}if(boss&&boss.hp>0&&s.life>0&&dist(boss,s)<100){boss.hp=Math.max(0,boss.hp-s.damage);boss.hit=.15;s.life=0;burst(s.x,s.y,'#d8fff5',10,100);if(!boss.hp){score+=900+chapter*180;stageCount=1;burst(boss.x,boss.y,'#e0f9ff',65,280);hostileShots=[];banner('Köpükler kazandı!','DOSTLARINLA GEÇİDE YÜZ');}}});shots=shots.filter(s=>s.life>0);
    hostileShots.forEach(s=>{s.x+=s.vx*dt*slow;s.y+=s.vy*dt*slow;s.life-=dt;if(dist(s,player)<24+s.r){hurt(s.damage||12);s.life=0;}});hostileShots=hostileShots.filter(s=>s.life>0);if(mode!=='playing')return;
    const spec=stageSpec();if(playMode==='adventure'){if(spec.type==='rescue'&&stageCount>=1)defenceTime=Math.min(spec.defend,defenceTime+dt);if(objectiveDone())completeStage();if(portal.open&&dist(player,portal)<80){nextStage();return;}}
    else if(pearls>=6){pearls=0;stageCount=0;collectibles.filter(i=>i.kind==='pearl').forEach(i=>i.alive=true);}
    if(xp>=nextXP&&mode==='playing'&&playMode==='adventure')offerUpgrade();
  }
  function updateEffects(dt){healingTrails.forEach(p=>{p.x=lerp(p.x,player.x,1-Math.exp(-dt*5));p.y=lerp(p.y,player.y,1-Math.exp(-dt*5));p.life-=dt;});healingTrails=healingTrails.filter(p=>p.life>0);particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy-=dt*12;p.life-=dt;});particles=particles.filter(p=>p.life>0);texts.forEach(t=>{t.y-=32*dt;t.life-=dt;});texts=texts.filter(t=>t.life>0);ghosts.forEach(g=>g.life-=dt);ghosts=ghosts.filter(g=>g.life>0);shake=Math.max(0,shake-dt*35);flash=Math.max(0,flash-dt);transition=Math.max(0,transition-dt);}
  function updateHUD(){
    $('health-label').textContent=Math.ceil(player.hp)+' / '+player.maxHp;$('health-fill').style.width=player.hp/player.maxHp*100+'%';$('energy-fill').style.width=player.energy+'%';$('score').textContent=score.toLocaleString('tr-TR');$('combo').textContent=combo>=5?'×'+Math.min(4,1+Math.floor(combo/5))+' AKINTI SERİSİ':'SEVİYE '+level;
    const s=stageSpec(),count=s.type==='combat'?stageKills:stageCount,names={pearls:'◇ İnci',relay:'✿ Işık',rings:'◌ Halka',stars:'✦ Yıldız',combat:'Köpük dostu',rescue:'Dost',guardian:'Bekçi',sprint:'◇ İnci'};
    $('chapter').textContent='0'+(chapter+1)+' / 0'+chapters.length+' · '+chapters[chapter].name.toLocaleUpperCase('tr-TR');$('region').textContent=chapters[chapter].name.toLocaleUpperCase('tr-TR');
    $('pearls').textContent=(names[s.type]||'Işık')+' '+Math.min(count,s.goal)+' / '+s.goal;$('rescues').textContent='♡ Yol arkadaşı '+followers.length;
    $('mission').textContent=portal.open?'Bölge bitti. Geçide yüz!':s.copy;$('sprint-timer').textContent=Math.ceil(sprintLeft);
    $('stage-label').textContent=playMode==='sprint'?'Kendi rekorunu yakala':'Alt seviye '+(stage+1)+' / '+chapters[chapter].stages.length+' · Tek geçit';
    $('stage-track').innerHTML=playMode==='sprint'?'':chapters[chapter].stages.map((_,i)=>'<i class="'+(i<stage?'done':i===stage?'active':'')+'"></i>').join('');
    const combat=s.requiredKills?'⚔ '+Math.min(stageKills,s.requiredKills)+' / '+s.requiredKills+' düşman':'';
    const defence=s.defend?(stageCount?'Savunma '+Math.min(s.defend,Math.floor(defenceTime))+' / '+s.defend+' sn':'Dostunu bul, sonra savun') :'';
    $('challenge-label').textContent=[combat,defence].filter(Boolean).join(' · ')||(playMode==='adventure'?'♡ '+(friendHelpUsed?'Dost yardımı kullanıldı':'Dostların yanında'):'');
    $('power-strip').innerHTML=Object.entries(buffs).filter(([,v])=>v>0).map(([id,v])=>{const p=content.powers[id];return '<span class="power-chip" style="--power-color:'+p.color+'"><b>'+p.symbol+'</b> '+p.name+' <strong>'+Math.ceil(v)+'s'+(id==='shield'?' · '+shieldCharges+'♡':'')+'</strong></span>';}).join('');
    $('event-status').textContent=surgeLeft>0?'✿ Köpük dalgası · '+Math.ceil(surgeLeft)+' sn':event?event.name+' · '+Math.ceil(event.left)+' sn'+(event.id==='trail'?' · '+eventCollected+' / 8':''):'';$('app').dataset.guardian=String(!!boss&&boss.hp>0);
    updateGuideHUD();
    if(boss){$('boss-fill').style.width=boss.hp/boss.maxHp*100+'%';$('boss-value').textContent=Math.ceil(boss.hp);}
  }
  function sprite(name,x,y,w,h,flip=false,alpha=1,rotation=0){const im=name==='axo'?art.axo:art.sheet;if(!im.complete||!im.naturalWidth)return;ctx.save();ctx.translate(x,y);ctx.rotate(rotation);if(flip)ctx.scale(-1,1);ctx.globalAlpha=alpha;if(name==='axo')ctx.drawImage(im,80,90,1400,820,-w/2,-h/2,w,h);else{const [sx,sy,sw,sh]=crops[name];ctx.drawImage(im,sx,sy,sw,sh,-w/2,-h/2,w,h);}ctx.restore();}
  function glow(x,y,r,color,alpha=.45){ctx.save();ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();}
  function bubble(x,y,r,color='#adffed'){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=1.2;ctx.stroke();ctx.beginPath();ctx.arc(x-r*.28,y-r*.28,r*.28,Math.PI,Math.PI*1.6);ctx.strokeStyle='#edfffa';ctx.stroke();}
  function sweetBubble(x,y,r,color,friend=false){ctx.save();ctx.fillStyle=color+'35';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();bubble(x,y,r,color);ctx.fillStyle='#25495c';for(const side of [-1,1]){ctx.beginPath();ctx.arc(x+side*r*.28,y-r*.07,Math.max(.8,r*.07),0,Math.PI*2);ctx.fill();}ctx.strokeStyle='#527284';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y+r*.08,r*.23,.2,Math.PI-.2);ctx.stroke();if(friend){ctx.fillStyle='#ffb9d8';ctx.beginPath();ctx.arc(x-r*.48,y+r*.2,r*.12,0,Math.PI*2);ctx.arc(x+r*.48,y+r*.2,r*.12,0,Math.PI*2);ctx.fill();}ctx.restore();}
  function starShape(x,y,r,color,points=5){ctx.save();ctx.translate(x,y);ctx.fillStyle=color;ctx.beginPath();for(let i=0;i<points*2;i++){const a=i*Math.PI/points-Math.PI/2,rr=i%2?r*.45:r;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();ctx.restore();}
  function heartShape(x,y,r,color){ctx.save();ctx.translate(x,y);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,r*.8);ctx.bezierCurveTo(-r*1.5,-r*.1,-r,-r*1.3,0,-r*.45);ctx.bezierCurveTo(r,-r*1.3,r*1.5,-r*.1,0,r*.8);ctx.fill();ctx.restore();}
  function drawCuteEnemy(e,size=1){
    const palette={fish:'#ffd7a2',jelly:'#d4c5ff',darter:'#ffbad1',spitter:'#b6ebd8',guard:'#c1dafa'},color=e.color||palette[e.type];ctx.save();ctx.translate(e.x,e.y);ctx.scale(size*(e.vx>0?1:-1),size);ctx.rotate(reduced?0:Math.sin(time*2+(e.phase||0))*.035);ctx.lineCap='round';
    if(e.type==='jelly'){
      ctx.strokeStyle=color;ctx.lineWidth=5;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*17,8);ctx.bezierCurveTo(i*17+8,25,i*17-8,35,i*17+Math.sin(time*2+i)*6,49);ctx.stroke();}
      ctx.fillStyle=color;ctx.beginPath();ctx.arc(0,0,33,Math.PI,0);ctx.quadraticCurveTo(0,22,-33,0);ctx.fill();ctx.fillStyle='#faf1ff';ctx.beginPath();ctx.ellipse(-8,-15,12,6,-.3,0,Math.PI*2);ctx.fill();
    }else{
      ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-28,0);ctx.quadraticCurveTo(-50,-7,-54,-21);ctx.quadraticCurveTo(-62,0,-54,21);ctx.quadraticCurveTo(-42,10,-28,0);ctx.fill();ctx.beginPath();ctx.ellipse(0,0,38,27,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff5dfb0';ctx.beginPath();ctx.ellipse(8,9,24,11,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(-6,-25,12,9,-.2,0,Math.PI*2);ctx.fill();
      if(e.type==='guard'){ctx.strokeStyle='#89aed4';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,39,29,0,0,Math.PI*2);ctx.stroke();starShape(-14,-5,8,'#f9f1c6',4);}if(e.type==='darter'){ctx.strokeStyle='#fff5dfa0';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-20,-10);ctx.lineTo(0,-10);ctx.stroke();}
    }
    const eyeX=e.type==='jelly'?13:18;ctx.fillStyle='#31546a';for(const side of (e.type==='jelly'?[-1,1]:[1])){ctx.beginPath();ctx.ellipse(side*eyeX,-5,3,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(side*eyeX+1,-6,1,0,Math.PI*2);ctx.fill();ctx.fillStyle='#31546a';}
    ctx.fillStyle='#ffabc0a0';ctx.beginPath();ctx.ellipse(e.type==='jelly'?-21:23,4,6,3,0,0,Math.PI*2);ctx.fill();if(e.type==='jelly'){ctx.beginPath();ctx.ellipse(21,4,6,3,0,0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle='#52778a';ctx.lineWidth=1.7;ctx.beginPath();ctx.arc(e.type==='jelly'?0:24,0,5,.15,Math.PI-.15);ctx.stroke();if(e.type==='spitter')bubble(43,7,8,'#e5fff5');ctx.restore();
  }
  function drawFriendBubble(s){
    const l=Math.hypot(s.vx,s.vy)||1;for(let i=1;i<=3;i++){ctx.globalAlpha=.26-i*.05;ctx.fillStyle=s.color;ctx.beginPath();ctx.arc(s.x-s.vx/l*i*12,s.y-s.vy/l*i*12,4-i*.7,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;bubble(s.x,s.y,10,s.color);
    if(s.friendStyle==='Nara')starShape(s.x,s.y,6,s.color);else if(s.friendStyle==='Mira'){for(let i=0;i<5;i++){const a=i*Math.PI*.4;ctx.fillStyle=s.color;ctx.beginPath();ctx.arc(s.x+Math.cos(a)*3.5,s.y+Math.sin(a)*3.5,2.5,0,Math.PI*2);ctx.fill();}}else heartShape(s.x,s.y,5.5,s.color);
  }
  function drawSurpriseScene(){if(!event)return;const age=event.duration-event.left;if(event.id==='shoal'){for(let i=0;i<7;i++){const fish={x:event.x-480+age*100+i*68,y:event.y+130+Math.sin(age*2+i)*26,type:'fish',color:colors[i%5],vx:1,phase:i};if(visible(fish,60)){ctx.save();ctx.globalAlpha=.7;drawCuteEnemy(fish,.45);ctx.restore();}}}else if(event.id==='current'){ctx.save();ctx.strokeStyle='#c4ffe8';ctx.globalAlpha=.18;ctx.lineWidth=2;for(let i=0;i<5;i++){const y=event.y-170+i*80;ctx.beginPath();ctx.moveTo(event.x-340,y);ctx.bezierCurveTo(event.x-100,y-30,event.x+90,y+30,event.x+340,y);ctx.stroke();}ctx.restore();}}
  function drawDecor(){const r=chapters[chapter];decor.forEach((p,i)=>{if(!visible(p,50))return;ctx.save();ctx.globalAlpha=.38;const y=p.y+(reduced?0:Math.sin(time*.7+p.phase)*3);if(['stars','hearts'].includes(r.decor)){starShape(p.x,y,p.size*.6,r.color,r.decor==='hearts'?4:5);}else if(r.decor==='crystals'||r.decor==='runes'){ctx.strokeStyle=r.color;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(p.x,y-p.size);ctx.lineTo(p.x+p.size*.5,y);ctx.lineTo(p.x,y+p.size*.5);ctx.lineTo(p.x-p.size*.5,y);ctx.closePath();ctx.stroke();}else if(r.decor==='flowers'||r.decor==='buds'){ctx.strokeStyle=r.color;ctx.beginPath();ctx.moveTo(p.x,y+32);ctx.quadraticCurveTo(p.x+12,y+10,p.x,y);ctx.stroke();for(let j=0;j<5;j++){const a=j*Math.PI*.4;ctx.fillStyle=colors[(i+chapter)%5];ctx.beginPath();ctx.ellipse(p.x+Math.cos(a)*7,y+Math.sin(a)*7,5,9,a,0,Math.PI*2);ctx.fill();}}else{ctx.strokeStyle=r.color;ctx.beginPath();ctx.arc(p.x,y,p.size,Math.PI,0);ctx.stroke();for(let j=-1;j<=1;j++){ctx.beginPath();ctx.moveTo(p.x,y);ctx.lineTo(p.x+j*p.size*.65,y-p.size*.7);ctx.stroke();}}ctx.restore();});}
  function drawCollectible(item){const bob=reduced?0:Math.sin(time*2+item.phase)*6,y=item.y+bob,color=item.color||'#ffe0a1';
    if(item.kind==='pearl'){glow(item.x,item.y,55,color,.2);ctx.save();ctx.filter='hue-rotate('+colors.indexOf(color)*42+'deg)';sprite('pearl',item.x,y,58,54);ctx.restore();}
    else if(item.kind==='baby'){glow(item.x,item.y,80,'#ffadd9',.2);sprite('baby',item.x,y,100,79);label(item.x,item.y-55,item.name||'KAYIP DOST','#ffcedf');}
    else if(item.kind==='lantern'||item.kind==='ring'){const next=item.order===stageCount,size=item.kind==='ring'?58:28;glow(item.x,item.y,size+30,color,next?.22:.06);ctx.save();ctx.globalAlpha=next?1:.38;ctx.strokeStyle=color;ctx.lineWidth=next?3:1.5;ctx.beginPath();ctx.ellipse(item.x,item.y,size*.75,size,0,0,Math.PI*2);ctx.stroke();if(item.kind==='lantern')starShape(item.x,y,13,color,4);ctx.font='700 13px "Nunito Sans"';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(String(item.order+1),item.x,item.y-size-15);ctx.restore();}
    else if(item.kind==='star'){glow(item.x,item.y,30,color,.18);starShape(item.x,y,15,color);}
    else if(item.kind==='gem'){glow(item.x,item.y,32,color,.15);starShape(item.x,y,13,color,4);}
    else if(item.kind==='party'){glow(item.x,item.y,32,color,.15);sweetBubble(item.x,y,19,color,true);}
    else{glow(item.x,item.y,17,'#6cffd2',.2);ctx.fillStyle='#b4ffe4';ctx.beginPath();ctx.ellipse(item.x,y,5,3,Math.sin(time+item.phase),0,Math.PI*2);ctx.fill();}
  }
  function drawPowers(){powerDrops.forEach(d=>{if(!visible(d))return;const p=content.powers[d.id],y=d.y+(reduced?0:Math.sin(time*2+d.phase)*7);glow(d.x,y,60,p.color,.18);sweetBubble(d.x,y,29,p.color,true);ctx.fillStyle=p.color;ctx.font='700 18px "Nunito Sans"';ctx.textAlign='center';ctx.fillText(p.symbol,d.x,y-41);label(d.x,y+51,p.name+' · '+Math.ceil(d.ttl)+'s',p.color);});if(buffs.shield>0){ctx.save();ctx.strokeStyle='#beeaff';ctx.globalAlpha=.65;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(player.x,player.y,77,58,0,0,Math.PI*2);ctx.stroke();ctx.restore();}}
  function visible(e,margin=120){return Math.abs(e.x-camera.x)<viewW/2+margin&&Math.abs(e.y-camera.y)<viewH/2+margin;}
  function drawWorld(){
    const menu=mode==='menu';const sx=shake?rand(-shake,shake):0,sy=shake?rand(-shake,shake):0;
    ctx.fillStyle='#082a35';ctx.fillRect(0,0,width,height);
    if(menu){const zoom=1.035,iw=art.background.naturalWidth||1672,ih=art.background.naturalHeight||941,s=Math.max(width/iw,height/ih)*zoom;const bw=iw*s,bh=ih*s;if(art.background.complete&&art.background.naturalWidth)ctx.drawImage(art.background,(width-bw)/2+(reduced?0:Math.sin(time*.09)*8),(height-bh)/2,bw,bh);ctx.fillStyle='#04263a20';ctx.fillRect(0,0,width,height);}
    else{
      ctx.save();ctx.translate(width/2+sx,height/2+sy);ctx.scale(scale,scale);ctx.translate(-camera.x,-camera.y);
      if(art.background.complete&&art.background.naturalWidth)ctx.drawImage(art.background,0,0,W,H);ctx.fillStyle=chapters[chapter].tint;ctx.fillRect(0,0,W,H);
      // Moving light and suspended motes establish depth without obscuring targets.
      for(let i=0;i<50;i++){const x=(i*257.37)%W,y=H-((time*(8+i%5)+i*63.7)%H);if(!visible({x,y},20))continue;ctx.globalAlpha=.12+(i%3)*.05;bubble(x+Math.sin(time*.5+i)*12,y,2+i%4);ctx.globalAlpha=1;}
      if(playMode==='sprint'||stage===chapters[chapter].stages.length-1)drawPortal();
      drawDecor();collectibles.forEach(item=>{if(item.alive&&visible(item))drawCollectible(item);});drawPowers();
      drawSurpriseScene();
      enemies.forEach(e=>{if(!visible(e))return;drawCuteEnemy(e,e.type==='guard'?1.3:1);if(e.windup>0){ctx.save();ctx.strokeStyle='#ffe4a9';ctx.lineWidth=2.5;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+e.aimX*260,e.y+e.aimY*260);ctx.stroke();ctx.restore();}if(e.hit>0)glow(e.x,e.y,65,'#fff4cf',e.hit*2);if(e.hp<e.maxHp){ctx.fillStyle='#16444d';ctx.fillRect(e.x-22,e.y-46,44,3);ctx.fillStyle='#f6c7a6';ctx.fillRect(e.x-22,e.y-46,44*e.hp/e.maxHp,3);}});
      if(boss&&boss.hp>0){glow(boss.x,boss.y,150,'#ffe1bf',.15);drawCuteEnemy({...boss,type:'jelly',vx:1},2.7);if(boss.hit>0)glow(boss.x,boss.y,110,'#fff4cf',.3);}
      followers.forEach(f=>{const y=f.y+(reduced?0:Math.sin(time*4+f.phase)*3)-(f.heal>0?Math.sin(f.heal*Math.PI)*7:0);sprite('baby',f.x,y,74,54,player.face<0);if(f.cheer>0)heartShape(f.x,y-39,8,f.heal>0?'#b4ffe4':'#ffc1dd');label(f.x,y+38,f.name,'#d7fff0');if(f.heal>0)glow(f.x,y,65,'#b4ffe4',.15);});
      healingTrails.forEach(p=>{ctx.save();ctx.globalAlpha=Math.min(1,p.life);heartShape(p.x,p.y,11,p.color);glow(p.x,p.y,30,p.color,.15);ctx.restore();});
      ghosts.forEach(g=>sprite('axo',g.x,g.y,126,74,g.face<0,g.life));
      const playerAlpha=player.inv>0?(reduced?.85:.8+Math.sin(time*9)*.2):1;const tilt=clamp(player.vy*.00055,-.16,.16)*player.face;
      glow(player.x,player.y,95,player.dash>0?'#8fffe0':'#ffaaD4',player.dash>0?.45:.08);sprite('axo',player.x,player.y+(reduced?0:Math.sin(time*4)*2),130,80,player.face<0,playerAlpha,tilt);
      shots.forEach(s=>{glow(s.x,s.y,24,s.color||'#a0fff4',.16);if(s.friend)drawFriendBubble(s);else sweetBubble(s.x,s.y+(reduced?0:Math.sin(time*10+s.phase)*1.5),s.r,s.color||'#a0fff4');});hostileShots.forEach(s=>{glow(s.x,s.y,24,'#ffd5aa',.18);ctx.fillStyle='#ffc690';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();bubble(s.x,s.y,s.r,'#ffe8be');});
      particles.forEach(p=>{ctx.globalAlpha=clamp(p.life/p.max,0,1)*.7;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
      texts.forEach(t=>{ctx.globalAlpha=clamp(t.life,0,1);ctx.fillStyle=t.color;ctx.font='bold 19px "Nunito Sans",sans-serif';ctx.textAlign='center';ctx.fillText(t.text,t.x,t.y);});ctx.globalAlpha=1;
      drawGuide();ctx.restore();
    }
    if(menu){for(let i=0;i<22;i++){const x=(i*167.3)%width,y=height-((time*(6+i%7)+i*41)%height);ctx.globalAlpha=.16;bubble(x,y,2+i%4);ctx.globalAlpha=1;}const hx=width*.74,hy=height*(width<700?.82:.56)+(reduced?0:Math.sin(time*1.4)*12);glow(hx,hy,width*.17,'#70efcb',.14);sprite('axo',hx,hy,Math.min(350,width*.28),Math.min(212,width*.17),false,1,Math.sin(time*.9)*.04);if(width>700){sprite('baby',width*.89,height*.66+Math.sin(time*1.7)*8,93,70,true,.8);}}
    if(flash>0){ctx.fillStyle='rgba(255,87,135,'+(flash*.7)+')';ctx.fillRect(0,0,width,height);}if(transition>0){ctx.fillStyle='rgba(128,255,225,'+transition*.5+')';ctx.fillRect(0,0,width,height);}
    // Caustic speckles are deliberately subtle and disabled for reduced motion.
    if(!reduced){ctx.save();ctx.globalAlpha=.025;ctx.strokeStyle='#e0fff0';ctx.lineWidth=2;for(let i=0;i<7;i++){ctx.beginPath();for(let x=0;x<=width;x+=35){const y=height*.1+i*height*.15+Math.sin(x*.008+time*.5+i)*19;ctx.lineTo(x,y);}ctx.stroke();}ctx.restore();}
  }
  function label(x,y,text,color){ctx.save();ctx.font='bold 10px "Nunito Sans",sans-serif';ctx.textAlign='center';ctx.fillStyle=color;ctx.shadowColor='#001523';ctx.shadowBlur=8;ctx.fillText(text,x,y);ctx.restore();}
  function drawPortal(){glow(portal.x,portal.y,150,portal.open?'#a4fff0':'#6bbddf',portal.open?.38:.12);ctx.save();ctx.translate(portal.x,portal.y);ctx.strokeStyle=portal.open?'#b9ffdf':'#7aa6bb66';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,43,77,0,0,Math.PI*2);ctx.stroke();ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,55,89,0,0,Math.PI*2);ctx.stroke();if(portal.open){for(let i=0;i<8;i++){const a=time+i*Math.PI/4;glow(Math.cos(a)*43,Math.sin(a)*77,12,'#f3ffcd',.6);}}label(0,-110,portal.open?'GEÇİT AÇILDI':'IŞIK GEÇİDİ',portal.open?'#d8ffcc':'#9cb8c6');ctx.restore();}
  function guideTarget(){
    const s=stageSpec();if(portal.open)return {target:portal,label:'Geçide yüz'};
    const quests=collectibles.filter(i=>i.alive&&(i.quest||i.kind==='baby')&&(!['ring','lantern'].includes(i.kind)||i.order===stageCount));
    if(quests.length){const item=quests.reduce((a,b)=>dist(a,player)<dist(b,player)?a:b),names={pearl:'İnci',star:'Yıldız',baby:item.name||'Dost',lantern:'Işık',ring:'Halka'};return {target:item,label:(names[item.kind]||'Hazine')+(item.order!==undefined?' '+(item.order+1)+' / '+s.goal:'')};}
    if(boss&&boss.hp>0)return {target:boss,label:'Yıldız bekçisi'};
    if(s.type==='combat'||stageKills<(s.requiredKills||0)){const live=enemies.filter(e=>e.hp>0);if(live.length)return {target:live.reduce((a,b)=>dist(a,player)<dist(b,player)?a:b),label:'Köpük oyunu'};}
    const friend=followers.find(f=>f.name===s.friend)||followers[0];return friend?{target:friend,label:s.defend?'Birlikte kal · '+Math.max(0,Math.ceil(s.defend-defenceTime))+' sn':'Dostunun yanında'}:null;
  }
  function guidePlacement(target){
    const tx=(target.x-camera.x)*scale+width/2,ty=(target.y-camera.y)*scale+height/2,px=(player.x-camera.x)*scale+width/2,py=(player.y-camera.y)*scale+height/2;
    const compact=width<700,short=height<480,top=short?Math.min(245,height-110):compact?(boss?430:Object.values(buffs).some(v=>v>0)?400:360):240,bottom=Math.max(top+5,height-(short?135:compact?185:180));
    const inside=tx>=70&&tx<=width-70&&ty>=top&&ty<=bottom,angle=Math.atan2(ty-py,tx-px),x=clamp(inside?px+Math.cos(angle)*85:tx,70,width-70),y=clamp(inside?py+Math.sin(angle)*85:ty,top,bottom);
    return {x,y,angle,distance:Math.ceil(dist(player,target)/10),top,bottom};
  }
  function updateGuideHUD(){
    const info=guideTarget(),g=$('goal-guide');g.hidden=mode!=='playing'||!info;if(g.hidden)return;const p=guidePlacement(info.target);$('guide-label').textContent=info.label;$('guide-distance').textContent=p.distance>4?p.distance+' kulaç':'';
    const box=g.getBoundingClientRect(),hw=(box.width||116)/2,hh=(box.height||54)/2,touchTop=$('touch').hidden?height-(height<480?65:135):$('touch').getBoundingClientRect().top,maxY=(touchTop||height-150)-hh-10;
    const obstacles=[$('mission').parentElement,...(boss?[$('boss-hud')]:[]),...(Object.values(buffs).some(v=>v>0)?[$('power-strip')]:[])];
    for(const element of obstacles){const r=element?.getBoundingClientRect();if(!r||!Number.isFinite(r.bottom)||p.x+hw<r.left||p.x-hw>r.right||p.y+hh<r.top||p.y-hh>r.bottom)continue;if(r.bottom+hh+8<=maxY)p.y=r.bottom+hh+8;else p.x=clamp(p.x<width/2?r.left-hw-8:r.right+hw+8,hw+8,width-hw-8);}
    p.y=clamp(p.y,hh+70,Math.max(hh+70,maxY));g.style.left=p.x+'px';g.style.top=p.y+'px';$('guide-arrow').style.transform='rotate('+p.angle+'rad)';
  }
  function drawGuide(){if(mode!=='playing')return;const info=guideTarget();if(!info||!visible(info.target))return;const t=info.target;ctx.save();ctx.strokeStyle='#fff1bb';ctx.lineWidth=2;ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(t.x,t.y,38+(reduced?0:Math.sin(time*3)*3),0,Math.PI*2);ctx.stroke();ctx.restore();}
  function drawMap(){mctx.clearRect(0,0,160,95);mctx.fillStyle='#062430';mctx.fillRect(0,0,160,95);const dot=(x,y,r,color)=>{mctx.fillStyle=color;mctx.beginPath();mctx.arc(x/W*160,y/H*95,r,0,Math.PI*2);mctx.fill();};mctx.strokeStyle='#709e9c33';mctx.lineWidth=1;for(let i=1;i<4;i++){mctx.beginPath();mctx.moveTo(i*40,0);mctx.lineTo(i*40,95);mctx.stroke();}collectibles.forEach(i=>{if(i.alive&&i.kind!=='food')dot(i.x,i.y,i.kind==='baby'?3:2,i.kind==='baby'?'#ffb3d6':'#ffe0a1');});powerDrops.forEach(d=>dot(d.x,d.y,3,content.powers[d.id].color));followers.forEach(f=>dot(f.x,f.y,1.8,'#ffc1dd'));enemies.forEach(e=>dot(e.x,e.y,1.5,'#f59aaa'));dot(portal.x,portal.y,3,portal.open?'#a4ffd0':'#608aa0');if(boss&&boss.hp>0)dot(boss.x,boss.y,5,'#ca9cff');dot(player.x,player.y,3,'#e8fff7');mctx.strokeStyle='#cefff037';mctx.strokeRect((camera.x-viewW/2)/W*160,(camera.y-viewH/2)/H*95,viewW/W*160,viewH/H*95);}
  function frame(now){const dt=Math.min((now-last)/1000||.016,.1);last=now;if(!document.hidden){time+=dt;if(mode==='playing'){accumulator+=dt;while(accumulator+1e-9>=1/60){update(1/60);accumulator=Math.max(0,accumulator-1/60);if(mode!=='playing'){accumulator=0;break;}}}else accumulator=0;updateEffects(dt);drawWorld();if(now-hudAt>80){updateHUD();if(mode!=='menu')drawMap();hudAt=now;}if(toastUntil&&time>toastUntil){$('toast').style.opacity='0';toastUntil=0;}if(bannerUntil&&time>bannerUntil){$('region-banner').style.opacity='0';bannerUntil=0;}if(sound&&mode==='playing'&&time>ambientAt){ambientAt=time+3.1;tone([164.81,196,220,261.63,293.66][(Math.floor(time/4)+chapter)%5],2.5,'sine',.009);}}requestAnimationFrame(frame);}
  $('continue-run').onclick=()=>start('adventure',true);$('adventure').onclick=()=>start('adventure');$('sprint').onclick=()=>start('sprint');$('pause').onclick=pause;$('dialog-home').onclick=home;$('dialog-main').onclick=()=>mode==='paused'?pause():start(playMode,mode==='lost'&&!!checkpoint);
  $('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Ses açık':'Ses kapalı';$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'Sesi kapat':'Sesi aç');if(!sound&&master)master.gain.value=0;else{if(master)master.gain.value=.55;chime();}};
  $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('app').requestFullscreen();}catch{toast('Bu tarayıcıda tam ekran açılamıyor.');}};
  window.addEventListener('keydown',e=>{if(e.target.tagName==='BUTTON'&&(e.key===' '||e.key==='Enter'))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','shift','p','escape'].includes(k)){e.preventDefault();if((k==='p'||k==='escape')&&!e.repeat)pause();else if(k==='shift'&&!e.repeat)dash();else keys.add(k);}});
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{clearInput();if(mode==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing')pause();});
  canvas.addEventListener('pointerdown',e=>{if(!coarse&&mode==='playing'){shootHeld=true;canvas.setPointerCapture(e.pointerId);}});for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>shootHeld=false);
  const pad=$('joystick');function moveJoy(e){const r=pad.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),l=Math.hypot(dx,dy),max=34;joystick.x=dx/Math.max(max,l);joystick.y=dy/Math.max(max,l);$('stick').style.transform='translate('+joystick.x*max+'px,'+joystick.y*max+'px)';}
  pad.addEventListener('pointerdown',e=>{e.preventDefault();joyPointer=e.pointerId;pad.setPointerCapture(e.pointerId);moveJoy(e);});pad.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)moveJoy(e);});for(const type of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(type,e=>{if(e.pointerId===joyPointer){joyPointer=null;joystick.x=0;joystick.y=0;$('stick').style.transform='translate(0px,0px)';}});
  $('touch-dash').onpointerdown=e=>{e.preventDefault();dash();};$('touch-fire').onpointerdown=e=>{e.preventDefault();shootHeld=true;$('touch-fire').setPointerCapture(e.pointerId);};for(const type of ['pointerup','pointercancel','lostpointercapture'])$('touch-fire').addEventListener(type,()=>shootHeld=false);
  function loadAssets(){let pending=Object.values(art).length;const loaded=()=>{if(--pending===0){ready=true;$('continue-run').disabled=false;$('adventure').disabled=false;$('sprint').disabled=false;$('load-state').textContent='Hazır · '+(best?'En iyi: '+best:'Kulaklıkla keşfet');}};$('continue-run').disabled=true;$('adventure').disabled=true;$('sprint').disabled=true;Object.values(art).forEach(im=>{if(im.complete&&im.naturalWidth)loaded();else{im.onload=loaded;im.onerror=()=>{$('load-state').textContent='Görseller yüklenemedi. Sayfayı yenile.';};}});}
  const state=()=>({mode,playMode,elapsed:Math.round(runTime),chapter:chapter+1,chapters:chapters.length,chapterName:chapters[chapter].name,stage:stage+1,stageName:stageSpec().name,objective:stageSpec().copy,objectiveProgress:stageSpec().type==='combat'?stageKills:stageCount,objectiveGoal:stageSpec().goal,requiredKills:stageSpec().requiredKills||0,stageKills,defenceSeconds:Math.floor(defenceTime),defenceGoal:stageSpec().defend||0,friendHelpUsed,guide:guideTarget()?{label:guideTarget().label,x:Math.round(guideTarget().target.x),y:Math.round(guideTarget().target.y)}:null,surge:surgeLeft>0,enemyTypes:[...new Set(enemies.filter(e=>e.hp>0).map(e=>e.type))],completedStages,score,health:Math.ceil(player.hp),maxHealth:player.maxHp,pearls,rescues,totalRescues,friends:followers.map(f=>f.name),level,upgradeOptions:mode==='upgrade'?offered.map(i=>({id:i,name:upgrades[i].name})):[],abilities:[...abilityRanks],difficulty:Math.round(difficulty*100)/100,powers:Object.fromEntries(Object.entries(buffs).filter(([,v])=>v>0).map(([k,v])=>[k,Math.ceil(v)])),event:event?{name:event.name,seconds:Math.ceil(event.left)}:null,checkpoint:!!checkpoint,energy:Math.round(player.energy),bossHealth:boss?.hp??null,portalOpen:portal.open,sprintLeft:Math.ceil(sprintLeft),enemies:enemies.length,position:{x:Math.round(player.x),y:Math.round(player.y)}});
  window.axolotlGame={getState:state,start,pause,chooseUpgrade};
  if(document.modelContext?.registerTool){const lifecycle=new AbortController();const defs=[{name:'read_axolotl_game',description:'Read the axolotl game status, chapter, score, health and objectives.',annotations:{readOnlyHint:true},inputSchema:{type:'object',properties:{},additionalProperties:false},execute(input){if(input&&Object.keys(input).length)throw new Error('No arguments accepted');return state();}},{name:'start_axolotl_game',description:'Start a new axolotl adventure or 60-second sprint, resetting the current run.',annotations:{readOnlyHint:false},inputSchema:{type:'object',properties:{mode:{type:'string',enum:['adventure','sprint']}},additionalProperties:false},execute(input={}){if(Object.keys(input).some(k=>k!=='mode')||(input.mode&&!['adventure','sprint'].includes(input.mode)))throw new Error('Invalid game mode');if(!ready)throw new Error('Assets are not ready');start(input.mode||'adventure');return state();}}];for(const tool of defs){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});}
  $('continue-run').hidden=!checkpoint;loadAssets();requestAnimationFrame(frame);
})();

