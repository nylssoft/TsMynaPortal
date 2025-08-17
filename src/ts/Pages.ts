import { ClickAction, LogoutAction, ShowAboutPageAction, ShowDataProtectionPageAction, ShowDesktopPageAction, ShowLoginPageAction, ToggleLanguageAction } from "./Actions";
import { ContactService } from "./ContactService";
import { Controls } from "./Controls";
import { NoteService } from "./NoteService";
import { PageContext, Page, PageType } from "./PageContext";
import { PasswordManagerService } from "./PasswordManagerService";
import { Security } from "./Security";
import { ContactResult, ContactsResult, NoteResult, PasswordItemResult, UserInfoResult } from "./TypeDefinitions";

/**
 * Page implementation for the navigation bar.
 * It renders links to different pages such as Desktop, Data Protection, About, and Login.
 * It also includes a language toggle and a logout option if the user is logged in.
 * The navigation bar is responsive and collapses on smaller screens.
 */
export class NavigationBarPage implements Page {

    public getPageType(): PageType {
        return "NAVIGATION_BAR";
    }

    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const ul: HTMLUListElement = this.createNavBar(parent, pageContext, "APP_NAME");
        if (pageContext.getAuthenticationClient().isLoggedIn()) {
            this.createNavItem(ul, pageContext, "DESKTOP", new ShowDesktopPageAction());
            this.createNavItem(ul, pageContext, "DATA_PROTECTION", new ShowDataProtectionPageAction());
        } else {
            this.createNavItem(ul, pageContext, "BUTTON_LOGIN", new ShowLoginPageAction());
        }
        this.createNavItem(ul, pageContext, "ABOUT", new ShowAboutPageAction());
        const aToogleLanguage: HTMLAnchorElement = this.createNavItem(ul, pageContext, "LANGUAGE", new ToggleLanguageAction());
        Controls.createSpan(aToogleLanguage, `mx-2 fi ${pageContext.getLocale().getLanguage() == "de" ? "fi-gb" : "fi-de"}`);
        if (pageContext.getAuthenticationClient().isLoggedIn()) {
            this.createNavItem(ul, pageContext, "BUTTON_LOGOUT", new LogoutAction());
        }
    }

    private createNavBar(parent: HTMLElement, pageContext: PageContext, label: string): HTMLUListElement {
        const nav: HTMLElement = Controls.createElement(parent, "nav", "navbar navbar-expand-lg navbar-dark bg-dark");
        const container: HTMLDivElement = Controls.createDiv(nav, "container");
        Controls.createElement(container, "a", "navbar-brand", pageContext.getLocale().translate(label));
        const button: HTMLButtonElement = Controls.createElement(container, "button", "navbar-toggler") as HTMLButtonElement;
        button.setAttribute("type", "button");
        button.setAttribute("data-bs-toggle", "collapse");
        button.setAttribute("data-bs-target", "#navbarSupportedContent");
        button.setAttribute("aria-controls", "navbarSupportedContent");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Toogle navigation");
        Controls.createSpan(button, "navbar-toggler-icon");
        const navCollapse: HTMLDivElement = Controls.createDiv(container, "navbar-collapse collapse");
        navCollapse.id = "navbarSupportedContent";
        return Controls.createElement(navCollapse, "ul", "navbar-nav me-auto mb-2 mb-lg-0") as HTMLUListElement;
    }

    private createNavItem(parent: HTMLElement, pageContext: PageContext, label: string, action: ClickAction): HTMLAnchorElement {
        const li: HTMLLIElement = Controls.createElement(parent, "li", "nav-item") as HTMLLIElement;
        const a: HTMLAnchorElement = Controls.createElement(li, "a", "nav-link", pageContext.getLocale().translate(label)) as HTMLAnchorElement;
        a.href = "#";
        a.addEventListener("click", async (e: MouseEvent) => action.runAsync(e, pageContext));
        if (action.isActive(pageContext)) {
            a.classList.add("active");
            a.setAttribute("aria-current", "page");
        }
        return a;
    }
}

/**
 * Page implementation for the About page.
 */
export class AboutPage implements Page {

