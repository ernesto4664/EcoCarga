import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TermsAndConditionsService {

  private apiUrl = 'http://18.116.216.219/api/TermsAndConditionsApi';

  constructor(private http: HttpClient) { }

  getTermsAndConditions(): Observable<any> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(terms => terms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    );
  }
}
