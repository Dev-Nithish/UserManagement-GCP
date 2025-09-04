import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent {
  mode: 'landing' | 'login' | 'signup' = 'landing';
  email = '';
  password = '';
  name = '';
  message = '';

  constructor(private auth: AuthService) {}

  goLogin() { this.mode = 'login'; this.message = ''; }
  goSignup() { this.mode = 'signup'; this.message = ''; }
  back() { this.mode = 'landing'; this.message = ''; }

  async submitLogin() {
    this.message = '';
    try {
      await this.auth.login(this.email, this.password);
      // AppComponent will auto-switch when auth state changes
    } catch (e: any) {
      this.message = e?.message ?? 'Login failed';
    }
  }

  async submitSignup() {
    this.message = '';
    try {
      await this.auth.signup(this.email, this.password);
      // Optional: save display name to Firestore later if needed
      this.message = 'Signup successful! You can now login.';
      this.mode = 'login';
    } catch (e: any) {
      this.message = e?.message ?? 'Signup failed';
    }
  }
}
