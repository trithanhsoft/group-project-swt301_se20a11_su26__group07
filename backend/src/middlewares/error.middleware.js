import { sendError } from '../utils/apiResponse.js';

export function notFoundHandler(req, res) {
  return sendError(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(error, req, res, next) {
  console.error('[error]', error);

  return sendError(res, {
    statusCode: error.statusCode || 500,
    message: error.message || 'Internal server error',
    errors: error.errors || [],
  });
}
