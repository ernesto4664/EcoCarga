import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-second-search',
  templateUrl: './second-search.page.html',
  styleUrls: ['./second-search.page.scss'],
})
export class SecondSearchPage implements OnInit {
  batteryCapacity: string = '';
  suggestedCapacities: string[] = [];
  selectedBattery: any = null;
  pseOptions: string[] = [];
  selectedPSE: string = '';
  selectedDistance: number = 0;
  userLocation: { latitude: number; longitude: number } | null = null;
  selectedConnectors: any[] = [];
  stations: any[] = [];  // Para almacenar las estaciones filtradas
  private apiUrl = 'https://backend.electromovilidadenlinea.cl'; 

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService
  ) {
    this.activatedRoute.queryParams.subscribe(() => {
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state) {
        this.selectedConnectors = navigation.extras.state['selectedConnectors'] || [];
      }
    });
  }

  ngOnInit() {
    this.getUserLocation();
    //this.loadPSEOptions();  // cargamos las opciones del PSE en init
  }

  async getUserLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
      this.userLocation = {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
      };
    } catch (error) {
      console.error('Error al obtener la ubicación', error);
    }
  }

  searchBatteryCapacities(event: any) {
    const query = event.target.value;
    if (query && query.length > 1) {
      this.http.get<any[]>(`${this.apiUrl}/battery-capacities?query=${query}`).subscribe(
        (capacities) => {
          this.suggestedCapacities = capacities.map(capacity => capacity.name);
        },
        (error) => {
          console.error('Error al obtener capacidades:', error);
          this.suggestedCapacities = [];
        }
      );
    } else {
      this.suggestedCapacities = [];
    }
  }

  selectCapacity(capacity: string) {
    this.batteryCapacity = capacity;
    this.suggestedCapacities = [];
    this.fetchBatteryDetails(capacity);
  }

  fetchBatteryDetails(capacity: string) {
    this.http.get<any>(`${this.apiUrl}/battery-details?capacity=${capacity}`).subscribe(
      (battery) => {
        this.selectedBattery = battery;
       // this.fetchPSEOptions(battery.id);
      },
      (error) => {
        console.error('Error al recuperar el detalle de las baterias:', error);
      }
    );
  }

