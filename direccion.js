/* ============================================================
   GOLDEN — Dirección: todo lo que falta definir por Federico
   Junta lo que quedó por responder en Reuniones y lo marcado como
   PARA DEFINIR en el Guion. Se arma solo: no hay datos propios acá.
   ============================================================ */
(function () {
  "use strict";

  const el = (id) => document.getElementById(id);
  function h(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function meetingsBlock(items) {
    const box = h("section", "dir-section");
    const head = h("div", "note-dept");
    head.appendChild(h("h3", "", "Por responder de las reuniones"));
    head.appendChild(h("span", "count", String(items.length)));
    head.appendChild(h("span", "pline"));
    box.appendChild(head);
    const card = h("article", "note-card");
    const ul = h("ul", "note-plain");
    items.forEach((it) => {
      const li = h("li", "", it.text);
      li.appendChild(h("span", "dir-source", " · Reunión de " + it.meeting.toLowerCase() + ", " + it.date));
      ul.appendChild(li);
    });
    card.appendChild(ul);
    box.appendChild(card);
    return box;
  }

  function guionBlock(blocks) {
    const box = h("section", "dir-section");
    const total = blocks.reduce((n, b) => n + b.fields.reduce((m, f) => m + f.items.length, 0), 0);
    const head = h("div", "note-dept");
    head.appendChild(h("h3", "", "Para definir en el Guion"));
    head.appendChild(h("span", "count", String(total)));
    head.appendChild(h("span", "pline"));
    box.appendChild(head);
    if (!blocks.length) {
      box.appendChild(h("p", "note-empty", "No hay nada marcado como PARA DEFINIR en el Guion."));
      return box;
    }
    blocks.forEach((b) => {
      const card = h("article", "note-card");
      card.dataset.row = b.id;
      const top = h("div", "note-head");
      const title = h("div");
      title.appendChild(h("div", "dir-range", b.time));
      title.appendChild(h("h4", "", b.set));
      top.appendChild(title);
      const go = h("button", "btn-hub accent", "Ver en Guion");
      go.type = "button";
      go.addEventListener("click", () => window.GoldenGuion.reveal(b.id));
      top.appendChild(go);
      card.appendChild(top);
      const ul = h("ul", "note-list dir-list");
      b.fields.forEach((f) => f.items.forEach((text) => {
        const li = h("li");
        li.appendChild(h("span", "dir-field", f.label));
        li.appendChild(h("span", "", text));
        ul.appendChild(li);
      }));
      card.appendChild(ul);
      box.appendChild(card);
    });
    return box;
  }

  let turn = 0;
  async function render() {
    const host = el("view-direccion");
    if (!host) return;
    const mine = ++turn;
    const blocks = window.GoldenGuion ? await window.GoldenGuion.pending() : [];
    if (mine !== turn) return;
    const meetings = (window.GoldenReuniones && window.GoldenReuniones.forFederico()) || [];
    host.innerHTML = "";
    host.appendChild(h("h2", "sec", "Dirección · Para definir por Federico"));
    host.appendChild(h("p", "note-intro", "Se actualiza sola: lo que se escribe debajo de PARA DEFINIR en el Guion aparece acá, y al resolverlo desaparece."));
    host.appendChild(meetingsBlock(meetings));
    host.appendChild(guionBlock(blocks));
  }

  window.GoldenDireccion = { render };
})();
