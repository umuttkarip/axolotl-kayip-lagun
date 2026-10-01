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
  const chapters = [
    {name:'Işıklı Sığlık',subtitle:'Güneşin suya dokunduğu yer',tint:'rgba(0,120,105,.04)',color:'#99ffe0',enemies:7},
    {name:'Unutulmuş Tapınak',subtitle:'Taşların hatırladığı bir sır',tint:'rgba(32,25,114,.22)',color:'#c4b1ff',enemies:11},
    {name:'Derinliğin Kalbi',subtitle:'Son ışığı koru',tint:'rgba(3,5,53,.39)',color:'#8feeff',enemies:13}
  ];
  let width=1280,height=720,scale=1,viewW=1280,viewH=850,last=0,time=0,accumulator=0,ready=false;
  let mode='menu',playMode='adventure',chapter=0,score=0,totalRescues=0,runTime=0,sprintLeft=60;
  let pearls=0,rescues=0,kills=0,combo=0,comboTimer=0,xp=0,level=1,nextXP=150,damage=20,speedBonus=0;
  let player={x:470,y:720,vx:0,vy:0,face:1,hp:100,maxHp:100,energy:100,inv:0,dash:0,fire:0};
  let camera={x:1000,y:650},keys=new Set(),joystick={x:0,y:0},joyPointer=null,shootHeld=false;
  let enemies=[],collectibles=[],shots=[],hostileShots=[],particles=[],texts=[],followers=[],ghosts=[],boss=null;
  let portal={x:2130,y:680,open:false},shake=0,flash=0,bannerUntil=0,toastUntil=0,hudAt=0,ambientAt=0,transition=0;
  let sound=false,audio=null,master=null,best=0,spawnTick=0;
  try {best=Number(localStorage.getItem('axolotl-best-v2'))||0;} catch {}

  function resize(){width=canvas.clientWidth||innerWidth;height=canvas.clientHeight||innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);scale=height/850;viewH=850;viewW=width/scale;ctx.setTransform(dpr,0,0,dpr,0,0);if(['playing','paused','upgrade'].includes(mode)){boundCamera();setControls(true);}}
  new ResizeObserver(resize).observe(canvas);resize();
  function boundCamera(){camera.x=clamp(camera.x,Math.min(viewW/2,W/2),Math.max(W-viewW/2,W/2));camera.y=clamp(camera.y,viewH/2,H-viewH/2);}
  function tone(freq,duration=.16,type='sine',volume=.05){if(!sound)return;try {audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();master??=audio.createGain();master.gain.value=.55;master.connect(audio.destination);const osc=audio.createOscillator(),gain=audio.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,audio.currentTime);gain.gain.setValueAtTime(.001,audio.currentTime);gain.gain.linearRampToValueAtTime(volume,audio.currentTime+.015);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.connect(gain);gain.connect(master);osc.start();osc.stop(audio.currentTime+duration+.03);}catch{}}
  function chime(){tone(659,.2);setTimeout(()=>tone(880,.32),90);}
  function toast(message){$('toast').textContent=message;$('toast').style.opacity='1';toastUntil=time+3.5;}
  function banner(title,subtitle){$('banner-title').textContent=title;$('banner-small').textContent=subtitle;$('region-banner').style.opacity='1';bannerUntil=time+3.8;}
  function clearInput(){keys.clear();joystick.x=0;joystick.y=0;shootHeld=false;joyPointer=null;$('stick').style.transform='translate(0px,0px)';}
  function burst(x,y,color,count=16,power=100){for(let i=0;i<count;i++){const angle=rand(0,Math.PI*2),v=rand(power*.2,power);particles.push({x,y,vx:Math.cos(angle)*v,vy:Math.sin(angle)*v,life:rand(.4,1),max:1,r:rand(1.5,4),color});}if(particles.length>350)particles.splice(0,particles.length-350);}
  function floatText(x,y,text,color='#ceffe4'){texts.push({x,y,text,color,life:1.3});}
  function addScore(value,x,y){combo++;comboTimer=5;const multiplier=Math.min(4,1+Math.floor(combo/5));score+=value*multiplier;floatText(x,y,'+'+value*multiplier);}
  function gainXP(value){xp+=value;}
  function setControls(visible){$('hud').hidden=!visible;$('minimap-wrap').hidden=!visible;$('hint').hidden=!visible;$('pause').hidden=!visible;$('touch').hidden=!(visible&&mode==='playing'&&(coarse||width<700));$('sprint-timer').hidden=!(visible&&playMode==='sprint');}
  function showDialog(kicker,title,copy,button,kind){$('dialog-kicker').textContent=kicker;$('dialog-title').textContent=title;$('dialog-copy').textContent=copy;$('dialog-main').textContent=button;$('dialog-main').hidden=kind==='upgrade';$('results').hidden=true;$('upgrade-options').hidden=kind!=='upgrade';$('dialog').hidden=false;}
  function createEnemy(i){const type=i%3===0?'fish':'jelly';return {x:rand(850,W-240),y:rand(300,H-240),homeX:rand(850,W-240),homeY:rand(300,H-240),type,hp:type==='fish'?45:35,maxHp:type==='fish'?45:35,phase:rand(0,7),hit:0,vx:0,vy:0,attack:rand(1,3)};}
  function buildChapter(){
    pearls=0;rescues=0;enemies=Array.from({length:chapters[chapter].enemies},(_,i)=>createEnemy(i));shots=[];hostileShots=[];collectibles=[];followers=[];particles=[];texts=[];ghosts=[];boss=null;portal.open=false;
    const positions=[[600,650],[880,430],[1190,850],[1490,420],[1770,960],[1990,650]];
    positions.forEach(([x,y],i)=>collectibles.push({x,y,kind:'pearl',phase:i,alive:true}));
    collectibles.push({x:1720,y:620,kind:'baby',phase:2,alive:true});
    for(let i=0;i<24;i++)collectibles.push({x:rand(330,W-280),y:rand(240,H-180),kind:'food',phase:rand(0,7),alive:true});
    player.x=420;player.y=700;player.vx=0;player.vy=0;player.inv=2;player.energy=100;camera.x=player.x;camera.y=player.y;boundCamera();
    $('boss-hud').hidden=true;banner(chapters[chapter].name,('0'+(chapter+1))+' / 03 · '+chapters[chapter].subtitle);
    if(chapter===0)toast(coarse||width<700?'Sol kontrolle yüz. AT ile baloncuk gönder, ATIL ile sıyrıl.':'WASD ile yüz. Boşluk ile saldır. Shift ile tehlikelerden sıyrıl.');else toast('Yeni bölge. Daha güçlü akıntılar, daha cesur bir axolotl.');
  }
  function start(which='adventure'){
    if(!ready)return;playMode=which;mode='playing';accumulator=0;chapter=0;score=0;totalRescues=0;kills=0;combo=0;comboTimer=0;xp=0;level=1;nextXP=150;damage=20;speedBonus=0;runTime=0;sprintLeft=60;transition=0;
    player={x:420,y:700,vx:0,vy:0,face:1,hp:100,maxHp:100,energy:100,inv:0,dash:0,fire:0};clearInput();buildChapter();$('menu').hidden=true;$('dialog').hidden=true;setControls(true);canvas.focus({preventScroll:true});chime();updateHUD();
  }
  function home(){mode='menu';clearInput();$('dialog').hidden=true;$('menu').hidden=false;setControls(false);$('boss-hud').hidden=true;$('region-banner').style.opacity='0';$('toast').style.opacity='0';camera={x:1050,y:650};}
  function pause(){if(mode==='playing'){mode='paused';clearInput();setControls(true);showDialog('MOLA','Sular sakinleşsin.','Hazır olduğunda yolculuğuna kaldığın yerden devam edebilirsin.','Devam et','pause');}else if(mode==='paused'){mode='playing';setControls(true);$('dialog').hidden=true;canvas.focus({preventScroll:true});}}
  function finish(won){mode=won?'won':'lost';clearInput();if(score>best){best=score;try{localStorage.setItem('axolotl-best-v2',String(best));}catch{}}setControls(false);$('boss-hud').hidden=true;
    const title=playMode==='sprint'&&won?'Akıntıyı yakaladın.':won?'Lagün yeniden ışıldıyor.':'Derinlikler bir kez daha çağırıyor.';
    const copy=playMode==='sprint'&&won?'60 saniyelik dalış tamamlandı. Daha hızlı bir akıntı seni bekliyor.':won?'Dostlarını kurtardın ve derinliğin koruyucusunu sakinleştirdin. Küçücük bir axolotl, kocaman bir fark.':'Her keşif biraz cesaret ister. İncileri takip et; atılma hareketi seni saldırılardan korur.';
    showDialog(won?'YOLCULUK TAMAMLANDI':'YENİ BİR DALIŞ',title,copy,'Yeniden oyna','end');$('results').hidden=false;$('results').innerHTML='<div><b>'+score+'</b><span>Puan</span></div><div><b>'+best+'</b><span>En iyi</span></div><div><b>'+totalRescues+'</b><span>Kurtarılan dost</span></div>';tone(won?880:220,.5);
  }
  const upgrades=[
    {symbol:'✚',name:'Yaşamın ışığı',copy:'+25 azami can ve tamamen iyileşme',apply(){player.maxHp+=25;player.hp=player.maxHp;}},
    {symbol:'◉',name:'Güçlü baloncuk',copy:'Baloncuk saldırıları %35 daha güçlü',apply(){damage=Math.round(damage*1.35);}},
    {symbol:'≈',name:'Akıntının çocuğu',copy:'Yüzme hızı artar; atılma enerjisi dolar',apply(){speedBonus+=32;player.energy=100;}}
  ];
  function offerUpgrade(){mode='upgrade';clearInput();setControls(true);showDialog('SEVİYE '+(level+1),'İçindeki ışık büyüyor.','Yolculuğuna devam etmek için bir güç seç.','','upgrade');$('upgrade-options').innerHTML='';upgrades.forEach((u,i)=>{const b=document.createElement('button');b.innerHTML='<b>'+u.symbol+'</b><span><strong>'+u.name+'</strong><small>'+u.copy+'</small></span>';b.onclick=()=>chooseUpgrade(i);$('upgrade-options').appendChild(b);});}
  function chooseUpgrade(index){if(mode!=='upgrade'||!Number.isInteger(index)||!upgrades[index])throw new Error('Geçersiz güç seçimi');upgrades[index].apply();xp-=nextXP;level++;nextXP=150+(level-1)*70;mode='playing';setControls(true);$('dialog').hidden=true;burst(player.x,player.y,'#fff0ad',30,180);chime();toast(upgrades[index].name+' kazanıldı.');updateHUD();}
  function dash(){if(mode!=='playing'||player.energy<40||player.dash>0)return;let dx=joystick.x+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),dy=joystick.y+(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);if(!dx&&!dy){dx=player.face;dy=0;}const length=Math.hypot(dx,dy);player.vx=dx/length*880;player.vy=dy/length*880;player.energy-=40;player.dash=.27;player.inv=Math.max(player.inv,.35);burst(player.x,player.y,'#8fffe6',14,110);tone(170,.18,'triangle');}
  function fire(){if(mode!=='playing'||player.fire>0)return;player.fire=.3;let candidates=enemies.filter(e=>e.hp>0&&dist(e,player)<650);if(boss&&boss.hp>0&&dist(boss,player)<800)candidates.push(boss);candidates.sort((a,b)=>dist(a,player)-dist(b,player));const target=candidates[0];let dx=target?target.x-player.x:player.face,dy=target?target.y-player.y:0;const len=Math.hypot(dx,dy)||1;shots.push({x:player.x+dx/len*35,y:player.y+dy/len*35,vx:dx/len*640,vy:dy/len*640,life:1.35,r:10,damage});player.face=dx>0?1:-1;tone(480,.08,'sine',.025);}
  function hurt(amount){if(player.inv>0||mode!=='playing')return;player.hp=Math.max(0,player.hp-amount);player.inv=1.25;shake=reduced?0:10;flash=.2;combo=0;comboTimer=0;burst(player.x,player.y,'#ffa5cf',20,140);tone(95,.2,'triangle');if(player.hp<=0)finish(false);}
  function damageEnemy(e,amount){e.hp-=amount;e.hit=.18;burst(e.x,e.y,'#bbf7ff',8,70);if(e.hp<=0){kills++;addScore(e.type==='fish'?45:30,e.x,e.y);gainXP(35);burst(e.x,e.y,e.type==='fish'?'#ffd386':'#cca6ff',22,140);tone(280,.12);if(Math.random()<.65)collectibles.push({x:e.x,y:e.y,kind:'food',alive:true,phase:0});}}
  function collect(item){item.alive=false;if(item.kind==='pearl'){pearls++;addScore(100,item.x,item.y);gainXP(35);burst(item.x,item.y,'#ffe9a2',24,160);chime();}else if(item.kind==='baby'){rescues++;totalRescues++;followers.push({x:item.x,y:item.y,phase:rand(0,7)});addScore(250,item.x,item.y);gainXP(65);burst(item.x,item.y,'#ffb7d6',28,170);toast('Bir dost kurtuldu! Artık yanında yüzüyor.');chime();}else{player.hp=Math.min(player.maxHp,player.hp+8);addScore(10,item.x,item.y);gainXP(5);burst(item.x,item.y,'#b7ffe1',6,55);tone(800,.08,'sine',.025);}}
  function spawnBoss(){boss={x:1830,y:600,hp:420,maxHp:420,phase:0,attack:2,hit:0};$('boss-hud').hidden=false;banner('Derinliğin Koruyucusu','BALONCUKLARLA KARANLIĞI DAĞIT');toast('Koruyucu uyandı. Hareketli kal ve baloncuk at!');enemies=[];}
  function update(dt){
    runTime+=dt;player.inv=Math.max(0,player.inv-dt);player.dash=Math.max(0,player.dash-dt);player.fire=Math.max(0,player.fire-dt);player.energy=Math.min(100,player.energy+dt*18);comboTimer=Math.max(0,comboTimer-dt);if(!comboTimer)combo=0;
    if(playMode==='sprint'){sprintLeft=Math.max(0,sprintLeft-dt);if(!sprintLeft){finish(true);return;}}
    let dx=joystick.x+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),dy=joystick.y+(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);const length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}
    if(player.dash<=0){const speed=260+speedBonus;player.vx=lerp(player.vx,dx*speed,1-Math.exp(-dt*5.5));player.vy=lerp(player.vy,dy*speed,1-Math.exp(-dt*5.5));}
    player.x=clamp(player.x+player.vx*dt,70,W-70);player.y=clamp(player.y+player.vy*dt,180,H-115);if(Math.abs(player.vx)>20)player.face=player.vx>0?1:-1;
    if((keys.has(' ')||shootHeld))fire();
    spawnTick+=dt;if(spawnTick>.045&&Math.hypot(player.vx,player.vy)>70){spawnTick=0;particles.push({x:player.x-player.face*45,y:player.y+rand(-12,12),vx:-player.vx*.12,vy:rand(-15,15),life:.65,max:.65,r:rand(1,3),color:'#b4fff0'});if(player.dash>0)ghosts.push({x:player.x,y:player.y,face:player.face,life:.22});}
    camera.x=lerp(camera.x,player.x+player.vx*.22,1-Math.exp(-dt*3.2));camera.y=lerp(camera.y,player.y+player.vy*.16,1-Math.exp(-dt*3.2));camera.x=clamp(camera.x,Math.min(viewW/2,W/2),Math.max(W-viewW/2,W/2));camera.y=clamp(camera.y,viewH/2,H-viewH/2);
    collectibles.forEach(item=>{if(item.alive&&dist(item,player)<(item.kind==='food'?27:46))collect(item);});
    enemies.forEach(e=>{if(e.hp<=0)return;e.hit=Math.max(0,e.hit-dt);const d=dist(e,player);if(e.type==='fish'&&d<420){let tx=(player.x-e.x)/(d||1),ty=(player.y-e.y)/(d||1),sp=105+chapter*20;e.vx=lerp(e.vx,tx*sp,1-Math.exp(-dt*2));e.vy=lerp(e.vy,ty*sp,1-Math.exp(-dt*2));e.x+=e.vx*dt;e.y+=e.vy*dt;}else{e.x+=Math.sin(time*.65+e.phase)*dt*22;e.y+=Math.cos(time*1.3+e.phase)*dt*30;}
      if(d<(e.type==='fish'?47:38)){if(player.dash>0)damageEnemy(e,80);else hurt(e.type==='fish'?18:12);}
      if(chapter>0&&e.type==='jelly'&&d<520){e.attack-=dt;if(e.attack<=0){e.attack=4.2;const n=dist(e,player)||1;hostileShots.push({x:e.x,y:e.y,vx:(player.x-e.x)/n*130,vy:(player.y-e.y)/n*130,life:4,r:7});}}
    });enemies=enemies.filter(e=>e.hp>0);if(mode!=='playing')return;
    if(boss&&boss.hp>0){boss.hit=Math.max(0,boss.hit-dt);boss.phase+=dt;boss.x=1780+Math.sin(boss.phase*.6)*270;boss.y=650+Math.cos(boss.phase*.9)*210;boss.attack-=dt;if(boss.attack<=0){boss.attack=boss.hp<210?1.5:2.2;const base=Math.atan2(player.y-boss.y,player.x-boss.x);for(let i=-2;i<=2;i++){const a=base+i*.23;hostileShots.push({x:boss.x,y:boss.y,vx:Math.cos(a)*180,vy:Math.sin(a)*180,life:5,r:9});}burst(boss.x,boss.y,'#deb0ff',12,90);}if(dist(player,boss)<95)hurt(25);}
    shots.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;for(const e of enemies){if(e.hp>0&&s.life>0&&dist(e,s)<(e.type==='fish'?40:33)){damageEnemy(e,s.damage);s.life=0;}}if(boss&&boss.hp>0&&s.life>0&&dist(boss,s)<100){boss.hp=Math.max(0,boss.hp-s.damage);boss.hit=.15;s.life=0;burst(s.x,s.y,'#d8fff5',10,100);if(!boss.hp){score+=1200;burst(boss.x,boss.y,'#e0f9ff',80,320);hostileShots=[];portal.open=true;banner('Işık geri döndü.','SON GEÇİDE YÜZ');toast('Koruyucu sakinleşti. Geçit açıldı!');}}});shots=shots.filter(s=>s.life>0);
    hostileShots.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(dist(s,player)<24+s.r){hurt(12);s.life=0;}});hostileShots=hostileShots.filter(s=>s.life>0);if(mode!=='playing')return;
    followers.forEach((f,i)=>{const ahead=i?followers[i-1]:player,tx=ahead.x-player.face*80,ty=ahead.y+Math.sin(time*2+f.phase)*18;f.x=lerp(f.x,tx,1-Math.exp(-dt*3));f.y=lerp(f.y,ty,1-Math.exp(-dt*3));});
    if(pearls>=6&&rescues>=1&&playMode==='adventure'){if(chapter===2&&!boss)spawnBoss();else if(chapter<2&&!portal.open){portal.open=true;toast('Bölgeyi aydınlattın. Haritadaki geçide yüz!');chime();}}
    if(portal.open&&dist(player,portal)<80&&playMode==='adventure'){if(chapter===2){finish(true);return;}chapter++;player.hp=Math.min(player.maxHp,player.hp+35);transition=1;buildChapter();}
    if(playMode==='sprint'&&pearls>=6){pearls=0;collectibles.filter(i=>i.kind==='pearl').forEach(i=>i.alive=true);}
    if(xp>=nextXP&&mode==='playing'&&playMode==='adventure')offerUpgrade();
  }
  function updateEffects(dt){particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy-=dt*12;p.life-=dt;});particles=particles.filter(p=>p.life>0);texts.forEach(t=>{t.y-=32*dt;t.life-=dt;});texts=texts.filter(t=>t.life>0);ghosts.forEach(g=>g.life-=dt);ghosts=ghosts.filter(g=>g.life>0);shake=Math.max(0,shake-dt*35);flash=Math.max(0,flash-dt);transition=Math.max(0,transition-dt);}
  function updateHUD(){
    $('health-label').textContent=Math.ceil(player.hp)+' / '+player.maxHp;$('health-fill').style.width=player.hp/player.maxHp*100+'%';$('energy-fill').style.width=player.energy+'%';$('score').textContent=score.toLocaleString('tr-TR');$('combo').textContent=combo>=5?'×'+Math.min(4,1+Math.floor(combo/5))+' AKINTI SERİSİ':'SEVİYE '+level;
    $('chapter').textContent='0'+(chapter+1)+' · '+chapters[chapter].name.toLocaleUpperCase('tr-TR');$('region').textContent=chapters[chapter].name.toLocaleUpperCase('tr-TR');$('pearls').textContent='◇ '+pearls+' / 6';$('rescues').textContent='Dost '+rescues+' / 1';$('mission').textContent=playMode==='sprint'?'60 saniyede olabildiğince çok ışık topla.':boss&&boss.hp>0?'Koruyucunun karanlığını baloncuklarla dağıt.':portal.open?'Geçit açıldı. Işığı takip et.':'6 inciyi bul, kayıp dostunu kurtar.';$('sprint-timer').textContent=Math.ceil(sprintLeft);
    if(boss){$('boss-fill').style.width=boss.hp/boss.maxHp*100+'%';$('boss-value').textContent=Math.ceil(boss.hp);}
  }
  function sprite(name,x,y,w,h,flip=false,alpha=1,rotation=0){const im=name==='axo'?art.axo:art.sheet;if(!im.complete||!im.naturalWidth)return;ctx.save();ctx.translate(x,y);ctx.rotate(rotation);if(flip)ctx.scale(-1,1);ctx.globalAlpha=alpha;if(name==='axo')ctx.drawImage(im,80,90,1400,820,-w/2,-h/2,w,h);else{const [sx,sy,sw,sh]=crops[name];ctx.drawImage(im,sx,sy,sw,sh,-w/2,-h/2,w,h);}ctx.restore();}
  function glow(x,y,r,color,alpha=.45){ctx.save();ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();}
  function bubble(x,y,r,color='#adffed'){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=1.2;ctx.stroke();ctx.beginPath();ctx.arc(x-r*.28,y-r*.28,r*.28,Math.PI,Math.PI*1.6);ctx.strokeStyle='#edfffa';ctx.stroke();}
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
      drawPortal();
      collectibles.forEach(item=>{if(!item.alive||!visible(item))return;const bob=reduced?0:Math.sin(time*2+item.phase)*7;if(item.kind==='pearl'){glow(item.x,item.y,60,'#fbd785',.3);sprite('pearl',item.x,item.y+bob,64,60);if(dist(item,player)<140)label(item.x,item.y-42,'IŞIK İNCİSİ','#f9e7b3');}else if(item.kind==='baby'){glow(item.x,item.y,80,'#ffadd9',.2);sprite('baby',item.x,item.y+bob,100,79);label(item.x,item.y-55,'KAYIP DOST','#ffcedf');}else{glow(item.x,item.y,17,'#6cffd2',.4);ctx.fillStyle='#b4ffe4';ctx.beginPath();ctx.ellipse(item.x,item.y+bob,5,3,Math.sin(time+item.phase),0,Math.PI*2);ctx.fill();}});
      enemies.forEach(e=>{if(!visible(e))return;const fish=e.type==='fish';glow(e.x,e.y,fish?45:60,fish?'#ff9c51':'#be9cff',.1);sprite(e.type,e.x,e.y,fish?106:80,fish?80:104,fish&&e.vx>0,1+(Math.sin(time*2+e.phase)*.02),fish?Math.sin(time*4+e.phase)*.035:Math.sin(time*2+e.phase)*.05);if(e.hit>0)glow(e.x,e.y,70,'#e1ffff',e.hit*2);if(e.hp<e.maxHp){ctx.fillStyle='#082c38';ctx.fillRect(e.x-24,e.y-62,48,3);ctx.fillStyle='#f8aecb';ctx.fillRect(e.x-24,e.y-62,48*e.hp/e.maxHp,3);}});
      if(boss&&boss.hp>0){glow(boss.x,boss.y,230,'#bb80ff',.2);sprite('jelly',boss.x,boss.y,220+Math.sin(time*2)*8,275,false,1,Math.sin(time)*.07);if(boss.hit>0)glow(boss.x,boss.y,140,'#f1e8ff',.6);}
      followers.forEach(f=>sprite('baby',f.x,f.y,74,54,player.face<0));
      ghosts.forEach(g=>sprite('axo',g.x,g.y,126,74,g.face<0,g.life));
      const playerAlpha=player.inv>0?(Math.sin(time*22)>0?.55:1):1;const tilt=clamp(player.vy*.00055,-.16,.16)*player.face;
      glow(player.x,player.y,95,player.dash>0?'#8fffe0':'#ffaaD4',player.dash>0?.45:.08);sprite('axo',player.x,player.y+(reduced?0:Math.sin(time*4)*2),130,80,player.face<0,playerAlpha,tilt);
      shots.forEach(s=>{glow(s.x,s.y,24,'#a0fff4',.25);bubble(s.x,s.y,s.r);});hostileShots.forEach(s=>{glow(s.x,s.y,30,'#de92ff',.3);ctx.fillStyle='#dea5ff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();});
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
  function drawGuide(){if(mode!=='playing')return;let targets=portal.open?[portal]:boss&&boss.hp>0?[boss]:collectibles.filter(i=>i.alive&&i.kind!=='food');targets.sort((a,b)=>dist(a,player)-dist(b,player));const target=targets[0];if(!target||dist(target,player)<150)return;const dx=target.x-player.x,dy=target.y-player.y,a=Math.atan2(dy,dx),x=player.x+Math.cos(a)*94,y=player.y+Math.sin(a)*94;ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle='#f8e4b5';ctx.globalAlpha=.8;ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(-4,-4);ctx.lineTo(-4,4);ctx.fill();ctx.restore();}
  function drawMap(){mctx.clearRect(0,0,160,95);mctx.fillStyle='#062430';mctx.fillRect(0,0,160,95);const dot=(x,y,r,color)=>{mctx.fillStyle=color;mctx.beginPath();mctx.arc(x/W*160,y/H*95,r,0,Math.PI*2);mctx.fill();};mctx.strokeStyle='#709e9c33';mctx.lineWidth=1;for(let i=1;i<4;i++){mctx.beginPath();mctx.moveTo(i*40,0);mctx.lineTo(i*40,95);mctx.stroke();}collectibles.forEach(i=>{if(i.alive&&i.kind!=='food')dot(i.x,i.y,i.kind==='baby'?3:2,i.kind==='baby'?'#ffb3d6':'#ffe0a1');});enemies.forEach(e=>dot(e.x,e.y,1.5,'#f59aaa'));dot(portal.x,portal.y,3,portal.open?'#a4ffd0':'#608aa0');if(boss&&boss.hp>0)dot(boss.x,boss.y,5,'#ca9cff');dot(player.x,player.y,3,'#e8fff7');mctx.strokeStyle='#cefff037';mctx.strokeRect((camera.x-viewW/2)/W*160,(camera.y-viewH/2)/H*95,viewW/W*160,viewH/H*95);}
  function frame(now){const dt=Math.min((now-last)/1000||.016,.1);last=now;if(!document.hidden){time+=dt;if(mode==='playing'){accumulator+=dt;while(accumulator+1e-9>=1/60){update(1/60);accumulator=Math.max(0,accumulator-1/60);if(mode!=='playing'){accumulator=0;break;}}}else accumulator=0;updateEffects(dt);drawWorld();if(now-hudAt>80){updateHUD();if(mode!=='menu')drawMap();hudAt=now;}if(toastUntil&&time>toastUntil){$('toast').style.opacity='0';toastUntil=0;}if(bannerUntil&&time>bannerUntil){$('region-banner').style.opacity='0';bannerUntil=0;}if(sound&&mode==='playing'&&time>ambientAt){ambientAt=time+2.1;tone([164.81,196,220,293.66][Math.floor(time/2)%4],1.7,'sine',.015);}}requestAnimationFrame(frame);}
  $('adventure').onclick=()=>start('adventure');$('sprint').onclick=()=>start('sprint');$('pause').onclick=pause;$('dialog-home').onclick=home;$('dialog-main').onclick=()=>mode==='paused'?pause():start(playMode);
  $('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Ses açık':'Ses kapalı';$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'Sesi kapat':'Sesi aç');if(!sound&&master)master.gain.value=0;else chime();};
  $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('app').requestFullscreen();}catch{toast('Bu tarayıcıda tam ekran açılamıyor.');}};
  window.addEventListener('keydown',e=>{if(e.target.tagName==='BUTTON'&&(e.key===' '||e.key==='Enter'))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','shift','p','escape'].includes(k)){e.preventDefault();if((k==='p'||k==='escape')&&!e.repeat)pause();else if(k==='shift'&&!e.repeat)dash();else keys.add(k);}});
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{clearInput();if(mode==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing')pause();});
  canvas.addEventListener('pointerdown',e=>{if(!coarse&&mode==='playing'){shootHeld=true;canvas.setPointerCapture(e.pointerId);}});for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>shootHeld=false);
  const pad=$('joystick');function moveJoy(e){const r=pad.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),l=Math.hypot(dx,dy),max=34;joystick.x=dx/Math.max(max,l);joystick.y=dy/Math.max(max,l);$('stick').style.transform='translate('+joystick.x*max+'px,'+joystick.y*max+'px)';}
  pad.addEventListener('pointerdown',e=>{e.preventDefault();joyPointer=e.pointerId;pad.setPointerCapture(e.pointerId);moveJoy(e);});pad.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)moveJoy(e);});for(const type of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(type,e=>{if(e.pointerId===joyPointer){joyPointer=null;joystick.x=0;joystick.y=0;$('stick').style.transform='translate(0px,0px)';}});
  $('touch-dash').onpointerdown=e=>{e.preventDefault();dash();};$('touch-fire').onpointerdown=e=>{e.preventDefault();shootHeld=true;$('touch-fire').setPointerCapture(e.pointerId);};for(const type of ['pointerup','pointercancel','lostpointercapture'])$('touch-fire').addEventListener(type,()=>shootHeld=false);
  function loadAssets(){let pending=Object.values(art).length;const loaded=()=>{if(--pending===0){ready=true;$('adventure').disabled=false;$('sprint').disabled=false;$('load-state').textContent='Hazır · '+(best?'En iyi: '+best:'Kulaklıkla keşfet');}};$('adventure').disabled=true;$('sprint').disabled=true;Object.values(art).forEach(im=>{if(im.complete&&im.naturalWidth)loaded();else{im.onload=loaded;im.onerror=()=>{$('load-state').textContent='Görseller yüklenemedi. Sayfayı yenile.';};}});}
  const state=()=>({mode,playMode,chapter:chapter+1,score,health:Math.ceil(player.hp),maxHealth:player.maxHp,pearls,rescues,totalRescues,level,energy:Math.round(player.energy),bossHealth:boss?.hp??null,portalOpen:portal.open,sprintLeft:Math.ceil(sprintLeft),enemies:enemies.length,position:{x:Math.round(player.x),y:Math.round(player.y)}});
  window.axolotlGame={getState:state,start,pause,chooseUpgrade};
  if(document.modelContext?.registerTool){const lifecycle=new AbortController();const defs=[{name:'read_axolotl_game',description:'Read the axolotl game status, chapter, score, health and objectives.',annotations:{readOnlyHint:true},inputSchema:{type:'object',properties:{},additionalProperties:false},execute(input){if(input&&Object.keys(input).length)throw new Error('No arguments accepted');return state();}},{name:'start_axolotl_game',description:'Start a new axolotl adventure or 60-second sprint, resetting the current run.',annotations:{readOnlyHint:false},inputSchema:{type:'object',properties:{mode:{type:'string',enum:['adventure','sprint']}},additionalProperties:false},execute(input={}){if(Object.keys(input).some(k=>k!=='mode')||(input.mode&&!['adventure','sprint'].includes(input.mode)))throw new Error('Invalid game mode');if(!ready)throw new Error('Assets are not ready');start(input.mode||'adventure');return state();}}];for(const tool of defs){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});}
  loadAssets();requestAnimationFrame(frame);
})();
