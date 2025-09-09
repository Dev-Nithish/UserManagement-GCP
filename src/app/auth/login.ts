import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  template: `
    <h2>Login</h2>
    <button (click)="login()">Login with Google</button>
  `,
  standalone: true
})
export class LoginComponent implements OnInit {
  private clientId = '<YOUR_CLIENT_ID>.apps.googleusercontent.com'; // Replace with your actual GCP OAuth client ID

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/users']);
    }
  }

  login() {
    // Pass clientId to the AuthService
    this.auth.login(this.clientId);
  }
}
