import { strToU8, zip } from "fflate";
import { UserInfoResult } from "../TypeDefinitions";
import { NoteService } from "./NoteService";

export class NotesExportService {
    static async exportAsync(token: string, user: UserInfoResult, progress: (completed: number, total: number) => void): Promise<Blob | null> {
        const notes = await NoteService.getNotesAsync(token, user);
        const ids: number[] = [];
        for (const note of notes) {
            if (typeof note.id !== "number" || !Number.isSafeInteger(note.id) || note.id <= 0 || ids.includes(note.id)) {
                throw new Error("ERROR_NOTES_EXPORT_RESPONSE");
            }
            ids.push(note.id);
        }
        progress(0, notes.length);
        if (notes.length === 0) return null;
        const files: Record<string, Uint8Array> = {};
        for (let index = 0; index < notes.length; index++) {
            const note = await NoteService.getNoteAsync(token, user, ids[index]);
            if (note.id !== ids[index] || typeof note.title !== "string" || typeof note.content !== "string") {
                throw new Error("ERROR_NOTES_EXPORT_RESPONSE");
            }
            const title = Array.from(note.title.replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, "_").trim()).slice(0, 40).join("").replace(/[. ]+$/, "") || "note";
            files[`notes/${note.id}-${title}.txt`] = strToU8(note.content);
            progress(index + 1, notes.length);
        }
        const archive = await new Promise<Uint8Array>((resolve, reject) => {
            zip(files, (error, data) => error ? reject(error) : resolve(data));
        });
        return new Blob([new Uint8Array(archive).buffer], { type: "application/zip" });
    }
}
