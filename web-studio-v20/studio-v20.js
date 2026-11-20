/* DTMates V20 — local, accessible functional prototypes. No analytics, storage, payments or external APIs. */
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clean=x=>String(x||'').replace(/[<>&"'\\]/g,'').trim().slice(0,90);
function saveTxt(filename,text){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();requestAnimationFrame(()=>URL.revokeObjectURL(url))}
function initNavigation(){
 const toggle=q('.menu-toggle'),mobile=q('.mobile-nav');
 if(toggle&&mobile){
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));mobile.hidden=!open;toggle.setAttribute('aria-label',open?'Zavřít navigaci':'Otevřít navigaci')});
  mobile.addEventListener('click',e=>{if(e.target.closest('a')){mobile.hidden=true;toggle.setAttribute('aria-expanded','false')}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobile.hidden){mobile.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus()}});
 }
 const bar=q('[data-scroll-progress]');
 let ticking=false;
 function update(){if(ticking)return;ticking=true;requestAnimationFrame(()=>{if(bar){const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);bar.style.transform='scaleX('+Math.min(1,scrollY/max)+')'}ticking=false})}
 window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update,{passive:true});update();
}
function initReveal(){
 const targets=qa('.reveal');if(reduced||!('IntersectionObserver' in window)){targets.forEach(el=>el.classList.add('is-visible'));return}
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}},{threshold:.07,rootMargin:'0px 0px -7% 0px'});
 for(const el of targets){if(el.getBoundingClientRect().top<innerHeight*.92)el.classList.add('is-visible');else observer.observe(el)}
 document.documentElement.classList.add('motion-ready');
}
function initHero(){
 const root=q('[data-hero-stage]');if(!root)return;
 const cards=qa('[data-stage]',root),buttons=qa('[data-stage-select]',root),progress=q('.stage-progress i',root);
 let active=0,last=performance.now(),frozen=false;
 const dwell=6500;
 function select(i){
  active=(i+cards.length)%cards.length;
  cards.forEach((card,j)=>{card.classList.toggle('is-active',j===active);card.setAttribute('aria-hidden',String(j!==active))});
  buttons.forEach((button,j)=>{button.setAttribute('aria-selected',String(j===active));button.tabIndex=j===active?0:-1});
  last=performance.now();
  if(progress)progress.style.transform='scaleX(0)';
 }
 buttons.forEach((button,i)=>{
  button.addEventListener('click',()=>{select(i);frozen=true});
  button.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();const j=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
   select(j);frozen=true;buttons[j].focus();
  });
 });
 root.addEventListener('mouseenter',()=>{if(!frozen)frozen='hover'});
 root.addEventListener('mouseleave',()=>{if(frozen==='hover'){frozen=false;last=performance.now()}});
 document.addEventListener('visibilitychange',()=>{last=performance.now()});
 select(0);
 if(!reduced)setInterval(()=>{if(frozen||document.hidden)return;const fraction=Math.min(1,(performance.now()-last)/dwell);if(progress)progress.style.transform='scaleX('+fraction+')';if(fraction>=1)select(active+1)},100);
}
function initMiniLab(){
 const preview=q('[data-lab-preview]');if(!preview)return;
 const input=q('#lab-headline'),output=q('[data-lab-output]'),description=q('[data-lab-description]'),kicker=q('.lab-preview-kicker',preview);
 const tabs=qa('[data-lab-kind]'),colors=qa('[data-lab-color]'),devices=qa('[data-lab-device]');
 const worlds={
  fashion:['Made for your moment.','Vizuální e-shop s vlastní identitou.','EDITORIAL COMMERCE / DEMO'],
  corporate:['Ideas made possible.','Firemní web, obsah a jazyky podle vašich potřeb.','CORPORATE EDITORIAL / DEMO'],
  app:['Move forward daily.','Produkt s profilem, pokrokem a smysluplným UX.','MOBILE PRODUCT / DEMO']
 };
 const set=(items,active,key,attribute)=>items.forEach((b,i)=>{const on=b.dataset[key]===active;b.setAttribute(attribute,String(on));if(attribute==='aria-selected')b.tabIndex=on?0:-1;b.classList.toggle('is-active',on)});
 function setWorld(world){const data=worlds[world];preview.dataset.kind=world;set(tabs,world,'labKind','aria-selected');input.value=data[0];output.textContent=data[0];description.textContent=data[1];kicker.textContent=data[2]}
 tabs.forEach((b,i)=>{b.addEventListener('click',()=>setWorld(b.dataset.labKind));b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus()})});
 colors.forEach(b=>b.addEventListener('click',()=>{preview.dataset.color=b.dataset.labColor;set(colors,b.dataset.labColor,'labColor','aria-pressed')}));
 devices.forEach(b=>b.addEventListener('click',()=>{preview.dataset.device=b.dataset.labDevice;set(devices,b.dataset.labDevice,'labDevice','aria-pressed')}));
 input.addEventListener('input',()=>output.textContent=clean(input.value)||'Your next digital story.');
 setWorld('fashion');
}
function initProofs(){
 for(const root of qa('[data-v20-gallery]')){
  const tabs=qa('[data-proof-image]',root),img=q('[data-proof-display]',root),original=q('[data-proof-open]',root),caption=q('[data-proof-caption]',root),figure=q('.proof-figure',root);
  if(!tabs.length||!img)return;
  function choose(i){const button=tabs[i];if(!button)return;
   tabs.forEach((b,j)=>{b.setAttribute('aria-pressed',String(j===i));b.tabIndex=j===i?0:-1});
   img.src=button.dataset.proofImage;
   img.alt=button.dataset.proofAlt||'Originální snímek našeho lokálního projektu';
   if(original)original.href=button.dataset.proofImage;
   if(caption)caption.textContent=button.dataset.proofCaption||'Skutečný snímek';
   if(figure)figure.dataset.mobile=button.dataset.proofDevice==='mobile'?'true':'false';
  }
  tabs.forEach((b,i)=>{b.addEventListener('click',()=>choose(i));b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();let j=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;choose(j);tabs[j].focus()})});
  choose(0);
 }
}
function initShop(){
 const root=q('[data-shop-demo]');if(!root)return;
 const filters=qa('[data-shop-filter]',root),products=qa('[data-shop-product]',root),cart=q('[data-shop-cart]',root),note=q('[data-shop-message]',root);
 let added=0;
 filters.forEach(button=>button.addEventListener('click',()=>{
  const filter=button.dataset.shopFilter;
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  products.forEach(product=>product.hidden=filter!=='all'&&product.dataset.shopProduct!==filter);
  if(note)note.textContent='Zobrazená kategorie: '+button.textContent.trim()
 }));
 qa('[data-shop-add]',root).forEach(button=>button.addEventListener('click',()=>{added++;if(cart)cart.textContent='Ukázkový košík: '+added+' položek';if(note)note.textContent='Přidáno pouze do místní ukázky. Žádná skutečná objednávka.'}));
 q('[data-shop-reset]',root)?.addEventListener('click',()=>{added=0;if(cart)cart.textContent='Ukázkový košík: 0 položek';if(note)note.textContent='Ukázkový košík byl vymazán.'});
}
function initLanguages(){
 const root=q('[data-language-panel]');if(!root)return;
 const buttons=qa('[data-study-language]',root),out=q('[data-study-output]',root);
 const labels={cs:['Technologie s jasným směrem.','Ukázkový titulek naší lokální studie.',false],en:['Technology with direction.','An illustrative heading in English, not an official translation.',false],ar:['التكنولوجيا برؤية واضحة','مثال توضيحي للعنوان في العربية واتجاه القراءة',true]};
 buttons.forEach(b=>b.addEventListener('click',()=>{
  const lang=b.dataset.studyLanguage,data=labels[lang];if(!data)return;
  buttons.forEach(other=>other.setAttribute('aria-pressed',String(other===b)));
  out.lang=lang;out.dir=data[2]?'rtl':'ltr';
  q('strong',out).textContent=data[0];q('p',out).textContent=data[1];
 }));
}
function initTraining(){
 const root=q('[data-training-demo]');if(!root)return;
 const lessons=[
  ['Klidný začátek.','Připravte prostředí bez rušivých podnětů.'],
  ['Jedno jasné zadání.','Zvolte jednoduchý signál, který pes rozpozná.'],
  ['Ocenění správné reakce.','Pozitivní odměnu podejte v pravý moment.'],
  ['Krátké opakování.','Procvičujte v krátkých, pravidelných blocích.'],
  ['Zhodnocení a pokračování.','Dokončete ukázkovou lekci a naplánujte další krok.']
 ];
 let index=0;const name=q('[data-training-title]',root),description=q('[data-training-description]',root),fill=q('[data-training-track]',root),counter=q('[data-training-count]',root),prev=q('[data-training-prev]',root),next=q('[data-training-next]',root);
 function render(){name.textContent=lessons[index][0];description.textContent=lessons[index][1];fill.style.width=((index+1)*20)+'%';counter.textContent=String(index+1).padStart(2,'0')+' / 05';prev.disabled=index===0;next.disabled=index===4;next.textContent=index===4?'Dokončeno ✓':'Další krok →';root.dataset.step=String(index+1)}
 prev?.addEventListener('click',()=>{index=Math.max(0,index-1);render()});
 next?.addEventListener('click',()=>{index=Math.min(4,index+1);render()});
 q('[data-training-reset]',root)?.addEventListener('click',()=>{index=0;render()});
 render();
}
function initEditor(){
 const root=q('[data-editor-controls]'),stage=q('[data-editor-paper]');if(!root||!stage)return;
 const kind=q('[data-editor-kind]',root),palette=q('[data-editor-palette]',root),device=q('[data-editor-device]',root),brand=q('[name="brand-name"]',root),headline=q('[name="hero-title"]',root),desc=q('[data-editor-description]',root),status=q('[data-editor-status]',root);
 const defaults={timo:['Your fashion label','Wear your own story.','Váš katalog. Váš styl. Vlastní produkty.'],agile:['Your company','Ideas become reality.','Web pro služby, odborný obsah a kontakty.'],paw:['Your product','Progress every day.','Produkt s profilem, postupem a výrazným UX.']};
 function render(){
  stage.dataset.editorKind=kind.value;stage.dataset.editorPalette=palette.value;stage.dataset.editorDevice=device.value;
  q('[data-editor-brand]',stage).textContent=clean(brand.value)||defaults[kind.value][0];
  q('[data-editor-title]',stage).textContent=clean(headline.value)||defaults[kind.value][1];
  q('[data-editor-sub]',stage).textContent=clean(desc.value)||defaults[kind.value][2];
  q('[data-editor-category]',stage).textContent=kind.value==='timo'?'EDITORIAL COMMERCE':kind.value==='agile'?'CORPORATE DESIGN':'MOBILE PRODUCT';
  if(status)status.textContent='Všechny úpravy jsou lokální. Nic se neodeslalo ani nezveřejnilo.'
 }
 kind.addEventListener('change',()=>{const d=defaults[kind.value];brand.value=d[0];headline.value=d[1];desc.value=d[2];render()});
 qa('input,textarea,select',root).forEach(control=>control.addEventListener('input',render));
 q('[data-editor-reset]',root)?.addEventListener('click',()=>{const d=defaults[kind.value];brand.value=d[0];headline.value=d[1];desc.value=d[2];palette.value='rose';device.value='desktop';render()});
 q('[data-editor-download]',root)?.addEventListener('click',()=>{
  const lines=['DTMates Web Studio — lokální V20 zadání','Tento výstup je pouze koncept. Nebyla provedena publikace ani objednávka.','',
   'Obor: '+kind.value,'Značka: '+brand.value,'Titulek: '+headline.value,'Popis: '+desc.value,'Barva: '+palette.value,'Zařízení: '+device.value,
   '','Doplnit před realizací: technický rozsah, licence, vlastnictví, hosting, data, poplatky, podporu a odpovědnost.'];
  saveTxt('dtmates-nahled-zadani.txt',lines.join('\n'));
 });
 render();
}
function initBrief(){
 const form=q('[data-brief-form]'),status=q('[data-brief-status]');if(!form)return;
 form.addEventListener('submit',e=>{
  e.preventDefault();if(!form.reportValidity())return;
  const lines=['DTMates — nezávazné projektové zadání','Tento soubor vznikl v prohlížeči. Nic nebylo odesláno.',''];
  for(const [key,value] of new FormData(form).entries())lines.push(key+': '+String(value||'').trim());
  lines.push('','K potvrzení: design, rozsah, předání práv a přístupů, doména, hosting, databáze, licence, podpora a cena.');
  saveTxt('dtmates-projektove-zadani.txt',lines.join('\n'));
  if(status)status.textContent='Zadání bylo vytvořeno pouze lokálně a připraveno ke stažení; neodeslali jsme ho.'
 });
}
function init(){initNavigation();initReveal();initHero();initMiniLab();initProofs();initShop();initLanguages();initTraining();initEditor();initBrief()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
