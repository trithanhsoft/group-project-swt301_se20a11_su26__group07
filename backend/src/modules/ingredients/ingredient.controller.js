import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createIngredient,
  getIngredientById,
  listIngredientTags,
  listIngredients,
  softDeleteIngredient,
  updateIngredient,
} from './ingredient.service.js';

export const getIngredients = asyncHandler(async (req, res) => {
  const [ingredients, tags] = await Promise.all([listIngredients(req.query), listIngredientTags()]);

  return sendSuccess(res, {
    message: 'Ingredients loaded successfully.',
    data: {
      ingredients,
      tags,
    },
  });
});

export const getIngredient = asyncHandler(async (req, res) => {
  const ingredient = await getIngredientById(req.params.id);

  return sendSuccess(res, {
    message: 'Ingredient loaded successfully.',
    data: {
      ingredient,
    },
  });
});

export const createNewIngredient = asyncHandler(async (req, res) => {
  const ingredient = await createIngredient(req.body, req.user);

  return sendSuccess(res, {
    message: 'Ingredient created successfully.',
    statusCode: 201,
    data: {
      ingredient,
    },
  });
});

export const updateExistingIngredient = asyncHandler(async (req, res) => {
  const ingredient = await updateIngredient(req.params.id, req.body);

  return sendSuccess(res, {
    message: 'Ingredient updated successfully.',
    data: {
      ingredient,
    },
  });
});

export const deleteExistingIngredient = asyncHandler(async (req, res) => {
  const ingredient = await softDeleteIngredient(req.params.id);

  return sendSuccess(res, {
    message: 'Ingredient deleted successfully.',
    data: {
      ingredient,
    },
  });
});
