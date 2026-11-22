const locales=['cs','en','ar'];
const variants=['editorial','note','inset'];
const cut=(value,size)=>typeof value==='string'?value.slice(0,size):'';
export function normalizeSections(input,paths){
 return Object.fromEntries(Object.entries(input||{}).filter(([path,sections])=>paths.includes(path)&&Array.isArray(sections)).map(([path,sections])=>[
   path,sections.filter(section=>section&&typeof section==='object').slice(0,8).map(section=>({
     variant:variants.includes(section.variant)?section.variant:'editorial',
     content:Object.fromEntries(locales.map(locale=>[locale,{
       title:cut(section.content?.[locale]?.title,120),
       body:cut(section.content?.[locale]?.body,2400)
     }]))
   }))
 ]));
}
export function renderSections(sections,locale,escape){
 return (sections||[]).map(section=>{
   const {title,body}=section.content[locale];
   if(!title&&!body)return '';
   return `<section class="project-section project-section-${section.variant}">${title?`<h2>${escape(title)}</h2>`:''}<div>${body.split(/\n\s*\n/).filter(text=>text.trim()).map(text=>`<p>${escape(text)}</p>`).join('')}</div></section>`;
 }).join('');
}

export function editSections(panel,project,path,save){
 const list=project.siteSections[path]||[];
 const language=project.locale;
 const el=(type,text)=>{const element=document.createElement(type);element.textContent=text||'';return element;};
 const button=(label,action,disabled=false)=>{
   const control=el('button',label);control.type='button';control.disabled=disabled;control.onclick=action;return control;
 };
 const redraw=index=>{
   project.siteSections[path]=list;
   editSections(panel,project,path,save);
   save();
   (panel.querySelectorAll('fieldset')[index]?.querySelector('input')||panel.querySelector('button')).focus();
 };
 panel.replaceChildren(el('p',(path||'Úvod')+' · '+language.toUpperCase()));
 for(const [index,section] of list.entries()){
   const group=el('fieldset'),content=section.content[language];
   group.append(el('legend',String(index+1)+'. '+(content.title||'Sekce')));
   for(const [key,label,type,max] of [['title','Nadpis sekce','input',120],['body','Text sekce','textarea',2400]]){
     const wrapper=el('label',label),input=el(type);
     input.value=content[key];input.maxLength=max;
     input.oninput=()=>{content[key]=input.value;save();};
     wrapper.append(input);group.append(wrapper);
   }
   const row=el('label','Rozvržení'),variant=el('select');
   for(const [id,label] of [['editorial','Nadpis vedle textu'],['note','Zvýrazněný panel'],['inset','Úzký textový blok']])variant.add(new Option(label,id));
   variant.value=section.variant;variant.onchange=()=>{section.variant=variant.value;save();};
   row.append(variant);group.append(row);
   for(const [delta,label] of [[-1,'Posunout sekci výš'],[1,'Posunout sekci níž']]){
     const target=index+delta;
     group.append(button(label,()=>{[list[index],list[target]]=[list[target],list[index]];redraw(target);},target<0||target>=list.length));
   }
   group.append(button('Odebrat sekci',()=>{list.splice(index,1);redraw(Math.min(index,list.length-1));}));
   panel.append(group);
 }
 panel.append(button('Přidat obsahovou sekci',()=>{
   list.push({variant:'editorial',content:Object.fromEntries(locales.map(locale=>[locale,{title:'',body:''}]))});
   redraw(list.length-1);
 },list.length>=8));
}
