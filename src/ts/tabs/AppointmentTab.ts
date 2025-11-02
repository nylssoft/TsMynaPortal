import { PageContext } from "../PageContext";
import { AppointmentService } from "../services/AppointmentService";
import { AppointmentResult, DesktopTabType, UserInfoResult } from "../TypeDefinitions";
import { Controls } from "../utils/Controls";
import { DesktopTab } from "./DesktopTab";

export class AppointmentTab implements DesktopTab {
    tabType: DesktopTabType = "APPOINTMENTS";
    bootstrapIcon: string = "bi-calendar-heart";
    titleKey: string = "HEADER_APPOINTMENTS";

    async renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        try {
            const token: string = pageContext.authenticationClient.getToken()!;
            const userInfo: UserInfoResult = await pageContext.authenticationClient.getUserInfoAsync();
            const appointments: AppointmentResult[] = await AppointmentService.getAppointmentDetailsAsync(token, userInfo);
            appointments.sort((a, b) => a.definition!.description!.localeCompare(b.definition!.description!));
            const heading: HTMLHeadingElement = Controls.createHeading(parent, 4, "mt-3 mb-3", pageContext.locale.translate(this.titleKey));
            if (appointments.length > 0) {
                Controls.createSearch(heading, parent, pageContext.locale.translate("SEARCH"), pageContext.appointment.filter, (filter: string) => this.filterAppointmentList(pageContext, filter, appointments));
                const listGroup: HTMLDivElement = Controls.createDiv(parent, "list-group");
                listGroup.id = "list-group-id";
                this.filterAppointmentList(pageContext, pageContext.appointment.filter, appointments);
            }
            const iAdd: HTMLElement = Controls.createElement(heading, "i", "ms-4 bi bi-plus-circle");
            iAdd.setAttribute("role", "button");
            iAdd.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.appointment.edit = true;
                pageContext.pageType = "APPOINTMENT_DETAIL";
                await pageContext.renderAsync();
            });

        }
        catch (error: Error | unknown) {
            Controls.createAlert(alertDiv, pageContext.locale.translateError(error));
        }
    }

    private filterAppointmentList(pageContext: PageContext, filter: string, items: AppointmentResult[]) {
        pageContext.appointment.filter = filter;
        const filteredItems: AppointmentResult[] = [];
        items.forEach(item => {
            if (filter.length == 0 || item.definition!.description!.toLocaleLowerCase().includes(filter)) {
                filteredItems.push(item);
            }
        });
        const listGroup: HTMLElement = document.getElementById("list-group-id")!;
        Controls.removeAllChildren(listGroup);
        filteredItems.forEach(item => {
            const a: HTMLElement = Controls.createSpan(listGroup, "list-group-item");
            a.setAttribute("role", "button");
            Controls.createSpan(a, `bi ${this.bootstrapIcon}`);
            Controls.createSpan(a, "ms-2", item.definition!.description!);
            a.addEventListener("click", async (e: MouseEvent) => {
                e.preventDefault();
                pageContext.appointment.result = item;
                pageContext.pageType = "APPOINTMENT_DETAIL";
                await pageContext.renderAsync();
            });
        });
    }
}