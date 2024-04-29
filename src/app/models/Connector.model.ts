import { Tariff } from './Tariff.model';

export class Connector {
    id: number;
    connectors_id: number;
    order_number: number;
    status: string = '';
    standard: string = '';
    format: string = '';
    power_type: string = '';
    max_voltage: number;
    max_amperage: number;
    max_electric_power: number;
    last_updated: string = '';
    permite_carga_simultanea: boolean = false;
    voltage: number;
    amperage: number;
    electric_power: number;
    soc: number;
    tariffs: Tariff[] = [];

    constructor(data?: any) {
        this.id = data?.id || 0;
        this.connectors_id = data?.connectors_id || 0;
        this.order_number = data?.order_number || 0;
        this.status = data?.status || '';
        this.standard = data?.standard || '';
        this.format = data?.format || '';
        this.power_type = data?.power_type || '';
        this.max_voltage = data?.max_voltage || 0;
        this.max_amperage = data?.max_amperage || 0;
        this.max_electric_power = data?.max_electric_power || 0;
        this.last_updated = data?.last_updated || '';
        this.permite_carga_simultanea = data?.permite_carga_simultanea || false;
        this.voltage = data?.voltage || 0;
        this.amperage = data?.amperage || 0;
        this.electric_power = data?.electric_power || 0;
        this.soc = data?.soc || 0;
        this.tariffs = data?.tariffs?.map((t: any) => new Tariff(t)) || [];
    }
}