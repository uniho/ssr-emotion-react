// astro-integration.js

import react from '@vitejs/plugin-react';

export default function() {
  return {
    name: 'ssr-emotion-react',
    hooks: {
      'astro:config:setup': ({ addRenderer, updateConfig, config }) => {
        addRenderer({
          name: 'ssr-emotion-react',
          serverEntrypoint: 'ssr-emotion-react/astro/render',
          clientEntrypoint: 'ssr-emotion-react/astro/client',
        });

        const hasReact = config.vite?.plugins?.some(
          (p) => p && (p.name === 'vite:react-babel' || p.name === 'vite:react-jsx')
        );

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