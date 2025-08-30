import { FetchHelper } from "../utils/FetchHelper";
import { Security } from "../utils/Security";
import { ContactResult, ContactsResult, DayAndMonth, UserInfoResult } from "../TypeDefinitions";

/**
 * ContactService provides methods to manage contacts.
 */
export class ContactService {

    private static REGEX_DAY_MONTH_DE: RegExp = /^(\d{1,2})\.(\d{1,2})/;
    private static REGEX_DAY_MONTH_USA: RegExp = /^(\d{1,2})\/(\d{1,2})/;

    static async saveContactAsync(token: string, user: UserInfoResult, contact: ContactResult): Promise<void> {
        const contacts: ContactsResult = await this.getContactsAsync(token, user);
        if (contact.id == undefined) {
            contact.id = contacts.nextId;
            contacts.nextId += 1;
            contacts.items.push(contact);
        } else {
            const item: ContactResult | undefined = contacts.items.find(c => c.id == contact.id);
            if (item) {
                item.name = contact.name;
                item.phone = contact.phone;
                item.address = contact.address;
                item.email = contact.email;
                item.birthday = contact.birthday;
                item.note = contact.note;
            }
        }
        await this.saveContactsAsync(token, user, contacts);
    }

    static async deleteContactAsync(token: string, user: UserInfoResult, id: number): Promise<void> {
        const contacts: ContactsResult = await this.getContactsAsync(token, user);
        const item: ContactResult | undefined = contacts.items.find(c => c.id == id);
        if (item) {
            contacts.items = contacts.items.filter(c => c.id != id);
            if (contacts.items.length == 0) {
                await FetchHelper.fetchAsync("/api/contacts", { method: "DELETE", headers: { "token": token } });
            } else {
                await this.saveContactsAsync(token, user, contacts);
            }
        }
    }

    /**
     * Retrieves contacts for the current user.
     * This method fetches contacts from the API, decrypts them using the user's data protection key,
     * and returns the contacts in a structured format.
     * It handles errors related to missing or invalid data protection keys.
     * 
     * @param token authentication token
     * @param user current user information
     * @returns contacts for the user
     */
    static async getContactsAsync(token: string, user: UserInfoResult): Promise<ContactsResult> {
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        if (encryptionKey == null || encryptionKey.length === 0) {
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
        const resp: Response = await FetchHelper.fetchAsync("/api/contacts", { headers: { "token": token } });
        const json: string | null = await resp.json() as string | null;
        if (json == null) {
            return { nextId: 1, version: 1, items: [] };
        }
        try {
            const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
            const contactsJson: string = await Security.decodeMessageAsync(cryptoKey, json!);
            return JSON.parse(contactsJson) as ContactsResult;
        } catch (e: Error | unknown) {
            console.error("Error decoding contacts:", e);
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
    }

    /**
     * Retrieves the number of days until the contact's birthday.
     * If the birthday is invalid or not set, it returns null.
     * This method parses the birthday string and calculates the difference
     * between the current date and the next occurrence of the birthday.
     * 
     * @param contact the contact to check
     * @returns number of days until the contact's birthday, or undefined if the birthday is invalid
     */
    static getDaysUntilBirthday(contact: ContactResult): number | undefined {
        const now: Date = new Date();
        const refDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dayMonth: DayAndMonth | null = this.parseDayMonth(contact.birthday);
        if (dayMonth == null || dayMonth.day < 1 || dayMonth.month < 1 || dayMonth.month > 12 || dayMonth.day > 31) {
            return undefined;
        }
        const birthday: Date = new Date(refDate.getFullYear(), dayMonth.month - 1, dayMonth.day);
        if (birthday < refDate) {
            birthday.setFullYear(birthday.getFullYear() + 1);
        }
        const msPerDay: number = 1000 * 60 * 60 * 24;
        const diffMs: number = Math.abs(birthday.getTime() - refDate.getTime());
        return Math.floor(diffMs / msPerDay);
    }

    private static parseDayMonth(dateStr: string): DayAndMonth | null {
        if (dateStr.includes("/")) {
            return this.parseDayMonthUsa(dateStr);
        }
        return this.parseDayMonthDe(dateStr);
    }

    private static parseDayMonthDe(dateStr: string): DayAndMonth | null {
        const match: RegExpExecArray | null = this.REGEX_DAY_MONTH_DE.exec(dateStr.trim());
        if (!match) {
            return null;
        }
        return { day: parseInt(match[1]), month: parseInt(match[2]) };
    }

    private static parseDayMonthUsa(dateStr: string): DayAndMonth | null {
        const match: RegExpExecArray | null = this.REGEX_DAY_MONTH_USA.exec(dateStr.trim());
        if (!match) {
            return null;
        }
        return { day: parseInt(match[2]), month: parseInt(match[1]) };
    }

    private static async saveContactsAsync(token: string, user: UserInfoResult, contacts: ContactsResult): Promise<void> {
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
        const encodedJson: string = await Security.encodeMessageAsync(cryptoKey, JSON.stringify(contacts));
        await FetchHelper.fetchAsync("/api/contacts", {
            method: "PUT",
            headers: { "token": token, "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(encodedJson)
        });
    }
}