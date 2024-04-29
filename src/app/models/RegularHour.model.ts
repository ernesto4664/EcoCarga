export class RegularHour {
    weekday: number;
    period_begin: string;
    period_end: string;

    constructor(data?: any) {
        this.weekday = data?.weekday ?? 0;  // Asumiendo que '0' podría ser un valor por defecto no válido que señala un error o desconocimiento
        this.period_begin = data?.period_begin ?? '';
        this.period_end = data?.period_end ?? '';
    }
}