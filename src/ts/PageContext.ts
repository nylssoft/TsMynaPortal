import { Locale } from "./Locale";
import { AuthenticationClient } from "./AuthenticationClient";

export type PageType = "LOGIN_USERNAME_PASSWORD" | "LOGIN_PIN" | "LOGIN_PASS2" | "ABOUT" | "INBOX";

export type Renderer = (pageContext: PageContext) => Promise<void>;

export class PageContext {
    private locale: Locale = new Locale();    
    private authenticationClient: AuthenticationClient = new AuthenticationClient();
    private pageType: PageType = "LOGIN_USERNAME_PASSWORD";
    private renderer: Renderer;

    public constructor(renderer: Renderer) {
        this.renderer = renderer;
    }

    public async renderAsync(): Promise<void> {
        await this.renderer(this);
    }

    public getLocale(): Locale {
        return this.locale;
    }

    public getAuthenticationClient(): AuthenticationClient {
        return this.authenticationClient;
    }

    public getPageType(): PageType {
        return this.pageType;
    }

    public setPageType(pageType: PageType) {
        this.pageType = pageType;
    }
}
