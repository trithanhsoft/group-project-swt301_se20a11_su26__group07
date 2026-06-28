alter table public.products
  add column if not exists tag text;

update public.products
set tag = 'Khác'
where tag is null
   or btrim(tag) = '';

alter table public.products
  alter column tag set default 'Khác';

alter table public.products
  alter column tag set not null;

create index if not exists idx_products_tag_lower
  on public.products (lower(tag));

alter table public.ingredients
  add column if not exists tag text;

update public.ingredients
set tag = 'Khác'
where tag is null
   or btrim(tag) = '';

alter table public.ingredients
  alter column tag set default 'Khác';

alter table public.ingredients
  alter column tag set not null;

create index if not exists idx_ingredients_tag_lower
  on public.ingredients (lower(tag));
