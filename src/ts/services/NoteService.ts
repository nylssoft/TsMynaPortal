import { FetchHelper } from "../utils/FetchHelper";
import { Security } from "../utils/Security";
import { NoteResult, UserInfoResult } from "../TypeDefinitions";

/**
 * NoteService provides methods to manage notes.
 * It includes methods to retrieve notes for the current user,
 * retrieve a specific note by its ID, and handle decryption of note content.
 * It ensures that the notes are fetched securely using the user's data protection key.
 * It handles errors related to missing or invalid data protection keys.
 */
export class NoteService {

    /**
     * Retrieves notes for the current user.
     * This method fetches notes from the API, decrypts the title using the user's data protection key,
     * and returns the notes in a structured format.
     * The last modified date and content is not set in the NoteResult, so it is not included in the returned notes.
     * Use the getNoteAsync method to retrieve a specific note with its content and last modified date.
     * 
     * @param token authentication token
     * @param user current user information
     * @returns notes for the user
     */
    static async getNotesAsync(token: string, user: UserInfoResult): Promise<NoteResult[]> {
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        if (encryptionKey == null || encryptionKey.length === 0) {
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
        const resp: Response = await FetchHelper.fetchAsync('/api/notes/note', { headers: { 'token': token } });
        const notes: NoteResult[] = await resp.json() as NoteResult[];
        try {
            const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
            for (const note of notes) {
                if (note.title.length > 0) {
                    note.title = await Security.decodeMessageAsync(cryptoKey, note.title);
                }
            }
            return notes;
        } catch (e: Error | unknown) {
            console.error("Error decoding note:", e);
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
    }

    /**
     * Retrieves a specific note by its ID.
     * This method fetches the note from the API, decrypts its content using the user's data protection key,
     * and returns the note in a structured format.
     * 
     * @param token authentication token
     * @param user user information
     * @param noteId note ID to retrieve
     * @returns note with the specified ID
     */
    static async getNoteAsync(token: string, user: UserInfoResult, noteId: number): Promise<NoteResult> {
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        if (encryptionKey == null || encryptionKey.length === 0) {
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
        const resp: Response = await FetchHelper.fetchAsync(`/api/notes/note/${noteId}`, { headers: { 'token': token } });
        const note: NoteResult = await resp.json() as NoteResult;
        try {
            const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
            if (note.content == null) {
                note.content = "";
            } else if (note.content.length > 0) {
                note.content = await Security.decodeMessageAsync(cryptoKey, note.content);
            }
            if (note.title.length > 0) {
                note.title = await Security.decodeMessageAsync(cryptoKey, note.title);
            }
            return note;
        } catch (e: Error | unknown) {
            console.error("Error decoding note:", e);
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
    }

    static async deleteNoteAsync(token: string, noteId: number): Promise<void> {
        await FetchHelper.fetchAsync(`/api/notes/note/${noteId}`, { method: "DELETE", headers: { "token": token } });
    }

    static async saveNoteAsync(token: string, user: UserInfoResult, title: string, content: string, id?: number): Promise<void> {
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        if (encryptionKey == null || encryptionKey.length === 0) {
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
        let encodedTitle: string;
        let encodedContent: string;
        try {
            const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
            encodedTitle = await Security.encodeMessageAsync(cryptoKey, title);
            encodedContent = await Security.encodeMessageAsync(cryptoKey, content);
        } catch (e: Error | unknown) {
            console.error("Error encoding note:", e);
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
        const note: NoteResult = { "title": encodedTitle, "content": encodedContent };
        let method: string = "POST";
        if (id) {
            note.id = id;
            method = "PUT";
        }
        await FetchHelper.fetchAsync("/api/notes/note", {
            method: method,
            headers: { 'token': token, 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(note)
        });
    }
}