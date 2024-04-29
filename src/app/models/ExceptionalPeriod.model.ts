export class ExceptionalPeriod {
    period_begin: string;
    period_end: string;

    constructor(data?: any) {
        this.period_begin = data?.period_begin ?? '';
        this.period_end = data?.period_end ?? '';
    }
}