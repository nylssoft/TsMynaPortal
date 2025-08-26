import { PageContext } from "../PageContext";

/**
 * Interface for actions that can be triggered by clicking on navigation items.
 */
export interface ClickAction {

    /**
     * Executes the action when the navigation item is clicked.
     * 
     * @param e MouseEvent triggered by the click
     * @param pageContext PageContext containing information about the current page and user authentication
     */
    runAsync(e: MouseEvent, pageContext: PageContext): Promise<void>;

    /**
     * Returns whether the action is active on the current page.
     * 
     * @param pageContext PageContext containing information about the current page and user authentication
     * @return boolean indicating whether the action is active on the current page
     */
    isActive(pageContext: PageContext): boolean;
}
