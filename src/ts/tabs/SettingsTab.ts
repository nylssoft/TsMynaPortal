import { PageContext } from "../PageContext";
import { SettingsTabType } from "../TypeDefinitions";

export interface SettingsTab {
    tabType: SettingsTabType;
    bootstrapIcon: string;
    requiresAuthentication: boolean;

    renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void>;
}