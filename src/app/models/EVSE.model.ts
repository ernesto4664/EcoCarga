import { Connector } from './Connector.model';
import { Coordinates } from './Coordinates.model';

export class EVSE {
    uid: number;
    evse_id: string;
    order_number: number;
    capabilities: string[];
    last_updated: string;
    status: string;
    floor_level: string;
    coordinates: Coordinates;
    physical_reference: string;
    permite_carga_simultanea: boolean;
    max_electric_power: number;
    model: string;
    brand: string;
    images: any[];
    connectors: Connector[];

    constructor(data?: any) {
        this.uid = data?.uid ?? 0;
        this.evse_id = data?.evse_id ?? '';
        this.order_number = data?.order_number ?? 0;
        this.capabilities = data?.capabilities ?? [];
        this.last_updated = data?.last_updated ?? '';
        this.status = data?.status ?? '';
        this.floor_level = data?.floor_level ?? '';
        this.coordinates = data?.coordinates ? new Coordinates(data.coordinates) : new Coordinates();
        this.physical_reference = data?.physical_reference ?? '';
        this.permite_carga_simultanea = data?.permite_carga_simultanea ?? false;
        this.max_electric_power = data?.max_electric_power ?? 0;
        this.model = data?.model ?? '';
        this.brand = data?.brand ?? '';
        this.images = data?.images ?? [];
        this.connectors = data?.connectors ? data.connectors.map((connector: any) => new Connector(connector)) : [];
    }
}