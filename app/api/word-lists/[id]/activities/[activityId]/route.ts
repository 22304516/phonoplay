import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
    activityId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id, activityId } = await params;

    const wordListId = Number(id);
    const activityIdNumber = Number(activityId);

    if (!Number.isInteger(wordListId) || !Number.isInteger(activityIdNumber)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const activity = await prisma.activity.findFirst({
      where: {
        id: activityIdNumber,
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
        wordList: {
          include: {
            words: {
              include: {
                phonemes: {
                  orderBy: {
                    position: "asc",
                  },
                },
              },
              orderBy: {
                english: "asc",
              },
            },
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Failed to fetch activity:", error);

    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id, activityId } = await params;

    const wordListId = Number(id);
    const activityIdNumber = Number(activityId);

    if (!Number.isInteger(wordListId) || !Number.isInteger(activityIdNumber)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: activityIdNumber,
        wordListId,
      },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { name, type, difficulty, hint, settings, wordId } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Activity name is required" },
        { status: 400 },
      );
    }

    if (!["WORDLE", "WORD_SEARCH"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid activity type" },
        { status: 400 },
      );
    }

    if (!["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty" },
        { status: 400 },
      );
    }

    if (hint !== undefined && typeof hint !== "boolean") {
      return NextResponse.json(
        { error: "Hint must be a boolean" },
        { status: 400 },
      );
    }

    if (settings !== undefined && typeof settings !== "string") {
      return NextResponse.json(
        { error: "Settings must be a string" },
        { status: 400 },
      );
    }

    if (wordId !== undefined && wordId !== null) {
      if (!Number.isInteger(wordId)) {
        return NextResponse.json({ error: "Invalid word ID" }, { status: 400 });
      }

      const word = await prisma.word.findFirst({
        where: {
          id: wordId,
          wordListId,
        },
      });

      if (!word) {
        return NextResponse.json(
          { error: "Word does not belong to this word list" },
          { status: 400 },
        );
      }
    }

    const updatedActivity = await prisma.activity.update({
      where: {
        id: activityIdNumber,
      },
      data: {
        name,
        type,
        difficulty,
        hint: hint ?? true,
        settings: settings ?? null,
        wordId: type === "WORDLE" ? (wordId ?? null) : null,
      },
    });

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error("Failed to update activity:", error);

    return NextResponse.json(
      { error: "Failed to update activity" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id, activityId } = await params;

    const wordListId = Number(id);
    const activityIdNumber = Number(activityId);

    if (!Number.isInteger(wordListId) || !Number.isInteger(activityIdNumber)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: activityIdNumber,
        wordListId,
      },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 },
      );
    }

    await prisma.activity.delete({
      where: {
        id: activityIdNumber,
      },
    });

    return NextResponse.json({
      message: "Activity deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete activity:", error);

    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 },
    );
  }
}
