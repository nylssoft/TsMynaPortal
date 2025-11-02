import { PageContext } from "../PageContext";
import { DesktopTabType } from "../TypeDefinitions";

export interface DesktopTab {
    tabType: DesktopTabType;
    bootstrapIcon: string;
    titleKey: string;

    renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void>;
}