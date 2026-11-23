import { message, number } from "../messages.js";
import { commands } from "./paw-data.js";
import { agileLabels } from "./agile-labels.js";
import { estimate } from "../engine/estimate.js";
const q = (s, root = document) => root.querySelector(s),
  all = (s, root = document) => [...root.querySelectorAll(s)];
const media = new URL("../", import.meta.url);
const money = (n) =>
  new Intl.NumberFormat(document.documentElement.lang, {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(n);
for (const command of commands)
  command.name = message("paw.command." + command.id);
export function download(name, body, type = "application/json") {
  const href = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 3000);
}
q(".menu")?.addEventListener("click", () => {
  const open = q(".menu").getAttribute("aria-expanded") !== "true";
  q(".menu").setAttribute("aria-expanded", String(open));
  q("#navigation").classList.toggle("open", open);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    q(".menu")?.setAttribute("aria-expanded", "false");
    q("#navigation")?.classList.remove("open");
  }
});
q("#industry-search")?.addEventListener("input", (e) => {
  let count = 0;
  const needle = e.target.value.toLocaleLowerCase("cs");
  all("[data-industry]").forEach((card) => {
    card.hidden = !card.dataset.industry
      .toLocaleLowerCase("cs")
      .includes(needle);
    if (!card.hidden) count++;
  });
  q("#industry-empty").hidden = count > 0;
});
for (const b of all("[data-frame-width]"))
  b.onclick = () => {
    q("#live-project").style.width = b.dataset.frameWidth;
    all("[data-frame-width]").forEach((other) =>
      other.setAttribute("aria-pressed", String(other === b)),
    );
  };
const technical = {
  pages: [
    "Home → company → solutions → references → contact.",
    "The verified local SvelteKit application contains five page families. A shared layout preserves navigation and language settings.",
  ],
  languages: [
    "Language is part of the journey.",
    "The source contains eight dictionaries. Switching languages preserves the open page, and the Arabic version changes the interface direction to RTL.",
  ],
  interactions: [
    "Galleries, offices and navigation history.",
    "Reference galleries, keyboard controls and regional office selection were tested in the local source build. The public technical study has its own scope.",
  ],
};
for (const b of all("[data-technical]"))
  b.onclick = () => {
    const [title, text] = technical[b.dataset.technical];
    q("#technical-panel h3").textContent = title;
    q("#technical-panel p").textContent = text;
    all("[data-technical]").forEach((other) =>
      other.setAttribute("aria-pressed", String(other === b)),
    );
  };
const locale = q("#case-locale");
if (locale) {
  const render = () => {
    const target = q("#locale-navigation");
    target.lang = locale.value;
    target.dir = locale.value === "ar" ? "rtl" : "ltr";
    target.replaceChildren(
      ...agileLabels[locale.value].map((label) => {
        const span = document.createElement("span");
        span.textContent = label;
        return span;
      }),
    );
  };
  locale.onchange = render;
  render();
}
const ownership = {
  customer: [
    "Your domain, content and access.",
    "Register the domain on your own account. Source-code handover, licenses, data and access form part of an explicit agreement. Backups and export methods are defined before launch.",
  ],
  studio: [
    "Design, development and handover according to scope.",
    "The studio prepares agreed pages and integrations, tests, documentation and access. Ongoing service and response times are a separate agreement.",
  ],
  vendor: [
    "Direct costs of external services.",
    "Hosting, databases, business email, domain registration, payment fees, applications and developer accounts may have their own prices and licenses. The account is owned and paid for by the party designated in the contract.",
  ],
};
for (const b of all("[data-owner]"))
  b.onclick = () => {
    const [h, p] = ownership[b.dataset.owner];
    q("#owner-content h3").textContent = h;
    q("#owner-content p").textContent = p;
    all("[data-owner]").forEach((other) =>
      other.setAttribute("aria-pressed", String(other === b)),
    );
  };
