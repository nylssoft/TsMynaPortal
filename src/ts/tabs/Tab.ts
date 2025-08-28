import { PageContext } from "../PageContext";
import { DesktopTab } from "../TypeDefinitions";

export interface Tab {
    desktopTab: DesktopTab;
    href: string;
    bootstrapIcon: string;

    renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void>;
}