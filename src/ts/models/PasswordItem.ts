import { PasswordItemResult } from "../TypeDefinitions";

export class PasswordItem {
    // filter
    filter: string = "";
    // selected password item in password detail page
    result: PasswordItemResult | null = null;
    // edit mode for password detail page
    edit: boolean = false;
    // flag whether password item in password detail page has changed
    changed: boolean = false;
}