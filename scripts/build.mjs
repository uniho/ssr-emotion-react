import esbuild from 'esbuild'
import { builtinModules } from 'node:module';

// Server-side specific files (Node.js)
await esbuild.build({
  entryPoints: [
    "./src/astro-render.js",
    "./src/astro-integration.js",
  ],
  outdir: 'dist',
  bundle: true,
  splitting: true,
  format: 'esm',
  platform: 'node',
  target: 'es2020',
  sourcemap: false,
  minify: true,
  external: [
    ...builtinModules,
    ...builtinModules.map(m => `node:${m}`),
    'lightningcss',
    '@vitejs/plugin-react',
    'react',
    'react-dom/server',
    '@emotion/css',
    '@emotion/server',
    'astro',
    'vite'
  ],
  banner: {
    js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
  },
})

// Client-side / Shared files (Neutral)
await esbuild.build({
  entryPoints: [
    "./src/astro-client.js",
  ],
  outdir: 'dist',
  bundle: true,
  splitting: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2020',
  sourcemap: false,
  minify: true,
  external: [
    ...builtinModules,
    ...builtinModules.map(m => `node:${m}`),
    'lightningcss',
    '@vitejs/plugin-react',
    'react',
    'react-dom',
    'react-dom/client'
  ],
})

console.log('✅ build complete')
