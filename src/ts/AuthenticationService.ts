import { AuthResult, ErrorResult, ClientInfo } from "./TypeDefinitions";

export class AuthenticationService {

    private authResult: AuthResult | null = null;

    private lltoken: string | null = null;

    private clientInfo: ClientInfo | null = null;

    public init(): void {
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

    public isLoggedIn(): boolean {
        return this.authResult != null && this.authResult.token.length > 0 && !this.authResult.requiresPass2 && !this.authResult.requiresPin;
    }

    public getToken(): string | null {
        return this.authResult ? this.authResult.token : null;
    }

    public getRequiresPass2(): boolean {
        return this.authResult ? this.authResult.requiresPass2 : false;
    }

    public getRequiresPin(): boolean {
        return this.authResult ? this.authResult.requiresPin : false;
    }

    public getLongLivedToken(): string | null {
        return this.lltoken;
    }

    public getClientInfo(): ClientInfo {
        if (this.clientInfo == null) {
            throw new Error("Client info not initialized.");
        }
        return this.clientInfo;
    }

    public async logoutAsync(): Promise<void> {
        this.authResult = null;
        this.lltoken = null;
        window.sessionStorage.removeItem("authresult");
        window.localStorage.removeItem("pwdman-lltoken");
        await window.fetch("/api/pwdman/logout", { headers: { "token": this.getToken()! } });
    }

    public async loginAsync(username: string, password: string, language: string): Promise<void> {
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
        const authResult: AuthResult = await resp.json() as AuthResult;
        if (authResult.longLivedToken.length === 0) {
            window.localStorage.removeItem("pwdman-lltoken");
            this.lltoken = null;
        } else {
            window.localStorage.setItem("pwdman-lltoken", authResult.longLivedToken);
            window.sessionStorage.setItem("authresult", JSON.stringify(authResult.longLivedToken));
            this.lltoken = authResult.longLivedToken;
        }
    }
}