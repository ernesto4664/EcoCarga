import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { ApiService } from '../api.service';
import { ModalController } from '@ionic/angular';
import { StationDetailsModalComponent } from '../station-details-modal/station-details-modal.component';
import { Loader } from '@googlemaps/js-api-loader';
import { GoogleMapsService } from '../services/google-maps.service';

@Component({
  selector: 'app-electrolineras',
  templateUrl: './electrolineras.page.html',
  styleUrls: ['./electrolineras.page.scss'],
})
export class ElectrolinerasPage implements OnInit, AfterViewInit {
  map: google.maps.Map | undefined;
  availableStations: any[] = [];
  iconPath = 'assets/icon/';
  loading: boolean = true; // Control del preloader

  constructor(
    private apiService: ApiService,
    private modalCtrl: ModalController,
    private googleMapsService: GoogleMapsService // Inyectamos el servicio
  ) {}

  ngOnInit() {}

  async ngAfterViewInit() {
    try {
      await this.waitForMapElement();
      await this.initializeMap();
      await this.getCurrentLocation();
      await this.getNearbyStations();
    } catch (error) {
      console.error('Error al inicializar la página de electrolineras:', error);
    } finally {
      this.loading = false; // Oculta el preloader después de que el mapa esté listo
    }
  }

  async waitForMapElement(): Promise<void> {
    return new Promise((resolve, reject) => {
      let retries = 0;
      const maxRetries = 50;

      const checkExist = setInterval(() => {
        const mapElement = document.getElementById('mapdetail');
        if (mapElement) {
          clearInterval(checkExist);
          resolve();
        } else {
          retries++;
          if (retries >= maxRetries) {
            clearInterval(checkExist);
            reject(new Error('El mapa no se pudo cargar en el DOM después de varios intentos'));
          }
        }
      }, 100);
    });
  }

  // Inicializar el mapa de Google
  async initializeMap() {
    this.loading = true; // Muestra el spinner de carga

    const loader = new Loader({
      apiKey: this.googleMapsService.googleMapsApiKey, // Usamos la API Key desde el servicio
      version: 'weekly',
      libraries: ['places']
    });

    try {
      await loader.load();

      let mapElement: HTMLElement | null = null;
      let attempts = 0;
      while (!mapElement && attempts < 10) {
        mapElement = document.getElementById('mapdetail');
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!mapElement) {
        throw new Error('El mapa no se pudo cargar en el DOM después de varios intentos');
      }

      this.map = new google.maps.Map(mapElement, {
        center: { lat: -34.929, lng: 138.601 },
        zoom: 15,
      });
    } catch (error) {
      console.error('Error al cargar o inicializar Google Maps:', error);
    } finally {
      this.loading = false;
    }
  }

  // Obtener la ubicación actual del usuario y centrar el mapa
  async getCurrentLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
     // console.log('Posición actual:', coordinates);
  
      const userPosition = {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
      };
  
      // Centra el mapa en la ubicación actual
      if (this.map) {
        this.map.setCenter(userPosition); // Centrar el mapa en la ubicación actual
        this.map.setZoom(12);  // Ajustar el nivel de zoom
       // console.log('Mapa centrado en la ubicación del usuario:', userPosition);
      }
    } catch (error) {
      console.error('Error al obtener la ubicación actual:', error);
    }
  }

