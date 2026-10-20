-- ============================================================
-- GOLDEN — esquema Supabase (edición compartida en tiempo real)
-- Pegá y ejecutá esto en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- Un bloque de la canción por fila (el contenido va como JSON)
create table if not exists segments (
  id          text primary key,
  doc_id      text not null default 'golden',
  pos         double precision default 0,   -- orden (segundos de inicio)
  data        jsonb not null,               -- el objeto completo del bloque
  updated_at  timestamptz default now()
);

-- Metadatos del documento (título, duración, estado, versión)
create table if not exists doc_meta (
  id          text primary key,             -- = doc_id
  data        jsonb not null,
  updated_at  timestamptz default now()
);

create index if not exists segments_doc_idx on segments (doc_id, pos);

-- ------------------------------------------------------------
-- Permisos. Para una herramienta interna de prototipo dejamos
-- lectura/escritura abierta con la anon key. (Cualquiera con el
-- link y la key puede editar — es intencional para el equipo.)
-- ------------------------------------------------------------
alter table segments enable row level security;
alter table doc_meta enable row level security;

drop policy if exists "open segments" on segments;
drop policy if exists "open meta" on doc_meta;

create policy "open segments" on segments
  for all using (true) with check (true);
create policy "open meta" on doc_meta
  for all using (true) with check (true);

-- ------------------------------------------------------------
-- TRACKER DE PRODUCCIÓN (Hub)
-- Una fila por item: tarea, escenario o meta (objetivos del Resumen).
-- ------------------------------------------------------------
create table if not exists tracker_items (
  id          text primary key,             -- id del item
  doc_id      text not null default 'golden',
  kind        text not null,                -- 'task' | 'scenario' | 'meta'
  pos         double precision default 0,   -- orden dentro de su grupo
  data        jsonb not null,               -- el objeto completo del item
  updated_at  timestamptz default now()
);
create index if not exists tracker_doc_idx on tracker_items (doc_id, kind, pos);

alter table tracker_items enable row level security;
drop policy if exists "open tracker" on tracker_items;
create policy "open tracker" on tracker_items
  for all using (true) with check (true);

-- Realtime: avisar cambios a todos los navegadores conectados
alter publication supabase_realtime add table segments;
alter publication supabase_realtime add table doc_meta;
alter publication supabase_realtime add table tracker_items;

-- ------------------------------------------------------------
-- STORAGE: bucket público para miniaturas de escenarios
-- (si preferís, crealo desde el panel: Storage → New bucket →
--  nombre "tracker-thumbs" → Public. Esto hace lo mismo por SQL.)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('tracker-thumbs', 'tracker-thumbs', true)
on conflict (id) do nothing;

drop policy if exists "tracker thumbs read" on storage.objects;
drop policy if exists "tracker thumbs write" on storage.objects;
create policy "tracker thumbs read" on storage.objects
  for select using (bucket_id = 'tracker-thumbs');
create policy "tracker thumbs write" on storage.objects
  for all using (bucket_id = 'tracker-thumbs') with check (bucket_id = 'tracker-thumbs');
