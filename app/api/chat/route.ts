import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_SYSTEM_PROMPT =
  "Du bist ein lustiger und sarkastischer Assistent. Beantworte kurz und mit einem Augenzwinkern. Nutze den gegebenen Nachrichtenverlauf als Kontext.";

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY fehlt auf dem Server" },
      { status: 500 }
    );
  }

  try {
    const { messages, systemPrompt } = await req.json();

    const serialized =
      Array.isArray(messages) && messages.length > 0
        ? messages
            .map(
              (m: { owner?: string; text?: string; timestamp?: number }) =>
                `- ${m.owner ?? "unbekannt"}: ${m.text ?? ""}`
            )
            .join("\n")
        : "Keine Nachrichten vorhanden.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt || DEFAULT_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Bisherige Nachrichten:\n${serialized}\n\nGib eine kurze, sarkastische Antwort.`,
        },
      ],
      max_tokens: 150,
    });

    const text =
      completion.choices?.[0]?.message?.content ??
      "Konnte keine Antwort generieren.";

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("OpenAI route error:", error);
    return NextResponse.json(
      { error: "Fehler bei der OpenAI-Anfrage" },
      { status: 500 }
    );
  }
}
