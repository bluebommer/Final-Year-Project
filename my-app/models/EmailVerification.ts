import mongoose, { Document, Schema } from "mongoose";

export interface IEmailVerification extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  // Temporary user data held until verification completes
  pendingUser: {
    firstName: string;
    lastName: string;
    passwordHash: string;
    gender: string;
    preferredTopics: string[];
  };
}

const EmailVerificationSchema = new Schema<IEmailVerification>({
  email:     { type: String, required: true, lowercase: true, trim: true },
  code:      { type: String, required: true },
  expiresAt: { type: Date,   required: true },
  attempts:  { type: Number, default: 0 },
  verified:  { type: Boolean, default: false },
  pendingUser: {
    firstName:    { type: String, required: true },
    lastName:     { type: String, default: "" },
    passwordHash: { type: String, required: true },
    gender:       { type: String, default: "" },
    preferredTopics: { type: [String], default: [] },
  },
});

// Auto-delete documents 1 hour after expiry
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });
// Fast lookup by email
EmailVerificationSchema.index({ email: 1 });

export const EmailVerification =
  (mongoose.models.EmailVerification as mongoose.Model<IEmailVerification>) ||
  mongoose.model<IEmailVerification>("EmailVerification", EmailVerificationSchema);