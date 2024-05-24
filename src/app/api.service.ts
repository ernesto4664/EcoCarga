import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://vn1oyckreb.execute-api.us-east-1.amazonaws.com/prod';
  private token = 'eyJraWQiOiJvSWM1K3NpU25yWnZ3Y3YxS294UVwvR29HWEM3VVc2VVVPOHV2dXVjT095OD0iLCJhbGciOiJSUzI1NiJ9.eyJjdXN0b206cmVnaW9uIjoiQW50b2ZhZ2FzdGEiLCJzdWIiOiIzNDg4ODQ2OC0yMDYxLTcwMGQtZGRhOS0xMDc0ZTgyNTE3NjEiLCJlbWFsbF92ZXJpZmllZCI6dHJ1ZSwiY3VzdG9tOmFkZHJlc3MiOiJMYSBHbG9yaWEgNzciLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9wbHdaNTBkeHUiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOmZhbHNlLCJjb2duaXRvOnVzZXJuYW1lIjoiNTA5OTk4ODgyIiwiY3VzdG9tOmNvbW11bmUiOiJPbGxhZ8O8ZSIsIm9yaWdpbl9qdGkiOiIwZDliMWRiZi1iMzI0LTQxZGUtYmEzMS1jYzUwYmNjNTgwMjQiLCJhdWQiOiI0M3NmdHNkcml0bHAzcm1xM2cwNXE4cTNyaSIsImV2ZW50X2lkIjoiYWIyZTVjNTctYTA3Yi00OTQxLTg5YzctZjg3ZmRjZmM3NDY4IiwidG9rZW5fdXNlIjoiaWQiLCJjdXN0b206c2VjX3ZhbGlkYXRpb24iOiJUcnVlIiwiYXV0aF90aW1lIjoxNzE2NDg0ODU1LCJuYW1lIjoidXNlciAwMiIsInBob25lX251bWJlciI6Iis1Njk3Mjk0NzgyMSIsImN1c3RvbTpkYl91c2VyaWQiOiIxMTYiLCJleHAiOjE3MTY0ODg0NTUsImlhdCI6MTcxNjQ4NDg1NSwianRpIjoiOGQxZjM3NjEtNDJlYy00NDQ5LWExNmUtMTFiNjM5ODNkNWJmIiwiZW1haWwiOiJjbW9udG95YUBhcmtoby5pbyJ9.NOzcBzlnOjDX6mcYQWYBYekBWuyWGhHWmi2jjxrZpTTCtpP_liEDh5dEezblYXZ20ESJFRHo17QwIWoouC28E2nr1ruzu_j7Jj7bxIHcoAIs0MvxhZKxQJGfL7zSK2bR2sYQ4EqoPYdKPsLP0ceUOu2glYgWmpKldcMaQuFlHAEJrXTuf2OWoaVxykeRml72_7JhEfjdoXaASqO-itW9cbjIbbiJjRFo9eckAk65dAAtWl8KyP7Dq5arRapxnSt-y0Tf2S2hI_TwATcPFW4NkAjFwsqYYiLZ9ierGDrrlqRpcYltztJ5LIyeph3QCekMsqd4xIKwkcS6PnUrNOji1g';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
  }

  getConnectors(): Observable<any> {
    const url = `${this.apiUrl}/connectors`;
    return this.http.get(url, { headers: this.getHeaders() });
  }
}