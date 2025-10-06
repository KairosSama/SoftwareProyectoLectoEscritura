import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentModal from '../StudentModal';

// Mock create/update
vi.mock('../../../lib/mockData', () => ({
  createStudent: vi.fn().mockResolvedValue({ id: 'new', full_name: 'Nuevo', diagnosis: '', birth_date: '', program_start_date: '', created_by: 'u1', created_at: '', updated_at: '' }),
  updateStudent: vi.fn().mockResolvedValue({})
}));

const baseProps = { isOpen: true, onClose: vi.fn(), onSuccess: vi.fn() };

describe('StudentModal', () => {
  it('crea estudiante', async () => {
    render(<StudentModal {...baseProps} />);
    fireEvent.change(screen.getByLabelText('Nombre Completo *'), { target: { value: 'Nombre' } });
    fireEvent.change(screen.getByLabelText('Diagnóstico *'), { target: { value: 'DX' } });
    fireEvent.change(screen.getByLabelText('Fecha de Nacimiento *'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Fecha de Inicio del Programa *'), { target: { value: '2024-01-02' } });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir Estudiante' }));
    await waitFor(()=> expect(baseProps.onSuccess).toHaveBeenCalled());
  });

  it('actualiza estudiante', async () => {
    render(<StudentModal {...baseProps} student={{ id: 's1', full_name: 'Orig', diagnosis: 'D', birth_date: '2024-01-01', program_start_date: '2024-01-02' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    await waitFor(()=> expect(baseProps.onSuccess).toHaveBeenCalled());
  });
});
