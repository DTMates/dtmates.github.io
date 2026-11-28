// Versioned mobile-prototype contract. Website V21 envelopes remain separate.
export const componentTypes = [
  "hero",
  "text",
  "image",
  "button",
  "card",
  "list",
  "form",
  "tabs",
  "progress",
  "profile",
  "products",
  "records",
];
export const appTemplates = ["business", "commerce", "training", "portal"];
export const appFonts = [
  "modern",
  "editorial",
  "corporate",
  "hospitality",
  "minimal",
  "playful",
];
export const palettes = {
  modern: {
    primary: "#5148be",
    accent: "#d4ee73",
    background: "#f1f1f8",
    surface: "#ffffff",
    text: "#232337",
    muted: "#5f6075",
    border: "#d9dae6",
  },
  editorial: {
    primary: "#563e4b",
    accent: "#dfb9ab",
    background: "#faf5ef",
    surface: "#ffffff",
    text: "#342a2d",
    muted: "#76656a",
    border: "#ded1d2",
  },
  organic: {
    primary: "#35614b",
    accent: "#d7e88c",
    background: "#f1f4ec",
    surface: "#ffffff",
    text: "#243c31",
    muted: "#526b5c",
    border: "#cfd9cd",
  },
  dark: {
    primary: "#c5b6ff",
    accent: "#ccec8a",
    background: "#191925",
    surface: "#292938",
    text: "#f4f3ff",
    muted: "#c5c4d5",
    border: "#484859",
  },
};
const clean = (v, n = 2000) => (typeof v === "string" ? v.slice(0, n) : "");
export function imageURL(v) {
  if (!v) return "";
  if (
    typeof v !== "string" ||
    v.length > 8_000_000 ||
    /[\u0000-\u001f<>"']/.test(v)
  )
    throw Error("Invalid image");
  if (
    /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(v) ||
    /^https?:\/\//.test(v) ||
    /^(?:\.\/)?(?:assets|media|images)\/[\w./-]+$/.test(v) ||
    /^\/web-studio-v26\/[\w./-]+$/.test(v)
  )
    return v;
  throw Error("Use PNG, JPG or WebP imagery");
}
export function validateApp(value) {
  if (
    !value ||
    value.schema !== "dtmates.app" ||
    value.version !== 1 ||
    !appTemplates.includes(value.template)
  )
    throw Error("Unsupported app project");
  if (
    !Array.isArray(value.screens) ||
    !value.screens.length ||
    value.screens.length > 24
  )
    throw Error("Use 1–24 screens");
  if (JSON.stringify(value).length > 25e6)
    throw Error("App project exceeds25MB");
  const ids = new Set(),
    components = new Set();
  const screens = value.screens.map((s) => {
    if (
      !/^[a-z0-9_-]{1,64}$/.test(s.id) ||
      ids.has(s.id) ||
      ["__proto__", "constructor", "prototype"].includes(s.id)
    )
      throw Error("Invalid or duplicate screen");
    ids.add(s.id);
    if (!Array.isArray(s.components) || s.components.length > 40)
      throw Error("Too many components");
    return {
      id: s.id,
      title: clean(s.title, 100) || "Screen",
      inNavigation: s.inNavigation !== false,
      components: s.components.map((c) => {
        if (
          !/^[a-z0-9_-]{1,64}$/.test(c.id) ||
          components.has(c.id) ||
          ["__proto__", "constructor", "prototype"].includes(c.id) ||
          !componentTypes.includes(c.type)
        )
          throw Error("Invalid component");
        components.add(c.id);
        if (c.items !== undefined && !Array.isArray(c.items))
          throw Error("Invalid component items");
        const a = c.appearance || {};
        if (
          typeof a !== "object" ||
          Array.isArray(a) ||
          Object.keys(a).some(
            (k) =>
              ![
                "layout",
                "align",
                "background",
                "foreground",
                "imageFit",
                "headingScale",
              ].includes(k),
          )
        )
          throw Error("Unsupported component appearance");
        for (const key of ["background", "foreground"])
          if (a[key] && !/^#[a-f0-9]{6}$/i.test(a[key]))
            throw Error("Invalid component color");
        if (c.type === "form" && (c.items || []).length > 8)
          throw Error("Maximum8 form fields");
        const rawItems =
          c.items === undefined && c.type === "form"
            ? [
                {
                  id: "name",
                  title: value.locale === "cs" ? "Jméno" : "Name",
                  status: "text",
                  required: true,
                },
                {
                  id: "email",
                  title: value.locale === "cs" ? "E-mail" : "Email",
                  status: "email",
                  required: true,
                },
                {
                  id: "message",
                  title:
                    value.locale === "cs" ? "Vaše poptávka" : "Your inquiry",
                  status: "text",
                  required: true,
                },
              ]
            : c.items || [];
        const action = c.action || {};
        if (!["navigate", "complete", "none"].includes(action.type || "none"))
          throw Error("Invalid action");
        return {
          id: c.id,
          type: c.type,
          title: clean(c.title, 160),
          text: clean(c.text),
          image: imageURL(c.image),
          alt: clean(c.alt, 200),
          hidden: !!c.hidden,
          value: Math.max(0, Math.min(100, Number(c.value) || 0)),
          submitLabel: clean(c.submitLabel, 100),
          progressSource: ["manual", "lessons", "records"].includes(
            c.progressSource,
          )
            ? c.progressSource
            : value.template === "training"
              ? "lessons"
              : value.template === "portal"
                ? "records"
                : "manual",
          appearance: {
            layout: ["original", "compact", "inset", "wide"].includes(a.layout)
              ? a.layout
              : "original",
            align: a.align === "center" ? "center" : "start",
            background: a.background || "",
            foreground: a.foreground || "",
            imageFit: a.imageFit === "contain" ? "contain" : "cover",
            headingScale: ["small", "normal", "large"].includes(a.headingScale)
              ? a.headingScale
              : "normal",
          },
          action: {
            type: action.type || "none",
            target: clean(action.target, 64),
          },
          items: rawItems.slice(0, 60).map((x, i) => ({
            id:
              /^[a-z0-9_-]{1,64}$/i.test(x.id || "") &&
              !["__proto__", "constructor", "prototype"].includes(x.id)
                ? x.id
                : "item-" + i,
            title: clean(x.title, 120),
            body: clean(x.body, 600),
            image: imageURL(x.image),
            value: Math.max(0, Math.min(1e8, Number(x.value) || 0)),
            status: clean(x.status, 50) || "planned",
            required: x.required !== false,
          })),
        };
      }),
    };
  });
  for (const s of screens)
    for (const c of s.components)
      if (c.type === "form") {
        const ids = new Set();
        for (const x of c.items) {
          if (ids.has(x.id)) throw Error("Duplicate form field");
          ids.add(x.id);
        }
      }
  for (const kind of ["products", "lessons"]) {
    const seen = new Set();
    for (const s of screens)
      for (const c of s.components)
        if (
          kind === "products"
            ? c.type === "products"
            : c.action.type === "complete"
        )
          for (const item of c.items) {
            if (seen.has(item.id))
              throw Error("Duplicate interactive item identifier");
            seen.add(item.id);
          }
  }
  for (const s of screens)
    for (const c of s.components)
      if (c.action.type === "navigate" && !ids.has(c.action.target))
        throw Error("Button points to a missing screen");
  if (
    value.theme &&
    (typeof value.theme !== "object" || Array.isArray(value.theme))
  )
    throw Error("Invalid theme");
  const allowedThemeKeys = [...Object.keys(palettes.modern), "font", "radius"];
  if (Object.keys(value.theme || {}).some((k) => !allowedThemeKeys.includes(k)))
    throw Error("Unsupported theme property");
  const t = { ...palettes.modern, ...value.theme };
  for (const key of Object.keys(palettes.modern))
    if (!/^#[a-f0-9]{6}$/i.test(t[key])) throw Error("Invalid palette");
  if (!appFonts.includes(t.font || "modern")) throw Error("Invalid font");
  return {
    schema: "dtmates.app",
    version: 1,
    id: /^[a-z0-9_-]{1,80}$/i.test(value.id) ? value.id : crypto.randomUUID(),
    template: value.template,
    locale: value.locale === "cs" ? "cs" : "en",
    name: clean(value.name, 100) || "My app",
    description: clean(value.description, 500),
    icon: imageURL(value.icon),
    theme: {
      ...t,
      font: t.font || "modern",
      radius: Math.max(0, Math.min(32, Number(t.radius) || 18)),
    },
    screens,
  };
}
export function makeApp(template = "business", locale = "en") {
  const cs = locale === "cs",
    T = (a, b) => (cs ? a : b);
  let seq = 0;
  const c = (type, title, text = "", extra = {}) => ({
    id: "c" + ++seq,
    type,
    title,
    text,
    ...extra,
  });
  const s = (id, title, components) => ({
    id,
    title,
    inNavigation: true,
    components,
  });
  const items = (labels) =>
    labels.map((title, i) => ({
      id: "item" + i,
      title,
      body: T(
        "Ukázkový obsah, který můžete upravit.",
        "Sample content you can customize.",
      ),
      value: (i + 1) * 490,
      status: "planned",
    }));
  const templates = {
    business: {
      name: T("Luma Studio", "Luma Studio"),
      description: T(
        "Služby a místní poptávky.",
        "Services and local inquiries.",
      ),
      palette: "editorial",
      screens: [
        s("home", T("Domů", "Home"), [
          c(
            "hero",
            T("Čas pro vaše nápady.", "Make room for your ideas."),
            T(
              "Malé studio. Osobní přístup.",
              "A small studio. A personal approach.",
            ),
          ),
          c(
            "card",
            T("Co pro vás uděláme", "Made around you"),
            T(
              "Objevte služby a připravte si poptávku.",
              "Explore our services and prepare an inquiry.",
            ),
          ),
          c("button", T("Prohlédnout služby", "Explore services"), "", {
            action: { type: "navigate", target: "services" },
          }),
        ]),
        s("services", T("Služby", "Services"), [
          c("list", T("Naše služby", "Our services"), "", {
            items: items([
              T("Konzultace", "Consultation"),
              T("Návrh", "Design"),
              T("Realizace", "Delivery"),
            ]),
          }),
          c("button", T("Domluvit konzultaci", "Request consultation"), "", {
            action: { type: "navigate", target: "contact" },
          }),
        ]),
        s("contact", T("Kontakt", "Contact"), [
          c(
            "profile",
            "Luma Studio",
            T(
              "Ukázkový tým. Žádné údaje se neodesílají.",
              "A demonstration team. No information is sent.",
            ),
          ),
          c(
            "form",
            T("Připravit poptávku", "Prepare inquiry"),
            T(
              "Místní potvrzení, bez odesílání.",
              "Local confirmation, without dispatch.",
            ),
          ),
        ]),
      ],
    },
    commerce: {
      name: "FORME",
      description: T(
        "Osobní výběr. Ukázkový obchod.",
        "A personal edit. A demonstration store.",
      ),
      palette: "editorial",
      screens: [
        s("home", T("Objevit", "Discover"), [
          c(
            "hero",
            T("Méně věcí. Lepší výběr.", "Fewer things. Better choices."),
            T(
              "Fiktivní kolekce pro každý den.",
              "A fictional collection for every day.",
            ),
          ),
          c("products", T("Vybráno pro vás", "The considered edit"), "", {
            items: items([
              T("Krajková kolekce", "Signature lace"),
              T("Plavky Coast", "Coast swim"),
              T("Lehký župan", "Soft robe"),
            ]),
          }),
        ]),
        s("favourites", T("Oblíbené", "Favourites"), [
          c("products", T("Váš výběr", "Your favourites"), "favourites"),
        ]),
        s("bag", T("Taška", "Bag"), [
          c("products", T("Nákupní taška", "Shopping bag"), "bag"),
        ]),
      ],
    },
    training: {
      name: T("Paw Journey", "Paw Journey"),
      description: T("Každý den malý pokrok.", "A little progress, every day."),
      palette: "organic",
      screens: [
        s("home", T("Trénink", "Training"), [
          c(
            "hero",
            T("Společně o krok dál.", "One small step together."),
            T(
              "Krátké lekce pro vás a vašeho psa.",
              "Short lessons for you and your dog.",
            ),
          ),
          c(
            "list",
            T("Dnešní lekce", "Today’s lessons"),
            T("Označte dokončené lekce.", "Mark lessons complete."),
            {
              items: items([
                T("Sedni", "Sit"),
                T("Zůstaň", "Stay"),
                T("Ke mně", "Come"),
              ]),
              action: { type: "complete" },
            },
          ),
        ]),
        s("progress", T("Pokrok", "Progress"), [
          c(
            "progress",
            T("Vaše cesta", "Your journey"),
            T(
              "Pokrok zůstává v tomto prohlížeči.",
              "Progress stays in this browser.",
            ),
          ),
        ]),
        s("profile", T("Profil", "Profile"), [
          c(
            "profile",
            T("Alex a Buddy", "Alex & Buddy"),
            T(
              "Začátečníci. Tři malé kroky každý den.",
              "Beginners. Three small steps each day.",
            ),
          ),
        ]),
      ],
    },
    portal: {
      name: T("Orbit Workspace", "Orbit Workspace"),
      description: T(
        "Přehled práce a klientů.",
        "A clear view of work and clients.",
      ),
      palette: "modern",
      screens: [
        s("home", T("Přehled", "Overview"), [
          c(
            "hero",
            T("Dobrý den, Alex.", "Good morning, Alex."),
            T("Váš den, přehledně.", "Your day, in focus."),
          ),
          c("progress", T("Postup práce", "Work progress"), ""),
        ]),
        s("records", T("Projekty", "Projects"), [
          c(
            "records",
            T("Pracovní přehled", "Project workspace"),
            T(
              "Vytvářejte a upravujte místní záznamy.",
              "Create and edit local records.",
            ),
            {
              items: items([
                T("Nový web", "New website"),
                T("Příprava obsahu", "Content preparation"),
              ]),
            },
          ),
        ]),
        s("updates", T("Novinky", "Updates"), [
          c("tabs", T("Místní oznámení", "Local notifications"), "", {
            items: items([
              T("Plánované", "Planned"),
              T("Dokončené", "Completed"),
            ]),
          }),
        ]),
        s("profile", T("Nastavení", "Settings"), [
          c(
            "profile",
            "Alex",
            T(
              "Místní ukázka. Bez účtu a cloudové synchronizace.",
              "Local demonstration. No account or cloud synchronization.",
            ),
          ),
        ]),
      ],
    },
  };
  const x = templates[template];
  if (template === "commerce")
    x.screens[0].components
      .find((c) => c.type === "products")
      .items.forEach(
        (p, i) =>
          (p.image =
            "/web-studio-v26/engine/assets/img/" +
            ["timo-v7-lace.webp", "timo-v7-swim.webp", "timo-v8-robe.webp"][i]),
      );
  if (template === "training")
    x.screens[0].components[0].image = "/web-studio-v26/media/paw/down-1.webp";
  if (!x) throw Error("Unknown template");
  return validateApp({
    schema: "dtmates.app",
    version: 1,
    id: crypto.randomUUID(),
    template,
    locale,
    name: x.name,
    description: x.description,
    theme: {
      ...palettes[x.palette],
      font:
        template === "commerce"
          ? "editorial"
          : template === "training"
            ? "playful"
            : "modern",
      radius: template === "commerce" ? 2 : 18,
    },
    screens: x.screens,
  });
}
export function migrateLegacyApp(value, locale = "en") {
  if (value?.schema === "dtmates.app") return validateApp(value);
  if (value?.version !== 21 || value.project?.id !== "paw")
    throw Error("Not an app configuration");
  const app = makeApp("training", locale),
    p = value.project;
  app.name = clean(p.brand, 100) || app.name;
  app.screens[0].components[0].title =
    clean(p.headline?.[locale], 160) || app.screens[0].components[0].title;
  app.screens[0].components[0].text =
    clean(p.subline?.[locale]) || app.screens[0].components[0].text;
  if (p.hero) app.screens[0].components[0].image = imageURL(p.hero);
  if (/^#[0-9a-f]{6}$/i.test(p.contrast)) app.theme.background = p.contrast;
  if (["editorial", "modern"].includes(value.settings?.font))
    app.theme.font = value.settings.font;
  if (/^#[0-9a-f]{6}$/i.test(p.color)) app.theme.primary = p.color;
  return validateApp(app);
}
