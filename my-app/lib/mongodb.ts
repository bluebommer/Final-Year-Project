import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // Without an explicit bound, the driver's default serverSelectionTimeoutMS
    // (30s) means an unreachable cluster (e.g. no internet) blocks whatever
    // server render triggered this for half a minute instead of failing fast
    // into the "signed out" fallback path callers already handle.
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Let the next call retry instead of replaying this same rejection for
    // the rest of the process lifetime (e.g. once connectivity returns).
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}