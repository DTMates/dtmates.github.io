/* V12 progressive enhancement for real Studio HTML: no framework or private data required. */
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollbar=document.createElement('div');scrollbar.className='cin-scrollbar';scrollbar.setAttribute('aria-hidden','true');document.body.prepend(scrollbar);
let scrollScheduled=false;
const updateScroll=()=>{
 const max=document.documentElement.scrollHeight-innerHeight;
 scrollbar.style.width=max>0?Math.min(100,Math.max(0,scrollY/max*100)).toFixed(2)+'%':'0%';
 scrollScheduled=false;
};
addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(updateScroll)}},{passive:true});
addEventListener('resize',()=>{requestAnimationFrame(updateScroll)},{passive:true});updateScroll();
if('IntersectionObserver' in window && !reduced){
 const revealTargets=qa('.v10-section-heading,.v10-project-card,.v11-app-feature,.v11-web-tier,.v11-care-grid article,.cin-step,.cin-trust article,.v10-data-cards article,.production .production-work article,.production .production-price article,.v11-case-flow-grid article');
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target)}},{rootMargin:'0px 0px -45px 0px',threshold:.06});
 revealTargets.forEach(el=>el.classList.add('cin-reveal'));revealTargets.forEach(el=>observer.observe(el));document.documentElement.classList.add('cin-js-ready');
}
if(matchMedia('(pointer:fine)').matches && !reduced){
 qa('.v10-project-card,.cin-spotlight,.production .production-work article').forEach(el=>{
  let queued=false,x=0,y=0;
  el.classList.add('cin-spotlight');
  el.addEventListener('pointermove',event=>{const rect=el.getBoundingClientRect();x=event.clientX-rect.left;y=event.clientY-rect.top;if(!queued){queued=true;requestAnimationFrame(()=>{el.style.setProperty('--mx',x+'px');el.style.setProperty('--my',y+'px');queued=false})}},{passive:true});
 });
}
// Actual project selector: the four existing project buttons are keyboard-operable
// through the V10 controlled project-preview state. Arrow keys move between them.
const previewButtons=qa('[data-preview]');
if(previewButtons.length){
 const activate=i=>{const button=previewButtons[(i+previewButtons.length)%previewButtons.length];button.click();button.focus()};
 previewButtons.forEach((button,index)=>button.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'){event.preventDefault();activate(index+1)}
  if(event.key==='ArrowLeft'){event.preventDefault();activate(index-1)}
  if(event.key==='Home'){event.preventDefault();activate(0)}
  if(event.key==='End'){event.preventDefault();activate(previewButtons.length-1)}
 }));
}
// Filters are real: build on V10 filter, add arrow-key cycling and visible counts.
const filterButtons=qa('[data-filter]');
if(filterButtons.length){
 const count=q('#cin-project-count');
 filterButtons.forEach((button,index)=>{button.addEventListener('click',()=>{if(count){const visible=qa('.v10-project-grid [data-project-type]').filter(el=>!el.hidden).length;count.textContent=String(visible)+' '+(visible===1?'ukázka':'ukázek')}});button.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();const delta=event.key==='ArrowRight'?1:-1;filterButtons[(index+delta+filterButtons.length)%filterButtons.length].click();filterButtons[(index+delta+filterButtons.length)%filterButtons.length].focus()}})});
}
// Accessible local carousel controls for horizontal project strip; not fake buttons.
const projectStrip=q('.v10-switch-buttons');
qa('[data-cin-cycle]').forEach(button=>button.addEventListener('click',()=>{
 const direction=button.dataset.cinCycle==='next'?1:-1;
 const active=previewButtons.findIndex(el=>el.getAttribute('aria-pressed')==='true');
 previewButtons[(active+direction+previewButtons.length)%previewButtons.length]?.click();
 projectStrip?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'nearest',inline:'nearest'});
}));
// Open all external branded demos only through existing real routes, never create phantom bookings.
qa('a[href^="https://"]').forEach(a=>{if(a.target==='_blank'){a.rel='noopener noreferrer'}});
// Reveal a brief label for non-client demos without overriding independent demo layouts.
qa('.v10-project-card').forEach(card=>{card.addEventListener('focusin',()=>card.classList.add('cin-keyboard-hover'));card.addEventListener('focusout',()=>card.classList.remove('cin-keyboard-hover'))});


/* Services route: real, keyboard accessible visual preview of three retained demo sites. */
const sectorTabs=qa('[data-cin-service]');
const sectorData={
 cafe:{image:'assets/showcase/art-cafe.jpg',name:'Kavárna MÍSTO',eyebrow:'POHOSTINSTVÍ / EDITORIAL',description:'Typografie, sezónní nabídka, menu a přímá cesta k návštěvě. Kompozice se zásadně liší od e-shopu a hotelu.',alt:'Existující originální ukázka designu kavárny MÍSTO'},
 hotel:{image:'assets/showcase/art-hotel.jpg',name:'Atelier Hotel',eyebrow:'HOSPITALITY / FOTOGRAFIE',description:'Atmosférické fotografie, výrazná typografie, stránky jednotlivých pokojů a demonstrace rezervace.',alt:'Existující originální ukázka designu Atelier Hotel'},
 timo:{image:'assets/showcase/art-timo.jpg',name:'FORME · neoficiální koncept',eyebrow:'E-COMMERCE / PRODUKTOVÝ DESIGN',description:'Produktový katalog, velikosti, varianty, seznam přání a ukázková pokladna. Jde o neoficiální koncepční demonstraci.',alt:'Existující originální ukázka neoficiálního FORME e-shop konceptu'}
};
function selectSector(key){
 const v=sectorData[key];if(!v)return;
 sectorTabs.forEach(tab=>{const active=tab.dataset.cinService===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1});
 const img=q('#cin-service-image'),title=q('#cin-service-title'),eyebrow=q('#cin-service-eyebrow'),desc=q('#cin-service-description'),link=q('#cin-service-open');
 if(img){img.src=new URL(v.image,import.meta.url).href;img.alt=v.alt}
 if(title)title.textContent=v.name;
 if(eyebrow)eyebrow.textContent=v.eyebrow;
 if(desc)desc.textContent=v.description;
 if(link)link.href=new URL('sites/'+key+'/',import.meta.url).href;
}
sectorTabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>selectSector(tab.dataset.cinService));
 tab.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'||e.key==='Home'||e.key==='End'){
   e.preventDefault();const target=e.key==='Home'?0:e.key==='End'?sectorTabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+sectorTabs.length)%sectorTabs.length;
   sectorTabs[target].click();sectorTabs[target].focus()
  }
 });
});
