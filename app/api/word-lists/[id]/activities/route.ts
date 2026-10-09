import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const wordListId = Number(id);

    if (!Number.isInteger(wordListId)) {
      return NextResponse.json(
        { error: "Invalid word list ID" },
        { status: 400 },
      );
    }

    const activities = await prisma.activity.findMany({
      where: {
        wordListId,
      },
      include: {
        word: {
          include: {
            phonemes: {
              orderBy: {
                position: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Failed to fetch activities:", error);

    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const startedAt = Date.now();
  let activityType: "WORDLE" | "WORD_SEARCH" | null = null;

  // Analytics must never prevent the main application from working.
  async function recordEvent(success: boolean, errorMessage?: string) {
    if (!activityType) return;

    try {
      await prisma.generationEvent.create({
        data: {
          type: activityType,
          success,
          errorMessage: errorMessage ?? null,
          durationMs: Math.max(0, Date.now() - startedAt),
          source: "LIVE",
        },
      });
    } catch (error) {
      console.error("Failed to record generation analytics:", error);
    }
  }

  async function fail(message: string, status: number) {
    await recordEvent(false, message);

    return NextResponse.json({ error: message }, { status });
  }

  try {
    const { id } = await params;
    const wordListId = Number(id);

    if (!Number.isInteger(wordListId) || wordListId <= 0) {
      return NextResponse.json(
        { error: "Invalid word list ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { name, type, difficulty, hint, wordId, settings } = body;

    if (type === "WORDLE" || type === "WORD_SEARCH") {
      activityType = type;
    }

    if (typeof name !== "string" || name.trim() === "") {
      return fail("Name is required", 400);
    }

    if (!activityType) {
      return NextResponse.json(
        { error: "Invalid activity type" },
        { status: 400 },
      );
    }

    if (!["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      return fail("Invalid difficulty", 400);
    }

    if (hint !== undefined && typeof hint !== "boolean") {
      return fail("Hint must be a boolean", 400);
    }

    if (settings !== undefined && typeof settings !== "string") {
      return fail("Settings must be a string", 400);
    }

    if (typeof settings === "string") {
      try {
        JSON.parse(settings);
      } catch {
        return fail("Settings must contain valid JSON", 400);
      }
    }

    const wordList = await prisma.wordList.findUnique({
      where: { id: wordListId },
      include: {
        words: {
          include: {
            phonemes: true,
          },
        },
      },
    });

    if (!wordList) {
      return fail("Word list not found", 404);
    }

    let targetWordId: number | undefined;

    if (
      activityType === "WORDLE" &&
      (wordId === undefined || wordId === null)
    ) {
      return fail("Wordle activities require a target word", 400);
    }

    if (
      activityType === "WORD_SEARCH" &&
      wordId !== undefined &&
      wordId !== null
    ) {
      return fail("Word Search activities cannot have a target word", 400);
    }

    if (wordId !== undefined && wordId !== null) {
      targetWordId = Number(wordId);

      if (!Number.isInteger(targetWordId) || targetWordId <= 0) {
        return fail("Invalid word ID", 400);
      }

      const word = await prisma.word.findFirst({
        where: {
          id: targetWordId,
          wordListId,
        },
      });

      if (!word) {
        return fail("Word not found in this word list", 404);
      }
    }

    if (activityType === "WORD_SEARCH") {
      const gridSize =
        difficulty === "EASY" ? 7 : difficulty === "MEDIUM" ? 8 : 9;

      const usableWords = wordList.words.filter(
        (word) => word.phonemes.length <= gridSize,
      );

      if (usableWords.length === 0) {
        return fail(
          `No words in this word list can fit in a ${gridSize}×${gridSize} grid.`,
          400,
        );
      }
    }

    const activity = await prisma.activity.create({
      data: {
        name: name.trim(),
        type: activityType,
        difficulty,
        hint: hint ?? true,
        wordListId,
        wordId: targetWordId,
        settings: settings ?? null,
      },
    });

    await recordEvent(true);

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity:", error);

    await recordEvent(false, "Failed to create activity");

    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 },
    );
  }
}
