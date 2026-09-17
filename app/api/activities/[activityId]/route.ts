import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    activityId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { activityId } = await params;
    const activityIdNumber = Number(activityId);

    if (!Number.isInteger(activityIdNumber)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 },
      );
    }

    const activity = await prisma.activity.findUnique({
      where: {
        id: activityIdNumber,
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