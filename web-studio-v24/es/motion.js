import { message } from "../messages.js";
// V22 presentation controller. V21's commerce, editor and business state remain authoritative.
const q = (s, root = document) => root.querySelector(s),
  all = (s, root = document) => [...root.querySelectorAll(s)];
const root = document.documentElement,
  base = new URL("../", import.meta.url);
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let paused = false;
try {
  paused = sessionStorage.getItem("dtmates-v22-motion") === "paused";
} catch {}
const enabled = () => !reduced.matches && !paused && !document.hidden;
const animate = (node, frames, options = {}) => {
  if (!node || !enabled()) return null;
  return node.animate(frames, {
    duration: 650,
    easing: "cubic-bezier(.22,.75,.18,1)",
    ...options,
  });
};
function motionState() {
  root.classList.toggle("motion-paused", paused || reduced.matches);
  root.dataset.motion = reduced.matches
    ? "reduced"
    : paused
      ? "paused"
      : "running";
  all("[data-motion-toggle]").forEach((b) => {
    b.disabled = reduced.matches;
    b.setAttribute("aria-pressed", String(paused || reduced.matches));
    b.textContent = reduced.matches
      ? "Animaciones reducidas"
      : paused
        ? "Reanudar animaciones"
        : "Pausar las animaciones";
  });
  if (!enabled()) {
    for (const a of document.getAnimations())
      if (a.effect?.getTiming().iterations !== Infinity) {
        try {
          a.finish();
        } catch {
          a.cancel();
        }
      }
    all("[data-depth]").forEach((el) => {
      el.style.setProperty("--depth-y", "0px");
      el.style.setProperty("--media-tilt", "0deg");
      el.style.setProperty("--phone-y", "0px");
    });
  }
}
all("[data-motion-toggle]").forEach(
  (b) =>
    (b.onclick = () => {
      paused = !paused;
      try {
        sessionStorage.setItem(
          "dtmates-v22-motion",
          paused ? "paused" : "running",
        );
      } catch {}
      motionState();
    }),
);
reduced.addEventListener("change", motionState);
addEventListener("visibilitychange", () => {
  root.classList.toggle("page-hidden", document.hidden);
  motionState();
});
motionState();
const hero = q(".hero");
if (hero) {
  const records = {
    timo: {
      title: ["Diseño", "que <em>cobra vida.</em>"],
      copy: "Sitios, tiendas y aplicaciones con carácter propio. Desde la primera impresión hasta el último clic.",
      name: "TIMO",
      category: "CONCEPTO COMERCIAL NO OFICIAL",
      desktop: "media/screens/timo-catalogue.jpg",
      mobile: "media/screens/timo-product.jpg",
      alt: "Catálogo y ficha de producto móvil reales de nuestra demostración comercial",
    },
    agile: {
      title: ["Un sistema", "que <em>conecta.</em>"],
      copy: "Una arquitectura bien pensada. Componentes compartidos. Una interfaz coherente en distintos idiomas.",
      name: "Agile Europe",
      category: "ESTUDIO TÉCNICO PROPIO",
      desktop: "media/screens/agile-desktop.jpg",
      mobile: "media/screens/agile-mobile.jpg",
      alt: "Captura real de nuestro estudio técnico, no del sitio oficial de la empresa",
    },
    pawmaster: {
      title: ["Pequeños pasos.", "<em>Un gran mundo.</em>"],
      copy: "Ilustraciones originales de entrenamiento y nueva UX web funcional. Elige una orden y prueba tu lección.",
      name: "PawMaster",
      category: "ILUSTRACIONES ORIGINALES / NUEVA UX WEB",
      desktop: "media/paw/come-2.webp",
      mobile: "media/paw/heel-2.webp",
      alt: "Ilustraciones originales de entrenamiento de PawMaster, no una captura del APK original",
    },
  };
  let serial = 0;
  async function changeWorld(key, button) {
    const record = records[key];
    if (!record) return;
    const current = ++serial;
    all("[data-world]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b === button)),
    );
    q(".world-switch").style.setProperty(
      "--selected",
      Object.keys(records).indexOf(key) * 100 + "%",
    );
    hero.dataset.heroWorld = key;
    q(".hero-canvas").dataset.heroWorld = key;
    q("#hero-title").innerHTML = record.title
      .map((text) => "<span>" + text + "</span>")
      .join("");
    q("#hero-description").textContent = record.copy;
    q("#hero-name").textContent = record.name;
    q("#hero-category").textContent = record.category;
    q("#hero-link").href = "case/" + key + ".html";
    all("#hero-title>span").forEach((line, i) =>
      animate(
        line,
        [
          { transform: "translateY(18px) rotate(1deg)" },
          { transform: "translateY(0) rotate(0)" },
        ],
        { delay: i * 70, duration: 700 },
      ),
    );
    const images = await Promise.all(
      [record.desktop, record.mobile].map(async (path) => {
        const image = new Image();
        image.src = new URL(path, base).href;
        await image.decode().catch(() => {});
        return image.src;
      }),
    );
    if (current !== serial) return;
    [q("#hero-image"), q("#hero-mobile")].forEach((img, i) => {
      img.src = images[i];
      img.alt = record.alt;
      animate(
        img,
        [
          {
            clipPath: i ? "inset(100% 0 0 0)" : "inset(0 100% 0 0)",
            transform: "scale(1.035)",
          },
          { clipPath: "inset(0 0 0 0)", transform: "scale(1)" },
        ],
        { duration: 800, delay: i * 90 },
      );
    });
    hero.classList.add("scene-changing");
    setTimeout(() => hero.classList.remove("scene-changing"), 850);
  }
  all("[data-world]").forEach(
    (b) => (b.onclick = () => changeWorld(b.dataset.world, b)),
  );
  all("#hero-title>span").forEach((line, i) =>
    animate(
      line,
      [{ transform: "translateY(25px)" }, { transform: "translateY(0)" }],
      { duration: 950, delay: 100 + i * 130 },
    ),
  );
  for (const [i, s] of [".hero-desktop", ".hero-phone"].entries()) {
    const el = q(s),
      transform = getComputedStyle(el).transform;
    animate(
      el,
      [
        { transform: transform + " translateY(45px) scale(.93)" },
        { transform },
      ],
      { duration: 1100, delay: 150 + i * 150 },
    );
  }
  const visible = new IntersectionObserver((entries) => {
    const active = entries[0].isIntersecting;
    hero.dataset.visible = String(active);
    hero.classList.toggle("offscreen", !active);
  });
  visible.observe(hero);
  if (matchMedia("(pointer:fine)").matches) {
    let pointerFrame;
    hero.addEventListener(
      "pointermove",
      (e) => {
        if (!enabled() || hero.dataset.visible === "false" || pointerFrame)
          return;
        pointerFrame = requestAnimationFrame(() => {
          pointerFrame = null;
          const rect = q(".hero-canvas").getBoundingClientRect();
          const x = Math.max(
              -0.5,
              Math.min(0.5, (e.clientX - rect.left) / rect.width - 0.5),
            ),
            y = Math.max(
              -0.5,
              Math.min(0.5, (e.clientY - rect.top) / rect.height - 0.5),
            );
          q(".hero-desktop").style.translate = `${x * 14}px ${y * 9}px`;
          q(".hero-phone").style.translate = `${-x * 10}px ${-y * 6}px`;
        });
      },
      { passive: true },
    );
    hero.addEventListener("pointerleave", () =>
      all(".hero-desktop,.hero-phone").forEach(
        (el) => (el.style.translate = "0px 0px"),
      ),
    );
  }
  // Touch swipe changes the same genuine scene state, without suppressing vertical page scrolling.
  let touch;
  const canvas = q(".hero-canvas");
  canvas.addEventListener(
    "touchstart",
    (e) => {
      touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    { passive: true },
  );
  canvas.addEventListener(
    "touchend",
    (e) => {
      if (!touch) return;
      const dx = e.changedTouches[0].clientX - touch.x,
        dy = e.changedTouches[0].clientY - touch.y;
      if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const buttons = all("[data-world]"),
          i = buttons.findIndex(
            (b) => b.getAttribute("aria-pressed") === "true",
          );
        buttons[
          (i + ((root.dir === "rtl" ? -dx : dx) < 0 ? 1 : 2)) % 3
        ].click();
      }
      touch = null;
    },
    { passive: true },
  );
}
// Scroll work is event-driven, visibility bounded, and uses compositor translations only.
const depthVisible = new Set();
const depthObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) =>
      e.isIntersecting
        ? depthVisible.add(e.target)
        : depthVisible.delete(e.target),
    );
    requestAnimationFrame(updateScroll);
  },
  { rootMargin: "100px" },
);
all("[data-depth]").forEach((el) => depthObserver.observe(el));
const chapters = all("[data-chapter]"),
  phases = all("[data-process-phase]");
