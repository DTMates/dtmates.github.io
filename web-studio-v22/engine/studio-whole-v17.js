/* V17 — progressive interactions for the actual website, zero tracking/storage.
   Screenshots are genuine local Chromium artifacts, not reconstructed fake browser UI.
   Reduced-motion and keyboard support are first-class. */
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sourcePages={
 timo:{
  desktop:'assets/evidence/timo-concept-home-desktop.jpg',
  mobile:'assets/evidence/timo-concept-home-mobile.jpg',
  label:'OVĚŘENÝ VÝSTUP · TIMO',
  title:'Módní e-shop, který lze prokliknout.',
  description:'Produktové varianty, kolekce, košík a ukázková pokladna patří k funkčnímu nezávislému demo obchodu.',
  href:'sites/timo/',
  case:'work/timo-concept/',
  caption:'Neoficiální demo TIMO · /sites/timo/',
  disclaimer:'Nejde o zakázku značky TIMO. Žádné skutečné objednávky ani platby.',
  desktopAlt:'Autentická desktopová obrazovka neoficiálního fungujícího TIMO e-shopu.',
  mobileAlt:'Autentická mobilní obrazovka neoficiálního fungujícího TIMO e-shopu.'
 },
 agile:{
  desktop:'assets/evidence/agile-technical-case-desktop.jpg',
  mobile:'assets/evidence/agile-technical-case-mobile.jpg',
  label:'OVĚŘENÝ VÝSTUP · AGILE TECHNICAL CASE',
  title:'Technická studie s jasným autorstvím.',
  description:'Skutečné prohlížečové záběry naší vlastní technické případové studie. Oficiální firemní web je externí realizace, kterou nepřipisujeme našemu studiu.',
  href:'work/agile-europe/',
  case:'work/#live-examples',
  caption:'DTMates technická studie · /work/agile-europe/',
  disclaimer:'Odkaz na oficiální Agile Europe je uveden samostatně. Veřejný web připisuje realizaci Liquid Design.',
  desktopAlt:'Autentická desktopová obrazovka lokální technické studie Agile Europe, nikoliv oficiální web.',
  mobileAlt:'Autentická mobilní obrazovka lokální technické studie Agile Europe, nikoliv oficiální web.'
 }
};
const tabs=[...document.querySelectorAll('[data-v17-evidence]')];
const panel=document.getElementById('v17-evidence-panel');
if(panel&&tabs.length){
 const get=(sel)=>panel.querySelector(sel);
 function updateEvidence(key){
  const item=sourcePages[key];
  if(!item)return;
  panel.closest('.v17-evidence-section').dataset.v17Brand=key;
  tabs.forEach(tab=>{const active=tab.dataset.v17Evidence===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
  const desktop=get('[data-v17-evidence-desktop]'),mobile=get('[data-v17-evidence-mobile]');
  if(desktop){desktop.src=new URL(item.desktop,import.meta.url).href;desktop.alt=item.desktopAlt}
  if(mobile){mobile.src=new URL(item.mobile,import.meta.url).href;mobile.alt=item.mobileAlt}
  const pair=[
   ['[data-v17-browser-caption]',item.caption],
   ['[data-v17-evidence-label]',item.label],
   ['[data-v17-evidence-title]',item.title],
   ['[data-v17-evidence-description]',item.description],
   ['[data-v17-evidence-disclaimer]',item.disclaimer]
  ];
  for(const [selector,content] of pair){const el=get(selector);if(el)el.textContent=content}
  const link=get('[data-v17-evidence-link]');if(link){link.href=new URL(item.href,import.meta.url).href;link.textContent=key==='agile'?'Otevřít skutečnou studii ↗':'Otevřít skutečné demo ↗'}
  const second=get('[data-v17-evidence-case]');if(second)second.href=new URL(item.case,import.meta.url).href;
 }
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>updateEvidence(tab.dataset.v17Evidence));
  tab.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();
   const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
   tabs[next].click();tabs[next].focus();
  });
 });
 updateEvidence('timo');
}
// Eight real Studio page headers: accessible collapsible navigation on small screens.
const navButton=document.querySelector('.v17-menu-btn');
const nav=document.getElementById('v17-site-nav');
if(nav&&navButton){
 const setMenu=open=>{
  nav.classList.toggle('is-open',open);
  navButton.setAttribute('aria-expanded',String(open));
  navButton.querySelector('[aria-hidden]')?.replaceChildren(document.createTextNode(open?'×':'☰'));
 };
 navButton.addEventListener('click',()=>setMenu(navButton.getAttribute('aria-expanded')!=='true'));
 nav.addEventListener('click',event=>{if(event.target.closest('a'))setMenu(false)});
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&navButton.getAttribute('aria-expanded')==='true'){
   setMenu(false);navButton.focus();
  }
 });
 matchMedia('(min-width:681px)').addEventListener('change',event=>{if(event.matches)setMenu(false)});
}
// Highlight the actual current page without confusing route-specific page animations.
const body=document.body;
if(body.classList.contains('v17-editorial')){
 const match=body.className.match(/\bpage-([a-z-]+)\b/);
 if(match&&nav){for(const a of nav.querySelectorAll('a')){try{const url=new URL(a.href);if(url.pathname.replace(/\/+$/,'').endsWith('/'+match[1]))a.setAttribute('aria-current','page')}catch{}}}
}
// Scroll-reveal only after intersection observer exists, with no hidden initial state
// for reduced-motion, screen readers, old browsers, no-JS, or static snapshots.
if(!reduced&&'IntersectionObserver' in window){
 const targets=[...document.querySelectorAll('.v17-route-scene,.v17-evidence-composition,.v17-proof-screens,.v17-timo-journey-gallery,.v15-featured-grid,.v17-proof-ownership')];
 const observer=new IntersectionObserver((entries,obs)=>{
  for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('v17-shown');obs.unobserve(entry.target)}
 },{threshold:.065,rootMargin:'0px 0px -20px 0px'});
 targets.forEach(el=>el.classList.add('v17-reveal'));
 requestAnimationFrame(()=>{document.documentElement.classList.add('v17-js-animated');targets.forEach(el=>observer.observe(el))});
}
// Gentle pointer depth on source-backed media. No scroll-jacking or continuous animation.
if(!reduced&&matchMedia('(pointer:fine)').matches){
 for(const stage of document.querySelectorAll('.v17-route-art,.v17-evidence-composition,.v17-case-actual')){
  let queued=false,dx=0,dy=0;
  const picture=stage.querySelector('.v17-route-img,.v17-evidence-stage,.v17-case-actual img');
  if(!picture)continue;
  stage.addEventListener('pointermove',e=>{
   const b=stage.getBoundingClientRect();
   dx=((e.clientX-b.left)/Math.max(1,b.width)-.5)*9;
   dy=((e.clientY-b.top)/Math.max(1,b.height)-.5)*7;
   if(queued)return;queued=true;
   requestAnimationFrame(()=>{picture.style.translate=dx.toFixed(1)+'px '+dy.toFixed(1)+'px';queued=false});
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{picture.style.translate=''});
 }
}


/* General app capability demonstration only, not PawMaster or a real ad SDK. */
const appTabs=[...document.querySelectorAll('[data-v17-app-tab]')];
const appPanels=[...document.querySelectorAll('[data-v17-app-panel]')];
const lab=document.querySelector('.v18-app-lab');
if(lab&&appTabs.length===3&&appPanels.length===3){
 const q=selector=>lab.querySelector(selector);
 let completed=1,renamed=false,notifications=true;
 function selectApp(key){
  for(const tab of appTabs){const on=tab.dataset.v17AppTab===key;tab.setAttribute('aria-selected',String(on));tab.tabIndex=on?0:-1}
  for(const panel of appPanels)panel.hidden=panel.dataset.v17AppPanel!==key;
  for(const button of lab.querySelectorAll('[data-v18-bottom]')){
   if(button.dataset.v18Bottom===key)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  }
  q('#v17-app-screen').setAttribute('aria-labelledby','v18-tab-'+key);
 }
 appTabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>selectApp(tab.dataset.v17AppTab));
  tab.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();
   const next=event.key==='Home'?0:event.key==='End'?appTabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+appTabs.length)%appTabs.length;
   appTabs[next].click();appTabs[next].focus();
  });
 });
 lab.querySelectorAll('[data-v18-bottom]').forEach(btn=>btn.addEventListener('click',()=>selectApp(btn.dataset.v18Bottom)));
 q('[data-v18-profile-edit]').addEventListener('click',()=>{
  renamed=!renamed;q('[data-v18-profile-name]').textContent=renamed?'Host':'Alex';
  q('[data-v18-profile-status]').textContent='Modelový profil upraven. Nic se neukládá.';
 });
 q('[data-v18-notifications]').addEventListener('click',()=>{
  notifications=!notifications;const b=q('[data-v18-notifications]');
  b.setAttribute('aria-pressed',String(notifications));b.textContent=notifications?'Zapnuto ✓':'Vypnuto';
  q('[data-v18-profile-status]').textContent='Ukázková preference změněna jen lokálně.';
 });
 function renderProgress(){
  const percent=completed*20;
  q('[data-v18-ring]').style.setProperty('--pct',percent+'%');
  q('[data-v18-ring]').setAttribute('aria-label','Ilustrační pokrok '+percent+' procent');
  q('[data-v18-percent]').textContent=percent+' %';
  for(const li of lab.querySelectorAll('[data-v18-task]'))li.classList.toggle('complete',+li.dataset.v18Task<=completed);
  q('[data-v18-next]').disabled=completed===5;q('[data-v18-next]').textContent=completed===5?'Dokončeno ✓':'Další krok →';
  q('[data-v18-progress-status]').textContent='Dokončeno '+completed+' z 5 ukázkových kroků.';
 }
 q('[data-v18-next]').addEventListener('click',()=>{completed=Math.min(5,completed+1);renderProgress()});
 q('[data-v18-reset]').addEventListener('click',()=>{completed=1;renderProgress()});
 lab.querySelectorAll('[data-v18-ads-mode]').forEach(btn=>btn.addEventListener('click',()=>{
  const premium=btn.dataset.v18AdsMode==='premium';
  for(const b of lab.querySelectorAll('[data-v18-ads-mode]'))b.setAttribute('aria-pressed',String(b===btn));
  q('[data-v18-ad-example]').hidden=premium;q('[data-v18-premium-example]').hidden=!premium;
  q('[data-v18-ads-status]').textContent=premium?'Bez reklam, bez skutečné platby.':'Fiktivní reklamní umístění, bez skutečných reklam.';
 }));
 selectApp('profile');renderProgress();
}

