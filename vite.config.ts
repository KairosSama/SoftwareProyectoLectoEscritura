import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins: PluginOption[] = [react() as PluginOption];
  if (mode === 'analyze') {
    plugins.push(visualizer({ filename: 'dist/stats.html', template: 'treemap', gzipSize: true, brotliSize: true }) as unknown as PluginOption);
  }
  return {
    plugins: plugins as PluginOption[],
    optimizeDeps: { exclude: ['lucide-react'] },
  };
});
