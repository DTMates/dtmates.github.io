import {campaigns} from '../assets/img/campaign/manifest.js';
import {demos} from '../data.js';

const labels={
 cafe:['Interiér kavárny v ranním světle','Café interior in morning light','داخل المقهى في ضوء الصباح'],
 blackline:['Grafitové kupé v detailingovém studiu','Graphite coupé in a detailing studio','سيارة كوبيه رمادية في استوديو العناية'],
 hotel:['Hotelový salon s vysokými okny','Hotel salon with tall windows','صالة الفندق بنوافذ عالية'],
 wellness:['Klidná místnost s lehátkem','Quiet treatment room with a linen-covered table','غرفة جلسات هادئة بطاولة مغطاة بالكتان'],
 realty:['Moderní dům za zahradou','Contemporary house beyond a garden','منزل معاصر خلف الحديقة'],
 electric:['Technik v dílně u rozvaděče','Technician by an enclosure in the workshop','فني بجانب خزانة كهرباء في الورشة'],
 dental:['Recepce a chodba kliniky','Clinic reception and corridor','استقبال العيادة والممر'],
 bloom:['Barevné květiny v modré váze','Colourful flowers in a blue vase','أزهار ملونة في مزهرية زرقاء'],
 courtyard:['Křesla u francouzských oken do dvora','Chairs by the French windows overlooking the courtyard','مقعدان بجوار النوافذ المطلة على الفناء'],
 garden:['Smrkové a prosklené průčelí ze zahrady','Timber and glass elevation from the garden','واجهة خشبية وزجاجية من الحديقة'],
 timo:['Krajka a satén v módním zátiší','Lace and satin in a fashion still life','دانتيل وستان في صورة أزياء'],
};
const file=(id,variant)=>'assets/img/campaign/'+id+'-'+variant+'.jpg';
const variants=id=>campaigns[id]?['wide','medium','portrait'].map(variant=>file(id,variant)):[];
export const campaignPaths=id=>[...variants(id),...variants({hotel:'courtyard',realty:'garden'}[id])];
export const hasCampaign=project=>Boolean(campaigns[project.id]&&demos[project.id].image===project.hero);
export function campaignArt(project,locale,resolve,e){
 if(!hasCampaign(project))return '';
 return editorialPicture(project.id,locale,resolve,e);
}
export function editorialPicture(id,locale,resolve,e){
 const entry=campaigns[id];
 if(!entry)return '';
 const path=variant=>e(resolve(file(id,variant)));
 const alt=e(labels[id][['cs','en','ar'].indexOf(locale)]);
 return `<picture class="campaign-picture"><source media="(max-width: 640px)" srcset="${path('portrait')}" width="${entry.portrait}" height="${Math.floor(entry.portrait*1.25)}"><img src="${path('medium')}" srcset="${path('medium')} ${entry.medium}w, ${path('wide')} ${entry.wide}w" sizes="${['hotel','blackline','courtyard','garden'].includes(id)?'100vw':'(min-width: 1450px) 850px, 60vw'}" width="${entry.width}" height="${entry.height}" alt="${alt}" fetchpriority="high" decoding="async"></picture>`;
}
