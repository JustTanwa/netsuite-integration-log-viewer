# NetSuite Admin and Developer Toolkit

A Tampermonkey userscript that adds a keyboard-launched developer console to NetSuite. It includes SuiteQL, a SuiteScript module runner, and integration-log browsing for SOAP, REST, and RESTlet logs.

## Install and use

1. Open [netsuite-admin-toolkit.user.js](./netsuite-admin-toolkit.user.js) in Tampermonkey and install it.
2. Log into NetSuite and navigate to a page in your account.
3. Press **Ctrl + /** to open or close the console.
4. Press **Alt + Shift + P** to open the command menu.

## Tools

### SuiteQL Runner

Enter a SuiteQL query and select **Run query**, or press **Ctrl + Enter**. Results are filterable and sortable. The tool displays execution time separately from rendering time.

The runner loads `N/query` from the current page's global `require()` function, or from `/app/center/userprefs.nl` in a hidden same-origin iframe if needed. It prefers `runSuiteQL.promise`. If the loaded module has no Promise API, it reports a warning and calls synchronous `runSuiteQL`, which may briefly block the page. `runSuiteQL` returns at most 5,000 rows; use paged queries for larger results.

### SuiteScript Runner

The editor uses locally bundled CodeMirror with JavaScript syntax highlighting. Enter code and click **Run script**. The runner provides:

- `require(['N/record', 'N/search'], callback)` to load modules using NetSuite's page module loader
- `await getModule('N/query')` as a Promise-based module helper
- `console.log`, `console.info`, `console.warn`, `console.error`, `console.debug`, and `log`

Example:

```javascript
const query = await getModule('N/query');
const result = await query.runSuiteQL.promise({
  query: 'SELECT id, entityid FROM customer WHERE ROWNUM <= 10'
});
console.log(result.asMappedResults());
```

Scripts run with your current NetSuite role and may read or change data that role can access. Only run code you understand. The output panel shows console messages, returned values, errors, and runtime.

### Command menu

Press **Alt + Shift + P**, choose a command, then enter an identifier:

- **Edit saved search** opens a saved search by numeric internal ID.
- **Open script record** accepts a numeric internal ID or a `customscript_...` script ID. Script IDs are resolved using `N/search` before opening the record.

### Integration Logs

The tool loads integration names and IDs from `/app/common/integration/integrapplist.nl` using the active session. Choose SOAP, REST, or RESTlet logs and select an integration from the dropdown. Log rows can be paged, filtered, and sorted; request and response payloads open inline.

RESTlet records are requested from the NetSuite route:

`/app/common/integration/integrapp.nl?id=…&q=restletlogrange&si=…&machine=restletlog&f=T&si_restletlogsortfld=time`

NetSuite's returned log HTML is parsed in the browser, so a change to that page's table markup may require an update.

## Development

The installable userscript is built from `src/main.js`; CodeMirror and its JavaScript mode are bundled locally, with no runtime CDN dependency. CodeMirror's license is included in [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md).

```sh
npm install
npm run build
npm run check
```

Tools are registered in `toolRegistry` and share the console shell and filterable/sortable `renderDataTable` component.

## Security and limitations

- The userscript makes no third-party network requests. It uses same-origin NetSuite pages and the current authenticated session.
- SuiteQL and SuiteScript execution are subject to the current role's permissions.
- NetSuite does not guarantee that `require()` or `N/query` is exposed on UI pages or that the preferences page can be embedded. Failure is surfaced to the user.
- Saved search and script navigation uses the current NetSuite account.
- Integration list, RESTlet log structure, and payload routes may vary between NetSuite versions.
