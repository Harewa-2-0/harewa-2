import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI?.trim();

if (!MONGO_URI) {
  throw new Error(" please define mongo environment variable");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const CONNECT_OPTS = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 15_000,
  socketTimeoutMS: 45_000,
  maxPoolSize: 10,
  family: 4,
};

export function resetMongoConnection() {
  cached.conn = null;
  cached.promise = null;
  const state = mongoose.connection.readyState;
  if (state !== 0 && state !== 3) {
    void mongoose.disconnect().catch(() => undefined);
  }
}

function isTransientMongoError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const { name, message } = error;
  return (
    name === "MongoNetworkError" ||
    name === "MongoPoolClearedError" ||
    name === "MongoServerSelectionError" ||
    message.includes("ETIMEDOUT") ||
    message.includes("ECONNRESET") ||
    message.includes("PoolRequstedRetry")
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState !== 1) {
    resetMongoConnection();
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI!, CONNECT_OPTS).then((conn) => {
      return conn;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    resetMongoConnection();
    throw e;
  }

  return cached.conn;
}

/** Reconnect and retry operations that fail due to stale Atlas connections. */
export async function withMongoRetry<T>(
  operation: () => Promise<T>,
  retries = 3
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await connectDB();
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isTransientMongoError(error) || attempt === retries - 1) {
        throw error;
      }
      resetMongoConnection();
      await sleep(250 * (attempt + 1));
    }
  }

  throw lastError ?? new Error("Database operation failed");
}

export default connectDB;
