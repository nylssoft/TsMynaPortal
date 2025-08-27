import { BirthdayTab } from "../tabs/BirthdayTab";
import { ContactTab } from "../tabs/ContactTab";
import { DiaryTab } from "../tabs/DiaryTab";
import { NoteTab } from "../tabs/NoteTab";
import { PasswordTab } from "../tabs/PasswordTab";
import { TabRenderer } from "../tabs/Tab";
import { DesktopTab } from "../TypeDefinitions";

export class Desktop {
    // welcome message closed
    welcomeClosed: boolean = false;
    // selected tab in desktop page
    tab: DesktopTab = "BIRTHDAYS";
    // tab renderer
    readonly tabRenderer: TabRenderer = new TabRenderer();

    constructor() {
        this.tabRenderer.registerTab(new BirthdayTab());
        this.tabRenderer.registerTab(new ContactTab());
        this.tabRenderer.registerTab(new NoteTab());
        this.tabRenderer.registerTab(new PasswordTab());
        this.tabRenderer.registerTab(new DiaryTab());
    }
}