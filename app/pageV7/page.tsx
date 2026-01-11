"use client";

import { ChangeEvent, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  off,
  push,
  ref,
  set,
} from "firebase/database";
import { auth, db } from "../../config/firebase";

type MessagePayload = {
  text: string;
  owner: string;
  timestamp: number;
};

type Message = MessagePayload & { id: string };

export default function PageV7() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    const messagesRef = ref(db, "messages");

    const handleAdd = (snapshot: any) => {
      const payload = snapshot.val() as MessagePayload;
      if (!payload) return;
      setMessages((prev) => {
        const next = [...prev, { id: snapshot.key as string, ...payload }];
        return next.sort((a, b) => a.timestamp - b.timestamp);
      });
    };

    const handleChange = (snapshot: any) => {
      const payload = snapshot.val() as MessagePayload;
      if (!payload) return;
      setMessages((prev) =>
        prev
          .map((m) =>
            m.id === snapshot.key ? { id: snapshot.key as string, ...payload } : m
          )
          .sort((a, b) => a.timestamp - b.timestamp)
      );
    };

    const handleRemove = (snapshot: any) => {
      setMessages((prev) => prev.filter((m) => m.id !== snapshot.key));
    };

    onChildAdded(messagesRef, handleAdd);
    onChildChanged(messagesRef, handleChange);
    onChildRemoved(messagesRef, handleRemove);

    return () => {
      off(messagesRef, "child_added", handleAdd);
      off(messagesRef, "child_changed", handleChange);
      off(messagesRef, "child_removed", handleRemove);
    };
  }, [user]);

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
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
      setMessage("");
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout fehlgeschlagen");
    }
  };

  const pushMessage = async () => {
    if (!user) return;
    const trimmed = message.trim();
    if (!trimmed) return;

    setError(null);
    try {
      const messagesRef = ref(db, "messages");
      const newMessageRef = push(messagesRef);
      const payload: MessagePayload = {
        text: trimmed,
        owner: user.email ?? user.uid,
        timestamp: Date.now(),
      };
      await set(newMessageRef, payload);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Senden fehlgeschlagen");
    }
  };

  const fetchAiSuggestion = async () => {
    if (!user) return;
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          systemPrompt:
            "Du bist ein lustiger und sarkastischer Assistent. Antworte kurz und nutze die vorhandenen Nachrichten als Kontext.",
        }),
      });
      if (!res.ok) {
        throw new Error("Fehler beim Abruf der KI-Antwort");
      }
      const data = (await res.json()) as { reply?: string };
      if (data.reply) {
        setMessage(data.reply);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "KI-Antwort fehlgeschlagen");
    } finally {
      setAiLoading(false);
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
    <main className="flex min-h-screen flex-col bg-white text-black">
      <header className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-sm text-gray-600">
            Eingeloggt als {user.email ?? user.uid}
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      <section className="flex flex-1 flex-col items-center gap-4 px-4 pb-8">
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex h-full w-full max-w-2xl flex-1 flex-col gap-3">
          <div className="flex-1 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-3">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-600">Keine Nachrichten vorhanden.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {messages.map((m) => (
                  <li key={m.id} className="rounded bg-white p-3 shadow-sm">
                    <p className="text-sm font-medium text-gray-800">{m.text}</p>
                    <p className="text-[11px] text-gray-500">
                      {m.owner} · {new Date(m.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              value={message}
              onChange={handleMessageChange}
              type="text"
              placeholder="Nachricht eingeben…"
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={fetchAiSuggestion}
              disabled={aiLoading}
              className="rounded bg-purple-600 px-4 py-2 text-base font-medium text-white hover:bg-purple-700 disabled:opacity-60"
            >
              {aiLoading ? "KI lädt…" : "KI-Vorschlag"}
            </button>
            <button
              onClick={pushMessage}
              className="rounded bg-blue-600 px-4 py-2 text-base font-medium text-white hover:bg-blue-700"
            >
              Upload
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
