// V14: Real embedded, same-origin working showcases. This is not a screenshot carousel.
const labTabs=[...document.querySelectorAll('[data-v14-demo]')];
const frame=document.getElementById('v14-live-frame');
const browser=document.querySelector('.v14-live-browser');
const liveDevice=document.querySelector('.v14-live-device');
const address=document.getElementById('v14-browser-address');
const openExample=document.getElementById('v14-open-example');
const publicSource=document.getElementById('v14-public-source');
const caption=document.getElementById('v14-demo-caption');
const devices=[...document.querySelectorAll('[data-v14-size]')];
const demos={
  timo:{
    path:'sites/timo/',
    label:'FORME · Neoficiální funkční e-shop koncept',
    description:'FORME je neoficiální funkční demo, nikoli provozovatelův současný e-shop.',
    publicUrl:'#',
    publicLabel:'Oficiální web značky (externě) ↗'
  },
  agile:{
    path:'work/agile-europe/',
    label:'Agile Europe · Transparentní případová studie',
    description:'Zobrazuje naši lokální případovou studii s vlastním grafickým motivem, nikoli kopii živého firemního webu. Autorství originálního webu není přisuzováno studiu.',
    publicUrl:'https://www.agile-europe.com/',
    publicLabel:'Oficiální web Agile Europe (externě) ↗'
  },
  pawmaster:{
    path:'work/pawmaster/',
    label:'PawMaster · Vlastní mobilní projektová studie',
    description:'Prohlížíte původní konceptové UI profilu, lekcí a pokroku, nikoli skutečný screenshot vydané aplikace. Aktuální dostupnost v Google Play není potvrzena.',
    publicUrl:null,publicLabel:null
  }
};
const urlFor=path=>new URL(path,import.meta.url).href;
let current='timo';
function setExample(id){
 const item=demos[id];if(!item||!frame)return;
 current=id;
 labTabs.forEach(tab=>{
   const selected=tab.dataset.v14Demo===id;
   tab.setAttribute('aria-selected',String(selected));
   tab.tabIndex=selected?0:-1;
 });
 if(browser)browser.dataset.v14Brand=id;
 frame.title='Funkční lokální náhled: '+item.label;
 const url=urlFor(item.path);
 if(frame.src!==url)frame.src=url;
 if(address)address.textContent='/'+item.path;
 if(openExample){openExample.href=url;openExample.textContent='Otevřít celou ukázku ↗'}
 if(caption)caption.textContent=item.description;
 if(publicSource){
   publicSource.hidden=!item.publicUrl;
   if(item.publicUrl){publicSource.href=item.publicUrl;publicSource.textContent=item.publicLabel}
 }
}
function setSize(size){
 if(!browser)return;
 const mobile=size==='mobile';
 browser.classList.toggle('is-mobile',mobile);
 devices.forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.v14Size===size)));
}
labTabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>setExample(tab.dataset.v14Demo));
 tab.addEventListener('keydown',e=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
   e.preventDefault();
   const i=e.key==='Home'?0:e.key==='End'?labTabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+labTabs.length)%labTabs.length;
   labTabs[i].click();labTabs[i].focus();
 });
});
devices.forEach(btn=>btn.addEventListener('click',()=>setSize(btn.dataset.v14Size)));
if(frame){
 frame.addEventListener('load',()=>{if(browser)browser.classList.add('has-loaded')});
 setExample('timo');
 setSize('desktop');
}
