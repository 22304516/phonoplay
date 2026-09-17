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
  try {
    const { id } = await params;
    const wordListId = Number(id);

    if (!Number.isInteger(wordListId)) {
      return Response.json({ error: "Invalid word list ID" }, { status: 400 });
    }

    const body = await request.json();

    const { name, type, difficulty, hint, wordId, settings } = body;

    if (!name || typeof name !== "string") {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    if (!["WORDLE", "WORD_SEARCH"].includes(type)) {
      return Response.json({ error: "Invalid activity type" }, { status: 400 });
    }

    if (!["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      return Response.json({ error: "Invalid difficulty" }, { status: 400 });
    }

    if (hint !== undefined && typeof hint !== "boolean") {
      return Response.json(
        { error: "Hint must be a boolean" },
        { status: 400 },
      );
    }

    if (settings !== undefined && typeof settings !== "string") {
      return Response.json(
        { error: "Settings must be a string" },
        { status: 400 },
      );
    }

    const wordList = await prisma.wordList.findUnique({
      where: {
        id: wordListId,
      },
      include: {
        words: {
          include: {
            phonemes: true,
          },
        },
      },
    });

    if (!wordList) {
      return Response.json({ error: "Word list not found" }, { status: 404 });
    }

    let targetWordId: number | undefined;

    if (type === "WORDLE" && (wordId === undefined || wordId === null)) {
      return Response.json(
        { error: "Wordle activities require a target word" },
        { status: 400 },
      );
    }

    if (wordId !== undefined && wordId !== null) {
      targetWordId = Number(wordId);

      if (!Number.isInteger(targetWordId)) {
        return Response.json({ error: "Invalid word ID" }, { status: 400 });
      }

      const word = await prisma.word.findFirst({
        where: {
          id: targetWordId,
          wordListId,
        },
      });

      if (!word) {
        return Response.json(
          { error: "Word not found in this word list" },
          { status: 404 },
        );
      }
    }

    if (type === "WORD_SEARCH") {
      const gridSize =
        difficulty === "EASY" ? 7 : difficulty === "MEDIUM" ? 8 : 9;

      const usableWords = wordList.words.filter(
        (word) => word.phonemes.length <= gridSize,
      );

      if (usableWords.length === 0) {
        return NextResponse.json(
          {
            error: `No words in this word list can fit in a ${gridSize}×${gridSize} grid.`,
          },
          { status: 400 },
        );
      }
    }

    const activity = await prisma.activity.create({
      data: {
        name: name.trim(),
        type,
        difficulty,
        hint: hint ?? true,
        wordListId,
        wordId: targetWordId,
        settings: settings ?? null,
      },
    });

    return Response.json(activity, { status: 201 });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to create activity" },
      { status: 500 },
    );
  }
}
