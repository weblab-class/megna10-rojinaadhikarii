import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import path from 'path';


export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },

  root: path.resolve(__dirname, 'client'),
  build: {
    outDir: path.resolve(__dirname, 'client/dist'),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});