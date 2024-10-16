import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';

declare var google: any;

@Component({
  selector: 'app-station-details',
  templateUrl: './station-details.page.html',
  styleUrls: ['./station-details.page.scss'],
})
export class StationDetailsPage implements OnInit {
  station: any;
  selectedConnectors: any[] = [];
  externalMapUrl: string = '';
  map: any;
  directionsService: any;
  directionsRenderer: any;
  iconPath: string = 'assets/icon/';
  batteryCapacity: number = 0;
  availableConnectors: any[] = [];
  chargingConnectors: any[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe(() => {
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state) {
        this.station = navigation.extras.state['station'];
        this.selectedConnectors = navigation.extras.state['selectedConnectors'] || [];
        this.batteryCapacity = navigation.extras.state['batteryCapacity'] || 0;
      }
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
  }

  ngAfterViewInit() {
    this.observeMapVisibility();
  }

  ngOnInit() {
    this.loadMap();
    this.setMapUrl();
  }

  observeMapVisibility() {
    const element = document.getElementById('map');
    if (element) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadMap();
            observer.unobserve(element);
          }
        });
      });
      observer.observe(element);
    }
  }

  async loadMap() {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps no está cargado correctamente');
      return;
    }

    if (this.station?.coordinates) {
      const mapElement = document.getElementById('map');
      if (mapElement) {
        try {
          const userPosition = await Geolocation.getCurrentPosition();
          const userLatitude = userPosition.coords.latitude;
          const userLongitude = userPosition.coords.longitude;

          const mapOptions = {
            center: new google.maps.LatLng(userLatitude, userLongitude),
            zoom: 15,
          };

          this.map = new google.maps.Map(mapElement, mapOptions);
          this.directionsRenderer.setMap(this.map);

          const request = {
            origin: new google.maps.LatLng(userLatitude, userLongitude),
            destination: new google.maps.LatLng(
              parseFloat(this.station.coordinates.latitude),
              parseFloat(this.station.coordinates.longitude)
            ),
            travelMode: google.maps.TravelMode.DRIVING,
          };

          this.directionsService.route(request, (result: any, status: any) => {
            if (status === google.maps.DirectionsStatus.OK) {
              this.directionsRenderer.setDirections(result);
            } else {
              console.error('Error al obtener direcciones', status);
            }
          });

          new google.maps.Marker({
            position: {
              lat: parseFloat(this.station.coordinates.latitude),
              lng: parseFloat(this.station.coordinates.longitude),
            },
            map: this.map,
            title: this.station.name,
          });
        } catch (error) {
          console.error('Error al obtener la ubicación del usuario:', error);
        }
      }
    }
  }

  async setMapUrl() {
    if (this.station && this.station.coordinates) {
      const { latitude, longitude } = this.station.coordinates;
      const userPosition = await Geolocation.getCurrentPosition();
      const userLatitude = userPosition.coords.latitude;
      const userLongitude = userPosition.coords.longitude;

      this.externalMapUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLatitude},${userLongitude}&destination=${latitude},${longitude}&travelmode=driving`;
    }
  }

  calculateChargingTime(maxPower: number): string {
    if (!this.batteryCapacity || maxPower <= 0) {
      return 'No disponible';
    }
  
    const totalHours = this.batteryCapacity / maxPower; // Tiempo total en horas (decimal)
    const hours = Math.floor(totalHours); // Parte entera de las horas
    const minutes = Math.round((totalHours - hours) * 60); // Parte decimal convertida a minutos
  
    let result = '';
  
    if (hours > 0) {
      result += `${hours} hrs`;
    }
  
    if (minutes > 0) {
      result += `${hours > 0 ? ' y ' : ''}${minutes} min`; // Añadir 'y' solo si hay horas
    }
  
    return result || 'Menos de un minuto';
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'DISPONIBLE':
        return 'Disponibles';
      case 'OCUPADO':
        return 'Cargando';
      case 'INOPERATIVO':
      case 'BLOQUEADO':
      case 'REMOVED':
      case 'FUERA DE LINEA':
      case 'NO DISPONIBLE':
        return 'No disponibles';
      default:
        return 'Desconocido';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'DISPONIBLE':
        return '#279769';
      case 'OCUPADO':
        return '#f53d3d';
      case 'INOPERATIVO':
      case 'BLOQUEADO':
      case 'REMOVIDO':
      case 'FUERA DE LINEA':
      case 'NO DISPONIBLE':
        return 'red';
      default:
        return 'gray';
    }
  }

  getConnectorStatus() {
    const connectorsInStation = this.station.evses.map((evse: any) => evse.connectors).flat();
    const filteredConnectors = connectorsInStation.filter((connector: any) =>
      this.selectedConnectors.some(selected => selected.standard === connector.standard && selected.power_type === connector.power_type)
    );

    const statusCounts = filteredConnectors.reduce((acc: any, connector: any) => {
      acc[connector.status] = (acc[connector.status] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(statusCounts).map(status => ({
      label: this.getStatusLabel(status),
      count: statusCounts[status],
      color: this.getStatusColor(status)
    }));
  }

  getDetailedConnectors() {
    return this.station.evses.map((evse: any) => ({
      ...evse,
      connectors: evse.connectors.filter((connector: any) =>
        this.selectedConnectors.some(selected => selected.standard === connector.standard && selected.power_type === connector.power_type)
      )
    })).filter((evse: any) => evse.connectors.length > 0);
  }

  getTotalUnavailableConnectors(): number {
    if (!this.station || !this.station.evses) {
      return 0;
    }
    return this.station.evses
      .map((evse: { connectors: { filter: (arg0: (connector: any) => boolean) => { (): any; new(): any; length: any; }; }; }) => evse.connectors.filter(connector => connector.status === 'NO DISPONIBLE').length)
      .reduce((a: any, b: any) => a + b, 0);
  }

  getIconPath(connector: any): string {
    if (!connector.power_type) {
      connector.power_type = this.getPowerTypeByStandard(connector.standard);
    }

    const iconMap: { [key: string]: string } = {
      'GB/T AC (CABLE - AC)': 'GBT_AC.png',
      'GB/T AC (SOCKET - AC)': 'GBT_AC.png',
      'Tipo 1 (CABLE - AC)': 'Tipo1AC.png',
      'Tipo 1 (SOCKET - AC)': 'Tipo1AC.png',
      'Tipo 2 (SOCKET - AC)': 'Tipo2AC.png',
      'Tipo 2 (CABLE - AC)': 'Tipo2AC.png',
      'CCS 2 (CABLE - DC)': 'combinadotipo2.png',
      'CHAdeMO (CABLE - DC)': 'CHADEMO.png',
      'CCS 1 (CABLE - DC)': 'Tipo1DC.png',
      'GB/T DC (CABLE - DC)': 'GBT_DC.png',
      'GB/T DC (SOCKET - DC)': 'GBT_DC.png',
    };

    const key = `${connector.standard} (${connector.format} - ${connector.power_type})`;
    return this.iconPath + (iconMap[key] || 'default.jpeg');
  }

  getPowerTypeByStandard(standard: string): string {
    const acStandards = ['Tipo 2', 'Tipo 1', 'GB/T AC'];
    const dcStandards = ['CCS 2', 'CCS 1', 'CHAdeMO', 'GB/T DC'];

    if (acStandards.includes(standard)) {
      return 'AC';
    }
    if (dcStandards.includes(standard)) {
      return 'DC';
    }
    return 'Desconocido';
  }

  getCurrentType(powerType: string): string {
    return powerType.startsWith('AC') ? 'AC' : powerType.startsWith('DC') ? 'DC' : powerType;
  }

  getPaymentIcon(capability: string): string {
    const paymentIcons: { [key: string]: string } = {
      'EFECTIVO': 'assets/icon/cash.png',
      'DEBITO': 'assets/icon/debit-card.png',
      'CREDITO': 'assets/icon/debit-card.png',
      'APP': 'assets/icon/app.png',
      'PORTAL': 'assets/icon/portal.png',
      'SUSCRIPCION': 'assets/icon/subscription.png',
    };
    return paymentIcons[capability] || 'assets/icon/default.png';
  }

  getActivationIcon(capability: string): string {
    const activationIcons: { [key: string]: string } = {
      'APP': 'assets/icon/app.png',
      'RFID': 'assets/icon/rfdi.png',
      'QR': 'assets/icon/qr-code.png',
      'PORTAL': 'assets/icon/portal.png',
    };
    return activationIcons[capability] || 'assets/icon/default.png';
  }

  getTariffDescription(tariff: any): string {
    switch (tariff.tariff_dimension) {
      case 'TIEMPO':
        return `Este conector cobrará ${tariff.price} pesos por minuto.`;
      case 'ENERGIA':
        return `Este conector cobrará ${tariff.price} pesos por kWh.`;
      case 'CARGO FIJO':
        return `Este conector tiene una tarifa fija de ${tariff.price} pesos.`;
      default:
        return 'Tarifa desconocida';
    }
  }

  getOpeningHours(station: any): string {
    if (station.opening_times.twentyfourseven) {
      return 'Abierto 24/7';
    }

    const regularHours = station.opening_times.regular_hours;
    if (regularHours.length > 0) {
      const weekdays = regularHours.filter((hour: { weekday: number }) => hour.weekday >= 1 && hour.weekday <= 5);
      const weekend = regularHours.filter((hour: { weekday: number }) => hour.weekday === 6 || hour.weekday === 7);

      let result = '';

      if (weekdays.length > 0) {
        const firstWeekday = weekdays[0];
        const lastWeekday = weekdays[weekdays.length - 1];
        result += `De ${this.getDayName(firstWeekday.weekday)} ${firstWeekday.period_begin} a ${this.getDayName(lastWeekday.weekday)} ${lastWeekday.period_end}`;
      }

      if (weekend.length > 0) {
        const firstWeekend = weekend[0];
        const lastWeekend = weekend[weekend.length - 1];
        result += `\nSábado ${firstWeekend.period_begin} a Domingo ${lastWeekend.period_end}`;
      }

      return result;
    }

    return 'No disponible';
  }

  getDayName(weekday: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[weekday - 1];
  }

  getTotalAvailableConnectors(): number {
    if (!this.station || !this.station.evses) {
      return 0;
    }
    return this.station.evses
      .map((evse: { connectors: { filter: (arg0: (connector: any) => boolean) => { (): any; new(): any; length: any; }; }; }) => evse.connectors.filter(connector => connector.status === 'DISPONIBLE').length)
      .reduce((a: any, b: any) => a + b, 0);
  }
  
  getTotalChargingConnectors(): number {
    if (!this.station || !this.station.evses) {
      return 0;
    }
    return this.station.evses
      .map((evse: { connectors: { filter: (arg0: (connector: any) => boolean) => { (): any; new(): any; length: any; }; }; }) => evse.connectors.filter(connector => connector.status === 'OCUPADO').length)
      .reduce((a: any, b: any) => a + b, 0);
  }
}
