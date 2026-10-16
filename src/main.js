import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import codemirrorCss from 'codemirror/lib/codemirror.css';

(function () {
  'use strict';

  const ROOT_ID = 'ns-admin-toolkit-root';
  if (document.getElementById(ROOT_ID)) return;
  const root = document.createElement('div');
  root.id = ROOT_ID;
  if (!root.isConnected) document.body.appendChild(root);
  const shadow = root.shadowRoot || root.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      ${codemirrorCss}
      :host {
        all: initial;
        --background: #f8fafc;
        --foreground: #0f172a;
        --muted: #64748b;
        --muted-background: #f1f5f9;
        --border: #e2e8f0;
        --input: #cbd5e1;
        --primary: #0f172a;
        --primary-foreground: #f8fafc;
        --accent: #f1f5f9;
        --ring: #94a3b8;
        color: var(--foreground);
        font: 14px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color-scheme: light;
      }
      *, *::before, *::after { box-sizing: border-box; }
      button, input, select, textarea { font: inherit; }
      button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
      .nsa-backdrop { position: fixed; inset: 0; z-index: 2147483000; display: none; align-items: center; justify-content: center; padding: 24px; background: rgba(2, 6, 23, .56); backdrop-filter: blur(3px); }
      .nsa-backdrop.open { display: flex; }
      .nsa-shell { width: min(1480px, 97vw); height: min(920px, 94vh); min-height: 540px; display: flex; overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--background); box-shadow: 0 24px 80px rgba(2, 6, 23, .24); }
      .nsa-sidebar { width: 236px; flex: 0 0 236px; display: flex; flex-direction: column; padding: 24px 16px; border-right: 1px solid var(--border); background: #fff; }
      .nsa-brand { margin: 0 8px 3px; color: var(--foreground); font-size: 14px; font-weight: 650; letter-spacing: -.025em; }
      .nsa-caption { margin: 0 8px 28px; color: var(--muted); font-size: 11px; }
      .nsa-nav { display: grid; gap: 4px; }
      .nsa-nav button { width: 100%; border: 1px solid transparent; border-radius: 6px; padding: 8px 10px; color: #475569; background: transparent; text-align: left; cursor: pointer; font: 500 13px/1.4 Inter, ui-sans-serif, system-ui, sans-serif; transition: background .15s, color .15s, border-color .15s; }
      .nsa-nav button:hover { color: var(--foreground); background: var(--accent); }
      .nsa-nav button.active { border-color: var(--border); color: var(--foreground); background: #f8fafc; box-shadow: 0 1px 2px rgba(15, 23, 42, .04); }
      .nsa-shortcut { margin: auto 8px 0; color: var(--muted); font-size: 11px; }
      .nsa-shortcut kbd { border: 1px solid var(--border); border-radius: 4px; padding: 2px 5px; color: #475569; background: #fff; font: 10px ui-monospace, SFMono-Regular, Consolas, monospace; }
      .nsa-main { min-width: 0; flex: 1; display: flex; flex-direction: column; overflow: hidden; }
      .nsa-topbar { min-height: 64px; display: flex; align-items: center; gap: 12px; padding: 0 28px; border-bottom: 1px solid var(--border); background: #fff; }
      .nsa-topbar h1 { flex: 1; margin: 0; color: var(--foreground); font-size: 16px; font-weight: 600; letter-spacing: -.02em; }
      .nsa-content { min-height: 0; flex: 1; overflow: auto; padding: 28px; }
      .nsa-view { display: none; }
      .nsa-view.active { display: block; }
      .nsa-card { margin-bottom: 18px; border: 1px solid var(--border); border-radius: 8px; background: #fff; box-shadow: 0 1px 2px rgba(15, 23, 42, .035); }
      .nsa-card-head { display: flex; align-items: center; gap: 10px; min-height: 54px; padding: 14px 18px; border-bottom: 1px solid var(--border); }
      .nsa-card-head h2 { margin: 0; color: var(--foreground); font-size: 13px; font-weight: 600; letter-spacing: -.01em; }
      .nsa-card-body { padding: 18px; }
      .nsa-muted { color: var(--muted); font-size: 12px; }
      .nsa-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; }
      .nsa-label { display: block; margin-bottom: 7px; color: #334155; font-size: 12px; font-weight: 500; }
      .nsa-input, .nsa-select, .nsa-query { width: 100%; border: 1px solid var(--input); border-radius: 6px; padding: 8px 10px; color: var(--foreground); background: #fff; font: inherit; outline: none; transition: border-color .15s, box-shadow .15s; }
      .nsa-input::placeholder, .nsa-query::placeholder { color: #94a3b8; }
      .nsa-input:focus, .nsa-select:focus, .nsa-query:focus { border-color: #94a3b8; box-shadow: 0 0 0 3px rgba(148, 163, 184, .2); }
      .nsa-input.compact { width: auto; min-width: 120px; }
      .nsa-select.compact { width: auto; min-width: 145px; }
      .nsa-query { min-height: 170px; resize: vertical; border-color: #d4dce7; background: #fbfcfe; font: 12px/1.65 ui-monospace, SFMono-Regular, Consolas, monospace; tab-size: 2; }
      .nsa-script-editor { min-height: 310px; overflow: hidden; border: 1px solid var(--input); border-radius: 6px; background: #fff; }
      .nsa-script-editor .CodeMirror { height: 310px; color: var(--foreground); background: #fff; font: 12px/1.6 ui-monospace, SFMono-Regular, Consolas, monospace; }
      .nsa-script-editor .CodeMirror-gutters { border-right: 1px solid var(--border); background: #f8fafc; }
      .nsa-script-editor .CodeMirror-linenumber { color: #94a3b8; }
      .nsa-script-editor .CodeMirror-cursor { border-left-color: #0f172a; }
      .nsa-script-editor .CodeMirror-selected { background: #e2e8f0; }
      .cm-s-default .cm-keyword { color: #7c3aed; }
      .cm-s-default .cm-atom { color: #b45309; }
      .cm-s-default .cm-number { color: #b45309; }
      .cm-s-default .cm-def { color: #1d4ed8; }
      .cm-s-default .cm-variable-2 { color: #0369a1; }
      .cm-s-default .cm-property { color: #0f766e; }
      .cm-s-default .cm-string { color: #15803d; }
      .cm-s-default .cm-comment { color: #64748b; font-style: italic; }
      .nsa-warning { margin: 0 0 14px; border: 1px solid #fcd34d; border-radius: 6px; padding: 10px 12px; color: #854d0e; background: #fffbeb; font-size: 12px; }
      .nsa-console-output { max-height: 230px; overflow: auto; margin: 0; padding: 12px; border-radius: 6px; color: #dbeafe; background: #0f172a; white-space: pre-wrap; overflow-wrap: anywhere; font: 12px/1.55 ui-monospace, SFMono-Regular, Consolas, monospace; }
      .nsa-output-empty { color: #94a3b8; }
      .nsa-palette-backdrop { position: fixed; inset: 0; z-index: 2147483001; display: none; align-items: flex-start; justify-content: center; padding: 15vh 20px 20px; background: rgba(2, 6, 23, .48); backdrop-filter: blur(3px); }
      .nsa-palette-backdrop.open { display: flex; }
      .nsa-palette { width: min(540px, 100%); overflow: hidden; border: 1px solid var(--border); border-radius: 9px; background: #fff; box-shadow: 0 24px 80px rgba(2, 6, 23, .24); }
      .nsa-palette-search { padding: 16px; border-bottom: 1px solid var(--border); }
      .nsa-palette-search .nsa-input { border: 0; padding: 3px 0; box-shadow: none; font-size: 14px; }
      .nsa-palette-items { display: grid; gap: 3px; padding: 7px; }
      .nsa-palette-item { display: flex; align-items: center; gap: 10px; border: 0; border-radius: 5px; padding: 10px; color: #334155; background: #fff; text-align: left; cursor: pointer; font: 13px Inter, ui-sans-serif, system-ui, sans-serif; }
      .nsa-palette-item:hover, .nsa-palette-item.active { color: var(--foreground); background: var(--accent); }
      .nsa-palette-item .nsa-muted { margin-left: auto; }
      .nsa-palette-footer { border-top: 1px solid var(--border); padding: 9px 13px; color: var(--muted); font-size: 11px; }
      .nsa-palette-footer kbd { border: 1px solid var(--border); border-radius: 4px; padding: 1px 4px; font: 10px ui-monospace, monospace; }
      .nsa-log-select { min-width: 250px !important; max-width: 360px; }
      .nsa-button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 34px; border: 1px solid var(--input); border-radius: 6px; padding: 6px 12px; color: var(--foreground); background: #fff; cursor: pointer; font: 500 12px/1.2 Inter, ui-sans-serif, system-ui, sans-serif; transition: background .15s, border-color .15s, box-shadow .15s; }
      .nsa-button:hover:not(:disabled) { border-color: #aeb9c8; background: var(--accent); }
      .nsa-button:disabled { cursor: not-allowed; opacity: .48; }
      .nsa-button.primary { border-color: var(--primary); color: var(--primary-foreground); background: var(--primary); }
      .nsa-button.primary:hover:not(:disabled) { border-color: #1e293b; background: #1e293b; }
      .nsa-button.ghost { border-color: transparent; background: transparent; }
      .nsa-query-actions { display: flex; align-items: center; gap: 10px; margin-top: 12px; }
      .nsa-query-actions .nsa-muted { margin-left: auto; }
      .nsa-status { margin-top: 12px; border: 1px solid var(--border); border-radius: 6px; padding: 9px 11px; color: #475569; background: var(--muted-background); font-size: 12px; white-space: pre-wrap; }
      .nsa-status:empty { display: none; }
      .nsa-status.error { border-color: #fecaca; color: #991b1b; background: #fef2f2; }
      .nsa-status.success { border-color: #bbf7d0; color: #166534; background: #f0fdf4; }
      .nsa-status.info { border-color: #bfdbfe; color: #1e40af; background: #eff6ff; }
      .nsa-result-meta { margin-left: auto; color: var(--muted); font-size: 11px; }
      .nsa-table-tools { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-bottom: 1px solid var(--border); }
      .nsa-filter { max-width: 330px; }
      .nsa-table-wrap { max-height: 52vh; overflow: auto; }
      .nsa-table { width: 100%; border-collapse: separate; border-spacing: 0; color: #334155; font-size: 12px; }
      .nsa-table th { position: sticky; top: 0; z-index: 1; padding: 0; border-bottom: 1px solid var(--border); background: #f8fafc; text-align: left; white-space: nowrap; }
      .nsa-sort { width: 100%; border: 0; padding: 10px 12px; color: #475569; background: transparent; text-align: left; font: 600 11px/1.4 Inter, ui-sans-serif, system-ui, sans-serif; cursor: pointer; }
      .nsa-sort:hover:not(:disabled) { color: var(--foreground); background: #f1f5f9; }
      .nsa-table td { max-width: 420px; padding: 10px 12px; border-bottom: 1px solid #edf1f5; vertical-align: top; overflow-wrap: anywhere; }
      .nsa-table tr:last-child td { border-bottom: 0; }
      .nsa-table tr:hover td { background: #fafbfc; }
      .nsa-empty { padding: 32px !important; color: var(--muted); text-align: center; }
      .nsa-badge { display: inline-block; border: 1px solid #bbf7d0; border-radius: 999px; padding: 2px 8px; color: #166534; background: #f0fdf4; font-size: 10px; font-weight: 550; }
      .nsa-badge.failed { border-color: #fecaca; color: #991b1b; background: #fef2f2; }
      .nsa-badge.other { border-color: #fde68a; color: #854d0e; background: #fefce8; }
      .nsa-detail-backdrop { position: fixed; inset: 0; z-index: 2; display: none; align-items: center; justify-content: center; padding: 24px; background: rgba(2, 6, 23, .45); backdrop-filter: blur(2px); }
      .nsa-detail-backdrop.open { display: flex; }
      .nsa-detail { width: min(1060px, 94%); max-height: 88%; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border); border-radius: 9px; background: #fff; box-shadow: 0 24px 80px rgba(2, 6, 23, .22); }
      .nsa-detail-head { display: flex; align-items: center; gap: 8px; min-height: 54px; padding: 10px 14px; border-bottom: 1px solid var(--border); }
      .nsa-detail-title { flex: 1; min-width: 0; color: var(--foreground); font-size: 12px; font-weight: 550; overflow-wrap: anywhere; }
      .nsa-detail-tabs { display: flex; gap: 6px; padding: 8px 14px 0; border-bottom: 1px solid var(--border); }
      .nsa-detail-tabs button { border: 0; border-bottom: 2px solid transparent; padding: 7px 10px; color: var(--muted); background: transparent; cursor: pointer; font: 500 12px/1.4 Inter, ui-sans-serif, system-ui, sans-serif; }
      .nsa-detail-tabs button.active { border-bottom-color: var(--foreground); color: var(--foreground); }
      .nsa-payload { min-height: 120px; margin: 0; padding: 16px; overflow: auto; color: #1e293b; background: #fbfcfe; white-space: pre-wrap; overflow-wrap: anywhere; font: 12px/1.6 ui-monospace, SFMono-Regular, Consolas, monospace; }
      .nsa-close { width: 32px; height: 32px; padding: 0; font-size: 20px; }
      @media (max-width: 760px) {
        .nsa-backdrop { padding: 0; }
        .nsa-shell { width: 100vw; height: 100dvh; min-height: 0; border: 0; border-radius: 0; }
        .nsa-sidebar { width: 170px; flex-basis: 170px; padding: 16px 9px; }
        .nsa-content { padding: 13px; }
        .nsa-topbar { padding: 0 14px; }
        .nsa-detail-backdrop { padding: 10px; }
        .nsa-detail { width: 100%; max-height: 95%; }
        .nsa-log-select { width: 100% !important; max-width: none; }
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
      }
    </style>
    <div class="nsa-backdrop" role="dialog" aria-modal="true" aria-label="NetSuite Admin and Developer Toolkit">
      <div class="nsa-shell">
        <aside class="nsa-sidebar">
          <div class="nsa-brand">NetSuite Toolkit</div>
          <div class="nsa-caption">Admin &amp; Developer Console</div>
          <nav class="nsa-nav" aria-label="Tools">
            <button type="button" data-tool="suiteql" class="active">SuiteQL Runner</button>
            <button type="button" data-tool="script">SuiteScript Runner</button>
            <button type="button" data-tool="logs">Integration Logs</button>
          </nav>
          <div class="nsa-shortcut">Console <kbd>Ctrl</kbd> + <kbd>/</kbd><br>Commands <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd></div>
        </aside>
        <main class="nsa-main">
          <header class="nsa-topbar">
            <h1 id="nsa-title">SuiteQL Runner</h1>
            <button type="button" class="nsa-button ghost nsa-close" data-close aria-label="Close toolkit">&times;</button>
          </header>
          <div class="nsa-content">
            <section class="nsa-view active" data-view="suiteql">
              <div class="nsa-card">
                <div class="nsa-card-head">
                  <h2>Run a SuiteQL query</h2>
                  <span class="nsa-result-meta">Uses the current NetSuite session</span>
                </div>
                <div class="nsa-card-body">
                  <label class="nsa-label" for="nsa-query">Query</label>
                  <textarea id="nsa-query" class="nsa-query" spellcheck="false" placeholder="SELECT id, tranid FROM transaction WHERE ROWNUM <= 10"></textarea>
                  <div class="nsa-query-actions">
                    <button type="button" class="nsa-button primary" id="nsa-run">Run query</button>
                    <span class="nsa-muted">Ctrl + Enter to run</span>
                  </div>
                  <div id="nsa-query-timing" class="nsa-muted" style="margin-top:8px;"></div>
                  <div class="nsa-muted" style="margin-top:8px;">Results are rendered locally; runSuiteQL returns up to 5,000 rows.</div>
                  <div id="nsa-query-status" class="nsa-status" role="status"></div>
                </div>
              </div>
              <div class="nsa-card">
                <div class="nsa-card-head">
                  <h2>Results</h2>
                  <span id="nsa-query-count" class="nsa-result-meta"></span>
                </div>
                <div id="nsa-query-results"></div>
              </div>
            </section>
            <section class="nsa-view" data-view="script">
              <div class="nsa-card">
                <div class="nsa-card-head">
                  <h2>Run SuiteScript</h2>
                  <span class="nsa-result-meta">Uses modules loaded by the current NetSuite session</span>
                </div>
                <div class="nsa-card-body">
                  <div class="nsa-warning">Code runs with your current NetSuite role and can read or change any data that role is permitted to access. Only run code you understand.</div>
                  <label class="nsa-label" for="nsa-script-source">JavaScript</label>
                  <div id="nsa-script-editor" class="nsa-script-editor"></div>
                  <div class="nsa-query-actions">
                    <button type="button" class="nsa-button primary" id="nsa-script-run">Run script</button>
                    <button type="button" class="nsa-button" id="nsa-script-clear">Clear output</button>
                    <span class="nsa-muted" id="nsa-script-timing"></span>
                  </div>
                  <div id="nsa-script-status" class="nsa-status" role="status"></div>
                </div>
              </div>
              <div class="nsa-card">
                <div class="nsa-card-head"><h2>Output</h2></div>
                <pre id="nsa-script-output" class="nsa-console-output"><span class="nsa-output-empty">Console output will appear here.</span></pre>
              </div>
            </section>
            <section class="nsa-view" data-view="logs">
              <div class="nsa-card">
                <div class="nsa-card-head">
                  <h2>Integration logs</h2>
                  <span class="nsa-result-meta">Browse SOAP and REST web services requests</span>
                </div>
                <div class="nsa-card-body">
                  <div class="nsa-toolbar">
                    <label class="nsa-label" for="nsa-log-type">Log type</label>
                    <select id="nsa-log-type" class="nsa-select compact">
                      <option value="soaplog">SOAP log</option>
                      <option value="restwslog">REST log</option>
                      <option value="restletlog">RESTlet log</option>
                    </select>
                    <label class="nsa-label" for="nsa-integration-id">Integration</label>
                    <select id="nsa-integration-id" class="nsa-select compact nsa-log-select" disabled>
                      <option value="">Loading integrations…</option>
                    </select>
                    <button type="button" class="nsa-button" id="nsa-refresh-integrations">Refresh list</button>
                    <button type="button" class="nsa-button primary" id="nsa-load-logs">Load logs</button>
                    <button type="button" class="nsa-button" id="nsa-prev" disabled>← Prev</button>
                    <button type="button" class="nsa-button" id="nsa-next" disabled>Next →</button>
                    <span id="nsa-log-page" class="nsa-result-meta"></span>
                  </div>
                  <div id="nsa-log-status" class="nsa-status" role="status"></div>
                </div>
                <div id="nsa-log-results"></div>
              </div>
            </section>
          </div>
        </main>
      </div>
      <div class="nsa-palette-backdrop" id="nsa-palette-backdrop" role="dialog" aria-modal="true" aria-label="NetSuite command menu">
        <div class="nsa-palette">
          <div class="nsa-palette-search">
            <input id="nsa-palette-filter" class="nsa-input" type="search" placeholder="Search commands…" aria-label="Search commands" autocomplete="off">
          </div>
          <div id="nsa-palette-items" class="nsa-palette-items"></div>
          <div class="nsa-palette-footer"><kbd>↑</kbd> <kbd>↓</kbd> navigate &nbsp; <kbd>Enter</kbd> select &nbsp; <kbd>Esc</kbd> close</div>
        </div>
      </div>
      <div class="nsa-detail-backdrop" id="nsa-detail-backdrop" role="dialog" aria-modal="true" aria-label="Integration log payload">
        <div class="nsa-detail">
          <div class="nsa-detail-head">
            <div class="nsa-detail-title" id="nsa-detail-title"></div>
            <button type="button" class="nsa-button" id="nsa-copy-payload">Copy</button>
            <button type="button" class="nsa-button" id="nsa-format-payload">Raw</button>
            <button type="button" class="nsa-button ghost nsa-close" id="nsa-detail-close" aria-label="Close payload">&times;</button>
          </div>
          <div class="nsa-detail-tabs" id="nsa-detail-tabs"></div>
          <pre class="nsa-payload" id="nsa-payload"></pre>
        </div>
      </div>
    </div>
  `;

  const $ = selector => shadow.querySelector(selector);
  const backdrop = $('.nsa-backdrop');
  const TOOL_LABELS = { suiteql: 'SuiteQL Runner', script: 'SuiteScript Runner', logs: 'Integration Logs' };

  const toolRegistry = {
    suiteql: { init: initSuiteQL },
    script: { init: initScriptRunner },
    logs: { init: initLogs }
  };

  let activeTool = 'suiteql';
  let logRows = [];
  let logPage = 0;
  let logType = 'soaplog';
  let logsLoading = false;
  let detailRow = null;
  let detailPayloads = { req: '', resp: '' };
  let detailTab = 'req';
  let prettyPayload = true;
  let queryRunning = false;
  let scriptEditor = null;
  let scriptRunning = false;
  let integrations = [];
  let integrationsPromise = null;
  let logColumns = [];
  let selectedCommand = null;
  let paletteSelection = 0;

  function setStatus(element, message, type) {
    element.textContent = message || '';
    element.className = 'nsa-status' + (type ? ' ' + type : '');
  }

  function switchTool(toolName) {
    if (!toolRegistry[toolName]) return;
    activeTool = toolName;
    shadow.querySelectorAll('[data-tool]').forEach(button => {
      button.classList.toggle('active', button.dataset.tool === toolName);
    });
    shadow.querySelectorAll('[data-view]').forEach(view => {
      view.classList.toggle('active', view.dataset.view === toolName);
    });
    $('#nsa-title').textContent = TOOL_LABELS[toolName];
    toolRegistry[toolName].init();
  }

  function setOpen(open) {
    backdrop.classList.toggle('open', open);
    if (open) {
      switchTool(activeTool);
      if (activeTool === 'suiteql') $('#nsa-query').focus();
      else if (activeTool === 'logs') $('#nsa-integration-id').focus();
      else if (scriptEditor) scriptEditor.focus();
    } else {
      $('#nsa-detail-backdrop').classList.remove('open');
    }
  }

  function makeStatusMessage(error) {
    if (error && error.message) return error.message;
    return String(error);
  }

  function toCellText(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  function renderDataTable(container, columns, rows, options) {
    const settings = options || {};
    container.replaceChildren();
    const tools = document.createElement('div');
    tools.className = 'nsa-table-tools';
    const filter = document.createElement('input');
    filter.type = 'search';
    filter.className = 'nsa-input nsa-filter';
    filter.placeholder = 'Filter results…';
    filter.setAttribute('aria-label', 'Filter table results');
    const count = document.createElement('span');
    count.className = 'nsa-result-meta';
    tools.append(filter, count);
    container.appendChild(tools);

    const wrap = document.createElement('div');
    wrap.className = 'nsa-table-wrap';
    const table = document.createElement('table');
    table.className = 'nsa-table';
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const tbody = document.createElement('tbody');
    table.append(thead, tbody);
    thead.appendChild(headerRow);
    wrap.appendChild(table);
    container.appendChild(wrap);

    let sortKey = '';
    let sortDirection = 1;
    let filterValue = '';

    columns.forEach(column => {
      const th = document.createElement('th');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nsa-sort';
      button.textContent = column.label;
      if (column.sortable !== false) {
        button.addEventListener('click', () => {
          if (sortKey === column.key) sortDirection *= -1;
          else {
            sortKey = column.key;
            sortDirection = 1;
          }
          renderRows();
        });
      } else {
        button.disabled = true;
        button.style.cursor = 'default';
      }
      th.appendChild(button);
      headerRow.appendChild(th);
    });

    function renderRows() {
      const normalizedFilter = filterValue.trim().toLocaleLowerCase();
      let visible = rows.filter(row => !normalizedFilter || columns.some(column =>
        toCellText(row[column.key]).toLocaleLowerCase().includes(normalizedFilter)));
      if (sortKey) {
        visible = visible.slice().sort((left, right) => {
          const a = toCellText(left[sortKey]);
          const b = toCellText(right[sortKey]);
          const an = Number(a);
          const bn = Number(b);
          const numeric = a.trim() !== '' && b.trim() !== '' && Number.isFinite(an) && Number.isFinite(bn);
          const result = numeric ? an - bn : a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
          return result * sortDirection;
        });
      }
      headerRow.querySelectorAll('button').forEach((button, index) => {
        const column = columns[index];
        button.textContent = column.label + (column.key === sortKey ? (sortDirection === 1 ? ' ↑' : ' ↓') : '');
      });
      count.textContent = visible.length + (visible.length === 1 ? ' row' : ' rows');
      tbody.replaceChildren();
      if (!visible.length) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = Math.max(columns.length, 1);
        td.className = 'nsa-empty';
        td.textContent = rows.length ? 'No rows match this filter.' : (settings.emptyMessage || 'No results to display.');
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }
      visible.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(column => {
          const td = document.createElement('td');
          if (column.render) column.render(td, row);
          else td.textContent = toCellText(row[column.key]) || '—';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }

    filter.addEventListener('input', () => {
      filterValue = filter.value;
      renderRows();
    });
    renderRows();
  }

  function loadNetSuiteModuleWith(requireLoader, loaderWindow, moduleId) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error('The NetSuite require() loader did not return ' + moduleId + ' within 10 seconds.'));
      }, 10000);
      const finish = (error, module) => {
        if (settled) return;
        if (error) {
          settled = true;
          window.clearTimeout(timer);
          reject(error instanceof Error ? error : new Error(String(error)));
          return;
        }
        if (!module) return;
        settled = true;
        window.clearTimeout(timer);
        resolve(module);
      };
      try {
        const returned = requireLoader.call(loaderWindow, [moduleId], module => finish(null, module), error => finish(error));
        if (returned && typeof returned.then === 'function') {
          returned.then(module => finish(null, module), error => finish(error));
        } else if (returned && typeof returned.runSuiteQL === 'function') {
          finish(null, returned);
        }
      } catch (arrayError) {
        try {
          const module = requireLoader.call(loaderWindow, moduleId);
          if (module) finish(null, module);
          else finish(arrayError);
        } catch (stringError) {
          finish(stringError);
        }
      }
    });
  }

  async function loadNetSuiteModule(moduleId) {
    const pageRequire = window.require;
    if (typeof pageRequire === 'function') {
      return loadNetSuiteModuleWith(pageRequire, window, moduleId);
    }
    const frameWindow = await getModuleFrameWindow();
    return loadNetSuiteModuleWith(frameWindow.require, frameWindow, moduleId);
  }

  let moduleFramePromise = null;

  function getModuleFrameWindow() {
    if (!moduleFramePromise) {
      moduleFramePromise = new Promise((resolve, reject) => {
        const frame = document.createElement('iframe');
        frame.title = 'NetSuite SuiteScript module loader';
        frame.setAttribute('aria-hidden', 'true');
        frame.tabIndex = -1;
        frame.style.cssText = 'position:fixed;width:1px;height:1px;left:-10000px;top:-10000px;border:0;visibility:hidden;';
        let settled = false;
        const finish = (error, frameWindow) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          frame.removeEventListener('load', onLoad);
          frame.removeEventListener('error', onError);
          if (error) {
            frame.remove();
            reject(error);
          } else {
            resolve(frameWindow);
          }
        };
        const onLoad = () => {
          try {
            const frameWindow = frame.contentWindow;
            if (!frameWindow || frameWindow.location.origin !== window.location.origin) {
              throw new Error('The NetSuite module-loader iframe did not remain on this account origin.');
            }
            if (typeof frameWindow.require !== 'function') {
              throw new Error('The user preferences page loaded, but did not expose require(). Check whether NetSuite blocked the iframe or redirected it.');
            }
            finish(null, frameWindow);
          } catch (error) {
            finish(error);
          }
        };
        const onError = () => finish(new Error('Unable to load the NetSuite user preferences page in a same-origin iframe.'));
        const timer = window.setTimeout(() => {
          finish(new Error('Timed out loading /app/center/userprefs.nl. NetSuite may block this page in an iframe.'));
        }, 20000);
        frame.addEventListener('load', onLoad);
        frame.addEventListener('error', onError);
        frame.src = '/app/center/userprefs.nl';
        document.body.appendChild(frame);
      }).catch(error => {
        moduleFramePromise = null;
        throw error;
      });
    }
    return moduleFramePromise;
  }

  function getSuiteQLColumnName(column, index) {
    return (column && (column.label || column.name || column.alias)) || 'Column ' + (index + 1);
  }

  function normalizeSuiteQLResults(resultSet) {
    const rawColumns = resultSet && Array.isArray(resultSet.columns) ? resultSet.columns : [];
    const results = resultSet && Array.isArray(resultSet.results) ? resultSet.results : [];
    const mappedResults = typeof resultSet.asMappedResults === 'function' ? resultSet.asMappedResults() : null;
    const columns = rawColumns.map((column, index) => ({
      key: column.name || column.alias || 'column_' + index,
      label: getSuiteQLColumnName(column, index)
    }));
    if (!columns.length && mappedResults && mappedResults.length) {
      Object.keys(mappedResults[0]).forEach((key, index) => columns.push({ key, label: key || 'Column ' + (index + 1) }));
    }
    const rows = results.map((result, rowIndex) => {
      let mapped;
      if (result && typeof result.asMap === 'function') mapped = result.asMap();
      else if (mappedResults && mappedResults[rowIndex]) mapped = mappedResults[rowIndex];
      else mapped = result;
      const values = result && Array.isArray(result.values) ? result.values : null;
      const row = {};
      columns.forEach((column, index) => {
        row[column.key] = mapped && Object.prototype.hasOwnProperty.call(mapped, column.key)
          ? mapped[column.key]
          : (values ? values[index] : (mapped ? mapped[column.label] : undefined));
      });
      return row;
    });
    return { columns, rows };
  }

  function initScriptRunner() {
    if (!scriptEditor) {
      scriptEditor = CodeMirror($('#nsa-script-editor'), {
        value: [
          "// Load SuiteScript modules asynchronously, then use them in this callback.",
          "require(['N/search'], function (search) {",
          "  const result = search.create({",
          "    type: search.Type.CUSTOMER,",
          "    filters: [],",
          "    columns: ['entityid']",
          "  }).run().getRange({ start: 0, end: 10 });",
          "  console.log(result);",
          "});"
        ].join('\n'),
        mode: 'javascript',
        lineNumbers: true,
        indentUnit: 2,
        tabSize: 2,
        lineWrapping: true,
        autofocus: true
      });
      scriptEditor.getInputField().id = 'nsa-script-source';
      scriptEditor.getInputField().setAttribute('aria-label', 'JavaScript SuiteScript source');
    }
    $('#nsa-script-run').onclick = runSuiteScript;
    $('#nsa-script-clear').onclick = () => {
      $('#nsa-script-output').textContent = '';
      $('#nsa-script-status').textContent = '';
      $('#nsa-script-timing').textContent = '';
    };
  }

  function formatScriptOutput(value) {
    if (typeof value === 'string') return value;
    if (value === undefined) return 'undefined';
    try {
      const serialized = JSON.stringify(value, null, 2);
      return serialized === undefined ? String(value) : serialized;
    } catch (error) {
      return String(value);
    }
  }

  function appendScriptOutput(lines, level, values) {
    const message = values.map(formatScriptOutput).join(' ');
    lines.push((level === 'log' ? '' : '[' + level.toUpperCase() + '] ') + message);
    if (lines.length > 1000) lines.splice(0, lines.length - 1000);
    $('#nsa-script-output').textContent = lines.join('\n');
  }

  function createSuiteScriptRequire(pendingRequests) {
    return function suiteScriptRequire(moduleIds, callback, errorCallback) {
      const requested = Array.isArray(moduleIds) ? moduleIds : [moduleIds];
      const request = Promise.all(requested.map(moduleId => loadNetSuiteModule(moduleId))).then(loaded => {
        if (typeof callback === 'function') return callback.apply(undefined, loaded);
        return Array.isArray(moduleIds) ? loaded : loaded[0];
      }).catch(error => {
        if (typeof errorCallback === 'function') return errorCallback(error);
        throw error;
      });
      pendingRequests.add(request);
      request.then(
        () => pendingRequests.delete(request),
        () => pendingRequests.delete(request)
      );
      return request;
    };
  }

  async function runSuiteScript() {
    if (scriptRunning || !scriptEditor) return;
    const source = scriptEditor.getValue().trim();
    if (!source) {
      setStatus($('#nsa-script-status'), 'Enter SuiteScript code before running it.', 'error');
      return;
    }
    scriptRunning = true;
    const button = $('#nsa-script-run');
    const output = $('#nsa-script-output');
    const startTime = performance.now();
    const lines = [];
    button.disabled = true;
    button.textContent = 'Running…';
    output.textContent = '';
    $('#nsa-script-timing').textContent = '';
    setStatus($('#nsa-script-status'), 'Loading requested NetSuite modules…', 'info');
    const consoleProxy = {};
    ['log', 'info', 'warn', 'error', 'debug'].forEach(level => {
      consoleProxy[level] = (...values) => appendScriptOutput(lines, level, values);
    });
    try {
      const runner = new Function(
        'require',
        'getModule',
        'console',
        'log',
        '"use strict"; return (async function () {\n' + source + '\n}).call(undefined);'
      );
      const pendingRequests = new Set();
      const requireModule = createSuiteScriptRequire(pendingRequests);
      const result = await runner(requireModule, loadNetSuiteModule, consoleProxy, consoleProxy.log);
      while (pendingRequests.size) await Promise.all(Array.from(pendingRequests));
      if (result !== undefined) appendScriptOutput(lines, 'return', [result]);
      if (!lines.length) output.textContent = 'Script completed without console output.';
      const elapsedMs = performance.now() - startTime;
      $('#nsa-script-timing').textContent = 'Completed in ' + elapsedMs.toFixed(1) + ' ms';
      setStatus($('#nsa-script-status'), 'Script completed successfully.', 'success');
    } catch (error) {
      appendScriptOutput(lines, 'error', [error && error.stack ? error.stack : makeStatusMessage(error)]);
      const elapsedMs = performance.now() - startTime;
      $('#nsa-script-timing').textContent = 'Failed after ' + elapsedMs.toFixed(1) + ' ms';
      setStatus($('#nsa-script-status'), makeStatusMessage(error), 'error');
    } finally {
      scriptRunning = false;
      button.disabled = false;
      button.textContent = 'Run script';
    }
  }

  async function runSuiteQL() {
    const query = $('#nsa-query').value.trim();
    const status = $('#nsa-query-status');
    const runButton = $('#nsa-run');
    const timing = $('#nsa-query-timing');
    if (queryRunning) return;
    if (!query) {
      setStatus(status, 'Enter a SuiteQL query before running it.', 'error');
      return;
    }
    queryRunning = true;
    runButton.disabled = true;
    runButton.textContent = 'Running…';
    timing.textContent = '';
    let queryStartedAt = null;
    try {
      setStatus(status, 'Loading N/query…', 'info');
      const queryModule = await loadNetSuiteModule('N/query');
      if (typeof queryModule.runSuiteQL !== 'function') {
        throw new Error('N/query loaded, but it does not provide runSuiteQL().');
      }
      let resultSet;
      queryStartedAt = performance.now();
      if (typeof queryModule.runSuiteQL.promise === 'function') {
        setStatus(status, 'Executing query asynchronously…', 'info');
        resultSet = await queryModule.runSuiteQL.promise({ query });
      } else {
        setStatus(status, 'This N/query module has no Promise API; running synchronously may temporarily block the page…', 'info');
        await new Promise(resolve => window.setTimeout(resolve, 0));
        resultSet = queryModule.runSuiteQL({ query });
      }
      const elapsedMs = performance.now() - queryStartedAt;
      timing.textContent = 'Query execution: ' + elapsedMs.toFixed(1) + ' ms';
      const normalized = normalizeSuiteQLResults(resultSet);
      $('#nsa-query-count').textContent = normalized.rows.length + (normalized.rows.length === 1 ? ' result' : ' results');
      if (!normalized.columns.length) {
        $('#nsa-query-results').replaceChildren();
        setStatus(status, 'Query completed in ' + elapsedMs.toFixed(1) + ' ms, but returned no column metadata.', 'error');
        return;
      }
      renderDataTable($('#nsa-query-results'), normalized.columns, normalized.rows);
      const rowLimitMessage = normalized.rows.length === 5000
        ? ' The result may be limited to the first 5,000 rows; use a paged query for larger result sets.'
        : '';
      setStatus(status, 'Query completed in ' + elapsedMs.toFixed(1) + ' ms.' + rowLimitMessage, 'success');
    } catch (error) {
      $('#nsa-query-results').replaceChildren();
      $('#nsa-query-count').textContent = '';
      const elapsed = queryStartedAt === null ? '' : ' (after ' + (performance.now() - queryStartedAt).toFixed(1) + ' ms)';
      if (queryStartedAt !== null) timing.textContent = 'Query failed after ' + (performance.now() - queryStartedAt).toFixed(1) + ' ms';
      setStatus(status, makeStatusMessage(error) + elapsed, 'error');
    } finally {
      queryRunning = false;
      runButton.disabled = false;
      runButton.textContent = 'Run query';
    }
  }

  function initSuiteQL() {
    $('#nsa-run').onclick = runSuiteQL;
    $('#nsa-query').onkeydown = event => {
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        runSuiteQL();
      }
    };
  }

  const SOAP_COLUMNS = [
    ['time', 'Time'], ['dur', 'Dur (s)'], ['action', 'Action'], ['ver', 'API ver'],
    ['status', 'Status'], ['user', 'User'], ['ok', 'OK'], ['fail', 'Fail']
  ];
  const REST_COLUMNS = [
    ['time', 'Time'], ['dur', 'Dur (s)'], ['status', 'Status'], ['user', 'User'],
    ['method', 'Method'], ['httpCode', 'HTTP code'], ['url', 'URL']
  ];
  const RESTLET_LIST_URL = '/app/common/integration/integrapplist.nl';

  function makeNetSuiteURL(path) {
    const url = new URL(path, window.location.href);
    if (url.origin !== window.location.origin) throw new Error('A log payload URL pointed outside the current NetSuite origin.');
    return url.href;
  }

  function parseLogRow(tr, soap) {
    const cells = tr.querySelectorAll('td');
    const request = tr.querySelector('a[id^="request"]');
    const response = tr.querySelector('a[id^="response"]');
    const minimum = soap ? 8 : 7;
    if (cells.length < minimum) return null;
    const getHref = anchor => {
      const href = anchor && (anchor.getAttribute('href') || anchor.getAttribute('HREF'));
      return href ? makeNetSuiteURL(href) : '';
    };
    const values = Array.from(cells, cell => cell.textContent.trim());
    const row = soap
      ? { type: 'soap', time: values[0], dur: values[1], action: values[2], ver: values[3], status: values[4], user: values[5], ok: values[6], fail: values[7] }
      : { type: 'rest', time: values[0], dur: values[1], status: values[2], user: values[3], method: values[4], httpCode: values[5], url: values[6] };
    row.req = getHref(request);
    row.resp = getHref(response);
    return row;
  }

  function parseRestletRow(tr) {
    const cells = Array.from(tr.querySelectorAll('td'));
    if (!cells.length) return null;
    const table = tr.closest('table');
    const headerRow = table && Array.from(table.querySelectorAll('tr')).find(candidate =>
      candidate.querySelector('th, td.uir-list-header-td, td.listheader'));
    const headers = headerRow
      ? Array.from(headerRow.querySelectorAll('th, td.uir-list-header-td, td.listheader')).map(cell => cell.textContent.trim())
      : [];
    const request = tr.querySelector('a[id^="request"]');
    const response = tr.querySelector('a[id^="response"]');
    const anchors = new Set([request, response].filter(Boolean));
    const columns = [];
    const row = { type: 'restlet' };
    cells.forEach((cell, index) => {
      const payloadAnchor = cell.querySelector('a[id^="request"], a[id^="response"]');
      const label = headers[index] || 'Column ' + (index + 1);
      if (anchors.has(payloadAnchor) || /^(request|response)$/i.test(label)) return;
      const key = 'field' + index;
      columns.push({ key, label });
      row[key] = cell.textContent.trim();
      if (/status/i.test(label)) row.status = row[key];
      if (/time|date/i.test(label) && row.time === undefined) row.time = row[key];
    });
    const href = anchor => {
      const value = anchor && (anchor.getAttribute('href') || anchor.getAttribute('HREF'));
      return value ? makeNetSuiteURL(value) : '';
    };
    row.req = href(request);
    row.resp = href(response);
    tr.__nsaColumns = columns;
    return row;
  }

  function statusCell(td, row) {
    const badge = document.createElement('span');
    const state = toCellText(row.status).toUpperCase();
    badge.className = 'nsa-badge' + (state === 'FAILED' ? ' failed' : state === 'FINISHED' ? '' : ' other');
    badge.textContent = row.status || 'Unknown';
    td.appendChild(badge);
  }

  function renderLogTable() {
    let base;
    if (logType === 'soaplog') base = SOAP_COLUMNS.map(([key, label]) => ({ key, label }));
    else if (logType === 'restwslog') base = REST_COLUMNS.map(([key, label]) => ({ key, label }));
    else base = logColumns;
    const columns = base.map(column => ({
      ...column,
      render: column.key === 'status' || /status/i.test(column.label) ? statusCell : undefined
    }));
    columns.push(
      {
        key: 'req',
        label: 'Request',
        sortable: false,
        render: (td, row) => addPayloadButton(td, row, 'req', 'Request')
      },
      {
        key: 'resp',
        label: 'Response',
        sortable: false,
        render: (td, row) => addPayloadButton(td, row, 'resp', 'Response')
      }
    );
    renderDataTable($('#nsa-log-results'), columns, logRows, { emptyMessage: 'No entries found on this page.' });
  }

  function addPayloadButton(cell, row, type, label) {
    if (!row[type]) {
      cell.textContent = '—';
      return;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nsa-button';
    button.textContent = label;
    button.addEventListener('click', () => openPayload(row, type));
    cell.appendChild(button);
  }

  async function loadIntegrations(forceRefresh) {
    const select = $('#nsa-integration-id');
    const status = $('#nsa-log-status');
    const selectedId = select.value;
    select.disabled = true;
    $('#nsa-refresh-integrations').disabled = true;
    if (forceRefresh) integrationsPromise = null;
    const reportStatus = !integrationsPromise;
    if (reportStatus) setStatus(status, 'Loading integrations…', 'info');
    if (!integrationsPromise) {
      integrationsPromise = fetch(makeNetSuiteURL(RESTLET_LIST_URL), { credentials: 'include' })
        .then(response => {
          if (!response.ok) throw new Error('Unable to load integrations (HTTP ' + response.status + ').');
          return response.text();
        })
        .then(html => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const form = doc.querySelector('form#body_actions');
          if (!form) throw new Error('The integration list page did not contain form#body_actions.');
          const records = new Map();
          form.querySelectorAll('a.dottedlink[href*="integrapp.nl"], a[href*="integrapp.nl"]').forEach(anchor => {
            const href = anchor.getAttribute('href');
            const url = new URL(href, window.location.origin);
            if (url.origin !== window.location.origin || !url.pathname.endsWith('/app/common/integration/integrapp.nl')) return;
            const id = url.searchParams.get('id');
            const name = anchor.textContent.trim();
            if (id && /^\d+$/.test(id) && name) records.set(id, { id, name });
          });
          return Array.from(records.values()).sort((left, right) =>
            left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }));
        })
        .catch(error => {
          integrationsPromise = null;
          throw error;
        });
    }
    try {
      integrations = await integrationsPromise;
      select.replaceChildren();
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = integrations.length ? 'Select an integration…' : 'No integrations found';
      select.appendChild(placeholder);
      integrations.forEach(integration => {
        const option = document.createElement('option');
        option.value = integration.id;
        option.textContent = integration.name + ' (ID ' + integration.id + ')';
        select.appendChild(option);
      });
      if (integrations.some(integration => integration.id === selectedId)) select.value = selectedId;
      select.disabled = integrations.length === 0;
      if (reportStatus) {
        setStatus(status, integrations.length
          ? integrations.length + ' integrations loaded.'
          : 'No integrations were found for this role.', integrations.length ? 'success' : 'error');
      }
    } catch (error) {
      select.replaceChildren();
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Unable to load integrations';
      select.appendChild(option);
      setStatus(status, makeStatusMessage(error), 'error');
    } finally {
      $('#nsa-refresh-integrations').disabled = false;
    }
  }

  async function loadLogs() {
    if (logsLoading) return;
    const status = $('#nsa-log-status');
    const integrationId = $('#nsa-integration-id').value.trim();
    if (!/^\d+$/.test(integrationId)) {
      setStatus(status, 'Enter a numeric integration internal ID.', 'error');
      return;
    }
    logType = $('#nsa-log-type').value;
    const requestedType = logType;
    const requestedPage = logPage;
    const offset = requestedType === 'restletlog'
      ? (requestedPage > 1 ? requestedPage : 1)
      : requestedPage;
    const path = requestedType === 'restletlog'
      ? '/app/common/integration/integrapp.nl?id=' + encodeURIComponent(integrationId)
        + '&q=restletlogrange&si=' + encodeURIComponent(String(offset))
        + '&machine=restletlog&f=T&si_restletlogsortfld=time'
      : '/app/common/integration/integrapp.nl?r=T&id=' + encodeURIComponent(integrationId)
        + '&machine=' + encodeURIComponent(requestedType)
        + (offset > 0 ? '&si=' + encodeURIComponent(String(offset)) : '')
        + '&q=' + (requestedType === 'soaplog' ? 'soaplogrange' : 'restwslogrange');
    const loadButton = $('#nsa-load-logs');
    logsLoading = true;
    loadButton.disabled = true;
    $('#nsa-log-type').disabled = true;
    $('#nsa-integration-id').disabled = true;
    $('#nsa-prev').disabled = true;
    $('#nsa-next').disabled = true;
    setStatus(status, 'Loading integration logs…', 'info');
    try {
      const response = await fetch(makeNetSuiteURL(path), { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to load logs (HTTP ' + response.status + '). Check your NetSuite session and access permissions.');
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const sourceRows = Array.from(doc.querySelectorAll('tr.uir-list-row-tr'));
      if (requestedType === 'restletlog') {
        logColumns = [];
        logRows = sourceRows.map(row => parseRestletRow(row)).filter(Boolean);
        const sample = sourceRows.find(row => row.__nsaColumns);
        if (sample) logColumns = sample.__nsaColumns;
        if (!logColumns.length && logRows.length) {
          logColumns = Object.keys(logRows[0]).filter(key => !['type', 'req', 'resp'].includes(key))
            .map(key => ({ key, label: key }));
        }
      } else {
        logColumns = [];
        logRows = sourceRows
          .map(row => parseLogRow(row, requestedType === 'soaplog'))
          .filter(Boolean);
      }
      renderLogTable();
      $('#nsa-log-page').textContent = 'Page ' + (requestedType === 'restletlog' ? requestedPage : requestedPage + 1);
      $('#nsa-prev').disabled = requestedType === 'restletlog' ? requestedPage <= 1 : requestedPage === 0;
      $('#nsa-next').disabled = logRows.length === 0;
      setStatus(status, logRows.length + (logRows.length === 1 ? ' log entry loaded.' : ' log entries loaded.'), 'success');
    } catch (error) {
      logRows = [];
      renderLogTable();
      setStatus(status, makeStatusMessage(error), 'error');
    } finally {
      logsLoading = false;
      loadButton.disabled = false;
      $('#nsa-log-type').disabled = false;
      $('#nsa-integration-id').disabled = false;
      $('#nsa-prev').disabled = logType === 'restletlog' ? logPage <= 1 : logPage === 0;
      $('#nsa-next').disabled = logRows.length === 0;
    }
  }

  async function fetchPayload(href) {
    const response = await fetch(makeNetSuiteURL(href), { credentials: 'include' });
    if (!response.ok) throw new Error('Unable to load payload (HTTP ' + response.status + ').');
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const pre = doc.querySelector('pre');
      return pre ? pre.textContent : doc.body.innerText;
    }
    return response.text();
  }

  function serializeXML(node, depth) {
    const indent = '  '.repeat(depth);
    if (node.nodeType === 3) {
      const text = node.textContent.trim();
      return text ? indent + text : '';
    }
    if (node.nodeType !== 1) return '';
    const attrs = Array.from(node.attributes, attribute => attribute.name + '="' + attribute.value + '"').join(' ');
    const open = indent + '<' + node.tagName + (attrs ? ' ' + attrs : '') + '>';
    const children = Array.from(node.childNodes, child => serializeXML(child, depth + 1)).filter(Boolean);
    if (!children.length) return indent + '<' + node.tagName + (attrs ? ' ' + attrs : '') + '/>';
    if (children.length === 1 && !children[0].includes('\n') && children[0].length < 80) {
      return open + children[0].trim() + '</' + node.tagName + '>';
    }
    return open + '\n' + children.join('\n') + '\n' + indent + '</' + node.tagName + '>';
  }

  function prettyPrint(text) {
    const trimmed = text.trim();
    if (trimmed[0] === '{' || trimmed[0] === '[') {
      try { return JSON.stringify(JSON.parse(trimmed), null, 2); } catch (error) { return text; }
    }
    if (trimmed[0] === '<') {
      const doc = new DOMParser().parseFromString(trimmed, 'application/xml');
      if (!doc.querySelector('parsererror') && doc.documentElement) return serializeXML(doc.documentElement, 0);
    }
    return text;
  }

  function renderDetailTabs() {
    const tabs = $('#nsa-detail-tabs');
    tabs.replaceChildren();
    ['req', 'resp'].forEach(type => {
      if (!detailRow || !detailRow[type]) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = type === 'req' ? 'Request' : 'Response';
      button.classList.toggle('active', type === detailTab);
      button.addEventListener('click', () => showPayload(type));
      tabs.appendChild(button);
    });
  }

  async function showPayload(type) {
    detailTab = type;
    renderDetailTabs();
    const pre = $('#nsa-payload');
    if (detailPayloads[type]) {
      pre.textContent = prettyPayload ? prettyPrint(detailPayloads[type]) : detailPayloads[type];
      return;
    }
    pre.textContent = 'Loading…';
    try {
      detailPayloads[type] = await fetchPayload(detailRow[type]);
      pre.textContent = prettyPayload ? prettyPrint(detailPayloads[type]) : detailPayloads[type];
    } catch (error) {
      pre.textContent = 'Error: ' + makeStatusMessage(error);
    }
  }

  async function openPayload(row, type) {
    detailRow = row;
    detailPayloads = { req: '', resp: '' };
    detailTab = type;
    prettyPayload = true;
    $('#nsa-format-payload').textContent = 'Raw';
    const description = row.type === 'rest'
      ? row.method + ' ' + row.url + ' · ' + row.httpCode
      : row.type === 'restlet'
        ? 'RESTlet execution'
        : row.action + ' · ' + row.ver;
    $('#nsa-detail-title').textContent = (type === 'req' ? 'Request' : 'Response') + ' — '
      + (row.time || 'Log entry') + ' — ' + description + (row.status ? ' (' + row.status + ')' : '');
    $('#nsa-detail-backdrop').classList.add('open');
    renderDetailTabs();
    await showPayload(type);
  }

  function initLogs() {
    $('#nsa-load-logs').onclick = () => {
      logPage = logType === 'restletlog' ? 1 : 0;
      loadLogs();
    };
    $('#nsa-prev').onclick = () => {
      if (logType === 'restletlog' && logPage > 1) {
        logPage -= 1;
        loadLogs();
      } else if (logType !== 'restletlog' && logPage > 0) {
        logPage -= 1;
        loadLogs();
      }
    };
    $('#nsa-next').onclick = () => {
      logPage += 1;
      loadLogs();
    };
    $('#nsa-log-type').onchange = () => {
      logType = $('#nsa-log-type').value;
      logPage = logType === 'restletlog' ? 1 : 0;
      logRows = [];
      logColumns = [];
      $('#nsa-log-page').textContent = '';
      setStatus($('#nsa-log-status'), '', '');
      $('#nsa-prev').disabled = true;
      $('#nsa-next').disabled = true;
      renderLogTable();
    };
    $('#nsa-refresh-integrations').onclick = () => loadIntegrations(true);
    loadIntegrations(false);
  }

  const COMMANDS = [
    {
      id: 'saved-search',
      title: 'Edit saved search',
      description: 'Open a saved search using its internal ID',
      placeholder: 'Saved search internal ID'
    },
    {
      id: 'script-record',
      title: 'Open script record',
      description: 'Open a script by internal ID or script ID',
      placeholder: 'Internal ID or customscript_…'
    }
  ];

  function renderCommandMenu(filterValue) {
    const normalized = filterValue.trim().toLocaleLowerCase();
    const commands = COMMANDS.filter(command =>
      (command.title + ' ' + command.description).toLocaleLowerCase().includes(normalized));
    const items = $('#nsa-palette-items');
    items.replaceChildren();
    if (!commands.length) {
      const empty = document.createElement('div');
      empty.className = 'nsa-muted';
      empty.style.padding = '12px';
      empty.textContent = 'No matching commands.';
      items.appendChild(empty);
      return commands;
    }
    paletteSelection = Math.min(paletteSelection, commands.length - 1);
    commands.forEach((command, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nsa-palette-item' + (index === paletteSelection ? ' active' : '');
      button.innerHTML = '';
      const title = document.createElement('span');
      title.textContent = command.title;
      const description = document.createElement('span');
      description.className = 'nsa-muted';
      description.textContent = command.description;
      button.append(title, description);
      button.addEventListener('click', () => selectCommand(command));
      items.appendChild(button);
    });
    return commands;
  }

  function selectCommand(command) {
    selectedCommand = command;
    const search = $('#nsa-palette-filter');
    search.type = 'text';
    search.hidden = true;
    search.placeholder = command.placeholder;
    search.value = '';
    $('#nsa-palette-items').replaceChildren();
    const form = document.createElement('form');
    form.className = 'nsa-palette-search';
    const title = document.createElement('div');
    title.style.cssText = 'margin-bottom:8px;color:#0f172a;font-size:13px;font-weight:600;';
    title.textContent = command.title;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'nsa-input';
    input.id = 'nsa-command-argument';
    input.autocomplete = 'off';
    input.placeholder = command.placeholder;
    input.setAttribute('aria-label', command.placeholder);
    const row = document.createElement('div');
    row.className = 'nsa-query-actions';
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'nsa-button';
    back.textContent = 'Back';
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'nsa-button primary';
    submit.textContent = 'Open';
    const status = document.createElement('div');
    status.id = 'nsa-command-status';
    status.className = 'nsa-status';
    back.addEventListener('click', () => {
      selectedCommand = null;
      search.type = 'search';
      search.hidden = false;
      search.placeholder = 'Search commands…';
      renderCommandMenu(search.value);
      search.focus();
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      executeCommand(command, input.value.trim(), status, submit);
    });
    row.append(back, submit);
    form.append(title, input, row, status);
    $('#nsa-palette-items').appendChild(form);
    input.focus();
  }

  async function resolveScriptInternalId(scriptId) {
    const searchModule = await loadNetSuiteModule('N/search');
    if (!searchModule || typeof searchModule.create !== 'function') {
      throw new Error('N/search is unavailable on this NetSuite page.');
    }
    const searchType = searchModule.Type && searchModule.Type.SCRIPT
      ? searchModule.Type.SCRIPT
      : 'script';
    const results = searchModule.create({
      type: searchType,
      filters: [['scriptid', 'is', scriptId]],
      columns: ['internalid']
    }).run().getRange({ start: 0, end: 1 });
    if (!results || !results.length) throw new Error('No script record matched ' + scriptId + '.');
    const internalId = results[0].getValue({ name: 'internalid' });
    if (!/^\d+$/.test(String(internalId))) throw new Error('NetSuite returned an invalid script internal ID.');
    return String(internalId);
  }

  async function executeCommand(command, argument, status, button) {
    if (!argument) {
      setStatus(status, 'Enter an ID to continue.', 'error');
      return;
    }
    button.disabled = true;
    try {
      let path;
      if (command.id === 'saved-search') {
        if (!/^\d+$/.test(argument)) throw new Error('Enter the saved search numeric internal ID.');
        path = '/app/common/search/search.nl?id=' + encodeURIComponent(argument) + '&e=T';
      } else {
        let internalId;
        if (/^\d+$/.test(argument)) internalId = argument;
        else if (/^customscript_[a-z0-9_]+$/i.test(argument)) internalId = await resolveScriptInternalId(argument);
        else throw new Error('Enter a numeric script internal ID or a script ID beginning with customscript_.');
        path = '/app/common/scripting/script.nl?id=' + encodeURIComponent(internalId);
      }
      window.location.assign(makeNetSuiteURL(path));
    } catch (error) {
      setStatus(status, makeStatusMessage(error), 'error');
    } finally {
      button.disabled = false;
    }
  }

  function openCommandPalette() {
    selectedCommand = null;
    const search = $('#nsa-palette-filter');
    search.type = 'search';
    search.hidden = false;
    search.placeholder = 'Search commands…';
    search.value = '';
    paletteSelection = 0;
    renderCommandMenu('');
    $('#nsa-palette-backdrop').classList.add('open');
    search.focus();
  }

  function closeCommandPalette() {
    $('#nsa-palette-backdrop').classList.remove('open');
  }

  $('#nsa-palette-filter').addEventListener('input', event => {
    if (!selectedCommand) {
      paletteSelection = 0;
      renderCommandMenu(event.target.value);
    }
  });
  $('#nsa-palette-filter').addEventListener('keydown', event => {
    if (selectedCommand) return;
    const commands = COMMANDS.filter(command =>
      (command.title + ' ' + command.description).toLocaleLowerCase().includes(event.target.value.trim().toLocaleLowerCase()));
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!commands.length) return;
      event.preventDefault();
      paletteSelection = (paletteSelection + (event.key === 'ArrowDown' ? 1 : commands.length - 1)) % commands.length;
      renderCommandMenu(event.target.value);
    } else if (event.key === 'Enter' && commands.length) {
      event.preventDefault();
      selectCommand(commands[paletteSelection]);
    }
  });
  $('#nsa-palette-backdrop').addEventListener('click', event => {
    if (event.target === $('#nsa-palette-backdrop')) closeCommandPalette();
  });

  shadow.querySelectorAll('[data-tool]').forEach(button => {
    button.addEventListener('click', () => switchTool(button.dataset.tool));
  });
  shadow.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', () => setOpen(false));
  });
  $('#nsa-detail-close').addEventListener('click', () => $('#nsa-detail-backdrop').classList.remove('open'));
  $('#nsa-detail-backdrop').addEventListener('click', event => {
    if (event.target === $('#nsa-detail-backdrop')) $('#nsa-detail-backdrop').classList.remove('open');
  });
  $('#nsa-format-payload').addEventListener('click', () => {
    prettyPayload = !prettyPayload;
    $('#nsa-format-payload').textContent = prettyPayload ? 'Raw' : 'Pretty';
    const text = detailPayloads[detailTab] || '';
    $('#nsa-payload').textContent = prettyPayload ? prettyPrint(text) : text;
  });
  $('#nsa-copy-payload').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('#nsa-payload').textContent);
      $('#nsa-copy-payload').textContent = 'Copied';
      window.setTimeout(() => { $('#nsa-copy-payload').textContent = 'Copy'; }, 1400);
    } catch (error) {
      $('#nsa-payload').textContent += '\n\nCopy failed: ' + makeStatusMessage(error);
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && $('#nsa-palette-backdrop').classList.contains('open')) {
      if (selectedCommand) {
        selectedCommand = null;
        $('#nsa-palette-filter').hidden = false;
        $('#nsa-palette-filter').type = 'search';
        $('#nsa-palette-filter').placeholder = 'Search commands…';
        renderCommandMenu($('#nsa-palette-filter').value);
        $('#nsa-palette-filter').focus();
      } else closeCommandPalette();
      return;
    }
    if (event.key === 'Escape' && backdrop.classList.contains('open')) {
      if ($('#nsa-detail-backdrop').classList.contains('open')) {
        $('#nsa-detail-backdrop').classList.remove('open');
      } else {
        setOpen(false);
      }
      return;
    }
    if (event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey
      && (event.key.toLowerCase() === 'p' || event.code === 'KeyP')) {
      event.preventDefault();
      if ($('#nsa-palette-backdrop').classList.contains('open')) closeCommandPalette();
      else openCommandPalette();
      return;
    }
    if (event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey
      && (event.key === '/' || event.code === 'Slash')) {
      event.preventDefault();
      setOpen(!backdrop.classList.contains('open'));
    }
  });

  $('#nsa-query-results').replaceChildren();
  $('#nsa-log-results').replaceChildren();
})();
