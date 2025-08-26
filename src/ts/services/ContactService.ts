import { FetchHelper } from "../utils/FetchHelper";
import { Security } from "../utils/Security";
import { ContactResult, ContactsResult, DayAndMonth, UserInfoResult } from "../TypeDefinitions";

/**
 * ContactService provides methods to manage contacts.
 */
export class ContactService {

    private static REGEX_DAY_MONTH_DE: RegExp = /^(\d{1,2})\.(\d{1,2})/;
    private static REGEX_DAY_MONTH_USA: RegExp = /^(\d{1,2})\/(\d{1,2})/;

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
        const resp: Response = await FetchHelper.fetchAsync('/api/contacts', { headers: { 'token': token } });
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
     * @returns number of days until the contact's birthday, or null if the birthday is invalid
     */
    static getDaysUntilBirthday(contact: ContactResult): number | null {
        const now: Date = new Date();
        const refDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dayMonth: DayAndMonth | null = this.parseDayMonth(contact.birthday);
        if (dayMonth == null || dayMonth.day < 1 || dayMonth.month < 1 || dayMonth.month > 12 || dayMonth.day > 31) {
            return null;
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
}