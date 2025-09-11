// src/app/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment'; // 👈 import environment

// 👇 Match frontend + backend schema
export interface User {
  id?: string;        // backend generates / Excel row index
  name: string;
  age: number;
  contact: string;
  createdAt?: string; // timestamp for sorting
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

  // ✅ Fetch all users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiBase, { headers: this.getHeaders() });
  }

  // ✅ Add a user (backend appends to Excel file)
  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiBase, user, { headers: this.getHeaders() });
  }

  // ✅ Update a user (backend edits Excel row by id)
  updateUser(user: User): Observable<User> {
    if (!user.id) throw new Error('User ID is missing');
    return this.http.put<User>(`${this.apiBase}/${user.id}`, user, {
      headers: this.getHeaders()
    });
  }

  // ✅ Delete a user (backend removes Excel row by id)
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
