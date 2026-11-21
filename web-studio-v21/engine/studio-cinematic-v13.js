/* V13 real-browser enhancements for actual DTMates pages. No fake data, framework or telemetry. */
const railButtons=[...document.querySelectorAll('[data-v13-pick]')];
const mainPreview=[...document.querySelectorAll('[data-preview]')];
function syncV13Rail(){
 const current=mainPreview.find(x=>x.getAttribute('aria-pressed')==='true')?.dataset.preview;
 for(const button of railButtons)button.setAttribute('aria-pressed',String(button.dataset.v13Pick===current));
}
for(const [index,button] of railButtons.entries()){
 button.addEventListener('click',()=>{
  const real=mainPreview.find(x=>x.dataset.preview===button.dataset.v13Pick);
  real?.click();
  syncV13Rail();
 });
 button.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?railButtons.length-1:(index+(event.key==='ArrowRight'?1:-1)+railButtons.length)%railButtons.length;
  railButtons[next].click();railButtons[next].focus();
 });
}
mainPreview.forEach(button=>button.addEventListener('click',syncV13Rail));
if(mainPreview.length){
 const observer=new MutationObserver(syncV13Rail);
 mainPreview.forEach(button=>observer.observe(button,{attributes:true,attributeFilter:['aria-pressed']}));
 syncV13Rail();
}
const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!prefersReduced){
 const layers=[...document.querySelectorAll('.cin13-app-mini')];
 const stage=document.querySelector('.cin13-app-stage');
 if(stage&&layers.length&&window.matchMedia('(pointer:fine)').matches){
  let queued=false,mx=0,my=0;
  stage.addEventListener('pointermove',event=>{
   const r=stage.getBoundingClientRect();
   mx=(event.clientX-r.left)/r.width-.5;
   my=(event.clientY-r.top)/r.height-.5;
   if(queued)return;
   queued=true;
   requestAnimationFrame(()=>{
    layers.forEach((layer,i)=>{
     const factor=(i?1:-1)*9;
     layer.style.translate=(mx*factor).toFixed(1)+'px '+(my*factor).toFixed(1)+'px';
    });
    queued=false;
   });
  },{passive:true});
  stage.addEventListener('pointerleave',()=>layers.forEach(layer=>{layer.style.translate=''}));
 }
}
// Do not animate or add content to app profile/training/progress: these remain
// the existing real, accessible interactive illustrative state machine.


/* PawMaster case: real tab behavior for original conceptual UI; no client data. */
const tourTabs=[...document.querySelectorAll('[data-cin13-tour]')];
function setTour(key){
 if(!tourTabs.length)return;
 tourTabs.forEach(tab=>{
  const selected=tab.dataset.cin13Tour===key;
  tab.setAttribute('aria-selected',String(selected));
  tab.tabIndex=selected?0:-1;
 });
 document.querySelectorAll('[data-cin13-screen]').forEach(screen=>{
  screen.hidden=screen.dataset.cin13Screen!==key;
 });
}
tourTabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>setTour(tab.dataset.cin13Tour));
 tab.addEventListener('keydown',event=>{
  const keys=['ArrowLeft','ArrowRight','Home','End'];
  if(!keys.includes(event.key))return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?tourTabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tourTabs.length)%tourTabs.length;
  tourTabs[next].click();tourTabs[next].focus();
 });
});
if(tourTabs.length)setTour('profile');
