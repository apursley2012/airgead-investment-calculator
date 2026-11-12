/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: site.test.mjs Verifies that the actual static website pages and   |
  |          source modules contain all repository-relative resources required |
  |          for deployment.                                                   |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = fileURLToPath(new URL('../', import.meta.url));

async function walk(folder, extension) {
  const files = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(path, extension));
    } else if (entry.isFile() && extname(path) === extension) {
      files.push(path);
    }
  }
  return files;
}

async function fileExists(file) {
  try {
    return (await stat(file)).isFile();
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

test('every static page has a reachable local navigation and resource graph', async () => {
  const pages = await walk(siteRoot, '.html');
  assert.equal(pages.length, 17, 'Expected 17 HTML pages, including the deployment-root 404 and legal notices');

  for (const page of pages) {
    const html = await readFile(page, 'utf8');
    assert.match(html, /<main\b/i, `${page} must have main content`);
    assert.match(html, /<script\b[^>]+type="module"/i,
      `${page} must load browser-ready JavaScript`);
    const references = [...html.matchAll(
      /<(?:a|img|link|script)\b[^>]*?\b(?:href|src)="([^"]+)"/gi
    )];
    for (const [, reference] of references) {
      if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(reference)) continue;
      const path = reference.split(/[?#]/, 1)[0];
      if (!path) continue;
      assert.ok(!path.startsWith('/'),
        `${page}: root-absolute resource breaks repository subpaths: ${reference}`);
      const resolved = resolve(dirname(page), decodeURIComponent(path));
      const fromRoot = relative(siteRoot, resolved);
      assert.ok(fromRoot !== '..' && !fromRoot.startsWith(`..${sep}`) && !isAbsolute(fromRoot),
        `${page}: path escapes static publishing root: ${reference}`);
      assert.equal(await fileExists(resolved), true,
        `${page}: missing referenced file ${reference}`);
    }
  }
});

test('relative JavaScript imports resolve to existing, browser-ready modules', async () => {
  const modules = await walk(join(siteRoot, 'js'), '.js');
  assert.ok(modules.length >= 10, 'Expected reusable JavaScript modules');
  for (const modulePath of modules) {
    const source = await readFile(modulePath, 'utf8');
    const imports = [...source.matchAll(
      /\b(?:import|export)\s+(?:[^'"]+?\s+from\s+)?['"](\.[^'"]+)['"]/g
    )];
    for (const [, reference] of imports) {
      assert.equal(await fileExists(resolve(dirname(modulePath), reference)), true,
        `${modulePath}: missing import ${reference}`);
    }
  }
});

test('CSS resource references and page-owned stylesheet paths resolve', async () => {
  const stylesheets = await walk(join(siteRoot, 'css'), '.css');
  assert.ok(stylesheets.length >= 2, 'Expected shared and page-specific CSS');
  for (const cssFile of stylesheets) {
    const source = await readFile(cssFile, 'utf8');
    const urls = [...source.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)];
    for (const [, url] of urls) {
      if (/^(?:https?:|data:|\/\/)/i.test(url)) continue;
      assert.equal(await fileExists(resolve(dirname(cssFile), url)), true,
        `${cssFile}: missing CSS resource ${url}`);
    }
  }
});


test('shared navigation and footer resolve every control link at root and nested paths', async () => {
  const { navigationMarkup } = await import('../js/components/navigation.js');
  const { footerMarkup } = await import('../js/components/footer.js');

  for (const root of ['', '../']) {
    const generated = navigationMarkup(root, 'calculator.html') + footerMarkup(root);
    const hrefs = [...generated.matchAll(/\bhref="([^"]+)"/g)].map(match => match[1]);
    assert.ok(hrefs.length >= 12, 'Expected complete reusable navigation and footer links');
    for (const href of hrefs) {
      if (href.startsWith('#')) {
        assert.equal(href, '#main-content', 'Skip link must target the page landmark');
        continue;
      }
      const fromPage = root === '' ? join(siteRoot, 'index.html') :
        join(siteRoot, 'pages', 'calculator.html');
      assert.equal(await fileExists(resolve(dirname(fromPage), href)), true,
        `Shared control points to a missing page: ${href}`);
    }
    assert.equal(
      (generated.match(/aria-current="page"/g) || []).length,
      2,
      'Current-page state should be present in both desktop and mobile navigation'
    );
  }
});

test('source paths have no case-only duplicates or stale backup variants', async () => {
  const files = [];
  async function collect(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = join(folder, entry.name);
      if (entry.isDirectory()) await collect(path);
      else if (entry.isFile()) files.push(relative(siteRoot, path));
    }
  }
  await collect(siteRoot);
  const seen = new Map();
  for (const filename of files) {
    const normalized = filename.toLowerCase();
    assert.ok(!seen.has(normalized),
      `Files differ only by case: ${seen.get(normalized)} and ${filename}`);
    seen.set(normalized, filename);
    assert.doesNotMatch(filename, /(?:-old|-copy|\.bak|\.orig|~)$/i,
      `Unexpected backup file in complete source: ${filename}`);
  }
});

