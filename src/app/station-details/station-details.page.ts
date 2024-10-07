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
  batteryCapacity: number = 0; // Almacenar la capacidad de la batería seleccionada

  constructor(
    private route: ActivatedRoute, 
    private router: Router
  ) {
    this.route.queryParams.subscribe(() => {
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state) {
        this.station = navigation.extras.state['station'];
        this.selectedConnectors = navigation.extras.state['selectedConnectors'] || [];
        this.batteryCapacity = navigation.extras.state['batteryCapacity'] || 0;  // Capacidad de la batería seleccionada
        console.log('Estacion:', this.station);
        console.log('Conectores seleccionados:', this.selectedConnectors);
      }
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
  }

  ngAfterViewInit() {
    this.observeMapVisibility(); // Observamos si el mapa está visible
  }

  ngOnInit() {
    this.loadMap();
    this.setMapUrl();
  }

  observeMapVisibility() {
    const element = document.getElementById('map'); // Busca el div del mapa

    if (element) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            console.log('El mapa es visible en la vista');
            this.loadMap(); // Llamamos la carga del mapa cuando es visible
            observer.unobserve(element); // Dejamos de observar una vez cargado
          } else {
            console.log('El mapa NO es visible');
          }
        });
      });

      observer.observe(element); // Comienza a observar el mapa
    } else {
      console.error('Elemento del mapa no encontrado.');
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

          const marker = new google.maps.Marker({
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
      } else {
        console.error('Elemento del mapa no encontrado');
      }
    } else {
      console.error('No se encontraron coordenadas para la estación');
    }
  }

  async setMapUrl() {
    if (this.station && this.station.coordinates) {
      const { latitude, longitude } = this.station.coordinates;
      const userPosition = await Geolocation.getCurrentPosition();
      const userLatitude = userPosition.coords.latitude;
      const userLongitude = userPosition.coords.longitude;

      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLatitude},${userLongitude}&destination=${latitude},${longitude}&travelmode=driving`;
      this.externalMapUrl = url;
    } else {
      console.error('No se pudieron obtener las coordenadas de la estación.');
    }
  }

  // Método para calcular el tiempo de carga
  calculateChargingTime(maxPower: number): string {
    if (this.batteryCapacity && maxPower > 0) {
      const chargingTime = this.batteryCapacity / maxPower;
      return `${chargingTime.toFixed(2)} horas`; // Tiempo de carga en horas
    }
    return 'No disponible';
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
        return 'green';
      case 'OCUPADO':
        return 'orange';
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
      if (!acc[connector.status]) {
        acc[connector.status] = 0;
      }
      acc[connector.status]++;
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
    })).filter((evse: any) => evse.connectors.length > 0); // Excluir EVSEs sin conectores válidos
  }

  getIconPath(connector: any): string {
    const iconMap: { [key: string]: string } = {
      'GB/T AC (CABLE - AC)': 'GBT_AC.png',
      'Tipo 1 (CABLE - AC)': 'Tipo1AC.png',
      'Tipo 1 (SOCKET - AC)': 'Tipo1AC.png',
      'Tipo 2 (SOCKET - AC)': 'Tipo2AC.png',
      'Tipo 2 (CABLE - AC)': 'Tipo2AC.png',
      'CCS 2 (CABLE - DC)': 'combinadotipo2.png',
      'CCS 2 (SOCKET - DC)': 'combinadotipo2.png',
      'CHAdeMO (CABLE - DC)': 'CHADEMO.png',
      'CCS 1 (CABLE - DC)': 'Tipo1DC.png',
      'GB/T DC (CABLE - DC)': 'GBT_DC.png',
    };

    const key = `${connector.standard} (${connector.format} - ${connector.power_type})`;
    return this.iconPath + (iconMap[key] || 'default.jpeg');
  }

  getCurrentType(powerType: string): string {
    if (powerType.startsWith('AC')) {
      return 'AC';
    } else if (powerType.startsWith('DC')) {
      return 'DC';
    } else {
      return powerType; // Devuelve el valor original si no es AC o DC
    }
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
      'RFID': 'assets/icon/rfid.png',
      'QR': 'assets/icon/qr-code.png',
      'PORTAL': 'assets/icon/portal.png',
    };
    return activationIcons[capability] || 'assets/icon/default.png';
  }

  getTariffDescription(tariff: any): string {
    switch (tariff.tariff_dimension) {
      case 'TIEMPO':
        return `Este conector cobrará ${tariff.price} pesos por minuto.`;
      case 'ENERGÍA':
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
  
      // Mostrar los horarios de lunes a viernes
      if (weekdays.length > 0) {
        const firstWeekday = weekdays[0];
        const lastWeekday = weekdays[weekdays.length - 1];
        result += `De ${this.getDayName(firstWeekday.weekday)} ${firstWeekday.period_begin} a ${this.getDayName(lastWeekday.weekday)} ${lastWeekday.period_end}`;
      }
  
      // Separar los horarios de fin de semana en otra línea
      if (weekend.length > 0) {
        const firstWeekend = weekend[0];
        const lastWeekend = weekend[weekend.length - 1];
        result += `\nSábado ${firstWeekend.period_begin} a Domingo ${lastWeekend.period_end}`;
      }
  
      return result;
    }
  
    return 'No disponible';
  }
  
  // Método para convertir el número del día en nombre del día de la semana
  getDayName(weekday: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[weekday - 1]; // Restamos 1 porque el array empieza desde 0
  }
}
