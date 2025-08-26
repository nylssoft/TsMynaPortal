import { NoteResult } from "../TypeDefinitions";

export class Note {
    // filter
    filter: string = "";
    // selected note in note detail page
    result: NoteResult | null = null;
}