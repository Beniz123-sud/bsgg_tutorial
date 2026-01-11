"use client";

import { ChangeEvent, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  off,
  get,
  push,
  query,
  ref,
  remove,
  orderByChild,
  limitToLast,
  endAt,
  set,
} from "firebase/database";
import { auth, db } from "../../config/firebase";

type MessagePayload = {
  text: string;
  owner: string;
  ownerUid?: string;
  ownerEmail?: string;
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
  const [info, setInfo] = useState<string | null>(null);
  const [oldestTimestamp, setOldestTimestamp] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const normalizePayload = (payload: MessagePayload): MessagePayload => ({
    text: payload.text,
    owner: payload.owner,
    ownerUid: payload.ownerUid,
    ownerEmail: payload.ownerEmail,
    timestamp: payload.timestamp,
  });

  const isOwn = (m: Message) =>
    (m.ownerUid && user?.uid === m.ownerUid) ||
    (!!user?.email && m.ownerEmail === user.email) ||
    (!!user?.email && m.owner === user.email);

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
      setOldestTimestamp(null);
      return;
    }

    const messagesQuery = query(
      ref(db, "messages"),
      orderByChild("timestamp"),
      limitToLast(50)
    );

    const handleAdd = (snapshot: any) => {
      const payload = snapshot.val() as MessagePayload;
      if (!payload) return;
      setMessages((prev) => {
        const next = [...prev, { id: snapshot.key as string, ...normalizePayload(payload) }];
        const sorted = next.sort((a, b) => a.timestamp - b.timestamp);
        const oldest = sorted[0]?.timestamp ?? null;
        setOldestTimestamp(oldest);
        return sorted;
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

    onChildAdded(messagesQuery, handleAdd);
    onChildChanged(messagesQuery, handleChange);
    onChildRemoved(messagesQuery, handleRemove);

    return () => {
      off(messagesQuery, "child_added", handleAdd);
      off(messagesQuery, "child_changed", handleChange);
      off(messagesQuery, "child_removed", handleRemove);
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
    setInfo(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrierung fehlgeschlagen");
    }
  };

  const login = async () => {
    setError(null);
    setInfo(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fehlgeschlagen");
    }
  };

  const logout = async () => {
    setError(null);
    setInfo(null);
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

  const resetPassword = async () => {
    if (!email.trim()) {
      setError("Bitte eine E-Mail eingeben, um das Passwort zurückzusetzen.");
      return;
    }
    setError(null);
    setInfo(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo("Passwort-Reset-Mail wurde gesendet (falls E-Mail registriert).");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Passwort-Reset fehlgeschlagen");
    }
  };

  const pushMessage = async () => {
    if (!user) return;
    if (!user.email) {
      setError("Kein E-Mail im Profil. Nachricht kann nicht gespeichert werden.");
      return;
    }
    const trimmed = message.trim();
    if (!trimmed) return;

    setError(null);
    try {
      const messagesRef = ref(db, "messages");
      const newMessageRef = push(messagesRef);
      const payload: MessagePayload = {
        text: trimmed,
        owner: user.email ?? user.uid,
        ownerUid: user.uid,
        ownerEmail: user.email ?? "",
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

  const deleteMessage = async (id: string) => {
    if (!user) return;
    try {
      setError(null);
      const targetRef = ref(db, `messages/${id}`);
      await remove(targetRef);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen");
    }
  };

  const loadOlder = async () => {
    if (!user || oldestTimestamp === null) return;
    setLoadingMore(true);
    try {
      const olderQuery = query(
        ref(db, "messages"),
        orderByChild("timestamp"),
        endAt(oldestTimestamp - 1),
        limitToLast(50)
      );
      const snap = await get(olderQuery);
      if (snap.exists()) {
        const newItems: Message[] = [];
        snap.forEach((child) => {
          newItems.push({
            id: child.key as string,
            ...normalizePayload(child.val() as MessagePayload),
          });
        });
        setMessages((prev) => {
          const map = new Map<string, Message>();
          [...prev, ...newItems].forEach((m) => map.set(m.id, m));
          const merged = Array.from(map.values()).sort(
            (a, b) => a.timestamp - b.timestamp
          );
          const oldest = merged[0]?.timestamp ?? oldestTimestamp;
          setOldestTimestamp(oldest);
          return merged;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ältere Nachrichten konnten nicht geladen werden");
    } finally {
      setLoadingMore(false);
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
                <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Aufgabe 7</p>
                <h1 className="mt-2 text-3xl font-semibold">Chat + KI-Vorschlag</h1>
                <p className="mt-2 text-sm text-slate-300">
                  Login/Registrierung über Firebase Auth, Nachrichten in Realtime DB, KI-Hilfe per API.
                </p>
              </div>
              <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200">
                KI
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
                {info ? (
                  <p className="text-sm text-emerald-300" role="status">
                    {info}
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
                  <button
                    onClick={resetPassword}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base font-semibold text-slate-100 transition hover:bg-white/10 hover:-translate-y-[1px]"
                  >
                    Passwort zurücksetzen
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p className="mb-2 font-semibold text-slate-50">Hinweise</p>
                <ul className="space-y-1 text-slate-300">
                  <li>• Realtime DB Listener (add/change/remove) halten die Liste aktuell.</li>
                  <li>• KI-Vorschlag fragt `/api/chat` an und schreibt ins Eingabefeld.</li>
                  <li>• Upload sendet den aktuellen Input als Nachricht.</li>
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
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-16">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Logged In</p>
            <h1 className="mt-2 text-3xl font-semibold">
              Willkommen, {user.email ?? "Unbekannt"}!
            </h1>
            <p className="text-sm text-slate-300">Chat + KI mit Realtime DB</p>
          </div>
          <button
            onClick={logout}
            className="rounded-xl bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:-translate-y-[1px] hover:shadow-xl hover:shadow-rose-500/40"
          >
            Logout
          </button>
        </div>

        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        {info ? (
          <p className="text-sm text-emerald-300" role="status">
            {info}
          </p>
        ) : null}

        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-200">Nachrichten</p>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                Live
              </span>
            </div>
            <div className="flex max-h-[480px] flex-col gap-3 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-slate-300">Keine Nachrichten vorhanden.</p>
              ) : (
                messages.map((m) => {
                  const mine = isOwn(m);
                  return (
                    <div
                      key={m.id}
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        mine
                          ? "self-end border border-emerald-400/30 bg-emerald-500/15 text-emerald-50"
                          : "border border-white/10 bg-white/5 text-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold">{m.text}</p>
                        {mine ? (
                          <button
                            onClick={() => deleteMessage(m.id)}
                            className="rounded-md border border-white/20 px-2 py-1 text-[11px] font-semibold text-white/90 transition hover:border-red-400 hover:text-red-100"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-white/70">
                        {m.owner} · {new Date(m.timestamp).toLocaleString()}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={loadOlder}
                disabled={loadingMore || oldestTimestamp === null}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:opacity-60"
              >
                {loadingMore ? "Lädt ältere…" : "Ältere Nachrichten laden"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <p className="text-sm font-semibold text-slate-200">Nachricht schreiben</p>
            <div className="mt-4 flex flex-col gap-3">
              <input
                value={message}
                onChange={handleMessageChange}
                type="text"
                placeholder="Nachricht eingeben…"
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-base text-slate-50 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={fetchAiSuggestion}
                  disabled={aiLoading}
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:-translate-y-[1px] hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-60"
                >
                  {aiLoading ? "KI lädt…" : "KI-Vorschlag"}
                </button>
                <button
                  onClick={pushMessage}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-[1px] hover:shadow-xl hover:shadow-blue-500/40"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
