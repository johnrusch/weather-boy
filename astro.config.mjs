import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import clerk from '@clerk/astro';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), tailwind(), clerk()],
  adapter: node({ mode: 'standalone' }),
  output: 'server',
});