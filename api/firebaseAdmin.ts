import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json';

declare const process: { env: Record<string, string | undefined> };

const appName = 'vietgo-driver-api';

const getServiceAccount = () => {
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();

  if (rawServiceAccount) {
    try {
      return JSON.parse(rawServiceAccount) as {
        project_id?: string;
        client_email?: string;
        private_key?: string;
      };
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.');
    }
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) {
    throw new Error('Firebase service account is not configured.');
  }

  return {
    project_id: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
    client_email: clientEmail,
    private_key: privateKey,
  };
};

/** Returns the named Firestore database that is also used by the web app. */
export const getDriverApiDb = () => {
  const serviceAccount = getServiceAccount();
  const projectId = serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  const app = getApps().find(item => item.name === appName) || initializeApp({
    credential: cert({
      projectId,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
    projectId,
  }, appName);

  const databaseId = process.env.FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || '(default)';
  return getFirestore(app, databaseId);
};
