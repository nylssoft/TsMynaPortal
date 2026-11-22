import { strToU8 } from "fflate";
import { ExportArchive } from "./ExportArchive";
import { UserInfoResult } from "../TypeDefinitions";
import { NoteService } from "./NoteService";
import { waitForExportRequestAsync } from "./ExportRequestDelay";

export class NotesExportService {
    static async exportAsync(token: string, user: UserInfoResult, progress: (completed: number, total: number) => void): Promise<Blob | null> {
        await waitForExportRequestAsync();
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
            await waitForExportRequestAsync();
            const note = await NoteService.getNoteAsync(token, user, ids[index]);
            if (note.id !== ids[index] || typeof note.title !== "string" || typeof note.content !== "string") {
                throw new Error("ERROR_NOTES_EXPORT_RESPONSE");
            }
            const title = ExportArchive.sanitizeName(note.title);
            files[`notes/${note.id}-${title}.txt`] = strToU8(note.content);
            progress(index + 1, notes.length);
        }
        return await ExportArchive.createAsync(files);
    }
}
