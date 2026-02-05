// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path'

const main = resolve(__dirname, './index.html')
export default defineConfig({
  plugins: [ react() ],
  base: './',
  build: {
    minify: false,
    chunkSizeWarningLimit: 1000,
    outDir: resolve(__dirname, 'build'), // Optional: Keep the default CRA build folder name
    rollupOptions: {
	    input: {
		    main: main,
	    }
    }
  },
});
