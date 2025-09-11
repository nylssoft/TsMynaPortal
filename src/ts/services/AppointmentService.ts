import { AppointmentBatchRequest, AppointmentOption, AppointmentParticipant, AppointmentResult, AppointmentUpdate, AppointmentUpdateDefinition, AppointmentUpdateOption, AppointmentUpdateVote, AppointmentVote, UserInfoResult } from "../TypeDefinitions";
import { FetchHelper } from "../utils/FetchHelper";
import { Security } from "../utils/Security";

export class AppointmentService {

    static async getAppointmentAsync(accessToken: string, uuid: string): Promise<AppointmentResult> {
        const resp: Response = await FetchHelper.fetchAsync(`/api/appointment/${uuid}`, { headers: { "accesstoken": accessToken } });
        return await resp.json();
    }

    static async getAppointmentDetailsAsync(token: string, user: UserInfoResult): Promise<AppointmentResult[]> {
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

    static async deleteAppointmentAsync(token: string, uuid: string): Promise<void> {
        await FetchHelper.fetchAsync(`/api/appointment/${uuid}`, {
            method: "DELETE",
            headers: { "token": token, "Accept": "application/json", "Content-Type": "application/json" }
        });
    }

    static async createAppointmentAsync(token: string, user: UserInfoResult, description: string, participants: AppointmentParticipant[], options: AppointmentOption[]): Promise<void> {
        const uuid: string = crypto.randomUUID();
        const definition: AppointmentUpdateDefinition = {
            "Description": description,
            "Participants": [],
            "Options": []
        };
        participants.forEach(p => {
            definition.Participants.push({ "Username": p.username, "UserUuid": p.userUuid });
        });
        options.forEach(o => {
            definition.Options.push({ "Year": o.year, "Month": o.month, "Days": o.days });
        });
        const resp: Response = await FetchHelper.fetchAsync(`/api/appointment/${uuid}/accesstoken`, { headers: { "token": token } })
        const accessToken: string = await resp.json();
        const encryptionKey: string | null = await Security.getEncryptionKeyAsync(user);
        const cryptoKey: CryptoKey = await Security.createCryptoKeyAsync(encryptionKey!, user.passwordManagerSalt)
        const ownerKey = await Security.encodeMessageAsync(cryptoKey, accessToken);
        const appointment: AppointmentUpdate = { "OwnerKey": ownerKey, "Definition": definition };
        await FetchHelper.fetchAsync(`/api/appointment/${uuid}`, {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "token": token, "accesstoken": accessToken },
            body: JSON.stringify(appointment)
        });
    }

    static async updateAppointmentAsync(token: string, accessToken: string, uuid: string, description: string, participants: AppointmentParticipant[], options: AppointmentOption[]): Promise<void> {
        const definition: AppointmentUpdateDefinition = {
            "Description": description,
            "Participants": [],
            "Options": []
        };
        participants.forEach(p => {
            definition.Participants.push({ "Username": p.username, "UserUuid": p.userUuid });
        });
        options.filter(o => o.days.length > 0).forEach(o => {
            definition.Options.push({ "Year": o.year, "Month": o.month, "Days": o.days });
        });
        await FetchHelper.fetchAsync(`/api/appointment/${uuid}`, {
            method: "PUT",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "token": token, "accesstoken": accessToken },
            body: JSON.stringify(definition)
        });
    }

    static async voteAsync(accessToken: string, appointmentUuid: string, vote: AppointmentVote): Promise<void> {
        const updateVote: AppointmentUpdateVote = {
            "UserUuid": vote.userUuid,
            "Accepted": []
        };
        vote.accepted.forEach(opt => {
            const updateOption: AppointmentUpdateOption = {
                Year: opt.year,
                Month: opt.month,
                Days: opt.days
            };
            updateVote.Accepted.push(updateOption);
        });
        await FetchHelper.fetchAsync(`/api/appointment/${appointmentUuid}/vote`, {
            method: "PUT",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "accesstoken": accessToken },
            body: JSON.stringify(updateVote)
        });
    }

    static getParticipantNames(appointment: AppointmentResult | null): string {
        if (appointment != null && appointment.definition) {
            return appointment.definition.participants.map(p => p.username).join(", ");
        }
        return "";
    }

    static getUserUuid(appointment: AppointmentResult | null, name: string): string | null {
        if (appointment != null) {
            const participant: AppointmentParticipant | undefined = appointment.definition!.participants.find(p => p.username == name);
            if (participant) {
                return participant.userUuid;
            }
        }
        return null;
    }

    static getUsername(appointment: AppointmentResult | null, userUuid: string): string | null {
        if (appointment != null) {
            const participant: AppointmentParticipant | undefined = appointment.definition!.participants.find(p => p.userUuid == userUuid);
            if (participant) {
                return participant.username;
            }
        }
        return null;
    }

    static buildAppointmentUrl(appointment: AppointmentResult) {
        const requestId: string = encodeURI(btoa(appointment.accessToken!));
        return `${window.location.href}?vid=${requestId}`;
    }

    static async getAppointmentByVoteIdAsync(vid: string): Promise<AppointmentResult> {
        let accessToken: string = "";
        try {
            accessToken = atob(vid);
        }
        catch (err) {
            console.error(err);
        }
        const arr: string[] = accessToken.split("#");
        if (arr.length != 3) {
            throw new Error("INFO_APPOINTMENT_INVALID");
        }
        const appointment: AppointmentResult = await AppointmentService.getAppointmentAsync(accessToken, arr[1]);
        appointment.accessToken = accessToken;
        return appointment;
    }
}