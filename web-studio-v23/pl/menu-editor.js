import {message} from '../messages.js';
import {menuCategories,menuLocales} from "/web-studio-v23/engine/site-designs/cafe-menu.js";
export function showMenu(editor,state,refresh){
 const rows=state.cafeMenu;
 function render(){
   editor.replaceChildren();
   for(const item of rows){
     const group=document.createElement('fieldset');
     const legend=document.createElement('legend');
     legend.textContent=item.id;
     group.append(legend);
     const missing=document.createElement('p');
     const check=()=>missing.textContent=menuLocales.filter(l=>!item.names[l]?.trim()||!item.descriptions[l]?.trim()).map(l=>l.toUpperCase()).join(', ');
     for(const l of menuLocales){
       field(group,"Nazwa "+l.toUpperCase(),item.names[l],80,value=>{item.names[l]=value;check();});
       field(group,"Opis "+l.toUpperCase(),item.descriptions[l],220,value=>{item.descriptions[l]=value;check();});
     }
     const category=document.createElement('select');
     category.setAttribute('aria-label',"Kategoria");
     category.replaceChildren(...Object.entries(menuCategories).map(([id,[name]])=>new Option(message('editor.category.'+id),id,false,item.category===id)));
     category.onchange=()=>{item.category=category.value;refresh();};
     group.append(category);
     field(group,"Cena w CZK",item.price,5,value=>{item.price=Math.max(0,Math.min(10000,Number(value)||0));});
     const warning=document.createElement('div');
     warning.textContent="Brakujące tłumaczenia";
     warning.append(missing);
     check();
     group.append(warning,button("Usuń",()=>rows.splice(rows.indexOf(item),1)));
     editor.append(group);
   }
   if(rows.length<24)editor.append(button("Dodaj pozycję",()=>rows.push({id:crypto.randomUUID(),category:'coffee',price:0,names:{},descriptions:{}})));
 }
 function field(group,label,value,length,update){
   const wrapper=document.createElement('label'), input=document.createElement('input');
   wrapper.textContent=label;input.value=value??'';input.maxLength=length;
   input.oninput=()=>{update(input.value);refresh();};
   wrapper.append(input);group.append(wrapper);
 }
 function button(label,action){
   const b=document.createElement('button');
   b.type='button';b.textContent=label;b.onclick=()=>{action();render();refresh();};return b;
 }
 render();
}
