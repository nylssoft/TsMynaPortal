import { Unzip, UnzipInflate } from "fflate";

export class ImportArchive {
    static async readAsync(file: File, limit = 512 * 1024 * 1024): Promise<Map<string, Uint8Array>> {
        if (file.size === 0 || file.size > limit) throw new Error("ERROR_IMPORT_ARCHIVE");
        const entries = new Map<string, Uint8Array>();
        let count = 0;
        let completed = 0;
        let total = 0;
        const unzip = new Unzip(entry => {
            if (++count > 10000 || entries.has(entry.name) || entry.name.length > 1024 || entry.name.startsWith("/") || entry.name.includes("\\") || entry.name.split("/").some((part, i, parts) => part === "." || part === ".." || (!part && i !== parts.length - 1))) {
                throw new Error("ERROR_IMPORT_ARCHIVE");
            }
            const chunks: Uint8Array[] = [];
            let size = 0;
            entries.set(entry.name, new Uint8Array());
            entry.ondata = (error, data, final) => {
                if (error) throw new Error("ERROR_IMPORT_ARCHIVE");
                size += data.length;
                total += data.length;
                if (total > limit) throw new Error("ERROR_IMPORT_ARCHIVE");
                chunks.push(data);
                if (final) {
                    const value = new Uint8Array(size);
                    let offset = 0;
                    for (const chunk of chunks) { value.set(chunk, offset); offset += chunk.length; }
                    entries.set(entry.name, value);
                    completed++;
                }
            };
            entry.start();
        });
        unzip.register(UnzipInflate);
        try {
            const bytes = new Uint8Array(await file.arrayBuffer());
            const central = this.directory(bytes, limit);
            const chunkSize = 32 * 1024;
            for (let offset = 0; offset < bytes.length; offset += chunkSize) {
                const end = Math.min(offset + chunkSize, bytes.length);
                unzip.push(bytes.subarray(offset, end), end === bytes.length);
            }
            if (count !== completed || count !== central.size) throw new Error("ERROR_IMPORT_ARCHIVE");
            for (const [name, data] of entries) {
                const expected = central.get(name);
                if (!expected || expected.size !== data.length || expected.crc !== this.crc32(data)) throw new Error("ERROR_IMPORT_ARCHIVE");
            }
        } catch (error: unknown) {
            if (error instanceof Error && error.message === "ERROR_IMPORT_ARCHIVE") throw error;
            throw new Error("ERROR_IMPORT_ARCHIVE");
        }
        if (count === 0) throw new Error("ERROR_IMPORT_ARCHIVE");
        return entries;
    }

    private static directory(bytes: Uint8Array, limit: number): Map<string, { size: number; crc: number }> {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        let end = bytes.length - 22;
        while (end >= Math.max(0, bytes.length - 65557) && view.getUint32(end, true) !== 0x06054b50) end--;
        if (end < Math.max(0, bytes.length - 65557) || end + 22 > bytes.length || view.getUint32(end, true) !== 0x06054b50 || end + 22 + view.getUint16(end + 20, true) !== bytes.length || view.getUint16(end + 4, true) !== 0 || view.getUint16(end + 6, true) !== 0) throw new Error("ERROR_IMPORT_ARCHIVE");
        const count = view.getUint16(end + 10, true);
        if (!count || count > 10000 || view.getUint16(end + 8, true) !== count) throw new Error("ERROR_IMPORT_ARCHIVE");
        let offset = view.getUint32(end + 16, true);
        if (offset + view.getUint32(end + 12, true) !== end) throw new Error("ERROR_IMPORT_ARCHIVE");
        const directoryOffset = offset;
        const result = new Map<string, { size: number; crc: number }>();
        let total = 0;
        for (let i = 0; i < count; i++) {
            if (offset + 46 > end || view.getUint32(offset, true) !== 0x02014b50 || (view.getUint16(offset + 8, true) & 1) !== 0) throw new Error("ERROR_IMPORT_ARCHIVE");
            const nameLength = view.getUint16(offset + 28, true);
            const next = offset + 46 + nameLength + view.getUint16(offset + 30, true) + view.getUint16(offset + 32, true);
            if (next > end) throw new Error("ERROR_IMPORT_ARCHIVE");
            const name = this.text(bytes.subarray(offset + 46, offset + 46 + nameLength));
            const size = view.getUint32(offset + 24, true);
            const local = view.getUint32(offset + 42, true);
            if (local + 30 > directoryOffset || view.getUint32(local, true) !== 0x04034b50 || view.getUint16(local + 6, true) !== view.getUint16(offset + 8, true) || view.getUint16(local + 8, true) !== view.getUint16(offset + 10, true)) throw new Error("ERROR_IMPORT_ARCHIVE");
            const localNameLength = view.getUint16(local + 26, true);
            const dataStart = local + 30 + localNameLength + view.getUint16(local + 28, true);
            if (dataStart + view.getUint32(offset + 20, true) > directoryOffset || this.text(bytes.subarray(local + 30, local + 30 + localNameLength)) !== name) throw new Error("ERROR_IMPORT_ARCHIVE");
            total += size;
            if (result.has(name) || total > limit) throw new Error("ERROR_IMPORT_ARCHIVE");
            result.set(name, { size, crc: view.getUint32(offset + 16, true) });
            offset = next;
        }
        if (offset !== end) throw new Error("ERROR_IMPORT_ARCHIVE");
        return result;
    }

    private static readonly crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
        for (let i = 0; i < 8; i++) value = (value >>> 1) ^ (0xedb88320 & -(value & 1));
        return value >>> 0;
    });

    private static crc32(data: Uint8Array): number {
        let crc = 0xffffffff;
        for (const byte of data) crc = (crc >>> 8) ^ this.crcTable[(crc ^ byte) & 0xff];
        return (crc ^ 0xffffffff) >>> 0;
    }

    static text(bytes: Uint8Array): string {
        try { return new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
        catch { throw new Error("ERROR_IMPORT_ARCHIVE"); }
    }

    static json(bytes: Uint8Array): unknown {
        try { return JSON.parse(this.text(bytes)); }
        catch { throw new Error("ERROR_IMPORT_ARCHIVE"); }
    }
}
