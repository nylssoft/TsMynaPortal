import { SettingsTabType } from "../TypeDefinitions";

export class Settings {
    // flag whether PIN setting has changed
    pinChanged: boolean = false;
    // flag whether password has changed
    passwordChanged: boolean = false;
    // flag whether two factor authentication setting has changed
    twoFactorChanged: boolean = false;
    // selected tab type in desktop page
    tabType: SettingsTabType | null = null;
    // applications on desktop
    desktopApplications: string[] | null = null;

    getDesktopApplications(): string[] | null {
        if (this.desktopApplications == null) {
            const apps: string | null = window.localStorage.getItem("desktop-applications");
            if (apps != null) {
                this.desktopApplications = JSON.parse(apps) as string[];
            }
        }
        return this.desktopApplications;
    }

    setDesktopApplications(applications: string[]) {
        this.desktopApplications = applications;
        window.localStorage.setItem("desktop-applications", JSON.stringify(applications));
    }

    getLastUsedTabType() {
        if (this.tabType == null) {
            const currentTabType: string | null = window.localStorage.getItem("settings-tab");
            if (this.isValidTabType(currentTabType)) {
                this.tabType = currentTabType;
            } else {
                this.tabType = "VIEW_SETTINGS";
            }
        }
        return this.tabType;
    }

    setLastUsedTabType(tabType: SettingsTabType) {
        this.tabType = tabType;
        window.localStorage.setItem("settings-tab", tabType);
    }

    isValidTabType(tabType: string | null): tabType is SettingsTabType {
        if (tabType != null) {
            return ["VIEW_SETTINGS", "ACCOUNT_SETTINGS"].includes(tabType);
        }
        return false;
    }
}