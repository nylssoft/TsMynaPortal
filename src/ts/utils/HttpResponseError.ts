export class HttpResponseError extends Error {
    constructor(readonly status: number) {
        super(`HTTP_ERROR_${status}`);
        this.name = "HttpResponseError";
    }
}
