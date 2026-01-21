// astro-integration.js

import react from '@vitejs/plugin-react';

export default function() {
  return {
    name: 'ssr-emotion-react',
    hooks: {
      'astro:config:setup': ({ addRenderer, updateConfig, injectScript, config, command }) => {
        addRenderer({
          name: 'ssr-emotion-react',
          serverEntrypoint: 'ssr-emotion-react/astro/render',
          clientEntrypoint: 'ssr-emotion-react/astro/client',
        });

        const hasReact = config.vite?.plugins?.some(
          (p) => p && (p.name === 'vite:react-babel' || p.name === 'vite:react-jsx')
        ) || config.integrations?.some(
          (i) => i.name === '@astrojs/react'
        );

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
    },
  };
}