import { AppointmentBatchRequest, AppointmentResult, UserInfoResult } from "../TypeDefinitions";
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
            return await batchResp.json() as AppointmentResult[];
        } catch (e: Error | unknown) {
            console.error("Error decoding appointments:", e);
            throw new Error("ERROR_WRONG_DATA_PROTECTION_KEY");
        }
    }
}