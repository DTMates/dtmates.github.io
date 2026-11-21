/* V11 client-side presentation interactions. This file has no network calls and collects no personal data. */
const v11 = (selector,root=document)=>root.querySelector(selector);
const v11all=(selector,root=document)=>[...root.querySelectorAll(selector)];
function chooseAppTab(id){
 for(const button of v11all('[data-app-tab]'))button.setAttribute('aria-pressed',String(button.dataset.appTab===id));
 for(const panel of v11all('[data-app-panel]'))panel.hidden=panel.dataset.appPanel!==id;
}
v11all('[data-app-tab]').forEach(button=>button.addEventListener('click',()=>chooseAppTab(button.dataset.appTab)));
if(v11all('[data-app-tab]').length)chooseAppTab('profile');

function switchWebBilling(mode){
 const current=mode==='once'?'once':'monthly';
 for(const button of v11all('[data-web-model]'))button.setAttribute('aria-pressed',String(button.dataset.webModel===current));
 for(const card of v11all('.v11-web-tier')){
  const price=v11('.v11-display-price',card);
  const label=current==='once'?price.dataset.oncePrice:price.dataset.monthPrice;
  const pieces=label.split(' / ');
  price.replaceChildren(document.createTextNode(pieces[0]));
  if(pieces.length>1){
   const unit=document.createElement('small');unit.textContent=' / '+pieces.slice(1).join(' / ');
   price.append(' ',unit);
  }
  const note=v11('.v11-set-up',card);
  note.textContent=current==='once'?note.dataset.onceNote:note.dataset.monthNote;
  const care=v11('.v11-tier-care',card);
  care.textContent=current==='once'?care.dataset.onceCare:care.dataset.monthCare;
  const link=v11('.v11-web-tier>a',card);
  if(link){
   const destination=new URL(link.href,location.href);
   destination.searchParams.set('mode',current);
   link.href=destination.toString();
  }
 }
 try{sessionStorage.setItem('dtmates-web-billing-v11',current)}catch{}
}
v11all('[data-web-model]').forEach(button=>button.addEventListener('click',()=>switchWebBilling(button.dataset.webModel)));
if(v11all('[data-web-model]').length){
 let mode='monthly';
 try{mode=sessionStorage.getItem('dtmates-web-billing-v11')||'monthly'}catch{}
 switchWebBilling(mode);
}
// Footnote: pricing and technical care allowances are commercial proposals, not automatic guarantees.
