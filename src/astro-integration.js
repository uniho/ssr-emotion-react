// astro-integration.js

import buildDone from './astro-build-done.js';

export default function() {
  
  let saveConfig = null;
  
  return {
    name: 'ssr-emotion-react',
    hooks: {
      'astro:config:setup': async ({ addRenderer, updateConfig, config, logger }) => {
        const reactIntegration = config.integrations?.find(
          (i) => i.name === '@astrojs/react'
        );

        if (!reactIntegration) {
          try {
            const react = (await import('@astrojs/react')).default;
            updateConfig({
              integrations: [react()]
            });
          } catch (e) {
            logger.error('\n[ssr-emotion-react] ❌ @astrojs/react is not installed.\nThis integration requires @astrojs/react to function correctly.\nPlease install it: npm install @astrojs/react\n');
            return;
          }
        } else {
          const selfIndex = config.integrations.findIndex((i) => i.name === 'ssr-emotion-react');
          const reactIndex = config.integrations.indexOf(reactIntegration);
          if (selfIndex !== -1 && reactIndex !== -1 && reactIndex < selfIndex) {
            logger.warn('\n[ssr-emotion-react] ⚠️  @astrojs/react detected before ssr-emotion-react.\nEmotion CSS extraction will NOT work because @astrojs/react takes precedence for rendering.\nPlease move ssr-emotion-react BEFORE @astrojs/react in your astro.config integrations.\n');
          }
        }

        addRenderer({
          name: 'ssr-emotion-react',
          serverEntrypoint: 'ssr-emotion-react/astro/render',
          clientEntrypoint: 'ssr-emotion-react/astro/client',
        });

        saveConfig = config;

        updateConfig({
          vite: {
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