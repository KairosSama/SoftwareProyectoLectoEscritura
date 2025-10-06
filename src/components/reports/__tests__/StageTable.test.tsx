import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StageTable from '../StageTable';
import type { Assessment } from '../../../lib/mockData';

const makeAssessment = (over: Partial<Assessment>): Assessment => ({
  id: 'assess-1',
  student_id: 's1',
  module_id: 'lectoescritura',
  stage: 1,
  created_at: '2025-01-01T00:00:00Z',
  indicators: {
    reconocimiento_fotos_1: 'SA',
    reconocimiento_fotos_2: 'AP',
    seleccion_conocidas_1: 'NP'
  },
  notes: 'Notas',
  evaluator_id: 'u1',
  created_by: 'u1',
  ...over
});

describe('StageTable', () => {
  it('renderiza bloques y preguntas con leyenda', () => {
    const assessment = makeAssessment({});
    render(<StageTable assessment={assessment} />);
    // Bloques presentes
    expect(screen.getByText(/Reconocimiento de Fotos/i)).toBeTruthy();
    expect(screen.getByText(/Selección de Categorías Conocidas/i)).toBeTruthy();
    // Preguntas derivadas (usa catálogo -> primera pregunta de cada bloque)
  // Se validan preguntas que aparecen con los índices usados (2 y 1 en nuestros indicadores mock)
  expect(screen.getByText(/Reconoce fotos de familiares/)).toBeTruthy();
  expect(screen.getByText(/Identifica elementos de comida/)).toBeTruthy();
    // Leyenda
    expect(screen.getByText(/Autónomo/)).toBeTruthy();
  });

  it('muestra mensaje si no hay assessment', () => {
    render(<StageTable assessment={null} />);
    expect(screen.getByText(/No hay evaluación para mostrar/)).toBeTruthy();
  });
});
