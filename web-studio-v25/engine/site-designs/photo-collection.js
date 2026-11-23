const captions={
 cafe:[['Příprava espressa','Coffee preparation','تحضير الإسبريسو'],['Koláče a espresso','Pastries and espresso','معجنات وإسبريسو'],['Stůl u okna','Window table','طاولة بجوار النافذة']],
 blackline:[['Odraz na karoserii','Paintwork reflection','انعكاس على الطلاء'],['Detail interiéru','Interior detail','تفاصيل المقصورة'],['Péče o kola','Wheel care','العناية بالعجلات']],
 hotel:[['Křesla u okna do dvora','Chairs by the courtyard window','مقاعد عند نافذة الفناء'],['Stůl pod podkrovním oknem','Desk under the attic window','مكتب تحت نافذة العلية'],['Salon s výhledem do ložnice','Sitting room and view into the bedroom','غرفة جلوس مطلة على غرفة النوم']],
 wellness:[['Příprava relaxačního rituálu','Preparing the relaxation ritual','تجهيز جلسة الاسترخاء'],['Lněná podložka a ručníky','Linen bolster and towels','وسادة كتان ومناشف'],['Dárkový poukaz ve studiu','Studio gift voucher','قسيمة هدية للاستوديو']],
 realty:[['Jídelní kout v bytě u parku','Dining nook in the park apartment','ركن تناول الطعام في شقة الحديقة'],['Zahradní průčelí domu','House elevation from the garden','واجهة المنزل من الحديقة'],['Terasa podkrovního bytu','Top-floor terrace','شرفة الشقة العلوية']],
 electric:[['Přehled rozvaděče','Distribution enclosure overview','نظرة على لوحة التوزيع'],['Měřicí technika','Test equipment','أجهزة القياس'],['Ovládání osvětlení','Lighting controls','أدوات التحكم بالإضاءة']],
 dental:[['Čekárna a recepce','Waiting area and reception','غرفة الانتظار والاستقبال'],['Připravená ordinace','Prepared treatment room','غرفة العلاج المجهزة'],['Pomůcky pro nácvik čištění','Brushing demonstration materials','أدوات التدريب على تنظيف الأسنان']],
 bloom:[['Výběr čerstvých květin','Selecting fresh stems','اختيار أزهار نضرة'],['Vázání u pracovního stolu','Arranging at the workshop table','تنسيق الزهور على طاولة العمل'],['Barevné vázy a jednotlivé stonky','Colourful vases and single stems','مزهريات ملونة وأزهار منفردة']],
 timo:[['Detail krajky','Lace detail','تفاصيل الدانتيل'],['Plavky na bavlně','Swimwear on cotton','ملابس سباحة على القطن'],['Saténové noční prádlo','Satin nightwear','ملابس نوم من الساتان']]
};
export const photosFor=(site,locale)=> (captions[site]||[]).map((text,index)=>({
 src:'assets/img/premium/'+site+'-'+(index+1)+'.jpg',
 small:'assets/img/premium/'+site+'-'+(index+1)+'-360.jpg',
 alt:text[['cs','en','ar'].indexOf(locale)]
}));
export const collectionPaths=site=>photosFor(site,'cs').flatMap(photo=>[photo.src,photo.small]);
export function collectionPhoto(photo,resolve,e,{eager=false,sizes='(max-width: 720px) 90vw, 38vw'}={}){
 if(!photo)return '';
 const responsive=photo.small?` srcset="${e(resolve(photo.small))} 360w, ${e(resolve(photo.src))} 724w" sizes="${sizes}" width="724" height="724"`:'';
 return `<img src="${e(resolve(photo.src))}"${responsive} alt="${e(photo.alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
}
export function collectionPlate(photos,resolve,e,className,label){
 return photos.length?`<section class="collection-plate ${className}" aria-label="${e(label)}">${photos.map(photo=>`<figure>${collectionPhoto(photo,resolve,e)}<figcaption>${e(photo.alt)}</figcaption></figure>`).join('')}</section>`:'';
}
