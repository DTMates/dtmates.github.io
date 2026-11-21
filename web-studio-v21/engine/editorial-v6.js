// [route, heading, introduction, [subheading, copy] ...]. Fictional concept copy.
export const features={
  cafe:['about','Ráno v MÍSTĚ','Nejdřív rozpálíme troubu. Pak nastavíme mlýnek, ochutnáme první espresso a otevřeme dveře do ulice.',
    ['U okna','Pro krátkou zastávku po cestě do práce. O víkendu se u velkého stolu podává brunch.'],
    ['Z pekáče','Jablečný koláč se skořicí a máslové pečivo. Na složení a alergeny se zeptejte při objednávce.']],
  timo:['products/sample-product','Jemný úplet','Krémový úplet s volnější siluetou a žebrovaným lemem. Ilustrační produkt nezávislého konceptu.',
    ['Střih a materiál','Ukázkový střih s volnějším ramenem. Pokud jste mezi velikostmi, porovnejte obvod hrudníku a délku rukávu.'],
    ['Péče a vrácení','Před praním zkontrolujte štítek. Košík slouží k vyzkoušení výběru velikosti a množství.']],
  blackline:['gallery','Odlesk pod kontrolou','Posuňte oddělovač a porovnejte stejný záběr se simulovaným zákalem povrchu.',
    ['Co porovnáváte','Ilustrace používá jeden zdrojový snímek. Zákal je vytvořen digitálně pro ukázku ovládání; nejde o výsledek zakázky.']],
  hotel:['rooms/courtyard','Pokoj do dvora','Ranní světlo prochází vysokými okny. Večer se pokoj obrací do klidného vnitrobloku.',
    ['Dispozice','Dvoulůžko, dvě křesla, pracovní stolek a vlastní koupelna. Pokoj je určen pro dva hosty.'],
    ['Příjezd','V poptávce uveďte termín, počet hostů a případné požadavky na přístupnost. Dostupnost se v ukázce nepotvrzuje.']],
  wellness:['treatments/relaxation','Rituál pomalého tempa','Šedesát minut péče s krátkou konzultací před začátkem. Intenzitu lze během návštěvy upravit.',
    ['Před návštěvou','Přijďte deset minut před termínem. Sdělte nám, pokud je vám některá poloha nepříjemná.'],
    ['Délka a cena','60 minut · 1 050 Kč. Cena je součástí demonstrační nabídky.']],
  realty:['properties/sample-apartment','Byt u parku','Dva pokoje a 58 m². Denní část míří do ulice, ložnice do klidného dvora. Byt i nabídka jsou fiktivní.',
    ['Dispozice','Kuchyně navazuje na jídelní stůl u okna. Vstupní chodba má místo pro vestavnou skříň.'],
    ['Okolí','Prohlídku lze v ukázce poptat osobně nebo přes videohovor. Park a služby v okolí jsou součástí ilustračního popisu.']],
  electric:['projects','Rekonstrukce bytového rozvaděče','Modelový případ rekonstrukce bytu, ve kterém se přidávaly samostatné okruhy pro kuchyň.',
    ['01 · Zaměření','Sepište plánované spotřebiče a přiložte popis současného rozvaděče.'],
    ['02 · Návrh a předání','Přehled okruhů a rozsah prací slouží jako podklady k nabídce. Po provedení následuje kontrola a dokumentace.']],
  dental:['treatments/first-visit','První návštěva v Nova Dental','Návštěva začíná rozhovorem o důvodu objednání a o tom, co od první schůzky očekáváte.',
    ['Co si připravit','Seznam užívaných léků, dostupnou dokumentaci a otázky, které chcete probrat.'],
    ['Jak pokračujeme','Po vyšetření následuje vysvětlení navržených možností. Formulář přijímá pouze ilustrační nezávaznou poptávku.']],
  bloom:['bouquets/seasonal','Sezónní kytice','Volně vázané aranžmá s teplými korálovými a chladnými šeříkovými odstíny.',
    ['Velikosti','Malá pro úzkou vázu; střední na jídelní stůl; velká jako výrazný dárek.'],
    ['Péče','Seřízněte stonky a odstraňte listy pod hladinou. Vodu měňte pravidelně.']],
  signal:['pricing','Od prvního přehledu ke sdílení','Ilustrační plány pro malý tým, který potřebuje sledovat aktivitu a dokončené úkoly.',
    ['Start · 0 Kč','Zkuste přehled s ukázkovou sadou dat. Změňte období a porovnejte aktivitu bez účtu.'],
    ['Team · 490 Kč měsíčně','Modelová cena pro sdílené reporty. Plán je součástí koncepčního návrhu a nelze jej zakoupit.']]
};
export function featureMarkup({id,locale,slug,photo,pages,link,escape}){
  const [target,title,intro,...facts]=features[id];
  const detail=pages.find(page=>page.visible&&page.slug===target&&page.content[locale].title);
  if(!detail||locale!=='cs'||(slug&&slug!==target))return '';
  const fields=detail.content[locale].body.split('\n\n');
  const copy=fields[0]||intro;
  const heading=title;
  const strip=facts.map(([label,body],index)=>`<div><dt>${escape(label)}</dt><dd>${escape(fields[index+1]||body)}</dd></div>`).join('');
  const compare=id==='blackline'&&slug&&photo?`<figure class="v6-compare" data-compare><div>${photo}<span>${photo}</span></div><figcaption><label>Podíl simulovaného zákalu <input type="range" min="0" max="100" value="50"></label></figcaption></figure>`:photo;
  return `<section class="v6-feature v6-${id}"><div class="v6-feature-copy">${!slug||heading!==detail.content[locale].title?`<h2>${escape(heading)}</h2>`: ''}<p>${escape(copy)}</p>${slug?`<dl>${strip}</dl>`:link(target,'Přečíst více')}</div>${compare}</section>`;
}
export const comparisonRuntime=`<script>document.querySelectorAll('[data-compare]').forEach(figure=>{const slider=figure.querySelector('input');slider.addEventListener('input',()=>figure.style.setProperty('--split',slider.value+'%'));});</script>`;
