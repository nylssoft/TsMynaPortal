import { strToU8 } from "fflate";
import { UserInfoResult } from "../TypeDefinitions";
import { FetchHelper } from "../utils/FetchHelper";
import { DiaryService } from "./DiaryService";
import { ExportArchive, ExportProgress } from "./ExportArchive";
import { waitForExportRequestAsync } from "./ExportRequestDelay";

export class DiaryExportService {
    static async exportAsync(token: string, user: UserInfoResult, progress: ExportProgress): Promise<Blob | null> {
        await waitForExportRequestAsync();
        const response = await FetchHelper.fetchAsync("/api/diary/all", { headers: { token } });
        const dates: unknown = await response.json();
        if (!Array.isArray(dates) || !dates.every((date: unknown) => typeof date === "string" && /^\d{4}-\d{2}-\d{2}(T|$)/.test(date) && Number.isFinite(Date.parse(date)))) {
            throw new Error("ERROR_EXPORT_RESPONSE");
        }
        const days = dates.map(date => date.slice(0, 10)).sort();
        if (new Set(days).size !== days.length) throw new Error("ERROR_EXPORT_RESPONSE");
        progress(0, days.length);
        if (days.length === 0) return null;
        const files: Record<string, Uint8Array> = {};
        for (let i = 0; i < days.length; i++) {
            const date = new Date(`${days[i]}T00:00:00Z`);
            if (date.toISOString().slice(0, 10) !== days[i]) throw new Error("ERROR_EXPORT_RESPONSE");
            await waitForExportRequestAsync();
            const entry = await DiaryService.getEntryAsync(token, user, date);
            if (entry === null) throw new Error("ERROR_EXPORT_RESPONSE");
            files[`diary/${days[i]}.txt`] = strToU8(entry);
            progress(i + 1, days.length);
        }
        return await ExportArchive.createAsync(files);
    }
}
