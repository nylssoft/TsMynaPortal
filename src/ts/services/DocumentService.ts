import { DocumentItemResult, UserInfoResult } from "../TypeDefinitions";
import { FetchHelper } from "../utils/FetchHelper";
import { Security } from "../utils/Security";

export class DocumentService {

    static async getDocumentItemsAsync(token: string, user: UserInfoResult, id: number | null): Promise<DocumentItemResult[]> {
        let url: string = "/api/document/items";
        if (id != null) {
            url += `/${id}`;
        }
        const resp: Response = await FetchHelper.fetchAsync(url, { headers: { "token": token } });
        return await resp.json() as DocumentItemResult[];
    }

    static async createVolumeAsync(token: string, name: string): Promise<DocumentItemResult> {
        const resp: Response = await FetchHelper.fetchAsync("/api/document/volume", {
            method: "POST",
            headers: { "token": token, "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(name)
        });
        return await resp.json() as DocumentItemResult;
    }

    static async createFolderAsync(token: string, parentId: number, name: string): Promise<DocumentItemResult> {
        const resp: Response = await FetchHelper.fetchAsync(`/api/document/folder/${parentId}`, {
            method: "POST",
            headers: { "token": token, "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(name)
        });
        return await resp.json() as DocumentItemResult;
    }

    static async deleteItemsAsync(token: string, parentId: number, ids: number[]): Promise<void> {
        await FetchHelper.fetchAsync(`/api/document/items/${parentId}`, {
            method: "DELETE",
            headers: { "token": token, "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(ids)
        });
    }

    static async moveItemsAsync(token: string, parentId: number, ids: number[]): Promise<void> {
        await FetchHelper.fetchAsync(`/api/document/items/${parentId}`, {
            method: "PUT",
            headers: { "token": token, "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(ids)
        });
    }

    static async renameItemAsync(token: string, id: number, name: string): Promise<DocumentItemResult> {
        const resp: Response = await FetchHelper.fetchAsync(`/api/document/item/${id}`, {
            method: "PUT",
            headers: { "token": token, "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(name)
        });
        return await resp.json() as DocumentItemResult;
    }

    static async downloadBlobAsync(token: string, user: UserInfoResult, item: DocumentItemResult): Promise<Blob> {
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        if (encryptionKey == null || encryptionKey.length === 0) {
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
        const resp: Response = await FetchHelper.fetchAsync(`/api/document/download/${item.id}`, { headers: { "token": token } });
        const blob: Blob = await resp.blob();
        try {
            const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey, user.passwordManagerSalt)
            const ext: string = DocumentService.getExtension(item.name);
            return await Security.decodeBlobAsync(cryptoKey, blob, DocumentService.getMimeType(ext));
        } catch (e: Error | unknown) {
            console.error("Error decoding blob:", e);
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
    }

    static async uploadFileAsync(token: string, user: UserInfoResult, parentId: number, filename: string, fileData: ArrayBuffer): Promise<void> {
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        if (encryptionKey == null || encryptionKey.length === 0) {
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
        const formData: FormData = new FormData();
        try {
            const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey, user.passwordManagerSalt)
            const file: File = await Security.encodeFileAsync(cryptoKey, filename, fileData);
            formData.append("document-file", file);
            formData.append("overwrite", "false");
        } catch (e: Error | unknown) {
            console.error("Error encoding file data:", e);
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
        await FetchHelper.fetchAsync(`/api/document/upload/${parentId}`, { method: "POST", headers: { "token": token }, body: formData });
    }

    static getChildren(parentId: number, docItems: DocumentItemResult[]): DocumentItemResult[] {
        const items: DocumentItemResult[] = [];
        docItems.forEach(item => {
            if (item.parentId === parentId && item.accessRole == null) {
                items.push(item);
            }
        });
        this.sortItems(items);
        return items;
    }

    static getItem(id: number, docItems: DocumentItemResult[]): DocumentItemResult | null {
        const item: DocumentItemResult | undefined = docItems.find(item => item.id === id);
        return item ? item : null;
    }

    static getVolume(docItems: DocumentItemResult[]): DocumentItemResult | undefined {
        return docItems.find(item => item.type == "Volume");
    }

    static getPath(id: number | null, docItems: DocumentItemResult[]): DocumentItemResult[] {
        const items: DocumentItemResult[] = [];
        while (id != null) {
            const item: DocumentItemResult | null = DocumentService.getItem(id, docItems);
            if (item === null) break;
            items.push(item);
            id = item.parentId;
        }
        items.reverse();
        return items;
    }

    static sortItems(items: DocumentItemResult[]) {
        items.sort((item1, item2) => {
            if (item1.type != item2.type) {
                if (item1.type == "Folder") return -1;
                return 1;
            }
            return item1.name.localeCompare(item2.name);
        });
    }

    static getExtension(str: string): string {
        const idx: number | undefined = str.lastIndexOf(".");
        return idx ? str.substring(idx + 1) : "";
    }

    static formatSize(cnt: number) {
        if (cnt >= 1024 * 1024) {
            return `${Math.floor(cnt / (1024 * 1024))} MB`;
        }
        if (cnt >= 1024) {
            return `${Math.floor(cnt / 1024)} KB`;
        }
        return `${cnt} B`;
    }

    static getFileIcon(filename: string): string {
        const ext: string = DocumentService.getExtension(filename);
        const map: any = {
            "pdf": "pdf",
            "png": "image",
            "jpg": "image",
            "doc": "word",
            "xls": "excel",
            "txt": "text"
        }
        const m: string | undefined = map[ext];
        if (m) {
            return `bi-file-${m}`;
        }
        const biFileIcons: string[] = [
            "aac", "ai", "bmp", "cs", "css", "csv", "doc", "docx", "exe", "gif", "heic", "html", "java", "jpg", "js", "json", "jsx",
            "key", "m4p", "md", "mdx", "mov", "mp3", "mp4", "otf", "pdf", "php", "png", "ppt", "pptx", "psd", "py", "raw", "rb", "sass",
            "scss", "sh", "sql", "svg", "tiff", "tsx", "ttf", "txt", "wav", "woff", "xls", "xlsx", "xml", "yml"];
        if (biFileIcons.includes(ext)) {
            return `bi-filetype-${ext}`;
        }
        return "bi-file";
    }

    static getMimeType(ext: string): string {
        const m: any = {
            "aac": "audio/aac",
            "abw": "application/x-abiword",
            "arc": "application/x-freearc",
            "avi": "video/x-msvideo",
            "azw": "application/vnd.amazon.ebook",
            "bin": "application/octet-stream",
            "bmp": "image/bmp",
            "bz": "application/x-bzip",
            "bz2": "application/x-bzip2",
            "cda": "application/x-cdf",
            "csh": "application/x-csh",
            "css": "text/css",
            "csv": "text/csv",
            "doc": "application/msword",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "eot": "application/vnd.ms-fontobject",
            "epub": "application/epub+zip",
            "gz": "application/gzip",
            "gif": "image/gif",
            "htm": "text/html",
            "html": "text/html",
            "ico": "image/vnd.microsoft.icon",
            "ics": "text/calendar",
            "jar": "application/java-archive",
            "jpeg": "image/jpeg",
            "jpg": "image/jpeg",
            "js": "text/javascript",
            "json": "application/json",
            "jsonld": "application/ld+json",
            "mid": "audio/midi audio/x-midi",
            "midi": "audio/midi audio/x-midi",
            "mjs": "text/javascript",
            "mp3": "audio/mpeg",
            "mp4": "video/mp4",
            "mpeg": "video/mpeg",
            "mpkg": "application/vnd.apple.installer+xml",
            "odp": "application/vnd.oasis.opendocument.presentation",
            "ods": "application/vnd.oasis.opendocument.spreadsheet",
            "odt": "application/vnd.oasis.opendocument.text",
            "oga": "audio/ogg",
            "ogv": "video/ogg",
            "ogx": "application/ogg",
            "opus": "audio/opus",
            "otf": "font/otf",
            "png": "image/png",
            "pdf": "application/pdf",
            "php": "application/x-httpd-php",
            "ppt": "application/vnd.ms-powerpoint",
            "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "rar": "application/vnd.rar",
            "rtf": "application/rtf",
            "sh": "application/x-sh",
            "svg": "image/svg+xml",
            "swf": "application/x-shockwave-flash",
            "tar": "application/x-tar",
            "tif": "image/tiff",
            "tiff": "image/tiff",
            "ts": "video/mp2t",
            "ttf": "font/ttf",
            "txt": "text/plain",
            "vsd": "application/vnd.visio",
            "wav": "audio/wav",
            "weba": "audio/webm",
            "webm": "video/webm",
            "webp": "image/webp",
            "woff": "font/woff",
            "woff2": "font/woff2",
            "xhtml": "application/xhtml+xml",
            "xls": "application/vnd.ms-excel",
            "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "xml": "application/xml",
            "xul": "application/vnd.mozilla.xul+xml",
            "zip": "application/zip",
            "3gp": "video/3gpp",
            "3g2": "video/3gpp2",
            "7z": "application/x-7z-compressed"
        };
        return m[ext] || "application/octet-stream";
    }
}