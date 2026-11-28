import { attachValidation } from "./validation.js";
import { plans } from "./engine/data.js";
import { estimate } from "./engine/estimate.js";
import {
  normalizeRequirements,
  requirementsPlan,
} from "./requirements-model.js";
import { validateCreator } from "./creator-model.js";
import { validateApp } from "./app-model.js";
import { store, download } from "./project-store.js";
const cs = document.documentElement.lang === "cs",
  T = (a, b) => (cs ? a : b),
  $ = (id) => document.getElementById(id),
  form = $("requirements-form"),
  db = "dtmates-v26-requirements";
const money = (n) =>
  new Intl.NumberFormat(cs ? "cs-CZ" : "en-GB", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(n);
const el = (tag, value) => {
  const n = document.createElement(tag);
  n.textContent = value;
  return n;
};
const labels = {
  cms: ["CMS / administrace", "CMS / admin panel"],
  accounts: ["Účty a přihlášení", "Accounts & authentication"],
  payments: ["Platby", "Payments"],
  inventory: ["Zásoby a objednávky", "Inventory & orders"],
  booking: ["Rezervace", "Booking"],
  emails: ["Transakční e-mail", "Transactional email"],
  apis: ["API integrace", "API integrations"],
  analytics: ["Analytika", "Analytics"],
  maintenance: ["Průběžná péče", "Maintenance"],
  backups: ["Zálohy", "Backups"],
  gallery: ["Galerie", "Gallery"],
};
let requirements = normalizeRequirements(),
  taskOverrides = {},
  handoff = null,
  timer;
const message = (s) => {
  $("requirements-status").textContent = s;
};
for (const [key, pair] of Object.entries(labels)) {
  const label = el("label", pair[cs ? 0 : 1]),
    input = document.createElement("input");
  input.type = "checkbox";
  input.name = key;
  label.className = "check";
  label.prepend(input);
  $("requirements-features").append(label);
}
function read() {
  const data = Object.fromEntries(new FormData(form));
  for (const key of [...Object.keys(labels), "production"])
    data[key] = form.elements[key].checked;
  return normalizeRequirements(data);
}
function apply(r) {
  for (const [key, value] of Object.entries(r)) {
    const field = form.elements[key];
    if (!field) continue;
    if (field.type === "checkbox") field.checked = value === true;
    else field.value = value;
  }
}
function price(r) {
  if (r.type !== "website" || r.complexity !== "standard" || r.languages > 3)
    return null;
  return estimate({ ...r, care: r.maintenance, months: 18 });
}
function proposal() {
  const plan = requirementsPlan(requirements, cs ? "cs" : "en"),
    value = price(requirements);
  return {
    schema: "dtmates.customer-proposal",
    version: 1,
    created: new Date().toISOString(),
    contact: "DTMates111@gmail.com",
    requirements,
    scope: {
      database: plan.databaseNeeded ? "needs-confirmation" : "not-required",
      requestedFeatures: Object.keys(labels).filter((k) => requirements[k]),
    },
    pricing: value
      ? {
          currency: "CZK",
          oneTimeDevelopmentOrSetup: value.initial,
          monthlyService: value.monthly,
          illustrativeMonths: value.months,
          illustrativeDevelopmentAndServiceTotal: value.total,
          source:
            "Retained V25 source-defined estimate; nonbinding working assumptions",
          providers: "Determined by provider; excluded",
          vat: "Needs confirmation",
          additionalScope: "Individually quoted",
        }
      : {
          development: "Quoted individually",
          monthly: "Separately quoted",
          thirdParty: "Determined by provider",
          vat: "Needs confirmation",
        },
    assumptions: plan.assumptions,
    exclusions: plan.exclusions,
    creatorProject: handoff,
  };
}
function internal() {
  const plan = requirementsPlan(requirements, cs ? "cs" : "en");
  return {
    schema: "dtmates.internal-delivery",
    version: 1,
    created: new Date().toISOString(),
    requirements,
    tasks: plan.tasks.map((t) => ({ ...t, ...taskOverrides[t.id] })),
    outstandingConfirmations: plan.tasks
      .filter((t) => t.requirement === "needs-confirmation")
      .map((t) => t.id),
    creatorProject: handoff,
  };
}
function print(data, title) {
  const tab = window.open("", "_blank");
  if (!tab)
    return message(T("Povolte okno pro tisk.", "Allow the print window."));
  const doc = tab.document;
  doc.title = title;
  const make = (tag, value) => {
    const n = doc.createElement(tag);
    n.textContent = value;
    return n;
  };
  const style = make(
    "style",
    "body{font:16px/1.5 system-ui;padding:36px;max-width:1050px;margin:auto;color:#222436}h1{font-size:36px;line-height:1.08}h2{font-size:24px;margin-top:35px}article{break-inside:avoid;border-top:1px solid #ccd;padding:16px 0}p{max-width:85ch}dt{font-weight:650;margin-top:12px}dd{margin-left:0}small{font-size:14px}ul{padding-left:20px}@media print{body{padding:0}}",
  );
  doc.head.append(style);
  doc.body.append(
    make(
      "small",
      "DTMates Web Studio · " +
        new Date(data.created).toLocaleDateString(cs ? "cs-CZ" : "en-GB"),
    ),
    make("h1", title),
  );
  const r = data.requirements,
    dl = doc.createElement("dl");
  for (const [label, value] of [
    [
      T("Typ projektu", "Project type"),
      {
        website: T("Webová prezentace", "Website"),
        commerce: T("E-commerce", "E-commerce"),
        webapp: T("Webová aplikace", "Web application"),
        mobile: T("Mobilní aplikace", "Mobile application"),
      }[r.type],
    ],
    [T("Stránky / obrazovky", "Pages / screens"), r.pages],
    [T("Jazyky", "Languages"), r.languages],
    [
      T("Cíl projektu", "Project goal"),
      r.goal || T("K doplnění", "To be confirmed"),
    ],
    [T("Obsah a práva", "Content and rights"), r.content],
    [T("Doména / hosting", "Domain / hosting"), r.domain + " / " + r.hosting],
    [T("Vlastnictví a předání", "Ownership and handover"), r.ownership],
  ])
    dl.append(make("dt", label), make("dd", value));
  doc.body.append(dl);
  if (data.schema === "dtmates.customer-proposal") {
    doc.body.append(
      make("h2", T("Náklady a předpoklady", "Costs and assumptions")),
    );
    const price = data.pricing;
    if (typeof price.oneTimeDevelopmentOrSetup === "number")
      doc.body.append(
        make(
          "p",
          T("Vývoj / nastavení: ", "Development / setup: ") +
            money(price.oneTimeDevelopmentOrSetup),
        ),
        make(
          "p",
          T("Měsíční služba: ", "Monthly service: ") +
            money(price.monthlyService),
        ),
        make(
          "p",
          T(
            "Orientační součet za 18 měsíců: ",
            "Illustrative18-month total: ",
          ) + money(price.illustrativeDevelopmentAndServiceTotal),
        ),
      );
    else
      doc.body.append(
        make(
          "p",
          T(
            "Vývoj a průběžné služby naceníme individuálně.",
            "Development and ongoing services are quoted individually.",
          ),
        ),
      );
    doc.body.append(
      make(
        "p",
        T(
          "Poskytovatelé a daňový režim: k potvrzení. Další funkce a služby nejsou zahrnuty bez výslovné nabídky.",
          "Providers and VAT treatment: to be confirmed. Additional features/services are excluded until explicitly quoted.",
        ),
      ),
    );
    for (const [key, name] of [
      ["assumptions", T("Předpoklady", "Assumptions")],
      ["exclusions", T("Výluky", "Exclusions")],
    ]) {
      doc.body.append(make("h2", name));
      for (const text of data[key]) doc.body.append(make("p", text));
    }
    if (data.creatorProject)
      doc.body.append(
        make("h2", T("Připojený návrh", "Attached design")),
        make(
          "p",
          data.creatorProject.kind === "app"
            ? data.creatorProject.model.name
            : data.creatorProject.configuration.project.brand,
        ),
        make(
          "p",
          T(
            "Editovatelný návrh a média jsou ve staženém JSON. Přiložte jej samostatně.",
            "The editable design and media are in the downloaded JSON. Attach it separately.",
          ),
        ),
      );
  } else {
    doc.body.append(make("h2", T("Pracovní úkoly", "Delivery tasks")));
    for (const task of data.tasks) {
      const row = doc.createElement("article");
      row.append(
        make("h3", task.title),
        make(
          "p",
          friendly(task.requirement) +
            " · " +
            friendly(task.costClassification) +
            " · " +
            T("Cena k potvrzení", "Cost to confirm"),
        ),
        make(
          "p",
          T("Vlastník: ", "Owner: ") +
            task.owner +
            " · " +
            T("Stav: ", "Status: ") +
            task.completion,
        ),
      );
      if (task.dependencies.length)
        row.append(
          make(
            "small",
            T("Navazuje na: ", "Depends on: ") +
              task.dependencies
                .map((id) => data.tasks.find((t) => t.id === id)?.title || id)
                .join("; "),
          ),
        );
      doc.body.append(row);
    }
  }
  doc.body.append(make("p", "DTMates111@gmail.com"));
  tab.focus();
  tab.print();
}
function cards(mode) {
  const container = $("package-cards");
  container.replaceChildren();
  for (const p of plans) {
    const article = el("article", "");
    article.append(
      el("span", p.name),
      el(
        "h2",
        money(mode === "once" ? p.buy : p.monthly) +
          (mode === "monthly" ? T(" / měsíc", " / month") : ""),
      ),
      el(
        "p",
        p.pagesIncluded === null
          ? T("Individuální rozsah", "Custom scope")
          : T(
              "Do " + p.pagesIncluded + " stránek",
              "Up to " + p.pagesIncluded + " pages",
            ),
      ),
    );
    if (mode === "monthly")
      article.append(
        el(
          "p",
          T("Nastavení: ", "Setup: ") +
            money(p.setup) +
            T(" · předpoklad 18 měsíců", " ·18-month assumption"),
        ),
      );
    const b = el("button", T("Posoudit tento rozsah", "Assess this scope"));
    b.onclick = () => {
      requirements = {
        ...read(),
        type: "website",
        tier: p.id,
        mode,
        pages: p.pagesIncluded || 8,
      };
      apply(requirements);
      update();
      $("requirements").scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
          ? "auto"
          : "smooth",
      });
    };
    article.append(b);
    container.append(article);
  }
}
const friendly = (s) =>
  ({
    required: T("Požadováno", "Required"),
    optional: T("Volitelné", "Optional"),
    "not-applicable": T("Netýká se", "Not applicable"),
    "needs-confirmation": T("Potvrdit", "Needs confirmation"),
    "one-time": T("Jednorázově", "One-time"),
    monthly: T("Průběžně", "Recurring"),
    "third-party": T(
      "Poskytovatel — cenu potvrdí",
      "Provider — price to confirm",
    ),
    "included-scope": T("V dohodnutém rozsahu", "Within agreed scope"),
    quote: T("Individuální nabídka", "Individual quote"),
  })[s] || s;
