import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
    wordId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id, wordId } = await params;

    const wordListId = Number(id);
    const wordIdNumber = Number(wordId);

    if (!Number.isInteger(wordListId) || !Number.isInteger(wordIdNumber)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const word = await prisma.word.findFirst({
      where: {
        id: wordIdNumber,
        wordListId,
      },
      include: {
        phonemes: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!word) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json(word);
  } catch (error) {
    console.error("Failed to fetch word:", error);

    return NextResponse.json(
      { error: "Failed to fetch word" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id, wordId } = await params;

    const wordListId = Number(id);
    const wordIdNumber = Number(wordId);

    if (!Number.isInteger(wordListId) || !Number.isInteger(wordIdNumber)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existingWord = await prisma.word.findFirst({
      where: {
        id: wordIdNumber,
        wordListId,
      },
    });

    if (!existingWord) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    const body = await request.json();
    const { english, phoneme, phonemes } = body;

    if (
      !english ||
      typeof english !== "string" ||
      !phoneme ||
      typeof phoneme !== "string"
    ) {
      return NextResponse.json(
        { error: "English word and phoneme are required" },
        { status: 400 },
      );
    }

    if (
      phonemes !== undefined &&
      (!Array.isArray(phonemes) ||
        phonemes.some((item: unknown) => typeof item !== "string"))
    ) {
      return NextResponse.json(
        { error: "Phonemes must be an array of strings" },
        { status: 400 },
      );
    }

    const wordleActivity = await prisma.activity.findFirst({
      where: {
        wordId: wordIdNumber,
        type: "WORDLE",
      },
    });

    if (wordleActivity) {
      return NextResponse.json(
        {
          error: `Cannot edit this word because it is being used as the target word for "${wordleActivity.name}".`,
        },
        { status: 409 },
      );
    }

    const updatedWord = await prisma.$transaction(async (tx) => {
      await tx.phoneme.deleteMany({
        where: {
          wordId: wordIdNumber,
        },
      });

      return tx.word.update({
        where: {
          id: wordIdNumber,
        },
        data: {
          english,
          phoneme,
          phonemes: {
            create: (phonemes ?? []).map((symbol: string, index: number) => ({
              symbol,
              position: index,
            })),
          },
        },
        include: {
          phonemes: {
            orderBy: {
              position: "asc",
            },
          },
        },
      });
    });

    return NextResponse.json(updatedWord);
  } catch (error) {
    console.error("Failed to update word:", error);

    return NextResponse.json(
      { error: "Failed to update word" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id, wordId } = await params;
    const wordListId = Number(id);
    const wordIdNumber = Number(wordId);

    if (!Number.isInteger(wordListId) || !Number.isInteger(wordIdNumber)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existingWord = await prisma.word.findFirst({
      where: {
        id: wordIdNumber,
        wordListId,
      },
    });

    if (!existingWord) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    const wordleActivity = await prisma.activity.findFirst({
      where: {
        wordId: wordIdNumber,
        type: "WORDLE",
      },
    });

    if (wordleActivity) {
      return NextResponse.json(
        {
          error: `Cannot delete this word because it is being used as the target word for "${wordleActivity.name}".`,
        },
        { status: 409 },
      );
    }

    await prisma.word.delete({
      where: {
        id: wordIdNumber,
      },
    });

    return NextResponse.json({
      message: "Word deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete word:", error);

    return NextResponse.json(
      { error: "Failed to delete word" },
      { status: 500 },
    );
  }
}
