import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      totalWordLists,
      totalWords,
      totalActivities,
      generationTotals,
      wordleGenerations,
      wordSearchGenerations,
      usageSummary,
      recentGenerations,
      emptyWordLists,
      recentFailures,
    ] = await Promise.all([
      prisma.wordList.count(),
      prisma.word.count(),
      prisma.activity.count(),

      prisma.generationEvent.groupBy({
        by: ["success"],
        _count: { _all: true },
      }),

      prisma.generationEvent.count({
        where: { type: "WORDLE", source: "LIVE" },
      }),

      prisma.generationEvent.count({
        where: { type: "WORD_SEARCH", source: "LIVE" },
      }),

      prisma.usageEvent.aggregate({
        where: {
          source: "LIVE",
          durationMs: { not: null, gte: 0 },
        },
        _avg: { durationMs: true },
        _count: { _all: true },
      }),

      prisma.generationEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          type: true,
          success: true,
          errorMessage: true,
          durationMs: true,
          source: true,
          createdAt: true,
        },
      }),

      prisma.wordList.findMany({
        where: { words: { none: {} } },
        select: {
          id: true,
          name: true,
        },
      }),

      prisma.generationEvent.count({
        where: {
          source: "LIVE",
          success: false,
        },
      }),
    ]);

    const liveGenerationCounts = await prisma.generationEvent.groupBy({
      by: ["success"],
      where: { source: "LIVE" },
      _count: { _all: true },
    });

    const successfulGenerations =
      liveGenerationCounts.find((item) => item.success)?._count._all ?? 0;

    const failedGenerations =
      liveGenerationCounts.find((item) => !item.success)?._count._all ?? 0;

    const totalGenerations = successfulGenerations + failedGenerations;

    const successRate =
      totalGenerations === 0
        ? null
        : Number(((successfulGenerations / totalGenerations) * 100).toFixed(1));

    const mostUsedType =
      wordleGenerations === wordSearchGenerations
        ? null
        : wordleGenerations > wordSearchGenerations
          ? "WORDLE"
          : "WORD_SEARCH";

    const warnings: {
      type: string;
      message: string;
    }[] = [];

    if (totalWordLists === 0) {
      warnings.push({
        type: "EMPTY_WORD_LISTS",
        message: "No word lists have been created yet.",
      });
    }

    if (emptyWordLists.length > 0) {
      warnings.push({
        type: "EMPTY_WORD_LISTS",
        message: `${emptyWordLists.length} word list(s) contain no words.`,
      });
    }

    if (failedGenerations > 0) {
      warnings.push({
        type: "GENERATION_FAILURES",
        message: `${failedGenerations} live activity generation attempt(s) failed.`,
      });
    }

    return NextResponse.json({
      metrics: {
        totalWordLists,
        totalWords,
        totalActivities,
        totalGenerations,
        successfulGenerations,
        failedGenerations,
        successRate,
        wordleGenerations,
        wordSearchGenerations,
        mostUsedType,
        averageTimeOnPageMs: usageSummary._avg.durationMs,
        measuredPageVisits: usageSummary._count._all,
      },
      recentGenerations,
      emptyWordLists,
      warnings,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analytics API error:", error);

    return NextResponse.json(
      {
        error: "Unable to load analytics data.",
      },
      { status: 500 },
    );
  }
}
