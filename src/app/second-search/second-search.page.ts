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
  allFilteredConnectors: any[] = [];
  stations: any[] = [];  // To store the filtered stations
  private apiUrl = 'https://backend.electromovilidadenlinea.cl'; // URL de tu API real

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
        this.allFilteredConnectors = navigation.extras.state['allFilteredConnectors'] || [];
        console.log('Selected Connectors:', this.selectedConnectors);
        console.log('All Filtered Connectors:', this.allFilteredConnectors);
      }
    });
  }

  ngOnInit() {
    this.getUserLocation();
    this.loadPSEOptions();  // Load PSE options on init
  }

  async getUserLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.userLocation = {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location', error);
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
          console.error('Error fetching capacities:', error);
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
        console.log(this.selectedBattery); // Verifica que tenga datos
        this.fetchPSEOptions(battery.id);
      },
      (error) => {
        console.error('Error fetching battery details:', error);
      }
    );
  }

  loadPSEOptions() {
    this.http.get<string[]>(`${this.apiUrl}/pse-options`).subscribe(
      (options) => {
        this.pseOptions = options;
      },
      (error) => {
        console.error('Error fetching PSE options:', error);
      }
    );
  }

  fetchPSEOptions(batteryId: number) {
    this.http.get<string[]>(`${this.apiUrl}/pse-options?batteryId=${batteryId}`).subscribe(
      (options) => {
        this.pseOptions = options;
      },
      (error) => {
        console.error('Error fetching PSE options:', error);
      }
    );
  }

  filterByPSE() {
    console.log('Filtrar por PSE:', this.selectedPSE);
  }

  filterByDistance() {
    console.log('Filtrar por distancia:', this.selectedDistance);
  }

  getFilteredStations() {
    if (!this.userLocation) {
      console.error('Ubicación del usuario no disponible');
      return;
    }

    const connectorIds = this.allFilteredConnectors.map(c => c.connector_id);

    this.apiService.getStationsByConnectors(connectorIds).subscribe(
      (stations: any) => {
        this.stations = this.removeDuplicateStations(stations);
        console.log('Estaciones filtradas:', this.stations);
      },
      (error: any) => {
        console.error('Error fetching stations:', error);
      }
    );
  }

  removeDuplicateStations(stations: any[]): any[] {
    const uniqueStations = new Map<string, any>();

    stations.forEach(station => {
      if (!uniqueStations.has(station.location_id)) {
        uniqueStations.set(station.location_id, station);
      }
    });

    return Array.from(uniqueStations.values());
  }

  selectStation(station: any) {
    console.log('Estación seleccionada:', station);

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
        return 'Disponibles';
      case 'CHARGING':
        return 'Cargando';
      case 'INOPERATIVE':
      case 'REMOVED':
        return 'No disponibles';
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
}
