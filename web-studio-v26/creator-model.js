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
    cards: ["original", "flat", "soft", "border"],
    navigation: ["original", "pill", "underline"],
    backgroundType: ["original", "solid", "gradient"],
  }))
    design[k] = values.includes(d[k])
      ? d[k]
      : [
            "header",
            "footer",
            "hero",
            "buttons",
            "images",
            "cards",
            "navigation",
            "backgroundType",
          ].includes(k)
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
  const primary = [
    ...el.querySelectorAll("h1,h2,h3,h4,p,a,button,img,figcaption,li"),
  ];
  // Append new leaf-value types so existing V26 field IDs never shift.
  const values = [...el.querySelectorAll("dt,dd,address,td,th")].filter(
    (n) =>
      !n.querySelector(
        "a,button,input,select,textarea,h1,h2,h3,h4,p,img,li,dt,dd,address,td,th",
      ),
  );
  [...primary, ...values].forEach((n, i) => (n.dataset.cfield = "f" + i));
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
    if (edit.background)
      el.style.setProperty("background-color", edit.background, "important");
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
          n.style.setProperty(
            "object-position",
            "50% " + v.focal + "%",
            "important",
          );
          n.style.setProperty("object-fit", "cover", "important");
        }
      } else if (v.text !== undefined) n.textContent = v.text;
      if (n.tagName === "A" && v.href !== undefined) {
        const destination = safeLink(v.href);
        n.setAttribute("href", destination);
        if (preview) {
          n.removeAttribute("data-preview-page");
          n.removeAttribute("data-preview-locale");
          if (!/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(destination)) {
            const from =
                (locale === "cs" ? "" : locale + "/") +
                (slug ? slug + "/" : "") +
                "index.html",
              target = new URL(
                destination,
                "https://creator.invalid/" + from,
              ).pathname
                .slice(1)
                .replace(/(?:^|\/)index\.html$/, "")
                .replace(/\/$/, "");
            const targetLocale = /^(en|ar)(?:\/|$)/.test(target)
                ? target.slice(0, 2)
                : "cs",
              targetSlug = targetLocale === "cs" ? target : target.slice(3);
            if (
              targetSlug === "" ||
              navigation.some((p) => p.slug === targetSlug)
            ) {
              n.dataset.previewPage = targetSlug;
              n.dataset.previewLocale = targetLocale;
            }
          }
        }
      }
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
  const radius = { square: "0px", soft: "10px", pill: "100px" }[d.buttons],
    imageRadius = { square: "0px", soft: "14px", round: "35px" }[d.images],
    heading = { small: 0.85, large: 1.18 }[d.scale];
  const h = doc.querySelector("main h1"),
    heroSection = h?.closest("[data-csection]");
  const action =
    heroSection?.querySelector("a,button") ||
    (slug === ""
      ? [...doc.querySelectorAll("main a,main button")].find(
          (n) => h && h.compareDocumentPosition(n) & 4,
        )
      : null);
  if (action?.tagName === "A" && radius) action.classList.add("creator-action");
  const channels = d.primary
    ?.slice(1)
    .match(/../g)
    ?.map((v) => parseInt(v, 16));
  const foreground =
    d.contrast ||
    (channels &&
    channels[0] * 0.299 + channels[1] * 0.587 + channels[2] * 0.114 > 150
      ? "#20242a"
      : "#ffffff");
  const style = doc.createElement("style");
  style.textContent = [
    d.background ? "body{background:" + d.background + "!important}" : "",
    d.text
      ? "body,main,main :is(h1,h2,h3,h4,p,li,dt,dd,address,td,th){color:" +
        d.text +
        "!important}"
      : "",
    d.primary
      ? "body>header{background:" +
        d.primary +
        "!important;color:" +
        foreground +
        "!important}body>header :is(a,strong,span,small,summary){color:" +
        foreground +
        "!important}button,input[type=submit],a.button,.creator-action{background:" +
        d.primary +
        "!important;border-color:" +
        d.primary +
        "!important;color:" +
        foreground +
        "!important}"
      : "",
    "main{--creator-space:" +
      ({ compact: "30px", normal: "60px", airy: "95px" }[d.spacing] || "60px") +
      ";max-width:" +
      ({ narrow: "960px", normal: "min(1440px,100%)", wide: "100%" }[d.width] ||
        "none") +
      (d.width === "narrow" || d.width === "wide" ? "!important" : "") +
      ";margin-inline:auto}",
    d.spacing === "compact" || d.spacing === "airy"
      ? "main>section{padding-block:var(--creator-space)!important}"
      : "",
    heading ? "main h1{overflow-wrap:anywhere}" : "",
    radius
      ? "a.button,button,input[type=submit],.creator-action{border-radius:" +
        radius +
        "!important}"
      : "",
    imageRadius ? "main img{border-radius:" + imageRadius + "!important}" : "",
    d.header === "minimal"
      ? "body>header{box-shadow:none!important;border:0!important}"
      : "",
    d.header === "center"
      ? "body>header{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;flex-wrap:wrap}body>header nav{justify-content:center!important}"
      : "",
    d.footer === "minimal" ? "body>footer{padding:25px!important}" : "",
    d.footer === "center" ? "body>footer{text-align:center!important}" : "",
    d.hero === "inset"
      ? "main>:first-child{margin:25px!important;border-radius:25px!important;overflow:hidden}"
      : "",
    d.hero === "wide"
      ? "main>:first-child{max-width:none!important;width:100%;padding-block:10vh!important}main>:first-child img{width:100%;object-fit:cover}"
      : "",
    d.secondary
      ? "body>header{border-bottom:4px solid " + d.secondary + "!important}"
      : "",
    ".creator-added{padding:60px max(25px,6vw);background:#f1eee7;color:#202b39}.creator-added img{max-width:100%;height:auto}[hidden]{display:none!important}",
  ].join("");
  // Explicit author choices override native theme !important rules, while
  // Original options leave native authoring untouched.
  if (radius)
    for (const n of doc.querySelectorAll(
      "button,input[type=submit],a.button,.creator-action",
    ))
      n.style.setProperty("border-radius", radius, "important");
  if (imageRadius)
    for (const n of doc.querySelectorAll("main img"))
      n.style.setProperty("border-radius", imageRadius, "important");
  if (d.spacing === "compact" || d.spacing === "airy")
    for (const n of doc.querySelectorAll("main>section"))
      n.style.setProperty(
        "padding-block",
        d.spacing === "compact" ? "30px" : "95px",
        "important",
      );
  if (d.width === "narrow" || d.width === "wide") {
    const main = doc.querySelector("main");
    main.style.setProperty(
      "max-width",
      d.width === "narrow" ? "960px" : "100%",
      "important",
    );
    main.style.setProperty(
      "width",
      d.width === "narrow" ? "min(960px,100%)" : "100%",
      "important",
    );
  }
  if (d.text)
    for (const n of doc.querySelectorAll(
      "main h1,main h2,main h3,main h4,main p,main li,main dt,main dd,main address,main td,main th",
    ))
      n.style.setProperty("color", d.text, "important");
  if (d.primary) {
    const head = doc.querySelector("body>header");
    if (head) {
      if (!state.edits?.[head.dataset.csection]?.background)
        head.style.setProperty("background-color", d.primary, "important");
      head.style.setProperty("color", foreground, "important");
      for (const n of head.querySelectorAll("a,strong,span,small,summary"))
        n.style.setProperty("color", foreground, "important");
    }
    for (const n of doc.querySelectorAll(
      "button,input[type=submit],a.button,.creator-action",
    )) {
      n.style.setProperty("background-color", d.primary, "important");
      n.style.setProperty("border-color", d.primary, "important");
      n.style.setProperty("color", foreground, "important");
    }
  }
  const explicit = (selector, property, value) => {
    if (value)
      for (const n of doc.querySelectorAll(selector))
        n.style.setProperty(property, value, "important");
  };
  explicit("body", "background-color", d.background);
  explicit("main a:not(.button):not(.creator-action)", "color", d.accent);
  explicit("main article,main [class*=card]", "background-color", d.surface);
  explicit("main small,main figcaption,main [class*=muted]", "color", d.muted);
  explicit(
    "main article,main [class*=card],body>footer,main input,main textarea,main select",
    "border-color",
    d.border,
  );
  explicit(
    "button,input[type=submit],a.button,.creator-action",
    "background-color",
    d.buttonBackground,
  );
  explicit(
    "button,input[type=submit],a.button,.creator-action",
    "color",
    d.buttonText,
  );
  if (d.cards === "soft")
    explicit("main article,main [class*=card]", "border-radius", "22px");
  if (d.cards === "border")
    explicit(
      "main article,main [class*=card]",
      "border",
      "1px solid " + (d.border || "#cccccc"),
    );
  if (d.cards === "flat") {
    explicit("main article,main [class*=card]", "box-shadow", "none");
    explicit("main article,main [class*=card]", "border-radius", "0px");
  }
  if (d.navigation === "pill") {
    explicit("body>header nav a", "border-radius", "100px");
    explicit("body>header nav a", "padding", "10px 15px");
    explicit("body>header nav a", "border", "1px solid currentColor");
  }
  if (d.navigation === "underline")
    explicit("body>header nav a", "text-decoration", "underline");
  if (d.backgroundType === "gradient" && d.background && d.surface)
    explicit(
      "body",
      "background-image",
      "linear-gradient(135deg," + d.background + "," + d.surface + ")",
    );
  // Coordinated themes paint the actual authored surfaces, preserving explicit
  // per-section backgrounds and the native DOM/layout/interaction identities.
  if (d.surface) {
    for (const n of doc.querySelectorAll("main,main>section,main>article"))
      if (!state.edits?.[n.dataset.csection]?.background)
        n.style.setProperty(
          "background-color",
          d.background || d.surface,
          "important",
        );
    // Native decorative gradients must not override the selected theme surface.
    explicit("main,main>section,main>article", "background-image", "none");
    for (const n of doc.querySelectorAll(
      "main aside,main article,main [class*=card],main [class*=panel],main [class*=tile],main [class*=summary],main [class*=hours],main [class*=copy],main .blackline-hero>div,main .atelier-hero>div,main .volt-job-sheet,main .v7-campaign>div",
    ))
      if (!state.edits?.[n.dataset.csection]?.background) {
        n.style.setProperty("background-color", d.surface, "important");
        n.style.setProperty("background-image", "none", "important");
      }
    explicit(
      "main input,main textarea,main select",
      "background-color",
      d.surface,
    );
    explicit("main input,main textarea,main select", "color", d.text);
    const footer = doc.querySelector("body>footer");
    if (footer && !state.edits?.[footer.dataset.csection]?.background)
      footer.style.setProperty("background-color", d.surface, "important");
    explicit(
      "body>footer h2,body>footer h3,body>footer p,body>footer a,body>footer span,body>footer small,body>footer strong",
      "color",
      d.text,
    );
  }
  if (heading) {
    const script = doc.createElement("script");
    script.textContent =
      "(" +
      function (factor) {
        const headings = [...document.querySelectorAll("main h1")].map((n) => ({
          n,
          size: n.style.getPropertyValue("font-size"),
          sizePriority: n.style.getPropertyPriority("font-size"),
          line: n.style.getPropertyValue("line-height"),
          linePriority: n.style.getPropertyPriority("line-height"),
        }));
        let scheduled = false;
        function resize() {
          scheduled = false;
          for (const h of headings) {
            h.n.style.setProperty("font-size", h.size, h.sizePriority);
            h.n.style.setProperty("line-height", h.line, h.linePriority);
          }
          const sizes = headings.map((h) => {
            const css = getComputedStyle(h.n),
              font = parseFloat(css.fontSize);
            return { font, line: parseFloat(css.lineHeight) || font * 1.1 };
          });
          headings.forEach((h, i) => {
            h.n.style.setProperty(
              "font-size",
              sizes[i].font * factor + "px",
              "important",
            );
            h.n.style.setProperty(
              "line-height",
              sizes[i].line * factor + "px",
              "important",
            );
          });
        }
        resize();
        addEventListener(
          "resize",
          () => {
            if (!scheduled) {
              scheduled = true;
              requestAnimationFrame(resize);
            }
          },
          { passive: true },
        );
      }.toString() +
      ")(" +
      JSON.stringify(heading) +
      ");";
    doc.body.append(script);
  }
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
      compatible:
        el.parentNode === container &&
        !el.querySelector("form,input,select,textarea,script,[id],button"),
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
      "; style-src 'unsafe-inline' https: http:; img-src https: http: data: blob:; font-src https: http: data:; connect-src " +
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
            const anchor = e.target.closest('a[href^="#"]');
            if (anchor && !anchor.hasAttribute("data-preview-page")) {
              e.preventDefault();
              let id = anchor.getAttribute("href").slice(1);
              try {
                id = decodeURIComponent(id);
              } catch {}
              if (id)
                document.getElementById(id)?.scrollIntoView({ block: "start" });
            }
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
