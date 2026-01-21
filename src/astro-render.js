// astro-render.js

import React from 'react';
import { renderToString } from 'react-dom/server';
import { extractCritical } from '@emotion/server';

export default {
  name: 'ssr-emotion',
  check(Component) {
    return typeof Component === 'function' || (Component && Component.$$typeof);
  },
  async renderToStaticMarkup(Component, props, slots) {
    const children = slots?.default 
      ? React.createElement('div', { 
          style: { display: 'contents' }, 
          dangerouslySetInnerHTML: { __html: slots.default } 
        })
      : null;

    const html = renderToString(React.createElement(Component, props, children));
    const { ids, css } = extractCritical(html);

    const styleTag = `<style data-emotion="css ${ids.join(' ')}">${css}</style>`;

    return {
      html: `${styleTag}${html}`,
    };
  },
};
