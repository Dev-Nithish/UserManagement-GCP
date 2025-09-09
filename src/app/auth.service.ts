// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

// 👉 Google Identity Services (GIS) SDK
declare const google: any;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'gcp_id_token';

  // ✅ Observable for template
  private userSubject = new BehaviorSubject<any>(null);
  user$: Observable<any> = this.userSubject.asObservable();

  constructor(private router: Router) {
    const token = localStorage.getItem(this.tokenKey);
    if (token) this.userSubject.next({ token });
  }

  // 🔑 Trigger Google Login
  login() {
    google.accounts.id.initialize({
      client_id: 'YOUR_GCP_CLIENT_ID.apps.googleusercontent.com',
      callback: (response: any) => this.handleAuthCallback(response),
    });

    google.accounts.id.prompt(); // shows One Tap or popup
  }

  // 📥 Handle login response
  handleAuthCallback(response?: any) {
    const token = response?.credential || localStorage.getItem(this.tokenKey);
    if (response?.credential) {
      localStorage.setItem(this.tokenKey, response.credential);
      this.userSubject.next({ token: response.credential });
      console.log('✅ Google ID Token stored:', response.credential);

      this.router.navigate(['/users']);
    }
  }

  // 🚪 Logout
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  // 👤 Get token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // ✅ Login status
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
