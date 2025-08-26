import { SwitchPageClickAction } from "./SwitchPageAction";

/**
 * Action to show the desktop page.
 */
export class ShowDesktopPageAction extends SwitchPageClickAction {

    constructor() {
        super("DESKTOP");
    }
}
