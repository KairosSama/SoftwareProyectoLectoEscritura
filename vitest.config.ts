import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react() as any],
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
        // Dependencias y build outputs
        '**/node_modules/**',
        '**/dist/**',
        // Archivos de configuración / tooling
        'vitest.setup.ts',
        'vite.config.ts',
        'vitest.config.ts',
        'tailwind.config.js',
        'postcss.config.js',
        'eslint.config.js',
        // Tipos / env d.ts
        'src/vite-env.d.ts',
        // Data estática masiva o legacy no sujeta hoy a tests
        'src/lib/assessmentData.ts',
        'src/pages/Reports2.tsx',
        // Endpoints serverless (sin tests unit en esta fase)
        'api/**',
        // Páginas aún sin plan de pruebas (dejar sólo Reports.tsx cubierta)
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
