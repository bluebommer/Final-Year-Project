import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;        // Optional — Google users won't have this
  googleId?: string;            // Google OAuth ID
  avatar?: string;              // Google profile picture
  authProvider: "local" | "google";  // Track how user signed up
  gender: string;
  createdAt: Date;
  updatedAt: Date;
  loginAttempts: number;
  lockUntil?: Date;
  preferredTopics: string[];
  enabledSources?: string[];   // undefined = user never touched Source Manager = treat as all enabled
  customFeeds: { id: string; name: string; url: string }[];
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

const UserSchema = new Schema<IUser>(
  {
    firstName:    { type: String, required: true, trim: true, maxlength: 50 },
    lastName:     { type: String, trim: true, maxlength: 50, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    passwordHash: { type: String },           // No longer required
    googleId:     { type: String, sparse: true, unique: true },  // sparse = allows multiple nulls
    avatar:       { type: String },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    gender: {
      type: String,
      enum: ["male", "female", "non-binary", "other", ""],
      default: "",
    },
    loginAttempts: { type: Number, default: 0 },
    lockUntil:     { type: Date },
    preferredTopics: { type: [String], default: [] },
    // default: undefined (not []) — an empty-array default would get written
    // on the user's very first unrelated save, silently disabling every
    // source. Stays truly absent until Source Manager is touched.
    enabledSources: { type: [String], default: undefined },
    customFeeds: [{
      _id:  false,
      id:   { type: String, required: true },
      name: { type: String, required: true, trim: true, maxlength: 60 },
      url:  { type: String, required: true, trim: true },
    }],
  },
  { timestamps: true }
);

// Only local users should have passwordHash
UserSchema.pre("save", function () {
  if (this.authProvider === "local" && !this.passwordHash) {
    throw new Error("Password is required for local accounts");
  }
});

UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

UserSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  if (this.lockUntil && this.lockUntil < new Date()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      this.lockUntil = new Date(Date.now() + LOCK_TIME_MINUTES * 60 * 1000);
    }
  }
  await this.save();
};

UserSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

export const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);