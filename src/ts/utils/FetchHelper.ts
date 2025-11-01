import { ErrorResult } from "../TypeDefinitions";

/**
 * FetchHelper provides methods to fetch data from the API.
 * It handles errors related to the response status and provides a consistent way to fetch data.
 */
export class FetchHelper {

    /** Timestamp of the last activity, e.g. updated on each fetch call */
    static lastActivityDateTime: number = Date.now();

    /**
     * Fetches data from the specified URL and returns the response.
     * If the response is not ok, it throws an error with the message from the response
     * or a default error message.
     * 
     * @param url The URL to fetch data from.
     * @param options request options, such as method, headers, body, etc.
     * @throws Error if the response is not ok or if there is an error in the
     * @returns response object.
     */
    static async fetchAsync(url: string, options?: RequestInit): Promise<Response> {
        this.lastActivityDateTime = Date.now();
        const resp: Response = await window.fetch(url, options);
        if (!resp.ok) {
            const errorResult: ErrorResult | null = await resp.json() as ErrorResult;
            const errorMessage: string | null = errorResult?.title;
            throw new Error(errorMessage || "ERROR_UNEXPECTED");
        }
        return resp;
    }
}