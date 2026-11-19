import { DocumentItemResult, UserInfoResult } from "../TypeDefinitions";
import { DocumentService } from "./DocumentService";
import { ExportArchive, ExportProgress } from "./ExportArchive";

export class DocumentsExportService {
    static async exportAsync(token: string, user: UserInfoResult, progress: ExportProgress): Promise<Blob | null> {
        progress(0, 0);
        const root = await DocumentService.getDocumentItemsAsync(token, user, null);
        if (!Array.isArray(root)) throw new Error("ERROR_EXPORT_RESPONSE");
        const volume = DocumentService.getVolume(root);
        if (!volume) {
            if (root.length > 0) throw new Error("ERROR_EXPORT_RESPONSE");
            return null;
        }
        if (!Number.isSafeInteger(volume.id) || volume.id <= 0) throw new Error("ERROR_EXPORT_RESPONSE");
        const queue = [{ id: volume.id, path: "documents/", items: root }];
        const seen = new Set<number>([volume.id]);
        const documents: { item: DocumentItemResult; path: string }[] = [];
        const files: Record<string, Uint8Array> = {};
        for (let index = 0; index < queue.length; index++) {
            const folder = queue[index];
            const items = index === 0 ? folder.items : await DocumentService.getDocumentItemsAsync(token, user, folder.id);
            if (!Array.isArray(items) || !items.some(item => item.id === folder.id && (item.type === "Folder" || item.type === "Volume"))) {
                throw new Error("ERROR_EXPORT_RESPONSE");
            }
            for (const item of items.filter(child => child.parentId === folder.id)) {
                if (!Number.isSafeInteger(item.id) || item.id <= 0 || seen.has(item.id) || typeof item.name !== "string") throw new Error("ERROR_EXPORT_RESPONSE");
                seen.add(item.id);
                const extension = item.type === "Document" ? /\.[a-zA-Z0-9]{1,16}$/.exec(item.name)?.[0] || "" : "";
                const base = extension ? item.name.slice(0, -extension.length) : item.name;
                const path = `${folder.path}${item.id}-${ExportArchive.sanitizeName(base)}${extension}`;
                if (item.type === "Folder") {
                    files[path + "/"] = new Uint8Array();
                    queue.push({ id: item.id, path: path + "/", items: [] });
                } else if (item.type === "Document") {
                    documents.push({ item, path });
                } else {
                    throw new Error("ERROR_EXPORT_RESPONSE");
                }
            }
        }
        progress(0, documents.length);
        if (documents.length === 0 && Object.keys(files).length === 0) return null;
        for (let i = 0; i < documents.length; i++) {
            const { item, path } = documents[i];
            const blob = await DocumentService.downloadBlobAsync(token, user, item);
            files[path] = new Uint8Array(await blob.arrayBuffer());
            progress(i + 1, documents.length);
        }
        return await ExportArchive.createAsync(files);
    }
}
