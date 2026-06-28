alter table public.orders
  add column if not exists payment_method text;

alter table public.orders
  add column if not exists amount_received numeric(12,2);

alter table public.orders
  add column if not exists change_amount numeric(12,2);

alter table public.orders
  add column if not exists paid_at timestamp with time zone;

update public.orders
set payment_method = 'CASH'
where payment_method is null
   or btrim(payment_method) = '';

alter table public.orders
  alter column payment_method set default 'CASH';

alter table public.orders
  alter column payment_method set not null;

alter table public.orders
  alter column paid_at set default now();

update public.orders
set paid_at = coalesce(paid_at, created_at, now())
where paid_at is null;

do $$
begin
  alter table public.orders
    add constraint orders_payment_method_check
    check (payment_method in ('CASH'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.orders
    add constraint orders_amount_received_check
    check (amount_received is null or amount_received >= total_amount);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.orders
    add constraint orders_change_amount_check
    check (change_amount is null or change_amount >= 0);
exception
  when duplicate_object then null;
end $$;

-- Verification:
-- select column_name, data_type, is_nullable, column_default
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name = 'orders'
--   and column_name in ('payment_method', 'amount_received', 'change_amount', 'paid_at')
-- order by ordinal_position;
--
-- select id, order_code, total_amount, payment_method, amount_received, change_amount, paid_at, created_at
-- from public.orders
-- order by created_at desc
-- limit 20;