test('custom 404 page discovers the publishing root even for nested missing URLs', async () => {
  const html = await readFile(join(siteRoot, '404.html'), 'utf8');
  assert.match(html, /<meta name="robots" content="noindex"/);
  assert.match(html, /data-not-found="true"/);
  assert.match(html, /id="home-link"/);
  assert.match(html, /id="calculator-link"/);

  const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
  const style = html.match(/<style>([\s\S]*?)<\/style>/)?.[1];
  assert.ok(script && style, 'The fallback must work without external assets');
  for (const [source, directive] of [
    [script, 'script-src'],
    [style, 'style-src']
  ]) {
    const hash = createHash('sha256').update(source).digest('base64');
    assert.ok(html.includes(`sha256-${hash}`), `${directive} needs a matching CSP hash`);
  }

  // Replace only the dynamic module import with an observable assignment.
  // The rest of the real 404 bootstrap is executed with mocked HEAD requests.
  const bootstrap = script.replace(
    /await import\(new URL\(['"]js\/components\/shell\.js['"], siteRoot\)\.href\);/,
    'document.loadedShell = new URL("js/components/shell.js", siteRoot).href;'
  );
  assert.notEqual(bootstrap, script);

  const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
  for (const [path, expectedRoot] of [
    ['/portfolio/pages/not-a-real-page', '/portfolio/'],
    ['/portfolio/missing', '/portfolio/'],
    ['/missing/deep/page', '/']
  ]) {
    const elements = { 'home-link': {}, 'calculator-link': {} };
    const stylesheets = [];
    const document = {
      getElementById(id) { return elements[id]; },
      createElement() { return {}; },
      head: { append(element) { stylesheets.push(element.href); } }
    };
    const location = new URL(`https://example.test${path}`);
    const fetch = async url => ({
      ok: new URL(url).pathname === `${expectedRoot}css/shared.css`
    });
    await new AsyncFunction('location', 'fetch', 'document', 'URL', bootstrap)(
      location, fetch, document, URL
    );
    assert.equal(elements['home-link'].href,
      `https://example.test${expectedRoot}index.html`);
    assert.equal(elements['calculator-link'].href,
      `https://example.test${expectedRoot}pages/calculator.html`);
    assert.equal(document.loadedShell,
      `https://example.test${expectedRoot}js/components/shell.js`);
    assert.equal(stylesheets.length, 2);
  }
});

test('GitHub portfolio documentation links resolve and public legal pages are included', async () => {
  const sourceRoot = resolve(siteRoot, '..');
  const documents = [
    join(sourceRoot, 'Original', 'README.md'),
    join(siteRoot, 'README.md'),
    join(siteRoot, 'THIRD_PARTY_NOTICES.md')
  ];

  for (const documentPath of documents) {
    const markdown = await readFile(documentPath, 'utf8');
    for (const [, reference] of markdown.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
      if (/^(?:https?:|mailto:|#)/.test(reference)) continue;
      const target = resolve(dirname(documentPath), decodeURIComponent(reference.split('#')[0]));
      assert.ok(await fileExists(target), `Missing Markdown reference: ${reference} in ${documentPath}`);
    }
  }

  for (const name of ['privacy', 'terms', 'disclaimer', 'accessibility']) {
    assert.ok(
      await fileExists(join(siteRoot, 'pages', `${name}.html`)),
      `Missing public-facing ${name} page`
    );
  }

  for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.md', '404.html']) {
    assert.ok(await fileExists(join(siteRoot, name)), `Missing website document: ${name}`);
  }
  assert.ok(await fileExists(join(sourceRoot, 'Original', 'LICENSE')));
});
