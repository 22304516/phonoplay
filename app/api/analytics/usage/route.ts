import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const validPages = new Set([
  "/",
  "/about",
  "/settings",
  "/word-lists",
  "/wordle",
  "/word-search",
  "/dashboard",
]);

const validActivityTypes = new Set(["WORDLE", "WORD_SEARCH"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { page, durationMs, activityType, sessionId } = body;

    if (typeof page !== "string" || !validPages.has(page)) {
      return NextResponse.json({ error: "Invalid page" }, { status: 400 });
    }

    if (
      durationMs !== undefined &&
      (!Number.isInteger(durationMs) ||
        durationMs < 0 ||
        durationMs > 86_400_000)
    ) {
      return NextResponse.json(
        { error: "Invalid page duration" },
        { status: 400 },
      );
    }

    if (
      activityType !== undefined &&
      activityType !== null &&
      !validActivityTypes.has(activityType)
    ) {
      return NextResponse.json(
        { error: "Invalid activity type" },
        { status: 400 },
      );
    }

    if (
      sessionId !== undefined &&
      (typeof sessionId !== "string" || sessionId.length > 100)
    ) {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 },
      );
    }

    await prisma.usageEvent.create({
      data: {
        page,
        durationMs: durationMs ?? null,
        activityType: activityType ?? null,
        sessionId: sessionId ?? null,
        source: "LIVE",
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to record usage event:", error);

    return NextResponse.json(
      { error: "Failed to record usage event" },
      { status: 500 },
    );
  }
}
