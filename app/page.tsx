export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-24 text-center">
        <span className="rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
          Willkommen
        </span>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
          Hello World
        </h1>
        <p className="max-w-2xl text-base text-slate-300 md:text-lg">
          Eine schlanke Next.js Sandbox. Nutze die Navigation oben, um durch die Übungen
          zu springen.
        </p>
      </div>
    </main>
  );
}
