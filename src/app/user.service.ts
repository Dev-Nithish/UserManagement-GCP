import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id?: string;
  name: string;
  age: number;
  contact: string;
  createdAt?: string; // ISO string from backend
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiBase = '/api/users';

  constructor(private http: HttpClient) {}

  // ✅ Helper to add Authorization header with GCP OAuth token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('gcp_id_token'); // Token from AuthService
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // 🔥 CRUD Operations via backend API
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiBase, { headers: this.getHeaders() });
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiBase, user, { headers: this.getHeaders() });
  }

  updateUser(user: User): Observable<User> {
    if (!user.id) throw new Error('User ID is missing');
    return this.http.put<User>(`${this.apiBase}/${user.id}`, user, { headers: this.getHeaders() });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/${id}`, { headers: this.getHeaders() });
  }
}
