import { Controls } from "./utils/Controls";

declare const __PWA_ENABLED__: boolean;

export class Pwa {
    static async registerAsync(): Promise<void> {
        if (!__PWA_ENABLED__ || !("serviceWorker" in navigator)) return;
        let notice: HTMLDivElement | null = null;
        let updateRequested = false;
        const text = (english: string, german: string): string =>
            (localStorage.getItem("locale") || navigator.language).toLowerCase().startsWith("de") ? german : english;
        const showError = (error: unknown): void => {
            console.error("Service worker error:", error);
            if (notice) return;
            notice = Controls.createDiv(document.body, "alert alert-warning position-fixed bottom-0 end-0 m-3 shadow");
            notice.setAttribute("role", "alert");
            Controls.createSpan(notice, "me-2", text("App updates are unavailable. Reload the page to try again.", "App-Updates sind nicht verfügbar. Lade die Seite erneut, um es noch einmal zu versuchen."));
            const close = Controls.createButton(notice, "button", "", "btn-close");
            close.setAttribute("aria-label", text("Close", "Schließen"));
            close.addEventListener("click", () => { notice?.remove(); notice = null; });
        };
        try {
            const registration = await navigator.serviceWorker.register(new URL("service-worker.js", document.baseURI).href, { updateViaCache: "none" });
            const showUpdate = (): void => {
                if (notice) notice.remove();
                notice = Controls.createDiv(document.body, "alert alert-info position-fixed bottom-0 end-0 m-3 shadow");
                notice.setAttribute("role", "status");
                Controls.createParagraph(notice, "mb-2", text("An update is available. Save your changes before reloading.", "Ein Update ist verfügbar. Speichere deine Änderungen vor dem Neuladen."));
                const reload = Controls.createButton(notice, "button", text("Reload", "Neu laden"), "btn btn-primary btn-sm me-2");
                const later = Controls.createButton(notice, "button", text("Later", "Später"), "btn btn-outline-secondary btn-sm");
                later.addEventListener("click", () => { notice?.remove(); notice = null; });
                reload.addEventListener("click", () => {
                    const waiting = registration.waiting;
                    if (!waiting) {
                        window.location.reload();
                    } else {
                        updateRequested = true;
                        waiting.postMessage("ACTIVATE_UPDATE");
                    }
                });
            };
            const watchWorker = (worker: ServiceWorker | null): void => {
                if (!worker) return;
                const checkState = (): void => {
                    if (worker.state === "installed" && navigator.serviceWorker.controller) showUpdate();
                };
                worker.addEventListener("statechange", checkState);
                checkState();
            };
            registration.addEventListener("updatefound", () => watchWorker(registration.installing));
            watchWorker(registration.installing);
            if (registration.waiting && navigator.serviceWorker.controller) showUpdate();
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                if (updateRequested) {
                    updateRequested = false;
                    window.location.reload();
                }
            });
            document.addEventListener("visibilitychange", () => {
                if (document.visibilityState === "visible") void registration.update().catch(showError);
            });
        } catch (error: unknown) {
            showError(error);
        }
    }
}
