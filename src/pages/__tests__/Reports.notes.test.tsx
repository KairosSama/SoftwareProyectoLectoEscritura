import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Reports from '../Reports';
import * as useStudentsMod from '../../hooks/useStudents';
import * as useStudentAssessmentsMod from '../../hooks/useStudentAssessments';
import type { Student, Assessment } from '../../lib/mockData';

const student: Student = { id:'s1', full_name:'Alumno Uno', diagnosis:'Dx', birth_date:'2015-01-01', program_start_date:'2024-01-01', created_at:'2024-01-01', updated_at:'2024-01-01', created_by:'u1' };

const assessment1: Assessment = { id:'a1', student_id:'s1', module_id:'lectoescritura', stage:1, created_at:'2025-01-01T10:00:00Z', indicators:{ reconocimiento_fotos_0:'SA' }, notes:'Nota evaluación A', evaluator_id:'u1', created_by:'u1' };
const assessment2: Assessment = { id:'a2', student_id:'s1', module_id:'lectoescritura', stage:1, created_at:'2025-01-02T10:00:00Z', indicators:{ reconocimiento_fotos_1:'AP' }, notes:'Nota evaluación B', evaluator_id:'u1', created_by:'u1' };

// Mock PDF deps
vi.mock('jspdf', () => ({ default: class { internal = { pageSize:{ getWidth:()=>595, getHeight:()=>842 } }; addPage(){} addImage(){} save(){} } }));
vi.mock('html2canvas', () => ({ default: async () => ({ width:800, height:1000, toDataURL: ()=>'data:image/png;base64,AAA' }) }));

describe('Reports - evaluation & report notes', () => {
  beforeEach(()=> vi.restoreAllMocks());

  it('muestra la nota de la evaluación activa en modo single', async () => {
    vi.spyOn(useStudentsMod, 'useStudents').mockReturnValue({ students:[student], loading:false, error:null });
    vi.spyOn(useStudentAssessmentsMod, 'useStudentAssessments').mockReturnValue({ assessments:[assessment1, assessment2], loading:false, error:null });
    render(<Reports />);
    // La última evaluación filtrada por etapa y módulo es assessment2 (orden por selectedIndex default 0 -> primer elemento filtrado en Reports es assessment1? se selecciona index 0 pero activeAssessment se resetea; mostramos StageTable de assessment1, así que su nota debe salir cuando la seleccionemos )
    // Forzamos elegir la segunda evaluación
    const selectEval = await screen.findByLabelText(/Evaluación/i);
    fireEvent.change(selectEval, { target:{ value:'1' } });
    // Puede aparecer en la tabla de resumen y en el panel de la evaluación -> usamos findAll
    const noteMatches = await screen.findAllByText('Nota evaluación B');
    expect(noteMatches.length).toBeGreaterThan(0);
  });

  it('muestra nota de la evaluación más reciente en tarjetas multi', async () => {
    vi.spyOn(useStudentsMod, 'useStudents').mockReturnValue({ students:[student], loading:false, error:null });
    vi.spyOn(useStudentAssessmentsMod, 'useStudentAssessments').mockReturnValue({ assessments:[assessment1, assessment2], loading:false, error:null });
    render(<Reports />);
    // Cambiar a modo multi
    fireEvent.click(screen.getByLabelText(/Varios estudiantes/));
  // Seleccionar el checkbox del único alumno (ya debería aparecer listo pero confirmamos)
  const studentNameMatches = await screen.findAllByText(/Alumno Uno/);
  expect(studentNameMatches.length).toBeGreaterThan(0);
    // Debería mostrar la nota de la evaluación más reciente (assessment2)
    await waitFor(()=> {
      expect(screen.getByText('Nota evaluación B')).toBeTruthy();
    });
  });

  it('incluye nota de la evaluación dentro del modal PDF', async () => {
    vi.spyOn(useStudentsMod, 'useStudents').mockReturnValue({ students:[student], loading:false, error:null });
    vi.spyOn(useStudentAssessmentsMod, 'useStudentAssessments').mockReturnValue({ assessments:[assessment1], loading:false, error:null });
    render(<Reports />);
    fireEvent.click(await screen.findByRole('button', { name:/PDF/i }));
    const dialog = await screen.findByRole('dialog');
    // Esperar a que se renderice la página de la evaluación
    await waitFor(()=> expect(dialog.querySelector('.pdf-page')).toBeTruthy());
    const inDialog = within(dialog);
    expect(inDialog.getByText(/Nota de la evaluación/i)).toBeTruthy();
    expect(inDialog.getByText('Nota evaluación A')).toBeTruthy();
  });

  it('incluye la nota global del reporte en portada PDF', async () => {
    vi.spyOn(useStudentsMod, 'useStudents').mockReturnValue({ students:[student], loading:false, error:null });
    vi.spyOn(useStudentAssessmentsMod, 'useStudentAssessments').mockReturnValue({ assessments:[assessment1], loading:false, error:null });
    render(<Reports />);
    // Escribir nota global
    const textarea = await screen.findByLabelText(/Nota del reporte/i);
    fireEvent.change(textarea, { target:{ value:'Nota global extensiva' } });
    fireEvent.click(await screen.findByRole('button', { name:/PDF/i }));
    const dialog = await screen.findByRole('dialog');
    await waitFor(()=> {
      expect(dialog.textContent).toMatch(/Nota global extensiva/);
    });
  });
});
