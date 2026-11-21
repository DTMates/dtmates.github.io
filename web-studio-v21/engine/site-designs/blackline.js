import {photosFor,collectionPhoto} from './photo-collection.js';
import {packages as defaults} from './packages.js';
const strings={
 cs:['Služby','Balíčky','Galerie','Poptat péči','Povrch pod kontrolou','Interiér, lak a ochrana povrchu v oddělených pracovních postupech.','Jak pracujeme','Prohlídka a domluva rozsahu','Čištění a příprava podkladu','Kontrola a předání','Fiktivní studio. Rozsahy služeb a fotografie jsou ilustrační.','Vyberte balíček','Obsah','Interiér','Jednokroková korekce','Ochrana povrchu','Údržba','Další','Zpět','Připravit přehled','Vozidlo','Služba','Balíček','Stav a požadavky','E-mail','Přehled poptávky','Ukázková poptávka připravena v prohlížeči.','Zavřít','Přeskočit na obsah'],
 en:['Services','Packages','Gallery','Request a quote','Surface under control','Separate processes for interiors, paint and surface protection.','How we work','Inspect and agree the scope','Clean and prepare the surface','Check and hand over','Fictional studio. Service scopes and imagery are illustrative.','Compare packages','Scope','Interior','Single-stage correction','Surface protection','Maintenance','Next','Back','Prepare summary','Vehicle','Service','Package','Condition and requests','Email','Request summary','Demo request prepared in your browser.','Close','Skip to content'],
 ar:['الخدمات','الباقات','المعرض','طلب عرض','العناية بالسطح','عمليات منفصلة للمقصورة والطلاء وحماية السطح.','طريقة العمل','فحص وتحديد نطاق العمل','تنظيف وتجهيز السطح','مراجعة وتسليم','استوديو خيالي. نطاق الخدمات والصور توضيحي.','قارن الباقات','نطاق العمل','المقصورة','تصحيح بخطوة واحدة','حماية السطح','الصيانة','التالي','رجوع','إعداد الملخص','المركبة','الخدمة','الباقة','الحالة والمتطلبات','البريد الإلكتروني','ملخص الطلب','تم إعداد الطلب التجريبي في متصفحك.','إغلاق','انتقل إلى المحتوى']
};
const descriptions={
 cs:['Vysátí, čištění spár a ošetření povrchů vhodné pro jejich materiál. Stopy opotřebení se posoudí zvlášť.','Mytí, dekontaminace a zkušební leštění na malé ploše. Hlubší vady se řeší až po prohlídce.','Příprava odmaštěného povrchu a aplikace vybrané ochrany. Údržbu přizpůsobte typu produktu.','Šetrné mytí, kontrola ochranné vrstvy a péče o místa, kam se běžná údržba nedostane.'],
 en:['Vacuuming, seam cleaning and material-appropriate care. Wear marks are assessed separately.','Wash, decontamination and a test polish on a small area. Deeper defects require inspection.','Surface preparation and application of selected protection. Follow the product-specific care instructions.','Gentle washing, checking the protective layer and cleaning hard-to-reach areas.'],
 ar:['تنظيف بالمكنسة وتنظيف الفواصل والعناية بحسب الخامة. تُقيّم آثار التآكل بشكل منفصل.','غسيل وإزالة الملوثات وتجربة التلميع على جزء صغير. تُفحص العيوب العميقة أولاً.','تحضير السطح وتطبيق الحماية المختارة. اتبع تعليمات الصيانة الخاصة بالمنتج.','غسل لطيف وفحص طبقة الحماية وتنظيف الأماكن التي يصعب الوصول إليها.']
};
const workNotes={
 cs:{
   index:'Pracovní rozsah',matching:'Balíčky s touto službou',paint:'Ruční vedení orbitální leštičky po tmavé kapotě',local:'Fotografie i požadavky zůstávají v prohlížeči. Výsledný přehled se nikam neodesílá.',
   steps:[
     ['Prohlédnout švy, spoje a materiály.', 'Vyčistit podle povrchu a vyzkoušet postup na skrytém místě.', 'Zkontrolovat vlhkost textilu a funkci ovladačů.'],
     ['Povrch umýt a zbavit usazenin.', 'Zkušební plochu prohlédnout v inspekčním světle a zvolit kombinaci kotouče a pasty.', 'Po leštění odstranit zbytky pasty a zkontrolovat hrany.'],
     ['Ověřit stav laku a zbytky staré ochrany.', 'Povrch odmastit a nanést zvolený přípravek po jednotlivých dílech.', 'Předat pokyny k prvnímu mytí a době vytvrzení.'],
     ['Zjistit typ stávající ochrany a poslední údržbu.', 'Uvolnit nečistoty před kontaktním mytím.', 'Prohlédnout problémová místa a doporučit další péči.']
   ]
 },
 en:{
   index:'Scope of work',matching:'Packages with this service',paint:'Technician guiding an orbital polisher across a dark bonnet',local:'Photos and details stay in your browser. The summary is never sent.',
   steps:[
     ['Inspect seams, trim and upholstery.', 'Adapt cleaning to each surface and test in a concealed spot.', 'Check fabric moisture and the controls before handover.'],
     ['Wash the surface and remove embedded contamination.', 'Inspect a test section under a detailing light and choose a pad and compound.', 'Remove residue and check panel edges after polishing.'],
     ['Check the finish and any previous coating.', 'Degrease and apply the chosen product one panel at a time.', 'Explain cure time and when the first wash can take place.'],
     ['Identify the existing protection and last care date.', 'Loosen grit before a contact wash.', 'Check problem areas and recommend follow-up care.']
   ]
 },
 ar:{
   index:'نطاق العمل',matching:'باقات تشمل هذه الخدمة',paint:'فني يمرر آلة تلميع مدارية على غطاء محرك داكن',local:'تبقى الصور والتفاصيل في متصفحك. لا يرسل الملخص.',
   steps:[
     ['افحص الدرزات والزخارف والتنجيد.', 'اختر طريقة التنظيف وفق الخامة وجربها في موضع مخفي.', 'تحقق من رطوبة القماش وعمل أدوات التحكم قبل التسليم.'],
     ['اغسل السطح وأزل الملوثات العالقة.', 'افحص مساحة اختبار تحت ضوء العمل واختر وسادة التلميع والمركب.', 'أزل البقايا وافحص حواف الألواح بعد التلميع.'],
     ['افحص الطلاء وأي طبقة حماية سابقة.', 'أزل الدهون وطبق المنتج المختار على كل لوح على حدة.', 'وضح زمن التصلب وموعد الغسيل الأول.'],
     ['حدد طبقة الحماية الحالية وموعد الصيانة الأخيرة.', 'أزل الحبيبات السائبة قبل الغسل بالملامسة.', 'افحص المواضع التي تحتاج إلى عناية واقترح الخطوات التالية.']
   ]
 }
};
export const blacklineCatalogue=strings.cs.slice(13,17).map((name,i)=>[name,'Detailing',0,descriptions.cs[i]].join(' | '));
const paths=['services','packages','gallery','request-quote'];
const detailRoutes=['interior','paint','protection','maintenance'].map(id=>'services/'+id);
function activate(){
  const gallery=document.querySelector('[data-vehicle-gallery]');
  if(gallery){
    const dialog=gallery.querySelector('dialog');
    const buttons=[...gallery.querySelectorAll('[data-gallery-item]')];
    dialog.addEventListener('close',()=>opener?.focus());
    let index=0, opener;
    const show=()=>{
      const image=buttons[index].querySelector('img');
      dialog.querySelector('[data-large-image]').replaceChildren(image.cloneNode());
      dialog.querySelector('figcaption').textContent=image.alt;
    };
    gallery.addEventListener('click',event=>{
      const button=event.target.closest('[data-gallery-item]');
      if(!button)return;
      opener=button;index=buttons.indexOf(button);show();dialog.showModal();
    });
    const move=direction=>{index=(index+direction+buttons.length)%buttons.length;show();};
    dialog.querySelector('[data-prev]').onclick=()=>move(-1);
    dialog.querySelector('[data-forward]').onclick=()=>move(1);
    dialog.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
        event.preventDefault();move(event.key==='ArrowLeft'?-1:1);
      }
    });
  }
  const form=document.querySelector('[data-blackline-quote]');
  if(!form)return;
  const steps=[...form.querySelectorAll('fieldset')];
  const next=form.querySelector('[data-next]'),back=form.querySelector('[data-back]');
  const submit=form.querySelector('[data-submit]'), output=form.querySelector('output');
  const attachment=form.querySelector('[data-attachment]');
  const preview=form.querySelector('[data-attachment-preview]');
  let previewUrl='';
  attachment.onchange=()=>{
    if(previewUrl)URL.revokeObjectURL(previewUrl);
    preview.removeAttribute('src');preview.hidden=true;
    const file=attachment.files[0];
    const valid=!file||(/^image\/(jpeg|png|webp)$/.test(file.type)&&file.size<=3_000_000);
    attachment.setCustomValidity(valid?'':attachment.dataset.invalid);
    if(valid&&file){preview.src=previewUrl=URL.createObjectURL(file);preview.hidden=false;}
  };
  let step=0;
  const render=()=>{
    steps.forEach((field,index)=>field.hidden=index!==step);
    form.querySelector('progress').value=step+1;
    back.hidden=step===0;
    next.hidden=step===steps.length-1;
    submit.hidden=!next.hidden;
    if(next.hidden)output.textContent=[...new FormData(form)].filter(([,value])=>typeof value==='string'?value:value.name).map(([key,value])=>key+' · '+(value instanceof File?value.name:value)).join('\n');
    (steps[step].querySelector('input,select,textarea')||steps[step]).focus();
  };
  next.addEventListener('click',()=>{
    if([...steps[step].querySelectorAll('input,select,textarea')].every(el=>el.reportValidity())){step++;render();}
  });
  back.addEventListener('click',()=>{step--;render();});
  form.addEventListener('submit',event=>{event.preventDefault();if(step!==steps.length-1)return;form.querySelector('[role=status]').textContent=form.dataset.ready;});
}
export function blacklineSite({project,locale,page,slug,link,translations,runtime,resolve,heroArt,escape:e}){
  const t=strings[locale],notes=workNotes[locale];
  const packages=project.detailPackages?.length?project.detailPackages:defaults;
  const visible=new Set(project.pages.filter(p=>p.visible&&p.content[locale].title).map(p=>p.slug));
  const nav=(i,label=t[i])=>visible.has(paths[i])?link(paths[i],label):'';
  const navs=paths.map((_,i)=>nav(i)).join('');
  const captions={cs:['Vůz v detailingovém studiu','Leštění kapoty','Detail prošívané sedačky'],en:['Car in the detailing studio','Polishing the bonnet','Stitched seat detail'],ar:['سيارة في استوديو العناية','تلميع غطاء المحرك','تفاصيل خياطة المقعد']}[locale];
  const media=[project.hero,project.featureImage,project.galleryImage].map((src,i)=>[src,captions[i]]).filter(([src])=>src).concat(photosFor('blackline',locale).map(photo=>[resolve(photo.src),photo.alt]));
  const photo=(src,alt='')=>src?`<img src="${e(src)}" alt="${e(alt)}">`:'';
  const paintSrc='assets/img/blackline-paint.jpg';
  const paintArt=`<img src="${e(resolve(paintSrc))}" srcset="${e(resolve('assets/img/blackline-paint-720.jpg'))} 720w, ${e(resolve(paintSrc))} 1536w" sizes="(max-width: 680px) 94vw, 60vw" width="1536" height="1024" alt="${notes.paint}">`;
  const protectionSrc='assets/img/blackline-protection.jpg';
  const protectionAlt={cs:'Nanášení keramické ochrany na lak aplikačním blokem',en:'Applying ceramic protection with an applicator block',ar:'وضع طبقة حماية سيراميكية بوسادة تطبيق'}[locale];
  const protectionArt=`<img src="${e(resolve(protectionSrc))}" srcset="${e(resolve('assets/img/blackline-protection-720.jpg'))} 720w, ${e(resolve(protectionSrc))} 1536w" sizes="(max-width: 680px) 94vw, 60vw" width="1536" height="1024" alt="${protectionAlt}">`;
  const plates=photosFor('blackline',locale);
  const scopes=t.slice(13,17);
  const serviceNames=locale==='cs'&&project.catalogue?.length?scopes.map((name,i)=>project.catalogue[i]?.split('|')[0].trim()||name):scopes;
  const details=descriptions[locale];
  const names=serviceNames.map((name,index)=>visible.has(detailRoutes[index])?link(detailRoutes[index],name):e(name));
  const serviceDescription=index=>(locale==='cs'&&project.catalogue?.[index]?.split('|')[3]?.trim())||details[index];
  const inclusion={cs:['Zahrnuto','Mimo rozsah'],en:['Included','Outside scope'],ar:['مشمول','خارج النطاق']}[locale];
  const summary=serviceNames.map((name,i)=>`<tr><th scope="row">${e(name)}</th>${packages.map(pack=>`<td><span aria-hidden="true">${pack.scope[i]?'✓':'—'}</span><span class="blackline-sr">${inclusion[pack.scope[i]?0:1]}</span></td>`).join('')}</tr>`).join('');
  const table=`<section class="blackline-matrix"><h2>${t[11]}</h2><table><thead><tr><th scope="col">${t[12]}</th>${packages.map(pack=>`<th scope="col" class="${pack.highlight?'featured':''}">${e(pack.name)}</th>`).join('')}</tr></thead><tbody>${summary}</tbody></table><dl>${packages.map(pack=>`<div><dt>${e(pack.name)} ${e(pack.price)}</dt><dd>${e(pack.description[locale])}</dd></div>`).join('')}</dl>${nav(3)}</section>`;
  const process=`<section class="blackline-process"><h2>${t[6]}</h2><ol>${t.slice(7,10).map(s=>`<li>${s}</li>`).join('')}</ol></section>`;
  const body=page?.content[locale];
  const heading=(title,description='')=>`<header class="blackline-title"><h1>${e(title)}</h1>${description?`<p>${e(description)}</p>`:''}</header>`;
  const select=(label,options)=>`<label>${label}<select name="${label}">${options.map(o=>`<option>${e(o)}</option>`).join('')}</select></label>`;
  const attachmentCopy={cs:['Fotografie (volitelná, zůstane v prohlížeči)','Vyberte JPEG, PNG nebo WebP do 3 MB.'],en:['Photo (optional, stays in your browser)','Choose JPEG, PNG or WebP up to 3 MB.'],ar:['صورة اختيارية تبقى في متصفحك','اختر صورة JPEG أو PNG أو WebP حتى ٣ ميغابايت.']}[locale];
  const quoteSteps=[select(t[20],['Compact','Sedan','SUV','Van'])+select(t[21],serviceNames),select(t[22],[...packages.map(p=>p.name),{cs:"Vlastní rozsah",en:"Custom scope",ar:"نطاق مخصص"}[locale]])+`<label>${t[23]}<textarea name="${t[23]}" maxlength="500"></textarea></label><label>${attachmentCopy[0]}<input type="file" name="${attachmentCopy[0]}" accept="image/jpeg,image/png,image/webp" data-attachment data-invalid="${attachmentCopy[1]}"></label><img data-attachment-preview hidden alt="">`,`<label>${t[24]}<input type="email" name="${t[24]}" required></label>`,`<output></output>`];
  const quote=`<section class="blackline-quote-bay"><aside><h2>${t[25]}</h2><ol>${[t[20],t[22],t[24],t[25]].map(label=>`<li>${label}</li>`).join('')}</ol><p>${notes.local}</p></aside><form class="blackline-quote" data-blackline-quote data-ready="${t[26]}"><progress value="1" max="4" aria-label="${t[25]}"></progress>${quoteSteps.map((html,i)=>`<fieldset tabindex="-1" ${i?'hidden':''}><legend>${[t[20],t[22],t[24],t[25]][i]}</legend>${html}</fieldset>`).join('')}<div><button type="button" data-back hidden>${t[18]}</button><button type="button" data-next>${t[17]}</button><button data-submit hidden>${t[19]}</button></div><p role="status"></p></form></section>`;
  const dossier=`<section class="blackline-front-dossier"><div><h2>${notes.index}</h2><ol>${serviceNames.map((name,i)=>`<li><span aria-hidden="true">0${i+1}</span><div><strong>${names[i]}</strong><p>${e(serviceDescription(i))}</p></div></li>`).join('')}</ol></div><figure>${paintArt}<figcaption>${notes.paint}</figcaption></figure></section>`;
  const home=`<section class="blackline-hero">${heroArt||photo(project.hero)}<div>${heading(project.headline[locale],project.subline[locale])}${nav(3)}</div></section><nav class="blackline-service-rail" aria-label="${t[0]}">${nav(0)}${nav(1)}${nav(2)}${nav(3)}</nav>${dossier}<section class="blackline-front-inspection">${photo(project.galleryImage,project.galleryAlt||captions[2])}<div><h2>${t[6]}</h2><ol>${t.slice(7,10).map(step=>`<li>${step}</li>`).join('')}</ol><p>${t[10]}</p>${nav(2)}</div></section><section class="blackline-cta">${nav(1)}${nav(3)}</section>`;
  const services=`${heading(body?.title||t[0],t[5])}<section class="blackline-scope-index"><ol>${serviceNames.map((name,i)=>`<li><span aria-hidden="true">0${i+1}</span><div><h2>${names[i]}</h2><p>${e(serviceDescription(i))}</p></div></li>`).join('')}</ol><div class="blackline-scope-art"><figure>${paintArt}<figcaption>${notes.paint}</figcaption></figure>${project.galleryImage?`<figure>${photo(project.galleryImage,project.galleryAlt||captions[2])}<figcaption>${t[10]}</figcaption></figure>` : ''}</div></section>${process}`;
  const gallery=`${heading(body?.title||t[2],t[10])}<section class="blackline-gallery" data-vehicle-gallery>${[...media,[resolve(paintSrc),notes.paint],[resolve(protectionSrc),protectionAlt]].map(([src,caption],i)=>`<button type="button" data-gallery-item aria-label="${t[2]} ${i+1}">${photo(src,src===project.galleryImage&&project.galleryAlt?project.galleryAlt:caption)}</button>`).join('')}<dialog><form method="dialog"><button>${t[27]}</button></form><figure><div data-large-image></div><figcaption></figcaption></figure><div><button type="button" data-prev aria-label="${{cs:'Předchozí snímek',en:'Previous image',ar:'الصورة السابقة'}[locale]}">‹</button><button type="button" data-forward aria-label="${{cs:'Další snímek',en:'Next image',ar:'الصورة التالية'}[locale]}">›</button></div></dialog></section>`;
  const serviceIndex=detailRoutes.indexOf(slug);
  const serviceDetail=serviceIndex<0?'':heading(serviceNames[serviceIndex],serviceDescription(serviceIndex))+
    `<section class="blackline-job-story"><figure>${serviceIndex===1?paintArt:serviceIndex===2?protectionArt:serviceIndex===0&&project.galleryImage?photo(project.galleryImage,project.galleryAlt||captions[2]):collectionPhoto(plates[[1,0,0,2][serviceIndex]],resolve,e,{eager:true})}<figcaption>${t[10]}</figcaption></figure><section><h2>${notes.index}</h2><ol>${notes.steps[serviceIndex].map(step=>`<li>${step}</li>`).join('')}</ol></section></section>
    <section class="blackline-job-packages"><div><h2>${notes.matching}</h2><ul>${packages.filter(pack=>pack.scope[serviceIndex]).map(pack=>`<li><strong>${e(pack.name)}</strong><span>${e(pack.price||pack.description[locale])}</span></li>`).join('')}</ul></div><div>${nav(1)}${nav(3)}</div></section>`;
  const content=!page?home:serviceDetail||({services,packages:heading(body?.title||t[1])+table,gallery,'request-quote':heading(body?.title||t[3],t[10])+quote}[slug]||heading(body.title,body.body));
  return `<body class="ds blackline"><header class="blackline-head"><a class="ds-skip" href="#content">${t[28]}</a><strong>${link('',project.brand)}</strong><details><summary>${t[0]}</summary><nav>${navs}</nav></details><nav class="blackline-desktop">${navs}</nav><nav>${translations}</nav></header><main id="content">${content}</main><footer class="blackline-footer"><strong>${e(project.brand)}</strong><p>${t[10]}</p><nav>${navs}</nav></footer>${runtime}<script>(${activate.toString()})();</script></body>`;
}
