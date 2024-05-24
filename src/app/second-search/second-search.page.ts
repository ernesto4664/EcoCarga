import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';

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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getUserLocation();
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
      this.http.get<any[]>(`https://backend.qaseciop.com/battery-capacities?query=${query}`).subscribe(
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
    this.http.get<any>(`https://backend.qaseciop.com/battery-details?capacity=${capacity}`).subscribe(
      (battery) => {
        this.selectedBattery = battery;
        this.fetchPSEOptions(battery.id);
      },
      (error) => {
        console.error('Error fetching battery details:', error);
      }
    );
  }

  fetchPSEOptions(batteryId: number) {
    this.http.get<string[]>(`https://backend.qaseciop.com/pse-options?batteryId=${batteryId}`).subscribe(
      (options) => {
        this.pseOptions = options;
      },
      (error) => {
        console.error('Error fetching PSE options:', error);
      }
    );
  }

  filterByPSE() {
    // Implementar lógica para filtrar por PSE si es necesario
    console.log('Filtrar por PSE:', this.selectedPSE);
  }

  filterByDistance() {
    // Implementar lógica para filtrar por distancia si es necesario
    console.log('Filtrar por distancia:', this.selectedDistance);
  }

  getFilteredStations() {
    if (!this.userLocation) {
      console.error('Ubicación del usuario no disponible');
      return;
    }

    const params: any = {
      batteryCapacity: this.batteryCapacity,
      userLat: this.userLocation.latitude,
      userLng: this.userLocation.longitude
    };

    if (this.selectedPSE) {
      params.pse = this.selectedPSE;
    }

    if (this.selectedDistance) {
      params.distance = this.selectedDistance;
    }

    this.http.get<any[]>(`https://backend.qaseciop.com/stations`, { params }).subscribe(
      (stations) => {
        // Aquí puedes manejar los resultados filtrados
        console.log('Estaciones filtradas:', stations);
      },
      (error) => {
        console.error('Error fetching stations:', error);
      }
    );
  }
}