function renderTasks() {
  const list = $("delivery-tasks"),
    plan = requirementsPlan(requirements, cs ? "cs" : "en");
  list.replaceChildren();
  for (const task of plan.tasks) {
    const row = el("article", "");
    row.dataset.task = task.id;
    const value = { ...task, ...taskOverrides[task.id] };
    row.append(
      el("h3", task.title),
      el(
        "p",
        friendly(task.requirement) +
          " · " +
          friendly(task.costClassification) +
          " · " +
          T("Cena k potvrzení", "Cost to confirm"),
      ),
    );
    for (const [key, title, options] of [
      [
        "owner",
        T("Vlastník úkolu", "Task owner"),
        [
          ["studio", "DTMates"],
          ["customer", T("Zákazník", "Customer")],
          ["provider", T("Poskytovatel", "Provider")],
        ],
      ],
      [
        "completion",
        T("Stav", "Completion status"),
        [
          ["todo", T("K provedení", "To do")],
          ["active", T("Probíhá", "In progress")],
          ["complete", T("Dokončeno", "Complete")],
          ["blocked", T("Čeká na potvrzení", "Awaiting confirmation")],
        ],
      ],
    ]) {
      const label = el("label", title),
        select = document.createElement("select");
      for (const [v, text] of options) {
        const o = el("option", text);
        o.value = v;
        select.append(o);
      }
      select.value = value[key];
      select.onchange = () => {
        taskOverrides[task.id] = {
          ...taskOverrides[task.id],
          [key]: select.value,
        };
        save();
      };
      label.append(select);
      row.append(label);
    }
    list.append(row);
  }
}
function update() {
  const previousType = requirements.type;
  if (previousType === "commerce" && form.elements.type.value !== "commerce")
    for (const k of ["payments", "inventory", "emails"])
      form.elements[k].checked = false;
  requirements = read();
  $("website-pricing-fields").hidden = requirements.type !== "website";
  $("commerce-scope").hidden = requirements.type !== "commerce";
  $("mobile-scope").hidden = requirements.type !== "mobile";
  if (requirements.type === "commerce" && requirements.production)
    for (const k of ["payments", "inventory", "emails"])
      form.elements[k].checked = true;
  const box = $("requirements-estimate");
  box.replaceChildren(
    el("h3", T("Oddělené nákladové části", "Separate cost categories")),
  );
  const value = price(requirements);
  if (value) {
    box.append(
      el("strong", money(value.initial) + T(" při zahájení", " initial")),
      el(
        "p",
        money(value.monthly) +
          T(" měsíčně za dohodnutou službu", " monthly for the agreed service"),
      ),
      el(
        "p",
        T("Příklad za 18 měsíců: ", "Illustrative18-month total: ") +
          money(value.total),
      ),
    );
  } else
    box.append(
      el(
        "strong",
        T(
          "Vývoj naceníme individuálně.",
          "Development is quoted individually.",
        ),
      ),
    );
  box.append(
    el(
      "p",
      T(
        "Poskytovatelé, doména, hosting, databáze a integrace: cenu potvrdí poskytovatel / nabídka.",
        "Providers, domain, hosting, database and integrations: provider price / individual quote.",
      ),
    ),
    el(
      "p",
      T(
        "Daňový režim a rozsah je nutné potvrdit. Bez automatické objednávky.",
        "VAT treatment and scope need confirmation. No automatic order.",
      ),
    ),
  );
  const overview = el("section", "");
  overview.id = "proposal-overview";
  overview.append(
    el("h4", T("Váš rozsah", "Your scope")),
    el(
      "p",
      requirements.pages +
        T(" stránek / obrazovek · ", " pages / screens · ") +
        requirements.languages +
        T(" jazyků", " languages"),
    ),
    el(
      "p",
      requirements.goal ||
        T("Doplňte hlavní cíl projektu.", "Add your main project goal."),
    ),
  );
  box.append(overview);
  $("quote-email").href =
    "mailto:DTMates111@gmail.com?subject=" +
    encodeURIComponent(
      T("Poptávka DTMates — ", "DTMates quote request — ") + requirements.type,
    ) +
    "&body=" +
    encodeURIComponent(
      T(
        "Dobrý den, rád/a bych probral/a svůj projekt. Stažený přehled projektu přiložím ručně.",
        "Hello, I would like to discuss my project. I will manually attach the downloaded project summary.",
      ),
    );
  renderTasks();
  save();
}
function save() {
  $("requirements-save-state").textContent = T(
    "Ukládám místní návrh…",
    "Saving local draft…",
  );
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      await store(
        "readwrite",
        (s) =>
          s.put({
            id: "requirements-draft",
            requirements,
            taskOverrides,
            handoff,
          }),
        db,
      );
      $("requirements-save-state").textContent = T(
        "Návrh uložen v tomto prohlížeči.",
        "Draft saved in this browser.",
      );
    } catch (e) {
      message(
        T(
          "Místní uložení není dostupné; stáhněte JSON.",
          "Local saving is unavailable; download JSON.",
        ),
      );
    }
  }, 250);
}
form.oninput = update;
form.onchange = update;
form.onsubmit = (e) => e.preventDefault();
for (const b of document.querySelectorAll("[data-cost-mode]"))
  b.onclick = () => {
    form.elements.mode.value = b.dataset.costMode;
    cards(b.dataset.costMode);
    document
      .querySelectorAll("[data-cost-mode]")
      .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    update();
  };
