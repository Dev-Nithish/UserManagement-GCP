import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './auth.service';
import { AuthComponent } from './auth/auth';
import { UserTableComponent } from './user-table/user-table'; // your existing component

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, AsyncPipe, MatToolbarModule, MatButtonModule, AuthComponent, UserTableComponent],
  templateUrl: './app.html'
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
