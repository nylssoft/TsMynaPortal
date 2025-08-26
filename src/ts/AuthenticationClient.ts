import { FetchHelper } from "./utils/FetchHelper";
import { Security } from "./utils/Security";
import { AuthResult, ClientInfo, UserInfoResult, AuditResult } from "./TypeDefinitions";

/**
 * Provides methods for managing authentication of the current user.
 */
export class AuthenticationClient {

    private authResult: AuthResult | null = null;

    private lltoken: string | null = null;

    private clientInfo: ClientInfo;

    private userInfo: UserInfoResult | null = null;

    private useLongLivedToken: boolean = false;

    private lastLoginDate: Date | null = null;

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
        return this.getToken() != null && this.authResult != null ? this.authResult.requiresPass2 : false;
    }

    /**
     * Retrieves whether the user requires a PIN.
     * 
     * @returns true if the user requires a PIN, false otherwise
     */
    public isRequiresPin(): boolean {
        return this.getToken() == null && this.authResult != null && this.lltoken != null ? this.authResult.requiresPin : false;
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
        return this.clientInfo;
    }

    /**
     * Returns whether a long lived token will be used.
     * 
     * @returns true if a long lived token will be used, false otherwise
     */
    public IsUseLongLivedToken(): boolean {
        return this.useLongLivedToken;
    }

    /**
     * Sets whether a long lived token will be used.
     * 
     * @param useLongLivedToken flag whether a long lived token will be used
     */
    public setUseLongLivedToken(useLongLivedToken: boolean) {
        this.useLongLivedToken = useLongLivedToken;
    }

    /**
     * Logs out the user by clearing the auth result and long-lived token.
     */
    public async logoutAsync(): Promise<void> {
        const token: string | null = this.getToken();
        if (token != null) {
            try {
                const user: UserInfoResult | null = await this.getUserInfoAsync();
                if (user != null) {
                    window.sessionStorage.removeItem(Security.getSessionStorageKey(user));
                }
                await FetchHelper.fetchAsync("/api/pwdman/logout", { headers: { "token": token } });
            } catch (error: Error | unknown) {
                console.error("Logout failed:", error);
                window.sessionStorage.clear();
            }
        }
        this.authResult = null;
        this.lltoken = null;
        this.userInfo = null;
        this.lastLoginDate = null;
        window.sessionStorage.removeItem("authresult");
        window.localStorage.removeItem("pwdman-lltoken");
    }

    /**
     * Logs in the user with the provided username and password.
     * 
     * @param username username
     * @param password password
     * @param language language code for the request
     * @throws an error if the login fails or if the user is already logged in
     */
    public async loginAsync(username: string, password: string, language: string): Promise<void> {
        if (this.getToken() != null) throw new Error("ERROR_INVALID_PARAMETERS");
        const clientInfo: ClientInfo = this.getClientInfo();
        const requestInit: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "Username": username, "Password": password, "ClientUUID": clientInfo.uuid, "ClientName": clientInfo.name })
        };
        const resp: Response = await FetchHelper.fetchAsync(`/api/pwdman/auth?locale=${language}`, requestInit);
        this.authResult = await resp.json() as AuthResult;
        this.lltoken = this.IsUseLongLivedToken() ? this.authResult.longLivedToken : null;
        window.sessionStorage.setItem("authresult", JSON.stringify(this.authResult));
        if (this.lltoken == null) {
            window.localStorage.removeItem("pwdman-lltoken");
        } else {
            window.localStorage.setItem("pwdman-lltoken", this.lltoken);
        }
    }

    /**
     * Logs in the user with the second password.
     * 
     * @param pass2 the second password to authenticate with
     * @throws an error if the user is not logged in or does not require a second password
     */
    public async loginWithPass2Async(pass2: string): Promise<void> {
        const token: string | null = this.getToken();
        if (token == null) throw new Error("ERROR_INVALID_PARAMETERS");
        const requestInit: RequestInit = {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify(pass2)
        };
        try {
            const resp: Response = await FetchHelper.fetchAsync("/api/pwdman/auth2", requestInit);
            this.authResult = await resp.json() as AuthResult;
            this.authResult.requiresPass2 = false; // Reset pass2 requirement after successful login
            this.lltoken = this.IsUseLongLivedToken() ? this.authResult.longLivedToken : null;
            window.sessionStorage.setItem("authresult", JSON.stringify(this.authResult));
            if (this.lltoken != null) {
                window.localStorage.setItem("pwdman-lltoken", this.lltoken);
            }
        }
        catch (err: Error | unknown) {
            if (err instanceof Error && err.message == "ERROR_INVALID_TOKEN") {
                await this.logoutAsync();
            }
            throw err;
        }
    }

    /**
     * Logs in the user with a PIN.
     * 
     * @param pin the PIN to authenticate with
     * @throws an error if the user is not logged in or does not require a PIN, or if the long-lived token is not available
     */
    public async loginWithPinAsync(pin: string): Promise<void> {
        if (this.authResult == null || !this.authResult.requiresPin || this.lltoken == null) throw new Error("INVALID_PARAMETERS");
        const requestInit: RequestInit = {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "token": this.lltoken
            },
            body: JSON.stringify(pin)
        };
        try {
            const resp: Response = await FetchHelper.fetchAsync("/api/pwdman/auth/pin", requestInit);
            this.authResult = await resp.json() as AuthResult;
            this.authResult.requiresPin = false; // Reset PIN requirement after successful login
            this.lltoken = this.authResult.longLivedToken;
            if (this.lltoken != null) {
                window.localStorage.setItem("pwdman-lltoken", this.lltoken);
            }
            window.sessionStorage.setItem("authresult", JSON.stringify(this.authResult));
        }
        catch (err: Error | unknown) {
            if (err instanceof Error && err.message == "ERROR_INVALID_TOKEN") {
                await this.logoutAsync();
            }
            throw err;
        }
    }

    /**
     * Logs in the user with a long-lived token if available.
     */
    public async loginWithLongLivedTokenAsync(): Promise<void> {
        const lltoken: string | null = this.getLongLivedToken();
        if (this.getToken() == null && lltoken != null) {
            try {
                const requestInit: RequestInit = { headers: { "token": lltoken, "uuid": this.getClientInfo().uuid } };
                const resp: Response = await FetchHelper.fetchAsync("/api/pwdman/auth/lltoken", requestInit);
                this.authResult = await resp.json() as AuthResult;
                if (this.authResult.longLivedToken != null) {
                    this.lltoken = this.authResult.longLivedToken;
                    window.localStorage.setItem("pwdman-lltoken", this.lltoken);
                }
                window.sessionStorage.setItem("authresult", JSON.stringify(this.authResult));
            }
            catch (error: Error | unknown) {
                console.error("Login with long-lived token failed:", error);
                window.localStorage.removeItem("pwdman-lltoken");
            }
        }
    }

    /**
     * Retrieves user information asynchronously.
     * 
     * @returns a promise that resolves to the user information
     * @throws an error if the user information cannot be retrieved or if the user is not logged in
     */
    public async getUserInfoAsync(): Promise<UserInfoResult> {
        if (this.userInfo == null) {
            const token: string | null = this.getToken();
            if (token == null) throw new Error("ERROR_INVALID_PARAMETERS");
            const resp = await FetchHelper.fetchAsync('/api/pwdman/user', { headers: { 'token': token } });
            this.userInfo = await resp.json() as UserInfoResult;
        }
        return this.userInfo;
    }

    /**
     * Retrieves the last login date asynchronously.
     * 
     * @returns a promise that resolves to the last login date or null if not found
     */
    public async getLastLoginDateAsync(): Promise<Date | null> {
        if (this.lastLoginDate != null) return this.lastLoginDate;
        const token: string | null = this.getToken();
        if (token == null) throw new Error("ERROR_INVALID_PARAMETERS");
        const resp: Response = await FetchHelper.fetchAsync('/api/pwdman/user/audit?max=10', { headers: { 'token': token } });
        const audits: AuditResult[] = await resp.json() as AuditResult[];
        let cnt: number = 0;
        for (const audit of audits) {
            const parts: string[] = audit.action.split(":");
            const action: string = parts[0];
            if (action == "AUDIT_LOGIN_BASIC_1" || action == "AUDIT_LOGIN_LLTOKEN_1" || action == "AUDIT_LOGIN_PIN_1" || action == "AUDIT_LOGIN_2FA_1") {
                cnt++;
                if (cnt == 2) {
                    this.lastLoginDate = new Date(audit.performedUtc);
                    return this.lastLoginDate;
                }
            }
        }
        // use now for the first login ever
        this.lastLoginDate = new Date();
        return this.lastLoginDate;
    }
}
