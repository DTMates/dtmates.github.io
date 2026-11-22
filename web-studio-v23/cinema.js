import { saveContext, readContext, clearContext } from "./context-store.js";
import { attachValidation } from "./validation.js";
import { message } from "./messages.js";
const q = (s) => document.querySelector(s),
  all = (s) => [...document.querySelectorAll(s)];
const locale = document.documentElement.lang,
  prefix = "/web-studio-v23/";
const reduced = matchMedia("(prefers-reduced-motion:reduce)");
const enabled = () =>
  !reduced.matches &&
  document.documentElement.dataset.motion === "running" &&
  !document.hidden;
function animate(el, frames, options = {}) {
  if (enabled() && el)
    return el.animate(frames, {
      duration: 950,
      easing: "cubic-bezier(.2,.8,.2,1)",
      ...options,
    });
}
try {
  localStorage.setItem("dtmates-v23-locale", locale);
} catch {}
function editorReady() {
  if (window.dtmatesEditor || !q("#editor")) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error("Editor not ready")), 15000);
    document.addEventListener(
      "studio:editor-ready",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}
function captureFrame(id) {
  const frame = q("#" + id);
  if (!frame) return null;
  try {
    const url = new URL(frame.contentWindow.location.href),
      match = url.pathname.match(
        /^\/web-studio-v23\/(agile|shop)\/[a-z]{2}\/(.*)$/,
      );
    if (!match) return null;
    const controls = [
      ...frame.contentDocument.querySelectorAll(
        "main input,main textarea,main select",
      ),
    ]
      .filter((el) => el.type !== "file")
      .map((el, index) => ({ index, value: el.value, checked: el.checked }));
    return {
      id,
      kind: match[1],
      path: match[2] + url.search + url.hash,
      controls,
    };
  } catch {
    return null;
  }
}
function restoreFrame(saved) {
  const frame = q("#" + saved.id);
  if (!frame) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(Error("Preview restore timeout")),
      15000,
    );
    frame.addEventListener(
      "load",
      () => {
        clearTimeout(timer);
        try {
          const controls = [
            ...frame.contentDocument.querySelectorAll(
              "main input,main textarea,main select",
            ),
          ].filter((el) => el.type !== "file");
          for (const item of saved.controls) {
            const el = controls[item.index];
            if (el) {
              el.value = item.value;
              if (["checkbox", "radio"].includes(el.type))
                el.checked = item.checked;
              el.dispatchEvent(new Event("input", { bubbles: true }));
              el.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      { once: true },
    );
    frame.src = prefix + saved.kind + "/" + locale + "/" + saved.path;
  });
}
function selected(attribute) {
  return q("[" + attribute + "][aria-pressed=true]")?.getAttribute(attribute);
}
function showLocaleError(select) {
  if (select) {
    select.disabled = false;
    select.value = locale;
  }
  const status = q("#locale-status");
  status.textContent = message("language.storageError");
  status.setAttribute("role", "alert");
}
all("[data-studio-language]").forEach((select) =>
  select.addEventListener("change", async () => {
    const target = select.value;
    select.disabled = true;
    select.setAttribute("aria-busy", "true");
    try {
      await editorReady();
      const context = {
        version: 1,
        route: document.body.dataset.route,
        scrollY,
        values: all("form input,form textarea,form select")
          .filter((el) => el.name && el.type !== "file")
          .map((el) => ({
            name: el.name,
            value: el.value,
            checked: el.checked,
          })),
        editor: window.dtmatesEditor?.snapshot(),
        world: q(".hero")?.dataset.heroWorld,
        frames: [
          captureFrame("agile-source-preview"),
          captureFrame("live-project"),
        ].filter(Boolean),
        ui: {
          pawTab: selected("data-paw-tab"),
          gallery: selected("data-gallery-id"),
          galleryDevice: selected("data-gallery-device"),
          billing: selected("data-billing"),
          owner: selected("data-owner"),
          system: selected("data-system-node"),
          technical: selected("data-technical"),
          search: q("#industry-search")?.value,
          caseLocale: q("#case-locale")?.value,
          onboarding: q(".paw-onboarding")?.open,
        },
      };
      await saveContext(context);
      localStorage.setItem("dtmates-v23-locale", target);
      const path =
        document.body.dataset.route === "index.html"
          ? ""
          : document.body.dataset.route;
      location.assign(
        prefix + target + "/" + path + location.search + location.hash,
      );
    } catch {
      showLocaleError(select);
    } finally {
      select.removeAttribute("aria-busy");
    }
  }),
);
(async () => {
  try {
    const saved = await readContext();
    if (saved?.version !== 1 || saved?.route !== document.body.dataset.route)
      return;
    for (const item of saved.values || [])
      for (const field of all("form [name]"))
        if (field.name === item.name) {
          field.value = item.value;
          if (["checkbox", "radio"].includes(field.type))
            field.checked = item.checked;
        }
    if (saved.editor) {
      await editorReady();
      window.dtmatesEditor.restore(saved.editor);
    }
    if (saved.world) q('[data-world="' + saved.world + '"]')?.click();
    const ui = saved.ui || {};
    for (const [key, attribute] of [
      ["pawTab", "data-paw-tab"],
      ["gallery", "data-gallery-id"],
      ["galleryDevice", "data-gallery-device"],
      ["billing", "data-billing"],
      ["owner", "data-owner"],
      ["system", "data-system-node"],
      ["technical", "data-technical"],
    ])
      if (ui[key])
        all("[" + attribute + "]")
          .find((el) => el.getAttribute(attribute) === ui[key])
          ?.click();
    if (ui.search !== undefined && q("#industry-search")) {
      q("#industry-search").value = ui.search;
      q("#industry-search").dispatchEvent(
        new Event("input", { bubbles: true }),
      );
    }
    if (ui.caseLocale && q("#case-locale")) {
      q("#case-locale").value = ui.caseLocale;
      q("#case-locale").dispatchEvent(new Event("change"));
    }
    if (ui.onboarding !== undefined && q(".paw-onboarding"))
      q(".paw-onboarding").open = ui.onboarding;
    for (const form of all("form"))
      form.dispatchEvent(new Event("input", { bubbles: true }));
    await Promise.all((saved.frames || []).map(restoreFrame));
    await clearContext();
    requestAnimationFrame(() => scrollTo(0, saved.scrollY));
  } catch {
    showLocaleError();
  }
})();
all("[data-palette]").forEach((button) =>
  button.addEventListener("click", () => {
    const field = q("#edit-color");
    field.value = button.dataset.palette;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    all("[data-palette]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b === button)),
    );
  }),
);
all("[data-agile-width]").forEach((button) =>
  button.addEventListener("click", () => {
    q("#agile-source-preview").style.width = button.dataset.agileWidth;
    all("[data-agile-width]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b === button)),
    );
  }),
);
all("[data-proof-slider]").forEach((input) =>
  input.addEventListener("input", () => {
    input
      .closest(".actual-comparison")
      .style.setProperty("--comparison", input.value + "%");
  }),
);
const hero = q(".hero");
if (hero) {
  const stage = q(".world-word");
  let current = hero.dataset.heroWorld;
  const show = () => {
    const key = hero.dataset.heroWorld;
    stage.textContent = {
      timo: "TIMO",
      agile: "Agile",
      pawmaster: "PawMaster",
    }[key];
    stage.dataset.sceneWord = key;
    animate(
      stage,
      [
        { clipPath: "inset(100% 0 0)", transform: "translateY(60px)" },
        { clipPath: "inset(0)", transform: "translateY(0)" },
      ],
      { duration: 1000 },
    );
    animate(
      q(".hero-canvas"),
      [
        { filter: "blur(5px)", clipPath: "inset(0 0 100% 0)" },
        { filter: "blur(0)", clipPath: "inset(0)" },
      ],
      { duration: 850 },
    );
    current = key;
  };
  new MutationObserver(() => {
    if (current !== hero.dataset.heroWorld) show();
  }).observe(hero, { attributes: true, attributeFilter: ["data-hero-world"] });
  show();
}
all(".page-intro h1,.fashion-hero h1,.technical-hero h1").forEach((el, i) =>
  animate(
    el,
    [
      { clipPath: "inset(0 0 100%)", transform: "translateY(35px)" },
      { clipPath: "inset(0)", transform: "translateY(0)" },
    ],
    { delay: i * 70 },
  ),
);
const seen = new WeakSet(),
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("cinema-visible", entry.isIntersecting);
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          const isScreen = entry.target.matches(
            ".owned-project,.service-evidence,.source-window",
          );
          animate(
            entry.target,
            isScreen
              ? [
                  {
                    clipPath: "inset(0 0 100% 0)",
                    transform: "translateY(35px)",
                  },
                  { clipPath: "inset(0)", transform: "translateY(0)" },
                ]
              : [
                  {
                    opacity: 0.6,
                    transform:
                      "translateX(" +
                      (document.dir === "rtl" ? -28 : 28) +
                      "px)",
                  },
                  { opacity: 1, transform: "translateX(0)" },
                ],
          );
        }
      }
    },
    { threshold: 0.08 },
  );
