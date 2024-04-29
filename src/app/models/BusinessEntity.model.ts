export class BusinessEntity {
    name: string = '';
    website: string = '';
    RUT: string = '';
    phone: string = '';
    address: string = '';
    commune: string = '';
    region: string = '';

    constructor(data?: any) {
        if (data) {
            this.name = data.name || '';
            this.website = data.website || '';
            this.RUT = data.RUT || '';
            this.phone = data.phone || '';
            this.address = data.address || '';
            this.commune = data.commune || '';
            this.region = data.region || '';
        }
    }
}