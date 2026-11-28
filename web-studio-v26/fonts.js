export const fontPairs = {
  modern: { name: "Technology",
    csName:"Technologie", display: "Space Grotesk", body: "Geist" },
  editorial: {
    name: "Editorial / fashion",
    csName:"Redakční / módní",
    display: "Gloock",
    body: "DM Sans",
  },
  corporate: { name: "Corporate",
    csName:"Firemní", display: "Chivo", body: "Source Sans 3" },
  hospitality: {
    name: "Hospitality",
    csName:"Hotely a pohostinství",
    display: "Cormorant Garamond",
    body: "Instrument Sans",
  },
  minimal: {
    name: "Minimal business",
    csName:"Minimalistické",
    display: "Instrument Sans",
    body: "Inter",
  },
  playful: { name: "Playful",
    csName:"Hravé", display: "Bricolage Grotesque", body: "Nunito" },
};
export const fontFace = (key) => "assets/fonts/pairs/" + key + ".css";
export function fontStyle(key) {
  const f = fontPairs[key];
  return f
    ? `body,input,textarea,select,button{font-family:'${f.body}','Noto Sans Arabic',sans-serif!important}h1,h2,h3,h4{font-family:'${f.display}','Noto Sans Arabic',serif!important}`
    : "";
}
export async function loadFont(key, base, files) {
  if (!fontPairs[key]) throw Error("Unknown font pair");
  const path = fontFace(key),
    u = new URL(path, base),
    response = await fetch(u);
  if (!response.ok) throw Error("Font unavailable");
  let css = await response.text();
  if (files) {
    files[path] = css;
    for (const match of css.matchAll(/url\(([^)]+)\)/g)) {
      const url = new URL(match[1].replace(/['"]/g, ""), u),
        p = url.pathname.slice(new URL(base).pathname.length),
        license = p.slice(0, p.lastIndexOf("/")) + "/OFL.txt";
      for (const target of [p, license]) {
        if (files[target]) continue;
        const r = await fetch(new URL(target, base));
        if (!r.ok) throw Error("Missing font/license: " + target);
        files[target] = new Uint8Array(await r.arrayBuffer());
      }
    }
  }
  css = css.replace(
    /url\(([^)]+)\)/g,
    (_, p) =>
      "url(" +
      (files
        ? new URL(p.replace(/['"]/g, ""), u).pathname.slice(
            new URL(base).pathname.length,
          )
        : new URL(p.replace(/['"]/g, ""), u).href) +
      ")",
  );
  return css + fontStyle(key);
}
