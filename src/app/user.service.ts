import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDocs, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

// Firebase config — replace with your project config
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
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
