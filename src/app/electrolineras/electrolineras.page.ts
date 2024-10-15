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

    // Método auxiliar para asignar el power_type basado en el estándar si es null
private getPowerTypeByStandard(standard: string): string {
  const acStandards = ['Tipo 2', 'Tipo 1', 'GB/T AC'];
  const dcStandards = ['CCS 2', 'CCS 1', 'CHAdeMO', 'GB/T DC'];

  if (acStandards.includes(standard)) {
    return 'AC';
  }
  if (dcStandards.includes(standard)) {
    return 'DC';
  }
  return 'Desconocido'; // Si el estándar no coincide con ninguno conocido, devolver 'Desconocido'
}

async showStationDetails(station: any) {
  const availableConnectorGroups: { [key: string]: { count: number; power_type: string; icon: string } } = {};
  const occupiedConnectorGroups: { [key: string]: { count: number; power_type: string; icon: string } } = {};
  const unavailableConnectorGroups: { [key: string]: { count: number; power_type: string; icon: string } } = {};

  station.evses.forEach((evse: any) => {
    evse.connectors.forEach((connector: any) => {
      // Asignar `power_type` si es nulo usando el estándar
      connector.power_type = connector.power_type || this.getPowerTypeByStandard(connector.standard);
      connector.format = connector.format || 'CABLE';

      // Generar clave para el ícono
      const standard = connector.standard || 'Desconocido';
      const powerType = connector.power_type;
      const key = `${standard} - ${powerType}`;
      const icon = this.getIconPath(connector);

      // Clasificar los conectores según su estado
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

  // Convertir los grupos a arreglos
  const availableConnectors = Object.entries(availableConnectorGroups).map(([key, data]) => ({
    icon: data.icon,
    text: `${key.split(' - ')[0]}, Tipo: ${data.power_type} Disponibles: ${data.count}`,
    textStyle: 'green-text',
  }));

  const occupiedConnectors = Object.entries(occupiedConnectorGroups).map(([key, data]) => ({
    icon: data.icon,
    text: `${key.split(' - ')[0]}, Tipo: ${data.power_type} Cargando: ${data.count}`,
  }));

  const unavailableConnectors = Object.entries(unavailableConnectorGroups).map(([key, data]) => ({
    icon: data.icon,
    text: `${key.split(' - ')[0]}, Tipo: ${data.power_type} No disponibles: ${data.count}`,
  }));

  // Mostrar el modal
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

// Método para obtener el ícono del conector
getIconPath(connector: any): string {
  // Si el power_type es null, asignarlo basado en el estándar
  connector.power_type = connector.power_type || this.getPowerTypeByStandard(connector.standard);
  connector.format = connector.format || 'CABLE'; // Si el formato no está definido, asumir "CABLE"

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
