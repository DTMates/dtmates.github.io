/* V19 authentic case studies: interactions use existing project-owned real captures only.
   Historical PawMaster product evidence is not a screenshot. No data sent/stored. */
const reduced19=matchMedia('(prefers-reduced-motion: reduce)').matches;
for(const story of document.querySelectorAll('[data-proof19-story]')){
 const tabs=[...story.querySelectorAll('[data-proof19-tab]')],screen=story.querySelector('[data-proof19-image]'),
  frame=story.querySelector('.proof19-frame'),visit=story.querySelector('[data-proof19-visit]'),
  caption=story.querySelector('.proof19-meta-copy [data-proof19-caption]'),count=story.querySelector('[data-proof19-counter]'),
  timeline=story.querySelector('.proof19-timeline-track'),play=story.querySelector('[data-proof19-play]'),full=story.querySelector('[data-proof19-full]');
 let current=0,interval=null;
 function stop(){
  if(interval!==null){clearInterval(interval);interval=null}
  if(play){play.setAttribute('aria-pressed','false');play.textContent='▶ Spustit průvodce'}
 }
 function select(index){
  if(!tabs.length)return;
  const position=(index+tabs.length)%tabs.length,button=tabs[position],source=button.dataset.proof19Src;
  current=position;
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===position));tab.tabIndex=i===position?0:-1});
  if(screen&&source&&screen.getAttribute('src')!==source){
   frame?.classList.add('is-changing');
   screen.src=source;
   screen.alt=button.dataset.proof19Alt||'Autentický zdrojový obrázek lokálního projektu';
   if(frame)frame.classList.toggle('proof19-frame--phone',button.dataset.proof19Shape==='phone');
   screen.decode?.().catch(()=>{}).finally(()=>frame?.classList.remove('is-changing'));
  }
  if(caption)caption.textContent=button.dataset.proof19Caption||'';
  if(full&&source)full.href=source;
  if(visit&&button.dataset.proof19Href){visit.href=button.dataset.proof19Href;visit.textContent=button.dataset.proof19Cta||'Otevřít fungující projekt ↗'}
  if(count)count.textContent=String(position+1).padStart(2,'0')+' / '+String(tabs.length).padStart(2,'0');
  if(timeline)timeline.style.setProperty('--proof-step',String((position+1)/tabs.length));
  if(screen)screen.closest('[role=tabpanel]')?.setAttribute('aria-labelledby',button.id);
 }
 tabs.forEach((button,i)=>{
  button.addEventListener('click',()=>{stop();select(i)});
  button.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();
   const to=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
   stop();select(to);tabs[to].focus();
  });
 });
 story.querySelector('[data-proof19-prev]')?.addEventListener('click',()=>{stop();select(current-1)});
 story.querySelector('[data-proof19-next]')?.addEventListener('click',()=>{stop();select(current+1)});
 play?.addEventListener('click',()=>{
  if(interval!==null){stop();return}
  if(reduced19){play.textContent='Pohyb je vypnutý v nastavení zařízení';play.disabled=true;return}
  play.setAttribute('aria-pressed','true');play.textContent='Ⅱ Zastavit průvodce';
  interval=setInterval(()=>{if(document.hidden){stop();return}select(current+1)},5200);
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
 select(0);
}
/* Honest motion for local case sections: visible without JS, no hiding content permanently. */
if(!reduced19&&'IntersectionObserver' in window){
 const elements=[...document.querySelectorAll('.proof19 [data-reveal19],.v17-timo-journey .v17-timo-journey-gallery>a,.v17-proof-screens figure,.v15-paw-phone-card,.v16-paw-trainer-grid>.v16-paw-lesson,.v10-case-metrics-grid>div')];
 elements.forEach(el=>el.setAttribute('data-reveal19',''));
 if(elements.length){
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible19');observer.unobserve(entry.target)}
  },{rootMargin:'0px 0px -8% 0px',threshold:.08});
  document.documentElement.classList.add('motion19-ready');
  elements.forEach(el=>{
   if(el.getBoundingClientRect().top<innerHeight*.92)el.classList.add('is-visible19');
   else observer.observe(el);
  });
 }
}