    public getPageType(): PageType {
        return "ABOUT";
    }

    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const aboutMessage: HTMLDivElement = Controls.createDiv(parent, "alert alert-success");
        aboutMessage.textContent = `Version 0.0.5 ${pageContext.getLocale().translate("TEXT_COPYRIGHT_YEAR")} ${pageContext.getLocale().translate("COPYRIGHT")}`;
    }
}

/**
 * Page implementation for the Encryption Key page.
 */
export class DataProtectionPage implements Page {

    public getPageType(): PageType {
        return "DATA_PROTECTION";
    }

    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const user: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
        const encKey: string | null = await Security.getEncryptionKeyAsync(user);
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        const infoDiv: HTMLDivElement = Controls.createDiv(parent, "alert alert-warning", pageContext.getLocale().translate("KEY_INFO"));
        infoDiv.setAttribute("role", "alert");
        const formElement: HTMLFormElement = Controls.createForm(parent);
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row g-3 align-items-center");
        const divCol1: HTMLDivElement = Controls.createDiv(divRows, "col");
        Controls.createLabel(divCol1, "key-id", "form-label", pageContext.getLocale().translate("LABEL_KEY"));
        const keyPwd: HTMLInputElement = Controls.createInput(divCol1, "password", "key-id", "form-control");
        keyPwd.setAttribute("aria-describedby", "keyhelp-id");
        keyPwd.setAttribute("autocomplete", "off");
        keyPwd.setAttribute("spellcheck", "false");
        if (encKey != null) {
            keyPwd.value = encKey;
        }
        const divCol2: HTMLDivElement = Controls.createDiv(divRows, "col-auto align-self-end");
        const icon: HTMLElement = Controls.createElement(divCol2, "i", "bi bi-eye-slash");
        icon.setAttribute("style", "cursor:pointer; font-size: 1.5rem;");
        icon.id = "toggle-password-id";
        const helpDiv: HTMLDivElement = Controls.createDiv(divRows, "form-text", pageContext.getLocale().translate("INFO_ENTER_KEY"));
        helpDiv.id = "keyhelp-id";
        const buttonSave: HTMLButtonElement = Controls.createButton(divRows, "submit", "save-button-id", pageContext.getLocale().translate("BUTTON_SAVE"), "btn btn-primary");
        buttonSave.addEventListener("click", async (e: MouseEvent) => this.onClickSaveAsync(e, pageContext, keyPwd, alertDiv));
        icon.addEventListener("click", (e: MouseEvent) => this.onTogglePassword(e, keyPwd, icon));
    }

    private onTogglePassword(e: MouseEvent, keyPwd: HTMLInputElement, icon: HTMLElement) {
        e.preventDefault();
        if (keyPwd.type == "password") {
            keyPwd.type = "text";
            icon.classList.remove("bi-eye-slash");
            icon.classList.add("bi-eye");
        } else {
            keyPwd.type = "password";
            icon.classList.remove("bi-eye");
            icon.classList.add("bi-eye-slash");
        }
    }

    private async onClickSaveAsync(e: MouseEvent, pageContext: PageContext, keyPwd: HTMLInputElement, alertDiv: HTMLDivElement) {
        e.preventDefault();
        try {
            const user: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
            await Security.setEncryptionKeyAsync(user, keyPwd.value);
            pageContext.setPageType("DESKTOP");
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }
}

/**
 * Page implementation for the Desktop page.
 */
export class DesktopPage implements Page {

    private currentTab: string = "BIRTHDAYS";

