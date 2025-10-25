import { PageContext } from "../PageContext";
import { DesktopTab } from "../TypeDefinitions";

export interface Tab {
    desktopTab: DesktopTab;
    bootstrapIcon: string;

    renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void>;
}