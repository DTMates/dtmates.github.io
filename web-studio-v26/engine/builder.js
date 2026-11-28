import {editSections} from './page-sections.js';
import {hasCampaign} from './site-designs/campaign.js';
import {editMedia} from './media-editor.js';
import {mediaUse} from './media-library.js';
import {brandFonts} from './assets/fonts/manifest.js';
import {editRooms} from './site-designs/room-editor.js';
import {editPackages} from './site-designs/packages.js';
import {timoMedia} from './timo-store.js';
import {showCatalogue} from './catalogue-editor.js';
import {renderPage,siteFiles,pagesFor,slugify,templateProject,cataloguePaths,maxPages} from './site-pages.js';
import {archive} from './static-zip.js';
import {normalize,draftDB} from './project.js';
import {demos,cleanState} from './data.js';
import {siteMarkup} from './render.js';
const $=id=>document.getElementById(id);
const key='dtmates-web-studio-builder-v1';
const query=new URLSearchParams(location.search),selected=Object.hasOwn(demos,query.get('site'))?query.get('site'):'cafe';
let state=normalize(templateProject(cleanState(demos[selected])));
let db;
try {
  db=await draftDB();
  const saved=await new Promise((resolve,reject)=>{
    const request=db.transaction('drafts').objectStore('drafts').get(query.has('site')?selected:localStorage.getItem('studio-active-project')||selected);
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
  state=normalize(saved||JSON.parse(localStorage.getItem(key)||'null')||state);
  if(query.has('site')&&state.id!==selected)state=normalize(templateProject(cleanState(demos[selected])));
  const archived=await new Promise((resolve,reject)=>{
    const request=db.transaction('drafts').objectStore('drafts').getKey('archive:'+state.projectId);
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
  if(archived)state=normalize({...templateProject(cleanState(demos[selected])),projectId:crypto.randomUUID()});
} catch {state=normalize(state);}
const history=[], future=[];
let activePage='';
const pageSelector=$('active-page');
const previewPage=$('preview-page');
function syncPreviewPage(){
  previewPage.replaceChildren(...[...pageSelector.options].map(option=>new Option(option.text,option.value)));
  previewPage.value=pageSelector.value;
}
function showWorkspace(view){
  document.querySelector('.builder-app').dataset.workspaceView=view;
  document.querySelectorAll('.mobile-workspace button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.workspace===view)));
}
document.querySelectorAll('.mobile-workspace button').forEach(button=>button.onclick=()=>showWorkspace(button.dataset.workspace));
document.querySelector('.workspace-links').onclick=event=>{
  const link=event.target.closest('a');
  if(!link)return;
  event.preventDefault();
  const heading=document.querySelector(link.hash+' h2');
  heading.focus({preventScroll:true});
  heading.scrollIntoView({block:'start'});
};
previewPage.onchange=()=>{pageSelector.value=previewPage.value;pageSelector.onchange();};
$('edit-current-page').onclick=()=>{
  showWorkspace('edit');
  const editor=activePage?[...$('pages').querySelectorAll('fieldset')].find(group=>group.dataset.page===activePage)?.querySelector('input'):$('headline');
  editor?.focus();
  editor?.scrollIntoView({block:'center'});
};

pageSelector.onchange=()=>{activePage=pageSelector.value;syncPreviewPage();refreshMediaEditor();refresh();};
window.addEventListener('message',event=>{
  if(event.source!==$('site-preview').contentWindow||event.data?.type!=='studio-navigation')return;
  const {slug,locale}=event.data;
  if(!['cs','en','ar'].includes(locale)||typeof slug!=='string'||(slug&&!state.pages.some(p=>p.slug===slug&&p.visible)))return;
  activePage=slug;state.locale=locale;setFields();
});
function pageStatus(){
  $('translation-status').textContent=state.pages.some(p=>p.visible&&(!p.content[state.locale].title||!p.content[state.locale].body))
    ? 'Některé stránky nemají obsah v tomto jazyce.' : '';
}

let previous=JSON.stringify(state);
function remember(){
  const next=JSON.stringify(state);
  if(next===previous)return;
  history.push(previous);
  if(history.length>35)history.shift();
  previous=next;
  future.length=0;
}
function restore(from,to){
  if(!from.length)return;
  to.push(JSON.stringify(state));
  previous=from.pop();
  state=JSON.parse(previous);
  setFields();
}
function syncOrder(){
  $('section-order').replaceChildren();
  state.sectionOrder.forEach((key,index)=>{
    const button=document.createElement('button');
    button.textContent='↑ '+names[key];
    button.disabled=index===0;
    button.onclick=()=>{
      const order=state.sectionOrder;
      [order[index-1],order[index]]=[order[index],order[index-1]];
      syncOrder();refresh();
    };
    $('section-order').append(button);
  });
}
$('undo').onclick=()=>restore(history,future);
$('redo').onclick=()=>restore(future,history);
$('add-page').onclick=()=>{
  if(state.pages.length>=maxPages)return;
  state.pages=pagesFor([...state.pages,{title:'Nová stránka',body:'',visible:true}]);
  setFields();
};
function pages(){
  const visiblePaths=new Set(['',...state.pages.map(page=>page.slug)]);
  for(const tree of [state.mediaLibrary.galleries,state.siteSections])for(const old of Object.keys(tree))if(!visiblePaths.has(old))delete tree[old];
  $('pages').replaceChildren();
  if(!state.pages.some(p=>p.slug===activePage&&p.visible))activePage='';
  pageSelector.replaceChildren(new Option('Úvod',''),...state.pages.filter(p=>p.visible).map(p=>new Option(p.content[state.locale].title||p.slug,p.slug)));
  pageSelector.value=activePage;
  syncPreviewPage();pageStatus();
  for(const [index,page] of state.pages.entries()){
    const group=document.createElement('fieldset');
    group.dataset.page=page.slug;
    const title=document.createElement('input');
    title.setAttribute('aria-label','Název stránky '+(index+1));title.maxLength=90;title.value=page.content[state.locale].title;
    const body=document.createElement('textarea');
    body.setAttribute('aria-label','Obsah stránky '+(index+1));body.maxLength=4000;body.value=page.content[state.locale].body;
    title.oninput=()=>{page.content[state.locale].title=title.value;pageStatus();refresh();};
    body.oninput=()=>{page.content[state.locale].body=body.value;pageStatus();refresh();};
    const path=document.createElement('input');
    path.setAttribute('aria-label','Adresa stránky '+(index+1));path.value=page.slug;
    path.onchange=()=>{
      const slug=slugify(path.value);
      if(!slug||['en','ar','index'].includes(slug)||state.pages.some(p=>p!==page&&p.slug===slug)){
        toast('Zvolte jedinečnou adresu stránky.');path.value=page.slug;return;
      }
      if(activePage===page.slug)activePage=slug;
      for(const tree of [state.mediaLibrary.galleries,state.siteSections])if(Object.hasOwn(tree,page.slug)){
        tree[slug]=tree[page.slug];
        delete tree[page.slug];
      }
      page.slug=slug;setFields();
    };
    const description=document.createElement('input');
    description.setAttribute('aria-label','SEO popis stránky '+(index+1));
    description.maxLength=200;description.value=page.content[state.locale].description;
    description.oninput=()=>{page.content[state.locale].description=description.value;refresh();};
    group.append(title,path,body,description);
    const actions=[
      [page.visible?'Skrýt':'Zobrazit',()=>{page.visible=!page.visible;}],
      ['Duplikovat',()=>{if(state.pages.length<maxPages)state.pages=pagesFor([...state.pages.slice(0,index+1),structuredClone(page),...state.pages.slice(index+1)]);}],
      ['Posunout výš',()=>{if(index)[state.pages[index-1],state.pages[index]]=[page,state.pages[index-1]];}],
      ['Odstranit',()=>state.pages.splice(index,1)]
    ];
    for(const [text,run] of actions){
      const button=document.createElement('button');button.textContent=text;
      button.onclick=()=>{run();setFields();};group.append(button);
    }
    $('pages').append(group);
  }
}
const projectPick=$('local-project');
const archivedPick=$('archived-project');
function projects(){
  if(!db)return;
  const store=db.transaction('drafts').objectStore('drafts');
  const keys=store.getAllKeys();
  const request=store.getAll();
  request.onsuccess=()=>{
    const archived = archivedPick.value;
    projectPick.replaceChildren(new Option(state.projectName,state.projectId));
    archivedPick.replaceChildren(new Option('Vyberte projekt',''));
    for(const [index,item] of request.result.entries()){
      const key=String(keys.result[index]);
      if(!item?.id||key.startsWith('revision:'))continue;
      const id=item.projectId||item.id;
      if(key.startsWith('archive:'))archivedPick.append(new Option(item.projectName||item.brand,key));
      else if(id!==state.projectId)projectPick.append(new Option(item.projectName||item.brand,id));
    }
    if([...archivedPick.options].some(option=>option.value===archived))archivedPick.value=archived;
    $('unarchive-project').disabled=!archivedPick.value;
  };
}
function readDraft(id,callback){
  if(!db)return;
  const request=db.transaction('drafts').objectStore('drafts').get(id);
  request.onsuccess=()=>callback(request.result);
  request.onerror=()=>toast('Projekt se nepodařilo načíst.');
}
function switchProject(next){
  state=normalize(next);activePage='';history.length=future.length=0;
  previous=JSON.stringify(state);setFields();projects();
}
projectPick.onchange=()=>{const id=projectPick.value;save();readDraft(id,item=>{if(item)switchProject(item);});};
$('project-name').oninput=()=>{state.projectName=$('project-name').value;refresh();};
$('new-project').onclick=()=>{
  save();
  switchProject({...templateProject(cleanState(demos[state.id])),projectId:crypto.randomUUID(),projectName:'Nový projekt'});
};
$('copy-project').onclick=()=>{
  save();
  switchProject({...structuredClone(state),projectId:crypto.randomUUID(),projectName:state.projectName+' – kopie'});
};
archivedPick.onchange=()=>{$('unarchive-project').disabled=!archivedPick.value;};
$('archive-project').onclick=()=>{
  if(!db)return toast('Úložiště nedostupné.');
  clearTimeout(updateTimer);
  const project=structuredClone(state);
  const tx=db.transaction('drafts','readwrite');
  const store=tx.objectStore('drafts');
  store.add(project,'archive:'+project.projectId);
  store.delete(project.projectId);
  tx.oncomplete=()=>{
    if(state.projectId===project.projectId){
      clearTimeout(updateTimer);
      switchProject({...templateProject(cleanState(demos[project.id])),projectId:crypto.randomUUID(),projectName:'Nový projekt'});
    }else projects();
    toast('Projekt přesunut do archivu.');
  };
  tx.onerror=()=>toast('Projekt se nepodařilo archivovat.');
};
$('unarchive-project').onclick=()=>{
  const key=archivedPick.value;
  if(!db||!key)return;
  const tx=db.transaction('drafts','readwrite');
  const store=tx.objectStore('drafts');
  const request=store.get(key);
  request.onsuccess=()=>{
    if(!request.result)return;
    store.add(request.result,request.result.projectId||request.result.id);
    store.delete(key);
  };
  tx.oncomplete=()=>{projects();toast('Projekt obnoven mezi místní projekty.');};
  tx.onerror=()=>toast('Projekt se nepodařilo obnovit. Jeho archiv zůstal uložen.');
};
$('save-revision').onclick=()=>{
  if(!db)return toast('Úložiště nedostupné.');
  const tx=db.transaction('drafts','readwrite');
  tx.objectStore('drafts').put(structuredClone(state),'revision:'+state.projectId);
  tx.oncomplete=()=>toast('Revize uložena.');
  tx.onerror=()=>toast('Revizi se nepodařilo uložit.');
};
$('restore-revision').onclick=()=>readDraft('revision:'+state.projectId,item=>{
  if(!item)return toast('Tento projekt nemá ručně uloženou revizi.');
  state=normalize(item);setFields();
});
const fieldMap={'gallery-alt':'galleryAlt','weekday-hours':'weekdayHours','weekend-hours':'weekendHours',brand:'brand',email:'email',phone:'phone',address:'address',color:'color',contrast:'contrast'};
const names={services:'Služby',about:'Příběh / O nás',review:'Ukázkové hodnocení',contact:'Kontakt a formulář',map:'Mapa / adresa',video:'Video v hero'};
let updateTimer=0;let toastTimer=0;
function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3400)}
let draftWrite=0;
function save(){
  const write=++draftWrite;
  if(!db){$('save-status').textContent='Úložiště nedostupné · stáhněte JSON';return;}
  $('save-status').textContent='Ukládám změny…';
  const tx=db.transaction('drafts','readwrite');
  const projectId=state.projectId;
  const store=tx.objectStore('drafts');
  const draft=structuredClone(state);
  const archiveKey=store.getKey('archive:'+projectId);
  archiveKey.onsuccess=()=>{if(!archiveKey.result)store.put(draft,projectId);};
  tx.oncomplete=()=>{
    if(state.projectId!==projectId||write!==draftWrite)return;
    if(archiveKey.result){$('save-status').textContent='Projekt je archivovaný · stáhněte JSON';return;}
    $('save-status').textContent='Uloženo včetně médií';
    try{localStorage.setItem('studio-active-project',projectId);}catch{}
    projects();
  };
  tx.onerror=()=>$('save-status').textContent='Uložení selhalo · stáhněte JSON';
}
const previewFonts=new Map();
function fontsForPreview(id){
  if(!previewFonts.has(id)){
    const sheet=new URL('./assets/fonts/'+id+'/faces.css',import.meta.url);
    const request=(async()=>{
      const response=await fetch(sheet);
      if(!response.ok)throw Error('Písmo náhledu není dostupné');
      let css=await response.text();
      const sources=[...new Set([...css.matchAll(/url\(([^)]+)\)/g)].map(match=>match[1]))];
      const embedded=await Promise.all(sources.map(async source=>{
        const response=await fetch(new URL(source,sheet));
        if(!response.ok)throw Error('Písmo náhledu není dostupné');
        return [source,await fileAsData(await response.blob())];
      }));
      for(const [path,data] of embedded)css=css.replaceAll('url('+path+')','url('+data+')');
      return css;
    })().catch(()=>{previewFonts.delete(id);return '';});
    previewFonts.set(id,request);
  }
  return previewFonts.get(id);
}
let previewVersion=0;
function refresh(){
  let titlesChanged=false;
  for(const option of pageSelector.options){
    const page=state.pages.find(entry=>entry.slug===option.value);
    if(!page)continue;
    const title=page.content[state.locale].title||page.slug;
    if(option.text===title)continue;
    option.text=title;
    titlesChanged=true;
  }
  if(titlesChanged)syncPreviewPage();
  remember();
  clearTimeout(updateTimer);
  const version=++previewVersion;
  save();
  updateTimer=setTimeout(async()=>{
    const fontCSS=await fontsForPreview(state.id);
    if(version!==previewVersion)return;
    $('site-preview').srcdoc=renderPage(state,state.locale,activePage,{preview:true,fontCSS});
    $('preview-meta').textContent=($('preview-shell').classList.contains('mobile')?'Mobil':$('preview-shell').classList.contains('tablet')?'Tablet':'Desktop')+' · '+state.locale.toUpperCase();
  },85);
}
function refreshMediaEditor(){editSections($('page-section-fields'),state,activePage,refresh);editMedia($('media-library-fields'),state,activePage,resizePhoto,refresh,toast,$('media-library-fields').querySelector('select')?.value);}
function setFields(){$('room-editor').hidden=state.id!=='hotel';if(state.id==='hotel')editRooms($('room-fields'),state,refresh,setFields,resizePhoto,toast);$('package-editor').hidden=state.id!=='blackline';if(state.id==='blackline')editPackages($('package-fields'),state,refresh);showCatalogue($('catalogue'),state,refresh,setFields,resizePhoto,toast);$('project-name').value=state.projectName;pages();refreshMediaEditor();syncOrder();for(const [id,key] of Object.entries(fieldMap))$(id).value=state[key]||'';$('template').value=state.id;$('language').value=state.locale;$('headline').value=state.headline[state.locale]||'';$('subline').value=state.subline[state.locale]||'';$('services').value=(state.servicesLocales?.[state.locale]||state.services).join('\n');$('description').value=state.descriptionLocales?.[state.locale]||state.description||'';$('cta').value=state.ctaLocales?.[state.locale]||state.cta||'';$('about').value=state.aboutLocales?.[state.locale]||state.about||'';$('review').value=state.reviewLocales?.[state.locale]||state.review||'';$('video-url').value=state.video?.startsWith('data:')?'':state.video||'';$('sections-list').innerHTML=Object.entries(names).map(([k,v])=>`<label class="toggle"><span>${v}</span><input type="checkbox" data-section="${k}" ${state.sections[k]?'checked':''}></label>`).join('');$('sections-list').querySelectorAll('[data-section]').forEach(el=>el.addEventListener('change',()=>{state.sections[el.dataset.section]=el.checked;refresh();}));refresh();}
$('template').replaceChildren(...Object.values(demos).map(demo=>new Option(demo.name,demo.id)));
$('template-gallery').append(...Object.values(demos).map(demo=>{
  const item=document.createElement('a');
  item.href='builder.html?site='+demo.id;
  const thumb=document.createElement('img');
  thumb.src='assets/showcase/art-'+demo.id+'.jpg';thumb.alt='';thumb.loading='lazy';thumb.width=1440;thumb.height=900;
  const caption=document.createElement('span');caption.textContent=demo.name;
  item.append(thumb,caption);
  return item;
}));
$('template').addEventListener('change',()=>{if(!confirm('Změna šablony nahradí aktuální obsah výchozím oborovým návrhem. Pokračovat?')){$('template').value=state.id;return;}save();switchProject({...templateProject(cleanState(demos[$('template').value])),projectId:crypto.randomUUID()});toast('Otevřena nová šablona');});
$('language').addEventListener('change',()=>{state.locale=$('language').value;pages();refreshMediaEditor();$('headline').value=state.headline[state.locale]||'';$('subline').value=state.subline[state.locale]||'';$('services').value=(state.servicesLocales?.[state.locale]||state.services).join('\n');for(const k of ['description','cta','about','review'])$(k).value=state[k+'Locales']?.[state.locale]||state[k]||'';refresh();});
for(const [id,key] of Object.entries(fieldMap))$(id).addEventListener('input',()=>{state[key]=$(id).value;refresh();});
$('headline').addEventListener('input',()=>{state.headline[state.locale]=$('headline').value;refresh();});
$('subline').addEventListener('input',()=>{state.subline[state.locale]=$('subline').value;refresh();});
$('services').addEventListener('input',()=>{const value=$('services').value.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,9);state.servicesLocales[state.locale]=value;if(state.locale==='cs')state.services=[...value];refresh();});for(const k of ['description','cta','about','review'])$(k).addEventListener('input',()=>{state[k+'Locales'][state.locale]=$(k).value;if(state.locale==='cs')state[k]=$(k).value;refresh();});
$('video-url').addEventListener('change',()=>{const value=$('video-url').value.trim();if(value&&!/^(https:\/\/|assets\/)/.test(value)){toast('Použijte HTTPS adresu videa nebo soubor z assets/');return;}state.video=value;if(value)state.sections.video=true;setFields();});
function fileAsData(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});}
async function resizePhoto(file,maxEdge=1600,metadata=false){
  if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>6_000_000)throw Error('Použijte PNG, JPG nebo WebP do 6 MB.');
  const bitmap=await createImageBitmap(file);
  try{
    const scale=Math.min(1,maxEdge/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));
    canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
    const src=canvas.toDataURL('image/webp',.83);
    return metadata?{src,width:canvas.width,height:canvas.height,originalWidth:bitmap.width,originalHeight:bitmap.height}:src;
  }finally{bitmap.close();}
}
for(const [input,key] of [['hero-file','hero'],['feature-file','featureImage'],['gallery-file','galleryImage'],['suite-file','suiteImage'],['experience-file','experienceImage'],['courtyard-detail-file','courtyardDetail'],['attic-detail-file','atticDetail'],['salon-detail-file','salonDetail']]){
  $(input).addEventListener('change',async event=>{
    const file=event.target.files?.[0];
    if(!file)return;
    const project=state;
    try{
      const src=await resizePhoto(file);
      if(state!==project)return;
      state[key]=src;refresh();toast('Fotografie připravena pro export.');
    }catch(error){toast(error.message||'Fotografii nelze načíst.');}
  });
}
$('video-file').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;if(f.type!=='video/mp4'||f.size>10_000_000){toast('Vyberte MP4 do 10 MB.');return;}try{state.video=await fileAsData(f);state.sections.video=true;setFields();toast('Ukázkové MP4 připraveno; export bude větší.');}catch{toast('Video nelze načíst.');}});
document.querySelectorAll('[data-width]').forEach(b=>b.addEventListener('click',()=>{const shell=$('preview-shell');shell.classList.remove('mobile','tablet');if(b.dataset.width!=='desktop')shell.classList.add(b.dataset.width);document.querySelectorAll('[data-width]').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',String(el===b));});$('preview-meta').textContent=b.dataset.width+' · '+state.locale.toUpperCase();}));
$('reset-button').addEventListener('click',()=>{if(confirm('Opravdu vrátit aktuální šablonu do výchozího stavu?')){state=normalize(templateProject(cleanState(demos[state.id])));setFields();toast('Obnoven výchozí stav.');}});
$('import-button').addEventListener('click',()=>$('json-import').click());
$('json-import').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>30_000_000)throw Error('size');state=normalize(JSON.parse(await f.text()));setFields();toast('Konfigurace načtena.');}catch{toast('Soubor nemá očekávaný JSON formát.');}e.target.value='';});
function download(filename,body,mime){const blob=body instanceof Blob?body:new Blob([body],{type:mime});const a=document.createElement('a');const src=URL.createObjectURL(blob);a.href=src;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(src),10000);}
const slug=v=>String(v||'web').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,42)||'web';
$('json-export').addEventListener('click',()=>{download(`${slug(state.brand)}-recept.json`,JSON.stringify({...state,schema_version:3},null,2),'application/json');toast('JSON konfigurace stažena.');});
async function inlineAsset(ref){if(!ref||ref.startsWith('data:'))return ref;try{const u=new URL(ref,location.href);if(u.origin!==location.origin)return ref;const response=await fetch(u);if(!response.ok)throw new Error('asset');return await fileAsData(await response.blob());}catch{return ref;}}
$('html-export').addEventListener('click',async ()=>{const btn=$('html-export');btn.disabled=true;btn.textContent='Připravuji HTML…';try{const css=await (await fetch('demo-site.css')).text();const data={...state,hero:await inlineAsset(state.mediaLibrary.assets.find(item=>item.id===state.mediaLibrary.hero)?.src||state.hero),video:state.sections.video?await inlineAsset(state.video):state.video};const legacy={...data,pages:data.pages.map(p=>({visible:p.visible,...p.content[data.locale]}))};const html=siteMarkup(legacy,{inlineCSS:css});download(`${slug(state.brand)}.html`,html,'text/html;charset=utf-8');toast('Statické HTML staženo. Otevře se i bez serveru.');}catch(error){toast('Export selhal: '+error.message);}finally{btn.disabled=false;btn.textContent='↓ Zjednodušené HTML';}});
$('zip-export').onclick=async()=>{
  const button=$('zip-export');
  button.disabled=true;
  try{
    const response=await fetch('demo-site.css');
    if(!response.ok)throw Error('Chybí styly');
    const css=await response.text();
    const data=structuredClone(state);
    if(data.id==='bloom'&&data.featureImage==='assets/img/bloom.webp')data.featureImage='';
    if(data.id==='wellness'&&data.featureImage==='assets/img/mira-detail-v9.webp')data.featureImage='';
    for(const key of ['hero','featureImage','galleryImage','suiteImage','experienceImage','courtyardDetail','atticDetail','salonDetail','video']){
      if(!data[key]||data[key].startsWith('data:')||(key==='hero'&&hasCampaign(data)))continue;
      if(!data[key].startsWith('assets/'))throw Error('Pro samostatný ZIP nahrajte externí média jako soubory.');
      const embedded=await inlineAsset(data[key]);
      if(!embedded.startsWith('data:'))throw Error('Chybí lokální médium');
      data[key]=embedded;
    }
    const productFiles={};
    if(hasCampaign(data)){
      const original=await fetch(data.hero);
      if(!original.ok)throw Error('Chybí původní obrazový soubor');
      productFiles[data.hero]=new Uint8Array(await original.arrayBuffer());
    }
    if(data.id==='timo'){
      await Promise.all(timoMedia.map(async (path,index)=>{
        const upload=data.productImages[index];
        if(upload){
          const mime=upload.slice(11,upload.indexOf(';'));
          const target='assets/img/custom-product-'+index+'.'+(mime==='jpeg'?'jpg':mime);
          const response=await fetch(upload);
          productFiles[target]=new Uint8Array(await response.arrayBuffer());
          data.productImages[index]=target;
        }else{
          const response=await fetch(path);
          if(!response.ok)throw Error('Chybí fotografie produktu');
          productFiles[path]=new Uint8Array(await response.arrayBuffer());
        }
      }));
    }
    await Promise.all(cataloguePaths(data.id).filter(path=>!timoMedia.includes(path)).map(async path=>{
      const response=await fetch(path);
      if(!response.ok)throw Error('Chybí soubor galerie');
      productFiles[path]=new Uint8Array(await response.arrayBuffer());
    }));
    const packagePhoto=async (image,stem)=>{
      if(!image)return '';
      const extension=image.slice(11,image.indexOf(';'));
      const path='assets/img/uploads/'+stem+'.'+(extension==='jpeg'?'jpg':extension);
      const payload=await fetch(image);
      productFiles[path]=new Uint8Array(await payload.arrayBuffer());
      return path;
    };
    for(const room of data.hotelRooms||[]){
      for(const [index,image] of room.gallery.entries())image.src=await packagePhoto(image.src,room.id+'-'+index);
    }
    for(const item of data.timoExtra||[])item.image=await packagePhoto(item.image,item.id);
    data.mediaLibrary.assets=data.mediaLibrary.assets.filter(item=>mediaUse(data.mediaLibrary,item.id).length);
    for(const item of data.mediaLibrary.assets)item.src=await packagePhoto(item.src,item.id);
    const fontFiles=Object.fromEntries(await Promise.all(brandFonts[data.id].files.map(async path=>{
      const file=await fetch(path);
      if(!file.ok)throw Error('Chybí písmo nebo jeho licence');
      return [path,new Uint8Array(await file.arrayBuffer())];
    })));
    const files=siteFiles(data,css,{assetPaths:true,productImageFiles:data.id==='timo'});
    download(slug(state.brand)+'.zip',archive({...files,...productFiles,...fontFiles}));
    toast('Vícestránkový web stažen.');
  }catch(error){toast(error.message);}
  finally{button.disabled=false;}
};
const guideSteps=[
 ['Vyberte typ webu','V levém panelu přepínejte mezi kavárnou, řemeslníkem, wellness, realitami a ukázkou FORME. Každý koncept má jiné rozložení.','Tip: začněte kategorií, která je nejbližší vaší službě; strukturu lze později změnit.'],
 ['Napište svůj příběh','Změňte název, nadpis, popis a služby. Obsah se okamžitě ukáže v náhledu.','Tip: nadpis má odpovídat tomu, co zákazník potřebuje — ne jen názvu vaší firmy.'],
 ['Přidejte vizuály','Nastavte barvy, nahrajte vlastní fotografii a případně MP4 video. Pro ostrý web použijte licencované fotografie a skutečné kontaktní údaje.','Tip: video je volitelné; dobrá fotografie bývá rychlejší a lépe funguje na mobilu.'],
 ['Zkontrolujte jazyky a mobil','Přepněte CS / EN / AR a vyplňte texty pro každý jazyk samostatně. Arabština změní směr stránky na RTL. Přepněte také mobilní náhled.','Pozor: editor neslibuje automatické překlady. Každou jazykovou verzi zkontrolujte s rodilým mluvčím.'],
 ['Stáhněte a publikujte','Export HTML je samostatný web s vloženým obrázkem a styly. JSON zachová upravitelnou konfiguraci. Pro ostrý provoz připojte formulář, doménu, GDPR texty a skutečný hosting.','Tip: HTML můžete nasadit třeba na Cloudflare Pages. Tlačítka demo formulářů nic neposílají, dokud nepřipojíte backend.']
];
guideSteps.splice(3,0,
 ['Přidejte vlastní sekci','V části Stránky a navigace použijte Přidat stránku. Pro kavárnu zkuste Sezónní menu.','Pojmenujte sekci a přidejte krátký text. Odkaz se objeví v navigaci.'],
 ['Doplňte kontakt','Upravte e-mail, telefon a adresu v části Kontakt.','Ukázkový formulář uchovává odesílání vypnuté.']);
