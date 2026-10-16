import { build } from 'esbuild';

await build({
  entryPoints: ['src/main.js'],
  outfile: 'netsuite-admin-toolkit.user.js',
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  minify: true,
  loader: { '.css': 'text' },
  banner: {
    js: `// ==UserScript==
// @name         NetSuite Admin and Developer Toolkit
// @namespace    https://github.com/JustTanwa/netsuite-integration-log-viewer
// @version      1.2.0
// @description  A browser console for SuiteQL, SuiteScript, and integration log inspection.
// @match        https://*.netsuite.com/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==
// CodeMirror is MIT-licensed; see THIRD_PARTY_LICENSES.md.`
  },
  footer: {
    js: `/* CodeMirror 5
Copyright (C) 2017 by Marijn Haverbeke and others

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/`
  },
  legalComments: 'none'
});
