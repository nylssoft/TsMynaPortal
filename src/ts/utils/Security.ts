import { UserInfoResult } from "../TypeDefinitions";

/**
 * Security class provides methods for creating cryptographic keys,
 * encrypting and decrypting messages, and managing secure local storage.
 * It uses the Web Crypto API to perform cryptographic operations
 * such as PBKDF2 key derivation and AES-GCM encryption/decryption.
 */
export class Security {

    /**
     * Creates a CryptoKey using PBKDF2 with the provided key and salt
     * 
     * @param key key to use for encryption
     * @param salt salt to use for key derivation
     * @returns 
     */
    static async createCryptoKeyAsync(key: string, salt: string): Promise<CryptoKey> {
        const pwdCryptoKey: CryptoKey = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(key), "PBKDF2", false, ["deriveKey"]);
        const algo: Pbkdf2Params = {
            "name": "PBKDF2",
            "hash": "SHA-256",
            "salt": new TextEncoder().encode(salt),
            "iterations": 1000
        };
        return await window.crypto.subtle.deriveKey(algo, pwdCryptoKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    }

    /**
     * Encrypts a message using AES-GCM with the provided CryptoKey.
     * The message is encoded as a hex string, prefixed with the IV used for encryption.
     * This allows the message to be decrypted later using the same key.
     * 
     * @param cryptoKey CryptoKey to use for encryption
     * @param msg message to encrypt
     * @returns encoded message as a hex string
     */
    static async encodeMessageAsync(cryptoKey: CryptoKey, msg: string): Promise<string> {
        const arr: Uint8Array<ArrayBuffer> = new TextEncoder().encode(msg);
        const iv: Uint8Array<ArrayBuffer> = window.crypto.getRandomValues(new Uint8Array(12));
        const options: AesGcmParams = { name: "AES-GCM", iv: iv };
        const cipherText: ArrayBuffer = await window.crypto.subtle.encrypt(options, cryptoKey, arr);
        return this.buf2hex(iv.buffer) + this.buf2hex(cipherText);
    }

    /**
     * Decrypts a message using AES-GCM with the provided CryptoKey.
     * The message should be a hex string prefixed with the IV used for encryption.
     * This allows the message to be decrypted back to its original string format.
     * 
     * @param cryptoKey CryptoKey to use for decryption
     * @param msg message to decrypt, which should be a hex string prefixed with the IV used for encryption
     * @returns decoded message as a string
     */
    static async decodeMessageAsync(cryptoKey: CryptoKey, msg: string): Promise<string> {
        const iv: number[] = this.hex2arr(msg.substring(0, 12 * 2));
        const data: number[] = this.hex2arr(msg.substring(12 * 2));
        const options: AesGcmParams = { name: "AES-GCM", iv: new Uint8Array(iv) };
        const cipherbuffer: ArrayBuffer = new ArrayBuffer(data.length);
        const cipherarr: Uint8Array<ArrayBuffer> = new Uint8Array(cipherbuffer);
        cipherarr.set(data);
        const decrypted: ArrayBuffer = await window.crypto.subtle.decrypt(options, cryptoKey, cipherbuffer);
        return new TextDecoder().decode(decrypted);
    }

    static async encodeFileAsync(cryptoKey: CryptoKey, filename: string, fileData: ArrayBuffer): Promise<File> {
        const iv: Uint8Array<ArrayBuffer> = window.crypto.getRandomValues(new Uint8Array(12));
        const options: AesGcmParams = { name: "AES-GCM", iv: iv };
        const encrypted: ArrayBuffer = await window.crypto.subtle.encrypt(options, cryptoKey, fileData);
        const view: Uint8Array<ArrayBuffer> = new Uint8Array(encrypted);
        const data: Uint8Array<ArrayBuffer> = new Uint8Array(encrypted.byteLength + 12);
        data.set(iv, 0);
        data.set(view, 12);
        return new File([data.buffer], filename, { type: "application/octet-stream" });
    }

    static async decodeBlobAsync(cryptoKey: CryptoKey, blob: Blob): Promise<Blob> {
        const iv: Uint8Array<ArrayBuffer> = new Uint8Array(12);
        const data: Uint8Array<ArrayBuffer> = new Uint8Array(blob.size - 12);
        const reader: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>> = blob.stream().getReader();
        let idx: number = 0;
        while (true) {
            const readResponse: ReadableStreamReadResult<Uint8Array<ArrayBuffer>> = await reader.read();
            if (readResponse.done) break;
            readResponse.value.forEach(val => {
                if (idx < 12) {
                    iv[idx] = val;
                } else {
                    data[idx - 12] = val;
                }
                idx++;
            });
        }
        const options: AesGcmParams = { name: "AES-GCM", iv: iv };
        const decoded: ArrayBuffer = await crypto.subtle.decrypt(options, cryptoKey, data);
        return new Blob([decoded]);
    }

    /**
     * Retrieves the encryption key for a user from session storage or secure local storage.
     * If the key is not found in session storage, it attempts to retrieve it from secure local storage.
     * If found, it caches the key in session storage for future use.
     * If the key is not found in either storage, it returns null.
     * 
     * @param user UserInfoResult object containing user information
     * @returns encryption key for the user, or null if not found
     */
    static async getEncryptionKeyAsync(user: UserInfoResult): Promise<string | null> {
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

    /**
     * Sets the encryption key for a user in both session storage and secure local storage.
     * If the provided key is null or empty, it removes the key from both storages.
     * This ensures that the user's encryption key is securely stored and can be retrieved later.
     * 
     * @param user UserInfoResult object containing user information
     * @param encryptKey encryption key to set for the user
     */
    static async setEncryptionKeyAsync(user: UserInfoResult, encryptKey: string | null) {
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

    /**
     * Retrieves the session storage key for a user's encryption key.
     * This key is used to store the user's encryption key in session storage,
     * allowing for quick access during the user's session.
     * 
     * @param user UserInfoResult object containing user information
     * @returns session storage key for the user's encryption key
     */
    static getSessionStorageKey(user: UserInfoResult): string {
        return `encryptkey-${user.id}`;
    }

    /**
     * Generates a random encryption key consisting of 24 characters
     * from a predefined set of characters. This key can be used for
     * encryption purposes in the application.
     * 
     * @returns a randomly generated encryption key consisting of 24 characters
     *          from a predefined set of characters.
     */
    static generateEncryptionKey(): string {
        const chars: string = "!@$()=+-,:.ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const arr: Uint32Array<ArrayBuffer> = new Uint32Array(24);
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

    private static async getSecureLocalStorageAsync(user: UserInfoResult, key: string): Promise<string | null> {
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
            const h: string = str.substring(idx, idx + 2);
            ret.push(parseInt(h, 16));
        }
        return ret;
    }
}