const guideTargets=['template','headline','hero-file','add-page','email','language','html-export'];
$('guide-jump').onclick=()=>{
  $('guide').close();
  const target=$(guideTargets[guideStep]);
  showWorkspace('edit');target.scrollIntoView({block:'center'});target.focus();
};
let guideStep=0;function showGuide(){const step=guideSteps[guideStep];$('guide-number').textContent=String(guideStep+1).padStart(2,'0');$('guide-title').textContent=step[0];$('guide-text').textContent=step[1];$('guide-tip').textContent=step[2];$('guide-progress').style.setProperty('--progress',`${(guideStep+1)*100/guideSteps.length}%`);$('guide-back').disabled=guideStep===0;$('guide-next').textContent=guideStep===guideSteps.length-1?'Hotovo ✓':'Pokračovat →';}
$('guide-open').addEventListener('click',()=>{guideStep=0;showGuide();$('guide').showModal();});$('guide-close').addEventListener('click',()=>$('guide').close());$('guide-back').addEventListener('click',()=>{guideStep=Math.max(0,guideStep-1);showGuide();});$('guide-next').addEventListener('click',()=>{if(guideStep===guideSteps.length-1){$('guide').close();return;}guideStep++;showGuide();});$('guide').addEventListener('click',e=>{if(e.target===$('guide'))$('guide').close();});
setFields();
