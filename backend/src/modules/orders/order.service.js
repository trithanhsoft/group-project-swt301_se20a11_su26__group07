import { pool, query } from '../../config/db.js';
import { KDS_STATUSES } from '../../constants/kdsStatuses.js';
import { ROLES } from '../../constants/roles.js';
import { STOCK_TRANSACTION_TYPES } from '../../constants/stockTransactionTypes.js';
import { ApiError } from '../../utils/ApiError.js';
import { toPublicOrder } from '../../utils/order.js';

const PAYMENT_METHODS = Object.freeze({
  CASH: 'CASH',
});

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

function ensurePositiveInteger(value, fieldName) {
  const normalizedValue = Number(value);

  if (!Number.isInteger(normalizedValue) || normalizedValue <= 0) {
    throw new ApiError(400, `${fieldName} must be a positive integer.`);
  }

  return normalizedValue;
}

function ensureValidNumber(value, fieldName) {
  const normalizedValue = Number(value);

  if (!Number.isFinite(normalizedValue)) {
    throw new ApiError(400, `${fieldName} is invalid.`);
  }

  if (normalizedValue < 0) {
    throw new ApiError(400, `${fieldName} cannot be negative.`);
  }

  return normalizedValue;
}

function normalizePaymentMethod(value) {
  return normalizeString(value).toUpperCase();
}

function ensureSupportedPaymentMethod(paymentMethod) {
  if (paymentMethod !== PAYMENT_METHODS.CASH) {
    throw new ApiError(400, 'Payment method must be CASH.');
  }
}

function buildPaymentSummary(payload, totalAmount) {
  const paymentMethod = normalizePaymentMethod(payload.paymentMethod);
  ensureSupportedPaymentMethod(paymentMethod);

  const amountReceived = ensureValidNumber(payload.amountReceived, 'Amount received');

  if (amountReceived < totalAmount) {
    throw new ApiError(400, 'Amount received must be greater than or equal to total amount.');
  }

  return {
    paymentMethod,
    amountReceived,
    changeAmount: amountReceived - totalAmount,
  };
}

function buildPlaceholders(values, startIndex = 1) {
  return values.map((_, index) => `$${startIndex + index}`).join(', ');
}

function normalizeCartItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Cart is empty.');
  }

  const cartMap = new Map();

  items.forEach((item, index) => {
    const productId = normalizeId(item?.productId ?? item?.product_id, `Product id at row ${index + 1}`);
    const quantity = ensurePositiveInteger(item?.quantity, `Quantity at row ${index + 1}`);

    cartMap.set(productId, (cartMap.get(productId) || 0) + quantity);
  });

  return Array.from(cartMap.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

function ensureStaffUser(actorUser) {
  if (!actorUser || actorUser.role !== ROLES.STAFF) {
    throw new ApiError(403, 'Access denied. Staff role is required.');
  }
}

async function loadProductsByIds(productIds) {
  const result = await query(
    `select id,
            name,
            price,
            status
     from products
     where id in (${buildPlaceholders(productIds)})
       and deleted_at is null`,
    productIds,
  );

  return result.rows;
}

function ensureProductsExist(productIds, productMap) {
  for (const productId of productIds) {
    if (!productMap.has(productId)) {
      throw new ApiError(404, 'One or more products were not found.');
    }
  }
}

function ensureProductsAreActive(cartItems, productMap) {
  for (const cartItem of cartItems) {
    const product = productMap.get(cartItem.productId);

    if (product.status !== 'ACTIVE') {
      throw new ApiError(400, `Product is inactive: ${product.name}.`);
    }
  }
}

async function loadRecipeHeadersByProductIds(productIds) {
  const result = await query(
    `select id,
            product_id
     from recipes
     where product_id in (${buildPlaceholders(productIds)})
       and deleted_at is null`,
    productIds,
  );

  return result.rows;
}

function ensureProductsHaveRecipes(cartItems, productMap, recipeHeaders) {
  const recipeProductIds = new Set(recipeHeaders.map((row) => row.product_id));

  for (const cartItem of cartItems) {
    if (!recipeProductIds.has(cartItem.productId)) {
      const product = productMap.get(cartItem.productId);
      throw new ApiError(400, `Product has no recipe: ${product?.name || cartItem.productId}.`);
    }
  }
}

async function loadRecipeItemRows(recipeIds) {
  const result = await query(
    `select ri.recipe_id,
            ri.ingredient_id,
            ri.quantity_required,
            i.name as ingredient_name,
            i.unit
     from recipe_items ri
     join ingredients i on i.id = ri.ingredient_id
     where ri.recipe_id in (${buildPlaceholders(recipeIds)})
       and i.deleted_at is null
     order by ri.recipe_id asc, i.name asc`,
    recipeIds,
  );

  return result.rows;
}

function buildRecipeItemsByProductId(recipeHeaders, recipeItemRows, productMap) {
  const recipeIdToProductId = new Map(recipeHeaders.map((row) => [row.id, row.product_id]));
  const recipeItemsByProductId = new Map();

  for (const row of recipeItemRows) {
    const productId = recipeIdToProductId.get(row.recipe_id);

    if (!productId) {
      continue;
    }

    if (!recipeItemsByProductId.has(productId)) {
      recipeItemsByProductId.set(productId, []);
    }

    recipeItemsByProductId.get(productId).push({
      ingredientId: row.ingredient_id,
      ingredientName: row.ingredient_name,
      quantityRequired: Number(row.quantity_required || 0),
      unit: row.unit,
    });
  }

  for (const recipeHeader of recipeHeaders) {
    const productId = recipeHeader.product_id;
    const items = recipeItemsByProductId.get(productId) || [];

    if (items.length === 0) {
      const product = productMap.get(productId);
      throw new ApiError(400, `Product has no valid recipe: ${product?.name || productId}.`);
    }
  }

  return recipeItemsByProductId;
}

function buildOrderPlan(cartItems, productMap, recipeItemsByProductId) {
  const orderItems = [];
  const ingredientRequirements = new Map();
  let totalAmount = 0;

  for (const cartItem of cartItems) {
    const product = productMap.get(cartItem.productId);
    const unitPrice = Number(product.price || 0);
    const subtotal = unitPrice * cartItem.quantity;

    totalAmount += subtotal;
    orderItems.push({
      productId: product.id,
      productNameSnapshot: product.name,
      quantity: cartItem.quantity,
      unitPrice,
      subtotal,
    });

    const recipeItems = recipeItemsByProductId.get(cartItem.productId) || [];

    for (const recipeItem of recipeItems) {
      const requiredQuantity = Number(recipeItem.quantityRequired || 0) * cartItem.quantity;
      const currentRequirement = ingredientRequirements.get(recipeItem.ingredientId);

      ingredientRequirements.set(recipeItem.ingredientId, {
        ingredientId: recipeItem.ingredientId,
        ingredientName: recipeItem.ingredientName,
        requiredQuantity:
          (currentRequirement?.requiredQuantity || 0) + requiredQuantity,
      });
    }
  }

  return {
    orderItems,
    ingredientRequirements: Array.from(ingredientRequirements.values()),
    totalAmount,
  };
}

async function loadIngredientsForUpdate(client, ingredientIds) {
  const result = await client.query(
    `select id,
            name,
            unit,
            current_stock
     from ingredients
     where id in (${buildPlaceholders(ingredientIds)})
       and deleted_at is null
     order by id
     for update`,
    ingredientIds,
  );

  return result.rows;
}

function ensureSufficientStock(lockedIngredients, ingredientRequirementMap) {
  for (const ingredient of lockedIngredients) {
    const requirement = ingredientRequirementMap.get(ingredient.id);

    if (!requirement) {
      continue;
    }

    const currentStock = Number(ingredient.current_stock || 0);

    if (currentStock < requirement.requiredQuantity) {
      throw new ApiError(400, `Insufficient stock for ${ingredient.name}.`);
    }
  }
}

function generateOrderCodeCandidate() {
  const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const randomSuffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');

  return `OD${timestamp}${randomSuffix}`;
}

async function generateUniqueOrderCode(client) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateOrderCodeCandidate();
    const result = await client.query(
      `select 1
       from orders
       where order_code = $1
       limit 1`,
      [candidate],
    );

    if (!result.rows[0]) {
      return candidate;
    }
  }

  throw new ApiError(500, 'Could not generate unique order code.');
}

