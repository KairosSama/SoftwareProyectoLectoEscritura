import { useEffect, useState } from 'react';
import { getStudents, type Student } from '../lib/mockData';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=> {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getStudents();
        if (!cancelled) setStudents(data);
      } catch (e:any) {
        if (!cancelled) setError(e.message || 'Error cargando estudiantes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { students, loading, error };
}
