import { DesktopTabType } from "../TypeDefinitions";

export class Desktop {
    // welcome message closed
    welcomeClosed: boolean = false;
    // selected tab type in desktop page
    tabType: DesktopTabType | null = null;

    getLastUsedTabType() {
        if (this.tabType == null) {
            const currentTabType: string | null = window.localStorage.getItem("desktop-tab");
            if (this.isValidTabType(currentTabType)) {
                this.tabType = currentTabType;
            } else {
                this.tabType = "BIRTHDAYS";
            }
        }
        return this.tabType;
    }

    setLastUsedTabType(tabType: DesktopTabType) {
        this.tabType = tabType;
        window.localStorage.setItem("desktop-tab", tabType);
    }

    isValidTabType(tabType: string | null): tabType is DesktopTabType {
        if (tabType != null) {
            return ["BIRTHDAYS", "CONTACTS", "NOTES", "PASSWORD_MANAGER", "DIARY", "DOCUMENTS", "APPOINTMENTS"].includes(tabType);
        }
        return false;
    }
}