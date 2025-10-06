import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { act } from '@testing-library/react';

// Smoke test mínimo: sólo asegura que el árbol principal monta sin crash con rutas básicas.
describe('App smoke', () => {
  it('monta sin explotar', () => {
  act(()=> { render(<App />); });
    // No assertion específica: si no lanza, pasa.
    expect(true).toBe(true);
  });
});
