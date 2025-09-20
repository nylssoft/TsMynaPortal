/**
 * Provides utility functions to create and manipulate HTML elements.
 * This class includes methods for creating various HTML elements such as divs, forms, labels,
 * inputs, headings, buttons, and spans. It also includes methods for creating alerts
 * and removing all children from a parent element.
 */
export class Controls {

    /**
     * Creates an HTML element with the specified name, class, and text content.
     * The element is appended to the specified parent element.
     * 
     * @param parent parent element to append the new element to
     * @param name name of the HTML element to create
     * @param classname optional class name to assign to the element
     * @param txt optional text content to set for the element
     * @param id optional id to set for the element
     * @returns HTML element created with the specified name, class, and text content
     */
    static createElement(parent: HTMLElement, name: string, classname?: string, txt?: string, id?: string): HTMLElement {
        const e: HTMLElement = document.createElement(name);
        if (classname) {
            e.setAttribute("class", classname);
        }
        parent.appendChild(e);
        if (txt) {
            e.textContent = txt;
        }
        if (id) {
            e.id = id;
        }
        return e;
    }

    /**
     * Creates a div element with the specified class and text content.
     * The div is appended to the specified parent element.
     * 
     * @param parent parent element to append the new div to
     * @param classname class name to assign to the div
     * @param txt text content to set for the div
     * @param id optional ID
     * @returns HTMLDivElement created with the specified class and text content
     */
    static createDiv(parent: HTMLElement, classname?: string, txt?: string, id?: string): HTMLDivElement {
        return Controls.createElement(parent, "div", classname, txt, id) as HTMLDivElement;
    }

    /**
     * Creates a form element with the specified class.
     * The form is appended to the specified parent element.
     * 
     * @param parent parent element to append the new form to
     * @param classname class name to assign to the form
     * @returns HTMLFormElement created with the specified class
     */
    static createForm(parent: HTMLElement, classname?: string): HTMLFormElement {
        return Controls.createElement(parent, "form", classname) as HTMLFormElement;
    }

    /**
     * Creates a label element with the specified for attribute, class, and text content.
     * The label is appended to the specified parent element.
     * 
     * @param parent parent element to append the new label to
     * @param forid element ID that the label is associated with
     * @param classname class name to assign to the label
     * @param txt text content to set for the label
     * @returns HTMLLabelElement created with the specified for attribute, class, and text content
     */
    static createLabel(parent: HTMLElement, forid: string, classname?: string, txt?: string): HTMLLabelElement {
        const label: HTMLLabelElement = Controls.createElement(parent, "label", classname) as HTMLLabelElement;
        label.setAttribute("for", forid);
        if (txt) {
            label.textContent = txt;
        }
        return label;
    }

    /**
     * Creates an input element with the specified type, ID, class, and value.
     * The input is appended to the specified parent element.
     * 
     * @param parent parent element to append the new input to
     * @param type type of the input element (e.g., "text", "password", "email")
     * @param id ID of the input element
     * @param classname class name to assign to the input element
     * @param value value to set for the input element
     * @returns HTMLInputElement created with the specified type, ID, class, and value
     */
    static createInput(parent: HTMLElement, type: string, id: string, classname?: string, value?: string): HTMLInputElement {
        const input: HTMLInputElement = Controls.createElement(parent, "input", classname) as HTMLInputElement;
        input.type = type;
        input.id = id;
        if (value) {
            input.value = value;
        }
        return input;
    }

    /**
     * Creates a heading element (h1, h2, etc.) with the specified level, class, and text content.
     * The heading is appended to the specified parent element.
     * 
     * @param parent parent element to append the new heading to
     * @param level heading level (1-6)
     * @param classname class name to assign to the heading
     * @param txt text content to set for the heading
     * @returns HTMLHeadingElement created with the specified level, class, and text content
     */
    static createHeading(parent: HTMLElement, level: number, classname?: string, txt?: string): HTMLHeadingElement {
        const h: HTMLHeadingElement = Controls.createElement(parent, `h${level}`, classname) as HTMLHeadingElement;
        if (txt) {
            h.textContent = txt;
        }
        return h;
    }