    public getPageType(): PageType {
        return "DESKTOP";
    }

    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        try {
            const userInfo: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
            const now: Date = new Date();
            const longDate: string = now.toLocaleDateString(pageContext.getLocale().getLanguage(), { dateStyle: "long" });
            const longTime: string = now.toLocaleTimeString(pageContext.getLocale().getLanguage(), { timeStyle: "long" });
            const welcomeMessage: HTMLDivElement = Controls.createDiv(parent, "alert alert-success");
            Controls.createDiv(welcomeMessage, undefined, pageContext.getLocale().translateWithArgs("MESSAGE_WELCOME_1_2_3", [userInfo.name, longDate, longTime]));
            const lastLoginDate: Date | null = await pageContext.getAuthenticationClient().getLastLoginDateAsync();
            if (lastLoginDate != null) {
                const lastLoginStr: string = lastLoginDate.toLocaleString(pageContext.getLocale().getLanguage(), { dateStyle: "long", timeStyle: "long" });
                Controls.createDiv(welcomeMessage, "mt-2", pageContext.getLocale().translateWithArgs("MESSAGE_LAST_LOGIN_1", [lastLoginStr]));
            }
            const tabs: HTMLUListElement = Controls.createElement(parent, "ul", "nav nav-pills") as HTMLUListElement;
            const tabBirthdays: HTMLLIElement = Controls.createElement(tabs, "li", "nav-item") as HTMLLIElement;
            const aBirthdays: HTMLAnchorElement = Controls.createAnchor(tabBirthdays, "birthdays", "", "nav-link", this.currentTab === "BIRTHDAYS");
            Controls.createSpan(aBirthdays, "bi bi-cake");
            aBirthdays.addEventListener("click", async (e: MouseEvent) => await this.switchTabAsync(e, pageContext, "BIRTHDAYS"));
            const tabContacts: HTMLLIElement = Controls.createElement(tabs, "li", "nav-item") as HTMLLIElement;
            const aContacts: HTMLAnchorElement = Controls.createAnchor(tabContacts, "contacts", "", "nav-link", this.currentTab === "CONTACTS");
            Controls.createSpan(aContacts, "bi bi-person");
            aContacts.addEventListener("click", async (e: MouseEvent) => await this.switchTabAsync(e, pageContext, "CONTACTS"));
            const tabNotes: HTMLLIElement = Controls.createElement(tabs, "li", "nav-item") as HTMLLIElement;
            const aNotes: HTMLAnchorElement = Controls.createAnchor(tabNotes, "notes", "", "nav-link", this.currentTab === "NOTES");
            Controls.createSpan(aNotes, "bi bi-journal");
            aNotes.addEventListener("click", async (e: MouseEvent) => await this.switchTabAsync(e, pageContext, "NOTES"));
            const tabPasswordManager: HTMLLIElement = Controls.createElement(tabs, "li", "nav-item") as HTMLLIElement;
            const aPasswordManager: HTMLAnchorElement = Controls.createAnchor(tabPasswordManager, "passwordmanager", "", "nav-link", this.currentTab === "PASSWORD_MANAGER");
            Controls.createSpan(aPasswordManager, "bi bi-lock");
            aPasswordManager.addEventListener("click", async (e: MouseEvent) => await this.switchTabAsync(e, pageContext, "PASSWORD_MANAGER"));
            if (this.currentTab === "BIRTHDAYS") {
                await this.renderBirthdaysAsync(pageContext, parent, alertDiv);
            } else if (this.currentTab === "CONTACTS") {
                await this.renderContactsAsync(pageContext, parent, alertDiv);
            } else if (this.currentTab === "NOTES") {
                await this.renderNotesAsync(pageContext, parent, alertDiv);
            } else if (this.currentTab === "PASSWORD_MANAGER") {
                await this.renderPasswordManagerAsync(pageContext, parent, alertDiv);
            }
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }

    private async switchTabAsync(e: MouseEvent, pageContext: PageContext, tabName: string): Promise<void> {
        e.preventDefault();
        this.currentTab = tabName;
        await pageContext.renderAsync();
    }

