const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

let pw;
try {
  pw = require('playwright');
} catch {
  pw = require(
    process.env.PLAYWRIGHT_PATH ||
      '/home/hungj2020/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
  );
}

const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0];
  const file = path.join(root, 'dist', decodeURIComponent(urlPath));
  try {
    const ext = path.extname(file);
    res.setHeader(
      'Content-Type',
      {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml'
      }[ext] || 'application/octet-stream'
    );
    res.end(fs.readFileSync(file));
  } catch {
    res.writeHead(404).end();
  }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const browser = await pw.chromium.launch({
    executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  for (const name of ['index', 'studio', 'booking']) {
    await page.goto(`${url}/${name}.html`);
    await page.locator('h1').waitFor();
    const rootHtml = await page.locator('#root').innerHTML();
    const distPath = path.join(root, 'dist', `${name}.html`);
    let raw = fs.readFileSync(distPath, 'utf8').replace(/\s*\/>/g, '>');
    raw = raw.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${rootHtml}</div>`);
    fs.writeFileSync(distPath, raw, 'utf8');
  }
  await browser.close();
  server.close();
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
