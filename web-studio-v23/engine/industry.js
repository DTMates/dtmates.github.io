// Fictional business data. Each module is rendered in both the editor and export.
const catalogues={
  cafe:{heading:'Sezónní menu',filter:'Kategorie',rows:[
    ['Espresso','Káva',65,'Výběrová káva'],['Flat white','Káva',89,'Dvojité espresso s mlékem'],
    ['Jablečný koláč','Pečení',95,'Jablka a skořice'],['Víkendová snídaně','Jídlo',195,'Vejce, kváskový chléb a zelenina']]},
  wellness:{heading:'Procedury',filter:'Typ péče',rows:[
    ['Relaxační masáž','Relaxace',1050,'60 min'],['Individuální péče','Péče',1450,'90 min'],
    ['Dárkový poukaz','Dárky',1200,'Ukázkový poukaz']]},
  realty:{heading:'Nabídka bydlení',filter:'Typ nemovitosti',rows:[
    ['Byt u parku','Byt',7490000,'Praha · 2 pokoje · 58 m²'],['Dům se zahradou','Dům',12500000,'Praha-západ · 5 pokojů · 145 m²'],
    ['Podkroví s terasou','Byt',8950000,'Praha · 3 pokoje · 86 m²']]}
};

const money=new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0});
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const types={properties:'realty',menu:'cafe',quote:'electric',treatments:'wellness',booking:'wellness',listings:'realty',viewing:'realty',visit:'cafe',bouquets:'bloom',collections:'timo',packages:'blackline',rooms:'hotel'};

export function industryMarkup(template,slug,locale,project){
  if(locale!=='cs'||types[slug]!==template)return '';
  if(slug==='visit')return '<section class="industry-workflow cafe"><h2>Návštěva kavárny</h2>'+draftForm('Rezervace stolu',[['Počet hostů','number'],['Termín','date']])+'</section>';
  if(slug==='quote'&&template==='electric')return '<section class="industry-workflow electric"><h2>Poptávka elektroprací</h2>'+draftForm('Připravit poptávku',[['Typ práce',['Nová instalace','Oprava','Konzultace']],['Obec nebo PSČ','text'],['Popis práce','textarea']])+'</section>';
  if(slug==='booking')return '<section class="industry-workflow wellness"><h2>Poptat termín</h2>'+draftForm('Poptávka návštěvy',[['Procedura',catalogues.wellness.rows.map(row=>row[0])],['Preferovaný den','date']])+'</section>';
  if(slug==='viewing')return '<section class="industry-workflow realty"><h2>Poptat prohlídku</h2>'+draftForm('Poptávka prohlídky',[['Nemovitost',catalogues.realty.rows.map(row=>row[0])],['Preferovaný den','date']])+'</section>';
  const catalogue=catalogues[template]||{
    heading:project?.brand||template,filter:'Kategorie',
    rows:(project?.servicesLocales.cs||[]).map((title,index)=>[title,title,([450,850,1250][index%3]),'Ukázková nabídka'])
  };
  const rows=project?.catalogue?.length?project.catalogue.map(row=>{
    const [title,category,price,description='']=row.split('|').map(value=>value.trim());
    return [title,category,Number(price)||0,description];
  }):catalogue.rows;
  const categories=[...new Set(rows.map(row=>row[1]))];
  return `<section class="industry-workflow ${template}" data-catalogue><h2>${catalogue.heading}</h2><p>Fiktivní nabídka · ilustrační ceny</p>
    <div class="industry-filters"><label>Hledat <input type="search" data-search></label>
    <label>${catalogue.filter}<select data-category><option value="">Vše</option>${categories.map(category=>`<option>${esc(category)}</option>`).join('')}</select></label>
    ${template==='timo'?'<label>Řazení <select data-sort><option value="">Výchozí</option><option value="asc">Nejnižší cena</option><option value="desc">Nejvyšší cena</option></select></label>':''}
    ${template==='realty'?'<label>Maximální cena (Kč)<input type="number" min="0" data-budget></label><label><input type="checkbox" data-only-saved> Pouze oblíbené</label>':''}</div>
    <div class="industry-items">${rows.map(([title,category,price,description],index)=>`<article data-row="${index}" data-title="${esc(title)}" data-kind="${esc(category)}" data-price="${price}"><small>${esc(category)}</small><h3>${esc(title)}</h3><p>${esc(description)}</p><strong>${money.format(price)}</strong>${template==='realty'?'<button type="button" data-save aria-pressed="false">Uložit</button>':''}</article>`).join('')}</div><p data-empty hidden role="status">Žádné odpovídající výsledky.</p></section>`;
}

