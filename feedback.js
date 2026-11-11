/* ============================================================
   GOLDEN — Feedback de dirección por departamento
   Una tarjeta por departamento, con pedidos de una línea:
   [tema, qué hay que hacer]. dept usa los ids del Tracker.
   ============================================================ */
(function () {
  "use strict";

  const FEEDBACK = [
    {
      dept: "narrativa", to: "Lucila y equipo", date: "11/11 · video de la maqueta",
      items: [
        ["00:23–00:30", "Otro encuadre para la interactividad; hacer un blocking"],
        ["Idea", "Romper corona, trono o el texto \"Queen that I'm meant to be\""],
        ["Subte", "Empezar más cerca de la cara y girar antes de \"We dreamin' hard\""],
        ["Subjetiva", "Que la cámara no vuelva a Rumi: transición gráfica o corte"],
        ["Techo", "Rumi llega cayendo del cielo; flash a blanco"],
      ],
      check: "Charlarlo antes de ejecutar y llevar lo interactivo a la reunión.",
    },
    {
      dept: "animacion", to: "Paula", date: "11/11 · video de la maqueta",
      items: [
        ["Poses", "Están bien; Rumi nunca camina: pose tras pose"],
        ["Entre poses", "Que se sienta como resultado del swipe hacia afuera"],
      ],
    },
    {
      dept: "gameplay", to: "Pablo Altamiranda", date: "11/11 · video de la maqueta",
      items: [
        ["Combate", "Swipes hacia los lados, unos 8; Rumi centrada"],
        ["00:23–00:30", "Usar los taps de aros que se cierran"],
        ["Taps", "Falta definir el lenguaje; quizás en el tren"],
      ],
    },
    {
      dept: "ui", to: "Andrés Chouhy", date: "06/11",
      link: { label: "Ver Loom ↗", url: "https://www.loom.com/share/02c2358e357342948a28ed0e9e30306c" },
      items: [
        ["Forma", "Salchicha corta: más petisa y redonda"],
        ["Brillo", "Más glow y partículas: etéreo, no sólido"],
        ["Tap", "Se ve sobre la pieza, no donde tocaste"],
        ["Miss", "Anillo magenta grande, rápido y en el lugar del error"],
        ["Magenta", "Se colorea la pieza, no todo el mundo"],
        ["Puntaje", "Número que sube desde la pieza, como moneda de Mario"],
        ["Swipes", "Sin titilar, más quietos y con la dirección adentro"],
        ["Barra", "Cambiarla de forma y de lugar"],
      ],
      check: "Dio Perfect con una pieza que ya se iba: ¿es un error?",
    },
    {
      dept: "animacion", to: "Equipo de animación", date: "06/11",
      items: [
        ["Entrega", "Blocking rápido, sin polish"],
        ["Formato", "Movimientos sueltos de 3 frames, no escenas de 10 s"],
        ["Rumi", "Baile más sutil en el arranque"],
        ["Demonios", "Que se le vengan encima para atacar"],
      ],
    },
    {
      dept: "3d", to: "Lautaro Schipizza y equipo 3D", date: "06/11",
      items: [
        ["Prioridad", "Placeholders: abstracto, techo lateral y subte roto"],
        ["Desierto", "Más negro y demoníaco; la textura del piso queda"],
        ["Apertura", "Rumi camina cuando arranca la música"],
      ],
    },
    {
      dept: "gameplay", to: "Pablo Altamiranda", date: "06/11",
      items: [
        ["Combate", "Unos 6 o 7 taps: ataque, bloqueo y contraataque"],
        ["Timing", "Tap a tiempo bloquea; si no, el demonio te pega"],
        ["UI vertical", "Probarla pronto sobre fondo negro"],
        ["Taps", "Se ocupa de la mecánica que tenía Andrés"],
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

  function card(f, d) {
    const box = h("article", "fb-card");
    box.dataset.dept = f.dept;
    const head = h("header", "fb-head");
    head.appendChild(h("span", "fb-ico", d.ico));
    const who = h("div", "fb-who");
    who.appendChild(h("h3", "", d.label));
    who.appendChild(h("span", "", f.to + " · " + f.date));
    head.appendChild(who);
    if (f.link) {
      const a = h("a", "btn-hub accent fb-link", f.link.label);
      a.href = f.link.url;
      a.target = "_blank";
      a.rel = "noopener";
      head.appendChild(a);
    }
    box.appendChild(head);
    const list = h("dl", "fb-list");
    f.items.forEach((it) => {
      list.appendChild(h("dt", "", it[0]));
      list.appendChild(h("dd", "", it[1]));
    });
    box.appendChild(list);
    if (f.check) box.appendChild(h("p", "fb-check", f.check));
    return box;
  }

  let rendered = false;
  function render() {
    const host = el("view-feedback");
    if (!host || rendered) return;
    rendered = true;
    const depts = (window.GoldenHub && window.GoldenHub.depts) || [];
    host.appendChild(h("h2", "sec", "Feedback de dirección · Federico Heller"));
    const grid = h("div", "fb-grid");
    depts.forEach((d) => FEEDBACK.filter((f) => f.dept === d.id).forEach((f) => grid.appendChild(card(f, d))));
    host.appendChild(grid);
  }

  window.GoldenFeedback = { render };
})();
