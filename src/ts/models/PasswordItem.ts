import { PasswordItemResult } from "../TypeDefinitions";

export class PasswordItem {
    // filter
    filter: string = "";
    // selected password item in password detail page
    result: PasswordItemResult | null = null;
}