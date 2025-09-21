import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { PageType, Version } from "../TypeDefinitions";

/**
 * Page implementation for the About page.
 */
export class AboutPage implements Page {

    pageType: PageType = "ABOUT";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const baseUrl: string = window.location.hostname == "localhost" ? "https://www.nielsi.de" : "";
        const card: HTMLDivElement = Controls.createDiv(parent, "card p-4 shadow-sm");
        card.style.maxWidth = "400px";
        card.setAttribute("data-bs-theme", "light");
        const aboutMessage: HTMLDivElement = Controls.createDiv(card, "alert alert-success");
        Controls.createParagraph(aboutMessage, "", pageContext.locale.translate("WEBSITE_INFO"));
        Controls.createParagraph(aboutMessage, "", `${Version} ${pageContext.locale.translate("TEXT_COPYRIGHT_YEAR")} ${pageContext.locale.translate("COPYRIGHT")}`);
        const aGithub: HTMLAnchorElement = Controls.createAnchor(aboutMessage, "https://github.com/nylssoft/TsMynaPortal", "Source Code");
        aGithub.setAttribute("target", "_blank");
        aGithub.setAttribute("rel", "noopener noreferrer");
        const divLegal: HTMLDivElement = Controls.createDiv(aboutMessage, "mt-2");
        const aLegal: HTMLAnchorElement = Controls.createAnchor(divLegal, `${baseUrl}/view?page=legal`, pageContext.locale.translate("INFO_LEGAL_NOTICE"));
        aLegal.setAttribute("target", "_blank");
        Controls.createHeading(card, 5, "card-title", pageContext.locale.translate("CARD_TITLE_PERSONAL"));
        const carouselDiv: HTMLDivElement = Controls.createDiv(card, "carousel slide", undefined, "carousel-id");
        const indicatorsDiv: HTMLDivElement = Controls.createDiv(carouselDiv, "carousel-indicators");
        for (let i = 0; i < 5; i++) {
            this.createCarouselIndicator(indicatorsDiv, i, i === 0);
        }
        const carouselInner: HTMLDivElement = Controls.createDiv(carouselDiv, "carousel-inner");
        this.createCarouselItem(pageContext, carouselInner,
            `${baseUrl}/images/markdown/welcome/restaurants-preview.png`,
            "CAROUSEL_TITLE_RESTAURANTS",
            "CAROUSEL_TEXT_RESTAURANTS",
            `${baseUrl}/view?page=restaurants`, true);
        this.createCarouselItem(pageContext, carouselInner,
            `${baseUrl}/images/markdown/welcome/bildergalerie-preview.png`,
            "CAROUSEL_TITLE_IMAGE_GALLERY",
            "CAROUSEL_TEXT_IMAGE_GALLERY",
            `${baseUrl}/slideshow?shuffle=false`);
        this.createCarouselItem(pageContext, carouselInner,
            `${baseUrl}/images/markdown/welcome/concerts-preview.png`,
            "CAROUSEL_TITLE_CONCERTS",
            "CAROUSEL_TEXT_CONCERTS",
            `${baseUrl}/view?page=concerts`);
        this.createCarouselItem(pageContext, carouselInner,
            `${baseUrl}/images/markdown/welcome/bilderrahmen-preview.png`,
            "CAROUSEL_TITLE_PICTURE_FRAMES",
            "CAROUSEL_TEXT_PICTURE_FRAMES",
            `${baseUrl}/webpack/tsphotoframe`);
        this.createCarouselItem(pageContext, carouselInner,
            `${baseUrl}/images/markdown/welcome/baerbel-preview.png`,
            "CAROUSEL_TITLE_PAINTER",
            "CAROUSEL_TEXT_PAINTER",
            "https://www.baerbel-jentz.de");
        const buttonPrev: HTMLButtonElement = Controls.createButton(carouselDiv, "button", "", "carousel-control-prev");
        buttonPrev.setAttribute("data-bs-target", "#carousel-id");
        buttonPrev.setAttribute("data-bs-slide", "prev");
        Controls.createSpan(buttonPrev, "carousel-control-prev-icon");
        const buttonNext: HTMLButtonElement = Controls.createButton(carouselDiv, "button", "", "carousel-control-next");
        buttonNext.setAttribute("data-bs-target", "#carousel-id");
        buttonNext.setAttribute("data-bs-slide", "next");
        Controls.createSpan(buttonNext, "carousel-control-next-icon");
    }

    private createCarouselIndicator(parent: HTMLDivElement, index: number, active: boolean = false): HTMLButtonElement {
        const button: HTMLButtonElement = Controls.createElement(parent, "button", active ? "active" : undefined) as HTMLButtonElement;
        button.type = "button";
        button.setAttribute("data-bs-target", "#carousel-id");
        button.setAttribute("data-bs-slide-to", index.toString());
        return button;
    }

    private createCarouselItem(pageContext: PageContext, parent: HTMLDivElement, imgSrc: string, title: string, description: string, link: string, active: boolean = false): HTMLDivElement {
        const carouselItem: HTMLDivElement = Controls.createDiv(parent, "carousel-item");
        if (active) {
            carouselItem.classList.add("active");
        }
        const img: HTMLImageElement = Controls.createElement(carouselItem, "img", "d-block w-100") as HTMLImageElement;
        img.src = imgSrc;
        img.style.maxHeight = "200px";
        const caption: HTMLDivElement = Controls.createDiv(carouselItem, "carousel-caption");
        Controls.createElement(caption, "h5", undefined, pageContext.locale.translate(title));
        Controls.createElement(caption, "p", undefined, pageContext.locale.translate(description));
        carouselItem.style.cursor = "pointer";
        carouselItem.addEventListener("click", () => window.open(link, "_blank"));
        return carouselItem;
    }
}