/* Owner review: expand only images already present in the audited repository.
   Native <dialog> keeps keyboard focus inside; source attribution stays visible. */
const proofTriggers=[...document.querySelectorAll('[data-v17-expand]')];
if(proofTriggers.length&&typeof HTMLDialogElement!=='undefined'){
 const proofDialog=document.createElement('dialog');
 proofDialog.className='v17-proof-dialog';
 proofDialog.setAttribute('aria-labelledby','v17-proof-dialog-title');
 proofDialog.innerHTML=`<div class="v17-proof-dialog-top"><div><span>DTMATES / ZDROJOVÉ MÉDIUM</span><h2 id="v17-proof-dialog-title"></h2></div><button type="button" data-v17-dialog-close aria-label="Zavřít zvětšený obrázek">×</button></div><div class="v17-proof-dialog-devices" role="group" aria-label="Zobrazení snímku"><button type="button" data-v17-dialog-device="desktop">Desktop</button><button type="button" data-v17-dialog-device="mobile">Mobil</button></div><figure><img data-v17-dialog-image alt=""><figcaption data-v17-dialog-caption></figcaption></figure><p class="v17-proof-dialog-legal" data-v17-dialog-disclaimer></p>`;
 document.body.append(proofDialog);
 const read=selector=>proofDialog.querySelector(selector);
 const image=read('[data-v17-dialog-image]');
 let variants=[],active=0,returnFocus=null,disclaimer='';
 function renderProof(index){
  if(!variants[index])return;
  active=index;
  const item=variants[active];
  image.src=item.src;image.alt=item.alt;
  read('#v17-proof-dialog-title').textContent=item.title;
  read('[data-v17-dialog-caption]').textContent=item.caption;
  read('[data-v17-dialog-disclaimer]').textContent=disclaimer;
  for(const button of proofDialog.querySelectorAll('[data-v17-dialog-device]')){
   const isActive=button.dataset.v17DialogDevice===item.kind;
   button.setAttribute('aria-pressed',String(isActive));
   button.disabled=!variants.some(part=>part.kind===button.dataset.v17DialogDevice);
  }
 }
 function sourceFor(trigger){
  const route=trigger.closest('.v17-route-scene');
  if(route){
   const desktop=route.querySelector('.v17-route-img'),mobile=route.querySelector('.v17-route-phone img');
   const title=route.querySelector('.v17-route-copy h2')?.textContent||'Originální ukázka DTMates';
   disclaimer='Projektová média ze zdrojového repozitáře DTMates. Ukázky nejsou tvrzením o zakázce nebo externí produkční realizaci.';
   const sources=[...route.querySelectorAll('.v18-proof-pairs a strong')].map(x=>x.textContent.replace(' ↗',''));
   return [desktop,mobile].filter(Boolean).map((img,i)=>({kind:i?'mobile':'desktop',src:img.currentSrc||img.src,alt:img.alt,title:sources[i]||title,caption:(i?'Doprovodná samostatná ukázka':'Hlavní původní ukázka')+' · '+(sources[i]||img.alt)}));
  }
  const chosen=tabs.find(tab=>tab.getAttribute('aria-selected')==='true')?.dataset.v17Evidence||'timo';
  const item=sourcePages[chosen];
  if(!item)return [];
  disclaimer=item.disclaimer;
  const label=chosen==='agile'?'Agile Europe · naše technická studie':'TIMO · nezávislé demo';
  return [
   {kind:'desktop',src:new URL(item.desktop,import.meta.url).href,alt:item.desktopAlt,title:label,caption:item.caption+' · desktop'},
   {kind:'mobile',src:new URL(item.mobile,import.meta.url).href,alt:item.mobileAlt,title:label,caption:item.caption+' · mobil'}
  ];
 }
 for(const trigger of proofTriggers)trigger.addEventListener('click',()=>{
  variants=sourceFor(trigger);
  if(!variants.length)return;
  returnFocus=trigger;
  const index=trigger.dataset.v17Expand==='mobile'?1:0;
  renderProof(Math.min(index,variants.length-1));
  proofDialog.showModal();
  read('[data-v17-dialog-close]').focus();
 });
 read('[data-v17-dialog-close]').addEventListener('click',()=>proofDialog.close());
 for(const btn of proofDialog.querySelectorAll('[data-v17-dialog-device]'))btn.addEventListener('click',()=>{
  const idx=variants.findIndex(item=>item.kind===btn.dataset.v17DialogDevice);
  if(idx>=0)renderProof(idx);
 });
 proofDialog.addEventListener('click',event=>{if(event.target===proofDialog)proofDialog.close()});
 proofDialog.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight'].includes(event.key)||event.target.tagName==='BUTTON')return;
  event.preventDefault();
  renderProof((active+(event.key==='ArrowRight'?1:-1)+variants.length)%variants.length);
 });
 proofDialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus()});
}


