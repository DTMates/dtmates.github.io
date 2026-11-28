/* DTMates Web Studio — accessible client-side presentation controls. No customer data leaves the page. */
const $ = (selector,root=document)=>root.querySelector(selector);
const $$ = (selector,root=document)=>[...root.querySelectorAll(selector)];
const showcases={
  agile:{image:'assets/visuals/agile-landscape.svg',title:'Agile Europe',url:'Agile Europe · jazykový web',category:'PŘÍPADOVÁ STUDIE',descriptor:'5 typů stránek · 8 jazyků',href:'work/agile-europe/',alt:'Grafická ilustrace větrné energetiky pro případovou studii Agile Europe'},
  timo:{image:'assets/showcase/art-timo.jpg',title:'FORME',url:'FORME · e-commerce demo',category:'NEOFICIÁLNÍ KONCEPT',descriptor:'Katalog · velikosti · nákupní košík',href:'work/timo-concept/',alt:'Náhled neoficiálního demo e-shopu FORME'},
  hotel:{image:'assets/showcase/art-hotel.jpg',title:'Atelier Hotel',url:'Atelier Hotel · hotelový web',category:'NEZÁVISLÁ UKÁZKA',descriptor:'Pokoje · galerie · rezervace',href:'sites/hotel/',alt:'Náhled fiktivního hotelového webu Atelier Hotel'},
  signal:{image:'assets/showcase/art-signal.jpg',title:'Signal',url:'Signal · analytická aplikace',category:'NEZÁVISLÁ UKÁZKA',descriptor:'Dashboard · data · interakce',href:'sites/signal/',alt:'Náhled fiktivní dashboard aplikace Signal'}
};
const english={
skip:'Skip to content',navHome:'Home',navWork:'Projects',navServices:'Services',navPricing:'Pricing',navStart:'Get started',ctaQuote:'Get a quote',eyebrow:'Digital studio · Prague',
hero1:'DTMates Web Studio',hero2:'Websites, apps and digital products',hero3:'with a distinctive identity.',
heroLead:'We design distinctive websites, online stores and digital products. We connect visual design, functionality and the customer journey — from the first idea to a usable result.',
viewProjects:'Create your brief',ourServices:'Explore examples',statsPages:'page types in the case study',statsLang:'language versions of Agile Europe',statsDemos:'independent demo websites',
projectPreview:'FEATURED PROJECT',viewCase:'View project ↗',
ribbon1:'Custom websites',ribbon2:'E-commerce',ribbon3:'Multilingual projects',ribbon4:'Apps & integrations',
pickedLabel:'SELECTED PROJECTS',projectsH1:'Selected',projectsH2:'work.',
projectsSub:'From multilingual corporate websites to online stores, hotel booking experiences and analytics software. Every project has a distinct visual identity.',
allProjects:'All projects ↗',all:'All',filterCorporate:'Corporate',filterShop:'Online stores',filterHospitality:'Hospitality & services',filterApp:'Applications',
agileDesc:'Multilingual corporate site · technical case study',timoDesc:'Collections, product options and a demo basket',hotelDesc:'Atmosphere, rooms and booking demo',signalDesc:'Interactive product and data interface',
projectNote:'The industry websites are design demonstrations. Agile Europe is a separate, source-backed case study; FORME is not an official client commission.',
servicesLabel:'SERVICES & SOLUTIONS',servicesH1:'Digital',servicesH2:'experiences.',
servicesIntro:'From a first website to a product store and a tailored application. We help choose what works for your business and future operations.',
service1:'Business websites',service2:'E-commerce & catalogues',service3:'Multilingual websites',service4:'Apps & integrations',service5:'Support & evolution',
serviceDetails:'Explore services',serviceCard:'Design and function in harmony.',
pricingLabel:'PRICING & SCOPE',pricingHeadline:'A clear start.<br><em>Thoughtfully scoped.</em>',
pricingText:'Illustrative starting points for websites and online stores. The final offer depends on actual scope, content, integrations and operational requirements.',
priceTabWeb:'Websites',priceTabShop:'E-commerce',startTierText:'Essential business website, key pages and a clear brief.',
growthTierText:'More pages, galleries and room for growth.',
customTierText:'Bespoke design, functionality, integrations and expansion.',
featured:'POPULAR CHOICE',chooseTier:'Choose this plan ↗',requestQuote:'Request a quote ↗',
storefrontText:'A clear shopping experience for smaller catalogues and an agreed checkout flow.',
managedText:'A store with ongoing management and connected processes.',
customShopText:'Custom features, inventory systems and complex integrations.',
byScope:'Quoted by scope',products:'Products & variants',cart:'Cart & checkout',productManagement:'Catalogue management',checkoutIntegrations:'Payments & shipping after approval',
operations:'Operational support',customProduct:'Custom product model',externalApi:'External integrations',ownershipChoice:'Data & ownership choices',requestShop:'Request a store ↗',
priceCaveat:'Website plan prices are preliminary models. E-commerce requires a separate quote covering data, payments, shipping and operations. Demo stores do not place real orders.',
allPricing:'Detailed pricing ↗',dataLabel:'OPERATIONS & DATA',dataHead1:'Your store.',dataHead2:'Your choice.',
dataIntro:'Product data and orders are too important to postpone until after visual design. We agree upfront on ownership, access, operations and handover.',
dataMore:'Explore e-commerce options ↗',managedDataH:'Managed infrastructure',managedDataP:'An agreed managed operating environment, with backup, access and export conditions defined before launch.',
ownDataH:'Your own infrastructure',ownDataP:'Connect an existing commerce platform, account, hosting or database. Integration feasibility and responsibilities are confirmed individually.',
startLabel:'START A PROJECT',startH1:'Start',startH2:'something.',
startIntro:'Tell us what you want to create. Put together a brief, compare the scope and save a summary for your next decision.',
startCta:'Create a brief',final1:'One idea.',final2:'A distinct result.',finalText:'Explore independent website demos, discover your options and choose a direction. Every project begins with a different need — and deserves a tailored solution.',
exploreMore:'Explore every website ↗',
footerDemo:'Demonstration projects are not real client references unless explicitly identified.'
};
const literalEnglish={
  'Projekty':'Projects','Služby':'Services','Ceník':'Pricing','Začít':'Get started','Editor':'Editor',
  'Firemní web · 8 jazyků':'Corporate site · 8 languages','Neoficiální koncept · E-shop':'Unofficial concept · Online store',
  'Nezávislá ukázka · Hotel':'Independent demo · Hotel','Nezávislá ukázka · Aplikace':'Independent demo · Application',
  'Nezávislá ukázka · Kavárna':'Independent demo · Café','Nezávislá ukázka · Obchod':'Independent demo · Shop',
  'Sezónní nabídka a atmosféra značky':'Seasonal menu and brand atmosphere','Květiny, kolekce a produktové varianty':'Flowers, collections and product variants',
  'Zavedení 1 990 Kč · model 18 měsíců':'Setup CZK 1,990 · 18-month model','Zavedení 3 990 Kč · model 18 měsíců':'Setup CZK 3,990 · 18-month model',
  'Zavedení od 7 990 Kč · podle rozsahu':'Setup from CZK 7,990 · scope dependent',
  '1–3 stránky':'1–3 pages','Responzivní web':'Responsive website','Základy SEO':'SEO fundamentals',
  'Do 8 stránek':'Up to 8 pages','Galerie a reference':'Galleries and references','Volitelné CMS':'Optional CMS',
  'Originální návrh':'Original design','Vícejazyčnost a funkce':'Languages and features','Integrace dle zadání':'Integrations as scoped',
  'Responzivní design':'Responsive design','Katalog · velikosti · nákupní košík':'Catalogue · sizes · basket',
  'Pokoje · galerie · rezervace':'Rooms · gallery · booking',
  '© 2026 DTMates · Koncept k soukromému schválení':'© 2026 DTMates · Private review concept',
  'Všechny ukázky ↗':'All demos ↗','Portfolio ↗':'Portfolio ↗'
};
const html=document.documentElement;
const marked=$$('[data-i18n]');
const originals=new Map(marked.map(el=>[el,el.dataset.i18n==='pricingHeadline'?el.innerHTML:el.textContent]));
const literalNodes=[];
const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
while(walker.nextNode()){
  const node=walker.currentNode;
  if(!node.parentElement?.closest('[data-i18n]')&&node.nodeValue.trim()&&literalEnglish[node.nodeValue.trim()]){
    literalNodes.push([node,node.nodeValue]);
  }
}
const baseTitle=document.title;
let currentLang='cs';
function setLanguage(language){
  currentLang=language==='en'?'en':'cs';
  html.lang=currentLang;html.dataset.currentLang=currentLang;
  for(const [element,original] of originals){
    const translation=english[element.dataset.i18n];
    if(currentLang==='en'&&translation!=null){
      if(element.dataset.i18n==='pricingHeadline')element.innerHTML=translation;
      else element.textContent=translation;
    }else{
      if(element.dataset.i18n==='pricingHeadline')element.innerHTML=original;
      else element.textContent=original;
    }
  }
  for(const [node,original] of literalNodes){
    const translated=literalEnglish[original.trim()];
    node.nodeValue=currentLang==='en'?original.replace(original.trim(),translated):original;
  }
  for(const button of $$('[data-language]'))button.setAttribute('aria-pressed',String(button.dataset.language===currentLang));
  document.title=currentLang==='en'?'DTMates Web Studio — Distinctive websites & e-commerce':baseTitle;
  try{localStorage.setItem('dtmates-web-studio-lang',currentLang)}catch{}
}
$$('[data-language]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.language)));
try{setLanguage(localStorage.getItem('dtmates-web-studio-lang')||'cs')}catch{setLanguage('cs')}
let activePreview='agile';
function preview(id){
  const details=showcases[id];
  if(!details)return;
  activePreview=id;
  $('#hero-preview-image').src=details.image;
  $('#hero-preview-image').alt=details.alt;
  $('#hero-preview-link').href=details.href;
  $('#hero-title').textContent=details.title;
  $('#hero-category').textContent=details.category;
  $('#hero-descriptor').textContent=details.descriptor;
  $('#hero-url').textContent=details.url;
  $('#hero-detail-link').href=details.href;
  const index=Object.keys(showcases).indexOf(id)+1;
  $('#hero-number').textContent=String(index).padStart(2,'0')+' / 04';
  $$('[data-preview]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.preview===id)));
}
$$('[data-preview]').forEach(button=>button.addEventListener('click',()=>preview(button.dataset.preview)));
preview(activePreview);
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  const filter=button.dataset.filter;
  $$('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  $$('[data-project-type]').forEach(card=>card.hidden=filter!=='all'&&card.dataset.projectType!==filter);
}));
$$('[data-pricing]').forEach(button=>button.addEventListener('click',()=>{
  const mode=button.dataset.pricing;
  $$('[data-pricing]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  $$('[data-pricing-panel]').forEach(panel=>panel.hidden=panel.dataset.pricingPanel!==mode);
}));
const nav=$('#mainnav'),navLinks=$$('#mainnav a');
navLinks.forEach(link=>link.addEventListener('click',()=>{
  if(link.hash?.startsWith('#'))navLinks.forEach(item=>item.classList.toggle('is-current',item===link));
}));
const images=$$('img[loading=lazy]');
images.forEach(img=>img.addEventListener('error',()=>{
  img.dataset.failed='true';
  img.alt=img.alt+' (náhled není dostupný)';
},{once:true}));
