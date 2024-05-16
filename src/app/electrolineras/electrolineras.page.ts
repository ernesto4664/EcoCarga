import { Component, AfterViewInit, OnInit } from '@angular/core';
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-electrolineras',
  templateUrl: './electrolineras.page.html',
  styleUrls: ['./electrolineras.page.scss'],
})
export class ElectrolinerasPage implements OnInit, AfterViewInit  {
  map: GoogleMap | undefined;

  constructor() {}

  ngOnInit() {
    console.log('ElectrolinerasPage loaded');
  }

  async ngAfterViewInit() {
    await this.initializeMap();
    await this.getCurrentLocation();
    this.getNearbyPlaces();
  }

  async initializeMap() {
    this.map = await GoogleMap.create({
      id: 'my-map',
      element: document.getElementById('map') as HTMLElement,
      apiKey: 'AIzaSyCNM9lXDeD3hLfe7Es4KNqkL8J2jsZ_W8I', // Puedes omitir esto si ya lo configuraste en capacitor.config.ts
      config: {
        center: {
          lat: -34.9290,
          lng: 138.6010,
        },
        zoom: 15,
      },
    });
  }

  async getCurrentLocation() {
    const coordinates = await Geolocation.getCurrentPosition();
    console.log('Current position:', coordinates);

    if (this.map) {
      // Centra el mapa en la ubicación actual del usuario
      this.map.setCamera({
        coordinate: {
          lat: coordinates.coords.latitude,
          lng: coordinates.coords.longitude,
        },
        zoom: 15,
      });
    }
  }

  getNearbyPlaces() {
    // Datos simulados de lugares cercanos
    const places = [
      { latitude: -34.920, longitude: 138.600, name: 'Place 1' },
      { latitude: -34.930, longitude: 138.610, name: 'Place 2' },
      { latitude: -34.940, longitude: 138.620, name: 'Place 3' },
    ];

    // Agrega marcadores en el mapa para los lugares simulados
    places.forEach(place => {
      this.addMarker(place.latitude, place.longitude, place.name);
    });
  }

  addMarker(lat: number, lng: number, title: string) {
    if (this.map) {
      this.map.addMarker({
        coordinate: { lat, lng },
        title,
      });
    }
  }

  async showDirections(destinationLat: number, destinationLng: number) {
    const coordinates = await Geolocation.getCurrentPosition();
    const originLat = coordinates.coords.latitude;
    const originLng = coordinates.coords.longitude;

    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destinationLat},${destinationLng}&key=YOUR_GOOGLE_MAPS_API_KEY`;

    // Realiza la solicitud HTTP a la API de Google Directions
    const response = await fetch(directionsUrl);
    const directions = await response.json();

    if (directions.routes.length > 0) {
      const route = directions.routes[0];
      const polyline = this.decodePolyline(route.overview_polyline.points);
      if (this.map) {
        await this.map.addPolylines([
          {
            path: polyline,
            strokeColor: '#007AFF',
            // width: 5, // No se usa ya que no está disponible
            geodesic: true
          }
        ]);
      }
    }
  }

  decodePolyline(encoded: string): { lat: number, lng: number }[] {
    const points: { lat: number, lng: number }[] = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }

    return points;
  }
}
