import { DocumentItemResult } from "../TypeDefinitions";

export class DocumentItem {
    // current  container ID (ID of folder or volume)
    containerId: number | null = null;
    // filter
    filter: string = "";
    // flag whether the document item has changed
    changed: boolean = false;
    // edit item
    edit: DocumentItemResult | null = null;
    // all document items (contains path to the root and all container children)
    all: DocumentItemResult[] = [];
    // doc items for the current container
    filtered: DocumentItemResult[] = [];
    // move items
    moved: DocumentItemResult[] = [];
}