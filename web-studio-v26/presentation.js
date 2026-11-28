import { attachValidation } from "./validation.js";
import { message } from "./messages.js";
import { saveContext, readContext, clearContext } from "./context-store.js";
// V26 retains these customer interactions directly, without loading the retired
// V22/V24 presentation runtime or its obsolete homepage/editor selectors.
const $ = (s) => document.querySelector(s),
  all = (s) => [...document.querySelectorAll(s)],
  lang = document.documentElement.lang,
  cs = lang === "cs",
  T = (a, b) => (cs ? a : b),
  prefix = "/web-studio-v26/";
const reduced = matchMedia("(prefers-reduced-motion:reduce)");
let enabled = !reduced.matches;
try {
  enabled = enabled && localStorage.getItem("dtmates-v26-motion") !== "paused";
  localStorage.setItem("dtmates-v26-locale", lang);
} catch {}
function motion() {
  document.documentElement.dataset.motion = enabled ? "running" : "paused";
  all("[data-motion-toggle]").forEach((b) => {
    b.setAttribute("aria-pressed", String(!enabled));
    b.textContent = reduced.matches
      ? T("Omezený pohyb", "Reduced motion")
      : enabled
        ? T("Pozastavit pohyb", "Pause motion")
        : T("Obnovit pohyb", "Resume motion");
  });
  if (!enabled) document.getAnimations().forEach((a) => a.finish?.());
}
motion();
all("[data-motion-toggle]").forEach(
  (b) =>
    (b.onclick = () => {
      enabled = !enabled && !reduced.matches;
      try {
        localStorage.setItem(
          "dtmates-v26-motion",
          enabled ? "running" : "paused",
        );
      } catch {}
      motion();
    }),
);
reduced.addEventListener("change", () => {
  enabled = !reduced.matches;
  motion();
});
function animate(el, frames, options = {}) {
  if (el && enabled && !document.hidden)
    return el.animate(frames, {
      duration: 900,
      easing: "cubic-bezier(.18,.72,.18,1)",
      ...options,
    });
}
$(".menu")?.addEventListener("click", () => {
  const menu = $(".mast nav"),
    open = !menu.classList.contains("open");
  menu.classList.toggle("open", open);
  $(".menu").setAttribute("aria-expanded", String(open));
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $(".mast nav.open")) {
    $(".mast nav").classList.remove("open");
    $(".menu").setAttribute("aria-expanded", "false");
    $(".menu").focus();
  }
});
all(".hero-type>*").forEach((el, i) =>
  animate(
    el,
    [
      {
        opacity: 0,
        transform: "translateY(35px)",
        clipPath: "inset(100% 0 0 0)",
      },
      { opacity: 1, transform: "translateY(0)", clipPath: "inset(0)" },
    ],
    { delay: 80 * i, duration: 900 },
  ),
);
all(".hero-stage .window").forEach((el, i) =>
  animate(
    el,
    [
      { opacity: 0, translate: "0 100px", rotate: "8deg" },
      { opacity: 1, translate: "0 0", rotate: "0deg" },
    ],
    { delay: 300 + i * 180, duration: 1400 },
  ),
);
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animate(e.target, [
          { opacity: 0.25, transform: "translateY(45px)" },
          { opacity: 1, transform: "translateY(0)" },
        ]);
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.12 },
);
all(".design-tile,.service-compact,.delivery-compact,.section-title").forEach(
  (n) => io.observe(n),
);
let scheduled = false;
addEventListener(
  "scroll",
  () => {
    if (!enabled || scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const stage = $(".hero-stage");
      if (stage) {
        const p = Math.min(1, scrollY / 800);
        stage.style.transform =
          "translateY(" + p * 65 + "px) rotate(" + p * 2 + "deg)";
      }
    });
  },
  { passive: true },
);
let projectRevision = 0;
all("[data-project]").forEach(
  (b) =>
    (b.onclick = async () => {
      const revision = ++projectRevision;
      const id = b.dataset.project,
        name = { timo: "FORME", agile: "Agile", pawmaster: "PawMaster" }[id],
        file = {
          timo: "timo-catalogue",
          agile: "agile-desktop",
          pawmaster: "paw-training",
        }[id];
      all("[data-project]").forEach((x) =>
        x.setAttribute("aria-selected", String(x === b)),
      );
      const image = $("#work-image");
      animate(
        image,
        [
          { clipPath: "inset(0 0 0 0)", opacity: 1 },
          { clipPath: "inset(0 0 0 100%)", opacity: 0.2 },
        ],
        { duration: 250 },
      );
      await new Promise((r) => setTimeout(r, enabled ? 240 : 0));
      if (revision !== projectRevision) return;
      image.src = prefix + "media/screens/" + file + ".jpg";
      image.alt = name;
      $("#work-name").textContent = name;
      $("#work-type").textContent = {
        timo: "E-COMMERCE / FICTIONAL STORE DEMO",
        agile: "SVELTEKIT / SOURCE-DERIVED WEBSITE",
        pawmaster: "MOBILE / ILLUSTRATIVE WEB UX",
      }[id];
      $("#work-link").href =
        prefix + lang + "/case/" + (id === "timo" ? "fashion" : id) + ".html";
      $("#work-link").style.background = {
        timo: "#eddfd9",
        agile: "#dfe6eb",
        pawmaster: "#e8ebd1",
      }[id];
      animate(image, [
        { clipPath: "inset(0 100% 0 0)", transform: "rotate(2deg)" },
        { clipPath: "inset(0)", transform: "rotate(-3deg)" },
      ]);
    }),
);
all("[data-shop-route]").forEach(
  (b) =>
    (b.onclick = () => {
      const frame = $("#live-project");
      frame.src = prefix + "shop/" + lang + "/" + b.dataset.shopRoute;
      all("[data-shop-route]").forEach((n) =>
        n.setAttribute("aria-pressed", String(n === b)),
      );
    }),
);
all("[data-frame-width]").forEach(
  (b) =>
    (b.onclick = () => {
      $("#live-project").style.width = b.dataset.frameWidth;
    }),
);
all("[data-agile-width]").forEach(
  (b) =>
    (b.onclick = () => {
      $("#agile-source-preview").style.width = b.dataset.agileWidth;
      all("[data-agile-width]").forEach((n) =>
        n.setAttribute("aria-pressed", String(n === b)),
      );
    }),
);
function waitEditor() {
  if (!$("#editor") || window.dtmatesEditor) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(Error("Creator not ready")), 15000);
    document.addEventListener(
      "studio:editor-ready",
      () => {
        clearTimeout(t);
        resolve();
      },
      { once: true },
    );
  });
}
$("#studio-language")?.addEventListener("change", async (e) => {
  const select = e.target;
  try {
    await waitEditor();
    const data = {
      version: 26,
      route: document.body.dataset.route,
      editor: window.dtmatesEditor?.snapshot(),
      appEditor: window.appEditor?.snapshot(),
      requirements: window.requirementsApp?.snapshot(),
      scrollY,
      values: all("form [name]")
        .filter((n) => n.type !== "file")
        .map((n) => ({ name: n.name, value: n.value, checked: n.checked })),
    };
    await saveContext(data);
    const target = new URL(location.href);
    target.pathname = target.pathname.replace(
      "/" + lang + "/",
      "/" + select.value + "/",
    );
    location.assign(target);
  } catch (err) {
    select.value = lang;
    $("#locale-status").textContent = message("language.storageError");
    $("#locale-status").setAttribute("role", "alert");
  }
});
(async () => {
  try {
    const s = await readContext();
    if (s?.version !== 26 || s.route !== document.body.dataset.route) return;
    await waitEditor();
    if (s.editor) window.dtmatesEditor.restore(s.editor);
    if (s.appEditor) {
      if (!window.appEditor)
        await new Promise((resolve) =>
          document.addEventListener("app:ready", resolve, { once: true }),
        );
      window.appEditor.restore(s.appEditor);
    }
    if (s.requirements) {
      if (!window.requirementsApp)
        await new Promise((resolve) =>
          document.addEventListener("requirements:ready", resolve, {
            once: true,
          }),
        );
      window.requirementsApp.restore(s.requirements);
    }
    for (const item of s.values || [])
      for (const f of all("form [name]"))
        if (f.name === item.name) {
          f.value = item.value;
          if (["radio", "checkbox"].includes(f.type)) f.checked = item.checked;
        }
    all("form").forEach((f) =>
      f.dispatchEvent(new Event("input", { bubbles: true })),
    );
    await clearContext();
    requestAnimationFrame(() => scrollTo(0, s.scrollY));
  } catch (e) {
    if ($("#locale-status")) $("#locale-status").textContent = e.message;
  }
})();
let liteConfiguration;
const lite = $("#lite-frame");
function changeLite() {
  if (!lite) return;
  lite.contentWindow.postMessage(
    {
      type: "creator-lite",
      headline: $("#lite-headline").value,
      color: $("#lite-color").value,
      template: $("#lite-template").value,
    },
    location.origin,
  );
}
if (lite) {
  $("#lite-controls").onsubmit = (e) => e.preventDefault();
  all("#lite-controls input,#lite-controls select").forEach((n) =>
    n.addEventListener("input", changeLite),
  );
  lite.addEventListener("load", changeLite);
  addEventListener("message", (e) => {
    if (
      e.source === lite.contentWindow &&
      e.origin === location.origin &&
      e.data?.type === "creator-lite-state"
    )
      liteConfiguration = e.data.configuration;
  });
  $("#lite-open").onclick = (e) => {
    try {
      if (liteConfiguration)
        sessionStorage.setItem("dtmates-v26-lite", liteConfiguration);
      $("#lite-open").href =
        "builder.html?site=" + $("#lite-template").value + "&from=lite";
    } catch (err) {
      e.preventDefault();
      $("#lite-status").textContent = err.message;
    }
  };
}
if (
  document.body.dataset.route === "contact.html" &&
  new URLSearchParams(location.search).has("project")
) {
  try {
    const { readProject } = await import("./creator-ui.js");
    const record = await readProject(
      new URLSearchParams(location.search).get("project"),
    );
    if (record) {
      const parsed = JSON.parse(record.snapshot.configuration);
      if (parsed.version !== 21 || !parsed.project)
        throw Error("Invalid project");
      const form = $("#project-brief"),
        box = document.createElement("section");
      box.className = "handoff-summary";
      const h = document.createElement("h2");
      h.textContent =
        T("Projekt připojen: ", "Project attached: ") + record.name;
      const p = document.createElement("p");
      p.textContent = T(
        "Úplná konfigurace bude součástí staženého zadání. Nic se neodesílá na server.",
        "The full configuration is included in your downloaded brief. Nothing is sent to a server.",
      );
      box.append(h, p);
      form.before(box);
      const { validateCreator } = await import("./creator-model.js");
      validateCreator(parsed.settings?.creator);
      if (
        !["brand", "editorial", "modern"].includes(parsed.settings?.font) ||
        !["original", "wide", "compact"].includes(parsed.settings?.layout)
      )
        throw Error("Invalid project settings");
      if (parsed.project.id !== "paw") {
        const { normalize } = await import("./engine/project.js");
        normalize(parsed.project);
      }
      window.creatorHandoff = record.snapshot.configuration;
    }
  } catch (e) {
    $("#brief-status").textContent = e.message;
  }
}
const workButtons = all("[data-project]");
workButtons.forEach((b, i) =>
  b.addEventListener("keydown", (e) => {
    const step = {
      ArrowLeft: -1,
      ArrowRight: 1,
      Home: -i,
      End: workButtons.length - 1 - i,
    }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    const target =
      workButtons[(i + step + workButtons.length) % workButtons.length];
    target.focus();
    target.click();
  }),
);
const briefForm = $("#project-brief");
if (briefForm) {
  const update = () => {
    const value = briefForm.elements.goal.value.trim(),
      filled = [
        value.length >= 12,
        briefForm.elements.scope.value.trim().length > 0,
        briefForm.elements.name.value.trim().length > 0 ||
          briefForm.elements.email.value.trim().length > 0,
      ].filter(Boolean).length;
    $("#brief-summary-title").textContent = briefForm.elements.design.value
      ? briefForm.elements.design.selectedOptions[0].textContent
      : T("Prostor pro váš projekt.", "Room for your project.");
    $("#brief-summary-copy").textContent =
      value ||
      T(
        "Začněte cílem. Údaje zůstanou v této kartě.",
        "Start with your goal. Your draft stays in this tab.",
      );
    $("#brief-summary-state").textContent =
      filled + T(" ze 3 částí vyplněny", " of 3 parts completed");
    $(".brief-summary").style.setProperty(
      "--brief-progress",
      (filled / 3) * 100 + "%",
    );
  };
  briefForm.addEventListener("input", update);
  $("#clear-brief").addEventListener("click", () => queueMicrotask(update));
  update();
}
const phases = all("[data-process-phase]");
if (phases.length) {
  let queued = false;
  function updatePhase() {
    queued = false;
    const nearest = phases.reduce((a, b) =>
      Math.abs(
        b.getBoundingClientRect().top +
          b.getBoundingClientRect().height / 2 -
          innerHeight / 2,
      ) <
      Math.abs(
        a.getBoundingClientRect().top +
          a.getBoundingClientRect().height / 2 -
          innerHeight / 2,
      )
        ? b
        : a,
    );
    phases.forEach((p) => (p.dataset.active = String(p === nearest)));
    all("[data-phase-link]").forEach((a) => {
      if (a.dataset.phaseLink === nearest.dataset.processPhase)
        a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  addEventListener(
    "scroll",
    () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(updatePhase);
      }
    },
    { passive: true },
  );
  updatePhase();
}
$(".app-device")?.addEventListener("keydown", (e) => {
  if (e.target.matches("input,select,textarea")) return;
  if (e.key === "ArrowRight" && $("#paw-next")) {
    e.preventDefault();
    $("#paw-next").click();
  }
  if (e.key === "ArrowLeft" && $("#paw-back") && !$("#paw-back").disabled) {
    e.preventDefault();
    $("#paw-back").click();
  }
});

attachValidation();
$("[data-paw-start]")?.addEventListener("click", () => {
  $(".paw-onboarding").open = false;
  $("[data-paw-tab=training]")?.click();
  $("#paw-command")?.focus();
});
function achievement(count) {
  if (!$(".achievement-status")) return;
  $("[data-achievement-badge]").hidden = count === 0;
  $("[data-achievement-count]").textContent = message("paw.completed", {
    count,
  });
  $("[data-achievement-meter]").value = count;
  $(".achievement-status").dataset.earned = String(count > 0);
  if (count)
    animate(
      $(".achievement-mark"),
      [
        { transform: "scale(.7) rotate(-45deg)" },
        { transform: "scale(1) rotate(0)" },
      ],
      { duration: 800 },
    );
}
if ($(".achievement-status")) {
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
$("#scope-form")?.addEventListener("input", () =>
  animate(
    $("#scope-result"),
    [
      { opacity: 0.5, transform: "translateY(8px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration: 300 },
  ),
);

for (const b of document.querySelectorAll("[data-copy-email]"))
  b.onclick = async () => {
    try {
      await navigator.clipboard.writeText("DTMates111@gmail.com");
      b.textContent = T("Zkopírováno", "Copied");
    } catch {
      b.textContent = T(
        "Označte a zkopírujte viditelný e-mail.",
        "Select and copy the visible email.",
      );
    }
  };
