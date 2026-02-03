// astro-integration.js

import react from '@vitejs/plugin-react';
import buildDone from './astro-build-done.js';

export default function() {
  
  let saveConfig = null;
  
  return {
    name: 'ssr-emotion-react',
    hooks: {
      'astro:config:setup': ({ addRenderer, updateConfig, injectScript, config, command, logger }) => {
        addRenderer({
          name: 'ssr-emotion-react',
          serverEntrypoint: 'ssr-emotion-react/astro/render',
          clientEntrypoint: 'ssr-emotion-react/astro/client',
        });

        saveConfig = config;

        const reactIntegration = config.integrations?.find(
          (i) => i.name === '@astrojs/react'
        );

        if (reactIntegration) {
          const selfIndex = config.integrations.findIndex((i) => i.name === 'ssr-emotion-react');
          const reactIndex = config.integrations.indexOf(reactIntegration);

          if (selfIndex !== -1 && reactIndex !== -1 && reactIndex < selfIndex) {
            logger.warn('\n[ssr-emotion-react] ⚠️  @astrojs/react detected before ssr-emotion-react.\nEmotion CSS extraction will NOT work because @astrojs/react takes precedence for rendering.\nPlease move ssr-emotion-react BEFORE @astrojs/react in your astro.config integrations.\n');
          }
        }

        const hasReact = config.vite?.plugins?.some(
          (p) => p && (p.name === 'vite:react-babel' || p.name === 'vite:react-jsx')
        ) || !!reactIntegration;

        if (command === 'dev' && !hasReact) {
          injectScript('before-hydration', `
            window.$RefreshReg$ = window.$RefreshReg$ || (() => {});
            window.$RefreshSig$ = window.$RefreshSig$ || (() => (type) => type);
          `);
        }

        updateConfig({
          vite: {
            plugins: hasReact ? [] : [react()],
            ssr: {
              external: ['@emotion/css', '@emotion/server']
            }
          },
        });
      },

      'astro:build:done': async (options) => await buildDone(options, saveConfig),
    },
  };
}