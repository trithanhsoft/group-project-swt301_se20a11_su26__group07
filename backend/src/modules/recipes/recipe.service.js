import { pool, query } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { toPublicRecipe } from '../../utils/recipe.js';

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeId(value, fieldName) {
  const normalizedValue =
    typeof value === 'string' ? value.trim() : String(value ?? '').trim();

  if (!normalizedValue) {
    throw new ApiError(400, `${fieldName} is invalid.`);
  }

  return normalizedValue;
}

function ensurePositiveNumber(value, fieldName) {
  const normalizedValue = Number(value);

  if (!Number.isFinite(normalizedValue)) {
    throw new ApiError(400, `${fieldName} is invalid.`);
  }

  if (normalizedValue <= 0) {
    throw new ApiError(400, `${fieldName} must be greater than 0.`);
  }

  return normalizedValue;
}

function normalizeRecipeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Recipe must contain at least one ingredient item.');
  }

  const seenIngredientIds = new Set();

  return items.map((item, index) => {
    const ingredientId = normalizeId(
      item?.ingredientId ?? item?.ingredient_id,
      `Ingredient id at row ${index + 1}`,
    );
    const quantity = ensurePositiveNumber(item?.quantity, `Quantity at row ${index + 1}`);

    if (seenIngredientIds.has(ingredientId)) {
      throw new ApiError(400, 'Duplicate ingredient lines are not allowed in one recipe.');
    }

    seenIngredientIds.add(ingredientId);

    return {
      ingredientId,
      quantity,
    };
  });
}

async function findProductRowById(productId) {
  const result = await query(
    `select id,
            name,
            status,
            price
     from products
     where id = $1
       and deleted_at is null
     limit 1`,
    [productId],
  );

  return result.rows[0] || null;
}

async function ensureProductExists(productId) {
  const product = await findProductRowById(productId);

  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  return product;
}

async function ensureIngredientsExist(ingredientIds) {
  const placeholders = ingredientIds.map((_, index) => `$${index + 1}`).join(', ');
  const result = await query(
    `select id,
            name,
            unit
     from ingredients
     where id in (${placeholders})
       and deleted_at is null`,
    ingredientIds,
  );

  if (result.rows.length !== ingredientIds.length) {
    throw new ApiError(404, 'One or more ingredients were not found.');
  }

  return result.rows;
}

async function findRecipeHeaderById(recipeId) {
  const result = await query(
    `select r.id,
            r.product_id,
            p.name as product_name,
            p.status as product_status,
            p.price as product_price,
            r.created_at,
            r.updated_at
     from recipes r
     join products p on p.id = r.product_id
     where r.id = $1
       and r.deleted_at is null
       and p.deleted_at is null
     limit 1`,
    [recipeId],
  );

  return result.rows[0] || null;
}

async function findRecipeHeaderByProductId(productId) {
  const result = await query(
    `select r.id,
            r.product_id,
            p.name as product_name,
            p.status as product_status,
            p.price as product_price,
            r.created_at,
            r.updated_at
     from recipes r
     join products p on p.id = r.product_id
     where r.product_id = $1
       and r.deleted_at is null
       and p.deleted_at is null
     limit 1`,
    [productId],
  );

  return result.rows[0] || null;
}

async function ensureRecipeDoesNotExistForProduct(productId, excludeRecipeId = null) {
  const params = [productId];
  const conditions = ['product_id = $1', 'deleted_at is null'];

  if (excludeRecipeId) {
    params.push(excludeRecipeId);
    conditions.push(`id <> $${params.length}`);
  }

  const result = await query(
    `select id
     from recipes
     where ${conditions.join(' and ')}
     limit 1`,
    params,
  );

  if (result.rows[0]) {
    throw new ApiError(409, 'This product already has a recipe.');
  }
}

async function getRecipeForUpdate(client, recipeId) {
  const result = await client.query(
    `select r.id,
            r.product_id,
            p.name as product_name,
            p.status as product_status,
            p.price as product_price,
            r.created_at,
            r.updated_at
     from recipes r
     join products p on p.id = r.product_id
     where r.id = $1
       and r.deleted_at is null
       and p.deleted_at is null
     limit 1
     for update of r`,
    [recipeId],
  );

  return result.rows[0] || null;
}

async function loadRecipeItemRows(recipeIds) {
  if (!recipeIds.length) {
    return [];
  }

  const placeholders = recipeIds.map((_, index) => `$${index + 1}`).join(', ');
  const result = await query(
    `select ri.recipe_id,
            ri.ingredient_id,
            ri.quantity_required,
            i.name as ingredient_name,
            i.unit
     from recipe_items ri
     join ingredients i on i.id = ri.ingredient_id
     where ri.recipe_id in (${placeholders})
       and i.deleted_at is null
     order by ri.recipe_id asc, i.name asc`,
    recipeIds,
  );

  return result.rows;
}

