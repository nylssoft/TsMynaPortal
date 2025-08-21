import { FetchHelper } from "./FetchHelper";
import { Security } from "./Security";
import { DiaryEntryResult, MonthAndYear, UserInfoResult } from "./TypeDefinitions";

export class Diary {

    // month and year shown
    private monthAndYear: MonthAndYear;
    // selected day in diary details page
    private day: number | null = null;

    constructor() {
        const now: Date = new Date(Date.now());
        this.monthAndYear = {
            month: now.getMonth(),
            year: now.getFullYear()
        }
    }

    public getMonthAndYear(): MonthAndYear {
        return this.monthAndYear;
    }

    public getDay(): number | null {
        return this.day;
    }

    public setDay(day: number | null) {
        this.day = day;
    }

    public nextMonth() {
        this.monthAndYear.month += 1;
        if (this.monthAndYear.month >= 12) {
            this.monthAndYear.month = 0;
            this.monthAndYear.year += 1;
        }
    }

    public previousMonth() {
        this.monthAndYear.month -= 1;
        if (this.monthAndYear.month < 0) {
            this.monthAndYear.year -= 1;
            this.monthAndYear.month = 11;
        }
    }

    public nextDay() {
        if (this.day != null) {
            this.day += 1;
            if (this.day >= this.getDaysInMonth()) {
                this.nextMonth();
                this.day = 0;
            }
        }
    }

    public previousDay() {
        if (this.day != null) {
            this.day -= 1;
            if (this.day < 0) {
                this.previousMonth();
                this.day = this.getDaysInMonth() - 1;
            }
        }
    }

    public getDaysInMonth(): number {
        return 32 - new Date(this.monthAndYear.year, this.monthAndYear.month, 32).getDate();
    }

    public getFirstDayInMonth(): number {
        const date: Date = new Date(this.monthAndYear.year, this.monthAndYear.month);
        return (date.getDay() + 6) % 7;
    }

    public isToday(now: Date, day: number): boolean {
        return day == now.getDate() && this.monthAndYear.year == now.getFullYear() && this.monthAndYear.month == now.getMonth();
    }

    public getDate(): Date {
        return new Date(Date.UTC(this.monthAndYear.year, this.monthAndYear.month, this.day != null ? this.day : 1));
    }

    public async getDaysAsync(token: string, date: Date): Promise<number[]> {
        const datestr: string = date.toISOString();
        const resp: Response = await FetchHelper.fetchAsync(`/api/diary/day?date=${datestr}`, { headers: { 'token': token } });
        return await resp.json() as number[];
    }

    public async getEntryAsync(token: string, user: UserInfoResult, date: Date): Promise<string | null> {
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