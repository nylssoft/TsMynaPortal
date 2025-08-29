import { NoteResult } from "../TypeDefinitions";

export class Note {
    // filter
    filter: string = "";
    // selected note in note detail page
    result: NoteResult | null = null;
    // flag for edit mode
    edit: boolean = false;
    // flag whether the note has changed
    changed: boolean = false;
}