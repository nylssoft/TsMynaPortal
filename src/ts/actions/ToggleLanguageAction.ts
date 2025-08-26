import { PageContext } from "../PageContext";
import { ClickAction } from "./ClickAction";

/**
 * Action to toggle the language between German and English.
 */
export class ToggleLanguageAction implements ClickAction {

    async runAsync(e: MouseEvent, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const switchLanguage = pageContext.locale.getLanguage() === "de" ? "en" : "de";
        await pageContext.locale.setLanguageAsync(switchLanguage);
        await pageContext.renderAsync();
    }

    isActive(_: PageContext): boolean {
        return false;
    }
}
