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

    const wordList = await prisma.wordList.findUnique({
      where: {
        id: wordListId,
      },
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

        activities: {
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
            createdAt: "asc",
          },
        },
      },
    });

    if (!wordList) {
      return NextResponse.json(
        { error: "Word list not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(wordList);
  } catch (error) {
    console.error("Failed to fetch word list:", error);

    return NextResponse.json(
      { error: "Failed to fetch word list" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const wordListId = Number(id);

    if (!Number.isInteger(wordListId)) {
      return NextResponse.json(
        { error: "Invalid word list ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const wordList = await prisma.wordList.update({
      where: {
        id: wordListId,
      },
      data: {
        name,
        description: typeof description === "string" ? description : null,
      },
    });

    return NextResponse.json(wordList);
  } catch (error) {
    console.error("Failed to update word list:", error);

    return NextResponse.json(
      { error: "Failed to update word list" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const wordListId = Number(id);

    if (!Number.isInteger(wordListId)) {
      return NextResponse.json(
        { error: "Invalid word list ID" },
        { status: 400 },
      );
    }

    const existingWordList = await prisma.wordList.findUnique({
      where: {
        id: wordListId,
      },
    });

    if (!existingWordList) {
      return NextResponse.json(
        { error: "Word list not found" },
        { status: 404 },
      );
    }

    const activity = await prisma.activity.findFirst({
      where: {
        wordListId,
      },
    });

    if (activity) {
      return NextResponse.json(
        {
          error: `Cannot delete this word list because it contains activity "${activity.name}".`,
        },
        { status: 409 },
      );
    }

    await prisma.wordList.delete({
      where: {
        id: wordListId,
      },
    });

    return NextResponse.json({
      message: "Word list deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete word list:", error);

    return NextResponse.json(
      { error: "Failed to delete word list" },
      { status: 500 },
    );
  }
}
