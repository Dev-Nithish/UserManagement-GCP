import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  template: `
    <h2>Login</h2>
    <form (ngSubmit)="login()">
      <input [(ngModel)]="email" name="email" placeholder="Email" required />
      <input [(ngModel)]="password" name="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p>Don’t have an account? <a routerLink="/signup">Sign up</a></p>
  `,
  standalone: true,
  imports: [FormsModule]
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: Auth, private router: Router) {}

  async login() {
    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      this.router.navigate(['/users']); // redirect to table
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  }
}
