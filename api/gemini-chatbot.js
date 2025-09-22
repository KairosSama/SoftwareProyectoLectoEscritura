// Vercel Serverless Function: api/gemini-chatbot.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    console.error('Missing prompt');
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  console.log('GEMINI_API_KEY:', apiKey);
  if (!apiKey) {
    console.error('API key missing');
    return res.status(500).json({ error: 'API key missing' });
  }

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
    const text = await response.text();
    console.log('Gemini API raw response:', text);
    let result = {};
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error('JSON parse error:', e);
    }
    const answer = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ answer });
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: 'Error al consultar Gemini', details: err.message });
  }
}
