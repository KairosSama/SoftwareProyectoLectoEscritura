// api/dev-server.js
// Servidor local para pruebas del chatbot con Gemini (API v1)

import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const app = express();
app.use(bodyParser.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (GEMINI_API_KEY) {
  console.log("[dev-server] GEMINI_API_KEY cargada: ✅ OK");
} else {
  console.error("[dev-server] ❌ NO DETECTADA. Revisa tu archivo .env.local");
}

app.post("/api/gemini-qa", async (req, res) => {
  try {
    const { question, contextChunks = [] } = req.body || {};

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Falta GEMINI_API_KEY" });
    }
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Falta 'question' (string)" });
    }

    const context = Array.isArray(contextChunks)
      ? contextChunks.filter(Boolean).join("\n")
      : String(contextChunks || "");

    const systemPrompt = `
Eres un asistente académico que ayuda a profesores a responder preguntas sobre documentos PDF.
Responde siempre en español, de manera breve, clara y correcta.
Si la respuesta no está en el contexto, di: "No hay suficiente información en el documento".
`.trim();

    const userPrompt = `
--- CONTEXTO DEL/LOS PDF(S) ---
${context || "(vacío)"}
--- FIN CONTEXTO ---

PREGUNTA:
${question}
`.trim();

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    // 👇 Usa el modelo actual estable (2.5) en API v1
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Gemini error:", data.error);
      return res
        .status(500)
        .json({ error: "Gemini error", detail: JSON.stringify(data.error, null, 2) });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No se pudo generar una respuesta con Gemini.";

    res.status(200).json({ answer });
  } catch (error) {
    console.error("Error al consultar el modelo:", error);
    res.status(500).json({ error: "Error al consultar el modelo" });
  }
});

const PORT = 8787;
app.listen(PORT, () => {
  console.log(`Dev API en http://localhost:${PORT}`);
});
