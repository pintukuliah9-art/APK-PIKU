import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { secondaryAuth, db } from './firebase';

const defaultUsers = [
  { email: 'admin@timpiku.com', password: 'password123', name: 'Admin Umum', role: 'admin' },
  { email: 'marketing@timpiku.com', password: 'password123', name: 'Admin Marketing', role: 'marketing_admin' },
  { email: 'sdm@timpiku.com', password: 'password123', name: 'Admin SDM', role: 'hr_admin' },
  { email: 'keuangan@timpiku.com', password: 'password123', name: 'Admin Keuangan', role: 'finance_admin' },
  { email: 'akademik@timpiku.com', password: 'password123', name: 'Admin Akademik', role: 'academic_admin' },
];

export async function createDefaultUsers() {
  console.log("Starting to create default users...");
  for (const user of defaultUsers) {
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, user.email, user.password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: user.email,
        name: user.name,
        role: user.role
      });
      console.log(`Created user: ${user.email}`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`User already exists: ${user.email}`);
      } else {
        console.error(`Error creating ${user.email}:`, error);
      }
    }
  }
  await secondaryAuth.signOut();
  console.log("Finished creating default users.");
}
