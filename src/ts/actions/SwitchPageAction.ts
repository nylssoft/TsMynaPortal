import { PageContext } from "../PageContext";
import { PageType } from "../TypeDefinitions";
import { ClickAction } from "./ClickAction";

/**
 * Abstract class for actions that switch the current page.
 */
export abstract class SwitchPageClickAction implements ClickAction {

    protected switchPage: PageType;

    constructor(switchPage: PageType) {
        this.switchPage = switchPage;
    }

    /**
     * Executes the action when the navigation item is clicked and performs any necessary setup before switching pages.
     * 
     * @param e MouseEvent triggered by the click
     * @param pageContext PageContext containing information about the current page and user authentication
     * @returns Promise that resolves to the next page type to switch to
     */
    protected async beforeRunAsync(e: MouseEvent, pageContext: PageContext): Promise<PageType> {
        return this.switchPage;
    }

    protected async afterRunAsync(paggeContext: PageContext): Promise<void> {
        // No default implementation
    }

    async runAsync(e: MouseEvent, pageContext: PageContext): Promise<void> {
        const nextPage: PageType = await this.beforeRunAsync(e, pageContext);
        e.preventDefault();
        pageContext.pageType = nextPage;
        await pageContext.renderAsync();
        await this.afterRunAsync(pageContext);
    }

    isActive(pageContext: PageContext): boolean {
        return this.switchPage === pageContext.pageType;
    }
}
