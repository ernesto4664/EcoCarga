// Interfaz para definir la estructura de un componente de precio
interface PriceComponentData {
    order_number: number;
    tariff_dimension: string;
    price: number;
    step_size: number;
}

export class PriceComponent {
    order_number: number;
    tariff_dimension: string;
    price: number;
    step_size: number;

    constructor(data?: any) {
        // Inicialización de propiedades con valores predeterminados o basados en 'data'
        this.order_number = data?.order_number ?? 0;
        this.tariff_dimension = data?.tariff_dimension ?? '';
        this.price = data?.price ?? 0.0;
        this.step_size = data?.step_size ?? 0;
    }
}