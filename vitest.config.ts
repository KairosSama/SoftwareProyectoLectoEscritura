import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react() as any],
  server: {
    proxy: { '/api': { target: 'http://localhost:8787', changeOrigin: true } }
  }
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    include: [
      'src/**/__tests__/**/*.{ts,tsx}',
      'src/**/*.{test,spec}.{ts,tsx}'
    ],
    passWithNoTests: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 75,
        statements: 75,
        functions: 65,
        branches: 75
      },
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        'vitest.setup.ts',
        'vite.config.ts',
        'vitest.config.ts',
        'tailwind.config.js',
        'postcss.config.js',
        'eslint.config.js',
        'src/vite-env.d.ts',
        'src/lib/assessmentData.ts',
        'src/pages/Reports2.tsx',
        'api/**',
        'src/pages/AllAssessments.tsx',
        'src/pages/AssessmentDetail.tsx',
        'src/pages/AssessmentForm.tsx',
        'src/pages/Assessments.tsx',
        'src/pages/Dashboard.tsx',
        'src/pages/Documents.tsx',
        'src/pages/LectoescrituraModule.tsx',
        'src/pages/LoginPage.tsx',
        'src/pages/MatematicaModule.tsx',
        'src/pages/Profile.tsx',
        'src/pages/StudentDetail.tsx',
        'src/pages/Students.tsx'
      ]
    }
  },
});
