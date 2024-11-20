import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { GoogleMapsService } from '../services/google-maps.service'; // Importar el servicio

declare var google: any;

@Component({
  selector: 'app-station-details',
  templateUrl: './station-details.page.html',
  styleUrls: ['./station-details.page.scss'],
})
export class StationDetailsPage implements OnInit, AfterViewInit {
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private googleMapsService: GoogleMapsService // Inyección del servicio
  ) {
    this.route.queryParams.subscribe(() => {
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state) {
        this.station = navigation.extras.state['station'];
        this.selectedConnectors = navigation.extras.state['selectedConnectors'] || [];
        this.batteryCapacity = navigation.extras.state['batteryCapacity'] || 0;
      }
    });
  }

  ngOnInit() {
    this.setMapUrl();
  }

  accordionValue: string | null = null; // Controla qué acordeón está abierto

  // Detener la propagación del evento y alternar el acordeón seleccionado
  stopEventAndToggleAccordion(event: Event, value: string) {
    event.stopPropagation(); // Detiene la propagación del evento

    // Alternar el valor del acordeón; si ya está abierto, lo cierra
    this.accordionValue = this.accordionValue === value ? null : value;
  }

  stopEvent(event: Event) {
    event.stopPropagation(); // Evitar que el clic se propague
  }

  ngAfterViewInit() {
    this.observeMapVisibility();
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
    await this.googleMapsService.loadGoogleMaps(); // Usar el servicio para cargar Google Maps

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
          this.directionsRenderer = new google.maps.DirectionsRenderer();
          this.directionsRenderer.setMap(this.map);
          this.directionsService = new google.maps.DirectionsService();

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
    const totalHours = this.batteryCapacity / maxPower;
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);

    let result = '';
    if (hours > 0) {
      result += `${hours} hrs`;
    }
    if (minutes > 0) {
      result += `${hours > 0 ? ' y ' : ''}${minutes} min`;
    }
    return result || 'Menos de un minuto';
  }

  getTotalAvailableConnectors(): number {
    return this.station?.evses?.reduce((total: number, evse: any) => {
      return total + evse.connectors.filter((connector: any) => connector.status === 'DISPONIBLE').length;
    }, 0) || 0;
  }

  getTotalChargingConnectors(): number {
    return this.station?.evses?.reduce((total: number, evse: any) => {
      return total + evse.connectors.filter((connector: any) => connector.status === 'OCUPADO').length;
    }, 0) || 0;
  }

  getTotalUnavailableConnectors(): number {
    return this.station?.evses?.reduce((total: number, evse: any) => {
      return total + evse.connectors.filter((connector: any) => connector.status === 'NO DISPONIBLE').length;
    }, 0) || 0;
  }

  getCurrentType(powerType: string): string {
    return powerType.startsWith('AC') ? 'AC' : powerType.startsWith('DC') ? 'DC' : powerType;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'DISPONIBLE':
        return 'Disponible';
      case 'OCUPADO':
        return 'Cargando';
      case 'INOPERATIVO':
      case 'BLOQUEADO':
      case 'REMOVED':
      case 'FUERA DE LINEA':
      case 'NO DISPONIBLE':
        return 'No disponible';
      default:
        return 'Desconocido';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'DISPONIBLE':
        return '#279769';
      case 'OCUPADO':
        return '#ffcc00';
        case 'NO DISPONIBLE':
          return '#dc3545';
      case 'INOPERATIVO':
      case 'BLOQUEADO':
      case 'REMOVED':
      case 'FUERA DE LINEA':
      default:
        return 'gray';
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
    return acStandards.includes(standard) ? 'AC' : dcStandards.includes(standard) ? 'DC' : 'Desconocido';
  }

 /* getOpeningHours(station: any): string {
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
  }*/

 /* getDayName(weekday: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[weekday - 1];
  }*/

    // Métodos para horarios de aperturas y cierres
    getOpeningHours(station: any): string {
      const regularHours = station.opening_times.regular_hours;
    
      if (station.opening_times.twentyfourseven) {
        return 'Abierto 24/7';
      }
    
      if (regularHours.length === 0) {
        return 'No disponible';
      }
    
      let result = '';
      let weekdayRanges: { start: number; end: number; period_begin: string; period_end: string }[] = [];
    
      // Asegurarse de que todos los días de la semana se cubran, incluso los que no están en el arreglo regularHours
      const diasCubiertos = new Set(regularHours.map((h: { weekday: any; }) => h.weekday));
    
      // Agregar días faltantes como "Cerrado"
      for (let i = 1; i <= 7; i++) {
        if (!diasCubiertos.has(i)) {
          regularHours.push({
            weekday: i,
            period_begin: 'Cerrado',
            period_end: 'Cerrado'
          });
        }
      }
    
      // Agrupar días consecutivos con el mismo horario
      for (let i = 0; i < regularHours.length; i++) {
        const currentDay = regularHours[i];
        const lastRange = weekdayRanges[weekdayRanges.length - 1];
    
        if (
          lastRange &&
          lastRange.period_begin === currentDay.period_begin &&
          lastRange.period_end === currentDay.period_end &&
          lastRange.end === currentDay.weekday - 1
        ) {
          // Extender el rango de días si tienen el mismo horario
          lastRange.end = currentDay.weekday;
        } else {
          // Agregar un nuevo rango de días
          weekdayRanges.push({
            start: currentDay.weekday,
            end: currentDay.weekday,
            period_begin: currentDay.period_begin,
            period_end: currentDay.period_end,
          });
        }
      }
    
      // Formatear el resultado
      weekdayRanges.forEach((range, index) => {
        const dayStart = this.getDayName(range.start);
        const dayEnd = this.getDayName(range.end);
        const hours = range.period_begin === 'Cerrado' ? 'Cerrado' : `${range.period_begin} a ${range.period_end}`;
    
        if (dayStart === dayEnd) {
          result += `${dayStart}: ${hours}`;
        } else {
          result += `De ${dayStart} ${range.period_begin} a ${dayEnd} ${range.period_end}`;
        }
    
        if (index < weekdayRanges.length - 1) {
          result += '<br>'; // Agregar salto de línea HTML
        }
      });
    
      return result;
    }
    
    getDayName(weekday: number): string {
      const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      return days[weekday - 1]; // Ajustar el índice para que el día 1 sea Lunes
    }
  
    getExceptionalOpenings(station: any): string {
      return station.opening_times.exceptional_openings.map((opening: any) => {
        return `${opening.period_begin} a ${opening.period_end}`;
      }).join(', ');
    }
  
    getExceptionalClosings(station: any): string {
      return station.opening_times.exceptional_closings.map((closing: any) => {
        return `${closing.period_begin} a ${closing.period_end}`;
      }).join(', ');
    }
}
