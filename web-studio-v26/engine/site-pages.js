import {demos} from './data.js';
import {renderSections} from './page-sections.js';
import {campaignArt,campaignPaths} from './site-designs/campaign.js';
import {renderLibraryMedia} from './media-library.js';
import {collectionPaths} from './site-designs/photo-collection.js';
import {brandFonts} from './assets/fonts/manifest.js';
import {signalSite,signalCatalogue} from './site-designs/signal.js';
import {bloomSite,bloomCatalogue,bloomMedia} from './site-designs/bloom.js';
import {dentalSite,dentalCatalogue} from './site-designs/dental.js';
import {electricSite,electricCatalogue} from './site-designs/electric.js';
import {realtySite,realtyCatalogue} from './site-designs/realty.js';
import {wellnessSite,wellnessCatalogue} from './site-designs/wellness.js';
import {hotelSite} from './site-designs/hotel.js';
import {blacklineSite,blacklineCatalogue} from './site-designs/blackline.js';
import {cafeSite,cafeMenu} from './site-designs/cafe.js';
import {timoStore,timoMedia,timoCatalogue} from './timo-store.js';
import {features} from './editorial-v6.js';
import {designPage} from './design.js';
import {designPages} from './design-data.js';
import {industryMarkup,industryScript} from './industry.js';

export const maxPages=32;
export const languages=['cs','en','ar'];
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function slugify(value){
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64);
}

export function pagesFor(raw){
  const seen=new Set(['en','ar','index']);
  return (Array.isArray(raw)?raw:[]).slice(0,maxPages).map((page,index)=>{
    const requested=String(page?.slug||'');
    const basic=(Object.values(designPages).some(routes=>routes.some(([path])=>path===requested))||/^rooms\/[-a-z0-9]{1,50}$/.test(requested)||/^products\/new-[a-f0-9-]{36}$/.test(requested)?requested:slugify(requested||page?.title||''))||'page-'+(index+1);
    let slug=basic, suffix=2;
    while(seen.has(slug))slug=basic+'-'+suffix++;
    seen.add(slug);
    const content=Object.fromEntries(languages.map(locale=>{
      const entry=page?.content?.[locale];
      const field=(key,max)=>String(entry?.[key]??(locale==='cs'?page?.[key]??'':'')).slice(0,max);
      return [locale,{title:field('title',90),body:field('body',4000),description:field('description',200)}];
    }));
    return {id:'page-'+(index+1),slug,content,visible:page?.visible!==false};
  });
}

export function applyRoomRoutes(project){
 if(!project.hotelRoomsCustom)return;
 const active=new Set(project.hotelRooms.map(room=>'rooms/'+room.id));
 project.pages=project.pages.filter(page=>!page.slug.startsWith('rooms/')||active.has(page.slug));
 for(const room of project.hotelRooms){
   const slug='rooms/'+room.id;
   if(project.pages.some(page=>page.slug===slug))continue;
   const content=Object.fromEntries(['ar','en','cs'].map((locale,index)=>[
     locale,{title:room.names[index],body:room.details[index],description:room.details[index]}
   ]));
   project.pages.push({slug,content,visible:true});
 }
 project.pages=pagesFor(project.pages);
}

export function applyProductRoutes(project){
 if(project.id!=='timo')return;
 const hidden=new Set(project.timoHidden.map(id=>'products/'+id));
 const added=new Set(project.timoExtra.map(item=>'products/'+item.id));
 project.pages=project.pages.filter(page=>!hidden.has(page.slug)&&(!page.slug.startsWith('products/new-')||added.has(page.slug)));
 for(const item of project.timoExtra){
   const slug='products/'+item.id;
   if(project.pages.some(page=>page.slug===slug))continue;
   const content=Object.fromEntries(languages.map(locale=>[
     locale,{title:item.names[locale]||item.names.cs||item.names.en,body:item.details[locale],description:item.details[locale]}
   ]));
   project.pages.push({slug,content,visible:true});
 }
 project.pages=pagesFor(project.pages);
}

export function pathFor(locale,slug=''){
  return [locale==='cs'?'':locale,slug,'index.html'].filter(Boolean).join('/');
}

function href(from,to){
  return '../'.repeat(from.split('/').length-1)+to;
}

export function cataloguePaths(id){
  return [...(id==='timo'?timoMedia:id==='bloom'?bloomMedia:[]),...(id==='cafe'?['assets/img/misto-bakery.jpg','assets/img/misto-bakery-720.jpg']:id==='blackline'?['assets/img/blackline-paint.jpg','assets/img/blackline-paint-720.jpg','assets/img/blackline-protection.jpg','assets/img/blackline-protection-720.jpg']:[]),...collectionPaths(id),...campaignPaths(id),'site-designs/styles/'+id+'.css','site-designs/styles/brands-v14.css','site-designs/styles/brands-v17.css'];
}