    private async renderBirthdaysAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.getLocale().translate("BIRTHDAYS"));
            const token: string = pageContext.getAuthenticationClient().getToken()!;
            const userInfo: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
            const contacts: ContactsResult = await ContactService.getContactsAsync(token, userInfo);
            const birthdays: ContactResult[] = [];
            contacts.items.forEach((contact) => {
                contact.daysUntilBirthday = ContactService.getDaysUntilBirthday(contact);
                if (contact.daysUntilBirthday != null && contact.daysUntilBirthday <= 31) {
                    birthdays.push(contact);
                }
            });
            if (birthdays.length > 0) {
                birthdays.sort((a, b) => a.daysUntilBirthday! - b.daysUntilBirthday!);
                const listGroup: HTMLDivElement = Controls.createDiv(parent, "list-group");
                birthdays.forEach(contact => {
                    const a: HTMLAnchorElement = Controls.createAnchor(listGroup, "contactdetails", "", "list-group-item");
                    Controls.createSpan(a, "bi bi-person");
                    Controls.createSpan(a, "ms-2", contact.name);
                    Controls.createSpan(a, "ms-2 bi bi-cake");
                    if (contact.daysUntilBirthday == 0) {
                        Controls.createSpan(a, "ms-2", pageContext.getLocale().translate("TODAY"));
                    } else if (contact.daysUntilBirthday == 1) {
                        Controls.createSpan(a, "ms-2", pageContext.getLocale().translate("TOMORROW"));
                    } else {
                        Controls.createSpan(a, "ms-2", `${contact.daysUntilBirthday} ${pageContext.getLocale().translate("DAYS")}`);
                    }
                    a.addEventListener("click", async (e: MouseEvent) => {
                        e.preventDefault();
                        pageContext.setPageType("CONTACT_DETAIL");
                        pageContext.setContact(contact);
                        await pageContext.renderAsync();
                    });
                });
            }
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }

    private async renderContactsAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.getLocale().translate("CONTACTS"));
            const token: string = pageContext.getAuthenticationClient().getToken()!;
            const userInfo: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
            const contacts: ContactsResult = await ContactService.getContactsAsync(token, userInfo);
            if (contacts.items.length > 0) {
                contacts.items.sort((a, b) => a.name.localeCompare(b.name));
                const listGroup: HTMLDivElement = Controls.createDiv(parent, "list-group");
                contacts.items.forEach(contact => {
                    const a: HTMLAnchorElement = Controls.createAnchor(listGroup, "contactdetails", "", "list-group-item");
                    Controls.createSpan(a, "bi bi-person");
                    Controls.createSpan(a, "ms-2", contact.name);
                    a.addEventListener("click", async (e: MouseEvent) => {
                        e.preventDefault();
                        pageContext.setPageType("CONTACT_DETAIL");
                        pageContext.setContact(contact);
                        await pageContext.renderAsync();
                    });
                });
            }
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }

    private async renderNotesAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.getLocale().translate("NOTES"));
            const token: string = pageContext.getAuthenticationClient().getToken()!;
            const userInfo: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
            const notes: NoteResult[] = await NoteService.getNotesAsync(token, userInfo);
            if (notes.length > 0) {
                notes.sort((a, b) => a.title.localeCompare(b.title));
                const listGroup: HTMLDivElement = Controls.createDiv(parent, "list-group");
                notes.forEach(note => {
                    const a: HTMLAnchorElement = Controls.createAnchor(listGroup, "notedetails", "", "list-group-item");
                    Controls.createSpan(a, "bi bi-journal");
                    Controls.createSpan(a, "ms-2", note.title);
                    a.addEventListener("click", async (e: MouseEvent) => {
                        e.preventDefault();
                        pageContext.setPageType("NOTE_DETAIL");
                        pageContext.setNote(note);
                        await pageContext.renderAsync();
                    });
                });
            }
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }

    private async renderPasswordManagerAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.getLocale().translate("PASSWORD_MANAGER"));
            const token: string = pageContext.getAuthenticationClient().getToken()!;
            const userInfo: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
            if (userInfo.hasPasswordManagerFile) {
                const passwordItems: PasswordItemResult[] = await PasswordManagerService.getPasswordFileAsync(token, userInfo);
                if (passwordItems.length > 0) {
                    passwordItems.sort((a, b) => a.Name.localeCompare(b.Name));
                    const listGroup: HTMLDivElement = Controls.createDiv(parent, "list-group");
                    passwordItems.forEach(item => {
                        const a: HTMLAnchorElement = Controls.createAnchor(listGroup, "passworddetails", "", "list-group-item");
                        Controls.createSpan(a, "bi bi-lock");
                        Controls.createSpan(a, "ms-2", item.Name);
                        a.addEventListener("click", async (e: MouseEvent) => {
                            e.preventDefault();
                            pageContext.setPageType("PASSWORD_ITEM_DETAIL");
                            pageContext.setPasswordItem(item);
                            await pageContext.renderAsync();
                        });
                    });
                }
            }
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }
}

/**
 * Page implementation for the Contact Detail page.
 * It displays detailed information about a specific contact, including name, phone, address, email, birthday, and notes.
 * It also provides a back button to return to the Desktop page.
 */
export class ContactDetailPage implements Page {

