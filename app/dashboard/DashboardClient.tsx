"use client";

import { useCallback, useEffect, useState } from "react";

type AnalyticsData = {
  metrics: {
    totalWordLists: number;
    totalWords: number;
    totalActivities: number;
    totalGenerations: number;
    successfulGenerations: number;
    failedGenerations: number;
    successRate: number | null;
    wordleGenerations: number;
    wordSearchGenerations: number;
    mostUsedType: string | null;
    averageTimeOnPageMs: number | null;
    measuredPageVisits: number;
    averageGenerationTimeMs: number | null;
    measuredGenerations: number;
  };
  recentGenerations: {
    id: number;
    type: string;
    success: boolean;
    errorMessage: string | null;
    durationMs: number | null;
    source: string;
    createdAt: string;
  }[];
  emptyWordLists: {
    id: number;
    name: string;
  }[];
  warnings: {
    type: string;
    message: string;
  }[];
  generatedAt: string;
};

function formatDuration(durationMs: number | null) {
  if (durationMs === null) return "No data yet";

  if (durationMs < 1000) return `${Math.round(durationMs)} ms`;

  return `${(durationMs / 1000).toFixed(1)} sec`;
}

function formatDate(date: string) {
  return new Date(date).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/analytics", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Analytics API returned HTTP ${response.status}`);
      }

      const result: AnalyticsData = await response.json();

      setData(result);
      setError(null);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to load dashboard analytics:", err);

      setError(
        "Unable to load analytics. Check the application and database connection.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();

    const interval = window.setInterval(() => {
      void loadAnalytics();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loadAnalytics]);

  const metrics = data?.metrics;

  const cards = metrics
    ? [
        {
          label: "Word lists",
          value: metrics.totalWordLists,
          description: "Created word lists",
          symbol: "▤",
        },
        {
          label: "Words",
          value: metrics.totalWords,
          description: "Available vocabulary",
          symbol: "Aa",
        },
        {
          label: "Saved activities",
          value: metrics.totalActivities,
          description: "Configured activities",
          symbol: "▦",
        },
        {
          label: "Generation attempts",
          value: metrics.totalGenerations,
          description: "Live creation attempts",
          symbol: "↗",
        },
      ]
    : [];

  return (
    <div className="bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
              PhonoPlay analytics
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Monitor activity generation, application usage, and system
              warnings.
            </p>
          </div>

          <button
            onClick={() => void loadAnalytics()}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </header>

        {error && (
          <section
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"
          >
            <h2 className="font-semibold">Analytics unavailable</h2>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={() => void loadAnalytics()}
              className="mt-3 text-sm font-semibold underline"
            >
              Try again
            </button>
          </section>
        )}

        {loading && !data ? (
          <div
            className="min-h-[700px] rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm"
            role="status"
          >
            Loading analytics...
          </div>
        ) : data ? (
          <>
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Overview</h2>
                <span className="text-xs text-slate-500">
                  Updates every 30 seconds
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                  <article
                    key={card.label}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500">
                        {card.label}
                      </p>

                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-semibold text-indigo-700"
                      >
                        {card.symbol}
                      </span>
                    </div>

                    <p className="mt-5 text-3xl font-bold tracking-tight">
                      {card.value.toLocaleString()}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      {card.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold">
                Generation performance
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-500">Success rate</p>
                  <p className="mt-3 text-3xl font-bold">
                    {metrics?.successRate === null
                      ? "—"
                      : `${metrics?.successRate}%`}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {metrics?.totalGenerations === 0
                      ? "No attempts recorded yet"
                      : "Successful attempts as a percentage of total"}
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Successful generations
                  </p>
                  <p className="mt-3 text-3xl font-bold text-emerald-600">
                    {metrics?.successfulGenerations}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Completed successfully
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-500">Failed generations</p>
                  <p className="mt-3 text-3xl font-bold text-red-600">
                    {metrics?.failedGenerations}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Attempts that returned errors
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Average generation time
                  </p>
                  <p className="mt-3 text-3xl font-bold">
                    {formatDuration(metrics?.averageGenerationTimeMs ?? null)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Based on {metrics?.measuredGenerations ?? 0} recorded
                    attempts
                  </p>
                </article>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Activity breakdown</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Recorded live generation attempts by type
                </p>

                {[
                  {
                    label: "Wordle",
                    count: metrics?.wordleGenerations ?? 0,
                    total: metrics?.totalGenerations ?? 0,
                    color: "bg-indigo-500",
                  },
                  {
                    label: "Word Search",
                    count: metrics?.wordSearchGenerations ?? 0,
                    total: metrics?.totalGenerations ?? 0,
                    color: "bg-violet-500",
                  },
                ].map((item) => {
                  const percentage =
                    item.total > 0 ? (item.count / item.total) * 100 : 0;

                  return (
                    <div key={item.label} className="mt-6">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-slate-500">
                          {item.count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>

                      <div
                        className="h-3 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-label={`${item.label} generation attempts`}
                        aria-valuemin={0}
                        aria-valuemax={item.total || 1}
                        aria-valuenow={item.count}
                      >
                        <div
                          className={`h-full rounded-full transition-all ${item.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Most-used type</p>
                  <p className="mt-1 font-semibold">
                    {metrics?.mostUsedType === "WORDLE"
                      ? "Wordle"
                      : metrics?.mostUsedType === "WORD_SEARCH"
                        ? "Word Search"
                        : "No clear leader yet"}
                  </p>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Usage metrics</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Page engagement recorded by the application
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">
                      Average time on page
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {formatDuration(metrics?.averageTimeOnPageMs ?? null)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">
                      Measured page visits
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {metrics?.measuredPageVisits.toLocaleString()}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Most-used type is based on generation attempts, not completed
                  gameplay sessions.
                </p>
              </article>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <h2 className="text-lg font-semibold">Recent generations</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest recorded activity creation attempts
                  </p>
                </div>

                {data.recentGenerations.length === 0 ? (
                  <p className="p-6 text-sm text-slate-500">
                    No generation events have been recorded yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th scope="col" className="px-6 py-3 font-medium">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 font-medium">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 font-medium">
                            Duration
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {data.recentGenerations.map((event) => (
                          <tr key={event.id}>
                            <td className="px-6 py-4 font-medium">
                              {event.type === "WORD_SEARCH"
                                ? "Word Search"
                                : "Wordle"}
                              <p className="mt-1 text-xs font-normal text-slate-500">
                                {formatDate(event.createdAt)}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  event.success
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {event.success ? "Success" : "Failed"}
                              </span>

                              {event.errorMessage && (
                                <p className="mt-1 max-w-48 text-xs text-red-600">
                                  {event.errorMessage}
                                </p>
                              )}
                            </td>

                            <td className="px-6 py-4 text-slate-600">
                              {formatDuration(event.durationMs)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">System alerts</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Issues requiring attention
                </p>

                <div className="mt-5 space-y-3">
                  {data.warnings.length === 0 ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="font-semibold text-emerald-800">
                        No active warnings
                      </p>
                      <p className="mt-1 text-sm text-emerald-700">
                        No generation failures or empty word lists were detected
                        by the current checks.
                      </p>
                    </div>
                  ) : (
                    data.warnings.map((warning, index) => (
                      <div
                        key={`${warning.type}-${index}`}
                        role="alert"
                        className="rounded-xl border border-amber-200 bg-amber-50 p-4"
                      >
                        <p className="font-semibold text-amber-900">
                          {warning.type.replaceAll("_", " ")}
                        </p>
                        <p className="mt-1 text-sm text-amber-800">
                          {warning.message}
                        </p>
                      </div>
                    ))
                  )}

                  {data.emptyWordLists.map((list) => (
                    <div
                      key={list.id}
                      className="rounded-xl border border-amber-200 bg-amber-50 p-4"
                    >
                      <p className="font-semibold text-amber-900">
                        Empty word list: {list.name}
                      </p>
                      <p className="mt-1 text-sm text-amber-800">
                        Add words before using this list to create activities.
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <p>Last updated: {lastUpdated ?? "Not yet updated"}</p>
                  <p className="mt-1">
                    Server response: {formatDate(data.generatedAt)}
                  </p>
                </div>
              </article>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
