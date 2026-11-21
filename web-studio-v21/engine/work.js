import{work,demos}from'./data.js';
const p=new URLSearchParams(location.search),demo=Object.hasOwn(demos,p.get('demo'))?demos[p.get('demo')]:null,w=work.find(w=>w.id===p.get('site'))||work[0];
const $=id=>document.getElementById(id);if(demo){
  document.title=demo.name+' · DTMates Web Studio';
  $('case-title').textContent=demo.name;
  $('case-lead').textContent=demo.description;
  $('case-kind').textContent='Ukázkový web';
  $('case-note').textContent='Demonstrační obsah a pracovní postupy.';
  const img=new Image(1440,960);
  img.src='assets/showcase/'+demo.id+'.jpg';
  img.alt='Snímek webu '+demo.name;
  img.style.cssText='display:block;width:100%;height:auto';
  $('case-visual').replaceChildren(img);
  $('case-actions').innerHTML=`<a class="btn btn-gold" href="sites/${demo.id}/index.html">Otevřít web ↗</a><a class="btn btn-outline" href="builder.html?site=${demo.id}">Upravit v editoru ↗</a>`;
}else{
$('case-title').textContent=w.title;$('case-lead').textContent=w.text;$('case-kind').textContent=w.kind;$('case-note').textContent=w.note;
$('case-features').innerHTML=w.features.map(f=>`<span>${f}</span>`).join('');
const art=$('case-visual');art.classList.add(w.id==='timo'?'timo-art':w.id==='agile-energy'?'energy-art':'agile-art');
art.innerHTML=`<div class="mini-domain">${w.id==='timo'?'AUTORSKÝ KONCEPT':'VEŘEJNĚ DOSTUPNÝ WEB'}</div><h2>${w.id==='agile-europe'?'Mezinárodní web.<br><i>Jazyk bez hranic.</i>':w.id==='agile-energy'?'Průmyslová energie.<br><i>Čistý směr.</i>':'Módní obchod.<br><i>Nová zkušenost.</i>'}</h2><div class="note" style="position:relative;z-index:1;max-width:500px;background:#09251db3">Ilustrační grafika v tomto balíčku není screenshotem skutečného klientského nasazení.</div>`;
$('case-actions').innerHTML=`<a class="btn btn-gold" href="${w.id==='timo'?'sites/timo/index.html':w.url}" ${w.id==='timo'?'':'target="_blank" rel="noopener noreferrer"'}>${w.id==='timo'?'Otevřít koncept':'Otevřít živý web'} ↗</a><a class="btn btn-outline" href="index.html#work">Zpět na projekty</a>`;
if(w.id==='agile-europe'||w.id==='agile-energy'){
  const europe=w.id==='agile-europe';
  art.innerHTML=europe
    ? '<h2>Agile Europe</h2><p>Veřejný web a samostatná lokalizační implementace v SvelteKit.</p><p><a href="https://www.agile-europe.com/">English</a> · <a href="https://www.agile-europe.com/cs/">Česky</a> · <a href="https://www.agile-europe.com/ar/" lang="ar">العربية</a> · <a href="https://www.agile-europe.com/contact">Contacts</a></p>'
    : '<h2>Agile Energy</h2><p>Veřejná prezentace ve Webflow a samostatný vývojový prototyp.</p><p><a href="https://www.agile-energy.cz/">Česky</a> · <a href="https://www.agile-energy.cz/en">English</a></p>';
  art.insertAdjacentHTML('beforeend',europe
    ? '<details><summary>Veřejný web</summary><p>Ověřeny česká, anglická a arabská cesta, zprava doleva v arabštině a odkaz na mapu. Úvod používá obrazovou prezentaci.</p></details><details><summary>Samostatná implementace SvelteKit</summary><p>Revize e1903b5 obsahuje řízení směru textu, výběr regionální kanceláře, mapový iframe a volitelné vložené video.</p></details>'
    : '<details><summary>Veřejný web ve Webflow</summary><p>Ověřena česká úvodní stránka na desktopu i mobilu a dostupnost anglické cesty.</p></details><details><summary>Lokální prototyp SvelteKit</summary><p>Zdroj obsahuje lokalizovanou úvodní stránku a obrazovou prezentaci. Historie nasazení prototypu není doložena.</p></details>');
  $('case-note').textContent=europe
    ? 'Veřejný web uvádí Liquid Design. Historie samostatného projektu SvelteKit obsahuje úpravy pod jménem DTMates. Nasazení této verze nebylo doloženo.'
    : 'Vývojový prototyp nemá doložené propojení s publikovaným Webflow webem.';
}
if(w.id==='timo')$('timo-panel').hidden=false;

}
