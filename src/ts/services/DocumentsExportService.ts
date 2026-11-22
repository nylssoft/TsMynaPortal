import { DocumentItemResult, UserInfoResult } from "../TypeDefinitions";
import { DocumentService } from "./DocumentService";
import { ExportArchive, ExportProgress } from "./ExportArchive";
import { waitForExportRequestAsync } from "./ExportRequestDelay";

export class DocumentsExportService {
    static async exportAsync(token: string, user: UserInfoResult, progress: ExportProgress): Promise<Blob | null> {
        progress(0, 0);
        await waitForExportRequestAsync();
        const root = await DocumentService.getDocumentItemsAsync(token, user, null);
        if (!Array.isArray(root)) throw new Error("ERROR_EXPORT_RESPONSE");
        const volume = DocumentService.getVolume(root);
        if (!volume) {
            if (root.length > 0) throw new Error("ERROR_EXPORT_RESPONSE");
            return null;
        }
        if (!Number.isSafeInteger(volume.id) || volume.id <= 0) throw new Error("ERROR_EXPORT_RESPONSE");
        return await DocumentsExportService.createArchiveAsync(token, user, root.filter(item => item.parentId === volume.id), progress, new Set([volume.id]));
    }

    static async exportSelectionAsync(token: string, user: UserInfoResult, selected: DocumentItemResult[], progress: ExportProgress): Promise<Blob> {
        if (selected.length === 0) throw new Error("ERROR_INVALID_PARAMETERS");
        progress(0, 0);
        const archive = await this.createArchiveAsync(token, user, selected, progress, new Set());
        if (!archive) throw new Error("ERROR_EXPORT_RESPONSE");
        return archive;
    }

    private static async createArchiveAsync(token: string, user: UserInfoResult, selected: DocumentItemResult[], progress: ExportProgress, seen: Set<number>): Promise<Blob | null> {
        const queue: { id: number; path: string }[] = [];
        const documents: { item: DocumentItemResult; path: string }[] = [];
        const files: Record<string, Uint8Array> = {};
        const addItem = (item: DocumentItemResult, parentPath: string): void => {
            if (!Number.isSafeInteger(item.id) || item.id <= 0 || seen.has(item.id) || typeof item.name !== "string") throw new Error("ERROR_EXPORT_RESPONSE");
            seen.add(item.id);
            const extension = item.type === "Document" ? /\.[a-zA-Z0-9]{1,16}$/.exec(item.name)?.[0] || "" : "";
            const base = extension ? item.name.slice(0, -extension.length) : item.name;
            const path = `${parentPath}${item.id}-${ExportArchive.sanitizeName(base)}${extension}`;
            if (item.type === "Folder") {
                files[path + "/"] = new Uint8Array();
                queue.push({ id: item.id, path: path + "/" });
            } else if (item.type === "Document") {
                documents.push({ item, path });
            } else {
                throw new Error("ERROR_EXPORT_RESPONSE");
            }
        };
        selected.forEach(item => addItem(item, "documents/"));
        for (let index = 0; index < queue.length; index++) {
            progress(0, 0);
            const folder = queue[index];
            await waitForExportRequestAsync();
            const items = await DocumentService.getDocumentItemsAsync(token, user, folder.id);
            if (!Array.isArray(items) || !items.some(item => item.id === folder.id && item.type === "Folder")) throw new Error("ERROR_EXPORT_RESPONSE");
            items.filter(child => child.parentId === folder.id).forEach(item => addItem(item, folder.path));
        }
        progress(0, documents.length);
        if (documents.length === 0 && Object.keys(files).length === 0) return null;
        for (let i = 0; i < documents.length; i++) {
            const { item, path } = documents[i];
            await waitForExportRequestAsync();
            const blob = await DocumentService.downloadBlobAsync(token, user, item);
            files[path] = new Uint8Array(await blob.arrayBuffer());
            progress(i + 1, documents.length);
        }
        return await ExportArchive.createAsync(files);
    }
}
