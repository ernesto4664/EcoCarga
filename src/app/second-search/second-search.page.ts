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
      }
    });
  }

  ngOnInit() {
    this.getUserLocation();
    this.loadPSEOptions();  // Load PSE options on init
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

    const connectorIds = this.selectedConnectors.map(c => c.connector_id);

    this.apiService.getStationsByConnectors(connectorIds).subscribe(
      (stations: any) => {
        this.stations = this.applyDistanceFilter(this.sortStationsByDistance(stations));
        this.printConnectorTotals();
      },
      (error: any) => {
        console.error('Error fetching stations:', error);
      }
    );
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
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1); 
    const dLon = this.deg2rad(lon2 - lon1); 
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const distance = R * c; // Distance in km
    return distance;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  applyDistanceFilter(stations: any[]): any[] {
    if (this.selectedDistance > 0) {
      return stations.filter(station => station.distance <= this.selectedDistance);
    }
    return stations;
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
    const { acCount, dcCount, totalConnectors } = this.getConnectorTotals(station);

    return {
      totalConnectors,
      statusDetails: [
        { label: 'Disponible', count: totalConnectors, color: 'green' }
      ],
      acCount,
      dcCount
    };
  }

  showPowerTypeCounts(): boolean {
    return this.selectedConnectors.some(c => c.power_type.startsWith('AC')) && this.selectedConnectors.some(c => c.power_type.startsWith('DC'));
  }
}
