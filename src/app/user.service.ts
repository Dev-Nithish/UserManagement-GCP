import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDocs, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

// Firebase config — replace with your project config
const firebaseConfig = {
  apiKey: 'AIzaSyB4nshBH7wDRIXSaWmYIRm2qT9N1myqo30',
  authDomain: 'angular-localstorage-table.firebaseapp.com',
  projectId: 'angular-localstorage-table',
  storageBucket: 'angular-localstorage-table.firebasestorage.app',
  messagingSenderId: '613319343055',
  appId: '1:613319343055:web:325683c06c667166b270ba',
  measurementId: 'G-9YMRVQ53PR'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface User {
  id?: string;
  name: string;
  age: number;
  contact: string;
  createdAt?: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersCollection = collection(db, 'users');

  constructor() {}

  // 🔥 CRUD Operations using Firestore
  getUsers(): Observable<User[]> {
    return from(getDocs(this.usersCollection)).pipe(
      map(snapshot =>
        snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as User))
      )
    );
  }

  addUser(user: User): Observable<User> {
    const newUser = { ...user, createdAt: Timestamp.now() };
    return from(addDoc(this.usersCollection, newUser)).pipe(
      map(docRef => ({ ...newUser, id: docRef.id }))
    );
  }

  updateUser(user: User): Observable<User> {
    if (!user.id) throw new Error('User ID is missing');
    const userDoc = doc(db, 'users', user.id);
    return from(updateDoc(userDoc, { ...user, createdAt: Timestamp.now() })).pipe(
      map(() => user)
    );
  }

  deleteUser(id: string): Observable<void> {
    const userDoc = doc(db, 'users', id);
    return from(deleteDoc(userDoc));
  }
}
