import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { PageType, UserInfoResult } from "../TypeDefinitions";
import { DocumentService } from "../services/DocumentService";

/**
 * Page implementation for the About page.
 */
export class SettingsPage implements Page {

    pageType: PageType = "SETTINGS";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const userDetails: UserInfoResult = await pageContext.authenticationClient.getUserInfoWithDetailsAsync();
        const grid: HTMLDivElement = Controls.createDiv(parent, "card p-4 shadow-sm");
        grid.style.maxWidth = "400px";
        // storage info
        const divRowStorage: HTMLDivElement = Controls.createDiv(grid, "row align-items-center");
        const divColStorage: HTMLDivElement = Controls.createDiv(divRowStorage, "col");
        const storageMsg: string = pageContext.locale.translateWithArgs("INFO_STORAGE_1_2", [ DocumentService.formatSize(userDetails.usedStorage), DocumentService.formatSize(userDetails.storageQuota)]);
        Controls.createParagraph(divColStorage, undefined, storageMsg);
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
        // switch keep login
        const divRowKeepLogin: HTMLDivElement = Controls.createDiv(grid, "row mt-3");
        const divColKeepLogin: HTMLDivElement = Controls.createDiv(divRowKeepLogin, "col");
        const divSwitchKeepLogin: HTMLDivElement = Controls.createDiv(divColKeepLogin, "form-check form-switch");
        const switchKeepLogin: HTMLInputElement = Controls.createInput(divSwitchKeepLogin, "checkbox", "switch-keep-login-id", "form-check-input");
        switchKeepLogin.role = "switch";
        Controls.createLabel(divSwitchKeepLogin, "switch-keep-login-id", "form-check-label", pageContext.locale.translate("OPTION_KEEP_LOGIN"));
        switchKeepLogin.checked = userDetails.useLongLivedToken;
        switchKeepLogin.addEventListener("change", async (_: Event) => {
            await pageContext.authenticationClient.updateKeepLoginAsync(switchKeepLogin.checked);
            await pageContext.renderAsync();
        });
        if (userDetails.useLongLivedToken) {
            switchKeepLogin.checked = true;
            const divRowUsePin: HTMLDivElement = Controls.createDiv(grid, "row mt-3");
            const divColUsePin: HTMLDivElement = Controls.createDiv(divRowUsePin, "col");
            const divSwitchUsePin: HTMLDivElement = Controls.createDiv(divColUsePin, "form-check form-switch");
            const switchUsePin: HTMLInputElement = Controls.createInput(divSwitchUsePin, "checkbox", "switch-use-pin-id", "form-check-input");
            switchUsePin.role = "switch";
            Controls.createLabel(divSwitchUsePin, "switch-use-pin-id", "form-check-label", pageContext.locale.translate("OPTION_PIN"));
            if (userDetails.usePin) {
                switchUsePin.checked = true;
                const divRowSetPin: HTMLDivElement = Controls.createDiv(grid, "row mt-3 align-items-center");
                const divColSetPin: HTMLDivElement = Controls.createDiv(divRowSetPin, "col");
                Controls.createButton(divColSetPin, "button", pageContext.locale.translate("BUTTON_SET_PIN"), "btn btn-primary");
            }
        }
        // switch 2FA
        const divRow2FA: HTMLDivElement = Controls.createDiv(grid, "row mt-3");
        const divCol2FA: HTMLDivElement = Controls.createDiv(divRow2FA, "col");
        const divSwitch2FA: HTMLDivElement = Controls.createDiv(divCol2FA, "form-check form-switch");
        const input2FA: HTMLInputElement = Controls.createInput(divSwitch2FA, "checkbox", "switch-2fa-id", "form-check-input");
        input2FA.role = "switch";
        Controls.createLabel(divSwitch2FA, "switch-2fa-id", "form-check-label", pageContext.locale.translate("OPTION_TWO_FACTOR"));
        input2FA.checked = userDetails.requires2FA;
        // switch allow password reset
        const divRowAllowPwdReset: HTMLDivElement = Controls.createDiv(grid, "row mt-3");
        const divColAllowPwdReset: HTMLDivElement = Controls.createDiv(divRowAllowPwdReset, "col");
        const divSwitchAllowPwdReset: HTMLDivElement = Controls.createDiv(divColAllowPwdReset, "form-check form-switch");
        const inputAllowPwdReset: HTMLInputElement = Controls.createInput(divSwitchAllowPwdReset, "checkbox", "switch-allowpwd-reset-id", "form-check-input");
        inputAllowPwdReset.role = "switch";
        Controls.createLabel(divSwitchAllowPwdReset, "switch-allowpwd-reset-id", "form-check-label", pageContext.locale.translate("OPTION_ALLOW_RESET_PWD"));
        inputAllowPwdReset.checked = userDetails.allowResetPassword;
        inputAllowPwdReset.addEventListener("change", async (_: Event) => {
            await pageContext.authenticationClient.updateAllowPasswordResetAsync(inputAllowPwdReset.checked);
            await pageContext.renderAsync();
        });
        // change password button
        const divRowChangePwd: HTMLDivElement = Controls.createDiv(grid, "row mt-3 align-items-center");
        const divColChangePwd: HTMLDivElement = Controls.createDiv(divRowChangePwd, "col");
        Controls.createButton(divColChangePwd, "button", pageContext.locale.translate("BUTTON_CHANGE_PWD"), "btn btn-primary");
    }
}
