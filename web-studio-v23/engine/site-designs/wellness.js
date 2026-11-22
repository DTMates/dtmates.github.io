import {photosFor,collectionPhoto,collectionPlate} from './photo-collection.js';
const treatments=[
 ['relaxation',60,1050,['Relaxační rituál','Relaxation ritual','طقوس الاسترخاء'],['Pomalá péče celého těla s krátkou konzultací před začátkem.','Slow full-body care with a short consultation at the start.','عناية هادئة بالجسم مع استشارة قصيرة في البداية.']],
 ['back-neck',40,790,['Záda a šíje','Back and neck','الظهر والرقبة'],['Zaměření na záda a šíji. Tlak domluvíte při návštěvě.','A focus on back and neck, with pressure agreed at the visit.','عناية بالظهر والرقبة حسب الوتيرة المتفق عليها.']],
 ['voucher',60,1050,['Dárkový poukaz','Gift voucher','قسيمة هدية'],['Ukázkový poukaz na jeden relaxační rituál.','Illustrative voucher for one relaxation ritual.','قسيمة توضيحية لجلسة استرخاء واحدة.']]
];
export const wellnessCatalogue=treatments.map(([,time,price,names,detail])=>[names[0],time,price,detail[0]].join(' | '));
const wording={
 cs:['Rituály','Studio','Poptat termín','Délka a cena','Chvíle bez spěchu','Před návštěvou','Přijďte o deset minut dříve. Sdělte své preference a omezení.','Fiktivní studio. Ceny jsou ilustrační, termíny se nepotvrzují.','Rituál','Preferovaný den','E-mail','Připravit přehled','Ukázkový požadavek je připraven. Nic nebylo odesláno.','Vše','Do 45 minut','Přes 45 minut','Navigace'],
 en:['Treatments','Studio','Enquire','Duration and price','A moment without rush','Before your visit','Arrive ten minutes early and share your preferences and limitations.','Fictional studio. Prices are illustrative and availability is unconfirmed.','Treatment','Preferred day','Email','Prepare summary','Your demo request is ready. Nothing has been sent.','All','Up to 45 minutes','Over 45 minutes','Navigation'],
 ar:['العلاجات','الاستوديو','استفسار','المدة والسعر','لحظة من الهدوء','قبل الزيارة','احضر قبل عشر دقائق واذكر تفضيلاتك وأي قيود قبل الجلسة.','استوديو خيالي وأسعار توضيحية دون تأكيد التوفر.','العلاج','اليوم المفضل','البريد الإلكتروني','إعداد الملخص','طلبك التجريبي جاهز ولم يتم إرساله.','الكل','حتى ٤٥ دقيقة','أكثر من ٤٥ دقيقة','التنقل']
};
const ritualNotes={
 cs:[['Tempo podle vás','Před začátkem se domluvíme na tempu a částech těla, které chcete vynechat.','Po proceduře si nechte několik minut bez spěchu.'],['Péče zaměřená na šíji','Řekněte, kterým pohybům nebo polohám se potřebujete vyhnout.','Během návštěvy můžete kdykoli požádat o změnu tlaku.'],['Darujte čas pro sebe','Poukaz je určen na jeden relaxační rituál.','Tato ukázka poukaz nevystavuje ani nepřijímá platby.']],
 en:[['At your pace','Agree the pace and any areas to avoid before the session starts.','Leave a few unhurried minutes after the treatment.'],['A focus on the neck','Tell us about movements or positions you need to avoid.','You can ask to change the pressure at any point.'],['Give someone time for themselves','The voucher covers one relaxation ritual.','This demo issues no vouchers and accepts no payment.']],
 ar:[['على وتيرتك','اتفق على الوتيرة والمناطق التي تفضل تجنبها قبل بداية الجلسة.','اترك بضع دقائق للراحة بعدها.'],['عناية تركز على الرقبة','اذكر الحركات أو الأوضاع التي تحتاج إلى تجنبها.','يمكنك طلب تغيير الضغط في أي وقت.'],['امنح شخصًا وقتًا لنفسه','تغطي القسيمة جلسة استرخاء واحدة.','هذا العرض لا يصدر قسائم ولا يستقبل مدفوعات.']]
};
function activate(){
 const filter=document.querySelector('[data-treatment-filter]');
 if(filter)filter.onchange=()=>{
   for(const article of document.querySelectorAll('[data-duration]'))article.hidden=Boolean(filter.value&&filter.value!==(Number(article.dataset.duration)<=45?'short':'long'));
   document.querySelector('[data-mira-empty]').hidden=!!document.querySelector('[data-duration]:not([hidden])');
 };
 const form=document.querySelector('[data-mira-inquiry]');
 if(form){
   const requested=new URLSearchParams(location.search).get('treatment');
   const choices=form.querySelector('select');
   const selection=[...choices.options].find(option=>requested&&option.dataset.treatmentId===requested);
   if(selection)choices.value=selection.value;
 }
 if(form)form.onsubmit=event=>{
   event.preventDefault();form.querySelector('output').textContent=form.dataset.ready+'\n'+[...new FormData(form)].map(([key,value])=>key+' · '+value).join('\n');
 };
}
export function wellnessSite({project,locale,slug,page,link,translations,runtime,resolve,heroArt,escape:e}){
 const t=wording[locale], index=['cs','en','ar'].indexOf(locale);
 const money=new Intl.NumberFormat(locale,{style:'currency',currency:'CZK',maximumFractionDigits:0});
 const visible=new Set(project.pages.filter(p=>p.visible&&p.content[locale].title).map(p=>p.slug));
 const nav=(path,label)=>visible.has(path)?link(path,label):'';
 const bookingLink=item=>nav('book',t[2]).replace(/href="([^"]+)"/,(_,href)=>`href="${href}?treatment=${encodeURIComponent(item.id)}"`);
 const navigation=['treatments','studio','book','pricing'].map((path,i)=>nav(path,t[i])).join('');
 const more={cs:'Prohlédnout detail',en:'View details',ar:'عرض التفاصيل'}[locale];
 const empty={cs:'Žádný odpovídající rituál.',en:'No treatments match.',ar:'لا توجد علاجات مطابقة.'}[locale];
 const photo=(src,lazy=true)=>src?`<img src="${e(src)}" alt="" ${lazy?'loading="lazy"':'fetchpriority="high"'}>`:'';
 const rows=treatments.map(([id,time,price,names,details],i)=>{
   const [name,duration,cost,description]=project.catalogue?.[i]?.split('|').map(value=>value.trim())||[];
   const minutes=Number(duration);
   return {
     id,name:(locale==='cs'&&name)||names[index],time:Number.isInteger(minutes)&&minutes>0?Math.min(minutes,600):time,
     price:cost&&Number.isFinite(+cost)?Math.max(0,+cost):price,description:(locale==='cs'&&description)||details[index]
   };
 });
 const headline=(name,sub)=>`<header class="mira-title"><h1>${e(name)}</h1>${sub?`<p>${e(sub)}</p>`:''}</header>`;
 const row=item=>`<article data-duration="${item.time}"><div><h2>${e(item.name)}</h2><p>${e(item.description)}</p></div><p class="mira-duration"><bdi>${item.time} ${locale==="ar"?"د":"min"}</bdi><bdi>${money.format(item.price)}</bdi></p>${nav('treatments/'+item.id,more)}</article>`;
 const plates=photosFor('wellness',locale);
 const studio=`<section class="mira-studio">${photo(project.galleryImage||project.hero)}<div><h2>${t[4]}</h2><p>${e(project.aboutLocales[locale])}</p><p>${e(project.address)}</p>${nav('book',t[2])}</div></section>`;
 const home=`<section class="mira-opening"><div class="mira-opening-text">${headline(project.headline[locale],project.subline[locale])}${nav('treatments',t[0])}</div><figure>${heroArt||photo(project.hero,false)}</figure><nav class="mira-ritual-index" aria-label="${t[0]}">${rows.map(item=>nav('treatments/'+item.id,item.name)).join('')}${nav('book',t[2])}</nav></section><section class="mira-list"><h2>${t[0]}</h2>${rows.map(row).join('')}</section>${studio}${collectionPlate(plates,resolve,e,'mira-rituals',t[0])}`;
 const list=`<section class="mira-list">${slug==='treatments'?`<label>${t[3]}<select data-treatment-filter>${['','short','long'].map((id,i)=>`<option value="${id}">${t[13+i]}</option>`).join('')}</select></label>`:''}${rows.map(row).join('')}<p role="status" data-mira-empty hidden>${empty}</p></section>`;
 const booking=`<section class="mira-book mira-booking-spread"><aside><h2>${t[5]}</h2><p>${t[6]}</p><p>${t[7]}</p>${nav('treatments',t[0])}</aside><form data-mira-inquiry data-ready="${t[12]}"><label>${t[8]}<select name="${t[8]}">${rows.map(item=>`<option data-treatment-id="${item.id}">${e(item.name)}</option>`).join('')}</select></label><label>${t[9]}<input type="date" name="${t[9]}" required></label><label>${t[10]}<input type="email" name="${t[10]}" required></label><button>${t[11]}</button><output aria-live="polite"></output></form></section>`;
 const item=rows.find(row=>'treatments/'+row.id===slug);
 const note=item?ritualNotes[locale][rows.indexOf(item)]:[];
 const detail=item?`<section class="mira-ritual-spread" data-ritual="${item.id}"><div>${headline(item.name,item.description)}<dl><div><dt>${t[3]}</dt><dd><bdi>${item.time} ${locale==="ar"?"د":"min"}</bdi> · <bdi>${money.format(item.price)}</bdi></dd></div></dl>${bookingLink(item)}</div><figure>${project.featureImage&&!project.featureImage.endsWith("assets/img/mira-detail-v9.webp")?photo(project.featureImage,false):collectionPhoto(plates[rows.indexOf(item)],resolve,e,{eager:true})}</figure></section><section class="mira-ritual-notes"><div><h2>${note[0]}</h2><p>${note[1]}</p></div><div><h2>${t[5]}</h2><p>${note[2]}</p>${nav('treatments',t[0])}</div></section>`:'';
 const body=page?.content[locale];
 const inner=page?headline(body.title)+({treatments:list,pricing:list,studio,book:booking,booking}[slug]||`<section><p>${e(body.body)}</p></section>`):'';
 return `<body class="ds mira"><header class="mira-head"><a class="ds-skip" href="#content">${{cs:"Přeskočit na obsah",en:"Skip to content",ar:"انتقل إلى المحتوى"}[locale]}</a><strong>${link('',project.brand)}</strong><nav class="mira-nav">${navigation}</nav><details><summary>${t[16]}</summary><nav>${navigation}</nav></details><nav aria-label="Language">${translations}</nav></header><main id="content">${page?detail||inner:home}</main><footer class="mira-foot"><strong>${e(project.brand)}</strong><p>${t[7]}</p><nav>${navigation}</nav></footer>${runtime}<script>(${activate.toString()})();</script></body>`;
}
