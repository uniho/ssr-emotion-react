// astro-client.js

import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

export default (element) => {
  return (Component, props, slots) => {
    const cache = document.createElement('div');
    const root = createRoot(cache);

    flushSync(() => {
      root.render(React.createElement(Component, props));
    });

    queueMicrotask(() => {
      if (cache.childNodes.length > 0) {
        element.replaceChildren(...Array.from(cache.childNodes));
      }
    });
  };
};
