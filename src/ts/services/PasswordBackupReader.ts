import type { PasswordItemResult } from "../TypeDefinitions";
import { ImportArchive } from "./ImportArchive";

export const passwordBackupFields = ["Name", "Login", "Password", "Description", "Url"] as const;
export type PasswordBackupItem = Pick<PasswordItemResult, typeof passwordBackupFields[number]>;

export class PasswordBackupReader {
    static async readAsync(file: File, passphrase: string): Promise<PasswordBackupItem[]> {
        const entries = await ImportArchive.readAsync(file, 16 * 1024 * 1024);
        const path = "passwords/passwords.encrypted.json";
        const bytes = entries.get(path);
        if (!bytes || [...entries].some(([name, data]) => name !== path && (name !== "passwords/" || data.length !== 0))) {
            throw new Error("ERROR_IMPORT_ARCHIVE");
        }
        const raw = ImportArchive.json(bytes);
        if (typeof raw !== "object" || raw === null) throw new Error("ERROR_IMPORT_ARCHIVE");
        const envelope = raw as Record<string, unknown>;
        const { format, version, cipher, kdf, iterations, salt, iv, ciphertext } = envelope;
        if (format !== "myna-passwords" || version !== 1 || cipher !== "AES-256-GCM" || kdf !== "PBKDF2-SHA256" ||
            iterations !== 600000 || typeof salt !== "string" || !/^[0-9a-f]{32}$/i.test(salt) ||
            typeof iv !== "string" || !/^[0-9a-f]{24}$/i.test(iv) || typeof ciphertext !== "string" ||
            ciphertext.length < 32 || ciphertext.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(ciphertext)) {
            throw new Error("ERROR_IMPORT_ARCHIVE");
        }
        const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
        const key = await crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: this.decodeHex(salt), iterations }, material,
            { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
        let plaintext: Uint8Array;
        try {
            plaintext = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: this.decodeHex(iv) }, key, this.decodeHex(ciphertext)));
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === "OperationError") throw new Error("ERROR_IMPORT_PASSPHRASE");
            throw error;
        }
        try {
            const parsed = ImportArchive.json(plaintext);
            if (typeof parsed !== "object" || parsed === null) throw new Error("ERROR_IMPORT_ARCHIVE");
            const data = parsed as { version?: unknown; items?: unknown };
            if (data.version !== 1 || !Array.isArray(data.items) || !data.items.length || !data.items.every(this.isItem)) {
                throw new Error("ERROR_IMPORT_ARCHIVE");
            }
            return data.items.map(({ Name, Login, Password, Description, Url }) => ({ Name, Login, Password, Description, Url }));
        } finally {
            plaintext.fill(0);
        }
    }

    private static isItem(item: unknown): item is PasswordBackupItem {
        if (typeof item !== "object" || item === null) return false;
        const fields = item as Record<string, unknown>;
        return passwordBackupFields.every(field => typeof fields[field] === "string");
    }

    private static decodeHex(hex: string): Uint8Array<ArrayBuffer> {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
        return bytes;
    }
}
