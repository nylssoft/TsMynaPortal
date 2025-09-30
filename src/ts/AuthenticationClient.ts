import { FetchHelper } from "./utils/FetchHelper";
import { Security } from "./utils/Security";
import { AuthResult, ClientInfo, UserInfoResult, AuditResult, TwoFactorResult, ResetPassword, PwdManState } from "./TypeDefinitions";

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
        if (this.isLoggedIn()) {
            try {
                const user: UserInfoResult | null = await this.getUserInfoAsync();
                if (user != null) {
                    window.sessionStorage.removeItem(Security.getSessionStorageKey(user));
                }
                await FetchHelper.fetchAsync("/api/pwdman/logout", { headers: { "token": this.getToken()! } });
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
        window.sessionStorage.removeItem("pwdman-state");
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
        this.setAuthResult();
        if (this.lltoken == null) {
            window.localStorage.removeItem("pwdman-lltoken");
        } else {
            window.localStorage.setItem("pwdman-lltoken", this.lltoken);
        }
    }

    private setAuthResult() {
        window.sessionStorage.setItem("authresult", JSON.stringify(this.authResult));
        if (this.authResult != null && this.authResult.token != null) {
            // set pwdman-state for backward compatibility
            const pwdManState: PwdManState = {
                token: this.authResult.token,
                userName: this.authResult.username,
                requiresPass2: this.authResult.requiresPass2
            };
            window.sessionStorage.setItem("pwdman-state", JSON.stringify(pwdManState));
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
            this.setAuthResult();
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
            this.setAuthResult();
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
                this.setAuthResult();
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
            const resp = await FetchHelper.fetchAsync('/api/pwdman/user?details=true', { headers: { 'token': token } });
            this.userInfo = await resp.json() as UserInfoResult;
        }
        return this.userInfo;
    }

    public resetUserInfo() {
        this.userInfo = null;
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

    public async updateKeepLoginAsync(keepLogin: boolean): Promise<void> {
        const token: string | null = this.getToken();
        if (token == null) throw new Error("ERROR_INVALID_PARAMETERS");
        await FetchHelper.fetchAsync("/api/pwdman/user/lltoken", {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify(keepLogin)
        });
        if (this.userInfo != null) {
            this.userInfo.useLongLivedToken = keepLogin;
        }
    }

    public async updateAllowPasswordResetAsync(allowReset: boolean): Promise<void> {
        const token: string | null = this.getToken();
        if (token == null) throw new Error("ERROR_INVALID_PARAMETERS");
        await FetchHelper.fetchAsync("/api/pwdman/user/allowresetpwd", {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify(allowReset)
        });
        if (this.userInfo != null) {
            this.userInfo.allowResetPassword = allowReset;
        }
    }

    public async updatePinAsync(pin: string): Promise<void> {
        const token: string | null = this.getToken();
        if (token == null) throw new Error("ERROR_INVALID_PARAMETERS");
        await FetchHelper.fetchAsync("/api/pwdman/user/pin", {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify(pin)
        });
    }

    public async updatePasswordAsync(oldPwd: string, newPwd: string): Promise<void> {
        const token: string | null = this.getToken();
        if (token == null) throw new Error("ERROR_INVALID_PARAMETERS");
        await FetchHelper.fetchAsync("/api/pwdman/userpwd", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify({ "oldpassword": oldPwd, "newpassword": newPwd })
        });
    }

    public async getTwoFactorAsync(forceNew: boolean): Promise<TwoFactorResult> {
        const token: string | null = this.getToken();
        if (token == null) throw new Error("ERROR_INVALID_PARAMETERS");
        const resp: Response = await FetchHelper.fetchAsync("/api/pwdman/user/2fa", {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify(forceNew)
        });
        return await resp.json() as TwoFactorResult;
    }

    public async enableTwoFactorAsync(code: string): Promise<void> {
        const token: string | null = this.getToken();
        if (token == null) throw new Error("ERROR_INVALID_PARAMETERS");
        const resp: Response = await FetchHelper.fetchAsync("/api/pwdman/user/2fa", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify(code)
        });
        const ok: boolean = await resp.json() as boolean;
        if (!ok) throw new Error("INFO_SEC_KEY_INVALID");
        if (this.userInfo != null) {
            this.userInfo.requires2FA = true;
        }
    }

    public async disableTwoFactorAsync(): Promise<void> {
        const token: string | null = this.getToken();
        if (token == null) throw new Error("ERROR_INVALID_PARAMETERS");
        await FetchHelper.fetchAsync("/api/pwdman/user/2fa", {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "token": token
            }
        });
        if (this.userInfo != null) {
            this.userInfo.requires2FA = false;
        }
    }

    public async requestPasswordResetAsync(email: string, language: string, captchaResponse: string): Promise<void> {
        await FetchHelper.fetchAsync(`/api/pwdman/resetpwd?locale=${language}&captcha=${captchaResponse}`, {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(email)
        });
    }

    public async resetPasswordAsync(token: string, email: string, password: string): Promise<void> {
        const resetPassword: ResetPassword = {
            Token: token,
            Email: email,
            Password: password
        }
        await FetchHelper.fetchAsync("/api/pwdman/resetpwd2", {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(resetPassword)
        });
    }

    public async requestRegistrationAsync(email: string, language: string, captchaResponse: string): Promise<boolean> {
        const resp: Response = await FetchHelper.fetchAsync(`/api/pwdman/register?locale=${language}&captcha=${captchaResponse}`, {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(email)
        });
        return await resp.json() as boolean;
    }

    public async registerAsync(token: string, email: string, username: string, password: string): Promise<UserInfoResult> {
        const registerInfo = {
            Username: username,
            Password: password,
            Email: email,
            Token: token
        };
        const resp: Response = await FetchHelper.fetchAsync("/api/pwdman/profile", {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(registerInfo)
        });
        return await resp.json() as UserInfoResult;
    }

    public async deleteAccountAsync(): Promise<void> {
        const token: string | null = this.getToken();
        if (token == null) throw new Error("ERROR_INVALID_PARAMETERS");
        const user: UserInfoResult | null = await this.getUserInfoAsync();
        await FetchHelper.fetchAsync("/api/pwdman/user", {
            method: "DELETE",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "token": token },
            body: JSON.stringify(user.name)
        });
        await this.logoutAsync();
    }

    public async updatePhotoAsync(inputFile: HTMLInputElement, form: HTMLFormElement): Promise<void> {
        const token: string | null = this.getToken();
        if (token == null) throw new Error("ERROR_INVALID_PARAMETERS");
        if (inputFile.files?.length == 1) {
            const curFile: File = inputFile.files[0];
            const mimeTypes: string[] = ["image/jpeg", "image/png"];
            if (mimeTypes.includes(curFile.type) && curFile.size < 10 * 1024 * 1024) {
                const resp: Response = await FetchHelper.fetchAsync("/api/pwdman/photo", {
                    method: "POST",
                    headers: { "token": token },
                    body: new FormData(form)
                });
                const photo: string = await resp.json() as string;
                if (this.userInfo != null) {
                    this.userInfo.photo = photo;
                }
                return; // success
            }
        }
        throw new Error("ERROR_INVALID_PROFILE_PHOTO");
    }

    public async removePhotoAsync(): Promise<void> {
        const token: string | null = this.getToken();
        if (token == null) throw new Error("ERROR_INVALID_PARAMETERS");
        await FetchHelper.fetchAsync("/api/pwdman/photo", {
            method: "DELETE",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "token": token }
        });
        if (this.userInfo != null) {
            this.userInfo.photo = null;
        }
    }

    public verifyPasswordStrength(pwd: string): boolean {
        if (pwd.length >= 8) {
            const cntSymbols: number = this.countCharacters(pwd, "!@$()=+-,:.");
            const cntUpper: number = this.countCharacters(pwd, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
            const cntLower: number = this.countCharacters(pwd, "abcdefghijklmnopqrstuvwxyz");
            const cntDigits: number = this.countCharacters(pwd, "0123456789");
            return cntSymbols > 0 && cntUpper > 0 && cntLower > 0 && cntDigits > 0;
        }
        return false;
    }

    private countCharacters(txt: string, charset: string): number {
        let cnt: number = 0;
        for (let idx: number = 0; idx < txt.length; idx++) {
            cnt += charset.includes(txt[idx]) ? 1 : 0;
        }
        return cnt;
    }
}
