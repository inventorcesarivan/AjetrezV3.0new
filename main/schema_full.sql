
-- Ajetrez Online — Supabase MVP Schema (completo)
-- Ejecuta esto en Database → SQL del proyecto Supabase.

-- 1) profiles (opcional)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- 2) games
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  variant text not null, -- 'simple' | 'amenaza' | 'guerra'
  status text not null default 'waiting', -- 'waiting' | 'active' | 'finished'
  white_id uuid references auth.users(id),
  black_id uuid references auth.users(id),
  turn text not null default 'w', -- 'w' | 'b'
  last_ply int not null default 0,
  state_json jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists games_status_idx on public.games(status);
create index if not exists games_variant_idx on public.games(variant);

-- 3) moves
create table if not exists public.moves (
  id bigserial primary key,
  game_id uuid not null references public.games(id) on delete cascade,
  ply int not null,
  created_by uuid not null references auth.users(id),
  kind text not null check (kind in ('move','shift','promote','resign','system')),
  payload jsonb not null,
  created_at timestamptz default now()
);
create index if not exists moves_game_ply_idx on public.moves(game_id, ply);

-- ---------- RLS ----------
alter table public.games enable row level security;
alter table public.moves enable row level security;

-- Ver partidas waiting o en las que participo
create policy if not exists "select_waiting_or_participant"
on public.games for select
using (
  status = 'waiting' or auth.uid() = white_id or auth.uid() = black_id
);

-- Crear partidas (auth requerido)
create policy if not exists "insert_games_authenticated"
on public.games for insert to authenticated with check (true);

-- Actualizar partidas sólo participantes
create policy if not exists "update_games_participants"
on public.games for update
using (auth.uid() = white_id or auth.uid() = black_id)
with check (auth.uid() = white_id or auth.uid() = black_id);

-- Reclamar como negras una waiting (si no hay black_id)
create policy if not exists "claim_waiting_game_as_black"
on public.games for update to authenticated
using (status = 'waiting' and black_id is null)
with check (black_id = auth.uid());

-- MOVES: ver/insertar sólo participantes
create policy if not exists "select_moves_participants"
on public.moves for select using (
  exists (select 1 from public.games g where g.id = moves.game_id and (auth.uid() = g.white_id or auth.uid() = g.black_id))
);
create policy if not exists "insert_moves_participants"
on public.moves for insert to authenticated with check (
  exists (select 1 from public.games g where g.id = moves.game_id and (auth.uid() = g.white_id or auth.uid() = g.black_id))
);

-- Bloquear update/delete de moves
create policy if not exists "update_moves_none" on public.moves for update using (false) with check (false);
create policy if not exists "delete_moves_none" on public.moves for delete using (false);

-- ---------- Helpers ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_games_touch on public.games;
create trigger trg_games_touch
before update on public.games
for each row execute function public.touch_updated_at();

-- (Opcional) Enforce turno simple
create or replace function public.enforce_turn()
returns trigger language plpgsql as $$
declare
  g record;
begin
  select * into g from public.games where id = new.game_id for update;
  if g is null then
    raise exception 'Game does not exist';
  end if;

  if new.kind in ('move','shift','promote') then
    if g.turn = 'w' and new.created_by <> g.white_id then
      raise exception 'Not your turn (white)';
    end if;
    if g.turn = 'b' and new.created_by <> g.black_id then
      raise exception 'Not your turn (black)';
    end if;
    new.ply := g.last_ply + 1;
    update public.games
      set last_ply = last_ply + 1,
          turn = case when g.turn = 'w' then 'b' else 'w' end
      where id = g.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_moves_enforce_turn on public.moves;
create trigger trg_moves_enforce_turn
before insert on public.moves
for each row execute function public.enforce_turn();
