import { PasswordBackupReader, type PasswordBackupItem } from "./services/PasswordBackupReader";
import { Controls } from "./utils/Controls";

const english = {
    title: "Open password backup",
    intro: "Open an exported password ZIP with its export passphrase. No sign-in is required and nothing is uploaded.",
    file: "Exported ZIP file", passphrase: "Export passphrase", unlock: "Unlock backup", lock: "Lock backup",
    entries: "Password entries", search: "Search by name, username or website", choose: "Choose an entry",
    idleHelp: "The backup locks after two minutes of inactivity. Copied passwords and notes may remain on your clipboard.",
    name: "Unnamed entry", username: "Username", website: "Website", notes: "Notes", password: "Password",
    passwordActions: { hidden: "Password hidden", show: "Show password", hide: "Hide password", copy: "Copy password", copied: "Password copied.", copyFailed: "Could not copy the password to the clipboard." },
    notesActions: { hidden: "Notes hidden", show: "Show notes", hide: "Hide notes", copy: "Copy notes", copied: "Notes copied.", copyFailed: "Could not copy the notes to the clipboard." },
    noMatches: "No matching entries.", opening: "Unlocking backup...", locked: "Backup locked.",
    autoLocked: "Backup locked after inactivity.", insecure: "Open this page over HTTPS to unlock a backup.",
    invalid: "Choose a valid exported password ZIP (up to 16 MiB, including after extraction).",
    wrongPassphrase: "The export passphrase is incorrect or the backup is damaged.",
    failed: "Could not open the backup."
};
const german: typeof english = {
    title: "Passwortsicherung öffnen",
    intro: "Öffne eine exportierte Passwort-ZIP mit ihrer Export-Passphrase. Eine Anmeldung ist nicht nötig und nichts wird hochgeladen.",
    file: "Exportierte ZIP-Datei", passphrase: "Export-Passphrase", unlock: "Sicherung entsperren", lock: "Sicherung sperren",
    entries: "Passworteinträge", search: "Nach Name, Benutzername oder Website suchen", choose: "Eintrag auswählen",
    idleHelp: "Die Sicherung wird nach zwei Minuten Inaktivität gesperrt. Kopierte Passwörter und Notizen können in der Zwischenablage bleiben.",
    name: "Unbenannter Eintrag", username: "Benutzername", website: "Website", notes: "Notizen", password: "Passwort",
    passwordActions: { hidden: "Passwort ausgeblendet", show: "Passwort anzeigen", hide: "Passwort ausblenden", copy: "Passwort kopieren", copied: "Passwort kopiert.", copyFailed: "Das Passwort konnte nicht in die Zwischenablage kopiert werden." },
    notesActions: { hidden: "Notizen ausgeblendet", show: "Notizen anzeigen", hide: "Notizen ausblenden", copy: "Notizen kopieren", copied: "Notizen kopiert.", copyFailed: "Die Notizen konnten nicht in die Zwischenablage kopiert werden." },
    noMatches: "Keine passenden Einträge.", opening: "Sicherung wird entsperrt...", locked: "Sicherung gesperrt.",
    autoLocked: "Sicherung wegen Inaktivität gesperrt.", insecure: "Öffne diese Seite über HTTPS, um eine Sicherung zu entsperren.",
    invalid: "Wähle eine gültige exportierte Passwort-ZIP (höchstens 16 MiB, auch nach dem Entpacken).",
    wrongPassphrase: "Die Export-Passphrase ist falsch oder die Sicherung ist beschädigt.",
    failed: "Die Sicherung konnte nicht geöffnet werden."
};

const language = navigator.language.toLowerCase().split("-")[0] === "de" ? "de" : "en";
const text = language === "de" ? german : english;
document.documentElement.lang = language;
document.title = text.title;
for (const node of document.querySelectorAll<HTMLElement>("[data-label]")) {
    const label = text[node.dataset.label as keyof typeof text];
    if (typeof label === "string") node.textContent = label;
}

const form = document.querySelector<HTMLFormElement>("#backup-form")!;
const fileInput = document.querySelector<HTMLInputElement>("#backup-file")!;
const passphraseInput = document.querySelector<HTMLInputElement>("#backup-passphrase")!;
const openButton = document.querySelector<HTMLButtonElement>("#backup-open")!;
const lockButton = document.querySelector<HTMLButtonElement>("#backup-lock")!;
const error = document.querySelector<HTMLParagraphElement>("#backup-error")!;
const status = document.querySelector<HTMLParagraphElement>("#backup-status")!;
const view = document.querySelector<HTMLElement>("#backup-view")!;
const search = document.querySelector<HTMLInputElement>("#backup-search")!;
const choices = document.querySelector<HTMLSelectElement>("#backup-items")!;
const details = document.querySelector<HTMLDivElement>("#backup-details")!;

const inactivityMs = 120_000;
const canUnlock = window.isSecureContext && Boolean(globalThis.crypto?.subtle);
let items: PasswordBackupItem[] = [];
let timer: number | undefined;
let deadline = 0;
let generation = 0;

function showError(message = ""): void {
    error.textContent = message;
    error.hidden = !message;
}

function setOpening(opening: boolean): void {
    fileInput.disabled = passphraseInput.disabled = openButton.disabled = opening;
}

function lock(message: string, focus: boolean): void {
    generation++;
    window.clearTimeout(timer);
    items = [];
    details.replaceChildren();
    choices.replaceChildren();
    search.value = "";
    form.reset();
    view.hidden = true;
    form.hidden = !canUnlock;
    setOpening(false);
    showError();
    status.textContent = message;
    if (focus) fileInput.focus();
}

