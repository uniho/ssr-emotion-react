// astro-integration.js

import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
            try {
              const require = createRequire(fileURLToPath(new URL('./package.json', config.root)));
              const reactPath = require.resolve('@astrojs/react');
              const react = (await import(pathToFileURL(reactPath).href)).default;
              updateConfig({
                integrations: [react()]
              });
            } catch (err) {
              if (err.code === 'MODULE_NOT_FOUND') {
                logger.error('\n[ssr-emotion-react] ❌ @astrojs/react is not installed.\nThis integration requires @astrojs/react to function correctly.\nPlease install it: npm install @astrojs/react\n');
              } else {
                logger.error('\n[ssr-emotion-react] ❌ @astrojs/react is installed but failed to load automatically.\nPlease add the react() integration to your astro.config manually.\n');
              }
              return;
            }
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

      'astro:build:done': async (options) => {
        if (saveConfig) await buildDone(options, saveConfig);
      },
    },
  };
}