async function insertOrderItems(client, orderId, orderItems) {
  for (const orderItem of orderItems) {
    await client.query(
      `insert into order_items (
         order_id,
         product_id,
         product_name_snapshot,
         quantity,
         unit_price,
         subtotal
       )
       values ($1, $2, $3, $4, $5, $6)`,
      [
        orderId,
        orderItem.productId,
        orderItem.productNameSnapshot,
        orderItem.quantity,
        orderItem.unitPrice,
        orderItem.subtotal,
      ],
    );
  }
}

async function applyStockDeductions(client, ingredientRequirements, actorUser, orderId, orderCode) {
  const ingredientRequirementMap = new Map(
    ingredientRequirements.map((requirement) => [requirement.ingredientId, requirement]),
  );
  const lockedIngredients = await loadIngredientsForUpdate(
    client,
    ingredientRequirements.map((requirement) => requirement.ingredientId),
  );

  if (lockedIngredients.length !== ingredientRequirements.length) {
    throw new ApiError(404, 'One or more ingredients were not found.');
  }

  ensureSufficientStock(lockedIngredients, ingredientRequirementMap);

  for (const ingredient of lockedIngredients) {
    const requirement = ingredientRequirementMap.get(ingredient.id);
    const beforeStock = Number(ingredient.current_stock || 0);
    const afterStock = beforeStock - requirement.requiredQuantity;

    await client.query(
      `update ingredients
       set current_stock = $1,
           updated_at = now()
       where id = $2`,
      [afterStock, ingredient.id],
    );

    await client.query(
      `insert into stock_transactions (
         ingredient_id,
         type,
         quantity,
         before_stock,
         after_stock,
         order_id,
         note,
         created_by
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        ingredient.id,
        STOCK_TRANSACTION_TYPES.ORDER_DEDUCT,
        requirement.requiredQuantity,
        beforeStock,
        afterStock,
        orderId,
        `POS order ${orderCode}`,
        actorUser.id,
      ],
    );
  }
}

async function findOrderHeaderByIdForStaff(orderId, staffId) {
  const result = await query(
    `select o.id,
            o.order_code,
            o.staff_id,
            u.username as staff_username,
            o.total_amount,
            o.payment_method,
            o.amount_received,
            o.change_amount,
            o.paid_at,
            o.status,
            o.kds_status,
            o.kds_completed_at,
            o.kds_completed_by,
            o.note,
            o.created_at,
            o.updated_at
     from orders o
     join app_users u on u.id = o.staff_id
     where o.id = $1
       and o.staff_id = $2
       and o.status = 'SUCCESS'
     limit 1`,
    [orderId, staffId],
  );

  return result.rows[0] || null;
}

async function loadOrderItemRows(orderIds) {
  if (!orderIds.length) {
    return [];
  }

  const result = await query(
    `select id,
            order_id,
            product_id,
            product_name_snapshot,
            quantity,
            unit_price,
            subtotal,
            created_at
     from order_items
     where order_id in (${buildPlaceholders(orderIds)})
     order by created_at asc`,
    orderIds,
  );

  return result.rows;
}

function groupOrderItemsByOrderId(orderItemRows) {
  const itemMap = new Map();

  for (const row of orderItemRows) {
    if (!itemMap.has(row.order_id)) {
      itemMap.set(row.order_id, []);
    }

    itemMap.get(row.order_id).push(row);
  }

  return itemMap;
}

async function buildOrdersWithItems(headers) {
  if (!headers.length) {
    return [];
  }

  const orderItemRows = await loadOrderItemRows(headers.map((header) => header.id));
  const itemMap = groupOrderItemsByOrderId(orderItemRows);

  return headers.map((header) => toPublicOrder(header, itemMap.get(header.id) || []));
}

export async function createOrder(payload, actorUser) {
  ensureStaffUser(actorUser);

  const cartItems = normalizeCartItems(payload.items);
  const note = normalizeString(payload.note);
  const productIds = cartItems.map((item) => item.productId);
  const products = await loadProductsByIds(productIds);
  const productMap = new Map(products.map((product) => [product.id, product]));

  ensureProductsExist(productIds, productMap);
  ensureProductsAreActive(cartItems, productMap);

  const recipeHeaders = await loadRecipeHeadersByProductIds(productIds);
  ensureProductsHaveRecipes(cartItems, productMap, recipeHeaders);

  const recipeItemRows = await loadRecipeItemRows(recipeHeaders.map((row) => row.id));
  const recipeItemsByProductId = buildRecipeItemsByProductId(recipeHeaders, recipeItemRows, productMap);
  const { orderItems, ingredientRequirements, totalAmount } = buildOrderPlan(
    cartItems,
    productMap,
    recipeItemsByProductId,
  );
  const paymentSummary = buildPaymentSummary(payload, totalAmount);

  const client = await pool.connect();

  try {
    await client.query('begin');

    const orderCode = await generateUniqueOrderCode(client);
    const insertOrderResult = await client.query(
      `insert into orders (
         order_code,
         staff_id,
         total_amount,
         payment_method,
         amount_received,
         change_amount,
         paid_at,
         status,
         kds_status,
         note
       )
       values ($1, $2, $3, $4, $5, $6, now(), 'SUCCESS', $7, $8)
       returning id`,
      [
        orderCode,
        actorUser.id,
        totalAmount,
        paymentSummary.paymentMethod,
        paymentSummary.amountReceived,
        paymentSummary.changeAmount,
        KDS_STATUSES.NEW,
        note || null,
      ],
    );

    const orderId = insertOrderResult.rows[0].id;

    await insertOrderItems(client, orderId, orderItems);
    await applyStockDeductions(client, ingredientRequirements, actorUser, orderId, orderCode);

    await client.query('commit');

    return getOrderByIdForStaff(orderId, actorUser);
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function listOrdersForStaff(actorUser, { dateFrom, dateTo } = {}) {
  ensureStaffUser(actorUser);

  const params = [actorUser.id];
  const conditions = ['o.staff_id = $1', `o.status = 'SUCCESS'`];

  if (dateFrom) {
    params.push(dateFrom);
    conditions.push(`o.created_at::date >= $${params.length}`);
  }

  if (dateTo) {
    params.push(dateTo);
    conditions.push(`o.created_at::date <= $${params.length}`);
  }

  const result = await query(
    `select o.id,
            o.order_code,
            o.staff_id,
            u.username as staff_username,
            o.total_amount,
            o.payment_method,
            o.amount_received,
            o.change_amount,
            o.paid_at,
            o.status,
            o.kds_status,
            o.kds_completed_at,
            o.kds_completed_by,
            o.note,
            o.created_at,
            o.updated_at
     from orders o
     join app_users u on u.id = o.staff_id
     where ${conditions.join(' and ')}
     order by o.created_at desc`,
    params,
  );

  return result.rows.map((row) => toPublicOrder(row));
}

export async function getOrderByIdForStaff(orderId, actorUser) {
  ensureStaffUser(actorUser);

  const normalizedOrderId = normalizeId(orderId, 'Order id');
  const header = await findOrderHeaderByIdForStaff(normalizedOrderId, actorUser.id);

  if (!header) {
    throw new ApiError(404, 'Order not found.');
  }

  const [order] = await buildOrdersWithItems([header]);
  return order;
}