/* The PawMaster five-step demo lives in its separate case study. */

/* V18 home-only section navigator: local, no tracking or persistence. */
const homeNav=document.querySelector('.v18-home-routebar');
if(homeNav){
 const links=[...homeNav.querySelectorAll('.v18-route-links a')];
 const sections=links.map(a=>document.getElementById(a.hash.slice(1)));
 const progress=homeNav.querySelector('[data-v18-scroll-progress]');
 const number=homeNav.querySelector('[data-v18-scroll-number]');
 let ticking=false;
 function update(){
  ticking=false;
  const marker=window.scrollY+Math.min(window.innerHeight*.52,480);
  let active=0;
  sections.forEach((section,i)=>{if(section&&section.getBoundingClientRect().top+window.scrollY<=marker)active=i});
  links.forEach((link,i)=>{if(i===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
  if(number)number.textContent=String(active+1).padStart(2,'0');
  const all=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
  if(progress)progress.style.transform='scaleX('+Math.min(1,Math.max(0,window.scrollY/all))+')';
 }
 window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
 window.addEventListener('resize',update,{passive:true});
 update();
}

/* V19 meaningful motion across Studio site, driven by real sections rather than fake media. */
if(!reduced&&'IntersectionObserver' in window){
 const items=[...document.querySelectorAll('.v15-featured .v15-feature,.v10-project-card,.v17-evidence-section,.v15-showroom,.v11-apps,.v15-mobile-gallery,.v15-brand-constellation,.v10-services,.v10-price,.v10-final,.v17-route-scene')].filter(el=>el.getClientRects().length);
 const io=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('v19-reveal-done');io.unobserve(entry.target)}
 },{rootMargin:'0px 0px -9% 0px',threshold:.04});
 for(const el of items){
  el.classList.add('v19-main-reveal');
  if(el.getBoundingClientRect().top<innerHeight*.9)el.classList.add('v19-reveal-done');else io.observe(el);
 }
 document.documentElement.classList.add('v19-main-motion-ready');
}
const pawLesson=document.querySelector('.v16-paw-trainer');
if(pawLesson&&!reduced){
 pawLesson.querySelectorAll('[data-v16-trainer]').forEach(button=>button.addEventListener('click',()=>{
  pawLesson.classList.remove('v19-lesson-updated');
  requestAnimationFrame(()=>pawLesson.classList.add('v19-lesson-updated'));
 }));
}
