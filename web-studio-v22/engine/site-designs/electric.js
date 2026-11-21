import {photosFor,collectionPhoto,collectionPlate} from './photo-collection.js';
const localeCopy={
 cs:['Služby','Realizace','Poptat práci','Jak spolupráce probíhá','Zaměření a rozsah','Návrh a rozpočet','Kontrola a předání','Fiktivní firma. Ukázky rozsahu a realizací jsou ilustrační.','Rozsah služby','Typ práce','Místo realizace','Rozsah a poznámky','Kontaktní e-mail','Další','Zpět','Připravit souhrn','Ukázková poptávka připravena. Nic nebylo odesláno.','Navigace','Příklad rekonstrukce bytu','Kuchyň dostala samostatné okruhy pro hlavní spotřebiče. Návrh počítá s dokumentací pro budoucí servis.'],
 en:['Services','Projects','Request a quote','How we work','Survey and scope','Design and estimate','Check and handover','Fictional company. Project and scope examples are illustrative.','Service scope','Work type','Project location','Scope and notes','Contact email','Next','Back','Prepare summary','Demo request prepared. Nothing has been sent.','Navigation','Apartment renovation example','The kitchen uses separate circuits for key appliances. Documentation is part of the example scope.'],
 ar:['الخدمات','المشاريع','طلب عرض','طريقة العمل','معاينة ونطاق','تصميم وتقدير','فحص وتسليم','شركة خيالية ومشاريع توضيحية.','نطاق الخدمة','نوع العمل','موقع المشروع','النطاق والملاحظات','البريد الإلكتروني','التالي','رجوع','إعداد ملخص','الطلب التجريبي جاهز ولم يتم إرساله.','التنقل','مثال تجديد شقة','دوائر منفصلة لأجهزة المطبخ الرئيسية مع توثيق للصيانة لاحقاً.']
};
const scopes=[
 ['installation',['Elektroinstalace','Electrical installation','تركيب كهربائي'],['Rozvody, svítidla a příprava rozvaděče podle dispozice.','Wiring, lighting and distribution board preparation based on the layout.','تمديدات وإضاءة وتجهيز لوحة التوزيع حسب المخطط.']],
 ['inspection',['Kontrola stavu','Condition assessment','تقييم الحالة'],['Přehled stavu rozvodů a návrh, co je nutné ověřit před rekonstrukcí.','A condition survey and a list of items to verify before renovation.','مسح للحالة وقائمة بما يجب التحقق منه قبل التجديد.']],
 ['automation',['Řízení a automatizace','Controls and automation','التحكم والأتمتة'],['Návrh zón, ovládání osvětlení a dokumentace pro uživatele.','Control zones, lighting and user documentation.','مناطق تحكم وإضاءة وتوثيق للمستخدم.']]
];
const scopeDetails={
 cs:[
   ['Půdorys a rozmístění zařízení','Přehled dotčených místností','Rozsah dodávky a předání'],
   ['Dostupné podklady k rozvodům','Stav před plánovanou rekonstrukcí','Záznam zjištění pro rozhodnutí o dalším postupu'],
   ['Místnosti a potřebné funkce','Scénáře ovládání pro uživatele','Dokumentace a předání nastavení']
 ],
 en:[
   ['Floor plan and equipment layout','List of affected rooms','Scope and handover'],
   ['Existing wiring documents','Condition before the planned renovation','Findings to inform the next decision'],
   ['Rooms and required functions','Control scenarios for users','Documentation and settings handover']
 ],
 ar:[
   ['مخطط الطابق وتوزيع الأجهزة','قائمة الغرف المعنية','نطاق التسليم والمستندات'],
   ['المستندات المتوفرة للتمديدات','الحالة قبل التجديد المخطط','ملخص النتائج لتحديد الخطوة التالية'],
   ['الغرف والوظائف المطلوبة','سيناريوهات التحكم للمستخدمين','الوثائق وتسليم الإعدادات']
 ]
};
export const electricCatalogue=scopes.map(([,name,description])=>[name[0],'Elektro',0,description[0]].join(' | '));
function activate(){
 const form=document.querySelector('[data-volt-quote]');
 if(!form)return;
 const steps=[...form.querySelectorAll('fieldset')],next=form.querySelector('[data-next]'),back=form.querySelector('[data-back]'),submit=form.querySelector('[data-send]');
 const summary=()=>[...new FormData(form)].filter(([,v])=>v).map(([key,value])=>key+' · '+value).join('\n');
 let current=0;
 function show(){
   steps.forEach((step,index)=>step.hidden=index!==current);
   next.hidden=current===steps.length-1;back.hidden=current===0;submit.hidden=!next.hidden;
   form.querySelector('progress').value=current+1;
   if(next.hidden)form.querySelector('output').textContent=summary();
   (steps[current].querySelector('input,select,textarea')||steps[current]).focus();
 }
 next.onclick=()=>{if([...steps[current].querySelectorAll('input,select,textarea')].every(el=>el.reportValidity())){current++;show();}};
 back.onclick=()=>{current--;show();};
 form.onsubmit=event=>{event.preventDefault();if(current===steps.length-1)form.querySelector('[role=status]').textContent=form.dataset.ready;};
}
export function electricSite({project,locale,slug,page,link,translations,runtime,resolve,heroArt,escape:e}){
 const outputs={
   cs:['Předávací podklady','Přehled umístění a dokumentace dohodnutého rozsahu.','Záznam zjištění a přehled úseků k ověření.','Seznam dohodnutých scénářů a pokyny pro obsluhu.','Pracovní příklad'],
   en:['Handover materials','Location overview and documentation for the agreed scope.','Record of findings and a list of areas to confirm.','List of agreed control scenarios and a user guide.','Project example'],
   ar:['مستندات التسليم','نظرة عامة على المواقع وتوثيق النطاق المتفق عليه.','سجل للنتائج وقائمة بالمناطق التي تحتاج إلى التحقق.','قائمة بسيناريوهات التحكم المتفق عليها ودليل الاستخدام.','مثال على مشروع']
 }[locale];
 const t=localeCopy[locale], i=['cs','en','ar'].indexOf(locale), available=new Set(project.pages.filter(p=>p.visible&&p.content[locale].title).map(p=>p.slug));
 const nav=(path,label)=>available.has(path)?link(path,label):'';
 const navigation=['services','projects','request-quote'].map((path,n)=>nav(path,t[n])).join('');
 const rows=scopes.map(([id,names,descriptions],n)=>{
   const [name,,,description]=locale==='cs'?project.catalogue?.[n]?.split('|').map(v=>v.trim())||[]:[];
   return {id,name:name||names[i],description:description||descriptions[i],scope:scopeDetails[locale][n]};
 });
 const title=(text,desc='')=>`<header class="volt-title"><h1>${e(text)}</h1>${desc?`<p>${e(desc)}</p>`:''}</header>`;
 const photo=project.hero?`<img src="${e(project.hero)}" alt="" fetchpriority="high">`:'';
 const process=`<section class="volt-process"><h2>${t[3]}</h2><ol>${t.slice(4,7).map(label=>`<li>${label}</li>`).join('')}</ol></section>`;
 const list=`<section class="volt-list volt-scope-record">${rows.map((row,n)=>`<article><span>0${n+1}</span><div><h2>${nav('services/'+row.id,row.name)||e(row.name)}</h2><p>${e(row.description)}</p></div></article>`).join('')}</section>`;
 const mapCopy={
   cs:['Rozsah ukázkového projektu','Stávající stav','Nové okruhy','Ovládání','Ověření'],
   en:['Illustrative project scope','Existing condition','New circuits','Controls','Verification'],
   ar:['نطاق المشروع التوضيحي','الحالة القائمة','دوائر جديدة','التحكم','التحقق']
 }[locale];
 const diagram=`<figure class="volt-scope-map"><figcaption>${mapCopy[0]}</figcaption><ol>${mapCopy.slice(1).map(label=>`<li>${label}</li>`).join('')}</ol></figure>`;
 const plates=photosFor('electric',locale);
 const projectBlock=`<section class="volt-case">${diagram}<div><h2>${t[18]}</h2><p>${t[19]}</p>${slug==='projects/apartment'?nav('services/installation',rows[0].name):nav('projects/apartment',outputs[4])}</div></section>`;
 const quoteSteps=[
   `<label>${t[9]}<select name="${t[9]}">${rows.map(row=>`<option>${e(row.name)}</option>`).join('')}</select></label><label>${t[10]}<input name="${t[10]}" required maxlength="120"></label>`,
   `<label>${t[11]}<textarea name="${t[11]}" maxlength="500" required></textarea></label><label>${t[12]}<input name="${t[12]}" type="email" autocomplete="email" dir="ltr" required></label>`,
   '<output aria-live="polite"></output>'
 ];
 const quote=`<section class="volt-quote volt-work-order"><aside><h2>${t[8]}</h2><p>${t[7]}</p><ul>${t.slice(9,13).map(label=>`<li>${label}</li>`).join('')}</ul></aside><form data-volt-quote data-ready="${t[16]}"><progress max="3" value="1" aria-label="${t[15]}"></progress>${quoteSteps.map((html,n)=>`<fieldset tabindex="-1" ${n?'hidden':''}><legend>${n+1} / 3</legend>${html}</fieldset>`).join('')}<button type="button" data-back hidden>${t[14]}</button> <button type="button" data-next>${t[13]}</button><button type="submit" data-send hidden>${t[15]}</button><p role="status"></p></form></section>`;
 const home=`<section class="volt-lead"><div class="volt-job-sheet">${title(project.headline[locale],project.subline[locale])}${nav('request-quote',t[2])}</div><figure>${heroArt||photo}</figure><nav class="volt-front-index" aria-label="${t[0]}">${rows.map(row=>nav('services/'+row.id,row.name)).join('')}</nav></section>${list}${process}${projectBlock}`;
 const service=rows.find(row=>'services/'+row.id===slug);
 const serviceIndex=rows.indexOf(service);
 const detail=service?`${title(service.name,service.description)}<section class="volt-technical volt-spec-sheet"><figure>${collectionPhoto(plates[serviceIndex],resolve,e,{eager:true})}<figcaption>${e(plates[serviceIndex].alt)}</figcaption></figure><div><h2>${t[8]}</h2><ol>${service.scope.map(task=>`<li>${task}</li>`).join('')}</ol><aside class="volt-scope-output"><h3>${outputs[0]}</h3><p>${outputs[serviceIndex+1]}</p></aside>${nav('request-quote',t[2])}</div></section>${process}`:'';
 const body=page?.content[locale];
 const inner=page?title(body.title)+({services:list+process,projects:projectBlock,'projects/apartment':projectBlock+collectionPlate(plates,resolve,e,'volt-project-photos',t[1])+process,'request-quote':quote,quote}[slug]||`<section><p>${e(project.address)}</p>${nav('request-quote',t[2])}</section>`):'';
 return `<body class="ds volt"><header class="volt-head"><a class="ds-skip" href="#content">${{cs:"Přejít na obsah",en:"Skip to content",ar:"انتقل إلى المحتوى"}[locale]}</a><strong>${link('',project.brand)}</strong><nav class="volt-nav">${navigation}</nav><details><summary>${t[17]}</summary><nav>${navigation}</nav></details><nav aria-label="${{cs:"Jazyk",en:"Language",ar:"اللغة"}[locale]}">${translations}</nav></header><main id="content">${page?detail||inner:home}</main><footer class="volt-foot"><strong>${e(project.brand)}</strong><p>${t[7]}</p><nav>${navigation}</nav></footer>${runtime}<script>(${activate.toString()})();</script></body>`;
}
