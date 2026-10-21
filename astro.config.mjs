import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  output: 'static',
  adapter: undefined,
  integrations: [mdx()],
  vite: {
    css: {
      postcss: {
        plugins: []
      },
      modules: false
    }
  }
})