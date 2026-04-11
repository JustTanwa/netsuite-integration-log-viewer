# NetSuite Integration Log Viewer

A browser console script that overlays a clean, readable UI on top of NetSuite for browsing SOAP and REST integration logs without downloading any files.


## Who is this for?

This tool is for **NetSuite administrators, integration developers, and technical consultants** who need to inspect integration SOAP web service or REST API requests but find the native NetSuite log experience frustrating to work with.

Specifically, you'll find this useful if you:

- Debug integrations between NetSuite and third-party systems
- Investigate failed records, unexpected responses, or API errors
- Work with SuiteTalk SOAP or REST API
- Are on a multiple environment setup where installing browser extensions isn't practical
- Just want to read a log entry without having a file downloaded to your machine every time you click "view"

No installation or extension justopen DevTools, you can run this.


## The problem it solves

In NetSuite's native integration log UI (`Setup > Integration > Web Services Usage Log`), clicking **Request** or **Response** on any log entry triggers a file download. There is no way to read the content inline. For anyone doing active debugging this is slow and clutters your downloads folder with dozens of `.xml` or `.json` files.

This script injects a full log browser directly into the page that:

- Fetches log entries using your existing authenticated session (no re-login, no API keys)
- Displays SOAP/XML and REST/JSON content inline in a readable modal
- Auto-formats raw XML and JSON with indentation so it's actually readable
- Lets you page through entries and switch between log types without leaving the page


## Requirements

- Access to a NetSuite account with integration logs enabled
- A modern browser (Chrome, Edge, Firefox, or Safari)
- You must be **logged into NetSuite** in the same browser tab when you run the script — it piggybacks on your active session cookies
- DevTools console access (F12)


## How to use it

1. Log into NetSuite and navigate to any page
2. Open DevTools with `F12` and go to the **Console** tab
3. Paste the entire contents of `index.js` and press `Enter`
4. The log viewer overlay will appear immediately

### Finding your integration ID

Go to **Setup > Integration > Manage Integrations**, open the integration record, and note the internal ID from the URL — it will look like `&id=5`. Enter that number in the Integration ID field.


## Columns in the log table

| Column | Description |
|---|---|
| Time | When the request was made |
| Dur (s) | How long the request took in seconds |
| Action | The operation type (e.g. `get`, `search`, `upsert`) |
| API ver | The SuiteTalk or REST API version used |
| Status | `FINISHED`, `FAILED`, or other states — colour coded |
| User | The NetSuite user email that made the request |
| OK | Number of records successfully processed |
| Fail | Number of records that failed — shown in red if non-zero |
| Request | Opens the outbound message |
| Response | Opens the inbound response |


## Security and privacy

- The script runs entirely in your browser and makes no external network requests
- All fetches go to your NetSuite domain using your existing session — the same requests your browser would make if you clicked the native links
- Nothing is sent to any third party
- The script does not store, transmit, or log any data
- Closing the overlay or refreshing the page removes it completely


## Limitations

- It does not support sorting or filtering 
- If your session expires while the viewer is open, requests will fail with an HTTP 401 error, simply log back in and reload
- Tested against NetSuite 2026.1; the script parses the native HTML table structure, so a significant UI change in a future release could require an update
