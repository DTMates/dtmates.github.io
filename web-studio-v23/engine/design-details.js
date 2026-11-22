const detail = {
  cafe:{about:[['Od mlýnku ke stolu','Espresso připravujeme v menších dávkách, pečivo patří na stůl ještě teplé.']]},
  electric:{
    services:[['Nová instalace','Rozvody a okruhy podle využití prostoru.'],['Kontrola','Přehled stávajícího stavu a navržených oprav.'],['Chytrá domácnost','Světla, vytápění a stínění s ručním ovládáním.']],
    projects:[['Byt před rekonstrukcí','Modelový příklad: výměna rozvaděče a přidání kuchyňských okruhů.'],['Malá provozovna','Modelový příklad: rozdělení osvětlení do samostatných zón.']]},
  wellness:{'treatments/relaxation':[['60 minut · 1 050 Kč','Ukázková cena. Jemný rituál s důrazem na pomalé tempo a klidné prostředí.']]},
  realty:{'properties/sample-apartment':[['58 m² · 2 pokoje','Fiktivní byt u parku. Denní zóna s okny do ulice, ložnice do dvora.'],['7 490 000 Kč','Ilustrační cena fiktivní nemovitosti.']]},
  timo:{sizes:[['S / M / L','Před výběrem velikosti si změřte obvod hrudníku a pasu. Koncept nepoužívá oficiální tabulku značky.']]},
  dental:{treatments:[['První návštěva','Rozhovor o obtížích a domluva dalšího postupu.'],['Prevence','Kontrola a prostor pro otázky k běžné péči.'],['Dentální hygiena','Individuální plán péče o zuby a dásně.']],
    team:[['Klára · kontaktní místo','Fiktivní role pro ukázku objednání.'],['Marek · konzultace','Fiktivní role pro ukázku představení týmu.']]},
  blackline:{services:[['Interiér','Vysávání, čištění povrchů a detailů.'],['Lak','Mytí a korekce podle stavu povrchu.'],['Ochrana','Finální příprava a údržba povrchu.']]},
  hotel:{'rooms/courtyard':[['2 hosté · výhled do dvora','V ukázkové dispozici je dvojlůžko, křeslo u okna a vlastní koupelna.']],
    experiences:[['Ranní stůl','Snídaně v přízemí a pomalý start dne.'],['Pěšky do města','Návrh procházky od hotelu ke kavárnám a galeriím.']]},
  bloom:{'bouquets/seasonal':[['Sezónní aranžmá','Volně vázaná kytice s kontrastními odstíny a možností výběru velikosti.']]}
};

export function editorialDetails(id,slug,locale){
  const rows=locale==='cs'&&detail[id]?.[slug];
  return rows?'<dl class="ds-facts">'+rows.map(([term,definition])=>'<div><dt>'+term+'</dt><dd>'+definition+'</dd></div>').join('')+'</dl>':'';
}
