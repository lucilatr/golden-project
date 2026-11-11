/* ============================================================
   GOLDEN — Guion por set (00:00–00:25 apertura nueva, resto v14)
   In/Out, letra y set son fijos (ROWS). Cámara, Acción y UI se
   escriben acá: una fila por celda en doc_meta de Supabase, con
   prefijo en el id (el Script solo usa la fila con id = docId), o
   localStorage si no hay conexión.
   ============================================================ */
(function () {
  "use strict";

  const CFG = window.GOLDEN_CONFIG || {};
  const DOC = CFG.docId || "golden";
  const LS_KEY = "golden_guion_v1";
  const TABLE = "doc_meta";
  const PREFIX = DOC + ":guion:";
  const SONG = "clips/song.m4a";
  const FIELDS = [
    { id: "camera", label: "Cámara", hint: "Escribir cámara…" },
    { id: "action", label: "Acción", hint: "Escribir acción…" },
    { id: "ui", label: "UI", hint: "Escribir UI…" },
  ];
  const STAGES = {
    A: { label: "Etapa 1 · Deseo e inseguridad", color: "var(--st-desire)" },
    B: { label: "Etapa 2 · Transformación y liberación", color: "var(--st-trans)" },
    C: { label: "Etapa 3 · Consagración dorada", color: "var(--st-golden)" },
  };
  const ROWS = [
    {"id": "r0000", "stage": "A", "in": 0.0, "out": 9.3, "set": "S01 · Seúl, calle Hanok (aéreo)", "desc": "Plano aéreo que avanza lento sobre techos, cerezos y cartel de HUNTR/X, y gira hasta alinear la calle en vertical. Rumi muy chica, abajo. El título GOLDEN entra con fundido (~00:00.7 a 00:01.3). En la maqueta hay un salto de encuadre en 00:04.5.", "lyric": []},
    // Conserva el id r0096 de la fila 00:09.6 de la v14: Cámara ya tiene texto escrito bajo ese id.
    {"id": "r0096", "stage": "A", "in": 9.3, "out": 16.0, "set": "S01 · Seúl, calle Hanok (a nivel calle)", "desc": "Corte a la calle: la cámara baja desde la altura de los techos y avanza, con Rumi muy lejos al fondo. El título se va con fundido (~00:12.4 a 00:13.1). Desde 00:13.0 acelera con barrido hasta quedar frente a Rumi (~00:13.8); entran los pétalos y la cámara retrocede mientras Rumi camina hacia ella.", "lyric": []},
    {"id": "r0160", "stage": "A", "in": 16.0, "out": 23.1, "set": "S01 · Seúl, calle Hanok (cont.)", "desc": "Misma calle. La cámara sigue retrocediendo frente a Rumi. Arranca la voz.", "lyric": [["00:16", "I was a ghost, I was alone"], ["≈00:20", "eoduwojin apgil soge"]]},
    // Une 00:23.1 y 00:28.2 (conserva el id r0231). Desde acá hasta 01:10.1, video y descripción son de la maqueta del 10/11.
    {"id": "r0231", "stage": "A", "in": 23.1, "out": 30.8, "set": "S01 · Close-up, bokeh verde y violeta", "desc": "Rumi de cintura para arriba, fondo de luces desenfocadas verdes y violetas. Plano fijo durante todo el tramo; sale con fundido a negro.", "lyric": [["00:24", "Given the throne, I didn't know how to believe"], ["00:28", "I was the queen that I'm meant to be"]]},
    // Pasarela, primera mitad: poses (conserva el id r0308).
    {"id": "r0308", "stage": "A", "in": 30.8, "out": 38.4, "set": "S02 · Pasarela, alfombra roja (poses)", "desc": "Escaleras blancas y público con las luces de los celulares. Rumi de frente hacia cámara. Termina con la cámara girando hacia el lateral (~00:38).", "lyric": [["00:31", "I lived two lives, tried to play both sides"], ["00:35", "But I couldn't find my own place"]]},
    // Segunda mitad de la pasarela: cambia la mecánica (combate lateral). Reusa el id libre r0384.
    {"id": "r0384", "stage": "A", "in": 38.4, "out": 46.3, "set": "S02 · Pasarela, alfombra roja (combate lateral)", "desc": "Cámara lateral, se sigue viendo el set. Rumi pelea con espada contra demonios, con golpes de destellos blancos y rosas. Sale con flash blanco.", "lyric": [["00:39", "Called a problem child 'cause I got too wild"], ["00:43", "But now that's how I'm getting paid 끝없이 on stage"]]},
    {"id": "r0465", "stage": "B", "in": 46.3, "out": 55.7, "set": "S03 · Subte, de día → modo demon", "desc": "Entra con flash blanco. Plano corto de Rumi en el vagón (asientos azules, ventanas con skyline y río). La cámara se aleja mientras ella camina; desde ~00:49.5 aparece energía magenta hasta que el vagón queda oscuro, con venas magenta.", "lyric": [["00:47", "I'm done hidin', now I'm shinin'"], ["00:51", "Like I'm born to be"], ["00:54", "We dreamin' hard, we came so far"]]},
    {"id": "r0546", "stage": "B", "in": 55.7, "out": 62.2, "set": "S03 · Subte, modo demon (subjetiva)", "desc": "Barrido rápido a la vista subjetiva: vagón vacío en modo demon, con venas magenta. Cerca de 01:01.5, otro barrido vuelve a Rumi caminando hacia cámara. Sale con flash blanco.", "lyric": [["00:58", "Now I believe"]]},
    {"id": "r0624", "stage": "B", "in": 62.2, "out": 70.1, "set": "S04 · Techo del subte, lateral", "desc": "Entra con flash blanco. Vista lateral: Rumi camina sobre el techo del vagón; detrás pasan el puente de hierro y el skyline con cielo violeta. En esta maqueta todavía no hay combate.", "lyric": [["01:02", "We're goin' up, up, up, it's our moment"], ["01:05", "You know together we're glowin'"], ["01:07", "Gonna be, gonna be golden"]]},
    {"id": "r0701", "stage": "B", "in": 70.1, "out": 78.2, "set": "S04 · Cielo violeta, giro y combate", "desc": "Disolvencia. Rumi girando en el aire con espada, demonios alrededor. \"Gira en el aire y mata demonios\". HUD + interfaz Z en maqueta.", "lyric": [["01:09", "Oh-oh-oh, up, up, up with our voices"], ["01:13", "yeongwonhi kkaejil su eomneun"], ["01:15", "Gonna be, gonna be golden"]]},
    {"id": "r0782", "stage": "B", "in": 78.2, "out": 84.9, "set": "S04 · Vórtice de energía, vuelo", "desc": "Disolvencia. Close de Rumi volando de frente entre aros de luz. \"Vuela hacia el camino de cristal\". HUD + interfaz Z en maqueta.", "lyric": [["01:18", "Oh-oh-oh, I'm done hidin', now I'm shinin'"], ["01:22", "Like I'm born to be"]]},
    {"id": "r0849", "stage": "B", "in": 84.9, "out": 94.9, "set": "S05 · Camino de cristal sobre nubes", "desc": "Rumi de espaldas avanzando, cielo de atardecer, demonios volando en silueta. Sin HUD.", "lyric": [["01:26", "Oh, our time, no fears, no lies"], ["01:29", "That's who we're born to be"]]},
    {"id": "r0949", "stage": "B", "in": 94.9, "out": 107.0, "set": "S06 · Desierto de roca, atardecer", "desc": "Suelo agrietado, formaciones rocosas de fondo, sol bajo. Rumi camina hacia cámara. Sin HUD.", "lyric": [["01:35", "Waited so long to break these walls down"], ["01:39", "To wake up and feel like me"], ["01:43", "Put these patterns all in the past now"]]},
    {"id": "r1070", "stage": "B", "in": 107.0, "out": 111.9, "set": "S06 · Paredes de roca, cañón", "desc": "Mismo desierto: suben paredes con polvo (desde 01:47.0) y la encierran hasta dejar una rendija de cielo.", "lyric": [["01:47", "And finally live like the girl they all see"]]},
    {"id": "r1119", "stage": "B", "in": 111.9, "out": 123.1, "set": "S07 · Espacio abstracto en colapso", "desc": "Ruinas flotando, tonos violetas, eclipse arriba. Rumi de espaldas, con espada. \"No more hiding · el espacio se deforma y colapsa\". HUD + interfaz Z en maqueta.", "lyric": [["01:52", "No more hiding, I'll be shinin'"], ["01:56", "Like I'm born to be"], ["01:59", "'Cause we are hunters, voices strong"]]},
    {"id": "r1231", "stage": "B", "in": 123.1, "out": 127.0, "set": "S08 · Explosión de oro", "desc": "Disolvencia. Rumi de espaldas, brazos abiertos, ráfagas doradas. \"Todo se vuelve oro\". HUD + interfaz Z en maqueta.", "lyric": [["02:04", "And I know I believe"]]},
    {"id": "r1270", "stage": "C", "in": 127.0, "out": 138.1, "set": "S08 · Explosión de oro (cont.)", "desc": "Mismo plano; entra el estribillo. HUD + interfaz Z en maqueta.", "lyric": [["02:07", "We're goin' up, up, up, it's our moment"], ["02:11", "You know together we're glowin'"], ["02:13", "Gonna be, gonna be golden"], ["≈02:14", "Oh-oh-oh, up, up, up with our voices"]]},
    {"id": "r1381", "stage": "C", "in": 138.1, "out": 150.2, "set": "S09 · Escenario de oro, combate", "desc": "Disolvencia. Escalinata dorada, pantallas con Rumi, demonios estallando; Rumi con espada. \"Combate de espadas · cada demonio arma el escenario\". HUD + interfaz Z en maqueta.", "lyric": [["≈02:18", "yeongwonhi kkaejil su eomneun"], ["≈02:20", "Gonna be, gonna be golden"], ["≈02:22", "Oh-oh-oh, I'm done hidin', now I'm shinin'"], ["≈02:27", "Like I'm born to be"]]},
    {"id": "r1502", "stage": "C", "in": 150.2, "out": 159.9, "set": "S09 · Escenario de oro, combate (cont.)", "desc": "Mismo plano. HUD + interfaz Z en maqueta.", "lyric": [["≈02:30", "Oh, our time, no fears, no lies"], ["≈02:35", "That's who we're born to be"], ["≈02:38", "You know we're gonna be, gonna be golden"]]},
    {"id": "r1599", "stage": "C", "in": 159.9, "out": 175.0, "set": "S10 · Mega estadio", "desc": "Entra con flash blanco. Escenario monumental dorado, pantallas, láseres, público masivo. Zoom out lento. Sin HUD.", "lyric": [["≈02:41", "We're gonna be, gonna be"], ["≈02:42", "Born to be, born to be glowin'"], ["≈02:45", "You know that it's our time, no fears, no lies"], ["≈02:51", "That's who we're born to be"]]},
    {"id": "r1750", "stage": "C", "in": 175.0, "out": 194.6, "set": "S10 · Mega estadio (cont.)", "desc": "Sigue el zoom out hasta el final. La música se apaga ~03:11. Sin HUD.", "lyric": []},
  ];

  /* ---------------- Estado ---------------- */
  let cells = {};          // "fila:campo" -> texto
  let online = false;
  let sb = null;
  let ready = null;
  let builtFor = null;     // modo (edición / lectura) con el que se armó la tabla
  const timers = {};

  const el = (id) => document.getElementById(id);
  const canEdit = () => !!(window.GoldenHub && window.GoldenHub.editable());
  const fmt = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + (s % 60).toFixed(1).padStart(4, "0");
  function h(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------------- Datos ---------------- */
  function readLocal() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function saveLocal() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(cells)); } catch (e) {}
  }
  function cellRow(key, text) {
    return { id: PREFIX + key, data: { text } };
  }
  async function load() {
    const local = readLocal();
    cells = local;
    if (!CFG.supabaseUrl || !CFG.supabaseAnonKey || typeof window.supabase === "undefined") return;
    try {
      sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
      const { data, error } = await sb.from(TABLE).select("id,data").like("id", PREFIX + "%");
      if (error) throw error;
      const remote = {};
      (data || []).forEach((r) => { remote[r.id.slice(PREFIX.length)] = (r.data && r.data.text) || ""; });
      // Lo escrito en modo local que todavía no está en la base se sube (sin pisar nada)
      const pending = Object.keys(local).filter((k) => local[k] && !remote[k]);
      if (pending.length) {
        const { error: upErr } = await sb.from(TABLE).upsert(pending.map((k) => cellRow(k, local[k])));
        if (upErr) throw upErr;
        pending.forEach((k) => { remote[k] = local[k]; });
      }
      localStorage.removeItem(LS_KEY);
      cells = remote;
      online = true;
      sb.channel("rt-guion")
        .on("postgres_changes", { event: "*", schema: "public", table: TABLE }, onRemote)
        .subscribe();
    } catch (e) { online = false; }
  }
  function onRemote(p) {
    const r = p.new;
    if (!r || !r.id || r.id.indexOf(PREFIX) !== 0) return;
    const key = r.id.slice(PREFIX.length);
    if (timers[key]) return; // hay un cambio propio sin guardar en esta celda
    const text = (r.data && r.data.text) || "";
    cells[key] = text;
    const ta = document.querySelector('#view-guion textarea[data-key="' + key + '"]');
    if (ta && ta !== document.activeElement) { ta.value = text; grow(ta); }
  }
  function save(key) {
    delete timers[key];
    if (!online) { saveLocal(); setStatus("Guardado en este navegador"); return; }
    sb.from(TABLE).upsert(cellRow(key, cells[key] || "")).then(({ error }) => {
      setStatus(error ? "No se pudo guardar" : "Guardado", !!error);
    }, () => setStatus("No se pudo guardar", true));
  }
  function schedule(key) {
    setStatus("Guardando…");
    clearTimeout(timers[key]);
    timers[key] = setTimeout(() => save(key), 500);
  }
  function flush() {
    Object.keys(timers).forEach((k) => { clearTimeout(timers[k]); save(k); });
  }
  window.addEventListener("pagehide", flush);

  /* ---------------- Video por tramo ---------------- */
  const clip = { video: null };
  function stopClip() {
    const v = clip.video;
    if (!v) return;
    clip.video = null;
    v.pause();
    v.remove();
  }
  function playClip(r, box) {
    stopPlayer();
    stopClip();
    const v = h("video");
    v.src = "guion-assets/" + r.id + ".mp4";
    v.poster = "guion-assets/" + r.id + ".jpg";
    v.controls = true;
    v.playsInline = true;
    v.setAttribute("aria-label", "Video " + fmt(r.in) + " a " + fmt(r.out));
    v.addEventListener("ended", stopClip);
    v.addEventListener("error", () => {
      setStatus("No se pudo cargar el video", true);
      stopClip();
    });
    box.appendChild(v);
    clip.video = v;
    v.play().catch((e) => {
      if (e && e.name === "AbortError") return;
      setStatus("No se pudo reproducir el video", true);
      stopClip();
    });
  }
  function stopAll() {
    stopPlayer();
    stopClip();
  }

  /* ---------------- Audio por tramo ---------------- */
  const player = { audio: null, row: null, timer: 0 };
  function paintPlayer() {
    const on = player.audio && !player.audio.paused;
    document.querySelectorAll("#view-guion tr[data-row]").forEach((tr) => {
      const mine = !!player.row && tr.dataset.row === player.row.id;
      const btn = tr.querySelector(".g-play");
      tr.classList.toggle("g-playing", mine);
      btn.textContent = mine && on ? "❚❚" : "▶\uFE0E";
      btn.setAttribute("aria-label", (mine && on ? "Pausar " : "Escuchar ") + btn.dataset.range);
      if (!mine) tr.querySelector(".g-progress i").style.width = "0";
    });
  }
  function tick() {
    const a = player.audio, r = player.row;
    if (!r) return;
    if (a.currentTime >= r.out || a.ended) { stopPlayer(); return; }
    const bar = document.querySelector('#view-guion tr[data-row="' + r.id + '"] .g-progress i');
    if (bar) bar.style.width = Math.max(0, (a.currentTime - r.in) / (r.out - r.in) * 100) + "%";
  }
  function stopPlayer() {
    clearInterval(player.timer);
    if (player.audio) player.audio.pause();
    player.row = null;
    paintPlayer();
  }
  function startAudio(a) {
    a.play().then(() => {
      clearInterval(player.timer);
      player.timer = setInterval(tick, 40);
      paintPlayer();
    }, (e) => {
      if (e && e.name === "AbortError") return;
      setStatus("No se pudo reproducir el audio", true);
      stopPlayer();
    });
  }
  function toggleRow(r) {
    stopClip();
    if (!player.audio) {
      player.audio = new Audio(SONG);
      player.audio.preload = "auto";
      player.audio.addEventListener("error", () => {
        setStatus("No se pudo cargar el audio", true);
        stopPlayer();
      });
    }
    const a = player.audio;
    if (player.row === r) {
      if (!a.paused) { a.pause(); clearInterval(player.timer); paintPlayer(); return; }
      startAudio(a);
      return;
    }
    stopPlayer();
    player.row = r;
    paintPlayer();
    if (a.readyState >= 1) { a.currentTime = r.in; startAudio(a); return; }
    a.addEventListener("loadedmetadata", () => { if (player.row === r) a.currentTime = r.in; }, { once: true });
    startAudio(a); // dentro del clic, para que el navegador permita el sonido
  }

  /* ---------------- Vista ---------------- */
  function setStatus(msg, bad) {
    const s = el("guion-status");
    if (s) { s.textContent = msg; s.classList.toggle("bad", !!bad); }
  }
  // Lo pendiente: desde una línea "PARA DEFINIR" hasta el final, o una línea suelta con "DEFINIR".
  function markPending(text) {
    let open = false;
    return text.split("\n").map((line) => {
      if (line.includes("PARA DEFINIR")) open = true;
      return { line, pending: open || line.includes("DEFINIR") };
    });
  }
  function paintPending(ta) {
    const mirror = ta.previousElementSibling;
    mirror.textContent = "";
    markPending(ta.value).forEach((m, i) => {
      if (i) mirror.appendChild(document.createTextNode("\n"));
      mirror.appendChild(m.pending ? h("span", "g-pending", m.line) : document.createTextNode(m.line));
    });
  }
  function grow(ta) {
    paintPending(ta);
    if (!ta.offsetParent) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + 2 + "px";
  }
  function timeCell(r) {
    const td = h("td", "g-time");
    const btn = h("button", "g-play", "▶\uFE0E");
    btn.type = "button";
    btn.dataset.range = fmt(r.in) + " a " + fmt(r.out);
    btn.setAttribute("aria-label", "Escuchar " + btn.dataset.range);
    btn.addEventListener("click", () => toggleRow(r));
    td.appendChild(btn);
    const bar = h("div", "g-progress");
    bar.appendChild(h("i"));
    td.appendChild(bar);
    td.appendChild(h("small", "", "IN"));
    td.appendChild(h("b", "", fmt(r.in)));
    td.appendChild(h("small", "", "OUT"));
    td.appendChild(h("b", "", fmt(r.out)));
    td.appendChild(h("em", "", (r.out - r.in).toFixed(1) + " s"));
    return td;
  }
  function lyricCell(r) {
    const td = h("td", "g-lyric");
    if (!r.lyric.length) { td.appendChild(h("span", "g-inst", "(instrumental)")); return td; }
    r.lyric.forEach((l) => {
      const line = h("div", "g-line");
      line.appendChild(h("small", "", l[0]));
      line.appendChild(h("span", "", l[1]));
      td.appendChild(line);
    });
    return td;
  }
  function setCell(r) {
    const td = h("td", "g-set");
    const box = h("div", "g-clip");
    const btn = h("button", "g-thumb");
    btn.type = "button";
    btn.setAttribute("aria-label", "Ver video " + fmt(r.in) + " a " + fmt(r.out));
    btn.addEventListener("click", () => playClip(r, box));
    const img = h("img");
    img.src = "guion-assets/" + r.id + ".jpg";
    img.alt = r.set;
    img.loading = "lazy";
    btn.appendChild(img);
    btn.appendChild(h("span", "", "▶\uFE0E"));
    box.appendChild(btn);
    td.appendChild(box);
    td.appendChild(h("strong", "", r.set));
    td.appendChild(h("p", "", r.desc));
    return td;
  }
  function inputCell(r, f, editable) {
    const key = r.id + ":" + f.id;
    const td = h("td", "g-input");
    const ta = h("textarea");
    ta.dataset.key = key;
    ta.value = cells[key] || "";
    ta.readOnly = !editable;
    ta.rows = 3;
    ta.setAttribute("aria-label", f.label + " " + fmt(r.in));
    if (editable) {
      ta.placeholder = f.hint;
      ta.addEventListener("input", () => { cells[key] = ta.value; grow(ta); schedule(key); });
      td.addEventListener("click", () => ta.focus());
    }
    const field = h("div", "g-field");
    const mirror = h("div", "g-mirror");
    mirror.setAttribute("aria-hidden", "true");
    field.appendChild(mirror);
    field.appendChild(ta);
    td.appendChild(field);
    return td;
  }
  function build(host, editable) {
    host.innerHTML = "";
    const bar = h("div", "g-bar");
    const title = h("div");
    title.appendChild(h("h2", "sec", "Guion por set · Apertura nueva + Maquetado v14"));
    title.appendChild(h("div", "g-note", editable
      ? "Cámara, Acción y UI se guardan solas mientras escribís."
      : "Para escribir, tocá 🔒 Editar arriba a la derecha."));
    bar.appendChild(title);
    const st = h("span", "g-status");
    st.id = "guion-status";
    st.textContent = online ? "Compartido con el equipo" : "Modo local: solo en este navegador";
    st.classList.toggle("local", !online);
    bar.appendChild(st);
    host.appendChild(bar);

    const table = h("table", "g-table");
    const head = h("tr");
    ["In / Out", "Letra", "Set"].concat(FIELDS.map((f) => f.label)).forEach((t) => head.appendChild(h("th", "", t)));
    const thead = h("thead");
    thead.appendChild(head);
    table.appendChild(thead);
    const body = h("tbody");
    let last = null;
    ROWS.forEach((r) => {
      if (r.stage !== last) {
        last = r.stage;
        const band = h("tr", "g-stage");
        const c = h("td", "", STAGES[r.stage].label);
        c.colSpan = 6;
        c.style.borderLeftColor = STAGES[r.stage].color;
        band.appendChild(c);
        body.appendChild(band);
      }
      const tr = h("tr");
      tr.dataset.row = r.id;
      tr.appendChild(timeCell(r));
      tr.appendChild(lyricCell(r));
      tr.appendChild(setCell(r));
      FIELDS.forEach((f) => tr.appendChild(inputCell(r, f, editable)));
      body.appendChild(tr);
    });
    table.appendChild(body);
    host.appendChild(table);
    host.querySelectorAll("textarea").forEach(grow);
  }
  async function render() {
    const host = el("view-guion");
    if (!host) return;
    if (!ready) ready = load();
    await ready;
    const editable = canEdit();
    if (builtFor === editable) { // ya armada: no perder el foco ni lo que se está escribiendo
      host.querySelectorAll("textarea").forEach((ta) => {
        if (ta !== document.activeElement) ta.value = cells[ta.dataset.key] || "";
        grow(ta);
      });
      return;
    }
    flush();
    stopAll();
    builtFor = editable;
    build(host, editable);
  }

  /* ---------------- Para la sección Dirección ---------------- */
  async function pending() {
    if (!ready) ready = load();
    await ready;
    return ROWS.map((r) => ({
      id: r.id,
      time: fmt(r.in) + " – " + fmt(r.out),
      set: r.set,
      fields: FIELDS.map((f) => ({
        label: f.label,
        items: markPending(cells[r.id + ":" + f.id] || "")
          .filter((m) => m.pending && m.line.trim() !== "PARA DEFINIR" && m.line.trim())
          .map((m) => m.line.trim().replace(/^-\s*/, "")),
      })).filter((f) => f.items.length),
    })).filter((b) => b.fields.length);
  }
  async function reveal(id) {
    window.GoldenHub.show("guion");
    await render();
    const tr = document.querySelector('#view-guion tr[data-row="' + id + '"]');
    if (tr) tr.scrollIntoView({ block: "center" });
  }

  window.GoldenGuion = { render, stop: stopAll, pending, reveal };
})();
