const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const taskRoutes = require('./routes/tasks');
const { TASK_STATUSES, TASK_PRIORITIES } = require('./models/Task');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || true,
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
