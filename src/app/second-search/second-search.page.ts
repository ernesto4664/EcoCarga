import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { ApiService } from '../api.service';
import { LoadingController } from '@ionic/angular'; // Importación necesaria
import { environment } from '../../environments/environment';

interface Connector {
  connector_id: number; // o string dependiendo de tu API
  order_number: number;
  status: string;
  standard: string;
  format: string;
}

interface EVSE {
  evse_uid: number; // o string dependiendo de tu API
  evse_id: string;
  directions: string;
  order_number: number;
  payment_capabilities: any[]; // Ajusta el tipo si conoces la estructura
  activation_capabilities: any[]; // Ajusta el tipo si conoces la estructura
  last_updated: string;
  status: string;
  connectors: Connector[];
}

interface Station {
  pse: any;
  evses: EVSE[];
  distance: string; // o number dependiendo de tu API
  coordinates: {
    latitude: string; // La API devuelve latitud como string
    longitude: string; // La API devuelve longitud como string
  };
  // Agrega otros campos de la estación si los necesitas
}

@Component({
  selector: 'app-second-search',
  templateUrl: './second-search.page.html',
  styleUrls: ['./second-search.page.scss'],
})
export class SecondSearchPage implements OnInit {
  batteryCapacity: string = '';  // Para manejar la capacidad de la batería ingresada
  suggestedCapacities: string[] = [];  // Lista de capacidades sugeridas
  selectedBattery: any = null;  // Para almacenar el detalle de la batería seleccionada
  pseOptions: string[] = [];
  selectedPSE: string = '';
  selectedDistance: number = 0;
  userLocation: { latitude: number; longitude: number } | null = null;
  selectedConnectors: any[] = [];
  stations: any[] = [];  // Para almacenar las estaciones filtradas
  private apiUrlSec = environment.apiUrlSec;   // URL del backend de las estaciones
  private apiUrlWebBateries = environment.apiUrlWebBateries;
  loading: boolean = false; // Indicador de carga
  buttonVisible: boolean = true; // El botón es visible al inicio
  hasActiveFilter: boolean = false; 

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private loadingController: LoadingController  // Inyectar LoadingController
  ) {
    this.activatedRoute.queryParams.subscribe(() => {
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state) {
        this.selectedConnectors = navigation.extras.state['selectedConnectors'] || [];
      }
    });
  }

  ngOnInit() {
    this.buttonVisible = true; // Mostrar el botón al entrar en la vista
    this.loading = true; // Activar el preloader al entrar a la vista
    this.getUserLocation();
      // Desactivar el preloader después de un tiempo (por ejemplo, 5 segundos) si no hay otros procesos pendientes
      setTimeout(() => {
        this.loading = false;
      }, 5000);
    
  }

  accordionValue: string | null = null; // Controla qué acordeón está abierto

  // Detener la propagación del evento y alternar el acordeón seleccionado
  stopEventAndToggleAccordion(event: Event, value: string) {
    event.stopPropagation(); // Detiene la propagación del evento

    // Alternar el valor del acordeón; si ya está abierto, lo cierra
    this.accordionValue = this.accordionValue === value ? null : value;
  }

  stopEvent(event: Event) {
    event.stopPropagation(); // Evitar que el clic se propague
  }

  // Obtener ubicación del usuario
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

  // Método de búsqueda de capacidades de batería basado en input
  searchBatteryCapacities(event: any) {
    const query = event.target.value;
    if (query && query.length > 0) {
      // Llamada a la API correcta para obtener las capacidades de baterías
      this.http.get<any[]>(this.apiUrlWebBateries).subscribe(
        (capacities) => {
          // Filtramos las capacidades que coincidan con el input del usuario
          this.suggestedCapacities = capacities
            .filter(capacity => capacity.capacidad.toString().startsWith(query))
            .map(capacity => capacity.capacidad);
        },
        (error) => {
          console.error('Error al obtener capacidades desde BateriasApi:', error);
          this.suggestedCapacities = [];
        }
      );
    } else {
      this.suggestedCapacities = [];
    }
  }

  // Seleccionar una capacidad de la lista sugerida
  selectCapacity(capacity: string) {
    this.batteryCapacity = capacity;
    this.suggestedCapacities = [];
    this.fetchBatteryDetails(capacity);
  }

  // Obtener detalles de la batería seleccionada
  fetchBatteryDetails(capacity: string) {
    this.http.get<any>(`${this.apiUrlWebBateries}/battery-details?capacity=${capacity}`).subscribe(
      (battery) => {
        this.selectedBattery = battery;
      },
      (error) => {
        console.error('Error al recuperar el detalle de las baterias:', error);
      }
    );
  }

  // Filtrar estaciones por distancia
  filterByDistance() {
    this.hasActiveFilter = this.selectedDistance > 0;
    //console.log('Filtrar por distancia:', this.selectedDistance);
    this.applyAllFilters();
  }

  // Reiniciar filtros
  resetFilters() {
    this.selectedPSE = '';
    this.selectedDistance = 0;
    this.applyAllFilters();
  }

  // Aplicar todos los filtros (incluye el filtrado de distancia y PSE)
  applyAllFilters() {
    this.getFilteredStations();
  }

  // Obtener estaciones filtradas
  getFilteredStations() {
    if (!this.userLocation) {
      console.error('Ubicación del usuario no disponible');
      return;
    }

      // Ocultar el botón al iniciar la búsqueda
      this.buttonVisible = false;
  
    const connectorIds = this.selectedConnectors.map(c => c.connector_id);
  
    this.apiService.getStationsByConnectors(connectorIds).subscribe(
      (stations: any) => {
        this.filterUnavailableEVSEs(stations); // Filtrar los EVSEs no disponibles
        
        // Filtra las estaciones que se quedan sin EVSEs después del filtro de disponibilidad
        this.stations = this.removeDuplicateStations(this.sortStationsByDistance(stations))
          .filter(station => station.evses.length > 0);  // <-- AQUI SE APLICA EL FILTRO
  
        // Aplicar filtro de conectores basados en los estándares seleccionados
        this.stations.forEach(station => {
          station.evses.forEach((evse: { connectors: any[]; }) => {
            // Filtrar los conectores para incluir aquellos que tienen el mismo estándar, y permitir power_type nulo
            evse.connectors = evse.connectors.filter((connector: any) =>
              this.selectedConnectors.some(selected =>
                selected.standard === connector.standard &&
                (selected.power_type === connector.power_type || connector.power_type === null)
              )
            );
          });
        
          // Remover EVSEs que se queden sin conectores válidos después del filtrado
          station.evses = station.evses.filter((evse: any) => evse.connectors.length > 0);
        });
  
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
        evse.connectors.forEach((connector: any) => {
          // Lógica para actualizar el estado del conector
        });
      });
    });
  }

  filterUnavailableEVSEs(stations: any[]) {
    stations.forEach(station => {
      station.evses = station.evses.filter((evse: any) => evse.status === 'DISPONIBLE');
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
    //  console.log(`Estación ${station.name} tiene ${totalConnectors} conectores: ${acCount} AC y ${dcCount} DC`);
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
        selectedConnectors: this.selectedConnectors,
        batteryCapacity: this.batteryCapacity  // Pasamos la capacidad de la batería seleccionada
      }
    };
    this.router.navigate(['/station-details'], navigationExtras);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'DISPONBILE':
        return 'Disponible';
      case 'OCUPADO':
        return 'Cargando';
      case 'INOPERATIVO':
      case 'BLOQUEADO':
      case 'REMOVED':
      case 'FUERA DE LINEA':
      case 'NO DISPONIBLE':
        return 'No disponible';
      default:
        return 'Desconocido';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'DISPONBILE':
        return 'green';
      case 'OCUPADO':
        return 'yellow';
      case 'INOPERATIVO':
      case 'BLOQUEADO':
      case 'REMOVED':
      case 'FUERA DE LINEA':
      case 'NO DISPONIBLE':
        return 'red';
      default:
        return 'gray';
    }
  }


  getConnectorStatus(station: any) {
    const connectorsInStation = station.evses.map((evse: any) => evse.connectors).flat();
  
    // Establecemos el power_type basado en el estándar si es nulo
    connectorsInStation.forEach((connector: any) => {
      if (!connector.power_type) {
        connector.power_type = this.getPowerTypeByStandard(connector.standard);
      }
    });
  
    const availableConnectors = connectorsInStation.filter(
      (connector: { status: string }) => connector.status === 'DISPONIBLE'
    );
    const chargingConnectors = connectorsInStation.filter(
      (connector: { status: string }) => connector.status === 'OCUPADO'
    );
    const unavailableConnectors = connectorsInStation.filter(
      (connector: { status: string }) => connector.status === 'NO DISPONIBLE'
    );
  
    const acCount = availableConnectors.filter(
      (connector: { power_type: string }) => connector.power_type?.startsWith('AC')
    ).length;
    const dcCount = availableConnectors.filter(
      (connector: { power_type: string }) => connector.power_type?.startsWith('DC')
    ).length;
  
    const acChargingCount = chargingConnectors.filter(
      (connector: { power_type: string }) => connector.power_type?.startsWith('AC')
    ).length;
    const dcChargingCount = chargingConnectors.filter(
      (connector: { power_type: string }) => connector.power_type?.startsWith('DC')
    ).length;
  
    // Agregamos los contadores de no disponibles
    const acUnavailableCount = unavailableConnectors.filter(
      (connector: { power_type: string }) => connector.power_type?.startsWith('AC')
    ).length;
    const dcUnavailableCount = unavailableConnectors.filter(
      (connector: { power_type: string }) => connector.power_type?.startsWith('DC')
    ).length;
  
    const statusDetails = [
      {
        label: 'Disponible',
        count: availableConnectors.length,
        color: '#279769'
      },
      {
        label: 'Cargando',
        count: chargingConnectors.length,
        color: '#ffcc00'
      },
      {
        label: 'No disponible',
        count: unavailableConnectors.length,
        color: '#f53d3d'
      }
    ];
  
    return {
      totalConnectors: availableConnectors.length + chargingConnectors.length + unavailableConnectors.length,
      statusDetails,
      acCount,
      dcCount,
      acChargingCount,
      dcChargingCount,
      acUnavailableCount, // Devolvemos el contador de no disponibles AC
      dcUnavailableCount  // Devolvemos el contador de no disponibles DC
    };
  }

    // Método auxiliar para asignar el power_type basado en el estándar
    getPowerTypeByStandard(standard: string): string {
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


  showPowerTypeCounts(): boolean {
    return this.selectedConnectors.some(c => c.power_type.startsWith('AC')) && this.selectedConnectors.some(c => c.power_type.startsWith('DC'));
  }

  // Métodos para horarios de aperturas y cierres
  getOpeningHours(station: any): string {
    const regularHours = station.opening_times.regular_hours;
  
    if (station.opening_times.twentyfourseven) {
      return 'Abierto 24/7';
    }
  
    if (regularHours.length === 0) {
      return 'No disponible';
    }
  
    let result = '';
    let weekdayRanges: { start: number; end: number; period_begin: string; period_end: string }[] = [];
  
    // Asegurarse de que todos los días de la semana se cubran, incluso los que no están en el arreglo regularHours
    const diasCubiertos = new Set(regularHours.map((h: { weekday: any; }) => h.weekday));
  
    // Agregar días faltantes como "Cerrado"
    for (let i = 1; i <= 7; i++) {
      if (!diasCubiertos.has(i)) {
        regularHours.push({
          weekday: i,
          period_begin: 'Cerrado',
          period_end: 'Cerrado'
        });
      }
    }
  
    // Agrupar días consecutivos con el mismo horario
    for (let i = 0; i < regularHours.length; i++) {
      const currentDay = regularHours[i];
      const lastRange = weekdayRanges[weekdayRanges.length - 1];
  
      if (
        lastRange &&
        lastRange.period_begin === currentDay.period_begin &&
        lastRange.period_end === currentDay.period_end &&
        lastRange.end === currentDay.weekday - 1
      ) {
        // Extender el rango de días si tienen el mismo horario
        lastRange.end = currentDay.weekday;
      } else {
        // Agregar un nuevo rango de días
        weekdayRanges.push({
          start: currentDay.weekday,
          end: currentDay.weekday,
          period_begin: currentDay.period_begin,
          period_end: currentDay.period_end,
        });
      }
    }
  
    // Formatear el resultado
    weekdayRanges.forEach((range, index) => {
      const dayStart = this.getDayName(range.start);
      const dayEnd = this.getDayName(range.end);
      const hours = range.period_begin === 'Cerrado' ? 'Cerrado' : `${range.period_begin} a ${range.period_end}`;
  
      if (dayStart === dayEnd) {
        result += `${dayStart}: ${hours}`;
      } else {
        result += `De ${dayStart} ${range.period_begin} a ${dayEnd} ${range.period_end}`;
      }
  
      if (index < weekdayRanges.length - 1) {
        result += '<br>'; // Agregar salto de línea HTML
      }
    });
  
    return result;
  }
  
  getDayName(weekday: number): string {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return days[weekday - 1]; // Ajustar el índice para que el día 1 sea Lunes
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

  removeDuplicateStations(stations: any[]): any[] {
    const stationMap = new Map();
    stations.forEach(station => {
      if (!stationMap.has(station.location_id)) {
        stationMap.set(station.location_id, station);
      }
    });
    return Array.from(stationMap.values());
  }

    // Nueva función para refrescar la lista de estaciones manteniendo los filtros
    async refreshStationsWithFilters() {
      if (!this.userLocation) {
        console.error('Ubicación del usuario no disponible');
        return;
      }
    
      const loading = await this.loadingController.create({
        message: 'Actualizando estaciones...',
        spinner: 'circles',
      });
      await loading.present();
    
      try {
        const connectorIds = this.selectedConnectors.map(c => c.connector_id); // Mantener filtro de conectores
        const pse = this.selectedPSE; // Mantener filtro PSE
        const originalDistance = this.selectedDistance; // Guardar el filtro de distancia actual
        this.selectedDistance = 0; // Restaurar el filtro de distancia a 0
    
        let allStations: Station[] = [];
        let currentPage = 1;
        const totalPages = 10; // Limitar la consulta a las primeras 10 páginas
    
        // Realizar la consulta por páginas
        while (currentPage <= totalPages) {
          try {
            const response = await this.http
              .get<{ items: Station[] }>(`${this.apiUrlSec}?page=${currentPage}`)
              .toPromise();
    
            if (response && Array.isArray(response.items)) {
              allStations = allStations.concat(response.items);
            } else {
              console.error('La respuesta de la API no tiene un array en "items":', response);
            }
          } catch (error) {
            console.error('Error al obtener la página', currentPage, error);
            break; // Salir del bucle en caso de error
          }
          currentPage++;
        }
    
        // Filtrar las estaciones obtenidas según conectores válidos
        this.stations = allStations.filter((station: Station) => {
          const hasValidEVSEs = station.evses.some((evse: EVSE) =>
            evse.status === 'DISPONIBLE' &&
            evse.connectors.some((connector: Connector) => connectorIds.includes(connector.connector_id))
          );
    
          // Mantener únicamente los EVSEs y conectores válidos
          station.evses.forEach((evse: EVSE) => {
            evse.connectors = evse.connectors.filter((connector: Connector) =>
              connectorIds.includes(connector.connector_id)
            );
          });
          station.evses = station.evses.filter((evse: EVSE) => evse.connectors.length > 0);
    
          return hasValidEVSEs;
        });
    
        // Filtrar por PSE si está activo
        if (pse) {
          this.stations = this.stations.filter((station: Station) => station.pse && station.pse.includes(pse));
        }
    
        // Ordenar por cercanía usando la ubicación del usuario
        this.stations = this.stations
          .map(station => {
            station.distance = this.calculateDistanceForRefresh(
              this.userLocation!.latitude,
              this.userLocation!.longitude,
              parseFloat(station.coordinates.latitude),
              parseFloat(station.coordinates.longitude)
            ).toFixed(1); // Calcular y redondear distancia
            return station;
          })
          .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)); // Ordenar por distancia ascendente
    
        console.log('Estaciones después de aplicar filtros y ordenar por distancia:', this.stations);
      } catch (error) {
        console.error('Error al refrescar estaciones:', error);
      } finally {
        await loading.dismiss();
        console.log(`Refresco completado. El filtro de distancia fue restaurado a 0, los otros filtros permanecen activos.`);
      }
    }

    calculateDistanceForRefresh(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const R = 6371; // Radio de la Tierra en km
      const dLat = this.deg2radForRefresh(lat2 - lat1);
      const dLon = this.deg2radForRefresh(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.deg2radForRefresh(lat1)) * Math.cos(this.deg2radForRefresh(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distancia en kilómetros
    }
    
    deg2radForRefresh(deg: number): number {
      return deg * (Math.PI / 180);
    }
  }

