import { AppointmentBatchRequest, AppointmentResult, MonthAndYear, UserInfoResult } from "../TypeDefinitions";
import { FetchHelper } from "../utils/FetchHelper";
import { Security } from "../utils/Security";

export class AppointmentService {

    static async getAppointmentDetails(token: string, user: UserInfoResult): Promise<AppointmentResult[]> {
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        if (encryptionKey == null || encryptionKey.length === 0) {
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
        const resp: Response = await FetchHelper.fetchAsync("/api/appointment", { headers: { "token": token } });
        const appointments: AppointmentResult[] = await resp.json() as AppointmentResult[];
        if (appointments.length == 0) {
            return appointments;
        }
        try {
            const batch: AppointmentBatchRequest[] = [];
            const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
            for (const appointment of appointments) {
                appointment.accessToken = await Security.decodeMessageAsync(cryptoKey, appointment.ownerKey);
                batch.push({ "Method": "GET", "Uuid": appointment.uuid, "accessToken": appointment.accessToken });
            }
            const batchResp: Response = await FetchHelper.fetchAsync("/api/appointment/batch", {
                method: "POST",
                headers: { "token": token, "Accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify(batch)
            });
            const ret: AppointmentResult[] = await batchResp.json() as AppointmentResult[];
            ret.forEach(appointment => appointment.accessToken = appointments.find(a => a.uuid == appointment.uuid)?.accessToken);
            return ret;
        } catch (e: Error | unknown) {
            console.error("Error decoding appointments:", e);
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
    }

    static getParticipantNames(appointment: AppointmentResult | null): string {
        if (appointment != null && appointment.definition) {
            return appointment.definition.participants.map(p => p.username).join(", ");
        }
        return "";
    }

    static buildAppointmentUrl(appointment: AppointmentResult) {
        const requestId: string = encodeURI(btoa(appointment.accessToken!));
        return `${location.origin}?vote=${requestId}`;
    }

    static getDaysInMonth(monthAndYear: MonthAndYear): number {
        return 32 - new Date(monthAndYear.year, monthAndYear.month - 1, 32).getDate();
    }

    static getFirstDayInMonth(monthAndYear: MonthAndYear): number {
        const date: Date = new Date(monthAndYear.year, monthAndYear.month - 1);
        return (date.getDay() + 6) % 7;
    }

    static isBeforeToday(now: Date, day: number, monthAndYear: MonthAndYear): boolean {
        return day < now.getDate() && monthAndYear.year == now.getFullYear() && monthAndYear.month == now.getMonth() + 1 ||
            monthAndYear.year < now.getFullYear() ||
            monthAndYear.year == now.getFullYear() && monthAndYear.month < now.getMonth() + 1;
    }

    static getMinMonthAndYear(appointment: AppointmentResult | null): MonthAndYear {
        let minMonth: number = 0;
        let minYear: number = 9999;
        if (appointment != null) {
            for (const opt of appointment.definition!.options) {
                if (opt.year < minYear) {
                    minYear = opt.year;
                    minMonth = opt.month;
                } else if (opt.year == minYear && opt.month < minMonth) {
                    minMonth = opt.month;
                }
            }
        }
        if (minYear == 9999) {
            const now: Date = new Date();
            minYear = now.getFullYear();
            minMonth = now.getMonth() + 1;
        }
        return { year: minYear, month: minMonth };
    }

    static hasPreviousMonth(monthAndYear: MonthAndYear, appointment: AppointmentResult | null): boolean {
        if (appointment != null) {
            for (const opt of appointment.definition!.options) {
                if (opt.year < monthAndYear.year || opt.year == monthAndYear.year && opt.month < monthAndYear.month) {
                    return true;
                }
            }
        }
        return false;
    }

    static hasNextMonth(monthAndYear: MonthAndYear, appointment: AppointmentResult | null): boolean {
        if (appointment != null) {
            for (const opt of appointment.definition!.options) {
                if (opt.year > monthAndYear.year || opt.year == monthAndYear.year && opt.month > monthAndYear.month) {
                    return true;
                }
            }
        }
        return false;
    }

    static getDate(monthAndYear: MonthAndYear, day: number): Date {
        return new Date(Date.UTC(monthAndYear.year, monthAndYear.month - 1, day));
    }

    static getOptionDays(monthAndYear: MonthAndYear, appointment: AppointmentResult | null): number[] {
        const ret: number[] = [];
        if (appointment != null) {
            appointment.definition!.options.forEach(opt => {
                if (opt.year == monthAndYear.year && opt.month == monthAndYear.month) {
                    ret.push(...opt.days);
                }
            });
        }
        return ret;
    }
}