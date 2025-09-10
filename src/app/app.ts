import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './auth.service';
import { UserTableComponent } from './user-table/user-table';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, AsyncPipe, MatToolbarModule, MatButtonModule, UserTableComponent],
  templateUrl: './app.html'
})
export class AppComponent {
  // 👇 public clientId so template can access it
  clientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  constructor(public auth: AuthService) {}
}
