import { PageContext } from "../PageContext";
import { ContactService } from "../services/ContactService";
import { ContactResult, ContactsResult, DesktopTabType, UserInfoResult } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { DesktopTab } from "./DesktopTab";

export class BirthdayTab implements DesktopTab {
    tabType: DesktopTabType = "BIRTHDAYS";
    bootstrapIcon: string = "bi-cake";
    titleKey: string = "BIRTHDAYS";

    async renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const contacts: ContactsResult = await ContactService.getContactsAsync(token, userInfo);
            Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate(this.titleKey));
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
                    const a: HTMLElement = Controls.createSpan(listGroup, "list-group-item");
                    a.setAttribute("role", "button");
                    Controls.createSpan(a, "bi bi-person");
                    Controls.createSpan(a, "ms-2", contact.name);
                    Controls.createSpan(a, `ms-2 bi ${this.bootstrapIcon}`);
                    if (contact.daysUntilBirthday == 0) {
                        Controls.createSpan(a, "ms-2", pageContext.locale.translate("TODAY"));
                    } else if (contact.daysUntilBirthday == 1) {
                        Controls.createSpan(a, "ms-2", pageContext.locale.translate("TOMORROW"));
                    } else {
                        Controls.createSpan(a, "ms-2", `${contact.daysUntilBirthday} ${pageContext.locale.translate("DAYS")}`);
                    }
                    a.addEventListener("click", async (e: MouseEvent) => {
                        e.preventDefault();
                        pageContext.pageType = "CONTACT_DETAIL";
                        pageContext.contact.result = contact;
                        await pageContext.renderAsync();
                    });
                });
            }
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }
}