import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { ApiService } from '../api.service';
import { ModalController } from '@ionic/angular';
import { StationDetailsModalComponent } from '../station-details-modal/station-details-modal.component';
import { environment } from 'src/environments/environment';
import { Loader } from '@googlemaps/js-api-loader'; // Importar Loader

@Component({
  selector: 'app-electrolineras',
  templateUrl: './electrolineras.page.html',
  styleUrls: ['./electrolineras.page.scss'],
})
export class ElectrolinerasPage implements OnInit, AfterViewInit {
  map: google.maps.Map | undefined;
  availableStations: any[] = [];
  iconPath = 'assets/icon/'; // Ruta base de los íconos

  constructor(
    private apiService: ApiService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    console.log('Electrolineras Página cargada');
  }

  async ngAfterViewInit() {
    try {
      await this.initializeMap();
      await this.getCurrentLocation();
      await this.getNearbyStations();
    } catch (error) {
      console.error('Error al inicializar la página de electrolineras:', error);
    }
  }

  async initializeMap() {
    const loader = new Loader({ // Aquí declaramos 'loader' correctamente
      apiKey: environment.googleMapsApiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    await loader.load();

    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: -34.929, lng: 138.601 },
      zoom: 15,
    });
  }

  async getCurrentLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      console.log('Posición actual:', coordinates);

      if (this.map) {
        this.map.setCenter({
          lat: coordinates.coords.latitude,
          lng: coordinates.coords.longitude,
        });
        this.map.setZoom(15);
      }
    } catch (error) {
      console.error('Error al obtener la ubicación actual:', error);
    }
  }

  getNearbyStations() {
    this.apiService.fetchAllLocations().subscribe((stations: any[]) => {
      this.availableStations = stations.filter(station =>
        station.evses.some((evse: { status: string }) => evse.status === 'DISPONIBLE')
      );

      console.log('Estaciones disponibles:', this.availableStations);

      this.availableStations.forEach(station => {
        const { latitude, longitude } = station.coordinates;

        if (latitude && longitude) {
          const lat = parseFloat(latitude);
          const lng = parseFloat(longitude);

          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            this.addMarker(lat, lng, station.name, station);
          } else {
            console.error("Coordenadas fuera de rango:", station);
          }
        } else {
          console.error('Coordenadas no válidas o faltantes para la estación:', station);
        }
      });
    });
  }

  async addMarker(lat: number, lng: number, title: string, station: any) {
    if (this.map && !isNaN(lat) && !isNaN(lng)) {
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: this.map,
        title: title,
        icon: {
          url: 'assets/icon/electrolineras.png',
          scaledSize: new google.maps.Size(50, 50),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(25, 50)
        }
      });

      marker.addListener('click', () => {
        this.showStationDetails(station);
      });
    } else {
      console.error('Latitud o longitud no válidas:', lat, lng);
    }
  }

  async showStationDetails(station: any) {
    const availableConnectorGroups: { [key: string]: { count: number; power_type: string; icon: string } } = {};
    const occupiedConnectorGroups: { [key: string]: { count: number; power_type: string; icon: string } } = {};
  
    station.evses.forEach((evse: any) => {
      evse.connectors.forEach((connector: any) => {
        const key = `${connector.standard}, Tipo: ${connector.power_type}`;
        const icon = this.getIconPath(connector);
  
        if (evse.status === 'DISPONIBLE') {
          if (availableConnectorGroups[key]) {
            availableConnectorGroups[key].count += 1;
          } else {
            availableConnectorGroups[key] = { count: 1, power_type: connector.power_type, icon };
          }
        } else {
          if (occupiedConnectorGroups[key]) {
            occupiedConnectorGroups[key].count += 1;
          } else {
            occupiedConnectorGroups[key] = { count: 1, power_type: connector.power_type, icon };
          }
        }
      });
    });
  
    const availableConnectors = Object.entries(availableConnectorGroups)
      .map(([connector, data]) => ({
        icon: data.icon,
        text: `${connector} Total: ${data.count}`
      }));
  
    const occupiedConnectors = Object.entries(occupiedConnectorGroups)
      .map(([connector, data]) => ({
        icon: data.icon,
        text: `${connector} Total: ${data.count}`
      }));
  
    const modal = await this.modalCtrl.create({
      component: StationDetailsModalComponent,
      componentProps: {
        station,
        availableConnectors: availableConnectors || [],
        occupiedConnectors: occupiedConnectors || []
      }
    });
  
    await modal.present();
  
    const { data } = await modal.onDidDismiss();
    if (data?.action === 'goToStation') {
      this.calculateAndDisplayRoute(station);
    }
  }
  
  getIconPath(connector: any): string {
    if (!connector.standard || !connector.format || !connector.power_type) {
      console.warn('Conector con datos incompletos encontrado:', connector);
      return this.iconPath + 'default.jpeg';  // Icono por defecto si faltan datos
    }
  
    // Imprimir valores de conector para depuración
    console.log('Conector:', connector);
    
    const iconMap: { [key: string]: string } = {
      'Tipo 2 (SOCKET - AC)': 'Tipo2AC.png',
      'Tipo 2 (CABLE - AC)': 'Tipo2AC.png',
      'CCS 2 (CABLE - DC)': 'combinadotipo2.png',
      'CCS 1 (CABLE - DC)': 'Tipo1DC.png',
      'GB/T AC (CABLE - AC)': 'GBT_AC.png',
      'Tipo 1 (CABLE - AC)': 'Tipo1AC.png',
      'Tipo 1 (SOCKET - AC)': 'Tipo1AC.png',
      'CHAdeMO (CABLE - DC)': 'CHADEMO.png',
      'GB/T DC (CABLE - DC)': 'GBT_DC.png',
    };
  
    const key = `${connector.standard} (${connector.format} - ${connector.power_type})`;
  
    // Imprimir clave generada y verificar si coincide con el mapa de iconos
    console.log('Clave generada:', key);
  
    return this.iconPath + (iconMap[key] || 'default.jpeg');  // Icono por defecto si no hay coincidencia en el mapa
  }

  calculateAndDisplayRoute(station: any) {
    if (!this.map) return;

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(this.map);

    Geolocation.getCurrentPosition().then((position) => {
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const stationLocation = {
        lat: parseFloat(station.coordinates.latitude),
        lng: parseFloat(station.coordinates.longitude),
      };

      directionsService.route(
        {
          origin: userLocation,
          destination: stationLocation,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(response);
          } else {
            console.error('Solicitud de direcciones fallida debido a ' + status);
          }
        }
      );
    }).catch(error => {
      console.error('Error al obtener la ubicación actual para la ruta:', error);
    });
  }
}
