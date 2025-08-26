import { ContactResult } from "../TypeDefinitions";

export class Contact {
    // filter
    filter: string = "";
    // selected contact in contact detail page
    result: ContactResult | null = null;
}