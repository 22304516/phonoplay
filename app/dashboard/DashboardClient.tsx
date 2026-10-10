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
  if (durationMs === null) return "—";
  if (durationMs < 1000) return `${Math.round(durationMs)} ms`;
  return `${(durationMs / 1000).toFixed(1)} sec`;
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Unknown date";

  return parsed.toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md ${className}`}
    >
      {children}
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      {eyebrow && (
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
          {eyebrow}
        </p>
      )}
      <h2 className="text-lg font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: string;
  accent: "indigo" | "blue" | "violet" | "emerald" | "red" | "amber";
}) {
  const accents = {
    indigo: {
      icon: "bg-indigo-50 text-indigo-700",
      line: "bg-indigo-500",
    },
    blue: {
      icon: "bg-blue-50 text-blue-700",
      line: "bg-blue-500",
    },
    violet: {
      icon: "bg-violet-50 text-violet-700",
      line: "bg-violet-500",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-700",
      line: "bg-emerald-500",
    },
    red: {
      icon: "bg-red-50 text-red-700",
      line: "bg-red-500",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      line: "bg-amber-500",
    },
  };

  return (
    <Panel className="relative overflow-hidden p-5 sm:p-6">
      <div className={`absolute inset-x-0 top-0 h-1 ${accents[accent].line}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 break-words text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <span
          aria-hidden="true"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${accents[accent].icon}`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 text-sm leading-5 text-slate-500">{description}</p>
    </Panel>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
          icon: "≡",
          accent: "indigo" as const,
        },
        {
          label: "Words",
          value: metrics.totalWords,
          description: "Available vocabulary",
          icon: "Aa",
          accent: "blue" as const,
        },
        {
          label: "Saved activities",
          value: metrics.totalActivities,
          description: "Configured activities",
          icon: "▦",
          accent: "violet" as const,
        },
        {
          label: "Generation attempts",
          value: metrics.totalGenerations,
          description: "Recorded creation attempts",
          icon: "↗",
          accent: "emerald" as const,
        },
      ]
    : [];

  const successRate = metrics?.successRate ?? null;

  const activityTypes = [
    {
      label: "Wordle",
      count: metrics?.wordleGenerations ?? 0,
      color: "bg-indigo-500",
      dot: "bg-indigo-500",
    },
    {
      label: "Word Search",
      count: metrics?.wordSearchGenerations ?? 0,
      color: "bg-violet-500",
      dot: "bg-violet-500",
    },
  ];

  return (
    <div className="dashboard-page min-h-[calc(100vh-1px)] bg-slate-50/80 px-4 py-6 text-slate-900 sm:px-6 sm:py-9 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page header */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 p-6 text-white shadow-lg shadow-indigo-950/10 sm:p-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border-[40px] border-white/[0.05]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl"
          />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-indigo-100">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                PHONOPLAY ANALYTICS
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Dashboard
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100/80 sm:text-base">
                Your overview of activity creation, application usage, and
                system health.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-indigo-100/80">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Auto-refresh enabled
                </span>

                <span className="rounded-full bg-white/10 px-3 py-2">
                  Every 30 seconds
                </span>
              </div>
            </div>

            <button
              onClick={() => void loadAnalytics()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-5 py-3 text-sm font-semibold text-indigo-950 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <svg
                aria-hidden="true"
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M20 7v5h-5M4 17v-5h5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.6 9A7 7 0 0 1 17.3 5L20 12M4 12l2.7 7a7 7 0 0 0 11.7-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {loading ? "Refreshing..." : "Refresh data"}
            </button>
          </div>
        </header>

        {/* API error */}
        {error && (
          <section
            role="alert"
            className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 font-bold text-red-700">
                !
              </span>
              <div>
                <h2 className="font-semibold text-red-900">
                  Analytics unavailable
                </h2>
                <p className="mt-1 text-sm leading-5 text-red-800">{error}</p>
              </div>
            </div>

            <button
              onClick={() => void loadAnalytics()}
              disabled={loading}
              className="shrink-0 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
            >
              Try again
            </button>
          </section>
        )}

        {/* Loading state */}
        {loading && !data ? (
          <div
            className="min-h-[700px] rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12"
            role="status"
            aria-live="polite"
          >
            <div className="flex min-h-[580px] flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <svg
                  aria-hidden="true"
                  className="h-7 w-7 animate-spin text-indigo-600"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4z"
                  />
                </svg>
              </div>
              <p className="mt-5 font-semibold text-slate-900">
                Loading your dashboard
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Fetching the latest analytics...
              </p>
            </div>
          </div>
        ) : data ? (
          <>
            {/* Overview */}
            <section>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <SectionHeading
                  eyebrow="At a glance"
                  title="Overview"
                  description="A snapshot of your PhonoPlay content and activity."
                />

                {lastUpdated && (
                  <p className="text-xs text-slate-500">
                    Last refreshed at{" "}
                    <span className="font-semibold text-slate-700">
                      {lastUpdated}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                  <MetricCard
                    key={card.label}
                    label={card.label}
                    value={card.value.toLocaleString()}
                    description={card.description}
                    icon={card.icon}
                    accent={card.accent}
                  />
                ))}
              </div>
            </section>

            {/* Performance */}
            <section>
              <div className="mb-4">
                <SectionHeading
                  eyebrow="Reliability"
                  title="Generation performance"
                  description="See how reliably and quickly activities are being created."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Success rate"
                  value={successRate === null ? "—" : `${successRate}%`}
                  description={
                    metrics?.totalGenerations === 0
                      ? "No attempts recorded yet"
                      : "Successful attempts out of all attempts"
                  }
                  icon="✓"
                  accent="indigo"
                />

                <MetricCard
                  label="Successful"
                  value={metrics!.successfulGenerations.toLocaleString()}
                  description="Completed without errors"
                  icon="✓"
                  accent="emerald"
                />

                <MetricCard
                  label="Failed"
                  value={metrics!.failedGenerations.toLocaleString()}
                  description="Attempts that returned errors"
                  icon="!"
                  accent="red"
                />

                <MetricCard
                  label="Average generation time"
                  value={formatDuration(metrics!.averageGenerationTimeMs)}
                  description={`${metrics!.measuredGenerations.toLocaleString()} measured attempts`}
                  icon="◷"
                  accent="blue"
                />
              </div>

              {metrics!.totalGenerations > 0 && successRate !== null && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      Overall generation success
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {successRate}%
                    </p>
                  </div>

                  <div
                    className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label="Overall generation success rate"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.min(100, Math.max(0, successRate))}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        successRate >= 90
                          ? "bg-emerald-500"
                          : successRate >= 70
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, successRate))}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    {metrics!.successfulGenerations.toLocaleString()} successful
                    out of {metrics!.totalGenerations.toLocaleString()} total
                    attempts
                  </p>
                </div>
              )}
            </section>

            {/* Breakdown and usage */}
            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Panel className="p-5 sm:p-6">
                <SectionHeading
                  eyebrow="Activity"
                  title="Generation breakdown"
                  description="Compare creation attempts across activity types."
                />

                <div className="mt-7 space-y-7">
                  {activityTypes.map((item) => {
                    const total = metrics!.totalGenerations;
                    const percentage =
                      total > 0 ? (item.count / total) * 100 : 0;

                    return (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`h-3 w-3 rounded-full ${item.dot}`}
                            />
                            <span className="text-sm font-semibold text-slate-800">
                              {item.label}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-900">
                              {item.count.toLocaleString()}
                            </span>
                            <span className="ml-2 text-xs text-slate-500">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        <div
                          className="h-3 overflow-hidden rounded-full bg-slate-100"
                          role="progressbar"
                          aria-label={`${item.label} generation attempts`}
                          aria-valuemin={0}
                          aria-valuemax={total || 1}
                          aria-valuenow={item.count}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-7 flex items-center justify-between gap-4 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                      Most-used activity
                    </p>
                    <p className="mt-1 font-bold text-indigo-950">
                      {metrics!.mostUsedType === "WORDLE"
                        ? "Wordle"
                        : metrics!.mostUsedType === "WORD_SEARCH"
                          ? "Word Search"
                          : "No clear leader yet"}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-indigo-700 shadow-sm"
                  >
                    ↗
                  </span>
                </div>
              </Panel>

              <Panel className="p-5 sm:p-6">
                <SectionHeading
                  eyebrow="Engagement"
                  title="Usage metrics"
                  description="Understand how people interact with the application."
                />

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-700">
                      ◷
                    </span>
                    <p className="mt-4 text-sm font-medium text-slate-500">
                      Average time on page
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                      {formatDuration(metrics!.averageTimeOnPageMs)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-lg font-bold text-violet-700">
                      #
                    </span>
                    <p className="mt-4 text-sm font-medium text-slate-500">
                      Measured page visits
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                      {metrics!.measuredPageVisits.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 p-4">
                  <p className="text-sm leading-6 text-slate-600">
                    <span className="font-semibold text-slate-800">
                      About these metrics:{" "}
                    </span>
                    Page visits and time on page reflect recorded usage events.
                    The most-used activity is calculated from generation
                    attempts, not completed gameplay sessions.
                  </p>
                </div>
              </Panel>
            </section>

            {/* Recent generations and alerts */}
            <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
              <Panel className="overflow-hidden">
                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <SectionHeading
                      eyebrow="Latest activity"
                      title="Recent generations"
                      description="The latest recorded activity creation attempts."
                    />

                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      {data.recentGenerations.length} shown
                    </span>
                  </div>
                </div>

                {data.recentGenerations.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-500">
                      ↗
                    </span>
                    <p className="mt-3 font-semibold text-slate-800">
                      No activity yet
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Generation attempts will appear here when recorded.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th scope="col" className="px-5 py-3 font-semibold">
                            Activity
                          </th>
                          <th scope="col" className="px-5 py-3 font-semibold">
                            Status
                          </th>
                          <th scope="col" className="px-5 py-3 font-semibold">
                            Time
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {data.recentGenerations.map((event) => (
                          <tr
                            key={event.id}
                            className="transition-colors hover:bg-slate-50/80"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-start gap-3">
                                <span
                                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                    event.type === "WORD_SEARCH"
                                      ? "bg-violet-50 text-violet-700"
                                      : "bg-indigo-50 text-indigo-700"
                                  }`}
                                >
                                  {event.type === "WORD_SEARCH" ? "WS" : "W"}
                                </span>

                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900">
                                    {event.type === "WORD_SEARCH"
                                      ? "Word Search"
                                      : event.type === "WORDLE"
                                        ? "Wordle"
                                        : event.type}
                                  </p>
                                  <p className="mt-1 whitespace-nowrap text-xs text-slate-500">
                                    {formatDate(event.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  event.success
                                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10"
                                    : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    event.success
                                      ? "bg-emerald-500"
                                      : "bg-red-500"
                                  }`}
                                />
                                {event.success ? "Success" : "Failed"}
                              </span>

                              {event.errorMessage && (
                                <p
                                  title={event.errorMessage}
                                  className="mt-2 max-w-48 truncate text-xs text-red-600"
                                >
                                  {event.errorMessage}
                                </p>
                              )}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                              {formatDuration(event.durationMs)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>

              <Panel className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <SectionHeading
                    eyebrow="System health"
                    title="System alerts"
                    description="Warnings and issues that may need attention."
                  />

                  <span
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                      data.warnings.length + data.emptyWordLists.length === 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {data.warnings.length + data.emptyWordLists.length === 0
                      ? "All clear"
                      : `${
                          data.warnings.length + data.emptyWordLists.length
                        } alerts`}
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  {data.warnings.length === 0 &&
                  data.emptyWordLists.length === 0 ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-700">
                          ✓
                        </span>
                        <div>
                          <p className="font-semibold text-emerald-900">
                            No active warnings
                          </p>
                          <p className="mt-1 text-sm leading-5 text-emerald-800">
                            The current checks have not detected any issues
                            requiring attention.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {data.warnings.map((warning, index) => (
                        <div
                          key={`${warning.type}-${index}`}
                          role="alert"
                          className="rounded-xl border border-amber-200 bg-amber-50/70 p-4"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 font-bold text-amber-800">
                              !
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold capitalize text-amber-950">
                                {warning.type.replaceAll("_", " ")}
                              </p>
                              <p className="mt-1 text-sm leading-5 text-amber-900">
                                {warning.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {data.emptyWordLists.map((list) => (
                        <div
                          key={list.id}
                          className="rounded-xl border border-amber-200 bg-amber-50/70 p-4"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 font-bold text-amber-800">
                              !
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-amber-950">
                                Empty word list
                              </p>
                              <p className="mt-1 text-sm font-medium text-amber-900">
                                {list.name}
                              </p>
                              <p className="mt-1 text-sm leading-5 text-amber-800">
                                Add words before using this list to create
                                activities.
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                  <div className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-slate-500">Last refreshed</span>
                    <span className="text-right font-medium text-slate-800">
                      {lastUpdated ?? "Not yet updated"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-slate-500">Server response</span>
                    <span className="text-right font-medium text-slate-800">
                      {formatDate(data.generatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-500">Refresh interval</span>
                    <span className="font-medium text-slate-800">
                      30 seconds
                    </span>
                  </div>
                </div>
              </Panel>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
