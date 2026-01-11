"use client";

import { ChangeEvent, useState } from "react";

export default function PageV4() {
  const [user, setUser] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const login = () => {
    setUser(email);
  };

  const register = () => {
    setUser(email);
  };

  const logout = () => {
    setUser(null);
    setEmail("");
    setPassword("");
  };

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
      <h1 className="text-3xl font-semibold">Willkommen, {user}!</h1>
      <p className="text-lg text-gray-700">Dies ist die Hauptseite.</p>
      <button
        onClick={logout}
        className="rounded bg-red-600 px-5 py-3 text-lg font-medium text-white hover:bg-red-700"
      >
        Logout
      </button>
    </main>
  );
}
