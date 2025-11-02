import { PageContext } from "../PageContext";
import { SettingsTabType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { AppointmentTab } from "./AppointmentTab";
import { BirthdayTab } from "./BirthdayTab";
import { ContactTab } from "./ContactTab";
import { DesktopTab } from "./DesktopTab";
import { DiaryTab } from "./DiaryTab";
import { DocumentTab } from "./DocumentTab";
import { NoteTab } from "./NoteTab";
import { PasswordTab } from "./PasswordTab";
import { SettingsTab } from "./SettingsTab";

export class ViewSettingsTab implements SettingsTab {
    tabType: SettingsTabType = "VIEW_SETTINGS";
    bootstrapIcon: string = "bi-sliders";

    async renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            await this.renderEditAsync(parent, pageContext);
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    private async renderEditAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate("VIEW_SETTINGS"));
        const grid: HTMLDivElement = Controls.createDiv(parent, "card p-4 shadow-sm");
        grid.style.maxWidth = "400px";
        // select theme
        const divRow1: HTMLDivElement = Controls.createDiv(grid, "row g-3 align-items-center mb-3");
        const divCol11: HTMLDivElement = Controls.createDiv(divRow1, "col-4");
        const divCol12: HTMLDivElement = Controls.createDiv(divRow1, "col-4");
        const divCol13: HTMLDivElement = Controls.createDiv(divRow1, "col-4");
        Controls.createSpan(divCol11, "form-check-label", pageContext.locale.translate("LABEL_DESIGN"));
        const divLight: HTMLDivElement = Controls.createDiv(divCol12, "form-check");
        const radioLight: HTMLInputElement = Controls.createInput(divLight, "radio", "light-id", "form-check-input");
        radioLight.name = "radioTheme";
        radioLight.addEventListener("click", (_: Event) => pageContext.theme.set("light"));
        Controls.createLabel(divLight, "light-id", "form-check-label", pageContext.locale.translate("LABEL_LIGHT"));
        const divDark: HTMLDivElement = Controls.createDiv(divCol13, "form-check");
        const radioDark: HTMLInputElement = Controls.createInput(divDark, "radio", "dark-id", "form-check-input");
        radioDark.name = "radioTheme";
        radioDark.addEventListener("click", (_: Event) => pageContext.theme.set("dark"));
        Controls.createLabel(divDark, "dark-id", "form-check-label", pageContext.locale.translate("LABEL_DARK"));
        if (pageContext.theme.isLight()) {
            radioLight.checked = true;
        } else {
            radioDark.checked = true;
        }
        // select language
        const divRow2: HTMLDivElement = Controls.createDiv(grid, "row g-3 align-items-center");
        const divCol21: HTMLDivElement = Controls.createDiv(divRow2, "col-4");
        const divCol22: HTMLDivElement = Controls.createDiv(divRow2, "col-4");
        const divCol23: HTMLDivElement = Controls.createDiv(divRow2, "col-4");
        Controls.createSpan(divCol21, "form-check-label", pageContext.locale.translate("LABEL_LANGUAGE"));
        const divGerman: HTMLDivElement = Controls.createDiv(divCol22, "form-check");
        const radioGerman: HTMLInputElement = Controls.createInput(divGerman, "radio", "german-id", "form-check-input");
        radioGerman.name = "radioLanguage";
        radioGerman.addEventListener("click", async (e: Event) => {
            e.preventDefault();
            await pageContext.locale.setLanguageAsync("de");
            await pageContext.renderAsync();
        });
        Controls.createLabel(divGerman, "german-id", "form-check-label", pageContext.locale.translate("LABEL_GERMAN"));
        const divEnglish: HTMLDivElement = Controls.createDiv(divCol23, "form-check");
        const radioEnglish: HTMLInputElement = Controls.createInput(divEnglish, "radio", "english-id", "form-check-input");
        radioEnglish.name = "radioLanguage";
        radioEnglish.addEventListener("click", async (e: Event) => {
            e.preventDefault();
            await pageContext.locale.setLanguageAsync("en");
            await pageContext.renderAsync();
        });
        Controls.createLabel(divEnglish, "english-id", "form-check-label", pageContext.locale.translate("LABEL_ENGLISH"));
        if (pageContext.locale.getLanguage() == "de") {
            radioGerman.checked = true;
        } else {
            radioEnglish.checked = true;
        }
        if (pageContext.authenticationClient.isLoggedIn()) {
            this.renderApplications(pageContext, grid);
        }
    }

    private renderApplications(pageContext: PageContext, grid: HTMLElement): void {
        const divRow3: HTMLDivElement = Controls.createDiv(grid, "row mt-3");
        const divCol3: HTMLDivElement = Controls.createDiv(divRow3, "col");
        const divRow4: HTMLDivElement = Controls.createDiv(grid, "row mt-3");
        const divCol4: HTMLDivElement = Controls.createDiv(divRow4, "col");
        Controls.createLabel(divCol3, "applications-id", "form-check-label", pageContext.locale.translate("LABEL_APPLICATIONS"));
        const listGroup: HTMLElement = Controls.createElement(divCol4, "ul", "list-group");
        listGroup.id = "list-group-id";
        const li: HTMLElement = Controls.createElement(listGroup, "li", "list-group-item");
        const checkBoxSelectAll: HTMLInputElement = Controls.createInput(li, "checkbox", "selectall-id", "form-check-input me-4 mt-2");
        const desktopTabs: DesktopTab[] = [new BirthdayTab(), new ContactTab(), new NoteTab(), new PasswordTab(), new DiaryTab(), new DocumentTab(), new AppointmentTab()];
        desktopTabs.forEach(desktopTab => {
            const li: HTMLElement = Controls.createElement(listGroup, "li", "list-group-item d-flex justify-content-between align-items-start");
            const checkBoxSelectItem: HTMLInputElement = Controls.createInput(li, "checkbox", `item-select-id-${desktopTab.tabType}`, "form-check-input me-2 mt-1 item-select");
            Controls.createSpan(li, `bi ${desktopTab.bootstrapIcon}`);
            Controls.createSpan(li, "ms-2 me-auto", `${pageContext.locale.translate(desktopTab.titleKey)}`);
            checkBoxSelectItem.addEventListener("click", (_: Event) => this.onSaveApplications(pageContext));
        });
        checkBoxSelectAll.addEventListener("click", (e: Event) => this.onSelectAllApplications(e, pageContext));
        this.initApplicationCheckBoxes(pageContext);
    }

    private onSelectAllApplications(e: Event, pageContext: PageContext): void {
        const input: HTMLInputElement = e.target as HTMLInputElement;
        const checked: boolean = input.checked;
        document.querySelectorAll(".item-select").forEach(
            elem => {
                const input: HTMLInputElement = elem as HTMLInputElement;
                if (input.checked != checked) {
                    input.checked = checked;
                }
            });
        this.onSaveApplications(pageContext);
    }

    private onSaveApplications(pageContext: PageContext): void {
        const selectedApps: string[] = [];
        document.querySelectorAll(".item-select").forEach(
            elem => {
                const input: HTMLInputElement = elem as HTMLInputElement;
                if (input.checked) {
                    const idParts: string[] = input.id.split("-");
                    const appId: string = idParts[idParts.length - 1];
                    selectedApps.push(appId);
                }
            });
        pageContext.settings.setDesktopApplications(selectedApps);
        this.initSelectAllApplicationsCheckbox();
    }

    private initApplicationCheckBoxes(pageContext: PageContext): void {
        const apps: string[] | null = pageContext.settings.getDesktopApplications();
        document.querySelectorAll(".item-select").forEach(
            elem => {
                const input: HTMLInputElement = elem as HTMLInputElement;
                input.checked = apps == null;
            });
        if (apps != null) {
            apps.filter(app => pageContext.desktop.isValidTabType(app))
                .forEach(app => {
                    const input: HTMLInputElement | null = document.getElementById(`item-select-id-${app}`) as HTMLInputElement;
                    if (input) {
                        input.checked = true;
                    }
                });
        }
        this.initSelectAllApplicationsCheckbox();
    }

    private initSelectAllApplicationsCheckbox(): void {
        const allSelected: boolean = Array.from(document.querySelectorAll(".item-select")).every(
            elem => {
                const input: HTMLInputElement = elem as HTMLInputElement;
                return input.checked;
            });
        const selectAllCheckbox: HTMLInputElement = document.getElementById("selectall-id") as HTMLInputElement;
        selectAllCheckbox.checked = allSelected;
    }
}