import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const wordLists = await prisma.wordList.findMany({
      include: {
        words: true,
        activities: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(wordLists);
  } catch (error) {
    console.error("Failed to fetch word lists:", error);

    return NextResponse.json(
      { error: "Failed to fetch word lists" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const wordList = await prisma.wordList.create({
      data: {
        name: name.trim(),
        description:
          typeof description === "string" && description.trim() !== ""
            ? description.trim()
            : null,
      },
    });

    return NextResponse.json(wordList, { status: 201 });
  } catch (error) {
    console.error("Failed to create word list:", error);

    return NextResponse.json(
      { error: "Failed to create word list" },
      { status: 500 },
    );
  }
}