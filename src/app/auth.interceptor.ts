import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Auth } from '@angular/fire/auth';
import { getIdToken } from 'firebase/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private afAuth: Auth) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the current user from Firebase Auth
    const user = this.afAuth.currentUser;

    if (!user) {
      // 🚫 Not logged in → forward request without token
      return next.handle(req);
    }

    // 🔑 Convert Promise to Observable → fetch a fresh ID token
    return from(getIdToken(user, true)).pipe(
      switchMap((token) => {
        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next.handle(cloned);
      })
    );
  }
}