    public getPageType(): PageType {
        return "CONTACT_DETAIL";
    }

    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm bg-light");
        parent.style.maxWidth = "400px";
        const contact: ContactResult = pageContext.getContact()!;
        const cardBody: HTMLDivElement = Controls.createDiv(parent, "card-body text-dark");
        Controls.createHeading(cardBody, 2, "card-title mb-3", contact.name);
        if (contact.phone.length > 0) {
            const cardTextPhone: HTMLParagraphElement = Controls.createParagraph(cardBody, "card-text");
            Controls.createSpan(cardTextPhone, "bi bi-telephone");
            Controls.createSpan(cardTextPhone, "ms-2", contact.phone);
        }
        if (contact.address.length > 0) {
            const cardTextAddress: HTMLParagraphElement = Controls.createParagraph(cardBody, "card-text");
            Controls.createSpan(cardTextAddress, "bi bi-geo-alt");
            Controls.createSpan(cardTextAddress, "ms-2", contact.address);
        }
        if (contact.email.length > 0) {
            const cardTextEmail: HTMLParagraphElement = Controls.createParagraph(cardBody, "card-text");
            Controls.createSpan(cardTextEmail, "bi bi-envelope");
            Controls.createSpan(cardTextEmail, "ms-2", contact.email);
        }
        if (contact.birthday.length > 0) {
            const cardTextBirthday: HTMLParagraphElement = Controls.createParagraph(cardBody, "card-text");
            Controls.createSpan(cardTextBirthday, "bi bi-cake");
            Controls.createSpan(cardTextBirthday, "ms-2", contact.birthday);
        }
        if (contact.note.length > 0) {
            const cardTextNotes: HTMLParagraphElement = Controls.createParagraph(cardBody, "card-text");
            Controls.createSpan(cardTextNotes, "bi bi-journal");
            Controls.createSpan(cardTextNotes, "ms-2", contact.note);
        }
        const backButton: HTMLButtonElement = Controls.createButton(cardBody, "button", "back-button-id", pageContext.getLocale().translate("BUTTON_BACK"), "btn btn-primary");
        backButton.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            pageContext.setPageType("DESKTOP");
            pageContext.setContact(null);
            await pageContext.renderAsync();
        });
    }
}

/**
 * Page implementation for the Note Detail page.
 * It displays detailed information about a specific note, including title, content, and last modified date.
 * It also provides a back button to return to the Desktop page.
 */
export class NoteDetailPage implements Page {

    public getPageType(): PageType {
        return "NOTE_DETAIL";
    }

    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        parent = Controls.createDiv(parent, "card p-4 shadow-sm bg-light");
        parent.style.maxWidth = "600px";
        try {
            const token: string = pageContext.getAuthenticationClient().getToken()!;
            const userInfo: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
            const note: NoteResult = await NoteService.getNoteAsync(token, userInfo, pageContext.getNote()!.id);
            const date: Date = new Date(note.lastModifiedUtc);
            const longDate: string = date.toLocaleDateString(pageContext.getLocale().getLanguage(), { dateStyle: "long" });
            const longTime: string = date.toLocaleTimeString(pageContext.getLocale().getLanguage(), { timeStyle: "long" });
            const cardBody: HTMLDivElement = Controls.createDiv(parent, "card-body text-dark");
            Controls.createHeading(cardBody, 2, "card-title mb-3", note.title);
            const cardTextDate: HTMLParagraphElement = Controls.createParagraph(cardBody, "card-text");
            Controls.createSpan(cardTextDate, "bi bi-calendar");
            Controls.createSpan(cardTextDate, "ms-2", `${longDate} ${longTime}`);
            if (note.content!.length > 0) {
                const divFormFloating: HTMLDivElement = Controls.createDiv(cardBody, "form-floating mb-4");
                const textarea: HTMLTextAreaElement = Controls.createElement(divFormFloating, "textarea", "form-control text-dark bg-light", note.content!) as HTMLTextAreaElement;
                textarea.style.height = "400px";
                textarea.setAttribute("readonly", "true");
                textarea.setAttribute("spellcheck", "false");
                textarea.setAttribute("autocomplete", "off");
            }
            const backButton: HTMLButtonElement = Controls.createButton(cardBody, "button", "back-button-id", pageContext.getLocale().translate("BUTTON_BACK"), "btn btn-primary");
            backButton.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.setPageType("DESKTOP");
                pageContext.setNote(null);
                await pageContext.renderAsync();
            });
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }
}