    /**
     * Creates a button element with the specified type, ID, text content, and optional class.
     * The button is appended to the specified parent element.
     * 
     * @param parent parent element to append the new button to
     * @param type type of the button (e.g., "button", "submit")
     * @param txt text content to set for the button
     * @param classname optional class name to assign to the button
     * @param id optional id to set for the button
     * @returns HTMLButtonElement created with the specified type, ID, text content, and class
     */
    static createButton(parent: HTMLElement, type: string, txt: string, classname?: string, id?: string): HTMLButtonElement {
        const b: HTMLButtonElement = Controls.createElement(parent, "button", classname, txt) as HTMLButtonElement;
        b.setAttribute("type", type);
        b.title = txt;
        if (id) {
            b.id = id;
        }
        return b;
    }

    /**
     * Creates a span element with the specified class and text content.
     * The span is appended to the specified parent element.
     * 
     * @param parent parent element to append the new span to
     * @param classname class name to assign to the span
     * @param txt text content to set for the span
     * @returns HTMLSpanElement created with the specified class and text content
     */
    static createSpan(parent: HTMLElement, classname?: string, txt?: string): HTMLSpanElement {
        const span: HTMLSpanElement = Controls.createElement(parent, "span", classname, txt) as HTMLSpanElement;
        return span;
    }

    /**
     * Creates an alert element with the specified message.
     * The alert is appended to the specified parent element and includes a close button.
     * 
     * @param parent parent element to append the new alert to
     * @param msg message to display in the alert
     * @param alertClass class name to assign to the alert (default is "alert-danger")
     * @returns HTMLDivElement representing the alert
     */
    static createAlert(parent: HTMLElement, msg: string, alertClass: string = "alert-danger"): HTMLDivElement {
        Controls.removeAllChildren(parent);
        const alertDiv: HTMLDivElement = Controls.createDiv(parent, `alert ${alertClass} alert-dismissible`);
        alertDiv.setAttribute("role", "alert");
        Controls.createDiv(alertDiv, "", msg);
        const alertButton: HTMLButtonElement = Controls.createButton(alertDiv, "button", "", "btn-close");
        alertButton.setAttribute("data-bs-dismiss", "alert");
        alertButton.setAttribute("aria-label", "Close");
        return alertDiv;
    }

    static createConfirmationDialog(parent: HTMLElement, title: string, body: string, yes: string, no: string): HTMLDivElement {
        const modalDiv: HTMLDivElement = Controls.createDiv(parent, "modal fade");
        modalDiv.id = "confirmationdialog-id";
        modalDiv.setAttribute("tabIndex", "-1");
        modalDiv.setAttribute("aria-labelledby", "confirmationdialoglabel-id");
        modalDiv.setAttribute("aria-hidden", "true");
        const modalDialogDiv: HTMLDivElement = Controls.createDiv(modalDiv, "modal-dialog");
        const modalContentDiv: HTMLDivElement = Controls.createDiv(modalDialogDiv, "modal-content");
        const modalHeaderDiv: HTMLDivElement = Controls.createDiv(modalContentDiv, "modal-header");
        const h1: HTMLHeadingElement = Controls.createHeading(modalHeaderDiv, 1, "modal-title fs-5", title);
        h1.id = "confirmationdialoglabel-id";
        const buttonCloseHeader: HTMLButtonElement = Controls.createButton(modalHeaderDiv, "button", "", "btn-close");
        buttonCloseHeader.setAttribute("data-bs-dismiss", "modal");
        buttonCloseHeader.setAttribute("aria-label", "Close");
        const modalBodyDiv: HTMLDivElement = Controls.createDiv(modalContentDiv, "modal-body");
        Controls.createParagraph(modalBodyDiv, "alert alert-danger", body);
        const modalFooterDiv: HTMLDivElement = Controls.createDiv(modalContentDiv, "modal-footer");
        const buttonYes: HTMLButtonElement = Controls.createButton(modalFooterDiv, "button", yes, "btn btn-secondary", "confirmationyesbutton-id");
        const buttonNo: HTMLButtonElement = Controls.createButton(modalFooterDiv, "button", no, "btn btn-primary", "confirmationnobutton-id");
        buttonYes.setAttribute("data-bs-dismiss", "modal");
        buttonNo.setAttribute("data-bs-dismiss", "modal");
        return modalDiv;
    }

