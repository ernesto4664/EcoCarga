import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class TermsAndConditionsService {

  private apiUrlWeb = environment.apiUrlWeb;

  constructor(private http: HttpClient) { }

  getTermsAndConditions(): Observable<any> {
    // Headers personalizados si es necesario
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', // Tipo de contenido JSON
      // Agrega cualquier otro header que necesites
    });
  
    // Imprimir la URL para verificar que es correcta
   // console.log('Consultando la URL de la API:', this.apiUrl);
  
    return this.http.get<any[]>(this.apiUrlWeb, { headers })
      .pipe(
        map(data => {
          // Procesar datos aquí si es necesario
          return data;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching terms and conditions:', error);
  
          // Detalles del error
        //  console.log('Detalles completos del error:', error);
  
          if (error.status === 0) {
            // Error de red o el servidor no responde
            console.error('A network error occurred or the server is not responding.');
          } else {
            // Error del backend, muestra detalles del estado y el cuerpo de la respuesta
            console.error(`Backend returned code ${error.status}, body was: ${JSON.stringify(error.error)}`);
          //  console.log(`URL consultada: ${error.url}`);
          }
  
          // Devolver un error más específico al componente que lo consuma
          return throwError(() => new Error('Something went wrong; please try again later.'));
        })
      );
  }
}
