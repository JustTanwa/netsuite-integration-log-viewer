(function () {
  // Remove any existing instance
  const existing = document.querySelector('[data-nslv-bg]');
  if (existing) { existing.remove(); }

  // ── Overlay backdrop ──────────────────────────────────────────────────────
  const backdrop = document.createElement('div');
  backdrop.setAttribute('data-nslv-bg', '1');
  backdrop.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:99999',
    'background:rgba(0,0,0,.55)', 'display:flex',
    'align-items:center', 'justify-content:center'
  ].join(';');

  // ── Main panel ────────────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.setAttribute('data-nslv', '1');
  panel.style.cssText = [
    'background:#fff', 'width:95vw', 'height:90vh',
    'border-radius:12px', 'overflow:hidden',
    'display:flex', 'flex-direction:column',
    'font-family:system-ui,sans-serif', 'position:relative'
  ].join(';');

  panel.innerHTML = `
    <!-- ── Toolbar ── -->
    <div style="padding:12px 16px;border-bottom:1px solid #e5e7eb;display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:#fff;flex-shrink:0;">
      <b style="font-size:15px;">Integration log viewer</b>

      <select id="nslv_type" style="font-size:13px;padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;">
        <option value="soaplog">SOAP log</option>
        <option value="restlog">REST log</option>
      </select>

      <span style="font-size:13px;">Integration ID:</span>
      <input id="nslv_id" value="5" style="width:70px;font-size:13px;padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;">

      <button id="nslv_load" style="font-size:13px;padding:5px 14px;border-radius:6px;border:1px solid #2563eb;background:#eff6ff;color:#1d4ed8;cursor:pointer;">
        Load
      </button>

      <span id="nslv_pg" style="font-size:13px;color:#6b7280;margin-left:auto;"></span>

      <button id="nslv_prev" style="font-size:13px;padding:4px 12px;border-radius:6px;border:1px solid #d1d5db;cursor:pointer;" disabled>&#8592; Prev</button>
      <button id="nslv_next" style="font-size:13px;padding:4px 12px;border-radius:6px;border:1px solid #d1d5db;cursor:pointer;">Next &#8594;</button>

      <button id="nslv_close" style="font-size:22px;background:none;border:none;cursor:pointer;color:#6b7280;line-height:1;padding:0 4px;">&times;</button>
    </div>

    <!-- ── Table ── -->
    <div style="flex:1;overflow:auto;">
      <table id="nslv_tbl" width="100%" style="border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f9fafb;position:sticky;top:0;z-index:1;">
            ${['Time','Dur (s)','Action','API ver','Status','User','OK','Fail','Request','Response']
              .map(h => `<th style="text-align:left;padding:8px 12px;border-bottom:1px solid #e5e7eb;white-space:nowrap;font-weight:500;">${h}</th>`)
              .join('')}
          </tr>
        </thead>
        <tbody id="nslv_body">
          <tr><td colspan="10" style="text-align:center;padding:3rem;color:#9ca3af;">Set an integration ID and click Load</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ── Detail modal ── -->
    <div id="nslv_modal" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,.4);z-index:10;align-items:center;justify-content:center;">
      <div style="background:#fff;width:88%;max-height:85%;border-radius:10px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);">

        <!-- modal header -->
        <div style="padding:12px 16px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:8px;flex-shrink:0;">
          <span id="nslv_mtitle" style="font-weight:500;font-size:14px;flex:1;"></span>
          <button id="nslv_copy" style="font-size:11px;padding:3px 10px;border-radius:6px;border:1px solid #d1d5db;background:#f9fafb;cursor:pointer;">Copy</button>
          <button id="nslv_fmtbtn" style="font-size:11px;padding:3px 10px;border-radius:6px;border:1px solid #d1d5db;background:#f9fafb;cursor:pointer;">Raw</button>
          <button id="nslv_mclose" style="font-size:22px;background:none;border:none;cursor:pointer;color:#6b7280;line-height:1;">&times;</button>
        </div>

        <!-- req / resp tabs -->
        <div id="nslv_tabs" style="display:flex;border-bottom:1px solid #e5e7eb;padding:0 16px;flex-shrink:0;"></div>

        <!-- content -->
        <div style="flex:1;overflow:auto;padding:14px 16px;">
          <pre id="nslv_mpre" style="font-size:12px;white-space:pre-wrap;word-break:break-all;margin:0;font-family:monospace;line-height:1.6;color:#111;"></pre>
        </div>
      </div>
    </div>
  `;

  backdrop.appendChild(panel);
  document.body.appendChild(backdrop);

  // ── State ─────────────────────────────────────────────────────────────────
  let page = 0;
  let rows = [];
  let rawStore = { req: '', resp: '' };
  let fmtPretty = true;
  let activeTab = 'req';
  let currentRow = null;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getUrl() {
    const id   = document.getElementById('nslv_id').value.trim() || '5';
    const type = document.getElementById('nslv_type').value;
    const offset = page > 0 ? '&si=' + page : '';
    return '/app/common/integration/integrapp.nl?r=T&id=' + id + '&machine=' + type + offset;
  }

  function badge(s) {
    const styles = {
      FINISHED: 'background:#dcfce7;color:#15803d',
      FAILED:   'background:#fee2e2;color:#dc2626'
    };
    const style = styles[s] || 'background:#fef9c3;color:#a16207';
    return '<span style="font-size:11px;padding:2px 8px;border-radius:20px;font-weight:500;' + style + ';">' + s + '</span>';
  }

  function serializeXML(node, depth) {
    const indent = '  '.repeat(depth);
    if (node.nodeType === 3) {
      const t = node.textContent.trim();
      return t ? indent + t : '';
    }
    if (node.nodeType !== 1) return '';
    const tag   = node.tagName;
    const attrs = [...node.attributes].map(a => a.name + '="' + a.value + '"').join(' ');
    const open  = indent + '<' + tag + (attrs ? ' ' + attrs : '') + '>';
    const kids  = [...node.childNodes].map(c => serializeXML(c, depth + 1)).filter(Boolean);
    if (!kids.length) return indent + '<' + tag + (attrs ? ' ' + attrs : '') + '/>';
    if (kids.length === 1 && !kids[0].includes('\n') && kids[0].length < 80) {
      return open + kids[0].trim() + '</' + tag + '>';
    }
    return open + '\n' + kids.join('\n') + '\n' + indent + '</' + tag + '>';
  }

  function prettyPrint(text) {
    if (!text) return '';
    const s = text.trim();
    if (s[0] === '{' || s[0] === '[') {
      try { return JSON.stringify(JSON.parse(s), null, 2); } catch (e) { /* fall through */ }
    }
    if (s[0] === '<') {
      try {
        const doc = new DOMParser().parseFromString(s, 'application/xml');
        if (!doc.querySelector('parsererror')) {
          return serializeXML(doc.documentElement, 0);
        }
      } catch (e) { /* fall through */ }
    }
    return text;
  }

  async function fetchContent(href) {
    const r = await fetch(href, { credentials: 'include' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const ct = r.headers.get('content-type') || '';
    if (ct.includes('text/html')) {
      const html = await r.text();
      const doc  = new DOMParser().parseFromString(html, 'text/html');
      const pre  = doc.querySelector('pre');
      return pre ? pre.textContent : doc.body.innerText;
    }
    return r.text();
  }

  // ── Load log list ─────────────────────────────────────────────────────────
  async function load() {
    document.getElementById('nslv_body').innerHTML =
      '<tr><td colspan="10" style="text-align:center;padding:2rem;color:#9ca3af;">Loading…</td></tr>';
    try {
      const r = await fetch(getUrl(), { credentials: 'include' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const html = await r.text();
      const doc  = new DOMParser().parseFromString(html, 'text/html');
      const trs  = doc.querySelectorAll('tr.uir-list-row-tr');
      rows = [];
      trs.forEach(tr => {
        const td = tr.querySelectorAll('td');
        const qa = tr.querySelector('a[id^="request"]');
        const ra = tr.querySelector('a[id^="response"]');
        if (td.length >= 8) {
          rows.push({
            time:   td[0]?.textContent.trim(),
            dur:    td[1]?.textContent.trim(),
            action: td[2]?.textContent.trim(),
            ver:    td[3]?.textContent.trim(),
            status: td[4]?.textContent.trim(),
            user:   td[5]?.textContent.trim(),
            ok:     td[6]?.textContent.trim(),
            fail:   td[7]?.textContent.trim(),
            req:    (qa?.getAttribute('HREF') || qa?.getAttribute('href') || '').trim(),
            resp:   (ra?.getAttribute('HREF') || ra?.getAttribute('href') || '').trim()
          });
        }
      });

      if (!rows.length) {
        document.getElementById('nslv_body').innerHTML =
          '<tr><td colspan="10" style="text-align:center;padding:3rem;color:#9ca3af;">No entries found</td></tr>';
      } else {
        document.getElementById('nslv_body').innerHTML = rows.map((row, i) => {
          const failStyle = row.fail && row.fail !== '0' ? 'color:#dc2626;' : '';
          const cells = [row.time, row.dur, row.action, row.ver, badge(row.status), row.user, row.ok, row.fail]
            .map((v, j) => '<td style="padding:8px 12px;' + (j === 7 ? failStyle : '') + '">' + (v || '—') + '</td>')
            .join('');
          const reqBtn  = row.req  ? '<button style="font-size:12px;padding:2px 10px;border-radius:5px;border:1px solid #93c5fd;color:#1d4ed8;background:#eff6ff;cursor:pointer;" onclick="window.__nslvOpen(' + i + ',\'req\')">Request</button>'  : '—';
          const respBtn = row.resp ? '<button style="font-size:12px;padding:2px 10px;border-radius:5px;border:1px solid #93c5fd;color:#1d4ed8;background:#eff6ff;cursor:pointer;" onclick="window.__nslvOpen(' + i + ',\'resp\')">Response</button>' : '—';
          return '<tr style="border-bottom:1px solid #f3f4f6;" onmouseover="this.style.background=\'#f9fafb\'" onmouseout="this.style.background=\'\'">'
            + cells
            + '<td style="padding:8px 12px;">' + reqBtn  + '</td>'
            + '<td style="padding:8px 12px;">' + respBtn + '</td>'
            + '</tr>';
        }).join('');
      }

      document.getElementById('nslv_pg').textContent = 'Page ' + (page + 1);
      document.getElementById('nslv_prev').disabled = page === 0;
    } catch (e) {
      document.getElementById('nslv_body').innerHTML =
        '<tr><td colspan="10" style="text-align:center;padding:2rem;color:#dc2626;">Error: ' + e.message + ' — are you logged into NetSuite?</td></tr>';
    }
  }

  // ── Detail modal ──────────────────────────────────────────────────────────
  function renderTabs(row) {
    const tabs = document.getElementById('nslv_tabs');
    tabs.innerHTML = '';
    ['req', 'resp'].forEach(type => {
      if (!row[type]) return;
      const label = type === 'req' ? 'Request' : 'Response';
      const active = type === activeTab;
      const t = document.createElement('div');
      t.textContent = label;
      t.style.cssText = 'padding:8px 14px;font-size:13px;cursor:pointer;margin-bottom:-1px;'
        + 'border-bottom:2px solid ' + (active ? '#2563eb' : 'transparent') + ';'
        + 'color:' + (active ? '#1d4ed8' : '#6b7280') + ';';
      t.onclick = () => switchTab(type);
      tabs.appendChild(t);
    });
  }

  async function switchTab(type) {
    activeTab = type;
    renderTabs(currentRow);
    const pre = document.getElementById('nslv_mpre');
    if (rawStore[type]) {
      pre.textContent = fmtPretty ? prettyPrint(rawStore[type]) : rawStore[type];
      return;
    }
    pre.textContent = 'Loading…';
    try {
      const text = await fetchContent(currentRow[type]);
      rawStore[type] = text;
      pre.textContent = fmtPretty ? prettyPrint(text) : text;
    } catch (e) {
      pre.textContent = 'Error: ' + e.message;
    }
  }

  window.__nslvOpen = async function (i, type) {
    currentRow  = rows[i];
    activeTab   = type;
    rawStore    = { req: '', resp: '' };
    fmtPretty   = true;
    document.getElementById('nslv_fmtbtn').textContent = 'Raw';
    document.getElementById('nslv_mtitle').textContent =
      (type === 'req' ? 'Request' : 'Response') +
      ' — ' + currentRow.time +
      ' — ' + currentRow.action +
      ' (' + currentRow.status + ')';
    document.getElementById('nslv_modal').style.display = 'flex';
    renderTabs(currentRow);
    const pre = document.getElementById('nslv_mpre');
    pre.textContent = 'Loading…';
    try {
      const text = await fetchContent(currentRow[type]);
      rawStore[type] = text;
      pre.textContent = prettyPrint(text);
    } catch (e) {
      pre.textContent = 'Error: ' + e.message;
    }
  };

  // ── Event listeners ───────────────────────────────────────────────────────
  document.getElementById('nslv_close').onclick  = () => backdrop.remove();
  document.getElementById('nslv_mclose').onclick = () => { document.getElementById('nslv_modal').style.display = 'none'; };
  document.getElementById('nslv_modal').onclick  = function (e) { if (e.target === this) this.style.display = 'none'; };
  backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });

  document.getElementById('nslv_copy').onclick = () => {
    try { navigator.clipboard.writeText(document.getElementById('nslv_mpre').textContent); } catch (e) { /* silent */ }
  };

  document.getElementById('nslv_fmtbtn').onclick = () => {
    fmtPretty = !fmtPretty;
    document.getElementById('nslv_fmtbtn').textContent = fmtPretty ? 'Raw' : 'Pretty';
    const t = rawStore[activeTab] || '';
    document.getElementById('nslv_mpre').textContent = fmtPretty ? prettyPrint(t) : t;
  };

  document.getElementById('nslv_load').onclick  = () => { page = 0; load(); };
  document.getElementById('nslv_prev').onclick  = () => { if (page > 0) { page--; load(); } };
  document.getElementById('nslv_next').onclick  = () => { page++; load(); };

  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('nslv_modal');
      if (modal && modal.style.display !== 'none') {
        modal.style.display = 'none';
      } else {
        backdrop.remove();
        document.removeEventListener('keydown', escHandler);
      }
    }
  });
})();
