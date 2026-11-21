# TsMynaPortal

TsMynaPortal is the web client for [stockfleth.eu](https://stockfleth.eu/), a private portal for family and friends. It brings everyday tools together: keep personal records, find a date that works for a group, check the weather, and back up your data.

This repository contains the browser application, built with TypeScript, Bootstrap, and Vite. The companion [MynaAPIServer](https://github.com/nylssoft/MynaAPIServer) handles sign-in, storage, and server-side permissions. The standalone password-backup reader can open an exported backup without connecting to that API.

## Getting started

The welcome page is available in English and German. Returning users can **Sign in**; family and friends who do not yet have access can choose **Request an account**. Requests require approval before registration. Most tools are on the signed-in desktop. An existing session opens the desktop directly, and a pending PIN or two-factor prompt resumes instead of returning to the welcome page.

## What you can do

| Tool | What it is for |
| --- | --- |
| **Notes and diary** | Keep notes for things you want to remember and write dated diary entries. |
| **Contacts and birthdays** | Keep contact details together and see upcoming birthdays recorded in your contacts. |
| **Passwords** | Store website logins and make a separately encrypted backup that you can read without signing in. |
| **Documents** | Organize files in folders, preview supported images, PDFs, and text files in the browser, or download them. Rename, move, and delete selected items. |
| **Appointments** | Propose dates and share a voting link so participants can indicate when they are available. |
| **Weather** | Search for a city to see current conditions, an hourly forecast for the next 24 hours, or a seven-day forecast. |

Use **Settings > View settings** to choose a language, a light or dark theme, and which desktop apps are visible. **Account information** shows the previous sign-in and storage usage against the account quota. **Account settings** includes profile and sign-in options such as staying signed in, PIN, and two-factor authentication.

### Documents and sharing

The Documents tab opens in browsing mode. Turn on selection mode to rename, move, delete, or download items. Downloading one file preserves its name; selecting multiple items or a folder creates a ZIP of the selection, including nested and empty folders. ZIP paths use sanitized, ID-prefixed names, as in document exports. Private files are decrypted in the browser, so the ZIP is unencrypted; store it securely. Large selections are assembled in browser memory. The mode lasts until you turn it off or reload the page; the selected items are cleared when the list reloads.

Markdown files are rendered locally in the preview. Switch between **Rendered** and **Source**, or download the original file. For privacy, images in Markdown are not loaded, including relative images; only their alternative text is shown. Absolute HTTP(S) and email links can be opened explicitly; relative links are not followed. Raw HTML is displayed as text, not executed.

Users with the `usermanager` role can set an owned folder to **Private**, **Family**, or **Public**. Family files are available to signed-in users with the `family` role; public files can be downloaded without signing in. Private uploads are encrypted, while new files uploaded directly into shared folders are unencrypted and inherit the folder's visibility. Changing folder visibility does not update existing files or subfolders. Moving items does not change their visibility or encryption, and new subfolders start private. Administrators can edit shared Markdown files in the browser and switch between editing and a rendered preview of unsaved changes. The preview uses the same privacy restrictions described above. Private encrypted Markdown files cannot be edited with that editor.

### Weather forecasts

Search by city name and select a location if several match. Forecast cards scroll horizontally, and you can switch between hourly and daily views without another request. Times use the city's time zone. Hourly cards show wind speed when available; the daily view covers today and the next six days and includes temperature ranges, maximum precipitation probability, and maximum wind speed. The browser remembers the last successfully selected location and fetches a fresh forecast when you reopen Weather.

Weather requires the authenticated `GET /api/weather` endpoint. Use a compatible API version that supplies the `daily` and hourly `windSpeedKph` fields for those views. The API sends city searches to [Open-Meteo](https://open-meteo.com/), which provides weather data under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Back up and restore your data

**Settings > Export data** creates a ZIP for one data type at a time. The browser assembles the archive and handles the download; a download link remains available if automatic downloading is blocked. The archive is ready when the export completes, but the browser does not confirm that the file has been saved. Store ZIP files securely: **only the password export is encrypted**. Notes and other account data that are decrypted for export are readable in the resulting archive.

| Data type | What's in the ZIP | What happens when you import |
| --- | --- | --- |
| **Notes** | One UTF-8 text file per note under `notes/`. | Adds notes; repeated imports can create duplicates. |
| **Diary** | One UTF-8 `diary/yyyy-MM-dd.txt` file per recorded date. | Skips dates that already have an entry. |
| **Contacts** | Full data in `contacts/contacts.json` plus a spreadsheet-friendly `contacts/contacts.csv`. | Restores from JSON, not CSV; repeated imports can create duplicates. |
| **Passwords** | `passwords/passwords.encrypted.json`, protected by an export passphrase of at least 12 characters. | Adds password items after you enter the export passphrase; repeated imports can create duplicates. |
| **Documents** | The owned folder tree under `documents/`, including empty folders. | Restores files and folders as private, renaming conflicting files instead of overwriting them. |

To restore data, open **Settings > Import data**, select the type, and choose its ZIP. A data-protection key is required. If the selected type already contains data, the portal asks for confirmation before proceeding. Imports are not transactional: if one fails, check what was imported before retrying. Avoid running imports concurrently from multiple sessions. The importer accepts at most 10,000 entries and limits both the ZIP size and total extracted size to 512 MiB (16 MiB for password backups). Large archives may require substantially more browser memory than their ZIP size.

### Read a password backup without importing

Choose **Open password backup** on the welcome page, the sign-in page, or **Settings > Export data > Passwords**. You can also open [`password-backup.html`](https://stockfleth.eu/password-backup.html) directly over HTTPS. Select the ZIP and enter the passphrase you set when exporting; it is not stored and cannot be recovered.

The reader needs no account. It decrypts the archive locally and keeps unlocked data in memory without uploading or saving it. Search by name, username, or website and reveal or copy individual passwords. **Lock backup** clears the unlocked view; it also locks after two minutes of inactivity or when you leave the page. A copied password can remain in your clipboard. The same 16 MiB password-backup limit applies to the reader.

<details>
<summary>Password backup format</summary>

The version-1 JSON envelope uses `format: myna-passwords`, `cipher: AES-256-GCM`, `kdf: PBKDF2-SHA256`, and `iterations: 600000`. The `salt` (16 bytes), `iv` (12 bytes), and `ciphertext` fields are hex-encoded. The UTF-8 passphrase is used to derive a 256-bit key. The final 16 bytes of `ciphertext` are the GCM authentication tag; no additional authenticated data is used. Each export generates a fresh salt and IV. The decrypted UTF-8 JSON has the shape `{ version: 1, items: [...] }`, with `Name`, `Login`, `Password`, `Description`, and `Url` fields on each item.

</details>

## Administration

The **Administration** menu is available to signed-in users with the `usermanager` role. **Registration requests** lets administrators approve or reject requests and optionally send email notifications. Approval displays the registration code, which remains available until the applicant registers. If a notification fails, check the request status before retrying; the decision may already have been saved.

**Registered users** lets administrators view account and storage details, adjust quotas and roles, allow or block sign-in, unlock accounts, and delete accounts after confirmation. Quota changes save when the edited field is committed. The API enforces administrative permissions and account-protection rules.

## Development and builds

Use Node.js 24. For local development, start [MynaAPIServer](https://github.com/nylssoft/MynaAPIServer) with its HTTP endpoint on `localhost:5000`, then run these commands from this repository:

```shell
npm ci
npm start
```

Open [http://localhost:8080](http://localhost:8080). Vite proxies API, translation, and profile-image requests to the local backend; adjust `vite.config.js` if your backend uses a different address.

Run `npm run build` to type-check the client and generate static files in `dist`. The build includes both `index.html` and `password-backup.html`. When deploying, serve the contents over HTTPS and configure the site to route the portal's API and related backend requests to MynaAPIServer. The **About** page shows the client version and the running API version from `GET /api/version`.

To build on GitHub, open **Actions > Build TsMynaPortal > Run workflow**. The workflow builds on Ubuntu with Node.js 24 and publishes `dist` as the `tsmynaportal-<run number>` artifact.
