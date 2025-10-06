import { useEffect, useState } from 'react';
import { getAssessmentsByStudent, type Assessment } from '../lib/mockData';

export function useStudentAssessments(studentId: string) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=> {
    if (!studentId) { setAssessments([]); return; }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const list = await getAssessmentsByStudent(studentId);
        if (!cancelled) setAssessments(list);
      } catch (e:any) {
        if (!cancelled) setError(e.message || 'Error cargando evaluaciones');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [studentId]);

  return { assessments, loading, error };
}
