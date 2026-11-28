/* V16 final: true interactive portfolio identities, no third-party API or tracking.
   All ten image paths are exact assets already present in the audited project. */
const brandChoices=[...document.querySelectorAll('[data-v16-brand]')];
const stage=document.querySelector('[data-v16-brand-stage]');
const brandTitle=document.getElementById('v16-brand-title');
const brandDescription=document.getElementById('v16-brand-description');
const brandCounter=document.getElementById('v16-brand-counter');
const brandFont=document.getElementById('v16-brand-style');
const brandLink=document.getElementById('v16-brand-open');
const brandImage=document.getElementById('v16-brand-image');
const brandUrl=document.getElementById('v16-brand-url');
const brands={
 cafe:{title:'MÍSTO',category:'CAFÉ',font:'Young Serif · Chivo',path:'sites/cafe/',image:'assets/showcase/art-cafe.jpg',cs:'Editorial kavárna. Teplý papír, výrazná typografie a atmosféra značky.',en:'Editorial café. Warm paper, distinctive typography and welcoming brand atmosphere.'},
 blackline:{title:'Blackline',category:'MOTORSPORT',font:'Barlow Condensed · Barlow',path:'sites/blackline/',image:'assets/showcase/art-blackline.jpg',cs:'Výrazná motorsport identita, výrazný kontrast a technické služby.',en:'Industrial motorsport identity, sharp contrast and technical service journeys.'},
 hotel:{title:'Atelier Hotel',category:'HOSPITALITY',font:'Cormorant Garamond · Instrument Sans',path:'sites/hotel/',image:'assets/showcase/art-hotel.jpg',cs:'Butikový hotel s obrazovým vyprávěním a modelem rezervací.',en:'Boutique hotel with photography-led storytelling and a reservation demo.'},
 wellness:{title:'MIRA',category:'WELLNESS',font:'Instrument Serif · Mulish',path:'sites/wellness/',image:'assets/showcase/art-wellness.jpg',cs:'Klidná wellness estetika s organickými tvary a jemnou typografií.',en:'Calm wellness experience with organic forms and delicate editorial typography.'},
 realty:{title:'FORMA Living',category:'REAL ESTATE',font:'DM Serif Text · Rethink Sans',path:'sites/realty/',image:'assets/showcase/art-realty.jpg',cs:'Architektonický realitní katalog s přehledným filtrováním.',en:'Architectural property catalogue with purposeful filtering.'},
 electric:{title:'VOLTservis',category:'ENGINEERING',font:'Archivo Black · Barlow Semi Condensed',path:'sites/electric/',image:'assets/showcase/art-electric.jpg',cs:'Technický servis ve stylu průmyslového pracovního listu.',en:'Engineering service presented through an industrial work-order design language.'},
 dental:{title:'Nova Dental',category:'HEALTHCARE',font:'Atkinson Hyperlegible Next · Source Sans 3',path:'sites/dental/',image:'assets/showcase/art-dental.jpg',cs:'Zdravotní web s důrazem na přístupnost, čitelnost a objednání.',en:'Healthcare website focused on accessibility, clarity and appointments.'},
 bloom:{title:'Bloom',category:'FLOWERS',font:'Bricolage Grotesque · Nunito',path:'sites/bloom/',image:'assets/showcase/art-bloom.jpg',cs:'Barevný květinový obchod s hravými kompozicemi a katalogem.',en:'Expressive flower shop with playful composition and product catalogue.'},
 timo:{title:'FORME Concept',category:'UNOFFICIAL E-COMMERCE DEMO',font:'Gloock · DM Sans',path:'sites/timo/',image:'assets/showcase/art-timo.jpg',cs:'Neoficiální módní e-shop koncept s katalogem, variantami a ukázkovým košíkem.',en:'Uncommissioned fashion store demo with collections, product variants and sample basket.'},
 signal:{title:'Signal',category:'SOFTWARE',font:'Geist · Inter',path:'sites/signal/',image:'assets/showcase/art-signal.jpg',cs:'Funkční produktový dashboard s analytickým přehledem a interakcemi.',en:'Functional software dashboard with data visualization and interactions.'}
};
let selectedBrand='cafe';
let language=document.documentElement.dataset.currentLang==='en'?'en':'cs';
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function renderBrand(key){
 const item=brands[key];
 if(!item||!stage)return;
 selectedBrand=key;
 stage.dataset.v16BrandStage=key;
 brandChoices.forEach(button=>{
  button.setAttribute('aria-pressed',String(button.dataset.v16Brand===key));
 });
 const index=Object.keys(brands).indexOf(key);
 if(brandCounter)brandCounter.textContent=String(index+1).padStart(2,'0')+' / 10 · '+item.category;
 if(brandTitle)brandTitle.textContent=item.title;
 if(brandDescription)brandDescription.textContent=item[language];
 if(brandFont)brandFont.textContent=item.font;
 if(brandUrl)brandUrl.textContent='/'+item.path;
 if(brandLink)brandLink.href=new URL(item.path,import.meta.url).href;
 if(brandImage){
  const src=new URL(item.image,import.meta.url).href;
  if(brandImage.src!==src)brandImage.src=src;
  brandImage.alt=(language==='cs'?'Skutečná ukázka našeho fungujícího oborového demo webu ':'Actual screenshot from our working independent demo website ')+item.title;
 }
 if(!reducedMotion){
  stage.classList.remove('is-switching');
  requestAnimationFrame(()=>stage.classList.add('is-switching'));
 }
}
brandChoices.forEach((button,index)=>{
 button.addEventListener('click',()=>renderBrand(button.dataset.v16Brand));
 button.addEventListener('keydown',e=>{
  if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
  e.preventDefault();
  const next=e.key==='Home'?0:e.key==='End'?brandChoices.length-1:(index+(e.key==='ArrowRight'?1:-1)+brandChoices.length)%brandChoices.length;
  brandChoices[next].click();
  brandChoices[next].focus();
  brandChoices[next].scrollIntoView({behavior:reducedMotion?'instant':'smooth',inline:'nearest',block:'nearest'});
 });
});
const translations={
 brandEyebrow:['JINÝ OBOR / JINÁ TYPOGRAFIE / JINÝ ZÁŽITEK','NEW INDUSTRY / NEW TYPOGRAPHY / NEW EXPERIENCE'],
 brandIntro:['Deset samostatných fungujících webů s vlastní typografií, fotografiemi a chováním. Zvolte značku a podívejte se na skutečný výstup.','Ten independently functioning websites, each with its own fonts, visuals and interactions. Select a brand to inspect the real output.'],
 allProjects:['Všechny projekty ↗','All projects ↗'],
 interactiveDemo:['Funkční interaktivní demo','Working interactive demo'],
 openBrand:['Otevřít tento web','Open this website'],
 conceptDisclaimer:['Oborové ukázky představují vlastní demonstrační návrhy, nikoli klientské zakázky.','Industry examples are independent demonstrations, not commissioned client work.'],
 selectBrandHelp:['Vyberte jednu ze značek výše. Náhled se skutečně změní — nejen barva, ale také písmo a kompozice.','Select a brand above. The actual preview, type, layout and colors change — not just the theme color.'],
 liveExamples:['Otevřít živé ukázky ↗','Open live examples ↗'],
 swipeExamples:['Vyberte příklad nebo posuňte galerii','Pick a site or scroll the gallery']
};
const extraEnglish={
 '.v15-mobile-heading .v10-kicker':'DESKTOP & MOBILE ARE EQUAL DELIVERABLES',
 '.v15-mobile-heading>p':'Distinctive mobile experiences. Three of these captures are real demo websites; PawMaster shows an explicitly illustrative concept, not an app-store screenshot.',
 '.v15-mobile-bottom>span':'Functional websites with responsive layouts.',
 '.v15-mobile-bottom>a':'Explore all ten examples ↗',
 '.v15-brand-bottom>a':'Explore interactive demos ↗',
 '.v15-showroom-aside .v15-aside-kicker':'REAL WEBSITES / ORIGINAL EXAMPLES',
 '.v15-showroom-aside>article:nth-of-type(1) h4':'A genuinely interactive journey',
 '.v15-showroom-aside>article:nth-of-type(1) p':'Explore catalogues, pages, interactions and a sample basket.',
 '.v15-showroom-aside>article:nth-of-type(2) h4':'Desktop & mobile',
 '.v15-showroom-aside>article:nth-of-type(2) p':'Actually switch the viewport of the working website.',
 '.v15-showroom-aside>article:nth-of-type(3) h4':'Original content & sources',
 '.v15-showroom-aside>article:nth-of-type(3) p':'Images from our demos, documented authorship and clear links.'
};
const extraCzech={
 '.v15-mobile-heading .v10-kicker':'DESKTOP A MOBIL JAKO ROVNOCENNÉ VÝSTUPY',
 '.v15-mobile-heading>p':'Různorodé mobilní průchody. Tři ukázky jsou skutečné záběry fungujících demo webů; PawMaster ukazuje výslovně označený koncept, nikoliv screenshot z obchodu s aplikacemi.',
 '.v15-mobile-bottom>span':'Funkční weby s responzivními styly.',
 '.v15-mobile-bottom>a':'Všech 10 oborových ukázek ↗',
 '.v15-brand-bottom>a':'Otevřít interaktivní ukázky ↗',
 '.v15-showroom-aside .v15-aside-kicker':'REÁLNÉ WEBY / VLASTNÍ PŘÍKLADY',
 '.v15-showroom-aside>article:nth-of-type(1) h4':'Opravdu funkční průchod',
 '.v15-showroom-aside>article:nth-of-type(1) p':'Otevřete katalog, stránky, interakce a ukázkový košík.',
 '.v15-showroom-aside>article:nth-of-type(2) h4':'Desktop & mobil',
 '.v15-showroom-aside>article:nth-of-type(2) p':'Skutečně přepínatelné rozvržení živého náhledu.',
 '.v15-showroom-aside>article:nth-of-type(3) h4':'Původní obsah a zdroje',
 '.v15-showroom-aside>article:nth-of-type(3) p':'Obrázky našich konceptů, zdokumentované autorství a jasné odkazy.'
};
function translateCurrent(){
 document.querySelectorAll('[data-v16-translate]').forEach(el=>{
  const pair=translations[el.dataset.v16Translate];
  if(pair)el.textContent=pair[language==='en'?1:0];
 });
 const extra=language==='en'?extraEnglish:extraCzech;
 Object.entries(extra).forEach(([selector,value])=>{
  const el=document.querySelector(selector);
  if(el)el.textContent=value;
 });
 renderBrand(selectedBrand);
}
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{
 language=button.dataset.language==='en'?'en':'cs';
 translateCurrent();
}));
if(brandChoices.length){renderBrand('cafe');translateCurrent();}
// A real, accessible carousel control on narrow screens; on large screens all four phones are visible.
const reel=document.querySelector('.v15-mobile-phone-reel');
document.querySelectorAll('[data-v16-gallery]').forEach(button=>{
 button.addEventListener('click',()=>{
  if(!reel)return;
  const card=reel.querySelector('.v15-mobile-phone');
  const gap=parseFloat(getComputedStyle(reel).gap)||0;
  const amount=(card?.getBoundingClientRect().width||240)+gap;
  reel.scrollBy({left:(button.dataset.v16Gallery==='next'?1:-1)*amount,behavior:reducedMotion?'instant':'smooth'});
 });
});
// Don't hide page content from non-JS users, reduced-motion visitors or screenshot crawlers.
const floating=document.querySelector('.v16-brand-stage-art img');
if(floating){
 floating.addEventListener('load',()=>{
  const stageEl=floating.closest('.v16-brand-stage');
  if(stageEl)stageEl.classList.remove('is-switching');
 });
}


