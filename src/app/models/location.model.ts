import { EVSE } from './EVSE.model';
import { Coordinates } from './Coordinates.model';
import { OpeningTimes } from './OpeningTimes.model';
import { Company } from './Company.model';

export class Location {
    id: number = 0; // Valor por defecto
    name: string = ''; // Valor por defecto
    address: string = '';
    commune: string = '';
    region: string = '';
    coordinates?: Coordinates; // Hacer opcional si puede no estar presente
    evses: EVSE[] = [];
    parking_type: string = '';
    time_zone: string = '';
    last_updated?: Date; // Hacer opcional si puede no estar presente
    opening_times?: OpeningTimes;
    charging_when_closed: boolean = false;
    images: any[] = [];
    facilities: string[] = [];
    folio_IRVE: number = 0;
    datos_IRVE_confirmados: boolean = false;
    revision_date?: Date; // Hacer opcional si puede no estar presente
    support_phone_number: string = '';
    directions: string = '';
    charging_instalation_type: string = '';
    owner?: Company;
    OPC?: Company;
    ESMPs: Company[] = [];

    constructor(data?: any) { // Un constructor opcional para inicializar la clase con datos
        if (data) {
            this.id = data.id;
            this.name = data.name;
            this.address = data.address;
            this.commune = data.commune;
            this.region = data.region;
            this.coordinates = data.coordinates ? new Coordinates(data.coordinates) : undefined; // Asignación condicional
            this.evses = data.evses.map((evse: any) => new EVSE(evse));
            this.parking_type = data.parking_type;
            this.time_zone = data.time_zone;
            this.last_updated = data.last_updated ? new Date(data.last_updated) : undefined; // Asignación condicional
            this.opening_times = data.opening_times ? new OpeningTimes(data.opening_times) : undefined;
            this.charging_when_closed = data.charging_when_closed;
            this.images = data.images || [];
            this.facilities = data.facilities || [];
            this.folio_IRVE = data.folio_IRVE;
            this.datos_IRVE_confirmados = data.datos_IRVE_confirmados;
            this.revision_date = data.revision_date ? new Date(data.revision_date) : undefined; // Asignación condicional
            this.support_phone_number = data.support_phone_number;
            this.directions = data.directions;
            this.charging_instalation_type = data.charging_instalation_type;
            this.owner = data.owner ? new Company(data.owner) : undefined;
            this.OPC = data.OPC ? new Company(data.OPC) : undefined;
            this.ESMPs = data.ESMPs ? data.ESMPs.map((esmp: any) => new Company(esmp)) : [];
        }
    }
}