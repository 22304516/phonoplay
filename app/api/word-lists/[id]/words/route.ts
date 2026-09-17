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

    const words = await prisma.word.findMany({
      where: { wordListId },
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
    });

    return NextResponse.json(words);
  } catch (error) {
    console.error("Failed to fetch words:", error);

    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
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
      where: { id: wordListId },
    });

    if (!wordList) {
      return NextResponse.json(
        { error: "Word list not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { english, phoneme, phonemes } = body;

    if (
      typeof english !== "string" ||
      english.trim() === "" ||
      typeof phoneme !== "string" ||
      phoneme.trim() === ""
    ) {
      return NextResponse.json(
        { error: "English word and phoneme are required" },
        { status: 400 },
      );
    }

    if (
      phonemes !== undefined &&
      (!Array.isArray(phonemes) ||
        phonemes.length === 0 ||
        phonemes.some(
          (item: unknown) => typeof item !== "string" || item.trim() === "",
        ))
    ) {
      return NextResponse.json(
        { error: "Phonemes must be a non-empty array of strings" },
        { status: 400 },
      );
    }

    const word = await prisma.word.create({
      data: {
        english: english.trim(),
        phoneme: phoneme.trim(),
        wordListId,
        phonemes: {
          create: (phonemes ?? []).map((symbol: string, index: number) => ({
            symbol: symbol.trim(),
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

    return NextResponse.json(word, { status: 201 });
  } catch (error) {
    console.error("Failed to create word:", error);

    return NextResponse.json(
      { error: "Failed to create word" },
      { status: 500 },
    );
  }
}