const renderBrand18=function renderBrand18({id,locale,services,hero,images=[],link}){
 const info={
 cafe:{label:'MENU / MÍSTO',h:['Příběh chutí.','A menu with character.','قائمة بطابع خاص'],route:'menu',mark:'☕',type:'paper'},
 blackline:{label:'BLACKLINE / INSPECTION',h:['Detail pod kontrolou.','Every detail matters.','كل التفاصيل مهمة'],route:'services',mark:'✦',type:'industrial'},
 hotel:{label:'ATELIER / SUITES',h:['Váš další pobyt.','Your next stay.','إقامتك القادمة'],route:'rooms',mark:'A',type:'arch'},
 wellness:{label:'MIRA / RITUALS',h:['Vlastní rytmus.','Find your ritual.','اكتشف طقسك'],route:'treatments',mark:'◌',type:'ritual'},
 realty:{label:'FORMA / ARCHITECTURE',h:['Prostor v detailu.','Explore the space.','اكتشف المساحة'],route:'properties',mark:'⌗',type:'blueprint'},
 electric:{label:'VOLT / TECHNICAL',h:['Přehledný postup.','Work in clear stages.','العمل بمراحل واضحة'],route:'services',mark:'⚡',type:'blueprint'},
 dental:{label:'NOVA / PATIENT JOURNEY',h:['Péče krok za krokem.','Care, step by step.','الرعاية خطوة بخطوة'],route:'treatments',mark:'+',type:'clinical'},
 bloom:{label:'BLOOM / STUDIO',h:['Květiny a nálady.','Florals in colour.','ألوان الزهور'],route:'bouquets',mark:'✿',type:'floral'},
 timo:{label:'FORME / INDEPENDENT CONCEPT',h:['Vaše kolekce.','Your collection.','مجموعتك'],route:'collections',mark:'T',type:'fashion'},
 signal:{label:'SIGNAL / LOCAL DEMO UI',h:['Přehled bez chaosu.','Clarity in one place.','وضوح في مكان واحد'],route:'demo',mark:'▥',type:'console'}
 };
 const a=info[id];if(!a)return '';
 const escape=s=>String(s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const language=locale==='en'?1:locale==='ar'?2:0;
 const strings=[
 {label:'INTERAKTIVNÍ VÝSTUP / VLASTNÍ DEMO',choose:'Vyberte oblast',result:'AKTUÁLNÍ VÝBĚR',cta:'Otevřít funkční stránku',disclaimer:'Lokální interakce v původním funkčním demo webu. Bez reálných objednávek či přenosu údajů.'},
 {label:'ORIGINAL INTERACTIVE SITE',choose:'Choose an area',result:'CURRENT SELECTION',cta:'Open working page',disclaimer:'Original interactive local demonstration, no real orders or transmitted user data.'},
 {label:'موقع تجريبي أصلي وتفاعلي',choose:'اختر القسم',result:'الاختيار الحالي',cta:'افتح الصفحة',disclaimer:'عرض تفاعلي محلي دون طلبات حقيقية أو إرسال بيانات.'}
 ][language];
 const list=(services||[]).slice(0,3);if(list.length<2)return '';
 const media=hero?'<img data-b18-visual-img src="'+escape(hero)+'" loading="lazy" alt="'+escape('Original in-project '+id+' demo artwork')+'" width="900" height="620">':'<div class="brand18-screen" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>';
 const routes={
 cafe:['menu','menu','menu'],blackline:['services/interior','services/paint','services/protection'],
 hotel:['rooms/courtyard','rooms/attic','rooms/salon'],wellness:['treatments/relaxation','treatments/back-neck','treatments/voucher'],
 realty:['properties/sample-apartment','properties/garden-house','properties/terrace-loft'],
 electric:['services/installation','services/inspection','services/automation'],
 dental:['treatments/first-visit','treatments/prevention','treatments/hygiene'],
 bloom:['bouquets/seasonal','bouquets/wild','bouquets/gift'],
 timo:['collections/lingerie','collections/swim','collections/night'],signal:['product','demo','onboarding']
 };
 const links=list.map((name,i)=>{const item=link(routes[id][i]||a.route,strings.cta);return '<span data-b18-route="'+i+'"'+(i?' hidden':'')+'>'+item+'</span>';}).join('');
 const buttons=list.map((name,i)=>'<button type="button" data-b18-pick="'+i+'" data-b18-text="'+escape(name)+'" data-b18-image="'+escape(images[i%Math.max(1,images.length)]||hero)+'" aria-pressed="'+(i===0?'true':'false')+'"><b>0'+(i+1)+'</b><span>'+escape(name)+'</span></button>').join('');
 const script='<script>(()=>{const root=document.querySelector("[data-brand18=\\"'+id+'\\"]");if(!root)return;const tabs=[...root.querySelectorAll("[data-b18-pick]")],out=root.querySelector("[data-b18-output]"),counter=root.querySelector("[data-b18-counter]"),img=root.querySelector("[data-b18-visual-img]"),routes=[...root.querySelectorAll("[data-b18-route]")];function choose(i){const tab=tabs[i];if(!tab)return;tabs.forEach((b,n)=>b.setAttribute("aria-pressed",String(n===i)));out.textContent=tab.dataset.b18Text;counter.textContent="0"+(i+1)+" / 0"+tabs.length;routes.forEach((item,j)=>item.hidden=i!==j);if(img&&tab.dataset.b18Image&&img.getAttribute("src")!==tab.dataset.b18Image){img.classList.add("v19-image-switching");img.src=tab.dataset.b18Image;img.alt="Original project-owned demo visual, example view "+(i+1);img.decode?.().catch(()=>{}).finally(()=>img.classList.remove("v19-image-switching"))}root.dataset.active=i}tabs.forEach((b,i)=>{b.addEventListener("click",()=>choose(i));b.addEventListener("keydown",e=>{if(!["ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;e.preventDefault();const j=e.key==="Home"?0:e.key==="End"?tabs.length-1:(i+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;tabs[j].click();tabs[j].focus()})});choose(0)})();</script>';
 return '<section class="brand18 brand18-'+id+'" data-brand18="'+id+'" data-active="0"><div class="brand18-kicker"><span>'+escape(strings.label)+'</span><strong>'+escape(a.label)+'</strong></div>'+
 '<div class="brand18-layout"><div class="brand18-visual">'+media+'<span class="brand18-symbol" aria-hidden="true">'+a.mark+'</span><span class="brand18-plate">'+escape(a.label)+'</span></div>'+
 '<div class="brand18-description"><span class="brand18-count" data-b18-counter>01 / 03</span><h2>'+escape(a.h[language])+'</h2><p>'+escape(strings.choose)+'</p>'+
 '<div class="brand18-selections" role="group" aria-label="'+escape(strings.choose)+'">'+buttons+'</div>'+
 '<div class="brand18-selection" role="status" aria-live="polite"><small>'+escape(strings.result)+'</small><strong data-b18-output>'+escape(list[0])+'</strong></div>'+
 '<div class="brand18-foot">'+links+'<p>'+escape(strings.disclaimer)+'</p></div></div></div>'+script+'</section>';
};

/* Bring original project-specific interactions into each site’s visual storyline.
   Match the first completed section, not a fragile fixed string; preserve nested markup. */
function afterFirstHero(body,experience){
 if(!experience)return body;
 const main=/<main\b[^>]*>/i.exec(body);if(!main)return body;
 const mainEnd=body.indexOf('</main>',main.index+main[0].length);
 if(mainEnd<0)return body;
 const start=/<section\b[^>]*>/i.exec(body.slice(main.index+main[0].length,mainEnd));
 if(!start)return body.slice(0,mainEnd)+experience+body.slice(mainEnd);
 const first=main.index+main[0].length+start.index;
 const rx=/<\/?section\b[^>]*>/gi;rx.lastIndex=first;
 let depth=0,match;
 while((match=rx.exec(body))&&match.index<mainEnd){
  depth+=match[0].startsWith('</')?-1:1;
  if(depth===0)return body.slice(0,rx.lastIndex)+experience+body.slice(rx.lastIndex);
 }
 return body.slice(0,mainEnd)+experience+body.slice(mainEnd);
}

/* V19 progressive brand motion: only the real authored sections after the hero. */
function v19BrandMotion(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
 const main=document.querySelector('main');if(!main)return;
 const nodes=[...main.children].filter(el=>el.matches('section,article')).slice(1,11);
 if(!nodes.length)return;
 const io=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('v19-entered');io.unobserve(entry.target)}
 },{threshold:.06,rootMargin:'0px 0px -7% 0px'});
 for(const el of nodes){
  el.classList.add('v19-reveal-target');
  if(el.getBoundingClientRect().top<innerHeight*.94)el.classList.add('v19-entered');else io.observe(el);
 }
 document.documentElement.classList.add('v19-brand-motion-ready');
}

