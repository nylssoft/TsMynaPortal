import { NoteResult } from "../TypeDefinitions";

export class Note {
    // filter
    filter: string = "";
    sortBy: "name" | "modified" = localStorage.getItem("notes-sort-by") === "modified" ? "modified" : "name";
    sortOrder: "ascending" | "descending" = localStorage.getItem("notes-sort-order") === "descending" ? "descending" : "ascending";
    // selected note in note detail page
    result: NoteResult | null = null;
    // flag for edit mode
    edit: boolean = false;
    // flag whether the note has changed
    changed: boolean = false;
}