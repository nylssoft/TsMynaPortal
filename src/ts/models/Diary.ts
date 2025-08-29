import { MonthAndYear } from "../TypeDefinitions";

export class Diary {

    // month and year shown
    readonly monthAndYear: MonthAndYear;
    // selected day in diary details page
    day: number | null = null;
    // flag whether the diary entry has been changed but not saved
    changed: boolean = false;
    // edit mode
    edit: boolean = false;

    constructor() {
        const now: Date = new Date(Date.now());
        this.monthAndYear = {
            month: now.getMonth(),
            year: now.getFullYear()
        }
    }

    nextMonth() {
        this.monthAndYear.month += 1;
        if (this.monthAndYear.month >= 12) {
            this.monthAndYear.month = 0;
            this.monthAndYear.year += 1;
        }
    }

    previousMonth() {
        this.monthAndYear.month -= 1;
        if (this.monthAndYear.month < 0) {
            this.monthAndYear.year -= 1;
            this.monthAndYear.month = 11;
        }
    }

    nextDay() {
        if (this.day != null) {
            this.day += 1;
            if (this.day >= this.getDaysInMonth()) {
                this.nextMonth();
                this.day = 0;
            }
        }
    }

    previousDay() {
        if (this.day != null) {
            this.day -= 1;
            if (this.day < 0) {
                this.previousMonth();
                this.day = this.getDaysInMonth() - 1;
            }
        }
    }

    getDaysInMonth(): number {
        return 32 - new Date(this.monthAndYear.year, this.monthAndYear.month, 32).getDate();
    }

    getFirstDayInMonth(): number {
        const date: Date = new Date(this.monthAndYear.year, this.monthAndYear.month);
        return (date.getDay() + 6) % 7;
    }

    isToday(now: Date, day: number): boolean {
        return day == now.getDate() && this.monthAndYear.year == now.getFullYear() && this.monthAndYear.month == now.getMonth();
    }

    getDate(): Date {
        return new Date(Date.UTC(this.monthAndYear.year, this.monthAndYear.month, this.day != null ? this.day : 1));
    }
}