import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const wordListId = Number(id);

    if (!Number.isInteger(wordListId)) {
      return NextResponse.json(
        { error: "Invalid word list ID" },
        { status: 400 }
      );
    }

    const activities = await prisma.activity.findMany({
      where: {
        wordListId,
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
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const wordListId = Number(id);

    if (!Number.isInteger(wordListId)) {
      return NextResponse.json(
        { error: "Invalid word list ID" },
        { status: 400 }
      );
    }

    const wordList = await prisma.wordList.findUnique({
      where: {
        id: wordListId,
      },
    });

    if (!wordList) {
      return NextResponse.json(
        { error: "Word list not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, type, difficulty, hint, settings } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Activity name is required" },
        { status: 400 }
      );
    }

    if (!["WORDLE", "WORD_SEARCH"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid activity type" },
        { status: 400 }
      );
    }

    if (!["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty" },
        { status: 400 }
      );
    }

    if (hint !== undefined && typeof hint !== "boolean") {
      return NextResponse.json(
        { error: "Hint must be a boolean" },
        { status: 400 }
      );
    }

    if (settings !== undefined && typeof settings !== "string") {
      return NextResponse.json(
        { error: "Settings must be a string" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        name,
        type,
        difficulty,
        hint: hint ?? true,
        settings: settings ?? null,
        wordListId,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity:", error);

    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}