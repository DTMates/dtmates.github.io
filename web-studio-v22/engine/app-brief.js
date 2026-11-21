// Local app inquiry builder. No network, persistent storage, telemetry or credential collection.
const form=document.getElementById('app-brief-form');
if(form){
 const status=document.getElementById('app-brief-status');
 const output=document.getElementById('app-brief-output');
 form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const fields=new FormData(form);
  const app={
   format:'dtmates-app-brief-v1',
   project:String(fields.get('project')||'').trim().slice(0,120),
   platform:String(fields.get('platform')||''),
   ownership:String(fields.get('ownership')||''),
   data:String(fields.get('data')||''),
   features:String(fields.get('features')||''),
   care:String(fields.get('care')||''),
   requirements:String(fields.get('description')||'').trim().slice(0,2500),
   note:'Preliminary brief. No payment, account registration or order submitted. Quote and ownership terms must be confirmed by contract.'
  };
  const summary=[
   'DTMates · Zadání mobilní aplikace',
   'Projekt: '+app.project,
   'Platforma: '+app.platform,
   'Model vlastnictví: '+app.ownership,
   'Data: '+app.data,
   'Funkce: '+app.features,
   'Servis: '+app.care,
   'Popis: '+app.requirements,
   '---',
   'Žádná data nebyla odeslána. Náklady vývoje, publikační účty a servis jsou předmětem samostatné nabídky.'
  ].join('\n');
  output.textContent=summary;
  output.hidden=false;
  const blob=new Blob([JSON.stringify(app,null,2)+'\n'],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;
  link.download='DTMates-App-Brief-'+(app.project.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').slice(0,42)||'project')+'.json';
  document.body.append(link);link.click();link.remove();
  URL.revokeObjectURL(url);
  status.textContent='Zadání bylo připraveno k uložení ve vašem prohlížeči. Nic jsme neposlali na server.';
  output.focus?.();
 });
}
