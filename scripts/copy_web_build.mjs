import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');
const rootAssets = path.join(root, 'assets');

function copyFile(fileName) {
  fs.copyFileSync(path.join(dist, fileName), path.join(root, fileName));
}

function copyMatching(pattern) {
  for (const fileName of fs.readdirSync(dist)) {
    if (pattern.test(fileName)) copyFile(fileName);
  }
}

if (!fs.existsSync(path.join(dist, 'app.html'))) {
  throw new Error('dist/app.html is missing. Run vite build before copying web assets.');
}

fs.copyFileSync(path.join(dist, 'app.html'), path.join(dist, 'index.html'));
fs.mkdirSync(path.join(dist, 'server'), { recursive: true });
fs.writeFileSync(
  path.join(dist, 'server', 'index.js'),
  `export default {\n  async fetch(request, env) {\n    const response = await env.ASSETS.fetch(request);\n    if (response.status !== 404) return response;\n    return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));\n  }\n};\n`,
);
copyFile('index.html');

fs.rmSync(rootAssets, { recursive: true, force: true });
fs.mkdirSync(rootAssets, { recursive: true });
fs.cpSync(path.join(dist, 'assets'), rootAssets, { recursive: true });

for (const fileName of ['manifest.webmanifest', 'sw.js', 'favicon.ico', 'privacy.html', 'terms.html']) {
  copyFile(fileName);
}

copyMatching(/\.(png|svg)$/);

// Sites serves static files from the Cloudflare client output directory.
const clientDir = path.join(dist, 'client');
fs.rmSync(clientDir, { recursive: true, force: true });
fs.mkdirSync(clientDir, { recursive: true });
for (const entry of fs.readdirSync(dist, { withFileTypes: true })) {
  if (entry.name === 'client' || entry.name === 'server') continue;
  const source = path.join(dist, entry.name);
  const destination = path.join(clientDir, entry.name);
  if (entry.isDirectory()) fs.cpSync(source, destination, { recursive: true });
  else fs.copyFileSync(source, destination);
}

console.log('Copied fresh GitHub Pages build assets.');
