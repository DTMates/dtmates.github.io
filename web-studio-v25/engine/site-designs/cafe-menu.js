export const menuLocales=['cs','en','ar'];
export const menuCategories={
 coffee:['Káva','Coffee','قهوة'],drinks:['Nápoje','Drinks','مشروبات'],
 breakfast:['Snídaně','Breakfast','فطور'],bakery:['Pečivo','Bakery','مخبوزات']
};
const text=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
const translate=values=>Object.fromEntries(menuLocales.map((locale,i)=>[locale,values[i]]));
export function defaultMenu(stock){
 return stock.map(([names,category,price,descriptions],i)=>({
   id:'menu-'+(i+1),category:Object.keys(menuCategories)[category],price,
   names:translate(names),descriptions:translate(descriptions)
 }));
}
export function normalizeMenu(input,legacy,defaults){
 if(!Array.isArray(input)){
   if(!Array.isArray(legacy)||!legacy.length)return defaults;
   return legacy.map((row,i)=>{
     const [name,category,price,description]=String(row).split('|').map(part=>part.trim());
     const old=defaults.find(item=>item.names.cs===name);
     const key=Object.keys(menuCategories).find(key=>menuCategories[key][0]===category)||({Jídlo:'breakfast',Pečení:'bakery'})[category];
     return {id:'menu-'+(i+1),category:key||'coffee',price:Math.max(0,Math.min(10000,+price||0)),
       names:{...old?.names,cs:name},descriptions:{...old?.descriptions,cs:description}};
   }).filter(row=>row.names.cs);
 }
 const seen=new Set();
 return input.slice(0,24).flatMap(item=>{
   if(!item||typeof item.id!=='string'||!/^[a-z0-9-]{1,48}$/.test(item.id)||seen.has(item.id))return [];
   seen.add(item.id);
   return [{id:item.id,category:Object.hasOwn(menuCategories,item.category)?item.category:'coffee',
     price:Math.max(0,Math.min(10000,Number(item.price)||0)),
     names:Object.fromEntries(menuLocales.map(l=>[l,text(item.names?.[l],80)])),
     descriptions:Object.fromEntries(menuLocales.map(l=>[l,text(item.descriptions?.[l],220)]))}];
 });
}
