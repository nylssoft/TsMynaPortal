import { Page, PageContext } from "../PageContext";
import { DocumentService } from "../services/DocumentService";
import { DocumentItemResult, PageType } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";

export class DocumentMovePage implements Page {
    hideNavBar?: boolean | undefined = true;
    pageType: PageType = "DOCUMENT_MOVE";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const alertDiv: HTMLDivElement = Controls.createDiv(parent);
        alertDiv.id = "alertdiv-id";
        try {
            await this.renderMoveAsync(parent, pageContext);
        }
        catch (error: Error | unknown) {
            this.handleError(error, pageContext);
        }
    }

    private async renderMoveAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        // render action toolbar
        const headingActions: HTMLHeadingElement = Controls.createHeading(parent, 4);
        const iBack: HTMLElement = Controls.createElement(headingActions, "i", "bi bi-arrow-left", undefined, "backbutton-id");
        iBack.setAttribute("role", "button");
        iBack.addEventListener("click", async (e: Event) => await this.onBackAsync(e, pageContext));
        Controls.createSpan(headingActions, "ms-4", pageContext.locale.translate("HEADER_DOCUMENTS"));
        // render card
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-4 shadow-sm");
        card.style.maxWidth = "400px";
        const cardBody: HTMLDivElement = Controls.createDiv(card, "card-body");
        const path: DocumentItemResult[] = DocumentService.getPath(pageContext.documentItem.containerId, pageContext.documentItem.all);
        this.renderDestinationFolder(cardBody, pageContext, path);
        const moveButton: HTMLButtonElement = Controls.createButton(cardBody, "button", pageContext.locale.translate("BUTTON_MOVE"), "mb-2 btn btn-primary");
        moveButton.addEventListener("click", async (e: Event) => await this.onMoveItemsAsync(e, pageContext));
        const listGroup: HTMLElement = Controls.createElement(cardBody, "ul", "list-group");
        DocumentService.getChildren(pageContext.documentItem.containerId!, pageContext.documentItem.all)
            .filter(item => item.type == "Folder")
            .forEach(item => {
                const id: number = item.id;
                const type: string = item.type;
                const li: HTMLElement = Controls.createElement(listGroup, "li", "list-group-item d-flex justify-content-between align-items-start");
                const iconElem: HTMLElement = Controls.createSpan(li, "bi bi-folder");
                const nameElem: HTMLElement = Controls.createSpan(li, "ms-2 me-auto", item.name);
                const iconBadge: HTMLElement = Controls.createSpan(li, "badge text-bg-secondary", `${item.children}`);
                nameElem.setAttribute("role", "button");
                nameElem.addEventListener("click", async (e: Event) => await this.onClickItemAsync(e, pageContext, type, id));
                iconElem.setAttribute("role", "button");
                iconElem.addEventListener("click", async (e: Event) => await this.onClickItemAsync(e, pageContext, type, id));
                iconBadge.setAttribute("role", "button");
                iconBadge.addEventListener("click", async (e: Event) => await this.onClickItemAsync(e, pageContext, type, id));
            });
    }

    private handleError(error: Error | unknown, pageContext: PageContext) {
        const alertDiv: HTMLDivElement = document.getElementById("alertdiv-id") as HTMLDivElement;
        Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
    }

    private renderDestinationFolder(parent: HTMLElement, pageContext: PageContext, path: DocumentItemResult[]) {
        const nav: HTMLElement = Controls.createElement(parent, "nav");
        nav.setAttribute("aria-label", "breadcrumb");
        const ol: HTMLElement = Controls.createElement(nav, "ol", "breadcrumb");
        Controls.createElement(ol, "li", "me-2", pageContext.locale.translate("LABEL_DESTINATION_FOLDER"));
        path.forEach(p => {
            const li: HTMLElement = Controls.createElement(ol, "li", "breadcrumb-item");
            let elem: HTMLElement;
            if (p.type == "Volume") {
                elem = Controls.createAnchor(li, "home", "");
                Controls.createElement(elem, "i", "bi bi-house");
            } else {
                elem = Controls.createAnchor(li, p.name, p.name);
            }
            if (pageContext.documentItem.containerId == p.id) {
                elem.classList.add("active");
                elem.setAttribute("aria-current", "page");
            }
            elem.setAttribute("role", "button");
            const id: number = p.id;
            elem.addEventListener("click", async (e: Event) => {
                e.preventDefault();
                pageContext.documentItem.containerId = id;
                await pageContext.renderAsync();
            });
        });
    }

    // event callbacks

    private async onMoveItemsAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const ids: number[] = pageContext.documentItem.moved.map(item => item.id);
            await DocumentService.moveItemsAsync(token, pageContext.documentItem.containerId!, ids);
            pageContext.pageType = "DESKTOP";
            await pageContext.renderAsync();
        }
        catch (error: Error | unknown) {
            this.handleError(error, pageContext);
        }
    }

    private async onClickItemAsync(e: Event, pageContext: PageContext, type: string, id: number): Promise<void> {
        e.preventDefault();
        pageContext.documentItem.containerId = id;
        await pageContext.renderAsync();
    }

    private async onBackAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.pageType = "DESKTOP";
        await pageContext.renderAsync();
    }
}