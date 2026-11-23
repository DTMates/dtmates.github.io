import {photosFor,collectionPhoto,collectionPlate} from './site-designs/photo-collection.js';
// Fictional products, based on the historical prototype's category structure.
const products=[
  ['lace','Podprsenka z jemné krajky','Lace bralette','حمالة دانتيل','lingerie',890],
  ['swim','Plavky s vysokým pasem','High-waisted bikini','ملابس سباحة بخصر مرتفع','swim',1490],
  ['slip','Saténová noční košilka','Satin nightdress','قميص نوم ساتان','night',1090],
  ['briefs','Krajkové kalhotky','Lace briefs','سروال داخلي من الدانتيل','lingerie',450],
  ['wireless','Hladká podprsenka bez kostic','Wireless everyday bra','حمالة ناعمة بدون سلك','lingerie',790],
  ['onepiece','Jednodílné plavky','One-piece swimsuit','ملابس سباحة قطعة واحدة','swim',1690],
  ['robe','Saténový župan','Satin robe','روب ساتان','night',1390],
  ['mesh','Kalhotky s vysokým pasem','High-waisted mesh briefs','سروال شبكي بخصر مرتفع','lingerie',490]
];
export const timoCatalogue=products.map(([,name,,,category,price])=>[name,category,price,'','S M L XL'].join(' | '));
export const timoMedia=products.map(([id],i)=>'assets/img/timo-v'+(i<4?7:8)+'-'+id+'.webp');
export const timoSeedIds=products.map(([id])=>id);
export const timoExtraLimit=8;
const validSize=/^(XS|S|M|L|XL|XXL)$/;
export function productSizes(text){
 return [...new Set(String(text||'').split(/[,\s]+/).filter(size=>validSize.test(size)))];
}
export function normalizeTimoExtra(input){
 const seen=new Set();
 return (Array.isArray(input)?input:[]).slice(0,timoExtraLimit).flatMap(item=>{
   if(!item||!/^new-[a-f0-9-]{36}$/.test(item.id)||seen.has(item.id))return [];
   seen.add(item.id);
   const local=(key,max)=>Object.fromEntries(['cs','en','ar'].map(lang=>[lang,typeof item[key]?.[lang]==='string'?item[key][lang].slice(0,max):'']));
   const image=typeof item.image==='string'&&item.image.length<670000&&/^data:image\/(webp|jpeg|png);base64,[a-z0-9+/=]+$/i.test(item.image)?item.image:'';
   return [{id:item.id,names:local('names',70),details:local('details',260),category:labels.includes(item.category)?item.category:'lingerie',
     price:Number.isFinite(item.price)?Math.round(Math.max(0,Math.min(100000,item.price))):0,
     sizes:productSizes(item.sizes).join(' ')||'S M L',image}];
 });
}
const copy={
  cs:['Prádlo','Plavky','Noční prádlo','Vše','Hledat','Řazení','Doporučené','Cena vzestupně','Cena sestupně','Velikost','Do košíku','Oblíbené','Košík','Pokladna','Položky celkem','Odebrat','Uložit','Prázdný seznam','Ukázkový nákup','E-mail','Pokračovat','Zkontrolovat výběr','Dokončit ukázku','Ukázka dokončena. Objednávka ani platba nevznikla.','Přidáno do košíku','Uložená položka','Nezávislý neoficiální koncept. Produkty a ceny jsou ilustrační.','Materiál a střih','Jemné materiály a pružné zakončení. Před výběrem porovnejte vlastní míry s průvodcem.'],
  en:['Lingerie','Swimwear','Nightwear','All','Search','Sort','Featured','Price low to high','Price high to low','Size','Add to bag','Wishlist','Bag','Checkout','Subtotal','Remove','Save','Nothing here yet','Demo checkout','Email','Continue','Review your selection','Finish demo','Demo complete. No order or payment was created.','Added to bag','Saved item','Independent, unofficial concept. Products and prices are illustrative.','Material and fit','Soft materials and stretch trim. Compare your measurements with the guide before selecting a size.'],
  ar:['ملابس داخلية','ملابس سباحة','ملابس نوم','الكل','بحث','ترتيب','مختارات','السعر تصاعدياً','السعر تنازلياً','المقاس','أضف إلى الحقيبة','المفضلة','الحقيبة','الدفع','المجموع','إزالة','حفظ','لا توجد عناصر','شراء تجريبي','البريد الإلكتروني','متابعة','راجع اختيارك','إنهاء العرض','اكتمل العرض التجريبي دون إنشاء طلب أو عملية دفع.','أضيف إلى الحقيبة','عنصر محفوظ','تصور مستقل وغير رسمي. المنتجات والأسعار توضيحية.','الخامة والمقاس','خامات ناعمة وحواف مرنة. قارن قياساتك بالدليل قبل اختيار المقاس.']
};
const labels=['lingerie','swim','night'];

