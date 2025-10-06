import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Cast plugin to any to avoid dual Vite type mismatch when Vitest brings its own vite dep tree
  plugins: [react() as any],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('http://localhost:54321'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('test-anon-key'),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    include: [
      'src/**/*.test.{ts,tsx}',
      'src/**/__tests__/**/*.{ts,tsx}'
    ],
  pool: 'forks', // Ejecuta en procesos fork en lugar de workers de threads para mayor estabilidad jsdom
  isolate: false, // Simplifica el contexto global mientras estabilizamos CI
    passWithNoTests: false,
  },
});
