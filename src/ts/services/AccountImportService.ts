import { ContactsResult, DocumentItemResult, UserInfoResult } from "../TypeDefinitions";
import { PasswordBackupReader, passwordBackupFields } from "./PasswordBackupReader";
import { ContactService } from "./ContactService";
import { DiaryService } from "./DiaryService";
import { DocumentService } from "./DocumentService";
import { NoteService } from "./NoteService";
import { PasswordManagerService } from "./PasswordManagerService";
import { ImportArchive } from "./ImportArchive";
import { FetchHelper } from "../utils/FetchHelper";

export type ImportKind = "notes" | "diary" | "contacts" | "passwords" | "documents";
type Action = (token: string, user: UserInfoResult) => Promise<void>;

export class AccountImportService {
    static async prepareAsync(kind: ImportKind, file: File, passphrase: string, volumeName: string): Promise<Action[]> {
        if (kind === "passwords") {
            const items = await PasswordBackupReader.readAsync(file, passphrase);
            return [async (token, user) => {
                if (typeof user.hasPasswordManagerFile !== "boolean") throw new Error("ERROR_IMPORT_EXISTING");
                const current = await PasswordManagerService.getPasswordFileAsync(token, user);
                if (!current || !Array.isArray(current.items) || !current.items.every(item => item && passwordBackupFields.every(field => typeof item[field] === "string"))) throw new Error("ERROR_IMPORT_EXISTING");
                for (const item of items) await PasswordManagerService.encodePasswordAsync(user, item);
                const merged = [...current.items, ...items];
                if (new TextEncoder().encode(JSON.stringify(merged)).length > 5242852) throw new Error("ERROR_IMPORT_TOO_LARGE");
                await PasswordManagerService.savePasswordFileAsync(token, user, merged);
            }];
        }
        const entries = await ImportArchive.readAsync(file);
        const paths = [...entries.keys()].filter(path => !path.endsWith("/"));
        const read = (path: string): Uint8Array => {
            const value = entries.get(path);
            if (!value) throw new Error("ERROR_IMPORT_ARCHIVE");
            return value;
        };
        const segment = (name: string): string => {
            const match = /^\d+-(.+)$/.exec(name);
            if (!match || match[1].length > 300 || match[1] === "." || match[1] === ".." || /[\u0000-\u001f\\/]/.test(match[1])) throw new Error("ERROR_IMPORT_ARCHIVE");
            return match[1];
        };
        if (kind === "notes") {
            if (paths.length === 0 || [...entries.keys()].some(path => !/^notes\/\d+-.+\.txt$/.test(path))) throw new Error("ERROR_IMPORT_ARCHIVE");
            return paths.map(path => {
                const title = segment(path.slice(6, -4));
                const content = ImportArchive.text(read(path));
                if (new TextEncoder().encode(content).length > 102372 || new TextEncoder().encode(title).length > 272) throw new Error("ERROR_IMPORT_ARCHIVE");
                return (token, user) => NoteService.saveNoteAsync(token, user, title, content);
            });
        }
        if (kind === "diary") {
            if (paths.length === 0 || [...entries.keys()].some(path => !/^diary\/\d{4}-\d{2}-\d{2}\.txt$/.test(path))) throw new Error("ERROR_IMPORT_ARCHIVE");
            const existing = new Set<string>();
            const actions: Action[] = [async (token) => {
                const response = await FetchHelper.fetchAsync("/api/diary/all", { headers: { token } });
                const dates: unknown = await response.json();
                if (!Array.isArray(dates) || !dates.every(date => typeof date === "string" && /^\d{4}-\d{2}-\d{2}(T|$)/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date.slice(0, 10) + "T00:00:00Z").toISOString().slice(0, 10) === date.slice(0, 10))) throw new Error("ERROR_IMPORT_EXISTING");
                dates.forEach(date => existing.add(date.slice(0, 10)));
            }];
            for (const path of paths.sort()) {
                const day = path.slice(6, 16);
                const date = new Date(`${day}T00:00:00Z`);
                if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== day) throw new Error("ERROR_IMPORT_ARCHIVE");
                const content = ImportArchive.text(read(path));
                if (new TextEncoder().encode(content).length > 102372) throw new Error("ERROR_IMPORT_ARCHIVE");
                actions.push(async (token, user) => {
                    if (!existing.has(day)) await DiaryService.saveEntryAsync(token, user, content, date, true);
                });
            }
            return actions;
        }
        if (kind === "contacts") {
            if (!paths.includes("contacts/contacts.json") || [...entries.keys()].some(path => !["contacts/contacts.json", "contacts/contacts.csv", "contacts/"].includes(path))) throw new Error("ERROR_IMPORT_ARCHIVE");
            const data = ImportArchive.json(read("contacts/contacts.json"));
            if (typeof data !== "object" || data === null) throw new Error("ERROR_IMPORT_ARCHIVE");
            const value = data as Partial<ContactsResult>;
            const keys = ["name", "address", "phone", "birthday", "email", "note"] as const;
            if (!Number.isSafeInteger(value.version) || !Number.isSafeInteger(value.nextId) || !Array.isArray(value.items) || value.items.length === 0 || !value.items.every(item => item && Number.isSafeInteger(item.id) && item.id! > 0 && item.id! < value.nextId! && keys.every(key => typeof item[key] === "string")) || new Set(value.items.map(item => item.id)).size !== value.items.length) throw new Error("ERROR_IMPORT_ARCHIVE");
            if (new TextEncoder().encode(JSON.stringify(value)).length > 5242852) throw new Error("ERROR_IMPORT_ARCHIVE");
            const contacts: ContactsResult = { version: value.version!, nextId: value.nextId!, items: value.items };
            return [async (token, user) => {
                if (typeof user.hasContacts !== "boolean") throw new Error("ERROR_IMPORT_EXISTING");
                const current = await ContactService.getContactsAsync(token, user, user.hasContacts);
                if (!current || !Number.isSafeInteger(current.version) || !Number.isSafeInteger(current.nextId) || current.nextId < 1 || !Array.isArray(current.items) || !current.items.every(item => item && Number.isSafeInteger(item.id) && item.id! > 0 && item.id! < current.nextId && keys.every(key => typeof item[key] === "string")) || new Set(current.items.map(item => item.id)).size !== current.items.length) throw new Error("ERROR_IMPORT_EXISTING");
                const hasExisting = user.hasContacts || current.items.length > 0;
                const merged = hasExisting ? { ...current, items: [...current.items] } : contacts;
                if (hasExisting) {
                    if (!Number.isSafeInteger(merged.nextId + contacts.items.length)) throw new Error("ERROR_IMPORT_EXISTING");
                    for (const item of contacts.items) merged.items.push({ ...item, id: merged.nextId++ });
                }
                if (new TextEncoder().encode(JSON.stringify(merged)).length > 5242852) throw new Error("ERROR_IMPORT_TOO_LARGE");
                await ContactService.saveContactsAsync(token, user, merged);
            }];
        }
        const all = [...entries.keys()];
        if (all.length === 0 || all.some(path => !path.startsWith("documents/") || path === "documents/")) throw new Error("ERROR_IMPORT_ARCHIVE");
        const folders = new Map<string, string>();
        const documents: { path: string; parent: string; name: string; data: Uint8Array }[] = [];
        for (const path of all) {
            const pieces = path.slice(10).split("/");
            const directory = path.endsWith("/");
            if (directory) pieces.pop();
            if (!pieces.length || pieces.some(piece => !piece)) throw new Error("ERROR_IMPORT_ARCHIVE");
            const names = pieces.map(segment);
            const parent = pieces.slice(0, -1).join("/");
            if (directory) {
                if (read(path).length !== 0) throw new Error("ERROR_IMPORT_ARCHIVE");
                folders.set(pieces.join("/"), names[names.length - 1]);
            } else {
                const bytes = read(path);
                if (bytes.length + 28 > 20 * 1024 * 1024) throw new Error("ERROR_IMPORT_ARCHIVE");
                documents.push({ path: pieces.join("/"), parent, name: names[names.length - 1], data: bytes });
            }
        }
        for (const path of [...folders.keys(), ...documents.map(item => item.parent)].filter(Boolean)) {
            if (!folders.has(path)) throw new Error("ERROR_IMPORT_ARCHIVE");
            const parent = path.split("/").slice(0, -1).join("/");
            if (parent && !folders.has(parent)) throw new Error("ERROR_IMPORT_ARCHIVE");
        }
        const names = new Set<string>();
        const uniqueName = (path: string, parent: string, name: string): string => {
            let candidate = name;
            const prefix = path.slice(path.lastIndexOf("/") + 1).split("-")[0];
            while (names.has(parent + "\0" + candidate.toLowerCase())) {
                candidate = `${prefix}-${candidate}`;
                if (candidate.length > 300) throw new Error("ERROR_IMPORT_ARCHIVE");
            }
            names.add(parent + "\0" + candidate.toLowerCase());
            return candidate;
        };
        const created = new Map<string, DocumentItemResult>();
        const actions: Action[] = [async (token, user) => {
            const items = await DocumentService.getDocumentItemsAsync(token, user, null);
            if (!Array.isArray(items) || items.some(item => !item || typeof item !== "object")) throw new Error("ERROR_IMPORT_ARCHIVE");
            const existingVolume = DocumentService.getVolume(items);
            if (!existingVolume && items.length) throw new Error("ERROR_IMPORT_EXISTING");
            const volume = existingVolume || await DocumentService.createVolumeAsync(token, volumeName);
            if (!volume || volume.type !== "Volume" || !Number.isSafeInteger(volume.id) || volume.id <= 0 || volume.accessRole) throw new Error("ERROR_IMPORT_EXISTING");
            for (const item of items.filter(item => item.parentId === volume.id)) {
                if (typeof item.name !== "string") throw new Error("ERROR_IMPORT_EXISTING");
                names.add("\0" + item.name.toLowerCase());
            }
            created.set("", volume);
        }];
        [...folders.entries()].sort((a, b) => a[0].split("/").length - b[0].split("/").length).forEach(([path, name]) => actions.push(async (token) => {
            const parent = created.get(path.split("/").slice(0, -1).join("/"));
            if (!parent) throw new Error("ERROR_IMPORT_ARCHIVE");
            const folderName = uniqueName(path, path.split("/").slice(0, -1).join("/"), name);
            const folder = await DocumentService.createFolderAsync(token, parent.id, folderName);
            if (!folder || folder.type !== "Folder" || !Number.isSafeInteger(folder.id) || folder.id <= 0 || folder.parentId !== parent.id || folder.accessRole) throw new Error("ERROR_IMPORT_ARCHIVE");
            created.set(path, folder);
        }));
        documents.forEach(item => actions.push(async (token, user) => {
            const parent = created.get(item.parent);
            if (!parent) throw new Error("ERROR_IMPORT_ARCHIVE");
            await DocumentService.uploadFileAsync(token, user, parent, uniqueName(item.path, item.parent, item.name), new Uint8Array(item.data).buffer);
        }));
        return actions;
    }
}
