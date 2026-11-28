// Pure scope contract. Prices come from the retained source estimator, never provider guesses.
export const projectTypes = ["website", "commerce", "webapp", "mobile"];
export function normalizeRequirements(raw = {}) {
  const type = projectTypes.includes(raw.type) ? raw.type : "website",
    bounded = (v, min, max, f) =>
      Number.isFinite(Number(v))
        ? Math.max(min, Math.min(max, Math.trunc(Number(v))))
        : f;
  const r = {
    version: 1,
    type,
    tier: ["start", "grow", "pro"].includes(raw.tier) ? raw.tier : "start",
    mode: raw.mode === "monthly" ? "monthly" : "once",
    pages: bounded(raw.pages, 1, 60, 3),
    languages: bounded(raw.languages, 1, 12, 1),
    complexity: raw.complexity === "bespoke" ? "bespoke" : "standard",
    domain: ["owned", "new", "transfer"].includes(raw.domain)
      ? raw.domain
      : "owned",
    hosting: ["customer", "studio", "existing"].includes(raw.hosting)
      ? raw.hosting
      : "customer",
    database: ["auto", "yes", "no"].includes(raw.database)
      ? raw.database
      : "auto",
    content: ["supplied", "needed", "mixed"].includes(raw.content)
      ? raw.content
      : "supplied",
    ownership: raw.ownership === "studio" ? "studio" : "customer",
    packaging: raw.packaging === "native" ? "native" : "web",
    production: raw.production !== false,
    goal: typeof raw.goal === "string" ? raw.goal.slice(0, 2000) : "",
    infrastructure:
      typeof raw.infrastructure === "string"
        ? raw.infrastructure.slice(0, 1200)
        : "",
    security:
      typeof raw.security === "string" ? raw.security.slice(0, 1200) : "",
  };
  for (const k of [
    "cms",
    "accounts",
    "payments",
    "inventory",
    "booking",
    "emails",
    "apis",
    "analytics",
    "maintenance",
    "backups",
    "gallery",
  ])
    r[k] = raw[k] === true;
  if (type === "commerce" && r.production) {
    r.payments = true;
    r.inventory = true;
    r.emails = true;
  }
  return r;
}
export function requirementsPlan(raw, locale = "en") {
  const r = normalizeRequirements(raw),
    cs = locale === "cs",
    T = (a, b) => (cs ? a : b),
    tasks = [];
  const add = (
    id,
    title,
    requirement = "required",
    owner = "studio",
    cost = "one-time",
    depends = [],
  ) =>
    tasks.push({
      id,
      title,
      requirement,
      owner,
      costClassification: cost,
      costStatus: "needs-confirmation",
      completion: "todo",
      dependencies: depends,
    });
  add(
    "scope",
    T(
      "Potvrdit rozsah a kritéria přijetí",
      "Confirm scope and acceptance criteria",
    ),
  );
  add(
    "owner",
    T(
      "Potvrdit obchodního vlastníka a odpovědnosti",
      "Confirm business owner and responsibilities",
    ),
    "required",
    "customer",
  );
  add(
    "assets",
    T(
      "Ověřit dodané texty, média a práva",
      "Verify supplied content, media and rights",
    ),
    r.content === "supplied" ? "required" : "needs-confirmation",
    "customer",
    r.content === "supplied" ? "included-scope" : "quote",
  );
  add(
    "domain",
    r.domain === "owned"
      ? T(
          "Potvrdit vlastníka domény a přístupy DNS",
          "Confirm domain owner and DNS access",
        )
      : r.domain === "new"
        ? T(
            "Vybrat a registrovat doménu, potvrdit obnovu",
            "Select/register domain and confirm renewals",
          )
        : T(
            "Potvrdit převod domény a obnovu",
            "Confirm domain transfer and renewals",
          ),
    "required",
    "customer",
    "third-party",
  );
  add(
    "hosting",
    T(
      "Zvolit hosting, vlastníka účtu a způsob nasazení",
      "Choose hosting, account owner and deployment",
    ),
    "required",
    r.hosting === "studio" ? "studio" : "customer",
    "third-party",
    ["scope"],
  );
  add(
    "tls",
    T("Nastavit HTTPS/TLS a DNS", "Configure HTTPS/TLS and DNS"),
    "required",
    "studio",
    "one-time",
    ["domain", "hosting"],
  );
  const database =
    r.database === "yes" ||
    (r.database !== "no" &&
      (r.accounts ||
        r.inventory ||
        ["webapp"].includes(r.type) ||
        (r.type === "mobile" && r.production && r.packaging === "native")));
  add(
    "database",
    database
      ? T(
          "Potvrdit datovou službu, přístupy a migrace",
          "Confirm data service, access and migrations",
        )
      : T(
          "Databáze není součástí tohoto rozsahu",
          "Database is not included in this scope",
        ),
    database ? "needs-confirmation" : "not-applicable",
    database ? "studio" : "customer",
    database ? "quote" : "not-applicable",
    ["scope"],
  );
  if (r.database === "no" && (r.accounts || r.inventory))
    add(
      "data-conflict",
      T(
        "Vyřešit rozpor: účty/objednávky vyžadují datovou službu",
        "Resolve conflict: accounts/orders need a data service",
      ),
      "needs-confirmation",
      "studio",
      "quote",
    );
  if (database || r.backups) {
    add(
      "backup",
      T(
        "Definovat zálohy, retenci a obnovu",
        "Define backups, retention and restore testing",
      ),
      "required",
      "studio",
      "monthly",
      ["hosting"],
    );
    add(
      "restore",
      T("Ověřit obnovu ze zálohy", "Verify backup restoration"),
      "required",
      "studio",
      "one-time",
      ["backup"],
    );
  }
  for (const [k, id, title] of [
    [
      "cms",
      "cms",
      T(
        "Nastavit CMS, role a předání editace",
        "Configure CMS, roles and editing handoff",
      ),
    ],
    [
      "accounts",
      "auth",
      T(
        "Navrhnout přihlášení, oprávnění a obnovu účtu",
        "Design authentication, permissions and account recovery",
      ),
    ],
    [
      "payments",
      "payments",
      T(
        "Vybrat poskytovatele plateb a ověřit testovací transakce",
        "Select payment provider and verify test transactions",
      ),
    ],
    [
      "inventory",
      "orders",
      T(
        "Definovat produkty, zásoby, objednávky a vratky",
        "Define products, inventory, orders and returns",
      ),
    ],
    [
      "booking",
      "booking",
      T(
        "Potvrdit rezervační systém a dostupnost",
        "Confirm booking system and availability",
      ),
    ],
    [
      "emails",
      "email",
      T(
        "Nastavit transakční e-mail, doménové záznamy a test doručení",
        "Configure transactional email, DNS records and delivery tests",
      ),
    ],
    [
      "apis",
      "api",
      T(
        "Potvrdit API, přístupy, limity a zpracování chyb",
        "Confirm APIs, credentials, limits and error handling",
      ),
    ],
  ])
    if (r[k])
      add(
        id,
        title,
        "required",
        k === "payments" ? "customer" : "studio",
        "quote",
        ["scope"],
      );
  if (r.accounts || database || r.apis || r.payments || r.security)
    add(
      "secrets",
      T(
        "Definovat tajné klíče, přístupy a bezpečnostní kontrolu",
        "Define secrets, access control and security review",
      ),
      "required",
      "studio",
      "one-time",
      ["scope"],
    );
  add(
    "privacy",
    T(
      "Potvrdit právní texty, osobní údaje a odpovědné role",
      "Confirm policies, personal-data handling and responsible roles",
    ),
    "needs-confirmation",
    "customer",
    "quote",
  );
  if (r.analytics)
    add(
      "analytics",
      T(
        "Zvolit analytiku a vyřešit souhlasy podle zvoleného řešení",
        "Choose analytics and confirm consent requirements for that solution",
      ),
      "needs-confirmation",
      "customer",
      "third-party",
    );
  if (r.type === "mobile" && r.packaging === "native") {
    add(
      "native",
      T(
        "Potvrdit Android/iOS rozsah, podepisování a účty obchodů",
        "Confirm Android/iOS scope, signing and store accounts",
      ),
      "required",
      "customer",
      "third-party",
    );
    add(
      "store-review",
      T(
        "Sestavit, ověřit na zařízení a připravit podklady obchodů",
        "Build, verify on devices and prepare store submissions",
      ),
      "required",
      "studio",
      "quote",
      ["native"],
    );
  }
  for (const [id, title] of [
    [
      "responsive",
      T(
        "Ověřit mobilní a desktopové rozložení",
        "Verify mobile and desktop layouts",
      ),
    ],
    [
      "functional",
      T(
        "Ověřit skutečné scénáře a integrace",
        "Verify actual workflows and integrations",
      ),
    ],
    [
      "accessibility",
      T(
        "Ověřit klávesnici, čitelnost a přístupnost",
        "Verify keyboard, readability and accessibility",
      ),
    ],
    [
      "browsers",
      T(
        "Potvrdit a otestovat podporované prohlížeče/zařízení",
        "Confirm and test supported browsers/devices",
      ),
    ],
  ])
    add(id, title);
  add(
    "launch",
    T(
      "Nasadit produkci a ověřit doménu",
      "Deploy production and verify domain",
    ),
    "required",
    "studio",
    "one-time",
    ["tls", "functional"],
  );
  add(
    "handover",
    T(
      "Předat zdroje, licence, účty a provozní dokumentaci",
      "Hand over sources, licenses, accounts and operating instructions",
    ),
    "required",
    r.ownership,
    "one-time",
    ["launch"],
  );
  add(
    "acceptance",
    T("Zaznamenat přijetí zákazníkem", "Record customer acceptance"),
    "required",
    "customer",
    "included-scope",
    ["handover"],
  );
  add(
    "maintenance",
    T(
      "Dohodnout aktualizace, podporu a další náklady",
      "Agree updates, support and ongoing costs",
    ),
    r.maintenance ? "required" : "optional",
    "studio",
    "monthly",
  );
  return {
    requirements: r,
    databaseNeeded: database,
    tasks,
    assumptions: [
      T(
        "Nezávazný plán. Nabídka musí potvrdit rozsah, daňový režim a ceny poskytovatelů.",
        "Nonbinding plan. A proposal must confirm scope, VAT treatment and provider costs.",
      ),
      T(
        "Lokální prototyp není připojenou produkční službou.",
        "A local prototype is not a connected production service.",
      ),
    ],
    exclusions: [
      T(
        "Bez potvrzené nabídky nejsou zahrnuty licence, registrace, poskytovatelé, obsah ani produkční backend.",
        "Licenses, registration, providers, content and production backend are excluded until confirmed by proposal.",
      ),
    ],
    costs: {
      development:
        r.type === "website" && r.complexity === "standard" && r.languages <= 3
          ? "source-estimate"
          : "quoted-individually",
      ongoing: "separate-from-development",
      providers: "determined-by-provider",
      vat: "needs-confirmation",
    },
  };
}