// Obtener estaciones cercanas y colocar marcadores en el mapa
getNearbyStations() {
  this.apiService.fetchAllLocations().subscribe((stations: any[]) => {
    // Filtramos las estaciones que están disponibles, no disponibles y fuera de línea
    this.availableStations = stations.filter(station =>
      station.evses.some((evse: { status: string }) => 
        evse.status === 'DISPONIBLE' || evse.status === 'NO DISPONIBLE' || evse.status === 'FUERA DE LINEA'|| evse.status === 'OCUPADO'
      )
    );

    //console.log('Estaciones disponibles y otras:', this.availableStations);

    // Recorremos cada estación y añadimos marcadores según su estado
    this.availableStations.forEach(station => {
      const { latitude, longitude } = station.coordinates;

      if (latitude && longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        // Validamos que las coordenadas estén dentro del rango válido
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          // Añadimos un marcador con información del estado
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

// Añadir un marcador al mapa
async addMarker(lat: number, lng: number, title: string, station: any) {
  if (this.map && !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    // Determinar el icono según el estado de la estación
    const iconUrl = station.evses.some((evse: { status: string }) => evse.status === 'DISPONIBLE')
      ? 'assets/icon/electrolineras.png' // Icono para estaciones disponibles
      : 'assets/icon/red1.png'; // Icono para estaciones con otros estados

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
      title: title,
      icon: {
        url: iconUrl,
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

  // Mostrar detalles de la estación seleccionada en un modal
  async showStationDetails(station: any) {
    const availableConnectorGroups: { [key: string]: { count: number; power_type: string; icon: string } } = {};
    const occupiedConnectorGroups: { [key: string]: { count: number; power_type: string; icon: string } } = {};
    const unavailableConnectorGroups: { [key: string]: { count: number; power_type: string; icon: string } } = {};

    station.evses.forEach((evse: any) => {
      evse.connectors.forEach((connector: any) => {
        connector.power_type = connector.power_type || this.getPowerTypeByStandard(connector.standard);
        connector.format = connector.format || 'CABLE';

        const standard = connector.standard || 'Desconocido';
        const powerType = connector.power_type;
        const key = `${standard} - ${powerType}`;
        const icon = this.getIconPath(connector);

        if (connector.status === 'DISPONIBLE') {
          if (availableConnectorGroups[key]) {
            availableConnectorGroups[key].count++;
          } else {
            availableConnectorGroups[key] = { count: 1, power_type: powerType, icon };
          }
        } else if (connector.status === 'OCUPADO') {
          if (occupiedConnectorGroups[key]) {
            occupiedConnectorGroups[key].count++;
          } else {
            occupiedConnectorGroups[key] = { count: 1, power_type: powerType, icon };
          }
        } else {
          if (unavailableConnectorGroups[key]) {
            unavailableConnectorGroups[key].count++;
          } else {
            unavailableConnectorGroups[key] = { count: 1, power_type: powerType, icon };
          }
        }
      });
    });

    const availableConnectors = Object.entries(availableConnectorGroups).map(([key, data]) => ({
      icon: data.icon,
      text: `${key.split(' - ')[0]}, Tipo: ${data.power_type} Disponibles: ${data.count}`,
      textStyle: 'green-text',
    }));

    const occupiedConnectors = Object.entries(occupiedConnectorGroups).map(([key, data]) => ({
      icon: data.icon,
      text: `${key.split(' - ')[0]}, Tipo: ${data.power_type} Cargando: ${data.count}`,
      textStyle: 'yellow-text',
    }));

    const unavailableConnectors = Object.entries(unavailableConnectorGroups).map(([key, data]) => ({
      icon: data.icon,
      text: `${key.split(' - ')[0]}, Tipo: ${data.power_type} No disponibles: ${data.count}`,
      textStyle: 'red-text',
    }));

    const modal = await this.modalCtrl.create({
      component: StationDetailsModalComponent,
      componentProps: {
        station,
        availableConnectors,
        occupiedConnectors,
        unavailableConnectors,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.action === 'goToStation') {
      this.calculateAndDisplayRoute(station);
    }
  }

  // Método auxiliar para obtener el icono del conector
  getIconPath(connector: any): string {
    connector.power_type = connector.power_type || this.getPowerTypeByStandard(connector.standard);
    connector.format = connector.format || 'CABLE';

    const iconMap: { [key: string]: string } = {
      'Tipo 2 - AC': 'Tipo2AC.png',
      'CCS 2 - DC': 'combinadotipo2.png',
      'CCS 1 - DC': 'Tipo1DC.png',
      'GB/T AC - AC': 'GBT_AC.png',
      'Tipo 1 - AC': 'Tipo1AC.png',
      'CHAdeMO - DC': 'CHADEMO.png',
      'GB/T DC - DC': 'GBT_DC.png',
    };

    const key = `${connector.standard} - ${connector.power_type}`;
    return this.iconPath + (iconMap[key] || 'default.jpeg');
  }

  // Calcular y mostrar la ruta desde la ubicación actual hasta la estación seleccionada
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

  // Método auxiliar para obtener el tipo de energía según el estándar
  private getPowerTypeByStandard(standard: string): string {
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
}