export function renderPage(project,locale,slug,{css,fontCSS,preview=false,assetPaths=false,extraMedia={},productImageFiles=false}={}){
  const current=pathFor(locale,slug);
  const page=project.pages.find(item=>item.slug===slug&&item.visible);
  const label={cs:'Úvod',en:'Home',ar:'الرئيسية'};
  const link=(target,text,lang=locale)=>{
    const path=pathFor(lang,target);
    return `<a href="${escape(href(current,path))}" ${preview?`data-preview-page="${escape(target)}" data-preview-locale="${lang}"`:''}>${escape(text)}</a>`;
  };
  const translations=languages.filter(l=>!page||page.content[l].title)
    .map(l=>link(slug,l.toUpperCase(),l)).join('');
  const bridge=preview?`<script>document.addEventListener('click',event=>{const a=event.target.closest('[data-preview-page]');if(!a)return;event.preventDefault();parent.postMessage({type:'studio-navigation',slug:a.dataset.previewPage,locale:a.dataset.previewLocale},'*')})</script>`:'';
  const content=page?.content[locale];
  const workflow=page?industryMarkup(project.id,slug,locale,project):'';
  const fallback=page&&locale!=='cs'&&industryMarkup(project.id,slug,'cs',project)&&page.content.cs.title
    ? `<p lang="cs">Interaktivní ukázka je dostupná česky: ${link(slug,'Česky','cs')}</p>` : '';
  const mediaProject=assetPaths?{...project,...Object.fromEntries(['hero','featureImage','galleryImage','suiteImage','experienceImage','courtyardDetail','atticDetail','salonDetail','video'].map(key=>[
    key,project[key]?.startsWith('assets/')?href(current,project[key]):project[key]
  ]))}:project;
  const resolve=path=>extraMedia[path]||(assetPaths&&path.startsWith('assets/')?href(current,path):path);
  const library=renderLibraryMedia(project.mediaLibrary,slug,locale,resolve,escape);
  const heroArt=slug?'':library.hero||campaignArt(project,locale,resolve,escape);
  const media=Object.fromEntries((project.id==='bloom'?bloomMedia:timoMedia).map(path=>[path,resolve(path)]));
  const body=project.id==='signal'?signalSite({project:mediaProject,locale,slug,page,link,translations,runtime:bridge,resolve,heroArt,escape}):project.id==='bloom'?bloomSite({project:mediaProject,locale,slug,page,link,translations,runtime:bridge,media,resolve,heroArt,escape}):project.id==='dental'?dentalSite({project:mediaProject,locale,slug,page,link,translations,runtime:bridge,resolve,heroArt,escape}):project.id==='electric'?electricSite({project:mediaProject,locale,slug,page,link,translations,runtime:bridge,resolve,heroArt,escape}):project.id==='realty'?realtySite({project:mediaProject,locale,slug,page,link,translations,runtime:bridge,resolve,heroArt,escape}):project.id==='wellness'?wellnessSite({project:mediaProject,locale,slug,page,link,translations,runtime:bridge,resolve,heroArt,escape}):project.id==='hotel'?hotelSite({project:mediaProject,locale,slug,page,link,translations,runtime:bridge,resolve,heroArt,escape}):project.id==='blackline'?blacklineSite({project:mediaProject,locale,slug,page,link,translations,runtime:bridge,resolve,heroArt,escape}):project.id==='cafe'?cafeSite({project:mediaProject,locale,slug,page,link,translations,runtime:bridge,resolve,heroArt,escape}):project.id==='timo'?timoStore({project:productImageFiles?{...mediaProject,productImages:project.productImages.map(path=>path?href(current,path):path)}:mediaProject,locale,slug,page,link,translations,runtime:bridge,media,resolve,heroArt,escape}):designPage({project:mediaProject,locale,slug,page,link,translations,workflow,fallback,runtime:(workflow?industryScript:'')+bridge});
  const additions=renderSections(project.siteSections?.[slug],locale,escape)+library.gallery;
  const title=page?content.title+' · '+project.brand:project.brand;
  const sheets=brandFonts[project.id]
    ? href(current,'assets/fonts/'+project.id+'/faces.css')
    : '';
  const brandPath='site-designs/styles/'+project.id+'.css';
  const brandURL=preview?new URL('./'+brandPath,import.meta.url).href:href(current,brandPath);
  const distinctURL=preview?new URL('./site-designs/styles/brands-v14.css',import.meta.url).href:href(current,'site-designs/styles/brands-v14.css');
  const motionURL=preview?new URL('./site-designs/styles/brands-v17.css',import.meta.url).href:href(current,'site-designs/styles/brands-v17.css');
  const brandMedia=[...new Set(['hero','featureImage','galleryImage','suiteImage','experienceImage','courtyardDetail','salonDetail'].map(key=>project[key]).filter(path=>path&&path.startsWith('assets/')).map(path=>resolve(path)))];
  const brand18=slug?'':renderBrand18({id:project.id,locale,services:project.servicesLocales[locale],hero:brandMedia[0]||'',images:brandMedia,link:(target,text)=>link(target,text)});
  const userAccent=/^#[a-f0-9]{6}$/i.test(project.color)&&project.color!==demos[project.id]?.color
    ? `<style>:root{--site-editor-accent:${project.color}}.ds>header,.ds>footer{border-block-end:4px solid var(--site-editor-accent)}</style>` : '';
  const fontURL=preview&&sheets?new URL('./assets/fonts/'+project.id+'/faces.css',import.meta.url).href:sheets;
  const sourceWithBrand=(additions||brand18)?afterFirstHero(body.replace('</main>',()=>(additions||'')+'</main>'),brand18):body;
  const sourceWithMotion=sourceWithBrand.replace('</body>',()=>'<script>('+v19BrandMotion.toString()+')();</script></body>');
  return `<!doctype html><html lang="${locale}" dir="${locale==='ar'?'rtl':'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escape(content?.description||project.descriptionLocales[locale])}"><title>${escape(title)}</title>${fontCSS?`<style>${fontCSS}</style>`:fontURL?`<link rel="stylesheet" href="${escape(fontURL)}">`:''}${css?`<style>${css}</style>`:'<link rel="stylesheet" href="demo-site.css">'}<link rel="stylesheet" href="${escape(brandURL)}"><link rel="stylesheet" href="${escape(distinctURL)}"><link rel="stylesheet" href="${escape(motionURL)}">${userAccent}</head>${sourceWithMotion}</html>`;
}