let billing = "once";
const scope = q("#scope-form");
function scopeValue() {
  const d = new FormData(scope);
  return {
    type: d.get("type"),
    tier: d.get("tier"),
    pages: Number(d.get("pages")),
    languages: Number(d.get("languages")),
    gallery: d.has("gallery"),
    care: d.has("care"),
    mode: billing,
    months: 18,
  };
}
all("[data-price-once]").forEach((el) => {
  el.textContent = money(Number(el.dataset.priceOnce));
  el.dir = "auto";
});
function renderScope() {
  if (!scope) return;
  const data = scopeValue(),
    website = data.type === "website";
  q("#website-fields").hidden = !website;
  const quote = website ? estimate(data) : null;
  q("#scope-result").textContent = quote
    ? message("pricing.summary", {
        initial: money(quote.initial),
        monthly: money(quote.monthly),
        total: money(quote.total),
      })
    : "Individual pricing according to scope. We will map products, payments, data, integrations and operation. No automatic promise of backend pricing.";
  const params = new URLSearchParams(
    Object.entries(data).map(([key, value]) => [key, String(value)]),
  );
  q("#scope-brief").href = "contact.html?" + params;
}
for (const b of all("[data-billing]"))
  b.onclick = () => {
    billing = b.dataset.billing;
    all("[data-billing]").forEach((other) =>
      other.setAttribute("aria-pressed", String(other === b)),
    );
    all("[data-price-once]").forEach(
      (el) =>
        (el.textContent =
          money(
            Number(
              el.dataset[billing === "once" ? "priceOnce" : "priceMonthly"],
            ),
          ) + (billing === "monthly" ? message("pricing.month") : "")),
    );
    all("[data-plan]").forEach(
      (a) =>
        (a.href = "contact.html?plan=" + a.dataset.plan + "&mode=" + billing),
    );
    all("[data-monthly-only]").forEach(
      (el) => (el.hidden = billing !== "monthly"),
    );
    all("[data-price-note]").forEach(
      (el) =>
        (el.textContent =
          billing === "once"
            ? "One-time payment for development according to the agreed scope."
            : message("pricing.setup", {
                amount: money(Number(el.dataset.priceNote)),
              })),
    );
    renderScope();
  };
