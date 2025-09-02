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

    static async renameItemAsync(token: string, id: number, name: string): Promise<DocumentItemResult> {
        const resp: Response = await FetchHelper.fetchAsync(`/api/document/item/${id}`, {
            method: "PUT",
            headers: { "token": token, "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(name)
        });
        return await resp.json() as DocumentItemResult;
    }

    static async downloadBlobAsync(token: string, user: UserInfoResult, id: number): Promise<Blob> {
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        if (encryptionKey == null || encryptionKey.length === 0) {
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
        const resp: Response = await FetchHelper.fetchAsync(`/api/document/download/${id}`, { headers: { "token": token } });
        const blob: Blob = await resp.blob();
        try {
            const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey, user.passwordManagerSalt)
            return await Security.decodeBlobAsync(cryptoKey, blob);
        } catch (e: Error | unknown) {
            console.error("Error decoding blob:", e);
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
    }
}