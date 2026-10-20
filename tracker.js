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
    { id: "fh", name: "Federico Heller",  initials: "FH", color: "#4bb3c4", role: "Director" },
    { id: "st", name: "Santiago Tereso",  initials: "ST", color: "#d9a441", role: "Producción" },
    { id: "lt", name: "Lucila Trobbiani", initials: "LT", color: "#d9a441", role: "Producción" },
    { id: "pa", name: "Pablo Altamiranda",initials: "PA", color: "#b5479b", role: "Lead Dev · Gameplay / integración" },
    { id: "lm", name: "Lucas Mallo",      initials: "LM", color: "#b5479b", role: "Dev · Gameplay / UI" },
    { id: "ls", name: "Lautaro Schipizza",initials: "LS", color: "#8b5cf6", role: "Arte + Lead 3D" },
    { id: "be", name: "Belén",            initials: "BE", color: "#8b5cf6", role: "3D Artist" },
    { id: "ga", name: "Gastón",           initials: "GA", color: "#8b5cf6", role: "3D Artist" },
  ];
  const member = (id) => TEAM.find((m) => m.id === id) || null;

  const DEPTS = [
    { id: "narrativa", ico: "🎬", label: "Narrativa / Guion" },
    { id: "gameplay",  ico: "🎮", label: "Gameplay / Charting" },
    { id: "audio",     ico: "🎵", label: "Audio" },
    { id: "ui",        ico: "📺", label: "UI de TV + Control" },
    { id: "qa",        ico: "✅", label: "QA / Entrega Netflix" },
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
    editable: sessionStorage.getItem("golden_edit") === "1",
    filterPerson: "",
    filterDept: "",
  };

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
    if (ui.editable) { ui.editable = false; sessionStorage.removeItem("golden_edit"); applyMode(); renderBrand(); renderCurrent(); return; }
    const k = prompt("Clave de edición:");
    if (k == null) return;
    const hash = await sha256hex(k);
    if (CFG.editKeyHash && hash !== CFG.editKeyHash) { toast("Clave incorrecta"); return; }
    ui.editable = true; sessionStorage.setItem("golden_edit", "1"); applyMode(); renderBrand(); renderCurrent();
    toast("Edición desbloqueada");
  }

  /* ---------------- Seed inicial ---------------- */
  function seed() {
    const T = (id, dept, title, assignee, status, target) => ({ id, dept, title, assignee, status, target: target || "" });
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
        { id: "sc-1", name: "Seúl noche · Bukchon", note: "intro · 0:00–0:30", thumbUrl: "", conceptStatus: "approved", conceptAssignee: "ls", modelStatus: "dev", modelAssignee: "be", target: "Entrega Netflix" },
        { id: "sc-2", name: "Namsan Tower", note: "estribillo", thumbUrl: "", conceptStatus: "approved", conceptAssignee: "ls", modelStatus: "dev", modelAssignee: "ls", target: "Entrega Netflix" },
        { id: "sc-3", name: "Golden City", note: "consagración", thumbUrl: "", conceptStatus: "review", conceptAssignee: "ga", modelStatus: "brief", modelAssignee: "", target: "Avance juego" },
        { id: "sc-4", name: "Demon Realm", note: "puente", thumbUrl: "", conceptStatus: "dev", conceptAssignee: "ls", modelStatus: "brief", modelAssignee: "", target: "Avance juego" },
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
  function editField(value, onSave, cls) {
    const n = h("div", { class: (cls || "") + " editable-field" }, value || "");
    n.contentEditable = ui.editable ? "true" : "false";
    if (ui.editable) {
      n.addEventListener("blur", () => { const v = n.textContent.trim(); onSave(v); });
      n.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); n.blur(); } });
    }
    return n;
  }
  function renderResumen() {
    const host = el("view-resumen"); if (!host) return; host.innerHTML = "";
    const m = data.meta;

    const banner = h("div", { class: "next-banner" });
    const left = h("div", { class: "nb-col left" });
    left.appendChild(h("div", { class: "nb-label" }, [document.createTextNode("🗓 Objetivo de la semana "),
      ...(ui.editable ? [h("span", { class: "edit-only", style: "font-size:10px;color:var(--text-dim);text-transform:none;letter-spacing:0" }, "✎ editable")] : [])]));
    left.appendChild(editField(m.weekObjective, (v) => { m.weekObjective = v; persistMeta(); }, "nb-obj"));
    const wd = h("div", { class: "nb-date" }); wd.appendChild(document.createTextNode("📅 "));
    wd.appendChild(editField(m.weekDate, (v) => { m.weekDate = v; persistMeta(); }, ""));
    left.appendChild(wd);

    const right = h("div", { class: "nb-col right" });
    right.appendChild(h("div", { class: "nb-label" }, [document.createTextNode("⚑ Objetivo de la próxima entrega "),
      ...(ui.editable ? [h("span", { class: "edit-only", style: "font-size:10px;color:var(--text-dim);text-transform:none;letter-spacing:0" }, "✎ editable")] : [])]));
    right.appendChild(editField(m.deliveryObjective, (v) => { m.deliveryObjective = v; persistMeta(); }, "nb-obj"));
    const dd = h("div", { class: "nb-date" }); dd.appendChild(document.createTextNode("📅 "));
    dd.appendChild(editField(m.deliveryDate, (v) => { m.deliveryDate = v; persistMeta(); }, ""));
    right.appendChild(dd);

    banner.appendChild(left); banner.appendChild(h("div", { class: "nb-div" })); banner.appendChild(right);
    host.appendChild(banner);

    const grid = h("div", { class: "two-col" });

    // En qué está cada uno ahora (status == dev)
    const ob = h("div", { class: "block" });
    ob.appendChild(h("h3", { html: '🔄 En qué está cada uno ahora <small style="color:var(--text-dim);font-weight:400;font-family:var(--mono);font-size:11px">· se levanta del Tracker</small>' }));
    const ongoing = [];
    data.tasks.filter((t) => t.status === "dev").forEach((t) => ongoing.push({ who: t.assignee, what: t.title }));
    data.scenarios.forEach((s) => {
      if (s.conceptStatus === "dev") ongoing.push({ who: s.conceptAssignee, what: "Concept de " + s.name });
      if (s.modelStatus === "dev") ongoing.push({ who: s.modelAssignee, what: "3D de " + s.name });
    });
    if (!ongoing.length) ob.appendChild(h("div", { class: "mini-empty" }, "Nadie marcado “En progreso”. Marcá tareas con ese estado en el Tracker."));
    ongoing.forEach((o) => {
      const mm = member(o.who);
      ob.appendChild(h("div", { class: "mini-row" }, [
        h("span", { class: "who", style: "background:" + (mm ? mm.color : "#3a4152") }, mm ? mm.initials : "—"),
        h("div", { class: "txt" }, [document.createTextNode(mm ? mm.name : "Sin asignar"), h("small", {}, o.what)]),
        h("span", { class: "chip c-dev" }, "EN PROGRESO"),
      ]));
    });
    grid.appendChild(ob);

    // Equipo
    const tb = h("div", { class: "block" });
    tb.appendChild(h("h3", {}, "👥 Equipo"));
    TEAM.forEach((mm) => {
      const count = data.tasks.filter((t) => t.assignee === mm.id).length +
        data.scenarios.filter((s) => s.conceptAssignee === mm.id || s.modelAssignee === mm.id).length;
      const edits = mm.id === "lt" || mm.id === "st";
      tb.appendChild(h("div", { class: "mini-row" }, [
        h("span", { class: "who", style: "background:" + mm.color }, mm.initials),
        h("div", { class: "txt" }, [document.createTextNode(mm.name), h("small", {}, mm.role)]),
        h("span", { class: "deliv-tag" }, edits ? "✎" : (mm.id === "fh" ? "👁" : (count ? String(count) : "—"))),
      ]));
    });
    grid.appendChild(tb);
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
  function targetCell(obj, persist) {
    const n = h("span", { class: "target-field" }, obj.target || (ui.editable ? "—" : ""));
    n.contentEditable = ui.editable ? "true" : "false";
    if (ui.editable) n.addEventListener("blur", () => { obj.target = n.textContent.trim().replace(/^—$/, ""); persist(); });
    return n;
  }
  function titleCell(obj, persist, subField) {
    const wrap = h("td", { class: "asset" });
    const title = h("div", { class: "title" }, obj.title != null ? obj.title : obj.name);
    title.contentEditable = ui.editable ? "true" : "false";
    if (ui.editable) title.addEventListener("blur", () => { const v = title.textContent.trim(); if ("title" in obj) obj.title = v; else obj.name = v; persist(); });
    wrap.appendChild(title);
    if (obj[subField]) wrap.appendChild(h("small", {}, obj[subField]));
    return wrap;
  }

  function renderTracker() {
    const host = el("view-tracker"); if (!host) return; host.innerHTML = "";
    host.appendChild(h("h2", { class: "sec" }, "Tracker de Producción — assets, responsables y estado"));

    // toolbar
    const tb = h("div", { class: "hub-toolbar" });
    const selP = h("select"); selP.appendChild(h("option", { value: "" }, "Persona: Todos"));
    TEAM.forEach((m) => { const o = h("option", { value: m.id }, m.name); if (ui.filterPerson === m.id) o.selected = true; selP.appendChild(o); });
    selP.addEventListener("change", () => { ui.filterPerson = selP.value; renderTracker(); });
    tb.appendChild(selP);
    const selD = h("select"); selD.appendChild(h("option", { value: "" }, "Departamento: Todos"));
    [{ id: "escenarios", label: "Arte / Escenarios" }].concat(DEPTS).forEach((d) => { const o = h("option", { value: d.id }, d.label); if (ui.filterDept === d.id) o.selected = true; selD.appendChild(o); });
    selD.addEventListener("change", () => { ui.filterDept = selD.value; renderTracker(); });
    tb.appendChild(selD);
    tb.appendChild(h("span", { class: "spacer" }));
    const legend = h("div", { class: "legend" });
    STATUS.forEach((s) => legend.appendChild(h("span", { class: "chip " + s.cls }, s.label.toUpperCase())));
    tb.appendChild(legend);
    host.appendChild(tb);

    const matchP = (ids) => !ui.filterPerson || ids.indexOf(ui.filterPerson) >= 0;

    // Escenarios (pipeline Concept → 3D)
    if (!ui.filterDept || ui.filterDept === "escenarios") {
      const scs = data.scenarios.filter((s) => matchP([s.conceptAssignee, s.modelAssignee]));
      const sec = h("div", { class: "dept" });
      const head = h("div", { class: "dept-head" }, [
        h("span", { class: "ico" }, "🎨"), h("h3", {}, "Arte / Escenarios"),
        h("span", { class: "count" }, scs.length + " escenarios"), h("span", { class: "pline" }),
      ]);
      if (ui.editable) head.appendChild(h("button", { class: "btn-hub edit-only", onclick: addScenario }, "+ Escenario"));
      sec.appendChild(head);
      const tbl = h("table");
      tbl.appendChild(h("thead", {}, h("tr", {}, [
        h("th", { style: "width:30%" }, "Escenario"),
        h("th", { class: "center" }, "① Concept"), h("th", { class: "center" }, "② 3D"),
        h("th", {}, "Apunta a"), ui.editable ? h("th", { style: "width:34px" }, "") : null,
      ])));
      const body = h("tbody");
      scs.forEach((s) => {
        const tr = h("tr");
        // thumbnail + nombre
        const td0 = h("td", { class: "asset" });
        const at = h("div", { class: "asset-thumb" });
        let thumb;
        if (s.thumbUrl) thumb = h("img", { class: "thumb", src: s.thumbUrl, alt: "" });
        else thumb = h("div", { class: "thumb empty" }, "＋");
        attachDrop(at, thumb, s);
        at.appendChild(thumb);
        const nameWrap = h("div", {});
        const name = h("div", { class: "title" }, s.name); name.contentEditable = ui.editable ? "true" : "false";
        if (ui.editable) name.addEventListener("blur", () => { s.name = name.textContent.trim(); persistScenario(s); });
        nameWrap.appendChild(name);
        if (s.note || ui.editable) {
          const note = h("small", {}, s.note || "—"); note.contentEditable = ui.editable ? "true" : "false";
          if (ui.editable) note.addEventListener("blur", () => { s.note = note.textContent.trim().replace(/^—$/, ""); persistScenario(s); });
          nameWrap.appendChild(note);
        }
        at.appendChild(nameWrap); td0.appendChild(at); tr.appendChild(td0);
        // concept
        tr.appendChild(h("td", {}, h("div", { class: "stage-cell" }, [statusCell(s, "conceptStatus", () => persistScenario(s)), miniAssignee(s, "conceptAssignee", () => persistScenario(s))])));
        // 3d
        tr.appendChild(h("td", {}, h("div", { class: "stage-cell" }, [statusCell(s, "modelStatus", () => persistScenario(s)), miniAssignee(s, "modelAssignee", () => persistScenario(s))])));
        // target
        tr.appendChild(h("td", {}, targetCell(s, () => persistScenario(s))));
        if (ui.editable) tr.appendChild(h("td", {}, h("button", { class: "row-del edit-only", title: "Eliminar", onclick: () => { if (confirm("¿Eliminar “" + s.name + "”?")) { persistDeleteScenario(s); renderTracker(); } } }, "×")));
        body.appendChild(tr);
      });
      tbl.appendChild(body); sec.appendChild(tbl); host.appendChild(sec);
    }

    // Departamentos de tareas
    DEPTS.forEach((d) => {
      if (ui.filterDept && ui.filterDept !== d.id) return;
      const tasks = data.tasks.filter((t) => t.dept === d.id && matchP([t.assignee]));
      if (ui.filterPerson && !tasks.length) return;
      const sec = h("div", { class: "dept" });
      const head = h("div", { class: "dept-head" }, [
        h("span", { class: "ico" }, d.ico), h("h3", {}, d.label),
        h("span", { class: "count" }, String(tasks.length)), h("span", { class: "pline" }),
      ]);
      if (ui.editable) head.appendChild(h("button", { class: "btn-hub edit-only", onclick: () => addTask(d.id) }, "+ Tarea"));
      sec.appendChild(head);
      const tbl = h("table");
      tbl.appendChild(h("thead", {}, h("tr", {}, [
        h("th", { style: "width:40%" }, "Tarea"), h("th", {}, "Responsable"),
        h("th", {}, "Estado"), h("th", {}, "Apunta a"), ui.editable ? h("th", { style: "width:34px" }, "") : null,
      ])));
      const body = h("tbody");
      tasks.forEach((t) => {
        const tr = h("tr");
        tr.appendChild(titleCell(t, () => persistTask(t), "_none"));
        tr.appendChild(h("td", {}, assigneeCell(t, "assignee", () => persistTask(t))));
        tr.appendChild(h("td", {}, statusCell(t, "status", () => persistTask(t))));
        tr.appendChild(h("td", {}, targetCell(t, () => persistTask(t))));
        if (ui.editable) tr.appendChild(h("td", {}, h("button", { class: "row-del edit-only", title: "Eliminar", onclick: () => { if (confirm("¿Eliminar esta tarea?")) { persistDeleteTask(t); renderTracker(); } } }, "×")));
        body.appendChild(tr);
      });
      if (!tasks.length) body.appendChild(h("tr", {}, h("td", { colspan: ui.editable ? 5 : 4 }, h("span", { class: "mini-empty" }, "Sin tareas todavía."))));
      tbl.appendChild(body); sec.appendChild(tbl); host.appendChild(sec);
    });
  }

  function addTask(dept) {
    const t = { id: uid("t"), dept, title: "Nueva tarea", assignee: "", status: "brief", target: "" };
    data.tasks.push(t); persistTask(t); renderTracker();
  }
  function addScenario() {
    const s = { id: uid("sc"), name: "Nuevo escenario", note: "", thumbUrl: "", conceptStatus: "brief", conceptAssignee: "", modelStatus: "brief", modelAssignee: "", target: "" };
    data.scenarios.push(s); persistScenario(s); renderTracker();
  }

  /* ---------------- Drag & drop de miniatura ---------------- */
  function attachDrop(container, thumbEl, s) {
    container.addEventListener("dragover", (e) => { e.preventDefault(); if (ui.editable) thumbEl.classList.add("drop-hover"); });
    container.addEventListener("dragleave", () => thumbEl.classList.remove("drop-hover"));
    container.addEventListener("drop", async (e) => {
      e.preventDefault(); thumbEl.classList.remove("drop-hover");
      if (!ui.editable) { toast("Desbloqueá edición (🔒 Editar) para cambiar la imagen."); return; }
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f) return;
      if (!/^image\//.test(f.type)) { toast("Arrastrá un archivo de imagen."); return; }
      const localUrl = URL.createObjectURL(f);
      // preview inmediato
      let img = thumbEl;
      if (img.tagName !== "IMG") { img = h("img", { class: "thumb", alt: "" }); thumbEl.replaceWith(img); }
      img.src = localUrl; img.classList.add("uploading");
      if (!Sync.enabled) { s.thumbUrl = localUrl; img.classList.remove("uploading"); saveLocal(); toast("Sin Supabase: la imagen no se guarda compartida."); return; }
      try {
        const url = await Sync.uploadThumb(f, s.id);
        s.thumbUrl = url; img.src = url; img.classList.remove("uploading"); persistScenario(s);
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
  function renderCal() {
    const host = el("view-cal"); if (!host) return; host.innerHTML = ""; host.classList.add("pad");
    const url = data.meta.calendarUrl;
    if (url) {
      const bar = h("div", { class: "hub-toolbar" });
      bar.appendChild(h("h2", { class: "sec", style: "margin:0" }, "Calendario / Entregas"));
      bar.appendChild(h("span", { class: "spacer" }));
      if (ui.editable) bar.appendChild(h("button", { class: "btn-hub edit-only", onclick: () => { data.meta.calendarUrl = ""; persistMeta(); renderCal(); } }, "Cambiar link"));
      host.appendChild(bar);
      host.appendChild(h("iframe", { class: "cal-frame", src: url, title: "Calendario" }));
      return;
    }
    const box = h("div", { class: "embed-box" });
    box.appendChild(h("div", { class: "ico" }, "▤"));
    box.appendChild(h("b", {}, "Calendario de entregas"));
    box.appendChild(h("div", { class: "note" }, ui.editable
      ? "Pegá abajo el link de inserción (iframe src) de tu Google Calendar o Notion y dale Enter."
      : "Todavía no hay un calendario cargado. Producción puede agregarlo desde el modo edición."));
    if (ui.editable) {
      const inp = h("input", { class: "edit-only", type: "text", placeholder: "https://calendar.google.com/calendar/embed?src=..." });
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { const v = inp.value.trim(); if (v) { data.meta.calendarUrl = v; persistMeta(); renderCal(); } } });
      box.appendChild(inp);
    }
    host.appendChild(box);
  }

  /* ============================================================
     BOOT
     ============================================================ */
  async function boot() {
    applyMode();
    if (Sync.init()) {
      try {
        const { rows, parsed } = await Sync.loadAll();
        if (!rows.length) { const sd = seed(); await Sync.seed(sd); data = sd; }
        else { data = parsed; if (!data.meta || !Object.keys(data.meta).length) data.meta = seed().meta; }
        Sync.subscribe();
      } catch (e) {
        Sync.enabled = false; loadLocal();
        toast("Tracker en modo local (¿falta correr supabase-setup.sql?)");
      }
    } else { loadLocal(); }
    renderBrand(); renderTabs(); show("resumen");
  }
  function loadLocal() {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) { const p = JSON.parse(raw); if (p && p.tasks) { data = p; return; } } } catch (e) {}
    data = seed(); saveLocal();
  }

  window.GoldenHub = { show };
  document.addEventListener("DOMContentLoaded", boot);
})();
