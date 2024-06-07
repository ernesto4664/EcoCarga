import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Geolocation } from '@capacitor/geolocation';

declare var google: any;

@Component({
  selector: 'app-station-details',
  templateUrl: './station-details.page.html',
  styleUrls: ['./station-details.page.scss'],
})
export class StationDetailsPage implements OnInit {
  station: any;
  selectedConnectors: any[] = [];
  externalMapUrl: string = '';
  map: any;
  directionsService: any;
  directionsRenderer: any;
  iconPath: string = 'assets/icon/';

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private sanitizer: DomSanitizer
  ) {
    this.route.queryParams.subscribe(() => {
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state) {
        this.station = navigation.extras.state['station'];
        this.selectedConnectors = navigation.extras.state['selectedConnectors'] || [];
        console.log('Station:', this.station);
        console.log('Selected Connectors:', this.selectedConnectors);
      }
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
  }

  ngOnInit() {
    this.loadMap();
    this.setMapUrl();
  }

  async setMapUrl() {
    const { latitude, longitude } = this.station.coordinates;
    const userPosition = await Geolocation.getCurrentPosition();
    const userLatitude = userPosition.coords.latitude;
    const userLongitude = userPosition.coords.longitude;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLatitude},${userLongitude}&destination=${latitude},${longitude}&travelmode=driving`;
    this.externalMapUrl = url;
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

  getConnectorStatus() {
    const connectorsInStation = this.station.evses.map((evse: any) => evse.connectors).flat();
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

  getDetailedConnectors() {
    return this.station.evses.map((evse: any) => ({
      ...evse,
      connectors: evse.connectors.filter((connector: any) =>
        this.selectedConnectors.some(selected => selected.standard === connector.standard && selected.power_type === connector.power_type)
      )
    })).filter((evse: any) => evse.connectors.length > 0);
  }

  async loadMap() {
    if (this.station?.coordinates) {
      const mapElement = document.getElementById('map');
      if (mapElement) {
        const userPosition = await Geolocation.getCurrentPosition();
        const userLatitude = userPosition.coords.latitude;
        const userLongitude = userPosition.coords.longitude;

        const mapOptions = {
          center: new google.maps.LatLng(userLatitude, userLongitude),
          zoom: 15
        };

        this.map = new google.maps.Map(mapElement, mapOptions);
        this.directionsRenderer.setMap(this.map);

        const request = {
          origin: new google.maps.LatLng(userLatitude, userLongitude),
          destination: new google.maps.LatLng(parseFloat(this.station.coordinates.latitude), parseFloat(this.station.coordinates.longitude)),
          travelMode: google.maps.TravelMode.DRIVING
        };

        this.directionsService.route(request, (result: any, status: any) => {
          if (status === google.maps.DirectionsStatus.OK) {
            this.directionsRenderer.setDirections(result);
          } else {
            console.error('Error al obtener direcciones', status);
          }
        });

        const marker = new google.maps.Marker({
          position: { lat: parseFloat(this.station.coordinates.latitude), lng: parseFloat(this.station.coordinates.longitude) },
          map: this.map,
          title: this.station.name
        });
      } else {
        console.error('Map element not found');
      }
    }
  }

  getIconPath(connector: any): string {
    // Mapeo de conectores a iconos
    const iconMap: { [key: string]: string } = {
      'IEC_62196_T2 (SOCKET - AC_1_PHASE)': 'Tipo2AC.png',
      'IEC_62196_T2_COMBO (CABLE - AC_3_PHASE)': 'Tipo1AC.png',
      'GBT_AC (CABLE - AC_1_PHASE)': 'GBT_AC.png',
      'IEC_62196_T1 (CABLE - AC_1_PHASE)': 'Tipo1AC.png',
      'CHADEMO (CABLE - DC)': 'CHADEMO.png',
      'IEC_62196_T1_COMBO (CABLE - DC)': 'Tipo1DC.png',
      'GBT_DC (CABLE - DC)': 'GBT_DC.png',
      // Agrega más mapeos según sea necesario
    };

    const key = `${connector.standard} (${connector.format} - ${connector.power_type})`;
    return this.iconPath + (iconMap[key] || 'default.png'); // 'default.png' si no se encuentra el conector
  }
}
