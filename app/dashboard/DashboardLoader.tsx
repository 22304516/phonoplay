"use client";

import dynamic from "next/dynamic";

const DashboardClient = dynamic(() => import("./DashboardClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
        Loading analytics...
      </div>
    </div>
  ),
});

export default function DashboardLoader() {
  return <DashboardClient />;
}
