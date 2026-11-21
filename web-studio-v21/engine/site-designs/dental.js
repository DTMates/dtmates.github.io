import {photosFor,collectionPhoto,collectionPlate} from './photo-collection.js';
const care=[
 ['first-visit',['První návštěva','First visit','الزيارة الأولى'],['Domluvíme si čas na rozhovor o vašich potřebách a dostupných podkladech.','Time to discuss your needs and existing records.','وقت لمناقشة احتياجاتك والسجلات المتوفرة.']],
 ['prevention',['Preventivní přehled','Preventive review','مراجعة وقائية'],['Zjistíte, jak je návštěva organizována a jak se plánuje případný další termín.','Learn how the visit is organised and how a follow-up would be scheduled.','تعرف على تنظيم الزيارة وكيفية تحديد موعد متابعة.']],
 ['hygiene',['Dentální hygiena','Dental hygiene','العناية بنظافة الأسنان'],['Při návštěvě můžete probrat průběh péče a položit otázky k domácí rutině.','Discuss the appointment and ask questions about your daily routine.','ناقش موعد الزيارة واطرح أسئلة حول روتينك اليومي.']]
];
const visitNotes={
 cs:[
   ['Před návštěvou','Vezměte dostupné podklady a napište si, co chcete při návštěvě probrat.'],
   ['Po návštěvě','Na závěr si potvrďte domluvený další krok a zda bude potřeba další termín.'],
   ['Otázky k domácí rutině','Připravte si otázky k pomůckám, které běžně používáte. Projdete je až při návštěvě.']
 ],
 en:[
   ['Before you arrive','Bring any existing paperwork and note what you would like to discuss.'],
   ['After the visit','Confirm the agreed next step and whether another appointment is needed.'],
   ['Questions about your daily routine','Prepare questions about the tools you normally use. Discuss them during the visit.']
 ],
 ar:[
   ['قبل الحضور','أحضر المستندات المتاحة ودوّن ما تود مناقشته خلال الزيارة.'],
   ['بعد الزيارة','تأكد من الخطوة التالية المتفق عليها ومن الحاجة إلى موعد جديد.'],
   ['أسئلة عن روتينك اليومي','جهّز أسئلتك عن الأدوات التي تستخدمها عادة لطرحها خلال الزيارة.']
 ]
};
export const dentalCatalogue=care.map(([,name,description])=>[name[0],'Péče',0,description[0]].join(' | '));
const copy={
 cs:['Péče','Tým','Poptat návštěvu','Co se děje při návštěvě','Úvodní rozhovor','Prostor na otázky','Domluva dalších kroků','Fiktivní klinika. Profil týmu je ilustrační.','Přineste dostupné podklady a seznam dotazů. Do formuláře neuvádějte údaje o zdraví.','Organizace návštěvy','Ukázka rolí: recepce pomáhá s termínem, odborný tým s průběhem návštěvy.','Časté otázky','Potvrzuje formulář termín?','Formulář vytvoří místní přehled. Termín ani dostupnost nepotvrzuje.','Typ návštěvy','Preferovaný den','E-mail','Připravit přehled','Souhrn je připraven. Nic nebylo odesláno.','Navigace','Přejít na obsah'],
 en:['Care','Team','Enquire','What to expect','Initial conversation','Time for questions','Agree next steps','Fictional clinic. Team roles are illustrative.','Bring existing records and a list of questions. Keep health information out of this form.','How a visit is organised','Illustrative roles: reception coordinates timing, the care team explains the visit.','Common questions','Does the form confirm an appointment?','The form creates a local summary. It does not confirm availability or an appointment.','Visit type','Preferred day','Email','Prepare summary','Summary ready. Nothing has been sent.','Navigation','Skip to content'],
 ar:['الرعاية','الفريق','استفسار','ما المتوقع','محادثة أولية','وقت للأسئلة','الاتفاق على الخطوات التالية','عيادة خيالية وأدوار الفريق توضيحية.','أحضر السجلات المتوفرة وقائمة الأسئلة. لا تدخل معلومات صحية في النموذج.','تنظيم الزيارة','أدوار توضيحية: الاستقبال ينسق الموعد والفريق يشرح الزيارة.','أسئلة شائعة','هل يؤكد النموذج الموعد؟','النموذج يعد ملخصاً محلياً ولا يؤكد التوفر أو الموعد.','نوع الزيارة','اليوم المفضل','البريد الإلكتروني','إعداد الملخص','الملخص جاهز ولم يتم إرساله.','التنقل','انتقل إلى المحتوى']
};
function activate(){
 const form=document.querySelector('[data-nova-inquiry]');
 if(!form)return;
 const date=form.querySelector('[type=date]');
 const output=form.querySelector('output');
 const localDay=new Date();
 date.min=[localDay.getFullYear(),localDay.getMonth()+1,localDay.getDate()].map(value=>String(value).padStart(2,'0')).join('-');
 form.addEventListener('input',()=>{output.textContent='';});
 form.onsubmit=event=>{
   event.preventDefault();
   output.textContent=form.dataset.ready+'\n'+[...new FormData(form)].map(([key,value])=>key+' · '+value).join('\n');
 };
}
export function dentalSite({project,locale,slug,page,link,translations,runtime,resolve,heroArt,escape:e}){
 const t=copy[locale],i=['cs','en','ar'].indexOf(locale);
 const available=new Set(project.pages.filter(p=>p.visible&&p.content[locale].title).map(p=>p.slug));
 const nav=(path,label)=>available.has(path)?link(path,label):'';
 const navigation=['treatments','team','contact'].map((path,n)=>nav(path,t[n])).join('');
 const rows=care.map(([id,names,descriptions],n)=>{
   const [name,,,description]=locale==='cs'?project.catalogue?.[n]?.split('|').map(v=>v.trim())||[]:[];
   return {id,name:name||names[i],description:description||descriptions[i],note:visitNotes[locale][n]};
 });
 const title=(text,desc='')=>`<header class="nova-title"><h1>${e(text)}</h1>${desc?`<p>${e(desc)}</p>`:''}</header>`;
 const photo=(src,lazy=true)=>src?`<img src="${e(src)}" alt="" ${lazy?'loading="lazy"':'fetchpriority="high"'}>`:'';
 const appointmentCopy={
   cs:['Co si připravit','Zvolte typ návštěvy a preferovaný den. Kontaktní e-mail slouží pouze k vytvoření místního přehledu.','Co když nevím, jaký termín potřebuji?','Začněte stránkou o první návštěvě. Formulář termín nepotvrzuje.'],
   en:['What to prepare','Select the visit type and preferred day. The email is used only in the local summary.','Which type of visit should I choose?','Start with the first-visit guide. This form confirms no appointment.'],
   ar:['ما الذي تحضره','اختر نوع الزيارة واليوم المفضل. يُستخدم البريد في الملخص المحلي فقط.','كيف أختار نوع الزيارة؟','ابدأ بدليل الزيارة الأولى. لا يؤكد النموذج أي موعد.']
 }[locale];
 const nextSteps={
   cs:['Než přijdete','Na recepci','Po rozhovoru','Výběr dne slouží jen jako preference.'],
   en:['Before you arrive','At reception','After the conversation','The selected day is a preference only.'],
   ar:['قبل الحضور','عند الاستقبال','بعد المحادثة','اليوم المختار مجرد تفضيل.']
 }[locale];
 const visitStages={
   cs:['Připravte si otázky a dostupné podklady.','Ujasněte si účel návštěvy a dostupný čas.','Shrňte domluvený postup a případnou další návštěvu.'],
   en:['Bring notes, questions and available records.','Confirm the reason for the visit and the time available.','Summarise what was agreed and whether a follow-up is needed.'],
   ar:['أحضر ملاحظاتك وأسئلتك والسجلات المتاحة.','أكد سبب الزيارة والوقت المتاح.','لخّص ما تم الاتفاق عليه وما إذا كانت هناك حاجة إلى زيارة أخرى.']
 }[locale];
 const list=`<section class="nova-care nova-care-directory"><h2>${t[0]}</h2><ol>${rows.map(row=>`<li><h3>${nav('treatments/'+row.id,row.name)||e(row.name)}</h3><p>${e(row.description)}</p></li>`).join('')}</ol></section>`;
 const steps=`<section class="nova-steps"><h2>${t[3]}</h2><ol>${nextSteps.slice(0,3).map((step,index)=>`<li><strong>${step}</strong><span>${visitStages[index]}</span></li>`).join('')}</ol><p>${t[8]}</p></section>`;
 const faq=`<section class="nova-faq"><h2>${t[11]}</h2><details><summary>${t[12]}</summary><p>${t[13]} ${nextSteps[3]}</p></details><details><summary>${appointmentCopy[2]}</summary><p>${appointmentCopy[3]}</p>${nav('treatments/first-visit',rows[0].name)}</details></section>`;
 const plates=photosFor('dental',locale);
 const team=`<section class="nova-team"><div><h2>${t[9]}</h2><p>${t[10]}</p><p>${t[7]}</p></div>${photo(project.featureImage||project.hero)}</section>`;
 const inquiry=`<section class="nova-book nova-appointment-desk"><aside><h2>${appointmentCopy[0]}</h2><p>${appointmentCopy[1]}</p><p>${t[7]} ${t[8]}</p></aside><form data-nova-inquiry data-ready="${t[18]}"><label>${t[14]}<select name="${t[14]}">${rows.map(row=>`<option>${e(row.name)}</option>`).join('')}</select></label><label>${t[15]}<input type="date" name="${t[15]}" required></label><label>${t[16]}<input type="email" name="${t[16]}" autocomplete="email" dir="ltr" required></label><button>${t[17]}</button><output aria-live="polite"></output></form></section>`;
 const home=`<section class="nova-hero"><div class="nova-patient-intro">${title(project.headline[locale],project.subline[locale])}<nav aria-label="${t[0]}">${nav('treatments/first-visit',rows[0].name)}${nav('contact',t[2])}</nav></div><figure>${heroArt||photo(project.hero,false)}</figure></section>${steps}${list}${team}${faq}`;
 const item=rows.find(row=>'treatments/'+row.id===slug);
 const detail=item?`${title(item.name,item.description)}<div class="nova-visit-guide">${item===rows[0]?steps:`<section class="nova-treatment-reading"><h2>${item.note[0]}</h2><p>${item.note[1]}</p><p>${t[8]}</p></section>`}<aside>${collectionPhoto(plates[rows.indexOf(item)],resolve,e)}${item===rows[0]?`<h2>${item.note[0]}</h2><p>${item.note[1]}</p>`:''}${nav('contact',t[2])}</aside></div>${faq}`:'';
 const body=page?.content[locale];
 const inner=page?title(body.title)+({treatments:list+collectionPlate(plates,resolve,e,'nova-patient-photos',t[0])+faq,team,contact:inquiry}[slug]||`<section><p>${e(body.body)}</p></section>`):'';
 return `<body class="ds nova"><header class="nova-head"><a class="ds-skip" href="#content">${t[20]}</a><strong>${link('',project.brand)}</strong><nav class="nova-nav">${navigation}</nav><details><summary>${t[19]}</summary><nav>${navigation}</nav></details><nav aria-label="${{cs:"Jazyk",en:"Language",ar:"اللغة"}[locale]}">${translations}</nav></header><main id="content">${page?detail||inner:home}</main><footer class="nova-foot"><strong>${e(project.brand)}</strong><p>${t[7]}</p><nav>${navigation}</nav></footer>${runtime}<script>(${activate.toString()})();</script></body>`;
}
