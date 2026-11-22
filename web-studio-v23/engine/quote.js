import {plans} from './data.js';
export const quoteOptions=Object.freeze({
 gallery:'Fotogalerie',booking:'Rezervační integrace',shop:'E-shop',integration:'Individuální integrace',care:'Volitelná péče'
});
function bounded(value,min,max,fallback){
 const number=Number(value);
 return value===null||value===''||!Number.isFinite(number)?fallback:Math.max(min,Math.min(max,Math.trunc(number)));
}
export function readQuote(params){
 const plan=plans.find(p=>p.id===params.get('plan'))||plans[0];
 const legacy=params.get('scope')!=='total';
 const toTotal=(key,allowance,max)=>legacy
   ? bounded(bounded(params.get(key),0,max,0)+allowance,1,max,1)
   : bounded(params.get(key),1,max,1);
 return {tier:plan.id,mode:params.get('mode')==='once'?'once':'monthly',
   pages:toTotal('pages',plan.pagesIncluded??1,60),languages:toTotal('languages',plan.languagesIncluded,3),
   months:bounded(params.get('months'),1,36,plan.months),
   ...Object.fromEntries(Object.keys(quoteOptions).map(key=>[key,params.get(key)==='1']))};
}
export function quoteParams(quote){
 return new URLSearchParams({plan:quote.tier,mode:quote.mode,pages:quote.pages,languages:quote.languages,months:quote.months??18,scope:'total',
   ...Object.fromEntries(Object.keys(quoteOptions).filter(key=>quote[key]).map(key=>[key,'1']))});
}
