import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { PageType } from "../TypeDefinitions";

/**
 * Page implementation for the About page.
 */
export class AboutPage implements Page {

    pageType: PageType = "ABOUT";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const aboutMessage: HTMLDivElement = Controls.createDiv(parent, "alert alert-success");
        Controls.createParagraph(aboutMessage, "", pageContext.locale.translate("WEBSITE_INFO"));
        Controls.createParagraph(aboutMessage, "", `Version 0.1.7 ${pageContext.locale.translate("TEXT_COPYRIGHT_YEAR")} ${pageContext.locale.translate("COPYRIGHT")}`);
        const anchor: HTMLAnchorElement = Controls.createAnchor(aboutMessage, "https://github.com/nylssoft/TsMynaPortal", "Soruce Code");
        anchor.setAttribute("target", "_blank");
    }
}
