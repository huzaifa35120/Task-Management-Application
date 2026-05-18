const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const taskRoutes = require('./routes/tasks');
const { TASK_STATUSES, TASK_PRIORITIES } = require('./models/Task');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function buildOriginMatchers(raw) {
  return (raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pattern) => {
      if (pattern === '*') return () => true;
      if (!pattern.includes('*')) return (origin) => origin === pattern;
      const escaped = pattern
        .split('*')
        .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*');
      const re = new RegExp(`^${escaped}$`);
      return (origin) => re.test(origin);
    });
}

function createApp() {
  const app = express();

  const originMatchers = buildOriginMatchers(process.env.CLIENT_ORIGIN);

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (originMatchers.length === 0) return cb(null, true);
        if (originMatchers.some((match) => match(origin))) return cb(null, true);
        return cb(new Error(`Not allowed by CORS: ${origin}`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.get('/api/meta', (req, res) => {
    res.json({
      statuses: TASK_STATUSES,
      priorities: TASK_PRIORITIES,
    });
  });

  app.use('/api/tasks', taskRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
