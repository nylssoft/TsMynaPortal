import { ContactResult } from "../TypeDefinitions";

export class Contact {
    // filter
    filter: string = "";
    // selected contact in contact detail page
    result: ContactResult | null = null;
    // edit mode for contact detail page
    edit: boolean = false;
    // flag whether contact in contact detail page has changed
    changed: boolean = false;
}