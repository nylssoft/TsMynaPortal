import { Controls } from "../utils/Controls";
import { PageContext, Page } from "../PageContext";
import { PageType } from "../TypeDefinitions";

export class GamesPage implements Page {

    pageType: PageType = "GAMES";

    async renderAsync(parent: HTMLElement, pageContext: PageContext): Promise<void> {
        const row: HTMLDivElement = Controls.createDiv(parent, "row");
        const col1: HTMLDivElement = Controls.createDiv(row, "col-6 col-sm-4 col-lg-2");
        this.createGamesCard(col1, pageContext, "/images/markdown/welcome/arkanoid.png", "GAMES_ARKANOID", "/arkanoid?nomenu=true");
        const col2: HTMLDivElement = Controls.createDiv(row, "col-6 col-sm-4 col-lg-2");
        this.createGamesCard(col2, pageContext, "/images/markdown/welcome/backgammon.png", "GAMES_BACKGAMMON", "/backgammon?nomenu=true");
        const col3: HTMLDivElement = Controls.createDiv(row, "col-6 col-sm-4 col-lg-2");
        this.createGamesCard(col3, pageContext, "/images/markdown/welcome/chess.png", "GAMES_CHESS", "/chess?nomenu=true");
        const col4: HTMLDivElement = Controls.createDiv(row, "col-6 col-sm-4 col-lg-2");
        this.createGamesCard(col4, pageContext, "/images/markdown/welcome/skat.png", "GAMES_SKAT", "/skat?nomenu=true");
        const col5: HTMLDivElement = Controls.createDiv(row, "col-6 col-sm-4 col-lg-2");
        this.createGamesCard(col5, pageContext, "/images/markdown/welcome/tetris-arcade.png", "GAMES_TETRIS_ARCADE", "/webpack/tstetris");
        const col6: HTMLDivElement = Controls.createDiv(row, "col-6 col-sm-4 col-lg-2");
        this.createGamesCard(col6, pageContext, "/images/markdown/welcome/tetris-classic.png", "GAMES_TETRIS_CLASSIC", "/tetris?nomenu=true");
    }

    private createGamesCard(parent: HTMLDivElement, pageContext: PageContext, image: string, cardTitle: string, btnUrl: string) {
        cardTitle = pageContext.locale.translate(cardTitle);
        const card: HTMLDivElement = Controls.createDiv(parent, "card mt-2 mb-2");
        const img: HTMLImageElement = Controls.createElement(card, "img", "card-img-top") as HTMLImageElement;
        img.src = image;
        img.alt = cardTitle;
        img.title = cardTitle;
        img.setAttribute("role", "button");
        img.addEventListener("click", () => window.location.href = btnUrl);
        const body: HTMLDivElement = Controls.createDiv(card, "card-body");
        Controls.createParagraph(body, "card-title", cardTitle);
    }
}
