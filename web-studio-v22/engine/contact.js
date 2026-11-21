import {readQuote,quoteOptions} from './quote.js';
import {estimate} from './estimate.js';
import{plans,formatCZK}from'./data.js';const p=new URLSearchParams(location.search);if(plans.some(x=>x.id===p.get('plan')))document.querySelector('#lead-plan').value=p.get('plan');if(['monthly','once'].includes(p.get('mode')))document.querySelector('#lead-mode').value=p.get('mode');const $=id=>document.getElementById(id);
const scope=readQuote(p);
function details(){
  const current={...scope,tier:$('lead-plan').value,mode:$('lead-mode').value};
  const totals=estimate(current);
  return [
    'Stránky celkem: '+current.pages,'Jazyky celkem: '+current.languages,
    ...Object.entries(quoteOptions).filter(([key])=>current[key]).map(([,label])=>label),
    'Odhad zahájení: '+formatCZK(totals.initial),'Odhad měsíčně: '+formatCZK(totals.monthly)
  ].join(' · ');
}
function price(){ $('lead-scope').textContent=details();const x=plans.find(p=>p.id===$('lead-plan').value),monthly=$('lead-mode').value==='monthly';$('lead-amount').textContent=formatCZK(monthly?x.monthly:x.buy)+(monthly?' / měsíc':' jednorázově');$('lead-price-note').textContent=monthly?`Zavedení ${formatCZK(x.setup)} · délka a rozsah dle dohody.`:`Samostatné pořízení webu; provozní péče volitelně od ${formatCZK(x.care)}/měsíc.`;}document.querySelectorAll('#lead-mode,#lead-plan').forEach(el=>el.addEventListener('change',price));price();let text='';$('lead-form').addEventListener('submit',e=>{e.preventDefault();if(!$('lead-form').checkValidity()){e.target.reportValidity();return;}const plan=plans.find(p=>p.id===$('lead-plan').value);text=`Nezávazná poptávka webu\n\nFirma / jméno: ${$('lead-name').value}\nE-mail: ${$('lead-email').value}\nObor: ${$('lead-type').value}\nBalíček: ${plan.name}\nVarianta: ${$('lead-mode').value==='monthly'?'Měsíčně':'Jednorázově'}\n\nRozsah: ${details()}\n\nPotřeby webu:\n${$('lead-needs').value}\n\nPoznámka: orientační cena z ukázkového ceníku, konečný rozsah po domluvě.`;$('lead-result').hidden=false;$('lead-text').textContent=text;$('lead-status').textContent='Text vytvořen v prohlížeči. Nic nebylo odesláno.';$('lead-result').scrollIntoView({behavior:'smooth',block:'start'});});$('copy-lead').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(text);$('lead-status').textContent='Text zkopírován do schránky.';}catch{$('lead-status').textContent='Kopírování není povoleno; text lze vybrat ručně.';}});$('download-lead').addEventListener('click',()=>{let u=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='poptavka-webu.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),10000);});
