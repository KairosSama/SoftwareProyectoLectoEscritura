// Vercel Serverless Function: api/hf-qa.js
// Question Answering over stored student PDF text using Hugging Face extractive QA model.
// Model: deepset/xlm-roberta-base-squad2 (multi-lingual, supports Spanish)

const MODEL_URL = 'https://api-inference.huggingface.co/models/deepset/xlm-roberta-base-squad2';
const DEFAULT_MAX_CHARS = 1500; // max chars per chunk (approx to keep request small)
const MIN_SCORE_THRESHOLD = 0.05; // lowered to allow weaker spans (diagnostic)
const MAX_PARAGRAPH_FALLBACK = 3; // allow one more paragraph

// Minimal Spanish stopwords (extend as needed)
// Removed domain terms ("fundamentos", "teóricos") so they remain as keywords.
const STOPWORDS = new Set(['el','la','los','las','de','del','un','una','y','o','u','que','en','para','por','con','al','lo','se','su','sus','a','sobre','más','como','qué','cuál','cuáles','donde','dónde','cuando','cuándo']);

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

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9ñáéíóúü\s]/gi, ' ') // keep letters, numbers, spaces
    .replace(/\s+/g, ' ') // collapse
    .trim();
}

function expandToken(t) {
  // Simple morphological/domain expansion for key terms
  if (t === 'lectoescritura') return ['lectoescritura','lectura','escritura'];
  if (t === 'fundamentos') return ['fundamentos','fundamento','bases'];
  if (t === 'teoricos' || t === 'teóricos') return ['teoricos','teóricos','teoria','teórica','teorica'];
  return [t];
}

function extractKeywords(question) {
  const raw = normalize(question).split(' ').filter(t => t && !STOPWORDS.has(t));
  const expanded = raw.flatMap(expandToken);
  return [...new Set(expanded)].slice(0, 18); // allow a few more after expansion
}

function lexicalFallback(question, pdfText) {
  if (!pdfText) return null;
  const keywords = extractKeywords(question);
  if (keywords.length === 0) return null;

  // Split preserving headings: treat lines that are short and ALL CAPS / Title-like as headings
  const rawBlocks = pdfText.split(/\n{2,}|\r\n{2,}/).map(b => b.trim()).filter(Boolean);

  // Merge heading with following paragraph if heading very short
  const paragraphs = [];
  for (let i = 0; i < rawBlocks.length; i++) {
    const block = rawBlocks[i];
    const isHeading = /^([A-ZÁÉÍÓÚÑ0-9IVX\-\s\.]{3,})$/.test(block.replace(/\n/g,'').trim());
    if (isHeading && i + 1 < rawBlocks.length) {
      paragraphs.push(block + '\n' + rawBlocks[i + 1]);
      i++; // skip next
    } else {
      paragraphs.push(block);
    }
  }

  let scored = paragraphs.map((p, idx) => {
    const normP = normalize(p);
    let hits = 0;
    for (const kw of keywords) {
      if (normP.includes(kw)) hits++;
    }
    // Slight boost if contains both fundamento* and teóri*
    const hasFund = /fundament/.test(normP);
    const hasTeor = /teor/.test(normP);
    if (hasFund && hasTeor) hits += 2;
    return { paragraph: p, hits, idx };
  }).filter(r => r.hits > 0);
  if (scored.length === 0) return null;
  scored.sort((a,b) => b.hits - a.hits || a.idx - b.idx);
  const top = scored.slice(0, MAX_PARAGRAPH_FALLBACK).map(r => r.paragraph);

  const regex = new RegExp(`(${keywords.map(k => k.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')).join('|')})`, 'gi');
  const highlighted = top.map(p => p.replace(regex, '**$1**'));
  return {
    answer: highlighted.join('\n\n'),
    keywords
  };
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
    const fallback = lexicalFallback(question, pdfText);
    if (fallback) {
      return res.status(200).json({
        answer: `No se encontró una respuesta exacta, pero aquí tienes fragmento(s) relacionado(s):\n\n${fallback.answer}`,
        score: best.score || 0,
        fallback: true,
        keywords: fallback.keywords
      });
    }
    return res.status(200).json({
      answer: 'No encontré una respuesta clara en los documentos para esa pregunta. Intenta reformularla o proporciona más contexto.',
      score: best.score || 0,
      fallback: false
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
