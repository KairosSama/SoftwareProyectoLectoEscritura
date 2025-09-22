// Vercel Serverless Function: api/hf-qa.js
// Question Answering over stored student PDF text using Hugging Face extractive QA model.
// Model: deepset/xlm-roberta-base-squad2 (multi-lingual, supports Spanish)

const MODEL_URL = 'https://api-inference.huggingface.co/models/deepset/xlm-roberta-base-squad2';
const DEFAULT_MAX_CHARS = 1500; // max chars per chunk (approx to keep request small)
const MIN_SCORE_THRESHOLD = 0.2; // below this, we treat as "no answer"

function chunkText(text, maxChars = DEFAULT_MAX_CHARS) {
  if (!text) return [];
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
  const chunks = [];
  let current = '';
  for (const p of paragraphs) {
    // If paragraph itself is larger than maxChars, hard split it.
    if (p.length > maxChars) {
      if (current) {
        chunks.push(current);
        current = '';
      }
      for (let i = 0; i < p.length; i += maxChars) {
        chunks.push(p.slice(i, i + maxChars));
      }
      continue;
    }
    if ((current + '\n' + p).length <= maxChars) {
      current = current ? current + '\n' + p : p;
    } else {
      if (current) chunks.push(current);
      current = p;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function queryHuggingFace(apiKey, question, context) {
  const response = await fetch(MODEL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: {
        question,
        context
      }
    })
  });

  if (response.status === 503) {
    // Model loading
    return { loading: true };
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HF API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  // Expected shape: { answer: string, score: number, start: number, end: number }
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.HUGGING_FACE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing HUGGING_FACE_API_KEY in environment' });
  }

  const { question, studentData = '', pdfText = '' } = req.body || {};

  if (!question) {
    return res.status(400).json({ error: 'Missing question' });
  }

  // Combine student data and pdf text for context chunking (student data repeated in every context for consistency)
  const chunks = chunkText(pdfText);

  if (chunks.length === 0) {
    // Still allow QA over just student data
    chunks.push('');
  }

  let best = { answer: '', score: 0, start: -1, end: -1, chunkIndex: -1 };
  let loadingDetected = false;

  for (let i = 0; i < chunks.length; i++) {
    const context = `Datos del estudiante:\n${studentData}\n\nFragmento PDF (${i + 1}/${chunks.length}):\n${chunks[i]}`.slice(0, DEFAULT_MAX_CHARS + studentData.length + 120); // safety slice
    try {
      const result = await queryHuggingFace(apiKey, question, context);
      if (result.loading) {
        loadingDetected = true;
        break; // break early; client can retry
      }
      if (result && result.answer && result.score !== undefined) {
        if (result.score > best.score && result.answer.trim() !== '') {
          best = { ...result, chunkIndex: i };
        }
      }
    } catch (err) {
      console.error('HF chunk error', i, err.message);
      // Continue trying next chunks, but keep first error to maybe report fallback
      if (!best.error) best.error = err.message;
    }
  }

  if (loadingDetected) {
    return res.status(503).json({ answer: 'El modelo se está cargando en Hugging Face. Intenta de nuevo en unos segundos.', loading: true });
  }

  if (!best.answer || best.score < MIN_SCORE_THRESHOLD) {
    return res.status(200).json({
      answer: 'No encontré una respuesta clara en los documentos para esa pregunta. Intenta reformularla o proporciona más contexto.',
      score: best.score || 0
    });
  }

  return res.status(200).json({
    answer: best.answer,
    score: best.score,
    chunkIndex: best.chunkIndex,
    // Optionally return span positions (not used currently by frontend)
    start: best.start,
    end: best.end
  });
}
