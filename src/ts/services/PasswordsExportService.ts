import { strToU8 } from "fflate";
import { PasswordItemResult, UserInfoResult } from "../TypeDefinitions";
import { ExportArchive, ExportProgress } from "./ExportArchive";
import { PasswordManagerService } from "./PasswordManagerService";
import { waitForExportRequestAsync } from "./ExportRequestDelay";

export class PasswordsExportService {
    static async exportAsync(token: string, user: UserInfoResult, progress: ExportProgress, passphrase: string): Promise<Blob | null> {
        if (passphrase.length < 12) throw new Error("ERROR_EXPORT_PASSPHRASE");
        await waitForExportRequestAsync();
        const source = await PasswordManagerService.getPasswordFileAsync(token, user);
        const fields = ["Name", "Login", "Password", "Description", "Url"] as const;
        if (!source || !Array.isArray(source.items) || !source.items.every(item => item && fields.every(key => typeof item[key] === "string"))) {
            throw new Error("ERROR_EXPORT_RESPONSE");
        }
        progress(0, source.items.length);
        if (source.items.length === 0) return null;
        const items: Omit<PasswordItemResult, "id">[] = [];
        for (let i = 0; i < source.items.length; i++) {
            const item = source.items[i];
            items.push({ Name: item.Name, Login: item.Login, Url: item.Url, Description: item.Description,
                Password: await PasswordManagerService.getPasswordAsync(user, item) });
            progress(i + 1, source.items.length);
        }
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const iterations = 600000;
        const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
        const key = await crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, material,
            { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
        const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key,
            new TextEncoder().encode(JSON.stringify({ version: 1, items }))));
        const hex = (bytes: Uint8Array): string => Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
        const envelope = { format: "myna-passwords", version: 1, cipher: "AES-256-GCM", kdf: "PBKDF2-SHA256", iterations,
            salt: hex(salt), iv: hex(iv), ciphertext: hex(ciphertext) };
        return await ExportArchive.createAsync({ "passwords/passwords.encrypted.json": strToU8(JSON.stringify(envelope, null, 2)) });
    }
}