$("download-proposal").onclick = () => {
  if (!form.reportValidity()) return;
  download(
    "dtmates-customer-proposal.json",
    JSON.stringify(proposal(), null, 2),
  );
  message(
    T(
      "Přehled stažen. Přiložte jej ručně k e-mailu.",
      "Summary downloaded. Attach it manually to your email.",
    ),
  );
};
$("download-checklist").onclick = () =>
  download(
    "dtmates-internal-delivery.json",
    JSON.stringify(internal(), null, 2),
  );
$("print-proposal").onclick = () =>
  form.reportValidity() &&
  print(proposal(), T("Přehled projektu", "Customer project summary"));
$("print-checklist").onclick = () =>
  print(
    internal(),
    T("Interní dodací seznam DTMates", "DTMates internal delivery checklist"),
  );
try {
  const saved = await store("readonly", (s) => s.get("requirements-draft"), db);
  if (saved) {
    requirements = normalizeRequirements(saved.requirements);
    taskOverrides = saved.taskOverrides || {};
    handoff = saved.handoff || null;
  }
  const from = new URLSearchParams(location.search).get("from");
  if (from === "app") {
    const record = await store("readonly", (s) => s.get("app-handoff"), db);
    if (record) {
      const model = validateApp(record.model);
      const sameProject =
        handoff?.kind === "app" && handoff.model?.id === model.id;
      if (!sameProject) taskOverrides = {};
      handoff = { kind: "app", model };
      requirements = {
        ...(sameProject ? requirements : normalizeRequirements()),
        type: "mobile",
        pages: model.screens.length,
        production: false,
      };
    }
  }
  if (from === "website") {
    const record = await store("readonly", (s) => s.get("website-handoff"), db);
    if (record) {
      const parsed = JSON.parse(record.configuration);
      if (parsed.version !== 21 || !parsed.project?.id)
        throw Error("Invalid website handoff");
      validateCreator(parsed.settings?.creator);
      const sameProject =
        handoff?.kind === "website" && handoff.projectId === record.projectId;
      if (!sameProject) taskOverrides = {};
      handoff = {
        kind: "website",
        projectId: record.projectId,
        configuration: parsed,
      };
      requirements = {
        ...(sameProject ? requirements : normalizeRequirements()),
        type: parsed.project.id === "timo" ? "commerce" : "website",
        pages: parsed.project.pages.length + 1,
      };
    }
  }
  if (handoff)
    $("requirements-handoff").textContent =
      T("Připojen skutečný projekt: ", "Actual project attached: ") +
      (handoff.kind === "app"
        ? handoff.model.name
        : handoff.configuration.project.brand);
} catch (e) {
  message(e.message);
}
apply(requirements);
cards(requirements.mode);
update();
window.requirementsApp = {
  proposal,
  internal,
  snapshot: () => ({ requirements, taskOverrides }),
  restore: (state) => {
    requirements = normalizeRequirements(state.requirements);
    taskOverrides = state.taskOverrides || {};
    apply(requirements);
    update();
  },
};

document.dispatchEvent(new Event("requirements:ready"));

attachValidation();
