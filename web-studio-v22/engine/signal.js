const data=[
  ['Mon',31,6],['Tue',42,9],['Wed',38,7],['Thu',55,12],['Fri',47,10],['Sat',62,14],['Sun',58,13]
];
export const signalCatalogue=data.map(([name,activity,done])=>[name,done,activity,''].join(' | '));
const translations={
  cs:['Provozní přehled','Ukázková data','Období','7 dní','3 dny','Aktivita','Dokončeno','Řadit podle aktivity','Přehled','Ukázka'],
  en:['Operations overview','Fictional data','Period','7 days','3 days','Activity','Completed','Sort by activity','Overview','Demo'],
  ar:['نظرة عامة على العمليات','بيانات خيالية','الفترة','٧ أيام','٣ أيام','النشاط','مكتمل','ترتيب حسب النشاط','نظرة عامة','عرض']
};
function activate(){
  document.querySelectorAll('[data-signal]').forEach(board=>{
    const period=board.querySelector('select');
    const sort=board.querySelector('[data-signal-sort]');
    const metric=board.querySelector('[data-signal-metric]');
    const metricLabel=board.querySelector('[data-signal-metric-label]');
    const list=board.querySelector('tbody');
    const rows=[...list.rows];
    const total=board.querySelector('output');
    const chart=[...board.querySelectorAll('[data-bar]')];
    const details=board.querySelector('[data-signal-detail]');
    const numbers=new Intl.NumberFormat(document.documentElement.lang);
    const defaultDetail=details.textContent;
    const empty=board.querySelector('[data-signal-empty]');
    for(const [index,bar] of chart.entries())bar.addEventListener('click',()=>{
      chart.forEach(item=>item.setAttribute('aria-pressed',String(item===bar)));
      const row=rows[index];
      details.textContent=row.cells[0].textContent+' · '+board.dataset.activityLabel+' '+numbers.format(+row.dataset.activity)+' · '+board.dataset.doneLabel+' '+numbers.format(+row.dataset.done);
    });
    function update(){
      const visible=rows.slice(-Number(period.value));
      const key=metric.getAttribute('aria-pressed')==='true'?'done':'activity';
      const max=Math.max(1,...visible.map(row=>Number(row.dataset[key])));
      metricLabel.textContent=key==='done'?board.dataset.doneLabel:board.dataset.activityLabel;
      const ordered=sort.getAttribute('aria-pressed')==='true'
        ? [...visible].sort((a,b)=>Number(b.dataset.activity)-Number(a.dataset.activity))
        : visible;
      chart.forEach((bar,index)=>{
        bar.hidden=!visible.includes(rows[index]);
        bar.style.setProperty('--bar',100*Number(rows[index].dataset[key])/max+'%');
        if(bar.hidden&&bar.getAttribute('aria-pressed')==='true'){bar.setAttribute('aria-pressed','false');details.textContent=defaultDetail;}
      });
      list.replaceChildren(...ordered);
      const count=visible.reduce((sum,row)=>sum+Number(row.dataset[key]),0);
      total.textContent=numbers.format(count);
      empty.hidden=count!==0;
      rows.forEach(row=>row.querySelector('meter').value=Number(row.dataset.activity));
    }
    period.addEventListener('change',update);
    metric.onclick=()=>{
      metric.setAttribute('aria-pressed',String(metric.getAttribute('aria-pressed')!=='true'));
      update();
    };
    sort.addEventListener('click',()=>{
      sort.setAttribute('aria-pressed',String(sort.getAttribute('aria-pressed')!=='true'));
      update();
    });
    update();
  });
}
export function signalDashboard(locale,catalogue=[]){
  const [title,note,period,seven,three,activity,done,sort]=translations[locale];
  const day=new Intl.DateTimeFormat(locale,{weekday:'short',timeZone:'UTC'});
  const local=data.map(([,activity,done],i)=>{
    const [,completed,count]=catalogue[i]?.split('|').map(v=>v.trim())||[];
    const metric=(v,fallback)=>v&&Number.isFinite(+v)?Math.min(10000,Math.max(0,Math.trunc(+v))):fallback;
    const value=metric(count,activity);
    return [day.format(new Date(Date.UTC(2026,6,6+i))),value,Math.min(value,metric(completed,done))];
  });
  const max=Math.max(1,...local.map(([,value])=>value));
  const prompt={cs:'Vyberte den v grafu pro další údaje.',en:'Select a day in the chart for its activity breakdown.',ar:'اختر يوماً في الرسم لعرض تفاصيل النشاط.'}[locale];
  const empty={cs:'Ve vybraném období není pro tuto metriku žádná aktivita.',en:'No activity for this metric in the selected period.',ar:'لا يوجد نشاط لهذا المقياس في الفترة المحددة.'}[locale];
  const numbers=new Intl.NumberFormat(locale);
  return `<section class="signal-board" data-signal data-activity-label="${activity}" data-done-label="${done}"><header><div><p>${note}</p><h2>${title}</h2></div><label>${period} <select><option value="7">${seven}</option><option value="3">${three}</option></select></label></header>
  <div class="signal-controls"><p class="signal-total"><output aria-live="polite">${numbers.format(local.reduce((total,[,value])=>total+value,0))}</output> <span data-signal-metric-label>${activity}</span></p><button type="button" data-signal-metric aria-pressed="false">${done}</button></div>
  <div class="signal-bars">${local.map(([label,value])=>`<button type="button" data-bar aria-pressed="false" style="--bar:${value/max*100}%"><b></b><small>${label}</small></button>`).join('')}</div>
  <p data-signal-empty role="status" hidden>${empty}</p>
  <p data-signal-detail aria-live="polite">${prompt}</p>
  <button type="button" data-signal-sort aria-pressed="false">${sort}</button>
  <table><thead><tr><th scope="col">${period}</th><th scope="col">${activity}</th><th scope="col">${done}</th></tr></thead><tbody>
  ${local.map(([label,activity,done])=>`<tr data-activity="${activity}" data-done="${done}"><th scope="row">${label}</th><td><meter min="0" max="${max}" value="${activity}" aria-hidden="true"></meter><span>${numbers.format(activity)}</span></td><td>${numbers.format(done)}</td></tr>`).join('')}
  </tbody></table></section>`;
}
export const signalRuntime=`<script>(${activate.toString()})();</script>`;