function activateStore(){
  const store=document.querySelector('[data-store]');
  if(!store)return;
  const strings=JSON.parse(store.dataset.text);
  const money=new Intl.NumberFormat(document.documentElement.lang,{style:'currency',currency:'CZK',maximumFractionDigits:0});
  const products=new Map(JSON.parse(store.dataset.products).map(product=>[product.id,product]));
  const status=store.querySelector('[data-status]');
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const bagKey='dtmates-v7-timo-bag', wishKey='dtmates-v7-timo-wish';
  let bag=read(bagKey,[]), wish=read(wishKey,[]);
  if(!Array.isArray(bag))bag=[];
  if(!Array.isArray(wish))wish=[];
  bag=bag.filter(row=>row&&products.has(row.id)&&products.get(row.id).sizes.includes(row.size)&&Number.isInteger(row.qty)&&row.qty>=1&&row.qty<=20);
  wish=wish.filter(id=>products.has(id));
  const write=()=>{try{localStorage.setItem(bagKey,JSON.stringify(bag));localStorage.setItem(wishKey,JSON.stringify(wish));}catch{}};
  const total=()=>bag.reduce((sum,row)=>sum+row.qty*products.get(row.id).price,0);
  function make(tag,text){const node=document.createElement(tag);node.textContent=text;return node;}
  function update(){
    store.querySelectorAll('[data-wish]').forEach(button=>button.setAttribute('aria-pressed',String(wish.includes(button.dataset.wish))));
    const wishlist=store.querySelector('[data-wishlist]');
    if(wishlist){
      for(const card of wishlist.querySelectorAll('[data-product]'))card.hidden=!wish.includes(card.dataset.product);
      wishlist.querySelector('[data-empty]').hidden=wish.length>0;
    }
    const lines=store.querySelector('[data-bag]');
    if(lines){
      lines.replaceChildren(...bag.map((row,i)=>{
        const item=make('li','');
        item.append(make('strong',products.get(row.id).name+' · '+row.size));
        const qty=make('select','');
        qty.dataset.qty=i;
        qty.setAttribute('aria-label',products.get(row.id).name+' · '+row.size+' ×');
        for(let n=1;n<=20;n++)qty.append(new Option(n,n,false,row.qty===n));
        const remove=make('button',strings[15]);
        remove.type='button';remove.dataset.remove=i;
        item.append(qty,make('span',money.format(products.get(row.id).price*row.qty)),remove);
        return item;
      }));
      if(!bag.length)lines.append(make('li',strings[17]));
    }
    store.querySelectorAll('[data-subtotal]').forEach(node=>node.textContent=money.format(total()));
    store.querySelectorAll('[data-checkout]').forEach(node=>node.hidden=!bag.length);
    store.querySelectorAll('[data-checkout-empty]').forEach(node=>node.hidden=!!bag.length);
  }
  const grid=store.querySelector('[data-grid]');
  function filter(){
    if(!grid)return;
    const q=store.querySelector('[data-query]').value.trim().toLocaleLowerCase();
    const category=store.querySelector('[data-category]').value;
    const sort=store.querySelector('[data-sort]').value;
    const cards=[...grid.querySelectorAll('[data-product]')];
    cards.sort((a,b)=>sort==='featured'?Number(a.dataset.order)-Number(b.dataset.order):(sort==='asc'?1:-1)*(Number(a.dataset.price)-Number(b.dataset.price)));
    for(const card of cards)card.hidden=!(card.dataset.name.toLocaleLowerCase().includes(q)&&(!category||category===card.dataset.category));
    grid.append(...cards);
    grid.querySelector('[data-empty]').hidden=cards.some(card=>!card.hidden);
  }
  store.addEventListener('input',event=>{if(event.target.matches('[data-query],[data-category],[data-sort]'))filter();});
  store.addEventListener('change',event=>{
    if(!event.target.matches('[data-qty]'))return;
    const row=bag[Number(event.target.dataset.qty)];
    if(row){row.qty=Number(event.target.value);write();update();}
  });
  store.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(button?.dataset.quick){
      const dialog=store.querySelector('.v8-quick');
      const card=button.closest('[data-product]');
      const detail=dialog.querySelector('[data-quick-detail]');
      detail.replaceChildren(card.querySelector('img').cloneNode(),card.querySelector('p').cloneNode());
      dialog.showModal();
      return;
    }
    if(!button)return;
    if(button.matches('[data-timo-enlarge]')){
      const dialog=store.querySelector('.timo-photo-dialog');
      const photo=dialog.querySelector('figure');
      photo.classList.toggle('timo-detail-crop',button.hasAttribute('data-detail-crop'));
      const image=button.querySelector('img').cloneNode();
      if(!image.alt)image.alt=button.getAttribute('aria-label');
      photo.replaceChildren(image);
      dialog.showModal();
      dialog.addEventListener('close',()=>button.focus(),{once:true});
      return;
    }
    if(button.dataset.wish){
      const id=button.dataset.wish;
      wish=wish.includes(id)?wish.filter(item=>item!==id):[...wish,id];
      status.textContent=wish.includes(id)?strings[25]:'';
    }else if(button.dataset.remove!==undefined){
      bag.splice(Number(button.dataset.remove),1);
    }else{return;}
    write();update();
  });
  store.querySelector('[data-add]')?.addEventListener('submit',event=>{
    event.preventDefault();
    const id=event.currentTarget.dataset.add, size=new FormData(event.currentTarget).get('size');
    const row=bag.find(row=>row.id===id&&row.size===size);
    if(row)row.qty=Math.min(20,row.qty+1);else bag.push({id,size,qty:1});
    status.textContent=strings[24];write();update();
  });
  const checkout=store.querySelector('[data-checkout]');
  checkout?.addEventListener('submit',event=>{
    event.preventDefault();
    checkout.querySelector('[data-review]').hidden=false;
    checkout.querySelector('button[type=submit]').hidden=true;
    checkout.querySelector('[data-finish]').focus();
  });
  store.querySelector('[data-finish]')?.addEventListener('click',()=>{
    checkout.hidden=true;status.textContent=strings[23];status.focus();
  });
  update();filter();
}

