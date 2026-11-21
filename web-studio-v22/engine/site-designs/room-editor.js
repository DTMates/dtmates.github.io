import {roomLimit} from './hotel.js';
import {applyRoomRoutes,maxPages} from '../site-pages.js';

const locales=['AR','EN','CS'];
function button(label,action){
 const control=document.createElement('button');
 control.type='button';
 control.textContent=label;
 control.onclick=action;
 return control;
}

export function editRooms(editor,state,refresh,rebuild,resizePhoto,feedback){
 editor.replaceChildren();
 const structureChanged=()=>{
   state.hotelRoomsCustom=true;
   applyRoomRoutes(state);
   rebuild();
 };
 const create=button('Přidat pokoj',()=>{
   state.hotelRooms.push({
     id:'room-'+crypto.randomUUID(),capacity:2,image:'',
     names:['غرفة جديدة','New room','Nový pokoj'],details:['','',''],amenities:['','',''],gallery:[]
   });
   structureChanged();
   editor.querySelector('fieldset:last-child input').focus();
 });
 create.disabled=state.hotelRooms.length>=roomLimit||state.pages.length>=maxPages;
 editor.append(create);
 for(const [index,room] of state.hotelRooms.entries()){
   const group=document.createElement('fieldset'), legend=document.createElement('legend');
   legend.textContent=room.names[2]||room.id;
   group.append(legend);
   const field=(parent,label,value,update,type='text')=>{
     const wrapper=document.createElement('label'),input=document.createElement('input');
     wrapper.textContent=label;input.type=type;input.value=value;input.maxLength=300;
     if(type==='number'){input.min=1;input.max=8;}
     input.oninput=()=>{update(input.value);refresh();};
     wrapper.append(input);parent.append(wrapper);
   };
   const actions=document.createElement('div');
   actions.className='room-actions';
   const move=offset=>{
     const other=index+offset;
     [state.hotelRooms[index],state.hotelRooms[other]]=[state.hotelRooms[other],state.hotelRooms[index]];
     structureChanged();
     editor.querySelectorAll('fieldset')[other].querySelector('button')?.focus();
   };
   const up=button('Posunout nahoru',()=>move(-1)),down=button('Posunout dolů',()=>move(1));
   up.disabled=index===0;down.disabled=index===state.hotelRooms.length-1;
   actions.append(up,down,button('Odebrat pokoj',()=>{
     state.hotelRooms.splice(index,1);
     structureChanged();
     editor.querySelector('button').focus();
   }));
   group.append(actions);
   field(group,'Hosté',room.capacity,value=>room.capacity=Math.max(1,Math.min(8,Math.trunc(Number(value))||1)),'number');
   for(const [i,locale] of locales.entries()){
     for(const [key,label] of [['names','Název'],['details','Popis'],['amenities','Vybavení']]){
       field(group,label+' '+locale,room[key][i],value=>{
         const page=state.pages.find(page=>page.slug==='rooms/'+room.id)?.content[locale.toLowerCase()];
         const field=key==='names'?'title':key==='details'?'body':null;
         if(page&&field&&page[field]===room[key][i])page[field]=value;
         room[key][i]=value;
         if(key==='names'&&i===2)legend.textContent=value||room.id;
       });
     }
   }

   const media=document.createElement('details'),summary=document.createElement('summary');
   summary.textContent='Fotografie pokoje';
   media.append(summary);
   const redrawGallery=()=>{
     media.replaceChildren(summary);
     for(const [i,image] of room.gallery.entries()){
       const settings=document.createElement('div'),preview=document.createElement('img');
       preview.src=image.src;preview.alt=image.alt[2];
       settings.append(preview);
       for(const [j,locale] of locales.entries())field(settings,'Popisek '+(i+1)+' '+locale,image.alt[j],value=>image.alt[j]=value.slice(0,160));
       const replace=document.createElement('input');
       replace.type='file';replace.accept='image/jpeg,image/png,image/webp';
       replace.setAttribute('aria-label','Nahradit fotografii '+(i+1));
       replace.onchange=()=>loadPhoto(replace,file=>image.src=file);
       settings.append(replace,button('Odebrat fotografii '+(i+1),()=>{
         room.gallery.splice(i,1);redrawGallery();refresh();summary.focus();
       }));
       media.append(settings);
     }
     if(room.gallery.length<4){
       const upload=document.createElement('input');
       upload.type='file';upload.accept='image/jpeg,image/png,image/webp';
       upload.setAttribute('aria-label','Přidat fotografii pokoje');
       upload.onchange=()=>loadPhoto(upload,src=>room.gallery.push({src,alt:['','','']}));
       media.append(upload);
     }
   };
   async function loadPhoto(input,apply){
     const file=input.files?.[0];
     if(!file)return;
     try{
       const src=await resizePhoto(file,960);
       if(src.length>900000)throw Error('Fotografie je po úpravě příliš velká.');
       if(!group.isConnected)return;
       apply(src);
       redrawGallery();refresh();summary.focus();
       feedback('Fotografie pokoje připravena pro export.');
     }catch(error){feedback(error.message);}
   }
   redrawGallery();
   group.append(media);
   editor.append(group);
 }
}
