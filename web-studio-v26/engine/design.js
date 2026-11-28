import {inquiryText} from './inquiry-locales.js';
import {featureMarkup,comparisonRuntime} from './editorial-v6.js';
import {brandOffer} from './brand-sections.js';
import {signalDashboard,signalRuntime} from './signal.js';
import {editorialDetails} from './design-details.js';
import {locales} from './data.js';

const e=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const paint=value=>/^#[0-9a-f]{6}$/i.test(value)?value:'inherit';

export const families={
  signal:{signature:'SIGNAL / OPERATIONS',paths:['demo','product','contact'],mode:'grid'},
  cafe:{signature:'MÍSTO / COFFEE HOUSE',paths:['menu','about','visit'],mode:'menu'},
  electric:{signature:'VOLT / TECHNICAL SERVICES',paths:['services','projects','request-quote'],mode:'grid'},
  wellness:{signature:'MIRA / SLOW RITUALS',paths:['treatments','treatments/relaxation','book'],mode:'list'},
  realty:{signature:'FORMA / PROPERTY JOURNAL',paths:['properties','properties/sample-apartment','contact'],mode:'gallery'},
  timo:{signature:'FORME / INDEPENDENT CONCEPT',paths:['collections','products/sample-product','cart'],mode:'shop'},
  dental:{signature:'NOVA / DENTAL STUDIO',paths:['treatments','team','contact'],mode:'grid'},
  blackline:{signature:'BLACKLINE / DETAILING',paths:['services','packages','request-quote'],mode:'compare'},
  hotel:{signature:'ATELIER / BOUTIQUE HOTEL',paths:['rooms','experiences','contact'],mode:'gallery'},
  bloom:{signature:'BLOOM / FLOWER STUDIO',paths:['bouquets','workshops','contact'],mode:'shop'}
};

const workflowOptions={
  signal:['Malý tým','Více týmů'],
  cafe:['Káva','Brunch','Sladké'],
  electric:['Byt','Rodinný dům','Provozovna'],
  wellness:['30 min','60 min','90 min'],
  realty:['Osobně','Videohovor'],
  dental:['První návštěva','Kontrola','Hygiena'],
  blackline:['Kompakt','Sedan','SUV'],
  hotel:['1 host','2 hosté','3 hosté','4 hosté'],
  bloom:['Malá kytice','Střední kytice','Velká kytice']
};

