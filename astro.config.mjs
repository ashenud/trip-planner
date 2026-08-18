// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://ashenud.github.io',
  base: '/trip-planner',
  vite: {
    plugins: [tailwindcss()],
  },
});
