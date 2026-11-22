import {photosFor,collectionPhoto,collectionPlate} from './photo-collection.js';
const products=[
 ['seasonal',640,['Sezónní kytice','Seasonal bouquet','باقة موسمية']],
 ['wild',780,['Luční vazba','Wild stems','باقة برية']],
 ['gift',890,['Barevný dárek','Colour gift','هدية ملونة']]
];
export const bloomMedia=products.map(([id])=>'assets/img/bloom-'+id+'-art.jpg');
export const bloomCatalogue=products.map(([id,price,names])=>[names[0],id,price,''].join(' | '));
const descriptions=[
 ['Tulipány, pryskyřníky a světlé květy v měkké jarní vazbě.','Tulips, ranunculus and pale spring flowers in a loose arrangement.','توليب وورد حوذان وزهور ربيعية فاتحة في باقة ناعمة.'],
 ['Chrpy, krásenky a trávy volně svázané jako čerstvý trs z louky.','Cornflowers, cosmos and grasses, loosely tied like a bundle picked from a meadow.','زهور قنطريون وكوزموس وأعشاب في باقة برية مرحة.'],
 ['Jiřiny a cínie v korálových, oranžových a růžových tónech.','Dahlias and zinnias in coral, orange and pink.','زهور داليا وزينيا بدرجات مرجانية وبرتقالية ووردية.']
];
const copy={
 cs:['Kytice','Dílna','Náš ateliér','Košík','Velikost','Malá','Střední','Velká','Přidat do ukázkového košíku','Fiktivní květinářství. Košík nevytváří objednávky.','Vše','Sezónní','Luční','Dárkové','E-mail','Připravit zájem','Ukázkový zájem připraven. Nic nebylo odesláno.','Vázání pro začátečníky','Sezónní aranžmá','Vyberte workshop','Navigace','Odebrat','Celkem','Košík je prázdný.','Položka přidána','Květiny v pohybu','Volné vazby, sezónní stonky a ateliér pro vlastní aranžmá.'],
 en:['Bouquets','Workshops','Our studio','Bag','Size','Small','Medium','Large','Add to demo bag','Fictional florist. The bag creates no orders.','All','Seasonal','Wild','Gifts','Email','Prepare enquiry','Demo enquiry ready. Nothing has been sent.','Bouquet tying for beginners','Seasonal arrangement','Choose workshop','Navigation','Remove','Total','Your bag is empty.','Item added','Flowers in motion','Loose arrangements, seasonal stems and a studio to try arranging your own.'],
 ar:['الباقات','الورش','الاستوديو','الحقيبة','الحجم','صغيرة','متوسطة','كبيرة','أضف إلى الحقيبة التجريبية','متجر خيالي ولا تنشئ الحقيبة طلبات.','الكل','موسمية','برية','هدايا','البريد الإلكتروني','إعداد استفسار','الاستفسار التجريبي جاهز ولم يُرسل.','ربط الباقات للمبتدئين','تنسيق موسمي','اختر الورشة','التنقل','إزالة','المجموع','الحقيبة فارغة.','تمت الإضافة','زهور في حركة','تنسيقات حرة وسيقان موسمية واستوديو للتنسيق.']
};
function activate(){
 const surface=document.querySelector('[data-bloom]'),rows=JSON.parse(surface.dataset.rows),t=JSON.parse(surface.dataset.labels);
 const key='dtmates-bloom-v9-bag';
 const quantityLabel={cs:'Počet kytic',en:'Bouquet quantity',ar:'عدد الباقات'}[document.documentElement.lang];
 const money=new Intl.NumberFormat(document.documentElement.lang,{style:'currency',currency:'CZK',maximumFractionDigits:0});
 let bag=[];
 const find=(id,size)=>bag.find(item=>item.id===id&&item.size===size);
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(bag));}catch{}};
 try{
   const stored=JSON.parse(localStorage.getItem(key)||'[]');
   if(Array.isArray(stored))for(const item of stored.slice(0,60)){
     if(!item||!rows.some(row=>row.id===item.id)||![0,1,2].includes(item.size))continue;
     const quantity=Number.isInteger(item.quantity)&&item.quantity>0?item.quantity:1;
     const line=find(item.id,item.size);
     if(line)line.quantity=Math.min(20,line.quantity+quantity);
     else bag.push({id:item.id,size:item.size,quantity:Math.min(20,quantity)});
   }
 }catch{}
 const list=surface.querySelector('[data-bloom-bag]');
 const linePrice=item=>{
   const row=rows.find(r=>r.id===item.id);
   return (row.price+row.sizeIncrement*item.size)*item.quantity;
 };
 function updateTotal(){
   surface.querySelector('[data-bloom-total]').textContent=bag.length?t[22]+' · '+money.format(bag.reduce((total,item)=>total+linePrice(item),0)):t[23];
 }
 function draw(){
   if(!list)return;
   list.replaceChildren(...bag.map((item,index)=>{
     const row=rows.find(r=>r.id===item.id);
     const li=document.createElement('li'),title=document.createElement('strong');
     const quantity=document.createElement('select'),subtotal=document.createElement('bdi'),button=document.createElement('button');
     title.textContent=row.name+' · '+t[5+item.size];
     quantity.setAttribute('aria-label',quantityLabel+' · '+title.textContent);
     for(let n=1;n<=20;n++)quantity.append(new Option(n,n,false,n===item.quantity));
     const updateSubtotal=()=>{subtotal.textContent=money.format(linePrice(item));};
     quantity.addEventListener('change',()=>{item.quantity=Number(quantity.value);save();updateSubtotal();updateTotal();});
     button.type='button';button.textContent=t[21];
     button.addEventListener('click',()=>{
       bag.splice(index,1);save();draw();
       (list.querySelectorAll('select')[index]||list.querySelector('select')||surface.querySelector('.bloom-order-board aside a'))?.focus();
     });
     updateSubtotal();
     li.append(title,quantity,subtotal,button);return li;
   }));
   updateTotal();
 }
 const filter=surface.querySelector('[data-bloom-filter]');
 if(filter)filter.onchange=()=>surface.querySelectorAll('[data-category]').forEach(el=>el.hidden=Boolean(filter.value&&filter.value!==el.dataset.category));
 const add=surface.querySelector('[data-bloom-add]');
 if(add)add.onsubmit=event=>{
   event.preventDefault();
   const id=add.dataset.bloomAdd,size=Number(add.elements.size.value);
   const line=find(id,size);
   if(line)line.quantity=Math.min(20,line.quantity+1);
   else bag.push({id,size,quantity:1});
   save();add.querySelector('output').textContent=t[24];
 };
 const workshop=surface.querySelector('[data-bloom-workshop]');
 if(workshop)workshop.onsubmit=event=>{event.preventDefault();workshop.querySelector('output').textContent=t[16]+'\n'+[...new FormData(workshop)].map(([k,v])=>k+' · '+v).join('\n');};
 draw();
}
export function bloomSite({project,locale,slug,page,link,translations,runtime,media,resolve,heroArt,escape:e}){
 const t=copy[locale],i=['cs','en','ar'].indexOf(locale),money=new Intl.NumberFormat(locale,{style:'currency',currency:'CZK',maximumFractionDigits:0});
 const routes=new Set(project.pages.filter(p=>p.visible&&p.content[locale].title).map(p=>p.slug));
 const nav=(path,text)=>routes.has(path)?link(path,text):'';
 const navigation=['bouquets','workshops','studio','bag'].map((path,index)=>nav(path,t[index])).join('');
 const photo=(src,alt='')=>src?`<img src="${e(src)}" alt="${e(alt)}" decoding="async">`:'';
 const rows=products.map(([id,cost,names],n)=>{
   const [name,category,price,description,increment]=project.catalogue?.[n]?.split('|').map(v=>v.trim())||[];
   const positive=(value,fallback)=>value&&Number.isFinite(+value)?Math.round(Math.max(0,Math.min(100000,+value))):fallback;
   return {id,category:['seasonal','wild','gift'].includes(category)?category:id,name:locale==='cs'&&name||names[i],price:positive(price,cost),sizeIncrement:positive(increment,120),description:locale==='cs'&&description||descriptions[n][i],photo:media[bloomMedia[n]]};
 });
 const floristry={
   cs:['Péče o kytici','Seřízněte stonky šikmo, odstraňte listy pod hladinou a pravidelně měňte vodu.','Dílna u pracovního stolu','Vyberte téma a připravte místní zájem o workshop.','Zpět ke kyticím'],
   en:['Bouquet care','Trim stems at an angle, remove submerged leaves and change the water regularly.','At the workshop table','Choose a session topic and prepare a local expression of interest.','Return to bouquets'],
   ar:['العناية بالباقة','قص السيقان بزاوية وأزل الأوراق تحت الماء وغيّر الماء بانتظام.','على طاولة الورشة','اختر الموضوع وأعد طلب اهتمام محليًا.','العودة إلى الباقات']
 }[locale];
 const title=(name,desc='')=>`<header class="bloom-title"><h1>${e(name)}</h1>${desc?`<p>${e(desc)}</p>`:''}</header>`;
 const list=`<section class="bloom-list bloom-stem-catalogue"><label>${t[0]}<select data-bloom-filter>${['','seasonal','wild','gift'].map((id,n)=>`<option value="${id}">${t[10+n]}</option>`).join('')}</select></label>${rows.map(item=>`<article data-category="${item.category}">${photo(item.photo)}<div><h2>${nav('bouquets/'+item.id,item.name)||e(item.name)}</h2><p>${e(item.description)}</p></div><p>${money.format(item.price)}</p></article>`).join('')}</section>`;
 const plates=photosFor('bloom',locale);
 const studio=`<section class="bloom-studio">${project.galleryImage?photo(project.galleryImage):collectionPhoto(plates[0],resolve,e)}<div><h2>${t[25]}</h2><p>${t[26]}</p>${nav('workshops',t[1])}</div></section>`;
 const home=`<section class="bloom-hero"><div class="bloom-opening-head">${title(project.headline[locale],project.subline[locale])}</div><figure class="bloom-main-stem">${heroArt||photo(project.hero)}</figure><figure class="bloom-side-stem">${collectionPhoto(plates[2],resolve,e)}</figure><nav class="bloom-front-actions" aria-label="${t[0]}">${nav('bouquets',t[0])}${nav('workshops',t[1])}</nav></section>${list}${studio}`;
 const item=rows.find(row=>'bouquets/'+row.id===slug);
 const detail=item?`<section class="bloom-product">${photo(project.featureImage&&!project.featureImage.endsWith('assets/img/bloom.webp')?project.featureImage:item.photo,item.name)}<div>${title(item.name,item.description)}<form data-bloom-add="${item.id}"><label>${t[4]}<select name="size">${[0,1,2].map(n=>`<option value="${n}">${t[5+n]} · ${money.format(item.price+n*item.sizeIncrement)}</option>`).join('')}</select></label><button>${t[8]}</button><output aria-live="polite"></output></form>${nav('bag',t[3])}</div></section><section class="bloom-care-note"><h2>${floristry[0]}</h2><p>${floristry[1]}</p>${nav('bouquets',floristry[4])}</section>`:'';
 const bag=`<section class="bloom-bag bloom-order-board"><ul data-bloom-bag></ul><aside><strong data-bloom-total aria-live="polite"></strong><p>${t[9]}</p>${nav('bouquets',floristry[4])}</aside></section>`;
 const workshop=`<section class="bloom-workshop bloom-table"><figure>${collectionPhoto(plates[1],resolve,e)}<figcaption>${floristry[2]}</figcaption></figure><div><p>${floristry[3]}</p><p>${t[9]}</p><form data-bloom-workshop><label>${t[19]}<select name="${t[19]}"><option>${t[17]}</option><option>${t[18]}</option></select></label><label>${t[14]}<input type="email" name="${t[14]}" required></label><button>${t[15]}</button><output aria-live="polite"></output></form></div></section>`;
 const body=page?.content[locale];
 const inner=page?title(body.title)+({bouquets:list,bag,studio,workshops:workshop+collectionPlate(plates,resolve,e,'bloom-workshop-photos',t[1]),contact:workshop}[slug]||`<section><p>${e(body.body)}</p></section>`):'';
 return `<body class="ds bloom-v9"><header class="bloom-head"><strong>${link('',project.brand)}</strong><nav class="bloom-nav">${navigation}</nav><details><summary>${t[20]}</summary><nav>${navigation}</nav></details><nav aria-label="Language">${translations}</nav></header><main data-bloom data-rows="${e(JSON.stringify(rows))}" data-labels="${e(JSON.stringify(t))}">${page?detail||inner:home}</main><footer class="bloom-foot"><strong>${e(project.brand)}</strong><p>${t[9]}</p><nav>${navigation}</nav></footer>${runtime}<script>(${activate.toString()})();</script></body>`;
}
