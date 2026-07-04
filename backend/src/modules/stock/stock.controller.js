import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  adjustStock,
  countStockDaily,
  importStock,
  importStockBatch,
  listStockTransactions,
  getStockForecast,
} from './stock.service.js';

export const createImportTransaction = asyncHandler(async (req, res) => {
  const data = await importStock(req.body, req.user);

  return sendSuccess(res, {
    message: 'Stock imported successfully.',
    statusCode: 201,
    data,
  });
});

export const createAdjustTransaction = asyncHandler(async (req, res) => {
  const data = await adjustStock(req.body, req.user);

  return sendSuccess(res, {
    message: 'Stock adjusted successfully.',
    statusCode: 201,
    data,
  });
});

export const createBatchImportTransaction = asyncHandler(async (req, res) => {
  const data = await importStockBatch(req.body, req.user);

  return sendSuccess(res, {
    message: 'Batch stock import completed successfully.',
    statusCode: 201,
    data,
  });
});

export const createDailyStockCount = asyncHandler(async (req, res) => {
  const data = await countStockDaily(req.body, req.user);

  return sendSuccess(res, {
    message: 'Daily stock count completed successfully.',
    statusCode: 201,
    data,
  });
});

export const getStockTransactions = asyncHandler(async (req, res) => {
  const transactions = await listStockTransactions(req.query);

  return sendSuccess(res, {
    message: 'Stock transactions loaded successfully.',
    data: {
      transactions,
    },
  });
});

export const getForecast = asyncHandler(async (req, res) => {
  const data = await getStockForecast();

  return sendSuccess(res, {
    message: 'Stock forecasts loaded successfully.',
    data,
  });
});
