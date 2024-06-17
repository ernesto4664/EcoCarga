import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin, interval, Subscription } from 'rxjs';
import { tap, mergeMap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://backend.electromovilidadenlinea.cl/locations';
  private token = 'eyJraWQiOiJvSWM1K3NpU25yWnZ3Y3YxS294UVwvR29HWEM3VVc2VVVPOHV2dXVjT095OD0iLCJhbGciOiJSUzI1NiJ9.eyJjdXN0b206cmVnaW9uIjoiVGFyYXBhY8OhIiwic3ViIjoiNDRjOGI0MzgtNjAxMS03MGQ3LWVkZDgtNWYwY2Y5MzMwZGFhIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImN1c3RvbTphZGRyZXNzIjoiQ2hpbGUiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9wbHdaNTBkeHUiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOmZhbHNlLCJjb2duaXRvOnVzZXJuYW1lIjoiMTExMTEyMjIzIiwiY3VzdG9tOmNvbW11bmUiOiJDYW1pw7FhIiwib3JpZ2luX2p0aSI6IjgzZGRlODgxLTI2YzgtNDRjMS1hNzJmLTVjODdkNWIzMGYwZiIsImF1ZCI6IjQzc2Z0c2RyaXRscDNybXEzZzA1cThxM3JpIiwiZXZlbnRfaWQiOiI4OWJhOWQ5Zi1hYjk0LTQ3NGMtYWM0NS0xYmU3NDU1YjQyZWYiLCJ0b2tlbl91c2UiOiJpZCIsImN1c3RvbTpzZWNfdmFsaWRhdGlvbiI6ImZhbHNlIiwiYXV0aF90aW1lIjoxNzE3MDg2NDc1LCJuYW1lIjoiU3VwZXJ2aXNvcjEiLCJwaG9uZV9udW1iZXIiOiIrNTY5NzI5NDc4MjMiLCJjdXN0b206ZGJfdXNlcmlkIjoiMTExIiwiZXhwIjoxNzE3MDkwMDc1LCJpYXQiOjE3MTcwODY0NzUsImp0aSI6Ijk1ZWU2NmY1LWQxMmYtNDRmZS1hMzViLTI2MjFhMTMyY2YxZiIsImVtYWlsIjoiY3ZpZGFsQHNlYy5jbCJ9.mOUtZ9y4YZKfklhvojbJNv-x7c09HpoKtQTNsl1o9j9fo-CzDtkC6FHB70ZV0COv2kRxRteXRn6pQPRH9_-bTCvgoT5WwXwSJiyibz-HhvSFfxOsCZoVCI24ck9FPMVnxHpYf8kGTQjpvs_yTu1zUJg4x93xJH44AlrSuUoFhL0tO0axvo6Ru1xUIXxfdapNKjGVT9HvWzANG3-ZWMjxKh_cXfALylZpe4-U-g3BJ9ediAejbRo7I0IniCwh0jqxModWLL3waMIds55C0vrvKKO-8P5deOI_5B0kux6wzd3ENKH9vLf7dx0nX5Ex264FjfNmQfUTuFki8_0_XF5XSA';
  private cache: any[] = [];
  private cacheLifetime = 12 * 3600 * 1000; // 12 horas en milisegundos
  private lastFetchTime: number = 0;
  private updateInterval = 45 * 60 * 1000; // 45 minutos en milisegundos
  private updateSubscription: Subscription | null = null;

  constructor(private http: HttpClient) {
    this.startConnectorStatusUpdates();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
  }

  private isCacheValid(): boolean {
    return (Date.now() - this.lastFetchTime) < this.cacheLifetime;
  }

  private fetchLocations(page: number): Observable<any> {
    const url = `${this.apiUrl}?page=${page}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  fetchAllLocations(): Observable<any> {
    if (this.cache.length > 0 && this.isCacheValid()) {
      return of(this.cache);
    }

    const initialFetch = this.fetchLocations(1).pipe(
      tap(response => {
        this.cache = response.items || [];
        this.lastFetchTime = Date.now();
      })
    );

    return initialFetch.pipe(
      mergeMap(response => {
        const totalPages = response.total_pages;
        const requests: Observable<any>[] = [];

        for (let page = 2; page <= totalPages; page++) {
          requests.push(this.fetchLocations(page));
        }

        return forkJoin(requests).pipe(
          tap(responses => {
            responses.forEach(res => {
              this.cache = this.cache.concat(res.items || []);
            });
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
          const locationConnectors = location.evses.reduce((innerAcc: any[], evse: { connectors: any; }) => {
            return innerAcc.concat(evse.connectors);
          }, []);
          return acc.concat(locationConnectors);
        }, []);
        return of(connectors);
      })
    );
  }

  getStationsByConnectors(connectorIds: number[]): Observable<any> {
    return this.fetchAllLocations().pipe(
      mergeMap((locations: any[]) => {
        const filteredLocations = locations.filter(location =>
          location.evses.some((evse: { connectors: { connector_id: number; }[]; }) =>
            evse.connectors.some((connector: { connector_id: number; }) =>
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

  updateCacheWithConnectorStatus(updatedConnector: any) {
    this.cache.forEach(station => {
      station.evses.forEach((evse: { connectors: { connector_id: any; status: any; last_updated: any; }[]; }) => {
        evse.connectors.forEach((connector: { connector_id: any; status: any; last_updated: any; }) => {
          if (connector.connector_id === updatedConnector.connector_id) {
            connector.status = updatedConnector.status;
            connector.last_updated = updatedConnector.last_updated;
          }
        });
      });
    });
  }

  private startConnectorStatusUpdates() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }

    this.updateSubscription = interval(this.updateInterval).pipe(
      switchMap(() => {
        const connectorIds = this.cache.reduce((acc, station) => 
          acc.concat(station.evses.reduce((innerAcc: any[], evse: { connectors: any[]; }) => 
            innerAcc.concat(evse.connectors.map(connector => connector.connector_id)), [])), []);
        return forkJoin(connectorIds.map((id: number) => this.getConnectorStatus(id)));
      }),
      tap((updatedConnectors: any) => {
        updatedConnectors.forEach((connector: any) => this.updateCacheWithConnectorStatus(connector));
      })
    ).subscribe();
  }

  // Método para detener las actualizaciones
  stopConnectorStatusUpdates() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
      this.updateSubscription = null;
    }
  }
}
