import { HttpResponseError } from "./HttpResponseError";

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
     * @param acceptedStatuses additional response statuses handled by the caller
     * @throws Error if the response is not ok or if there is an error in the
     * @returns response object.
     */
    static async fetchAsync(url: string, options?: RequestInit, acceptedStatuses: number[] = []): Promise<Response> {
        this.lastActivityDateTime = Date.now();
        const resp: Response = await window.fetch(url, options);
        if (!resp.ok && !acceptedStatuses.includes(resp.status)) {
            const contentType = resp.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
            if (contentType === "application/json" || contentType?.endsWith("+json")) {
                try {
                    const errorResult: unknown = await resp.json();
                    if (typeof errorResult === "object" && errorResult !== null && "title" in errorResult &&
                        typeof errorResult.title === "string" && errorResult.title.length > 0) {
                        throw new Error(errorResult.title);
                    }
                } catch (error: unknown) {
                    if (error instanceof Error && error.name !== "SyntaxError") throw error;
                }
            }
            throw new HttpResponseError(resp.status);
        }
        return resp;
    }
}