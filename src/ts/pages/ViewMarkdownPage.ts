import { UserInfo } from "os";
import { Page, PageContext } from "../PageContext";
import { PageType, UserInfoResult } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { FetchHelper } from "../utils/FetchHelper";

export class ViewMarkdownPage implements Page {
    hideNavBar?: boolean | undefined = true;
    pageType: PageType = "VIEW_MARKDOWN";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        alertDiv.id = "alertdiv-id";
        try {
            await this.renderViewAsync(parent, pageContext);
        }
        catch (error: Error | unknown) {
            this.handleError(error, pageContext);
        }
    }

    private async renderViewAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        // render action toolbar
        const headingActions: HTMLHeadingElement = Controls.createHeading(parent, 4);
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.addEventListener("click", async (e: Event) => await this.onBackAsync(e, pageContext));
        const card = Controls.createDiv(parent, "card p-4 shadow-sm");
        card.style.maxWidth = "600px";
        // read markdown
        const md: string = await this.getMarkdownAsync(pageContext, pageContext.markdownPage);
        console.log(md);
        const plainHtml: string | undefined = this.extractPattern(md, "$plain");
        this.setMarkdownHTML(card, plainHtml ? plainHtml : md);
        const h1 = document.querySelector("h1") as HTMLHeadingElement;
        if (h1) {
            document.title = h1.textContent;
            h1.parentNode?.removeChild(h1);
        }
    }

    private handleError(error: Error | unknown, pageContext: PageContext) {
        const alertDiv: HTMLDivElement = document.getElementById("alertdiv-id") as HTMLDivElement;
        Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
    }

    private async getMarkdownAsync(pageContext: PageContext, markdownPage: string): Promise<string> {
        let opt: RequestInit | undefined = undefined
        const token: string | null = pageContext.authenticationClient.getToken();
        if (token !== null) {
            opt = { headers: { "token": token } };
        }
        const resp: Response = await FetchHelper.fetchAsync(`/api/pwdman/markdown/${markdownPage}?locale=${pageContext.locale.getLanguage()}`, opt);
        const markdownText: string = await resp.json();
        return markdownText;
    }

    private extractPattern(html: string, pattern: string): string | undefined {
        const idx: number = html.indexOf(pattern);
        if (idx >= 0) {
            return html.substring(0, idx) + html.substring(idx + pattern.length);
        }
        return undefined;
    }

    private setMarkdownHTML(div: HTMLElement, html: string, userInfo?: UserInfoResult): void {
        let pattern = "$backbutton";
        let sidx = html.indexOf(pattern);
        let backButton = false;
        if (sidx >= 0) {
            html = html.substring(0, sidx) + html.substring(sidx + pattern.length);
            backButton = true;
        }
        pattern = "$background(";
        sidx = html.indexOf(pattern);
        if (sidx >= 0) {
            const eidx = html.indexOf(")", sidx + pattern.length + 1);
            if (eidx > sidx) {
                const url = html.substring(sidx + pattern.length + 1, eidx);
                const prefix = html.substring(0, sidx);
                const suffix = html.substring(eidx + 1);
                const nonce = document.body.getAttribute("markdown-nonce");
                html = `${prefix}<style nonce="${nonce}">body { background-image: url(${url}) }</style>\n${suffix}`;
            }
        }
        while (true) {
            const startPattern = "$role-begin(";
            const sidx1 = html.indexOf(startPattern);
            if (sidx1 < 0) break;
            const eidx1 = html.indexOf(")", sidx1 + startPattern.length + 1);
            if (eidx1 < 0) {
                console.error("Missing closing bracket for $role-begin");
                break;
            }
            const endPattern = "$role-end";
            const sidx2 = html.indexOf(endPattern, eidx1 + 1);
            if (sidx2 < 0) {
                console.error("Missing $role-end");
                break;
            }
            const role = html.substring(sidx1 + pattern.length, eidx1);
            const prefix = html.substring(0, sidx1);
            const suffix = html.substring(sidx2 + endPattern.length);
            let content = "";
            if (userInfo && userInfo.roles && userInfo.roles.includes(role)) {
                content = html.substring(eidx1 + 1, sidx2);
            }
            html = prefix + content + suffix;
        }
        div.innerHTML = html;
        /*
        if (backButton && history.length > 1) {
            controls.createButton(div, _T("BUTTON_BACK"), () => history.back());
        }
        */
    };

    // event callbacks

    private async onBackAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.pageType = "ABOUT";
        pageContext.markdownPage = "";
        await pageContext.renderAsync();
    }
}