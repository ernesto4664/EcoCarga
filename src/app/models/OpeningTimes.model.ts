import { RegularHour } from './RegularHour.model';
import { ExceptionalPeriod } from './ExceptionalPeriod.model';

export class OpeningTimes {
    twentyfourseven: boolean;
    regular_hours: {
        weekday: number;
        period_begin: string;
        period_end: string;
    }[];
    exceptional_openings: {
        period_begin: string;
        period_end: string;
    }[];
    exceptional_closings: {
        period_begin: string;
        period_end: string;
    }[];

    constructor(data?: any) {
        this.twentyfourseven = data?.twentyfourseven || false;
        this.regular_hours = data?.regular_hours || [];
        this.exceptional_openings = data?.exceptional_openings || [];
        this.exceptional_closings = data?.exceptional_closings || [];
    }
}