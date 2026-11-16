import { FetchHelper } from "../utils/FetchHelper";

export type ManagedUser = {
    id: number;
    name: string;
    email: string;
    lastLoginUtc: string | null;
    registeredUtc: string | null;
    roles: string[];
    accountLocked: boolean;
    photo: string | null;
    storageQuota: number;
    loginEnabled: boolean;
};

export class UserAdministrationService {
    static async getUsersAsync(token: string): Promise<ManagedUser[]> {
        const response = await FetchHelper.fetchAsync("/api/pwdman/users", { headers: { token } });
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data.every((user: unknown) => this.isManagedUser(user))) {
            throw new Error("ERROR_ADMIN_USER_RESPONSE");
        }
        return data;
    }

    private static isManagedUser(value: unknown): value is ManagedUser {
        if (typeof value !== "object" || value === null) return false;
        const user = value as Record<string, unknown>;
        const validDate = (date: unknown): boolean => date === null || (typeof date === "string" && Number.isFinite(Date.parse(date)));
        return Number.isSafeInteger(user.id) && Number(user.id) > 0 && typeof user.name === "string" && user.name.length > 0 &&
            typeof user.email === "string" && validDate(user.lastLoginUtc) && validDate(user.registeredUtc) &&
            Array.isArray(user.roles) && user.roles.every((role: unknown) => typeof role === "string") &&
            typeof user.accountLocked === "boolean" && (user.photo === null || typeof user.photo === "string") &&
            typeof user.storageQuota === "number" && Number.isSafeInteger(user.storageQuota) && user.storageQuota >= 0 &&
            typeof user.loginEnabled === "boolean";
    }

    static async getStorageAsync(token: string, id: number): Promise<number> {
        const response = await FetchHelper.fetchAsync(`/api/pwdman/user/${id}/storage`, { headers: { token } });
        const value: unknown = await response.json();
        if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new Error("ERROR_ADMIN_USER_RESPONSE");
        return value;
    }

    static async updateQuotaAsync(token: string, id: number, quota: number): Promise<boolean> {
        return this.sendAsync(token, `/api/pwdman/user/${id}/storage`, "PUT", quota);
    }

    static async updateLoginAsync(token: string, id: number, enabled: boolean): Promise<boolean> {
        return this.sendAsync(token, `/api/pwdman/user/${id}/loginenabled`, "PUT", enabled);
    }

    static async updateRoleAsync(token: string, username: string, roleName: string, assigned: boolean): Promise<boolean> {
        return this.sendAsync(token, "/api/pwdman/user/role", "PUT", { username, roleName, assigned });
    }

    static async unlockAsync(token: string, username: string): Promise<boolean> {
        return this.sendAsync(token, "/api/pwdman/user/unlock", "POST", username);
    }

    static async deleteAsync(token: string, username: string): Promise<boolean> {
        return this.sendAsync(token, "/api/pwdman/user", "DELETE", username);
    }

    private static async sendAsync(token: string, url: string, method: string, body: unknown): Promise<boolean> {
        const response = await FetchHelper.fetchAsync(url, {
            method,
            headers: { "Content-Type": "application/json", token },
            body: JSON.stringify(body)
        });
        const result: unknown = await response.json();
        if (typeof result !== "boolean") throw new Error("ERROR_ADMIN_USER_RESPONSE");
        return result;
    }
}
