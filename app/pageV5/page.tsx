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
      <main className="flex min-h-screen items-center justify-center bg-white text-black">
        <p className="text-lg text-gray-700">Lade Anmeldestatus …</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white text-black">
        <h1 className="text-3xl font-semibold">Login</h1>
        <div className="flex w-72 flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            E-Mail
            <input
              value={email}
              onChange={handleEmailChange}
              type="email"
              placeholder="you@example.com"
              className="rounded border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Passwort
            <input
              value={password}
              onChange={handlePasswordChange}
              type="password"
              placeholder="••••••••"
              className="rounded border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
            />
          </label>
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex gap-3">
            <button
              onClick={register}
              className="flex-1 rounded bg-green-600 px-4 py-3 text-base font-medium text-white hover:bg-green-700"
            >
              Register
            </button>
            <button
              onClick={login}
              className="flex-1 rounded bg-blue-600 px-4 py-3 text-base font-medium text-white hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white text-black">
      <h1 className="text-3xl font-semibold">
        Willkommen, {user.email ?? "Unbekannt"}!
      </h1>
      <p className="text-lg text-gray-700">Dies ist die Hauptseite.</p>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        onClick={logout}
        className="rounded bg-red-600 px-5 py-3 text-lg font-medium text-white hover:bg-red-700"
      >
        Logout
      </button>
    </main>
  );
}
