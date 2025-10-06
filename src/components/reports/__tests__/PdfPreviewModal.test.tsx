import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PdfPreviewModal from '../PdfPreviewModal';

const baseAssessment = {
  id: 'a1', student_id: 's1', module_id: 'lectoescritura', stage: 1,
  indicators: { x_0: 'SA' }, notes: '', evaluator_id: 'u1', created_at: new Date('2024-01-01').toISOString(), created_by: 'u1'
};

describe('PdfPreviewModal', () => {
  const setup = (props?: Partial<React.ComponentProps<typeof PdfPreviewModal>>) => {
    const onClose = vi.fn();
    const download = vi.fn();
    const toggleStage = vi.fn();
    const toggleEval = vi.fn();
    const ref = { current: null } as any;
    render(<PdfPreviewModal isOpen={true} onClose={onClose} stages={[1]} toggleStage={toggleStage} assessments={[baseAssessment as any]} selectedIds={new Set(['a1'])} toggleEval={toggleEval} download={download} pdfPreviewRef={ref} {...props} />);
    return { onClose, download, toggleStage, toggleEval };
  };

  it('renderiza y permite cerrar por overlay click', () => {
    const { onClose } = setup();
    const overlay = screen.getByTestId('pdf-overlay');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('cierra con Escape', () => {
    const { onClose } = setup();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('toggle stage y eval disparan callbacks', () => {
    const { toggleStage, toggleEval } = setup();
    const stageCheckbox = screen.getByTestId('stage-1');
    fireEvent.click(stageCheckbox);
    expect(toggleStage).toHaveBeenCalled();
    const evalCheckbox = screen.getByTestId('eval-a1');
    fireEvent.click(evalCheckbox);
    expect(toggleEval).toHaveBeenCalled();
  });
});
