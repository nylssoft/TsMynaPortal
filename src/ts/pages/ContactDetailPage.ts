import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { ContactResult, PageType } from "../TypeDefinitions";

/**
 * Page implementation for the Contact Detail page.
 * It displays detailed information about a specific contact, including name, phone, address, email, birthday, and notes.
 * It also provides a back button to return to the Desktop page.
 */
export class ContactDetailPage implements Page {

    hideNavBar?: boolean | undefined = true;

    pageType: PageType = "CONTACT_DETAIL";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        parent = Controls.createDiv(parent, "card p-4 shadow-sm");
        parent.style.maxWidth = "400px";
        const contact: ContactResult = pageContext.contact.result!;
        const cardBody: HTMLDivElement = Controls.createDiv(parent, "card-body");
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
        const backButton: HTMLButtonElement = Controls.createButton(cardBody, "button", pageContext.locale.translate("BUTTON_BACK"), "btn btn-primary");
        backButton.addEventListener("click", async (e: MouseEvent) => {
            e.preventDefault();
            pageContext.pageType = "DESKTOP";
            pageContext.contact.result = null;
            await pageContext.renderAsync();
        });
    }
}
