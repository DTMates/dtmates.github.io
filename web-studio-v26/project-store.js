export async function store(
  mode,
  action,
  database = "dtmates-v26-app-projects",
) {
  const db = await new Promise((resolve, reject) => {
    const r = indexedDB.open(database, 1);
    r.onupgradeneeded = () =>
      r.result.createObjectStore("projects", { keyPath: "id" });
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("projects", mode),
        r = action(tx.objectStore("projects"));
      let result;
      r.onsuccess = () => (result = r.result);
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error || r.error);
      tx.onabort = () => reject(tx.error || Error("Storage aborted"));
    });
  } finally {
    db.close();
  }
}
export function download(name, data, type = "application/json") {
  const u = URL.createObjectURL(new Blob([data], { type })),
    a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 5000);
}
export async function uploadImage(file) {
  if (!file || !/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 6e6)
    throw Error("PNG, JPG or WebP, maximum6MB");
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 45e6)
      throw Error("Image dimensions too large");
    const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height)),
      canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas
      .getContext("2d")
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", 0.85);
  } finally {
    bitmap.close();
  }
}
export async function binaryImages(model, files, base) {
  const dedup = new Map();
  async function walk(x) {
    for (const [k, v] of Object.entries(x)) {
      if (v && typeof v === "object") await walk(v);
      else if ((k === "image" || k === "icon") && v) {
        let path = dedup.get(v);
        if (!path) {
          const r = await fetch(new URL(v, base));
          if (!r.ok) throw Error("Image unavailable");
          const bytes = new Uint8Array(await r.arrayBuffer());
          if (bytes.length > 8e6) throw Error("Image too large");
          const type = r.headers.get("content-type") || "";
          if (!/image\/(png|jpeg|webp)/.test(type))
            throw Error("Unsupported image");
          const hash = [
            ...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
          ]
            .map((n) => n.toString(16).padStart(2, "0"))
            .join("");
          path =
            "images/" +
            hash +
            "." +
            (type.includes("png")
              ? "png"
              : type.includes("jpeg")
                ? "jpg"
                : "webp");
          files[path] = bytes;
          dedup.set(v, path);
        }
        x[k] = path;
      }
    }
  }
  await walk(model);
  return model;
}