/* PawMaster original local UX proof: real five-state transitions, illustrative content only.
   No storage, requests or actual user/dog data. */
const trainer=document.querySelector('.v16-paw-trainer');
if(trainer){
 const steps=[
  {title:'Klidný začátek.',description:'Připravte prostředí bez rušivých podnětů a zvolte krátkou chvíli, kdy se pes může soustředit.'},
  {title:'Jasný povel.',description:'Zvolte krátký, konzistentní signál „Zůstaň“ a připravte se odměnit správnou reakci.'},
  {title:'Malá výdrž.',description:'Procvičujte krátký okamžik klidu. Přiměřené tempo je důležitější než rychlé výsledky.'},
  {title:'Ocenění pokroku.',description:'Pozitivně označte úspěšný okamžik a nabídněte odměnu. Zůstaňte u jasných kroků.'},
  {title:'Hotový ukázkový krok.',description:'Pět kroků je dokončeno. Tato obrazovka pouze simuluje logiku průchodu lekcí; nic se neukládá.'}
 ];
 let current=0;
 const title=trainer.querySelector('[data-v16-trainer-title]');
 const description=trainer.querySelector('[data-v16-trainer-description]');
 const counter=trainer.querySelector('[data-v16-trainer-count]');
 const status=trainer.querySelector('[data-v16-trainer-status]');
 const progress=trainer.querySelector('[data-v16-trainer-progress]');
 const fill=trainer.querySelector('[data-v16-trainer-fill]');
 const percent=trainer.querySelector('[data-v16-trainer-percent]');
 const marks=[...trainer.querySelectorAll('.v16-paw-trainer-steps span')];
 const prev=trainer.querySelector('[data-v16-trainer=prev]');
 const next=trainer.querySelector('[data-v16-trainer=next]');
 function renderStep(){
  const value=current+1;
  title.textContent=steps[current].title;
  description.textContent=steps[current].description;
  counter.textContent=String(value).padStart(2,'0')+' / 05';
  status.textContent=current===4?'UKÁZKOVÁ LEKCE DOKONČENA':'UKÁZKOVÁ LEKCE';
  progress.setAttribute('aria-valuenow',String(value));
  fill.style.width=(value*20)+'%';
  percent.textContent=(value*20)+' %';
  marks.forEach((el,i)=>{
   el.classList.toggle('is-current',i===current);
   el.classList.toggle('is-done',i<current);
  });
  prev.disabled=current===0;
  next.disabled=current===4;
  next.textContent=current===4?'Dokončeno ✓':'Další krok →';
 }
 trainer.addEventListener('click',event=>{
  const control=event.target.closest('button[data-v16-trainer]');
  if(!control)return;
  if(control.dataset.v16Trainer==='prev')current=Math.max(0,current-1);
  if(control.dataset.v16Trainer==='next')current=Math.min(4,current+1);
  if(control.dataset.v16Trainer==='reset')current=0;
  renderStep();
 });
 renderStep();
}