    /**
     * Creates an anchor element with the specified hyperlink reference, text content, class, and active state.
     * The anchor is appended to the specified parent element.
     * 
     * @param parent parent element to append the new anchor to
     * @param href hyperlink reference for the anchor
     * @param txt text content to set for the anchor
     * @param classname class name to assign to the anchor
     * @param active flag indicating if the anchor is active
     * @returns HTMLAnchorElement created with the specified href, text content, class, and active state
     */
    static createAnchor(parent: HTMLElement, href: string, txt: string, classname?: string, active?: boolean): HTMLAnchorElement {
        const a: HTMLAnchorElement = Controls.createElement(parent, "a", classname) as HTMLAnchorElement;
        a.href = href;
        a.textContent = txt;
        if (active) {
            a.classList.add("active");
            a.setAttribute("aria-current", "true");
        }
        return a;
    }

    /**
     * Creates a paragraph element with the specified class and text content.
     * The paragraph is appended to the specified parent element.
     * 
     * @param parent parent element to append the new paragraph to
     * @param classname class name to assign to the paragraph
     * @param txt text content to set for the paragraph
     * @returns HTMLParagraphElement created with the specified class and text content
     */
    static createParagraph(parent: HTMLElement, classname?: string, txt?: string): HTMLParagraphElement {
        return Controls.createElement(parent, "p", classname, txt) as HTMLParagraphElement;
    }

    static createSearch(heading: HTMLHeadingElement, parent: HTMLElement, label: string, filter: string, renderItems: (filter: string) => void) {
        const iconFilter: HTMLElement = Controls.createElement(heading, "i", "ms-2 bi bi-search");
        iconFilter.setAttribute("style", "cursor:pointer;");
        const formElement: HTMLFormElement = Controls.createForm(parent, "align-items-center");
        if (filter.length == 0) {
            formElement.classList.add("d-none");
        }
        formElement.id = "search-form-id";
        const divFilter: HTMLDivElement = Controls.createDiv(formElement, "d-flex align-items-center mb-2");
        Controls.createLabel(divFilter, "search-id", "form-label mb-0 me-2", label);
        const inputFilter: HTMLInputElement = Controls.createInput(divFilter, "text", "search-id", "form-control", filter);
        inputFilter.setAttribute("autocomplete", "off");
        inputFilter.setAttribute("spellcheck", "false");
        formElement.addEventListener("submit", (e: SubmitEvent) => {
            e.preventDefault();
            renderItems(inputFilter.value.trim().toLocaleLowerCase());
        });
        iconFilter.addEventListener("click", (e: MouseEvent) => {
            const elem: HTMLElement = document.getElementById("search-form-id")!;
            if (elem.classList.contains("d-none")) {
                elem.classList.remove("d-none");
                document.getElementById("search-id")!.focus();
            } else {
                elem.classList.add("d-none");
            }
        });
    }

    /**
     * Removes all child elements from the specified parent element.
     * This is useful for clearing the contents of an element before adding new content.
     * 
     * @param parent parent element whose children will be removed
     */
    static removeAllChildren(parent: HTMLElement): void {
        const node: HTMLElement = parent;
        while (node.lastChild) {
            node.removeChild(node.lastChild);
        }
    }

    static showElem(elem: HTMLElement | null, show: boolean): void {
        if (elem != null) {
            if (show && elem.classList.contains("d-none")) {
                elem.classList.remove("d-none");
            } else if (!show && !elem.classList.contains("d-none")) {
                elem.classList.add("d-none");
            }
        }
    }

    static showElemById(id: string, show: boolean): void {
        this.showElem(document.getElementById(id), show);
    }
}