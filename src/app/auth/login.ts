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

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/users']);
    }
  }

  login() {
    // ✅ just call login without arguments
    this.auth.login();
  }
}
