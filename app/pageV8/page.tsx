"use client";

import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../config/firebase";

export default function PageV8() {
  const [inputUrl, setInputUrl] = useState("");
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchUrl = async () => {
      if (!uploadedPath) return;
      try {
        const url = await getDownloadURL(ref(storage, uploadedPath));
        if (active) setDownloadUrl(url);
      } catch (err) {
        if (active) {
          setError("Konnte Download-URL nicht laden.");
        }
      }
    };
    fetchUrl();
    return () => {
      active = false;
    };
  }, [uploadedPath]);

  const handleUpload = async () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setError("Bitte eine Bild-URL eingeben.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const response = await fetch(trimmed);
      if (!response.ok) throw new Error("Bild konnte nicht geladen werden");
      const blob = await response.blob();
      const filename = `uploads/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob, { contentType: blob.type || "image/jpeg" });
      setUploadedPath(filename);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload fehlgeschlagen. Bitte erneut versuchen."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-16">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Aufgabe 8</p>
            <h1 className="mt-2 text-3xl font-semibold">Bild-Upload mit Firebase Storage</h1>
            <p className="mt-2 text-sm text-slate-300">
              Links: URL-Eingabe & Vorschau. Button lädt das Bild in Storage und holt die Download-URL, die rechts angezeigt wird.
            </p>
          </div>
          <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-200">
            Storage
          </span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              Bild-URL (Links):
              <input
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                type="url"
                placeholder="https://example.com/dein-bild.jpg"
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-base text-slate-50 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-[1px] hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-60"
              >
                {uploading ? "Lädt hoch…" : "In Firebase hochladen"}
              </button>
              {error ? (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <figure className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <figcaption className="text-sm font-semibold text-slate-200">
                Eingegebene URL (links)
              </figcaption>
              {inputUrl ? (
                <img
                  src={inputUrl}
                  alt="Eingegebenes Bild"
                  className="max-h-96 w-full rounded-2xl border border-white/10 bg-slate-900 object-contain"
                />
              ) : (
                <p className="text-sm text-slate-300">Noch keine URL eingegeben.</p>
              )}
            </figure>

            <figure className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <figcaption className="text-sm font-semibold text-slate-200">
                Aus Firebase geladene URL (rechts)
              </figcaption>
              {downloadUrl ? (
                <img
                  src={downloadUrl}
                  alt="Hochgeladenes Bild"
                  className="max-h-96 w-full rounded-2xl border border-white/10 bg-slate-900 object-contain"
                />
              ) : (
                <p className="text-sm text-slate-300">
                  Noch kein Upload durchgeführt oder URL wird geladen.
                </p>
              )}
            </figure>
          </div>
        </div>
      </div>
    </main>
  );
}
