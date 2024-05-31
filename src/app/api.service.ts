import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { tap, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://backend.electromovilidadenlinea.cl/locations';
  private token = 'eyJraWQiOiJvSWM1K3NpU25yWnZ3Y3YxS294UVwvR29HWEM3VVc2VVVPOHV2dXVjT095OD0iLCJhbGciOiJSUzI1NiJ9.eyJjdXN0b206cmVnaW9uIjoiVGFyYXBhY8OhIiwic3ViIjoiNDRjOGI0MzgtNjAxMS03MGQ3LWVkZDgtNWYwY2Y5MzMwZGFhIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImN1c3RvbTphZGRyZXNzIjoiQ2hpbGUiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9wbHdaNTBkeHUiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOmZhbHNlLCJjb2duaXRvOnVzZXJuYW1lIjoiMTExMTEyMjIzIiwiY3VzdG9tOmNvbW11bmUiOiJDYW1pw7FhIiwib3JpZ2luX2p0aSI6IjgzZGRlODgxLTI2YzgtNDRjMS1hNzJmLTVjODdkNWIzMGYwZiIsImF1ZCI6IjQzc2Z0c2RyaXRscDNybXEzZzA1cThxM3JpIiwiZXZlbnRfaWQiOiI4OWJhOWQ5Zi1hYjk0LTQ3NGMtYWM0NS0xYmU3NDU1YjQyZWYiLCJ0b2tlbl91c2UiOiJpZCIsImN1c3RvbTpzZWNfdmFsaWRhdGlvbiI6ImZhbHNlIiwiYXV0aF90aW1lIjoxNzE3MDg2NDc1LCJuYW1lIjoiU3VwZXJ2aXNvcjEiLCJwaG9uZV9udW1iZXIiOiIrNTY5NzI5NDc4MjMiLCJjdXN0b206ZGJfdXNlcmlkIjoiMTExIiwiZXhwIjoxNzE3MDkwMDc1LCJpYXQiOjE3MTcwODY0NzUsImp0aSI6Ijk1ZWU2NmY1LWQx';

  private cache: any[] = [];
  private cacheLifetime = 12 * 3600 * 1000; // 12 hours in milliseconds
  private lastFetchTime: number = 0;

  constructor(private http: HttpClient) {}

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
          const locationConnectors = location.evses.reduce((innerAcc: string | any[], evse: { connectors: any; }) => {
            return innerAcc.concat(evse.connectors);
          }, []);
          return acc.concat(locationConnectors);
        }, []);
        this.cache = connectors;
        return of(this.cache);
      })
    );
  }
}