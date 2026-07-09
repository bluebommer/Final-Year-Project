// app/api/user/preferences/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { BUILTIN_SOURCE_IDS, isValidSourceId } from "@/lib/sources";
import { fetchRssFeedArticles } from "@/lib/rssFeed";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET as string);
const MAX_CUSTOM_FEEDS = 20;

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

interface PrefsShape {
  preferredTopics: string[];
  enabledSources?: string[];
  customFeeds: { id: string; name: string; url: string }[];
}

function serializePrefs(user: PrefsShape) {
  return {
    preferredTopics: user.preferredTopics ?? [],
    // An empty array here means "explicitly disabled every source" — treated
    // the same as "never chosen" so a user can't accidentally zero out their
    // whole feed; only a genuinely absent field means "no preference yet".
    enabledSources:
      user.enabledSources && user.enabledSources.length > 0 ? user.enabledSources : BUILTIN_SOURCE_IDS,
    customFeeds: user.customFeeds ?? [],
  };
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const user = await User.findById(userId).select("preferredTopics enabledSources customFeeds").lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(serializePrefs(user));
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();

  if (Array.isArray(body.preferredTopics)) {
    user.preferredTopics = body.preferredTopics.filter((t: unknown): t is string => typeof t === "string");
  }

  if (Array.isArray(body.enabledSources)) {
    user.enabledSources = body.enabledSources.filter(
      (id: unknown): id is string => typeof id === "string" && isValidSourceId(id)
    );
  }

  if (typeof body.removeCustomFeedId === "string") {
    user.customFeeds = user.customFeeds.filter((f) => f.id !== body.removeCustomFeedId) as typeof user.customFeeds;
  }

  if (body.addCustomFeed) {
    const { name, url } = body.addCustomFeed;

    if (typeof name !== "string" || !name.trim() || name.trim().length > 60) {
      return NextResponse.json({ error: "Feed name is required (max 60 characters)." }, { status: 400 });
    }
    if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "A valid feed URL is required." }, { status: 400 });
    }
    if (user.customFeeds.length >= MAX_CUSTOM_FEEDS) {
      return NextResponse.json({ error: `You can add up to ${MAX_CUSTOM_FEEDS} custom feeds.` }, { status: 400 });
    }

    try {
      const preview = await fetchRssFeedArticles(url, name.trim());
      if (preview.length === 0) {
        return NextResponse.json({ error: "Could not read that feed. Check the URL and try again." }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Could not read that feed. Check the URL and try again." }, { status: 400 });
    }

    user.customFeeds.push({ id: crypto.randomUUID(), name: name.trim(), url });
  }

  await user.save();

  return NextResponse.json(serializePrefs(user));
}
