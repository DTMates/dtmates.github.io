import {demos,plans,formatCZK} from './data.js';
import {estimate} from './estimate.js';
import {quoteOptions} from './quote.js';

const $=id=>document.getElementById(id);
const filter=$('filter-work');
if(filter)filter.onchange=()=>{
 for(const card of document.querySelectorAll('[data-sector]'))card.hidden=filter.value!=='all'&&card.dataset.sector!==filter.value;
};
for(const button of document.querySelectorAll('[data-work-width]')){
 button.onclick=()=>{
   const mobile=button.dataset.workWidth==='mobile';
   document.querySelector('.production-work').classList.toggle('mobile-previews',mobile);
   for(const toggle of document.querySelectorAll('[data-work-width]'))toggle.setAttribute('aria-pressed',String(toggle===button));
   for(const card of document.querySelectorAll('[data-sector]')){
     const image=card.querySelector('.production-thumb img');
     image.src='../assets/showcase/art-'+(mobile?'mobile-':'')+card.dataset.sector+'.jpg';
     image.width=mobile?390:1440;image.height=900;
   }
 };
}
const priceMode=document.querySelector('.price-model');
if(priceMode){
 const synchronizePrice=()=>{
   const mode=priceMode.querySelector('[name=price-mode]:checked').value;
   for(const price of document.querySelectorAll('[data-cost-model]'))price.hidden=price.dataset.costModel!==mode;
   for(const link of document.querySelectorAll('[data-price-choose]'))link.href='../create/?plan='+link.dataset.plan+'&mode='+mode;
 };
 priceMode.addEventListener('change',synchronizePrice);
 window.addEventListener('pageshow',synchronizePrice);
 synchronizePrice();
}
const form=$('production-brief');
if(form){
 const historyKey='dtmates-local-brief-v1';
 const fields=[...form.querySelectorAll('fieldset')];
 const progress=[...$('brief-progress').children];
 const status=$('brief-status');
 const params=new URLSearchParams(location.search);
 let step=0, proposal=null;
 function persist(){
   const entries=[...new FormData(form)].filter(([name])=>name!=='consent');
   try{sessionStorage.setItem(historyKey,JSON.stringify({entries,step,version:2}));}catch{}
 }
 function restore(){
   try{
     const draft=JSON.parse(sessionStorage.getItem(historyKey)||'null');
     if(draft){
       const values=new URLSearchParams(draft.entries);
       for(const el of form.elements){
         if(!el.name||el.name==='consent')continue;
         if(el.type==='checkbox')el.checked=values.getAll(el.name).includes(el.value);
         else if(values.has(el.name))el.value=values.get(el.name);
       }
       step=Math.max(0,Math.min(fields.length-1,Number(draft.version===2?draft.step:[0,2,4,6][draft.step])||0));
     }
   }catch{}
   if(Object.hasOwn(demos,params.get('design'))&&form.elements.design.value!==params.get('design')){
     form.elements.design.value=params.get('design');
     form.elements.industry.value=params.get('design');
     step=0;
   }
   if(plans.some(plan=>plan.id===params.get('plan')))form.elements.tier.value=params.get('plan');
   if(['once','monthly'].includes(params.get('mode')))form.elements.mode.value=params.get('mode');
   if(params.get('shop')==='1')form.elements.shop.checked=true;
   if(['design','plan','mode','shop'].some(key=>params.has(key))){
     const url=new URL(location.href);
     for(const key of ['design','plan','mode','shop'])url.searchParams.delete(key);
     history.replaceState(null,'',url);
   }
 }
 function drawStep(focus=false){
   fields.forEach((fieldset,index)=>{fieldset.hidden=index!==step;});
   progress.forEach((item,index)=>{item.toggleAttribute('data-complete',index<step);if(index===step)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
   $('brief-back').hidden=step===0;
   $('brief-next').hidden=step===fields.length-1;
   if(focus){const legend=fields[step].querySelector('legend');legend.tabIndex=-1;legend.focus();}
 }
 function values(){
   const entries=new FormData(form);
   const languages=entries.getAll('languages');
   const options=Object.fromEntries(Object.keys(quoteOptions).map(key=>[key,entries.has(key)]));
   return {entries,languages,quote:{...options,tier:entries.get('tier'),mode:entries.get('mode'),pages:Number(entries.get('pages')),languages:languages.length,months:Number(entries.get('months')),productCount:Number(entries.get('productCount')),shopOperations:String(entries.get('shopOperations')||'unsure')}};
 }
 const groups=[['cafe','hotel','bloom','wellness'],['blackline','electric','dental'],['realty','timo','signal']];
 const designChoices=$('brief-design-options');
 function designCards(){
   const industry=form.elements.industry.value, selected=form.elements.design.value;
   if(designChoices.dataset.industry!==industry){
     designChoices.dataset.industry=industry;
     const related=groups.find(group=>group.includes(industry))||['cafe','realty','timo','signal'];
     designChoices.replaceChildren(...[...new Set([industry,...related,'custom'])].map(id=>{
       const card=document.createElement('button'), title=document.createElement('strong');
       card.type='button';card.dataset.design=id;
       title.textContent=demos[id]?.name||'Vlastní směr';
       if(demos[id]){
         const image=document.createElement('img');
         image.src='../assets/showcase/art-'+id+'.jpg';image.alt='';image.loading='lazy';image.width=1440;image.height=900;
         card.append(image);
       }
       card.append(title);
       card.onclick=()=>{
         form.elements.design.value=id;
         form.elements.design.dispatchEvent(new Event('input',{bubbles:true}));
       };
       return card;
     }));
   }
   for(const card of designChoices.children)card.setAttribute('aria-pressed',String(card.dataset.design===selected));
 }
 function summary(){
   const {quote}=values(), result=estimate(quote);
   const plan=plans.find(plan=>plan.id===quote.tier)||plans[0];
   const shopScope=$('shop-scope');
   if(shopScope)shopScope.hidden=!quote.shop;
   $('brief-care').hidden=quote.mode!=='once';
   $('brief-cost').replaceChildren(...[
     ['Při zahájení',formatCZK(result.initial)],['Pravidelně měsíčně',formatCZK(result.monthly)],
     [result.months+' měsíců',formatCZK(result.total)]
   ].map(([label,amount])=>{
     const row=document.createElement('p'), strong=document.createElement('strong');
     strong.textContent=amount;row.append(label+' ',strong);return row;
   }));
   if(result.negotiated){
     const note=document.createElement('p');
     note.textContent=quote.shop?'E-shop: orientační základ webu, nikoli konečná cena. Katalog '+Math.max(1,quote.productCount||1)+' produktů, provoz, databázi, platby a integrace naceníme zvlášť.':'Individuální rozsah nebo integrace vyžaduje samostatné nacenění.';
     $('brief-cost').append(note);
   }
   $('brief-inclusions').textContent=[plan.one,...plan.features,...result.extras.map(r=>r.label+' · '+r.count+' × '+formatCZK(r.unit))].join(' · ');
   for(const button of form.querySelectorAll('[data-tier],[data-industry]')){
     button.setAttribute('aria-pressed',String(button.dataset.tier===quote.tier||button.dataset.industry===form.elements.industry.value));
   }
   designCards();
   const types=[...new Set(form.elements.pageTypes.value.split(',').map(value=>value.trim()).filter(Boolean))];
   const map=$('brief-map');
   map.replaceChildren(...types.map((type,index)=>{
     const row=document.createElement('div'),label=document.createElement('strong');
     label.textContent=(index+1)+'. '+type;row.append(label);
     for(const [delta,action,icon] of [[-1,'Posunout výš','↑'],[1,'Posunout níž','↓'],[0,'Odebrat','×']]){
       const button=document.createElement('button');button.type='button';button.textContent=icon;button.setAttribute('aria-label',action+' '+type);
       const target=index+delta;
       button.disabled=target<0||target>=types.length;
       button.onclick=()=>{
         if(delta)[types[index],types[target]]=[types[target],types[index]];
         else types.splice(index,1);
         form.elements.pageTypes.value=types.join(', ');
         form.elements.pageTypes.dispatchEvent(new Event('input',{bubbles:true}));
         const children=[...map.children];
         const next=children[Math.min(target,children.length-1)];
         (next?.querySelector('button:not(:disabled)')||form.elements.pageTypes).focus();
       };
       row.append(button);
     }
     return row;
   }));
   map.hidden=!types.length;
   for(const button of form.querySelectorAll('[data-page-suggestion]'))button.setAttribute('aria-pressed',String(types.includes(button.dataset.pageSuggestion)));
   const reference=$('brief-reference');
   const demo=demos[form.elements.design.value];
   const referenceId=demo?.id||'custom';
   if(reference.dataset.ref!==referenceId){
     reference.dataset.ref=referenceId;
     reference.replaceChildren();
     if(demo){
       const image=document.createElement('img');
       image.src='../assets/showcase/art-'+demo.id+'.jpg';image.alt='Domovská stránka '+demo.name;
       image.width=1440;image.height=900;
       const link=document.createElement('a');
       link.href='../sites/'+demo.id+'/';link.target='_blank';link.rel='noopener noreferrer';link.textContent='Prohlédnout '+demo.name+' (nová karta) ↗';
       reference.append(image,link);
       const reviewImage=image.cloneNode();reviewImage.loading='lazy';
       $('brief-review-cover').replaceChildren(reviewImage);
     }else{
       reference.textContent='Individuální návrh začíná vaším obsahem a potřebami.';
       $('brief-review-cover').replaceChildren();
     }
   }
   const {entries,languages}=values();
   $('brief-review').replaceChildren(...[
     ['Firma',entries.get('business')],['Výchozí návrh',demos[entries.get('design')]?.name||'Individuální návrh'],
     ['Stránky',quote.pages+' · '+(entries.get('pageTypes')||'V zadání upřesníme')],
     ['Jazyky',languages.join(', ').toUpperCase()],
     ['Značka',[entries.get('colorMood'),entries.get('typeMood')].filter(Boolean).join(' · ')||'Doporučí studio'],
     ['Funkce',Object.keys(quoteOptions).filter(key=>quote[key]&&(key!=='care'||quote.mode==='once')).map(key=>quoteOptions[key]).join(' · ')||'Základ balíčku'],
     ['Balíček',plan.name+' · '+(quote.mode==='once'?'jednorázově':'měsíčně')],
     ['Odhad',formatCZK(result.initial)+' na začátku · '+formatCZK(result.monthly)+' měsíčně']
   ].flatMap(([label,text])=>{
     const term=document.createElement('dt'),data=document.createElement('dd');
     term.textContent=label;data.textContent=text;return [term,data];
   }));
 }
 for(const button of form.querySelectorAll('[data-industry],[data-tier],[data-page-suggestion],[data-edit-stage]')){
   button.onclick=()=>{
     if(button.hasAttribute('data-edit-stage')){
       step=Number(button.dataset.editStage);drawStep(true);persist();return;
     }
     if(button.dataset.industry){
       form.elements.industry.value=button.dataset.industry;
       form.elements.design.value=button.dataset.industry;
     }
     if(button.dataset.tier)form.elements.tier.value=button.dataset.tier;
     if(button.dataset.pageSuggestion){
       const page=button.dataset.pageSuggestion;
       const names=form.elements.pageTypes.value.split(',').map(value=>value.trim()).filter(Boolean);
       form.elements.pageTypes.value=(names.includes(page)?names.filter(name=>name!==page):[...names,page]).join(', ').slice(0,400);
     }
     summary();persist();
   };
 }
 function valid(index){
   if(index===3&&!form.querySelector('[name=languages]:checked')){
     status.textContent='Vyberte alespoň jeden jazyk.';
     form.querySelector('[name=languages]').focus();return false;
   }
   const invalid=[...fields[index].querySelectorAll('input,select,textarea')].find(control=>!control.validity.valid);
   if(!invalid)return true;
   invalid.setAttribute('aria-invalid','true');
   status.textContent='Zkontrolujte pole '+(invalid.labels?.[0]?.textContent.trim()||'v tomto kroku')+'.';
   invalid.reportValidity();
   return false;
 }
 form.addEventListener('input',event=>{
   if(event.target===form.elements.industry)form.elements.design.value=event.target.value;
   event.target.removeAttribute('aria-invalid');
   status.textContent='';
   $('proposal').hidden=true;
   summary();persist();
 });
 $('brief-next').onclick=()=>{if(valid(step)){step++;drawStep(true);persist();}};
 $('brief-back').onclick=()=>{step--;drawStep(true);persist();};
 form.onsubmit=event=>{
   event.preventDefault();
   if(step!==fields.length-1)return;
   for(let i=0;i<fields.length;i++){
     const invalid=[...fields[i].querySelectorAll('input,select,textarea')].some(el=>!el.validity.valid);
     if(invalid||i===3&&!form.querySelector('[name=languages]:checked')){
       step=i;drawStep();valid(i);return;
     }
   }
   const {entries,languages,quote}=values();
   const plan=plans.find(plan=>plan.id===quote.tier);
   const assumptions=['Odhad je nezávazný.', 'Daně, doména, hosting a externí licence se potvrdí v nabídce.',
     'Vlastnictví, ukončení, revize a předání podkladů se sjednají před zahájením.'];
   proposal={schemaVersion:1,business:entries.get('business'),contact:{name:entries.get('contact'),email:entries.get('email')},
     industry:entries.get('industry'),design:entries.get('design'),requirements:entries.get('needs'),
     branding:{colors:entries.get('colorMood'),typography:entries.get('typeMood')},
     pageTypes:entries.get('pageTypes'),pages:quote.pages,languages,features:Object.keys(quoteOptions).filter(key=>quote[key]&&(key!=='care'||quote.mode==='once')),
     tier:plan.id,payment:quote.mode,pricing:estimate(quote),included:[plan.one,...plan.features],assumptions,
     consent:{localDraft:true},delivery:'not-sent'};
   const p=proposal;
   const industry=Object.hasOwn(demos,p.industry)?demos[p.industry].label:'Jiný obor';
   const design=Object.hasOwn(demos,p.design)?demos[p.design].name:'Individuální návrh';
   $('proposal-text').textContent=['Nezávazné zadání webu · DTMates',p.business,p.contact.name+' · '+p.contact.email,
     industry+' · '+design,p.requirements,p.pages+' stránek celkem · '+p.languages.join(', ').toUpperCase(),p.pageTypes,
     [p.branding.colors,p.branding.typography].filter(Boolean).join(' · '),
     'Funkce: '+p.features.map(key=>quoteOptions[key]).join(', '),plan.name+' · '+(p.payment==='once'?'jednorázově':'měsíčně'),
     'Zahájení '+formatCZK(p.pricing.initial),'Měsíčně '+formatCZK(p.pricing.monthly),
     p.pricing.months+' měsíců celkem '+formatCZK(p.pricing.total),p.pricing.negotiated?'Část rozsahu vyžaduje samostatné nacenění.':'',
     'Zahrnuto: '+p.included.join(', '),...p.pricing.extras.map(r=>r.label+': '+r.count+' × '+formatCZK(r.unit)),
     ...p.assumptions,'Souhlas s místním návrhem: ano. Nic nebylo odesláno.'].filter(Boolean).join('\n');
   const block=$('proposal-document');
   const element=(tag,text,attrs={})=>{
     const node=document.createElement(tag);
     if(text)node.textContent=text;
     for(const [name,value] of Object.entries(attrs))node.setAttribute(name,value);
     return node;
   };
   const group=(title,...items)=>{
     const section=element('section');
     section.append(element('h4',title),...items);
     return section;
   };
   const list=items=>{
     const ul=element('ul');
     ul.append(...items.map(text=>element('li',text,{dir:'auto'})));
     return ul;
   };
   const facts=rows=>{
     const dl=element('dl',null,{class:'proposal-facts'});
     for(const [label,value] of rows){
       const line=element('div');
       line.append(element('dt',label),element('dd',value,{dir:'auto'}));
       dl.append(line);
     }
     return dl;
   };
   const header=element('header',null,{class:'proposal-masthead'});
   header.append(element('p','DTMates Web Studio'),element('h3',p.business,{dir:'auto'}),
     element('p','Nezávazný návrh webu'),element('p',p.contact.name+' · '+p.contact.email,{dir:'auto'}));
   const context=group('Zadání',element('p',p.requirements,{dir:'auto'}),
     facts([['Obor',industry],['Směr návrhu',design],['Barvy a typografie',[p.branding.colors,p.branding.typography].filter(Boolean).join(' · ')||'K upřesnění']]));
   const reference=$('brief-review-cover').querySelector('img');
   if(reference){
     const figure=element('figure',null,{class:'proposal-reference'});
     figure.append(reference.cloneNode(),element('figcaption',design+' · referenční ukázka'));
     context.append(figure);
   }
   const pageNames=p.pageTypes.split(',').map(value=>value.trim()).filter(Boolean);
   const scope=group('Mapa webu a funkce',
     facts([['Rozsah',p.pages+' stránek'],['Jazyky',p.languages.join(', ').toUpperCase()]]),
     pageNames.length?list(pageNames):element('p','Jednotlivé stránky upřesníme při návrhu.'),
     element('p',p.features.length?'Funkce: '+p.features.map(key=>quoteOptions[key]).join(', '):'Rozsah vychází ze zahrnutých služeb balíčku.'));
   const pricing=group('Náklady a rozsah balíčku',
     facts([['Balíček',plan.name+' · '+(p.payment==='once'?'jednorázově':'měsíčně')],
       ['Při zahájení',formatCZK(p.pricing.initial)],['Měsíčně',formatCZK(p.pricing.monthly)],
       [p.pricing.months+' měsíců celkem',formatCZK(p.pricing.total)]]),
     list(p.included),
     p.pricing.extras.length?list(p.pricing.extras.map(extra=>extra.label+' · '+extra.count+' × '+formatCZK(extra.unit))):element('p','V tomto odhadu nejsou příplatky.'),
     ...(p.pricing.negotiated?[element('p','Část rozsahu vyžaduje samostatné nacenění.')]:[]));
   const next=group('Před zahájením',list(p.assumptions),
     element('p','Zkontrolujte rozsah a uložte si kopii. Připravený dokument můžete sdílet při domluvě s DTMates. Z tohoto formuláře se nic neodesílá.'));
   block.replaceChildren(header,context,scope,pricing,next);
   $('proposal').hidden=false;
   $('proposal').focus();
   status.textContent='Místní návrh je připraven. Nic nebylo odesláno.';
 };
 function download(content,type,name){
   const url=URL.createObjectURL(new Blob([content],{type}));
   const link=document.createElement('a');link.href=url;link.download=name;link.click();
   setTimeout(()=>URL.revokeObjectURL(url),2000);
 }
 $('copy-proposal').onclick=async()=>{
   try{await navigator.clipboard.writeText($('proposal-text').textContent);status.textContent='Návrh zkopírován.';}
   catch{status.textContent='Schránka není dostupná. Návrh můžete stáhnout.';}
 };
 $('print-proposal').onclick=()=>window.print();
 $('download-proposal').onclick=()=>download($('proposal-text').textContent,'text/plain;charset=utf-8','dtmates-navrh.txt');
 $('download-brief').onclick=()=>download(JSON.stringify(proposal,null,2),'application/json','dtmates-zadani.json');
 $('brief-reset').onclick=()=>{
   form.reset();proposal=null;step=0;
   history.replaceState(null,'',location.pathname);
   $('proposal').hidden=true;$('proposal-text').textContent='';
   try{sessionStorage.removeItem(historyKey);}catch{}
   drawStep(true);summary();status.textContent='Místní zadání bylo vymazáno.';
 };
 restore();drawStep();summary();persist();
 form.dataset.ready="true";
}

const controls=$('studio-feature-control');
if(controls){
 const stories={
   cafe:'Sezónní menu a plán návštěvy',
   blackline:'Galerie detailů a poptávka péče',
   hotel:'Výběr pokoje, fotografie a návrh pobytu',
   wellness:'Srovnání rituálů a výběr termínu',
   realty:'Nabídky, uložené nemovitosti a prohlídka',
   timo:'Neoficiální koncept · produkt, velikost a košík',
   signal:'Pracovní přehled s přepínáním metrik'
 };
 let selected='cafe',device='desktop';
 const devices=[...document.querySelectorAll('[data-studio-device]')];
 function select(){
   const demo=demos[selected],mobile=device==='mobile',image=$('studio-feature-img');
   image.src='assets/showcase/art-'+(mobile?'mobile-':'')+selected+'.jpg';
   image.width=mobile?390:1440;
   image.height=900;
   image.alt='Domovská stránka · '+demo.name;
   controls.closest('.studio-screen').classList.toggle('studio-screen-mobile',mobile);
   $('studio-feature-summary').textContent=stories[selected];
   $('studio-feature-link').href='sites/'+selected+'/';
   $('studio-feature-brief').href='create/?design='+selected;
   for(const button of controls.children)button.setAttribute('aria-pressed',String(button.dataset.design===selected));
   for(const button of devices)button.setAttribute('aria-pressed',String(button.dataset.studioDevice===device));
 }
 for(const button of controls.children)button.onclick=()=>{selected=button.dataset.design;select();};
 for(const button of devices)button.onclick=()=>{device=button.dataset.studioDevice;select();};
 select();
}
