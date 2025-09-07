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
            pageContext.documentItem.all = await DocumentService.getDocumentItemsAsync(token, user, pageContext.documentItem.containerId);
            let volume: DocumentItemResult | undefined = DocumentService.getVolume(pageContext.documentItem.all);
            if (volume == undefined) {
                volume = await DocumentService.createVolumeAsync(token, pageContext.locale.translate("TEXT_DOCUMENTS"));
            }
            pageContext.documentItem.containerId = pageContext.documentItem.containerId || volume.id;
            const path: DocumentItemResult[] = DocumentService.getPath(pageContext.documentItem.containerId, pageContext.documentItem.all);
            const children: DocumentItemResult[] = DocumentService.getChildren(pageContext.documentItem.containerId, pageContext.documentItem.all);
            const heading: HTMLHeadingElement = Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate("HEADER_DOCUMENTS"));
            this.renderBreadcrump(parent, pageContext, path);
            if (children.length > 0) {
                Controls.createSearch(heading, parent, pageContext.locale.translate("SEARCH"), pageContext.documentItem.filter, (filter: string) => this.filterDocItemList(pageContext, filter, children));
                const listGroup: HTMLElement = Controls.createElement(parent, "ul", "list-group");
                listGroup.id = "list-group-id";
                this.filterDocItemList(pageContext, pageContext.documentItem.filter, children);
            }
            const iAddFile: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-file-plus", undefined, "action-add-file-id");
            iAddFile.setAttribute("role", "button");
            iAddFile.addEventListener("click", (e: Event) => this.onAddFile(e));
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
            const iMove: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-arrows-move d-none", undefined, "action-move-id");
            iMove.setAttribute("role", "button");
            iMove.addEventListener("click", async (e: Event) => await this.onMoveAsync(e, pageContext));
            // render delete confirmation dialog
            Controls.createConfirmationDialog(
                parent,
                pageContext.locale.translate("HEADER_DOCUMENTS"),
                pageContext.locale.translate("INFO_REALLY_DELETE_SELECTED_ELEMS"),
                pageContext.locale.translate("BUTTON_YES"),
                pageContext.locale.translate("BUTTON_NO"));
            document.getElementById("confirmationyesbutton-id")!.addEventListener("click", async (e: Event) => await this.onDeleteAsync(e, pageContext));
            // upload form
            const form: HTMLFormElement = Controls.createForm(parent, "d-none");
            form.id = "uploadform-id";
            form.method = "post";
            form.enctype = "multipart/formdata";
            const inputFile: HTMLInputElement = Controls.createElement(form, "input", "d-none") as HTMLInputElement;
            inputFile.type = "file";
            inputFile.name = "file-input";
            inputFile.id = "file-input-id";
            inputFile.multiple = true;
            inputFile.addEventListener("change", async (e: Event) => await this.onAddDocumentAsync(e, pageContext));

        }
        catch (error: Error | unknown) {
            this.handleError(error, pageContext);
        }
    }

    private handleError(error: Error | unknown, pageContext: PageContext) {
        const alertDiv: HTMLDivElement = document.getElementById("alertdiv-id") as HTMLDivElement;
        Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
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

    private filterDocItemList(pageContext: PageContext, filter: string, children: DocumentItemResult[]) {
        pageContext.documentItem.filter = filter;
        pageContext.documentItem.filtered = [];
        children.forEach(item => {
            if (filter.length == 0 || item.name.toLocaleLowerCase().includes(filter)) {
                pageContext.documentItem.filtered.push(item);
            }
        });
        const listGroup: HTMLElement = document.getElementById("list-group-id")!;
        Controls.removeAllChildren(listGroup);
        if (pageContext.documentItem.filtered.length > 0) {
            const li: HTMLElement = Controls.createElement(listGroup, "li", "list-group-item");
            const checkBoxSelectAll: HTMLInputElement = Controls.createInput(li, "checkbox", "selectall-id", "form-check-input me-4 mt-2");
            checkBoxSelectAll.addEventListener("click", (e: Event) => this.onSelectAll(e, pageContext));
            pageContext.documentItem.filtered.forEach(item => {
                const id: number = item.id;
                const type: string = item.type;
                const li: HTMLElement = Controls.createElement(listGroup, "li", "list-group-item d-flex justify-content-between align-items-start");
                const checkBoxSelectItem: HTMLInputElement = Controls.createInput(li, "checkbox", `item-select-id-${id}`, "form-check-input me-2 mt-1 item-select");
                checkBoxSelectItem.addEventListener("click", _ => this.updateActions(pageContext));
                const iconType: string = type == "Document" ? DocumentService.getFileIcon(item.name) : "bi-folder";
                const iconElem: HTMLElement = Controls.createSpan(li, `bi ${iconType}`);
                const nameElem: HTMLElement = Controls.createSpan(li, "ms-2 me-auto", item.name);
                let iconBadge: HTMLElement;
                if (item.size > 0) {
                    iconBadge = Controls.createSpan(li, "badge text-bg-primary rounded-pill", `${DocumentService.formatSize(item.size)}`);
                } else {
                    iconBadge = Controls.createSpan(li, "badge text-bg-secondary", `${item.children}`);
                }
                nameElem.setAttribute("role", "button");
                nameElem.addEventListener("click", async (e: Event) => await this.onClickItemAsync(e, pageContext, type, id));
                iconElem.setAttribute("role", "button");
                iconElem.addEventListener("click", async (e: Event) => await this.onClickItemAsync(e, pageContext, type, id));
                iconBadge.setAttribute("role", "button");
                iconBadge.addEventListener("click", async (e: Event) => await this.onClickItemAsync(e, pageContext, type, id));
            });
        }
        // download success
        const downloadAlert: HTMLDivElement = Controls.createDiv(listGroup, "text-center fixed-bottom alert alert-success fade", undefined, "download-alert-id");
        downloadAlert.setAttribute("role", "alert");
        Controls.createDiv(downloadAlert, undefined, undefined, "download-alert-text-id");
    }

    private updateActions(pageContext: PageContext) {
        const selected: DocumentItemResult[] = this.getSelected(pageContext);
        Controls.showElemById("action-add-file-id", selected.length == 0);
        Controls.showElemById("action-add-folder-id", selected.length == 0);
        Controls.showElemById("action-delete-id", selected.length > 0);
        Controls.showElemById("action-edit-id", selected.length == 1);
        Controls.showElemById("action-move-id", selected.length > 0);
    }

    private getSelected(pageContext: PageContext): DocumentItemResult[] {
        const selected: DocumentItemResult[] = [];
        document.querySelectorAll(".item-select").forEach(
            elem => {
                if ((elem as HTMLInputElement).checked) {
                    const docItem: DocumentItemResult | undefined = pageContext.documentItem.all.find(d => elem.id == `item-select-id-${d.id}`);
                    if (docItem) {
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

    private async downloadFileAsync(id: number, pageContext: PageContext): Promise<void> {
        const item: DocumentItemResult | null = DocumentService.getItem(id, pageContext.documentItem.filtered);
        if (item != null && item.id != null && item.name != null) {
            const token: string = pageContext.authenticationClient.getToken()!;
            const user: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const blob: Blob = await DocumentService.downloadBlobAsync(token, user, item);
            const objUrl: string = URL.createObjectURL(blob);
            const a: HTMLAnchorElement = document.createElement("a");
            a.href = objUrl;
            a.download = item.name;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objUrl);
            // fade in download success
            const downloadText: HTMLElement = document.getElementById("download-alert-text-id") as HTMLElement;
            downloadText.textContent = pageContext.locale.translateWithArgs("FILE_DOWNLOADED_1", [item.name]);
            const downloadAlert: HTMLElement = document.getElementById("download-alert-id") as HTMLElement;
            downloadAlert.classList.add("show");
            // hide after 1 second
            window.setTimeout(() => downloadAlert.classList.remove("show"), 1000);
        }
    }

    private async uploadFilesAsync(pageContext: PageContext, curFiles: File[]): Promise<void> {
        if (curFiles.length == 0) {
            await pageContext.renderAsync();
            return;
        }
        const curFile: File = curFiles[0];
        curFiles.shift();
        const fileReader: FileReader = new FileReader();
        fileReader.onload = async (e: ProgressEvent<FileReader>) => {
            if (e.target?.result instanceof ArrayBuffer) {
                await this.uploadFileAsync(pageContext, e.target.result, curFile, curFiles);
            }
        };
        fileReader.readAsArrayBuffer(curFile);
    }

    private async uploadFileAsync(pageContext: PageContext, data: ArrayBuffer, curFile: File, curFiles: File[]): Promise<void> {
        const token: string = pageContext.authenticationClient.getToken()!;
        const user: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
        await DocumentService.uploadFileAsync(token, user, pageContext.documentItem.containerId!, curFile.name, data);
        await this.uploadFilesAsync(pageContext, curFiles);
    }

    // event callbacks    

    private onAddFile(e: Event) {
        e.preventDefault();
        const inputFile: HTMLInputElement = document.getElementById("file-input-id") as HTMLInputElement;
        inputFile.click();
    }

    private async onAddDocumentAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const inputFile: HTMLInputElement = document.getElementById("file-input-id") as HTMLInputElement;
        if (inputFile.files != null) {
            Controls.showElemById("loading-progress-id", true);
            try {
                const curFiles: File[] = [];
                for (let i: number = 0; i < inputFile.files.length; i++) {
                    const curFile: File = inputFile.files[i];
                    if (curFile.size > 20 * 1024 * 1024) {
                        throw new Error(pageContext.locale.translateWithArgs("ERROR_FILE_TOO_LARGE_1_2", [curFile.name, DocumentService.formatSize(curFile.size)]));
                    }
                    curFiles.push(curFile);
                }
                await this.uploadFilesAsync(pageContext, curFiles);
            }
            catch (error: Error | unknown) {
                this.handleError(error, pageContext);
            }
            Controls.showElemById("loading-progress-id", false);
        }
    }

    private async onEditAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const selected: DocumentItemResult[] = this.getSelected(pageContext);
        if (selected.length == 1) {
            pageContext.documentItem.edit = selected[0];
            pageContext.pageType = "DOCUMENT_EDIT";
            await pageContext.renderAsync();
        }
    }

    private async onMoveAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const selected: DocumentItemResult[] = this.getSelected(pageContext);
        if (selected.length > 0) {
            pageContext.documentItem.moved = selected;
            pageContext.pageType = "DOCUMENT_MOVE";
            await pageContext.renderAsync();
        }
    }

    private async onDeleteAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        const selected: DocumentItemResult[] = this.getSelected(pageContext);
        if (selected.length > 0) {
            try {
                const token: string = pageContext.authenticationClient.getToken()!;
                const ids: number[] = selected.map(item => item.id);
                await DocumentService.deleteItemsAsync(token, pageContext.documentItem.containerId!, ids);
                await pageContext.renderAsync();
            }
            catch (error: Error | unknown) {
                this.handleError(error, pageContext);
            }
        }
    }

    private async onAddFolderAsync(e: Event, pageContext: PageContext): Promise<void> {
        e.preventDefault();
        pageContext.pageType = "DOCUMENT_EDIT";
        await pageContext.renderAsync();
    }

    private async onClickItemAsync(e: Event, pageContext: PageContext, type: string, id: number): Promise<void> {
        e.preventDefault();
        if (type == "Folder") {
            pageContext.documentItem.containerId = id;
            await pageContext.renderAsync();
            return;
        }
        Controls.showElemById("loading-progress-id", true);
        try {
            await this.downloadFileAsync(id, pageContext);
        }
        catch (error: Error | unknown) {
            this.handleError(error, pageContext);
        }
        Controls.showElemById("loading-progress-id", false);
    }

    private onSelectAll(e: Event, pageContext: PageContext) {
        const input: HTMLInputElement = e.target as HTMLInputElement;
        this.updateAllSelections(input.checked);
        this.updateActions(pageContext);
    }
}