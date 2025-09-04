import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User
} from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user$ = new BehaviorSubject<User | null>(null);
  user$ = this._user$.asObservable();

  constructor(private afAuth: Auth) {
    // Listen for login/logout changes automatically
    this.afAuth.onAuthStateChanged((user) => {
      this._user$.next(user);
    });
  }

  // 🔐 Signup
  async signup(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(this.afAuth, email, password);
    this._user$.next(userCredential.user);
    return userCredential.user;
  }

  // 🔑 Login
  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.afAuth, email, password);
    this._user$.next(userCredential.user);
    return userCredential.user;
  }

  // 🚪 Logout
  async logout() {
    await signOut(this.afAuth);
    this._user$.next(null);
  }

  // 👤 Get current user (Firebase User object)
  get currentUser() {
    return this._user$.value;
  }

  // ✅ Login status
  isLoggedIn() {
    return !!this._user$.value;
  }
}