function groupItemsByRecipeId(itemRows) {
  const itemMap = new Map();

  for (const row of itemRows) {
    if (!itemMap.has(row.recipe_id)) {
      itemMap.set(row.recipe_id, []);
    }

    itemMap.get(row.recipe_id).push(row);
  }

  return itemMap;
}

async function buildRecipesFromHeaders(headers) {
  if (!headers.length) {
    return [];
  }

  const itemRows = await loadRecipeItemRows(headers.map((header) => header.id));
  const itemMap = groupItemsByRecipeId(itemRows);

  return headers.map((header) => toPublicRecipe(header, itemMap.get(header.id) || []));
}

async function insertRecipeItems(client, recipeId, items) {
  for (const item of items) {
    await client.query(
      `insert into recipe_items (recipe_id, ingredient_id, quantity_required)
       values ($1, $2, $3)`,
      [recipeId, item.ingredientId, item.quantity],
    );
  }
}

export async function listRecipes({ search = '' } = {}) {
  const normalizedSearch = normalizeString(search);
  const params = [];
  const conditions = ['r.deleted_at is null', 'p.deleted_at is null'];

  if (normalizedSearch) {
    params.push(`%${normalizedSearch}%`);
    conditions.push(`p.name ilike $${params.length}`);
  }

  const result = await query(
    `select r.id,
            r.product_id,
            p.name as product_name,
            p.status as product_status,
            p.price as product_price,
            r.created_at,
            r.updated_at
     from recipes r
     join products p on p.id = r.product_id
     where ${conditions.join(' and ')}
     order by p.name asc, r.created_at desc`,
    params,
  );

  return buildRecipesFromHeaders(result.rows);
}

export async function getRecipeById(recipeId) {
  const normalizedRecipeId = normalizeId(recipeId, 'Recipe id');
  const header = await findRecipeHeaderById(normalizedRecipeId);

  if (!header) {
    throw new ApiError(404, 'Recipe not found.');
  }

  const [recipe] = await buildRecipesFromHeaders([header]);
  return recipe;
}

export async function getRecipeByProductId(productId) {
  const normalizedProductId = normalizeId(productId, 'Product id');
  await ensureProductExists(normalizedProductId);

  const header = await findRecipeHeaderByProductId(normalizedProductId);

  if (!header) {
    throw new ApiError(404, 'Recipe not found.');
  }

  const [recipe] = await buildRecipesFromHeaders([header]);
  return recipe;
}

export async function createRecipe(payload, actorUser) {
  const productId = normalizeId(payload.productId ?? payload.product_id, 'Product id');
  const items = normalizeRecipeItems(payload.items);

  await ensureProductExists(productId);
  await ensureRecipeDoesNotExistForProduct(productId);
  await ensureIngredientsExist(items.map((item) => item.ingredientId));

  const client = await pool.connect();

  try {
    await client.query('begin');

    const insertRecipeResult = await client.query(
      `insert into recipes (product_id, created_by)
       values ($1, $2)
       returning id`,
      [productId, actorUser.id],
    );

    await insertRecipeItems(client, insertRecipeResult.rows[0].id, items);

    await client.query('commit');

    return getRecipeById(insertRecipeResult.rows[0].id);
  } catch (error) {
    await client.query('rollback');

    if (error?.code === '23505') {
      throw new ApiError(409, 'This product already has a recipe.');
    }

    throw error;
  } finally {
    client.release();
  }
}

export async function updateRecipe(recipeId, payload) {
  const normalizedRecipeId = normalizeId(recipeId, 'Recipe id');
  const items = normalizeRecipeItems(payload.items);

  const client = await pool.connect();

  try {
    await client.query('begin');

    const existingRecipe = await getRecipeForUpdate(client, normalizedRecipeId);

    if (!existingRecipe) {
      throw new ApiError(404, 'Recipe not found.');
    }

    if (
      payload.productId !== undefined ||
      payload.product_id !== undefined
    ) {
      const requestedProductId = normalizeId(
        payload.productId ?? payload.product_id,
        'Product id',
      );

      if (requestedProductId !== String(existingRecipe.product_id)) {
        throw new ApiError(400, 'Recipe product cannot be changed.');
      }
    }

    await ensureIngredientsExist(items.map((item) => item.ingredientId));

    await client.query('delete from recipe_items where recipe_id = $1', [normalizedRecipeId]);
    await insertRecipeItems(client, normalizedRecipeId, items);

    await client.query(
      `update recipes
       set updated_at = now()
       where id = $1
         and deleted_at is null`,
      [normalizedRecipeId],
    );

    await client.query('commit');

    return getRecipeById(normalizedRecipeId);
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function softDeleteRecipe(recipeId) {
  const normalizedRecipeId = normalizeId(recipeId, 'Recipe id');
  const recipe = await getRecipeById(normalizedRecipeId);

  await query(
    `update recipes
     set deleted_at = now(),
         updated_at = now()
     where id = $1
       and deleted_at is null`,
    [normalizedRecipeId],
  );

  return recipe;
}