let scrollPending = false;
function updateScroll() {
  scrollPending = false;
  const doc = document.documentElement;
  root.style.setProperty(
    "--reading",
    (100 * doc.scrollTop) / Math.max(1, doc.scrollHeight - doc.clientHeight) +
      "%",
  );
  if (enabled()) {
    const amount = innerWidth < 681 ? 7 : 22;
    for (const el of depthVisible) {
      const rect = el.getBoundingClientRect();
      const progress = Math.max(
        -1,
        Math.min(
          1,
          (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight,
        ),
      );
      el.style.setProperty("--depth-y", (-progress * amount).toFixed(1) + "px");
      el.style.setProperty(
        "--media-tilt",
        (progress * (innerWidth < 681 ? 1.5 : 5)).toFixed(2) + "deg",
      );
      el.style.setProperty(
        "--phone-y",
        (-progress * (innerWidth < 681 ? 12 : 44)).toFixed(1) + "px",
      );
    }
  }
  const nearest = (nodes) =>
    nodes
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.bottom > 0 && r.top < innerHeight)
      .sort(
        (a, b) =>
          Math.abs(a.r.top + a.r.height / 2 - innerHeight / 2) -
          Math.abs(b.r.top + b.r.height / 2 - innerHeight / 2),
      )[0]?.el;
  const chapter = nearest(chapters);
  if (chapter) {
    chapters.forEach((el) => (el.dataset.active = String(el === chapter)));
    all("[data-story-link]").forEach((a) => {
      if (a.dataset.storyLink === chapter.dataset.chapter)
        a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    const story = q(".project-story");
    if (story) {
      const index = chapters.indexOf(chapter);
      story.style.setProperty(
        "--story-progress",
        ((index + 1) / chapters.length) * 100 + "%",
      );
    }
  }
  const phase = nearest(phases);
  if (phase) {
    phases.forEach((el) => (el.dataset.active = String(el === phase)));
    all("[data-phase-link]").forEach((a) => {
      if (a.dataset.phaseLink === phase.dataset.processPhase)
        a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    q(".process-journey")?.style.setProperty(
      "--process-progress",
      ((Number(phase.dataset.processPhase) + 1) / 5) * 100 + "%",
    );
  }
}
addEventListener(
  "scroll",
  () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(updateScroll);
    }
  },
  { passive: true },
);
addEventListener("resize", updateScroll);
updateScroll();
const enterObserver = new IntersectionObserver(
  (entries) => {
    for (const e of entries)
      if (e.isIntersecting) {
        const el = e.target;
        enterObserver.unobserve(el);
        const sideways = el.matches(".service-editorial article") ? 24 : 0;
        animate(
          el,
          [
            { transform: `translate(${sideways}px,20px)` },
            { transform: "translate(0,0)" },
          ],
          { duration: 800 },
        );
      }
  },
  { threshold: 0.1 },
);
all("[data-enter]").forEach((el) => enterObserver.observe(el));
// Distinct image compositions, with actual desktop and mobile screenshots of each complete industry site.
if (q(".gallery-stage")) {
  const stage = q(".gallery-stage");
  let gallerySerial = 0;
  async function selectGallery(button) {
    const id = button.dataset.galleryId,
      current = ++gallerySerial,
      title = q("strong", button).textContent,
      category = q("small", button).textContent;
    all("[data-gallery-id]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b === button)),
    );
    stage.dataset.galleryWorld = id;
    q("#gallery-name").textContent = title;
    q("#gallery-category").textContent = category;
    q("#gallery-visit").href =
      id === "timo"
        ? "../shop/" + document.documentElement.lang + "/"
        : "../engine/sites/" + id + "/";
    q("#gallery-edit").href = "builder.html?site=" + id;
    const media = await Promise.all(
      ["desktop", "mobile"].map(async (mode) => {
        const image = new Image();
        image.src = new URL(
          "media/screens/" + id + "-" + mode + ".jpg",
          base,
        ).href;
        await image.decode().catch(() => {});
        return image.src;
      }),
    );
    if (current !== gallerySerial) return;
    [q("#gallery-desktop"), q("#gallery-mobile")].forEach((img, i) => {
      img.src = media[i];
      img.alt = message("gallery.capture", {
        brand: title,
        device: message(i ? "gallery.mobile" : "gallery.desktop"),
      });
      animate(
        img,
        [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }],
        { duration: 650, delay: i * 75 },
      );
    });
  }
  all("[data-gallery-id]").forEach((b) => (b.onclick = () => selectGallery(b)));
  all("[data-gallery-device]").forEach(
    (b) =>
      (b.onclick = () => {
        stage.dataset.device = b.dataset.galleryDevice;
        all("[data-gallery-device]").forEach((other) =>
          other.setAttribute("aria-pressed", String(other === b)),
        );
      }),
  );
  q("#industry-search").addEventListener("input", () =>
    queueMicrotask(() => {
      const visible = all("[data-industry]").filter((el) => !el.hidden);
      if (visible.length && !visible.some((el) => q("[aria-pressed=true]", el)))
        q("[data-gallery-id]", visible[0]).click();
    }),
  );
  q(".industry-list").addEventListener("keydown", (e) => {
    if (
      !["ArrowDown", "ArrowUp"].includes(e.key) ||
      !e.target.matches("[data-gallery-id]")
    )
      return;
    e.preventDefault();
    const buttons = all("[data-industry]")
        .filter((el) => !el.hidden)
        .map((el) => q("[data-gallery-id]", el)),
      i = buttons.indexOf(e.target),
      next =
        buttons[
          (i + (e.key === "ArrowDown" ? 1 : buttons.length - 1)) %
            buttons.length
        ];
    next.focus();
    next.click();
  });
}
all("[data-shop-route]").forEach(
  (b) =>
    (b.onclick = () => {
      all("[data-shop-route]").forEach((other) =>
        other.setAttribute("aria-pressed", String(other === b)),
      );
      q("#shop-step-label").textContent =
        q("span", b).textContent + " / demostración real existente";
      q("#live-project").src = new URL(
        "shop/" + document.documentElement.lang + "/" + b.dataset.shopRoute,
        base,
      ).href;
      animate(
        q(".live-shell"),
        [{ transform: "translateY(10px)" }, { transform: "translateY(0)" }],
        { duration: 450 },
      );
    }),
);
all("[data-frame-width]").forEach((b) =>
  b.addEventListener("click", () => {
    q(".live-shell").dataset.device =
      b.dataset.frameWidth === "390px" ? "mobile" : "desktop";
  }),
);
const system = {
  route: [
    "El idioma forma parte del recorrido.",
    "La estructura compartida permite cambiar de idioma sin abandonar la página abierta. El diagrama representa la arquitectura local verificada.",
  ],
  layout: [
    "Componentes compartidos, una base común.",
    "La navegación, el idioma y la dirección permanecen en un diseño compartido. El comportamiento adaptable se resuelve para toda la familia de páginas.",
  ],
  page: [
    "El contenido tiene su propia responsabilidad.",
    "Cada página integra su contenido, galerías y contactos en el sistema compartido. Los contenidos multimedia originales de la empresa no se publican en este diagrama público.",
  ],
};
all("[data-system-node]").forEach(
  (b, i) =>
    (b.onclick = () => {
      all("[data-system-node]").forEach((other) =>
        other.setAttribute("aria-pressed", String(other === b)),
      );
      q(".system-diagram").style.setProperty("--node-position", i * 38 + "%");
      const [title, copy] = system[b.dataset.systemNode];
      q("#system-detail strong").textContent = title;
      q("#system-detail p").textContent = copy;
      animate(
        q("#system-detail"),
        [{ transform: "translateX(12px)" }, { transform: "translateX(0)" }],
        { duration: 450 },
      );
    }),
);
all("[data-technical]").forEach((b) =>
  b.addEventListener("click", () => {
    q(".system-diagram").dataset.system = b.dataset.technical;
    animate(
      q("#technical-panel"),
      [{ transform: "translateY(12px)" }, { transform: "translateY(0)" }],
      { duration: 450 },
    );
  }),
);
q("#case-locale")?.addEventListener("change", (e) => {
  q("#locale-direction-label").textContent =
    e.target.value === "ar" ? "DE DERECHA A IZQUIERDA" : "DE IZQUIERDA A DERECHA";
  animate(
    q("#locale-navigation"),
    [
      {
        transform:
          "translateX(" + (e.target.value === "ar" ? "20" : "-20") + "px)",
      },
      { transform: "translateX(0)" },
    ],
    { duration: 600 },
  );
});
all("[data-owner]").forEach((b, i) =>
  b.addEventListener("click", () => {
    q(".ownership-map").dataset.activeOwner = b.dataset.owner;
    q(".ownership-map").style.setProperty("--owner-position", i * 150 + "%");
    animate(
      q("#owner-content"),
      [{ transform: "translateY(12px)" }, { transform: "translateY(0)" }],
      { duration: 500 },
    );
  }),
);
document.addEventListener("studio:paw", () => {
  animate(
    q("#paw-content>h3"),
    [{ transform: "translateX(9px)" }, { transform: "translateX(0)" }],
    { duration: 330 },
  );
  animate(
    q(".paw-training>img"),
    [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0)" }],
    { duration: 420 },
  );
});
q(".app-device")?.addEventListener("keydown", (e) => {
  if (e.target.matches("input,select,textarea")) return;
  if (e.key === "ArrowRight" && q("#paw-next")) {
    e.preventDefault();
    q("#paw-next").click();
  }
  if (e.key === "ArrowLeft" && q("#paw-back") && !q("#paw-back").disabled) {
    e.preventDefault();
    q("#paw-back").click();
  }
});
// The brief remains the existing genuine local-download workflow, with a live reading summary.
if (q("#project-brief")) {
  const form = q("#project-brief");
  const update = () => {
    const value = form.elements.goal.value.trim(),
      design = form.elements.design.selectedOptions[0]?.textContent;
    const filled = [
      value.length >= 12,
      form.elements.scope.value.trim().length > 0,
      form.elements.name.value.trim().length > 0 ||
        form.elements.email.value.trim().length > 0,
    ].filter(Boolean).length;
    q("#brief-summary-title").textContent =
      design && form.elements.design.value
        ? design
        : "Espacio para tu proyecto.";
    q("#brief-summary-copy").textContent =
      value ||
      "Empieza por el objetivo. El borrador se conserva al recargar esta pestaña.";
    q(".brief-summary").style.setProperty(
      "--brief-progress",
      (filled / 3) * 100 + "%",
    );
    q("#brief-summary-state").textContent = message("brief.progress", {
      count: filled,
    });
  };
  form.addEventListener("input", update);
  q("#clear-brief").addEventListener("click", () => queueMicrotask(update));
  update();
}
// Additional editor chrome delegates to the existing V21 model rather than duplicating it.
if (q("#editor-frame")) {
  const dialog = q("#template-dialog"),
    preview = q(".editor-preview"),
    frame = q("#editor-frame");
  function editorChrome() {
    const select = q("#editor-template"),
      id = select.value;
    preview.dataset.template = id;
    q("#editor-template-name").textContent =
      (select.selectedOptions[0]?.textContent || "Diseño propio") +
      " / " +
      (q("#editor-page").selectedOptions[0]?.textContent || "Inicio");
    all("[data-template-choice]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.templateChoice === id)),
    );
    all("[data-font-choice]").forEach((b) =>
      b.setAttribute(
        "aria-pressed",
        String(b.dataset.fontChoice === q("#edit-font").value),
      ),
    );
    all("[data-editor-action]").forEach(
      (b) => (b.disabled = q("#" + b.dataset.editorAction).disabled),
    );
  }
  q("#choose-template").onclick = () => {
    editorChrome();
    dialog.showModal();
  };
  q("#close-templates").onclick = () => dialog.close();
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog && e.clientX < dialog.getBoundingClientRect().left)
      dialog.close();
  });
  all("[data-template-choice]").forEach(
    (b) =>
      (b.onclick = () => {
        const select = q("#editor-template");
        select.value = b.dataset.templateChoice;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        dialog.close();
        queueMicrotask(editorChrome);
      }),
  );
  all("[data-font-choice]").forEach(
    (b) =>
      (b.onclick = () => {
        q("#edit-font").value = b.dataset.fontChoice;
        q("#edit-font").dispatchEvent(new Event("change", { bubbles: true }));
        queueMicrotask(editorChrome);
      }),
  );
  all("[data-editor-action]").forEach(
    (b) => (b.onclick = () => q("#" + b.dataset.editorAction).click()),
  );
  q("#editor-template").addEventListener("change", () =>
    queueMicrotask(editorChrome),
  );
  q("#edit-font").addEventListener("change", () =>
    queueMicrotask(editorChrome),
  );
  all("[data-device]").forEach((b) =>
    b.addEventListener(
      "click",
      () => (preview.dataset.device = b.dataset.device),
    ),
  );
  frame.addEventListener("load", () => {
    editorChrome();
    animate(
      frame,
      [
        { opacity: 0.85, transform: "scale(.988)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 330 },
    );
  });
  const toast = document.createElement("div");
  toast.className = "editor-toast";
  toast.setAttribute("aria-hidden", "true");
  document.body.append(toast);
  let timeout;
  new MutationObserver(() => {
    editorChrome();
    const text = q("#editor-status").textContent;
    if (
      /^(Koncept uložen|Uložený koncept načten|Konfigurace načtena|Editovatelná konfigurace stažena|Vícestránkový web ZIP stažen|Aplikační HTML koncept stažen|Šablona obnovena|Poslední změna vrácena|Změna obnovena|Soubor není platná|Export se nezdařil|Fotografie připravena)/i.test(
        text,
      )
    ) {
      toast.textContent = text;
      toast.classList.add("visible");
      clearTimeout(timeout);
      timeout = setTimeout(() => toast.classList.remove("visible"), 3600);
      animate(
        toast,
        [{ transform: "translateY(9px)" }, { transform: "translateY(0)" }],
        { duration: 300 },
      );
    }
  }).observe(q("#editor-status"), {
    subtree: true,
    childList: true,
    characterData: true,
  });
  new MutationObserver(editorChrome).observe(q("#export-site"), {
    attributes: true,
    attributeFilter: ["disabled"],
  });
  editorChrome();
  const properties = q("#editor-controls"),
    mobile = matchMedia("(max-width:680px)");
  let opener = null;
  document.body.classList.add("editor-enhanced");
  function propertyState(open) {
    const active = mobile.matches && open;
    document.body.classList.toggle("editor-properties-open", active);
    properties.inert = mobile.matches && !active;
    all("[data-mobile-panel]").forEach((b) =>
      b.setAttribute("aria-expanded", String(active && b === opener)),
    );
  }
  all("[data-mobile-panel]").forEach(
    (b) =>
      (b.onclick = () => {
        opener = b;
        propertyState(true);
        q('[data-panel="' + b.dataset.mobilePanel + '"]').click();
        q('[data-panel="' + b.dataset.mobilePanel + '"]').focus({
          preventScroll: true,
        });
      }),
  );
  q("#close-properties").onclick = () => {
    propertyState(false);
    opener?.focus({ preventScroll: true });
  };
  document.addEventListener(
    "keydown",
    (e) => {
      if (
        e.key === "Escape" &&
        mobile.matches &&
        document.body.classList.contains("editor-properties-open") &&
        properties.contains(document.activeElement)
      ) {
        e.preventDefault();
        propertyState(false);
        opener?.focus({ preventScroll: true });
      }
    },
    true,
  );
  mobile.addEventListener("change", () => propertyState(false));
  propertyState(false);
  new ResizeObserver(
    () =>
      (q("#preview-dimensions").textContent =
        Math.round(frame.clientWidth) + " px"),
  ).observe(frame);
}
q(".menu")?.addEventListener("click", () => {
  if (q(".menu").getAttribute("aria-expanded") === "true")
    all("#navigation>a").forEach((el, i) =>
      animate(
        el,
        [{ transform: "translateY(-7px)" }, { transform: "translateY(0)" }],
        { duration: 350, delay: i * 35 },
      ),
    );
});
document.addEventListener(
  "keydown",
  (e) => {
    if (
      e.key === "Escape" &&
      q("#navigation")?.contains(document.activeElement)
    )
      q(".menu").focus();
  },
  true,
);
