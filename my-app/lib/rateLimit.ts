import mongoose, { Document, Schema } from "mongoose";

interface IRateLimit extends Document {
  key: string;
  count: number;
  resetAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>({
  key:     { type: String, required: true, unique: true },
  count:   { type: Number, default: 0 },
  resetAt: { type: Date, required: true },
});

// TTL index: MongoDB auto-deletes expired docs
RateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimit =
  (mongoose.models.RateLimit as mongoose.Model<IRateLimit>) ||
  mongoose.model<IRateLimit>("RateLimit", RateLimitSchema);

interface RateLimitConfig {
  maxRequests: number;   // max allowed in window
  windowSeconds: number; // window size in seconds
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = new Date();

  const doc = await RateLimit.findOneAndUpdate(
    {
      key,
      resetAt: { $gt: now }, // window still active
    },
    { $inc: { count: 1 } },
    { new: true }
  );

  if (doc) {
    const allowed = doc.count <= config.maxRequests;
    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - doc.count),
      resetAt: doc.resetAt,
    };
  }

  // No active window — create a fresh one
  const resetAt = new Date(now.getTime() + config.windowSeconds * 1000);
  await RateLimit.findOneAndUpdate(
    { key },
    { key, count: 1, resetAt },
    { upsert: true, new: true }
  );

  return {
    allowed: true,
    remaining: config.maxRequests - 1,
    resetAt,
  };
}