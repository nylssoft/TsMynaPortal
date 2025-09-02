import { PageContext } from "../PageContext";
import { DocumentService } from "../services/DocumentService";
import { DesktopTab, DocumentItemResult, UserInfoResult } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { Tab } from "./Tab";

export class DocumentTab implements Tab {
    desktopTab: DesktopTab = "DOCUMENTS";
    href: string = "documents";
    bootstrapIcon: string = "bi-files";

    async renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const user: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            pageContext.documentItem.docItems = await DocumentService.getDocumentItemsAsync(token, user, pageContext.documentItem.containerId);
            let volume: DocumentItemResult | undefined = this.getVolume(pageContext.documentItem.docItems);
            if (volume == undefined) {
                volume = await DocumentService.createVolumeAsync(token, pageContext.locale.translate("TEXT_DOCUMENTS"));
            }
            pageContext.documentItem.containerId = pageContext.documentItem.containerId || volume.id;
            const path: DocumentItemResult[] = this.getPath(pageContext.documentItem.containerId, pageContext.documentItem.docItems);
            const items: DocumentItemResult[] = this.getItems(pageContext.documentItem.containerId, pageContext.documentItem.docItems);
            const heading: HTMLHeadingElement = Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate("HEADER_DOCUMENTS"));
            this.renderBreadcrump(parent, pageContext, path);
            if (items.length > 0) {
                Controls.createSearch(heading, parent, pageContext.locale.translate("SEARCH"), pageContext.documentItem.filter, (filter: string) => this.filterDocItemList(pageContext, filter, items));
                const listGroup: HTMLElement = Controls.createElement(parent, "ul", "list-group");
                listGroup.id = "list-group-id";
                this.filterDocItemList(pageContext, pageContext.documentItem.filter, items);
            }
            const iAddFile: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-file-plus", undefined, "action-add-file-id");
            iAddFile.setAttribute("role", "button");
            const iAddFolder: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-folder-plus", undefined, "action-add-folder-id");
            iAddFolder.setAttribute("role", "button");
            iAddFolder.addEventListener("click", async (e: Event) => await this.onAddFolderAsync(e, pageContext));
            const iDelete: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-trash d-none", undefined, "action-delete-id");
            iDelete.setAttribute("role", "button");
            iDelete.setAttribute("data-bs-target", "#confirmationdialog-id");
            iDelete.setAttribute("data-bs-toggle", "modal");
            const iEdit: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-pencil-square d-none", undefined, "action-edit-id");
            iEdit.setAttribute("role", "button");
            iEdit.addEventListener("click", async (e: Event) => await this.onEditAsync(e, pageContext));
            // render delete confirmation dialog
            Controls.createConfirmationDialog(
                parent,
                pageContext.locale.translate("HEADER_DOCUMENTS"),
                pageContext.locale.translate("INFO_REALLY_DELETE_SELECTED_ELEMS"),
                pageContext.locale.translate("BUTTON_YES"),
                pageContext.locale.translate("BUTTON_NO"));
            document.getElementById("confirmationyesbutton-id")!.addEventListener("click", async (e: Event) => await this.onDeleteAsync(e, pageContext));
        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    private async onEditAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const selected: DocumentItemResult[] = this.getSelected(pageContext.documentItem.docItems);
        if (selected.length == 1) {
            pageContext.documentItem.edit = selected[0];
            pageContext.pageType = "DOCUMENT_DETAIL";
            await pageContext.renderAsync();
        }
    }

    private async onDeleteAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const selected: DocumentItemResult[] = this.getSelected(pageContext.documentItem.docItems);
        if (selected.length > 0) {
            const token: string = pageContext.authenticationClient.getToken()!;
            const ids: number[] = selected.map(item => item.id);
            await DocumentService.deleteItemsAsync(token, pageContext.documentItem.containerId!, ids);
            await pageContext.renderAsync();
        }
    }

    private async onAddFolderAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.pageType = "DOCUMENT_DETAIL";
        await pageContext.renderAsync();
    }

    private renderBreadcrump(parent: HTMLElement, pageContext: PageContext, path: DocumentItemResult[]) {
        const nav: HTMLElement = Controls.createElement(parent, "nav");
        nav.setAttribute("aria-label", "breadcrumb");
        const ol: HTMLElement = Controls.createElement(nav, "ol", "breadcrumb");
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

    private filterDocItemList(pageContext: PageContext, filter: string, items: DocumentItemResult[]) {
        pageContext.contact.filter = filter;
        const filteredItems: DocumentItemResult[] = [];
        items.forEach(item => {
            if (filter.length == 0 || item.name.toLocaleLowerCase().includes(filter)) {
                filteredItems.push(item);
            }
        });
        if (filteredItems.length == 0) {
            return;
        }
        const listGroup: HTMLElement = document.getElementById("list-group-id")!;
        Controls.removeAllChildren(listGroup);
        const li: HTMLElement = Controls.createElement(listGroup, "li", "list-group-item");
        const checkBoxSelectAll: HTMLInputElement = Controls.createInput(li, "checkbox", "selectall-id", "form-check-inout me-4 mt-2");
        checkBoxSelectAll.addEventListener("click", (e: Event) => this.onSelectAll(e, filteredItems));
        filteredItems.forEach(item => {
            const id: number = item.id;
            const type: string = item.type;
            const li: HTMLElement = Controls.createElement(listGroup, "li", "list-group-item d-flex justify-content-between align-items-start");
            const checkBoxSelectItem: HTMLInputElement = Controls.createInput(li, "checkbox", `item-select-id-${item.id}`, "form-check-inout me-2 mt-1 item-select");
            checkBoxSelectItem.addEventListener("click", _ => this.updateActions(filteredItems));
            const iconType: string = type == "Document" ? "bi-file" : "bi-folder";
            const iconElem: HTMLElement = Controls.createSpan(li, `bi ${iconType}`);
            const nameElem: HTMLElement = Controls.createSpan(li, "ms-2 me-auto", item.name);
            if (item.size > 0) {
                Controls.createSpan(li, "badge text-bg-primary rounded-pill", `${this.formatSize(item.size)}`);
            } else {
                Controls.createSpan(li, "badge text-bg-secondary", `${item.children}`);
            }
            nameElem.setAttribute("role", "button");
            nameElem.addEventListener("click", async (e: Event) => this.onClickItemAsync(e, pageContext, type, id));
            iconElem.setAttribute("role", "button");
            iconElem.addEventListener("click", async (e: Event) => this.onClickItemAsync(e, pageContext, type, id));
        });
    }

    private sortItems(items: DocumentItemResult[]) {
        items.sort((item1, item2) => {
            if (item1.type != item2.type) {
                if (this.isContainer(item1)) return -1;
                return 1;
            }
            return item1.name.localeCompare(item2.name);
        });
    }

    private isContainer(item: DocumentItemResult): boolean {
        return item.type === "Folder" || item.type === "Volume";
    }

    private isDocument(item: DocumentItemResult): boolean {
        return item.type === "Document";
    }

    private getPath(id: number | null, docItems: DocumentItemResult[]): DocumentItemResult[] {
        const items: DocumentItemResult[] = [];
        while (id != null) {
            const item: DocumentItemResult | null = this.getItem(id, docItems);
            if (item === null) break;
            items.push(item);
            id = item.parentId;
        }
        items.reverse();
        return items;
    }

    private getItems(parentId: number, docItems: DocumentItemResult[]): DocumentItemResult[] {
        const items: DocumentItemResult[] = [];
        docItems.forEach(item => {
            if (item.parentId === parentId && item.accessRole == null) {
                items.push(item);
            }
        });
        this.sortItems(items);
        return items;
    }

    private getVolume(docItems: DocumentItemResult[]): DocumentItemResult | undefined {
        return docItems.find(item => item.type == "Volume");
    }

    private getItem(id: number, docItems: DocumentItemResult[]): DocumentItemResult | null {
        const item: DocumentItemResult | undefined = docItems.find(item => item.id === id);
        return item ? item : null;
    }

    private getSelected(docItems: DocumentItemResult[]): DocumentItemResult[] {
        const selected: DocumentItemResult[] = [];
        document.querySelectorAll(".item-select").forEach(
            elem => {
                if ((elem as HTMLInputElement).checked) {
                    const docItem = docItems.find(d => elem.id == `item-select-id-${d.id}`);
                    if (docItem !== undefined) {
                        selected.push(docItem);
                    }
                }
            });
        return selected;
    }

    private updateAllSelections(checked: boolean) {
        document.querySelectorAll(".item-select").forEach(
            elem => {
                const input: HTMLInputElement = elem as HTMLInputElement;
                if (input.checked != checked) {
                    input.checked = checked;
                }
            });
    }

    private formatSize(cnt: number) {
        if (cnt >= 1024 * 1024) {
            return `${Math.floor(cnt / (1024 * 1024))} MB`;
        }
        if (cnt >= 1024) {
            return `${Math.floor(cnt / 1024)} KB`;
        }
        return `${cnt} B`;
    }

    private async onClickItemAsync(e: Event, pageContext: PageContext, type: string, id: number): Promise<void> {
        e.preventDefault();
        if (type == "Folder") {
            pageContext.documentItem.containerId = id;
            await pageContext.renderAsync();
        } else {
            await this.onDownloadDocumentAsync(id, pageContext);
        }
    }

    private async onDownloadDocumentAsync(id: number, pageContext: PageContext): Promise<void> {
        const item = this.getItem(id, pageContext.documentItem.docItems);
        if (item != null && item.id != null && item.name != null) {
            const token: string = pageContext.authenticationClient.getToken()!;
            const user: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const blob: Blob = await DocumentService.downloadBlobAsync(token, user, item.id);
            const obj_url: string = URL.createObjectURL(blob);
            const a: HTMLAnchorElement = document.createElement("a");
            a.href = obj_url;
            a.setAttribute("download", item.name);
            a.click();
            URL.revokeObjectURL(obj_url);
        }
    }

    private onSelectAll(e: Event, docItems: DocumentItemResult[]) {
        const input: HTMLInputElement = e.target as HTMLInputElement;
        this.updateAllSelections(input.checked);
        this.updateActions(docItems);
    }

    private updateActions(docItems: DocumentItemResult[]) {
        const selected: DocumentItemResult[] = this.getSelected(docItems);
        const addFileElem: HTMLElement | null = document.getElementById("action-add-file-id");
        const addFolderElem: HTMLElement | null = document.getElementById("action-add-folder-id");
        const deleteElem: HTMLElement | null = document.getElementById("action-delete-id");
        const editElem: HTMLElement | null = document.getElementById("action-edit-id");
        this.showElem(addFileElem, selected.length == 0);
        this.showElem(addFolderElem, selected.length == 0);
        this.showElem(deleteElem, selected.length > 0);
        this.showElem(editElem, selected.length == 1);
    }

    private showElem(elem: HTMLElement | null, show: boolean) {
        if (elem != null) {
            if (show && elem.classList.contains("d-none")) {
                elem.classList.remove("d-none");
            } else if (!show && !elem.classList.contains("d-none")) {
                elem.classList.add("d-none");
            }
        }
    }
}