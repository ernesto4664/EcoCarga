import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { ApiService } from '../api.service';
import { AlertController } from '@ionic/angular';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-electrolineras',
  templateUrl: './electrolineras.page.html',
  styleUrls: ['./electrolineras.page.scss'],
})
export class ElectrolinerasPage implements OnInit, AfterViewInit {
  map: google.maps.Map | undefined;
  availableStations: any[] = [];

  constructor(
    private apiService: ApiService,
    private alertController: AlertController
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
    const loader = new Loader({
      apiKey: environment.googleMapsApiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    await loader.load(); // Cargar el API de forma asíncrona

    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: -34.929, lng: 138.601 },
      zoom: 15,
    });

    // Llama a addMarker con un objeto 'station' como cuarto argumento
    const dummyStation = { name: 'Estación de carga', address: 'Dirección de carga' }; // Objeto ficticio
    this.addMarker(-34.929, 138.601, 'Estación de carga', dummyStation);
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
      // Mostrar un mensaje de alerta
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo obtener la ubicación actual.',
        buttons: ['OK'],
      });
      await alert.present();
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

        // Validación de coordenadas
        if (latitude && longitude) {
          const lat = parseFloat(latitude);
          const lng = parseFloat(longitude);

          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            // Coordenadas válidas, añadir marcador
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
          url: 'assets/icon/electrolineras.png', // Ruta hacia tu imagen personalizada
          scaledSize: new google.maps.Size(50, 50), // Escala la imagen (opcional)
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(25, 50) // Ajusta la posición del ícono en el mapa
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
    const availableConnectors = station.evses.reduce((acc: any[], evse: any) => {
      if (evse.status === 'DISPONIBLE') {
        return acc.concat(evse.connectors);
      }
      return acc;
    }, []);

    const connectorDetails = availableConnectors
      .map((connector: { standard: string; power_type: string }) => `Conector: ${connector.standard}, Tipo: ${connector.power_type}`)
      .join('\n');

    const alert = await this.alertController.create({
      header: station.name,
      subHeader: station.address,
      message: `Conectores disponibles:\n${connectorDetails || 'No hay conectores disponibles.'}`,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
