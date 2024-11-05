import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin, interval, Subscription } from 'rxjs';
import { tap, mergeMap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Variables de configuración
  private apiUrl = 'https://backend.electromovilidadenlinea.cl/locations';
  private token = 'eyJraWQiOiJvSWM1K3NpU25yWnZ3...'; // Token (truncado por seguridad)

  private cache: any[] = [];
  private cacheLifetime = 2 * 3600 * 1000; // 2 horas
  private lastFetchTime = 0;
  private updateInterval = 5 * 60 * 1000; // 5 minutos
  private cacheFirstSearchLifetime = 7 * 24 * 3600 * 1000; // 7 días
  private updateSubscription: Subscription | null = null;

  constructor(private http: HttpClient) {
    this.startConnectorStatusUpdates();
  }

  // -------------------------------------------------------------------------
  //  Métodos Privados
  // -------------------------------------------------------------------------
  
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
  }

  private isCacheValid(): boolean {
    const cacheValid = Date.now() - this.lastFetchTime < this.cacheLifetime;
    return cacheValid;
  }

  private fetchLocations(page: number): Observable<any> {
    const url = `${this.apiUrl}?page=${page}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  private startConnectorStatusUpdates() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }

    this.updateSubscription = interval(this.updateInterval)
      .pipe(
        switchMap(() => {
          const connectorIds = this.cache.reduce(
            (acc, station) =>
              acc.concat(
                station.evses.reduce(
                  (innerAcc: any[], evse: { connectors: any[] }) =>
                    innerAcc.concat(evse.connectors.map((connector) => connector.connector_id)),
                  []
                )
              ),
            []
          );
          return forkJoin(connectorIds.map((id: number) => this.getConnectorStatus(id)));
        }),
        tap((updatedConnectors: any) => {
          updatedConnectors.forEach((connector: any) =>
            this.updateCacheWithConnectorStatus(connector)
          );
        })
      )
      .subscribe();
  }

  // -------------------------------------------------------------------------
  //  Métodos de Caché
  // -------------------------------------------------------------------------
  
  // Métodos para la cache de la búsqueda principal (first-search)
  
  storeFirstSearchCache(data: any) {
    try {
      localStorage.setItem('cacheFirst-Search', JSON.stringify(data));
      localStorage.setItem('firstSearchCacheTime', Date.now().toString());
    //  console.log('Filtros almacenados en cacheFirst-Search:', data);
    } catch (error) {
      console.error('Error al almacenar en cacheFirst-Search:', error);
    }
  }

  getFirstSearchCache(): any {
    try {
      const cachedFilters = localStorage.getItem('cacheFirst-Search');
      return cachedFilters ? JSON.parse(cachedFilters) : null;
    } catch (error) {
      console.error('Error al recuperar cacheFirst-Search:', error);
      return null;
    }
  }


  checkFirstSearchCacheValidity(): boolean {
    const cachedTime = localStorage.getItem('firstSearchCacheTime');
    if (cachedTime) {
      const cacheValid = Date.now() - parseInt(cachedTime, 10) < this.cacheFirstSearchLifetime;
      return cacheValid;
    }
    return false;
  }


  clearFirstSearchCache() {
    localStorage.removeItem('cacheFirst-Search');
    localStorage.removeItem('firstSearchCacheTime');
  //  console.log('cacheFirst-Search cleared');
  }

  // Métodos para la cache de las ubicaciones y conectores

  clearCache() {
    localStorage.clear();
    this.cache = [];
    this.lastFetchTime = 0;
   // console.log('Cache cleared');
  }

  updateCacheWithConnectorStatus(updatedConnector: any) {
    this.cache.forEach((station) => {
      station.evses.forEach((evse: { connectors: { connector_id: any; status: any; last_updated: any }[] }) => {
        evse.connectors.forEach((connector: { connector_id: any; status: any; last_updated: any }) => {
          if (connector.connector_id === updatedConnector.connector_id) {
            connector.status = updatedConnector.status;
            connector.last_updated = updatedConnector.last_updated;
          }
        });
      });
    });
  }

  // -------------------------------------------------------------------------
  //  Métodos Públicos
  // -------------------------------------------------------------------------

  fetchAllLocations(): Observable<any> {
    if (this.isCacheValid()) {
      return of(this.cache);
    }

    return this.fetchLocations(1).pipe(
      tap((response) => {
        this.cache = response.items || [];
        this.lastFetchTime = Date.now();
        localStorage.setItem('cache', JSON.stringify(this.cache));
        localStorage.setItem('lastFetchTime', this.lastFetchTime.toString());
      }),
      mergeMap((response) => {
        const totalPages = response.total_pages;
        const requests: Observable<any>[] = [];

        for (let page = 2; page <= totalPages; page++) {
          requests.push(this.fetchLocations(page));
        }

        return forkJoin(requests).pipe(
          tap((responses) => {
            responses.forEach((res) => {
              this.cache = this.cache.concat(res.items || []);
            });
            localStorage.setItem('cache', JSON.stringify(this.cache));
          }),
          mergeMap(() => of(this.cache))
        );
      })
    );
  }

  getConnectors(): Observable<any> {
    return this.fetchAllLocations().pipe(
      mergeMap((locations: any[]) => {
        const connectors = locations.reduce((acc, location) => {
          const locationConnectors = location.evses.reduce(
            (innerAcc: any[], evse: { connectors: any }) => {
              return innerAcc.concat(evse.connectors);
            },
            []
          );
          return acc.concat(locationConnectors);
        }, []);
        return of(connectors);
      })
    );
  }

  getStationsByConnectors(connectorIds: number[]): Observable<any> {
    return this.fetchAllLocations().pipe(
      mergeMap((locations: any[]) => {
        const filteredLocations = locations.filter((location) =>
          location.evses.some((evse: { connectors: { connector_id: number }[] }) =>
            evse.connectors.some((connector: { connector_id: number }) =>
              connectorIds.includes(connector.connector_id)
            )
          )
        );
        return of(filteredLocations);
      })
    );
  }

  getConnectorStatus(connectorId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/connector-status?connectorId=${connectorId}`);
  }

  stopConnectorStatusUpdates() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
      this.updateSubscription = null;
    }
  }

  // Métodos para verificar si es la primera carga

  setFirstLoad(value: boolean) {
    localStorage.setItem('isFirstLoad', JSON.stringify(value));
  }
  
  isFirstLoad() {
    return JSON.parse(localStorage.getItem('isFirstLoad') || 'true');
  }
}
