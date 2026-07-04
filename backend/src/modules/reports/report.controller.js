import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  listBestSellingProducts,
  listLowStockIngredients,
  listRevenueReport,
  listDiscardReport,
} from './report.service.js';

export const getRevenueReport = asyncHandler(async (req, res) => {
  const revenue = await listRevenueReport(req.query);

  return sendSuccess(res, {
    message: 'Revenue report loaded successfully.',
    data: revenue,
  });
});

export const getBestSellingProductsReport = asyncHandler(async (req, res) => {
  const products = await listBestSellingProducts(req.query);

  return sendSuccess(res, {
    message: 'Best-selling products report loaded successfully.',
    data: products,
  });
});

export const getLowStockIngredientsReport = asyncHandler(async (req, res) => {
  const ingredients = await listLowStockIngredients();

  return sendSuccess(res, {
    message: 'Low-stock ingredients report loaded successfully.',
    data: ingredients,
  });
});

export const getDiscardsReport = asyncHandler(async (req, res) => {
  const discards = await listDiscardReport(req.query);

  return sendSuccess(res, {
    message: 'Discard report loaded successfully.',
    data: discards,
  });
});
