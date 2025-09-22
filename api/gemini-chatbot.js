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



  const openaiApiKey = process.env.OPENAI_API_KEY;
  console.log('OPENAI_API_KEY:', openaiApiKey ? 'Present' : 'Missing');
  if (!openaiApiKey) {
    console.error('OpenAI API key missing');
    return res.status(500).json({ error: 'OpenAI API key missing' });
  }

  const url = 'https://api.openai.com/v1/responses';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        input: prompt,
        store: false
      })
    });
    const result = await response.json();
    console.log('OpenAI API raw response:', result);
    const answer = result?.result || result?.output || '';
    res.status(200).json({ answer });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ error: 'Error al consultar OpenAI', details: err.message });
  }
}
