export const packages=[
 {id:'cabin',name:'Cabin',scope:[true,false,false,false],description:{cs:'Péče o interiér.',en:'Interior care.',ar:'العناية بالمقصورة.'},price:'',highlight:false},
 {id:'finish',name:'Finish',scope:[true,true,false,false],description:{cs:'Interiér a korekce laku.',en:'Interior care and paint correction.',ar:'العناية بالمقصورة وتصحيح الطلاء.'},price:'',highlight:true},
 {id:'shield',name:'Shield',scope:[true,true,true,true],description:{cs:'Kompletní rozsah včetně ochrany.',en:'Full scope including protection.',ar:'نطاق كامل يشمل الحماية.'},price:'',highlight:false}
];
const locales=['cs','en','ar'];
const text=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
export function normalizePackages(source){
 if(!Array.isArray(source)||!source.length)return structuredClone(packages);
 const seen=new Set();
 return source.slice(0,12).flatMap(row=>{
   if(!row||typeof row.id!=='string'||!/^[a-z0-9-]{1,48}$/.test(row.id)||seen.has(row.id))return [];
   seen.add(row.id);
   return [{id:row.id,name:text(row.name,70),price:text(row.price,30),highlight:row.highlight===true,
     scope:Array.from({length:4},(_,i)=>row.scope?.[i]===true),
     description:Object.fromEntries(locales.map(l=>[l,text(row.description?.[l],250)]))}];
 });
}
export function editPackages(root,state,refresh){
 const rows=state.detailPackages;
 function field(group,name,value,update,type='text'){
   const label=document.createElement('label'), input=document.createElement('input');
   label.textContent=name;input.type=type;input.maxLength=type==='checkbox'?0:250;
   if(type==='checkbox')input.checked=value;else input.value=value;
   input.oninput=()=>{update(type==='checkbox'?input.checked:input.value);refresh();};
   label.append(input);group.append(label);
 }
 function render(){
   root.replaceChildren();
   rows.forEach((row,i)=>{
     const group=document.createElement('fieldset');
     field(group,'Název balíčku',row.name,v=>row.name=v);
     field(group,'Ukázková cena',row.price,v=>row.price=v);
     locales.forEach(l=>field(group,'Popis '+l.toUpperCase(),row.description[l],v=>row.description[l]=v));
     ['Interiér','Korekce','Ochrana','Údržba'].forEach((label,n)=>field(group,label,row.scope[n],v=>row.scope[n]=v,'checkbox'));
     field(group,'Zvýraznit',row.highlight,v=>row.highlight=v,'checkbox');
     for(const [label,valid,action] of [['Nahoru',i>0,()=>rows.splice(i-1,0,...rows.splice(i,1))],['Odebrat',rows.length>1,()=>rows.splice(i,1)]]){
       if(valid)group.append(button(label,action));
     }
     root.append(group);
   });
   if(rows.length<12)root.append(button('Přidat balíček',()=>rows.push({...structuredClone(packages[0]),id:crypto.randomUUID(),name:'Nový balíček'})));
 }
 function button(label,action){
   const button=document.createElement('button');button.type='button';button.textContent=label;
   button.onclick=()=>{action();render();refresh();};return button;
 }
 render();
}
