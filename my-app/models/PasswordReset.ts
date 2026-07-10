import mongoose, { Document, Schema } from "mongoose";

export interface IPasswordReset extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  attempts: number;
}

const PasswordResetSchema = new Schema<IPasswordReset>({
  email:     { type: String, required: true, lowercase: true, trim: true },
  code:      { type: String, required: true },
  expiresAt: { type: Date,   required: true },
  attempts:  { type: Number, default: 0 },
});

// Auto-delete documents 1 hour after expiry
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });
// Fast lookup by email
PasswordResetSchema.index({ email: 1 });

export const PasswordReset =
  (mongoose.models.PasswordReset as mongoose.Model<IPasswordReset>) ||
  mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema);
