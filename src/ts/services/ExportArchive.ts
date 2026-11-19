import { zip } from "fflate";

export type ExportProgress = (completed: number, total: number) => void;

export class ExportArchive {
    static sanitizeName(value: string, limit: number = 40): string {
        return Array.from(value.replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, "_").trim()).slice(0, limit).join("").replace(/[. ]+$/, "") || "item";
    }

    static async createAsync(files: Record<string, Uint8Array>): Promise<Blob> {
        const archive = await new Promise<Uint8Array>((resolve, reject) => {
            zip(files, (error, data) => error ? reject(error) : resolve(data));
        });
        return new Blob([new Uint8Array(archive).buffer], { type: "application/zip" });
    }
}
