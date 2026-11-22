const MAX_MEDIA=12;
const MAX_BYTES=1_400_000;
const IMAGE=/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/;
const limit=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
const dimension=value=>Number.isInteger(value)&&value>0&&value<=40000?value:0;
const position=value=>[0,25,50,75,100].includes(value)?value:50;

export function normalizeMedia(input,routes){
 const seen=new Set();
 const assets=(Array.isArray(input?.assets)?input.assets:[]).slice(0,MAX_MEDIA).flatMap(item=>{
   if(!item||typeof item.id!=='string'||!/^m-[a-f0-9-]{36}$/.test(item.id)||seen.has(item.id)
     ||typeof item.src!=='string'||item.src.length>MAX_BYTES||!IMAGE.test(item.src))return [];
   seen.add(item.id);
   const text=Object.fromEntries(['cs','en','ar'].map(locale=>[locale,limit(item.alt?.[locale],160)]));
   return [{id:item.id,src:item.src,name:limit(item.name,110)||'Fotografie',
     type:item.src.slice(5,item.src.indexOf(';')),width:dimension(item.width),height:dimension(item.height),
     originalWidth:dimension(item.originalWidth),originalHeight:dimension(item.originalHeight),
     size:Number.isSafeInteger(item.size)&&item.size>=0&&item.size<=6_000_000?item.size:0,
     description:limit(item.description,240),credit:limit(item.credit,200),alt:text,x:position(item.x),y:position(item.y)}];
 });
 const galleries=Object.fromEntries(Object.entries(input?.galleries||{}).filter(([path,ids])=>routes.includes(path)&&Array.isArray(ids))
   .map(([path,ids])=>[path,[...new Set(ids.filter(id=>seen.has(id)))].slice(0,6)]));
 return {assets,hero:seen.has(input?.hero)?input.hero:'',galleries};
}

export function mediaUse(library,id){
 return [...(library.hero===id?['hero']:[]),...Object.entries(library.galleries).filter(([,ids])=>ids.includes(id)).map(([page])=>page)];
}

function activateProjectGallery(){
 const gallery=document.querySelector('.project-gallery');
 const dialog=gallery?.querySelector('dialog');
 if(!dialog?.showModal)return;
 gallery.addEventListener('click',event=>{
   const link=event.target.closest('a');
   if(!link||!gallery.contains(link))return;
   event.preventDefault();
   dialog.querySelector('figure').replaceChildren(link.querySelector('img').cloneNode());
   dialog.showModal();
 });
}

export function renderLibraryMedia(library,slug,locale,resolve,escape){
 const assets=new Map((library?.assets||[]).map(item=>[item.id,item]));
 const render=(item,eager=false)=>`<img src="${escape(resolve(item.src))}" alt="${escape(item.alt[locale]||item.alt.cs||'')}"${item.width&&item.height?` width="${item.width}" height="${item.height}"`:''} style="object-position:${item.x}% ${item.y}%" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
 const hero=assets.get(library?.hero);
 const gallery=(library?.galleries?.[slug]||[]).map(id=>assets.get(id)).filter(Boolean);
 const label={cs:'Fotogalerie',en:'Photo gallery',ar:'معرض الصور'}[locale];
 const close={cs:'Zavřít',en:'Close',ar:'إغلاق'}[locale];
 return {hero:hero?`<picture class="campaign-picture">${render(hero,true)}</picture>`:'',gallery:gallery.length?`<section class="project-gallery" aria-label="${label}"><h2>${label}</h2><div>${gallery.map(item=>`<figure><a href="${escape(resolve(item.src))}" aria-label="${escape(item.alt[locale]||item.alt.cs||label)}">${render(item)}</a></figure>`).join('')}</div><dialog aria-label="${label}"><form method="dialog"><button>${close}</button></form><figure></figure></dialog><script>(${activateProjectGallery.toString()})();</script></section>`:''};
}
export {MAX_MEDIA,MAX_BYTES};
