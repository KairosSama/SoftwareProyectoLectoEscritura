import React from 'react';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { render, RenderOptions, act } from '@testing-library/react';

export async function renderWithRouter(ui: React.ReactElement, routerProps: MemoryRouterProps = { initialEntries: ['/'] }, options?: RenderOptions) {
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(<MemoryRouter {...routerProps}>{ui}</MemoryRouter>, options);
    // Esperar a que microtasks de router/auth se resuelvan
    await Promise.resolve();
  });
  // @ts-expect-error result is assigned inside act
  return result;
}
