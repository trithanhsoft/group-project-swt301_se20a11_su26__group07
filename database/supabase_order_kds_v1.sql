alter table public.orders
  add column if not exists kds_status text;

alter table public.orders
  add column if not exists kds_completed_at timestamp with time zone;

alter table public.orders
  add column if not exists kds_completed_by uuid;

update public.orders
set kds_status = 'COMPLETED'
where kds_status is null
   or btrim(kds_status) = '';

update public.orders
set kds_completed_at = coalesce(kds_completed_at, created_at, now())
where kds_status = 'COMPLETED'
  and kds_completed_at is null;

alter table public.orders
  alter column kds_status set default 'NEW';

alter table public.orders
  alter column kds_status set not null;

do $$
begin
  alter table public.orders
    add constraint orders_kds_status_check
    check (kds_status in ('NEW', 'COMPLETED'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.orders
    add constraint orders_kds_completed_by_fkey
    foreign key (kds_completed_by)
    references public.app_users (id);
exception
  when duplicate_object then null;
end $$;

create index if not exists idx_orders_kds_status_created_at
  on public.orders (kds_status, created_at desc);

create index if not exists idx_orders_kds_completed_at
  on public.orders (kds_completed_at desc);

-- Verification:
-- select column_name, data_type, is_nullable, column_default
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name = 'orders'
--   and column_name in ('kds_status', 'kds_completed_at', 'kds_completed_by')
-- order by ordinal_position;
--
-- select id, order_code, status, kds_status, kds_completed_at, kds_completed_by, created_at
-- from public.orders
-- order by created_at desc
-- limit 20;
