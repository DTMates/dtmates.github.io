import {signalDashboard,signalRuntime} from '../signal.js';
export {signalCatalogue} from '../signal.js';
const copy={
 cs:['Produkt','Provozní přehled','Ceník','Nastavit ukázku','Týmová aktivita na jednom místě','Porovnejte období, vyberte den pro podrobnosti a projděte jednoduché nastavení týmu.','Fiktivní data. Ukázka nevytváří účet ani další službu.','Název týmu','První oblast zájmu','Aktivita','Dokončené úkoly','Vytvořit místní přehled','Ukázka je připravena','Navigace','Práce se Signálem','Modelové plány','Start · 0 Kč','Team · 490 Kč / měsíc'],
 en:['Product','Dashboard','Pricing','Set up demo','Team activity in one place','Compare periods, select a day for details and try a simple team setup.','Fictional data. The demo creates no account or service.','Team name','Focus area','Activity','Completed work','Prepare local summary','Demo summary ready','Navigation','Using Signal','Illustrative plans','Start · CZK 0','Team · CZK 490 / month'],
 ar:['المنتج','لوحة المتابعة','الأسعار','إعداد العرض','نشاط الفريق في مكان واحد','قارن الفترات واختر يوماً للتفاصيل وجرّب إعداد الفريق.','بيانات خيالية ولا ينشئ العرض حساباً أو خدمة.','اسم الفريق','مجال التركيز','النشاط','المهام المكتملة','إعداد ملخص محلي','ملخص العرض جاهز','التنقل','استخدام سيغنال','خطط توضيحية','ستارت · ٠ كرونة','فريق · ٤٩٠ كرونة شهرياً']
};
function onboarding(){
 const form=document.querySelector('[data-signal-onboard]');
 if(form)form.onsubmit=event=>{event.preventDefault();form.querySelector('output').textContent=form.dataset.ready+' · '+[...new FormData(form).values()].join(' · ');};
}
export function signalSite({project,locale,slug,page,link,translations,runtime,heroArt,escape:e}){
 const t=copy[locale],paths=['product','demo','pricing','onboarding'];
 const available=new Set(project.pages.filter(p=>p.visible&&p.content[locale].title).map(p=>p.slug));
 const nav=(path,text)=>available.has(path)?link(path,text):'';
 const navigation=paths.map((path,i)=>nav(path,t[i])).join('');
 const title=(label,summary='')=>`<header class="sig-title"><h1>${e(label)}</h1>${summary?`<p>${e(summary)}</p>`:''}</header>`;
 const planCopy={
   cs:['Přehled pro jeden tým a ukázková historie.','Model pro více týmů a sledování dokončené práce.','Vyzkoušejte pracovní postup','Porovnat metriky','Vyberte aktivitu nebo dokončenou práci a otevřete jednotlivý den.'],
   en:['One team dashboard with demo history.','A model for multiple teams and tracking completed work.','Try the workflow','Compare metrics','Switch between activity and completed work, then drill into a single day.'],
   ar:['لوحة لفريق واحد مع سجل توضيحي.','نموذج لعدة فرق وتتبع العمل المكتمل.','جرّب سير العمل','قارن المقاييس','بدّل بين النشاط والعمل المكتمل ثم اعرض تفاصيل يوم واحد.']
 }[locale];
 const dashboard=signalDashboard(locale,project.catalogue);
 const product=`<section class="sig-product sig-feature-ledger"><div><h2>${t[14]}</h2><p>${t[5]}</p></div><div><h3>${planCopy[3]}</h3><p>${planCopy[4]}</p>${nav('demo',t[1])}</div></section>`;
 const launch=`<section class="sig-onboard sig-setup-workspace"><aside><h2>${planCopy[2]}</h2><p>${t[6]}</p>${nav('demo',t[1])}</aside><form data-signal-onboard data-ready="${t[12]}"><label>${t[7]}<input name="team" required maxlength="80"></label><label>${t[8]}<select name="focus"><option>${t[9]}</option><option>${t[10]}</option></select></label><button>${t[11]}</button><output aria-live="polite"></output></form></section>`;
 const price=`<section class="sig-price"><h2>${t[15]}</h2><div><article><h3>${t[16]}</h3><p>${planCopy[0]}</p>${nav('demo',t[1])}</article><article><h3>${t[17]}</h3><p>${planCopy[1]}</p>${nav('onboarding',t[3])}</article></div></section>`;
 const home=`<section class="sig-opening">${title(project.headline[locale],project.subline[locale])}<div class="sig-front-console"><nav aria-label="${t[1]}">${navigation}</nav>${dashboard}</div></section>${heroArt?`<section class="signal-lead-art">${heroArt}</section>`:''}${product}${price}`;
 const body=page?.content[locale];
 const inner=page?title(body.title)+({demo:`<section class="sig-dash"><aside><nav aria-label="${t[13]}">${navigation}</nav></aside>${dashboard}</section>`,product:product+dashboard,pricing:price,onboarding:launch,contact:launch}[slug]||`<section><p>${e(body.body)}</p></section>`):'';
 return `<body class="ds sig"><header class="sig-head"><strong>${link('',project.brand)}</strong><nav class="sig-nav">${navigation}</nav><details><summary>${t[13]}</summary><nav>${navigation}</nav></details><nav aria-label="Language">${translations}</nav></header><main>${page?inner:home}</main><footer class="sig-foot"><strong>${e(project.brand)}</strong><p>${t[6]}</p><nav>${navigation}</nav></footer>${runtime}${signalRuntime}<script>(${onboarding.toString()})();</script></body>`;
}
