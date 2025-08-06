export class Controls {

    static createElement(parent: HTMLElement, name: string, classid?: string, txt?: string): HTMLElement {
        const e: HTMLElement = document.createElement(name);
        if (classid) {
            e.setAttribute("class", classid);
        }
        parent.appendChild(e);
        if (txt) {
            e.textContent = txt;
        }
        return e;
    }

    static createDiv(parent: HTMLElement, classname?: string, txt?: string): HTMLDivElement {
        return Controls.createElement(parent, "div", classname, txt) as HTMLDivElement;
    }

    static createForm(parent: HTMLElement, classname?: string): HTMLFormElement {
        return Controls.createElement(parent, "form", classname) as HTMLFormElement;
    }

    static createLabel(parent: HTMLElement, forid: string, classname?: string, txt?: string): HTMLLabelElement {
        const label: HTMLLabelElement = Controls.createElement(parent, "label", classname) as HTMLLabelElement;
        label.setAttribute("for", forid);
        if (txt) {
            label.textContent = txt;
        }
        return label;
    }

    static createInput(parent: HTMLElement, type: string, id: string, classname?: string, value?: string): HTMLInputElement {
        const input: HTMLInputElement = Controls.createElement(parent, "input", classname) as HTMLInputElement;
        input.type = type;
        input.id = id;
        if (value) {
            input.value = value;
        }
        return input;
    }

    static createHeading(parent: HTMLElement, level: number, classname?: string, txt?: string): HTMLHeadingElement {
        const h: HTMLHeadingElement = Controls.createElement(parent, `h${level}`, classname) as HTMLHeadingElement;
        if (txt) {
            h.textContent = txt;
        }
        return h;
    }

    static createButton(parent: HTMLElement, type: string, id: string, txt: string, classname?: string): HTMLButtonElement {
        const b: HTMLButtonElement = Controls.createElement(parent, "button", classname) as HTMLButtonElement;
        b.setAttribute("type", type);
        b.id = id;
        b.title = txt;
        b.textContent = txt;
        return b;
    }

    static createSpan(parent: HTMLElement, classname?: string, txt?: string): HTMLSpanElement {
        const span: HTMLSpanElement = Controls.createElement(parent, "span", classname, txt) as HTMLSpanElement;
        return span;
    }

    static createAlert(parent: HTMLElement, msg: string): HTMLDivElement {
        Controls.removeAllChildren(parent);
        const alertDiv: HTMLDivElement = Controls.createDiv(parent, "alert alert-danger alert-dismissible");
        alertDiv.setAttribute("role", "alert");
        const alertMessage: HTMLDivElement = Controls.createDiv(alertDiv, "", msg);
        const alertButton: HTMLButtonElement = Controls.createButton(alertDiv, "button", "close-alert-id", "", "btn-close");
        alertButton.setAttribute("data-bs-dismiss", "alert");
        alertButton.setAttribute("aria-label", "Close");
        return alertDiv;
    }

    static removeAllChildren(parent: HTMLElement): void {
        const node: HTMLElement = parent;
        while (node.lastChild) {
            node.removeChild(node.lastChild);
        }
    }
}