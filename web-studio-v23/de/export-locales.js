// Relocate native CS/EN/AR output without rewriting any customer text.
const native = ["cs", "en", "ar"];
function relative(from, to) {
  const a = from.split("/");
  a.pop();
  const b = to.split("/");
  while (a.length && b.length && a[0] === b[0]) {
    a.shift();
    b.shift();
  }
  return "../".repeat(a.length) + b.join("/");
}
export function selectPrimaryLanguage(files, primary) {
  if (!native.includes(primary)) throw Error("Invalid output locale");
  const mapping = new Map(
    Object.keys(files)
      .filter((p) => p.endsWith(".html"))
      .map((path) => [path, /^(en|ar)\//.test(path) ? path : "cs/" + path]),
  );
  const output = {};
  for (const [path, body] of Object.entries(files)) {
    if (!mapping.has(path)) {
      output[path] = body;
      continue;
    }
    const next = mapping.get(path),
      doc = new DOMParser().parseFromString(body, "text/html");
    const link = (value) => {
      if (!value || /^(?:data:|https?:|#|mailto:|tel:|javascript:)/.test(value))
        return value;
      const url = new URL(value, "https://export.invalid/" + path),
        target = url.pathname.slice(1),
        resolved =
          mapping.get(target) || mapping.get(target + "index.html") || target;
      return relative(next, resolved) + url.search + url.hash;
    };
    for (const node of doc.querySelectorAll(
      "[href],[src],[srcset],[poster],[style],[data-b18-image]",
    )) {
      for (const name of ["href", "src", "poster", "data-b18-image"])
        if (node.hasAttribute(name))
          node.setAttribute(name, link(node.getAttribute(name)));
      if (node.hasAttribute("srcset"))
        node.setAttribute(
          "srcset",
          node
            .getAttribute("srcset")
            .split(",")
            .map((part) => {
              const [url, ...rest] = part.trim().split(/\s+/);
              return [link(url), ...rest].join(" ");
            })
            .join(", "),
        );
      if (node.hasAttribute("style"))
        node.setAttribute(
          "style",
          node
            .getAttribute("style")
            .replace(
              /url\((['"]?)([^)'"\s]+)\1\)/g,
              (_, quote, url) => "url(" + quote + link(url) + quote + ")",
            ),
        );
    }
    for (const style of doc.querySelectorAll("style"))
      style.textContent = style.textContent.replace(
        /url\((['"]?)([^)'"\s]+)\1\)/g,
        (_, quote, url) => "url(" + quote + link(url) + quote + ")",
      );
    output[next] = "<!doctype html>" + doc.documentElement.outerHTML;
  }
  const target = primary + "/index.html";
  output["index.html"] =
    '<!doctype html><html lang="' +
    primary +
    '" dir="' +
    (primary === "ar" ? "rtl" : "ltr") +
    '"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=' +
    target +
    '"><title>' +
    { cs: "Otevřít web", en: "Open website", ar: "افتح الموقع" }[primary] +
    '</title><a href="' +
    target +
    '">' +
    { cs: "Otevřít web", en: "Open website", ar: "افتح الموقع" }[primary] +
    "</a></html>";
  if (output["manifest.json"]) {
    const manifest = JSON.parse(output["manifest.json"]);
    manifest.pages = Object.keys(output).filter((p) => p.endsWith(".html"));
    manifest.primaryLocale = primary;
    output["manifest.json"] = JSON.stringify(manifest, null, 2);
  }
  output["output-language.json"] = JSON.stringify(
    {
      primaryLocale: primary,
      nativeLocales: native,
      entry: target,
      content:
        "Customer-authored content is preserved; no automatic professional translation is claimed.",
    },
    null,
    2,
  );
  return output;
}
