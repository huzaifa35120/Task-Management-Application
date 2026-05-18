const mongoose = require('mongoose');

function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ error: 'Validation failed', details });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: `Invalid value for ${err.path}: ${err.value}` });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.publicMessage || err.message || 'Internal server error';

  if (status >= 500 && process.env.NODE_ENV !== 'test') {
    console.error('[error]', err);
  }

  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
