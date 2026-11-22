import {MAX_MEDIA,MAX_BYTES,mediaUse} from './media-library.js';

export function editMedia(panel,project,currentPage,resize,save,status,choose){
 const library=project.mediaLibrary;
 const selected=library.assets.find(asset=>asset.id===choose)||library.assets[0];
 const gallery=library.galleries[currentPage]||[];
 const node=(tag,text)=>{const el=document.createElement(tag);if(text)el.textContent=text;return el;};
 const button=(text,action,disabled=false)=>{
   const el=node('button',text);el.type='button';el.disabled=disabled;el.onclick=action;return el;
 };
 const redraw=id=>{save();editMedia(panel,project,currentPage,resize,save,status,id);};
 const photoInput=(label,replace)=>{
   const row=node('label',label),input=node('input');
   input.type='file';input.accept='image/webp,image/jpeg,image/png';
   input.onchange=async()=>{
     const file=input.files[0];
     if(!file)return;
     input.disabled=true;
     try{
       const result=await resize(file,1440,true);
       if(result.src.length>MAX_BYTES)throw Error('Výsledný obrázek je příliš velký.');
       if(!input.isConnected)return;
       const id=replace?.id||'m-'+crypto.randomUUID();
       const record={id,name:file.name.slice(0,110),size:file.size,type:result.src.slice(5,result.src.indexOf(';')),
         alt:replace?.alt||{cs:'',en:'',ar:''},description:replace?.description||'',credit:replace?.credit||'',
         x:replace?.x??50,y:replace?.y??50,...result};
       if(replace)Object.assign(replace,record);
       else library.assets.push(record);
       redraw(id);
       panel.querySelector('select')?.focus();
     }catch(error){status(error.message||'Fotografii nelze načíst.');}
     finally{input.disabled=false;}
   };
   row.append(input);return row;
 };
 panel.replaceChildren();
 if(library.assets.length<MAX_MEDIA)panel.append(photoInput('Nahrát do knihovny'));
 if(!selected)return;
 const assets=node('label','Vybrat obrázek'),picker=node('select');
 for(const entry of library.assets)picker.add(new Option(entry.name,entry.id));
 picker.value=selected.id;
 picker.onchange=()=>{editMedia(panel,project,currentPage,resize,save,status,picker.value);panel.querySelector('select').focus();};
 assets.append(picker);
 const preview=node('img');preview.src=selected.src;preview.alt=selected.alt[project.locale]||selected.alt.cs;
 preview.style.objectPosition=selected.x+'% '+selected.y+'%';
 panel.append(assets,preview,node('p',`${selected.originalWidth} × ${selected.originalHeight} px → ${selected.width} × ${selected.height} px · ${Math.round(selected.size/1024)} kB originál`),photoInput('Nahradit vybraný obrázek',selected));
 const field=(label,value,commit)=>{
   const row=node('label',label),input=node('input');input.value=value;input.maxLength=240;
   input.oninput=()=>{commit(input.value);save();};row.append(input);panel.append(row);
 };
 for(const locale of ['cs','en','ar'])field('Alternativní text '+locale.toUpperCase(),selected.alt[locale],value=>selected.alt[locale]=value.slice(0,160));
 field('Popis pro tým',selected.description,value=>selected.description=value);
 field('Zdroj a oprávnění',selected.credit,value=>selected.credit=value.slice(0,200));
 for(const [axis,label] of [['x','Vodorovný střed výřezu'],['y','Svislý střed výřezu']]){
   const row=node('label',label),input=node('select');
   for(const value of [0,25,50,75,100])input.add(new Option(value+' %',value));
   input.value=selected[axis];
   input.onchange=()=>{selected[axis]=Number(input.value);preview.style.objectPosition=selected.x+'% '+selected.y+'%';save();};
   row.append(input);panel.append(row);
 }
 const uses=mediaUse(library,selected.id);
 panel.append(node('p',uses.length?'Použití: '+uses.map(value=>value==='hero'?'Úvodní fotografie':value||'Úvod').join(', '):'Obrázek zatím nemá přiřazení.'));
 panel.append(button(library.hero===selected.id?'Uvolnit úvodní fotografii':'Použít jako úvodní fotografii',()=>{
   library.hero=library.hero===selected.id?'':selected.id;redraw(selected.id);
 }));
 const position=gallery.indexOf(selected.id);
 panel.append(button(position>=0?'Odebrat z galerie stránky':'Přidat do galerie stránky',()=>{
   if(position>=0)gallery.splice(position,1);
   else gallery.push(selected.id);
   library.galleries[currentPage]=gallery;redraw(selected.id);
 },position<0&&gallery.length>=6));
 if(position>=0)for(const [offset,label] of [[-1,'Galerie: posunout výš'],[1,'Galerie: posunout níž']]){
   const other=position+offset;
   panel.append(button(label,()=>{[gallery[position],gallery[other]]=[gallery[other],gallery[position]];redraw(selected.id);},other<0||other>=gallery.length));
 }
 panel.append(button('Smazat z knihovny',()=>{
   library.assets=library.assets.filter(item=>item.id!==selected.id);redraw();
 },uses.length>0));
}
