"use client";

import { useEffect, useState } from "react";

export default function PageV3() {
  const [count, setCount] = useState(0);
  const [squared, setSquared] = useState(0);

  function increment() {
    setCount((value) => value + 1);
  }

  const decrement = () => {
    setCount((value) => value - 1);
  };

  useEffect(() => {
    setSquared(count * count);
  }, [count]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Aufgabe 3</p>
              <h1 className="mt-2 text-3xl font-semibold">Counter + Quadrat</h1>
              <p className="mt-2 text-sm text-slate-300">
                useEffect berechnet das Quadrat live, sobald sich der Count ändert.
              </p>
            </div>
            <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-200">
              Reactive
            </span>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Count</p>
              <div className="text-5xl font-semibold tabular-nums">{count}</div>
            </div>
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Quadrat</p>
              <div className="text-5xl font-semibold tabular-nums">{squared}</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
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
    </main>
  );
}
