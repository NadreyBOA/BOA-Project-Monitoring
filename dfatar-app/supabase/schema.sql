-- Bankee — schéma de sauvegarde en ligne
-- À coller une seule fois dans Supabase > SQL Editor > New query > Run.

create table if not exists backup_spaces (
  id text primary key,
  user_id uuid not null default auth.uid(),
  name text not null,
  account_type text not null,
  created_at text not null
);

create table if not exists backup_customers (
  id text primary key,
  user_id uuid not null default auth.uid(),
  space_id text,
  name text not null,
  phone text,
  note text,
  currency text,
  address text,
  created_at text not null
);

create table if not exists backup_transactions (
  id text primary key,
  user_id uuid not null default auth.uid(),
  customer_id text not null,
  type text not null,
  amount double precision not null,
  date text not null,
  note text,
  due_date text,
  notification_id text,
  payment_channel text,
  created_at text not null
);

create table if not exists backup_transaction_edits (
  id text primary key,
  user_id uuid not null default auth.uid(),
  transaction_id text not null,
  field text not null,
  old_value text,
  new_value text,
  reason text,
  reason_other text,
  created_at text not null
);

create table if not exists backup_settings (
  user_id uuid not null default auth.uid(),
  key text not null,
  value text not null,
  primary key (user_id, key)
);

alter table backup_spaces enable row level security;
alter table backup_customers enable row level security;
alter table backup_transactions enable row level security;
alter table backup_transaction_edits enable row level security;
alter table backup_settings enable row level security;

drop policy if exists "own rows" on backup_spaces;
drop policy if exists "own rows" on backup_customers;
drop policy if exists "own rows" on backup_transactions;
drop policy if exists "own rows" on backup_transaction_edits;
drop policy if exists "own rows" on backup_settings;

create policy "own rows" on backup_spaces
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on backup_customers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on backup_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on backup_transaction_edits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on backup_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
