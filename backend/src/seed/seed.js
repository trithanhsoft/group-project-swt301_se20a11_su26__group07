import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool, query } from '../config/db.js';
import { resolveIngredientTag, resolveProductTag } from '../utils/tagTaxonomy.js';

dotenv.config();

const users = [
  {
    username: 'admin',
    email: 'admin@minicoffee.local',
    password: 'Admin123@',
    fullName: 'Admin Demo',
    role: 'ADMIN',
  },
  {
    username: 'staff',
    email: 'staff@minicoffee.local',
    password: 'Staff123@',
    fullName: 'Staff Demo',
    role: 'STAFF',
  },
];

const ingredients = [
  { name: 'Coffee bean', unit: 'GRAM', currentStock: 1000, lowStockThreshold: 100 },
  { name: 'Milk', unit: 'ML', currentStock: 1000, lowStockThreshold: 100 },
  { name: 'Sugar', unit: 'GRAM', currentStock: 50, lowStockThreshold: 100 },
];

const products = [
  { name: 'Milk Coffee', price: 30000, status: 'ACTIVE' },
  { name: 'Black Coffee', price: 25000, status: 'ACTIVE' },
  { name: 'Inactive Test Product', price: 20000, status: 'INACTIVE' },
  { name: 'No Recipe Product', price: 20000, status: 'ACTIVE' },
];

const recipeDefinitions = {
  'Milk Coffee': [
    { ingredientName: 'Coffee bean', quantityRequired: 20 },
    { ingredientName: 'Milk', quantityRequired: 100 },
    { ingredientName: 'Sugar', quantityRequired: 10 },
  ],
  'Black Coffee': [
    { ingredientName: 'Coffee bean', quantityRequired: 20 },
    { ingredientName: 'Sugar', quantityRequired: 5 },
  ],
};

const defaultShifts = [
  { name: 'Ca Sáng', startTime: '06:00:00', endTime: '12:00:00', hourlyRate: 25000 },
  { name: 'Ca Chiều', startTime: '12:00:00', endTime: '18:00:00', hourlyRate: 25000 },
  { name: 'Ca Tối', startTime: '18:00:00', endTime: '23:00:00', hourlyRate: 30000 },
];

async function upsertUser(user) {
  const passwordHash = await bcrypt.hash(user.password, 10);
  const result = await query(
    `insert into app_users (username, email, password_hash, full_name, role, status)
     values ($1, $2, $3, $4, $5, 'ACTIVE')
     on conflict (username)
     do update set
       email = excluded.email,
       password_hash = excluded.password_hash,
       full_name = excluded.full_name,
       role = excluded.role,
       status = 'ACTIVE',
       deleted_at = null,
       updated_at = now()
     returning id, username, role`,
    [user.username, user.email, passwordHash, user.fullName, user.role],
  );

  return result.rows[0];
}

async function upsertIngredient(ingredient, createdBy) {
  const tag = resolveIngredientTag(ingredient.tag, ingredient.name);
  const result = await query(
    `insert into ingredients (name, tag, unit, current_stock, low_stock_threshold, created_by)
     values ($1, $2, $3, $4, $5, $6)
     on conflict ((lower(name)), unit)
     where deleted_at is null
     do update set
       tag = case
         when ingredients.tag is null
           or btrim(ingredients.tag) = ''
           or ingredients.tag = 'Khác'
         then excluded.tag
         else ingredients.tag
       end,
       current_stock = excluded.current_stock,
       low_stock_threshold = excluded.low_stock_threshold,
       created_by = excluded.created_by,
       updated_at = now()
     returning id, name`,
    [ingredient.name, tag, ingredient.unit, ingredient.currentStock, ingredient.lowStockThreshold, createdBy],
  );

  return result.rows[0];
}

async function upsertProduct(product, createdBy) {
  const tag = resolveProductTag(product.tag, product.name);
  const result = await query(
    `insert into products (name, tag, price, status, created_by)
     values ($1, $2, $3, $4, $5)
     on conflict ((lower(name)))
     where deleted_at is null
     do update set
       tag = case
         when products.tag is null
           or btrim(products.tag) = ''
           or products.tag = 'Khác'
         then excluded.tag
         else products.tag
       end,
       price = excluded.price,
       status = excluded.status,
       created_by = excluded.created_by,
       updated_at = now()
     returning id, name`,
    [product.name, tag, product.price, product.status, createdBy],
  );

  return result.rows[0];
}

async function upsertRecipe(productId, createdBy) {
  const result = await query(
    `insert into recipes (product_id, created_by)
     values ($1, $2)
     on conflict (product_id)
     where deleted_at is null
     do update set
       created_by = excluded.created_by,
       updated_at = now()
     returning id`,
    [productId, createdBy],
  );

  return result.rows[0];
}

async function replaceRecipeItems(recipeId, items, ingredientMap) {
  await query('delete from recipe_items where recipe_id = $1', [recipeId]);

  for (const item of items) {
    const ingredient = ingredientMap.get(item.ingredientName);

    if (!ingredient) {
      throw new Error(`Missing ingredient for recipe seed: ${item.ingredientName}`);
    }

    await query(
      `insert into recipe_items (recipe_id, ingredient_id, quantity_required)
       values ($1, $2, $3)`,
      [recipeId, ingredient.id, item.quantityRequired],
    );
  }
}

async function seed() {
  console.log('Seeding Mini Coffee demo data...');

  const admin = await upsertUser(users[0]);
  await upsertUser(users[1]);

  const ingredientMap = new Map();
  for (const ingredient of ingredients) {
    const row = await upsertIngredient(ingredient, admin.id);
    ingredientMap.set(row.name, row);
  }

  const productMap = new Map();
  for (const product of products) {
    const row = await upsertProduct(product, admin.id);
    productMap.set(row.name, row);
  }

  for (const [productName, items] of Object.entries(recipeDefinitions)) {
    const product = productMap.get(productName);
    const recipe = await upsertRecipe(product.id, admin.id);
    await replaceRecipeItems(recipe.id, items, ingredientMap);
  }

  // Seed default shifts
  const shiftCountRes = await query('select count(*) as count from shifts where deleted_at is null');
  if (parseInt(shiftCountRes.rows[0].count, 10) === 0) {
    console.log('Seeding default shifts...');
    for (const shift of defaultShifts) {
      await query(
        `insert into shifts (name, start_time, end_time, hourly_rate)
         values ($1, $2, $3, $4)`,
        [shift.name, shift.startTime, shift.endTime, shift.hourlyRate]
      );
    }
  }

  console.log('Seed completed.');
  console.log('Admin login: admin / Admin123@');
  console.log('Staff login: staff / Staff123@');
}

try {
  await seed();
} catch (error) {
  console.error('Seed failed:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
