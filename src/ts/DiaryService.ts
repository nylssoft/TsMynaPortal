import { FetchHelper } from "./FetchHelper";
import { Security } from "./Security";
import { DiaryEntryResult, UserInfoResult } from "./TypeDefinitions";

export class DiaryService {

    public static async getDaysAsync(token: string, date: Date): Promise<number[]> {
        const datestr: string = date.toISOString();
        const resp: Response = await FetchHelper.fetchAsync(`/api/diary/day?date=${datestr}`, { headers: { 'token': token } });
        return await resp.json() as number[];
    }

    public static async getEntryAsync(token: string, user: UserInfoResult, date: Date): Promise<string | null> {
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        if (encryptionKey == null || encryptionKey.length === 0) {
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
        const datestr: string = date.toISOString();
        const resp: Response = await FetchHelper.fetchAsync(`/api/diary/entry?date=${datestr}`, { headers: { 'token': token } });
        const diaryEntry: DiaryEntryResult | null = await resp.json() as DiaryEntryResult | null;
        if (diaryEntry == null) return null;
        try {
            const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
            return await Security.decodeMessageAsync(cryptoKey, diaryEntry.entry);
        } catch (e: Error | unknown) {
            console.error("Error decoding diary entry:", e);
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
    }
}