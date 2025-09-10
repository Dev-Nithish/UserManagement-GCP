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
  // 👇 declare clientId here (public so it's accessible inside methods)
  clientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/users']);
    }
  }

  login() {
    // ✅ now works since clientId exists
    this.auth.login(this.clientId);
  }
}
