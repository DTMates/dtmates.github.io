// Original editorial modules. Project copy, service rows and links stay editable.
const labels={
  cafe:['Dnes u nás','Dnes v nabídce','Today at MÍSTO','اليوم في ميستو'],
  electric:['Jak probíhá zakázka','Od zadání po předání','From scope to handover','من الطلب إلى التسليم'],
  wellness:['Rituály péče','Dopřejte si chvíli','Make time for yourself','خصص وقتاً لنفسك'],
  realty:['Výběr nemovitostí','Prostory k objevování','Spaces to discover','مساحات للاكتشاف'],
  timo:['Průvodce kolekcí','V čem se budete cítit dobře','Find your fit','اعثر على ما يناسبك'],
  dental:['Péče krok za krokem','Projděte možnosti péče','Explore your care options','استكشف خيارات الرعاية'],
  blackline:['Detailing','Vyberte typ zásahu','Choose a detailing service','اختر خدمة العناية'],
  hotel:['Ubytování a zážitky','Čas na pobyt','Make time to stay','وقت للإقامة'],
  bloom:['Co právě kvete','Sezónní výběr','In season now','اختيارات الموسم'],
  signal:['Signal','Od přehledu k rozhodnutí','From overview to decisions','من النظرة العامة إلى القرار']
};
export function brandOffer(id,locale,rows,primary,secondary,escape){
  const [label,cs,en,ar]=labels[id];
  const title={cs,en,ar}[locale];
  const list=rows.map((row,index)=>`<li>${['electric','dental','blackline','signal'].includes(id)?`<span aria-hidden="true">${String(index+1).padStart(2,'0')}</span>`:''}<strong>${escape(row)}</strong></li>`).join('');
  const header=`<header>${locale==='cs'?`<p>${label}</p>`:''}<h2>${title}</h2></header>`;
  return `<section class="ds-offer brand-offer brand-offer-${id}">${header}<ol>${list}</ol><div class="ds-actions">${primary}${secondary}</div></section>`;
}
