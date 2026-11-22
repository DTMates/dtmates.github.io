import { message } from "../messages.js";
import { selectPrimaryLanguage } from "./export-locales.js";
import { nativeAppUI } from "./project-content.js";
import { demos, cleanState } from "../engine/data.js";
import {
  renderPage,
  templateProject,
  siteFiles,
  pagesFor,
} from "../engine/site-pages.js";
import { normalize } from "../engine/project.js";
import { archive } from "../engine/static-zip.js";
import { showCatalogue } from "./catalogue-editor.js";
import { editRooms } from "./room-editor.js";
import { brandFonts } from "../engine/assets/fonts/manifest.js";
const q = (id) => document.getElementById(id),
  all = (s) => [...document.querySelectorAll(s)];
const engine = new URL("../engine/", import.meta.url);
const allowedFonts = ["brand", "editorial", "modern"],
  allowedLayouts = ["original", "wide", "compact"];
const settings = { font: "brand", layout: "original", projectLanguage: "cs" };
const projectLocale = () =>
  ["cs", "en", "ar"].includes(settings.projectLanguage)
    ? settings.projectLanguage
    : "cs";
const escape = (value) =>
  String(value || "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const params = new URLSearchParams(location.search);
let selected =
  params.get("site") === "paw"
    ? "paw"
    : Object.hasOwn(demos, params.get("site"))
      ? params.get("site")
      : "cafe";
let appArtwork;
let project =
    selected === "paw"
      ? appDefaults()
      : normalize(templateProject(cleanState(demos[selected]))),
  page = "",
  history = [],
  future = [],
  timer,
  version = 0;
const css = await fetch(new URL("demo-site.css", engine)).then((r) => r.text());
function appDefaults() {
  return {
    id: "paw",
    brand: "PawMaster",
    headline: Object.fromEntries(
      Object.entries(nativeAppUI).map(([lang, u]) => [lang, u.headline]),
    ),
    subline: Object.fromEntries(
      Object.entries(nativeAppUI).map(([lang, u]) => [lang, u.subline]),
    ),
    ctaLocales: Object.fromEntries(
      Object.entries(nativeAppUI).map(([lang, u]) => [lang, u.cta]),
    ),
    cta: "Začít trénink",
    color: "#547143",
    contrast: "#fff9e9",
    sections: { services: true, about: true, contact: true },
    sectionOrder: ["services", "about", "contact"],
  };
}
const state = () => JSON.stringify({ version: 21, project, settings, page });
let previous = state();
const feedback = (text) => (q("editor-status").textContent = text);
function notify(text) {
  feedback(text);
}
function updateHistory() {
  const snapshot = state();
  if (snapshot !== previous) {
    history.push(previous);
    history = history.slice(-35);
    future = [];
    previous = snapshot;
  }
  q("editor-undo").disabled = !history.length;
  q("editor-redo").disabled = !future.length;
}
function appearance() {
  const font =
    settings.font === "modern"
      ? "'Space Grotesk','Noto Sans Arabic',sans-serif"
      : settings.font === "editorial"
        ? "'Baskervville','Noto Sans Arabic',Georgia,serif"
        : "";
  const width =
    settings.layout === "wide"
      ? "95vw"
      : settings.layout === "compact"
        ? "65rem"
        : "";
  return `<style>${font ? `h1,h2,h3{font-family:${font}!important}` : ""}${width ? `main>section>div,.container,.wrap{max-width:${width}!important}` : ""}${settings.layout === "compact" ? "main section{padding-block:clamp(1rem,3vw,2rem)!important}" : ""}</style>`;
}
function appMarkup(standalone = false) {
  const locale = projectLocale(),
    u = nativeAppUI[locale],
    profile = page === "profile",
    progress = page === "progress";
  const nav = [
    ["", "services", u.training],
    ["profile", "about", u.profile],
    ["progress", "contact", u.progress],
  ]
    .filter(([, section]) => project.sections[section])
    .sort(
      (a, b) =>
        project.sectionOrder.indexOf(a[1]) - project.sectionOrder.indexOf(b[1]),
    );
  return `<!doctype html><html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}"><head><meta charset="utf-8"><title>${escape(project.brand)} · ${u.concept}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;padding:clamp(20px,5vw,60px);color:${project.color};background:${project.contrast};font:16px/1.5 system-ui}main{max-width:900px;margin:auto}header{display:flex;justify-content:space-between;border-bottom:1px solid;padding-bottom:1rem}h1{font:clamp(2.2rem,6vw,5rem)/1.05 Georgia}nav{display:flex;gap:1rem;flex-wrap:wrap;padding-block:1rem}a{color:inherit}button{min-height:44px;padding:.6rem 1rem;color:${project.contrast};background:${project.color};border:0}img{width:min(100%,320px);height:auto;border-radius:25px}.app-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:center}@media(max-width:600px){.app-grid{grid-template-columns:1fr}}</style></head><body><main><header><strong>${escape(project.brand)}</strong><span>${u.concept}</span></header><nav>${nav.map(([slug, , title]) => `<a href="${standalone ? (slug || "index") + ".html" : "#"}" data-page="${slug}">${title}</a>`).join("")}</nav><div class="app-grid"><div><h1>${profile ? u.yourProfile : progress ? u.yourProgress : escape(project.headline[locale])}</h1><p>${escape(project.subline[locale])}</p>${profile ? `<label>${u.dog} <input value="Buddy"></label>` : progress ? `<p>${u.sample}</p><meter min="0" max="11" value="0"></meter>` : `<button id="sample-training">${escape(project.ctaLocales?.[locale] || project.cta)}</button><p id="sample-state" aria-live="polite">${u.lesson} · 0/5</p>`}<p>${u.disclaimer}</p></div><img src="${project.hero || appArtwork || new URL("../media/paw/down-1.webp", import.meta.url)}" alt="${project.hero ? u.uploaded : u.artwork}"></div></main><script>document.querySelectorAll('[data-page]').forEach(a=>a.onclick=e=>{e.preventDefault();${standalone ? "location.href=(a.dataset.page||'index')+'.html'" : "parent.postMessage({type:'v21-app-page',page:a.dataset.page},'*')"}});let step=0;document.querySelector('#sample-training')?.addEventListener('click',()=>{step=step%5+1;document.querySelector('#sample-state').textContent=${JSON.stringify(u.lesson)}+' · '+step+'/5'+(step===5?' · '+${JSON.stringify(u.done)}:'')});</script>${appearance()}</body></html>`;
}
function render() {
  updateHistory();
  clearTimeout(timer);
  const current = ++version;
  timer = setTimeout(() => {
    if (current !== version) return;
    let html =
      project.id === "paw"
        ? appMarkup()
        : renderPage(project, projectLocale(), page, { css, preview: true });
    const extraFonts =
      settings.font === "brand"
        ? ""
        : `<link rel="stylesheet" href="${new URL("assets/fonts/studio/faces.css", engine)}">`;
    html = html
      .replace("<head>", '<head><base href="' + engine + '">' + extraFonts)
      .replace("</head>", appearance() + "</head>");
    q("editor-frame").srcdoc = html;
  }, 100);
  feedback("Projekt na żywo · zmiany nie zostały jeszcze zapisane.");
  q("editor-continue").href =
    "contact.html?design=" + encodeURIComponent(project.id);
  q("editor-full-preview").href =
    project.id === "paw"
      ? "case/pawmaster.html"
      : new URL(
          "sites/" +
            project.id +
            "/" +
            (projectLocale() === "cs" ? "" : projectLocale() + "/"),
          engine,
        ).href;
}
function updateFields() {
  q("editor-template").value = project.id;
  q("project-language").value = projectLocale();
  for (const id of [
    "edit-headline",
    "edit-subline",
    "edit-cta",
    "edit-page-title",
    "edit-page-body",
  ]) {
    q(id).dir = projectLocale() === "ar" ? "rtl" : "ltr";
    q(id).style.textAlign = "start";
  }
  q("edit-brand").dir = "auto";
  q("edit-brand").value = project.brand;
  q("edit-headline").value = project.headline[projectLocale()];
  q("edit-subline").value = project.subline[projectLocale()];
  q("edit-cta").value = project.ctaLocales?.[projectLocale()] || project.cta;
  q("edit-color").value = project.color;
  q("edit-contrast").value = project.contrast;
  q("edit-font").value = settings.font;
  q("edit-layout").value = settings.layout;
  const pages =
    project.id === "paw"
      ? [
          { slug: "profile", title: "Profil" },
          { slug: "progress", title: "Postęp" },
        ]
      : project.pages
          .filter((p) => p.visible)
          .map((p) => ({
            slug: p.slug,
            title: p.content[projectLocale()].title || p.slug,
          }));
  q("editor-page").replaceChildren(
    new Option("Strona główna", ""),
    ...pages.map((p) => new Option(p.title, p.slug)),
  );
  if (!pages.some((p) => p.slug === page)) page = "";
  q("editor-page").value = page;
  const active =
    project.id === "paw" ? null : project.pages.find((p) => p.slug === page);
  q("edit-page-title").value = active?.content[projectLocale()].title || "";
  q("edit-page-body").value = active?.content[projectLocale()].body || "";
  q("edit-page-title").disabled = q("edit-page-body").disabled = !active;
  q("add-page").disabled = project.id === "paw";
  q("duplicate-page").disabled = !active;
  q("edit-sections").replaceChildren();
  q("edit-sections").previousElementSibling.textContent =
    project.id === "paw" ? "Moduły aplikacji" : "Sekcje strony głównej";
  for (const [index, key] of project.sectionOrder.entries()) {
    const row = document.createElement("div");
    row.className = "section-toggle";
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = project.sections[key];
    input.onchange = () => {
      project.sections[key] = input.checked;
      render();
    };
    let sectionTitle;
    label.append(
      input,
      document.createTextNode(
        (sectionTitle =
          (project.id === "paw"
            ? { services: "Trening", about: "Profil", contact: "Postęp" }
            : {
                services: "Usługi",
                about: "Historia",
                review: "Oceny",
                contact: "Kontakt",
              })[key] || key),
      ),
    );
    row.append(label);
    for (const [delta, symbol] of [
      [-1, "↑"],
      [1, "↓"],
    ]) {
      const button = document.createElement("button");
      button.textContent = symbol;
      button.setAttribute(
        "aria-label",
        message(delta < 0 ? "editor.moveUp" : "editor.moveDown", {
          section: sectionTitle,
        }),
      );
      button.disabled =
        index + delta < 0 || index + delta >= project.sectionOrder.length;
      button.onclick = () => {
        const other = index + delta;
        [project.sectionOrder[index], project.sectionOrder[other]] = [
          project.sectionOrder[other],
          project.sectionOrder[index],
        ];
        updateFields();
        render();
      };
      row.append(button);
    }
    q("edit-sections").append(row);
  }
  q("editor-catalogue").replaceChildren();
  q("editor-rooms").replaceChildren();
  if (project.id !== "paw")
    showCatalogue(
      q("editor-catalogue"),
      project,
      render,
      () => {
        updateFields();
        render();
      },
      resizePhoto,
      notify,
    );
  if (project.id === "hotel")
    editRooms(
      q("editor-rooms"),
      project,
      render,
      () => {
        updateFields();
        render();
      },
      resizePhoto,
      notify,
    );
}
function applySnapshot(snapshot) {
  const data = JSON.parse(snapshot);
  if (
    data.version !== 21 ||
    !data.project ||
    !allowedFonts.includes(data.settings?.font) ||
    !allowedLayouts.includes(data.settings?.layout)
  )
    throw Error("Nieobsługiwana konfiguracja.");
  if (data.project.id === "paw") {
    const p = data.project;
    if (
      !["brand", "cta", "color", "contrast"].every(
        (k) => typeof p[k] === "string",
      ) ||
      !/^#[0-9a-f]{6}$/i.test(p.color) ||
      !/^#[0-9a-f]{6}$/i.test(p.contrast) ||
      typeof p.headline?.cs !== "string" ||
      typeof p.subline?.cs !== "string"
    )
      throw Error("Nieprawidłowa aplikacja.");
    const defaults = appDefaults(),
      keys = Object.keys(defaults.sections);
    const sections = Object.fromEntries(
      keys.map((key) => [
        key,
        typeof p.sections?.[key] === "boolean" ? p.sections[key] : true,
      ]),
    );
    const sectionOrder = [
      ...new Set([
        ...(Array.isArray(p.sectionOrder) ? p.sectionOrder : []),
        ...keys,
      ]),
    ].filter((key) => keys.includes(key));
    project = {
      ...defaults,
      sections,
      sectionOrder,
      brand: p.brand.slice(0, 90),
      cta: p.cta.slice(0, 65),
      color: p.color,
      contrast: p.contrast,
      ...(typeof p.hero === "string" &&
      /^data:image\/(?:webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(p.hero) &&
      p.hero.length < 1000000
        ? { hero: p.hero }
        : {}),
      headline: Object.fromEntries(
        ["cs", "en", "ar"].map((lang) => [
          lang,
          typeof p.headline?.[lang] === "string"
            ? p.headline[lang].slice(0, 180)
            : defaults.headline[lang],
        ]),
      ),
      subline: Object.fromEntries(
        ["cs", "en", "ar"].map((lang) => [
          lang,
          typeof p.subline?.[lang] === "string"
            ? p.subline[lang].slice(0, 260)
            : defaults.subline[lang],
        ]),
      ),
      ctaLocales: Object.fromEntries(
        ["cs", "en", "ar"].map((lang) => [
          lang,
          typeof p.ctaLocales?.[lang] === "string"
            ? p.ctaLocales[lang].slice(0, 65)
            : lang === "cs"
              ? p.cta
              : defaults.ctaLocales[lang],
        ]),
      ),
    };
  } else project = normalize(data.project);
  if (
    data.settings.projectLanguage !== undefined &&
    !["cs", "en", "ar"].includes(data.settings.projectLanguage)
  )
    throw Error("Nieobsługiwana konfiguracja.");
  Object.assign(settings, { projectLanguage: "cs" }, data.settings);
  page = typeof data.page === "string" ? data.page : "";
  updateFields();
}
q("editor-template").onchange = () => {
  selected = q("editor-template").value;
  project =
    selected === "paw"
      ? appDefaults()
      : normalize(templateProject(cleanState(demos[selected])));
  page = "";
  Object.assign(settings, { font: "brand", layout: "original" });
  updateFields();
  render();
};
for (const [id, key] of [
  ["edit-brand", "brand"],
  ["edit-color", "color"],
  ["edit-contrast", "contrast"],
])
  q(id).oninput = () => {
    project[key] = q(id).value;
    render();
  };
q("edit-headline").oninput = () => {
  project.headline[projectLocale()] = q("edit-headline").value;
  render();
};
q("edit-subline").oninput = () => {
  project.subline[projectLocale()] = q("edit-subline").value;
  render();
};
q("edit-cta").oninput = () => {
  if (project.id === "paw") {
    project.ctaLocales[projectLocale()] = q("edit-cta").value;
    if (projectLocale() === "cs") project.cta = q("edit-cta").value;
  } else {
    project.ctaLocales[projectLocale()] = q("edit-cta").value;
    if (projectLocale() === "cs") project.cta = q("edit-cta").value;
  }
  render();
};
q("edit-font").onchange = () => {
  settings.font = q("edit-font").value;
  render();
};
q("edit-layout").onchange = () => {
  settings.layout = q("edit-layout").value;
  render();
};
q("editor-page").onchange = () => {
  page = q("editor-page").value;
  updateFields();
  render();
};
q("edit-page-title").oninput = () => {
  project.pages.find((p) => p.slug === page).content[projectLocale()].title =
    q("edit-page-title").value;
  render();
};
q("edit-page-body").oninput = () => {
  project.pages.find((p) => p.slug === page).content[projectLocale()].body =
    q("edit-page-body").value;
  render();
};
q("add-page").onclick = () => {
  if (project.pages.length >= 30) return feedback("Maksymalnie 30 stron.");
  project.pages = pagesFor([
    ...project.pages,
    {
      title: nativeAppUI[projectLocale()].newPage,
      body: nativeAppUI[projectLocale()].newContent,
      content: {
        [projectLocale()]: {
          title: nativeAppUI[projectLocale()].newPage,
          body: nativeAppUI[projectLocale()].newContent,
        },
      },
      visible: true,
    },
  ]);
  page = project.pages.at(-1).slug;
  updateFields();
  render();
};
q("duplicate-page").onclick = () => {
  if (!page || project.pages.length >= 30) return;
  const original = project.pages.find((p) => p.slug === page);
  project.pages = pagesFor([
    ...project.pages,
    { ...structuredClone(original), slug: page + "-kopie" },
  ]);
  page = project.pages.at(-1).slug;
  updateFields();
  render();
};
for (const button of all("[data-panel]"))
  button.onclick = () => {
    all("[data-edit-panel]").forEach(
      (p) => (p.hidden = p.dataset.editPanel !== button.dataset.panel),
    );
    all("[data-panel]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b === button)),
    );
  };
for (const button of all("[data-device]"))
  button.onclick = () => {
    q("editor-frame").style.width = {
      desktop: "100%",
      tablet: "768px",
      mobile: "390px",
    }[button.dataset.device];
    q("editor-frame").style.maxWidth = "none";
    all("[data-device]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b === button)),
    );
  };
q("editor-undo").onclick = () => {
  if (!history.length) return;
  future.push(state());
  const target = history.pop();
  applySnapshot(target);
  previous = state();
  render();
  feedback("Cofnięto ostatnią zmianę.");
};
q("editor-redo").onclick = () => {
  if (!future.length) return;
  history.push(state());
  const target = future.pop();
  applySnapshot(target);
  previous = state();
  render();
  feedback("Przywrócono zmianę.");
};
function download(name, body, type = "application/json") {
  const url = URL.createObjectURL(
    body instanceof Blob ? body : new Blob([body], { type }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
q("save-draft").onclick = () => {
  try {
    localStorage.setItem("dtmates-v21-editor", state());
    feedback("Projekt roboczy zapisany w tej przeglądarce.");
  } catch {
    feedback("Pamięć jest pełna lub niedostępna. Pobierz konfigurację.");
  }
};
q("load-draft").onclick = () => {
  try {
    const saved = localStorage.getItem("dtmates-v21-editor");
    if (!saved) return feedback("Nie masz jeszcze zapisanego projektu roboczego.");
    applySnapshot(saved);
    render();
    feedback("Wczytano zapisany projekt roboczy.");
  } catch {
    feedback("Nie można wczytać projektu roboczego.");
  }
};
q("export-config").onclick = () => {
  download("dtmates-konfigurace.json", state());
  feedback("Pobrano edytowalną konfigurację.");
};
q("import-config").onchange = async () => {
  try {
    const file = q("import-config").files[0];
    if (!file || file.size > 25_000_000) throw Error();
    applySnapshot(await file.text());
    render();
    feedback("Konfiguracja wczytana i zweryfikowana.");
  } catch {
    feedback("Plik nie jest prawidłową konfiguracją V21.");
  }
  q("import-config").value = "";
};
q("reset-editor").onclick = () => {
  project =
    project.id === "paw"
      ? appDefaults()
      : normalize(templateProject(cleanState(demos[project.id])));
  page = "";
  Object.assign(settings, { font: "brand", layout: "original" });
  updateFields();
  render();
  feedback("Przywrócono szablon.");
};
async function resizePhoto(file, maxEdge = 1600, metadata = false) {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 6_000_000)
    throw Error("Użyj JPG, PNG lub WebP do 6 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext("2d")
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    let src = canvas.toDataURL("image/webp", 0.8);
    if (src.length > 700000) src = canvas.toDataURL("image/jpeg", 0.75);
    return metadata
      ? {
          src,
          width: canvas.width,
          height: canvas.height,
          originalWidth: bitmap.width,
          originalHeight: bitmap.height,
        }
      : src;
  } finally {
    bitmap.close();
  }
}
q("edit-photo").onchange = async () => {
  const original = project;
  try {
    const file = q("edit-photo").files[0];
    if (!file) return;
    const photo = await resizePhoto(file);
    if (original !== project) return;
    project.hero = photo;
    render();
    feedback("Zdjęcie przygotowane i dodane do podglądu.");
  } catch (error) {
    feedback(error.message);
  }
};
q("export-site").onclick = async () => {
  const button = q("export-site");
  button.disabled = true;
  feedback("Przygotowuję samodzielną stronę…");
  try {
    if (project.id === "paw") {
      if (!project.hero && !appArtwork) {
        const response = await fetch(
          new URL("../media/paw/down-1.webp", import.meta.url),
        );
        if (!response.ok) throw Error("Ilustracje są niedostępne.");
        const blob = await response.blob();
        appArtwork = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
      const active = page,
        files = { "configuration.json": state() };
      for (const slug of ["", "profile", "progress"]) {
        page = slug;
        let html = appMarkup(true);
        if (settings.font !== "brand")
          html = html.replace(
            "</head>",
            '<link rel="stylesheet" href="assets/fonts/studio/faces.css"></head>',
          );
        files[(slug || "index") + ".html"] = html;
      }
      page = active;
      if (settings.font !== "brand") {
        const face = "assets/fonts/studio/faces.css",
          response = await fetch(new URL(face, engine));
        if (!response.ok) throw Error("Typografia jest niedostępna.");
        files[face] = await response.text();
        const sources = new Set();
        for (const match of files[face].matchAll(/url\(([^)]+)\)/g)) {
          const path = new URL(
            match[1].replace(/['"]/g, ""),
            new URL(face, "https://export.invalid/"),
          ).pathname.slice(1);
          sources.add(path);
          sources.add(path.slice(0, path.lastIndexOf("/")) + "/OFL.txt");
        }
        for (const path of sources) {
          const response = await fetch(new URL(path, engine));
          if (!response.ok) throw Error("Brakuje pliku: " + path);
          files[path] = new Uint8Array(await response.arrayBuffer());
        }
      }
      download(
        "app-koncept.zip",
        new Blob([archive(files)], { type: "application/zip" }),
      );
      feedback(
        "Pobrano koncepcję aplikacji HTML. Trzy strony i ilustracje są częścią ZIP.",
      );
      return;
    }
    const data = structuredClone(project);
    // Existing templates and their industry runtime remain the source of the exported pages.
    let files = siteFiles(data, css, { assetPaths: true });
    for (const path of Object.keys(files))
      if (path.endsWith(".html"))
        files[path] = files[path].replace("</head>", appearance() + "</head>");
    const queue = new Set();
    function gather(text, path) {
      const absolute = new URL(path, "https://export.invalid/");
      const references = [
        ...text.matchAll(
          /(?:src|href|srcset)=["']([^"']+)["']|url\(['"]?([^)'"\s]+)['"]?\)/g,
        ),
      ];
      for (const match of references) {
        for (const item of (match[1] || match[2]).split(",")) {
          const value = item.trim().split(/\s+/)[0];
          if (!value || /^(?:data:|https?:|#|mailto:|tel:)/.test(value))
            continue;
          const target = new URL(value, absolute);
          const relative = target.pathname.slice(1);
          if (
            relative.startsWith("assets/") ||
            relative.startsWith("site-designs/styles/")
          )
            queue.add(relative);
        }
      }
    }
    Object.entries(files).forEach(([path, text]) => {
      if (path.endsWith(".html")) gather(text, path);
    });
    for (const path of brandFonts[project.id].files) queue.add(path);
    if (settings.font !== "brand") {
      queue.add("assets/fonts/studio/faces.css");
      for (const [path, body] of Object.entries(files))
        if (path.endsWith(".html"))
          files[path] = body.replace(
            "</head>",
            `<link rel="stylesheet" href="${"../".repeat(path.split("/").length - 1)}assets/fonts/studio/faces.css"></head>`,
          );
    }
    const visited = new Set();
    for (const path of queue) {
      if (visited.has(path)) continue;
      visited.add(path);
      const response = await fetch(new URL(path, engine));
      if (!response.ok) throw Error("Brakuje pliku: " + path);
      const buffer = await response.arrayBuffer();
      files[path] = new Uint8Array(buffer);
      if (path.endsWith(".css")) gather(new TextDecoder().decode(buffer), path);
    }
    files = selectPrimaryLanguage(files, projectLocale());
    files["configuration.json"] = state();
    download(
      project.id + "-web.zip",
      new Blob([archive(files)], { type: "application/zip" }),
    );
    feedback(
      "Pobrano wielostronicową stronę ZIP. Formularze i płatności pozostają demonstracyjne.",
    );
  } catch (error) {
    feedback("Eksport nie powiódł się. " + error.message);
  } finally {
    button.disabled = false;
  }
};
window.addEventListener("message", (event) => {
  if (event.source !== q("editor-frame").contentWindow) return;
  if (
    event.data?.type === "studio-navigation" &&
    typeof event.data.slug === "string"
  ) {
    page = event.data.slug;
    updateFields();
    render();
  }
  if (
    event.data?.type === "v21-app-page" &&
    ["", "profile", "progress"].includes(event.data.page)
  ) {
    page = event.data.page;
    updateFields();
    render();
  }
});
q("project-language").onchange = () => {
  settings.projectLanguage = q("project-language").value;
  updateFields();
  render();
};
window.dtmatesEditor = {
  snapshot: () => ({
    configuration: state(),
    history: [...history],
    future: [...future],
    panel: document.querySelector("[data-panel][aria-pressed=true]")?.dataset
      .panel,
    device: document.querySelector("[data-device][aria-pressed=true]")?.dataset
      .device,
  }),
  restore: (snapshot) => {
    applySnapshot(snapshot.configuration);
    history = Array.isArray(snapshot.history)
      ? snapshot.history.slice(-35)
      : [];
    future = Array.isArray(snapshot.future) ? snapshot.future.slice(-35) : [];
    previous = state();
    updateFields();
    render();
    if (snapshot.panel)
      document.querySelector('[data-panel="' + snapshot.panel + '"]')?.click();
    if (snapshot.device)
      document
        .querySelector('[data-device="' + snapshot.device + '"]')
        ?.click();
  },
};
updateFields();
previous = state();
render();
document.body.dataset.editorReady = "true";
document.dispatchEvent(new Event("studio:editor-ready"));
