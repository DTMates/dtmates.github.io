// Shared adapter for actual authored template DOM. Used by preview AND standalone ZIPs.
const id = /^(s\d{1,4}|new_[a-f0-9-]{36}|copy_[a-f0-9-]{36}|new_blank)$/;
const cut = (v, n = 4000) => (typeof v === "string" ? v.slice(0, n) : "");
export function safeLink(value) {
  const s = cut(value, 500).trim();
  if (!s) return "#";
  if (
    /^(?:javascript|data|vbscript|file|blob):/i.test(s) ||
    /^\/\//.test(s) ||
    /[\u0000-\u001f<>"']/.test(s)
  )
    throw Error("Unsafe destination");
  return s;
}
export function validateCreator(raw) {
  if (raw === undefined) return { version: 1, pages: {}, design: {} };
  if (!raw || raw.version !== 1 || JSON.stringify(raw).length > 18e6)
    throw Error("Invalid creator data");
  const pages = {};
  for (const [key, p] of Object.entries(raw.pages || {}).slice(0, 90)) {
    if (!/^(cs|en|ar)\/[a-z0-9/-]*$/.test(key) || !p || typeof p !== "object")
      throw Error("Invalid page");
    const edits = {};
    for (const [s, e] of Object.entries(p.edits || {}).slice(0, 120)) {
      if (!id.test(s) || !e) throw Error("Invalid section");
      const fields = {};
      for (const [f, v] of Object.entries(e.fields || {}).slice(0, 180)) {
        if (!/^f\d{1,4}$/.test(f) || !v) throw Error("Invalid field");
        const n = { text: cut(v.text), alt: cut(v.alt, 200) };
        if (v.href !== undefined) n.href = safeLink(v.href);
        if (v.src !== undefined) {
          if (
            !/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(
              v.src,
            ) ||
            v.src.length > 8e6
          )
            throw Error("Invalid image");
          n.src = v.src;
        }
        if (v.focal !== undefined)
          n.focal = Math.max(0, Math.min(100, Number(v.focal) || 0));
        fields[f] = n;
      }
      edits[s] = {
        fields,
        hidden: e.hidden === true,
        removed: e.removed === true,
        background: /^#[a-f0-9]{6}$/i.test(e.background) ? e.background : "",
        layout: ["original", "wide", "inset"].includes(e.layout)
          ? e.layout
          : "original",
      };
    }
    const order = Array.isArray(p.order)
      ? p.order.filter((x) => typeof x === "string" && id.test(x)).slice(0, 120)
      : [];
    const extras = (p.extras || []).slice(0, 24).map((x) => {
      if (!id.test(x.id) || !["text", "image", "cta", "copy"].includes(x.type))
        throw Error("Invalid extra");
      return {
        id: x.id,
        type: x.type,
        source: id.test(x.source) ? x.source : "",
        title: cut(x.title, 180),
        body: cut(x.body),
        cta: cut(x.cta, 90),
        href: safeLink(x.href || "#"),
      };
    });
    pages[key] = {
      edits,
      order,
      extras,
      source:
        typeof p.source === "string" &&
        /^[a-z0-9][a-z0-9/-]{0,150}$/.test(p.source)
          ? p.source
          : "",
      ...(typeof p.inNavigation === "boolean"
        ? { inNavigation: p.inNavigation }
        : {}),
      composition: ["original", "article", "split"].includes(p.composition)
        ? p.composition
        : "original",
      ...(p.heroHeadline !== undefined
        ? { heroHeadline: cut(p.heroHeadline, 180) }
        : {}),
      ...(p.heroBody !== undefined ? { heroBody: cut(p.heroBody, 400) } : {}),
      ...(p.heroCTA !== undefined ? { heroCTA: cut(p.heroCTA, 90) } : {}),
      title: cut(p.title, 180),
      description: cut(p.description, 300),
    };
  }
  const d = raw.design || {},
    design = {};
  for (const k of ["background", "text", "secondary"])
    if (/^#[a-f0-9]{6}$/i.test(d[k])) design[k] = d[k];
  for (const [k, values] of Object.entries({
    scale: ["small", "normal", "large"],
    spacing: ["compact", "normal", "airy"],
    width: ["narrow", "normal", "wide"],
    buttons: ["original", "square", "soft", "pill"],
    images: ["original", "square", "soft", "round"],
    header: ["original", "minimal", "center"],
    footer: ["original", "minimal", "center"],
    hero: ["original", "inset", "wide"],
  }))
    design[k] = values.includes(d[k])
      ? d[k]
      : ["header", "footer", "hero", "buttons", "images"].includes(k)
        ? "original"
        : "normal";
  return { version: 1, pages, design, blank: raw.blank === true };
}
const descriptors = (doc) => {
  const main = doc.querySelector("main") || doc.body;
  let container = main;
  for (let i = 0; i < 3; i++) {
    const kids = [...container.children].filter(
      (e) => !["SCRIPT", "STYLE"].includes(e.tagName),
    );
    if (kids.length === 1 && kids[0].tagName === "DIV") container = kids[0];
    else break;
  }
  const sections = [...container.children].filter(
    (e) => !["SCRIPT", "STYLE"].includes(e.tagName),
  );
  const header = doc.querySelector("body>header"),
    footer = doc.querySelector("footer");
  if (header && !sections.includes(header)) sections.unshift(header);
  if (footer && !sections.includes(footer)) sections.push(footer);
  return { container, sections };
};
function mark(el, sid) {
  el.dataset.csection = sid;
  [...el.querySelectorAll("h1,h2,h3,h4,p,a,button,img,figcaption,li")].forEach(
    (n, i) => (n.dataset.cfield = "f" + i),
  );
}
export function adaptPage(
  html,
  creator,
  key,
  {
    preview = false,
    nonce = "",
    origin = "",
    navigation = [],
    locale = "cs",
    slug = "",
    currentFile = "index.html",
    brand = "Website",
    blankContent = null,
    runtimeStorage = {},
  } = {},
) {
  const model = validateCreator(creator),
    state = model.pages[key] || { edits: {}, order: [], extras: [] },
    doc = new DOMParser().parseFromString(html, "text/html");
  if (model.blank) {
    doc.body.replaceChildren();
    doc.body.className = "creator-blank";
    const header = doc.createElement("header"),
      name = doc.createElement("strong");
    name.textContent = brand;
    header.append(name);
    const main = doc.createElement("main");
    main.id = "content";
    if (slug || !state.extras?.length) {
      const h = doc.createElement("h1");
      h.textContent = blankContent?.title || brand;
      const p = doc.createElement("p");
      p.textContent = blankContent?.body || "";
      main.append(h, p);
    }
    const footer = doc.createElement("footer");
    footer.textContent = brand;
    doc.body.append(header, main, footer);
    const neutral = doc.createElement("style");
    neutral.textContent =
      "body.creator-blank{margin:0;background:#f7f5ef;color:#25262c;font:16px/1.6 system-ui}body.creator-blank>header,body.creator-blank>footer{padding:25px 5vw;border-block:1px solid #ddd}body.creator-blank>main{min-height:65vh;padding:35px 5vw}body.creator-blank h1{font-size:clamp(40px,7vw,85px);line-height:1.05}";
    doc.head.append(neutral);
  }
  const { container, sections } = descriptors(doc),
    map = new Map();
  sections.forEach((e, i) => {
    mark(e, "s" + i);
    map.set("s" + i, e);
  });

  for (const x of state.extras) {
    let el;
    if (x.type === "copy") {
      const source = map.get(x.source);
      if (
        !source ||
        source.querySelector("form,input,select,textarea,script,[id],button")
      )
        continue;
      el = source.cloneNode(true);
    } else {
      el = doc.createElement("section");
      el.className = "creator-added";
      const h = doc.createElement(x.id === "new_blank" ? "h1" : "h2");
      h.textContent = x.title;
      const p = doc.createElement("p");
      p.textContent = x.body;
      el.append(h, p);
      if (x.type === "cta") {
        const a = doc.createElement("a");
        a.textContent = x.cta;
        a.href = safeLink(x.href);
        el.append(a);
      }
      if (x.type === "image") {
        const img = doc.createElement("img");
        img.alt = x.title;
        el.append(img);
      }
    }
    mark(el, x.id);
    map.set(x.id, el);
    container.append(el);
  }
  for (const [s, edit] of Object.entries(state.edits)) {
    const el = map.get(s);
    if (!el) continue;
    el.hidden = edit.hidden;
    if (
      edit.removed &&
      !el.querySelector("form,input,select,textarea,script,[id],button")
    ) {
      el.remove();
      continue;
    }
    if (edit.background) el.style.backgroundColor = edit.background;
    if (edit.layout === "inset") {
      el.style.maxWidth = "960px";
      el.style.marginInline = "auto";
      el.style.padding = "clamp(20px,5vw,70px)";
    }
    if (edit.layout === "wide") el.style.maxWidth = "none";
    for (const [f, v] of Object.entries(edit.fields)) {
      const n = el.querySelector('[data-cfield="' + f + '"]');
      if (!n) continue;
      if (n.tagName === "IMG") {
        if (v.src) n.src = v.src;
        n.alt = v.alt || "";
        if (v.focal !== undefined) {
          n.style.objectPosition = "50% " + v.focal + "%";
          n.style.objectFit = "cover";
        }
      } else if (v.text !== undefined) n.textContent = v.text;
      if (n.tagName === "A" && v.href !== undefined)
        n.setAttribute("href", safeLink(v.href));
    }
  }
  const movable = [...map.entries()].filter(
    ([, e]) => e.parentNode === container,
  );
  const rank = new Map(state.order.map((v, i) => [v, i]));
  const anchor = doc.createComment("section-order");
  if (state.order.length && movable.length)
    container.insertBefore(anchor, movable[0][1]);
  for (const [, el] of (state.order.length ? movable : []).sort(
    (a, b) => (rank.get(a[0]) ?? 999) - (rank.get(b[0]) ?? 999),
  ))
    container.insertBefore(el, anchor);
  anchor.remove();
  if (state.title) doc.title = state.title;
  let description = doc.querySelector("meta[name=description]");
  if (state.description) {
    if (!description) {
      description = doc.createElement("meta");
      description.name = "description";
      doc.head.append(description);
    }
    description.content = state.description;
  }
  if (state.heroHeadline !== undefined) {
    const h = doc.querySelector("main h1");
    if (h) h.textContent = state.heroHeadline;
  }
  if (state.heroBody !== undefined) {
    const h = doc.querySelector("main h1"),
      section = h?.closest("[data-csection]");
    const p =
      [...(section?.querySelectorAll("p") || [])].find(
        (p) => h && h.compareDocumentPosition(p) & 4,
      ) ||
      [...doc.querySelectorAll("main p")].find(
        (p) => h && h.compareDocumentPosition(p) & 4,
      );
    if (p) p.textContent = state.heroBody;
  }
  if (state.heroCTA !== undefined) {
    const h = doc.querySelector("main h1"),
      section = h?.closest("[data-csection]"),
      a =
        section?.querySelector("a,button") ||
        [...doc.querySelectorAll("main a,main button")].find(
          (n) => h && h.compareDocumentPosition(n) & 4,
        );
    if (a) a.textContent = state.heroCTA;
  }
  if (state.composition === "article") {
    container.style.maxWidth = "960px";
    container.style.marginInline = "auto";
  }
  if (state.composition === "split") {
    const layout = doc.createElement("style");
    layout.textContent =
      "main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:25px}main>:first-child{grid-column:1/-1}@media(max-width:700px){main{grid-template-columns:1fr}}";
    doc.head.append(layout);
  }
  const d = model.design;
  const style = doc.createElement("style");
  style.textContent = `${d.background ? "body{background:" + d.background + "!important}" : ""}${d.text ? "body{color:" + d.text + "!important}" : ""}main{--creator-space:${{ compact: "30px", normal: "60px", airy: "95px" }[d.spacing] || "60px"}}${d.spacing === "compact" || d.spacing === "airy" ? "main>section{padding-block:var(--creator-space)}" : ""}main{max-width:${{ narrow: "960px", normal: "min(1440px,100%)", wide: "100%" }[d.width] || "none"};margin-inline:auto}h1{font-size:${{ small: "clamp(32px,4vw,60px)", large: "clamp(44px,7vw,105px)" }[d.scale] || ""}}a.button,button,input[type=submit]{border-radius:${{ square: "0", soft: "10px", pill: "100px" }[d.buttons] || "4px"}}img{border-radius:${{ square: "0", soft: "14px", round: "35px" }[d.images] || "0"}}${d.header === "minimal" ? "header{box-shadow:none!important;border:0!important}" : ""}${d.header === "center" ? "header{text-align:center;justify-content:center!important;flex-wrap:wrap}" : ""}${d.footer === "minimal" ? "footer{padding:25px!important}" : ""}${d.footer === "center" ? "footer{text-align:center!important}" : ""}${d.hero === "inset" ? "main> :first-child{margin:25px;border-radius:25px;overflow:hidden}" : ""}${d.hero === "wide" ? "main> :first-child{max-width:none!important;width:100%;padding-block:10vh}main> :first-child img{width:100%;object-fit:cover}" : ""}${d.secondary ? "header{border-bottom:4px solid " + d.secondary + "!important}" : ""}.creator-added{padding:60px max(25px,6vw);background:#f1eee7;color:#202b39}.creator-added img{max-width:100%;height:auto}[hidden]{display:none!important}`;
  if (d.buttons === "original")
    style.textContent = style.textContent.replace(
      /a\.button,button,input\[type=submit\]\{border-radius:[^}]+\}/,
      "",
    );
  if (d.images === "original")
    style.textContent = style.textContent.replace(
      /img\{border-radius:[^}]+\}/,
      "",
    );
  doc.head.append(style);
  if (navigation.length) {
    doc.querySelectorAll("header nav").forEach((n) => (n.hidden = true));
    const nav = doc.createElement("nav");
    nav.className = "creator-navigation";
    const routes = [
      {
        slug: "",
        content: { [locale]: { title: locale === "cs" ? "Úvod" : "Home" } },
        visible: true,
      },
      ...navigation,
    ];
    for (const item of routes.filter(
      (p) =>
        p.visible !== false &&
        p.content?.[locale]?.title &&
        (model.pages[locale + "/" + p.slug]?.inNavigation ??
          (!p.slug.includes("/") && p.slug !== "checkout")),
    )) {
      const a = doc.createElement("a");
      a.textContent = item.content[locale].title;
      if (preview) {
        a.href = "#";
        a.dataset.previewPage = item.slug;
        a.dataset.previewLocale = locale;
      } else {
        const target =
          (locale === "cs" ? "" : locale + "/") +
          (item.slug ? item.slug + "/" : "") +
          "index.html";
        const from = (currentFile || "index.html").split("/");
        from.pop();
        const to = target.split("/");
        while (from.length && to.length && from[0] === to[0]) {
          from.shift();
          to.shift();
        }
        a.setAttribute("href", "../".repeat(from.length) + to.join("/"));
      }
      nav.append(a);
    }
    const head = doc.querySelector("header") || doc.body;
    head.append(nav);
    const ns = doc.createElement("style");
    ns.textContent =
      ".creator-navigation{display:flex;flex-wrap:wrap;gap:14px;padding:18px;clear:both;width:100%;font:14px/1.5 system-ui}.creator-navigation a{color:inherit}";
    doc.head.append(ns);
  }
  const catalogue = [...map.entries()]
    .filter(([, el]) => el.isConnected)
    .map(([sid, el]) => ({
      id: sid,
      group: el.parentNode === container ? "content" : "chrome",
      title:
        el.querySelector("h1,h2,h3")?.textContent?.slice(0, 90) ||
        el.tagName.toLowerCase(),
      hidden: el.hidden,
      compatible: !el.querySelector(
        "form,input,select,textarea,script,[id],button",
      ),
      fields: [...el.querySelectorAll("[data-cfield]")]
        .filter((n) => !n.closest("nav[hidden]"))
        .slice(0, 180)
        .map((n) => ({
          id: n.dataset.cfield,
          tag: n.tagName,
          text: n.tagName === "IMG" ? "" : n.textContent.slice(0, 4000),
          href: n.tagName === "A" ? n.getAttribute("href") || "" : undefined,
          alt: n.tagName === "IMG" ? n.alt : undefined,
          src: n.tagName === "IMG" ? n.getAttribute("src") : undefined,
        })),
    }))
    .sort((a, b) =>
      map.get(a.id).compareDocumentPosition(map.get(b.id)) & 4 ? -1 : 1,
    );
  if (preview) {
    doc.documentElement.dataset.creatorPage = key;
    doc.documentElement.dataset.creatorRevision = nonce;
    const storage = doc.createElement("script");
    storage.textContent =
      "(" +
      function (initial, nonce, origin) {
        const values = { ...initial };
        const store = {
          getItem: (k) => (Object.hasOwn(values, k) ? values[k] : null),
          setItem: (k, v) => {
            values[String(k)] = String(v);
            parent.postMessage(
              {
                type: "creator-runtime-storage",
                nonce,
                key: String(k),
                value: String(v),
              },
              origin,
            );
          },
          removeItem: (k) => {
            delete values[k];
            parent.postMessage(
              {
                type: "creator-runtime-storage",
                nonce,
                key: String(k),
                value: null,
              },
              origin,
            );
          },
          clear: () => {
            for (const k of Object.keys(values)) store.removeItem(k);
          },
          key: (i) => Object.keys(values)[i] || null,
          get length() {
            return Object.keys(values).length;
          },
        };
        Object.defineProperty(window, "localStorage", { value: store });
        Object.defineProperty(window, "sessionStorage", { value: store });
      }.toString() +
      ")(" +
      JSON.stringify(runtimeStorage).replace(/</g, "\\u003c") +
      "," +
      JSON.stringify(nonce) +
      "," +
      JSON.stringify(origin) +
      ");";
    doc.head.prepend(storage);
    const csp = doc.createElement("meta");
    csp.httpEquiv = "Content-Security-Policy";
    csp.content =
      "default-src 'none'; script-src 'unsafe-inline' " +
      origin +
      "; style-src 'unsafe-inline' https: http:; img-src https: http: data:; font-src https: http: data:; connect-src " +
      origin +
      "; form-action 'none'; base-uri " +
      origin;
    doc.head.prepend(csp);
    const bridge = doc.createElement("script");
    bridge.textContent =
      "(" +
      function (nonce, origin) {
        document.addEventListener(
          "click",
          (e) => {
            const link = e.target.closest("[data-preview-page]");
            if (link) {
              e.preventDefault();
              e.stopImmediatePropagation();
              parent.postMessage(
                {
                  type: "studio-navigation",
                  nonce,
                  slug: link.dataset.previewPage,
                  locale: link.dataset.previewLocale,
                },
                origin,
              );
              return;
            }
            const section = e.target.closest("[data-csection]");
            if (!section) return;
            parent.postMessage(
              {
                type: "creator-select",
                nonce,
                section: section.dataset.csection,
                field: e.target.closest("[data-cfield]")?.dataset.cfield,
              },
              origin,
            );
          },
          true,
        );
        window.addEventListener("message", (e) => {
          if (
            e.source !== parent ||
            e.origin !== origin ||
            e.data?.nonce !== nonce ||
            e.data.type !== "creator-outline"
          )
            return;
          document
            .querySelectorAll("[data-csection]")
            .forEach(
              (n) =>
                (n.style.outline =
                  n.dataset.csection === e.data.section
                    ? "3px solid #415cff"
                    : ""),
            );
        });
      }.toString() +
      ")(" +
      JSON.stringify(nonce) +
      "," +
      JSON.stringify(origin) +
      ");";
    doc.body.append(bridge);
  } else {
    doc.querySelectorAll("[data-cfield],[data-csection]").forEach((n) => {
      n.removeAttribute("data-cfield");
      n.removeAttribute("data-csection");
    });
  }
  return { html: "<!doctype html>" + doc.documentElement.outerHTML, catalogue };
}
export async function materializeImages(files) {
  for (const path of Object.keys(files)) {
    if (!path.endsWith(".html") || typeof files[path] !== "string") continue;
    const doc = new DOMParser().parseFromString(files[path], "text/html");
    let changed = false;
    for (const n of doc.querySelectorAll("[src],[data-b18-image]"))
      for (const attr of ["src", "data-b18-image"]) {
        const uri = n.getAttribute(attr) || "",
          match = uri.match(
            /^data:image\/(png|jpeg|webp);base64,([a-zA-Z0-9+/=]+)$/,
          );
        if (!match) continue;
        const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
        if (bytes.length > 6e6) throw Error("Image exceeds limit");
        const hash = [
          ...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        ]
          .map((n) => n.toString(16).padStart(2, "0"))
          .join("")
          .slice(0, 24);
        const file =
          "assets/uploads/" +
          hash +
          "." +
          (match[1] === "jpeg" ? "jpg" : match[1]);
        files[file] = bytes;
        n.setAttribute(attr, "../".repeat(path.split("/").length - 1) + file);
        changed = true;
      }
    if (changed)
      files[path] = "<!doctype html>" + doc.documentElement.outerHTML;
  }
  return files;
}

export function validateOutputLinks(files) {
  for (const [path, html] of Object.entries(files)) {
    if (!path.endsWith(".html")) continue;
    const doc = new DOMParser().parseFromString(html, "text/html");
    for (const a of doc.querySelectorAll("[href]")) {
      const href = a.getAttribute("href");
      if (!href || /^(?:https?:|mailto:|tel:|#|data:)/i.test(href)) continue;
      const target = new URL(
        href,
        "https://export.invalid/" + path,
      ).pathname.slice(1);
      if (
        !Object.hasOwn(files, target) &&
        !Object.hasOwn(files, target + "index.html")
      )
        throw Error("Missing local destination: " + href + " (" + path + ")");
    }
  }
}
