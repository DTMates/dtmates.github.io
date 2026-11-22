const concept = (id,name,label,color,headline,subline,services) => ({
  id,type:id,name,label,color,contrast:'#ffffff',image:id==='bloom'?'assets/img/bloom-stems-v9.webp':'assets/img/'+id+(['hotel','blackline'].includes(id)?'-v5':'')+'.webp',
  short:subline[0],description:subline[0],about:subline[0],review:'',email:'',phone:'',
  address:'Praha · ukázkový koncept',cta:'Prozkoumat',
  headline:Object.fromEntries(['cs','en','ar'].map((l,i)=>[l,headline[i]])),
  subline:Object.fromEntries(['cs','en','ar'].map((l,i)=>[l,subline[i]])),services:services[0],
  translations:Object.fromEntries(['en','ar'].map((l,i)=>[l,{description:subline[i+1],about:subline[i+1],review:'',services:services[i+1],cta:i?'استكشف':'Explore'}]))
});
export const additions=[
  concept('dental','Nova Dental','Zdravotnictví','#2452de',
    ['Péče začíná rozhovorem.','Care starts with a conversation.','تبدأ الرعاية بالحوار.'],
    ['Klidná návštěva, jasný plán péče a prostor pro vaše otázky.','A calm visit, a clear care plan and time for your questions.','زيارة هادئة وخطة واضحة ووقت لأسئلتك.'],
    [['První návštěva','Preventivní péče','Dentální hygiena'],['First visit','Preventive care','Dental hygiene'],['الزيارة الأولى','الرعاية الوقائية','نظافة الأسنان']]),
  concept('blackline','Blackline Detailing','Automotive','#dbff58',
    ['Povrch pod kontrolou.','Surface under control.','السطح تحت السيطرة.'],
    ['Čištění, korekce a ochrana povrchu pro různé typy vozidel.','Cleaning, paint correction and surface protection, tailored to your vehicle.','تنظيف وتصحيح الطلاء وحماية السطح حسب نوع السيارة.'],
    [['Interiér','Korekce laku','Ochrana povrchu'],['Interior','Paint correction','Surface protection'],['المقصورة','تصحيح الطلاء','حماية السطح']]),
  concept('hotel','Atelier Hotel','Ubytování','#a58647',
    ['Noc v domě s příběhem.','A night in a house with a story.','ليلة في منزل له قصة.'],
    ['Komorní pokoje, pomalá rána a město za dveřmi.','Intimate rooms, slow mornings and the city on your doorstep.','غرف هادئة وصباح بطيء والمدينة على مقربة.'],
    [['Pokoj do dvora','Ateliér','Ranní stůl'],['Courtyard room','Atelier suite','Breakfast table'],['غرفة الفناء','جناح أتيليه','مائدة الإفطار']]),
  concept('bloom','Bloom Flower Studio','Květinářství','#6129b8',
    ['Květiny, které mají náladu.','Flowers with a mood.','زهور لكل مزاج.'],
    ['Sezónní kytice a workshopy ve studiu plném barev.','Seasonal bouquets and workshops in a studio full of colour.','باقات موسمية وورش عمل في استوديو مليء بالألوان.'],
    [['Sezónní kytice','Výrazné barvy','Květinový workshop'],['Seasonal bouquets','Bold colours','Flower workshop'],['باقات موسمية','ألوان جريئة','ورشة الزهور']]),
  {...concept('signal','Signal','Software','#3c66fa',
    ['Jasno v provozu.','See how work moves.','رؤية أوضح لسير العمل.'],
    ['Sledujte aktivitu týmu a dokončené úkoly v jednom přehledu.','Track team activity and completed work in one view.','تابع نشاط الفريق والعمل المكتمل في مكان واحد.'],
    [['Provozní přehled','Přehledy podle období','Aktivita týmu'],['Operations overview','Period reports','Team activity'],['نظرة عامة على العمليات','تقارير حسب الفترة','نشاط الفريق']]),image:''}

];
export const designPages={
 signal:[['product','Produkt','Product','المنتج'],['demo','Vyzkoušet','Try the demo','جرّب العرض'],['onboarding','Nastavit ukázku','Set up demo','إعداد العرض'],['pricing','Ceník','Pricing','الأسعار'],['contact','Kontakt','Contact','اتصل بنا']],
 cafe:[['menu','Menu','Menu','القائمة'],['about','Příběh','Our story','قصتنا'],['visit','Návštěva','Visit','الزيارة']],
 electric:[['services','Elektroinstalace','Electrical services','خدمات الكهرباء'],['services/installation','Elektroinstalace','Installation','التركيب'],['services/inspection','Kontrola','Assessment','التقييم'],['services/automation','Automatizace','Automation','الأتمتة'],['projects/apartment','Rekonstrukce bytu','Apartment renovation','تجديد شقة'],['contact','Kontakt','Contact','اتصل بنا'],['projects','Zakázky','Projects','المشاريع'],['request-quote','Poptávka','Get a quote','طلب عرض سعر'],['quote','Rychlý odhad','Quick estimate','تقدير سريع']],
 wellness:[['treatments','Procedury','Treatments','العلاجات'],['treatments/relaxation','Relaxační rituál','Relaxation ritual','طقوس الاسترخاء'],['treatments/back-neck','Záda a šíje','Back and neck','الظهر والرقبة'],['treatments/voucher','Dárkový poukaz','Gift voucher','قسيمة هدية'],['studio','Studio','Studio','الاستوديو'],['pricing','Ceník','Pricing','الأسعار'],['book','Rezervace','Book a treatment','الحجز'],['booking','Poptávka termínu','Booking inquiry','طلب حجز']],
 realty:[['properties','Nemovitosti','Properties','العقارات'],['properties/sample-apartment','Byt u parku','Parkside apartment','شقة قرب الحديقة'],['properties/garden-house','Dům se zahradou','Garden house','منزل مع حديقة'],['properties/terrace-loft','Podkroví s terasou','Terrace loft','علية مع شرفة'],['approach','Náš přístup','Our approach','نهجنا'],['contact','Prohlídka','Viewing','طلب معاينة'],['listings','Všechny nabídky','All listings','جميع العقارات'],['viewing','Poptávka prohlídky','Viewing inquiry','طلب معاينة']],
 timo:[['collections','Kolekce','Collections','المجموعات'],['search','Vyhledávání','Search','البحث'],['products/sample-product','Jemná krajka','Soft lace','دانتيل ناعم'],['products/lace','Krajková podprsenka','Lace bralette','حمالة دانتيل'],['products/swim','Dvoudílné plavky','Two-piece swimwear','ملابس سباحة من قطعتين'],['products/slip','Saténová košilka','Satin nightdress','قميص نوم ساتان'],['products/briefs','Krajkové kalhotky','Lace briefs','سروال من الدانتيل'],['products/wireless','Hladká podprsenka','Wireless bra','حمالة ناعمة'],['products/onepiece','Jednodílné plavky','One-piece swimsuit','ملابس سباحة'],['products/robe','Saténový župan','Satin robe','روب ساتان'],['products/mesh','Kalhotky s vysokým pasem','Mesh briefs','سروال شبكي'],['collections/lingerie','Prádlo','Lingerie','ملابس داخلية'],['collections/swim','Plavky','Swimwear','ملابس سباحة'],['collections/night','Noční prádlo','Nightwear','ملابس نوم'],['story','O konceptu','About the concept','عن التصور'],['sizes','Průvodce velikostí','Size guide','دليل المقاسات'],['wishlist','Oblíbené','Wishlist','المفضلة'],['cart','Košík','Bag','الحقيبة'],['checkout','Pokladna','Checkout','الدفع']],
 dental:[['treatments','Péče','Treatments','العلاجات'],['treatments/first-visit','První návštěva','First visit','الزيارة الأولى'],['treatments/prevention','Preventivní přehled','Preventive review','مراجعة وقائية'],['treatments/hygiene','Dentální hygiena','Dental hygiene','العناية بنظافة الأسنان'],['team','Tým','Team','الفريق'],['contact','Objednání','Appointments','المواعيد']],
 blackline:[['services','Služby','Services','الخدمات'],['services/interior','Detail interiéru','Interior detailing','تفاصيل المقصورة'],['services/paint','Korekce laku','Paint correction','تصحيح الطلاء'],['services/protection','Ochrana povrchu','Surface protection','حماية السطح'],['services/maintenance','Údržba','Maintenance','الصيانة'],['packages','Balíčky','Packages','الباقات'],['gallery','Galerie','Gallery','المعرض'],['request-quote','Poptávka','Get a quote','طلب عرض سعر']],
 hotel:[['rooms','Pokoje','Rooms','الغرف'],['rooms/courtyard','Pokoj do dvora','Courtyard room','غرفة الفناء'],['rooms/attic','Podkrovní pokoj','Attic Room','غرفة العلية'],['rooms/salon','Apartmá se salonem','Salon Suite','جناح بصالون'],['experiences','Zážitky','Experiences','التجارب'],['contact','Poptávka pobytu','Stay inquiry','طلب إقامة']],
 bloom:[['bouquets','Kytice','Bouquets','الباقات'],['bouquets/seasonal','Sezónní kytice','Seasonal bouquet','باقة موسمية'],['bouquets/wild','Luční vazba','Wild stems','باقة برية'],['bouquets/gift','Barevný dárek','Colour gift','هدية ملونة'],['studio','Ateliér','Studio','الاستوديو'],['bag','Košík','Bag','الحقيبة'],['workshops','Workshopy','Workshops','الورش'],['contact','Poptávka','Inquire','استفسار']]
};
