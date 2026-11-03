/* Versioned tracker images. Files stay in Storage (or IndexedDB offline), never blob URLs in saved data. */
(function () {
  "use strict";
  const MAX_BYTES = 50 * 1024 * 1024;
  const TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/avif", "video/mp4"];
  const urls = new Map();
  let database;
  const feedback = (text) => String(text || "").slice(0, 300);
  const label = (version) => "v" + String(version).padStart(3, "0");
  function safeUrl(value) {
    try {
      const u = new URL(value);
      return /^https?:$/.test(u.protocol) || /^data:image\/(png|jpeg|gif|webp|avif);base64,/i.test(value) ? u.href : "";
    } catch (_) { return ""; }
  }
  function items(task, all) {
    const list = (all || []).filter((a) => a.taskId === task.id).map((a) => ({ ...a }));
    if (task.thumbUrl && !list.some((a) => a.url === task.thumbUrl || a.id === "attachment-legacy-" + task.id)) {
      list.unshift({ id: "attachment-legacy-" + task.id, taskId: task.id, url: task.thumbUrl,
        name: "Imagen anterior", version: 1, status: "review", feedback: "", legacy: true });
    }
    // Two editors can mark finals at once. Every viewer resolves the same latest final.
    const finals = list.filter((a) => a.status === "final").sort((a, b) =>
      String(b.finalizedAt || b.updatedAt || "").localeCompare(String(a.finalizedAt || a.updatedAt || "")) || b.id.localeCompare(a.id));
    list.forEach((a) => { if (a.status === "final" && finals[0] !== a) a.status = "old"; });
    return list.sort((a, b) => (Number(a.version) || 1) - (Number(b.version) || 1) || a.id.localeCompare(b.id));
  }
  async function validate(file) {
    if (!TYPES.includes(file.type)) throw new Error("Elegí una imagen PNG, JPG, WebP, AVIF, un GIF o un video MP4.");
    if (!file.size || file.size > MAX_BYTES) throw new Error("El archivo debe pesar entre 1 byte y 50 MB.");
    const b = new Uint8Array(await file.slice(0, 64).arrayBuffer());
    const ascii = (start, end) => String.fromCharCode(...b.slice(start, end));
    const valid = file.type === "image/png" ? b[0] === 137 && ascii(1, 4) === "PNG" :
      file.type === "image/jpeg" ? b[0] === 255 && b[1] === 216 && b[2] === 255 :
      file.type === "image/gif" ? /^GIF8[79]a$/.test(ascii(0, 6)) :
      file.type === "image/webp" ? ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP" :
      file.type === "video/mp4" ? ascii(4, 8) === "ftyp" && /^(isom|iso[2-9]|mp4[12]|avc1|M4V |MSNV|dash)$/.test(ascii(8, 12)) :
      ascii(4, 8) === "ftyp" && /avif|avis/.test(ascii(8, 64));
    if (!valid) throw new Error("El contenido del archivo no coincide con su formato.");
  }
  function db() {
    if (!database) database = new Promise((resolve, reject) => {
      const request = indexedDB.open("golden_tracker_files", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("files");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => { database = null; reject(request.error); };
    });
    return database;
  }
  async function localFile(key, file) {
    const database = await db();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("files", file ? "readwrite" : "readonly");
      const request = file ? tx.objectStore("files").put(file, key) : tx.objectStore("files").get(key);
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = tx.onerror = () => reject(tx.error || new Error("No se pudo guardar el archivo en este navegador."));
    });
  }
  async function blob(item) {
    if (item.localKey) {
      const file = await localFile(item.localKey);
      if (!file) throw new Error("Este archivo está guardado en otro navegador o ya no está disponible.");
      return file;
    }
    const url = safeUrl(item.url);
    if (!url) throw new Error("El archivo no tiene una dirección disponible.");
    const response = await fetch(url);
    if (!response.ok) throw new Error("No se pudo descargar el archivo. Intentá nuevamente.");
    return response.blob();
  }
  async function source(item) {
    if (!item.localKey) return safeUrl(item.url);
    if (!urls.has(item.localKey)) urls.set(item.localKey, URL.createObjectURL(await blob(item)));
    return urls.get(item.localKey);
  }
  async function download(item) {
    const file = await blob(item), url = URL.createObjectURL(file), a = document.createElement("a");
    const extension = { "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp", "image/avif": "avif", "video/mp4": "mp4" }[TYPES.includes(file.type) ? file.type : item.mime] || "png";
    const name = String(item.name || "imagen").replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").replace(/\.[^.]+$/, "");
    a.href = url; a.download = label(item.version) + "_" + name + "." + extension;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  window.GoldenTrackerMedia = { MAX_BYTES, TYPES, feedback, label, safeUrl, items, validate, localFile, source, download };
})();
