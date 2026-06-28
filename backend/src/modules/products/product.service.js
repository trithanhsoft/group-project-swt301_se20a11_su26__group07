import { query } from '../../config/db.js';
import { PRODUCT_STATUS } from '../../constants/productStatus.js';
import { ApiError } from '../../utils/ApiError.js';
import { toPublicProduct } from '../../utils/product.js';
import { DEFAULT_PRODUCT_TAG } from '../../utils/tagTaxonomy.js';

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeStatus(value) {
  return normalizeString(value).toUpperCase();
}

function normalizeTag(value) {
  const normalizedValue = normalizeString(value);
  return normalizedValue || DEFAULT_PRODUCT_TAG;
}

function ensureValidName(name) {
  if (!name) {
    throw new ApiError(400, 'Product name is required.');
  }

  if (name.length > 63) {
    throw new ApiError(400, 'Product name must not exceed 63 characters.');
  }
}

function ensureValidStatus(status) {
  if (![PRODUCT_STATUS.ACTIVE, PRODUCT_STATUS.INACTIVE].includes(status)) {
    throw new ApiError(400, 'Product status is invalid.');
  }
}

function ensureValidPrice(price) {
  const normalizedPrice = Number(price);

  if (!Number.isFinite(normalizedPrice)) {
    throw new ApiError(400, 'Product price is invalid.');
  }

  if (normalizedPrice <= 0) {
    throw new ApiError(400, 'Product price must be greater than 0.');
  }

  return normalizedPrice;
}

function ensureValidTag(tag) {
  if (!tag) {
    throw new ApiError(400, 'Product tag is required.');
  }

  if (tag.length > 40) {
    throw new ApiError(400, 'Product tag must not exceed 40 characters.');
  }
}

async function findProductRowById(productId) {
  const result = await query(
    `select p.id,
            p.name,
            p.tag,
            p.price,
            p.status,
            p.created_at,
            p.updated_at,
            exists(
              select 1
              from recipes r
              where r.product_id = p.id
                and r.deleted_at is null
            ) as has_recipe
     from products p
     where p.id = $1
       and p.deleted_at is null
     limit 1`,
    [productId],
  );

  return result.rows[0] || null;
}

async function ensureUniqueProductName(name, excludeProductId = null) {
  const params = [name];
  const conditions = ['lower(name) = lower($1)', 'deleted_at is null'];

  if (excludeProductId) {
    params.push(excludeProductId);
    conditions.push(`id <> $${params.length}`);
  }

  const result = await query(
    `select id
     from products
     where ${conditions.join(' and ')}
     limit 1`,
    params,
  );

  if (result.rows[0]) {
    throw new ApiError(409, 'Product name already exists.');
  }
}

export async function listProductTags() {
  const result = await query(
    `select tag
     from (
       select distinct p.tag
       from products p
       where p.deleted_at is null
         and p.tag is not null
         and btrim(p.tag) <> ''
     ) product_tags
     order by lower(tag) asc`,
  );

  return result.rows.map((row) => row.tag).filter(Boolean);
}

export async function listProducts({ search = '', status, tag } = {}) {
  const params = [];
  const conditions = ['p.deleted_at is null'];
  const normalizedSearch = normalizeString(search);
  const normalizedStatus = normalizeStatus(status);
  const normalizedTag = normalizeTag(tag);

  if (normalizedSearch) {
    params.push(`%${normalizedSearch}%`);
    conditions.push(`p.name ilike $${params.length}`);
  }

  if (normalizedStatus && normalizedStatus !== 'ALL') {
    ensureValidStatus(normalizedStatus);
    params.push(normalizedStatus);
    conditions.push(`p.status = $${params.length}`);
  }

  if (normalizeString(tag) && normalizedTag !== 'ALL') {
    ensureValidTag(normalizedTag);
    params.push(normalizedTag);
    conditions.push(`lower(p.tag) = lower($${params.length})`);
  }

  const result = await query(
    `select p.id,
            p.name,
            p.tag,
            p.price,
            p.status,
            p.created_at,
            p.updated_at,
            exists(
              select 1
              from recipes r
              where r.product_id = p.id
                and r.deleted_at is null
            ) as has_recipe
     from products p
     where ${conditions.join(' and ')}
     order by p.created_at desc, p.name asc`,
    params,
  );

  return result.rows.map(toPublicProduct);
}

export async function getProductById(productId) {
  const product = await findProductRowById(productId);

  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  return toPublicProduct(product);
}

export async function createProduct(payload, actorUser) {
  const name = normalizeString(payload.name);
  const tag = normalizeTag(payload.tag);
  const price = ensureValidPrice(payload.price);
  const status = normalizeStatus(payload.status || PRODUCT_STATUS.ACTIVE);

  ensureValidName(name);
  ensureValidTag(tag);
  ensureValidStatus(status);

  await ensureUniqueProductName(name);

  const result = await query(
    `insert into products (name, tag, price, status, created_by)
     values ($1, $2, $3, $4, $5)
     returning id`,
    [name, tag, price, status, actorUser.id],
  );

  return getProductById(result.rows[0].id);
}

export async function updateProduct(productId, payload) {
  const existingProduct = await findProductRowById(productId);

  if (!existingProduct) {
    throw new ApiError(404, 'Product not found.');
  }

  const nextName =
    payload.name === undefined ? existingProduct.name : normalizeString(payload.name);
  const nextTag =
    payload.tag === undefined ? normalizeTag(existingProduct.tag) : normalizeTag(payload.tag);
  const nextPrice =
    payload.price === undefined ? Number(existingProduct.price) : ensureValidPrice(payload.price);
  const nextStatus =
    payload.status === undefined ? existingProduct.status : normalizeStatus(payload.status);

  ensureValidName(nextName);
  ensureValidTag(nextTag);
  ensureValidStatus(nextStatus);

  await ensureUniqueProductName(nextName, existingProduct.id);

  await query(
    `update products
     set name = $1,
         tag = $2,
         price = $3,
         status = $4,
         updated_at = now()
     where id = $5
       and deleted_at is null`,
    [nextName, nextTag, nextPrice, nextStatus, productId],
  );

  return getProductById(productId);
}

export async function softDeleteProduct(productId) {
  const existingProduct = await getProductById(productId);

  await query(
    `update products
     set deleted_at = now(),
         updated_at = now()
     where id = $1
       and deleted_at is null`,
    [productId],
  );

  return existingProduct;
}

export async function listPosAvailableProducts() {
  const result = await query(
    `select p.id,
            p.name,
            p.tag,
            p.price,
            p.status,
            p.created_at,
            p.updated_at,
            true as has_recipe
     from products p
     where p.deleted_at is null
       and p.status = $1
       and exists(
         select 1
         from recipes r
         join recipe_items ri on ri.recipe_id = r.id
         where r.product_id = p.id
           and r.deleted_at is null
       )
     order by p.name asc`,
    [PRODUCT_STATUS.ACTIVE],
  );

  return result.rows.map(toPublicProduct);
}
