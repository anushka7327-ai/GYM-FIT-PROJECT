const mongoose = require('mongoose');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let mongodProcess = null;

const startLocalMongoServer = () => {
  return new Promise((resolve, reject) => {
    // Only attempt local Windows mongod spawn if running locally on Windows
    if (!process.platform.startsWith('win')) {
      return reject(new Error('Local mongod auto-spawn is only supported on Windows development.'));
    }

    const mongoPath = 'C:\\Program Files\\MongoDB\\Server\\9.0\\bin\\mongod.exe';
    const dbDir = path.resolve(__dirname, '..', '..', 'mongodb-data');

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (!fs.existsSync(mongoPath)) {
      return reject(new Error(`mongod.exe not found at ${mongoPath}`));
    }

    console.log(`[Dev] Starting local MongoDB daemon with dbpath: ${dbDir}...`);
    mongodProcess = spawn(mongoPath, ['--dbpath', dbDir, '--port', '27017'], {
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let started = false;

    mongodProcess.stdout.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('Waiting for connections') || msg.includes('ready for connections') || msg.includes('started')) {
        if (!started) {
          started = true;
          console.log('[Dev] Local MongoDB instance is ready on port 27017.');
          resolve();
        }
      }
    });

    mongodProcess.stderr.on('data', () => {});

    mongodProcess.on('error', (err) => {
      console.warn('[Dev] Could not launch mongod process:', err.message);
      if (!started) reject(err);
    });

    setTimeout(() => {
      if (!started) {
        started = true;
        resolve();
      }
    }, 3500);
  });
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gymfit';
  const isAtlasOrRemote = uri.includes('mongodb+srv://') || (!uri.includes('127.0.0.1') && !uri.includes('localhost'));
  const isProduction = process.env.NODE_ENV === 'production';

  // Sanitize URI for safe logging (mask username and password)
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:*****@');

  console.log(`Connecting to MongoDB at: ${maskedUri}`);

  const mongooseOptions = {
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 10,
    socketTimeoutMS: 45000,
  };

  try {
    const conn = await mongoose.connect(uri, mongooseOptions);
    console.log(`✅ MongoDB Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);

    // If it's a remote Atlas connection or production environment, do NOT attempt local Windows spawn
    if (isAtlasOrRemote || isProduction) {
      console.error('\n⚠️ [MongoDB Atlas Troubleshooting Tips]:');
      console.error('1. Verify MONGO_URI in Render environment variables is correct.');
      console.error('2. Ensure username & password contain no unencoded special characters.');
      console.error('3. In MongoDB Atlas -> Network Access, ensure IP Access List includes "0.0.0.0/0" (Allow Access from Anywhere).');
      console.error('4. In MongoDB Atlas -> Database Access, ensure the database user has Read & Write privileges on "gymfit".\n');
      throw error;
    }

    // Otherwise, local dev fallback
    console.log('[Dev] Direct connection failed. Attempting local development mongod daemon...');
    try {
      await startLocalMongoServer();
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected successfully after local start: ${conn.connection.host}`);
      return conn;
    } catch (innerError) {
      console.error(`❌ Local MongoDB Launch Failed: ${innerError.message}`);
      throw innerError;
    }
  }
};

process.on('exit', () => {
  if (mongodProcess) {
    try {
      mongodProcess.kill();
    } catch (e) {}
  }
});

module.exports = connectDB;
