import { PageContext } from "../PageContext";
import { Controls } from "../Controls";

export class About {
    
    public static async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        parent = Controls.createDiv(parent, "container py-4 px-3 mx-auto");
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        Controls.createHeading(parent, 1, "text-center mb-4", pageContext.getLocale().translate("ABOUT"));
        const aboutMessage: HTMLDivElement = Controls.createDiv(parent, "alert alert-success");
        aboutMessage.textContent = pageContext.getLocale().translate("TEXT_COPYRIGHT_YEAR");
    }
}