all(
  ".owned-project,.service-evidence,.source-window,.phase-art,.ownership-lines",
).forEach((el) => observer.observe(el));
// No idle animation loop. Scroll sampling is event-driven and bounded to visible theatre/media.
let pending = false;
function paint() {
  pending = false;
  if (!enabled()) return;
  if (hero && hero.getBoundingClientRect().bottom > 0) {
    const p = Math.min(1, Math.max(0, scrollY / (hero.offsetHeight || 1)));
    hero.style.setProperty("--scene-scroll", p);
  }
}
addEventListener(
  "scroll",
  () => {
    if (!pending) {
      pending = true;
      requestAnimationFrame(paint);
    }
  },
  { passive: true },
);

attachValidation();

q("[data-paw-start]")?.addEventListener("click", () => {
  q(".paw-onboarding").open = false;
  q("[data-paw-tab=training]")?.click();
  q("#paw-command")?.focus();
});
function achievement(count) {
  const card = q(".achievement-status");
  if (!card) return;
  q("[data-achievement-badge]").hidden = count === 0;
  q("[data-achievement-count]").textContent = message("paw.completed", {
    count,
  });
  q("[data-achievement-meter]").value = count;
  card.dataset.earned = String(count > 0);
  if (count > 0)
    animate(
      q(".achievement-mark"),
      [
        { transform: "scale(.7) rotate(-45deg)" },
        { transform: "scale(1) rotate(0)" },
      ],
      { duration: 800 },
    );
}
if (q(".achievement-status")) {
  let count = 0;
  try {
    count =
      JSON.parse(localStorage.getItem("dtmates-v21-paw") || "{}").done
        ?.length || 0;
  } catch {}
  achievement(count);
  document.addEventListener("studio:paw", (e) =>
    achievement(e.detail.completed),
  );
}