export function siteFiles(project,css,options={}){
  const files={};
  for(const locale of languages){
    files[pathFor(locale)]=renderPage(project,locale,'',{css,...options});
    for(const page of project.pages.filter(p=>p.visible&&p.content[locale].title)){
      files[pathFor(locale,page.slug)]=renderPage(project,locale,page.slug,{css,...options});
    }
  }
  files['manifest.json']=JSON.stringify({schema_version:3,pages:Object.keys(files),
    missing:project.pages.filter(p=>p.visible).flatMap(p=>languages.filter(l=>!p.content[l].title||!p.content[l].body).map(l=>({slug:p.slug,locale:l})))},null,2);
  return files;
}

export function templateProject(base){
  return {...base,...(base.id==='timo'?{catalogue:[...timoCatalogue]}:base.id==='cafe'?{cafeMenu:structuredClone(cafeMenu)}:base.id==='blackline'?{catalogue:[...blacklineCatalogue]}:base.id==='wellness'?{catalogue:[...wellnessCatalogue]}:base.id==='realty'?{catalogue:[...realtyCatalogue]}:base.id==='electric'?{catalogue:[...electricCatalogue]}:base.id==='dental'?{catalogue:[...dentalCatalogue]}:base.id==='bloom'?{catalogue:[...bloomCatalogue]}:base.id==='signal'?{catalogue:[...signalCatalogue]}:{}),pages:pagesFor(designPages[base.id].map(([slug,...titles],index)=>({
    slug,content:Object.fromEntries(languages.map((lang,i)=>[lang,{
      title:titles[i],description:base.descriptionLocales[lang],
      body:base.id==='timo'&&slug==='sizes'?{cs:'Změřte obvod hrudníku a boků bez utažení metru. Pro ukázkové velikosti S, M, L a XL porovnejte míry před výběrem. Tento průvodce neobsahuje tabulku značky FORME.',en:'Measure around your bust and hips with the tape relaxed. Compare your measurements before selecting the illustrative S, M, L or XL. This guide contains no official FORME size chart.',ar:'قِس محيط الصدر والوركين دون شد شريط القياس. قارن قياساتك قبل اختيار المقاس التجريبي. لا يتضمن هذا الدليل جدول المقاسات الرسمي للعلامة.'}[lang]:lang==='cs'&&features[base.id][0]===slug?features[base.id].slice(2).map(entry=>Array.isArray(entry)?entry[1]:entry).join('\n\n'):index===0?base.servicesLocales[lang].join('\n'):base.aboutLocales[lang]
    }]))
  })))};
}
