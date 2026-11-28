import { themePresets, contrastRatio } from "./themes.js";
import { fontPairs } from "./fonts.js";
import { store as projectStore } from "./project-store.js";
const cs = document.documentElement.lang === "cs",
  T = (a, b) => (cs ? a : b),
  $ = (id) => document.getElementById(id);
let catalogue = [],
  key = "",
  selected = "",
  field = "",
  api,
  projectId = crypto.randomUUID(),
  saved = "",
  active = true,
  choosing = false,
  savedInDB = false;
function el(tag, text, props = {}) {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  Object.assign(n, props);
  return n;
}
function button(text, action) {
  const b = el("button", text, { type: "button" });
  b.onclick = action;
  if (text === "↑" || text === "↓")
    b.setAttribute(
      "aria-label",
      text === "↑"
        ? T("Posunout sekci výš", "Move section up")
        : T("Posunout sekci níž", "Move section down"),
    );
  if (text === "×")
    b.setAttribute(
      "aria-label",
      T("Zavřít knihovnu", "Close template library"),
    );
  return b;
}
function input(label, value, action, type = "text") {
  const l = el("label", label),
    i = el(type === "textarea" ? "textarea" : "input");
  if (type !== "textarea") i.type = type;
  i.setAttribute("aria-label", label);
  i.value = value ?? "";
  let last = i.value;
  const changed = () => {
    if (i.value === last) return;
    try {
      action(i.value);
      last = i.value;
    } catch (e) {
      status(e.message);
    }
  };
  i.onchange = changed;
  if (["text", "textarea", "color", "range"].includes(type))
    i.oninput = changed;
  l.append(i);
  return l;
}
function select(label, value, options, action) {
  const l = el("label", label),
    s = el("select");
  s.setAttribute("aria-label", label);
  for (const [k, v] of options) s.add(new Option(v, k));
  s.value = value || options[0]?.[0] || "";
  s.disabled = !options.length;
  s.onchange = () => action(s.value);
  l.append(s);
  return l;
}
function status(s) {
  $("creator-status").textContent = s;
}
function state() {
  return JSON.parse(api.snapshot().configuration);
}
function mutate(fn) {
  api.edit(fn);
  $("creator-unsaved").textContent = T("Neuložené změny", "Unsaved changes");
}
function pageState(settings) {
  settings.creator.pages[key] ||= { edits: {}, order: [], extras: [] };
  return settings.creator.pages[key];
}
function patchField(value) {
  mutate((p, s) => {
    const ps = pageState(s);
    ps.edits[selected] ||= { fields: {} };
    const current = catalogue
      .find((x) => x.id === selected)
      ?.fields.find((x) => x.id === field);
    if (key.endsWith("/") && value.text !== undefined) {
      if (current?.tag === "H1") {
        ps.heroHeadline = value.text;
        p.headline[key.slice(0, 2)] = value.text;
      }
      if (current?.tag === "P") delete ps.heroBody;
      if (current?.tag === "A") delete ps.heroCTA;
    }
    ps.edits[selected].fields[field] = {
      text: catalogue
        .find((x) => x.id === selected)
        ?.fields.find((x) => x.id === field)?.text,
      ...ps.edits[selected].fields[field],
      ...value,
    };
  });
}
function tx(mode, run) {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("dtmates-v26-projects", 1);
    r.onupgradeneeded = () =>
      r.result.createObjectStore("projects", { keyPath: "id" });
    r.onerror = () => reject(r.error);
    r.onsuccess = () => {
      const db = r.result,
        t = db.transaction("projects", mode),
        req = run(t.objectStore("projects"));
      let result;
      req.onsuccess = () => (result = req.result);
      t.oncomplete = () => {
        db.close();
        resolve(result);
      };
      t.onerror = () => {
        db.close();
        reject(t.error);
      };
    };
  });
}
async function save() {
  try {
    const snap = api.snapshot(),
      p = state().project;
    await tx("readwrite", (s) =>
      s.put({
        id: projectId,
        name: p.projectName || p.brand,
        updated: new Date().toISOString(),
        snapshot: snap,
      }),
    );
    saved = snap.configuration;
    savedInDB = true;
    $("creator-unsaved").textContent = T(
      "Uloženo v tomto prohlížeči",
      "Saved in this browser",
    );
    status(
      T(
        "Projekt uložen. Můžete jej znovu otevřít z knihovny.",
        "Project saved. Reopen it from the library.",
      ),
    );
    await savedList();
  } catch (e) {
    status(
      T(
        "Uložení selhalo. Stáhněte JSON konfiguraci.",
        "Save failed. Download the JSON configuration.",
      ),
    );
  }
}
async function savedList() {
  try {
    const docs = await tx("readonly", (s) => s.getAll());
    const list = $("creator-saved");
    list.replaceChildren();
    $("continue-projects").hidden = !docs.length;
    for (const d of docs.sort((a, b) => b.updated.localeCompare(a.updated))) {
      list.append(
        button(d.name, () => {
          try {
            if (!discard()) return;
            api.restore(d.snapshot);
            projectId = d.id;
            saved = api.snapshot().configuration;
            savedInDB = true;
            $("creator-unsaved").textContent = T(
              "Uloženo v tomto prohlížeči",
              "Saved in this browser",
            );
            $("creator-start").close();
          } catch (e) {
            status(e.message);
          }
        }),
      );
    }
  } catch {
    status(
      T(
        "Místní úložiště není dostupné. Export JSON zůstává k dispozici.",
        "Local storage unavailable. JSON export remains available.",
      ),
    );
  }
}
const templates = [
  ["cafe", "MÍSTO", "Café"],
  ["blackline", "BLACKLINE", "Automotive"],
  ["hotel", "Atelier Hotel", "Hospitality"],
  ["wellness", "MIRA", "Wellness"],
  ["realty", "FORMA", "Real estate"],
  ["electric", "VOLT", "Services"],
  ["dental", "LUME", "Services"],
  ["bloom", "BLOOM", "Commerce"],
  ["timo", "FORME", "Commerce"],
  ["signal", "SIGNAL", "Software"],
];
function discard() {
  return (
    !saved ||
    saved === api.snapshot().configuration ||
    confirm(
      T(
        "Uložit změny před otevřením jiného projektu? Pokračováním nahradíte aktuální návrh.",
        "Continue without saving? This replaces the current project.",
      ),
    )
  );
}
function choose(id, blank = false) {
  if (
    saved &&
    state().project.brand &&
    saved !== api.snapshot().configuration &&
    !confirm(
      T(
        "Otevřít nový návrh? Neuložené změny zůstanou pouze v historii této karty.",
        "Open a new design? Save your current project first.",
      ),
    )
  )
    return;
  const picker = $("editor-template");
  picker.value = id;
  choosing = true;
  try {
    picker.dispatchEvent(new Event("change"));
  } finally {
    choosing = false;
  }
  projectId = crypto.randomUUID();
  savedInDB = false;
  if (blank)
    mutate((p, s) => {
      p.brand = T("Nový web", "New website");
      p.headline.cs = "";
      p.headline.en = "";
      p.subline.cs = "";
      p.subline.en = "";
      p.pages = [];
      s.creator.pages[($("project-language").value || "cs") + "/"] = {
        edits: {},
        order: ["new_blank"],
        extras: [
          {
            id: "new_blank",
            type: "text",
            title: T("Váš nový příběh", "Your new story"),
            body: T("Začněte psát.", "Start writing."),
            cta: "",
            href: "#",
          },
        ],
      };
      s.creator.blank = true;
    });
  $("creator-start").close();
  saved = api.snapshot().configuration;
}
function chooser() {
  let dialog = $("creator-start");
  if (dialog) {
    dialog.showModal();
    savedList();
    return;
  }
  dialog = el("dialog", undefined, { id: "creator-start" });
  const head = el("div", undefined, { className: "chooser-head" });
  head.append(
    el("p", "DTMATES / CREATOR"),
    el("h1", T("Váš další web začíná tady.", "Your next website starts here.")),
    button("×", () => dialog.close()),
  );
  const search = input(T("Najít návrh", "Find a design"), "", (v) => filter(v));
  search.querySelector("input").oninput = (e) => filter(e.target.value);
  const category = select(
    T("Kategorie", "Category"),
    "all",
    [["all", T("Všechny", "All")], ...new Set(templates.map((t) => t[2]))].map(
      (x) =>
        Array.isArray(x)
          ? x
          : [
              x,
              cs
                ? {
                    Café: "Kavárna",
                    Automotive: "Automoto",
                    Hospitality: "Ubytování",
                    Wellness: "Wellness",
                    "Real estate": "Nemovitosti",
                    Services: "Služby",
                    Commerce: "Obchod",
                    Software: "Software",
                  }[x]
                : x,
            ],
    ),
    () => filter(search.querySelector("input").value),
  );
  const grid = el("div", undefined, { className: "creator-template-grid" });
  function filter(query) {
    const cat = category.querySelector("select").value;
    for (const card of grid.children)
      card.hidden = !(
        card.dataset.search.includes(query.toLowerCase()) &&
        (cat === "all" || card.dataset.category === cat)
      );
  }
  for (const [id, name, category] of templates) {
    const card = el("article");
    card.dataset.search = (id + " " + name + " " + category).toLowerCase();
    card.dataset.category = category;
    const frame = el("iframe", undefined, {
      title: name,

      loading: "lazy",
    });
    frame.dataset.templateSrc = "/web-studio-v26/engine/sites/" + id + "/";
    frame.setAttribute("sandbox", "allow-scripts");
    const view = el("div", undefined, { className: "template-thumb" });
    view.append(frame);
    card.append(
      view,
      el(
        "small",
        cs
          ? {
              Services: "Služby",
              Commerce: "Obchod",
              Hospitality: "Ubytování",
              Software: "Software",
              Café: "Kavárna",
              Automotive: "Automoto",
              Wellness: "Wellness",
              "Real estate": "Nemovitosti",
            }[category]
          : category,
      ),
      el("h2", name),
      button(T("Upravit návrh", "Start editing"), () => choose(id)),
    );
    const a = el("a", T("Otevřít ukázku ↗", "Preview full example ↗"), {
      href: new URL(frame.dataset.templateSrc, location.href).href,
      target: "_blank",
      rel: "noopener",
    });
    card.append(a);
    grid.append(card);
  }
  const blank = button(T("Začít prázdným návrhem", "Start from blank"), () =>
    choose("cafe", true),
  );
  const savedSection = el("section", undefined, {
    id: "continue-projects",
    hidden: true,
  });
  savedSection.append(
    el("h2", T("Pokračovat v projektu", "Continue a project")),
    el("div", undefined, { id: "creator-saved" }),
  );
  const descriptions = {
    cafe: T(
      "Jídelní lístek, otevírací doba a místní přehled návštěvy.",
      "Menu, opening hours and a local visit summary.",
    ),
    blackline: T(
      "Služby, balíčky, galerie a místní poptávka.",
      "Services, packages, gallery and a local quote.",
    ),
    hotel: T(
      "Pokoje, galerie a přehled poptávky pobytu.",
      "Rooms, galleries and a stay-inquiry summary.",
    ),
    wellness: T(
      "Procedury, filtr délky a místní poptávka.",
      "Treatments, duration filters and local inquiries.",
    ),
    realty: T(
      "Vyhledávání nemovitostí, uložené nabídky a prohlídky.",
      "Property search, shortlist and viewing inquiries.",
    ),
    electric: T(
      "Služby, projekty a tříkroková poptávka.",
      "Services, projects and a three-step quote.",
    ),
    dental: T(
      "Péče, tým a místní přehled požadavku na návštěvu.",
      "Care, team and a local appointment summary.",
    ),
    bloom: T(
      "Kytice, velikosti a demonstrační košík.",
      "Bouquets, size options and a demonstration bag.",
    ),
    timo: T(
      "Varianty, oblíbené produkty, košík a simulovaný nákup.",
      "Variants, wishlist, bag and simulated checkout.",
    ),
    signal: T(
      "Přehled týmu a místní nastavení ukázky.",
      "Team dashboard and local demo setup.",
    ),
  };
  for (let i = 0; i < grid.children.length; i++) {
    const p = el("p", descriptions[templates[i][0]], {
      className: "template-details",
    });
    grid.children[i].querySelector("h2").after(p);
  }
  const devices = el("div", undefined, { className: "chooser-devices" });
  for (const [id, label] of [
    ["desktop", T("Počítač", "Desktop")],
    ["mobile", T("Mobil", "Mobile")],
  ]) {
    const b = button(label, () => {
      grid.dataset.device = id;
      devices
        .querySelectorAll("button")
        .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    });
    b.setAttribute("aria-pressed", String(id === "desktop"));
    devices.append(b);
  }
  dialog.append(head, search, category, devices, blank, savedSection, grid);
  document.body.append(dialog);
  const previewObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          const frame = entry.target.querySelector("iframe");
          frame.src = frame.dataset.templateSrc;
          previewObserver.unobserve(entry.target);
        }
    },
    { root: dialog, rootMargin: "100px" },
  );
  for (const card of grid.children) previewObserver.observe(card);
  savedList();
  dialog.showModal();
}
function drawStructure() {
  const panel = $("creator-structure");
  panel.replaceChildren();
  const st = state();
  $("edit-cta").closest("label").hidden = st.settings.creator.blank === true;
  $("edit-sections").hidden = st.project.id !== "paw";
  $("edit-sections").previousElementSibling.hidden = st.project.id !== "paw";
  if (st.project.id === "paw") {
    panel.append(
      el("h2", T("Aplikační koncept", "App concept")),
      select(
        T("Otevřená stránka", "Current page"),
        api.page(),
        [
          ["", T("Trénink", "Training")],
          ["profile", T("Profil", "Profile")],
          ["progress", T("Pokrok", "Progress")],
        ],
        (slug) => api.openPage(slug),
      ),
      el(
        "p",
        T(
          "Třístránkový HTML koncept. Obsah a vzhled upravíte v původních ovládacích panelech.",
          "Three-page HTML concept. Use the retained content and design controls.",
        ),
      ),
    );
    return;
  }
  panel.append(
    el("h2", T("Stránky", "Pages")),
    select(
      T("Otevřená stránka", "Current page"),
      api.page(),
      [
        ["", T("Úvod", "Home")],
        ...st.project.pages.map((p) => [
          p.slug,
          p.content[$("project-language").value]?.title || p.slug,
        ]),
      ],
      (slug) => api.openPage(slug),
    ),
  );
  if (api.page()) {
    const p = st.project.pages.find((p) => p.slug === api.page());
    if (p) {
      panel.append(
        input(
          T("Název v navigaci", "Navigation label"),
          p.content[$("project-language").value].title,
          (v) =>
            mutate(
              (pr) =>
                (pr.pages.find((x) => x.slug === p.slug).content[
                  $("project-language").value
                ].title = v),
            ),
        ),
        select(
          T("Rozvržení stránky", "Page layout"),
          st.settings.creator.pages[key]?.composition || "original",
          [
            ["original", T("Původní", "Original")],
            ["article", T("Článek", "Article")],
            ["split", T("Dva sloupce", "Two columns")],
          ],
          (v) => mutate((pr, s) => (pageState(s).composition = v)),
        ),
        button(T("Posunout stránku výš", "Move page up"), () =>
          mutate((pr) => {
            const i = pr.pages.findIndex((x) => x.slug === p.slug);
            if (i > 0)
              [pr.pages[i - 1], pr.pages[i]] = [pr.pages[i], pr.pages[i - 1]];
          }),
        ),
        select(
          T("Viditelnost v navigaci", "Navigation visibility"),
          String(
            st.settings.creator.pages[key]?.inNavigation ??
              (!p.slug.includes("/") && p.slug !== "checkout"),
          ),
          [
            ["true", T("Zobrazit", "Shown")],
            ["false", T("Skrýt", "Hidden")],
          ],
          (v) => mutate((pr, s) => (pageState(s).inNavigation = v === "true")),
        ),
      );
    }
  }
  panel.append(
    button(T("Přidat stránku", "Add page"), () => $("add-page").click()),
    button(T("Duplikovat stránku", "Duplicate page"), () =>
      $("duplicate-page").click(),
    ),
    el("h2", T("Sekce skutečného webu", "Actual website sections")),
  );
  for (const s of catalogue) {
    const b = button((s.hidden ? "○ " : "● ") + s.title, () => {
      selected = s.id;
      field = s.fields[0]?.id || "";
      drawInspector();
      outline();
    });
    b.dataset.selected = String(s.id === selected);
    panel.append(b);
  }
  const pageUp = [...panel.querySelectorAll("button")].find(
    (b) => b.textContent === T("Posunout stránku výš", "Move page up"),
  );
  if (pageUp)
    pageUp.disabled =
      st.project.pages.findIndex((p) => p.slug === api.page()) <= 0;
  panel.append(
    select(
      T("Přidat sekci", "Add section"),
      "text",
      [
        ["text", T("Text", "Text")],
        ["image", T("Obrázek", "Image")],
        ["cta", T("Výzva k akci", "Call to action")],
      ],
      () => {},
    ),
    button("+ " + T("Přidat", "Add"), () => {
      const type =
        [...panel.querySelectorAll("select")].at(-1)?.value || "text";
      mutate((p, s) => {
        const ps = pageState(s),
          id = "new_" + crypto.randomUUID();
        ps.extras.push({
          id,
          type,
          title: T("Nová sekce", "New section"),
          body: T("Vlastní obsah.", "Your own content."),
          cta: T("Zjistit více", "Learn more"),
          href: "#",
        });
        ps.order = [...catalogue.map((c) => c.id), id];
        selected = id;
      });
    }),
  );
}
function outline() {
  $("editor-frame").contentWindow.postMessage(
    {
      type: "creator-outline",
      nonce: api.nonce,
      section:
        document.body.classList.contains("creator-preview-only") ||
        document.body.classList.contains("creator-embed") ||
        document.fullscreenElement
          ? ""
          : selected,
    },
    "*",
  );
}
function drawInspector() {
  const panel = $("creator-context");
  panel.replaceChildren();
  const section = catalogue.find((s) => s.id === selected);
  if (!section) {
    panel.append(
      el("h2", T("Vyberte sekci v náhledu", "Select a section in the canvas")),
      el(
        "p",
        T(
          "Kliknutím na text nebo obrázek otevřete jeho skutečný obsah.",
          "Click actual text or imagery to edit it.",
        ),
      ),
    );
    return;
  }
  const ps = state().settings.creator.pages[key] || {},
    edit = ps.edits?.[selected] || {};
  panel.append(el("h2", section.title));
  panel.append(
    select(
      T("Prvek", "Element"),
      field,
      section.fields.map((f) => [
        f.id,
        T(
          {
            H1: "Hlavní nadpis",
            H2: "Nadpis sekce",
            H3: "Podnadpis",
            P: "Odstavec",
            A: "Odkaz",
            BUTTON: "Tlačítko",
            IMG: "Obrázek",
            LI: "Položka seznamu",
          }[f.tag] || "Obsah",
          {
            H1: "Main heading",
            H2: "Section heading",
            H3: "Subheading",
            P: "Paragraph",
            A: "Link",
            BUTTON: "Button",
            IMG: "Image",
            LI: "List item",
          }[f.tag] || "Content",
        ) +
          " / " +
          (f.text || f.alt || "").slice(0, 45),
      ]),
      (v) => {
        field = v;
        drawInspector();
      },
    ),
  );
  const f = section.fields.find((x) => x.id === field) || section.fields[0];
  if (f) {
    field = f.id;
    if (f.tag === "IMG") {
      panel.append(
        input(T("Alternativní text", "Alternative text"), f.alt, (v) =>
          patchField({ alt: v }),
        ),
        input(
          T("Pozice obrazu 0–100", "Focal position 0–100"),
          edit.fields?.[field]?.focal ?? 50,
          (v) => patchField({ focal: Number(v) }),
          "range",
        ),
      );
      const upload = input(
        T(
          "Nahrát obrázek · JPG/PNG/WebP do 6MB",
          "Replace image · JPG/PNG/WebP up to 6MB",
        ),
        "",
        () => {},
        "file",
      );
      upload.querySelector("input").accept = "image/png,image/jpeg,image/webp";
      upload.querySelector("input").onchange = async (e) => {
        try {
          patchField({ src: await api.resizePhoto(e.target.files[0]) });
        } catch (e) {
          status(e.message);
        }
      };
      panel.append(
        upload,
        button(T("Obnovit původní obrázek", "Reset original image"), () =>
          mutate((p, s) => {
            delete pageState(s).edits[selected]?.fields[field];
          }),
        ),
      );
    } else
      panel.append(
        input(
          T("Skutečný obsah prvku", "Actual element content"),
          f.text,
          (v) => patchField({ text: v }),
          f.tag === "P" || f.tag === "LI" ? "textarea" : "text",
        ),
      );
    if (f.tag === "A")
      panel.append(
        input(T("Cíl odkazu", "Link destination"), f.href, (v) =>
          patchField({ href: v }),
        ),
      );
  }
  const sectionEdit = (fn) =>
    mutate((p, s) => {
      const ps = pageState(s);
      ps.edits[selected] ||= { fields: {} };
      fn(ps.edits[selected], ps);
    });
  panel.append(
    input(
      T("Pozadí sekce", "Section background"),
      edit.background || "#ffffff",
      (v) => sectionEdit((e) => (e.background = v)),
      "color",
    ),
    select(
      T("Kompozice sekce", "Section layout"),
      edit.layout || "original",
      [
        ["original", T("Původní", "Original")],
        ["inset", T("Úzká", "Inset")],
        ["wide", T("Široká", "Wide")],
      ],
      (v) => sectionEdit((e) => (e.layout = v)),
    ),
    button(section.hidden ? T("Zobrazit", "Show") : T("Skrýt", "Hide"), () =>
      sectionEdit((e) => (e.hidden = !section.hidden)),
    ),
  );
  for (const delta of [-1, 1])
    panel.append(
      button(delta < 0 ? "↑" : "↓", () =>
        sectionEdit((e, ps) => {
          const ids = catalogue
              .filter((x) => x.group === section.group)
              .map((x) => x.id),
            i = ids.indexOf(selected),
            j = i + delta;
          if (j >= 0 && j < ids.length) [ids[i], ids[j]] = [ids[j], ids[i]];
          ps.order = ids;
        }),
      ),
    );
  const siblings = catalogue.filter((x) => x.group === section.group);
  const index = siblings.findIndex((x) => x.id === selected);
  for (const [i, b] of [...panel.querySelectorAll("button")]
    .filter((b) => b.textContent === "↑" || b.textContent === "↓")
    .entries())
    b.disabled =
      section.group !== "content" ||
      (i === 0 ? index <= 0 : index >= siblings.length - 1);
  const dup = button(T("Duplikovat sekci", "Duplicate section"), () =>
    sectionEdit((e, ps) => {
      const id = "copy_" + crypto.randomUUID();
      ps.extras.push({
        id,
        type: "copy",
        source: selected,
        title: "",
        body: "",
        cta: "",
        href: "#",
      });
      ps.edits[id] = structuredClone(ps.edits[selected] || { fields: {} });
      ps.order = [...catalogue.map((x) => x.id), id];
    }),
  );
  dup.disabled = !section.compatible;
  dup.title = T(
    "Duplikace jen pro obsahové sekce bez interaktivních formulářů a interních ID.",
    "Duplication is available for content sections without interactive forms or internal IDs.",
  );
  panel.append(
    dup,
    button(T("Odebrat sekci", "Remove section"), () => {
      if (!section.compatible) {
        status(
          T(
            "Interaktivní sekci můžete skrýt; její prvky potřebují původní skripty.",
            "Hide this interactive section to preserve its runtime dependencies.",
          ),
        );
        return;
      }
      if (
        confirm(
          T(
            "Odebrat tuto sekci? Zpět akci obnoví.",
            "Remove section? Undo can restore it.",
          ),
        )
      )
        sectionEdit((e) => (e.removed = true));
    }),
    input(T("SEO titulek", "SEO title"), ps.title || "", (v) =>
      mutate((p, s) => (pageState(s).title = v)),
    ),
    input(
      T("SEO popis", "SEO description"),
      ps.description || "",
      (v) => mutate((p, s) => (pageState(s).description = v)),
      "textarea",
    ),
  );
}
function designPanel() {
  const panel = $("creator-design");
  panel.parentElement.hidden = state().project.id === "paw";
  if (state().project.id === "paw") return;
  panel.replaceChildren(el("h2", T("Vizuální systém", "Visual system")));
  const d = state().settings.creator.design;
  panel.append(
    select(
      T("Motiv", "Theme preset"),
      Object.entries(themePresets).find(
        ([id, t]) =>
          state().settings.font === t.font &&
          Object.entries(t.design).every(([k, v]) => d[k] === v),
      )?.[0] || "custom",
      [
        ["custom", T("Vlastní / původní", "Custom / original")],
        ...Object.entries(themePresets).map(([id, t]) => [
          id,
          t.name[cs ? 0 : 1],
        ]),
      ],
      (id) => {
        if (!themePresets[id]) return;
        mutate((p, s) => {
          s.font = themePresets[id].font;
          s.creator.design = structuredClone(themePresets[id].design);
          p.color = s.creator.design.primary;
          p.contrast = s.creator.design.contrast;
        });
      },
    ),
  );
  for (const key of Object.keys(fontPairs))
    if (!document.querySelector('link[data-font-pair="' + key + '"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = new URL(
        "./engine/assets/fonts/pairs/" + key + ".css",
        import.meta.url,
      );
      link.dataset.fontPair = key;
      document.head.append(link);
    }
  const samples = el("div", undefined, { className: "font-samples" });
  for (const [id, pair] of Object.entries(fontPairs)) {
    const b = button((cs?pair.csName:pair.name) + " · " + pair.display, () =>
      mutate((p, s) => (s.font = id)),
    );
    b.style.fontFamily = "'" + pair.display + "'";
    samples.append(b);
  }
  panel.append(samples);
  const readability = el(
    "p",
    T("Kontrast textu: ", "Text contrast: ") +
      contrastRatio(d.text || "#25262c", d.background || "#ffffff").toFixed(2) +
      ":1",
  );
  readability.className = "contrast-feedback";
  readability.append(
    el(
      "span",
      contrastRatio(d.text || "#25262c", d.background || "#ffffff") < 4.5
        ? T(
            " — zvyšte kontrast běžného textu.",
            " — increase contrast for body text.",
          )
        : T(" — vhodné pro běžný text.", " — suitable for body text."),
    ),
  );
  panel.append(readability);
  const advanced = el("details", undefined, { className: "creator-advanced" });
  advanced.append(el("summary", T("Pokročilý vzhled", "Advanced design")));
  const advancedPanel = el("div");
  advanced.append(advancedPanel);
  panel.append(advanced);
  for (const k of [
    "primary",
    "contrast",
    "background",
    "text",
    "secondary",
    "accent",
    "surface",
    "muted",
    "border",
    "buttonBackground",
    "buttonText",
  ])
    advancedPanel.append(
      input(
        T(
          {
            primary: "Hlavní barva",
            contrast: "Text na hlavní barvě",
            background: "Pozadí",
            text: "Text",
            secondary: "Vedlejší barva",
            accent: "Akcent",
            surface: "Plochy",
            muted: "Vedlejší text",
            border: "Okraje",
            buttonBackground: "Pozadí tlačítek",
            buttonText: "Text tlačítek",
          }[k],
          { primary: "Brand primary", contrast: "Text on accent" }[k] || k,
        ),
        d[k] ||
          (k === "primary"
            ? state().project.color
            : k === "contrast"
              ? state().project.contrast
              : "#ffffff"),
        (v) =>
          mutate((p, s) => {
            s.creator.design[k] = v;
            if (k === "primary") {
              p.color = v;
              s.creator.design.contrast ||= p.contrast;
            }
            if (k === "contrast") p.contrast = v;
          }),
        "color",
      ),
    );
  for (const [k, label, values] of [
    [
      "scale",
      T("Velikost nadpisů", "Heading scale"),
      ["small", "normal", "large"],
    ],
    [
      "spacing",
      T("Rytmus sekcí", "Section spacing"),
      ["compact", "normal", "airy"],
    ],
    ["width", T("Šířka obsahu", "Content width"), ["narrow", "normal", "wide"]],
    [
      "buttons",
      T("Tlačítka", "Buttons"),
      ["original", "square", "soft", "pill"],
    ],
    ["images", T("Obrázky", "Images"), ["original", "square", "soft", "round"]],
    ["header", T("Hlavička", "Header"), ["original", "minimal", "center"]],
    ["footer", T("Patička", "Footer"), ["original", "minimal", "center"]],
    ["cards", T("Karty", "Cards"), ["original", "flat", "soft", "border"]],
    [
      "navigation",
      T("Navigace", "Navigation"),
      ["original", "pill", "underline"],
    ],
    [
      "backgroundType",
      T("Typ pozadí", "Background type"),
      ["original", "solid", "gradient"],
    ],
    [
      "hero",
      T("Úvodní kompozice", "Hero composition"),
      ["original", "inset", "wide"],
    ],
  ])
    advancedPanel.append(
      select(
        label,
        d[k] || values[0],
        values.map((x) => [
          x,
          cs
            ? {
                small: "Malé",
                normal: "Standardní",
                large: "Velké",
                compact: "Kompaktní",
                airy: "Vzdušné",
                narrow: "Úzké",
                wide: "Široké",
                square: "Hranaté",
                soft: "Jemné",
                pill: "Oblé",
                round: "Zaoblené",
                original: "Původní",
                minimal: "Minimalistické",
                center: "Na střed",
                inset: "Vložené",
                flat: "Ploché",
                border: "Ohraničené",
                underline: "Podtržené",
                solid: "Jednobarevné",
                gradient: "Přechod",
              }[x]
            : x,
        ]),
        (v) => mutate((p, s) => (s.creator.design[k] = v)),
      ),
    );
  for (const [name, font, design] of [
    [
      T("Redakční", "Editorial"),
      "editorial",
      { scale: "large", spacing: "airy", buttons: "square", images: "square" },
    ],
    [
      T("Moderní", "Modern"),
      "modern",
      { scale: "normal", spacing: "normal", buttons: "pill", images: "soft" },
    ],
    [
      T("Kompaktní", "Compact"),
      "brand",
      { scale: "small", spacing: "compact", buttons: "soft", images: "square" },
    ],
  ])
    advancedPanel.append(
      button(name, () =>
        mutate((p, s) => {
          s.font = font;
          s.creator.design = { ...s.creator.design, ...design };
        }),
      ),
    );
}
function mobilePanel(mode) {
  document.body.dataset.creatorMobile = mode;
  document
    .querySelectorAll("[data-creator-mobile]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.creatorMobile === mode)),
    );
}
function fullscreen() {
  document.body.classList.toggle("creator-preview-only");
  $("creator-preview-toggle").setAttribute(
    "aria-pressed",
    String(document.body.classList.contains("creator-preview-only")),
  );
  outline();
}
function init() {
  if (!window.dtmatesEditor) return;
  api = window.dtmatesEditor;
  $("editor-frame").addEventListener("load", outline);
  document.addEventListener("fullscreenchange", outline);
  const originalTemplate = $("editor-template").onchange;
  $("editor-template").onchange = () => {
    if (!choosing && !discard()) {
      $("editor-template").value = state().project.id;
      return;
    }
    originalTemplate();
    if (!choosing) {
      projectId = crypto.randomUUID();
      saved = api.snapshot().configuration;
      savedInDB = false;
    }
  };
  const originalImport = $("import-config").onchange;
  $("import-config").onchange = async () => {
    if (!discard()) {
      $("import-config").value = "";
      return;
    }
    await originalImport();
  };
  for (const b of document.querySelectorAll("[data-font-choice]"))
    b.onclick = () => {
      $("edit-font").value = b.dataset.fontChoice;
      $("edit-font").dispatchEvent(new Event("change"));
    };
  for (const b of document.querySelectorAll("[data-palette]"))
    b.onclick = () => {
      $("edit-color").value = b.dataset.palette;
      $("edit-color").dispatchEvent(new Event("input"));
    };
  for (const b of document.querySelectorAll("[data-editor-action]"))
    b.onclick = () => $(b.dataset.editorAction)?.click();
  new ResizeObserver(() => {
    const dims = $("preview-dimensions");
    if (dims)
      dims.textContent =
        Math.round($("editor-frame").getBoundingClientRect().width) + " px";
  }).observe($("editor-frame"));

  const root = $("editor");
  root.classList.add("creator-workspace");
  document.body.classList.add("creator-active");
  const left = el("aside", undefined, { id: "creator-structure" }),
    right = el("aside", undefined, { className: "creator-inspector" }),
    ctx = el("section", undefined, { id: "creator-context" }),
    design = el("details");
  design.append(
    el("summary", T("Vizuální systém", "Visual system")),
    el("div", undefined, { id: "creator-design" }),
  );
  right.append(ctx, design, $("editor-controls"));
  root.prepend(left);
  root.append(right);
  for (const extra of [...root.children])
    if (
      extra !== left &&
      extra !== right &&
      !extra.classList.contains("editor-preview")
    )
      root.before(extra);
  const tools = el("div", undefined, { className: "creator-commandbar" }),
    name = input(
      T("Název projektu", "Project name"),
      state().project.projectName || state().project.brand,
      (v) => mutate((p) => (p.projectName = v)),
    );
  tools.append(
    el("h1", T("Tvůrce webu", "Website creator")),
    name,
    el("span", T("Místní projekt", "Local project"), { id: "creator-unsaved" }),
    button(T("Šablony", "Templates"), chooser),
    button(T("Uložit projekt", "Save project"), save),
  );
  const preview = button(T("Náhled bez panelů", "Focus preview"), fullscreen);
  preview.id = "creator-preview-toggle";
  preview.setAttribute("aria-pressed", "false");
  tools.append(
    preview,
    button(T("Celá obrazovka", "Full screen"), async () => {
      try {
        if (!$("editor-frame").requestFullscreen)
          throw Error(
            T(
              "Tento prohlížeč nepodporuje celou obrazovku. Použijte náhled bez panelů.",
              "Fullscreen unavailable. Use Focus preview.",
            ),
          );
        await $("editor-frame").requestFullscreen();
      } catch (e) {
        status(e.message);
      }
    }),
    button(T("Stáhnout web", "Download website"), () =>
      $("export-site").click(),
    ),
    button(T("Uložit JSON", "Save JSON"), () => $("export-config").click()),
  );
  const request = el("a", T("Požádat o dokončení ↗", "Request development ↗"), {
    href: "pricing.html?from=website#requirements",
  });
  request.onclick = async (e) => {
    e.preventDefault();
    try {
      await tx("readwrite", (store) =>
        store.put({
          id: projectId,
          name: state().project.projectName || state().project.brand,
          updated: new Date().toISOString(),
          snapshot: api.snapshot(),
        }),
      );
      saved = api.snapshot().configuration;
      await projectStore(
        "readwrite",
        (store) =>
          store.put({
            id: "website-handoff",
            projectId,
            configuration: api.snapshot().configuration,
          }),
        "dtmates-v26-requirements",
      );
      location.assign("pricing.html?from=website#requirements");
    } catch (error) {
      status(error.message);
    }
  };
  $("editor-continue").onclick = request.onclick;
  tools.append(request);
  root.before(tools);
  const mobile = el("nav", undefined, { className: "creator-mobile-tabs" });
  mobile.setAttribute("aria-label", T("Panely editoru", "Creator panels"));
  for (const [id, label] of [
    ["canvas", T("Web", "Canvas")],
    ["pages", T("Stránky", "Pages")],
    ["properties", T("Vlastnosti", "Properties")],
  ]) {
    const b = button(label, () => mobilePanel(id));
    b.dataset.creatorMobile = id;
    mobile.append(b);
  }
  root.before(mobile);
  mobilePanel("canvas");
  const notice = el("p", "", { id: "creator-status", role: "status" });
  tools.after(notice);
  root.before(document.querySelector(".project-locale-bar"));
  const oldReset = $("reset-editor").onclick;
  $("reset-editor").onclick = () => {
    if (confirm(T("Obnovit původní šablonu?", "Reset original template?")))
      oldReset();
  };
  $("choose-template").onclick = chooser;
  window.addEventListener("beforeunload", (e) => {
    if (saved && saved !== api.snapshot().configuration) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      document.body.classList.contains("creator-preview-only")
    )
      fullscreen();
  });
  saved = api.snapshot().configuration;
  drawStructure();
  drawInspector();
  designPanel();
  if (!new URLSearchParams(location.search).has("site")) chooser();
}
document.addEventListener("creator:render", (e) => {
  const pageChanged = key !== e.detail.key;
  catalogue = e.detail.catalogue;
  key = e.detail.key;
  if (pageChanged || !catalogue.some((x) => x.id === selected)) {
    const hero =
      catalogue.find((s) => s.fields.some((f) => f.tag === "H1")) ||
      catalogue[0];
    selected = hero?.id || "";
    field =
      hero?.fields.find((f) => f.tag === "H1")?.id || hero?.fields[0]?.id || "";
  }
  if (api) {
    $("creator-unsaved").textContent =
      saved !== api.snapshot().configuration
        ? T("Neuložené změny", "Unsaved changes")
        : savedInDB
          ? T("Uloženo v tomto prohlížeči", "Saved in this browser")
          : T("Místní projekt", "Local project");
    const name = document.querySelector(".creator-commandbar input");
    if (name && document.activeElement !== name)
      name.value = state().project.projectName || state().project.brand;
    drawStructure();
    if (
      pageChanged ||
      !document.activeElement?.matches(
        "#creator-context input,#creator-context textarea,#creator-context select",
      )
    )
      drawInspector();
    if (!document.activeElement?.closest("#creator-design")) designPanel();
    outline();
  }
});
window.addEventListener("message", (e) => {
  if (
    !api ||
    e.source !== $("editor-frame").contentWindow ||
    e.data?.type !== "creator-select" ||
    e.data.nonce !== api.nonce ||
    document.body.dataset.creatorRendering === "true" ||
    !catalogue.some((s) => s.id === e.data.section)
  )
    return;
  const nextField =
    e.data.field ||
    catalogue.find((s) => s.id === e.data.section).fields[0]?.id;
  if (selected !== e.data.section || field !== nextField) {
    selected = e.data.section;
    field = nextField;
    drawInspector();
  }
  outline();
  if (matchMedia("(max-width:540px)").matches) {
    mobilePanel("properties");
    $("creator-context").scrollIntoView({ block: "start" });
  }
});
if (window.dtmatesEditor) init();
else document.addEventListener("studio:editor-ready", init, { once: true });
export const readProject = (id) => tx("readonly", (s) => s.get(id));
const embed = new URLSearchParams(location.search).get("embed") === "1";
if (embed) document.body.classList.add("creator-embed");
window.addEventListener("message", (e) => {
  if (
    !embed ||
    !api ||
    e.source !== parent ||
    e.origin !== location.origin ||
    e.data?.type !== "creator-lite"
  )
    return;
  const d = e.data;
  if (
    !templates.some((t) => t[0] === d.template) ||
    typeof d.headline !== "string" ||
    d.headline.length > 180 ||
    !/^#[a-f0-9]{6}$/i.test(d.color)
  )
    return;
  if (state().project.id !== d.template) {
    $("editor-template").value = d.template;
    $("editor-template").dispatchEvent(new Event("change"));
  }
  mutate((p, s) => {
    const lang = $("project-language").value;
    p.headline[lang] = d.headline;
    p.color = d.color;
    s.creator.pages[lang + "/"] ||= { edits: {}, order: [], extras: [] };
    s.creator.pages[lang + "/"].heroHeadline = d.headline;
  });
  parent.postMessage(
    { type: "creator-lite-state", configuration: api.snapshot().configuration },
    location.origin,
  );
});
document.addEventListener("studio:editor-ready", () => {
  if (new URLSearchParams(location.search).get("from") === "lite") {
    try {
      const configuration = sessionStorage.getItem("dtmates-v26-lite");
      if (configuration) window.dtmatesEditor.restore({ configuration });
      sessionStorage.removeItem("dtmates-v26-lite");
    } catch (e) {
      status(e.message);
    }
  }
});
