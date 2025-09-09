// src/app/auth/auth.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private clientId = 'YOUR_GCP_CLIENT_ID.apps.googleusercontent.com';
  private redirectUri = 'http://localhost:4200';
  private scope = 'openid email profile';

  // Observable for template
  private userSubject = new BehaviorSubject<any>(null);
  user$: Observable<any> = this.userSubject.asObservable();

  constructor() {
    // Check token on service init
    const token = localStorage.getItem('gcp_token');
    if (token) {
      this.userSubject.next({ token });
    }
  }

  login() {
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `response_type=token&` +
      `scope=${encodeURIComponent(this.scope)}`;
    window.location.href = authUrl;
  }

  handleAuthCallback() {
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const token = params.get('access_token');
      if (token) {
        localStorage.setItem('gcp_token', token);
        this.userSubject.next({ token });
        console.log('✅ Logged in, token saved:', token);
      }
    }
  }

  logout() {
    localStorage.removeItem('gcp_token');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('gcp_token');
  }
}
