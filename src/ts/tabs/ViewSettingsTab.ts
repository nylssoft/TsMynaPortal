import { PageContext } from "../PageContext";
import { SettingsTabType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
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
    }
}