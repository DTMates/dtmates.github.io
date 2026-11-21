import {editorialPicture} from './campaign.js';
import {photosFor,collectionPhoto} from './photo-collection.js';
const labels={
 cs:['Pokoje','Zážitky','Poptat pobyt','Dům pro pomalá rána','Prohlédnout pokoj','Hosté','Vybavení','Příjezd','Odjezd','E-mail','Pokoj','Poznámka','Připravit přehled','Odjezd musí být po příjezdu.','Ukázkový přehled pobytu','Fiktivní hotel. Tento formulář nepotvrzuje dostupnost ani rezervaci.','Snídaně a procházky','Začněte u stolu s kávou a pečivem. Po snídani se vydejte pěšky do historického centra. V poptávce uveďte čas příjezdu a případné dotazy k přístupnosti.','Navigace','Další pokoje'],
 en:['Rooms','Experiences','Enquire about a stay','A house for slow mornings','Explore room','Guests','Amenities','Arrival','Departure','Email','Room','Notes','Prepare summary','Departure must be after arrival.','Demo stay summary','Fictional hotel. This form confirms neither availability nor a reservation.','Breakfast and walks','Start with coffee and pastries, then head towards the historic centre on foot. Include your arrival time and any accessibility questions in the enquiry.','Navigation','Other rooms'],
 ar:['الغرف','التجارب','استفسار عن الإقامة','منزل للصباح الهادئ','استكشف الغرفة','الضيوف','وسائل الراحة','الوصول','المغادرة','البريد الإلكتروني','الغرفة','ملاحظات','إعداد الملخص','يجب أن تكون المغادرة بعد الوصول.','ملخص الإقامة التجريبي','فندق خيالي. النموذج لا يؤكد التوفر أو الحجز.','الفطور والمشي','ابدأ بالقهوة والمعجنات ثم توجه سيراً إلى المركز التاريخي. أضف وقت وصولك وأسئلة إمكانية الوصول في استفسارك.','التنقل','غرف أخرى']
};
const stayCopy={
 cs:{guide:'Vyberte si podle způsobu pobytu',dates:'Termín a pokoj',choose:'Porovnat pokoje',area:'Pěšky do centra',notes:'Zeptejte se na čas příjezdu, zavazadla nebo přístupnost. Do formuláře můžete přidat poznámku.',roomNav:'Přehled pokojů'},
 en:{guide:'Choose how you like to stay',dates:'Dates and room',choose:'Compare rooms',area:'Walk into the historic centre',notes:'Ask about arrival times, luggage or accessibility. Add a note to the inquiry.',roomNav:'Room directory'},
 ar:{guide:'اختر الغرفة وفق أسلوب إقامتك',dates:'التواريخ والغرفة',choose:'قارن الغرف',area:'سيرًا إلى المركز التاريخي',notes:'يمكنك إضافة سؤال عن الوصول أو الأمتعة أو سهولة الوصول إلى الاستفسار.',roomNav:'دليل الغرف'}
};
export const hotelRooms=[
 {id:'courtyard',capacity:2,image:'featureImage',names:['غرفة الفناء','Courtyard Room','Pokoj do dvora'],details:['سرير مزدوج وفناء هادئ وكرسيان للقراءة.','A double bed and two reading chairs overlook the quiet courtyard.','Dvoulůžko a dvě křesla s výhledem do klidného dvora.'],amenities:['دش ومكتب للكتابة','Shower and writing desk','Sprcha a psací stůl']},
 {id:'attic',capacity:2,image:'galleryImage',names:['غرفة العلية','Attic Room','Podkrovní pokoj'],details:['غرفة تحت عوارض خشبية وسقف مائل.','A double room under oak beams. The sloping ceiling reduces headroom by the walls.','Dvoulůžkový pokoj pod dubovými trámy. Šikmý strop snižuje výšku u stěn.'],amenities:['ستائر وحمام بدش','Blackout curtains and shower','Zatemňovací závěsy a sprcha']},
 {id:'salon',capacity:3,image:'suiteImage',names:['جناح بصالون','Salon Suite','Apartmá se salonem'],details:['غرفة نوم منفصلة وصالون مع أريكة سرير.','A separate bedroom and sitting room with a sofa bed for a third guest.','Oddělená ložnice a salon s rozkládací pohovkou pro třetího hosta.'],amenities:['حوض استحمام وطاولة','Bath and writing table','Vana a psací stolek']}
];
const bounded=(value,max)=>typeof value==='string'?value.slice(0,max):'';
export const roomLimit=10;
const roomImage=/^data:image\/(webp|jpeg|png);base64,[a-z0-9+/=]+$/i;
export function normalizeRooms(source,custom=false){
 const saved=Array.isArray(source)?source:[];
 const entries=custom?saved:hotelRooms.map(room=>({...saved.find(entry=>entry?.id===room.id),id:room.id}));
 const seen=new Set();
 return entries.slice(0,roomLimit).flatMap(entry=>{
   if(!entry||!/^[-a-z0-9]{1,50}$/.test(entry.id)||seen.has(entry.id))return [];
   seen.add(entry.id);
   const base=hotelRooms.find(room=>room.id===entry.id);
   const capacity=Math.min(8,Math.max(1,Number.isInteger(entry.capacity)?entry.capacity:base?.capacity||2));
   const copy=Object.fromEntries(['names','details','amenities'].map(key=>[
     key,[0,1,2].map(i=>bounded(entry[key]?.[i],300)||base?.[key][i]||'')
   ]));
   const gallery=(Array.isArray(entry.gallery)?entry.gallery:[]).slice(0,4).flatMap(photo=>{
     if(!photo||typeof photo.src!=='string'||photo.src.length>900000||!roomImage.test(photo.src))return [];
     return [{src:photo.src,alt:[0,1,2].map(i=>bounded(photo.alt?.[i],160))}];
   });
   return [{id:entry.id,image:base?.image||'',capacity,...copy,gallery}];
 });
}
function activateGallery(){
 const gallery=document.querySelector('[data-room-gallery]');
 if(!gallery)return;
 const dialog=gallery.querySelector('dialog');
 for(const button of gallery.querySelectorAll('[data-room-photo]')){
   button.onclick=()=>{
     dialog.querySelector('figure').replaceChildren(button.querySelector('img').cloneNode());
     dialog.showModal();
     dialog.addEventListener('close',()=>button.focus(),{once:true});
   };
 }
}
function activateStay(){
 const form=document.querySelector('[data-stay]');
 if(!form)return;
 const arrival=form.querySelector('[data-arrival]'),departure=form.querySelector('[data-departure]');
 const room=form.querySelector('[data-room]'),guests=form.querySelector('[data-guests]');
 const requestedRoom=new URLSearchParams(location.search).get('room');
 const selection=[...room.options].find(option=>requestedRoom&&option.dataset.roomId===requestedRoom);
 if(selection)room.value=selection.value;
 const validate=()=>departure.setCustomValidity(arrival.value&&departure.value&&departure.value<=arrival.value?form.dataset.invalid:'');
 form.addEventListener('input',()=>{form.querySelector('output').textContent='';});
 const sync=()=>{guests.max=room.selectedOptions[0]?.dataset?.capacity||'8';};
 arrival.oninput=validate;departure.oninput=validate;room.onchange=sync;sync();
 form.onsubmit=event=>{
   event.preventDefault();validate();
   if(form.reportValidity())form.querySelector('output').textContent=form.dataset.ready+'\n'+[...new FormData(form)].filter(([,v])=>v).map(([k,v])=>k+' · '+v).join('\n');
 };
}
export function hotelSite({project,locale,slug,page,link,translations,runtime,resolve,heroArt,escape:e}){
 const t=labels[locale], copy=stayCopy[locale], ix=['ar','en','cs'].indexOf(locale);
 const visible=new Set(project.pages.filter(p=>p.visible&&p.content[locale].title).map(p=>p.slug));
 const nav=(path,label)=>visible.has(path)?link(path,label).replace('<a ',path===slug?'<a aria-current="page" ':'<a '):'';
 const stayLink=item=>nav('contact',t[2]).replace(/href="([^"]+)"/,(_,href)=>`href="${href}?room=${encodeURIComponent(item.id)}"`);
 const navs=['rooms','experiences','contact'].map((path,i)=>nav(path,t[i])).join('');
 const photo=(src,eager=false,alt='')=>src?`<img src="${e(src)}" alt="${e(alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'}>`:'';
 const rooms=project.hotelRooms??hotelRooms;
 const plates=photosFor('hotel',locale);
 const mainPhoto=room=>room.gallery?.[0]?.src||project[room.image];
 const name=room=>room.names[ix]||room.names[2]||room.names[1]||room.id;
 const photoAlt=(image,room)=>image?.alt?.[ix]||image?.alt?.[2]||name(room);
 const roomLink=(r,label=t[4])=>nav('rooms/'+r.id,label);
 const cards=list=>`<section class="atelier-rooms atelier-room-directory" aria-label="${copy.roomNav}">${list.map(r=>`<article data-room-key="${e(r.id)}"><figure>${photo(mainPhoto(r)?resolve(mainPhoto(r)):'',false,photoAlt(r.gallery?.[0],r))}</figure><div><p class="atelier-room-capacity">${t[5]} <bdi>${r.capacity}</bdi></p><h2>${e(name(r))}</h2><p>${e(r.details[ix])}</p><p class="atelier-room-amenities">${e(r.amenities[ix])}</p>${roomLink(r)}</div></article>`).join('')}</section>`;
 const title=(text,body)=>`<header class="atelier-title"><h1>${e(text)}</h1>${body?`<p>${e(body)}</p>`:''}</header>`;
 const body=page?.content[locale];
 const experiences=`<section class="atelier-experience atelier-breakfast"><figure>${photo(project.experienceImage,false,t[16])}</figure><div><h2>${t[16]}</h2><p>${t[17]}</p></div></section><section class="atelier-experiences-note"><h2>${copy.area}</h2><div><p>${e(project.address)}</p><p>${copy.notes}</p>${nav('contact',t[2])}</div></section>`;
 const home=`<section class="atelier-hero">${heroArt||photo(project.hero,true)}<div>${title(project.headline[locale],project.subline[locale])}</div></section><nav class="atelier-stay-rail" aria-label="${t[2]}">${nav('rooms',t[0])}${nav('experiences',t[1])}${nav('contact',t[2])}</nav><section class="atelier-home-directory"><div><h2>${copy.guide}</h2><p>${e(project.aboutLocales[locale])}</p></div><ul>${rooms.map(r=>`<li>${roomLink(r,name(r))}<span>${t[5]} <bdi>${r.capacity}</bdi></span></li>`).join('')}</ul></section>${experiences}`;
 const r=rooms.find(room=>'rooms/'+room.id===slug);
 const galleryLabels={cs:['Fotografie pokoje','Detail pokoje','Zavřít'],en:['Room photographs','Room detail','Close'],ar:['صور الغرفة','تفاصيل الغرفة','إغلاق']}[locale];
 const roomPhotos=r?[
   {src:mainPhoto(r),alt:photoAlt(r.gallery?.[0],r)},
   {src:project[r.id+'Detail'],alt:galleryLabels[1]},
   plates[hotelRooms.findIndex(room=>room.id===r.id)],
   ...(r.gallery||[]).map(image=>({src:image.src,alt:photoAlt(image,r)}))
 ].filter((entry,i,list)=>entry?.src&&list.findIndex(other=>other?.src===entry.src)===i):[];
 const gallery=roomPhotos.length?`<section class="atelier-gallery" data-room-gallery><h2>${galleryLabels[0]}</h2><div>${roomPhotos.map(image=>`<button type="button" data-room-photo aria-label="${e(image.alt)}">${collectionPhoto(image,resolve,e)}</button>`).join('')}</div><dialog><form method="dialog"><button>${galleryLabels[2]}</button></form><figure></figure></dialog></section>`:'';
 const courtyard=r?.id==='courtyard'&&!r.gallery?.length?editorialPicture('courtyard',locale,resolve,e):'';
 const detail=r?`<section class="atelier-room-spread" data-room-key="${e(r.id)}"><div>${title(name(r),r.details[ix])}<dl><div><dt>${t[5]}</dt><dd><bdi>${r.capacity}</bdi></dd></div><div><dt>${t[6]}</dt><dd>${e(r.amenities[ix])}</dd></div></dl>${stayLink(r)}</div><figure>${photo(mainPhoto(r)?resolve(mainPhoto(r)):'',true,photoAlt(r.gallery?.[0],r))}</figure></section>${courtyard?`<section class="atelier-room-panorama">${courtyard}</section>`:''}${gallery}<nav class="atelier-other-rooms" aria-label="${t[19]}"><strong>${t[19]}</strong>${rooms.filter(room=>room!==r).map(room=>roomLink(room,name(room))).join('')}</nav>`:'';
 const input=(label,attributes)=>`<label>${label}<input name="${label}" ${attributes} required></label>`;
 const stay=rooms.length?`<section class="atelier-stay atelier-stay-desk"><aside><h2>${copy.dates}</h2><p>${t[15]}</p><p>${copy.notes}</p>${nav('rooms',copy.choose)}</aside><form data-stay data-invalid="${t[13]}" data-ready="${t[14]}"><div class="atelier-fields">${input(t[7],'type="date" data-arrival')}${input(t[8],'type="date" data-departure')}<label>${t[10]}<select name="${t[10]}" data-room>${rooms.map(room=>`<option data-capacity="${room.capacity}" data-room-id="${e(room.id)}">${e(room.names[ix])}</option>`).join('')}</select></label>${input(t[5],'type="number" min="1" value="1" data-guests')}</div>${input(t[9],'type="email"')}<label>${t[11]}<textarea name="${t[11]}" maxlength="400"></textarea></label><button>${t[12]}</button><output aria-live="polite"></output></form></section>`:`<section class="atelier-stay"><p>${t[15]}</p></section>`;
 const inner=page?title(body.title)+({rooms:cards(rooms),experiences,contact:stay}[slug]||`<section><p>${e(body.body)}</p></section>`):'';
 return `<body class="ds atelier"><header class="atelier-head"><a class="ds-skip" href="#content">${{cs:'Přeskočit na obsah',en:'Skip to content',ar:'انتقل إلى المحتوى'}[locale]}</a><div>${link('',project.brand)}</div><nav class="atelier-nav" aria-label="${t[18]}">${navs}</nav><details><summary>${t[18]}</summary><nav>${navs}</nav></details><nav aria-label="Language">${translations}</nav></header><main id="content">${!page?home:detail||inner}</main><footer class="atelier-foot"><strong>${e(project.brand)}</strong><p>${t[15]}</p><nav>${navs}</nav></footer>${runtime}${r?`<script>(${activateGallery.toString()})();</script>`:''}${slug==='contact'?`<script>(${activateStay.toString()})();</script>`:''}</body>`;
}
