const response = await fetch(
  new URL("./locales/dynamic.json", import.meta.url),
);
if (!response.ok) throw Error("Localization catalog unavailable");
const catalog = await response.json();
export const locale = document.documentElement.lang;
export function number(value, lang = locale) {
  return new Intl.NumberFormat(lang).format(value);
}
export function message(key, parameters = {}, lang = locale) {
  let value = catalog[key]?.[lang];
  if (value && typeof value === "object") {
    const count = Number(parameters.count);
    value = value[new Intl.PluralRules(lang).select(count)];
  }
  if (typeof value !== "string")
    throw Error("Missing message " + lang + "/" + key);
  return value.replace(/\{([A-Za-z]+)\}/g, (_, name) => {
    if (!Object.hasOwn(parameters, name))
      throw Error("Missing parameter " + key + "/" + name);
    return typeof parameters[name] === "number"
      ? number(parameters[name], lang)
      : String(parameters[name]);
  });
}
