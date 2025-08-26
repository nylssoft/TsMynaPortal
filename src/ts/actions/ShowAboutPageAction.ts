import { SwitchPageClickAction } from "./SwitchPageAction";

/**
 * Action to show the about page.
 */
export class ShowAboutPageAction extends SwitchPageClickAction {

    constructor() {
        super("ABOUT");
    }
}
