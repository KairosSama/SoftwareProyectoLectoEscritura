// Endpoint de diagnóstico: NO expone valores, sólo booleans y longitud.
// Elimínalo o protégelo tras terminar las pruebas.
export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const keys = [
    'SUPABASE_URL',
    'VITE_SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'VITE_SUPABASE_ANON_KEY'
  ];
  const info = Object.fromEntries(keys.map(k => {
    const val = process.env[k];
    return [k, val ? { present: true, length: val.length } : { present: false }];
  }));
  res.status(200).json({ runtime: 'node', info });
}
