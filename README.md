# Web client for stockfleth.eu

Provides a web client for the website provided by [API Server](https://github.com/nylssoft/MynaAPIServer).
The portal provides applications to securly manage notes, contacts, passwords, diary entries, documents and appointments.
The About page shows the client version and the running API server version retrieved from `GET /api/version`.

## Build

Use Node.js 24 and run `npm ci` followed by `npm run build`. The production client is generated in `dist`.

On GitHub, select **Actions > Build TsMynaPortal > Run workflow** to build the client. The workflow runs on Ubuntu and uploads the contents of `dist` as the downloadable `tsmynaportal-<run number>` artifact.

## Settings

Signed-in users can open the Account information tab (info icon) in Settings to view their previous login date and time and storage usage versus quota, including zero usage. The desktop no longer displays the welcome information panel.

## Documents

The Documents tab opens in browsing mode without selection checkboxes. Use the selection icon beside the heading to show item checkboxes and select-all. Selected items enable rename, move and delete actions. Turning selection mode off clears the selection; navigating to another folder or reopening the tab returns to browsing mode. Names still open documents and folders while selection mode is enabled.

Administrators (`usermanager`) can select one owned folder and use the sharing icon to choose Private, Family or Public, then Save. People/globe icons identify shared items. Public files require no login to download; family files require the `family` role. New uploads directly into shared folders are unencrypted and inherit the folder's visibility; private uploads remain encrypted. Changing folder visibility does not change existing files or subfolders, and moving items does not change their visibility or encryption. New subfolders are private.

Select one shared `.md` file and use Edit Markdown content to open the full-width editor. Save updates the existing document; leaving with unsaved edits requires confirmation. Private encrypted Markdown files cannot be edited this way. These features use the existing document download, folder access-role and Markdown update endpoints (the API's public access-role value is spelled `everbody`).

## Administration

Signed-in users with the `usermanager` role can open Administration from the navigation menu. Registration requests and Registered users have separate tabs; selecting either tab reloads its data, including selecting the active tab. Under Registration requests, select one or more requests to approve or reject them, optionally sending email notifications. Approval displays the registration code. Approved requests remain listed until the applicant registers and can be approved again to retrieve the existing code. Results are shown per request; if an operation fails, check its state before retrying because the server may have saved the change before a notification failed.

Under Registered users, open an account in its own details page to see its profile image and storage usage, change its quota, login permission or roles, or unlock it. The back arrow returns to the refreshed Registered users tab. Select accounts to delete them after confirmation; the result is reported for each account. To delete your own account, use Account Settings instead. The server enforces administrator permissions and its account-protection rules.

## Weather

The Weather desktop tab lets signed-in users search for a city and view current conditions and the next 24 hours. Click the search icon beside the heading and press Enter to search. Select a location if several match; scroll the forecast horizontally or use the arrow buttons. The last successfully resolved location ID is stored in this browser's local storage; opening the weather tab on a later visit automatically retrieves a fresh forecast for that location. Location names use the selected language when translations are available; times are shown in the location's time zone. If the tab is hidden by a customized application list, enable it in View Settings. This feature requires an API Server version with `GET /api/weather`; city searches are sent to Open-Meteo. Weather data is provided by [Open-Meteo](https://open-meteo.com/) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
