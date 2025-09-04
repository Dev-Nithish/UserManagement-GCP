import { bootstrapApplication } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule, provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }, // ✅ register interceptor
  ],
}).catch(console.error);