export function timoStore({project,locale,slug,page,link,translations,runtime,media,resolve,heroArt,escape:e}){
  const l=copy[locale], localeIndex=['cs','en','ar'].indexOf(locale)+1;
  const money=new Intl.NumberFormat(locale,{style:'currency',currency:'CZK',maximumFractionDigits:0});
  const shopWords={cs:['Rychlý náhled','Zavřít','Náš koncept','Vybrat kolekci'],en:['Quick view','Close','Our concept','Explore collections'],ar:['عرض سريع','إغلاق','عن التصور','تصفح المجموعات']}[locale];
  const plates=photosFor('timo',locale);
  const enlarge={cs:'Zvětšit fotografii produktu',en:'Enlarge product photograph',ar:'تكبير صورة المنتج'}[locale];
  const closeup={cs:'Detail z fotografie produktu',en:'Detail cropped from the product photograph',ar:'تفاصيل مقتطعة من صورة المنتج'}[locale];
  const seededRows=products.map(([id,...fields],index)=>{
    const [name,category,price,description,sizes]=project.catalogue?.[index]?.split('|').map(field=>field.trim())||[];
    return {id,name:locale==='cs'&&name?name:fields[localeIndex-1],category:labels.includes(category)?category:fields[3],price:price&&Number.isFinite(Number(price))&&+price>=0?+price:fields[4],image:project.productImages?.[index]||media[timoMedia[index]],description:locale==='cs'&&description?description:l[28],sizes:productSizes(sizes||'S M L XL')};
  });
  const rows=seededRows.filter(row=>!project.timoHidden?.includes(row.id));
  for(const item of project.timoExtra||[]){
    const plate=plates[labels.indexOf(item.category)];
    rows.push({id:item.id,name:item.names[locale]||item.names.cs||item.names.en||item.id,category:item.category,
      price:item.price,image:resolve(item.image||plate.src),description:item.details[locale]||l[28],sizes:productSizes(item.sizes)});
  }
  const routes=new Set(project.pages.filter(p=>p.visible&&p.content[locale].title).map(p=>p.slug));
  const nav=(slug,text)=>!slug||routes.has(slug)?link(slug,text):'';
  const collectionLinks=labels.map((id,i)=>nav('collections/'+id,l[i])).join('');
  const rowLink=row=>nav('products/'+row.id,row.name);
  const art=(row,lazy=true)=>row?`<img src="${e(row.image)}" alt="${e(row.name)}" ${lazy?'loading="lazy"':'fetchpriority="high"'} width="627" height="627">`:'';
  const renderCards=(selection)=>selection.map((row,i)=>`<article data-product="${row.id}" data-name="${e(row.name)}" data-category="${row.category}" data-price="${row.price}" data-order="${i}">${art(row)}<div><p>${rowLink(row)||e(row.name)}<br><strong>${money.format(row.price)}</strong></p><button type="button" data-wish="${row.id}" aria-pressed="false">${l[16]}</button><button type="button" data-quick="${row.id}">${shopWords[0]}</button></div></article>`).join('');
  const cards=renderCards(rows);
  const empty=`<p data-empty>${l[17]}</p>`;
  const navigation=nav('collections',project.pages.find(p=>p.slug==='collections')?.content[locale].title||l[6])+nav('search',l[4])+nav('sizes',l[9])+nav('wishlist',l[11])+nav('cart',l[12]);
  const collectionIndex=labels.indexOf(slug.split('/')[1]);
  const collectionStory=[
    ['Krajka a jemné vrstvy','Lace and soft layers','الدانتيل والطبقات الناعمة'],
    ['Střihy k vodě','Cuts for the water','قصات للسباحة'],
    ['Večer v saténu','An evening in satin','أمسية بالساتان']
  ];
  const collectionTitle=collectionIndex<0?'':collectionStory[collectionIndex][['cs','en','ar'].indexOf(locale)];
  const product=slug==='products/sample-product'?rows[0]:rows.find(row=>'products/'+row.id===slug);
  const quickDialog=`<dialog class="v8-quick"><form method="dialog"><button>${shopWords[1]}</button></form><div data-quick-detail></div></dialog>`;
  const subtotal=`<p class="v7-total">${l[14]} <strong data-subtotal></strong></p>`;
  let content;
  if(!page){
    content=`<section class="v7-campaign"><div><h1>${e(project.headline[locale])}</h1><p>${l.slice(0,3).join(' · ')}</p>${nav('collections',shopWords[3])}</div><figure class="timo-cover-photo">${heroArt||art(rows[0],false)+art(rows[1],false)}</figure></section><nav class="v8-collection-links">${collectionLinks}</nav>${collectionPlate(plates,resolve,e,'timo-editorial',shopWords[3])}<section class="v7-stock"><h2>${l[6]}</h2><div class="v7-products">${renderCards(rows.length>2?rows.slice(2,6):rows)}</div></section>`;
  }else if(product){
    content=`<section class="v7-product"><h1>${e(product.name)}</h1><figure><button type="button" class="timo-photo-trigger" data-timo-enlarge aria-label="${enlarge}">${art(product,false)}</button><figcaption>${e(product.name)}</figcaption><button type="button" class="timo-photo-detail" data-timo-enlarge data-detail-crop aria-label="${closeup}"><span><img src="${e(product.image)}" alt="" loading="lazy" width="627" height="627"></span><span>${closeup}</span></button></figure><div><p>${money.format(product.price)}</p><form data-add="${product.id}"><label>${l[9]} <select name="size" required><option value="">—</option>${product.sizes.map(size=>`<option>${size}</option>`).join('')}</select></label><button>${l[10]}</button></form><button type="button" data-wish="${product.id}">${l[16]}</button><details open><summary>${l[27]}</summary><p>${e(product.description)}</p></details>${nav('sizes',l[9])}</div></section><dialog class="timo-photo-dialog" aria-label="${enlarge}"><form method="dialog"><button>${shopWords[1]}</button></form><figure></figure></dialog>`;
  }else if(['collections','search'].includes(slug)||slug.startsWith('collections/')){
    content=`<section class="v7-stock timo-collection-page"><header class="timo-collection-index"><div><h1>${e(page.content[locale].title)}</h1>${collectionTitle?`<p>${collectionTitle}</p>` : ''}<nav class="v8-collection-links">${collectionLinks}</nav></div>${collectionIndex>=0?collectionPhoto(plates[collectionIndex],resolve,e,{eager:true}):''}</header><div class="v7-filters"><label>${l[4]}<input type="search" data-query></label><label>${l[3]}<select data-category><option value="">${l[3]}</option>${labels.map((id,i)=>`<option value="${id}" ${slug==='collections/'+id?'selected':''}>${l[i]}</option>`).join('')}</select></label><label>${l[5]}<select data-sort><option value="featured">${l[6]}</option><option value="asc">${l[7]}</option><option value="desc">${l[8]}</option></select></label></div><div class="v7-products" data-grid>${cards}${empty}</div></section>`;
  }else if(slug==='wishlist'){
    content=`<section class="v7-stock"><h1>${l[11]}</h1><div class="v7-products" data-wishlist>${cards}${empty}</div></section>`;
  }else if(slug==='cart'){
    content=`<section class="v7-bag"><h1>${l[12]}</h1><ul data-bag></ul>${subtotal}${nav('checkout',l[13])}</section>`;
  }else if(slug==='checkout'){
    content=`<section class="v7-bag"><h1>${l[18]}</h1><p data-checkout-empty>${l[17]}</p><form data-checkout><label>${l[19]}<input type="email" required autocomplete="off"></label><button type="submit">${l[20]}</button><div data-review hidden><h2>${l[21]}</h2>${subtotal}<button type="button" data-finish>${l[22]}</button></div></form></section>`;
  }else{
    content=`<section class="v7-bag"><h1>${e(page.content[locale].title)}</h1><p>${e(page.content[locale].body)}</p></section>`;
  }
  return `<body class="ds ds-timo v7-store"><header class="v7-shophead"><div>${nav('',project.brand)}<nav aria-label="Language">${translations}</nav></div><nav>${navigation}</nav></header><main data-store data-text="${e(JSON.stringify(l))}" data-products="${e(JSON.stringify(rows.map(({image,...row})=>row)))}"><p class="v7-disclosure">${l[26]}</p>${content}${quickDialog}<p class="v7-feedback" data-status role="status" tabindex="-1"></p></main><footer class="v7-shopfoot"><p>${l[26]}</p><nav>${navigation}${nav('story',shopWords[2])}</nav></footer>${runtime}<script>(${activateStore.toString()})();</script></body>`;
}
