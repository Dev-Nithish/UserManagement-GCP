import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getAuth } from 'firebase/auth';

export interface User {
  id?: string;
  name: string;
  age: number;
  contact: string;
  createdAt?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // ✅ Use exact backend deployed URL
  private apiUrl = "https://us-central1-angular-project6-937580556914.cloudfunctions.net/api";


  constructor(private http: HttpClient) {}

  // Always fetch fresh Firebase token
  private getAuthHeaders(): Observable<HttpHeaders> {
    const auth = getAuth();
    if (!auth.currentUser) throw new Error('No user logged in');

    return from(auth.currentUser.getIdToken(true)).pipe(
      switchMap(token => [new HttpHeaders({ Authorization: `Bearer ${token}` })])
    );
  }

  // 🔥 CRUD Operations
  getUsers(): Observable<User[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<User[]>(`${this.apiUrl}/users`, { headers }))
    );
  }

  addUser(user: User): Observable<User> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.post<User>(`${this.apiUrl}/users`, user, { headers }))
    );
  }

  updateUser(user: User): Observable<User> {
    if (!user.id) throw new Error('User ID is missing');
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user, { headers }))
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.delete<void>(`${this.apiUrl}/users/${id}`, { headers }))
    );
  }
}
