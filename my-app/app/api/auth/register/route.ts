import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { EmailVerification } from "../../../../models/EmailVerification";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendVerificationEmail } from "../../../../lib/mailer";
import { validatePassword } from "@/lib/validation";
import crypto from "crypto";

const SALT_ROUNDS = 12;
const CODE_EXPIRY_MINUTES = 15;

function generateCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    await connectToDatabase();

    const rl = await checkRateLimit(`register:${ip}`, {
      maxRequests: 5,
      windowSeconds: 60 * 60,
    });

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000)) } }
      );
    }

    const { firstName, lastName, email, password, gender, topics } = await req.json();

    if (!firstName?.trim()) return NextResponse.json({ error: "First name is required." }, { status: 400 });
    if (!email?.trim())     return NextResponse.json({ error: "Email is required." }, { status: 400 });
    if (!password)          return NextResponse.json({ error: "Password is required." }, { status: 400 });

    const passwordError = validatePassword(password);
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    await EmailVerification.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        code,
        expiresAt,
        attempts: 0,
        verified: false,
        pendingUser: {
          firstName: firstName.trim(),
          lastName: lastName?.trim() ?? "",
          passwordHash,
          gender: gender ?? "",
          preferredTopics: Array.isArray(topics) ? topics.filter((t: unknown) => typeof t === "string") : [],
        },
      },
      { upsert: true, new: true }
    );

    await sendVerificationEmail(normalizedEmail, code, firstName.trim());

    return NextResponse.json(
      { message: "Verification code sent. Please check your email.", email: normalizedEmail },
      { status: 200 }
    );
  } catch (err) {
    console.error("[REGISTER]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}