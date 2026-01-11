"use client";

import { ChangeEvent, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../../config/firebase";

export default function PageV5() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const register = async () => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrierung fehlgeschlagen");
    }
  };

  const login = async () => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fehlgeschlagen");
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout fehlgeschlagen");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-50">
        <p className="text-lg text-slate-200">Lade Anmeldestatus …</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-50">
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Aufgabe 5</p>
                <h1 className="mt-2 text-3xl font-semibold">Firebase Auth (E-Mail)</h1>
                <p className="mt-2 text-sm text-slate-300">
                  Registrierung, Login, Logout mit Firebase Authentication.
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                Secure
              </span>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-2 text-sm text-slate-200">
                  E-Mail
                  <input
                    value={email}
                    onChange={handleEmailChange}
                    type="email"
                    placeholder="you@example.com"
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-base text-slate-50 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-200">
                  Passwort
                  <input
                    value={password}
                    onChange={handlePasswordChange}
                    type="password"
                    placeholder="••••••••"
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-base text-slate-50 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
                  />
                </label>
                {error ? (
                  <p className="text-sm text-red-400" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-3">
                  <button
                    onClick={register}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-[1px] hover:shadow-xl hover:shadow-emerald-500/40"
                  >
                    Register
                  </button>
                  <button
                    onClick={login}
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-[1px] hover:shadow-xl hover:shadow-blue-500/40"
                  >
                    Login
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p className="mb-2 font-semibold text-slate-50">Hinweise</p>
                <ul className="space-y-1 text-slate-300">
                  <li>• onAuthStateChanged hält den User-State synchron.</li>
                  <li>• Fehler werden im UI angezeigt.</li>
                  <li>• Nach Login/Registrierung wird das Passwortfeld geleert.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Logged In</p>
              <h1 className="mt-2 text-3xl font-semibold">
                Willkommen, {user.email ?? "Unbekannt"}!
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Authentifizierter Bereich. Passe die Inhalte nach Bedarf an.
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:-translate-y-[1px] hover:shadow-xl hover:shadow-rose-500/40"
            >
              Logout
            </button>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <p className="font-semibold text-slate-50">Hauptseite</p>
            <p className="mt-2 text-slate-300">
              Hier könntest du protected Content rendern, z. B. Daten aus Realtime DB oder
              Firestore. Baue die Ansicht modular weiter aus.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
