import {features} from './editorial-v6.js';
import {demos,plans,formatCZK} from './data.js';
const demoGrid=document.querySelector('#demo-grid');
if(demoGrid){
  const concepts=Object.values(demos);
  const sectors={cafe:'Pohostinství',hotel:'Pohostinství',electric:'Služby',wellness:'Wellness',
    realty:'Reality',timo:'E-commerce',dental:'Zdravotnictví',blackline:'Automotive',bloom:'Maloobchod',signal:'Software'};
  const filters=document.querySelector('#sector-filter');
  let activeSector='';
  const search=document.querySelector('#project-search');
  function show(sector=activeSector){
    activeSector=sector;
    const query=search.value.trim().toLocaleLowerCase('cs');
    demoGrid.innerHTML=concepts.filter(d=>(!sector||sectors[d.id]===sector)&&[d.name,d.short,sectors[d.id]].join(' ').toLocaleLowerCase('cs').includes(query)).map(d=>`<article class="demo-card"><a href="work.html?demo=${d.id}"><img src="assets/showcase/${d.id}.jpg" alt="Snímek webu ${d.name}" width="1440" height="960" loading="lazy"></a><div class="demo-card-body"><span class="eyebrow">${sectors[d.id]} · ${d.id==='timo'?'Neoficiální koncept':'Fiktivní demo'}</span><h3>${d.name}</h3><p>${d.short}</p><div class="demo-card-links"><a href="sites/${d.id}/index.html">Otevřít web ↗</a><a href="sites/${d.id}/${features[d.id][0]}/index.html">Detail ↗</a><a href="builder.html?site=${d.id}">Upravit v editoru ↗</a></div></div></article>`).join('');
  }
  function choices(container,values,onSelect){
    container.replaceChildren(...values.map(([value,label],index)=>{
      const button=document.createElement('button');
      button.textContent=label;
      button.setAttribute('aria-pressed',String(index===0));
      button.addEventListener('click',()=>{
        container.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
        onSelect(value);
      });
      return button;
    }));
  }
  choices(filters,[['','Vše'],...[...new Set(Object.values(sectors))].map(x=>[x,x])],show);
  choices(document.querySelector('#agency-switch'),['timo','cafe','dental','hotel','bloom','signal'].map(id=>[id,demos[id].name]),id=>{
    const img=document.querySelector('#agency-screenshot');
    img.src='assets/showcase/'+id+'.jpg';
    img.alt=demos[id].name+' — snímek webu';
    document.querySelector('#agency-active').href='sites/'+id+'/index.html';
  });
  search.addEventListener('input',()=>show());
  show('');
}

let payment='monthly';const pricing=document.querySelector('#pricing-cards');
function renderPricing(){if(!pricing)return;pricing.innerHTML=plans.map((p,i)=>`<article class="price-card ${i===1?'highlight':''}"><small>${i===1?'NEJČASTĚJŠÍ VOLBA':'NAVRŽENÝ BALÍČEK'}</small><h3>${p.name}</h3><p>${p.desc}</p><div class="price-big">${formatCZK(payment==='monthly'?p.monthly:p.buy)} <small>${payment==='monthly'?'/ měsíc':'jednorázově'}</small></div><div class="price-sub">${payment==='monthly'?`Zavedení ${formatCZK(p.setup)} · min. ${p.months} měsíců`:`Péče a hosting volitelně od ${formatCZK(p.care)}/měs.`}</div><ul>${[p.one,...p.features].map(x=>`<li>${x}</li>`).join('')}</ul><a class="btn ${i===1?'btn-gold':'btn-outline'}" href="contact.html?plan=${p.id}&mode=${payment}">Poptat ${p.name} ↗</a></article>`).join('');}
renderPricing();document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{payment=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderPricing();}));
const toggle=document.querySelector('.mobile-nav-toggle'),nav=document.querySelector('#mainnav');toggle?.addEventListener('click',()=>{let open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}));
