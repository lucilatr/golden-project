/* ============================================================
   GOLDEN — single-screen visual production tool
   Local (localStorage) or shared realtime (Supabase)
   ============================================================ */
(function () {
  "use strict";

  const STORAGE_KEY = "golden_rhythm_doc_v2";

  /* ---------------- Catalogs ---------------- */
  const STAGES = [
    { id: "desire_insecurity", label: "Deseo e inseguridad", short: "Deseo", color: "var(--st-desire)" },
    { id: "transformation",    label: "Transformación y liberación", short: "Transformación", color: "var(--st-trans)" },
    { id: "golden",            label: "Consagración dorada", short: "Consagración", color: "var(--st-golden)" },
  ];
  const TOD = [
    { id: "day", label: "Day" }, { id: "sunset", label: "Sunset" }, { id: "night", label: "Night" },
    { id: "demon_world", label: "Demon World" }, { id: "other", label: "Other" },
  ];
  const GP = [
    { id: "frontal", label: "Frontal", color: "var(--gp-frontal)" },
    { id: "lateral", label: "Lateral", color: "var(--gp-lateral)" },
    { id: "combat", label: "Combat", color: "var(--gp-combat)" },
  ];
  const WS = [
    { id: "normal", label: "Normal" }, { id: "demonic", label: "Demonic" },
    { id: "transition", label: "Transition" }, { id: "mixed", label: "Mixed" },
  ];
  const WS_COLOR = { normal: "var(--ws-normal)", demonic: "var(--ws-demonic)", transition: "var(--ws-transition)", mixed: "var(--ws-mixed)" };
  const STATUS = [
    { id: "idea", label: "Idea" }, { id: "to_define", label: "To define" },
    { id: "in_development", label: "In development" }, { id: "review", label: "Review" }, { id: "approved", label: "Approved" },
  ];
  const DOC_STATUS = ["Development", "Review", "Approved"];
  const DOC_STATUS_COLOR = { Development: "#5b8bb5", Review: "#b5479b", Approved: "#5a8f7b" };

  // Tipo de sección — se marca A MANO (vacío por defecto)
  const SECTIONS = [
    { id: "intro", label: "Intro" },
    { id: "estrofa", label: "Estrofa" },
    { id: "pre", label: "Pre-estribillo" },
    { id: "estribillo", label: "Estribillo" },
    { id: "puente", label: "Puente" },
    { id: "outro", label: "Outro" },
  ];
  const SEC_COLOR = { intro: "#737a8f", estrofa: "#4f6ba8", pre: "#5b8bb5", estribillo: "#d9a441", puente: "#b5479b", outro: "#5a8f7b" };

  const labelOf = (list, id) => (list.find((x) => x.id === id) || {}).label || "";
  const stageColor = (id) => (STAGES.find((x) => x.id === id) || {}).color || "var(--line-2)";
  const gpColor = (id) => (GP.find((x) => x.id === id) || {}).color || "var(--line-2)";

  /* ---------------- Time helpers ---------------- */
  function parseTime(str) {
    if (str == null) return 0;
    str = String(str).trim();
    if (str === "") return 0;
    if (str.indexOf(":") === -1) return Math.max(0, parseInt(str, 10) || 0);
    const p = str.split(":").map((x) => parseInt(x, 10) || 0);
    if (p.length === 2) return p[0] * 60 + p[1];
    if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
    return 0;
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    return String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0");
  }
  const dur = (s) => Math.max(0, parseTime(s.endTime) - parseTime(s.startTime));

  /* ---------------- Seed (first 30s) ---------------- */
  function seed() {
    const base = {
      lyric: "[LYRIC TO ADD]", musicalCue: "[VERSE 1]", narrativeStage: "desire_insecurity",
      location: "Seoul Streets", timeOfDay: "night", narrativeAction: "", characterAction: "",
      camera: "", gameplayMode: "frontal", playerAction: "", environmentInteraction: "",
      worldState: "normal", visualFX: "", transition: "", productionNotes: "", storyBeat: "", status: "idea",
      sectionType: "", storyboard: "", interaction: "",
    };
    const mk = (id, a, b, over) => {
      const s = Object.assign({ id, startTime: a, endTime: b }, base, over);
      if (!Array.isArray(s.beats)) s.beats = [];
      return s;
    };
    return {
      meta: { title: "GOLDEN", songDuration: "03:30", status: "Development", version: "v01", lastUpdated: new Date().toISOString() },
      segments: [
        mk("scene-001", "00:00", "00:05", {
          musicalCue: "[INTRO]", lyric: "[INTRO MUSIC · sin letra]", status: "in_development",
          narrativeAction: "Presentamos a Rumi caminando por las calles de Seúl durante la noche. El inicio tiene que establecer inmediatamente una sensación de introspección e inseguridad. Queremos captar la atención del jugador durante los primeros cinco segundos.",
          characterAction: "Rumi comienza caminando hacia cámara. Su movimiento y coreografía transmiten el estado emocional sin depender de expresiones faciales complejas.",
          camera: "Frontal tracking shot. La cámara retrocede mientras Rumi avanza.",
          playerAction: "Primeros inputs simples del rhythm game. La interacción comienza rápidamente.",
          visualFX: "Pequeñas señales visuales pueden anticipar que existe algo extraño detrás de la realidad normal.",
          productionNotes: "La introducción tiene que sentirse ligeramente cinemática pero llevar rápidamente al gameplay.",
          storyBeat: "Rumi camina por Seúl de noche. Se establece la introspección e inseguridad.",
          beats: [{
            cue: "Nota de salto en el beat fuerte",
            onHit: "Rumi salta perfecto y sigue bailando sin perder el flow.",
            onMiss: "Rumi salta pero se tropieza levemente y se recupera, retomando la coreografía.",
          }],
        }),
        mk("scene-002", "00:05", "00:10", {
          musicalCue: "[INTRO]", lyric: "[INTRO MUSIC · sin letra]",
          narrativeAction: "Rumi continúa avanzando por Seúl. La coreografía empieza a integrarse con el ritmo.",
          characterAction: "Camina y baila mientras avanza hacia cámara.", camera: "Frontal tracking shot.",
          playerAction: "Taps sincronizados con las notas.",
          environmentInteraction: "Algunos taps afectan elementos del escenario en lugar de controlar directamente los movimientos de Rumi. Por ejemplo: carteles urbanos pueden reaccionar visualmente al input.",
        }),
        mk("scene-003", "00:10", "00:15", {
          musicalCue: "[INTRO]", lyric: "[INTRO MUSIC · sin letra]",
          narrativeAction: "La caminata continúa pero aparece por primera vez una interrupción clara de la realidad.",
          camera: "Mantener la misma composición para que el cambio del mundo sea claramente perceptible.",
          playerAction: "El rhythm gameplay continúa sin interrupción.", worldState: "transition",
          visualFX: "Flash demoníaco breve. El mismo escenario se transforma. Aparecen venas violetas o contaminación visual demoníaca. Luego vuelve inmediatamente al estado normal. (NORMAL → DEMONIC → NORMAL)",
          transition: "Beat-synced environment glitch.", storyBeat: "Primer flash de la realidad demoníaca.",
        }),
        mk("scene-004", "00:15", "00:20", {
          narrativeAction: "La sensación de inestabilidad aumenta. Rumi continúa avanzando mientras el entorno empieza a reflejar con mayor claridad su conflicto interno.",
          playerAction: "La secuencia de taps puede volverse ligeramente más activa.", worldState: "mixed",
          visualFX: "Segundo cambio breve entre realidad y mundo demoníaco sincronizado con la música.",
        }),
        mk("scene-005", "00:20", "00:25", {
          narrativeAction: "Los dos estados del mundo empiezan a intercalarse con mayor frecuencia.",
          playerAction: "Los taps siguen interactuando con elementos del escenario.", worldState: "mixed",
          visualFX: "Las ráfagas demoníacas son progresivamente más evidentes.",
        }),
        mk("scene-006", "00:25", "00:30", {
          narrativeAction: "Cierre del primer pequeño arco de introducción. Rumi continúa caminando pero ya quedó establecido que existe otra realidad relacionada con su identidad demoníaca.",
          camera: "Frontal tracking. Preparar visualmente el siguiente momento de la canción.",
          playerAction: "Final de la primera frase jugable.", worldState: "transition",
          visualFX: "Último flash demoníaco sincronizado con el beat.",
          transition: "Normal / Demonic transition hacia el próximo momento de la canción.",
          storyBeat: "Cierre del arco de introducción: queda establecida la doble realidad.",
        }),
        // ---- Estructura del resto de la canción (tiempos aproximados, ajustar escuchando) ----
        mk("scene-007", "00:30", "00:45", { musicalCue: "[VERSE 1 · cont.]", narrativeStage: "desire_insecurity", location: "", gameplayMode: "" }),
        mk("scene-008", "00:45", "01:00", { musicalCue: "[PRE-CHORUS 1]", narrativeStage: "desire_insecurity", location: "", gameplayMode: "" }),
        mk("scene-009", "01:00", "01:25", { musicalCue: "[CHORUS 1]", narrativeStage: "transformation", location: "", gameplayMode: "" }),
        mk("scene-010", "01:25", "01:45", { musicalCue: "[VERSE 2]", narrativeStage: "transformation", location: "", gameplayMode: "" }),
        mk("scene-011", "01:45", "02:00", { musicalCue: "[PRE-CHORUS 2]", narrativeStage: "transformation", location: "", gameplayMode: "" }),
        mk("scene-012", "02:00", "02:25", { musicalCue: "[CHORUS 2]", narrativeStage: "golden", location: "", gameplayMode: "" }),
        mk("scene-013", "02:25", "02:55", { musicalCue: "[BRIDGE]", narrativeStage: "golden", location: "", gameplayMode: "" }),
        mk("scene-014", "02:55", "03:14", { musicalCue: "[FINAL CHORUS / OUTRO]", narrativeStage: "golden", location: "", gameplayMode: "" }),
      ],
    };
  }

  /* ---------------- State ---------------- */
  let data = { meta: seed().meta, segments: [] };
  const ui = { openId: null, openGridId: null, gridAccOpen: false, colorBy: "gameplayMode", showDetails: false, showSync: false, drawerMax: false,
    showBlocks: false, wfZoom: 1,
    filters: { gameplayMode: "", narrativeStage: "", status: "", location: "" } };

  /* ============================================================
     SYNC LAYER (Supabase or localStorage)
     ============================================================ */
  const Sync = {
    enabled: false, sb: null, docId: "golden", _timers: {},
    init() {
      const c = window.GOLDEN_CONFIG || {};
      this.docId = c.docId || "golden";
      if (c.supabaseUrl && c.supabaseAnonKey && typeof window.supabase !== "undefined") {
        try { this.sb = window.supabase.createClient(c.supabaseUrl, c.supabaseAnonKey); this.enabled = true; }
        catch (e) { this.enabled = false; }
      }
      return this.enabled;
    },
    async loadAll() {
      const { data: segs } = await this.sb.from("segments").select("*").eq("doc_id", this.docId).order("pos", { ascending: true });
      const { data: metaRows } = await this.sb.from("doc_meta").select("*").eq("id", this.docId).limit(1);
      return {
        segments: (segs || []).map((r) => r.data),
        meta: metaRows && metaRows[0] ? metaRows[0].data : null,
      };
    },
    async seedAll(seedData) {
      const rows = seedData.segments.map((s) => ({ id: s.id, doc_id: this.docId, pos: parseTime(s.startTime), data: s }));
      await this.sb.from("segments").upsert(rows);
      await this.sb.from("doc_meta").upsert({ id: this.docId, data: seedData.meta });
    },
    pushSegment(seg, immediate) {
      const row = { id: seg.id, doc_id: this.docId, pos: parseTime(seg.startTime), data: seg };
      const go = () => this.sb.from("segments").upsert(row).then(() => {}, () => toast("Error al guardar"));
      if (immediate) { go(); return; }
      clearTimeout(this._timers[seg.id]);
      this._timers[seg.id] = setTimeout(go, 400);
    },
    deleteSegment(id) { this.sb.from("segments").delete().eq("id", id).then(() => {}, () => {}); },
    pushMeta() {
      clearTimeout(this._timers.__meta);
      this._timers.__meta = setTimeout(() => this.sb.from("doc_meta").upsert({ id: this.docId, data: data.meta }).then(() => {}, () => {}), 300);
    },
    subscribe() {
      this.sb.channel("rt-segments")
        .on("postgres_changes", { event: "*", schema: "public", table: "segments", filter: "doc_id=eq." + this.docId }, (p) => this._onSeg(p))
        .subscribe();
      this.sb.channel("rt-meta")
        .on("postgres_changes", { event: "*", schema: "public", table: "doc_meta", filter: "id=eq." + this.docId }, (p) => this._onMeta(p))
        .subscribe();
    },
    _onSeg(payload) {
      if (payload.eventType === "DELETE") {
        const id = payload.old && payload.old.id;
        data.segments = data.segments.filter((s) => s.id !== id);
        if (ui.openId === id) closeDrawer();
      } else {
        const seg = normalizeSeg(payload.new && payload.new.data);
        if (!seg) return;
        const i = data.segments.findIndex((s) => s.id === seg.id);
        if (i === -1) data.segments.push(seg); else data.segments[i] = seg;
        // no pisar la fila que el usuario está editando en este momento
        if (ui.openId === seg.id && drawerFocused()) { refreshTimeline(); return; }
      }
      renderMain();
    },
    _onMeta(payload) {
      const m = payload.new && payload.new.data;
      if (m && !headerFocused()) { data.meta = m; renderHeader(); }
    },
  };
  function drawerFocused() { const a = document.activeElement; const w = ui.openId ? document.querySelector(`.rowwrap[data-seg="${ui.openId}"]`) : null; return !!(a && w && w.contains(a)); }
  function headerFocused() { const a = document.activeElement; const h = el("header"); return a && h && h.contains(a); }

  /* ---------------- Persistence facade ---------------- */
  function saveLocal() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }
  function touch() { data.meta.lastUpdated = new Date().toISOString(); }
  function persistSegment(seg, immediate) {
    touch();
    if (Sync.enabled) { Sync.pushSegment(seg, immediate); Sync.pushMeta(); } else saveLocal();
    refreshUpdated();
  }
  function persistMeta() { touch(); if (Sync.enabled) Sync.pushMeta(); else saveLocal(); refreshUpdated(); }
  function persistDelete(id) { touch(); if (Sync.enabled) { Sync.deleteSegment(id); Sync.pushMeta(); } else saveLocal(); refreshUpdated(); }
  function persistBulk() { touch(); if (Sync.enabled) { data.segments.forEach((s) => Sync.pushSegment(s, true)); Sync.pushMeta(); } else saveLocal(); refreshUpdated(); }

  /* ---------------- Undo (historial local de snapshots) ---------------- */
  const UNDO = [];
  function snapshot(label) {
    UNDO.push({ label: label || "cambio", segs: JSON.parse(JSON.stringify(data.segments)) });
    if (UNDO.length > 30) UNDO.shift();
    updateUndoBtn();
  }
  function undo() {
    if (!UNDO.length) { toast("Nada para deshacer"); return; }
    const prev = UNDO.pop();
    // Los timecodes de letra marcados NO se pierden al deshacer: guardo un mapa
    // frase→tiempo del estado actual y lo re-aplico a las líneas que coincidan.
    const timeMap = {};
    data.segments.forEach((seg) => parseLyric(seg.lyric).forEach((l) => {
      const k = l.text.trim(); if (l.t != null && k) timeMap[k] = l.t;
    }));
    const prevIds = new Set(prev.segs.map((s) => s.id));
    // borrar los que ahora existen pero no estaban en el snapshot
    data.segments.forEach((s) => { if (!prevIds.has(s.id)) persistDelete(s.id); });
    // restaurar los del snapshot
    data.segments = prev.segs.map(normalizeSeg);
    // re-aplicar timecodes marcados a las líneas que coincidan por texto
    data.segments.forEach((seg) => {
      if (!isRealLyric(seg.lyric)) return;
      const parsed = parseLyric(seg.lyric).map((l) => {
        const k = l.text.trim();
        if (l.t == null && k && timeMap[k] != null) return { t: timeMap[k], text: l.text };
        return l;
      });
      seg.lyric = fmtLyric(parsed);
    });
    data.segments.forEach((s) => (Sync.enabled ? Sync.pushSegment(s, true) : null));
    if (!Sync.enabled) saveLocal();
    touch(); refreshUpdated();
    if (ui.openId && !prevIds.has(ui.openId)) ui.openId = null;
    renderMain(); updateUndoBtn();
    toast("Deshecho: " + prev.label);
  }
  function updateUndoBtn() {
    const b = el("undo-btn"); if (!b) return;
    b.disabled = !UNDO.length;
    b.title = UNDO.length ? "Deshacer: " + UNDO[UNDO.length - 1].label : "Nada para deshacer";
  }

  /* ---------------- Normalize (migrations) ---------------- */
  function normalizeSeg(s) {
    if (!s) return s;
    if (s.gameplayMode === "cinematic") s.gameplayMode = "frontal";
    if (!Array.isArray(s.beats)) s.beats = [];
    if (s.sectionType == null) s.sectionType = "";
    if (s.storyboard == null) s.storyboard = "";
    if (s.clipStart == null) s.clipStart = 0;
    if (s.clipEnd == null) s.clipEnd = 0;
    if (s.interaction == null) s.interaction = "";
    return s;
  }
  function normalizeAll() { data.segments.forEach(normalizeSeg); }

  // Migración única: los bloques de estructura se habían creado con modo "frontal"
  // por defecto. Los que no tienen ninguna acción cargada quedan sin modo para que
  // se pueda elegir el gameplay a mano.
  function migrateGpOnce() {
    if (data.meta && data.meta.gpMigrated) return;
    data.segments.forEach((s) => {
      const vacio = !(s.narrativeAction || "").trim() && !(s.characterAction || "").trim()
        && !(s.playerAction || "").trim() && !(s.camera || "").trim() && !((s.beats || []).length);
      if (s.gameplayMode === "frontal" && vacio) s.gameplayMode = "";
    });
    data.meta.gpMigrated = true;
    persistBulk();
  }

  /* ---------------- Derived ---------------- */
  const sorted = () => data.segments.slice().sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
  function nextId() {
    let m = 0;
    data.segments.forEach((s) => { const r = /scene-(\d+)/.exec(s.id); if (r) m = Math.max(m, parseInt(r[1], 10)); });
    return "scene-" + String(m + 1).padStart(3, "0");
  }
  function passes(s) {
    const f = ui.filters;
    if (f.gameplayMode && s.gameplayMode !== f.gameplayMode) return false;
    if (f.narrativeStage && s.narrativeStage !== f.narrativeStage) return false;
    if (f.status && s.status !== f.status) return false;
    if (f.location && s.location !== f.location) return false;
    return true;
  }
  function allLocations() { const set = new Set(); data.segments.forEach((s) => s.location && set.add(s.location)); return Array.from(set).sort(); }

  /* ---------------- DOM utils ---------------- */
  const el = (id) => document.getElementById(id);
  function h(tag, attrs, kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k.startsWith("data-")) n.setAttribute(k, attrs[k]);
      else if (k === "style") n.setAttribute("style", attrs[k]);
      else n[k] = attrs[k];
    }
    if (kids != null) (Array.isArray(kids) ? kids : [kids]).forEach((c) => { if (c == null) return; n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function opts(list, sel, empty) {
    let o = empty ? `<option value="">${esc(empty)}</option>` : "";
    list.forEach((x) => { const id = x.id != null ? x.id : x, lb = x.label != null ? x.label : x;
      o += `<option value="${esc(id)}"${id === sel ? " selected" : ""}>${esc(lb)}</option>`; });
    return o;
  }
  let toastT = null;
  function toast(msg) {
    let t = el("toast"); if (!t) { t = h("div", { id: "toast", class: "toast" }); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1900);
  }
  function firstLine(str) {
    if (!str) return ""; const s = String(str).trim();
    const d = s.indexOf(". "); return (d > -1 && d < 95) ? s.slice(0, d + 1) : (s.length > 95 ? s.slice(0, 95) + "…" : s);
  }
  function fmtDate(iso) { try { return new Date(iso).toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); } catch (e) { return "—"; } }

  /* ============================================================
     RENDER
     ============================================================ */
  function renderAll() { renderHeader(); renderMain(); renderDrawer(); }

  /* ---------- Header ---------- */
  function renderHeader() {
    const host = el("header"); host.innerHTML = "";
    host.appendChild(h("div", { class: "header__brand" }, [
      h("h1", {}, data.meta.title || "GOLDEN"),
      h("span", { class: "sub" }, "Narrative & Gameplay Script"),
    ]));

    const meta = h("div", { class: "header__meta" });
    meta.innerHTML = `
      <span class="sync-ind ${Sync.enabled ? "live" : "local"}"><span class="dot"></span>${Sync.enabled ? "Online (en vivo)" : "Local"}</span>
      <span class="mini"><span class="key">Dur</span><input class="dur" id="m-dur" type="text" value="${esc(data.meta.songDuration)}"></span>
      <span class="mini key" id="m-upd">${esc(fmtDate(data.meta.lastUpdated))}</span>`;
    const helpBtn = h("button", { class: "btn-help", title: "Cómo funciona este sitio" }, "? Preguntas frecuentes");
    helpBtn.addEventListener("click", openHelp);
    meta.appendChild(helpBtn);
    const choreoBtn = h("button", { class: "btn-help btn-choreo", title: "Ver el video de la coreografía" }, "💃 Coreografía");
    choreoBtn.addEventListener("click", openChoreo);
    meta.appendChild(choreoBtn);
    const arteBtn = h("button", { class: "btn-help btn-arte", title: "Descargar brief de escenarios para Arte (.md + .json)" }, "🎨 Export para Arte");
    arteBtn.addEventListener("click", exportArte);
    meta.appendChild(arteBtn);
    host.appendChild(meta);

    const right = h("div", { class: "header__meta" });
    const syncBtn = h("button", { class: "btn-sync", title: "Sincronizar la letra de toda la canción" }, "⏱ Sincronizar letra");
    syncBtn.addEventListener("click", openLyricSync);
    right.appendChild(syncBtn);
    const undoBtn = h("button", { class: "btn-undo", id: "undo-btn", title: "Deshacer" }, "↶ Deshacer");
    undoBtn.disabled = !UNDO.length;
    undoBtn.addEventListener("click", undo);
    right.appendChild(undoBtn);
    const addBtn = h("button", { class: "btn-add" }, "+ Bloque");
    addBtn.addEventListener("click", addSegment);
    right.appendChild(addBtn);

    const menuWrap = h("div", { class: "menu-wrap" });
    const gear = h("button", { class: "icon-btn", title: "Más" }, "⋯");
    const menu = h("div", { class: "menu", id: "menu" });
    const mk = (lbl, fn, cls) => { const b = h("button", { class: cls || "" }, lbl); b.addEventListener("click", () => { menu.classList.remove("open"); fn(); }); return b; };
    menu.appendChild(mk("⇩  Export JSON", exportJSON));
    menu.appendChild(mk("⇧  Import JSON", importJSON));
    menu.appendChild(h("div", { class: "sep" }));
    menu.appendChild(mk("↺  Reset a ejemplo", resetData, "danger"));
    gear.addEventListener("click", (e) => { e.stopPropagation(); menu.classList.toggle("open"); });
    menuWrap.appendChild(gear); menuWrap.appendChild(menu);
    right.appendChild(menuWrap);
    host.appendChild(right);

    el("m-dur").addEventListener("change", (e) => { data.meta.songDuration = e.target.value; persistMeta(); renderMain(); });
  }

  /* ---------- Ayuda / Preguntas frecuentes ---------- */
  function openHelp() {
    const ov = el("overlay"), dr = el("drawer");
    dr.classList.add("help-modal");
    dr.innerHTML = "";
    const head = h("div", { class: "drawer__head" });
    head.innerHTML = `<span class="tc">? Preguntas frecuentes</span>
      <div class="dh-actions"><button class="close" title="Cerrar">×</button></div>`;
    head.querySelector(".close").addEventListener("click", closeHelp);
    dr.appendChild(head);
    const body = h("div", { class: "drawer__body help-body" });
    body.innerHTML = HELP_HTML;
    dr.appendChild(body);
    ov.classList.add("open"); dr.classList.add("open");
  }
  function closeHelp() {
    const ov = el("overlay"), dr = el("drawer");
    ov.classList.remove("open"); dr.classList.remove("open"); dr.classList.remove("help-modal");
    dr.innerHTML = "";
  }

  /* ---------- Coreografía (pop-up con video) ---------- */
  const CHOREO_SRC = "clips/coreo.mp4", CHOREO_IN = 5;
  function openChoreo() {
    const ov = el("overlay"), dr = el("drawer");
    dr.classList.add("choreo-modal");
    dr.innerHTML = "";
    const head = h("div", { class: "drawer__head" });
    head.innerHTML = `<span class="tc">💃 Coreografía</span>
      <div class="dh-actions"><button class="close" title="Cerrar">×</button></div>`;
    head.querySelector(".close").addEventListener("click", closeChoreo);
    dr.appendChild(head);
    const body = h("div", { class: "drawer__body choreo-body" });
    const video = h("video", { src: CHOREO_SRC + "#t=" + CHOREO_IN, controls: true, autoplay: true, playsinline: true, preload: "auto" });
    // arrancar en el segundo 5 (in) de forma robusta
    let seeded = false;
    const seekIn = () => { if (seeded) return; try { if ((video.currentTime || 0) < CHOREO_IN) video.currentTime = CHOREO_IN; seeded = true; } catch (e) {} };
    if (video.readyState >= 1) seekIn(); else video.addEventListener("loadedmetadata", seekIn, { once: true });
    video.addEventListener("canplay", seekIn, { once: true });
    video.addEventListener("play", () => { if (!seeded && (video.currentTime || 0) < CHOREO_IN) { try { video.currentTime = CHOREO_IN; } catch (e) {} seeded = true; } }, { once: true });
    body.appendChild(video);
    dr.appendChild(body);
    ov.classList.add("open"); dr.classList.add("open");
  }
  function closeChoreo() {
    const ov = el("overlay"), dr = el("drawer");
    const v = dr.querySelector("video"); if (v) { try { v.pause(); } catch (e) {} }
    ov.classList.remove("open"); dr.classList.remove("open"); dr.classList.remove("choreo-modal");
    dr.innerHTML = "";
  }
  const HELP_HTML = `
    <p class="help-lead">Herramienta para desglosar la canción en bloques y planear, por cada tramo, <b>qué se canta, qué pasa en pantalla y cómo se juega</b>. La edición es compartida y en vivo: varias personas a la vez.</p>

    <h3>La pantalla</h3>
    <ul>
      <li><b>Arriba — Línea de tiempo por etapa:</b> una grilla con la canción dividida en los 3 actos de la historia (<b style="color:#8098c8">Deseo</b> → <b style="color:#c56ab0">Transformación</b> → <b style="color:#e0b44e">Consagración</b>), y dentro, las secciones de cada momento. El ancho es proporcional al tiempo (se puede scrollear a la derecha).</li>
      <li>Cada sección muestra, en filas: <b>Tiempo · UI · Escenario · Acción</b>.</li>
      <li><b>Abajo — Planilla:</b> el detalle completo de cada bloque (letra, storyboard/clip, gameplay, momento del día, estado, momentos jugables, timecodes).</li>
    </ul>

    <h3>Escuchar la música</h3>
    <ul>
      <li>En la banda de cada etapa hay un <b>▶</b> que reproduce <b>sólo ese tramo</b> de la canción real (sin video). Suena una etapa a la vez; tocás de nuevo para pausar.</li>
    </ul>

    <h3>Editar los slots (UI · Escenario · Acción)</h3>
    <ul>
      <li><b>Doble clic</b> sobre el texto de un slot → se abre un campo para escribir a mano. Guarda al salir (o <b>Cmd/Ctrl+Enter</b>); <b>Esc</b> cancela.</li>
      <li><b>🎤 Dictado por voz</b> (en Chrome/Edge): tocás el micrófono del slot y hablás — el texto se agrega. Tocás el 🎤 de nuevo para terminar.</li>
      <li><b>Comando de voz "borrar":</b> con el 🎤 activo, decí <b>"borrar"</b> (o "limpiar") para vaciar el slot y dictar el texto nuevo.</li>
      <li>Click en el <b>tiempo</b> de una sección → abre ese bloque en la planilla de abajo para editar todo el detalle.</li>
    </ul>

    <h3>Momentos jugables</h3>
    <ul>
      <li>Por cada tap se describe qué pasa en los tres resultados: <b style="color:#f0c23c">Golden</b> (perfect), <b style="color:#5fcf8f">Good</b> y <b style="color:#f0685c">Miss</b>.</li>
    </ul>

    <h3>Storyboard / clip (en la planilla)</h3>
    <ul>
      <li>Cada bloque puede tener un fragmento de video o una imagen; se reproduce ahí mismo. Podés subir una imagen o pegar una URL.</li>
    </ul>

    <h3>Cortar bloques (tipo Premiere)</h3>
    <ul>
      <li>En la planilla, reproducís el clip del bloque, lo pausás y tocás <b>✂ Cortar</b>: el bloque se divide en dos en ese punto, repartiendo la letra y el video.</li>
      <li>También hay <b>✂ Dividir bloque</b> por tiempo escrito (MM:SS).</li>
    </ul>

    <h3>Sincronizar la letra</h3>
    <ul>
      <li>Botón <b>⏱ Sincronizar letra</b> (arriba): abre un panel con la canción completa y <b>todas las frases en orden</b>. Reproducís y tocás <b>⏱</b> en cada línea cuando entra (o escribís el tiempo). Se guarda al instante.</li>
      <li><b>Aplicar a bloques</b> ajusta los bordes de cada bloque según los tiempos marcados.</li>
    </ul>

    <h3>Deshacer y guardado</h3>
    <ul>
      <li><b>↶ Deshacer</b> revierte cortes y cambios de bloque, <b>sin perder los timecodes</b> ya marcados.</li>
      <li>Todo se guarda solo en la nube (en vivo, compartido). No hace falta "guardar".</li>
    </ul>`;
  function refreshUpdated() { const n = el("m-upd"); if (n) n.textContent = fmtDate(data.meta.lastUpdated); }

  /* ---------- Main (hero + strip + filters + list) ---------- */
  function renderMain() {
    const host = el("main"); host.innerHTML = "";
    const wf = h("div", { id: "wf-host" });
    host.appendChild(wf);
    renderWaveform(wf);
    const tl = h("div", { id: "tl" });
    host.appendChild(tl);
    renderGrid(tl);

    // Botón para mostrar/ocultar los bloques de abajo (ocultos por default)
    const toggleRow = h("div", { class: "blocks-toggle-row" });
    const tgl = h("button", { class: "blocks-toggle" + (ui.showBlocks ? " on" : "") },
      ui.showBlocks ? "▾ Ocultar bloques" : "▸ Mostrar bloques");
    tgl.addEventListener("click", () => { ui.showBlocks = !ui.showBlocks; renderMain(); });
    toggleRow.appendChild(tgl);
    host.appendChild(toggleRow);

    if (ui.showBlocks) {
      const blocks = h("div", { class: "blocks-wrap" });
      host.appendChild(blocks);
      renderFilters(blocks);
      renderList(blocks);
    }
  }
  // Refresca sólo la grilla superior, sin tocar la lista ni el editor inline
  function refreshTimeline() {
    const tl = el("tl"); if (!tl) return;
    tl.innerHTML = "";
    renderGrid(tl);
  }

  // Mecánicas de UI → ícono minimalista + etiqueta (chip dorado en la celda de UI)
  const UI_MECH = {
    tap:     { icon: "⊚", label: "Tap" },
    hold:    { icon: "⊡", label: "Hold" },
    swipe:   { icon: "↗", label: "Swipe" },
    zblocks: { icon: "⧉", label: "Bloques Z" },
    sword:   { icon: "⚔", label: "Espada" },
    summary: { icon: "≡", label: "Resumen" },
  };
  function mechChips(s) {
    const arr = Array.isArray(s.uiMechanics) ? s.uiMechanics : [];
    return arr.map((k) => {
      const m = UI_MECH[k]; if (!m) return "";
      return `<span class="mech-chip" title="Mecánica: ${esc(m.label)}"><span class="mech-ic">${m.icon}</span>${esc(m.label)}</span>`;
    }).join("");
  }

  // Convierte la rueda vertical en scroll horizontal cuando el cursor está sobre el elemento.
  // Libera al borde (deja que la página scrollee vertical) y respeta Shift para scroll nativo.
  function wheelToHScroll(el) {
    el.addEventListener("wheel", (e) => {
      if (!e.deltaY || e.shiftKey) return;
      if (el.scrollWidth <= el.clientWidth) return;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }, { passive: false });
  }

  // Grilla horizontal (guion tipo línea de tiempo): secciones en columnas, dimensiones en filas
  // Línea de tiempo: una sola grilla (bandas de etapa que abarcan sus bloques + info inline)
  function renderGrid(host) {
    const segs = sorted();
    const SCALE = 15; // px por segundo → proporciones exactas; se extiende a la derecha (scroll)
    const wrap = h("div", { class: "htl" });
    wrap.appendChild(h("div", { class: "seglabel", style: "margin-bottom:8px" },
      "Línea de tiempo — ▶ escucha la etapa · click en el tiempo para editar el bloque"));

    const scroll = h("div", { class: "htl-scroll" });
    const grid = h("div", { class: "htl-grid2" });
    grid.style.gridTemplateColumns = segs.map((s) => `${Math.max(1, dur(s)) * SCALE}px`).join(" ");

    // Fila 1: bandas de etapa, abarcando (span) las columnas de sus bloques
    let i = 0, gi = 0;
    while (i < segs.length) {
      let j = i, w = 0; const st = segs[i].narrativeStage;
      const gStart = parseTime(segs[i].startTime);
      while (j < segs.length && segs[j].narrativeStage === st) { w += dur(segs[j]); j++; }
      const gEnd = parseTime(segs[j - 1].endTime);
      const stage = STAGES.find((x) => x.id === st);
      const b = h("div", { class: "htl-band2", style: `grid-column:${i + 1} / span ${j - i};grid-row:1;background:${stage ? stage.color : "var(--line-2)"};color:${stage && stage.id === "golden" ? "#241a05" : "#fff"}` });
      b.innerHTML =
        `<div class="htl-sb-top"><button class="hplay hplay-stage" data-play="stage-${gi}" data-s="${gStart}" data-e="${gEnd}" title="Escuchar toda la etapa">▶</button>` +
        `<span class="htl-sb-dur htl-count" data-count="stage-${gi}" data-rest="${w}s">${w}s</span></div>` +
        `<span class="htl-sb-name">${stage ? esc(stage.short) : ""}</span>` +
        `<span class="htl-prog" data-prog="stage-${gi}"><i></i></span>`;
      grid.appendChild(b); i = j; gi++;
    }

    // Filas 2–5 por bloque: Tiempo · UI · Escenario · Acción (todo inline)
    segs.forEach((s, idx) => {
      const stage = STAGES.find((x) => x.id === s.narrativeStage);
      const col = idx + 1;
      const t = h("div", { class: "htl-cell htl-c-time", style: `grid-column:${col};grid-row:2;--c:${stage ? stage.color : "var(--line-2)"}`, "data-seg": s.id });
      t.innerHTML = `<button class="hplay hplay-block" data-play="${s.id}" data-s="${parseTime(s.startTime)}" data-e="${parseTime(s.endTime)}" title="Escuchar este momento">▶</button>` +
        `<span class="htl-b-time">${esc(s.startTime)}</span>` +
        `<small class="htl-count" data-count="${s.id}" data-rest="${esc(s.endTime)} · ${dur(s)}s">${esc(s.endTime)} · ${dur(s)}s</small>` +
        `<span class="htl-prog" data-prog="${s.id}"><i></i></span>`;
      grid.appendChild(t);
      const cell = (row, cls, k, field, v) => {
        const c = h("div", { class: "htl-cell " + cls, style: `grid-column:${col};grid-row:${row}`, "data-seg": s.id, "data-field": field });
        c.innerHTML = `<span class="htl-c-k">${k}<button class="htl-mic" data-seg="${s.id}" data-field="${field}" title="Editar por voz (dictado)">🎤</button></span>` +
          `<span class="htl-c-v" title="Doble clic para editar">${(v || "").trim() ? esc(v) : "—"}</span>`;
        return c;
      };
      const uiCell = cell(3, "htl-c-ui", "UI", "interaction", s.interaction);
      const chips = mechChips(s);
      if (chips) uiCell.querySelector(".htl-c-v").insertAdjacentHTML("beforebegin", `<div class="htl-mech">${chips}</div>`);
      grid.appendChild(uiCell);
      grid.appendChild(cell(4, "htl-c-esc", "Escenario", "location", s.location));
      grid.appendChild(cell(5, "htl-c-acc", "Acción", "narrativeAction", s.narrativeAction));

      // Fila 6: Letra (según el tiempo). Solo lectura; click abre «Sincronizar letra».
      const lyLines = parseLyric(s.lyric).filter((l) => l.text.trim());
      const lyHtml = isRealLyric(s.lyric)
        ? lyLines.map((l) => `<span class="htl-ly-line">${l.t != null ? `<em>${fmtTime(l.t)}</em> ` : ""}${esc(l.text)}</span>`).join("")
        : `<span class="htl-c-muted">(instrumental)</span>`;
      const lc = h("div", { class: "htl-cell htl-c-letra", style: `grid-column:${col};grid-row:6`, "data-seg": s.id });
      lc.innerHTML = `<span class="htl-c-k">Letra <span class="htl-ly-edit" title="Sincronizar / editar letra">⏱</span></span><span class="htl-c-v htl-ly">${lyHtml}</span>`;
      grid.appendChild(lc);
    });

    scroll.appendChild(grid);
    wrap.appendChild(scroll);
    host.appendChild(wrap);
    wheelToHScroll(scroll);

    grid.querySelectorAll(".htl-c-time").forEach((c) => c.addEventListener("click", () => openDrawer(c.getAttribute("data-seg"))));
    grid.querySelectorAll(".htl-c-letra").forEach((c) => c.addEventListener("click", () => openLyricSync()));
    grid.querySelectorAll(".hplay").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      playRange(b.getAttribute("data-play"), +b.getAttribute("data-s"), +b.getAttribute("data-e"));
    }));
    grid.querySelectorAll(".htl-mic").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      startVoiceEdit(b.getAttribute("data-seg"), b.getAttribute("data-field"), b);
    }));
    grid.querySelectorAll(".htl-c-ui, .htl-c-esc, .htl-c-acc").forEach((c) => c.addEventListener("dblclick", (e) => {
      if (e.target.closest(".htl-mic")) return;
      editSlot(c.getAttribute("data-seg"), c.getAttribute("data-field"), c);
    }));
    updatePlayButtons();
  }

  function renderHero(host) {
    const total = parseTime(data.meta.songDuration) || 210;
    const wrap = h("div", { class: "hero" });
    const head = h("div", { class: "hero__head" });
    head.appendChild(h("span", { class: "seglabel" }, "Timeline — click en un bloque para editar"));
    const tgl = h("div", { class: "pill-toggle" });
    [["gameplayMode", "Gameplay"], ["sectionType", "Sección"], ["narrativeStage", "Etapa"], ["worldState", "Mundo"], ["location", "Locación"]].forEach(([id, lb]) => {
      const b = h("button", { class: ui.colorBy === id ? "active" : "" }, lb);
      b.addEventListener("click", () => { ui.colorBy = id; renderMain(); });
      tgl.appendChild(b);
    });
    head.appendChild(tgl);
    wrap.appendChild(head);

    const track = h("div", { class: "track" });
    const palette = {}; const pcols = ["#4f6ba8", "#b5479b", "#d9a441", "#5a8f7b", "#f5683c", "#8b5cf6", "#5b8bb5", "#c2607a"]; let pi = 0;
    const colorFor = (s) => {
      const by = ui.colorBy;
      if (by === "gameplayMode") return gpColor(s.gameplayMode);
      if (by === "sectionType") return SEC_COLOR[s.sectionType] || "var(--line-2)";
      if (by === "narrativeStage") return stageColor(s.narrativeStage);
      if (by === "worldState") return WS_COLOR[s.worldState] || "var(--line-2)";
      const k = s.location || "—"; if (!(k in palette)) { palette[k] = pcols[pi % pcols.length]; pi++; } return palette[k];
    };
    const labFor = (s) => {
      const by = ui.colorBy;
      if (by === "gameplayMode") return labelOf(GP, s.gameplayMode);
      if (by === "sectionType") return labelOf(SECTIONS, s.sectionType) || "—";
      if (by === "narrativeStage") return (STAGES.find((x) => x.id === s.narrativeStage) || {}).short || "";
      if (by === "worldState") return labelOf(WS, s.worldState);
      return s.location || "—";
    };
    sorted().forEach((s) => {
      const left = (parseTime(s.startTime) / total) * 100;
      const w = Math.max(0.5, (dur(s) / total) * 100);
      const block = h("div", {
        class: "track__block" + (ui.openId === s.id ? " sel" : ""),
        style: `left:${left}%;width:${w}%;background:${colorFor(s)}`,
        title: `${s.startTime}–${s.endTime}  ${labFor(s)}`, "data-jump": s.id,
      });
      if (w > 3.2) {
        const lr = (s.lyric || "").trim();
        const lyrReal = lr && lr !== "[LYRIC TO ADD]" && lr.indexOf("[INTRO MUSIC") !== 0;
        block.appendChild(h("span", { class: "lab" }, lyrReal ? lr.split("\n")[0] : labFor(s)));
      }
      if ((s.storyBeat || "").trim()) block.appendChild(h("span", { class: "star" }, "★"));
      const stage = h("div", { class: "track__stage", style: `left:${left}%;width:${w}%;background:${stageColor(s.narrativeStage)}` });
      track.appendChild(block); track.appendChild(stage);
    });
    wrap.appendChild(track);

    const ruler = h("div", { class: "ruler" });
    for (let i = 0; i <= 6; i++) ruler.appendChild(h("span", {}, fmtTime((total / 6) * i)));
    wrap.appendChild(ruler);

    // legend
    const legend = h("div", { class: "legend" });
    let items = [];
    if (ui.colorBy === "gameplayMode") items = GP.map((g) => [g.label, g.color]);
    else if (ui.colorBy === "sectionType") items = SECTIONS.map((g) => [g.label, SEC_COLOR[g.id]]);
    else if (ui.colorBy === "narrativeStage") items = STAGES.map((g) => [g.short, g.color]);
    else if (ui.colorBy === "worldState") items = WS.map((g) => [g.label, WS_COLOR[g.id]]);
    else items = Object.keys(palette).map((k) => [k, palette[k]]);
    items.forEach(([lb, c]) => { const g = h("span", { class: "lg" }); g.innerHTML = `<span class="sw" style="background:${c}"></span>${esc(lb)}`; legend.appendChild(g); });
    wrap.appendChild(legend);

    host.appendChild(wrap);
    track.querySelectorAll("[data-jump]").forEach((b) => b.addEventListener("click", () => openDrawer(b.getAttribute("data-jump"))));
  }

  function renderGpStrip(host) {
    const segs = sorted();
    // (se eliminaron las tarjetas de porcentaje de gameplay por pedido)

    // longest run warning
    let runMode = null, runSecs = 0, longest = { mode: null, secs: 0 };
    segs.forEach((s) => { const d = dur(s); if (s.gameplayMode === runMode) runSecs += d; else { runMode = s.gameplayMode; runSecs = d; } if (runSecs > longest.secs) longest = { mode: runMode, secs: runSecs }; });
    if (longest.mode && longest.secs >= 20)
      host.appendChild(h("div", { class: "gpflow-warn" }, `⚠ Tramo más largo sin variar: ${labelOf(GP, longest.mode)} durante ${longest.secs}s. Considerá alternar el gameplay.`));
  }

  function renderFilters(host) {
    const f = ui.filters;
    const wrap = h("div", { class: "filters" });
    const addSel = (key, list, empty) => {
      const s = h("select", { "data-f": key }); s.innerHTML = opts(list, f[key], empty);
      s.addEventListener("change", (e) => { f[key] = e.target.value; renderList(document.querySelector(".blocks-wrap") || el("main")); updateCount(); });
      wrap.appendChild(s);
    };
    addSel("gameplayMode", GP, "Todo gameplay");
    addSel("narrativeStage", STAGES, "Toda etapa");
    addSel("status", STATUS, "Todo estado");
    addSel("location", allLocations().map((l) => ({ id: l, label: l })), "Toda locación");
    if (f.gameplayMode || f.narrativeStage || f.status || f.location) {
      const clr = h("button", { class: "clear" }, "limpiar");
      clr.addEventListener("click", () => { ui.filters = { gameplayMode: "", narrativeStage: "", status: "", location: "" }; renderMain(); });
      wrap.appendChild(clr);
    }
    wrap.appendChild(h("span", { class: "count", id: "f-count" }, ""));
    host.appendChild(wrap);
    updateCount();
  }
  function updateCount() { const n = el("f-count"); if (n) { const v = sorted().filter(passes).length; n.textContent = `${v} / ${data.segments.length} bloques`; } }

  function renderList(host) {
    // remove old list if present (when called standalone)
    const old = host.querySelector(".list"); if (old) old.remove();
    const list = h("div", { class: "list" });
    const vis = sorted().filter(passes);
    const head = h("div", { class: "row row-head" });
    head.innerHTML = `<div></div><div>Tiempo</div><div>Letra</div><div>Acción</div><div>Storyboard / clip</div><div></div>`;
    list.appendChild(head);
    if (!vis.length) list.appendChild(h("div", { class: "empty" }, "No hay bloques que coincidan con los filtros."));
    vis.forEach((s) => list.appendChild(buildRowWrap(s)));
    const add = h("button", { class: "add-row" }, "+ Agregar bloque");
    add.addEventListener("click", addSegment);
    list.appendChild(add);
    host.appendChild(list);
  }

  function buildRowWrap(s) {
    const open = ui.openId === s.id;
    const wrap = h("div", { class: "rowwrap" + (open ? " open" : ""), "data-seg": s.id });
    wrap.appendChild(buildCollapsedRow(s, open));
    if (open) wrap.appendChild(buildInlineEditor(s));
    return wrap;
  }

  const isVideo = (u) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u || "") || String(u || "").indexOf("data:video") === 0;

  /* ---- Letra con timecode por línea (formato [MM:SS] opcional, estilo LRC) ---- */
  function parseLyric(lyric) {
    return String(lyric == null ? "" : lyric).split("\n").map((line) => {
      const m = /^\s*\[(\d{1,2}):(\d{2})\]\s?(.*)$/.exec(line);
      return m ? { t: (+m[1]) * 60 + (+m[2]), text: m[3] } : { t: null, text: line };
    });
  }
  function fmtLyric(parsed) {
    return parsed.map((l) => (l.t == null ? l.text : "[" + fmtTime(l.t) + "] " + l.text)).join("\n");
  }
  function stripLrc(lyric) { return parseLyric(lyric).map((l) => l.text).join("\n"); }
  function lyricSyncCount(lyric) {
    const p = parseLyric(lyric).filter((l) => l.text.trim());
    return { synced: p.filter((l) => l.t != null).length, total: p.length };
  }
  function isRealLyric(lyric) {
    const c = stripLrc(lyric).trim();
    return !!c && c !== "[LYRIC TO ADD]" && c.indexOf("[INTRO MUSIC") !== 0 && !(c.charAt(0) === "[" && c.charAt(c.length - 1) === "]");
  }

  // Limita la reproducción del video a la ventana del bloque [clipStart, clipEnd]
  function applyClipWindow(video, s) {
    const cs = s.clipStart || 0, ce = s.clipEnd || 0;
    const seek = () => { try { if (cs) video.currentTime = cs; } catch (e) {} };
    if (video.readyState >= 1) seek(); else video.addEventListener("loadedmetadata", seek, { once: true });
    if (ce) {
      video.addEventListener("timeupdate", () => { if (video.currentTime >= ce) video.pause(); });
      video.addEventListener("play", () => { if (video.currentTime >= ce - 0.05 || video.currentTime < cs) { try { video.currentTime = cs; } catch (e) {} } });
    }
  }

  // Barra tipo Premiere: reproducir el clip, pausar y cortar el bloque en el playhead
  function attachCutBar(host, video, s) {
    const off = s.clipStart || 0;
    const start = parseTime(s.startTime);
    const songAt = () => start + Math.max(0, (video.currentTime || 0) - off);
    const bar = h("div", { class: "sb-cutbar" });
    const cut = h("button", { class: "sb-cut", title: "Cortar el bloque en el punto donde está pausado el video" }, "✂ Cortar");
    const info = h("span", { class: "sb-cut-time" }, "⏱ " + s.startTime);
    video.addEventListener("timeupdate", () => { info.textContent = "⏱ " + fmtTime(songAt()); });
    cut.addEventListener("click", (e) => { e.stopPropagation(); splitSegmentAt(s.id, songAt()); });
    bar.addEventListener("click", (e) => e.stopPropagation());
    bar.appendChild(cut); bar.appendChild(info);
    host.appendChild(bar);
  }

  function lyrCellHTML(s) {
    const clean = stripLrc(s.lyric || "").trim();
    const instrumental = (clean === "" || clean === "[LYRIC TO ADD]" || clean.indexOf("[INTRO MUSIC") === 0);
    const lyrHtml = instrumental
      ? '<div class="lyr instrumental" title="Doble clic para editar">♪ Instrumental · sin letra</div>'
      : `<div class="lyr" title="Doble clic para editar">${esc(clean)}</div>`;
    const sc = lyricSyncCount(s.lyric);
    const badge = (!instrumental && sc.total)
      ? `<span class="lyr-sync ${sc.synced === sc.total ? "full" : ""}" title="${sc.synced}/${sc.total} líneas con tiempo marcado">⏱ ${sc.synced}/${sc.total}</span>`
      : "";
    return lyrHtml + badge + '<button class="lyr-edit" title="Editar letra acá">✎</button>';
  }
  function wireLyricCell(row, s) {
    const cell = row.querySelector(".lyriccell");
    if (!cell) return;
    const pencil = cell.querySelector(".lyr-edit");
    if (pencil) pencil.addEventListener("click", (e) => { e.stopPropagation(); startLyricEdit(row, s); });
    // click simple en la letra no expande el bloque; doble clic edita ahí mismo
    cell.addEventListener("click", (e) => { e.stopPropagation(); });
    cell.addEventListener("dblclick", (e) => { e.stopPropagation(); startLyricEdit(row, s); });
  }
  function startLyricEdit(row, s) {
    const cell = row.querySelector(".lyriccell");
    if (!cell || cell.querySelector(".lyr-edit-ta")) return;
    const raw = s.lyric || "";
    const ta = h("textarea", { class: "lyr-edit-ta", rows: "4" });
    ta.value = (raw.trim() === "[LYRIC TO ADD]") ? "" : raw;
    cell.innerHTML = "";
    cell.appendChild(ta);
    const stop = (e) => e.stopPropagation();
    ta.addEventListener("click", stop);
    ta.addEventListener("mousedown", stop);
    let done = false;
    const finish = (save) => {
      if (done) return; done = true;
      if (save) { s.lyric = ta.value; persistSegment(s, true); }
      cell.innerHTML = lyrCellHTML(s);
      wireLyricCell(row, s);
      refreshTimeline();
    };
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); ta.blur(); }
      else if (e.key === "Escape") { e.preventDefault(); done = true; cell.innerHTML = lyrCellHTML(s); wireLyricCell(row, s); }
    });
    ta.addEventListener("blur", () => finish(true));
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
  }

  // Celda de Acción (texto de lo que sucede en escena), editable con doble clic
  function actCellHTML(s) {
    const txt = (s.narrativeAction || "").trim();
    const body = txt
      ? `<div class="act" title="Doble clic para editar">${esc(txt)}</div>`
      : '<div class="act muted" title="Doble clic para editar">+ acción</div>';
    return body + '<button class="act-edit" title="Editar acción acá">✎</button>';
  }
  function wireActionCell(row, s) {
    const cell = row.querySelector(".actioncell");
    if (!cell) return;
    const pencil = cell.querySelector(".act-edit");
    if (pencil) pencil.addEventListener("click", (e) => { e.stopPropagation(); startActionEdit(row, s); });
    cell.addEventListener("click", (e) => { e.stopPropagation(); });
    cell.addEventListener("dblclick", (e) => { e.stopPropagation(); startActionEdit(row, s); });
  }
  function startActionEdit(row, s) {
    const cell = row.querySelector(".actioncell");
    if (!cell || cell.querySelector(".act-edit-ta")) return;
    const ta = h("textarea", { class: "act-edit-ta", rows: "4" });
    ta.value = s.narrativeAction || "";
    cell.innerHTML = "";
    cell.appendChild(ta);
    const stop = (e) => e.stopPropagation();
    ta.addEventListener("click", stop); ta.addEventListener("mousedown", stop);
    let done = false;
    const finish = (save) => {
      if (done) return; done = true;
      if (save) { s.narrativeAction = ta.value; persistSegment(s, true); }
      cell.innerHTML = actCellHTML(s); wireActionCell(row, s);
    };
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); ta.blur(); }
      else if (e.key === "Escape") { e.preventDefault(); done = true; cell.innerHTML = actCellHTML(s); wireActionCell(row, s); }
    });
    ta.addEventListener("blur", () => finish(true));
    ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
  }

  function buildCollapsedRow(s, open) {
    const row = h("div", { class: "row" + (open ? " sel" : ""), style: `--stage-color:${stageColor(s.narrativeStage)}`, "data-seg": s.id });
    const media = s.storyboard
      ? (isVideo(s.storyboard)
          ? `<div class="sbframe video"><video src="${esc(s.storyboard)}" controls preload="metadata" playsinline></video></div>`
          : `<div class="sbframe has"><img src="${esc(s.storyboard)}" alt="storyboard"></div>`)
      : `<div class="sbframe empty"><span>＋ storyboard / fragmento</span></div>`;
    const stage = STAGES.find((x) => x.id === s.narrativeStage);
    const stageTag = stage ? `<span class="stage-tag" style="color:${stage.color};border-color:${stage.color}">${esc(stage.short)}</span>` : "";
    row.innerHTML = `
      <div class="chev">${open ? "▾" : "▸"}</div>
      <div class="tc">${stageTag}<span class="tc-time">${esc(s.startTime)}</span><small>${esc(s.endTime)} · ${dur(s)}s</small></div>
      <div class="lyriccell">${lyrCellHTML(s)}</div>
      <div class="actioncell">${actCellHTML(s)}</div>
      <div class="storycol">${media}</div>
      <div class="right">
        ${(s.beats && s.beats.length) ? `<span class="tap-ind" title="${s.beats.length} momento(s) jugable(s)">⊙${s.beats.length}</span>` : ""}
        ${(s.storyBeat || "").trim() ? '<span class="star-ind" title="Story beat">★</span>' : ""}
        <span class="status-dot s-${s.status}" title="${esc(labelOf(STATUS, s.status))}"></span>
      </div>`;
    row.addEventListener("click", () => toggleRow(s.id));
    wireLyricCell(row, s);
    wireActionCell(row, s);
    // El área de video reproduce en la lista sin abrir el desplegable
    const vbox = row.querySelector(".sbframe.video");
    if (vbox) vbox.addEventListener("click", (e) => e.stopPropagation());
    const cvid = row.querySelector(".sbframe.video video");
    if (cvid) { applyClipWindow(cvid, s); attachCutBar(row.querySelector(".storycol"), cvid, s); }
    return row;
  }

  // Actualiza sólo las celdas de resumen de la fila colapsada (sin reconstruir el editor)
  function updateRowSummary(s) {
    const row = document.querySelector(`.rowwrap[data-seg="${s.id}"] > .row`);
    if (!row) return;
    const lyrEl = row.querySelector(".lyr");
    if (lyrEl) {
      const clean = stripLrc(s.lyric || "").trim();
      const instrumental = (clean === "" || clean === "[LYRIC TO ADD]" || clean.indexOf("[INTRO MUSIC") === 0);
      lyrEl.className = "lyr" + (instrumental ? " instrumental" : "");
      lyrEl.textContent = instrumental ? "♪ Instrumental · sin letra" : clean;
    }
    const small = row.querySelector(".tc small");
    if (small) small.textContent = s.endTime + " · " + dur(s) + "s";
  }
  function refreshLyricCell(s) {
    const row = document.querySelector(`.rowwrap[data-seg="${s.id}"] > .row`);
    if (!row) return;
    const cell = row.querySelector(".lyriccell");
    if (cell) { cell.innerHTML = lyrCellHTML(s); wireLyricCell(row, s); }
  }

  /* ============================================================
     INLINE EDITOR (desplegable por fila)
     ============================================================ */
  function toggleRow(id) {
    ui.openId = (ui.openId === id) ? null : id;
    ui.showDetails = false; ui.showSync = false;
    if (ui.openId) ui.showBlocks = true;   // al abrir un bloque, mostrar la lista de abajo
    renderMain();
    if (ui.openId) scrollToRow(ui.openId, "nearest");
  }
  // alias usados por timeline / CRUD para expandir una fila concreta
  function openDrawer(id) {
    ui.openId = id; ui.showDetails = false; ui.showSync = false;
    ui.showBlocks = true;   // al abrir un bloque desde la timeline, mostrar la lista
    renderMain();
    scrollToRow(id, "center");
  }
  function closeDrawer() { ui.openId = null; renderMain(); }
  function renderDrawer() { /* no-op: el editor ahora es inline en la lista */ }
  function scrollToRow(id, block) {
    const w = document.querySelector(`.rowwrap[data-seg="${id}"]`);
    if (w) w.scrollIntoView({ block: block || "nearest", behavior: "smooth" });
  }

  function buildInlineEditor(s) {
    const wrap = h("div", { class: "rowedit", style: `--stage-color:${stageColor(s.narrativeStage)}` });
    const body = h("div", { class: "rowedit-body" });
    const colMain = h("div", { class: "dcol dcol-main" });
    const colBeats = h("div", { class: "dcol dcol-beats" });

    // Timecode
    const tc = h("div", { class: "fg" });
    tc.innerHTML = `<label>Timecode</label>
      <div class="tc-row">
        <input type="text" data-f="startTime" value="${esc(s.startTime)}" data-tc="1">
        <span>→</span>
        <input type="text" data-f="endTime" value="${esc(s.endTime)}" data-tc="1">
        <span class="dur" data-dur>${dur(s)}s</span>
      </div>`;
    colMain.appendChild(tc);

    // Storyboard / captura de gameplay (la columna "Acción")
    colMain.appendChild(storyboardField(s));

    // Gameplay
    colMain.appendChild(gpField(s));

    // Interacción / UI
    colMain.appendChild(fgText(s, "interaction", "Interacción / UI (swipe, Fruit Ninja, interfaz en Z, combate…)"));

    // Escenario + momento del día (columnas principales)
    const rowCtx = h("div", { class: "fg-row" });
    rowCtx.appendChild(fgInput(s, "location", "Escenario / locación", "Seoul Streets"));
    rowCtx.appendChild(fgSelect(s, "timeOfDay", "Momento del día", TOD));
    colMain.appendChild(wrapFg(rowCtx));

    // Stage + status
    const row2 = h("div", { class: "fg-row" });
    row2.appendChild(fgSelect(s, "narrativeStage", "Etapa narrativa", STAGES));
    row2.appendChild(fgSelect(s, "status", "Estado", STATUS));
    colMain.appendChild(wrapFg(row2));

    // (La "Acción" ahora se edita directo en su columna de la planilla, con doble clic)

    // Timecodes de la letra de este bloque — colapsado por defecto, se despliega a mano
    if (isRealLyric(s.lyric)) {
      const sc = lyricSyncCount(s.lyric);
      const tcToggle = h("button", { class: "details-toggle" },
        [h("span", { class: "chev" }, "▶"), h("span", {}, `⏱ Timecodes de la letra (${sc.synced}/${sc.total})`)]);
      const tcWrap = h("div", { class: "details" });
      let built = false;
      tcToggle.addEventListener("click", () => {
        const open = !tcWrap.classList.contains("open");
        if (open && !built) { tcWrap.appendChild(blockTimecodesField(s)); built = true; }
        tcWrap.classList.toggle("open", open);
        tcToggle.classList.toggle("open", open);
      });
      colBeats.appendChild(tcToggle);
      colBeats.appendChild(tcWrap);
    }
    colBeats.appendChild(beatsField(s));

    body.appendChild(colMain);
    body.appendChild(colBeats);
    wrap.appendChild(body);

    // actions
    const act = h("div", { class: "rowedit-actions" });
    const mk = (lbl, fn, cls) => { const b = h("button", { class: cls || "" }, lbl); b.addEventListener("click", fn); return b; };
    act.appendChild(mk("▲ Subir", () => moveSegment(s.id, -1)));
    act.appendChild(mk("▼ Bajar", () => moveSegment(s.id, 1)));
    act.appendChild(mk("⎘ Duplicar", () => duplicateSegment(s.id)));
    act.appendChild(mk("✂ Dividir bloque", () => splitSegment(s.id), "split"));
    act.appendChild(h("span", { class: "sp" }));
    act.appendChild(mk("▴ Cerrar", () => closeDrawer()));
    act.appendChild(mk("🗑 Borrar", () => deleteSegment(s.id), "del"));
    wrap.appendChild(act);

    // wire text inputs / selects (sin reconstruir el editor para no perder el foco)
    wrap.querySelectorAll("[data-f]").forEach((inp) => {
      const f = inp.getAttribute("data-f");
      if (inp.tagName === "SELECT") {
        inp.addEventListener("change", (e) => { s[f] = e.target.value; persistSegment(s, true); renderMain(); });
        return;
      }
      inp.addEventListener("input", (e) => {
        s[f] = e.target.value;
        if (inp.getAttribute("data-tc")) {
          const dn = wrap.querySelector("[data-dur]"); if (dn) dn.textContent = dur(s) + "s";
        }
        persistSegment(s);
        updateRowSummary(s);
        refreshTimeline();
      });
    });
    return wrap;
  }

  function storyboardField(s) {
    const d = h("div", { class: "fg" });
    d.appendChild(h("label", {}, "Acción — storyboard / fragmento animado"));
    const box = h("div", { class: "sbedit" });
    let video = null;
    if (s.storyboard && isVideo(s.storyboard)) {
      video = h("video", { src: s.storyboard, controls: true, preload: "metadata", playsinline: true });
      box.appendChild(video);
    } else if (s.storyboard) {
      box.appendChild(h("img", { src: s.storyboard, alt: "storyboard" }));
    } else {
      box.appendChild(h("div", { class: "sb-ph" }, "Todavía no hay storyboard ni fragmento. Subí una imagen o pegá una URL (imagen o video) para que la animación pueda producirse a partir de esto."));
    }
    d.appendChild(box);
    if (video) { applyClipWindow(video, s); attachCutBar(d, video, s); }

    const ctr = h("div", { class: "sb-ctr" });
    const up = h("label", { class: "sb-up" }, "⬆ Subir imagen");
    const file = h("input", { type: "file", accept: "image/*", style: "display:none" });
    file.addEventListener("change", () => {
      const f = file.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { s.storyboard = r.result; persistSegment(s, true); renderMain(); toast("Storyboard agregado"); };
      r.readAsDataURL(f);
    });
    up.appendChild(file);
    ctr.appendChild(up);

    const url = h("input", { type: "text", class: "sb-url", placeholder: "…o pegá una URL de imagen / frame del video" });
    url.value = (s.storyboard && s.storyboard.indexOf("data:") !== 0) ? s.storyboard : "";
    url.addEventListener("change", () => { s.storyboard = url.value.trim(); persistSegment(s, true); renderMain(); });
    ctr.appendChild(url);

    if (s.storyboard) {
      const rm = h("button", { class: "sb-rm" }, "Quitar");
      rm.addEventListener("click", () => { s.storyboard = ""; persistSegment(s, true); renderMain(); });
      ctr.appendChild(rm);
    }
    d.appendChild(ctr);
    return d;
  }

  /* ============================================================
     SINCRONIZACIÓN GLOBAL DE LETRA (apartado único, toda la canción)
     ============================================================ */
  // Fuente de video para el panel: el clip de canción completa de cualquier bloque
  function fullSongClip() {
    const withVid = data.segments.find((s) => s.storyboard && isVideo(s.storyboard) && (s.clipStart || 0) === parseTime(s.startTime));
    return withVid ? withVid.storyboard : (data.segments.find((s) => s.storyboard && isVideo(s.storyboard)) || {}).storyboard || "";
  }

  /* ---- Reproducir SÓLO el audio del tramo de un bloque (uno por vez) ---- */
  // Fuente de audio: la canción real del juego (3:14), ya sincronizada con los timecodes
  const SONG_AUDIO = "clips/song.m4a";
  let songAudio = null, playingKey = null, playStop = null, playProg = null;
  // ---- Waveform (arriba de la timeline) ----
  const WF = { peaks: null, duration: 0, pps: 15 };   // pps = px por segundo a 1x (igual que la timeline)
  let wfRaf = null, wfLoading = null;
  function wfScale() { return WF.pps * ui.wfZoom; }
  function wfLoad() {
    if (WF.peaks) return Promise.resolve(true);
    if (wfLoading) return wfLoading;
    wfLoading = fetch("clips/waveform.json?v=1").then((r) => r.json()).then((j) => {
      WF.peaks = j.peaks; WF.duration = j.duration; return true;
    }).catch(() => false);
    return wfLoading;
  }
  function wfDraw(canvas) {
    if (!WF.peaks) return;
    const dpr = window.devicePixelRatio || 1;
    const W = Math.round(WF.duration * wfScale()), H = 70;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    const peaks = WF.peaks, N = peaks.length, mid = H / 2;
    const barW = Math.max(1, (W / N) * 0.72);
    ctx.fillStyle = "#4a4a57";
    for (let i = 0; i < N; i++) {
      const x = (i / N) * W;
      const hh = Math.max(1, peaks[i] * mid * 0.92);
      ctx.fillRect(x, mid - hh, barW, hh * 2);
    }
  }
  function wfApplyPositions() {
    const sc = wfScale();
    const a = songAudio;
    const x = a ? (a.currentTime || 0) * sc : 0;
    const ph = document.querySelector(".wf-playhead"), played = document.querySelector(".wf-played");
    if (ph) ph.style.left = x + "px";
    if (played) played.style.width = x + "px";
  }
  function wfShowRegion(start, end) {
    const region = document.querySelector(".wf-region"); if (!region) return;
    if (start == null) { region.style.display = "none"; return; }
    const sc = wfScale();
    region.style.display = "block";
    region.style.left = (start * sc) + "px";
    region.style.width = Math.max(2, (end - start) * sc) + "px";
  }
  function wfLoop() {
    const a = songAudio;
    const ph = document.querySelector(".wf-playhead"), played = document.querySelector(".wf-played"), scroll = document.querySelector(".wf-scroll");
    if (ph && a) {
      const x = (a.currentTime || 0) * wfScale();
      ph.style.left = x + "px";
      if (played) played.style.width = x + "px";
      if (scroll) {
        const v0 = scroll.scrollLeft, v1 = v0 + scroll.clientWidth;
        if (x < v0 + 40 || x > v1 - 40) scroll.scrollLeft = x - scroll.clientWidth * 0.5;
      }
    }
    wfRaf = requestAnimationFrame(wfLoop);
  }
  function wfStart() { if (!wfRaf) wfRaf = requestAnimationFrame(wfLoop); }
  function wfStop() { if (wfRaf) { cancelAnimationFrame(wfRaf); wfRaf = null; } }
  function playFull(time) { playRange("wf", time, WF.duration || 999); }
  function renderWaveform(host) {
    const wrap = h("div", { class: "wf" });
    const head = h("div", { class: "wf-head" });
    head.innerHTML = `<span class="wf-label">▶ WAVEFORM — click en la onda para reproducir desde ese punto</span>`;
    const zoom = h("div", { class: "wf-zoom" });
    const bOut = h("button", { title: "Alejar (estrechar)" }, "−");
    const zlbl = h("span", { class: "wf-zoom-lbl" }, ui.wfZoom.toFixed(1).replace(/\.0$/, "") + "×");
    const bIn = h("button", { title: "Acercar (estirar)" }, "+");
    zoom.append(bOut, zlbl, bIn); head.appendChild(zoom); wrap.appendChild(head);

    const scroll = h("div", { class: "wf-scroll" });
    const cw = h("div", { class: "wf-canvaswrap" });
    const canvas = h("canvas", { class: "wf-canvas" });
    const played = h("div", { class: "wf-played" });
    const region = h("div", { class: "wf-region" });
    const ph = h("div", { class: "wf-playhead" });
    cw.append(canvas, played, region, ph);
    scroll.appendChild(cw); wrap.appendChild(scroll); host.appendChild(wrap);
    wheelToHScroll(scroll);

    const redraw = () => {
      const W = Math.round(WF.duration * wfScale());
      cw.style.width = W + "px";
      wfDraw(canvas);
      wfApplyPositions();
      // mantener la región de la etapa/bloque que esté sonando
      const b = playingKey && playingKey !== "wf" && document.querySelector(`.hplay[data-play="${playingKey}"]`);
      if (b) wfShowRegion(+b.getAttribute("data-s"), +b.getAttribute("data-e")); else wfShowRegion(null);
      zlbl.textContent = ui.wfZoom.toFixed(1).replace(/\.0$/, "") + "×";
    };
    bIn.addEventListener("click", () => { ui.wfZoom = Math.min(6, ui.wfZoom * 1.5); redraw(); });
    bOut.addEventListener("click", () => { ui.wfZoom = Math.max(0.5, ui.wfZoom / 1.5); redraw(); });
    cw.addEventListener("click", (e) => {
      const rect = cw.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = Math.max(0, x / wfScale());
      playFull(time);
    });

    wfLoad().then((ok) => { if (!ok) { wrap.style.display = "none"; return; } redraw(); });
  }
  // Resetea las barras de progreso y los contadores a su valor por defecto
  function resetProgress() {
    document.querySelectorAll(".htl-prog > i").forEach((i) => { i.style.width = "0%"; });
    document.querySelectorAll(".htl-count").forEach((c) => { c.textContent = c.getAttribute("data-rest") || c.textContent; c.classList.remove("counting"); });
  }
  function getSongAudio() {
    if (!songAudio) {
      songAudio = document.createElement("audio");
      songAudio.src = SONG_AUDIO;
      songAudio.preload = "auto"; songAudio.volume = 1;
      document.body.appendChild(songAudio);
    }
    return songAudio;
  }
  function stopSong() {
    if (songAudio) {
      try { songAudio.pause(); } catch (e) {}
      if (playStop) songAudio.removeEventListener("timeupdate", playStop);
      if (playProg) songAudio.removeEventListener("timeupdate", playProg);
    }
    playStop = null; playProg = null; playingKey = null;
    wfStop(); wfShowRegion(null);
    resetProgress(); updatePlayButtons();
  }
  // Reproduce un rango [start, end] (segundos) de la canción; `key` identifica qué botón suena
  function playRange(key, start, end) {
    const a = getSongAudio();
    if (playingKey === key && !a.paused) { stopSong(); return; } // toggle off
    stopSong();
    playingKey = key; updatePlayButtons();
    wfStart();
    wfShowRegion(key === "wf" ? null : start, end);
    const total = Math.max(0.1, end - start);
    const playFrom = () => {
      playStop = () => { if ((a.currentTime || 0) >= end) stopSong(); };
      a.addEventListener("timeupdate", playStop);
      // Progreso: barra que se llena + contador de tiempo transcurrido (0 → total)
      playProg = () => {
        const elapsed = Math.max(0, Math.min(total, (a.currentTime || 0) - start));
        const pct = (elapsed / total) * 100;
        document.querySelectorAll(`[data-prog="${key}"] > i`).forEach((i) => { i.style.width = pct + "%"; });
        document.querySelectorAll(`[data-count="${key}"]`).forEach((c) => {
          c.classList.add("counting");
          c.textContent = `⏱ ${Math.round(elapsed)}s / ${Math.round(total)}s`;
        });
      };
      a.addEventListener("timeupdate", playProg);
      playProg();
      const p = a.play();
      if (p && p.catch) p.catch(() => { stopSong(); toast("No se pudo reproducir el audio"); });
    };
    const seekThenPlay = () => {
      if (Math.abs((a.currentTime || 0) - start) < 0.25) { playFrom(); return; }
      a.addEventListener("seeked", function once() { a.removeEventListener("seeked", once); playFrom(); }, { once: true });
      try { a.currentTime = start; } catch (e) { playFrom(); }
    };
    if (a.readyState >= 1) seekThenPlay();
    else a.addEventListener("loadedmetadata", seekThenPlay, { once: true });
  }
  function updatePlayButtons() {
    document.querySelectorAll(".hplay").forEach((b) => {
      const on = b.getAttribute("data-play") === playingKey;
      b.textContent = on ? "⏸" : "▶"; b.classList.toggle("playing", on);
    });
  }

  /* ---- Editar el texto de un slot a mano (doble clic) ---- */
  function editSlot(segId, field, cellEl) {
    const s = data.segments.find((x) => x.id === segId); if (!s) return;
    if (cellEl.querySelector(".htl-c-edit")) return;
    const vEl = cellEl.querySelector(".htl-c-v");
    const ta = h("textarea", { class: "htl-c-edit" });
    ta.value = s[field] || "";
    if (vEl) vEl.style.display = "none";
    cellEl.appendChild(ta);
    ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
    let done = false;
    const finish = (save) => {
      if (done) return; done = true;
      if (save) { s[field] = ta.value; persistSegment(s, true); }
      refreshTimeline();
    };
    ta.addEventListener("click", (e) => e.stopPropagation());
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); ta.blur(); }
      else if (e.key === "Escape") { e.preventDefault(); done = true; refreshTimeline(); }
    });
    ta.addEventListener("blur", () => finish(true));
  }

  /* ---- Editar un campo por voz (dictado + comandos, Web Speech API) ---- */
  let voiceRec = null, voiceBtn = null;
  function updateVoiceCell(segId, field) {
    const s = data.segments.find((x) => x.id === segId);
    const cell = document.querySelector(`.htl-cell[data-seg="${segId}"][data-field="${field}"] .htl-c-v`);
    if (s && cell) cell.textContent = (s[field] || "").trim() ? s[field] : "—";
  }
  function startVoiceEdit(segId, field, btn) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast("Tu navegador no soporta dictado por voz (usá Chrome)"); return; }
    const wasThis = voiceBtn === btn;
    if (voiceRec) { try { voiceRec.stop(); } catch (e) {} voiceRec = null; }
    if (voiceBtn) { voiceBtn.classList.remove("rec"); voiceBtn = null; }
    if (wasThis) return; // segundo click en el mismo = parar
    const s = data.segments.find((x) => x.id === segId); if (!s) return;
    const rec = new SR();
    rec.lang = "es-ES"; rec.interimResults = true; rec.continuous = true;
    // arranca del texto actual: así podés AGREGAR, o decir "borrar" para limpiar y dictar de nuevo
    let base = (s[field] || "").trim();
    // comando "borrar/eliminar/limpiar (todo) (el texto)…" → detecta el verbo quitando relleno
    const CLEAR = /^(borr(a|á|o|ar|arlo|alo|álo)|elimin(a|á|o|ar|arlo|alo)|limpi(a|á|o|ar|arlo|alo))$/;
    const isClear = (t) => {
      const c = t.toLowerCase().replace(/[.,!?¡¿;:]/g, " ")
        .replace(/\b(el|la|lo|los|las|todo|toda|todos|todas|texto|contenido|completo|completa|esto|eso|por favor|porfa|ahora|ya)\b/g, "")
        .replace(/\s+/g, " ").trim();
      return CLEAR.test(c);
    };
    rec.onresult = (e) => {
      let interim = "";
      for (let k = e.resultIndex; k < e.results.length; k++) {
        const t = e.results[k][0].transcript;
        if (e.results[k].isFinal) {
          if (isClear(t)) { base = ""; toast("🧹 Texto borrado — seguí dictando"); }
          else base = (base ? base + " " : "") + t.trim();
        } else interim += t;
      }
      s[field] = (base + (interim ? (base ? " " : "") + interim : "")).trim();
      updateVoiceCell(segId, field);
    };
    rec.onend = () => {
      btn.classList.remove("rec"); voiceRec = null; voiceBtn = null;
      persistSegment(s, true); refreshTimeline();
    };
    rec.onerror = (ev) => {
      btn.classList.remove("rec"); voiceRec = null; voiceBtn = null;
      if (ev.error !== "no-speech" && ev.error !== "aborted") toast("No se pudo escuchar (" + ev.error + ")");
    };
    voiceRec = rec; voiceBtn = btn; btn.classList.add("rec");
    try { rec.start(); toast('🎤 Dictando… decí "borrar" para limpiar · tocá el mic para terminar'); }
    catch (e) { btn.classList.remove("rec"); voiceRec = null; voiceBtn = null; }
  }

  function openLyricSync() {
    const ov = el("overlay"), dr = el("drawer");
    dr.classList.add("sync-modal");
    renderLyricSync();
    ov.classList.add("open"); dr.classList.add("open");
  }
  function closeLyricSync() {
    const ov = el("overlay"), dr = el("drawer");
    ov.classList.remove("open"); dr.classList.remove("open"); dr.classList.remove("sync-modal");
    dr.innerHTML = "";
    renderMain();
  }

  function renderLyricSync() {
    const dr = el("drawer"); dr.innerHTML = "";
    const head = h("div", { class: "drawer__head" });
    head.innerHTML = `<span class="tc">⏱ Sincronizar letra — toda la canción</span>
      <div class="dh-actions"><button class="close" title="Cerrar">×</button></div>`;
    head.querySelector(".close").addEventListener("click", closeLyricSync);
    dr.appendChild(head);

    const body = h("div", { class: "drawer__body sync-body" });

    // Audio real de la canción (3:14) para sincronizar. El video, en negro por ahora.
    const vbox = h("div", { class: "sbedit sync-video" });
    vbox.appendChild(h("div", { class: "sync-blackvideo" }, "🎬 Video — en negro por ahora"));
    const video = h("audio", { src: SONG_AUDIO, controls: true, preload: "metadata" }); // `video` = reproductor (los ⏱ leen su currentTime)
    vbox.appendChild(video); body.appendChild(vbox);
    const ph = h("div", { class: "sync-playhead", id: "sync-ph" }, "⏱ 00:00");
    video.addEventListener("timeupdate", () => { ph.textContent = "⏱ " + fmtTime(video.currentTime || 0); });
    body.appendChild(ph);
    body.appendChild(h("div", { class: "beats-hint" }, "Reproducí la canción y cuando empieza cada frase tocá ⏱ en esa línea (o escribí el tiempo). Cada línea se guarda al instante. Cuando termines, tocá «Aplicar a bloques» para que cada frase caiga en su bloque según el tiempo marcado."));

    // Lista completa de líneas (todos los bloques, en orden), agrupada por bloque
    const segs = sorted();
    const songAt = () => (video ? (video.currentTime || 0) : null);
    const list = h("div", { class: "sync-list sync-list-full" });
    segs.forEach((s) => {
      const parsed = parseLyric(s.lyric);
      const hasLyric = isRealLyric(s.lyric);
      const grp = h("div", { class: "sync-grp" });
      const title = (s.productionNotes || "").split("—")[0].trim() || s.sectionType || "Bloque";
      grp.appendChild(h("div", { class: "sync-grp-head" }, `${s.startTime}–${s.endTime} · ${title}` + (hasLyric ? "" : " · (instrumental)")));
      if (hasLyric) {
        const save = () => { s.lyric = fmtLyric(parsed); persistSegment(s, true); refreshLyricCell(s); updateSyncCounter(); };
        parsed.forEach((ln, i) => {
          if (!ln.text.trim()) return;
          const r = h("div", { class: "sync-row" });
          const tin = h("input", { type: "text", class: "sync-t", value: ln.t != null ? fmtTime(ln.t) : "", placeholder: "--:--" });
          tin.addEventListener("change", () => { const v = tin.value.trim(); parsed[i].t = v ? parseTime(v) : null; save(); });
          const mark = h("button", { class: "sync-mark", title: "Marcar con el tiempo del video" }, "⏱");
          if (!video) mark.disabled = true;
          mark.addEventListener("click", () => { const t = songAt(); if (t == null) return; parsed[i].t = Math.max(0, Math.round(t)); tin.value = fmtTime(parsed[i].t); save(); });
          r.appendChild(tin); r.appendChild(mark); r.appendChild(h("span", { class: "sync-txt", title: ln.text }, ln.text));
          grp.appendChild(r);
        });
      }
      list.appendChild(grp);
    });
    body.appendChild(list);
    dr.appendChild(body);

    const foot = h("div", { class: "drawer__actions" });
    const counter = h("span", { class: "sync-counter", id: "sync-counter" }, "");
    const apply = h("button", { class: "sync-apply" }, "✓ Aplicar a bloques");
    apply.addEventListener("click", applyLyricSyncToBlocks);
    foot.appendChild(counter);
    foot.appendChild(h("span", { class: "sp" }));
    foot.appendChild(apply);
    dr.appendChild(foot);
    updateSyncCounter();
  }
  function updateSyncCounter() {
    const n = el("sync-counter"); if (!n) return;
    let synced = 0, total = 0;
    data.segments.forEach((s) => { const c = lyricSyncCount(s.lyric); synced += c.synced; total += c.total; });
    n.textContent = `${synced}/${total} líneas marcadas`;
  }

  // Reasigna cada línea a su bloque según el tiempo marcado y realinea los bordes
  function applyLyricSyncToBlocks() {
    const segs = sorted();
    // 1) juntar TODAS las líneas de todos los bloques, en orden
    const all = [];
    segs.forEach((s) => parseLyric(s.lyric).forEach((l) => { if (l.text.trim()) all.push(l); }));
    const marked = all.filter((l) => l.t != null);
    if (!marked.length) { toast("Marcá al menos una línea antes de aplicar"); return; }
    snapshot("aplicar sincronización");

    // 2) nuevos bordes: el inicio de cada bloque con letra = tiempo de su 1ª línea marcada
    //    Para eso primero repartimos por el reparto actual, pero realineamos bordes por tiempo.
    // Estrategia: cada bloque que tenga al menos una línea marcada arranca en su primer tiempo marcado.
    const newStarts = {};
    segs.forEach((s) => {
      const first = parseLyric(s.lyric).map((l) => l.t).filter((t) => t != null).sort((a, b) => a - b)[0];
      if (first != null) newStarts[s.id] = first;
    });
    // aplicar nuevos inicios donde corresponda
    segs.forEach((s) => { if (newStarts[s.id] != null) s.startTime = fmtTime(newStarts[s.id]); });
    // reordenar y encadenar fines = inicio del siguiente
    const ordered = sorted();
    ordered.forEach((s, i) => {
      s.clipStart = parseTime(s.startTime);
      if (i < ordered.length - 1) { s.endTime = ordered[i + 1].startTime; s.clipEnd = parseTime(s.endTime); }
      else { s.clipEnd = parseTime(s.endTime); }
    });
    ordered.forEach((s) => persistSegment(s, true));
    renderLyricSync(); renderMain();
    toast("Bordes de bloque ajustados a la letra");
  }

  function wrapFg(inner) { const w = h("div", { class: "fg" }); w.appendChild(inner); return w; }
  function fgInput(s, f, label, ph) {
    const d = h("div", { class: "fg" });
    d.innerHTML = `<label>${esc(label)}</label><input type="text" data-f="${f}" value="${esc(s[f] || "")}" placeholder="${esc(ph || "")}">`;
    return d;
  }
  function fgText(s, f, label) {
    const d = h("div", { class: "fg" });
    d.innerHTML = `<label>${esc(label)}</label><textarea data-f="${f}">${esc(s[f] || "")}</textarea>`;
    return d;
  }
  function fgSelect(s, f, label, list) {
    const d = h("div", { class: "fg" });
    d.innerHTML = `<label>${esc(label)}</label><select data-f="${f}">${opts(list, s[f])}</select>`;
    return d;
  }
  function gpField(s) {
    const d = h("div", { class: "fg" });
    d.appendChild(h("label", {}, "Gameplay mode — elegí el modo de juego"));
    const set = h("div", { class: "ch-set" });
    GP.forEach((g) => {
      const sel = s.gameplayMode === g.id;
      const b = h("button", { class: "chbtn " + g.id + (sel ? " sel" : "") }, g.label);
      b.addEventListener("click", () => { s.gameplayMode = sel ? "" : g.id; persistSegment(s, true); renderMain(); renderDrawer(); });
      set.appendChild(b);
    });
    d.appendChild(set); return d;
  }
  function wsField(s) {
    const d = h("div", { class: "fg" });
    d.appendChild(h("label", {}, "World state"));
    const set = h("div", { class: "ch-set ws-set" });
    WS.forEach((w) => {
      const b = h("button", { class: "chbtn " + w.id + (s.worldState === w.id ? " sel" : "") }, w.label);
      b.addEventListener("click", () => { s.worldState = w.id; persistSegment(s, true); renderMain(); renderDrawer(); });
      set.appendChild(b);
    });
    d.appendChild(set); return d;
  }
  function sectionField(s) {
    const d = h("div", { class: "fg" });
    d.appendChild(h("label", {}, "Tipo de sección — marcá a mano"));
    const set = h("div", { class: "ch-set sec-set" });
    SECTIONS.forEach((sec) => {
      const sel = s.sectionType === sec.id;
      const b = h("button", { class: "chbtn sec " + sec.id + (sel ? " sel" : "") }, sec.label);
      b.addEventListener("click", () => { s.sectionType = sel ? "" : sec.id; persistSegment(s, true); renderMain(); renderDrawer(); });
      set.appendChild(b);
    });
    d.appendChild(set);
    return d;
  }

  // Timecodes de la letra del bloque (editables) + botón para ajustar el inicio del bloque
  function blockTimecodesField(s) {
    const d = h("div", { class: "fg sync-fg" });
    d.appendChild(h("div", { class: "beats-hint" }, "Los marcás en «⏱ Sincronizar letra» (arriba). Acá los ves/editás y con el botón movés el inicio del bloque a la 1ª línea."));
    const parsed = parseLyric(s.lyric);
    const save = () => { s.lyric = fmtLyric(parsed); persistSegment(s, true); refreshLyricCell(s); refreshTimeline(); };
    const list = h("div", { class: "sync-list" });
    parsed.forEach((ln, i) => {
      if (!ln.text.trim()) return;
      const r = h("div", { class: "sync-row norow" });
      const tin = h("input", { type: "text", class: "sync-t", value: ln.t != null ? fmtTime(ln.t) : "", placeholder: "--:--" });
      tin.addEventListener("change", () => { const v = tin.value.trim(); parsed[i].t = v ? parseTime(v) : null; save(); });
      r.appendChild(tin); r.appendChild(h("span", { class: "sync-txt", title: ln.text }, ln.text));
      list.appendChild(r);
    });
    d.appendChild(list);
    const snap = h("button", { class: "sync-snap" }, "⇄ Ajustar inicio del bloque a la 1ª línea");
    snap.addEventListener("click", () => snapBlockStartToLyric(s));
    d.appendChild(snap);
    return d;
  }

  // Mueve el inicio del bloque (y el fin del anterior) al tiempo de su 1ª línea marcada
  function snapBlockStartToLyric(s) {
    const first = parseLyric(s.lyric).find((l) => l.t != null && l.text.trim());
    if (!first) { toast("Marcá primero el tiempo de la 1ª línea"); return; }
    const t = first.t, a = parseTime(s.startTime);
    if (t === a) { toast("El inicio ya coincide con la 1ª línea"); return; }
    snapshot("ajustar inicio a letra");
    const segs = sorted();
    const idx = segs.findIndex((x) => x.id === s.id);
    const prev = idx > 0 ? segs[idx - 1] : null;
    s.startTime = fmtTime(t); if (s.clipStart != null) s.clipStart = t;
    if (prev) { prev.endTime = fmtTime(t); if (prev.clipEnd != null) prev.clipEnd = t; persistSegment(prev, true); }
    persistSegment(s, true);
    renderMain();
    toast("Inicio del bloque ajustado a " + fmtTime(t));
  }

  function beatsField(s) {
    const d = h("div", { class: "fg beats-fg" });
    d.appendChild(h("label", {}, "Momentos jugables — el tap modifica la acción"));
    d.appendChild(h("div", { class: "beats-hint" }, "Cada momento: qué nota se tapea y qué pasa en cada resultado — Golden, Good y Miss."));
    const list = h("div", { class: "beatlist" });
    (s.beats || []).forEach((b, i) => list.appendChild(beatCard(s, b, i)));
    d.appendChild(list);
    const add = h("button", { class: "beat-add" }, "+ Agregar momento jugable");
    add.addEventListener("click", () => {
      s.beats = s.beats || [];
      s.beats.push({ cue: "", onPerfect: "", onHit: "", onMiss: "" });
      persistSegment(s, true); renderDrawer(); renderMain();
    });
    d.appendChild(add);
    return d;
  }
  function beatCard(s, b, i) {
    const c = h("div", { class: "beatcard" });
    const rm = h("button", { class: "rm", title: "Quitar momento" }, "×");
    rm.addEventListener("click", () => { s.beats.splice(i, 1); persistSegment(s, true); renderDrawer(); renderMain(); });
    c.appendChild(rm);

    const cue = h("input", { type: "text", class: "bcue", placeholder: "Cue / nota — ej: nota de salto en el beat fuerte" });
    cue.value = b.cue || "";
    cue.addEventListener("input", (e) => { b.cue = e.target.value; persistSegment(s); });
    c.appendChild(cue);

    const io = h("div", { class: "io" });
    const mkState = (cls, label, field, ph) => {
      const box = h("div", { class: cls });
      box.appendChild(h("label", {}, label));
      const ta = h("textarea", { placeholder: ph });
      ta.value = b[field] || "";
      ta.addEventListener("input", (e) => { b[field] = e.target.value; persistSegment(s); });
      box.appendChild(ta);
      return box;
    };
    io.appendChild(mkState("perfect", "Golden", "onPerfect", "Ejecución perfecta: efecto dorado, bonus visual, la coreografía llega a su punto máximo"));
    io.appendChild(mkState("hit", "Good", "onHit", "Acierto correcto: sigue bailando sin perder el flow"));
    io.appendChild(mkState("miss", "Miss", "onMiss", "Falla: se tropieza levemente y se recupera, retomando la coreografía"));
    c.appendChild(io);
    return c;
  }

  /* ---------------- CRUD ---------------- */
  function addSegment() {
    const segs = sorted(); const last = segs[segs.length - 1];
    const start = last ? parseTime(last.endTime) : 0;
    const id = nextId();
    const s = Object.assign(seed().segments[0], {
      id, startTime: fmtTime(start), endTime: fmtTime(start + 5),
      musicalCue: "", lyric: "[LYRIC TO ADD]", status: "idea",
      narrativeAction: "", characterAction: "", camera: "", playerAction: "",
      environmentInteraction: "", visualFX: "", transition: "", productionNotes: "", storyBeat: "",
      beats: [], sectionType: "", storyboard: "", gameplayMode: "", worldState: "normal",
      narrativeStage: last ? last.narrativeStage : "desire_insecurity",
      location: last ? last.location : "", timeOfDay: last ? last.timeOfDay : "night",
    });
    data.segments.push(s);
    persistSegment(s, true);
    openDrawer(id);
    toast("Bloque agregado");
  }
  function duplicateSegment(id) {
    const i = data.segments.findIndex((x) => x.id === id); if (i === -1) return;
    snapshot("duplicar bloque");
    const clone = JSON.parse(JSON.stringify(data.segments[i])); clone.id = nextId();
    data.segments.push(clone);
    persistSegment(clone, true);
    openDrawer(clone.id); toast("Bloque duplicado");
  }
  function deleteSegment(id) {
    const s = data.segments.find((x) => x.id === id); if (!s) return;
    if (!confirm(`¿Borrar el bloque ${s.startTime}–${s.endTime}?`)) return;
    snapshot("borrar bloque");
    data.segments = data.segments.filter((x) => x.id !== id);
    persistDelete(id); closeDrawer(); toast("Bloque borrado");
  }
  function splitSegmentAt(id, at) {
    const s = data.segments.find((x) => x.id === id); if (!s) return;
    const a = parseTime(s.startTime), b = parseTime(s.endTime);
    if (b - a < 2) { toast("Bloque muy corto para dividir"); return; }
    at = Math.round(at);
    if (at <= a || at >= b) { toast("El corte tiene que estar dentro del bloque"); return; }
    snapshot("dividir bloque");
    const clone = JSON.parse(JSON.stringify(s)); clone.id = nextId();
    clone.startTime = fmtTime(at); clone.endTime = fmtTime(b); clone.storyBeat = "";
    // si hay un video, la segunda mitad arranca desde el punto de corte dentro del clip
    if (clone.storyboard && isVideo(clone.storyboard)) {
      const srcCut = (s.clipStart || 0) + (at - a);
      clone.clipStart = srcCut;   // la 2da mitad arranca el clip en el corte (clone.clipEnd ya viene copiado = fin original)
      s.clipEnd = srcCut;         // la 1ra mitad termina el clip en el corte
    }
    // dividir la letra en el punto de corte, sin duplicarla
    if (isRealLyric(s.lyric)) {
      const parsed = parseLyric(s.lyric);
      let idx;
      if (parsed.some((l) => l.t != null)) {
        // usar los timecodes por línea: cada frase va al bloque según su tiempo
        let last = a;
        const eff = parsed.map((l) => { if (l.t != null) last = l.t; return last; });
        idx = eff.findIndex((t) => t >= at);
        if (idx === -1) idx = parsed.length;
      } else {
        // sin tiempos: reparto proporcional por cantidad de líneas
        idx = Math.round(((at - a) / (b - a)) * parsed.length);
      }
      idx = Math.max(0, Math.min(parsed.length, idx));
      s.lyric = fmtLyric(parsed.slice(0, idx)).replace(/\s+$/, "");
      clone.lyric = fmtLyric(parsed.slice(idx)).replace(/^\s+/, "");
    }
    s.endTime = fmtTime(at);
    data.segments.push(clone);
    persistSegment(s, true); persistSegment(clone, true);
    // los bloques quedan colapsados; para editarlos se despliegan con la flechita
    renderMain(); toast("Bloque dividido en " + fmtTime(at));
  }
  function splitSegment(id) {
    const s = data.segments.find((x) => x.id === id); if (!s) return;
    const a = parseTime(s.startTime), b = parseTime(s.endTime);
    if (b - a < 2) { toast("Bloque muy corto para dividir"); return; }
    const ans = prompt(`¿En qué tiempo dividir el bloque? (MM:SS)\nTiene que estar entre ${s.startTime} y ${s.endTime}`, fmtTime(Math.round((a + b) / 2)));
    if (ans == null) return;
    splitSegmentAt(id, parseTime(ans));
  }
  function moveSegment(id, dir) {
    const segs = sorted(); const pos = segs.findIndex((x) => x.id === id); const t = pos + dir;
    if (t < 0 || t >= segs.length) return;
    snapshot("mover bloque");
    const a = segs[pos], b = segs[t];
    const as = a.startTime, ae = a.endTime; a.startTime = b.startTime; a.endTime = b.endTime; b.startTime = as; b.endTime = ae;
    persistSegment(a, true); persistSegment(b, true);
    renderMain(); renderDrawer();
  }

  /* ---------------- Export / Import / Reset ---------------- */
  function exportJSON() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `golden-script-${data.meta.version}-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url); toast("Export listo");
  }
  /* ---------- Export para Arte (solo info de escenarios) ---------- */
  function download(name, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  }
  // Referencia de storyboard sin volcar base64 gigante en el archivo.
  function sbRef(v) {
    if (!v) return "";
    if (v.indexOf("data:") === 0) return "(archivo subido en la app)";
    return v;
  }
  // Agrupa las escenas por escenario/locación, en orden de tiempo.
  function groupByEscenario() {
    const segs = data.segments.slice().sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
    const groups = [], idx = {};
    segs.forEach((s) => {
      const name = (s.location || "").trim();
      const key = name || "__sin_definir__";
      if (!(key in idx)) { idx[key] = groups.length; groups.push({ location: name, scenes: [] }); }
      groups[idx[key]].scenes.push(s);
    });
    return groups;
  }
  // Campos que le sirven a Arte para diseñar (sin gameplay, letra ni beats).
  function arteFields(s) {
    return [
      ["Acción narrativa", s.narrativeAction],
      ["Acción del personaje", s.characterAction],
      ["Cámara", s.camera],
      ["Interacción con el entorno", s.environmentInteraction],
      ["FX visuales", s.visualFX],
      ["Transición", s.transition],
      ["Beat narrativo", s.storyBeat],
      ["Notas de producción", s.productionNotes],
      ["Storyboard / referencia", sbRef(s.storyboard)],
    ].filter(([, v]) => v && String(v).trim());
  }
  function uniqLabels(scenes, list, field) {
    const out = [];
    scenes.forEach((s) => { const l = labelOf(list, s[field]); if (l && out.indexOf(l) === -1) out.push(l); });
    return out;
  }
  function arteData() {
    const groups = groupByEscenario();
    return {
      documento: "GOLDEN — Brief de escenarios para Arte",
      exportado: new Date().toISOString(),
      cancion: { titulo: data.meta.title, duracion: data.meta.songDuration, version: data.meta.version },
      nota: "Solo información visual/narrativa para diseño. Sin datos de gameplay ni letra.",
      escenarios: groups.map((g) => ({
        escenario: g.location || "(sin definir)",
        momentosDelDia: uniqLabels(g.scenes, TOD, "timeOfDay"),
        estadosDelMundo: uniqLabels(g.scenes, WS, "worldState"),
        etapasNarrativas: uniqLabels(g.scenes, STAGES, "narrativeStage"),
        rangoTiempo: g.scenes[0].startTime + "–" + g.scenes[g.scenes.length - 1].endTime,
        escenas: g.scenes.map((s) => {
          const o = { desde: s.startTime, hasta: s.endTime };
          arteFields(s).forEach(([k, v]) => { o[k] = v; });
          return o;
        }),
      })),
    };
  }
  function arteMarkdown(a) {
    const L = [];
    L.push("# " + a.documento, "");
    L.push("> Exportado " + a.exportado.slice(0, 10) + " · " + a.cancion.titulo + " " + a.cancion.version + " · duración " + a.cancion.duracion);
    L.push("> " + a.nota, "");
    L.push("**Escenarios:** " + a.escenarios.length + "  ·  **Escenas:** " + a.escenarios.reduce((n, g) => n + g.escenas.length, 0), "");
    a.escenarios.forEach((g, i) => {
      L.push("---", "");
      L.push("## " + (i + 1) + ". " + g.escenario, "");
      if (g.momentosDelDia.length) L.push("- **Momento del día:** " + g.momentosDelDia.join(", "));
      if (g.estadosDelMundo.length) L.push("- **Estado del mundo:** " + g.estadosDelMundo.join(" → "));
      if (g.etapasNarrativas.length) L.push("- **Etapa narrativa:** " + g.etapasNarrativas.join(", "));
      L.push("- **Escenas:** " + g.escenas.length + " (" + g.rangoTiempo + ")", "");
      L.push("### Escenas", "");
      g.escenas.forEach((sc) => {
        L.push("#### " + sc.desde + "–" + sc.hasta);
        const keys = Object.keys(sc).filter((k) => k !== "desde" && k !== "hasta");
        if (!keys.length) L.push("- _(sin detalles visuales todavía)_");
        else keys.forEach((k) => L.push("- **" + k + ":** " + sc[k]));
        L.push("");
      });
    });
    return L.join("\n");
  }
  function exportArte() {
    const a = arteData();
    const stamp = new Date().toISOString().slice(0, 10);
    const base = "golden-escenarios-arte-" + a.cancion.version + "-" + stamp;
    download(base + ".md", arteMarkdown(a), "text/markdown");
    download(base + ".json", JSON.stringify(a, null, 2), "application/json");
    toast("Export para Arte listo (.md + .json)");
  }

  function importJSON() {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "application/json,.json";
    inp.addEventListener("change", () => {
      const file = inp.files[0]; if (!file) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const p = JSON.parse(r.result); if (!p.segments) throw 0;
          if (!confirm("Importar reemplaza el documento actual. ¿Seguir?")) return;
          data = p; if (!data.meta) data.meta = seed().meta;
          normalizeAll();
          ui.openId = null; persistBulk(); renderAll(); toast("Importado");
        } catch (e) { toast("Archivo JSON inválido"); }
      };
      r.readAsText(file);
    });
    inp.click();
  }
  function resetData() {
    if (!confirm("¿Resetear a los primeros 30s de ejemplo? Se pierde el trabajo actual.")) return;
    data = seed(); ui.openId = null; persistBulk(); renderAll(); toast("Reset listo");
  }

  /* ---------------- Boot ---------------- */
  async function boot() {
    // global click closes menu
    document.addEventListener("click", () => { const m = el("menu"); if (m) m.classList.remove("open"); });
    el("overlay").addEventListener("click", () => {
      const dr = el("drawer");
      if (dr.classList.contains("help-modal")) closeHelp();
      else if (dr.classList.contains("choreo-modal")) closeChoreo();
      else if (dr.classList.contains("sync-modal")) closeLyricSync();
      else closeDrawer();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const dr = el("drawer");
      if (dr.classList.contains("help-modal")) closeHelp();
      else if (dr.classList.contains("choreo-modal")) closeChoreo();
      else if (dr.classList.contains("sync-modal")) closeLyricSync();
      else if (ui.openId) closeDrawer();
    });

    if (Sync.init()) {
      try {
        const remote = await Sync.loadAll();
        if (remote.segments.length === 0) { const sd = seed(); await Sync.seedAll(sd); data = sd; }
        else { data.segments = remote.segments; data.meta = remote.meta || seed().meta; }
        Sync.subscribe();
      } catch (e) {
        toast("No se pudo conectar a Supabase — modo local");
        Sync.enabled = false; loadLocal();
      }
    } else {
      loadLocal();
    }
    normalizeAll();
    migrateGpOnce();
    renderAll();
  }
  function loadLocal() {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const p = JSON.parse(raw); if (p && p.segments) { data = p; return; } } } catch (e) {}
    data = seed();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
