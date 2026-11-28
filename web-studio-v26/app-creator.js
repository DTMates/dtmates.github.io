import {
  makeApp,
  validateApp,
  migrateLegacyApp,
  appTemplates,
  componentTypes,
  palettes,
  appFonts,
} from "./app-model.js";
import { appDocument } from "./app-runtime.js";
import { loadFont, fontPairs } from "./fonts.js";
import { store, download, uploadImage, binaryImages } from "./project-store.js";
import { archive } from "./engine/static-zip.js";
const cs = document.documentElement.lang === "cs",
  T = (a, b) => (cs ? a : b),
  $ = (id) => document.getElementById(id),
  base = new URL("./engine/", import.meta.url),
  params = new URLSearchParams(location.search);
const text = (tag, value) => {
  const n = document.createElement(tag);
  n.textContent = value;
  return n;
};
const B = (label, fn) => {
  const n = text("button", label);
  n.type = "button";
  n.onclick = async () => {
    try {
      await fn();
    } catch (e) {
      status(e.message);
    }
  };
  return n;
};
const status = (value) => {
  if ($("app-status")) $("app-status").textContent = value;
};
function validRuntimeState(value) {
  if (!value || JSON.stringify(value).length > 500000) return {};
  return value;
}
if ($("web-app-demo")) {
  const model = makeApp("portal", cs ? "cs" : "en");
  model.id = "orbit-public-demo";
  const frame = $("web-app-demo"),
    nonce = crypto.randomUUID();
  let state = {};
  try {
    state = JSON.parse(localStorage.getItem("dtmates-v26-orbit-demo") || "{}");
  } catch {}
  frame.srcdoc = appDocument(model, {
    preview: true,
    demo: true,
    nonce,
    origin: location.origin,
    state: validRuntimeState(state),
    fontCSS: await loadFont("modern", base),
  });
  addEventListener("message", (e) => {
    if (
      e.source !== frame.contentWindow ||
      e.data?.nonce !== nonce ||
      e.data.type !== "app-state"
    )
      return;
    try {
      localStorage.setItem(
        "dtmates-v26-orbit-demo",
        JSON.stringify(validRuntimeState(e.data.data)),
      );
      frame.contentWindow.postMessage({ type: "app-state-saved", nonce }, "*");
    } catch {
      frame.contentWindow.postMessage(
        { type: "app-storage-error", nonce },
        "*",
      );
    }
  });
}
if ($("app-creator")) {
  let model = makeApp(
      appTemplates.includes(params.get("template"))
        ? params.get("template")
        : "business",
      cs ? "cs" : "en",
    ),
    screen = model.screens[0].id,
    component = model.screens[0].components[0]?.id,
    history = [],
    future = [],
    saved = JSON.stringify(model),
    savedInDB = false,
    nonce = "",
    runtimeState = {},
    revision = 0,
    timer;
  const readRuntime = () => {
    try {
      return validRuntimeState(
        JSON.parse(
          localStorage.getItem("dtmates-v26-app-runtime-" + model.id) || "{}",
        ),
      );
    } catch {
      return {};
    }
  };
  runtimeState = readRuntime();
  const snap = () => JSON.stringify(model),
    S = () => model.screens.find((s) => s.id === screen) || model.screens[0],
    C = () => S().components.find((c) => c.id === component);
  function mutate(fn, redraw = true) {
    const before = snap(),
      next = structuredClone(model);
    fn(next);
    const clean = validateApp(next);
    if (JSON.stringify(clean) === before) return;
    history.push(before);
    history = history.slice(-35);
    while (
      history.length > 1 &&
      history.reduce((n, s) => n + s.length, 0) > 32e6
    )
      history.shift();
    future = [];
    model = clean;
    if (!model.screens.some((x) => x.id === screen))
      screen = model.screens[0].id;
    if (!C()) component = S().components[0]?.id;
    if (redraw) draw();
    preview();
  }
  function input(label, value, fn, type = "text") {
    const l = text("label", label),
      n = document.createElement(type === "textarea" ? "textarea" : "input");
    if (type !== "textarea") n.type = type;
    n.value = value ?? "";
    n.maxLength = type === "textarea" ? 2000 : 200;
    n.addEventListener("input", () => {
      try {
        fn(n.value);
      } catch (e) {
        status(e.message);
      }
    });
    l.append(n);
    return l;
  }
  function select(label, value, options, fn) {
    const l = text("label", label),
      n = document.createElement("select");
    for (const [k, name] of options) {
      const o = text("option", name);
      o.value = k;
      n.append(o);
    }
    n.value = value;
    n.setAttribute("aria-label", label);
    n.onchange = () => {
      try {
        fn(n.value);
      } catch (e) {
        status(e.message);
      }
    };
    l.append(n);
    return l;
  }
  const newId = (prefix) => prefix + "_" + crypto.randomUUID();
  function addComponent(type) {
    mutate((m) =>
      m.screens
        .find((s) => s.id === screen)
        .components.push({
          id: newId("component"),
          type,
          title: T("Nová komponenta", "New component"),
          text: T("Váš vlastní obsah.", "Your own content."),
          action: { type: "none" },
          progressSource: "manual",
          items:
            type === "form"
              ? [
                  {
                    id: newId("field"),
                    title: T("Jméno", "Name"),
                    status: "text",
                    required: true,
                  },
                  {
                    id: newId("field"),
                    title: T("E-mail", "Email"),
                    status: "email",
                    required: true,
                  },
                  {
                    id: newId("field"),
                    title: T("Vaše poptávka", "Your inquiry"),
                    status: "textarea",
                    required: true,
                  },
                ]
              : ["list", "tabs", "products", "records"].includes(type)
                ? [
                    {
                      id: newId("item"),
                      title: T("První položka", "First item"),
                      body: "",
                      value: 490,
                      status: "planned",
                    },
                  ]
                : [],
        }),
    );
    component = S().components.at(-1).id;
    draw();
    preview();
  }
  async function preview() {
    for (const s of model.screens) {
      const n = document.querySelector('[data-app-screen-id="' + s.id + '"]');
      if (n) n.textContent = s.title;
    }
    for (const c of S().components) {
      const n = document.querySelector('[data-component="' + c.id + '"]');
      if (n) n.textContent = (c.hidden ? "○ " : "● ") + c.title;
    }
    const title = $("app-properties")?.querySelector("h2");
    if (title && C()) title.textContent = C().title;
    clearTimeout(timer);
    document.body.dataset.appRendering = "true";
    $("app-frame").style.pointerEvents = "none";
    const current = ++revision;
    $("app-unsaved").textContent =
      saved === snap()
        ? savedInDB
          ? T("Uloženo v prohlížeči", "Saved in browser")
          : T("Místní projekt", "Local project")
        : T("Neuložené změny", "Unsaved changes");
    $("app-undo").disabled = !history.length;
    $("app-redo").disabled = !future.length;
    timer = setTimeout(async () => {
      try {
        const fontCSS = await loadFont(model.theme.font, base);
        if (current !== revision) return;
        nonce = crypto.randomUUID();
        $("app-frame").onload = () => {
          $("app-frame").style.pointerEvents = "auto";
          post("app-screen", { screen });
          post("app-outline", {
            component: document.body.classList.contains("app-preview-only")
              ? ""
              : component,
          });
          document.body.dataset.appRendering = "false";
        };
        document.body.dataset.appRendering = "true";
        $("app-frame").srcdoc = appDocument(model, {
          preview: true,
          screen,
          nonce,
          origin: location.origin,
          state: runtimeState,
          fontCSS,
        });
      } catch (e) {
        status(e.message);
      }
    }, 100);
  }
  function post(type, values) {
    $("app-frame").contentWindow.postMessage({ type, nonce, ...values }, "*");
  }
  function draw() {
    $("app-name").value = model.name;
    const left = $("app-structure"),
      right = $("app-properties");
    left.replaceChildren(text("h2", T("Obrazovky", "Screens")));
    for (const s of model.screens) {
      const b = B(s.title, () => {
        screen = s.id;
        component = s.components[0]?.id;
        draw();
        post("app-screen", { screen });
        post("app-outline", { component });
      });
      b.dataset.appScreenId = s.id;
      b.setAttribute("aria-current", String(s.id === screen));
      left.append(b);
    }
    left.append(
      B(T("Přidat obrazovku", "Add screen"), () => {
        const id = newId("screen");
        mutate((m) =>
          m.screens.push({
            id,
            title: T("Nová obrazovka", "New screen"),
            inNavigation: true,
            components: [],
          }),
        );
        screen = id;
        component = "";
        draw();
        preview();
      }),
      B(T("Duplikovat obrazovku", "Duplicate screen"), () => {
        const clone = structuredClone(S()),
          old = clone.id;
        clone.id = newId("screen");
        clone.title += " " + T("kopie", "copy");
        clone.components.forEach((c) => {
          c.id = newId("component");
          c.items?.forEach((item) => (item.id = newId("item")));
          if (c.action.target === old) c.action.target = clone.id;
        });
        mutate((m) => m.screens.push(clone));
        screen = clone.id;
        component = clone.components[0]?.id;
        draw();
        preview();
      }),
    );
    left.append(
      input(T("Název obrazovky", "Screen title"), S().title, (v) =>
        mutate(
          (m) => (m.screens.find((s) => s.id === screen).title = v),
          false,
        ),
      ),
      select(
        T("Spodní navigace", "Bottom navigation"),
        String(S().inNavigation),
        [
          ["true", T("Zobrazit", "Show")],
          ["false", T("Skrýt", "Hide")],
        ],
        (v) =>
          mutate(
            (m) =>
              (m.screens.find((s) => s.id === screen).inNavigation =
                v === "true"),
          ),
      ),
      B(T("Posunout obrazovku výš", "Move screen up"), () => {
        const i = model.screens.findIndex((s) => s.id === screen);
        if (i > 0)
          mutate(
            (m) =>
              ([m.screens[i - 1], m.screens[i]] = [
                m.screens[i],
                m.screens[i - 1],
              ]),
          );
      }),
    );
    left.append(text("h2", T("Komponenty", "Components")));
    for (const c of S().components) {
      const b = B((c.hidden ? "○ " : "● ") + c.title, () => {
        component = c.id;
        draw();
        post("app-outline", { component });
      });
      b.dataset.component = c.id;
      left.append(b);
    }
    const add = select(
      T("Přidat komponentu", "Add component"),
      "text",
      componentTypes.map((k) => [
        k,
        cs
          ? {
              hero: "Úvodní blok",
              text: "Text",
              image: "Obrázek",
              button: "Tlačítko",
              card: "Karta",
              list: "Seznam",
              form: "Formulář",
              tabs: "Záložky",
              progress: "Pokrok",
              profile: "Profil",
              products: "Produkty",
              records: "Místní záznamy",
            }[k]
          : k,
      ]),
      () => {},
    );
    left.append(
      add,
      B(T("Přidat komponentu", "Add component"), () =>
        addComponent(add.querySelector("select").value),
      ),
    );
    right.replaceChildren(
      text("h2", C()?.title || T("Vlastnosti aplikace", "App properties")),
    );
    if (C()) {
      const patch = (fn) =>
        mutate(
          (m) =>
            fn(
              m.screens
                .find((s) => s.id === screen)
                .components.find((c) => c.id === component),
            ),
          false,
        );
      right.append(
        input(T("Titulek komponenty", "Component title"), C().title, (v) =>
          patch((c) => (c.title = v)),
        ),
        input(
          T("Text komponenty", "Component text"),
          C().text,
          (v) => patch((c) => (c.text = v)),
          "textarea",
        ),
        input(T("Popis obrázku", "Image alt text"), C().alt, (v) =>
          patch((c) => (c.alt = v)),
        ),
      );
      const photo = input(
        T("Nahrát obrázek", "Upload image"),
        "",
        () => {},
        "file",
      );
      photo.querySelector("input").accept = "image/png,image/jpeg,image/webp";
      photo.querySelector("input").onchange = async (e) => {
        try {
          const image = await uploadImage(e.target.files[0]);
          patch((c) => (c.image = image));
          e.target.value = "";
        } catch (err) {
          status(err.message);
        }
      };
      right.append(
        photo,
        B(T("Odebrat obrázek", "Remove image"), () =>
          patch((c) => (c.image = "")),
        ),
      );
      if (C().type === "button")
        right.append(
          select(
            T("Akce tlačítka", "Button action"),
            C().action.type,
            [
              ["none", T("Pouze náhled", "Preview only")],
              ["navigate", T("Otevřít obrazovku", "Open screen")],
              ["complete", T("Místní dokončení", "Local completion")],
            ],
            (v) =>
              patch((c) => {
                c.action = {
                  type: v,
                  target: v === "navigate" ? model.screens[0].id : "",
                };
              }),
          ),
          select(
            T("Cílová obrazovka", "Target screen"),
            C().action.target || model.screens[0].id,
            model.screens.map((s) => [s.id, s.title]),
            (v) => patch((c) => (c.action = { type: "navigate", target: v })),
          ),
        );
      if (C().type === "progress") {
        right.append(
          select(
            T("Zdroj pokroku", "Progress source"),
            C().progressSource,
            [
              ["manual", T("Ručně nastavené", "Manual")],
              ["lessons", T("Dokončené lekce", "Completed lessons")],
              ["records", T("Stav záznamů", "Record status")],
            ],
            (v) =>
              mutate(
                (m) =>
                  (m.screens
                    .find((s) => s.id === screen)
                    .components.find((c) => c.id === component).progressSource =
                    v),
              ),
          ),
        );
        if (C().progressSource === "manual")
          right.append(
            input(
              T("Výchozí pokrok", "Initial progress"),
              C().value,
              (v) => patch((c) => (c.value = Number(v))),
              "number",
            ),
          );
      }
      if (C().type === "form")
        right.append(
          input(
            T("Text odesílacího tlačítka", "Submit button label"),
            C().submitLabel,
            (v) => patch((c) => (c.submitLabel = v)),
          ),
        );
      const appearance = elAppearance();
      right.append(appearance);
      function elAppearance() {
        const box = document.createElement("details");
        box.append(
          text("summary", T("Vzhled komponenty", "Component appearance")),
        );
        const a = C().appearance;
        box.append(
          select(
            T("Rozložení komponenty", "Component layout"),
            a.layout,
            [
              ["original", T("Původní", "Original")],
              ["compact", T("Kompaktní", "Compact")],
              ["inset", T("Vložené", "Inset")],
              ["wide", T("Přes šířku", "Wide")],
            ],
            (v) => patch((c) => (c.appearance.layout = v)),
          ),
          select(
            T("Zarovnání", "Alignment"),
            a.align,
            [
              ["start", T("Vlevo", "Start")],
              ["center", T("Na střed", "Center")],
            ],
            (v) => patch((c) => (c.appearance.align = v)),
          ),
          select(
            T("Obrázek", "Image fit"),
            a.imageFit,
            [
              ["cover", T("Vyplnit", "Cover")],
              ["contain", T("Celý obrázek", "Contain")],
            ],
            (v) => patch((c) => (c.appearance.imageFit = v)),
          ),
          select(
            T("Nadpis", "Heading size"),
            a.headingScale,
            [
              ["small", T("Menší", "Small")],
              ["normal", T("Standardní", "Normal")],
              ["large", T("Větší", "Large")],
            ],
            (v) => patch((c) => (c.appearance.headingScale = v)),
          ),
          input(
            T("Pozadí komponenty", "Component background"),
            a.background || model.theme.surface,
            (v) => patch((c) => (c.appearance.background = v)),
            "color",
          ),
          input(
            T("Text komponenty — barva", "Component text color"),
            a.foreground || model.theme.text,
            (v) => patch((c) => (c.appearance.foreground = v)),
            "color",
          ),
          B(T("Obnovit vzhled komponenty", "Reset component appearance"), () =>
            mutate(
              (m) =>
                (m.screens
                  .find((s) => s.id === screen)
                  .components.find((c) => c.id === component).appearance = {}),
            ),
          ),
        );
        return box;
      }
      const actions = text("div", "");
      for (const [delta, label] of [
        [-1, T("Posunout komponentu výš", "Move component up")],
        [1, T("Posunout komponentu níž", "Move component down")],
      ]) {
        const b = B(label, () => {
          const i = S().components.findIndex((c) => c.id === component),
            j = i + delta;
          if (j >= 0 && j < S().components.length)
            mutate((m) => {
              const a = m.screens.find((s) => s.id === screen).components;
              [a[i], a[j]] = [a[j], a[i]];
            });
        });
        const i = S().components.findIndex((c) => c.id === component);
        b.disabled = delta < 0 ? i === 0 : i === S().components.length - 1;
        actions.append(b);
      }
      right.append(
        actions,
        B(
          C().hidden
            ? T("Zobrazit komponentu", "Show component")
            : T("Skrýt komponentu", "Hide component"),
          () =>
            mutate((m) => {
              const c = m.screens
                .find((s) => s.id === screen)
                .components.find((c) => c.id === component);
              c.hidden = !c.hidden;
            }),
        ),
        B(T("Odebrat komponentu", "Remove component"), () => {
          if (confirm(T("Odebrat komponentu?", "Remove component?")))
            mutate((m) => {
              const s = m.screens.find((s) => s.id === screen);
              s.components = s.components.filter((c) => c.id !== component);
            });
        }),
      );
      if (
        ["list", "tabs", "products", "records", "card", "form"].includes(
          C().type,
        )
      ) {
        const details = document.createElement("details");
        details.append(text("summary", T("Položky a karty", "Items & cards")));
        for (const item of C().items) {
          const field = text("fieldset", "");
          field.append(
            input(
              C().type === "form"
                ? T("Popisek pole", "Field label")
                : T("Název položky", "Item title"),
              item.title,
              (v) =>
                patch((c) => (c.items.find((x) => x.id === item.id).title = v)),
            ),
            input(
              C().type === "form"
                ? T("Nápověda pole", "Field placeholder")
                : T("Popis položky", "Item description"),
              item.body,
              (v) =>
                patch((c) => (c.items.find((x) => x.id === item.id).body = v)),
              "textarea",
            ),
          );
          if (C().type === "products")
            field.append(
              input(
                T("Cena CZK", "Price CZK"),
                item.value,
                (v) =>
                  patch(
                    (c) =>
                      (c.items.find((x) => x.id === item.id).value = Number(v)),
                  ),
                "number",
              ),
            );
          if (C().type === "records")
            field.append(
              select(
                T("Stav položky", "Item status"),
                item.status,
                [
                  ["planned", T("Plánované", "Planned")],
                  ["active", T("Probíhá", "Active")],
                  ["done", T("Dokončené", "Done")],
                ],
                (v) =>
                  patch(
                    (c) => (c.items.find((x) => x.id === item.id).status = v),
                  ),
              ),
            );
          if (C().type === "form")
            field.append(
              select(
                T("Typ pole", "Field type"),
                ["text", "email", "number", "date", "textarea"].includes(
                  item.status,
                )
                  ? item.status
                  : "text",
                [
                  ["text", T("Text", "Text")],
                  ["email", "Email"],
                  ["number", T("Číslo", "Number")],
                  ["date", T("Datum", "Date")],
                  ["textarea", T("Dlouhý text", "Long text")],
                ],
                (v) =>
                  patch(
                    (c) => (c.items.find((x) => x.id === item.id).status = v),
                  ),
              ),
              select(
                T("Povinné pole", "Required field"),
                String(item.required),
                [
                  ["true", T("Ano", "Yes")],
                  ["false", T("Ne", "No")],
                ],
                (v) =>
                  patch(
                    (c) =>
                      (c.items.find((x) => x.id === item.id).required =
                        v === "true"),
                  ),
              ),
            );
          const image = input(
            T("Obrázek položky", "Item image"),
            "",
            () => {},
            "file",
          );
          image.querySelector("input").accept =
            "image/png,image/jpeg,image/webp";
          image.querySelector("input").onchange = async (e) => {
            try {
              const src = await uploadImage(e.target.files[0]);
              patch((c) => (c.items.find((x) => x.id === item.id).image = src));
            } catch (err) {
              status(err.message);
            }
          };
          field.append(
            B(T("Odebrat položku", "Remove item"), () =>
              mutate((m) => {
                const c = m.screens
                  .find((s) => s.id === screen)
                  .components.find((c) => c.id === component);
                c.items = c.items.filter((x) => x.id !== item.id);
              }),
            ),
          );
          if (["list", "card", "products", "tabs"].includes(C().type))
            field.append(image);
          details.append(field);
        }
        details.append(
          B(T("Přidat položku", "Add item"), () =>
            mutate((m) =>
              m.screens
                .find((s) => s.id === screen)
                .components.find((c) => c.id === component)
                .items.push({
                  id: newId("item"),
                  title: T("Nová položka", "New item"),
                  body: "",
                  value: 0,
                  status: "planned",
                }),
            ),
          ),
        );
        right.append(details);
      }
    }
    const d = document.createElement("details");
    d.className = "app-design";
    d.append(text("summary", T("Vzhled a nastavení", "Design & settings")));
    d.append(
      input(
        T("Popis aplikace", "App description"),
        model.description,
        (v) => mutate((m) => (m.description = v), false),
        "textarea",
      ),
      select(
        T("Jazyk obsahu", "Content language"),
        model.locale,
        [
          ["cs", "Čeština"],
          ["en", "English"],
        ],
        (v) => mutate((m) => (m.locale = v), false),
      ),
      select(
        T("Písmo", "Font pair"),
        model.theme.font,
        appFonts.map((k) => [k, (cs?fontPairs[k].csName:fontPairs[k].name)]),
        (v) => mutate((m) => (m.theme.font = v), false),
      ),
    );
    for (const [key, palette] of Object.entries(palettes))
      d.append(
        B(
          T("Motiv ", "Theme ") +
            (cs
              ? {
                  modern: "současný",
                  editorial: "redakční",
                  organic: "přírodní",
                  dark: "tmavý",
                }[key]
              : key),
          () => mutate((m) => (m.theme = { ...m.theme, ...palette })),
        ),
      );
    for (const k of [
      "primary",
      "accent",
      "background",
      "surface",
      "text",
      "muted",
      "border",
    ])
      d.append(
        input(
          k,
          model.theme[k],
          (v) => mutate((m) => (m.theme[k] = v), false),
          "color",
        ),
      );
    d.append(
      input(
        T("Zaoblení", "Corner radius"),
        model.theme.radius,
        (v) => mutate((m) => (m.theme.radius = Number(v)), false),
        "number",
      ),
    );
    const icon = input(T("Ikona aplikace", "App icon"), "", () => {}, "file");
    icon.querySelector("input").accept = "image/png,image/jpeg,image/webp";
    icon.querySelector("input").onchange = async (e) => {
      try {
        const src = await uploadImage(e.target.files[0]);
        mutate((m) => (m.icon = src));
      } catch (err) {
        status(err.message);
      } finally {
        e.target.value = "";
      }
    };
    d.append(icon);
    right.append(d);
  }
  async function library() {
    const target = $("app-projects");
    target.replaceChildren();
    try {
      for (const record of await store("readonly", (s) => s.getAll()))
        target.append(
          B(record.model.name, () => {
            if (!discard()) return;
            model = validateApp(record.model);
            screen = model.screens[0].id;
            component = S().components[0]?.id;
            history = [];
            future = [];
            saved = snap();
            savedInDB = true;
            runtimeState = readRuntime();
            $("app-library-dialog").close();
            draw();
            preview();
          }),
        );
      if (!target.childNodes.length)
        target.append(
          text(
            "p",
            T("Zatím nemáte uložený projekt.", "No saved projects yet."),
          ),
        );
    } catch (e) {
      status(e.message);
    }
    $("app-library-dialog").showModal();
    for (const card of document.querySelectorAll("[data-app-template-card]"))
      if (!card.querySelector("iframe")) {
        const sample = makeApp(card.dataset.appTemplateCard, cs ? "cs" : "en"),
          f = document.createElement("iframe");
        f.title = sample.name;
        f.setAttribute("sandbox", "allow-scripts");
        f.tabIndex = -1;
        f.srcdoc = appDocument(sample, {
          preview: true,
          nonce: crypto.randomUUID(),
          origin: location.origin,
          fontCSS: await loadFont(sample.theme.font, base),
        });
        card.querySelector(".app-mini").replaceChildren(f);
      }
  }
  function discard() {
    return (
      saved === snap() ||
      confirm(
        T(
          "Nahradit aktuální návrh? Nejprve si jej můžete uložit.",
          "Replace the current design? Save it first if needed.",
        ),
      )
    );
  }
  $("app-name").oninput = (e) =>
    mutate((m) => (m.name = e.target.value), false);
  $("app-library").onclick = library;
  $("app-library-close").onclick = () => $("app-library-dialog").close();
  $("app-save").onclick = async () => {
    try {
      await store("readwrite", (s) =>
        s.put({ id: model.id, model, updated: new Date().toISOString() }),
      );
      saved = snap();
      savedInDB = true;
      preview();
      status(
        T(
          "Projekt uložen v tomto prohlížeči.",
          "Project saved in this browser.",
        ),
      );
    } catch (e) {
      status(
        T(
          "Uložení se nezdařilo. Stáhněte JSON. ",
          "Save failed. Download JSON. ",
        ) + e.message,
      );
    }
  };
  $("app-undo").onclick = () => {
    if (!history.length) return;
    future.push(snap());
    model = validateApp(JSON.parse(history.pop()));
    draw();
    preview();
  };
  $("app-redo").onclick = () => {
    if (!future.length) return;
    history.push(snap());
    model = validateApp(JSON.parse(future.pop()));
    draw();
    preview();
  };
  $("app-focus").onclick = () => {
    document.body.classList.toggle("app-preview-only");
    $("app-focus").setAttribute(
      "aria-pressed",
      String(document.body.classList.contains("app-preview-only")),
    );
    post("app-outline", {
      component: document.body.classList.contains("app-preview-only")
        ? ""
        : component,
    });
  };
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      document.body.classList.contains("app-preview-only")
    )
      $("app-focus").click();
  });
  for (const b of document.querySelectorAll("[data-app-panel]"))
    b.onclick = () => {
      document.body.dataset.appPanel = b.dataset.appPanel;
      document
        .querySelectorAll("[data-app-panel]")
        .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    };
  document.body.dataset.appPanel = "canvas";
  for (const b of document.querySelectorAll("[data-app-width]"))
    b.onclick = () => {
      $("app-frame").style.width = b.dataset.appWidth + "px";
      document
        .querySelectorAll("[data-app-width]")
        .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    };
  for (const b of document.querySelectorAll("[data-app-template]"))
    b.onclick = () => {
      if (!discard()) return;
      model = makeApp(b.dataset.appTemplate, cs ? "cs" : "en");
      screen = model.screens[0].id;
      component = S().components[0]?.id;
      history = [];
      future = [];
      runtimeState = readRuntime();
      saved = snap();
      savedInDB = false;
      $("app-library-dialog").close();
      draw();
      preview();
    };
  $("app-reset").onclick = () => {
    if (confirm(T("Obnovit návrh?", "Reset this design?"))) {
      model = makeApp(model.template, model.locale);
      screen = model.screens[0].id;
      component = S().components[0]?.id;
      saved = snap();
      savedInDB = false;
      history = [];
      future = [];
      runtimeState = readRuntime();
      draw();
      preview();
      $("app-library-dialog").close();
    }
  };
  $("app-json").onclick = () =>
    download("dtmates-app-project.json", JSON.stringify(model, null, 2));
  $("app-import").onchange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file || file.size > 25e6) throw Error("Invalid file");
      const next = migrateLegacyApp(
        JSON.parse(await file.text()),
        cs ? "cs" : "en",
      );
      if (!discard()) return;
      model = next;
      screen = model.screens[0].id;
      component = S().components[0]?.id;
      history = [];
      future = [];
      saved = snap();
      savedInDB = false;
      runtimeState = readRuntime();
      draw();
      preview();
      $("app-library-dialog").close();
      status(
        T(
          "Konfigurace ověřena a načtena.",
          "Configuration validated and loaded.",
        ),
      );
    } catch (err) {
      status(err.message);
    }
    e.target.value = "";
  };
  $("app-export").onclick = async () => {
    const b = $("app-export");
    b.disabled = true;
    try {
      status(
        T("Připravuji samostatný prototyp…", "Preparing standalone prototype…"),
      );
      const files = {},
        copy = await binaryImages(structuredClone(model), files, location.href),
        fontCSS = await loadFont(model.theme.font, base, files);
      files["index.html"] = appDocument(copy, { fontCSS });
      files["app-project.json"] = JSON.stringify(model, null, 2);
      files["manifest.webmanifest"] = JSON.stringify({
        name: model.name,
        short_name: model.name.slice(0, 20),
        start_url: "./",
        scope: "./",
        display: "standalone",
        background_color: model.theme.background,
        theme_color: model.theme.primary,
        icons: [
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      });
      files["icon.svg"] =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="42" fill="' +
        model.theme.primary +
        '"/><path d="M48 96h96M96 48v96" stroke="white" stroke-width="18"/></svg>';
      // Real raster icons, including the owner's uploaded icon, are packaged locally.
      const iconCanvas = document.createElement("canvas");
      let bitmap;
      if (copy.icon)
        bitmap = await createImageBitmap(new Blob([files[copy.icon]]));
      for (const size of [192, 512]) {
        iconCanvas.width = size;
        iconCanvas.height = size;
        const ctx = iconCanvas.getContext("2d");
        ctx.fillStyle = model.theme.primary;
        ctx.fillRect(0, 0, size, size);
        if (bitmap) ctx.drawImage(bitmap, 0, 0, size, size);
        else {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold " + Math.round(size * 0.55) + "px system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(model.name.slice(0, 1), size / 2, size / 2);
        }
        const blob = await new Promise((resolve) =>
          iconCanvas.toBlob(resolve, "image/png"),
        );
        files["icon-" + size + ".png"] = new Uint8Array(
          await blob.arrayBuffer(),
        );
      }
      bitmap?.close();
      const manifest = JSON.parse(files["manifest.webmanifest"]);
      manifest.icons = [192, 512].map((size) => ({
        src: "icon-" + size + ".png",
        sizes: size + "x" + size,
        type: "image/png",
        purpose: "any",
      }));
      files["manifest.webmanifest"] = JSON.stringify(manifest);
      const cache = "dtmates-" + model.id + "-" + crypto.randomUUID();
      files["sw.js"] =
        `const CACHE=${JSON.stringify(cache)},FILES=${JSON.stringify(["./", ...Object.keys(files).map((p) => "./" + p)])};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(${JSON.stringify("dtmates-" + model.id + "-")})&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method==='GET'&&new URL(e.request.url).origin===location.origin)e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});`;
      files["README.txt"] =
        "DTMates interactive web-app prototype. Serve this directory over HTTP/HTTPS. Offline caching needs HTTPS or localhost and a first successful visit. No APK/IPA, authentication, backend, payment or email service. Local demo state stays in this browser. App project JSON is editable in DTMates V26. Fonts retain their OFL licenses.";
      download(
        "dtmates-" + model.template + "-prototype.zip",
        archive(files),
        "application/zip",
      );
      status(
        T(
          "Samostatný prototyp stažen. APK/IPA není součástí.",
          "Standalone prototype downloaded. No APK/IPA included.",
        ),
      );
    } catch (e) {
      status(T("Export se nezdařil: ", "Export failed: ") + e.message);
    } finally {
      b.disabled = false;
    }
  };
  $("app-quote").onclick = async (e) => {
    e.preventDefault();
    try {
      await store(
        "readwrite",
        (s) =>
          s.put({
            id: "app-handoff",
            model,
            updated: new Date().toISOString(),
          }),
        "dtmates-v26-requirements",
      );
      location.assign("pricing.html?from=app#requirements");
    } catch (err) {
      status(err.message);
    }
  };
  addEventListener("message", (e) => {
    if (e.source !== $("app-frame").contentWindow || e.data?.nonce !== nonce)
      return;
    if (e.data.type === "app-state") {
      runtimeState = validRuntimeState(e.data.data);
      try {
        localStorage.setItem(
          "dtmates-v26-app-runtime-" + model.id,
          JSON.stringify(runtimeState),
        );
        post("app-state-saved", {});
      } catch {
        post("app-storage-error", {});
      }
    }
    if (
      e.data.type === "app-navigation" &&
      model.screens.some((s) => s.id === e.data.screen)
    ) {
      if (screen !== e.data.screen) {
        screen = e.data.screen;
        if (!C()) component = S().components[0]?.id;
        draw();
      }
      post("app-outline", {
        component: document.body.classList.contains("app-preview-only")
          ? ""
          : component,
      });
    }
    if (
      e.data.type === "app-select" &&
      model.screens.some(
        (s) =>
          s.id === e.data.screen &&
          s.components.some((c) => c.id === e.data.component),
      )
    ) {
      screen = e.data.screen;
      component = e.data.component;
      draw();
      post("app-outline", { component });
      if (matchMedia("(max-width:700px)").matches)
        document.body.dataset.appPanel = "properties";
    }
  });
  $("app-frame").style.width = matchMedia("(max-width:700px)").matches
    ? "320px"
    : "390px";
  window.appEditor = {
    snapshot: () => ({
      model: structuredClone(model),
      history: [...history],
      future: [...future],
      saved,
      savedInDB,
      screen,
      component,
    }),
    restore: (value) => {
      const next = validateApp(value.model);
      model = next;
      runtimeState = readRuntime();
      history = (value.history || []).slice(-35);
      future = (value.future || []).slice(-35);
      saved = typeof value.saved === "string" ? value.saved : snap();
      savedInDB = value.savedInDB === true;
      screen = model.screens.some((s) => s.id === value.screen)
        ? value.screen
        : model.screens[0].id;
      component = value.component;
      draw();
      preview();
    },
    edit: (fn) => mutate(fn),
    model: () => structuredClone(model),
  };
  addEventListener("beforeunload", (e) => {
    if (saved !== snap()) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  draw();
  preview();
  if (!params.has("template")) library();
  document.dispatchEvent(new Event("app:ready"));
}
