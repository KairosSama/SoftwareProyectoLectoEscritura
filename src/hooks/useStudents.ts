import { useEffect, useState } from 'react';
import { getStudents, type Student } from '../lib/mockData';
import { supabase } from '../lib/supabase';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=> {
    let cancelled = false;
    const fetchNow = async () => {
      try {
        setLoading(true);
        // Asegura que el cliente tenga la sesión cargada antes de consultar (evita RLS vacía en primera carga)
        try {
          await supabase.auth.getSession();
        } catch {}
        const data = await getStudents();
        if (!cancelled) setStudents(data);
      } catch (e:any) {
        if (!cancelled) setError(e.message || 'Error cargando estudiantes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    // Primera carga
    void fetchNow();
    // Reintenta cuando cambia el estado de autenticación (token listo tras login/refresh)
    let unsubscribe: (() => void) | undefined;
    const authAny: any = (supabase as any).auth;
    if (authAny && typeof authAny.onAuthStateChange === 'function') {
      const { data: listener } = authAny.onAuthStateChange(() => {
        void fetchNow();
      });
      unsubscribe = () => { try { listener?.subscription?.unsubscribe?.(); } catch {} };
    }
    return () => {
      cancelled = true;
      try { unsubscribe?.(); } catch {}
    };
  }, []);

  return { students, loading, error };
}
