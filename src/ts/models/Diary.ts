import { MonthAndYear } from "../TypeDefinitions";

export class Diary {

    // month and year shown
    private monthAndYear: MonthAndYear;
    // selected day in diary details page
    private day: number | null = null;
    // flag whether the diary entry has been changed but not saved
    private changed: boolean = false;
    // ID of the HTML element that triggered the confirmation dialog
    private confirmationTargetId: string = "";

    constructor() {
        const now: Date = new Date(Date.now());
        this.monthAndYear = {
            month: now.getMonth(),
            year: now.getFullYear()
        }
    }

    public isChanged(): boolean {
        return this.changed;
    }

    public setChanged(changed: boolean) {
        this.changed = changed;
    }

    public setConfirmationTargetid(targetId: string) {
        this.confirmationTargetId = targetId;
    }

    public getConfirmationTargetId(): string {
        return this.confirmationTargetId;
    }

    public getMonthAndYear(): MonthAndYear {
        return this.monthAndYear;
    }

    public getDay(): number | null {
        return this.day;
    }

    public setDay(day: number | null) {
        this.day = day;
    }

    public nextMonth() {
        this.monthAndYear.month += 1;
        if (this.monthAndYear.month >= 12) {
            this.monthAndYear.month = 0;
            this.monthAndYear.year += 1;
        }
    }

    public previousMonth() {
        this.monthAndYear.month -= 1;
        if (this.monthAndYear.month < 0) {
            this.monthAndYear.year -= 1;
            this.monthAndYear.month = 11;
        }
    }

    public nextDay() {
        if (this.day != null) {
            this.day += 1;
            if (this.day >= this.getDaysInMonth()) {
                this.nextMonth();
                this.day = 0;
            }
        }
    }

    public previousDay() {
        if (this.day != null) {
            this.day -= 1;
            if (this.day < 0) {
                this.previousMonth();
                this.day = this.getDaysInMonth() - 1;
            }
        }
    }

    public getDaysInMonth(): number {
        return 32 - new Date(this.monthAndYear.year, this.monthAndYear.month, 32).getDate();
    }

    public getFirstDayInMonth(): number {
        const date: Date = new Date(this.monthAndYear.year, this.monthAndYear.month);
        return (date.getDay() + 6) % 7;
    }

    public isToday(now: Date, day: number): boolean {
        return day == now.getDate() && this.monthAndYear.year == now.getFullYear() && this.monthAndYear.month == now.getMonth();
    }

    public getDate(): Date {
        return new Date(Date.UTC(this.monthAndYear.year, this.monthAndYear.month, this.day != null ? this.day : 1));
    }
}