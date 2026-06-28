alter table public.products
  add column if not exists tag text;

alter table public.products
  alter column tag set default 'Khác';

update public.products as p
set tag = case
  when lower(coalesce(p.name, '')) like '%espresso%'
    or lower(coalesce(p.name, '')) like '%americano%'
    or lower(coalesce(p.name, '')) like '%latte%'
    or lower(coalesce(p.name, '')) like '%cappuccino%'
    or lower(coalesce(p.name, '')) like '%mocha%'
    or lower(coalesce(p.name, '')) like '%macchiato%'
    then 'Espresso'
  when lower(coalesce(p.name, '')) like '%freeze%'
    or lower(coalesce(p.name, '')) like '%đá xay%'
    or lower(coalesce(p.name, '')) like '%da xay%'
    or lower(coalesce(p.name, '')) like '%frappe%'
    then 'Freeze'
  when lower(coalesce(p.name, '')) like '%bánh%'
    or lower(coalesce(p.name, '')) like '%banh%'
    or lower(coalesce(p.name, '')) like '%croissant%'
    or lower(coalesce(p.name, '')) like '%muffin%'
    or lower(coalesce(p.name, '')) like '%cookie%'
    or lower(coalesce(p.name, '')) like '%tiramisu%'
    or lower(coalesce(p.name, '')) like '%cake%'
    then 'Bánh'
  when lower(coalesce(p.name, '')) like '%nước ép%'
    or lower(coalesce(p.name, '')) like '%nuoc ep%'
    or lower(coalesce(p.name, '')) like '%juice%'
    then 'Nước ép'
  when lower(coalesce(p.name, '')) like '%sinh tố%'
    or lower(coalesce(p.name, '')) like '%sinh to%'
    or lower(coalesce(p.name, '')) like '%smoothie%'
    then 'Sinh tố'
  when lower(coalesce(p.name, '')) like '%phin%'
    or lower(coalesce(p.name, '')) like '%bạc xỉu%'
    or lower(coalesce(p.name, '')) like '%bac xiu%'
    or lower(coalesce(p.name, '')) like '%cafe%'
    or lower(coalesce(p.name, '')) like '%cà phê%'
    or lower(coalesce(p.name, '')) like '%ca phe%'
    or lower(coalesce(p.name, '')) like '%coffee%'
    then 'Cà phê'
  when lower(coalesce(p.name, '')) like '%trà%'
    or lower(coalesce(p.name, '')) like '%tea%'
    or lower(coalesce(p.name, '')) like '%matcha%'
    or lower(coalesce(p.name, '')) like '%oolong%'
    or lower(coalesce(p.name, '')) like '%sen%'
    or lower(coalesce(p.name, '')) like '%đào%'
    or lower(coalesce(p.name, '')) like '%dao%'
    or lower(coalesce(p.name, '')) like '%vải%'
    or lower(coalesce(p.name, '')) like '%vai%'
    or lower(coalesce(p.name, '')) like '%lài%'
    or lower(coalesce(p.name, '')) like '%lai%'
    then 'Trà'
  else 'Khác'
end
where p.tag is null
   or btrim(p.tag) = ''
   or p.tag = 'Khác';

update public.products
set tag = 'Khác'
where tag is null
   or btrim(tag) = '';

alter table public.products
  alter column tag set not null;

create index if not exists idx_products_tag_lower
  on public.products (lower(tag));

alter table public.ingredients
  add column if not exists tag text;

alter table public.ingredients
  alter column tag set default 'Khác';

