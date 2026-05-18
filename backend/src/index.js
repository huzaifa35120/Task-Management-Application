require('dotenv').config();

const { createApp } = require('./app');
const { connectDB } = require('./config/db');

const PORT = Number(process.env.PORT) || 5050;

async function start() {
  try {
    await connectDB();
    console.log('[db] connected');

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`[server] TaskFlow API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[fatal] failed to start server:', err.message);
    process.exit(1);
  }
}

start();
