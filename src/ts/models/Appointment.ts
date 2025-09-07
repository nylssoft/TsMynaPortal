import { AppointmentResult, MonthAndYear } from "../TypeDefinitions";

export class Appointment {
    // filter
    filter: string = "";
    // selected appointment in appointment detail page
    result: AppointmentResult | null = null;
    // flag for edit mode
    edit: boolean = false;
    // flag whether the appointment has changed
    changed: boolean = false;
    // current visible month and year in calendar
    monthAndYear: MonthAndYear | null = null;

    nextMonth() {
        if (this.monthAndYear != null) {
            this.monthAndYear.month += 1;
            if (this.monthAndYear.month > 12) {
                this.monthAndYear.month = 1;
                this.monthAndYear.year += 1;
            }
        }
    }

    previousMonth() {
        if (this.monthAndYear != null) {
            this.monthAndYear.month -= 1;
            if (this.monthAndYear.month < 1) {
                this.monthAndYear.year -= 1;
                this.monthAndYear.month = 12;
            }
        }
    }

}