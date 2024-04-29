import { TariffElements } from './TariffElements.model';  // Asegúrate de que el path es correcto

export class Tariff {
    id: number;
    tariff_id: number;
    order_number: number;
    last_updated: string;
    tariff_alt_url: string;
    min_price: number;
    max_price: number;
    elements: TariffElements;

    constructor(data?: any) {
        this.id = data?.id ?? 0;
        this.tariff_id = data?.tariff_id ?? 0;
        this.order_number = data?.order_number ?? 0;
        this.last_updated = data?.last_updated ?? '';
        this.tariff_alt_url = data?.tariff_alt_url ?? '';
        this.min_price = data?.min_price ?? 0;
        this.max_price = data?.max_price ?? 0;
        this.elements = new TariffElements(data?.elements);
    }
}