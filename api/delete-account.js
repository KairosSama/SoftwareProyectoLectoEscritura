// Serverless endpoint para eliminar la cuenta del usuario autenticado y sus datos.
// Usa la service role key (CONFIGURAR en Vercel como env var SUPABASE_SERVICE_KEY) porque
// el cliente público no puede llamar a auth.admin.deleteUser.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL; // misma URL que VITE_SUPABASE_URL pero SIN exponerla en cliente
const serviceKey = process.env.SUPABASE_SERVICE_KEY; // service_role key

if (!supabaseUrl || !serviceKey) {
  console.warn('[delete-account] Falta SUPABASE_URL o SUPABASE_SERVICE_KEY');
}

const adminClient = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!adminClient) {
    return res.status(500).json({ error: 'Servicio no configurado' });
  }
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token ausente' });

    // Validar token para obtener el user id
    const { data: { user }, error: getErr } = await adminClient.auth.getUser(token);
    if (getErr || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    const userId = user.id;

    // 1. Borrar datos dependientes (orden: evaluaciones -> estudiantes -> documentos -> lo que falte)
    // Usa transacciones lógicas (no hay transaction en serverless; se asume idempotencia).
    const tablesToClean = [
      { table: 'assessments', filter: { created_by: userId } },
      { table: 'students', filter: { created_by: userId } },
      { table: 'student_documents', filter: { created_by: userId } }
    ];

    for (const t of tablesToClean) {
      const query = adminClient.from(t.table).delete();
      for (const [k, v] of Object.entries(t.filter)) {
        query.eq(k, v);
      }
      const { error: delErr } = await query;
      if (delErr) {
        console.warn(`[delete-account] Error limpiando ${t.table}:`, delErr.message);
      }
    }

    // 2. Eliminar objetos de Storage (paths bajo userId/ en bucket user_docs)
    try {
      const { data: list, error: listErr } = await adminClient.storage.from('user_docs').list(userId + '/', { limit: 1000 });
      if (!listErr && list?.length) {
        const paths = list.filter(o => o.name && !o.name.endsWith('/')).map(o => `${userId}/${o.name}`);
        if (paths.length) {
          await adminClient.storage.from('user_docs').remove(paths);
        }
      }
    } catch (e) {
      console.warn('[delete-account] Error borrando storage user_docs:', e.message);
    }

    // 3. Eliminar usuario de Auth
    const { error: delUserErr } = await adminClient.auth.admin.deleteUser(userId);
    if (delUserErr) {
      return res.status(500).json({ error: 'No se pudo eliminar usuario: ' + delUserErr.message });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[delete-account] Error general:', e);
    return res.status(500).json({ error: e.message || 'Error interno' });
  }
}
