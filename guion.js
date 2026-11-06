/* ============================================================
   GOLDEN — Guion por set (Maquetado v14)
   In/Out, letra y set son fijos (ROWS). Cámara, Acción y UI se
   escriben acá: una fila por celda en Supabase (guion_cells), o
   localStorage si la tabla todavía no existe.
   ============================================================ */
(function () {
  "use strict";

  const CFG = window.GOLDEN_CONFIG || {};
  const DOC = CFG.docId || "golden";
  const LS_KEY = "golden_guion_v1";
  const TABLE = "guion_cells";
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
    {"id": "r0000", "stage": "A", "in": 0.0, "out": 9.6, "set": "S01 · Seúl, calle Hanok (cenital)", "desc": "Plano aéreo de techos, cerezos y pósters de HUNTR/X. Rumi chiquita caminando. Título \"GOLDEN · Street Scenario · Seoul\".", "lyric": []},
    {"id": "r0096", "stage": "A", "in": 9.6, "out": 16.0, "set": "S02 · Seúl, calle Hanok (a nivel calle)", "desc": "Día. Farolitos, cerezos, pétalos cayendo. Rumi camina hacia cámara.", "lyric": []},
    {"id": "r0160", "stage": "A", "in": 16.0, "out": 23.1, "set": "S02 · Seúl, calle Hanok (cont.)", "desc": "Misma calle. Arranca la voz.", "lyric": [["00:16", "I was a ghost, I was alone"], ["≈00:20", "eoduwojin apgil soge"]]},
    {"id": "r0231", "stage": "A", "in": 23.1, "out": 28.2, "set": "S03 · Close-up, bokeh magenta", "desc": "Rumi de cintura para arriba, fondo de luces rosas desenfocadas. Sale con fundido al oscuro.", "lyric": [["00:24", "Given the throne, I didn't know how to believe"]]},
    {"id": "r0282", "stage": "A", "in": 28.2, "out": 30.8, "set": "S02 · Calle Hanok → entrada al callejón", "desc": "Vuelve a la calle; aparecen muro de ladrillos y póster en primer plano. Sale con flash blanco.", "lyric": [["00:28", "I was the queen that I'm meant to be"]]},
    {"id": "r0308", "stage": "A", "in": 30.8, "out": 38.4, "set": "S04 · Pasarela, alfombra roja", "desc": "Escaleras blancas, público con flashes. Pantalla gigante con palabras (TIME, FEARS, LIES). Arranca cerca y se abre a plano general (~00:32).", "lyric": [["00:31", "I lived two lives, tried to play both sides"], ["00:35", "But I couldn't find my own place"]]},
    {"id": "r0384", "stage": "A", "in": 38.4, "out": 43.1, "set": "S05 · Close-up, bokeh callejón", "desc": "Fondo cálido desenfocado. Desde 00:40.0, comentarios de redes sobre pantalla (\"LIKE I'M BORN TO BE\").", "lyric": [["00:39", "Called a problem child 'cause I got too wild"]]},
    {"id": "r0431", "stage": "A", "in": 43.1, "out": 46.5, "set": "S06 · Callejón de ladrillos con pósters", "desc": "Pasillo angosto lleno de pósters. Desde ~00:45.3 acerca hasta el pecho y corta con flash.", "lyric": [["00:43", "But now that's how I'm getting paid 끝없이 on stage"]]},
    {"id": "r0465", "stage": "B", "in": 46.5, "out": 54.6, "set": "S07 · Subte, de día", "desc": "Vagón con sillones azules, ventanas con skyline y río, valija y objetos en el piso. Cámara se mueve dentro del vagón.", "lyric": [["00:47", "I'm done hidin', now I'm shinin'"], ["00:51", "Like I'm born to be"]]},
    {"id": "r0546", "stage": "B", "in": 54.6, "out": 62.4, "set": "S08 · Subte, modo demon", "desc": "Mismo vagón, cambio por corte: oscuro violeta, venas en ventanas, rayos en el piso, Rumi con luz roja.", "lyric": [["00:54", "We dreamin' hard, we came so far"], ["00:58", "Now I believe"]]},
    {"id": "r0624", "stage": "B", "in": 62.4, "out": 70.1, "set": "S09 · Cielo sobre Seúl, ascenso", "desc": "Entra con flash blanco. Rumi flotando, ciudad abajo, cielo rosa. \"Up up up · rompe el techo y sube\". HUD + interfaz Z en maqueta.", "lyric": [["01:02", "We're goin' up, up, up, it's our moment"], ["01:05", "You know together we're glowin'"], ["01:07", "Gonna be, gonna be golden"]]},
    {"id": "r0701", "stage": "B", "in": 70.1, "out": 78.2, "set": "S10 · Cielo violeta, giro y combate", "desc": "Disolvencia. Rumi girando en el aire con espada, demonios alrededor. \"Gira en el aire y mata demonios\". HUD + interfaz Z en maqueta.", "lyric": [["01:09", "Oh-oh-oh, up, up, up with our voices"], ["01:13", "yeongwonhi kkaejil su eomneun"], ["01:15", "Gonna be, gonna be golden"]]},
    {"id": "r0782", "stage": "B", "in": 78.2, "out": 84.9, "set": "S11 · Vórtice de energía, vuelo", "desc": "Disolvencia. Close de Rumi volando de frente entre aros de luz. \"Vuela hacia el camino de cristal\". HUD + interfaz Z en maqueta.", "lyric": [["01:18", "Oh-oh-oh, I'm done hidin', now I'm shinin'"], ["01:22", "Like I'm born to be"]]},
    {"id": "r0849", "stage": "B", "in": 84.9, "out": 94.9, "set": "S12 · Camino de cristal sobre nubes", "desc": "Rumi de espaldas avanzando, cielo de atardecer, demonios volando en silueta. Sin HUD.", "lyric": [["01:26", "Oh, our time, no fears, no lies"], ["01:29", "That's who we're born to be"]]},
    {"id": "r0949", "stage": "B", "in": 94.9, "out": 107.0, "set": "S13 · Desierto de roca, atardecer", "desc": "Suelo agrietado, formaciones rocosas de fondo, sol bajo. Rumi camina hacia cámara. Sin HUD.", "lyric": [["01:35", "Waited so long to break these walls down"], ["01:39", "To wake up and feel like me"], ["01:43", "Put these patterns all in the past now"]]},
    {"id": "r1070", "stage": "B", "in": 107.0, "out": 111.9, "set": "S14 · Paredes de roca, cañón", "desc": "Mismo desierto: suben paredes con polvo (desde 01:47.0) y la encierran hasta dejar una rendija de cielo.", "lyric": [["01:47", "And finally live like the girl they all see"]]},
    {"id": "r1119", "stage": "B", "in": 111.9, "out": 123.1, "set": "S15 · Espacio abstracto en colapso", "desc": "Ruinas flotando, tonos violetas, eclipse arriba. Rumi de espaldas, con espada. \"No more hiding · el espacio se deforma y colapsa\". HUD + interfaz Z en maqueta.", "lyric": [["01:52", "No more hiding, I'll be shinin'"], ["01:56", "Like I'm born to be"], ["01:59", "'Cause we are hunters, voices strong"]]},
    {"id": "r1231", "stage": "B", "in": 123.1, "out": 127.0, "set": "S16 · Explosión de oro", "desc": "Disolvencia. Rumi de espaldas, brazos abiertos, ráfagas doradas. \"Todo se vuelve oro\". HUD + interfaz Z en maqueta.", "lyric": [["02:04", "And I know I believe"]]},
    {"id": "r1270", "stage": "C", "in": 127.0, "out": 138.1, "set": "S16 · Explosión de oro (cont.)", "desc": "Mismo plano; entra el estribillo. HUD + interfaz Z en maqueta.", "lyric": [["02:07", "We're goin' up, up, up, it's our moment"], ["02:11", "You know together we're glowin'"], ["02:13", "Gonna be, gonna be golden"], ["≈02:14", "Oh-oh-oh, up, up, up with our voices"]]},
    {"id": "r1381", "stage": "C", "in": 138.1, "out": 150.2, "set": "S17 · Escenario de oro, combate", "desc": "Disolvencia. Escalinata dorada, pantallas con Rumi, demonios estallando; Rumi con espada. \"Combate de espadas · cada demonio arma el escenario\". HUD + interfaz Z en maqueta.", "lyric": [["≈02:18", "yeongwonhi kkaejil su eomneun"], ["≈02:20", "Gonna be, gonna be golden"], ["≈02:22", "Oh-oh-oh, I'm done hidin', now I'm shinin'"], ["≈02:27", "Like I'm born to be"]]},
    {"id": "r1502", "stage": "C", "in": 150.2, "out": 159.9, "set": "S17 · Escenario de oro, combate (cont.)", "desc": "Mismo plano. HUD + interfaz Z en maqueta.", "lyric": [["≈02:30", "Oh, our time, no fears, no lies"], ["≈02:35", "That's who we're born to be"], ["≈02:38", "You know we're gonna be, gonna be golden"]]},
    {"id": "r1599", "stage": "C", "in": 159.9, "out": 175.0, "set": "S18 · Mega estadio", "desc": "Entra con flash blanco. Escenario monumental dorado, pantallas, láseres, público masivo. Zoom out lento. Sin HUD.", "lyric": [["≈02:41", "We're gonna be, gonna be"], ["≈02:42", "Born to be, born to be glowin'"], ["≈02:45", "You know that it's our time, no fears, no lies"], ["≈02:51", "That's who we're born to be"]]},
    {"id": "r1750", "stage": "C", "in": 175.0, "out": 194.6, "set": "S18 · Mega estadio (cont.)", "desc": "Sigue el zoom out hasta el final. La música se apaga ~03:11. Sin HUD.", "lyric": []},
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
    const p = key.split(":");
    return { id: DOC + ":" + key, doc_id: DOC, row_id: p[0], field: p[1], text };
  }
  async function load() {
    const local = readLocal();
    cells = local;
    if (!CFG.supabaseUrl || !CFG.supabaseAnonKey || typeof window.supabase === "undefined") return;
    try {
      sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
      const { data, error } = await sb.from(TABLE).select("row_id,field,text").eq("doc_id", DOC);
      if (error) throw error;
      const remote = {};
      (data || []).forEach((r) => { remote[r.row_id + ":" + r.field] = r.text; });
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
        .on("postgres_changes", { event: "*", schema: "public", table: TABLE, filter: "doc_id=eq." + DOC }, onRemote)
        .subscribe();
    } catch (e) { online = false; }
  }
  function onRemote(p) {
    const r = p.new && p.new.row_id ? p.new : null;
    if (!r) return;
    const key = r.row_id + ":" + r.field;
    if (timers[key]) return; // hay un cambio propio sin guardar en esta celda
    cells[key] = r.text;
    const ta = document.querySelector('#view-guion textarea[data-key="' + key + '"]');
    if (ta && ta !== document.activeElement) { ta.value = r.text; grow(ta); }
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
  function grow(ta) {
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
    const img = h("img");
    img.src = "guion-assets/" + r.id + ".jpg";
    img.alt = r.set;
    img.loading = "lazy";
    td.appendChild(img);
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
    td.appendChild(ta);
    return td;
  }
  function build(host, editable) {
    host.innerHTML = "";
    const bar = h("div", "g-bar");
    const title = h("div");
    title.appendChild(h("h2", "sec", "Guion por set · Maquetado v14"));
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
    stopPlayer();
    builtFor = editable;
    build(host, editable);
  }

  window.GoldenGuion = { render, stop: stopPlayer };
})();
