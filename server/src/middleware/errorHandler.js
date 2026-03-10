export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  // Always log so errors appear in Render / cloud logs
  // eslint-disable-next-line no-console
  console.error(`[ERROR] ${req.method} ${req.path} → ${status}: ${message}`, err.stack || "");

  res.status(status).json({
    error: {
      message,
      ...(process.env.NODE_ENV !== "production" && err.details ? { details: err.details } : {}),
    },
  });
}
