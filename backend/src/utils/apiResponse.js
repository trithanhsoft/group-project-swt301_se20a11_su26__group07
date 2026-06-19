export function sendSuccess(res, { message = 'Success', data = null, statusCode = 200 } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(res, { message = 'Error', errors = [], statusCode = 500 } = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
