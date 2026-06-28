export const DEFAULT_PRODUCT_TAG = 'Khác';
export const DEFAULT_INGREDIENT_TAG = 'Khác';

export const PRODUCT_TAG_SUGGESTIONS = Object.freeze([
  'Cà phê',
  'Trà',
  'Freeze',
  'Espresso',
  'Bánh',
  'Nước ép',
  'Sinh tố',
  DEFAULT_PRODUCT_TAG,
]);

export const INGREDIENT_TAG_SUGGESTIONS = Object.freeze([
  'Bột cà phê',
  'Bột trà',
  'Trà',
  'Topping',
  'Syrup',
  'Sữa',
  'Trái cây',
  'Ly / bao bì',
  DEFAULT_INGREDIENT_TAG,
]);

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toSearchText(value) {
  return normalizeString(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/gu, 'd')
    .replace(/Đ/gu, 'd')
    .toLowerCase();
}

function matchesAnyPattern(value, patterns) {
  return patterns.some((pattern) => pattern.test(value));
}

const PRODUCT_TAG_RULES = [
  {
    tag: 'Espresso',
    patterns: [
      /\bespresso\b/u,
      /\bamericano\b/u,
      /\blatte\b/u,
      /\bcappuccino\b/u,
      /\bmocha\b/u,
      /\bmacchiato\b/u,
    ],
  },
  {
    tag: 'Freeze',
    patterns: [/\bfreeze\b/u, /\bda xay\b/u, /\bfrappe\b/u],
  },
  {
    tag: 'Bánh',
    patterns: [/\bbanh\b/u, /\bcroissant\b/u, /\bmuffin\b/u, /\bcookie\b/u, /\btiramisu\b/u, /\bcake\b/u],
  },
  {
    tag: 'Nước ép',
    patterns: [/\bnuoc ep\b/u, /\bjuice\b/u, /\bep\b/u],
  },
  {
    tag: 'Sinh tố',
    patterns: [/\bsinh to\b/u, /\bsmoothie\b/u],
  },
  {
    tag: 'Cà phê',
    patterns: [/\bphin\b/u, /\bbac xiu\b/u, /\bcafe\b/u, /\bca phe\b/u, /\bcoffee\b/u],
  },
  {
    tag: 'Trà',
    patterns: [/\btra\b/u, /\btea\b/u, /\bmatcha\b/u, /\boolong\b/u, /\bsen\b/u, /\bdao\b/u, /\bvai\b/u, /\blai\b/u],
  },
];

const INGREDIENT_TAG_RULES = [
  {
    tag: 'Bột cà phê',
    patterns: [/\bca phe\b/u, /\bcafe\b/u, /\bcoffee\b/u, /\bespresso\b/u, /\bphin\b/u, /\bcot cafe\b/u],
  },
  {
    tag: 'Bột trà',
    patterns: [/\bbot tra\b/u, /\bmatcha powder\b/u, /\bpowder tea\b/u],
  },
  {
    tag: 'Topping',
    patterns: [
      /\btopping\b/u,
      /\btran chau\b/u,
      /\bthach\b/u,
      /\bjelly\b/u,
      /\bpudding\b/u,
      /\bfoam\b/u,
      /\bkem cheese\b/u,
      /\bcheese\b/u,
    ],
  },
  {
    tag: 'Syrup',
    patterns: [/\bsyrup\b/u, /\bsiro\b/u, /\bduong nuoc\b/u, /\bnuoc duong\b/u],
  },
  {
    tag: 'Sữa',
    patterns: [/\bsua\b/u, /\bmilk\b/u, /\bcondensed\b/u, /\bwhipping\b/u],
  },
  {
    tag: 'Ly / bao bì',
    patterns: [/\bly\b/u, /\bnap\b/u, /\bong hut\b/u, /\bbao bi\b/u, /\bcup\b/u, /\blid\b/u, /\bstraw\b/u],
  },
  {
    tag: 'Trà',
    patterns: [/\btra\b/u, /\btea\b/u, /\boolong\b/u, /\blai\b/u, /\bsen\b/u],
  },
  {
    tag: 'Trái cây',
    patterns: [/\btrai cay\b/u, /\bdao\b/u, /\bvai\b/u, /\bdau\b/u, /\bxoai\b/u, /\bchanh\b/u, /\bcam\b/u, /\bfruit\b/u],
  },
];

function inferTag(name, fallbackTag, rules, defaultTag) {
  const searchText = toSearchText(name);

  if (!searchText) {
    return normalizeString(fallbackTag) || defaultTag;
  }

  const matchedRule = rules.find((rule) => matchesAnyPattern(searchText, rule.patterns));
  return matchedRule?.tag || normalizeString(fallbackTag) || defaultTag;
}

export function inferProductTag(name, fallbackTag = DEFAULT_PRODUCT_TAG) {
  return inferTag(name, fallbackTag, PRODUCT_TAG_RULES, DEFAULT_PRODUCT_TAG);
}

export function resolveProductTag(tag, name) {
  return normalizeString(tag) || inferProductTag(name);
}

export function inferIngredientTag(name, fallbackTag = DEFAULT_INGREDIENT_TAG) {
  return inferTag(name, fallbackTag, INGREDIENT_TAG_RULES, DEFAULT_INGREDIENT_TAG);
}

export function resolveIngredientTag(tag, name) {
  return normalizeString(tag) || inferIngredientTag(name);
}
