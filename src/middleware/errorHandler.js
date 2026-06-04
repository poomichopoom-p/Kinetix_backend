export const globalErrorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV !== "production" && req) {
    console.error(`[${req.method ?? "?"} ${req.originalUrl ?? "?"}] ${status}: ${message}`);
  }

  return res.status(status).json({
    success: false,
    message,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};