function draftForm(title,fields){
  const formFields=fields.map(([label,type])=>`<label>${esc(label)}${Array.isArray(type)?`<select name="${esc(label)}" required>${type.map(item=>`<option>${esc(item)}</option>`).join('')}</select>`:type==='textarea'?'<textarea name="Popis práce" maxlength="1000"></textarea>':`<input name="${esc(label)}" type="${type}" required ${type==='number'?'min="1" max="20"':type==='text'?'maxlength="80"':''}>`}</label>`).join('');
  return `<form data-demo-inquiry>${formFields}<label>E-mail<input type="email" name="E-mail" maxlength="254" required></label><button>${esc(title)}</button><p role="status">Ukázka · údaje zůstávají v tomto okně.</p><pre hidden></pre></form>`;
}

function activateIndustry(){
  for(const form of document.querySelectorAll('[data-demo-inquiry]')){
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const summary=form.querySelector('pre');
      summary.textContent=Array.from(new FormData(form),([key,value])=>key+': '+value).join('\n');
      summary.hidden=false;
      form.querySelector('[role=status]').textContent='Ukázkový návrh je připraven. Nic nebylo odesláno.';
    });
  }
  for(const section of document.querySelectorAll('[data-catalogue]')){
    const rows=[...section.querySelectorAll('[data-row]')];
    let saved=[];
    try{const value=JSON.parse(localStorage.getItem('forma-demo-favorites')||'[]');if(Array.isArray(value))saved=value;}catch{}
    const render=()=>{
      const query=section.querySelector('[data-search]').value.toLocaleLowerCase('cs');
      const kind=section.querySelector('[data-category]').value;
      const budget=section.querySelector('[data-budget]')?.value;
      const onlySaved=section.querySelector('[data-only-saved]')?.checked;
      for(const row of rows){
        const favorite=saved.includes(row.dataset.title);
        row.hidden=!row.textContent.toLocaleLowerCase('cs').includes(query)||
          Boolean(kind&&row.dataset.kind!==kind)||Boolean(budget&&Number(row.dataset.price)>Number(budget))||
          Boolean(onlySaved&&!favorite);
        const toggle=row.querySelector('[data-save]');
        if(toggle){toggle.setAttribute('aria-pressed',String(favorite));toggle.textContent=favorite?'Odebrat z oblíbených':'Uložit';}
      }
      const sort=section.querySelector('[data-sort]')?.value;
      if(section.querySelector('[data-sort]')){
        const ordered=sort?[...rows].sort((a,b)=>(sort==='asc'?1:-1)*(Number(a.dataset.price)-Number(b.dataset.price))):rows;
        section.querySelector('.industry-items').replaceChildren(...ordered);
      }
      section.querySelector('[data-empty]').hidden=rows.some(row=>!row.hidden);
    };
    section.addEventListener('input',render);
    section.addEventListener('click',event=>{
      const row=event.target.closest('[data-save]')?.closest('[data-row]');
      if(!row)return;
      const title=row.dataset.title;
      saved=saved.includes(title)?saved.filter(item=>item!==title):[...saved,title];
      try{localStorage.setItem('forma-demo-favorites',JSON.stringify(saved));}catch{}
      render();
    });
    render();
  }
}
export const industryScript=`<script>(${activateIndustry.toString()})();</script>`;
