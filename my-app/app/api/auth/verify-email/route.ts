import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { EmailVerification } from "../../../../models/EmailVerification";
import { checkRateLimit } from "@/lib/rateLimit";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET as string);
const MAX_CODE_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    await connectToDatabase();

    // Rate limit: 10 verify attempts per IP per 15 minutes
    const rl = await checkRateLimit(`verify:${ip}`, {
      maxRequests: 10,
      windowSeconds: 15 * 60,
    });

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait before trying again." },
        { status: 429 }
      );
    }

    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const record = await EmailVerification.findOne({ email: normalizedEmail });

    if (!record) {
      return NextResponse.json(
        { error: "No verification pending for this email. Please register again." },
        { status: 404 }
      );
    }

    if (record.verified) {
      return NextResponse.json({ error: "Email already verified." }, { status: 400 });
    }

    if (new Date() > record.expiresAt) {
      await EmailVerification.deleteOne({ email: normalizedEmail });
      return NextResponse.json(
        { error: "Verification code expired. Please register again to get a new code." },
        { status: 410 }
      );
    }

    // Check attempt limit
    if (record.attempts >= MAX_CODE_ATTEMPTS) {
      await EmailVerification.deleteOne({ email: normalizedEmail });
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please register again." },
        { status: 429 }
      );
    }

    // Wrong code — increment attempts
    if (record.code !== code.trim()) {
      record.attempts += 1;
      await record.save();
      const left = MAX_CODE_ATTEMPTS - record.attempts;
      return NextResponse.json(
        { error: `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} remaining.` },
        { status: 401 }
      );
    }

    // ✅ Code is correct — create the real user account
    const { firstName, lastName, passwordHash, gender } = record.pendingUser;

    // Guard against duplicate (edge case: two simultaneous requests)
    const alreadyExists = await User.findOne({ email: normalizedEmail });
    if (alreadyExists) {
      await EmailVerification.deleteOne({ email: normalizedEmail });
      return NextResponse.json({ error: "Account already exists." }, { status: 409 });
    }

    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      passwordHash,
      gender,
    });

    // Clean up verification record
    await EmailVerification.deleteOne({ email: normalizedEmail });

    // Issue JWT — user is now authenticated
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
      message: "Email verified! Account created successfully.",
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
    console.error("[VERIFY-EMAIL]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}