import { useEffect, useState } from 'react';
import { getAssessmentsByStudent, type Assessment } from '../lib/mockData';
import { supabase } from '../lib/supabase';

export function useStudentAssessments(studentId: string) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=> {
    if (!studentId) { setAssessments([]); return; }
    let cancelled = false;
    const fetchNow = async () => {
      try {
        setLoading(true);
        // Garantiza que la sesión esté resuelta antes de leer datos protegidos por RLS
        try {
          await supabase.auth.getSession();
        } catch {}
        const list = await getAssessmentsByStudent(studentId);
        if (!cancelled) setAssessments(list);
      } catch (e:any) {
        if (!cancelled) setError(e.message || 'Error cargando evaluaciones');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchNow();
    let unsubscribe: (() => void) | undefined;
    const authAny: any = (supabase as any).auth;
    if (authAny && typeof authAny.onAuthStateChange === 'function') {
      const { data: listener } = authAny.onAuthStateChange(() => { void fetchNow(); });
      unsubscribe = () => { try { listener?.subscription?.unsubscribe?.(); } catch {} };
    }
    return () => {
      cancelled = true;
      try { unsubscribe?.(); } catch {}
    };
  }, [studentId]);

  return { assessments, loading, error };
}
