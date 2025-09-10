import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';

// 👉 Google Identity Services (GIS) SDK
declare const google: any;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'gcp_id_token';

  // Observable for template or subscription
  private userSubject = new BehaviorSubject<any>(null);
  user$: Observable<any> = this.userSubject.asObservable();

  // Use the OAuth Client ID from environment
  private clientId = environment.googleClientId;

  constructor(private router: Router) {
    // Load token from localStorage if available
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.userSubject.next({ token });
    }
  }

  // Trigger Google Login
  login() {
    google.accounts.id.initialize({
      client_id: this.clientId,
      auto_select: false, // optional, prevents auto prompt if user is already signed in
      callback: (response: any) => this.handleAuthCallback(response),
    });
    google.accounts.id.prompt();
  }

  // Handle login response
  handleAuthCallback(response?: any): void {
    if (!response?.credential) {
      console.error('❌ No credential returned from Google Identity Service');
      return;
    }

    // Store token
    localStorage.setItem(this.tokenKey, response.credential);

    // Update observable
    this.userSubject.next({ token: response.credential });

    console.log('✅ Google ID Token stored:', response.credential);

    // Navigate to your app route
    this.router.navigate(['/users']);
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Get token (for backend API calls)
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Login status
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
