import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PasswordReset } from "@/models/PasswordReset";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendPasswordResetEmail, sendGoogleAccountNotice } from "@/lib/mailer";
import crypto from "crypto";

const CODE_EXPIRY_MINUTES = 15;

function generateCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    await connectToDatabase();

    const rl = await checkRateLimit(`forgot-password:${ip}`, {
      maxRequests: 5,
      windowSeconds: 60 * 60,
    });

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000)) } }
      );
    }

    const { email } = await req.json();
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Never reveal whether an account exists — every branch below returns
    // this exact same response.
    const genericResponse = () =>
      NextResponse.json({ message: "If an account exists for that email, we've sent instructions." });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return genericResponse();

    if (user.authProvider === "google" || !user.passwordHash) {
      await sendGoogleAccountNotice(normalizedEmail, user.firstName);
      return genericResponse();
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    await PasswordReset.findOneAndUpdate(
      { email: normalizedEmail },
      { email: normalizedEmail, code, expiresAt, attempts: 0 },
      { upsert: true, new: true }
    );

    await sendPasswordResetEmail(normalizedEmail, code, user.firstName);

    return genericResponse();
  } catch (err) {
    console.error("[FORGOT-PASSWORD]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