if (scope) {
  scope.addEventListener("input", renderScope);
  scope.onsubmit = (e) => e.preventDefault();
  renderScope();
}
const brief = q("#project-brief");
if (brief) {
  const key = "dtmates-v21-brief";
  let quote = null;
  const params = new URLSearchParams(location.search);
  try {
    const saved = JSON.parse(sessionStorage.getItem(key));
    if (saved)
      for (const [k, v] of Object.entries(saved))
        if (brief.elements[k] && typeof v === "string")
          brief.elements[k].value = v;
  } catch {}
  if (
    [...brief.elements.design.options].some(
      (o) => o.value === params.get("design"),
    )
  )
    brief.elements.design.value = params.get("design");
  if (params.has("type")) {
    const type = params.get("type");
    brief.elements.type.value = type === "custom" ? "app" : type;
  }
  if (params.has("tier") || params.has("plan")) {
    quote = {
      tier: params.get("tier") || params.get("plan"),
      pages: Number(params.get("pages")) || 3,
      languages: Number(params.get("languages")) || 1,
      mode: params.get("mode") || "once",
      gallery: params.get("gallery") === "true",
      care: params.get("care") === "true",
      months: 18,
    };
  }
  const quoteCopy = () => {
    if (quote && brief.elements.type.value === "website") {
      const val = estimate(quote);
      return message("pricing.briefQuote", {
        initial: money(val.initial),
        monthly: money(val.monthly),
        total: money(val.total),
      });
    }
    return "The project will be priced individually according to scope.";
  };
  const render = () => {
    q("#brief-estimate").textContent = quoteCopy();
    try {
      sessionStorage.setItem(
        key,
        JSON.stringify(Object.fromEntries(new FormData(brief))),
      );
    } catch {}
  };
  brief.oninput = render;
  brief.onsubmit = (e) => {
    e.preventDefault();
    if (!brief.reportValidity()) return;
    download(
      "dtmates-projekt.json",
      JSON.stringify(
        {
          version: 25,
          ...Object.fromEntries(new FormData(brief)),
          ...(window.creatorHandoff?{creatorConfiguration:window.creatorHandoff}:{}),
          estimate: quoteCopy(),
          delivery: "local-download-only",
        },
        null,
        2,
      ),
    );
    q("#brief-status").textContent =
      "The brief has been downloaded. Nothing was sent.";
  };
  q("#print-brief").onclick = () => window.print();
  q("#clear-brief").onclick = () => {
    brief.reset();
    quote = null;
    sessionStorage.removeItem(key);
    render();
    q("#brief-status").textContent = "The local brief has been cleared.";
  };
  render();
}
const paw = q("#paw-content");
if (paw) {
  const key = "dtmates-v21-paw";
  let state = {
      name: "My companion",
      dog: "Buddy",
      command: "down",
      step: 0,
      done: [],
    },
    tab = "training";
  try {
    const stored = JSON.parse(localStorage.getItem(key));
    if (
      stored &&
      typeof stored.name === "string" &&
      typeof stored.dog === "string" &&
      commands.some((c) => c.id === stored.command) &&
      Number.isInteger(stored.step) &&
      stored.step >= 0 &&
      stored.step < 5 &&
      Array.isArray(stored.done)
    )
      state = {
        name: stored.name.slice(0, 40),
        dog: stored.dog.slice(0, 40),
        command: stored.command,
        step: stored.step,
        done: [
          ...new Set(
            stored.done.filter((id) => commands.some((c) => c.id === id)),
          ),
        ],
      };
  } catch {}
  const persist = () => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  };
  const stepCopy = [
    "Prepare a calm environment and a reward.",
    "Show your dog the goal and focus their attention.",
    "Perform the movement slowly and clearly.",
    "Try the command and wait briefly.",
    "Finish the short lesson and allow time to rest.",
  ];
  function renderPaw() {
    paw.replaceChildren();
    document.querySelector(".app-device").dataset.completed = String(
      tab === "progress" && state.done.length > 0,
    );
    const command = commands.find((c) => c.id === state.command);
    const heading = document.createElement("h3");
    heading.textContent =
      tab === "training"
        ? "Today we train."
        : tab === "profile"
          ? "Your team."
          : "Small successes.";
    paw.append(heading);
    if (tab === "training") {
      const section = document.createElement("div");
      section.className = "paw-training";
      const label = document.createElement("label");
      label.textContent = "Choose a command";
      const select = document.createElement("select");
      select.id = "paw-command";
      commands.forEach((c) => select.add(new Option(c.name, c.id)));
      select.value = state.command;
      select.onchange = () => {
        state.command = select.value;
        state.step = 0;
        persist();
        renderPaw();
      };
      label.append(select);
      section.append(label);
      const shortcuts = document.createElement("div");
      shortcuts.className = "paw-shortcuts";
      for (const id of ["down", "heel", "sit"]) {
        const pick = document.createElement("button");
        pick.type = "button";
        pick.textContent = commands.find((c) => c.id === id).name;
        pick.onclick = () => {
          select.value = id;
          select.dispatchEvent(new Event("change"));
        };
        shortcuts.append(pick);
      }
      section.append(shortcuts);
      const image = new Image();
      const original = command.images[state.step];
      image.src = new URL(
        original
          ? "media/paw/" + original
          : "engine/assets/visuals/paw-dog-v15.webp",
        media,
      ).href;
      image.alt = original
        ? message("paw.artworkStep", {
            command: command.name,
            step: state.step + 1,
          })
        : "Generic dog illustration · the original image for this step is unavailable";
      section.append(image);
      const bar = document.createElement("div");
      bar.className = "paw-step-bar";
      bar.setAttribute(
        "aria-label",
        message("paw.stepAria", { step: state.step + 1 }),
      );
      for (let i = 0; i < 5; i++) {
        const line = document.createElement("i");
        if (i <= state.step) line.className = "done";
        bar.append(line);
      }
      section.append(bar);
      const title = document.createElement("h4");
      title.textContent = message("paw.step", {
        command: command.name,
        step: state.step + 1,
      });
      const desc = document.createElement("p");
      desc.textContent =
        stepCopy[state.step] +
        (original
          ? ""
          : " The original artwork for this step is unavailable; the displayed illustration is generic.");
      section.append(title, desc);
      const actions = document.createElement("div");
      actions.className = "actions";
      const back = document.createElement("button");
      back.id = "paw-back";
      back.textContent = "Back";
      back.disabled = state.step === 0;
      back.onclick = () => {
        state.step--;
        persist();
        renderPaw();
      };
      const next = document.createElement("button");
      next.id = "paw-next";
      next.textContent = state.step === 4 ? "Complete lesson" : "Next step";
      next.onclick = () => {
        if (state.step < 4) state.step++;
        else {
          state.done = [...new Set([...state.done, state.command])];
          tab = "progress";
          all("[data-paw-tab]").forEach((b) =>
            b.setAttribute("aria-pressed", String(b.dataset.pawTab === tab)),
          );
        }
        persist();
        renderPaw();
      };
      const reset = document.createElement("button");
      reset.textContent = "Restart";
      reset.onclick = () => {
        state.step = 0;
        persist();
        renderPaw();
      };
      actions.append(back, next, reset);
      section.append(actions);
      paw.append(section);
    } else if (tab === "profile") {
      const form = document.createElement("form");
      form.className = "app-profile";
      const portrait = document.createElement("div");
      portrait.className = "profile-portrait";
      const avatar = new Image();
      avatar.src = new URL("media/paw/heel-1.webp", media).href;
      avatar.alt = "Original PawMaster illustration";
      const team = document.createElement("div");
      const dogName = document.createElement("strong");
      dogName.textContent = state.dog;
      const detail = document.createElement("small");
      detail.textContent = "Your own profile / local storage";
      team.append(dogName, detail);
      portrait.append(avatar, team);
      form.append(portrait);
      for (const [id, text] of [
        ["name", "Your name"],
        ["dog", "Dog's name"],
      ]) {
        const label = document.createElement("label");
        label.textContent = text;
        const input = document.createElement("input");
        input.value = state[id];
        input.maxLength = 40;
        input.name = id;
        input.oninput = () => {
          state[id] = input.value;
          if (id === "dog") dogName.textContent = state[id] || "Your companion";
          persist();
        };
        label.append(input);
        form.append(label);
      }
      const note = document.createElement("p");
      note.textContent =
        "Sample profile. Saved only in this browser. Premium and ads are not connected.";
      form.append(note);
      form.onsubmit = (e) => e.preventDefault();
      paw.append(form);
    } else {
      const container = document.createElement("div");
      container.className = "app-progress";
      const title = document.createElement("p");
      title.textContent =
        state.dog +
        " · " +
        number(state.done.length) +
        " / " +
        number(commands.length) +
        " · " +
        message("paw.completed", { count: state.done.length });
      const meter = document.createElement("meter");
      meter.min = 0;
      meter.max = commands.length;
      meter.value = state.done.length;
      meter.setAttribute("aria-label", "Completed lessons");
      const list = document.createElement("ul");
      state.done.forEach((id) => {
        const li = document.createElement("li");
        li.textContent = commands.find((c) => c.id === id).name + " ✓";
        list.append(li);
      });
      const reset = document.createElement("button");
      reset.textContent = "Clear progress";
      reset.onclick = () => {
        state.done = [];
        state.step = 0;
        persist();
        renderPaw();
      };
      const orbit = document.createElement("div");
      orbit.className = "progress-orbit";
      orbit.innerHTML =
        '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50"/><circle cx="60" cy="60" r="50" stroke-dasharray="314.159" stroke-dashoffset="' +
        314.159 * (1 - state.done.length / commands.length) +
        '"/></svg>';
      const total = document.createElement("span");
      total.textContent = state.done.length;
      const countLabel = document.createElement("small");
      countLabel.textContent = message("paw.completed", {
        count: state.done.length,
      });
      total.append(countLabel);
      orbit.append(total);
      container.append(orbit, title, meter, list, reset);
      paw.append(container);
    }
    document.dispatchEvent(
      new CustomEvent("studio:paw", {
        detail: { tab, step: state.step, completed: state.done.length },
      }),
    );
  }
  all("[data-paw-tab]").forEach(
    (button) =>
      (button.onclick = () => {
        tab = button.dataset.pawTab;
        all("[data-paw-tab]").forEach((b) =>
          b.setAttribute("aria-pressed", String(b === button)),
        );
        renderPaw();
      }),
  );
  renderPaw();
}
