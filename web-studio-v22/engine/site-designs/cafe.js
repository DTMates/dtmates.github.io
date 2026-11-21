import {photosFor,collectionPhoto,collectionPlate} from './photo-collection.js';
import {menuCategories,defaultMenu} from './cafe-menu.js';
const copy={
 cs:{nav:['Menu','Náš příběh','Navštivte nás'],eyebrow:'Kavárna a pekárna',feature:'Z trouby na stůl',season:'Máslový croissant a espresso',seasonText:'Listové těsto pečeme dozlatova. K němu krátké espresso nebo čaj podle chuti.',menu:'Co je na menu',all:'Vše',find:'Kategorie',search:'Hledat v menu',story:'Ráno v MÍSTĚ',storyText:'Ráno patří mlýnku a troubě. Odpoledne dlouhému stolu, čtení u okna a druhému šálku.',visit:'Naplánujte návštěvu',hours:'Otevírací doba',week:'Pondělí–pátek',weekend:'Sobota–neděle',sample:'Fiktivní kavárna. Adresa, otevírací doba a ceny jsou ukázkové.',story3:'Přijďte na krátké espresso nebo se zdržte u snídaně. Nabídka pečiva se mění podle sezóny.',skip:'Přeskočit na obsah',picture:'Espresso a croissant na stole u okna',language:'Jazyky',navigation:'Navigace'},
 en:{nav:['Menu','Our story','Plan a visit'],eyebrow:'Coffee and baking',feature:'From oven to table',season:'Butter croissant and espresso',seasonText:'Golden, flaky pastry with a short espresso or your choice of tea.',menu:'On the menu',all:'All',find:'Category',search:'Search the menu',story:'Morning at MÍSTO',storyText:'Mornings start with the grinder and the oven. Afternoons are for the long table, a book by the window and a second cup.',visit:'Plan your visit',hours:'Opening hours',week:'Monday–Friday',weekend:'Saturday–Sunday',sample:'Fictional café. Address, hours and prices are illustrative.',story3:'Drop in for a short espresso or stay for breakfast. The pastries change with the seasons.',skip:'Skip to content',picture:'Espresso and croissant by the window',language:'Languages',navigation:'Navigation'},
 ar:{nav:['القائمة','قصتنا','خطط لزيارتك'],eyebrow:'مقهى ومخبز',feature:'من الفرن إلى الطاولة',season:'كرواسون بالزبدة وإسبريسو',seasonText:'معجنات ذهبية تقدم مع إسبريسو أو شاي من اختيارك.',menu:'من القائمة',all:'الكل',find:'الفئة',search:'ابحث في القائمة',story:'صباح في ميستو',storyText:'يبدأ الصباح بطحن القهوة وتسخين الفرن، وبعد الظهر مكان للقراءة وفنجان آخر قرب النافذة.',visit:'خطط لزيارتك',hours:'ساعات العمل',week:'الاثنين–الجمعة',weekend:'السبت–الأحد',sample:'مقهى خيالي. العنوان وساعات العمل والأسعار توضيحية.',story3:'توقف لشرب إسبريسو أو ابق لتناول الفطور. تتغير المعجنات حسب الموسم.',skip:'انتقل إلى المحتوى',picture:'إسبريسو وكرواسون قرب النافذة',language:'اللغات',navigation:'التنقل'}
};
const editorial={
 cs:{menuIntro:'Káva od rána, něco teplého k snídani a pečivo k poslednímu soustu.',menuNote:'Nabídka je ukázková. Na složení a alergeny se zeptejte u pultu.',bread:'První bochník dne',breadAlt:'Pekař drží kváskový chléb na pomoučeném stole',breadBody:'Těsto odpočívá přes noc. První bochník krájíme až po vychladnutí, aby střídka zůstala vláčná.',table:'Posaďte se k oknu',location:'Ukázková lokalita',plan:'Před cestou',request:'Dotaz před návštěvou',allergens:'Složení a alergeny proberte u pultu.',visitTime:'Na snídani nebo na kávu s sebou.',openMap:'Otevřít mapu Prahy'},
 en:{menuIntro:'Coffee from opening, a hot breakfast and something from the bakery to finish.',menuNote:'Illustrative menu. Ask at the counter about ingredients and allergens.',bread:'The first loaf of the day',breadAlt:'Baker holding a sourdough loaf at a flour-dusted table',breadBody:'The dough rests overnight. We slice the first loaf once it has cooled to keep the crumb soft.',table:'Take a seat by the window',location:'Illustrative location',plan:'Before you leave',request:'Ask about a visit',allergens:'Ask at the counter about ingredients and allergens.',visitTime:'Come for breakfast or take a coffee away.',openMap:'Open a map of Prague'},
 ar:{menuIntro:'قهوة منذ الصباح وفطور ساخن وشيء من المخبز في الختام.',menuNote:'قائمة توضيحية. اسأل عند المنضدة عن المكونات ومسببات الحساسية.',bread:'أول رغيف في اليوم',breadAlt:'خباز يحمل رغيف خبز فوق طاولة مرشوشة بالدقيق',breadBody:'يستريح العجين طوال الليل. نقطع الرغيف الأول بعد أن يبرد ليبقى طريًا من الداخل.',table:'اجلس قرب النافذة',location:'موقع توضيحي',plan:'قبل الانطلاق',request:'اسأل عن الزيارة',allergens:'اسأل عند المنضدة عن المكونات ومسببات الحساسية.',visitTime:'تفضل بتناول الفطور أو خذ قهوتك معك.',openMap:'افتح خريطة براغ'}
};
const visitFormCopy={
 cs:['Počet hostů','Preferovaný den','E-mail','Připravit ukázkový dotaz','Údaje zůstávají v tomto okně.','Ukázkový dotaz je připraven. Nic nebylo odesláno.'],
 en:['Guests','Preferred date','Email','Prepare a demo inquiry','Your details stay in this window.','Your demo inquiry is ready. Nothing was sent.'],
 ar:['عدد الضيوف','التاريخ المفضل','البريد الإلكتروني','إعداد استفسار تجريبي','تبقى بياناتك في هذه النافذة.','استفسارك التجريبي جاهز. لم يتم إرسال أي شيء.']
};
const visitScript=`<script>
const form=document.querySelector('[data-misto-visit]');
const today=new Date();
const minDate=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
form.elements.date.min=minDate;
form.querySelector('button').disabled=false;
form.addEventListener('submit',event=>{
  event.preventDefault();
  const summary=form.querySelector('dl');
  const data=new FormData(form);
  for(const result of summary.querySelectorAll('dd')) result.textContent=data.get(result.dataset.field);
  summary.hidden=false;
  form.querySelector('[role=status]').textContent=form.dataset.complete;
});
</script>`;
const stock=[
 [['Espresso','Espresso','إسبريسو'],0,65,['Krátká káva s tóny kakaa.','Short coffee with cocoa notes.','قهوة قصيرة بنكهة الكاكاو.']],
 [['Flat white','Flat white','فلات وايت'],0,89,['Dvojité espresso, jemná mléčná pěna.','Double espresso and silky steamed milk.','إسبريسو مزدوج مع حليب مبخر.']],
 [['Šípkový čaj','Rosehip tea','شاي ثمر الورد'],1,72,['Sypaný čaj s jablkem.','Loose-leaf infusion with apple.','منقوع ثمر الورد مع التفاح.']],
 [['Citronová limonáda','Lemon soda','ليمونادة'],1,85,['Citron, máta a perlivá voda.','Lemon, mint and sparkling water.','ليمون ونعناع ومياه غازية.']],
 [['Vejce na kváskovém chlebu','Eggs on sourdough','بيض على خبز العجين المخمر'],2,195,['Míchaná vejce, pažitka a nakládaná zelenina.','Scrambled eggs, chives and pickled vegetables.','بيض مخفوق وثوم معمر وخضار مخللة.']],
 [['Jogurt a granola','Yogurt and granola','زبادي وغرانولا'],2,145,['Pečené vločky a sezónní ovoce.','Toasted oats and seasonal fruit.','شوفان محمص وفاكهة موسمية.']],
 [['Máslový croissant','Butter croissant','كرواسون بالزبدة'],3,76,['Křehké vrstvy máslového těsta.','Flaky layers of butter pastry.','طبقات مقرمشة من عجينة الزبدة.']],
 [['Jablečný koláč','Apple cake','كعكة التفاح'],3,95,['Jablka, skořice a křupavá drobenka.','Apple, cinnamon and crisp crumble.','تفاح وقرفة وطبقة مقرمشة.']]
];
export const cafeMenu=defaultMenu(stock);
const filterScript=`<script>
const menu=document.querySelector('[data-catalogue]');
if(menu){
  const picker=menu.querySelector('select');
  const search=menu.querySelector('input');
  const empty=menu.querySelector('[data-empty]');
  const filter=()=>{
    const query=search.value.trim().toLocaleLowerCase();
    for(const row of menu.querySelectorAll('[data-kind]')){
      row.hidden=Boolean((picker.value&&row.dataset.kind!==picker.value)||!row.textContent.toLocaleLowerCase().includes(query));
    }
    for (const group of menu.querySelectorAll('[data-menu-group]')) {
      group.hidden=!group.querySelector('[data-kind]:not([hidden])');
    }
    empty.hidden=!!menu.querySelector('[data-kind]:not([hidden])');
  };
  picker.addEventListener('change',filter);
  search.addEventListener('input',filter);
}
</script>`;
export function cafeSite({project,locale,page,slug,link,translations,runtime,resolve,heroArt,escape:e}){
  const text={...copy[locale],...editorial[locale]}, index=['cs','en','ar'].indexOf(locale);
  const available=new Set(project.pages.filter(p=>p.visible&&p.content[locale].title).map(p=>p.slug));
  const routes=['menu','about','visit'];
  const route=(i,label)=>available.has(routes[i])?link(routes[i],label||text.nav[i]):'';
  const nav=routes.map((target,i)=>target===slug?route(i).replace('<a ','<a aria-current="page" '):route(i)).join('');
  const price=new Intl.NumberFormat(locale,{style:'currency',currency:'CZK',maximumFractionDigits:0});
  const phrases={cs:['Překlad chybí','Žádné položky neodpovídají hledání.'],en:['Translation pending','No items match your search.'],ar:['الترجمة قيد الإعداد','لا توجد عناصر مطابقة للبحث.']}[locale];
  const rows=project.cafeMenu??cafeMenu;
  const entries=list=>`<dl class="misto-menu-items">${list.map(item=>`<div data-menu-id="${e(item.id)}" data-kind="${e(item.category)}"><dt>${e(item.names[locale]||phrases[0])} <span><bdi>${price.format(item.price)}</bdi></span></dt><dd>${e(item.descriptions[locale]||phrases[0])}</dd></div>`).join('')}</dl>`;
  const image=(src,alt='',lazy=true)=>src?`<img src="${e(src)}" alt="${e(alt)}" ${lazy?'loading="lazy"':'fetchpriority="high"'}>`:'';
  const hours=`<dl class="misto-hours"><div><dt>${text.week}</dt><dd><bdi>${e(project.weekdayHours||'08:00–18:00')}</bdi></dd></div><div><dt>${text.weekend}</dt><dd><bdi>${e(project.weekendHours||'09:00–16:00')}</bdi></dd></div></dl>`;
  const title=e(page?.content[locale].title||text.story);
  const body=e(page?.content[locale].body||'').replaceAll('\n','<br>');
  const address=e(project.address);
  const plates=photosFor('cafe',locale);
  const bread=`<img class="misto-bread" src="${e(resolve('assets/img/misto-bakery.jpg'))}" srcset="${e(resolve('assets/img/misto-bakery-720.jpg'))} 720w, ${e(resolve('assets/img/misto-bakery.jpg'))} 1536w" sizes="(max-width: 700px) 92vw, ${slug==='about'?'min(55vw, 52rem)':'min(42vw, 26rem)'}" width="1536" height="1024" alt="${text.breadAlt}" loading="lazy">`;
  const groups=Object.entries(menuCategories).map(([id,names])=>{
    const items=rows.filter(item=>item.category===id);
    return items.length?`<section class="misto-menu-group" data-menu-group data-category="${id}"><h2>${names[index]}</h2>${entries(items)}</section>`:'';
  }).join('');
  const previewRows=Object.keys(menuCategories).flatMap(category=>rows.find(item=>item.category===category)||[]);
  const journal=collectionPlate(plates,resolve,e,'misto-journal',text.story);
  const home=`<main id="content"><section class="misto-hero"><header class="misto-lead"><p class="misto-label">${text.eyebrow}</p><h1>${e(project.headline[locale])}</h1><p>${e(project.subline[locale])}</p></header><figure>${heroArt||image(project.hero,'',false)}</figure><aside class="misto-visit-ledger"><h2>${text.hours}</h2>${hours}<div class="misto-actions">${route(0,project.ctaLocales[locale])}${route(2)}</div></aside></section>
  <section class="misto-season">${image(project.featureImage,text.picture)}<div><p class="misto-label">${text.feature}</p><h2>${text.season}</h2><p>${text.seasonText}</p>${route(0)}</div></section>
  <section class="misto-preview"><div><h2>${text.menu}</h2>${route(0)}</div>${entries(previewRows)}</section>
  <section class="misto-prose"><div><h2>${text.story}</h2><p>${text.storyText}</p>${route(1)}</div>${bread}</section>
  ${journal}<section class="misto-visit-band"><div><h2>${text.visit}</h2><p>${address}</p>${route(2)}</div><div><h3>${text.hours}</h3>${hours}</div></section></main>`;
  const menu=`<main id="content" class="misto-menu-page"><header class="misto-menu-title"><p class="misto-label">${text.eyebrow}</p><h1>${title}</h1><p>${text.menuIntro}</p></header><div class="misto-menu-sheet" data-catalogue><div class="misto-filters"><label>${text.search}<input type="search"></label><label>${text.find}<select><option value="">${text.all}</option>${Object.entries(menuCategories).map(([id,names])=>`<option value="${id}">${names[index]}</option>`).join('')}</select></label></div><div class="misto-menu-groups">${groups}</div><p role="status" data-empty ${rows.length?'hidden':''}>${phrases[1]}</p></div><aside class="misto-menu-note"><div><h2>${text.feature}</h2><p>${text.menuNote}</p>${route(2)}</div>${collectionPhoto(plates[1],resolve,e)}</aside></main>`;
  const story=`<main id="content" class="misto-story-page"><header class="misto-story-title"><p class="misto-label">${text.eyebrow}</p><h1>${title}</h1><p>${text.storyText}</p></header><figure class="misto-story-cover">${bread}<figcaption>${text.bread}</figcaption></figure><article class="misto-story-spread"><div><h2>${text.bread}</h2><p>${text.breadBody}</p><p>${body}</p>${route(0)}</div><figure>${image(project.featureImage,text.picture)}<figcaption>${text.season}</figcaption></figure></article><aside class="misto-story-window">${image(project.galleryImage,project.galleryAlt)}<div><h2>${text.table}</h2><p>${text.story3}</p>${route(2)}</div></aside></main>`;
  const [guests,date,email,prepare,localOnly,complete]=visitFormCopy[locale];
  const visitForm=`<section class="misto-visit-request"><h2>${text.request}</h2><form data-misto-visit data-complete="${complete}"><div class="misto-request-fields"><label>${guests}<input name="guests" type="number" required min="1" max="20"></label><label>${date}<input name="date" type="date" required></label><label>${email}<input name="email" type="email" dir="ltr" required maxlength="254"></label></div><button type="submit" disabled>${prepare}</button><p role="status">${localOnly}</p><dl hidden>${[['guests',guests],['date',date],['email',email]].map(([id,label])=>`<div><dt>${label}</dt><dd data-field="${id}" dir="auto"></dd></div>`).join('')}</dl></form></section>`;
  const contactPhone=project.phone?.replace(/[^+0-9]/g,'');
  const phone=contactPhone&&contactPhone!=='+420000000000'?`<a href="tel:${e(contactPhone)}">${e(project.phone)}</a>`:'';
  const emailLink=project.email&&!/@example\.com$/i.test(project.email)?`<a href="mailto:${e(project.email)}">${e(project.email)}</a>`:'';
  const windowView=`<figure>${collectionPhoto(plates[2],resolve,e)}<figcaption>${e(plates[2].alt)}</figcaption></figure>`;
  const visit=`<main id="content" class="misto-visit-page"><header><p class="misto-label">${text.eyebrow}</p><h1>${title}</h1><p>${text.visitTime}</p></header><div class="misto-visit-card"><section><h2>${text.hours}</h2>${hours}<p>${text.sample}</p></section><section><h2>${text.location}</h2><address>${address}</address><div class="misto-directions"><a href="https://www.openstreetmap.org/search?query=Praha">${text.openMap}</a>${phone}${emailLink}</div></section></div><section class="misto-visit-note"><div><h2>${text.plan}</h2><p>${text.allergens}</p>${route(0)}</div>${windowView}</section>${visitForm}</main>`;
  const content=!page?home:({menu,about:story,visit}[slug]||`<main id="content" class="misto-paper"><h1>${title}</h1><p>${body}</p></main>`);
  return `<body class="ds misto"><header class="misto-head"><a class="ds-skip" href="#content">${text.skip}</a><div class="misto-logo">${link('',project.brand)}</div><nav class="misto-desktop" aria-label="${text.navigation}">${nav}</nav><details class="misto-mobile"><summary>${text.navigation}</summary><nav aria-label="${text.navigation}">${nav}</nav></details><nav class="misto-langs" aria-label="${text.language}">${translations}</nav></header>${content}<footer class="misto-foot"><div><strong>${e(project.brand)}</strong><p>${text.sample}</p></div><nav aria-label="${text.navigation}">${nav}</nav></footer>${runtime}${slug==='menu'?filterScript:slug==='visit'?visitScript:''}</body>`;
}