export class PasswordItemDetailPage implements Page {

    public getPageType(): PageType {
        return "PASSWORD_ITEM_DETAIL";
    }

    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        parent = Controls.createDiv(parent, "card p-4 shadow-sm bg-light");
        parent.style.maxWidth = "600px";
        try {
            const passwordItem: PasswordItemResult = pageContext.getPasswordItem()!;
            const cardBody: HTMLDivElement = Controls.createDiv(parent, "card-body text-dark");
            Controls.createHeading(cardBody, 2, "card-title mb-3", passwordItem.Name);
            if (passwordItem.Login.length > 0) {
                const cardTextLogin: HTMLParagraphElement = Controls.createParagraph(cardBody, "card-text");
                Controls.createSpan(cardTextLogin, "bi bi-person");
                const inputLogin: HTMLInputElement = Controls.createInput(cardTextLogin, "text", "login-id", "ms-2 bg-light text-dark border-0", passwordItem.Login);
                inputLogin.setAttribute("readonly", "true");
                inputLogin.setAttribute("autocomplete", "off");
                inputLogin.setAttribute("spellcheck", "false");
                const iconCopy: HTMLElement = Controls.createElement(cardTextLogin, "i", "ms-2 bi bi-clipboard");
                iconCopy.setAttribute("style", "cursor:pointer; font-size: 1.5rem;");
                iconCopy.addEventListener("click", async (e: MouseEvent) => await this.copyToClipboardAsync(passwordItem.Login));
            }
            const user: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
            const pwd: string = await PasswordManagerService.getPasswordAsync(user, passwordItem);
            if (pwd.length > 0) {
                const cardTextPassword: HTMLParagraphElement = Controls.createParagraph(cardBody, "card-text");
                Controls.createSpan(cardTextPassword, "bi bi-shield-lock");
                const inputPassword: HTMLInputElement = Controls.createInput(cardTextPassword, "password", "password-id", "ms-2 bg-light text-dark border-0", pwd);
                inputPassword.setAttribute("readonly", "true");
                inputPassword.setAttribute("autocomplete", "off");
                inputPassword.setAttribute("spellcheck", "false");
                const iconCopy: HTMLElement = Controls.createElement(cardTextPassword, "i", "ms-2 bi bi-clipboard");
                iconCopy.setAttribute("style", "cursor:pointer; font-size: 1.5rem;");
                iconCopy.addEventListener("click", async (e: MouseEvent) => await this.copyToClipboardAsync(pwd));
                const iconToggle: HTMLElement = Controls.createElement(cardTextPassword, "i", "ms-2 bi bi-eye-slash");
                iconToggle.setAttribute("style", "cursor:pointer; font-size: 1.5rem;");
                iconToggle.id = "toggle-password-id";
                iconToggle.addEventListener("click", (e: MouseEvent) => this.onTogglePassword(e, inputPassword, iconToggle));
            }
            if (passwordItem.Url.length > 0) {
                const cardTextUrl: HTMLParagraphElement = Controls.createParagraph(cardBody, "card-text");
                Controls.createSpan(cardTextUrl, "bi bi-link-45deg");
                const aUrl = Controls.createAnchor(cardTextUrl, this.getUrl(passwordItem), passwordItem.Url, "ms-2");
                aUrl.setAttribute("target", "_blank");
            }
            if (passwordItem.Description.length > 0) {
                const cardTextDesc: HTMLParagraphElement = Controls.createParagraph(cardBody, "card-text");
                Controls.createSpan(cardTextDesc, "bi bi-card-text");
                Controls.createSpan(cardTextDesc, "ms-2", passwordItem.Description);
            }
            const backButton: HTMLButtonElement = Controls.createButton(cardBody, "button", "back-button-id", pageContext.getLocale().translate("BUTTON_BACK"), "btn btn-primary");
            backButton.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.setPageType("DESKTOP");
                pageContext.setPasswordItem(null);
                await pageContext.renderAsync();
            });
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }

    private onTogglePassword(e: MouseEvent, inputPwd: HTMLInputElement, icon: HTMLElement) {
        e.preventDefault();
        if (inputPwd.type == "password") {
            inputPwd.type = "text";
            icon.classList.remove("bi-eye-slash");
            icon.classList.add("bi-eye");
        } else {
            inputPwd.type = "password";
            icon.classList.remove("bi-eye");
            icon.classList.add("bi-eye-slash");
        }
    }

    private async copyToClipboardAsync(text: string): Promise<void> {
        try {
            await navigator.clipboard.writeText(text);
        }
        catch (err: Error | unknown) {
            console.error(`Failed to copy to the clibboard: ${err}`);
        }
    }

    private getUrl(item: PasswordItemResult): string {
        if (item.Url.startsWith("http")) {
            return item.Url;
        }
        return `https://${item.Url}`;
    }
}

