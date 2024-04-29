import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'https://backend.qaseciop.com/locations'; //URL real de tu API

  constructor(private http: HttpClient) { }

  getDatos(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}