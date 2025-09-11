// src/app/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment'; // 👈 import environment

export interface User {
  name: string;
  age: number;
  contact: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // 👇 Base URL from environment
  private apiBase = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  // ✅ Attach token in headers
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('gcp_id_token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  // ✅ Fetch all users (from GCS Excel file)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiBase, { headers: this.getHeaders() });
  }

  // ✅ Upload/overwrite users (GCS Excel file)
  addUser(user: User): Observable<any> {
    // backend expects an ARRAY of users, not a single object
    return this.http.post<any>(
      `${this.apiBase}/upload`,
      [user], // wrap in array
      { headers: this.getHeaders() }
    );
  }

  // ❌ Not supported by backend (commented out for now)
  // updateUser(user: User): Observable<User> { ... }
  // deleteUser(id: string): Observable<void> { ... }
}
