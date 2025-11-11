import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins: PluginOption[] = [react() as PluginOption];

  if (mode === 'analyze') {
    plugins.push(
      visualizer({
        filename: 'dist/stats.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
      }) as unknown as PluginOption
    );
  }

  return {
    plugins,
    optimizeDeps: { exclude: ['lucide-react'] },

    // 👇 Proxy para desarrollo: el front llama a /api y Vite redirige al server local
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true
          // si necesitas ver las cabeceras, puedes habilitar:
          // , configure: (proxy) => {
          //   proxy.on('proxyReq', (proxyReq) => {
          //     console.log('[proxy] →', proxyReq.method, proxyReq.path);
          //   });
          // }
        }
      }
      // overlay por defecto (muestra errores en pantalla). No lo desactives mientras depuras:
      // hmr: { overlay: true }
    }
  };
});
