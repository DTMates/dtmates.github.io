const labels={
  cs:['Služba','Varianta','Typ objektu','Jméno','E-mail','Rozsah práce','Preferované datum','Lokalita','Odjezd','Poznámka','Krok','Připravit přehled','Zpět','Pokračovat','Připravit ukázkovou poptávku','Údaje zůstávají v tomto okně.','Ukázkový přehled je připraven.'],
  en:['Service','Option','Property type','Name','Email','Scope of work','Preferred date','Location','Check-out','Notes','Step','Review your request','Back','Continue','Prepare demo request','Your details stay in this window.','Your demo request is ready to review.'],
  ar:['الخدمة','الخيار','نوع العقار','الاسم','البريد الإلكتروني','نطاق العمل','التاريخ المفضل','الموقع','المغادرة','ملاحظات','الخطوة','راجع طلبك','رجوع','متابعة','إعداد طلب تجريبي','تبقى بياناتك في هذه النافذة.','طلبك التجريبي جاهز للمراجعة.']
};
const choices={
  signal:[['Small team','Multiple teams'],['فريق صغير','عدة فرق']],
  electric:[['Apartment','House','Commercial space'],['شقة','منزل','مساحة تجارية']],
  wellness:[['30 minutes','60 minutes','90 minutes'],['٣٠ دقيقة','٦٠ دقيقة','٩٠ دقيقة']],
  realty:[['In person','Video call'],['حضورياً','مكالمة فيديو']],
  dental:[['First visit','Check-up','Dental hygiene'],['زيارة أولى','فحص','تنظيف الأسنان']],
  blackline:[['Compact','Sedan','SUV'],['مدمجة','سيدان','دفع رباعي']],
  hotel:[['1 guest','2 guests','3 guests','4 guests'],['ضيف واحد','ضيفان','ثلاثة ضيوف','أربعة ضيوف']],
  bloom:[['Small bouquet','Medium bouquet','Large bouquet'],['باقة صغيرة','باقة متوسطة','باقة كبيرة']]
};
export function inquiryText(locale,id,localOptions){
  return {labels:labels[locale],options:locale==='cs'?localOptions:choices[id][locale==='en'?0:1]};
}