function checkExpiry(): boolean {
    if (view.hidden) return false;
    if (Date.now() < deadline) return true;
    lock(text.autoLocked, !document.hidden);
    return false;
}

function extendSession(): void {
    deadline = Date.now() + inactivityMs;
    window.clearTimeout(timer);
    timer = window.setTimeout(checkExpiry, inactivityMs);
}

function setIcon(button: HTMLButtonElement, icon: "copy" | "show" | "hide"): void {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", icon === "copy" ? "M9 5h10v15H9z M6 16H5V3h10v2" : "M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z");
    svg.appendChild(path);
    if (icon === "show") {
        const slash = document.createElementNS(svg.namespaceURI, "path");
        slash.setAttribute("d", "M3 3l18 18");
        svg.appendChild(slash);
    }
    button.replaceChildren(svg);
}

function renderSecret(list: HTMLElement, label: string, value: string, id: string, actions: typeof text.passwordActions): void {
    Controls.createElement(list, "dt", "", label);
    const row = Controls.createElement(list, "dd", "d-flex align-items-start gap-2");
    const secret = Controls.createElement(row, "span", "backup-secret flex-grow-1 text-break user-select-none", actions.hidden, id);
    const copy = Controls.createButton(row, "button", "", "btn btn-outline-secondary btn-sm flex-shrink-0");
    copy.title = actions.copy;
    copy.setAttribute("aria-label", actions.copy);
    setIcon(copy, "copy");
    const reveal = Controls.createButton(row, "button", "", "btn btn-outline-secondary btn-sm flex-shrink-0");
    reveal.title = actions.show;
    reveal.setAttribute("aria-label", actions.show);
    reveal.setAttribute("aria-controls", secret.id);
    reveal.setAttribute("aria-expanded", "false");
    setIcon(reveal, "show");
    reveal.addEventListener("click", () => {
        if (!checkExpiry()) return;
        const showing = reveal.getAttribute("aria-expanded") !== "true";
        secret.textContent = showing ? value : actions.hidden;
        reveal.title = showing ? actions.hide : actions.show;
        reveal.setAttribute("aria-label", reveal.title);
        reveal.setAttribute("aria-expanded", String(showing));
        setIcon(reveal, showing ? "hide" : "show");
    });
    copy.addEventListener("click", async () => {
        if (!checkExpiry()) return;
        showError();
        status.textContent = "";
        try {
            await navigator.clipboard.writeText(value);
            if (copy.isConnected && checkExpiry()) status.textContent = actions.copied;
        } catch {
            if (copy.isConnected && checkExpiry()) showError(actions.copyFailed);
        }
    });
}

function renderDetails(): void {
    details.replaceChildren();
    status.textContent = "";
    showError();
    const item = choices.value !== "" ? items[Number(choices.value)] : undefined;
    if (!item) {
        status.textContent = text.noMatches;
        return;
    }
    const list = Controls.createElement(details, "dl", "text-break");
    for (const [label, value] of [[text.username, item.Login], [text.website, item.Url]]) {
        if (!value) continue;
        Controls.createElement(list, "dt", "", label);
        Controls.createElement(list, "dd", "text-break", value);
    }
    if (item.Description) renderSecret(list, text.notes, item.Description, "backup-notes", text.notesActions);
    renderSecret(list, text.password, item.Password, "backup-secret", text.passwordActions);
}

function renderChoices(): void {
    const query = search.value.trim().toLocaleLowerCase(language);
    const options = document.createDocumentFragment();
    items.forEach((item, index) => {
        if (![item.Name, item.Login, item.Url].some(value => value.toLocaleLowerCase(language).includes(query))) return;
        options.append(new Option([item.Name || text.name, item.Login, item.Url].filter(Boolean).join(" — "), String(index)));
    });
    choices.replaceChildren(options);
    choices.disabled = choices.options.length === 0;
    renderDetails();
}

form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!canUnlock || openButton.disabled) return;
    const file = fileInput.files?.[0];
    const passphrase = passphraseInput.value;
    if (!file || !passphrase) return;
    passphraseInput.value = "";
    showError();
    setOpening(true);
    status.textContent = text.opening;
    const request = ++generation;
    try {
        const decoded = await PasswordBackupReader.readAsync(file, passphrase);
        if (request !== generation) return;
        items = decoded;
        form.reset();
        form.hidden = true;
        view.hidden = false;
        extendSession();
        renderChoices();
        search.focus();
    } catch (failure: unknown) {
        if (request !== generation) return;
        const code = failure instanceof Error ? failure.message : "";
        status.textContent = "";
        showError(code === "ERROR_IMPORT_PASSPHRASE" ? text.wrongPassphrase : code === "ERROR_IMPORT_ARCHIVE" ? text.invalid : text.failed);
    } finally {
        if (request === generation) setOpening(false);
    }
});

lockButton.addEventListener("click", () => lock(text.locked, true));
search.addEventListener("input", () => { if (checkExpiry()) renderChoices(); });
choices.addEventListener("change", () => { if (checkExpiry()) renderDetails(); });
for (const event of ["pointerdown", "keydown", "input"] as const) {
    view.addEventListener(event, () => { if (checkExpiry()) extendSession(); });
}
document.addEventListener("visibilitychange", checkExpiry);
window.addEventListener("pagehide", () => lock("", false));

if (canUnlock) form.hidden = false;
else showError(text.insecure);
