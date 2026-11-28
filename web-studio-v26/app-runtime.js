import { validateApp } from "./app-model.js";
export const appCSS = `dialog{max-width:min(90vw,390px);padding:26px;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:18px}dialog::backdrop{background:#15142188}dialog button{margin:8px 8px 0 0}*{box-sizing:border-box}html{color-scheme:light}body{margin:0;background:var(--background);color:var(--text);font:16px/1.5 var(--body,system-ui)}button,input,select,textarea{font:inherit;color:inherit}button,a,input,select,textarea{min-height:44px}button,a{touch-action:manipulation}button{cursor:pointer}button:disabled{opacity:.5;cursor:default}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid var(--primary);outline-offset:3px}button,.action{border:0;border-radius:var(--radius);padding:11px 17px;background:var(--primary);color:var(--on-primary);font-weight:650}button.secondary{background:var(--surface);color:var(--text);border:1px solid var(--border)}.app-shell{max-width:620px;margin:auto;min-height:100vh;padding:0 20px 100px}.app-top{padding:25px 0 18px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border);margin-bottom:22px}.app-top img{width:38px;height:38px;object-fit:cover;border-radius:10px}.app-top strong{font-size:18px;flex:1}.app-top small{font-size:12px;color:var(--muted)}h1,h2,h3{font-family:var(--display,inherit);line-height:1.12;letter-spacing:-.035em}h1{font-size:clamp(32px,9vw,52px);margin:15px 0}h2{font-size:25px}h3{font-size:20px}p{color:var(--muted)}.component{margin:20px 0;padding:24px;background:var(--surface);border-radius:var(--radius);border:1px solid var(--border);overflow-wrap:anywhere}.component.hero{background:var(--primary);color:var(--on-primary);border:0;padding:30px 25px}.hero p{color:inherit;opacity:.88}.component img{width:100%;max-height:280px;object-fit:cover;border-radius:var(--radius)}.component.text,.component.button{background:none;border:0;padding:5px 0}.app-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:min(100%,620px);display:flex;gap:4px;background:var(--surface);border-top:1px solid var(--border);padding:10px 8px max(12px,env(safe-area-inset-bottom));z-index:5}.app-nav button{flex:1;min-width:0;padding:10px 4px;font-size:14px;background:transparent;color:var(--muted)}.app-nav button[aria-current=page]{color:var(--primary);background:color-mix(in srgb,var(--primary) 12%,var(--surface))}.item{padding:16px 0;border-bottom:1px solid var(--border);display:grid;gap:10px}.item:last-child{border:0}.item h3,.item p{margin:0}.item .actions,.actions{display:flex;gap:8px;flex-wrap:wrap}.item img{max-height:180px}.tag{color:var(--primary);font-size:14px}.component form{display:grid;gap:12px}label{display:grid;gap:7px;font-size:14px}input,textarea,select{width:100%;padding:10px;border:1px solid var(--border);background:var(--surface);border-radius:8px}progress{width:100%;height:15px;accent-color:var(--primary)}.app-status{padding:0 20px;color:var(--primary);position:relative;min-height:24px}.demo-label{font-size:13px;color:var(--muted);display:block;margin-top:25px}.app-reset{display:block;margin:30px auto}.app-product-detail{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px}.component[data-selected=true]{outline:3px solid #5148be;outline-offset:3px}@media(prefers-reduced-motion:no-preference){.app-screen{animation:enter .23s ease-out}@keyframes enter{from{opacity:.4;transform:translateY(9px)}to{opacity:1;transform:none}}}@media(min-width:900px){body.application-demo .app-shell{max-width:1100px;padding-left:210px}.application-demo .app-nav{top:0;bottom:0;left:max(0px,calc((100vw - 1100px)/2));transform:none;width:190px;flex-direction:column;justify-content:center;border:0;border-right:1px solid var(--border);padding:25px}.application-demo .app-nav button{flex:0;text-align:left;padding:15px}.application-demo .app-screen{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.application-demo .component{margin:0}.application-demo .component.records{grid-column:1/-1}.application-demo .app-top{padding-top:35px}}`;
// Trusted runtime only. All customer content is rendered with DOM text APIs.
export function appRuntime(model, options = {}) {
  const cs = model.locale === "cs",
    T = (a, b) => (cs ? a : b),
    $ = (s) => document.querySelector(s),
    storageKey = "dtmates-prototype-" + model.id;
  let data = { done: [], bag: {}, favourites: [], records: {} },
    screen = model.screens.some(s=>s.id===options.screen)?options.screen:model.screens[0].id,
    selectedProduct = null,
    search = "";
  try {
    data = { ...data, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
  } catch {}
  if (options.state) data = { ...data, ...options.state };
  const safeKey = (s) =>
    typeof s === "string" &&
    /^[a-z0-9_-]{1,80}$/i.test(s) &&
    !["__proto__", "constructor", "prototype"].includes(s);
  data.done = Array.isArray(data.done)
    ? data.done.filter(safeKey).slice(0, 500)
    : [];
  data.favourites = Array.isArray(data.favourites)
    ? data.favourites.filter(safeKey).slice(0, 500)
    : [];
  data.bag = Object.fromEntries(
    Object.entries(data.bag && typeof data.bag === "object" ? data.bag : {})
      .filter(([k]) => safeKey(k))
      .map(([k, v]) => [k, Math.max(0, Math.min(99, Number(v) || 0))]),
  );
  data.records = Object.fromEntries(
    Object.entries(
      data.records && typeof data.records === "object" ? data.records : {},
    )
      .filter(([k, v]) => safeKey(k) && Array.isArray(v))
      .map(([k, v]) => [
        k,
        v.slice(0, 100).map((x, i) => ({
          id: safeKey(x.id) ? x.id : "record" + i,
          title: String(x.title || "").slice(0, 120),
          body: String(x.body || "").slice(0, 600),
          status: ["planned", "active", "done"].includes(x.status)
            ? x.status
            : "planned",
        })),
      ]),
  );
  let awaitingDurable = false,
    pendingStatus = "",
    storageFailed = false;
  function persist() {
    let durable = false;
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      durable = true;
    } catch {}
    if (options.preview) {
      awaitingDurable = true;
      parent.postMessage(
        { type: "app-state", nonce: options.nonce, data },
        options.origin,
      );
    } else if (!durable) {
      storageFailed = true;
      status(
        T("Místní uložení není dostupné.", "Local saving is unavailable."),
      );
    }
  }
  const el = (tag, text, attrs = {}) => {
    const n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };
  const button = (title, fn, secondary = false) => {
    const b = el("button", title, { type: "button" });
    if (secondary) b.className = "secondary";
    b.onclick = fn;
    return b;
  };
  const status = (text) => {
    if (storageFailed) {
      $(".app-status").textContent = T(
        "Místní uložení není dostupné.",
        "Local saving is unavailable.",
      );
      return;
    }
    if (awaitingDurable) {
      pendingStatus = text;
      $(".app-status").textContent = T(
        "Ukládám místní změny…",
        "Saving local changes…",
      );
      return;
    }
    $(".app-status").textContent = text;
  };
  function ask(message, confirmAction) {
    const dialog = el("dialog"),
      title = el("h2", message),
      id = "confirm-" + crypto.randomUUID();
    title.id = id;
    dialog.setAttribute("aria-labelledby", id);
    dialog.append(
      title,
      button(T("Zrušit", "Cancel"), () => dialog.close(), true),
      button(T("Potvrdit", "Confirm"), () => {
        dialog.close();
        confirmAction();
      }),
    );
    dialog.addEventListener("close", () => dialog.remove(), { once: true });
    document.body.append(dialog);
    dialog.showModal();
  }
  function allProducts() {
    return model.screens
      .flatMap((s) => s.components)
      .filter((c) => c.type === "products" && c.items.length)
      .flatMap((c) => c.items);
  }
  const product = (id) => allProducts().find((x) => x.id === id);
  function image(parent, src, alt) {
    if (src)
      parent.append(
        el("img", undefined, { src, alt: alt || "", loading: "lazy" }),
      );
  }
  function fields(form, values = {}) {
    for (const [k, label] of [
      ["title", T("Název", "Name")],
      ["body", T("Klient / poznámka", "Client / note")],
    ]) {
      const l = el("label", label),
        i = el("input", undefined, {
          name: k,
          maxlength: k === "title" ? "120" : "600",
        });
      i.required = k === "title";
      i.value = values[k] || "";
      l.append(i);
      form.append(l);
    }
    const l = el("label", T("Stav", "Status")),
      s = el("select", undefined, { name: "status" });
    for (const [k, name] of [
      ["planned", T("Plánované", "Planned")],
      ["active", T("Probíhá", "Active")],
      ["done", T("Dokončené", "Done")],
    ])
      s.append(el("option", name, { value: k }));
    s.value = values.status || "planned";
    l.append(s);
    form.append(l);
  }
  function records(root, c) {
    data.records[c.id] ||= structuredClone(c.items);
    const list = data.records[c.id];
    const filter = el("input", undefined, {
      type: "search",
      placeholder: T("Hledat název nebo klienta", "Search name or client"),
      "aria-label": T("Hledat záznamy", "Search records"),
    });
    filter.value = search;
    filter.oninput = () => {
      search = filter.value;
      drawRows();
    };
    root.append(filter);
    const form = el("form");
    fields(form);
    const submit = el("button", T("Přidat záznam", "Add record"), {
      type: "submit",
    });
    form.append(submit);
    root.append(form);
    let editing = null;
    form.onsubmit = (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const values = Object.fromEntries(new FormData(form));
      if (editing) {
        Object.assign(
          list.find((x) => x.id === editing),
          values,
        );
        editing = null;
        submit.textContent = T("Přidat záznam", "Add record");
      } else {
        if (list.length >= 100)
          return status(T("Maximum je 100 záznamů.", "Maximum 100 records."));
        list.push({ id: crypto.randomUUID(), ...values });
      }
      form.reset();
      persist();
      drawRows();
      status(
        T("Záznam uložen v tomto prohlížeči.", "Record saved in this browser."),
      );
    };
    const rows = el("div", undefined, { "data-records": "" });
    root.append(rows);
    function drawRows() {
      rows.replaceChildren();
      const matching = list.filter((x) =>
        (x.title + " " + x.body + " " + x.status)
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase()),
      );
      if (!matching.length)
        rows.append(
          el("p", T("Žádné odpovídající záznamy.", "No matching records.")),
        );
      for (const x of matching) {
        const row = el("article", undefined, { class: "item" });
        row.append(
          el("h3", x.title),
          el("p", x.body),
          el("span", ({planned:T("Plánované","Planned"),active:T("Probíhá","Active"),done:T("Dokončené","Done")})[x.status]||x.status, { class: "tag","data-record-status":x.status }),
        );
        row.append(
          button(
            T("Upravit", "Edit"),
            () => {
              editing = x.id;
              for (const k of ["title", "body", "status"])
                form.elements[k].value = x[k] || "";
              submit.textContent = T("Uložit změny", "Save changes");
              form.elements.title.focus();
            },
            true,
          ),
          button(
            T("Dokončit", "Mark done"),
            () => {
              x.status = "done";
              persist();
              drawRows();
            },
            true,
          ),
          button(
            T("Smazat", "Delete"),
            () => {
              ask(T("Smazat tento záznam?", "Delete this record?"), () => {
                list.splice(list.indexOf(x), 1);
                persist();
                drawRows();
              });
            },
            true,
          ),
        );
        rows.append(row);
      }
    }
    drawRows();
  }
  let rendering = false,
    renderQueued = false;
  function render() {
    if (rendering) {
      if (!renderQueued) {
        renderQueued = true;
        queueMicrotask(() => {
          renderQueued = false;
          render();
        });
      }
      return;
    }
    rendering = true;
    try {
      const root = $("#app");
      root.replaceChildren();
      const shell = el("div", undefined, { class: "app-shell" }),
        header = el("header", undefined, { class: "app-top" });
      image(header, model.icon, model.name);
      header.append(
        el("strong", model.name),
        el("small", T("Interaktivní prototyp", "Interactive prototype")),
      );
      shell.append(header);
      const main = el("main", undefined, {
          class: "app-screen",
          "data-screen": screen,
        }),
        current =
          model.screens.find((x) => x.id === screen) || model.screens[0];
      main.setAttribute("aria-label", current.title);
      if (selectedProduct) {
        const x = product(selectedProduct);
        if (x) {
          const detail = el("article", undefined, {
            class: "app-product-detail",
          });
          image(detail, x.image, x.title);
          detail.append(
            el("h1", x.title),
            el("p", x.body),
            el("strong", x.value + " CZK"),
            button(
              T("Zpět k výběru", "Back to products"),
              () => {
                selectedProduct = null;
                render();
              },
              true,
            ),
            button(T("Přidat do tašky", "Add to bag"), () => {
              data.bag[x.id] = (data.bag[x.id] || 0) + 1;
              persist();
              render();
              status(T("Přidáno do tašky.", "Added to bag."));
            }),
          );
          main.append(detail);
        }
      } else
        for (const c of current.components.filter((x) => !x.hidden)) {
          const section = el("section", undefined, {
            class: "component " + c.type,
            "data-app-component": c.id,
          });
          if (options.preview)
            section.addEventListener(
              "click",
              () =>
                parent.postMessage(
                  {
                    type: "app-select",
                    nonce: options.nonce,
                    screen: current.id,
                    component: c.id,
                  },
                  options.origin,
                ),
              true,
            );
          const a = c.appearance || {};
          if (a.background) section.style.backgroundColor = a.background;
          if (a.foreground) {
            section.style.color = a.foreground;
            section.style.setProperty("--muted", a.foreground);
          }
          section.style.textAlign = a.align || "start";
          if (a.layout === "compact") section.style.padding = "14px";
          if (a.layout === "inset") {
            section.style.marginInline = "12px";
            section.style.width = "calc(100% - 24px)";
          }
          if (a.layout === "wide") {
            section.style.marginInline = "-20px";
            section.style.width = "calc(100% + 40px)";
            section.style.borderRadius = "0";
          }
          if (c.title && c.type !== "button")
            section.append(el(c.type === "hero" ? "h1" : "h2", c.title));
          if (c.text && !["products"].includes(c.type))
            section.append(el("p", c.text));
          image(section, c.image, c.alt || c.title);
          for (const image of section.querySelectorAll("img"))
            image.style.objectFit = a.imageFit || "cover";
          if (a.headingScale && a.headingScale !== "normal") {
            const h = section.querySelector("h1,h2");
            if (h)
              h.style.fontSize =
                c.type === "hero"
                  ? "calc(clamp(32px,9vw,52px) * " +
                    (a.headingScale === "large" ? 1.15 : 0.85) +
                    ")"
                  : (a.headingScale === "large" ? 29 : 21) + "px";
          }
          if (c.type === "button")
            section.append(
              button(c.title || T("Pokračovat", "Continue"), () => {
                if (c.action.type === "navigate") {
                  screen = c.action.target;
                  render();
                } else if (c.action.type === "complete") {
                  data.done.push(c.id);
                  persist();
                  render();
                  status(T("Hotovo.", "Completed."));
                } else
                  status(
                    T(
                      "Akci nastavíte v editoru.",
                      "Configure this action in the editor.",
                    ),
                  );
              }),
            );
          if (["list", "card", "products"].includes(c.type)) {
            let list = c.items;
            if (c.type === "products" && c.text === "bag")
              list = allProducts().filter((x) => data.bag[x.id]);
            if (c.type === "products" && c.text === "favourites")
              list = allProducts().filter((x) =>
                data.favourites.includes(x.id),
              );
            if (!list.length && c.type === "products")
              section.append(
                el(
                  "p",
                  T(
                    "Zatím prázdné. Vyberte si v Objevit.",
                    "Nothing here yet. Explore Discover first.",
                  ),
                ),
              );
            for (const x of list) {
              const row = el("article", undefined, { class: "item" });
              image(row, x.image, x.title);
              row.append(el("h3", x.title), el("p", x.body));
              if (c.type === "products") {
                row.append(el("strong", x.value + " CZK"));
                if (c.text === "bag") {
                  const qty = el("input", undefined, {
                    type: "number",
                    min: "0",
                    max: "99",
                    "aria-label": T("Množství ", "Quantity ") + x.title,
                  });
                  qty.value = data.bag[x.id];
                  qty.onchange = () => {
                    data.bag[x.id] = Math.max(
                      0,
                      Math.min(99, Number(qty.value) || 0),
                    );
                    persist();
                    render();
                  };
                  row.append(qty);
                } else
                  row.append(
                    button(
                      T("Detail", "Details"),
                      () => {
                        selectedProduct = x.id;
                        render();
                      },
                      true,
                    ),
                    button(T("Do tašky", "Add to bag"), () => {
                      data.bag[x.id] = (data.bag[x.id] || 0) + 1;
                      persist();
                      status(T("Přidáno do tašky.", "Added to bag."));
                    }),
                    button(
                      data.favourites.includes(x.id)
                        ? T("Odebrat oblíbené", "Remove favourite")
                        : T("Uložit oblíbené", "Save favourite"),
                      () => {
                        data.favourites = data.favourites.includes(x.id)
                          ? data.favourites.filter((v) => v !== x.id)
                          : [...data.favourites, x.id];
                        persist();
                        render();
                      },
                      true,
                    ),
                  );
              }
              if (c.action.type === "complete")
                row.append(
                  button(
                    data.done.includes(x.id)
                      ? T("Dokončeno", "Completed")
                      : T("Dokončit lekci", "Complete lesson"),
                    () => {
                      if (!data.done.includes(x.id)) data.done.push(x.id);
                      persist();
                      render();
                      status(
                        T(
                          "Skvělý krok! Pokrok uložen.",
                          "A great step! Progress saved.",
                        ),
                      );
                    },
                    data.done.includes(x.id),
                  ),
                );
              if (c.type === "tabs")
                row.append(
                  button(
                    T("Otevřít oznámení", "Open notification"),
                    () => status(x.title + ": " + x.body),
                    true,
                  ),
                );
              section.append(row);
            }
            if (c.type === "products" && c.text === "bag" && list.length)
              section.append(
                el(
                  "strong",
                  T("Celkem: ", "Total: ") +
                    list.reduce((n, x) => n + x.value * data.bag[x.id], 0) +
                    " CZK",
                ),
                button(T("Vyzkoušet objednávku", "Simulate checkout"), () => {
                  data.bag = {};
                  persist();
                  render();
                  status(
                    T(
                      "Pouze simulace. Nic nebylo zaplaceno ani objednáno.",
                      "Simulation only. No payment or order was made.",
                    ),
                  );
                }),
              );
          }
          if (c.type === "tabs") {
            data.tabs ||= {};
            const selected = c.items.some((x) => x.id === data.tabs[c.id])
              ? data.tabs[c.id]
              : c.items[0]?.id;
            const tabs = el("div", undefined, { role: "tablist" }),
              panel = el("div", undefined, { role: "tabpanel" }),
              item = c.items.find((x) => x.id === selected);
            c.items.forEach((x, i) => {
              const b = button(x.title, () => {
                data.tabs[c.id] = x.id;
                persist();
                render();
              });
              b.setAttribute("role", "tab");
              b.setAttribute("aria-selected", String(x.id === selected));
              b.onkeydown = (e) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
                  return;
                e.preventDefault();
                const n =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? c.items.length - 1
                      : (i +
                          (e.key === "ArrowRight" ? 1 : -1) +
                          c.items.length) %
                        c.items.length;
                data.tabs[c.id] = c.items[n].id;
                persist();
                render();
                document
                  .querySelectorAll(
                    '[data-app-component="' + c.id + '"] [role=tab]',
                  )
                  [n]?.focus();
              };
              tabs.append(b);
            });
            if (item) panel.append(el("h3", item.title), el("p", item.body));
            section.append(tabs, panel);
          }
          if (c.type === "progress") {
            let total = 100,
              done = c.value;
            if (c.progressSource === "lessons") {
              const lessons = model.screens
                .flatMap((s) => s.components)
                .filter((x) => x.action.type === "complete")
                .flatMap((x) => x.items);
              total = lessons.length || 1;
              done = data.done.filter((id) =>
                lessons.some((x) => x.id === id),
              ).length;
            }
            if (c.progressSource === "records") {
              for (const record of model.screens
                .flatMap((s) => s.components)
                .filter((x) => x.type === "records"))
                data.records[record.id] ||= structuredClone(record.items);
              const rows = Object.values(data.records).flat();
              total = rows.length || 1;
              done = rows.filter((x) => x.status === "done").length;
            }
            section.append(
              el("progress", undefined, {
                max: String(total),
                value: String(done),
              }),
              el(
                "p",
                Math.round((done / total) * 100) +
                  "% " +
                  T("dokončeno", "complete"),
              ),
            );
          }
          if (c.type === "form") {
            const form = el("form"),
              fields = c.items;
            for (const field of fields) {
              const label = el("label", field.title),
                type = ["text", "email", "number", "date", "textarea"].includes(
                  field.status,
                )
                  ? field.status
                  : "text",
                input = el(
                  type === "textarea" ? "textarea" : "input",
                  undefined,
                  {
                    name: field.id,
                    maxlength: "500",
                    placeholder: field.body || "",
                  },
                );
              if (type !== "textarea") input.type = type;
              input.required = field.required !== false;
              label.append(input);
              form.append(label);
            }
            form.append(
              el(
                "button",
                c.submitLabel ||
                  T("Připravit místní přehled", "Prepare local summary"),
                { type: "submit" },
              ),
            );
            const summary = el("div", undefined, { "data-form-summary": "" });
            form.onsubmit = (e) => {
              e.preventDefault();
              if (!form.reportValidity()) return;
              summary.replaceChildren(
                el("h3", T("Váš místní přehled", "Your local summary")),
              );
              for (const field of fields)
                summary.append(
                  el(
                    "p",
                    field.title +
                      ": " +
                      form.querySelector('[name="' + field.id + '"]').value,
                  ),
                );
              status(
                T(
                  "Přehled připraven pouze zde. Zpráva nebyla odeslána.",
                  "Summary prepared here only. No message was sent.",
                ),
              );
            };
            section.append(form, summary);
          }
          if (c.type === "records") records(section, c);
          for (const img of section.querySelectorAll("img"))
            img.style.objectFit = a.imageFit || "cover";
          main.append(section);
        }
      shell.append(main);
      const msg = el("p", "", { class: "app-status", role: "status" });
      shell.append(
        msg,
        el(
          "span",
          T(
            "Místní ukázka. Bez účtu, plateb a serverového odesílání.",
            "Local demonstration. No account, payments or server dispatch.",
          ),
          { class: "demo-label" },
        ),
        button(
          T("Vymazat místní demo data", "Reset local demo data"),
          () => {
            ask(
              T(
                "Vymazat místní ukázková data?",
                "Reset local demonstration data?",
              ),
              () => {
                data = { done: [], bag: {}, favourites: [], records: {} };
                persist();
                render();
              },
            );
          },
          true,
        ),
      );
      const nav = el("nav", undefined, {
        class: "app-nav",
        "aria-label": T("Obrazovky aplikace", "App screens"),
      });
      for (const s of model.screens.filter((x) => x.inNavigation)) {
        const b = button(s.title, () => {
          screen = s.id;
          selectedProduct = null;
          render();
        });
        if (s.id === screen) b.setAttribute("aria-current", "page");
        nav.append(b);
      }
      root.append(shell, nav);
      if (options.preview)
        parent.postMessage(
          { type: "app-navigation", nonce: options.nonce, screen },
          options.origin,
        );
    } finally {
      rendering = false;
    }
  }
  addEventListener("message", (e) => {
    if (
      !options.preview ||
      e.source !== parent ||
      e.origin !== options.origin ||
      e.data?.nonce !== options.nonce
    )
      return;
    if (e.data.type === "app-storage-error") {
      awaitingDurable = false;
      storageFailed = true;
    }
    if (e.data.type === "app-state-saved") {
      awaitingDurable = false;
      storageFailed = false;
      status(
        pendingStatus ||
          T("Změny uloženy v prohlížeči.", "Changes saved in this browser."),
      );
      pendingStatus = "";
    }
    if (e.data.type === "app-storage-error")
      status(
        T("Místní uložení není dostupné.", "Local saving is unavailable."),
      );
    if (e.data.type === "app-outline")
      document
        .querySelectorAll("[data-app-component]")
        .forEach(
          (n) =>
            (n.dataset.selected = String(
              n.dataset.appComponent === e.data.component,
            )),
        );
    if (
      e.data.type === "app-screen" &&
      model.screens.some((x) => x.id === e.data.screen)
    ) {
      screen = e.data.screen;
      selectedProduct = null;
      render();
    }
  });
  render();
  if (
    !options.preview &&
    location.protocol.startsWith("http") &&
    "serviceWorker" in navigator
  )
    navigator.serviceWorker.register("./sw.js").catch(() => {});
}
export function appDocument(value, options = {}) {
  const m = validateApp(value),
    t = m.theme,
    json = (x) => JSON.stringify(x).replace(/</g, "\\u003c"),
    esc = (x) =>
      String(x).replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      );
  const rgb = t.primary
      .slice(1)
      .match(/../g)
      .map((x) => parseInt(x, 16) / 255),
    lum = rgb
      .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
      .reduce((s, x, i) => s + x * [0.2126, 0.7152, 0.0722][i], 0),
    on = lum > 0.179 ? "#191925" : "#ffffff";
  return (
    '<!doctype html><html lang="' +
    m.locale +
    '"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src &apos;none&apos;; script-src &apos;unsafe-inline&apos;; style-src &apos;unsafe-inline&apos;; img-src &apos;self&apos; data: https: http:; font-src &apos;self&apos; data: https: http:; connect-src ' +
    (options.preview ? "&apos;none&apos;" : "&apos;self&apos;") +
    "; worker-src " +
    (options.preview ? "&apos;none&apos;" : "&apos;self&apos;") +
    '; form-action &apos;none&apos;; base-uri &apos;none&apos;"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="' +
    t.primary +
    '"><title>' +
    esc(m.name) +
    '</title><meta name="description" content="' +
    esc(m.description) +
    '">' +
    (!options.preview
      ? '<link rel="manifest" href="manifest.webmanifest">'
      : "") +
    "<style>" +
    appCSS +
    ":root{" +
    ["primary", "accent", "background", "surface", "text", "muted", "border"]
      .filter((k) => /^#[0-9a-f]{6}$/i.test(t[k]))
      .map((k) => "--" + k + ":" + t[k])
      .join(";") +
    ";--on-primary:" +
    on +
    ";--radius:" +
    t.radius +
    "px}" +
    (options.fontCSS || "") +
    "</style></head><body" +
    (options.demo ? ' class="application-demo"' : "") +
    '><div id="app"></div><script>(' +
    appRuntime.toString() +
    ")(" +
    json(m) +
    "," +
    json(options) +
    ");</script></body></html>"
  );
}
