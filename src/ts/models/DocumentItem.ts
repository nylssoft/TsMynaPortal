import { DocumentItemResult } from "../TypeDefinitions";

export class DocumentItem {
    // current  container ID (ID of folder or volume)
    containerId: number | null = null;
    // filter
    filter: string = "";
    // flag whether the document item has changed
    changed: boolean = false;
    // doc items for the current container
    docItems: DocumentItemResult[] = [];
    // edit item
    edit: DocumentItemResult | null = null;
}