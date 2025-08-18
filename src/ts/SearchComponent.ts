import { Controls } from "./Controls";
import { PageContext } from "./PageContext";

export class SearchComponent {

    public static create(heading: HTMLHeadingElement, parent: HTMLElement, pageContext: PageContext, filter: string, renderItems: (filter: string) => void) {
        const iconFilter: HTMLElement = Controls.createElement(heading, "i", "ms-2 bi bi-search");
        iconFilter.setAttribute("style", "cursor:pointer;");
        const formElement: HTMLFormElement = Controls.createForm(parent, "align-items-center");
        if (filter.length == 0) {
            formElement.classList.add("d-none");
        }
        formElement.id = "search-form-id";
        const divFilter: HTMLDivElement = Controls.createDiv(formElement, "d-flex align-items-center mb-2");
        Controls.createLabel(divFilter, "search-id", "form-label mb-0 me-2", pageContext.getLocale().translate("SEARCH"));
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
}