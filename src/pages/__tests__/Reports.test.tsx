import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Student, Assessment } from '../../lib/mockData';
import * as useStudentsMod from '../../hooks/useStudents';
import * as useStudentAssessmentsMod from '../../hooks/useStudentAssessments';
import Reports from '../Reports';

const mockStudents: Student[] = [{
  id: 's1', full_name: 'Alumno Uno', diagnosis: 'N/A', birth_date: '2015-01-01', program_start_date: '2024-01-01', created_at: '2024-01-01', updated_at: '2024-01-05', created_by: 'u1'
}];
const baseIndicators: Assessment['indicators'] = {
  reconocimiento_fotos_1: 'SA',
  reconocimiento_fotos_2: 'AP'
};
const mockAssessments: Assessment[] = [
  { id: 'a1', student_id: 's1', module_id: 'lectoescritura', stage: 1, created_at: '2025-01-01T10:00:00Z', indicators: baseIndicators, notes: '', evaluator_id: 'u1', created_by: 'u1' },
  { id: 'a2', student_id: 's1', module_id: 'matematica', stage: 1, created_at: '2025-01-02T10:00:00Z', indicators: baseIndicators, notes: '', evaluator_id: 'u1', created_by: 'u1' },
  { id: 'a3', student_id: 's1', module_id: 'lectoescritura', stage: 2, created_at: '2025-01-03T10:00:00Z', indicators: baseIndicators, notes: '', evaluator_id: 'u1', created_by: 'u1' },
];

describe('Reports page', () => {
  beforeEach(() => {
    vi.spyOn(useStudentsMod, 'useStudents').mockReturnValue({ students: mockStudents, loading: false, error: null });
    vi.spyOn(useStudentAssessmentsMod, 'useStudentAssessments').mockReturnValue({ assessments: mockAssessments, loading: false, error: null });
  });

  it('muestra gráficos y permite cambiar etapa', async () => {
    render(<Reports />);
    // Estudiante seleccionado automáticamente
    expect(await screen.findByText(/Reportes y Analíticas/)).toBeTruthy();
    // Etapa inicial 1
  const etapaSelect = screen.getByLabelText(/Etapa/i) as HTMLSelectElement;
    expect(etapaSelect.value).toBe('1');
    // Cambiar a etapa 2
    fireEvent.change(etapaSelect, { target: { value: '2' } });
    await waitFor(()=> expect(etapaSelect.value).toBe('2'));
  });

  it('abre y cierra modal PDF', async () => {
    render(<Reports />);
    const btn = await screen.findByRole('button', { name: /PDF/i });
    fireEvent.click(btn);
    expect(await screen.findByRole('dialog')).toBeTruthy();
    // botón cerrar
    const closeBtn = screen.getByRole('button', { name: /Cerrar/i });
    fireEvent.click(closeBtn);
    await waitFor(()=> {
      const dialog = screen.queryByRole('dialog');
      expect(dialog).toBeNull();
    });
  });
});