update public.ingredients as i
set tag = case
  when lower(coalesce(i.name, '')) like '%cà phê%'
    or lower(coalesce(i.name, '')) like '%ca phe%'
    or lower(coalesce(i.name, '')) like '%cafe%'
    or lower(coalesce(i.name, '')) like '%coffee%'
    or lower(coalesce(i.name, '')) like '%espresso%'
    or lower(coalesce(i.name, '')) like '%phin%'
    or lower(coalesce(i.name, '')) like '%cốt cafe%'
    or lower(coalesce(i.name, '')) like '%cot cafe%'
    then 'Bột cà phê'
  when lower(coalesce(i.name, '')) like '%bột trà%'
    or lower(coalesce(i.name, '')) like '%bot tra%'
    or lower(coalesce(i.name, '')) like '%matcha powder%'
    or lower(coalesce(i.name, '')) like '%powder tea%'
    then 'Bột trà'
  when lower(coalesce(i.name, '')) like '%topping%'
    or lower(coalesce(i.name, '')) like '%trân châu%'
    or lower(coalesce(i.name, '')) like '%tran chau%'
    or lower(coalesce(i.name, '')) like '%thạch%'
    or lower(coalesce(i.name, '')) like '%thach%'
    or lower(coalesce(i.name, '')) like '%jelly%'
    or lower(coalesce(i.name, '')) like '%pudding%'
    or lower(coalesce(i.name, '')) like '%foam%'
    or lower(coalesce(i.name, '')) like '%kem cheese%'
    or lower(coalesce(i.name, '')) like '%cheese%'
    then 'Topping'
  when lower(coalesce(i.name, '')) like '%syrup%'
    or lower(coalesce(i.name, '')) like '%siro%'
    or lower(coalesce(i.name, '')) like '%đường nước%'
    or lower(coalesce(i.name, '')) like '%duong nuoc%'
    or lower(coalesce(i.name, '')) like '%nước đường%'
    or lower(coalesce(i.name, '')) like '%nuoc duong%'
    then 'Syrup'
  when lower(coalesce(i.name, '')) like '%sữa%'
    or lower(coalesce(i.name, '')) like '%sua%'
    or lower(coalesce(i.name, '')) like '%milk%'
    or lower(coalesce(i.name, '')) like '%condensed%'
    or lower(coalesce(i.name, '')) like '%whipping%'
    then 'Sữa'
  when lower(coalesce(i.name, '')) ~* '(^|[^[:alnum:]])ly([^[:alnum:]]|$)'
    or lower(coalesce(i.name, '')) like '%nắp%'
    or lower(coalesce(i.name, '')) ~* '(^|[^[:alnum:]])nap([^[:alnum:]]|$)'
    or lower(coalesce(i.name, '')) like '%ống hút%'
    or lower(coalesce(i.name, '')) like '%ong hut%'
    or lower(coalesce(i.name, '')) like '%bao bì%'
    or lower(coalesce(i.name, '')) like '%bao bi%'
    or lower(coalesce(i.name, '')) ~* '(^|[^[:alnum:]])cup([^[:alnum:]]|$)'
    or lower(coalesce(i.name, '')) ~* '(^|[^[:alnum:]])lid([^[:alnum:]]|$)'
    or lower(coalesce(i.name, '')) ~* '(^|[^[:alnum:]])straw([^[:alnum:]]|$)'
    then 'Ly / bao bì'
  when lower(coalesce(i.name, '')) like '%trà%'
    or lower(coalesce(i.name, '')) like '%tea%'
    or lower(coalesce(i.name, '')) like '%oolong%'
    or lower(coalesce(i.name, '')) like '%lài%'
    or lower(coalesce(i.name, '')) like '%lai%'
    or lower(coalesce(i.name, '')) like '%sen%'
    then 'Trà'
  when lower(coalesce(i.name, '')) like '%trái cây%'
    or lower(coalesce(i.name, '')) like '%trai cay%'
    or lower(coalesce(i.name, '')) like '%đào%'
    or lower(coalesce(i.name, '')) like '%dao%'
    or lower(coalesce(i.name, '')) like '%vải%'
    or lower(coalesce(i.name, '')) like '%vai%'
    or lower(coalesce(i.name, '')) like '%dâu%'
    or lower(coalesce(i.name, '')) like '%dau%'
    or lower(coalesce(i.name, '')) like '%xoài%'
    or lower(coalesce(i.name, '')) like '%xoai%'
    or lower(coalesce(i.name, '')) like '%chanh%'
    or lower(coalesce(i.name, '')) like '%cam%'
    or lower(coalesce(i.name, '')) like '%fruit%'
    then 'Trái cây'
  else 'Khác'
end
where i.tag is null
   or btrim(i.tag) = ''
   or i.tag = 'Khác';

update public.ingredients
set tag = 'Khác'
where tag is null
   or btrim(tag) = '';

alter table public.ingredients
  alter column tag set not null;

create index if not exists idx_ingredients_tag_lower
  on public.ingredients (lower(tag));

create or replace view public.v_pos_available_products as
select
  p.id,
  p.name,
  p.tag,
  p.price,
  p.status,
  p.created_at,
  p.updated_at
from public.products p
join public.recipes r
  on r.product_id = p.id
 and r.deleted_at is null
join public.recipe_items ri
  on ri.recipe_id = r.id
where p.deleted_at is null
  and p.status = 'ACTIVE'
group by
  p.id,
  p.name,
  p.tag,
  p.price,
  p.status,
  p.created_at,
  p.updated_at;

-- Verification:
-- select tag, count(*) from public.products group by tag order by tag;
-- select tag, count(*) from public.ingredients group by tag order by tag;
-- select id, name, tag, price from public.v_pos_available_products order by name limit 50;
-- stock_transactions meaning:
-- IMPORT       => quantity > 0 and after_stock = before_stock + quantity
-- ORDER_DEDUCT => quantity > 0 and after_stock = before_stock - quantity
-- ADJUST       => quantity > 0 while before_stock / after_stock show increase or decrease