const formRoutes={
  signal:['contact'],electric:['request-quote'],wellness:['book'],realty:['contact'],
  dental:['contact'],blackline:['request-quote'],hotel:['contact'],bloom:['contact','workshops']
};
function inquiry(project,locale){
  const {labels,options}=inquiryText(locale,project.id,workflowOptions[project.id]);
  const [service,variant,property,name,email,scope,date,location,checkout,notes,step,title,back,next,submit,note,ready]=labels;
  const select=(label,options)=>`<label>${e(label)}<select name="${e(label)}">${options.map(item=>`<option>${e(item)}</option>`).join('')}</select></label>`;
  const field=(label,attributes)=>`<label>${e(label)}<input name="${e(label)}" ${attributes}></label>`;
  const area=label=>`<label>${e(label)}<textarea name="${e(label)}" maxlength="400"></textarea></label>`;
  const wizard=project.id==='electric';
  const choice=select(service,project.servicesLocales[locale]);
  const option=select(wizard?property:variant,options);
  const who=field(name,'required autocomplete="name" maxlength="90"')+field(email,'type="email" required autocomplete="email"');
  const dates=['wellness','realty','dental','hotel','bloom'].includes(project.id)?field(date,'type="date"'):'';
  const fields=wizard?[choice,option,field(location,'required maxlength="90"'),area(scope),who,'<output aria-live="polite"></output>']
    .map((markup,index)=>`<fieldset ${index?'hidden':''}><legend>${e(step)} ${index+1} / 6</legend>${markup}</fieldset>`).join('')
    :choice+option+dates+(project.id==='hotel'?field(checkout,'type="date"'):'')+who+area(notes);
  return `<form class="ds-inquiry" data-inquiry data-ready="${e(ready)}" ${wizard?'data-wizard':''}><h2>${e(title)}</h2>${fields}
    ${wizard?`<div class="ds-actions"><button type="button" data-back hidden>${e(back)}</button><button type="button" data-next>${e(next)}</button></div>`:''}
    <button ${wizard?'hidden':''}>${e(submit)}</button><p role="status">${e(note)}</p>${wizard?'':'<output aria-live="polite"></output>'}</form>`;
}
const shopScript=`<script>
(() => {
  const surface=document.querySelector('[data-shop]');
  if(!surface)return;
  const key='dtmates-bag-'+surface.dataset.shop;
  let items={};
  try{items=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{}
  let wishlist=[];
  try{wishlist=JSON.parse(localStorage.getItem(key+'-wish')||'[]')}catch{}
  if(!Array.isArray(wishlist))wishlist=[];
  const output=surface.querySelector('output');
  const selection=surface.querySelector('select');
  const wish=surface.querySelector('[data-action="wish"]');
  function syncWish(){wish?.setAttribute('aria-pressed',String(wishlist.includes(selection?.value)));}
  selection?.addEventListener('change',syncWish);
  syncWish();
  const update=()=>{
    try{localStorage.setItem(key,JSON.stringify(items))}catch{}
    const count=Object.values(items).reduce((a,b)=>a+b,0);
    output.textContent=count?Object.entries(items).map(([name,qty])=>name+' × '+qty).join(' · '):'Košík je prázdný.';
  };
  surface.addEventListener('click',event=>{
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(!action)return;
    const option=surface.querySelector('select');
    const item=option?.value||Object.keys(items)[0];
    if(action==='checkout'){output.textContent='Ukázka dokončena. Nevznikla objednávka ani platba.';return;}
    if(action==='wish'&&item){
      const saved=wishlist.includes(item);
      wishlist=saved?wishlist.filter(name=>name!==item):[...wishlist,item];
      try{localStorage.setItem(key+'-wish',JSON.stringify(wishlist))}catch{}
      syncWish();
      output.textContent=(saved?'Odebráno z oblíbených: ':'Přidáno do oblíbených: ')+item;
      return;
    }
    if(item){
      if(action==='add')items[item]=(items[item]||0)+1;
      if(action==='remove')delete items[item];
      if(action==='less'&&--items[item]<=0)delete items[item];
    }
    update();
  });
  update();
})();
</script>`;
function shop(id,slug,project){
  const bag=slug==='cart';
  return `<section class="ds-inquiry" data-shop="${id}"><h2>${bag?'Váš ukázkový košík':'Vyberte variantu'}</h2>
    ${bag?'':`<label>Varianta<select>${project.servicesLocales.cs.map(item=>`<optgroup label="${e(item)}">${(id==='timo'?['S','M','L']:['Malá','Střední','Velká']).map(size=>`<option>${e(item+' · '+size)}</option>`).join('')}</optgroup>`).join('')}</select></label>`}
    <div class="ds-actions">${bag?'<button data-action="less">Odebrat kus</button><button data-action="remove">Odebrat položku</button><button data-action="checkout">Ukázková pokladna</button>':'<button data-action="add">Přidat do košíku</button><button data-action="wish" aria-pressed="false">Oblíbená varianta</button>'}</div><output aria-live="polite"></output></section>`;
}
const inquiryScript=`<script>
document.querySelectorAll('[data-inquiry]').forEach(form=>{
  const output=form.querySelector('output');
  const summary=()=>[...new FormData(form)].filter(([,value])=>value).map(([key,value])=>key+': '+value).join(' · ');
  form.addEventListener('submit',event=>{
    event.preventDefault();
    output.textContent=summary();
    form.querySelector('[role=status]').textContent=form.dataset.ready;
  });
  if(!form.hasAttribute('data-wizard'))return;
  const steps=[...form.querySelectorAll('fieldset')];
  const back=form.querySelector('[data-back]');
  const next=form.querySelector('[data-next]');
  const submit=form.querySelector('button:not([type])');
  let current=0;
  function show(index){
    current=index;
    steps.forEach((step,i)=>step.hidden=i!==index);
    back.hidden=index===0;
    next.hidden=index===steps.length-1;
    submit.hidden=!next.hidden;
    if(next.hidden)output.textContent=summary();
    steps[index].querySelector('input,select,textarea')?.focus();
  }
  back.addEventListener('click',()=>show(current-1));
  next.addEventListener('click',()=>{
    if([...steps[current].querySelectorAll('input,select,textarea')].every(field=>field.reportValidity()))show(current+1);
  });
});
</script>`;

