import { FetchHelper } from "../utils/FetchHelper";
import { Security } from "../utils/Security";
import { PasswordItemResult, UserInfoResult } from "../TypeDefinitions";

export class PasswordManagerService {

    static async getPasswordFileAsync(token: string, user: UserInfoResult): Promise<PasswordItemResult[]> {
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        if (encryptionKey == null || encryptionKey.length === 0) {
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
        const resp: Response = await FetchHelper.fetchAsync("/api/pwdman/file", { headers: { "token": token } });
        const json: string = await resp.json() as string;
        try {
            const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
            const passwordFileJson: string = await Security.decodeMessageAsync(cryptoKey, json!);
            return JSON.parse(passwordFileJson) as PasswordItemResult[];
        } catch (e: Error | unknown) {
            console.error("Error decoding password file:", e);
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
    }

    static async getPasswordAsync(user: UserInfoResult, item: PasswordItemResult): Promise<string> {
        if (item.Password.length > 0) {
            const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
            if (encryptionKey == null || encryptionKey.length === 0) {
                throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
            }
            try {
                const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
                return await Security.decodeMessageAsync(cryptoKey, item.Password);
            } catch (e: Error | unknown) {
                console.error("Error decoding password file:", e);
                throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
            }
        }
        return "";
    }
}