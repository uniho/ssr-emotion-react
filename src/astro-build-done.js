// astro-build-done.js

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Window } from 'happy-dom';
import pc from 'picocolors';

const getAllHtmlFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllHtmlFiles(fullPath, arrayOfFiles);
    } else if (fullPath.endsWith('.html')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
};

export default async ({ dir, logger }, config) => {
  const outDir = fileURLToPath(dir);
  const assetsDir = config.build?.assets || '_astro';
  let count = 0;

  const htmlFiles = getAllHtmlFiles(outDir);

  for (const htmlPath of htmlFiles) {
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

    const hash = crypto.createHash('md5').update(combinedCss).digest('hex').slice(0, 10);
    const fileName = `${assetsDir}/ssremo.${hash}.css`;
    const finalPath = path.join(outDir, fileName);

    if (!fs.existsSync(path.dirname(finalPath))) {
      fs.mkdirSync(path.dirname(finalPath), { recursive: true });
    }
    fs.writeFileSync(finalPath, combinedCss);

    styleTags.forEach(tag => tag.remove());
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/${config.base}/${fileName}`.replace(/\/+/g, '/');
    document.head.appendChild(link);

    logger.info(`Link ${pc.cyan(fileName)} from ${pc.magenta(path.relative(outDir, htmlPath))}`);
    count++;

    fs.writeFileSync(htmlPath, '<!DOCTYPE html>\n' + document.documentElement.outerHTML);
  }

  if (count) console.log('');
}      
