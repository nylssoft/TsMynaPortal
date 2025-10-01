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
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        alertDiv.id = "alertdiv-id";
        try {
            await this.renderEditAsync(parent, pageContext);
        }
        catch (error: Error | unknown) {
            this.handleError(error, pageContext);
        }
    }

    private handleError(error: Error | unknown, pageContext: PageContext) {
        const alertDiv: HTMLDivElement = document.getElementById("alertdiv-id") as HTMLDivElement;
        Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
    }

    private async renderEditAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
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
            const userDetails: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync()!;
            this.renderUserSettings(pageContext, parent, grid, userDetails);
        }
    }

    private renderUserSettings(pageContext: PageContext, parent: HTMLElement, grid: HTMLElement, userDetails: UserInfoResult): void {
        this.renderProfilPhoto(pageContext, parent, grid, userDetails);
        // email
        const divRowEmail: HTMLDivElement = Controls.createDiv(grid, "row mt-3");
        const divColEmail: HTMLDivElement = Controls.createDiv(divRowEmail, "col");
        Controls.createLabel(divColEmail, "email-id", "form-check-label", pageContext.locale.translate("LABEL_EMAIL_ADDRESS"));
        const divRowEmailInput: HTMLDivElement = Controls.createDiv(grid, "row mt-1");
        const divColEmailInput: HTMLDivElement = Controls.createDiv(divRowEmailInput, "col");
        const inputEmail: HTMLInputElement = Controls.createInput(divColEmailInput, "text", "email-id", "form-control", userDetails.email);
        inputEmail.setAttribute("autocomplete", "off");
        inputEmail.setAttribute("spellcheck", "false");
        inputEmail.addEventListener("change", async (e: Event) => this.onChangeEmailAsync(e, pageContext));
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
                switchUsePin.addEventListener("change", async (_: Event) => {
                    await pageContext.authenticationClient.updatePinAsync("");
                    await pageContext.renderAsync();
                });
            } else {
                switchUsePin.addEventListener("change", async (_: Event) => {
                    pageContext.pageType = "PIN_EDIT";
                    pageContext.settings.pinChanged = false;
                    await pageContext.renderAsync();
                });
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
        if (userDetails.requires2FA) {
            input2FA.setAttribute("data-bs-target", "#confirmationdialog-id");
            input2FA.setAttribute("data-bs-toggle", "modal");
            input2FA.addEventListener("click", (e: Event) => e.preventDefault());
        } else {
            input2FA.addEventListener("change", async (_: Event) => {
                pageContext.pageType = "TWO_FACTOR_EDIT";
                pageContext.settings.twoFactorChanged = false;
                await pageContext.renderAsync();
            });
        }
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
        // switch allow delete account
        const divRowAllowDeleteAccount: HTMLDivElement = Controls.createDiv(grid, "row mt-3");
        const divColAllowDeleteAccount: HTMLDivElement = Controls.createDiv(divRowAllowDeleteAccount, "col");
        const divSwitchAllowDeleteAccount: HTMLDivElement = Controls.createDiv(divColAllowDeleteAccount, "form-check form-switch");
        const inputAlloweDeleteAccount: HTMLInputElement = Controls.createInput(divSwitchAllowDeleteAccount, "checkbox", "switch-allow-deleteaccount-id", "form-check-input");
        inputAlloweDeleteAccount.role = "switch";
        Controls.createLabel(divSwitchAllowDeleteAccount, "switch-allow-deleteaccount-id", "form-check-label", pageContext.locale.translate("OPTION_ALLOW_DELETE_ACCOUNT"));
        inputAlloweDeleteAccount.addEventListener("click", async (e: Event) => {
            Controls.showElemById("button-delete-account-id", inputAlloweDeleteAccount.checked);
            Controls.showElemById("button-changepwd-id", !inputAlloweDeleteAccount.checked);
        });
        // change password button
        const buttonChangePwd: HTMLButtonElement = Controls.createButton(divRowAllowDeleteAccount, "button", pageContext.locale.translate("BUTTON_CHANGE_PWD"), "btn btn-primary mt-3", "button-changepwd-id");
        buttonChangePwd.addEventListener("click", async (e: Event) => {
            e.preventDefault();
            pageContext.settings.passwordChanged = false;
            pageContext.pageType = "PASSWORD_EDIT";
            await pageContext.renderAsync();
        });
        // delete account button
        const buttonDeleteAccount: HTMLButtonElement = Controls.createButton(divRowAllowDeleteAccount, "button", pageContext.locale.translate("BUTTON_DELETE_ACCOUNT"), "btn btn-danger mt-3 d-none", "button-delete-account-id");
        buttonDeleteAccount.setAttribute("data-bs-target", "#confirmationdialog-id_deleteaccount");
        buttonDeleteAccount.setAttribute("data-bs-toggle", "modal");
        // render disable two factor confirmation dialog
        Controls.createConfirmationDialog(
            parent,
            pageContext.locale.translate("OPTION_TWO_FACTOR"),
            pageContext.locale.translate("INFO_REALLY_DEACTIVATE_TWO_FACTOR"),
            pageContext.locale.translate("BUTTON_YES"),
            pageContext.locale.translate("BUTTON_NO"));
        document.getElementById("confirmationyesbutton-id")!.addEventListener("click", async (e: Event) => await this.onDisable2FA(e, pageContext));
        // render delete account confirmation dialog
        Controls.createConfirmationDialog(
            parent,
            pageContext.locale.translate("BUTTON_DELETE_ACCOUNT"),
            `${pageContext.locale.translate("INFO_DELETE_DATA")} ${pageContext.locale.translate("INFO_REALLY_DELETE_ACCOUNT")}`,
            pageContext.locale.translate("BUTTON_YES"),
            pageContext.locale.translate("BUTTON_NO"), "_deleteaccount");
        document.getElementById("confirmationyesbutton-id_deleteaccount")!.addEventListener("click", async (e: Event) => {
            e.preventDefault();
            await this.onDeleteAccount(e, pageContext);
        });
    }

    private renderProfilPhoto(pageContext: PageContext, parent: HTMLElement, grid: HTMLElement, userDetails: UserInfoResult) {
        const divRowPhoto: HTMLDivElement = Controls.createDiv(grid, "row mt-3 align-items-center");
        const divCol1Photo: HTMLDivElement = Controls.createDiv(divRowPhoto, "col-4 text-start");
        Controls.createLabel(divCol1Photo, "upload-photo-input-id", "form-label", pageContext.locale.translate("LABEL_PROFILE_PHOTO"));
        const divCol2Photo: HTMLDivElement = Controls.createDiv(divRowPhoto, "col-4");
        const photoImg: HTMLImageElement = Controls.createElement(divCol2Photo, "img", "img-thumbnail") as HTMLImageElement;
        photoImg.id = "profile-photo-id";
        photoImg.width = 90;
        photoImg.height = 90;
        photoImg.title = pageContext.locale.translate("INFO_PROFILE_PHOTO");
        photoImg.addEventListener("click", _ => this.onSelectPhoto());
        photoImg.setAttribute("role", "button");
        if (userDetails.photo == null) {
            photoImg.src = "/images/buttons/user-new-3.png";
        }
        else {
            photoImg.src = userDetails.photo;
            const divCol3Photo: HTMLDivElement = Controls.createDiv(divRowPhoto, "col-4");
            const iMinus: HTMLElement = Controls.createElement(divCol3Photo, "i", "bi bi-person-x fs-3 ms-2");
            iMinus.setAttribute("role", "button");
            iMinus.setAttribute("data-bs-target", "#confirmationdialog-id_removephoto");
            iMinus.setAttribute("data-bs-toggle", "modal");
        }
        // hidden form
        const formElement: HTMLFormElement = Controls.createForm(divRowPhoto, "d-none");
        formElement.id = "upload-photo-form-id";
        formElement.method = "post";
        formElement.enctype = "multipart/form-data";
        const inputPhoto: HTMLInputElement = Controls.createInput(formElement, "file", "upload-photo-input-id");
        inputPhoto.name = "photo-file";
        inputPhoto.accept = "image/jpeg,image/png";
        inputPhoto.addEventListener("change", async (e: Event) => this.onUpdatePhotoAsync(e, pageContext));
        // render remove profile picture confirmation dialog
        Controls.createConfirmationDialog(
            parent,
            pageContext.locale.translate("BUTTON_REMOVE_PROFILE_PHOTO"),
            pageContext.locale.translate("INFO_REALLY_REMOVE_PROFILE_PICTURE"),
            pageContext.locale.translate("BUTTON_YES"),
            pageContext.locale.translate("BUTTON_NO"), "_removephoto");
        document.getElementById("confirmationyesbutton-id_removephoto")!.addEventListener("click", async (e: Event) => {
            e.preventDefault();
            await this.onRemovePhotoAsync(e, pageContext);
        });
    }

    private async onChangeEmailAsync(e: Event, pageContext: PageContext): Promise<void> {
        try {
            const emailInput: HTMLInputElement = document.getElementById("email-id") as HTMLInputElement;
            const email: string = emailInput.value.trim();
            await pageContext.authenticationClient.updateEmailAsync(email);
            emailInput.value = email;
        }
        catch (error: Error | unknown) {
            this.handleError(error, pageContext);
            return;
        }
    }

    private async onUpdatePhotoAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        try {
            const form: HTMLFormElement = document.getElementById("upload-photo-form-id") as HTMLFormElement;
            const input: HTMLInputElement = document.getElementById("upload-photo-input-id") as HTMLInputElement;
            await pageContext.authenticationClient.updatePhotoAsync(input, form);
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            this.handleError(error, pageContext);
            return;
        }
    }

    private async onRemovePhotoAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        try {
            await pageContext.authenticationClient.removePhotoAsync();
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            this.handleError(error, pageContext);
            return;
        }
    }

    private onSelectPhoto() {
        const inputFile = document.getElementById("upload-photo-input-id");
        if (inputFile) {
            inputFile.click();
        }
    };

    private async onDisable2FA(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        await pageContext.authenticationClient.disableTwoFactorAsync();
        await pageContext.renderAsync();
    }

    private async onDeleteAccount(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        await pageContext.authenticationClient.deleteAccountAsync();
        pageContext.pageType = "LOGIN_USERNAME_PASSWORD";
        await pageContext.renderAsync();
        const alertDiv: HTMLDivElement = document.getElementById("alertdiv-id") as HTMLDivElement;
        Controls.createAlert(alertDiv, pageContext.locale.translate("INFO_ACCOUNT_DELETED"), "alert-success");
    }
}
