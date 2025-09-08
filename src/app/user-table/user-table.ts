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
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';

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
  users$!: Observable<User[]>;
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

  private loadUsers() {
    this.users$ = this.userService.getUsers();
    this.users$.subscribe(users => {
      this.displayedUsers = [...users];
      this.applySortAndFilter();
    });
  }

  private setupSpeechRecognition() {
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

  // ================= CRUD =================
  addOrUpdateUser() {
    const userWithTimestamp: User = { ...this.newUser, createdAt: Timestamp.now() };
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

  refreshUsers() {
    this.users$.pipe(take(1)).subscribe(users => {
      this.displayedUsers = [...users];
      this.applySortAndFilter();
    });
  }

  trackById(index: number, user: User): string {
    return user.id!;
  }

  // ================= Export/Import =================
  exportToExcel() {
    this.users$.pipe(take(1)).subscribe(users => {
      if (!users || users.length === 0) return;

      const worksheet = XLSX.utils.json_to_sheet(users.map(u => ({
        Name: u.name,
        Age: u.age,
        Contact: u.contact
      })));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'users.xlsx');
    });
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

          const user: User = { name, age, contact, createdAt: Timestamp.now() };
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

  // ================= Sort & Filter =================
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
    this.users$.pipe(take(1)).subscribe(users => {
      let result = [...users];

      if (this.filterMode === 'recent') result.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
      else if (this.filterMode === 'oldest') result.sort((a, b) => (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0));
      else if (this.filterMode === 'adults') result = result.filter(u => u.age >= 18);

      if (this.sortMode === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
      else if (this.sortMode === 'age') result.sort((a, b) => a.age - b.age);

      this.displayedUsers = result;
    });
  }

  // ================= Voice Control =================
  toggleListening() {
    this.isListening = !this.isListening;
    if (this.isListening) this.startListening();
    else this.stopListening();
  }

  startListening() {
    this.recognition?.start();
  }

  stopListening() {
    this.recognition?.stop();
  }

  handleSpeechResult(transcript: string) {
    transcript = transcript.toLowerCase();
    console.log('Recognized speech:', transcript);

    // 🟢 ADD USER
    if (transcript.includes('name')) {
      const nameMatch = transcript.match(/name\s+(\w+)/);
      const ageMatch = transcript.match(/age\s+(\d+)/);
      const contactMatch = transcript.match(/contact\s+(\d+)/);

      const name = nameMatch ? nameMatch[1] : '';
      const age = ageMatch ? parseInt(ageMatch[1], 10) : 0;
      const contact = contactMatch ? contactMatch[1] : '';

      if (name) {
        this.userService.addUser({ name, age, contact, createdAt: Timestamp.now() }).subscribe({
                      next: () => {
              this.snackBar.open(`✅ User ${name} added successfully`, 'Close', { duration: 3000 });
              this.refreshUsers();
            },
            error: (err) => console.error('Add user error:', err)
          });
      } else {
        this.snackBar.open(
          '❌ Could not understand. Try saying: "name Ram age 20 contact 98765"',
          'Close',
          { duration: 4000 }
        );
      }
      return;
    }

    // 🔴 DELETE USER
    if (transcript.startsWith('delete')) {
      const deleteMatch = transcript.match(/delete\s+(\w+)/);
      if (deleteMatch) {
        const nameToDelete = deleteMatch[1];
        this.users$.pipe(take(1)).subscribe(users => {
          const user = users.find(u => u.name.toLowerCase() === nameToDelete.toLowerCase());
          if (user && user.id) {
            this.userService.deleteUser(user.id).subscribe({
              next: () => {
                this.snackBar.open(`🗑️ User ${user.name} deleted`, 'Close', { duration: 3000 });
                this.refreshUsers();
              },
              error: (err) => console.error('Delete user error:', err)
            });
          } else {
            this.snackBar.open(`❌ No user found with name ${nameToDelete}`, 'Close', { duration: 3000 });
          }
        });
      }
      return;
    }

    // ✏️ UPDATE USER
    if (transcript.startsWith('update')) {
      const nameMatch = transcript.match(/update\s+(\w+)/);
      const ageMatch = transcript.match(/age\s+(\d+)/);
      const contactMatch = transcript.match(/contact\s+(\d+)/);

      if (nameMatch) {
        const nameToUpdate = nameMatch[1];
        this.users$.pipe(take(1)).subscribe(users => {
          const user = users.find(u => u.name.toLowerCase() === nameToUpdate.toLowerCase());
          if (user && user.id) {
            const updatedUser: User = { ...user };
            if (ageMatch) updatedUser.age = parseInt(ageMatch[1], 10);
            if (contactMatch) updatedUser.contact = contactMatch[1];

            this.userService.updateUser(updatedUser).subscribe({
              next: () => {
                this.snackBar.open(`✏️ User ${user.name} updated successfully`, 'Close', { duration: 3000 });
                this.refreshUsers();
              },
              error: (err) => console.error('Update user error:', err)
            });
          } else {
            this.snackBar.open(`❌ No user found with name ${nameToUpdate}`, 'Close', { duration: 3000 });
          }
        });
      }
      return;
    }

    // 🚨 Fallback
    this.snackBar.open(
      '❌ Could not understand. Try: "name Ram age 20 contact 98765", "delete Ram", or "update Ram age 25"',
      'Close',
      { duration: 5000 }
    );
  }
}