/**
 * Page implementation for the Login with Pass2 page.
 */
export class LoginPass2Page implements Page {

    public getPageType(): PageType {
        return "LOGIN_PASS2";
    }

    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        const formElement: HTMLFormElement = Controls.createForm(parent, "align-items-center");
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row g-3 align-items-center");
        const divPass2: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divPass2, "pass2-id", "form-label", pageContext.getLocale().translate("LABEL_SEC_KEY"));
        const inputPass2: HTMLInputElement = Controls.createInput(divPass2, "text", "pass2-id", "form-control");
        inputPass2.setAttribute("aria-describedby", "pass2help-id");
        inputPass2.setAttribute("autocomplete", "off");
        inputPass2.setAttribute("spellcheck", "false");
        inputPass2.focus();
        const pass2HelpDiv: HTMLDivElement = Controls.createDiv(divPass2, "form-text", pageContext.getLocale().translate("INFO_ENTER_SEC_KEY"));
        pass2HelpDiv.id = "pass2help-id";
        const buttonLogin: HTMLButtonElement = Controls.createButton(divRows, "submit", "login-button-id", pageContext.getLocale().translate("BUTTON_LOGIN"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => this.onClickLoginWithPass2Async(e, pageContext, inputPass2, alertDiv));
    }

    private async onClickLoginWithPass2Async(e: MouseEvent, pageContext: PageContext, inputPass2: HTMLInputElement, alertDiv: HTMLDivElement) {
        e.preventDefault();
        try {
            if (pageContext.getAuthenticationClient().getToken() == null) {
                pageContext.setPageType("LOGIN_USERNAME_PASSWORD");
            } else {
                await pageContext.getAuthenticationClient().loginWithPass2Async(inputPass2.value);
                const user: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
                const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
                if (encryptionKey == null) {
                    await Security.setEncryptionKeyAsync(user, Security.generateEncryptionKey());
                }
                pageContext.setPageType("DESKTOP");
            }
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }
}

/**
 * Page implementation for the Login with PIN page.
 */
export class LoginPinPage implements Page {

    public getPageType(): PageType {
        return "LOGIN_PIN";
    }

    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        const formElement: HTMLFormElement = Controls.createForm(parent, "align-items-center");
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row g-3 align-items-center");
        const divPin: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divPin, "pin-id", "form-label", pageContext.getLocale().translate("LABEL_PIN"));
        const inputPin: HTMLInputElement = Controls.createInput(divPin, "password", "pin-id", "form-control");
        inputPin.setAttribute("aria-describedby", "pinhelp-id");
        inputPin.setAttribute("autocomplete", "off");
        inputPin.setAttribute("spellcheck", "false");
        inputPin.focus();
        const pinHelpDiv: HTMLDivElement = Controls.createDiv(divPin, "form-text", pageContext.getLocale().translate("INFO_ENTER_PIN"));
        pinHelpDiv.id = "pinhelp-id";
        const buttonLogin: HTMLButtonElement = Controls.createButton(divRows, "submit", "login-button-id", pageContext.getLocale().translate("BUTTON_LOGIN"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => this.onClickLoginWithPinAsync(e, pageContext, inputPin, alertDiv));
    }

    private async onClickLoginWithPinAsync(e: MouseEvent, pageContext: PageContext, inputPin: HTMLInputElement, alertDiv: HTMLDivElement) {
        e.preventDefault();
        try {
            if (pageContext.getAuthenticationClient().getLongLivedToken() == null) {
                pageContext.setPageType("LOGIN_USERNAME_PASSWORD");
            } else {
                await pageContext.getAuthenticationClient().loginWithPinAsync(inputPin.value);
                const user: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
                const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
                if (encryptionKey == null) {
                    await Security.setEncryptionKeyAsync(user, Security.generateEncryptionKey());
                }
                pageContext.setPageType("DESKTOP");
            }
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }
}

