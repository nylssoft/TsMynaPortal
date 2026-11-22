export function waitForExportRequestAsync(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 100));
}
