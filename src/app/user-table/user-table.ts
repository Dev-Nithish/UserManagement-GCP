import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { UserService, User } from '../user.service';
import { take } from 'rxjs/operators';

declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.html',
  styleUrls: ['./user-table.css'],
  standalone: true,
  imports: [
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatCardModule,
    MatToolbarModule
  ]
})
export class UserTableComponent implements OnInit {
  displayedUsers: User[] = [];
  newUser: User = { name: '', age: 0, contact: '' };
  editMode = false;
  editingUserId: string | null = null;

  sortMode: 'name' | 'age' | null = null;
  filterMode: 'recent' | 'oldest' | 'adults' | null = null;

  recognition: any;
  isListening = false;

  constructor(private userService: UserService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadUsers();
    this.setupSpeechRecognition();
  }

  // ------------------- Load Users -------------------
  loadUsers() {
    this.userService.getUsers().pipe(take(1)).subscribe({
      next: (users) => {
        this.displayedUsers = [...users];
        this.applySortAndFilter();
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.displayedUsers = [];
      }
    });
  }

  refreshUsers() {
    this.loadUsers();
  }

  trackById(index: number, user: User): string {
    return user.id!;
  }

  // ------------------- CRUD -------------------
  addOrUpdateUser() {
    const userWithTimestamp = { ...this.newUser, createdAt: Date.now() };
    if (this.editMode && this.editingUserId) {
      this.userService.updateUser({ ...userWithTimestamp, id: this.editingUserId }).subscribe({
        next: () => {
          this.snackBar.open('✏️ User updated successfully', 'Close', { duration: 3000 });
          this.resetForm();
          this.refreshUsers();
        },
        error: (err) => console.error('Error updating user:', err)
      });
    } else {
      this.userService.addUser(userWithTimestamp).subscribe({
        next: () => {
          this.snackBar.open('✅ User added successfully', 'Close', { duration: 3000 });
          this.resetForm();
          this.refreshUsers();
        },
        error: (err) => console.error('Error adding user:', err)
      });
    }
  }

  editUser(user: User) {
    this.newUser = { ...user };
    this.editMode = true;
    this.editingUserId = user.id ?? null;
  }

  deleteUser(id: string | undefined) {
    if (!id) return;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.snackBar.open('🗑️ User deleted', 'Close', { duration: 3000 });
        this.refreshUsers();
      },
      error: (err) => console.error('Delete error:', err)
    });
  }

  resetForm() {
    this.newUser = { name: '', age: 0, contact: '' };
    this.editMode = false;
    this.editingUserId = null;
  }

  // ------------------- Export/Import -------------------
  exportToExcel() {
    if (!this.displayedUsers || this.displayedUsers.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(this.displayedUsers.map(u => ({
      Name: u.name,
      Age: u.age,
      Contact: u.contact
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'users.xlsx');
  }

  triggerFileInput() {
    const fileInput = document.getElementById('importFile') as HTMLInputElement;
    fileInput?.click();
  }

  importFile(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        jsonData.forEach(userData => {
          const name = userData.Name?.toString().trim();
          const age = Number(userData.Age);
          const contact = userData.Contact?.toString().trim();
          if (!name || isNaN(age) || !contact) return;

          const user: User = { name, age, contact, createdAt: Date.now() };
          this.userService.addUser(user).subscribe({
            next: () => this.refreshUsers(),
            error: (err) => console.error('Error adding user from import:', err)
          });
        });
      } catch (err) {
        console.error('Error reading Excel file:', err);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // ------------------- Sort & Filter -------------------
  toggleSort() {
    if (this.sortMode === null) this.sortMode = 'name';
    else if (this.sortMode === 'name') this.sortMode = 'age';
    else this.sortMode = null;
    this.applySortAndFilter();
  }

  toggleFilter() {
    if (this.filterMode === null) this.filterMode = 'recent';
    else if (this.filterMode === 'recent') this.filterMode = 'oldest';
    else if (this.filterMode === 'oldest') this.filterMode = 'adults';
    else this.filterMode = null;
    this.applySortAndFilter();
  }

  private applySortAndFilter() {
    let result = [...this.displayedUsers];

    if (this.filterMode === 'recent') result.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    else if (this.filterMode === 'oldest') result.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
    else if (this.filterMode === 'adults') result = result.filter(u => u.age >= 18);

    if (this.sortMode === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (this.sortMode === 'age') result.sort((a, b) => a.age - b.age);

    this.displayedUsers = result;
  }

  // ------------------- Voice Control -------------------
  setupSpeechRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
    this.recognition.continuous = false;

    this.recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript.toLowerCase();
      this.handleSpeechResult(transcript);
    };

    this.recognition.onerror = (event: any) => console.error('Speech recognition error:', event.error);
  }

  toggleListening() {
    this.isListening = !this.isListening;
    if (this.isListening) this.recognition?.start();
    else this.recognition?.stop();
  }

  handleSpeechResult(transcript: string) {
    // Your existing voice commands logic (unchanged)
  }
}
