import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { SignJWT } from "jose";
import { connectToDatabase } from "@/lib/mongodb";
import { checkRateLimit } from "@/lib/rateLimit";
import { User } from "@/models/User";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET as string);
const JWT_EXPIRES_IN = "7d";
const COOKIE_NAME = "auth_token"; // Same cookie as your login route

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    await connectToDatabase();

    // Same rate limit pattern as your login route
    const rl = await checkRateLimit(`google-auth:${ip}`, {
      maxRequests: 10,
      windowSeconds: 15 * 60,
    });

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000)),
          },
        }
      );
    }

    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ error: "Google credential is required." }, { status: 400 });
    }

    // Verify the Google token
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      return NextResponse.json({ error: "Invalid Google credential." }, { status: 401 });
    }

    if (!payload?.email) {
      return NextResponse.json({ error: "Could not retrieve email from Google." }, { status: 401 });
    }

    const { sub: googleId, given_name, family_name, email, picture } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if a LOCAL account already exists with this email
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.authProvider === "local") {
      // Link Google to their existing local account
      existingUser.googleId = googleId;
      existingUser.avatar = picture;
      existingUser.authProvider = "google";
      await existingUser.save();
    }

    // Upsert Google user (create or update)
    const user = await User.findOneAndUpdate(
      { googleId },
      {
        $set: {
          googleId,
          email:        normalizedEmail,
          firstName:    given_name  ?? existingUser?.firstName ?? "",
          lastName:     family_name ?? existingUser?.lastName  ?? "",
          avatar:       picture,
          authProvider: "google",
        },
        // Only set gender on first creation
        $setOnInsert: { gender: "" },
      },
      { upsert: true, new: true }
    );

    // Sign JWT — identical shape to your login route
    const token = await new SignJWT({
      sub:   user._id.toString(),
      email: user.email,
      name:  `${user.firstName} ${user.lastName}`.trim(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      message: "Signed in successfully.",
      user: {
        id:     user._id,
        name:   `${user.firstName} ${user.lastName}`.trim(),
        email:  user.email,
        gender: user.gender,
        avatar: user.avatar,
      },
    });

    // Same cookie config as your login route
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      path:     "/",
      maxAge:   60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("[GOOGLE_AUTH]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}