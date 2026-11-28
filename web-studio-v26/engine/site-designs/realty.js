import {editorialPicture} from './campaign.js';
import {photosFor,collectionPhoto} from './photo-collection.js';
const properties=[
 ['sample-apartment','flat',58,2,7490000,'featureImage',['Byt u parku','Parkside apartment','شقة قرب الحديقة'],['Prosvětlená obývací část míří do zeleně, ložnice do klidnější ulice.','The living area overlooks green space, with the bedroom facing a quieter street.','تطل غرفة المعيشة على المساحات الخضراء وغرفة النوم على شارع هادئ.']],
 ['garden-house','house',145,5,12500000,'galleryImage',['Dům se zahradou','Garden house','منزل مع حديقة'],['Kuchyň a obývací pokoj navazují na zahradu. Horní patro odděluje pracovní a odpočinkové zóny.','The kitchen and living room open to the garden. Upstairs separates working and resting spaces.','ينفتح المطبخ وغرفة المعيشة على الحديقة. يفصل الطابق العلوي مساحات العمل والراحة.']],
 ['terrace-loft','flat',86,3,8950000,'suiteImage',['Podkroví s terasou','Terrace loft','علية مع شرفة'],['Přiznané trámy a západní terasa. Část dispozice má nižší světlou výšku.','Exposed beams and a west-facing terrace. Parts of the flat have reduced headroom.','عوارض ظاهرة وشرفة غربية. بعض أجزاء الشقة أقل ارتفاعاً.']]
];
export const realtyCatalogue=properties.map(([,kind,area,rooms,price,,names,details])=>[names[0],kind==='flat'?'Byt':'Dům',price,details[0],area,rooms].join(' | '));
const copy={
 cs:['Nemovitosti','Náš přístup','Poptat prohlídku','Vybrané prostory','Jak vybíráme','Sledujeme denní světlo, vztah k ulici a praktickou dispozici. Při prohlídce doporučujeme projít i okolí.','Fiktivní nabídky a ilustrační ceny.','Hledat','Typ','Vše','Byt','Dům','Maximální cena v Kč','Cena vzestupně','Výchozí řazení','Uložit mezi oblíbené','Pouze oblíbené','Bez výsledků. Upravte filtry.','pokoje','E-mail','Připravit přehled','Ukázková poptávka. Nic nebylo odesláno.','Navigace','Preferovaný den'],
 en:['Properties','Our approach','Enquire about a viewing','Selected spaces','How we choose','We look for daylight, a clear connection to the street and a useful layout. A viewing is also a chance to get to know the neighbourhood.','Fictional listings and illustrative prices.','Search','Type','All','Apartment','House','Maximum price in CZK','Price low to high','Featured order','Save property','Saved only','No results. Try different filters.','rooms','Email','Prepare summary','Demo enquiry. Nothing has been sent.','Navigation','Preferred day'],
 ar:['العقارات','نهجنا','استفسار عن المعاينة','مساحات مختارة','كيف نختار','نبحث عن ضوء النهار وتوزيع عملي. المعاينة فرصة للتعرف على الحي.','عروض خيالية وأسعار توضيحية.','بحث','النوع','الكل','شقة','منزل','الحد الأقصى للسعر','السعر تصاعدياً','الترتيب الافتراضي','حفظ العقار','المحفوظة فقط','لا توجد نتائج. جرّب مرشحات مختلفة.','غرف','البريد الإلكتروني','إعداد ملخص','استفسار تجريبي لم يُرسل.','التنقل','اليوم المفضل']
};
function activate(){
 const filters=document.querySelector('[data-forma-filter]');
 const grid=document.querySelector('[data-forma-grid]');
 let saved=[];
 try{const parsed=JSON.parse(localStorage.getItem('dtmates-forma-saved')||'[]');if(Array.isArray(parsed))saved=parsed;}catch{}
 function favorite(){
   document.querySelectorAll('[data-forma-save]').forEach(button=>button.setAttribute('aria-pressed',String(saved.includes(button.dataset.formaSave))));
 }
 function update(){
   if(!filters||!grid)return;
   const query=filters.elements.search.value.toLocaleLowerCase().trim();
   const max=Number(filters.elements.max.value)||Infinity;
   const kind=filters.elements.kind.value;
   const cards=[...grid.querySelectorAll('[data-listing]')];
   cards.sort((a,b)=>filters.elements.order.value==='price'?Number(a.dataset.price)-Number(b.dataset.price):Number(a.dataset.order)-Number(b.dataset.order));
   for(const card of cards)card.hidden=Boolean(!card.textContent.toLocaleLowerCase().includes(query)||(kind&&card.dataset.kind!==kind)||Number(card.dataset.price)>max||(filters.elements.saved.checked&&!saved.includes(card.dataset.listing)));
   grid.append(...cards);
   grid.parentElement.querySelector('[data-empty]').hidden=cards.some(card=>!card.hidden);
 }
 filters?.addEventListener('input',update);
 filters?.addEventListener('submit',event=>event.preventDefault());
 document.addEventListener('click',event=>{
   const button=event.target.closest('[data-forma-save]');
   if(!button)return;
   const id=button.dataset.formaSave;
   saved=saved.includes(id)?saved.filter(item=>item!==id):[...saved,id];
   try{localStorage.setItem('dtmates-forma-saved',JSON.stringify(saved));}catch{}
   favorite();update();
 });
 favorite();update();
 const form=document.querySelector('[data-viewing]');
 if(form){
   const requested=new URLSearchParams(location.search).get('property');
   const choices=form.querySelector('select');
   const selection=[...choices.options].find(option=>requested&&option.dataset.propertyId===requested);
   if(selection)choices.value=selection.value;
 }
 if(form)form.onsubmit=event=>{event.preventDefault();form.querySelector('output').textContent=form.dataset.ready+'\n'+[...new FormData(form)].map(([key,value])=>key+' · '+value).join('\n');};
 const dialog=document.querySelector('[data-forma-gallery]');
 const images=[...document.querySelectorAll('[data-show-image]')];
 if(dialog)for(const button of images)button.onclick=()=>{
   dialog.querySelector('figure').replaceChildren(button.querySelector('img').cloneNode());
   dialog.showModal();
   dialog.addEventListener('close',()=>button.focus(),{once:true});
 };
}
export function realtySite({project,locale,slug,page,link,translations,runtime,resolve,heroArt,escape:e}){
 const t=copy[locale],idx=['cs','en','ar'].indexOf(locale);
 const money=new Intl.NumberFormat(locale,{style:'currency',currency:'CZK',maximumFractionDigits:0});
 const visible=new Set(project.pages.filter(p=>p.visible&&p.content[locale].title).map(p=>p.slug));
 const nav=(path,label)=>visible.has(path)?link(path,label):'';
 const viewingLink=item=>nav('contact',t[2]).replace(/href="([^"]+)"/,(_,href)=>`href="${href}?property=${encodeURIComponent(item.id)}"`);
 const navigation=['properties','approach','contact'].map((path,i)=>nav(path,t[i])).join('');
 const photo=(src,alt='',eager=false)=>src?`<img src="${e(src)}" alt="${e(alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'}>`:'';
 const integer=(value,fallback,max)=>Number.isInteger(Number(value))&&Number(value)>0?Math.min(Number(value),max):fallback;
 const items=properties.map(([id,kind,area,rooms,price,key,names,descriptions],order)=>{
   const [name,type,cost,description,size,space]=project.catalogue?.[order]?.split('|').map(value=>value.trim())||[];
   return {
     id,key,order,area:integer(size,area,100000),rooms:integer(space,rooms,1000),
     name:(locale==='cs'&&name)||names[idx],kind:type==='Byt'?'flat':type==='Dům'?'house':kind,
     price:cost&&Number.isFinite(+cost)?Math.max(0,+cost):price,
     description:(locale==='cs'&&description)||descriptions[idx]
   };
 });
 const dossier={
   cs:{facts:'Parametry nemovitosti',area:'Plocha',rooms:'Místnosti',price:'Ukázková cena',gallery:'Pohledy na nemovitost',view:'Naplánovat prohlídku',advice:'Vyberte nemovitost a preferovaný den. Před skutečnou prohlídkou by se potvrdil čas i způsob přístupu.'},
   en:{facts:'Property specifications',area:'Area',rooms:'Rooms',price:'Illustrative price',gallery:'Property views',view:'Plan a viewing',advice:'Choose a property and preferred day. Arrival and access arrangements would be confirmed before an actual viewing.'},
   ar:{facts:'مواصفات العقار',area:'المساحة',rooms:'الغرف',price:'سعر توضيحي',gallery:'صور العقار',view:'خطط لمعاينة',advice:'اختر العقار واليوم المفضل. يتم تأكيد موعد الوصول وطريقة الدخول قبل أي معاينة فعلية.'}
 }[locale];
 const heading=(text,body)=>`<header class="forma-title"><h1>${e(text)}</h1>${body?`<p>${e(body)}</p>`:''}</header>`;
 const save=item=>`<button type="button" data-forma-save="${item.id}" aria-pressed="false">${t[15]}</button>`;
 const cards=list=>list.map(item=>`<article data-listing="${item.id}" data-kind="${item.kind}" data-price="${item.price}" data-order="${item.order}">${photo(project[item.key],item.name)}<div><h2>${nav('properties/'+item.id,item.name)||e(item.name)}</h2><p><bdi>${item.area} m²</bdi> · ${item.rooms} ${t[18]}</p><p>${money.format(item.price)}</p>${save(item)}</div></article>`).join('');
 const sortLabel={cs:'Řazení',en:'Sort',ar:'ترتيب'}[locale];
 const filter=`<form data-forma-filter><label>${t[7]}<input name="search" type="search"></label><label>${t[8]}<select name="kind"><option value="">${t[9]}</option><option value="flat">${t[10]}</option><option value="house">${t[11]}</option></select></label><label>${t[12]}<input name="max" type="number" min="0"></label><label>${sortLabel}<select name="order"><option value="">${t[14]}</option><option value="price">${t[13]}</option></select></label><label><input type="checkbox" name="saved">${t[16]}</label></form>`;
 const catalogue=`<section class="forma-catalogue forma-search-catalogue">${filter}<div class="forma-grid" data-forma-grid>${cards(items)}</div><p data-empty hidden role="status">${t[17]}</p></section>`;
 const approach=`<section class="forma-approach"><h2>${t[4]}</h2><p>${t[5]}</p>${nav('contact',t[2])}</section>`;
 const home=`<section class="forma-cover">${heroArt||photo(project.hero,'',true)}<div>${heading(project.headline[locale],project.subline[locale])}${nav('properties',t[0])}</div></section><section class="forma-catalogue forma-front-directory"><header><h2>${t[3]}</h2>${nav('properties',t[0])}</header><div class="forma-grid">${cards(items)}</div></section>${approach}`;
 const viewing=`<section class="forma-view forma-view-desk"><aside><h2>${dossier.view}</h2><p>${dossier.advice}</p><p>${t[6]}</p>${nav('properties',t[0])}</aside><form data-viewing data-ready="${t[21]}"><label>${t[0]}<select name="${t[0]}">${items.map(item=>`<option data-property-id="${item.id}">${e(item.name)}</option>`).join('')}</select></label><label>${t[23]}<input name="${t[23]}" type="date" required></label><label>${t[19]}<input name="${t[19]}" type="email" required></label><button>${t[20]}</button><output aria-live="polite"></output></form></section>`;
 const item=items.find(item=>'properties/'+item.id===slug);
 const enlarge={cs:'Zvětšit fotografii',en:'Enlarge photo',ar:'تكبير الصورة'}[locale], close={cs:'Zavřít',en:'Close',ar:'إغلاق'}[locale];
 const plates=photosFor('realty',locale);
 const elevation=item?.id==='garden-house'?editorialPicture('garden',locale,resolve,e):'';
 const detail=item?`${heading(item.name,item.description)}<section class="forma-detail forma-dossier"><div class="forma-dossier-images" data-property-key="${item.id}">${project[item.key]?`<button type="button" data-show-image aria-label="${enlarge}">${photo(project[item.key],item.name,true)}</button>`:''}<figure><button type="button" data-show-image data-secondary-view aria-label="${enlarge} · ${e(plates[item.order].alt)}">${collectionPhoto(plates[item.order],resolve,e)}</button><figcaption>${e(plates[item.order].alt)}</figcaption></figure></div><aside><h2>${dossier.facts}</h2><dl><div><dt>${dossier.area}</dt><dd><bdi>${item.area} m²</bdi></dd></div><div><dt>${dossier.rooms}</dt><dd><bdi>${item.rooms}</bdi></dd></div><div><dt>${dossier.price}</dt><dd><bdi>${money.format(item.price)}</bdi></dd></div></dl><p>${t[6]}</p>${save(item)}<p>${viewingLink(item)}</p></aside><dialog data-forma-gallery aria-label="${dossier.gallery}"><form method="dialog"><button>${close}</button></form><figure></figure></dialog></section>${elevation?`<section class="forma-elevation">${elevation}</section>`:''}`:'';
 const body=page?.content[locale];
 const inner=page?heading(body.title)+({properties:catalogue,listings:catalogue,approach,contact:viewing,viewing}[slug]||`<section><p>${e(body.body)}</p></section>`):'';
 return `<body class="ds forma"><header class="forma-head"><strong>${link('',project.brand)}</strong><nav class="forma-nav">${navigation}</nav><details><summary>${t[22]}</summary><nav>${navigation}</nav></details><nav aria-label="Language">${translations}</nav></header><main>${page?detail||inner:home}</main><footer class="forma-foot"><strong>${e(project.brand)}</strong><p>${t[6]}</p><nav>${navigation}</nav></footer>${runtime}<script>(${activate.toString()})();</script></body>`;
}
