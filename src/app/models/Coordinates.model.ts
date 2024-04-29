export class Coordinates {
    latitude: string;
    longitude: string;

    constructor(data?: any) {
        this.latitude = data?.latitude || '';
        this.longitude = data?.longitude || '';
    }
  }
  