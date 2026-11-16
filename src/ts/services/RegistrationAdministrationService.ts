import { FetchHelper } from "../utils/FetchHelper";

export type RegistrationRequest = {
    email: string;
    requestedUtc: string | null;
};

export class RegistrationAdministrationService {
    static async getRequestsAsync(token: string): Promise<RegistrationRequest[]> {
        const response = await FetchHelper.fetchAsync("/api/pwdman/confirmation", { headers: { token } });
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data.every(item =>
            typeof item === "object" && item !== null &&
            typeof item.email === "string" && item.email.length > 0 &&
            (item.requestedUtc === null || (typeof item.requestedUtc === "string" && Number.isFinite(Date.parse(item.requestedUtc)))))) {
            throw new Error("ERROR_REGISTRATION_RESPONSE");
        }
        return data;
    }

    static async processRequestAsync(token: string, email: string, notification: boolean, reject: boolean): Promise<string | null> {
        const response = await FetchHelper.fetchAsync("/api/pwdman/confirmation", {
            method: "POST",
            headers: { "Content-Type": "application/json", token },
            body: JSON.stringify({ email, notification, reject })
        });
        const result: unknown = await response.json();
        if (reject && result === null) return null;
        if (!reject && typeof result === "string" && result.length > 0) return result;
        throw new Error("ERROR_REGISTRATION_RESPONSE");
    }
}
