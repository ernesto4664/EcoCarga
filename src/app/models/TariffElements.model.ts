import { PriceComponent } from './PriceComponent.model';  // Asegúrate de que el path es correcto

// Interface para los datos que se pasan al constructor de TariffElements
interface TariffElementsData {
    price_components: PriceComponent[];
}


export class TariffElements {
    price_components: PriceComponent[];

    constructor(data?: TariffElementsData) {
        this.price_components = data?.price_components.map((pc: PriceComponent) => new PriceComponent(pc)) || [];
    }
}