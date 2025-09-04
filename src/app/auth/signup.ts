import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-signup',
  template: `
    <h2>Signup</h2>
    <form (ngSubmit)="signup()">
      <input [(ngModel)]="email" name="email" placeholder="Email" required />
      <input [(ngModel)]="password" name="password" type="password" placeholder="Password" required />
      <button type="submit">Signup</button>
    </form>
    <p>Already have an account? <a routerLink="/login">Login</a></p>
  `,
  standalone: true,
  imports: [FormsModule]
})
export class SignupComponent {
  email = '';
  password = '';

  constructor(private auth: Auth, private router: Router) {}

  async signup() {
    try {
      await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      this.router.navigate(['/login']); // after signup, go to login
    } catch (err) {
      console.error(err);
      alert('Signup failed');
    }
  }
}
