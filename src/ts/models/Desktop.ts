import { DesktopTab } from "../TypeDefinitions";

export class Desktop {
    // welcome message closed
    welcomeClosed: boolean = false;
    // selected tab in desktop page
    tab: DesktopTab | null = null;

    getLastUsedDesktopTab() {
        if (this.tab == null) {
            const currentTab: DesktopTab = window.localStorage.getItem("desktop-tab") as DesktopTab;
            if (["BIRTHDAYS", "CONTACTS", "NOTES", "PASSWORD_MANAGER", "DIARY", "DOCUMENTS", "APPOINTMENTS"].includes(currentTab)) {
                this.tab = currentTab;
            } else {
                this.tab = "BIRTHDAYS";
            }
        }
        return this.tab;
    }

    setLastUsedDestopTab(tab: DesktopTab) {
        this.tab = tab;
        window.localStorage.setItem("desktop-tab", tab);
    }
}