export function designPage({project,locale,slug,page,link,translations,workflow,fallback,runtime}){
  const family=families[project.id], l=locales[locale], a=project.servicesLocales[locale];
  const title=page?page.content[locale].title:project.headline[locale];
  const summary=page?page.content[locale].body:project.subline[locale];
  const navItems=project.pages.filter(p=>p.visible&&p.content[locale].title);
  const menu=navItems.filter(p=>!p.slug.includes('/')).map(p=>link(p.slug,p.content[locale].title)).join('');
  const route=(index,text)=>{
    const p=navItems.find(p=>p.slug===family.paths[index]);
    return p?link(p.slug,text||p.content[locale].title):'';
  };
  const photo=project.hero?`<img class="ds-photo" src="${e(project.hero)}" alt="" fetchpriority="high">`:'';
  const identity=`<small class="ds-signature" lang="en">${family.signature}</small>`;
  const intro=`<div class="ds-intro">${identity}<h1>${e(title)}</h1><p>${e(summary).replaceAll('\n','<br>')}</p>${page?'':`<div class="ds-actions">${route(0,project.ctaLocales[locale])}${route(2)}</div>`}</div>`;
  const opening={
    signal:()=>`<section class="signal-open">${intro}${signalDashboard(locale)}</section>`,
    cafe:()=>`<section class="ds-cafe-open">${intro}<figure>${photo}<figcaption>MÍSTO · ${e(project.address)}</figcaption></figure></section>`,
    electric:()=>`<section class="ds-electric-open">${intro}<div class="ds-technical">${photo}<span>VOLT / PRAHA</span></div></section>`,
    wellness:()=>`<section class="ds-wellness-open">${photo}${intro}</section>`,
    realty:()=>`<section class="ds-realty-open">${photo}${intro}</section>`,
    timo:()=>`<section class="ds-timo-open">${photo}${intro}</section>`,
    dental:()=>`<section class="ds-dental-open">${intro}${photo}</section>`,
    blackline:()=>`<section class="ds-blackline-open">${photo}${intro}</section>`,
    hotel:()=>`<section class="ds-hotel-open">${intro}<figure>${photo}</figure></section>`,
    bloom:()=>`<section class="ds-bloom-open"><figure>${photo}</figure>${intro}</section>`
  };
  const cards=`<ul class="ds-cards">${a.map((item,i)=>`<li><strong>${e(item)}</strong>${family.mode==='menu'&&locale==='cs'?`<span>${[75,195,95][i%3]} Kč</span>`:''}</li>`).join('')}</ul>`;
  const explore=navItems.length?`<div class="ds-related">${navItems.filter(p=>p.slug!==slug).map(p=>link(p.slug,p.content[locale].title)).join('')}</div>`:'';
  const featurePhoto=project.featureImage?`<img class="ds-photo" src="${e(project.featureImage)}" alt="" loading="lazy">`:photo.replace('fetchpriority="high"','loading="lazy"');
  const depth=featureMarkup({id:project.id,locale,slug,photo:featurePhoto,pages:project.pages,link,escape:e});
  const sections={
    services:()=>brandOffer(project.id,locale,a,route(0),route(1),e),
    about:()=>depth||`<section class="ds-story"><h2>${e(l.about)}</h2><p>${e(project.aboutLocales[locale])}</p>${route(1)}</section>`,
    review:()=>project.reviewLocales[locale]&&['cafe','wellness','realty'].includes(project.id)?`<blockquote>${e(project.reviewLocales[locale])}<small>${e(l.exampleReview)}</small></blockquote>`:'',
    contact:()=>`<section class="ds-contact"><h2>${e(l.contact)}</h2><p>${e(project.address)}</p><p>${e(project.phone)} ${e(project.email)}</p>${route(2)}</section>`
  };
  const video=project.sections.video&&project.video?`<section><video controls preload="none" src="${e(project.video)}"></video></section>`:'';
  const map=project.sections.map&&project.address?`<section class="ds-contact"><a href="https://www.openstreetmap.org/search?query=${encodeURIComponent(project.address)}">${e(l.openMap)}</a><p>${e(l.mapNote)}</p></section>`:'';
  const inquiryForm=page&&formRoutes[project.id]?.includes(slug)?inquiry(project,locale):'';
  const commerce=page&&locale==='cs'&&((project.id==='timo'&&['collections','products/sample-product','cart'].includes(slug))||(project.id==='bloom'&&slug.startsWith('bouquets')))?shop(project.id,slug,project):'';
  const czechOnly=page&&locale!=='cs'&&(project.id==='timo'&&slug==='cart')?`<p>${locale==='en'?'The demo cart is available in Czech.':'سلة العرض متاحة باللغة التشيكية.'}</p>`:'';
  const signalPanel=page&&project.id==='signal'&&['demo','product'].includes(slug)?signalDashboard(locale):'';
  const innerIntro=depth?identity+`<h1>${e(title)}</h1>`:intro;
  const inner=`<main class="ds-inner ds-mode-${family.mode} ${inquiryForm?'ds-form-page':''}"><header>${innerIntro}${!depth&&!inquiryForm&&['gallery','shop','list','compare'].includes(family.mode)?photo:''}</header>
    <div class="ds-inner-body">${signalPanel}${depth||editorialDetails(project.id,slug,locale)}${workflow||''}${fallback||''}${czechOnly}${inquiryForm}${commerce}${!depth&&!signalPanel&&!workflow&&!inquiryForm&&!commerce?cards:''}${explore}</div></main>`;
  const header=`<header class="ds-header"><a class="ds-skip" href="#content">${locale==='cs'?'Přejít na obsah':locale==='ar'?'انتقل إلى المحتوى':'Skip to content'}</a>
    <div class="ds-brand">${link('',project.brand)}</div><details class="ds-menu"><summary>${locale==='ar'?'القائمة':'Menu'}</summary><nav aria-label="${e(l.home)}">${menu}</nav></details><nav class="ds-desktop" aria-label="${e(l.home)}">${menu}</nav><nav class="ds-languages" aria-label="Language">${translations}</nav></header>`;
  return `<body class="ds ds-${project.id}" style="--brand:${paint(project.color)};--contrast:${paint(project.contrast)}">${header}
    <div id="content">${page?inner:`<main>${opening[project.id]()}${(project.sectionOrder||Object.keys(sections)).filter(key=>project.sections[key]).map(key=>sections[key]?.()||'').join('')}${video}${map}</main>`}</div>
    <footer class="ds-footer"><div><strong>${e(project.brand)}</strong><p>${e(l.demo)}${project.id==='timo'?' · Independent concept':''}</p></div><div class="ds-footer-links">${route(0)}${route(2)}</div></footer>
    ${runtime}${project.id==='blackline'&&slug==='gallery'?comparisonRuntime:''}${project.id==='signal'?signalRuntime:''}${inquiryForm?inquiryScript:''}${commerce?shopScript:''}</body>`;
}
