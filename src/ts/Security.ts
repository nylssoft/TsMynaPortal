import { UserInfoResult } from "./TypeDefinitions";

export class Security {

    public static async createCryptoKeyAsync(key: string, salt: string): Promise<CryptoKey> {
        const pwdCryptoKey: CryptoKey = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(key), "PBKDF2", false, ["deriveKey"]);
        const algo: Pbkdf2Params = {
            "name": "PBKDF2",
            "hash": "SHA-256",
            "salt": new TextEncoder().encode(salt),
            "iterations": 1000
        };
        return await window.crypto.subtle.deriveKey(algo, pwdCryptoKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    }

    public static async encodeMessageAsync(cryptoKey: CryptoKey, msg: string): Promise<string> {
        const arr: Uint8Array<ArrayBuffer> = new TextEncoder().encode(msg);
        const iv: Uint8Array<ArrayBuffer> = window.crypto.getRandomValues(new Uint8Array(12));
        const options: AesGcmParams = { name: "AES-GCM", iv: iv };
        const cipherText: ArrayBuffer = await window.crypto.subtle.encrypt(options, cryptoKey, arr);
        return this.buf2hex(iv.buffer) + this.buf2hex(cipherText);
    }

    public static async decodeMessageAsync(cryptoKey: CryptoKey, msg: string): Promise<string> {
        const iv: number[] = this.hex2arr(msg.substring(0, 12 * 2));
        const data: number[] = this.hex2arr(msg.substring(12 * 2));
        const options: AesGcmParams = { name: "AES-GCM", iv: new Uint8Array(iv) };
        const cipherbuffer: ArrayBuffer = new ArrayBuffer(data.length);
        const cipherarr: Uint8Array<ArrayBuffer> = new Uint8Array(cipherbuffer);
        cipherarr.set(data);
        const decrypted: ArrayBuffer = await window.crypto.subtle.decrypt(options, cryptoKey, cipherbuffer);
        return new TextDecoder().decode(decrypted);
    }

    public static async getEncryptionKeyAsync(user: UserInfoResult): Promise<string | null> {
        const storageKey: string = "encryptkey";
        const sessionKey: string = `${storageKey}-${user.id}`;
        let encryptKey = window.sessionStorage.getItem(sessionKey);
        if (encryptKey == null) {
            encryptKey = await this.getSecureLocalStorageAsync(user, storageKey);
            if (encryptKey != null) {
                window.sessionStorage.setItem(sessionKey, encryptKey);
            }
        }
        return encryptKey != null && encryptKey.length > 0 ? encryptKey : null;
    }

    public static async setEncryptionKeyAsync(user: UserInfoResult, encryptKey: string | null) {
        const storageKey: string = "encryptkey";
        const sessionKey: string = `${storageKey}-${user.id}`;
        if (encryptKey != null && encryptKey.length > 0) {
            window.sessionStorage.setItem(sessionKey, encryptKey);
            await this.setSecureLocalStorageAsync(user, storageKey, encryptKey);
        }
        else {
            window.sessionStorage.removeItem(sessionKey);
            this.removeSecureLocalStorage(user, storageKey);
        }
    }

    public static getSessionStorageKey(user: UserInfoResult): string {
        return `encryptkey-${user.id}`;
    }

    public static generateEncryptionKey(len: number): string {
        const chars: string = "!@$()=+-,:.ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const arr: Uint32Array<ArrayBuffer> = new Uint32Array(len);
        window.crypto.getRandomValues(arr);
        let encryptKey: string = "";
        for (let i: number = 0; i < arr.length; i++) {
            const idx: number = (arr[i] % chars.length);
            encryptKey += chars[idx];
        }
        return encryptKey;
    }

    private static getSecureLocalStorageKey(user: UserInfoResult, key: string): string {
        return `${key}-${user.id}-secure`;
    }

    private static async getSecureLocalStorageAsync(user: UserInfoResult, key: string): Promise<string|null> {
        const storageKey: string = this.getSecureLocalStorageKey(user, key);
        const secureValue: string | null = window.localStorage.getItem(storageKey);
        if (secureValue != null && user.secKey != null) {
            try {
                return await this.decodeSecKeyAsync(user.secKey, secureValue);
            }
            catch (e: Error | unknown) {
                console.error(e);
            }
        }
        return null;
    }

    private static async removeSecureLocalStorage(user: UserInfoResult, key: string) {        
        const storageKey: string = this.getSecureLocalStorageKey(user, key);
        window.localStorage.removeItem(storageKey);
    }

    private static async decodeSecKeyAsync(secKey: string, msg: string): Promise<string> {
        const rawKey: Uint8Array<ArrayBuffer> = new Uint8Array(this.hex2arr(secKey));
        const cryptoKey: CryptoKey = await window.crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
        return await this.decodeMessageAsync(cryptoKey, msg);
    }

    private static async setSecureLocalStorageAsync(user: UserInfoResult, key: string, val: string) {
        if (user.secKey != null) {
            const storageKey: string = this.getSecureLocalStorageKey(user, key);
            try {
                const secureValue: string | null = await this.encodeSecKeyAsync(user.secKey, val);
                if (secureValue != null) {
                    window.localStorage.setItem(storageKey, secureValue);
                }
            }
            catch (e: Error | unknown) {
                console.error(e);
                window.localStorage.removeItem(storageKey);
            }
        }
    }

    private static async encodeSecKeyAsync(secKey: string, msg: string): Promise<string> {
        const rawKey: Uint8Array<ArrayBuffer> = new Uint8Array(this.hex2arr(secKey));
        const cryptoKey: CryptoKey = await window.crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
        return await this.encodeMessageAsync(cryptoKey, msg);
    }

    private static buf2hex(buffer: ArrayBuffer): string {
        const arr: Uint8Array = new Uint8Array(buffer);
        return Array.prototype.map.call(arr, x => ("00" + x.toString(16)).slice(-2)).join("");
    }

    private static hex2arr(str: string): number[] {
        const ret: number[] = [];
        const l: number = str.length;
        for (let idx: number = 0; idx < l; idx += 2) {
            const h: string = str.substring(idx, idx+2);
            ret.push(parseInt(h, 16));
        }
        return ret;
    }

}