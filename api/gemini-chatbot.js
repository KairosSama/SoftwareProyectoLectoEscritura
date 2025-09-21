// Vercel Serverless Function: api/gemini-chatbot.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta1/models/gemini-pro:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const result = await response.json();
    const answer = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ answer });
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar Gemini', details: err.message });
  }
}
