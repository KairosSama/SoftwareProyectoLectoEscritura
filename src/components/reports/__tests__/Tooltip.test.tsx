import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import Tooltip from '../Tooltip';
import type { TooltipState } from '../types';

const base: TooltipState = { visible: true, x: 10, y: 20, title: 'Título', lines: [ { name: 'Indicador', value: 75 } ] };

describe('Tooltip', () => {
  it('no renderiza cuando visible=false', () => {
    render(<Tooltip tip={{ ...base, visible: false }} />);
    expect(screen.queryByText('Título')).toBeNull();
  });

  it('renderiza título y líneas', () => {
    render(<Tooltip tip={base} />);
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Indicador')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('soporta ausencia de title', () => {
    render(<Tooltip tip={{ ...base, title: undefined }} />);
    expect(screen.queryByText('Título')).toBeNull();
    expect(screen.getByText('Indicador')).toBeInTheDocument();
  });
});
