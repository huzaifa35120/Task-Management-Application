const mongoose = require('mongoose');

let memoryServer = null;

function maskUri(uri) {
  return uri.replace(/\/\/([^:@]+):([^@]+)@/, '//$1:***@');
}

async function startMemoryServer() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());
  console.warn('[db] in-memory MongoDB ready (data will not persist across restarts)');
  return mongoose.connection;
}

async function connectDB(uri) {
  const configured = uri || process.env.MONGODB_URI;
  const useMemory = process.env.USE_MEMORY_DB === 'true';

  mongoose.set('strictQuery', true);

  if (useMemory) {
    return startMemoryServer();
  }

  if (!configured) {
    throw new Error(
      'MONGODB_URI is not set. Add it to backend/.env (e.g. mongodb://127.0.0.1:27017/taskflow), ' +
        'or set USE_MEMORY_DB=true to use the in-memory database.'
    );
  }

  await mongoose.connect(configured, { serverSelectionTimeoutMS: 3000 });
  console.log(`[db] connected to ${maskUri(configured)}`);
  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = { connectDB, disconnectDB };
