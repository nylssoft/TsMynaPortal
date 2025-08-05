import { AuthResult, ErrorResult, ClientInfo } from "./TypeDefinitions";

/**
 * Provides methods for managing authentication of the current user.
 */
export class AuthenticationClient {

    private authResult: AuthResult | null = null;

    private lltoken: string | null = null;

    private clientInfo: ClientInfo | null = null;

    /**
     * Initializes the authentication client by loading the auth result and long-lived token from storage.
     */
    public constructor() {
        const item: string | null = window.sessionStorage.getItem("authresult");
        this.authResult = item != null ? JSON.parse(item) : null;
        const ll: string | null = window.localStorage.getItem("pwdman-lltoken");
        this.lltoken = ll != null ? ll : null;
        const lang: string | null = window.localStorage.getItem("locale");
        const ci: string | null = window.localStorage.getItem("clientinfo");
        if (ci == null) {
            this.clientInfo = { uuid: window.crypto.randomUUID(), name: window.navigator.userAgent };
            window.localStorage.setItem("clientinfo", JSON.stringify(this.clientInfo));
        } else {
            this.clientInfo = JSON.parse(ci);
        }
    }

    /**
     * Retrieves whether the user is logged in based on the auth result.
     * 
     * @returns true if the user is logged in, false otherwise
     */
    public isLoggedIn(): boolean {
        return this.authResult != null &&
            this.authResult.token != null &&
            this.authResult.token.length > 0 &&
            !this.authResult.requiresPass2 &&
            !this.authResult.requiresPin;
    }

    /**
     * Retrieves the authentication token if available.
     * 
     * @returns the authentication token if available, null otherwise
     */
    public getToken(): string | null {
        return this.authResult != null && this.authResult.token != null && this.authResult.token.length > 0 ? this.authResult.token : null;
    }

    /**
     * Retrieves whether the user requires a second password.
     * 
     * @returns true if the user requires a second password, false otherwise
     */
    public isRequiresPass2(): boolean {
        return this.authResult ? this.authResult.requiresPass2 : false;
    }

    /**
     * Retrieves whether the user requires a PIN.
     * 
     * @returns true if the user requires a PIN, false otherwise
     */
    public isRequiresPin(): boolean {
        return this.authResult ? this.authResult.requiresPin : false;
    }

    /**
     * Retrieves the long-lived token if available.
     * 
     * @returns the long-lived token if available, null otherwise
     */
    public getLongLivedToken(): string | null {
        return this.lltoken;
    }

    /**
     * Retrieves the client information including UUID and name.
     * 
     * @returns the client information including UUID and name
     */
    public getClientInfo(): ClientInfo {
        if (this.clientInfo == null) {
            throw new Error("Client info not initialized.");
        }
        return this.clientInfo;
    }

    /**
     * Logs out the user by clearing the auth result and long-lived token.
     */
    public async logoutAsync(): Promise<void> {
        this.authResult = null;
        this.lltoken = null;
        window.sessionStorage.removeItem("authresult");
        window.localStorage.removeItem("pwdman-lltoken");
        await window.fetch("/api/pwdman/logout", { headers: { "token": this.getToken()! } });
    }

    /**
     * Logs in the user with the provided username and password.
     * 
     * @param username username
     * @param password password
     * @param language language code for the request
     */
    public async loginAsync(username: string, password: string, language: string): Promise<void> {
        if (this.authResult != null) throw new Error("Not logged out.");
        const clientInfo: ClientInfo = this.getClientInfo();
        const requestInit: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "Username": username, "Password": password, "ClientUUID": clientInfo.uuid, "ClientName": clientInfo.name })
        };
        const resp: Response = await window.fetch(`/api/pwdman/auth?locale=${language}`, requestInit);
        if (!resp.ok) {
            const errorResult: ErrorResult | null = await resp.json() as ErrorResult;
            let errorMessage = "An unknown error occurred";
            if (errorResult) {
                errorMessage = errorResult.title || errorMessage;
            }
            throw new Error(errorMessage);
        }
        this.authResult = await resp.json() as AuthResult;
        this.lltoken = this.authResult.longLivedToken;
        window.sessionStorage.setItem("authresult", JSON.stringify(this.authResult));
        if (this.authResult.longLivedToken == null) {
            window.localStorage.removeItem("pwdman-lltoken");
        } else {
            window.localStorage.setItem("pwdman-lltoken", this.authResult.longLivedToken);
        }
    }

    /**
     * Logs in the user with the second password.
     * 
     * @param pass2 the second password to authenticate with
     */
    public async loginWithPass2Async(pass2: string): Promise<void> {
        if (this.authResult == null || !this.authResult.requiresPass2) throw new Error("Not logged in or does not require pass2.");
        const requestInit: RequestInit = {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "token": this.authResult.token!
            },
            body: JSON.stringify(pass2)
        };
        const resp: Response = await window.fetch("/api/pwdman/auth2", requestInit);
        if (!resp.ok) {
            const errorResult: ErrorResult | null = await resp.json() as ErrorResult;
            let errorMessage = "An unknown error occurred";
            if (errorResult) {
                errorMessage = errorResult.title || errorMessage;
            }
            throw new Error(errorMessage);
        }
        this.authResult = await resp.json() as AuthResult;
        this.lltoken = this.authResult.longLivedToken;
        window.sessionStorage.setItem("authresult", JSON.stringify(this.authResult));
        if (this.authResult.longLivedToken != null) {
            window.localStorage.setItem("pwdman-lltoken", this.authResult.longLivedToken);
        }
    }

    /**
     * Logs in the user with a PIN.
     * 
     * @param pin the PIN to authenticate with
     */
    public async loginWithPinAsync(pin: string): Promise<void> {
        if (!this.authResult || !this.authResult.requiresPin || !this.lltoken) throw new Error("Not logged in or does not require PIN or no long lived token.");
        const requestInit: RequestInit = {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "token": this.lltoken
            },
            body: JSON.stringify(pin)
        };
        const resp: Response = await window.fetch("/api/pwdman/auth/pin", requestInit);
        if (!resp.ok) {
            const errorResult: ErrorResult | null = await resp.json() as ErrorResult;
            let errorMessage = "An unknown error occurred";
            if (errorResult) {
                errorMessage = errorResult.title || errorMessage;
            }
            throw new Error(errorMessage);
        }
        this.authResult = await resp.json() as AuthResult;
        this.lltoken = this.authResult.longLivedToken;
        if (this.lltoken != null) {
            window.localStorage.setItem("pwdman-lltoken", this.lltoken);
        }
        window.sessionStorage.setItem("authresult", JSON.stringify(this.authResult));
    }

    /**
     * Logs in the user with a long-lived token if available.
     */
    public async loginWithLongLivedTokenAsync(): Promise<void> {
        const lltoken: string | null = this.getLongLivedToken();
        if (this.authResult == null && lltoken) {
            const requestInit: RequestInit = { headers: { "token": lltoken, "uuid": this.getClientInfo().uuid } };
            const resp: Response = await window.fetch("/api/pwdman/auth/lltoken", requestInit);
            if (!resp.ok) {
                window.localStorage.removeItem("pwdman-lltoken");
                return;
            }
            this.authResult = await resp.json() as AuthResult;
            this.lltoken = this.authResult.longLivedToken;
            if (this.lltoken != null) {
                window.localStorage.setItem("pwdman-lltoken", this.lltoken);
            }
            window.sessionStorage.setItem("authresult", JSON.stringify(this.authResult));
        }
    }
}