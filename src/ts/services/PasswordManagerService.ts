import { FetchHelper } from "../utils/FetchHelper";
import { Security } from "../utils/Security";
import { PasswordItemResult, PasswordItemsResult, UserInfoResult } from "../TypeDefinitions";

export class PasswordManagerService {

    static async getPasswordFileAsync(token: string, user: UserInfoResult): Promise<PasswordItemsResult> {
        if (!user.hasPasswordManagerFile) {
            return { nextId: 1, items: [] };
        }
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        if (encryptionKey == null || encryptionKey.length === 0) {
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
        const resp: Response = await FetchHelper.fetchAsync("/api/pwdman/file", { headers: { "token": token } });
        const json: string = await resp.json() as string;
        try {
            const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
            const passwordFileJson: string = await Security.decodeMessageAsync(cryptoKey, json!);
            const passwordItems: PasswordItemResult[] = JSON.parse(passwordFileJson) as PasswordItemResult[];
            let idcnt = 1;
            passwordItems.forEach(p => p.id = idcnt++);
            return { nextId: idcnt, items: passwordItems };
        } catch (e: Error | unknown) {
            console.error("Error decoding password file:", e);
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
    }

    static async getPasswordAsync(user: UserInfoResult, item: PasswordItemResult): Promise<string> {
        if (item.Password.length > 0) {
            const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
            const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
            return await Security.decodeMessageAsync(cryptoKey, item.Password);
        }
        return "";
    }

    static async encodePasswordAsync(user: UserInfoResult, item: PasswordItemResult): Promise<void> {
        if (item.Password.length > 0) {
            const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
            const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
            item.Password = await Security.encodeMessageAsync(cryptoKey, item.Password);
        }
    }

    static async savePasswordItemAsync(token: string, user: UserInfoResult, passwordItem: PasswordItemResult): Promise<void> {
        const passwordItems: PasswordItemsResult = await this.getPasswordFileAsync(token, user);
        if (passwordItem.id == undefined) {
            passwordItem.id = passwordItems.nextId;
            passwordItems.nextId++;
            passwordItems.items.push(passwordItem);
        } else {
            const item: PasswordItemResult | undefined = passwordItems.items.find(p => p.id == passwordItem.id);
            if (item) {
                item.Name = passwordItem.Name;
                item.Login = passwordItem.Login;
                item.Password = passwordItem.Password;
                item.Url = passwordItem.Url;
                item.Description = passwordItem.Description;
            }
        }
        await this.savePasswordFileAsync(token, user, passwordItems.items);
        user.hasPasswordManagerFile = true;
    }

    static async deletePasswordItemAsync(token: string, user: UserInfoResult, id: number): Promise<void> {
        const passwordItems: PasswordItemsResult = await this.getPasswordFileAsync(token, user);
        const item: PasswordItemResult | undefined = passwordItems.items.find(p => p.id == id);
        if (item) {
            passwordItems.items = passwordItems.items.filter(p => p.id != id);
            if (passwordItems.items.length == 0) {
                await FetchHelper.fetchAsync("/api/pwdman/file", { method: "DELETE", headers: { "token": token } });
                user.hasPasswordManagerFile = false;
            } else {
                await this.savePasswordFileAsync(token, user, passwordItems.items);
            }
        }
    }

    private static async savePasswordFileAsync(token: string, user: UserInfoResult, passwordItems: PasswordItemResult[]): Promise<void> {
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
        const encodedJson: string = await Security.encodeMessageAsync(cryptoKey, JSON.stringify(passwordItems));
        await FetchHelper.fetchAsync("/api/pwdman/file", {
            method: "POST",
            headers: { "token": token, "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(encodedJson)
        });
    }
}