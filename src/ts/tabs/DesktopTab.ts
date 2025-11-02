import { PageContext } from "../PageContext";
import { DesktopTabType } from "../TypeDefinitions";

export interface DesktopTab {
    tabType: DesktopTabType;
    bootstrapIcon: string;

    renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void>;
}