import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Example app Vite + Svelte
export default defineConfig({
  // Needed for GitHub Pages project sites (https://<user>.github.io/<repo>/)
  base: '/starfield/',
  plugins: [svelte()],
});
