-- ============================================================
-- GOLDEN — tabla del Guion por set (pestaña "Guion" del Hub)
-- Solo agrega una tabla nueva: no toca segments, doc_meta ni
-- tracker_items. Se puede correr más de una vez.
-- Pegá y ejecutá esto en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- Una fila por celda (fila del guion + campo: camera / action / ui)
create table if not exists guion_cells (
  id          text primary key,             -- doc:fila:campo
  doc_id      text not null default 'golden',
  row_id      text not null,
  field       text not null,
  text        text not null default '',
  updated_at  timestamptz default now()
);
create index if not exists guion_doc_idx on guion_cells (doc_id);

alter table guion_cells enable row level security;
drop policy if exists "open guion" on guion_cells;
create policy "open guion" on guion_cells
  for all using (true) with check (true);

-- Realtime: avisar cambios a todos los navegadores conectados
do $$ begin
  alter publication supabase_realtime add table guion_cells;
exception when duplicate_object then null;
end $$;
