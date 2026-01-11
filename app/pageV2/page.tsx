"use client";

import { useState } from "react";

export default function PageV2() {
  const [count, setCount] = useState(0);

  function increment() {
    setCount((value) => value + 1);
  }

  const decrement = () => {
    setCount((value) => value - 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Aufgabe 2</p>
              <h1 className="mt-2 text-3xl font-semibold">Counter</h1>
              <p className="mt-2 text-sm text-slate-300">
                Increment/Decrement mit React state. Schnell, minimal, klar.
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
              Live
            </span>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="text-5xl font-semibold tabular-nums">{count}</div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={increment}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-[1px] hover:shadow-xl hover:shadow-blue-500/40"
              >
                Increment
              </button>
              <button
                onClick={decrement}
                className="rounded-xl border border-white/15 px-6 py-3 text-base font-semibold text-slate-100 transition hover:bg-white/10 hover:-translate-y-[1px]"
              >
                Decrement
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
