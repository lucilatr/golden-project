/* ============================================================
   GOLDEN — Production Hub (navegación + Resumen + Tracker)
   Vive al lado del Script (app.js). Datos propios en Supabase
   (tabla tracker_items) o localStorage como fallback.
   ============================================================ */
(function () {
  "use strict";

  const CFG = window.GOLDEN_CONFIG || {};
  const DOC = CFG.docId || "golden";
  const LS_KEY = "golden_tracker_v1";

  /* ---------------- Catálogos ---------------- */
  const TEAM = [
    { id: "fh", name: "Federico Heller",  initials: "FH", color: "#4bb3c4", role: "Director", dept: "" },
    { id: "st", name: "Santiago Tereso",  initials: "ST", color: "#d9a441", role: "Producción", dept: "narrativa" },
    { id: "lt", name: "Lucila Trobbiani", initials: "LT", color: "#d9a441", role: "Producción", dept: "narrativa" },
    { id: "pa", name: "Pablo Altamiranda",initials: "PA", color: "#b5479b", role: "Lead Dev · Gameplay / integración", dept: "gameplay" },
    { id: "lm", name: "Lucas Mallo",      initials: "LM", color: "#b5479b", role: "Dev · Gameplay / UI", dept: "gameplay" },
    { id: "ls", name: "Lautaro Schipizza",initials: "LS", color: "#8b5cf6", role: "Arte + Lead 3D", dept: "concept" },
    { id: "be", name: "Belén",            initials: "BE", color: "#8b5cf6", role: "3D Artist", dept: "3d" },
    { id: "ga", name: "Gastón",           initials: "GA", color: "#8b5cf6", role: "3D Artist", dept: "3d" },
    { id: "mm", name: "Mauricio Medina",  initials: "MM", color: "#8b5cf6", role: "VFX Artist", dept: "animacion" },
    { id: "ac", name: "Andrés Chuhy",     initials: "AC", color: "#8b5cf6", role: "Artist", dept: "concept" },
  ];
  const member = (id) => TEAM.find((m) => m.id === id) || null;

  const DEPTS = [
    { id: "concept",   ico: "🎨", label: "Concept" },
    { id: "3d",        ico: "🧊", label: "3D" },
    { id: "animacion", ico: "🎞️", label: "Animación" },
    { id: "vfx",       ico: "✨", label: "VFX" },
    { id: "narrativa", ico: "🎬", label: "Narrativa / Guion" },
    { id: "gameplay",  ico: "🎮", label: "Gameplay / Charting" },
    { id: "ui",        ico: "📺", label: "UI de TV + Control" },
    { id: "audio",     ico: "🎵", label: "Audio" },
    { id: "qa",        ico: "✅", label: "QA / Entrega Netflix" },
  ];

  // Escenas del Script (se cargan de la tabla segments)
  let scenes = [];

  // Milestones de Netflix (del calendario de Santiago)
  const CAL_URL = "https://santiagotereso.github.io/rhythm-mode-schedule/";
  const MILESTONES = [
    { date: "2026-10-02", label: "M1 delivery", desc: "Entregables de pre-producción" },
    { date: "2026-10-09", label: "M1 aceptado", desc: "Arranca la fase de build" },
    { date: "2026-11-05", label: "Milestone 1", desc: "Build intermedio + deep dive con Netflix" },
    { date: "2026-12-03", label: "Milestone 2", desc: "Segundo build intermedio. Deep dive" },
    { date: "2026-12-11", label: "Entrega final", desc: "Build + source + assets + docs" },
    { date: "2027-01-02", label: "Deadline contrato", desc: "3 meses desde M1" },
  ];

  const STATUS = [
    { id: "brief",     label: "Brief",       cls: "c-brief" },
    { id: "dev",       label: "En progreso", cls: "c-dev" },
    { id: "review",    label: "Review",      cls: "c-rev" },
    { id: "approved",  label: "Aprobado",    cls: "c-app" },
    { id: "delivered", label: "Entregado",   cls: "c-deliv" },
  ];
  const st = (id) => STATUS.find((s) => s.id === id) || STATUS[0];

  /* ---------------- Estado ---------------- */
  let data = { tasks: [], scenarios: [], meta: {} };
  const ui = {
    view: "resumen",
    editable: localStorage.getItem("golden_edit") === "1",
    filterPerson: "",
    filterDept: "",
  };

  // Secciones colapsadas (preferencia por navegador)
  const COLLAPSE_KEY = "golden_collapsed";
  let collapsed = {};
  try { collapsed = JSON.parse(localStorage.getItem(COLLAPSE_KEY) || "{}") || {}; } catch (e) { collapsed = {}; }
  function toggleCollapse(id) {
    collapsed[id] = !collapsed[id];
    try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsed)); } catch (e) {}
    renderTracker();
  }

  /* ---------------- Helpers DOM ---------------- */
  const el = (id) => document.getElementById(id);
  function h(tag, attrs, kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k.slice(0, 2) === "on" && typeof attrs[k] === "function") n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null && attrs[k] !== false) n.setAttribute(k, attrs[k]);
    }
    if (kids != null) (Array.isArray(kids) ? kids : [kids]).forEach((c) => {
      if (c == null) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function uid(p) { return (p || "it") + "-" + Math.random().toString(36).slice(2, 8); }
  let toastT;
  function toast(msg) {
    let t = el("hub-toast");
    if (!t) { t = h("div", { class: "hub-toast", id: "hub-toast" }); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600);
  }
  async function sha256hex(s) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /* ---------------- Supabase ---------------- */
  const Sync = {
    sb: null, enabled: false,
    init() {
      if (CFG.supabaseUrl && CFG.supabaseAnonKey && typeof window.supabase !== "undefined") {
        try { this.sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey); this.enabled = true; }
        catch (e) { this.enabled = false; }
      }
      return this.enabled;
    },
    async loadAll() {
      const { data: rows, error } = await this.sb.from("tracker_items").select("*").eq("doc_id", DOC).order("pos", { ascending: true });
      if (error) throw error;
      const out = { tasks: [], scenarios: [], meta: {} };
      (rows || []).forEach((r) => {
        if (r.kind === "task") out.tasks.push(r.data);
        else if (r.kind === "scenario") out.scenarios.push(r.data);
        else if (r.kind === "meta") out.meta = r.data || {};
      });
      return { rows: rows || [], parsed: out };
    },
    async seed(seedData) {
      const rows = [];
      seedData.tasks.forEach((t, i) => rows.push({ id: t.id, doc_id: DOC, kind: "task", pos: i, data: t }));
      seedData.scenarios.forEach((s, i) => rows.push({ id: s.id, doc_id: DOC, kind: "scenario", pos: i, data: s }));
      rows.push({ id: "meta", doc_id: DOC, kind: "meta", pos: 0, data: seedData.meta });
      await this.sb.from("tracker_items").upsert(rows);
    },
    push(kind, id, obj, pos) {
      this.sb.from("tracker_items").upsert({ id, doc_id: DOC, kind, pos: pos || 0, data: obj })
        .then(({ error }) => { if (error) toast("No se pudo guardar"); }, () => toast("No se pudo guardar"));
    },
    del(id) { this.sb.from("tracker_items").delete().eq("id", id).then(() => {}, () => {}); },
    async clearItems() { await this.sb.from("tracker_items").delete().eq("doc_id", DOC).neq("kind", "meta"); },
    async loadScenes() {
      try {
        const { data: rows } = await this.sb.from("segments").select("id,data,pos").eq("doc_id", DOC).order("pos", { ascending: true });
        // Nombre corto del espacio físico de cada escena del Script
        const PLACE = { "scene-008": "Seúl noche", "scene-001": "Seúl día", "scene-002": "Subte", "scene-003": "Cielo",
          "scene-004": "Cristal", "scene-005": "Formaciones", "scene-006": "Derrumbe",
          "scene-007": "Oro", "scene-009": "Mega escenario" };
        const STAGE_SHORT = { desire_insecurity: "Deseo", transformation: "Transformación", golden: "Consagración" };
        return (rows || []).map((r) => {
          const range = (r.data.startTime || "") + "–" + (r.data.endTime || "");
          const stage = STAGE_SHORT[r.data.narrativeStage] ? " · " + STAGE_SHORT[r.data.narrativeStage] : "";
          const cue = r.data.musicalCue ? " " + r.data.musicalCue : "";
          const loc = (r.data.location || "").split(/[.:(—]/)[0].trim();
          const place = PLACE[r.id] || (loc.length > 28 ? loc.slice(0, 26) + "…" : loc) || range;
          return { id: r.id, label: place, detail: (range + stage + cue).trim() };
        });
      } catch (e) { return []; }
    },
    subscribe() {
      this.sb.channel("rt-tracker")
        .on("postgres_changes", { event: "*", schema: "public", table: "tracker_items", filter: "doc_id=eq." + DOC }, () => this.refresh())
        .subscribe();
    },
    _busy: false,
    async refresh() {
      if (this._busy) return;
      // no pisar mientras el usuario escribe en un campo
      if (document.activeElement && document.activeElement.isContentEditable) return;
      try { const { parsed } = await this.loadAll(); data = parsed; renderCurrent(); } catch (e) {}
    },
    async uploadThumb(file, scenarioId) {
      const bucket = CFG.thumbBucket || "tracker-thumbs";
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = DOC + "/" + scenarioId + "-" + Date.now() + "." + ext;
      const { error } = await this.sb.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      return this.sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    },
  };

  /* ---------------- Persistencia ---------------- */
  function saveLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (e) {} }
  function posOf(kind, obj) {
    const arr = kind === "task" ? data.tasks : data.scenarios;
    const i = arr.indexOf(obj); return i < 0 ? arr.length : i;
  }
  function persistTask(t) { if (Sync.enabled) Sync.push("task", t.id, t, posOf("task", t)); else saveLocal(); }
  function persistScenario(s) { if (Sync.enabled) Sync.push("scenario", s.id, s, posOf("scenario", s)); else saveLocal(); }
  function persistMeta() { if (Sync.enabled) Sync.push("meta", "meta", data.meta, 0); else saveLocal(); }
  function persistDeleteTask(t) { data.tasks = data.tasks.filter((x) => x !== t); if (Sync.enabled) Sync.del(t.id); else saveLocal(); }
  function persistDeleteScenario(s) { data.scenarios = data.scenarios.filter((x) => x !== s); if (Sync.enabled) Sync.del(s.id); else saveLocal(); }

  /* ---------------- Candado de edición ---------------- */
  function editable() { return ui.editable; }
  function applyMode() { document.body.classList.toggle("hub-ro", !ui.editable); }
  async function toggleLock() {
    if (ui.editable) { ui.editable = false; localStorage.removeItem("golden_edit"); applyMode(); renderBrand(); renderCurrent(); return; }
    const k = prompt("Clave de edición:");
    if (k == null) return;
    const hash = await sha256hex(k);
    if (CFG.editKeyHash && hash !== CFG.editKeyHash) { toast("Clave incorrecta"); return; }
    ui.editable = true; localStorage.setItem("golden_edit", "1"); applyMode(); renderBrand(); renderCurrent();
    toast("Edición desbloqueada");
  }

  /* ---------------- Seed inicial ---------------- */
  function seed() {
    const T = (id, dept, title, assignee, status, target) => ({ id, dept, title, assignee, status, netflix: target === "Entrega Netflix" });
    return {
      meta: {
        weekObjective: "Avanzar el sistema de puntaje y pulir el HUD de juego en TV",
        weekDate: "Semana del 20 al 24 oct",
        deliveryObjective: "Vertical slice jugable — primeros 0:30 de la canción en TV + control (build a Netflix)",
        deliveryDate: "Viernes 27 oct 2026",
        calendarUrl: "",
      },
      tasks: [
        T("t-nar1", "narrativa", "Beats narrativos 0:00–0:30 · Seúl noche", "lt", "approved", "Entrega Netflix"),
        T("t-nar2", "narrativa", "Arco de identidad demoníaca · setup", "lt", "dev", "Avance juego"),
        T("t-gp1", "gameplay", "Mapeo de notas 0:00–0:15 · la rueda", "pa", "approved", "Entrega Netflix"),
        T("t-gp2", "gameplay", "Charting de la rueda · bloque 0:15–0:22", "pa", "dev", "Entrega Netflix"),
        T("t-gp3", "gameplay", "Niveles de dificultad · easy / normal / hard", "pa", "brief", "Avance juego"),
        T("t-au1", "audio", "Stems de la canción · sync a 3:14", "", "review", "Entrega Netflix"),
        T("t-au2", "audio", "SFX de tapeo / hit / miss", "", "brief", "Entrega Netflix"),
        T("t-ui1", "ui", "Lobby / pantalla de inicio (TV)", "lm", "approved", "Entrega Netflix"),
        T("t-ui2", "ui", "HUD de juego (TV) · rueda + score + combo", "lm", "dev", "Entrega Netflix"),
        T("t-ui3", "ui", "Control remoto · vista de tapeo (celular)", "lm", "dev", "Entrega Netflix"),
        T("t-qa1", "qa", "Guía de testeo (VPN + build)", "lt", "delivered", "Entrega Netflix"),
        T("t-qa2", "qa", "Build vertical slice en VPN", "pa", "dev", "Entrega Netflix"),
        T("t-qa3", "qa", "Specs de entrega Netflix · resolución / framerate", "lt", "brief", "Entrega Netflix"),
      ],
      scenarios: [
        { id: "sc-1", name: "Seúl noche · Bukchon", note: "intro · 0:00–0:30", thumbUrl: "", conceptStatus: "approved", conceptAssignee: "ls", modelStatus: "dev", modelAssignee: "be", netflix: true },
        { id: "sc-2", name: "Namsan Tower", note: "estribillo", thumbUrl: "", conceptStatus: "approved", conceptAssignee: "ls", modelStatus: "dev", modelAssignee: "ls", netflix: true },
        { id: "sc-3", name: "Golden City", note: "consagración", thumbUrl: "", conceptStatus: "review", conceptAssignee: "ga", modelStatus: "brief", modelAssignee: "", netflix: false },
        { id: "sc-4", name: "Demon Realm", note: "puente", thumbUrl: "", conceptStatus: "dev", conceptAssignee: "ls", modelStatus: "brief", modelAssignee: "", netflix: false },
      ],
    };
  }

  /* ============================================================
     NAVEGACIÓN / SHELL
     ============================================================ */
  function renderBrand() {
    const host = el("hub-brand"); if (!host) return; host.innerHTML = "";
    host.appendChild(h("h1", {}, "GOLDEN"));
    host.appendChild(h("span", { class: "sub" }, "✦ Production Hub"));
    host.appendChild(h("span", { class: "spacer" }));
    host.appendChild(h("span", { class: "hub-pill " + (Sync.enabled ? "live" : "") }, [
      h("span", { class: "dot" }), Sync.enabled ? "Online · en vivo" : "Local",
    ]));
    const ident = h("span", { class: "hub-ident" });
    ident.appendChild(h("span", { class: "mode-pill state " + (ui.editable ? "edit" : "ro") }, ui.editable ? "✎ EDICIÓN" : "👁 SOLO LECTURA"));
    ident.appendChild(h("button", { class: "mode-pill edit", onclick: toggleLock }, ui.editable ? "🔓 Bloquear" : "🔒 Editar"));
    host.appendChild(ident);
  }

  const TABS = [
    { id: "resumen", label: "◱ Resumen" },
    { id: "script",  label: "♪ Script", done: true },
    { id: "tracker", label: "▦ Tracker" },
    { id: "cal",     label: "▤ Calendario" },
    { id: "guia",    label: "⎙ Guía de testeo", done: true },
  ];
  function renderTabs() {
    const host = el("hub-tabs"); if (!host) return; host.innerHTML = "";
    TABS.forEach((t) => {
      const b = h("button", { class: "hub-tab" + (ui.view === t.id ? " active" : "") }, [document.createTextNode(t.label)]);
      if (t.id === "tracker") b.appendChild(h("span", { class: "tcount" }, String(data.tasks.length + data.scenarios.length)));
      if (t.done) b.appendChild(h("span", { class: "tcount done" }, "✓"));
      b.addEventListener("click", () => show(t.id));
      host.appendChild(b);
    });
  }
  function show(view) {
    ui.view = view;
    document.querySelectorAll(".hub-view").forEach((v) => v.classList.remove("active"));
    const sec = el("view-" + view); if (sec) sec.classList.add("active");
    renderTabs();
    renderCurrent();
    if (view === "script") { try { window.dispatchEvent(new Event("resize")); } catch (e) {} }
    window.scrollTo(0, 0);
  }
  function renderCurrent() {
    if (ui.view === "resumen") renderResumen();
    else if (ui.view === "tracker") renderTracker();
    else if (ui.view === "cal") renderCal();
  }

  /* ============================================================
     RESUMEN
     ============================================================ */
  function editField(value, onSave, cls, multiline) {
    const n = h("div", { class: (cls || "") + " editable-field" + (multiline ? " ml" : "") }, value || "");
    n.contentEditable = ui.editable ? "true" : "false";
    if (ui.editable) {
      n.addEventListener("blur", () => { const v = (multiline ? n.innerText : n.textContent).replace(/\n{3,}/g, "\n\n").replace(/\s+$/, "").replace(/^\s+/, ""); onSave(v); });
      // en fechas (una línea) Enter cierra; en objetivos (multilínea) Enter agrega línea
      if (!multiline) n.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); n.blur(); } });
    }
    return n;
  }
  function renderResumen() {
    const host = el("view-resumen"); if (!host) return; host.innerHTML = "";
    const m = data.meta;

    // Objetivo de la semana — a lo ancho, editable a mano (multilínea)
    const banner = h("div", { class: "next-banner" });
    const col = h("div", { style: "flex:1;min-width:0" });
    col.appendChild(h("div", { class: "nb-label" }, [document.createTextNode("🗓 Objetivo de la semana "),
      ...(ui.editable ? [h("span", { class: "edit-only", style: "font-size:10px;color:var(--text-dim);text-transform:none;letter-spacing:0" }, "✎ editable")] : [])]));
    col.appendChild(editField(m.weekObjective, (v) => { m.weekObjective = v; persistMeta(); }, "nb-obj", true));
    const wd = h("div", { class: "nb-date" }); wd.appendChild(document.createTextNode("📅 "));
    wd.appendChild(editField(m.weekDate, (v) => { m.weekDate = v; persistMeta(); }, ""));
    col.appendChild(wd);
    banner.appendChild(col);
    host.appendChild(banner);

    // Apuntan a la próxima entrega (tildadas Netflix) — arrastrables por prioridad
    const nf = h("div", { class: "block", style: "margin-bottom:18px" });
    nf.appendChild(h("h3", { html: '🎯 Tareas que apuntan a la próxima entrega <small style="color:var(--text-dim);font-weight:400;font-family:var(--mono);font-size:11px">· Build' + (ui.editable ? " · arrastrá para ordenar por prioridad" : "") + '</small>' }));
    const nfList = [];
    data.tasks.forEach((t) => { if (t.netflix) nfList.push(t); });
    data.scenarios.forEach((s) => { if (s.netflix) nfList.push(s); });
    nfList.sort((a, b) => (a.pri == null ? 9999 : a.pri) - (b.pri == null ? 9999 : b.pri));
    if (!nfList.length) nf.appendChild(h("div", { class: "mini-empty" }, "Todavía no marcaste tareas para la entrega de Netflix. Tildá la casilla “Build” en el Tracker."));
    let dragIdx = null;
    nfList.forEach((obj, idx) => {
      const isTask = ("title" in obj);
      const who = isTask ? obj.assignee : (obj.modelAssignee || obj.conceptAssignee);
      const what = isTask ? obj.title : (obj.name + " · escenario");
      const stat = isTask ? obj.status : obj.modelStatus;
      const mm = member(who); const sdef = st(stat);
      const row = h("div", { class: "mini-row" + (ui.editable ? " nf-drag" : "") }, [
        ...(ui.editable ? [h("span", { class: "drag-handle", title: "Arrastrá para reordenar" }, "⠿")] : []),
        h("span", { class: "who", style: "background:" + (mm ? mm.color : "#3a4152") }, mm ? mm.initials : "—"),
        h("div", { class: "txt" }, [document.createTextNode(what), h("small", {}, mm ? mm.name : "Sin asignar")]),
        h("span", { class: "chip " + sdef.cls }, sdef.label.toUpperCase()),
      ]);
      if (ui.editable) {
        row.setAttribute("draggable", "true");
        row.addEventListener("dragstart", (e) => { dragIdx = idx; row.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; });
        row.addEventListener("dragend", () => row.classList.remove("dragging"));
        row.addEventListener("dragover", (e) => { e.preventDefault(); });
        row.addEventListener("drop", (e) => {
          e.preventDefault();
          if (dragIdx == null || dragIdx === idx) return;
          const moved = nfList.splice(dragIdx, 1)[0];
          nfList.splice(idx, 0, moved);
          nfList.forEach((o, i) => { o.pri = i; if ("title" in o) persistTask(o); else persistScenario(o); });
          dragIdx = null; renderResumen();
        });
      }
      nf.appendChild(row);
    });
    host.appendChild(nf);

    const grid = h("div", { class: "two-col" });

    // En qué está cada uno ahora (En progreso), SIN las de la build (ya están arriba)
    const ob = h("div", { class: "block" });
    ob.appendChild(h("h3", {}, "🔄 En qué está cada uno ahora"));
    const ongoing = [];
    data.tasks.filter((t) => t.status === "dev" && !t.netflix).forEach((t) => ongoing.push({ who: t.assignee, what: t.title }));
    if (!ongoing.length) ob.appendChild(h("div", { class: "mini-empty" }, "Nadie marcado “En progreso” (sin contar las de la build)."));
    ongoing.forEach((o) => {
      const mm = member(o.who);
      ob.appendChild(h("div", { class: "mini-row" }, [
        h("span", { class: "who", style: "background:" + (mm ? mm.color : "#3a4152") }, mm ? mm.initials : "—"),
        h("div", { class: "txt" }, [document.createTextNode(mm ? mm.name : "Sin asignar"), h("small", {}, o.what)]),
        h("span", { class: "chip c-dev" }, "EN PROGRESO"),
      ]));
    });
    grid.appendChild(ob);

    // Para Dirección: tareas en Brief y Review (para hacer briefs y dar reviews)
    const rv = h("div", { class: "block" });
    rv.appendChild(h("h3", { html: '📋 Para revisar / aprobar <small style="color:var(--text-dim);font-weight:400;font-family:var(--mono);font-size:11px">· briefs y reviews (Dirección)</small>' }));
    const toReview = data.tasks.filter((t) => t.status === "brief" || t.status === "review");
    if (!toReview.length) rv.appendChild(h("div", { class: "mini-empty" }, "Nada pendiente de brief o review."));
    toReview.forEach((t) => {
      const mm = member(t.assignee); const sdef = st(t.status);
      rv.appendChild(h("div", { class: "mini-row" }, [
        h("span", { class: "who", style: "background:" + (mm ? mm.color : "#3a4152") }, mm ? mm.initials : "—"),
        h("div", { class: "txt" }, [document.createTextNode(t.title), h("small", {}, mm ? mm.name : "Sin asignar")]),
        h("span", { class: "chip " + sdef.cls }, sdef.label.toUpperCase()),
      ]));
    });
    grid.appendChild(rv);
    host.appendChild(grid);
  }

  /* ============================================================
     TRACKER
     ============================================================ */
  function statusCell(obj, field, persist) {
    if (!ui.editable) { const s = st(obj[field]); return h("span", { class: "chip " + s.cls }, s.label.toUpperCase()); }
    const sel = h("select", { class: "cell-edit" });
    STATUS.forEach((s) => { const o = h("option", { value: s.id }, s.label); if (obj[field] === s.id) o.selected = true; sel.appendChild(o); });
    sel.addEventListener("change", () => { obj[field] = sel.value; persist(); renderTracker(); });
    return sel;
  }
  function assigneeCell(obj, field, persist) {
    if (!ui.editable) {
      const mm = member(obj[field]);
      if (!mm) return h("span", { class: "deliv-tag" }, "—");
      return h("span", { class: "assignee" }, [h("span", { class: "avatar", style: "background:" + mm.color }, mm.initials), document.createTextNode(mm.name)]);
    }
    const sel = h("select", { class: "cell-edit" });
    sel.appendChild(h("option", { value: "" }, "— sin asignar"));
    TEAM.forEach((mm) => { const o = h("option", { value: mm.id }, mm.name); if (obj[field] === mm.id) o.selected = true; sel.appendChild(o); });
    sel.addEventListener("change", () => { obj[field] = sel.value; persist(); renderTracker(); });
    return sel;
  }
  function miniAssignee(obj, field, persist) {
    if (!ui.editable) { const mm = member(obj[field]); return mm ? h("span", { class: "mini-av", style: "background:" + mm.color, title: mm.name }, mm.initials) : h("span", { class: "deliv-tag" }, "—"); }
    return assigneeCell(obj, field, persist);
  }
  // Tilde "Build": la tarea entra en la próxima build (reemplaza a los tildes Netflix y Semana)
  function buildCell(obj, persist) {
    if (!ui.editable) return obj.netflix ? h("span", { class: "chip c-deliv" }, "BUILD") : h("span", { class: "deliv-tag" }, "—");
    const cb = h("input", { type: "checkbox" }); cb.checked = !!obj.netflix;
    cb.addEventListener("change", () => { obj.netflix = cb.checked; persist(); });
    return h("label", { class: "nf-check", title: "Entra en la próxima build" }, [cb]);
  }
  // Escena del Script a la que pertenece
  function sceneCell(obj, persist) {
    if (!ui.editable) { const sc = scenes.find((x) => x.id === obj.scene); return h("span", { class: "deliv-tag", title: sc ? sc.detail : "" }, sc ? sc.label : "—"); }
    const sel = h("select", { class: "cell-edit" });
    sel.appendChild(h("option", { value: "" }, "— escena"));
    scenes.forEach((sc) => { const o = h("option", { value: sc.id }, sc.label + (sc.detail ? " · " + sc.detail.split(" ")[0] : "")); if (obj.scene === sc.id) o.selected = true; sel.appendChild(o); });
    sel.addEventListener("change", () => { obj.scene = sel.value; persist(); });
    return sel;
  }
  function titleCell(obj, persist, withThumb) {
    const wrap = h("td", { class: "asset" });
    const title = h("div", { class: "title" }, obj.title != null ? obj.title : obj.name);
    title.contentEditable = ui.editable ? "true" : "false";
    if (ui.editable) title.addEventListener("blur", () => { const v = title.textContent.trim(); if ("title" in obj) obj.title = v; else obj.name = v; persist(); });
    if (withThumb) {
      const at = h("div", { class: "asset-thumb" });
      const thumb = obj.thumbUrl ? h("img", { class: "thumb", src: obj.thumbUrl, alt: "" }) : h("div", { class: "thumb empty" }, "＋");
      attachDrop(at, thumb, obj, persist);
      at.appendChild(thumb); at.appendChild(title); wrap.appendChild(at);
    } else {
      wrap.appendChild(title);
    }
    return wrap;
  }

  function renderTracker() {
    const host = el("view-tracker"); if (!host) return; host.innerHTML = "";
    host.appendChild(h("h2", { class: "sec" }, "Tracker de Producción — assets, responsables y estado"));

    // alta rápida de tareas (arriba de todo, solo en edición)
    if (ui.editable) {
      const qa = h("div", { class: "quick-add edit-only" });
      qa.appendChild(h("span", { class: "qa-label" }, "➕ Agregar tarea"));
      const titleInp = h("input", { type: "text", placeholder: "Escribí la tarea…" });
      const depSel = h("select", { title: "Departamento" });
      DEPTS.forEach((d) => depSel.appendChild(h("option", { value: d.id }, d.ico + "  " + d.label)));
      const whoSel = h("select", { title: "Responsable" });
      whoSel.appendChild(h("option", { value: "" }, "Responsable…"));
      TEAM.forEach((m) => whoSel.appendChild(h("option", { value: m.id }, m.name)));
      // al elegir persona, el departamento se autocompleta (igual se puede cambiar)
      whoSel.addEventListener("change", () => { const mm = member(whoSel.value); if (mm && mm.dept) depSel.value = mm.dept; });
      const stSel = h("select", { title: "Estado" });
      STATUS.forEach((s) => stSel.appendChild(h("option", { value: s.id }, s.label)));
      const add = () => {
        const title = titleInp.value.trim();
        if (!title) { titleInp.focus(); return; }
        const t = { id: uid("t"), dept: depSel.value, title, assignee: whoSel.value, status: stSel.value, netflix: false };
        data.tasks.push(t); persistTask(t);
        const d = (DEPTS.find((x) => x.id === depSel.value) || {}).label || "";
        toast("Tarea agregada en " + d); renderTracker();
      };
      const btn = h("button", { class: "btn-hub accent", onclick: add }, "Agregar");
      titleInp.addEventListener("keydown", (e) => { if (e.key === "Enter") add(); });
      qa.appendChild(titleInp); qa.appendChild(depSel); qa.appendChild(whoSel); qa.appendChild(stSel); qa.appendChild(btn);
      host.appendChild(qa);
    }

    // toolbar
    const tb = h("div", { class: "hub-toolbar" });
    const selP = h("select"); selP.appendChild(h("option", { value: "" }, "Persona: Todos"));
    TEAM.forEach((m) => { const o = h("option", { value: m.id }, m.name); if (ui.filterPerson === m.id) o.selected = true; selP.appendChild(o); });
    selP.addEventListener("change", () => { ui.filterPerson = selP.value; renderTracker(); });
    tb.appendChild(selP);
    const selD = h("select"); selD.appendChild(h("option", { value: "" }, "Departamento: Todos"));
    DEPTS.forEach((d) => { const o = h("option", { value: d.id }, d.label); if (ui.filterDept === d.id) o.selected = true; selD.appendChild(o); });
    selD.addEventListener("change", () => { ui.filterDept = selD.value; renderTracker(); });
    tb.appendChild(selD);
    if (ui.editable) tb.appendChild(h("button", { class: "btn-hub edit-only", onclick: clearAll, title: "Borrar todas las tareas" }, "🗑 Vaciar"));
    tb.appendChild(h("span", { class: "spacer" }));
    const legend = h("div", { class: "legend" });
    STATUS.forEach((s) => legend.appendChild(h("span", { class: "chip " + s.cls }, s.label.toUpperCase())));
    tb.appendChild(legend);
    host.appendChild(tb);

    const matchP = (ids) => !ui.filterPerson || ids.indexOf(ui.filterPerson) >= 0;

    DEPTS.forEach((d) => {
      if (ui.filterDept && ui.filterDept !== d.id) return;
      const tasks = data.tasks.filter((t) => t.dept === d.id && matchP([t.assignee]))
        .sort((a, b) => (a.pri == null ? 9999 : a.pri) - (b.pri == null ? 9999 : b.pri));
      if (ui.filterPerson && !tasks.length) return;
      const sec = h("div", { class: "dept" });
      const head = h("div", { class: "dept-head", onclick: (e) => { if (!e.target.closest("button")) toggleCollapse(d.id); } }, [
        h("span", { class: "caret" }, collapsed[d.id] ? "▸" : "▾"),
        h("span", { class: "ico" }, d.ico), h("h3", {}, d.label),
        h("span", { class: "count" }, String(tasks.length)), h("span", { class: "pline" }),
      ]);
      if (ui.editable) head.appendChild(h("button", { class: "btn-hub edit-only", onclick: () => addTask(d.id) }, "+ Tarea"));
      sec.appendChild(head);

      const tbl = h("table");
      const hc = [];
      if (ui.editable) hc.push(h("th", { style: "width:26px" }, ""));
      hc.push(h("th", {}, "Tarea"));
      hc.push(h("th", { style: "width:180px" }, "Escena"));
      hc.push(h("th", { style: "width:160px" }, "Responsable"));
      hc.push(h("th", { style: "width:120px" }, "Estado"));
      hc.push(h("th", { class: "center", style: "width:76px" }, "Build"));
      if (ui.editable) hc.push(h("th", { style: "width:36px" }, ""));
      tbl.appendChild(h("thead", {}, h("tr", {}, hc)));

      const body = h("tbody");
      let dragId = null;
      tasks.forEach((t) => {
        const tr = h("tr");
        if (ui.editable) {
          tr.appendChild(h("td", {}, h("span", { class: "drag-handle", title: "Arrastrá para reordenar por prioridad" }, "⠿")));
          tr.setAttribute("draggable", "true");
          tr.addEventListener("dragstart", (e) => { dragId = t.id; tr.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; });
          tr.addEventListener("dragend", () => tr.classList.remove("dragging"));
          tr.addEventListener("dragover", (e) => { e.preventDefault(); });
          tr.addEventListener("drop", (e) => { e.preventDefault(); if (dragId == null || dragId === t.id) return; reorderTask(d.id, dragId, t.id); dragId = null; renderTracker(); });
        }
        tr.appendChild(titleCell(t, () => persistTask(t), false));
        tr.appendChild(h("td", {}, sceneCell(t, () => persistTask(t))));
        tr.appendChild(h("td", {}, assigneeCell(t, "assignee", () => persistTask(t))));
        tr.appendChild(h("td", {}, statusCell(t, "status", () => persistTask(t))));
        tr.appendChild(h("td", { class: "center" }, buildCell(t, () => persistTask(t))));
        if (ui.editable) tr.appendChild(h("td", {}, h("button", { class: "row-del edit-only", title: "Eliminar", onclick: () => { if (confirm("¿Eliminar esta tarea?")) { persistDeleteTask(t); renderTracker(); } } }, "×")));
        body.appendChild(tr);
      });
      if (!tasks.length) { const cols = 5 + (ui.editable ? 2 : 0); body.appendChild(h("tr", {}, h("td", { colspan: cols }, h("span", { class: "mini-empty" }, "Sin tareas todavía.")))); }
      tbl.appendChild(body); if (collapsed[d.id]) tbl.style.display = "none"; sec.appendChild(tbl); host.appendChild(sec);
    });
  }

  function nextPri(dept) {
    const ps = data.tasks.filter((t) => t.dept === dept && t.pri != null).map((t) => t.pri);
    return ps.length ? Math.max.apply(null, ps) + 1 : 0;
  }
  function reorderTask(dept, fromId, toId) {
    const list = data.tasks.filter((t) => t.dept === dept).sort((a, b) => (a.pri == null ? 9999 : a.pri) - (b.pri == null ? 9999 : b.pri));
    const from = list.findIndex((t) => t.id === fromId), to = list.findIndex((t) => t.id === toId);
    if (from < 0 || to < 0) return;
    const moved = list.splice(from, 1)[0]; list.splice(to, 0, moved);
    list.forEach((t, i) => { t.pri = i; persistTask(t); });
  }
  function addTask(dept) {
    const t = { id: uid("t"), dept, title: "Nueva tarea", assignee: "", status: "brief", netflix: false, week: false, scene: "", thumbUrl: "", pri: nextPri(dept) };
    data.tasks.push(t); persistTask(t); renderTracker();
  }
  async function clearAll() {
    if (!confirm("¿Vaciar TODO el Tracker (todas las tareas)?\nEsto no se puede deshacer. Los objetivos del Resumen se mantienen.")) return;
    data.tasks = []; data.scenarios = [];
    if (Sync.enabled) { try { await Sync.clearItems(); } catch (e) { toast("No se pudo vaciar"); return; } } else saveLocal();
    renderBrand(); renderTracker(); toast("Tracker vaciado — agregá tareas con “+ Tarea”");
  }

  /* ---------------- Drag & drop de miniatura ---------------- */
  function attachDrop(container, thumbEl, obj, persist) {
    container.addEventListener("dragover", (e) => { e.preventDefault(); if (ui.editable) thumbEl.classList.add("drop-hover"); });
    container.addEventListener("dragleave", () => thumbEl.classList.remove("drop-hover"));
    container.addEventListener("drop", async (e) => {
      e.preventDefault(); e.stopPropagation(); thumbEl.classList.remove("drop-hover");
      if (!ui.editable) { toast("Desbloqueá edición (🔒 Editar) para cambiar la imagen."); return; }
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f) return;
      if (!/^image\//.test(f.type)) { toast("Arrastrá un archivo de imagen."); return; }
      const localUrl = URL.createObjectURL(f);
      let img = thumbEl;
      if (img.tagName !== "IMG") { img = h("img", { class: "thumb", alt: "" }); thumbEl.replaceWith(img); }
      img.src = localUrl; img.classList.add("uploading");
      if (!Sync.enabled) { obj.thumbUrl = localUrl; img.classList.remove("uploading"); saveLocal(); toast("Sin Supabase: la imagen no se guarda compartida."); return; }
      try {
        const url = await Sync.uploadThumb(f, obj.id);
        obj.thumbUrl = url; img.src = url; img.classList.remove("uploading"); persist();
        toast("Imagen guardada");
      } catch (err) {
        img.classList.remove("uploading");
        toast("No se pudo subir (¿falta el bucket “" + (CFG.thumbBucket || "tracker-thumbs") + "”?)");
      }
    });
  }

  /* ============================================================
     CALENDARIO
     ============================================================ */
  const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  function ymd(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function parseLocal(s) { const p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function mondayOf(d) { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); x.setHours(0, 0, 0, 0); return x; }
  function fmtRange(a, b) {
    if (a.getMonth() === b.getMonth()) return a.getDate() + "–" + b.getDate() + " " + MES[b.getMonth()];
    return a.getDate() + " " + MES[a.getMonth()] + "–" + b.getDate() + " " + MES[b.getMonth()];
  }
  function buildWeeks() {
    const start = mondayOf(parseLocal("2026-09-28")), end = parseLocal("2027-01-05");
    const weeks = [];
    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
      const mon = new Date(d), sun = new Date(d); sun.setDate(sun.getDate() + 6);
      const ms = MILESTONES.filter((m) => { const md = parseLocal(m.date); return md >= mon && md <= sun; });
      weeks.push({ key: ymd(mon), mon: mon, sun: sun, ms: ms });
    }
    return weeks;
  }
  function renderCal() {
    const host = el("view-cal"); if (!host) return; host.innerHTML = ""; host.classList.add("pad");
    const bar = h("div", { class: "hub-toolbar" });
    bar.appendChild(h("h2", { class: "sec", style: "margin:0" }, "Calendario · objetivos por semana"));
    bar.appendChild(h("span", { class: "spacer" }));
    bar.appendChild(h("a", { class: "btn-hub", href: CAL_URL, target: "_blank", rel: "noopener" }, "Calendario de Santiago ↗"));
    host.appendChild(bar);
    host.appendChild(h("div", { class: "note", style: "color:var(--text-dim);font-size:12px;margin:-6px 0 16px" },
      ui.editable ? "Escribí el objetivo de cada semana. Las semanas con milestone de Netflix están resaltadas en dorado." : "Objetivos por semana. Las semanas resaltadas tienen un milestone de Netflix."));

    data.meta.weekPlans = data.meta.weekPlans || {};
    const plans = data.meta.weekPlans;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const grid = h("div", { class: "wk-grid" });
    buildWeeks().forEach((w) => {
      const isNow = w.mon <= today && today <= w.sun;
      const isPast = w.sun < today;
      let cls = "wk-card";
      if (w.ms.length) cls += " wk-key";
      if (isNow) cls += " wk-now";
      if (isPast) cls += " wk-past";
      const card = h("div", { class: cls });
      card.appendChild(h("div", { class: "wk-range" }, fmtRange(w.mon, w.sun)));
      w.ms.forEach((m) => card.appendChild(h("div", { class: "wk-ms" }, [
        h("b", {}, "⚑ " + m.label), h("span", {}, " · " + m.desc + " · " + parseLocal(m.date).getDate() + " " + MES[parseLocal(m.date).getMonth()]),
      ])));
      const field = editField(plans[w.key] || "", (v) => { plans[w.key] = v; persistMeta(); }, "wk-obj", true);
      if (!ui.editable && !plans[w.key]) field.textContent = "—";
      card.appendChild(field);
      grid.appendChild(card);
    });
    host.appendChild(grid);
  }

  /* ============================================================
     BOOT
     ============================================================ */
  // Migración: arte→concept y escenarios (pipeline) → tareas del depto 3D
  function migrate() {
    data.tasks.forEach((t) => { if (t.dept === "arte") { t.dept = "concept"; persistTask(t); } });
    (data.scenarios || []).forEach((s) => {
      const t = { id: s.id, dept: "3d", title: s.name || "Escenario", assignee: s.modelAssignee || s.conceptAssignee || "", status: s.modelStatus || "brief", netflix: !!s.netflix, week: false, scene: "", thumbUrl: s.thumbUrl || "", pri: nextPri("3d") };
      data.tasks.push(t);
      if (Sync.enabled) Sync.push("task", t.id, t, t.pri); else saveLocal();
    });
    data.scenarios = [];
  }

  async function boot() {
    applyMode();
    if (Sync.init()) {
      try {
        const { rows, parsed } = await Sync.loadAll();
        if (!rows.length) { const sd = seed(); await Sync.seed(sd); data = sd; }
        else { data = parsed; if (!data.meta || !Object.keys(data.meta).length) data.meta = seed().meta; }
        migrate();
        scenes = await Sync.loadScenes();
        Sync.subscribe();
      } catch (e) {
        Sync.enabled = false; loadLocal(); migrate();
        toast("Tracker en modo local (¿falta correr supabase-setup.sql?)");
      }
    } else { loadLocal(); migrate(); }
    renderBrand(); renderTabs(); show("resumen");
  }
  function loadLocal() {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) { const p = JSON.parse(raw); if (p && p.tasks) { data = p; return; } } } catch (e) {}
    data = seed(); saveLocal();
  }

  window.GoldenHub = { show };
  document.addEventListener("DOMContentLoaded", boot);
})();
