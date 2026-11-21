import { PageContext } from "../PageContext";
import { DocumentService } from "../services/DocumentService";
import { DocumentsExportService } from "../services/DocumentsExportService";
import { DesktopTabType, DocumentItemResult, UserInfoResult } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { DesktopTab } from "./DesktopTab";

export class DocumentTab implements DesktopTab {
    tabType: DesktopTabType = "DOCUMENTS";
    bootstrapIcon: string = "bi-files";
    titleKey: string = "HEADER_DOCUMENTS";
    private readonly maxPreviewSize = 20 * 1024 * 1024;
    private downloadBusy = false;
    private downloadMessage = "";

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
            const heading: HTMLHeadingElement = Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate(this.titleKey));
            this.renderBreadcrump(parent, pageContext, path);
            const currentFolder = DocumentService.getItem(pageContext.documentItem.containerId, pageContext.documentItem.all);
            if (currentFolder && DocumentService.isShared(currentFolder)) {
                Controls.createParagraph(parent, "alert alert-warning small", pageContext.locale.translate("DOCUMENTS_SHARED_UPLOAD"));
            }
            if (children.length > 0) {
                let selectionEnabled = pageContext.documentItem.selectionEnabled;
                Controls.createSearch(heading, parent, pageContext.locale.translate("SEARCH"), pageContext.documentItem.filter, (filter: string) => this.filterDocItemList(pageContext, filter, children, selectionEnabled));
                const selectionToggle = Controls.createButton(heading, "button", "", "btn btn-link text-body fs-4 p-0 ms-4 align-baseline", "action-selection-id");
                Controls.createSpan(selectionToggle, "bi bi-check2-square").setAttribute("aria-hidden", "true");
                const updateToggle = (): void => {
                    const label = pageContext.locale.translate(selectionEnabled ? "DOCUMENTS_CANCEL_SELECTION" : "DOCUMENTS_SELECT_ITEMS");
                    selectionToggle.title = label;
                    selectionToggle.setAttribute("aria-label", label);
                    selectionToggle.setAttribute("aria-pressed", String(selectionEnabled));
                    selectionToggle.classList.toggle("text-primary", selectionEnabled);
                    selectionToggle.classList.toggle("text-body", !selectionEnabled);
                };
                updateToggle();
                selectionToggle.addEventListener("click", () => {
                    selectionEnabled = !selectionEnabled;
                    pageContext.documentItem.selectionEnabled = selectionEnabled;
                    updateToggle();
                    this.filterDocItemList(pageContext, pageContext.documentItem.filter, children, selectionEnabled);
                });
                const listGroup: HTMLElement = Controls.createElement(parent, "ul", "list-group");
                listGroup.id = "list-group-id";
                this.filterDocItemList(pageContext, pageContext.documentItem.filter, children, selectionEnabled);
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
            const download = Controls.createButton(heading, "button", "", "btn btn-link text-body fs-4 p-0 ms-4 align-baseline d-none", "action-download-id");
            download.title = pageContext.locale.translate("DOCUMENTS_DOWNLOAD_SELECTED");
            download.setAttribute("aria-label", download.title);
            Controls.createSpan(download, "bi bi-download").setAttribute("aria-hidden", "true");
            download.addEventListener("click", async () => await this.downloadSelectedAsync(pageContext));
            const downloadStatus = Controls.createDiv(parent, "small text-body-secondary", this.downloadMessage, "document-download-status-id");
            downloadStatus.setAttribute("role", "status");
            if (user.roles.includes("usermanager")) {
                const createAction = (icon: string, key: string, id: string, page: "FOLDER_ACCESS" | "MARKDOWN_EDIT"): void => {
                    const button = Controls.createButton(heading, "button", "", "btn btn-link text-body fs-4 p-0 ms-4 align-baseline d-none", id);
                    button.title = pageContext.locale.translate(key);
                    button.setAttribute("aria-label", button.title);
                    Controls.createSpan(button, `bi ${icon}`).setAttribute("aria-hidden", "true");
                    button.addEventListener("click", async () => {
                        const selected = this.getSelected(pageContext);
                        if (selected.length !== 1) return;
                        pageContext.documentItem.edit = selected[0];
                        pageContext.pageType = page;
                        await pageContext.renderAsync();
                    });
                };
                createAction("bi-share", "DOCUMENTS_VISIBILITY", "action-sharing-id", "FOLDER_ACCESS");
                createAction("bi-file-earmark-code", "DOCUMENTS_EDIT_CONTENT", "action-markdown-id", "MARKDOWN_EDIT");
            }
            iEdit.title = pageContext.locale.translate("BUTTON_RENAME");
            iEdit.setAttribute("aria-label", iEdit.title);
            this.updateActions(pageContext);
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
            // download success
            const downloadAlert: HTMLDivElement = Controls.createDiv(parent, "text-center fixed-bottom alert alert-success fade", undefined, "download-alert-id");
            downloadAlert.setAttribute("role", "alert");
            downloadAlert.style.pointerEvents = "none";
            Controls.createDiv(downloadAlert, undefined, undefined, "download-alert-text-id");
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

    private filterDocItemList(pageContext: PageContext, filter: string, children: DocumentItemResult[], selectionEnabled: boolean) {
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
            if (selectionEnabled) {
                const li: HTMLElement = Controls.createElement(listGroup, "li", "list-group-item");
                const checkBoxSelectAll: HTMLInputElement = Controls.createInput(li, "checkbox", "selectall-id", "form-check-input me-4 mt-2");
                checkBoxSelectAll.setAttribute("aria-label", pageContext.locale.translate("DOCUMENTS_SELECT_ALL"));
                checkBoxSelectAll.addEventListener("click", (e: Event) => this.onSelectAll(e, pageContext));
            }
            pageContext.documentItem.filtered.forEach(item => {
                const id: number = item.id;
                const type: string = item.type;
                const li: HTMLElement = Controls.createElement(listGroup, "li", "list-group-item d-flex justify-content-between align-items-start");
                if (selectionEnabled) {
                    const checkBoxSelectItem: HTMLInputElement = Controls.createInput(li, "checkbox", `item-select-id-${id}`, "form-check-input flex-shrink-0 me-2 mt-1 item-select");
                    checkBoxSelectItem.setAttribute("aria-label", pageContext.locale.translateWithArgs("DOCUMENTS_SELECT_ITEM_1", [item.name]));
                    checkBoxSelectItem.addEventListener("click", _ => this.updateActions(pageContext));
                }
                const iconType: string = type == "Document" ? DocumentService.getFileIcon(item.name) : "bi-folder";
                const iconElem: HTMLElement = Controls.createSpan(li, `bi ${iconType} flex-shrink-0`);
                const nameElem = Controls.createButton(li, "button", item.name, "btn btn-link text-body text-decoration-none text-start text-truncate flex-grow-1 p-0 ms-2");
                nameElem.style.minWidth = "0";
                nameElem.title = item.name;
                nameElem.setAttribute("aria-label", pageContext.locale.translateWithArgs("DOCUMENTS_OPEN_1", [item.name]));
                if (DocumentService.isShared(item)) {
                    const isPublic = item.accessRole === "everbody";
                    const sharing = Controls.createSpan(li, `bi ${isPublic ? "bi-globe" : "bi-people"} flex-shrink-0 mx-2`);
                    sharing.title = pageContext.locale.translate(isPublic ? "DOCUMENTS_PUBLIC" : "DOCUMENTS_FAMILY");
                    sharing.setAttribute("role", "img");
                    sharing.setAttribute("aria-label", sharing.title);
                }
                let iconBadge: HTMLElement;
                if (item.size > 0) {
                    iconBadge = Controls.createSpan(li, "badge text-bg-primary rounded-pill flex-shrink-0", `${DocumentService.formatSize(item.size)}`);
                } else {
                    iconBadge = Controls.createSpan(li, "badge text-bg-secondary flex-shrink-0", `${item.children}`);
                }
                nameElem.setAttribute("role", "button");
                nameElem.addEventListener("click", async (e: Event) => await this.onClickItemAsync(e, pageContext, type, id));
                iconElem.setAttribute("role", "button");
                iconElem.addEventListener("click", async (e: Event) => await this.onClickItemAsync(e, pageContext, type, id));
                iconBadge.setAttribute("role", "button");
                iconBadge.addEventListener("click", async (e: Event) => await this.onClickItemAsync(e, pageContext, type, id));
            });
        }
        this.updateActions(pageContext);
    }

    private updateActions(pageContext: PageContext) {
        const selected: DocumentItemResult[] = this.getSelected(pageContext);
        const selectAll = document.getElementById("selectall-id") as HTMLInputElement | null;
        if (selectAll) {
            selectAll.checked = selected.length > 0 && selected.length === pageContext.documentItem.filtered.length;
            selectAll.indeterminate = selected.length > 0 && selected.length < pageContext.documentItem.filtered.length;
        }
        Controls.showElemById("action-add-file-id", selected.length == 0);
        Controls.showElemById("action-add-folder-id", selected.length == 0);
        Controls.showElemById("action-delete-id", selected.length > 0);
        Controls.showElemById("action-edit-id", selected.length == 1);
        Controls.showElemById("action-move-id", selected.length > 0);
        Controls.showElemById("action-download-id", selected.length > 0);
        const download = document.getElementById("action-download-id") as HTMLButtonElement | null;
        if (download) download.disabled = this.downloadBusy;
        Controls.showElemById("action-sharing-id", selected.length === 1 && selected[0].type === "Folder");
        Controls.showElemById("action-markdown-id", selected.length === 1 && selected[0].type === "Document" &&
            selected[0].name.endsWith(".md") && DocumentService.isShared(selected[0]));
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

    private async downloadSelectedAsync(pageContext: PageContext): Promise<void> {
        if (this.downloadBusy) return;
        const selected = this.getSelected(pageContext);
        if (selected.length === 0) return;
        this.downloadBusy = true;
        this.updateActions(pageContext);
        const setStatus = (message: string): void => {
            this.downloadMessage = message;
            const status = document.getElementById("document-download-status-id");
            if (status) status.textContent = message;
        };
        try {
            const token = pageContext.authenticationClient.getToken();
            if (!token || !pageContext.authenticationClient.isLoggedIn()) throw new Error("ERROR_INVALID_TOKEN");
            const checkSession = (): void => {
                if (!pageContext.authenticationClient.isLoggedIn() || pageContext.authenticationClient.getToken() !== token) throw new Error("ERROR_INVALID_TOKEN");
            };
            const user = await pageContext.authenticationClient.getUserInfoAsync();
            checkSession();
            setStatus(pageContext.locale.translate("DOCUMENTS_DOWNLOAD_PREPARING"));
            let blob: Blob;
            let filename: string;
            if (selected.length === 1 && selected[0].type === "Document") {
                blob = await DocumentService.downloadBlobAsync(token, user, selected[0]);
                filename = selected[0].name;
            } else {
                blob = await DocumentsExportService.exportSelectionAsync(token, user, selected, (completed, total) => {
                    checkSession();
                    setStatus(total > 0 && completed < total ? pageContext.locale.translateWithArgs("ACCOUNT_EXPORT_PROGRESS_1_2", [String(completed), String(total)]) :
                        pageContext.locale.translate("DOCUMENTS_DOWNLOAD_PREPARING"));
                });
                filename = `myna-documents-${new Date().toISOString().slice(0, 10)}.zip`;
            }
            checkSession();
            this.saveBlob(blob, filename, pageContext);
        } catch (error: unknown) {
            this.handleError(error, pageContext);
        } finally {
            this.downloadBusy = false;
            setStatus("");
            this.updateActions(pageContext);
        }
    }

    private async downloadFileAsync(id: number, pageContext: PageContext): Promise<void> {
        const item = DocumentService.getItem(id, pageContext.documentItem.filtered);
        if (!item || item.type !== "Document") throw new Error("ERROR_INVALID_PARAMETERS");
        const token = pageContext.authenticationClient.getToken();
        if (!token) throw new Error("ERROR_INVALID_TOKEN");
        const user = await pageContext.authenticationClient.getUserInfoAsync();
        const blob = await DocumentService.downloadBlobAsync(token, user, item);
        this.saveBlob(blob, item.name, pageContext);
    }

    private saveBlob(blob: Blob, filename: string, pageContext: PageContext): void {
        const objUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objUrl;
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.setTimeout(() => URL.revokeObjectURL(objUrl), 1000);
        const downloadText = document.getElementById("download-alert-text-id");
        const downloadAlert = document.getElementById("download-alert-id");
        if (downloadText && downloadAlert) {
            downloadText.textContent = pageContext.locale.translateWithArgs("FILE_DOWNLOADED_1", [filename]);
            downloadAlert.classList.add("show");
            window.setTimeout(() => downloadAlert.classList.remove("show"), 1000);
        }
    }

    private async previewFileAsync(id: number, pageContext: PageContext): Promise<void> {
        const item = DocumentService.getItem(id, pageContext.documentItem.filtered);
        if (!item || item.type !== "Document") throw new Error("ERROR_INVALID_PARAMETERS");
        const previewKind = DocumentService.getPreviewKind(item.name);
        const mimeType = DocumentService.getPreviewMimeType(item.name);
        if (!previewKind || !mimeType || item.size > this.maxPreviewSize) throw new Error("ERROR_DOCUMENT_PREVIEW_TOO_LARGE");
        const token = pageContext.authenticationClient.getToken();
        if (!token) throw new Error("ERROR_INVALID_TOKEN");
        const user = await pageContext.authenticationClient.getUserInfoAsync();
        const blob = await DocumentService.downloadBlobAsync(token, user, item);
        if (blob.size > this.maxPreviewSize) throw new Error("ERROR_DOCUMENT_PREVIEW_TOO_LARGE");
        const previewBlob = new Blob([blob], { type: mimeType });
        const textContent = previewKind === "text" ? await previewBlob.text() : null;
        let renderedMarkdown: DocumentFragment | null = null;
        if (textContent !== null && DocumentService.getExtension(item.name) === "md") {
            const { MarkdownPreview } = await import("../services/MarkdownPreview");
            renderedMarkdown = MarkdownPreview.render(textContent, pageContext.locale.translate("DOCUMENTS_MARKDOWN_IMAGE"));
        }
        const objectUrl = URL.createObjectURL(previewBlob);
        const dialog = Controls.createElement(document.body, "dialog", "modal d-block mw-100 mh-100 m-0 p-0 border-0 bg-transparent") as HTMLDialogElement;
        dialog.setAttribute("aria-labelledby", "document-preview-title");
        const modalDialog = Controls.createDiv(dialog, "modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable");
        const content = Controls.createDiv(modalDialog, "modal-content");
        const header = Controls.createDiv(content, "modal-header");
        Controls.createHeading(header, 2, "modal-title fs-5 text-break", item.name).id = "document-preview-title";
        const close = Controls.createButton(header, "button", "", "btn-close");
        close.setAttribute("aria-label", pageContext.locale.translate("DOCUMENTS_CLOSE_PREVIEW"));
        close.setAttribute("autofocus", "");
        close.addEventListener("click", () => dialog.close());
        const body = Controls.createDiv(content, "modal-body");
        if (previewKind === "image") {
            const image = Controls.createElement(body, "img", "img-fluid rounded mx-auto d-block") as HTMLImageElement;
            image.src = objectUrl;
            image.alt = item.name;
        } else if (previewKind === "pdf") {
            const frame = Controls.createElement(body, "div", "ratio ratio-4x3");
            const pdf = Controls.createElement(frame, "iframe", "border-0") as HTMLIFrameElement;
            pdf.src = objectUrl;
            pdf.title = pageContext.locale.translateWithArgs("DOCUMENTS_PREVIEW_1", [item.name]);
        } else if (renderedMarkdown) {
            const modes = Controls.createDiv(body, "btn-group btn-group-sm mb-3");
            modes.setAttribute("role", "group");
            modes.setAttribute("aria-label", pageContext.locale.translate("DOCUMENTS_MARKDOWN_VIEW"));
            const renderedButton = Controls.createButton(modes, "button", pageContext.locale.translate("DOCUMENTS_MARKDOWN_RENDERED"), "btn btn-outline-primary");
            const sourceButton = Controls.createButton(modes, "button", pageContext.locale.translate("DOCUMENTS_MARKDOWN_SOURCE"), "btn btn-outline-primary");
            const rendered = Controls.createDiv(body, "text-break");
            rendered.appendChild(renderedMarkdown);
            const source = Controls.createElement(body, "pre", "mb-0 font-monospace text-break");
            source.textContent = textContent;
            const selectMode = (showRendered: boolean): void => {
                rendered.hidden = !showRendered;
                source.hidden = showRendered;
                renderedButton.classList.toggle("active", showRendered);
                sourceButton.classList.toggle("active", !showRendered);
                renderedButton.setAttribute("aria-pressed", String(showRendered));
                sourceButton.setAttribute("aria-pressed", String(!showRendered));
            };
            renderedButton.addEventListener("click", () => selectMode(true));
            sourceButton.addEventListener("click", () => selectMode(false));
            selectMode(true);
        } else {
            const text = Controls.createElement(body, "pre", "mb-0 font-monospace text-break");
            text.textContent = textContent ?? "";
        }
        const footer = Controls.createDiv(content, "modal-footer");
        const download = Controls.createButton(footer, "button", "", "btn btn-primary");
        Controls.createSpan(download, "bi bi-download me-2").setAttribute("aria-hidden", "true");
        Controls.createSpan(download, "", pageContext.locale.translate("DOCUMENTS_DOWNLOAD"));
        download.addEventListener("click", () => this.saveBlob(blob, item.name, pageContext));
        const closePreview = Controls.createButton(footer, "button", pageContext.locale.translate("DOCUMENTS_CLOSE_PREVIEW"), "btn btn-secondary");
        closePreview.addEventListener("click", () => dialog.close());
        const cleanup = (): void => {
            URL.revokeObjectURL(objectUrl);
            dialog.remove();
        };
        dialog.addEventListener("close", cleanup, { once: true });
        try {
            dialog.showModal();
        } catch (error: unknown) {
            cleanup();
            throw error;
        }
    }

    private async runFileActionAsync(action: () => Promise<void>, pageContext: PageContext): Promise<void> {
        Controls.showElemById("loading-progress-id", true);
        try {
            await action();
        } catch (error: Error | unknown) {
            this.handleError(error, pageContext);
        } finally {
            Controls.showElemById("loading-progress-id", false);
        }
    }

    private async uploadFilesAsync(pageContext: PageContext, curFiles: File[]): Promise<void> {
        if (curFiles.length == 0) {
            pageContext.authenticationClient.resetUserInfo();
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
        const parent = DocumentService.getItem(pageContext.documentItem.containerId!, pageContext.documentItem.all);
        if (!parent) throw new Error("ERROR_INVALID_PARAMETERS");
        await DocumentService.uploadFileAsync(token, user, parent, curFile.name, data);
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
                pageContext.authenticationClient.resetUserInfo();
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
        if (type === "Folder") {
            pageContext.documentItem.containerId = id;
            await pageContext.renderAsync();
            return;
        }
        const item = DocumentService.getItem(id, pageContext.documentItem.filtered);
        if (item && DocumentService.getPreviewKind(item.name) && item.size <= this.maxPreviewSize) {
            await this.runFileActionAsync(() => this.previewFileAsync(id, pageContext), pageContext);
        } else {
            await this.runFileActionAsync(() => this.downloadFileAsync(id, pageContext), pageContext);
        }
    }

    private onSelectAll(e: Event, pageContext: PageContext) {
        const input: HTMLInputElement = e.target as HTMLInputElement;
        this.updateAllSelections(input.checked);
        this.updateActions(pageContext);
    }
}