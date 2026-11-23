/* V15 progressively enhanced presentation. DOM remains real, accessible and local.
   This file adds no network requests, no third-party trackers and no fabricated app data. */
const pawCards=[...document.querySelectorAll('[data-v15-paw-tab]')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
pawCards.forEach((card,index)=>{
 card.addEventListener('click',()=>{
  const key=card.dataset.v15PawTab;
  const target=document.querySelector('[data-cin13-tour="'+key+'"]');
  if(target){
   target.click();
   document.querySelector('#flow-tour')?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});
   target.focus({preventScroll:true});
  }
 });
 card.addEventListener('keydown',e=>{
  if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
  e.preventDefault();
  const i=e.key==='Home'?0:e.key==='End'?pawCards.length-1:(index+(e.key==='ArrowRight'?1:-1)+pawCards.length)%pawCards.length;
  pawCards[i].focus();
  pawCards[i].scrollIntoView({behavior:reduced?'instant':'smooth',block:'nearest',inline:'nearest'});
 });
});
const hero=document.querySelector('.v15-hero-scene');
if(hero&&!reduced&&matchMedia('(pointer:fine)').matches){
 const orbit=hero.querySelector('.cin-orbit');
 const portrait=hero.querySelector('.v15-hero-portrait');
 let scheduled=false,px=0,py=0;
 hero.addEventListener('pointermove',e=>{
  const box=hero.getBoundingClientRect();
  px=(e.clientX-box.left-box.width/2)/box.width;
  py=(e.clientY-box.top-box.height/2)/box.height;
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
   if(orbit)orbit.style.translate=(px*14).toFixed(1)+'px '+(py*12).toFixed(1)+'px';
   if(portrait)portrait.style.translate=(px*9).toFixed(1)+'px '+(py*7).toFixed(1)+'px';
   scheduled=false;
  });
 },{passive:true});
 hero.addEventListener('pointerleave',()=>{
  if(orbit)orbit.style.translate='';
  if(portrait)portrait.style.translate='';
 });
}
// Provide a real accessible progress indication while a same-origin showcase iframe loads.
const iframe=document.querySelector('#v14-live-frame');
if(iframe){
 const shell=iframe.closest('.v14-live-browser');
 const observe=()=>shell?.setAttribute('aria-busy','true');
 const finish=()=>shell?.setAttribute('aria-busy','false');
 iframe.addEventListener('load',finish);
 document.querySelectorAll('[data-v14-demo]').forEach(btn=>btn.addEventListener('click',observe));
 if(iframe.contentDocument?.readyState==='complete')finish();
}
// Additional language coverage for V15 reference sections; base translator continues
// to own all pre-existing strings and the site remains usable with JS disabled.
const translations={
  '.v15-featured-head>span':['VYBRANÉ PŘÍKLADY / REÁLNÉ STRÁNKY K PROKLIKNUTÍ','FEATURED EXAMPLES / OPEN REAL WORKING PAGES'],
  '.v15-featured-head>a':['Otevřít interaktivní prohlížeč ↗','Open interactive browser ↗'],
  '.v15-feature--timo .v15-feature-badge':['NEOFICIÁLNÍ KONCEPT','UNOFFICIAL CONCEPT'],
  '.v15-feature--agile .v15-feature-badge':['TECHNICKÁ PŘÍPADOVÁ STUDIE','TECHNICAL CASE STUDY'],
  '.v15-feature--paw .v15-feature-badge':['VLASTNÍ ANDROID PROJEKT','IN-HOUSE ANDROID PROJECT'],
  '.v15-feature--timo .v15-feature-copy>small':['Nezávislý e-shop s produktovým katalogem a ukázkovou pokladnou','Independent e-commerce demo with catalogue and sample checkout'],
  '.v15-feature--agile .v15-feature-copy>small':['Struktura pěti typů stránek a osmi jazykových variant','Five page types and eight language variants'],
  '.v15-feature--paw .v15-feature-copy>small':['Tréninkový průvodce s profilem, lekcemi a přehledem pokroku','Dog-training companion with profiles, lessons and progress'],
  '.v15-feature--timo .v15-pill':['Zobrazit projekt ↗','Explore project ↗'],
  '.v15-feature--agile .v15-pill':['Zobrazit studii ↗','Explore case study ↗'],
  '.v15-feature--paw .v15-pill':['Vyzkoušet ukázku ↗','Explore app showcase ↗'],
  '.v15-showroom-head .v10-kicker':['SKUTEČNĚ FUNGUJÍCÍ UKÁZKY','REAL WORKING EXAMPLES'],
  '.v15-showroom-head h2':['Interaktivní <em>live preview.</em>','Interactive <em>live preview.</em>'],
  '.v15-showroom-head p:not(.v10-kicker)':['Prohlížejte skutečné stránky přímo zde. TIMO je neoficiální demo obchod; Agile Europe je naše technická studie; PawMaster používá původní vysvětlující UI, ne reálné screenshoty aplikace.','Explore real pages here. TIMO is an unofficial store demo; Agile Europe is our technical case study; PawMaster uses original explanatory UI, not verified app screenshots.'],
  '.v15-showroom-head>a':['Všechny projekty ↗','All projects ↗'],
  '.v15-showroom-aside h3':['Podívejte se, co stránky <em>opravdu umí.</em>','See what these pages <em>actually do.</em>'],
  '.v15-mobile-heading h2':['Nová mobilní verze.<br><em>Plnohodnotný zážitek.</em>','A new mobile experience.<br><em>Fully considered.</em>'],
  '.v15-brand-top h2':['10 <em>distinct brand worlds.</em>','10 <em>distinct brand worlds.</em>'],
  '.v15-brand-top>a':['Všechny projekty ↗','All projects ↗']
};
function translateV15(code){
 const idx=code==='en'?1:0;
 for(const [sel,pair] of Object.entries(translations)){
  const element=document.querySelector(sel);if(!element)continue;
  if(pair[idx].includes('<'))element.innerHTML=pair[idx];else element.textContent=pair[idx];
 }
}
const languageButtons=[...document.querySelectorAll('[data-language]')];
languageButtons.forEach(button=>button.addEventListener('click',()=>translateV15(button.dataset.language)));
translateV15(document.documentElement.dataset.currentLang||'cs');
