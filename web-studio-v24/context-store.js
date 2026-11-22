// One transient transfer per browser tab. Editor/business models remain unchanged.
const database = "dtmates-v24-locale-transfer";
const tabKey = "dtmates-v24-tab-id";
function tabId() {
  let value = sessionStorage.getItem(tabKey);
  if (!value) {
    value = crypto.randomUUID();
    sessionStorage.setItem(tabKey, value);
  }
  return value;
}
function open() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(database, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("transfers");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function transaction(mode, action) {
  const db = await open();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("transfers", mode),
        request = action(tx.objectStore("transfers"));
      let value;
      request.onsuccess = () => (value = request.result);
      tx.oncomplete = () => resolve(value);
      tx.onerror = () => reject(tx.error || request.error);
      tx.onabort = () => reject(tx.error || new Error("Transfer aborted"));
    });
  } finally {
    db.close();
  }
}
export const saveContext = (context) =>
  transaction("readwrite", (store) => store.put(context, tabId()));
export const readContext = () =>
  transaction("readonly", (store) => store.get(tabId()));
export const clearContext = () =>
  transaction("readwrite", (store) => store.delete(tabId()));
