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


  const hfToken = process.env.HUGGINGFACE_API_TOKEN;
  console.log('HUGGINGFACE_API_TOKEN:', hfToken ? 'Present' : 'Missing');
  if (!hfToken) {
    console.error('Hugging Face API token missing');
    return res.status(500).json({ error: 'Hugging Face API token missing' });
  }

  // Mistral-7B-Instruct model endpoint (chat)
  const url = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 256,
          do_sample: true,
          temperature: 0.7
        }
      })
    });
    const result = await response.json();
    console.log('DeepSeek API raw response:', result);
    const answer = Array.isArray(result) && result[0]?.generated_text ? result[0].generated_text : '';
    res.status(200).json({ answer });
  } catch (err) {
    console.error('DeepSeek error:', err);
    res.status(500).json({ error: 'Error al consultar DeepSeek', details: err.message });
  }
}
