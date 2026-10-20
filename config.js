/* ============================================================
   GOLDEN — configuración
   ------------------------------------------------------------
   Para edición compartida en tiempo real, completá estos dos
   valores con los datos de tu proyecto Supabase
   (Project Settings → API).

   Si los dejás vacíos, la app funciona igual pero en modo LOCAL
   (los cambios se guardan solo en tu navegador).
   ============================================================ */
window.GOLDEN_CONFIG = {
  supabaseUrl: "https://aibhrnqyrqosjlqmpwvx.supabase.co",
  supabaseAnonKey: "sb_publishable_LhBtq_bfZrAp728AfXDxQQ_scA2tuVW",
  docId: "golden",        // id del documento (permite tener varios)

  // --- Hub / Tracker ---
  // Clave de edición del Tracker (SHA-256 en hex; NO el texto plano).
  // La clave actual es "golden2026". Para cambiarla:
  //   printf '%s' 'TU-NUEVA-CLAVE' | shasum -a 256
  // y pegá el resultado acá.
  editKeyHash: "a84052c678a529fff25775053447e5bd488b39fdb61abea4cc1f36bb5faf3ad1",

  // Bucket público de Supabase Storage para las miniaturas de escenarios.
  thumbBucket: "tracker-thumbs",
};
