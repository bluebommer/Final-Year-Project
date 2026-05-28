import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EmailVerification } from "../../../../models/EmailVerification";
import { checkRateLimit } from "../../../../lib/rateLimit";
import { sendVerificationEmail } from "../../../../lib/mailer";
import crypto from "crypto";

const CODE_EXPIRY_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    await connectToDatabase();

    // Rate limit: 3 resends per email per hour
    const rl = await checkRateLimit(`resend:${ip}`, {
      maxRequests: 3,
      windowSeconds: 60 * 60,
    });

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many resend attempts. Please wait an hour before trying again." },
        { status: 429 }
      );
    }

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

    const normalizedEmail = email.toLowerCase().trim();
    const record = await EmailVerification.findOne({ email: normalizedEmail });

    if (!record) {
      return NextResponse.json(
        { error: "No pending verification found. Please register again." },
        { status: 404 }
      );
    }

    // Generate fresh code and reset attempts
    const code = String(crypto.randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    record.code = code;
    record.expiresAt = expiresAt;
    record.attempts = 0;
    await record.save();

    await sendVerificationEmail(normalizedEmail, code, record.pendingUser.firstName);

    return NextResponse.json({ message: "New verification code sent." });
  } catch (err) {
    console.error("[RESEND-CODE]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}