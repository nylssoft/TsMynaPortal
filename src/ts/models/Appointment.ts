import { AppointmentResult } from "../TypeDefinitions";

export class Appointment {
    // filter
    filter: string = "";
    // selected appointment in appointment detail page
    result: AppointmentResult | null = null;
    // flag for edit mode
    edit: boolean = false;
    // flag whether the appointment has changed
    changed: boolean = false;
}