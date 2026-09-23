import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App instance safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use the specific firestoreDatabaseId if provisioned, or default
// Forms intentionally omit optional fields. Firestore must ignore those
// undefined values instead of rejecting the entire driver/expense record.
export const db = firebaseConfig.firestoreDatabaseId
  ? initializeFirestore(app, { ignoreUndefinedProperties: true }, firebaseConfig.firestoreDatabaseId)
  : initializeFirestore(app, { ignoreUndefinedProperties: true });
