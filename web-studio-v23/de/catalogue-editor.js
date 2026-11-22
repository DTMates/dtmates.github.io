import {signalCatalogue} from "/web-studio-v23/engine/signal.js";
import {bloomCatalogue} from "/web-studio-v23/engine/site-designs/bloom.js";
import {dentalCatalogue} from "/web-studio-v23/engine/site-designs/dental.js";
import {electricCatalogue} from "/web-studio-v23/engine/site-designs/electric.js";
import {realtyCatalogue} from "/web-studio-v23/engine/site-designs/realty.js";
import {wellnessCatalogue} from "/web-studio-v23/engine/site-designs/wellness.js";
import {showMenu} from "./menu-editor.js";
import {timoCatalogue,timoSeedIds,timoExtraLimit,productSizes} from "/web-studio-v23/engine/timo-store.js";
import {applyProductRoutes,maxPages} from "/web-studio-v23/engine/site-pages.js";
export function showCatalogue(editor,state,refresh,rebuild,resizePhoto,feedback){
  if(state.id==="cafe")return showMenu(editor,state,refresh);
  const render=()=>{
    editor.replaceChildren();
    const fixed=state.id==='timo';
    const starter={timo:timoCatalogue,wellness:wellnessCatalogue,realty:realtyCatalogue,electric:electricCatalogue,dental:dentalCatalogue,bloom:bloomCatalogue,signal:signalCatalogue}[state.id];
    const rows=state.catalogue;
    if(starter)starter.forEach((value,index)=>{rows[index]??=value;});
    rows.forEach((value,index)=>{
      if(fixed&&state.timoHidden.includes(timoSeedIds[index]))return;
      const group=document.createElement('fieldset');
      const label=document.createElement('legend');
      label.textContent="Artikel "+(index+1);
      group.append(label);
      const fields=value.split('|').map(value=>value.trim());
      const extras={
        timo:[{label:"Größen"}],
        bloom:[{label:"Größenaufschlag in CZK",min:0,max:100000}],
        realty:[{label:'Plocha v m²',min:1,max:100000},{label:"Zimmeranzahl",min:1,max:1000}]
      }[state.id]||[];
      const names=[
        "Name",
        state.id==='wellness'?"Dauer in Minuten":state.id==='signal'?"Fertig":'Kategorie',
        state.id==='signal'?'Aktivita':"Preis in CZK",
        "Beschreibung",
        ...extras.map(field=>field.label)
      ];
      names.forEach((name,i)=>{
        const label=document.createElement('label');
        label.textContent=name;
        const input=document.createElement('input');
        input.value=fields[i]||'';

        input.maxLength=i===3?140:46;
        const range=i===2?{min:0}:extras[i-4];
        if(range?.min!==undefined){
          input.type='number';
          input.min=range.min;
          if(range.max!==undefined)input.max=range.max;
        }
        input.addEventListener('input',()=>{
          fields[i]=input.value.replaceAll('|','');
          rows[index]=names.map((_,index)=>fields[index]||'').join(' | ');
          refresh();
        });
        label.append(input);
        group.append(label);
      });
      if(fixed){
        const image=document.createElement('input');
        image.type='file';image.accept='image/png,image/jpeg,image/webp';
        image.setAttribute('aria-label','Fotografie '+(index+1));
        image.addEventListener('change',()=>{
          const file=image.files[0];
          if(!file||!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>500000){image.setCustomValidity('Vyberte PNG, JPEG nebo WebP do 500 kB.');image.reportValidity();return;}
          image.setCustomValidity('');
          const reader=new FileReader();
          reader.onload=()=>{state.productImages[index]=reader.result;refresh();};
          reader.readAsDataURL(file);
        });
        group.append(image,button("Produkt entfernen",false,()=>{
          state.timoHidden.push(timoSeedIds[index]);
          updateProducts();
        }));

      }
      const actions=[
        ['Nahoru',index===0,()=>rows.splice(index-1,0,...rows.splice(index,1))],
        ["Nach unten",index===rows.length-1,()=>rows.splice(index+1,0,...rows.splice(index,1))],
        ['Duplikovat',rows.length>=9,()=>rows.splice(index+1,0,rows[index])],
        ["Entfernen",false,()=>rows.splice(index,1)]
      ];
      for(const [name,disabled,action] of starter?[]:actions)group.append(button(name,disabled,action));
      editor.append(group);
    });
    if(fixed)editTimoProducts();
    if(!starter)editor.append(button("Artikel hinzufügen",rows.length>=9,()=>rows.push("Neuer Artikel | Angebot | 0 |")));
  };
  function updateProducts(){
    applyProductRoutes(state);
    rebuild();
    editor.querySelector('button')?.focus();
  }
  function editTimoProducts(){
    for(const item of state.timoExtra){
      const group=document.createElement('fieldset'),legend=document.createElement('legend');
      legend.textContent=item.names.cs||item.id;
      group.append(legend);
      const field=(label,value,apply,type='text')=>{
        const wrapper=document.createElement('label'),input=document.createElement('input');
        wrapper.textContent=label;
        input.type=type;input.value=value;input.maxLength=260;
        if(type==='number'){input.min='0';input.max='100000';}
        input.oninput=()=>{apply(input.value);refresh();};
        wrapper.append(input);group.append(wrapper);
      };
      for(const locale of ['cs','en','ar']){
        const caption=locale.toUpperCase();
        field("Name "+caption,item.names[locale],value=>{
          item.names[locale]=value.slice(0,70);
          const page=state.pages.find(page=>page.slug==='products/'+item.id);
          if(page)page.content[locale].title=item.names[locale]||item.names.cs;
          if(locale==='cs')legend.textContent=item.names.cs||item.id;
        });
        field("Beschreibung "+caption,item.details[locale],value=>item.details[locale]=value);
      }
      const category=document.createElement('label'),select=document.createElement('select');
      category.textContent="Kollektionen";
      for(const [value,label] of [['lingerie',"Dessous"],['swim',"Bademode"],['night',"Nachtwäsche"]])select.add(new Option(label,value));
      select.value=item.category;select.onchange=()=>{item.category=select.value;refresh();};
      category.append(select);group.append(category);
      field("Preis in CZK",item.price,value=>item.price=Math.max(0,Math.min(100000,Math.round(Number(value))||0)),'number');
      field("Größen",item.sizes,value=>item.sizes=productSizes(value).join(' ')||'S M L');
      const image=document.createElement('input');
      image.type='file';image.accept='image/jpeg,image/png,image/webp';image.setAttribute('aria-label',"Produktfoto");
      image.onchange=async()=>{
        const file=image.files[0];
        if(!file)return;
        try{
          const src=await resizePhoto(file,800);
          if(src.length>=670000)throw Error("Das Foto ist nach der Bearbeitung zu groß.");
          if(!group.isConnected)return;
          item.image=src;refresh();feedback("Produktfoto für den Export vorbereitet.");
        }catch(error){feedback(error.message);}
      };
      group.append(image,button("Produkt entfernen",false,()=>{
        state.timoExtra=state.timoExtra.filter(row=>row!==item);
        updateProducts();
      }));
      editor.append(group);
    }
    editor.append(button("Produkt hinzufügen",state.timoExtra.length>=timoExtraLimit||state.pages.length>=maxPages,()=>{
      state.timoExtra.push({id:'new-'+crypto.randomUUID(),names:{cs:"Neues Produkt",en:'New product',ar:'منتج جديد'},
        details:{cs:'',en:'',ar:''},category:'lingerie',price:0,sizes:'S M L',image:''});
      updateProducts();
    }));
  }
  function button(name,disabled,action){
    const button=document.createElement('button');
    button.type='button';
    button.textContent=name;
    button.disabled=disabled;
    button.addEventListener('click',()=>{action();if(editor.contains(button)){render();refresh();}});
    return button;
  }
  render();
}
