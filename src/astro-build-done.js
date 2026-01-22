// astro-build-done.js

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Window } from 'happy-dom';

export default async ({ dir, pages }, config) => {
  const outDir = fileURLToPath(dir);
  const assetsDir = config.build?.assets || '_astro';
  const base = config.base === '/' ? '' : config.base;
  let count = 0;

  for (const page of pages) {
    let htmlPath = path.join(outDir, page.pathname, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      const fallbackPath = path.join(outDir, page.pathname + '.html');
      if (!fs.existsSync(fallbackPath)) continue;
      htmlPath = fallbackPath;
    }

    const rawHtml = fs.readFileSync(htmlPath, 'utf-8');
    const window = new Window();
    const document = window.document;
    document.write(rawHtml);

    const styleTags = document.body.querySelectorAll('style[data-ssr-emotion]');
    
    if (!styleTags.length) continue;
    
    const combinedCss = Array.from(styleTags)
      .map(tag => tag.textContent)
      .join('\n')
      .trim();

    if (!combinedCss) continue;

    const randomId = crypto.randomBytes(4).toString('hex');
    const fileName = `${assetsDir}/ssremo.${randomId}.css`;
    const finalPath = path.join(outDir, fileName);

    if (!fs.existsSync(path.dirname(finalPath))) {
      fs.mkdirSync(path.dirname(finalPath), { recursive: true });
    }
    fs.writeFileSync(finalPath, combinedCss);

    styleTags.forEach(tag => tag.remove());
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${base}/${fileName}`;
    document.head.appendChild(link);

    console.log(`[SSR Emotion] ${link.href}`);
    count++;

    fs.writeFileSync(htmlPath, '<!DOCTYPE html>\n' + document.documentElement.outerHTML);
  }

  if (count) console.log('');
}      
