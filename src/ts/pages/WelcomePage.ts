import { ShowLoginPageAction } from "../actions/ShowLoginPageAction";
import { ShowRegisterPageAction } from "../actions/ShowRegisterPageAction";
import type { Page, PageContext } from "../PageContext";
import { Controls } from "../utils/Controls";

export class WelcomePage implements Page {
    readonly pageType = "WELCOME";

    async renderAsync(parent: HTMLElement, context: PageContext): Promise<void> {
        const { locale } = context;
        const main = Controls.createElement(parent, "main", "py-3 py-md-4");
        Controls.createDiv(main, undefined, undefined, "alertdiv-id");

        const intro = Controls.createElement(main, "section", "bg-body-tertiary rounded-3 p-3 p-md-5 mb-4");
        Controls.createHeading(intro, 1, "display-5 fw-semibold", locale.translate("WELCOME_TITLE"));
        Controls.createParagraph(intro, "lead mb-4", locale.translate("WELCOME_INTRO"));
        const actions = Controls.createDiv(intro, "d-flex flex-wrap gap-2");
        const signIn = Controls.createButton(actions, "button", locale.translate("WELCOME_SIGN_IN"), "btn btn-primary");
        const requestAccount = Controls.createButton(actions, "button", locale.translate("WELCOME_REQUEST_ACCOUNT"), "btn btn-outline-secondary");
        const loginAction = new ShowLoginPageAction();
        const registerAction = new ShowRegisterPageAction();
        signIn.addEventListener("click", async event => loginAction.runAsync(event, context));
        requestAccount.addEventListener("click", async event => registerAction.runAsync(event, context));
        Controls.createParagraph(intro, "small text-body-secondary mt-3 mb-0", locale.translate("WELCOME_APPROVAL"));

        const features = Controls.createDiv(main, "row row-cols-1 row-cols-md-3 g-3");
        for (const feature of ["ORGANIZE", "PLAN", "BACKUP"]) {
            const column = Controls.createDiv(features, "col");
            const card = Controls.createElement(column, "section", "card h-100");
            const body = Controls.createDiv(card, "card-body");
            Controls.createHeading(body, 2, "h5", locale.translate(`WELCOME_${feature}_TITLE`));
            Controls.createParagraph(body, feature === "BACKUP" ? "" : "mb-0", locale.translate(`WELCOME_${feature}_TEXT`));
            if (feature === "BACKUP") {
                Controls.createAnchor(body, "password-backup.html", locale.translate("PASSWORD_BACKUP_OPEN"), "card-link");
            }
        }
    }
}
