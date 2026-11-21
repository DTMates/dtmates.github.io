import { demos, cleanState } from "./engine/data.js";
import {
  renderPage,
  templateProject,
  siteFiles,
  pagesFor,
} from "./engine/site-pages.js";
import { normalize } from "./engine/project.js";
import { archive } from "./engine/static-zip.js";
import { showCatalogue } from "./engine/catalogue-editor.js";
import { editRooms } from "./engine/site-designs/room-editor.js";
import { brandFonts } from "./engine/assets/fonts/manifest.js";
const q = (id) => document.getElementById(id),
  all = (s) => [...document.querySelectorAll(s)];
const engine = new URL("./engine/", import.meta.url);
const allowedFonts = ["brand", "editorial", "modern"],
  allowedLayouts = ["original", "wide", "compact"];
const settings = { font: "brand", layout: "original" };
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
    headline: { cs: "Společně každý den." },
    subline: { cs: "Malé kroky a vlastní pokrok." },
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
      ? "'Space Grotesk',sans-serif"
      : settings.font === "editorial"
        ? "'Baskervville',Georgia,serif"
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
  const profile = page === "profile",
    progress = page === "progress";
  return `<!doctype html><html lang="cs"><head><meta charset="utf-8"><title>${escape(project.brand)} · aplikační koncept</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;padding:clamp(20px,5vw,60px);color:${project.color};background:${project.contrast};font:16px/1.5 system-ui}main{max-width:900px;margin:auto}header{display:flex;justify-content:space-between;border-bottom:1px solid;padding-bottom:1rem}h1{font:clamp(2.2rem,6vw,5rem)/1.05 Georgia}nav{display:flex;gap:1rem;flex-wrap:wrap}a{color:inherit}button{min-height:44px;padding:.6rem 1rem;color:${project.contrast};background:${project.color};border:0}img{width:min(100%,320px);height:auto;border-radius:25px}.app-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:center}@media(max-width:600px){.app-grid{grid-template-columns:1fr}}</style></head><body><main><header><strong>${escape(project.brand)}</strong><span>APP CONCEPT</span></header><nav>${[
    ["", "Trénink"],
    ["profile", "Profil"],
    ["progress", "Pokrok"],
  ]
    .filter(
      ([slug]) =>
        project.sections[
          slug === "profile"
            ? "about"
            : slug === "progress"
              ? "contact"
              : "services"
        ],
    )
    .sort(
      ([a], [b]) =>
        project.sectionOrder.indexOf(
          a === "profile" ? "about" : a === "progress" ? "contact" : "services",
        ) -
        project.sectionOrder.indexOf(
          b === "profile" ? "about" : b === "progress" ? "contact" : "services",
        ),
    )
    .map(([slug, title]) => `<a href="#" data-page="${slug}">${title}</a>`)
    .join(
      "",
    )}</nav><div class="app-grid"><div><h1>${profile ? "Váš profil." : progress ? "Vlastní pokrok." : escape(project.headline.cs)}</h1><p>${escape(project.subline.cs)}</p>${profile ? '<label>Jméno psa <input value="Buddy"></label>' : progress ? '<p>Ukázkový stav · 0 dokončených lekcí</p><meter min="0" max="11" value="0"></meter>' : `<button id="sample-training">${escape(project.cta)}</button><p id="sample-state" aria-live="polite">Ukázka lekce · 0/5</p>`}<p>Webový koncept s ukázkovými daty.</p></div><img src="${project.hero || appArtwork || new URL("media/paw/down-1.webp", import.meta.url)}" alt="${project.hero ? "Vlastní nahraný obrázek" : "Původní PawMaster artwork"}"></div></main><script>document.querySelectorAll('[data-page]').forEach(a=>a.onclick=e=>{e.preventDefault();${standalone ? "location.href=(a.dataset.page||'index')+'.html'" : "parent.postMessage({type:'v21-app-page',page:a.dataset.page},'*')"}});let step=0;document.querySelector('#sample-training')?.addEventListener('click',()=>{step=step%5+1;document.querySelector('#sample-state').textContent='Ukázka lekce · '+step+'/5'+(step===5?' · dokončeno':'')});</script>${appearance()}</body></html>`;
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
        : renderPage(project, "cs", page, { css, preview: true });
    const extraFonts =
      settings.font === "brand"
        ? ""
        : `<link rel="stylesheet" href="${new URL("assets/fonts/studio/faces.css", engine)}">`;
    html = html
      .replace("<head>", '<head><base href="' + engine + '">' + extraFonts)
      .replace("</head>", appearance() + "</head>");
    q("editor-frame").srcdoc = html;
  }, 100);
  feedback("Živý koncept · změny zatím nejsou uloženy.");
  q("editor-continue").href =
    "contact.html?design=" + encodeURIComponent(project.id);
  q("editor-full-preview").href =
    project.id === "paw"
      ? "case/pawmaster.html"
      : "engine/sites/" + project.id + "/";
}
function updateFields() {
  q("editor-template").value = project.id;
  q("edit-brand").value = project.brand;
  q("edit-headline").value = project.headline.cs;
  q("edit-subline").value = project.subline.cs;
  q("edit-cta").value =
    project.id === "paw" ? project.cta : project.ctaLocales.cs;
  q("edit-color").value = project.color;
  q("edit-contrast").value = project.contrast;
  q("edit-font").value = settings.font;
  q("edit-layout").value = settings.layout;
  const pages =
    project.id === "paw"
      ? [
          { slug: "profile", title: "Profil" },
          { slug: "progress", title: "Pokrok" },
        ]
      : project.pages
          .filter((p) => p.visible)
          .map((p) => ({ slug: p.slug, title: p.content.cs.title || p.slug }));
  q("editor-page").replaceChildren(
    new Option("Úvod", ""),
    ...pages.map((p) => new Option(p.title, p.slug)),
  );
  if (!pages.some((p) => p.slug === page)) page = "";
  q("editor-page").value = page;
  const active =
    project.id === "paw" ? null : project.pages.find((p) => p.slug === page);
  q("edit-page-title").value = active?.content.cs.title || "";
  q("edit-page-body").value = active?.content.cs.body || "";
  q("edit-page-title").disabled = q("edit-page-body").disabled = !active;
  q("add-page").disabled = project.id === "paw";
  q("duplicate-page").disabled = !active;
  q("edit-sections").replaceChildren();
  q("edit-sections").previousElementSibling.textContent =
    project.id === "paw" ? "Moduly aplikace" : "Sekce na úvodu";
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
    label.append(
      input,
      document.createTextNode(
        (project.id === "paw"
          ? { services: "Trénink", about: "Profil", contact: "Pokrok" }
          : {
              services: "Služby",
              about: "Příběh",
              review: "Hodnocení",
              contact: "Kontakt",
            })[key] || key,
      ),
    );
    row.append(label);
    for (const [delta, symbol] of [
      [-1, "↑"],
      [1, "↓"],
    ]) {
      const button = document.createElement("button");
      button.textContent = symbol;
      button.setAttribute("aria-label", symbol + " " + key);
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
    throw Error("Nepodporovaná konfigurace.");
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
      throw Error("Neplatná aplikace.");
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
      headline: { cs: p.headline.cs.slice(0, 180) },
      subline: { cs: p.subline.cs.slice(0, 260) },
    };
  } else project = normalize(data.project);
  Object.assign(settings, data.settings);
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
  project.headline.cs = q("edit-headline").value;
  render();
};
q("edit-subline").oninput = () => {
  project.subline.cs = q("edit-subline").value;
  render();
};
q("edit-cta").oninput = () => {
  if (project.id === "paw") project.cta = q("edit-cta").value;
  else {
    project.cta = project.ctaLocales.cs = q("edit-cta").value;
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
  project.pages.find((p) => p.slug === page).content.cs.title =
    q("edit-page-title").value;
  render();
};
q("edit-page-body").oninput = () => {
  project.pages.find((p) => p.slug === page).content.cs.body =
    q("edit-page-body").value;
  render();
};
q("add-page").onclick = () => {
  if (project.pages.length >= 30) return feedback("Maximálně 30 stránek.");
  project.pages = pagesFor([
    ...project.pages,
    { title: "Nová stránka", body: "Vlastní obsah stránky", visible: true },
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
  feedback("Poslední změna vrácena.");
};
q("editor-redo").onclick = () => {
  if (!future.length) return;
  history.push(state());
  const target = future.pop();
  applySnapshot(target);
  previous = state();
  render();
  feedback("Změna obnovena.");
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
    feedback("Koncept uložen v tomto prohlížeči.");
  } catch {
    feedback("Úložiště je plné nebo nedostupné. Stáhněte konfiguraci.");
  }
};
q("load-draft").onclick = () => {
  try {
    const saved = localStorage.getItem("dtmates-v21-editor");
    if (!saved) return feedback("Zatím nemáte uložený koncept.");
    applySnapshot(saved);
    render();
    feedback("Uložený koncept načten.");
  } catch {
    feedback("Koncept nelze načíst.");
  }
};
q("export-config").onclick = () => {
  download("dtmates-konfigurace.json", state());
  feedback("Editovatelná konfigurace stažena.");
};
q("import-config").onchange = async () => {
  try {
    const file = q("import-config").files[0];
    if (!file || file.size > 25_000_000) throw Error();
    applySnapshot(await file.text());
    render();
    feedback("Konfigurace načtena a ověřena.");
  } catch {
    feedback("Soubor není platná V21 konfigurace.");
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
  feedback("Šablona obnovena.");
};
async function resizePhoto(file, maxEdge = 1600, metadata = false) {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 6_000_000)
    throw Error("Použijte JPG, PNG nebo WebP do 6 MB.");
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
    feedback("Fotografie připravena a vložena do náhledu.");
  } catch (error) {
    feedback(error.message);
  }
};
q("export-site").onclick = async () => {
  const button = q("export-site");
  button.disabled = true;
  feedback("Připravuji samostatný web…");
  try {
    if (project.id === "paw") {
      if (!project.hero && !appArtwork) {
        const response = await fetch(
          new URL("media/paw/down-1.webp", import.meta.url),
        );
        if (!response.ok) throw Error("Artwork není dostupný.");
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
        if (!response.ok) throw Error("Typografie není dostupná.");
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
          if (!response.ok) throw Error("Soubor chybí: " + path);
          files[path] = new Uint8Array(await response.arrayBuffer());
        }
      }
      download(
        "app-koncept.zip",
        new Blob([archive(files)], { type: "application/zip" }),
      );
      feedback(
        "Aplikační HTML koncept stažen. Tři stránky a artwork jsou součástí ZIP.",
      );
      return;
    }
    const data = structuredClone(project);
    // Existing templates and their industry runtime remain the source of the exported pages.
    const files = siteFiles(data, css, { assetPaths: true });
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
      if (!response.ok) throw Error("Soubor chybí: " + path);
      const buffer = await response.arrayBuffer();
      files[path] = new Uint8Array(buffer);
      if (path.endsWith(".css")) gather(new TextDecoder().decode(buffer), path);
    }
    files["configuration.json"] = state();
    download(
      project.id + "-web.zip",
      new Blob([archive(files)], { type: "application/zip" }),
    );
    feedback(
      "Vícestránkový web ZIP stažen. Formuláře a platby zůstávají demonstrační.",
    );
  } catch (error) {
    feedback("Export se nezdařil. " + error.message);
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
updateFields();
previous = state();
render();
document.body.dataset.editorReady = "true";
