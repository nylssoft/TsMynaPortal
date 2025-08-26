import { SwitchPageClickAction } from "./SwitchPageAction";

/**
 * Action to show the data protection page.
 */
export class ShowDataProtectionPageAction extends SwitchPageClickAction {

    constructor() {
        super("DATA_PROTECTION");
    }
}
