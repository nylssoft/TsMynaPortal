# Third-Party Notices

This document lists the principal third-party software and services used by TsMynaPortal. The full direct and transitive npm dependency tree, including the license metadata reported for locked package versions, is recorded in [`package-lock.json`](../package-lock.json). Review the applicable upstream license and notices when redistributing dependencies or build artifacts.

## Browser libraries and assets

| Component | Use | License / terms |
| --- | --- | --- |
| [Bootstrap 5](https://getbootstrap.com/) | UI styles and JavaScript bundle, loaded from jsDelivr | [MIT License](https://github.com/twbs/bootstrap/blob/main/LICENSE) |
| [Bootstrap Icons](https://icons.getbootstrap.com/) | User-interface icons and icon font, loaded from jsDelivr | [MIT License](https://github.com/twbs/icons/blob/main/LICENSE) |
| [DOMPurify](https://github.com/cure53/DOMPurify) | Sanitizes locally rendered Markdown | [Apache License 2.0](https://github.com/cure53/DOMPurify/blob/main/LICENSE) or [Mozilla Public License 2.0](https://github.com/cure53/DOMPurify/blob/main/LICENSE-MPL) |
| [fflate](https://github.com/101arrowz/fflate) | Creates and reads ZIP archives for data export/import | [MIT License](https://github.com/101arrowz/fflate/blob/master/LICENSE) |
| [Friendly Captcha SDK](https://github.com/FriendlyCaptcha/friendly-captcha-sdk) | Browser CAPTCHA widget, loaded from jsDelivr | [Mozilla Public License 2.0](https://www.mozilla.org/MPL/2.0/); the [Friendly Captcha service](https://friendlycaptcha.com/) is subject to its [Terms of Use](https://friendlycaptcha.com/legal/terms/) |
| [markdown-it](https://github.com/markdown-it/markdown-it) | Renders Markdown previews in the browser | [MIT License](https://github.com/markdown-it/markdown-it/blob/master/LICENSE) |
| [Popper](https://popper.js.org/) | Positioning engine used by Bootstrap | [MIT License](https://github.com/floating-ui/floating-ui/blob/master/LICENSE.md) |
| [qrcode.js](https://github.com/davidshimjs/qrcodejs) | QR-code generation, loaded from cdnjs | [MIT License](https://github.com/davidshimjs/qrcodejs/blob/master/LICENSE) |

## Build tools

| Component | Use | License |
| --- | --- | --- |
| [Sass](https://sass-lang.com/) | Compiles styles during the build | [MIT License](https://github.com/sass/dart-sass/blob/main/LICENSE) |
| [TypeScript](https://www.typescriptlang.org/) | Type-checks and compiles the client | [Apache License 2.0](https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt) |
| [Vite](https://vite.dev/) | Development server and production bundler | [MIT License](https://github.com/vitejs/vite/blob/main/LICENSE) |
| [tsc-watch](https://github.com/gilamran/tsc-watch) | TypeScript watch support for development | [MIT License](https://github.com/gilamran/tsc-watch/blob/master/LICENSE) |

## External data

- [Open-Meteo](https://open-meteo.com/) provides weather data used by the portal. The service data is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The portal displays the requested attribution: “Weather data by [Open-Meteo.com](https://open-meteo.com/).” The service is also subject to [Open-Meteo's terms](https://open-meteo.com/en/terms).

For the license terms applying to TsMynaPortal itself, see the repository's [`LICENSE`](../LICENSE) file.
