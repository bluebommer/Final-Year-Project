import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PasswordReset } from "@/models/PasswordReset";
import { checkRateLimit } from "@/lib/rateLimit";
import { validatePassword } from "@/lib/validation";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET as string);
const SALT_ROUNDS = 12;
const MAX_CODE_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    await connectToDatabase();

    const rl = await checkRateLimit(`reset-password:${ip}`, {
      maxRequests: 10,
      windowSeconds: 15 * 60,
    });

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait before trying again." },
        { status: 429 }
      );
    }

    const { email, code, newPassword } = await req.json();
    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Email, code, and new password are required." }, { status: 400 });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });

    const normalizedEmail = email.toLowerCase().trim();
    const record = await PasswordReset.findOne({ email: normalizedEmail });

    if (!record) {
      return NextResponse.json(
        { error: "No password reset pending for this email. Please request a new one." },
        { status: 404 }
      );
    }

    if (new Date() > record.expiresAt) {
      await PasswordReset.deleteOne({ email: normalizedEmail });
      return NextResponse.json(
        { error: "Reset code expired. Please request a new one." },
        { status: 410 }
      );
    }

    if (record.attempts >= MAX_CODE_ATTEMPTS) {
      await PasswordReset.deleteOne({ email: normalizedEmail });
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please request a new code." },
        { status: 429 }
      );
    }

    if (record.code !== code.trim()) {
      record.attempts += 1;
      await record.save();
      const left = MAX_CODE_ATTEMPTS - record.attempts;
      return NextResponse.json(
        { error: `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} remaining.` },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      await PasswordReset.deleteOne({ email: normalizedEmail });
      return NextResponse.json({ error: "Account no longer exists." }, { status: 404 });
    }

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    await PasswordReset.deleteOne({ email: normalizedEmail });

    const token = await new SignJWT({
      sub: user._id.toString(),
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      message: "Password reset successfully.",
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        gender: user.gender,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("[RESET-PASSWORD]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
