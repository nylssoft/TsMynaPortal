import { strToU8 } from "fflate";
import { UserInfoResult } from "../TypeDefinitions";
import { ContactService } from "./ContactService";
import { ExportArchive, ExportProgress } from "./ExportArchive";
import { waitForExportRequestAsync } from "./ExportRequestDelay";

export class ContactsExportService {
    static async exportAsync(token: string, user: UserInfoResult, progress: ExportProgress): Promise<Blob | null> {
        await waitForExportRequestAsync();
        const contacts = await ContactService.getContactsAsync(token, user);
        const columns = ["name", "address", "phone", "birthday", "email", "note"] as const;
        if (!contacts || !Array.isArray(contacts.items) || !contacts.items.every(contact => contact && columns.every(key => typeof contact[key] === "string"))) {
            throw new Error("ERROR_EXPORT_RESPONSE");
        }
        progress(0, contacts.items.length);
        if (contacts.items.length === 0) return null;
        const cell = (value: string): string => `"${(/^[\s]*[=+\-@\t\r\n]/.test(value) ? "'" + value : value).replace(/"/g, '""')}"`;
        const rows = [columns.map(cell).join(",")];
        contacts.items.forEach((contact, index) => {
            rows.push(columns.map(key => cell(contact[key])).join(","));
            progress(index + 1, contacts.items.length);
        });
        return await ExportArchive.createAsync({
            "contacts/contacts.json": strToU8(JSON.stringify(contacts, null, 2)),
            "contacts/contacts.csv": strToU8("\ufeff" + rows.join("\r\n"))
        });
    }
}
