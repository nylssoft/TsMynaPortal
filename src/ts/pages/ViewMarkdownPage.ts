import { Page, PageContext } from "../PageContext";
import { PageType } from "../TypeDefinitions";
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
        const currentPage: string = pageContext.markdownPages[pageContext.markdownPages.length - 1];
        const markdown: string = await this.getMarkdownAsync(pageContext, currentPage);
        card.innerHTML = markdown;
        const aLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a[data-markdown]') as NodeListOf<HTMLAnchorElement>;
        aLinks.forEach(a => a.addEventListener("click", async (e: Event) => await this.onShowMarkdownPageAsync(e, pageContext, a.getAttribute("data-markdown")!)));
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

    // event callbacks

    private async onBackAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.markdownPages.pop();
        if (pageContext.markdownPages.length == 0) {
            pageContext.pageType = "ABOUT";
        }
        await pageContext.renderAsync();            
    }

    private async onShowMarkdownPageAsync(e: Event, pageContext: PageContext, markdownPage: string): Promise<void> {
        e.preventDefault();
        pageContext.markdownPages.push(markdownPage);
        await pageContext.renderAsync();
    }
}