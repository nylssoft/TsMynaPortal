import { DiaryEntryResult, UserInfoResult } from "../TypeDefinitions";
import { FetchHelper } from "../utils/FetchHelper";
import { Security } from "../utils/Security";

export class DiaryService {

    static async getDaysAsync(token: string, date: Date): Promise<number[]> {
        const datestr: string = date.toISOString();
        const resp: Response = await FetchHelper.fetchAsync(`/api/diary/day?date=${datestr}`, { headers: { 'token': token } });
        return await resp.json() as number[];
    }

    static async getEntryAsync(token: string, user: UserInfoResult, date: Date): Promise<string | null> {
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        if (encryptionKey == null || encryptionKey.length === 0) {
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
        const datestr: string = date.toISOString();
        const resp: Response = await FetchHelper.fetchAsync(`/api/diary/entry?date=${datestr}`, { headers: { 'token': token } });
        const diaryEntry: DiaryEntryResult | null = await resp.json() as DiaryEntryResult | null;
        if (diaryEntry == null || diaryEntry.entry.length == 0) return null;
        try {
            const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
            return await Security.decodeMessageAsync(cryptoKey, diaryEntry.entry);
        } catch (e: Error | unknown) {
            console.error("Error decoding diary entry:", e);
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
    }

    static async saveEntryAsync(token: string, user: UserInfoResult, text: string, date: Date): Promise<void> {
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        if (encryptionKey == null || encryptionKey.length === 0) {
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
        const datestr: string = date.toISOString();
        let encodedText: string = "";
        if (text.length > 0) {
            try {
                const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
                encodedText = await Security.encodeMessageAsync(cryptoKey, text);
            } catch (e: Error | unknown) {
                console.error("Error encoding diary entry:", e);
                throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
            }
        }
        const diaryEntry: DiaryEntryResult = { "date": datestr, "entry": encodedText };
        await FetchHelper.fetchAsync(`/api/diary/entry?date=${datestr}`, {
            method: 'POST',
            headers: { 'token': token, 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(diaryEntry)
        });
    }
}