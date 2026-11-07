/* ============================================================
   GOLDEN — Reuniones
   Una tarjeta por reunión, agrupadas por fecha: participantes, de
   qué fue y pasos a seguir. La más reciente se muestra abierta.
   ============================================================ */
(function () {
  "use strict";

  const REUNIONES = [
    {
      id: "guion-2026-11-06",
      title: "Guion",
      iso: "2026-11-06",
      date: "06/11/2026",
      day: "Viernes 6 de noviembre de 2026",
      time: "15:00",
      people: ["Lucila Trobbiani", "Federico Heller", "Camila Marturano", "Daniela Novak", "Andrés Chouhy"],
      summary: "Definir cámara, acción y UI del guion hasta ~01:22, y revisar con Andrés el feedback de UI.",
      defined: [
        "Foco de producción acotado hasta ~01:22, antes del camino de cristal, para detallar ese tramo sin definir todo ahora.",
        "En ese tramo se presentan los tres tipos de UI: clásica, geolocalizada y vertical.",
        "Se saca la parte de los comentarios de redes y el regreso a Seúl. De 00:30 a 00:46 todo pasa en la alfombra roja, con los demonios.",
        "Subte: arranca en plano corto y la cámara se aleja mientras el espacio se vuelve magenta y de combate.",
        "\"We're going up\": pelea en el techo del subte, en vista lateral y con tap geolocalizado. Reemplaza al cielo en ese momento.",
        "Ascenso: UI clásica. El camino de cristal mantiene la misma UI, sin sumar una nueva por 6,7 segundos.",
        "Animación: pedir movimientos puntuales en blocking, para que desarrollo los active.",
        "Primero mecánica; fondos y ambientación son menos prioritarios por ahora.",
      ],
      open: [
        "Qué pasa entre 00:23 y 00:30: es el tramo menos resuelto (ver el detalle por momento).",
        "No lugar: si existe y cómo se ve. En la alfombra roja queda pendiente hasta tener resuelto cómo mata a los demonios.",
        "Transición de alfombra roja a subte; Federico sugirió que pase por un lugar neutro.",
        "Cómo se conecta la subjetiva del subte con el salto y la rotura del techo.",
        "Si la UI vertical funciona: hay que probarla.",
        "Desierto: cómo es la transición de lo demoníaco a lo dorado.",
        "Cuántos taps lleva el combate de la alfombra roja y cómo se reparten.",
        "Alcance para el próximo mes: la transcripción dice \"minuto 15\". Falta confirmar a qué tiempo se refiere.",
      ],
      federico: [
        "Propuesta más clara para el tramo 00:23–00:30: vista top, no lugar y qué UI lleva. Dijo que lo iba a pensar y responder después de la reunión.",
        "Frame de vista cenital con patterns en Photoshop, para evaluar la secuencia.",
        "Feedback puntual de la apertura: posición de las letras y movimiento de cámara.",
        "Brief de combates, si hace falta, a partir de las referencias que le pasan Lucila y Daniela.",
        "Si el tutorial inicial se define y cómo: quedó para ver más adelante, una vez definidas las UIs.",
      ],
      steps: [
        ["Federico", "Definir el tramo 00:23–00:30, mandar el frame de vista top y el feedback de letras y cámara."],
        ["Lucila", "Reenviar a Federico el material nuevo de cámara."],
        ["Lucila y Daniela", "Recortar referencias de combates."],
        ["Lucila y Federico", "Hablar con Camila para alinear ideas."],
        ["Paula", "Mandar la animación en blocking."],
        ["Camila", "Armar la lista de movimientos de combate."],
        ["Pablo", "Armar la base de animaciones y los taps del combate; probar la UI vertical."],
        ["Daniela", "Confirmar con Pablo el sistema para llamar animaciones."],
        ["Andrés", "Salchicha corta, glow y partículas."],
        ["Lauti", "Placeholders de los tres fondos nuevos."],
      ],
      moments: [
        { time: "00:00.0 – 00:09.3", name: "Sobrevuelo aéreo",
          agreed: "El arranque está bien así. Federico manda aparte el feedback de cámara y letras.",
          open: "Tutorial de unos 5 s: lista chica de gestos que se tachan al hacerlos; si lo ignorás, sigue igual. Camila propuso arrancar con cielo y título y después entrar a la maqueta; Federico quería mostrar el escenario, aunque le gusta traer pronto lo abstracto." },
        { time: "00:09.3 – 00:16.0", name: "Baja a la calle",
          agreed: "En el plano general puede no pasar nada particular.",
          open: "Que Rumi empiece a caminar cuando arranca la música. Letras centradas, salvo que haya subtítulo." },
        { time: "00:16.0 – 00:23.1", name: "I was a ghost",
          agreed: "UI normal (modo ritmo).",
          open: "Baile más sutil que la primera demo. Camila: mezclar coreografía y batalla, con espada. Federico: un tap saca la espada, con el riesgo de que sean muy pocos taps." },
        { time: "00:23.1 – 00:30.8", name: "Given the throne · I was the queen",
          agreed: "El close-up sirve para el personaje, no para presentar una UI. Los patterns tienen que ser objetos 3D, no gráficos.",
          open: "Opciones: close-up de una frase y corte a patterns en el piso; vista top con patterns que la persiguen; cámara quieta con formas demoníacas; demonios que salen del piso, tipo \"pegale al topo\"; rota la cámara, desaparece el set y quitás patterns; correr y esquivar; subjetiva magenta con demonios. También: no lugar como espacio neutro y UI vertical o geolocalizada." },
        { time: "00:30.8 – 00:46.5", name: "I lived two lives · Problem child",
          agreed: "Swipes para las poses y después combate. Se saca lo que seguía: todo sigue en la alfombra roja. Prioridad: que mate a los demonios; el no espacio queda pendiente. La cámara encuadra con el primer demonio y corrige.",
          open: "Un swipe que elimine el fondo. Reemplazar el fondo, tipo upside down, o una versión magenta del set. Más taps: ir, defenderse y atacar con el segundo demonio." },
        { time: "00:46.5 – 00:54.6", name: "I'm done hidin'",
          agreed: "Plano corto, sin que se entienda que es el subte. La cámara se aleja mientras todo se vuelve magenta y oscuro.",
          open: "Lip sync y tocar \"unas cosas\". Camila propuso ubicar acá el vuelo; Federico prefirió no romper la secuencia y resolverlo desde dirección." },
        { time: "00:54.6 – 01:02.4", name: "We dreamin' hard",
          agreed: "Todo magenta y tap para matar demonios, aprovechando la percusión. UI subjetiva.",
          open: "Cómo se pasa de la subjetiva a verla: la cámara retrocede, la encuentra, salta y rompe el techo." },
        { time: "01:02.4 – 01:17.8", name: "Going up · Up with our voices",
          agreed: "Techo del subte, lateral tipo plataformas, tap geolocalizado.",
          open: "Volar primero y caer sobre el techo. Si puede ser de noche. Volver al subte para reciclarlo." },
        { time: "01:17.8 – 01:24.9", name: "Ascenso al cielo",
          agreed: "Transición al cielo con UI clásica. Probarla pronto con Pablo sobre fondo negro.",
          open: "Girar la UI a vertical, con una sola barra larga, como la referencia de Netflix. Fondo abstracto simple." },
        { time: "01:24.9 – 01:34.9", name: "Camino de cristal",
          agreed: "No cambiar la UI ni pasar a geolocalizada.",
          open: "Si funciona mejor la UI del comienzo con la cámara más alta." },
        { time: "01:34.9 – 01:47.0", name: "Desierto",
          agreed: "Última pausa antes del clímax. Estética más demoníaca, formas que emergen del piso, se tapean y transición a dorado.",
          open: "Cómo es esa transición. Crecer o derrumbar montañas. Patterns que se vuelven dorados. Espacio abstracto con líneas que se doran. Paleta más romántica." },
        { time: "01:47.0 – 02:07.0", name: "Paredes · No more hiding · Explosión de oro",
          agreed: "Nada cerrado.",
          open: "Que el mundo se fracture y salga del lado golden. Pelea sin escapatoria, con patterns desde abajo. Lluvia de partículas como puente al espacio dorado." },
        { time: "02:07.0 – 02:39.9", name: "Estribillo · Escenario de oro",
          agreed: "Combate fuerte en un escenario dorado.",
          open: "Rumi avanza hacia cámara y los demonios llegan desde atrás de cámara. Al matarlos se vuelven oro; si te pegan, magenta." },
        { time: "02:39.9 – 03:14.6", name: "Mega estadio y final",
          agreed: "Termina en un escenario, con victoria total.",
          open: "UI de tap en Z. Daniela: es largo y era un escenario de coreografía, ya libre y bailando." },
      ],
    },
  ];

  const el = (id) => document.getElementById(id);
  function h(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function listBlock(title, items, cls) {
    const box = h("section", "block " + cls);
    box.appendChild(h("h3", "", title));
    const ul = h("ul", "note-plain");
    items.forEach((t) => ul.appendChild(h("li", "", t)));
    box.appendChild(ul);
    return box;
  }
  function stepsBlock(steps) {
    const box = h("section", "mtg-steps");
    box.appendChild(h("h4", "mtg-label", "Pasos a seguir"));
    steps.forEach((s) => {
      const row = h("div", "note-step");
      row.appendChild(h("b", "", s[0]));
      row.appendChild(h("span", "", s[1]));
      box.appendChild(row);
    });
    return box;
  }
  function momentsBlock(moments) {
    const wrap = h("section", "note-moments");
    wrap.appendChild(h("h3", "", "Qué se habló en cada momento"));
    const scroll = h("div", "note-scroll");
    const table = h("table");
    const thead = h("thead");
    const head = h("tr");
    ["In – Out", "Momento", "Se acordó", "Sin concluir"].forEach((t) => head.appendChild(h("th", "", t)));
    thead.appendChild(head);
    table.appendChild(thead);
    const body = h("tbody");
    moments.forEach((m) => {
      const tr = h("tr");
      tr.appendChild(h("td", "note-range", m.time));
      tr.appendChild(h("td", "note-name", m.name));
      tr.appendChild(h("td", "", m.agreed));
      tr.appendChild(h("td", "note-open", m.open));
      body.appendChild(tr);
    });
    table.appendChild(body);
    scroll.appendChild(table);
    wrap.appendChild(scroll);
    return wrap;
  }
  function meeting(r, open) {
    const d = h("details", "mtg");
    d.open = open;
    d.dataset.meeting = r.id;
    const sum = h("summary");
    sum.appendChild(h("span", "mtg-time", r.time));
    sum.appendChild(h("span", "mtg-title", r.title));
    d.appendChild(sum);
    const body = h("div", "mtg-body");
    const people = h("div", "mtg-people");
    r.people.forEach((p) => people.appendChild(h("span", "mtg-pill", p)));
    body.appendChild(people);
    body.appendChild(h("h4", "mtg-label", "De qué fue"));
    body.appendChild(h("p", "mtg-summary", r.summary));
    body.appendChild(stepsBlock(r.steps));
    const more = h("details", "mtg-more");
    more.appendChild(h("summary", "", "Ver todo lo que se habló"));
    const grid = h("div", "two-col");
    grid.appendChild(listBlock("Se definió", r.defined, "note-ok"));
    grid.appendChild(listBlock("Quedó inconcluso", r.open, "note-pending"));
    more.appendChild(grid);
    more.appendChild(momentsBlock(r.moments));
    body.appendChild(more);
    d.appendChild(body);
    return d;
  }

  let rendered = false;
  function render() {
    const host = el("view-reuniones");
    if (!host || rendered) return;
    rendered = true;
    host.appendChild(h("h2", "sec", "Reuniones"));
    const sorted = REUNIONES.slice().sort((a, b) => (a.iso < b.iso ? 1 : -1));
    let lastDay = null;
    sorted.forEach((r, i) => {
      if (r.iso !== lastDay) {
        lastDay = r.iso;
        host.appendChild(h("h3", "mtg-day", r.day));
      }
      host.appendChild(meeting(r, i === 0));
    });
  }

  function forFederico() {
    return REUNIONES.flatMap((r) => r.federico.map((text) => ({ text, meeting: r.title, date: r.date })));
  }

  window.GoldenReuniones = { render, forFederico };
})();
