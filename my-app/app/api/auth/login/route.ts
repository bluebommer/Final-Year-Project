import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { User } from "@/models/User";
import { connectToDatabase } from "../../../../lib/mongodb";
import { checkRateLimit } from    "../../../../lib/rateLimit";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET as string);
const JWT_EXPIRES_IN = "7d";
const COOKIE_NAME = "auth_token";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";

    await connectToDatabase();

    // Rate limit: 10 login attempts per IP per 15 minutes
    const rl = await checkRateLimit(`login:${ip}`, {
      maxRequests: 10,
      windowSeconds: 15 * 60,
    });

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait before trying again." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000)) },
        }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Use a generic error to prevent user enumeration
    const genericError = "Invalid email or password.";

    if (!user) {
      return NextResponse.json({ error: genericError }, { status: 401 });
    }

    // Check account lock
    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil!.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Account temporarily locked. Try again in ${minutesLeft} minute(s).` },
        { status: 423 }
      );
    }

    // Google-only accounts have no password to check against
    if (!user.passwordHash) {
      return NextResponse.json({ error: genericError }, { status: 401 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      await user.incrementLoginAttempts();
      const attemptsLeft = Math.max(0, 5 - user.loginAttempts);
      return NextResponse.json(
        {
          error: attemptsLeft > 0
            ? `${genericError} ${attemptsLeft} attempt(s) remaining before lockout.`
            : "Account locked due to too many failed attempts.",
        },
        { status: 401 }
      );
    }

    // Successful login — reset failed attempts
    await user.resetLoginAttempts();

    // Sign JWT
    const token = await new SignJWT({
      sub: user._id.toString(),
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      message: "Signed in successfully.",
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        gender: user.gender,
      },
    });

    // Set HttpOnly cookie (not accessible via JS)
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("[LOGIN]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}