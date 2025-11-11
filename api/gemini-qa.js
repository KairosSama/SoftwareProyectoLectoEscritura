// api/gemini-qa.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Falta GEMINI_API_KEY" });
    }

    const { question, context } = req.body || {};
    if (!question) {
      return res.status(400).json({ error: "Falta 'question'." });
    }

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
      contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      generationConfig: { temperature: 0.2, topK: 32, topP: 0.95, maxOutputTokens: 1024 }
    };

    // 👇 Modelo estable en v1
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
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

    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Error al consultar Gemini:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
