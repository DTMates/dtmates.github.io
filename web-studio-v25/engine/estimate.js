import {readQuote,quoteParams,quoteOptions} from './quote.js';
import {plans,formatCZK} from './data.js';

export const additions={page:1650,language:3200,gallery:1900,booking:4600,shop:12500};
export function estimate(input={}){
  const plan=plans.find(item=>item.id===input.tier)||plans[0];
  const mode=input.mode==='once'?'once':'monthly';
  const bounded=(value,min,max,fallback)=>{
    const parsed=Number(value);
    return value===undefined||value===null||value===''||!Number.isFinite(parsed)?fallback:Math.max(min,Math.min(max,Math.trunc(parsed)));
  };
  const pages=bounded(input.pages,1,60,1);
  const languages=bounded(input.languages,1,3,1);
  const months=bounded(input.months,1,36,plan.months);
  const extraPages=plan.pagesIncluded===null?0:Math.max(0,pages-plan.pagesIncluded);
  const extraLanguages=Math.max(0,languages-plan.languagesIncluded);
  const extras=[];
  if(extraPages)extras.push({label:'Stránky nad rámec balíčku',count:extraPages,unit:additions.page});
  if(extraLanguages)extras.push({label:'Další jazyky',count:extraLanguages,unit:additions.language});
  for(const key of ['gallery','booking','shop']){
    if(input[key]===true&&!plan.included.includes(key))extras.push({label:quoteOptions[key],count:1,unit:additions[key]});
  }
  const initial=(mode==='monthly'?plan.setup:plan.buy)+extras.reduce((total,row)=>total+row.count*row.unit,0);
  const monthly=mode==='monthly'?plan.monthly:input.care===true?plan.care:0;
  return {initial,monthly,total:initial+monthly*months,months,extras,extraPages,extraLanguages,
    negotiated:plan.pagesIncluded===null||input.integration===true||input.shop===true};
}
const form=globalThis.document?.querySelector('#estimator');
if(form){
  const update=()=>{
    const fields=new FormData(form);
    const normalized=new URLSearchParams({plan:fields.get('tier'),mode:fields.get('mode'),
      pages:fields.get('pages'),languages:fields.get('languages'),scope:'total'});
    for(const key of Object.keys(quoteOptions))if(fields.has(key))normalized.set(key,'1');
    const quote=readQuote(normalized);
    const value=estimate(quote);
    form.querySelector('output').textContent=formatCZK(value.initial)+' při zahájení + '+formatCZK(value.monthly)+' měsíčně';
    form.querySelector('a').href='contact.html?'+quoteParams(quote);
  };
  form.addEventListener('input',update);
  update();
}