/*  loadPSEOptions() {
    this.http.get<string[]>(`${this.apiUrl}/pse-options`).subscribe(
      (options) => {
        this.pseOptions = options;
      },
      (error) => {
        console.error('Error al recuperar las opciones de PSE:', error);
      }
    );
  }

  fetchPSEOptions(batteryId: number) {
    this.http.get<string[]>(`${this.apiUrl}/pse-options?batteryId=${batteryId}`).subscribe(
      (options) => {
        this.pseOptions = options;
      },
      (error) => {
        console.error('Error al recuperar las opciones de PSE:', error);
      }
    );
  }*/

 /* filterByPSE() {
    console.log('Filtrar por PSE:', this.selectedPSE);
    this.applyAllFilters();
  }*/

  filterByDistance() {
    console.log('Filtrar por distancia:', this.selectedDistance);
    this.applyAllFilters();
  }

  resetFilters() {
    this.selectedPSE = '';
    this.selectedDistance = 0;
    this.applyAllFilters();
  }

  applyAllFilters() {
    this.getFilteredStations();
  }

  getFilteredStations() {
    if (!this.userLocation) {
      console.error('Ubicación del usuario no disponible');
      return;
    }

    const connectorIds = this.selectedConnectors.map(c => c.connector_id);

    this.apiService.getStationsByConnectors(connectorIds).subscribe(
      (stations: any) => {
        this.filterUnavailableEVSEs(stations); // Filtrar los EVSEs no disponibles
        this.stations = this.sortStationsByDistance(stations);
        // Aplica el filtro de distancia
        if (this.selectedDistance > 0) {
          this.stations = this.stations.filter(station => parseFloat(station.distance) <= this.selectedDistance);
        }
        // Aplica el filtro de PSE
        if (this.selectedPSE) {
          this.stations = this.stations.filter(station => station.pse && station.pse.includes(this.selectedPSE));
        }
        this.updateConnectorsStatus(); // Actualizar el estado de los conectores
        this.printConnectorTotals();
      },
      (error: any) => {
        console.error('Error al recuperar estaciones:', error);
      }
    );
  }

  updateConnectorsStatus() {
    const currentDate = new Date();

    this.stations.forEach(station => {
      station.evses.forEach((evse: { connectors: any[]; }) => {
        evse.connectors.forEach((connector: any) => {/*
          const lastUpdatedDate = new Date(connector.last_updated);

          // Si el conector ha sido actualizado recientemente, actualizamos su estado
          if (lastUpdatedDate < currentDate) {
            this.apiService.getConnectorStatus(connector.connector_id).subscribe(
              (updatedConnector: any) => {
                // Actualizamos el conector con los datos más recientes
                connector.status = updatedConnector.status;
                connector.last_updated = updatedConnector.last_updated;

                // Actualizamos la caché global con los datos más recientes
                this.apiService.updateCacheWithConnectorStatus(updatedConnector);
              },
              (error: any) => {
                console.error('Error al recuperar los estatus de los conectores:', error);
               }
            );
           }
        */});
      });
    });
  }

  filterUnavailableEVSEs(stations: any[]) {
    stations.forEach(station => {
      station.evses = station.evses.filter((evse: any) => evse.status === 'AVAILABLE');
    });
  }

  sortStationsByDistance(stations: any[]): any[] {
    return stations
      .map(station => {
        station.distance = this.calculateDistance(
          this.userLocation!.latitude,
          this.userLocation!.longitude,
          parseFloat(station.coordinates.latitude),
          parseFloat(station.coordinates.longitude)
        ).toFixed(1); // Redondear la distancia a un decimal
        return station;
      })
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km.
    const dLat = this.deg2rad(lat2 - lat1); 
    const dLon = this.deg2rad(lon2 - lon1); 
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const distance = R * c; // Distancia en Km
    return distance;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  printConnectorTotals() {
    this.stations.forEach(station => {
      const { acCount, dcCount, totalConnectors } = this.getConnectorTotals(station);
      console.log(`Estación ${station.name} tiene ${totalConnectors} conectores: ${acCount} AC y ${dcCount} DC`);
    });
  }

  getConnectorTotals(station: any) {
    const connectorsInStation = station.evses.map((evse: any) => evse.connectors).flat();
    const filteredConnectors = connectorsInStation.filter((connector: any) =>
      this.selectedConnectors.some(selected => selected.standard === connector.standard && selected.power_type === connector.power_type)
    );

    const acCount = filteredConnectors.filter((connector: any) => connector.power_type.startsWith('AC')).length;
    const dcCount = filteredConnectors.filter((connector: any) => connector.power_type.startsWith('DC')).length;
    const totalConnectors = acCount + dcCount;

    return { acCount, dcCount, totalConnectors };
  }

  selectStation(station: any) {
    const navigationExtras = {
      state: {
        station,
        selectedConnectors: this.selectedConnectors
      }
    };
    this.router.navigate(['/station-details'], navigationExtras);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'Disponible';
      case 'CHARGING':
        return 'Cargando';
      case 'INOPERATIVE':
      case 'REMOVED':
        return 'No disponible';
      default:
        return 'Desconocido';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'green';
      case 'CHARGING':
        return 'orange';
      case 'INOPERATIVE':
      case 'REMOVED':
        return 'red';
      default:
        return 'gray';
    }
  }

  getConnectorStatus(station: any) {
    const connectorsInStation = station.evses.map((evse: any) => evse.connectors).flat();
    const filteredConnectors = connectorsInStation.filter((connector: any) =>
      this.selectedConnectors.some(selected => selected.standard === connector.standard && selected.power_type === connector.power_type)
    );
  
    const availableConnectors = filteredConnectors.filter((connector: any) => connector.status === 'AVAILABLE');
    const chargingConnectors = filteredConnectors.filter((connector: any) => connector.status === 'CHARGING');
  
    const acCount = availableConnectors.filter((connector: any) => connector.power_type.startsWith('AC')).length;
    const dcCount = availableConnectors.filter((connector: any) => connector.power_type.startsWith('DC')).length;
  
    const acChargingCount = chargingConnectors.filter((connector: any) => connector.power_type.startsWith('AC')).length;
    const dcChargingCount = chargingConnectors.filter((connector: any) => connector.power_type.startsWith('DC')).length;
  
    const statusDetails = [
      {
        label: 'Disponible',
        count: availableConnectors.length,
        color: '#049F2F'
      },
      {
        label: 'Cargando',
        count: chargingConnectors.length,
        color: '#F9A504'
      }
    ];
  
    return {
      totalConnectors: availableConnectors.length + chargingConnectors.length,
      statusDetails,
      acCount,
      dcCount,
      acChargingCount,
      dcChargingCount
    };
  }

  showPowerTypeCounts(): boolean {
    return this.selectedConnectors.some(c => c.power_type.startsWith('AC')) && this.selectedConnectors.some(c => c.power_type.startsWith('DC'));
  }

  // NUEVOS METODOS PARA MANEJAR LOS HORARIOS DE APERTURAS Y CIERRES DE LAS ESTACIONES
  getOpeningHours(station: any): string {
    if (station.opening_times.twentyfourseven) {
      return 'Abierto 24/7';
    }

    const regularHours = station.opening_times.regular_hours;
    if (regularHours.length > 0) {
      const firstDay = regularHours[0];
      const lastDay = regularHours[regularHours.length - 1];
      return `De ${this.getDayName(firstDay.weekday)} ${firstDay.period_begin} a ${this.getDayName(lastDay.weekday)} ${lastDay.period_end}`;
    }
    return 'No disponible';
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

  getDayName(dayNumber: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayNumber - 1];
  }
}