/**
 * Page implementation for the Login with Username and Password page.
 */
export class LoginUsernamePasswordPage implements Page {

    public getPageType(): PageType {
        return "LOGIN_USERNAME_PASSWORD";
    }

    public async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        const formElement: HTMLFormElement = Controls.createForm(parent, "align-items-center");
        const divRows: HTMLDivElement = Controls.createDiv(formElement, "row g-3 align-items-center");
        const divUsername: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divUsername, "username-id", "form-label", pageContext.getLocale().translate("LABEL_NAME"));
        const inputUsername: HTMLInputElement = Controls.createInput(divUsername, "text", "username-id", "form-control");
        inputUsername.setAttribute("aria-describedby", "usernamehelp-id");
        inputUsername.setAttribute("autocomplete", "off");
        inputUsername.setAttribute("spellcheck", "false");
        inputUsername.focus();
        const usernameHelpDiv: HTMLDivElement = Controls.createDiv(divUsername, "form-text", pageContext.getLocale().translate("INFO_ENTER_USERNAME"));
        usernameHelpDiv.id = "usernamehelp-id";
        const divPassword: HTMLDivElement = Controls.createDiv(divRows, "mb-3");
        Controls.createLabel(divPassword, "password-id", "form-label", pageContext.getLocale().translate("LABEL_PWD"));
        const inputPassword: HTMLInputElement = Controls.createInput(divPassword, "password", "password-id", "form-control");
        inputPassword.setAttribute("aria-describedby", "passwordhelp-id");
        inputPassword.setAttribute("autocomplete", "off");
        inputPassword.setAttribute("spellcheck", "false");
        const passwordHelpDiv: HTMLDivElement = Controls.createDiv(divPassword, "form-text", pageContext.getLocale().translate("INFO_ENTER_PASSWORD"));
        passwordHelpDiv.id = "passwordhelp-id";
        const divSaySignedIn: HTMLDivElement = Controls.createDiv(divRows, "mb-3 form-check");
        const inputStaySignedIn: HTMLInputElement = Controls.createInput(divSaySignedIn, "checkbox", "staysignedin-id", "form-check-input");
        Controls.createLabel(divSaySignedIn, "staysignedin-id", "form-check-label", pageContext.getLocale().translate("STAY_SIGNED_IN"));
        const buttonLogin: HTMLButtonElement = Controls.createButton(divRows, "submit", "login-button-id", pageContext.getLocale().translate("BUTTON_LOGIN"), "btn btn-primary");
        buttonLogin.addEventListener("click", async (e: MouseEvent) => this.onClickLoginWithUsernameAndPasswordAsync(e, pageContext, inputUsername, inputPassword, inputStaySignedIn, alertDiv));
    }

    private async onClickLoginWithUsernameAndPasswordAsync(e: MouseEvent, pageContext: PageContext, inputUsername: HTMLInputElement, inputPassword: HTMLInputElement, staySignedIn: HTMLInputElement, alertDiv: HTMLDivElement) {
        e.preventDefault();
        try {
            pageContext.getAuthenticationClient().setUseLongLivedToken(staySignedIn.checked);
            await pageContext.getAuthenticationClient().loginAsync(inputUsername.value, inputPassword.value, pageContext.getLocale().getLanguage());
            if (pageContext.getAuthenticationClient().isRequiresPass2()) {
                pageContext.setPageType("LOGIN_PASS2");
            } else {
                const user: UserInfoResult = await pageContext.getAuthenticationClient().getUserInfoAsync();
                const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
                if (encryptionKey == null) {
                    await Security.setEncryptionKeyAsync(user, Security.generateEncryptionKey());
                }
                pageContext.setPageType("DESKTOP");
            }
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.getLocale().translateError(error));
        }
    }
}