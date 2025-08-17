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
     * @param classname class name to assign to the element
     * @param txt text content to set for the element
     * @returns HTML element created with the specified name, class, and text content
     */
    public static createElement(parent: HTMLElement, name: string, classname?: string, txt?: string): HTMLElement {
        const e: HTMLElement = document.createElement(name);
        if (classname) {
            e.setAttribute("class", classname);
        }
        parent.appendChild(e);
        if (txt) {
            e.textContent = txt;
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
     * @returns HTMLDivElement created with the specified class and text content
     */
    public static createDiv(parent: HTMLElement, classname?: string, txt?: string): HTMLDivElement {
        return Controls.createElement(parent, "div", classname, txt) as HTMLDivElement;
    }

    /**
     * Creates a form element with the specified class.
     * The form is appended to the specified parent element.
     * 
     * @param parent parent element to append the new form to
     * @param classname class name to assign to the form
     * @returns HTMLFormElement created with the specified class
     */
    public static createForm(parent: HTMLElement, classname?: string): HTMLFormElement {
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
    public static createLabel(parent: HTMLElement, forid: string, classname?: string, txt?: string): HTMLLabelElement {
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
    public static createInput(parent: HTMLElement, type: string, id: string, classname?: string, value?: string): HTMLInputElement {
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
    public static createHeading(parent: HTMLElement, level: number, classname?: string, txt?: string): HTMLHeadingElement {
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
     * @param id ID of the button element
     * @param txt text content to set for the button
     * @param classname optional class name to assign to the button
     * @returns HTMLButtonElement created with the specified type, ID, text content, and class
     */
    public static createButton(parent: HTMLElement, type: string, id: string, txt: string, classname?: string): HTMLButtonElement {
        const b: HTMLButtonElement = Controls.createElement(parent, "button", classname) as HTMLButtonElement;
        b.setAttribute("type", type);
        b.id = id;
        b.title = txt;
        b.textContent = txt;
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
    public static createSpan(parent: HTMLElement, classname?: string, txt?: string): HTMLSpanElement {
        const span: HTMLSpanElement = Controls.createElement(parent, "span", classname, txt) as HTMLSpanElement;
        return span;
    }

    /**
     * Creates an alert element with the specified message.
     * The alert is appended to the specified parent element and includes a close button.
     * 
     * @param parent parent element to append the new alert to
     * @param msg message to display in the alert
     * @returns HTMLDivElement representing the alert
     */
    public static createAlert(parent: HTMLElement, msg: string): HTMLDivElement {
        Controls.removeAllChildren(parent);
        const alertDiv: HTMLDivElement = Controls.createDiv(parent, "alert alert-danger alert-dismissible");
        alertDiv.setAttribute("role", "alert");
        const alertMessage: HTMLDivElement = Controls.createDiv(alertDiv, "", msg);
        const alertButton: HTMLButtonElement = Controls.createButton(alertDiv, "button", "close-alert-id", "", "btn-close");
        alertButton.setAttribute("data-bs-dismiss", "alert");
        alertButton.setAttribute("aria-label", "Close");
        return alertDiv;
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
    public static createAnchor(parent: HTMLElement, href: string, txt: string, classname?: string, active?: boolean): HTMLAnchorElement {
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
    public static createParagraph(parent: HTMLElement, classname?: string, txt?: string): HTMLParagraphElement {
        return Controls.createElement(parent, "p", classname, txt) as HTMLParagraphElement;
    }

    /**
     * Removes all child elements from the specified parent element.
     * This is useful for clearing the contents of an element before adding new content.
     * 
     * @param parent parent element whose children will be removed
     */
    public static removeAllChildren(parent: HTMLElement): void {
        const node: HTMLElement = parent;
        while (node.lastChild) {
            node.removeChild(node.lastChild);
        }
    }
}