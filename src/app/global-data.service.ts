import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalDataService {
  private connectorsSubject = new BehaviorSubject<any[]>([]);
  public connectors$ = this.connectorsSubject.asObservable();

  constructor(private apiService: ApiService) {}

  fetchAllConnectors() {
    this.apiService.fetchAllLocations().subscribe(
      (response: any) => {
        if (Array.isArray(response)) {
          const allConnectors = response.reduce((acc: any[], station: any) => 
            acc.concat(station.evses.reduce((innerAcc: any[], evse: { connectors: any; }) => 
              innerAcc.concat(evse.connectors), [])), []);
          this.connectorsSubject.next(allConnectors);
        } else {
          console.error('Formato de respuesta API inesperado:', response);
        }
      },
      (error) => {
        console.error('Error al recuperar conectores:', error);
      }
    );
  }

  getConnectors(): Observable<any[]> {
    return this.connectors$;
  }
}
