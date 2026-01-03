import { AppointmentBestVote, AppointmentOption, AppointmentResult, MonthAndYear } from "../TypeDefinitions";

export class Appointment {
    // filter
    filter: string = "";
    // selected appointment in detail page or vote page
    result: AppointmentResult | null = null;
    // flag for edit mode
    edit: boolean = false;
    // flag whether the appointment has changed
    changed: boolean = false;
    // current visible month and year in calendar
    monthAndYear: MonthAndYear = { year: 0, month: 0 };
    // current options for edit or vote page
    options: AppointmentOption[] = [];
    // vote id
    vid: string | null = null;
    // vote username
    vusername: string | null = null;
    // flag whether the list with the accepted days and users will be shown
    voteShowList: boolean = false;
    // flag whether all days of the month should be displayed or only days that can be selected
    voteShowAllDays: boolean = false;

    nextMonth() {
        this.monthAndYear.month += 1;
        if (this.monthAndYear.month > 12) {
            this.monthAndYear.month = 1;
            this.monthAndYear.year += 1;
        }
    }

    previousMonth() {
        this.monthAndYear.month -= 1;
        if (this.monthAndYear.month < 1) {
            this.monthAndYear.year -= 1;
            this.monthAndYear.month = 12;
        }
    }

    getOptionDays(): number[] {
        const ret: number[] = [];
        this.options.forEach(opt => {
            if (opt.year == this.monthAndYear!.year && opt.month == this.monthAndYear!.month) {
                ret.push(...opt.days);
            }
        });
        return ret;
    }

    getDate(): Date {
        return new Date(Date.UTC(this.monthAndYear!.year, this.monthAndYear!.month - 1, 1));
    }

    getDaysInMonth(): number {
        return 32 - new Date(this.monthAndYear.year, this.monthAndYear.month - 1, 32).getDate();
    }

    getFirstDayInMonth(): number {
        const date: Date = new Date(this.monthAndYear.year, this.monthAndYear.month - 1);
        return (date.getDay() + 6) % 7;
    }

    isBeforeToday(now: Date, day: number): boolean {
        return day < now.getDate() && this.monthAndYear.year == now.getFullYear() && this.monthAndYear.month == now.getMonth() + 1 ||
            this.monthAndYear.year < now.getFullYear() ||
            this.monthAndYear.year == now.getFullYear() && this.monthAndYear.month < now.getMonth() + 1;
    }

    getMinMonthAndYear(): MonthAndYear {
        let minMonth: number = 0;
        let minYear: number | null = null;
        for (const opt of this.options) {
            if (minYear == null || opt.year < minYear) {
                minYear = opt.year;
                minMonth = opt.month;
            } else if (opt.year == minYear && opt.month < minMonth) {
                minMonth = opt.month;
            }
        }
        if (minYear == null) {
            const now: Date = new Date();
            minYear = now.getFullYear();
            minMonth = now.getMonth() + 1;
        }
        return { year: minYear, month: minMonth };
    }

    hasPreviousMonth(): boolean {
        for (const opt of this.options) {
            if (opt.year < this.monthAndYear.year || opt.year == this.monthAndYear.year && opt.month < this.monthAndYear.month) {
                return true;
            }
        }
        if (this.edit) {
            const now: Date = new Date();
            return (this.monthAndYear.year == now.getFullYear() && this.monthAndYear.month > now.getMonth() + 1);
        }
        return false;
    }

    hasNextMonth(): boolean {
        for (const opt of this.options) {
            if (opt.year > this.monthAndYear.year || opt.year == this.monthAndYear.year && opt.month > this.monthAndYear.month) {
                return true;
            }
        }
        return this.edit || false;
    }

    toggleOption(day: number) {
        for (const opt of this.options) {
            if (opt.year == this.monthAndYear.year && opt.month == this.monthAndYear.month) {
                if (opt.days.includes(day)) {
                    opt.days = opt.days.filter(d => d != day);
                } else {
                    opt.days.push(day);
                }
                opt.days.sort((a, b) => a - b);
                return;
            }
        }
        const newopt: AppointmentOption = { year: this.monthAndYear.year, month: this.monthAndYear.month, days: [day] };
        this.options.push(newopt);
    }

    getBestVotes(): AppointmentBestVote[] {
        const appointment: AppointmentResult = this.result!;
        let bestVotes: AppointmentBestVote[] = [];
        let bestCount: number = 0;
        appointment.definition!.options.forEach(option => {
            const acceptedCount: Map<number, number> = new Map<number, number>();
            appointment.votes!.forEach(v => {
                const acceptedOption: AppointmentOption | undefined = v.accepted.find(o => o.year == option.year && o.month == option.month);
                if (acceptedOption) {
                    acceptedOption.days.filter(d => option.days.includes(d)).forEach(d => {
                        let cnt: number | undefined = acceptedCount.get(d);
                        if (!cnt) {
                            cnt = 0;
                        }
                        cnt += 1;
                        acceptedCount.set(d, cnt);
                        if (cnt >= bestCount) {
                            if (cnt > bestCount) {
                                bestVotes = [];
                            }
                            const bestVote: AppointmentBestVote = { "year": option.year, "month": option.month, "day": d };
                            bestVotes.push(bestVote);
                            bestCount = cnt;
                        }
                    });
                }
            });
        });
        return bestVotes;
    }

    getCurrentOption(): AppointmentOption | undefined {
        return this.options.find(opt => opt.year == this.monthAndYear.year && opt.month == this.monthAndYear.month);
    }

    initAcceptedDays(myUserUuid: string, myAcceptedDays: Set<number>, acceptedCount: Map<number, number>) {
        const option: AppointmentOption = this.getCurrentOption()!;
        this.result!.votes!.forEach(v => {
            const acceptedOption: AppointmentOption | undefined = v.accepted.find(o => o.year == option.year && o.month == option.month);
            if (acceptedOption) {
                if (v.userUuid == myUserUuid) {
                    acceptedOption.days.forEach(d => myAcceptedDays.add(d));
                }
                acceptedOption.days.forEach(d => {
                    const cnt: number = acceptedCount.get(d) || 0;
                    acceptedCount.set(d, cnt + 1);
                });
            }
        });
    }
}