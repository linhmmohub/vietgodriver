import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json';

declare const process: { env: Record<string, string | undefined> };

type DocumentData = Record<string, unknown>;
const firebaseAppName = 'vietgo-driver-api';

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

const getDriverApiDb = () => {
  const serviceAccount = getServiceAccount();
  const projectId = serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  const app = getApps().find(item => item.name === firebaseAppName) || initializeApp({
    credential: cert({
      projectId,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
    projectId,
  }, firebaseAppName);

  const databaseId = process.env.FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || '(default)';
  return getFirestore(app, databaseId);
};

type AttendanceStatus = 'on_duty' | 'standby' | 'off_duty' | 'emergency_leave';
type DirectoryStatus = AttendanceStatus | 'not_checked_in';

const VALID_STATUSES = new Set<DirectoryStatus>([
  'on_duty',
  'standby',
  'off_duty',
  'emergency_leave',
  'not_checked_in',
]);

const corsOrigin = process.env.DRIVER_API_ALLOWED_ORIGIN || 'https://vietgodriver.vercel.app';

const headers = {
  'Access-Control-Allow-Origin': corsOrigin,
  'Access-Control-Allow-Headers': 'Authorization, X-API-Key, Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'private, no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'Vary': 'Origin',
};

const json = (body: unknown, status = 200) => Response.json(body, { status, headers });

const valueAsString = (data: DocumentData, field: string) => {
  const value = data[field];
  return typeof value === 'string' ? value : undefined;
};

const valueAsBoolean = (data: DocumentData, field: string) => data[field] === true;

const bangkokDate = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: string) => parts.find(item => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}`;
};

const getApiKey = (request: Request) => {
  const authorization = request.headers.get('authorization');
  if (authorization?.toLowerCase().startsWith('bearer ')) return authorization.slice(7).trim();
  return request.headers.get('x-api-key')?.trim() || '';
};

const publicDriver = (driver: DocumentData, attendance?: DocumentData, liveStatus?: DocumentData) => {
  const status = (valueAsString(attendance || {}, 'status') || 'not_checked_in') as DirectoryStatus;
  const lastSeenAt = valueAsString(liveStatus || {}, 'lastSeenAt');

  return {
    name: valueAsString(driver, 'name'),
    phone: valueAsString(driver, 'phone'),
    licensePlate: valueAsString(driver, 'licensePlate'),
    shiftStatus: status,
    online: Boolean(lastSeenAt && Date.now() - new Date(lastSeenAt).getTime() <= 2 * 60 * 1000),
  };
};

export default {
  async fetch(request: Request) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);

    const expectedApiKey = process.env.DRIVER_API_KEY?.trim();
    if (!expectedApiKey) return json({ error: 'api_not_configured' }, 503);
    if (getApiKey(request) !== expectedApiKey) return json({ error: 'unauthorized' }, 401);

    const url = new URL(request.url);
    const date = url.searchParams.get('date') || bangkokDate();
    const requestedStatus = url.searchParams.get('status') || 'all';
    const query = url.searchParams.get('q')?.trim().toLowerCase() || '';
    const parsedLimit = Number.parseInt(url.searchParams.get('limit') || '50', 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 50;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'invalid_date', message: 'date must use YYYY-MM-DD.' }, 400);
    if (requestedStatus !== 'all' && !VALID_STATUSES.has(requestedStatus as DirectoryStatus)) {
      return json({ error: 'invalid_status' }, 400);
    }

    try {
      const db = getDriverApiDb();
      const [driversSnapshot, attendanceSnapshot, liveSnapshot] = await Promise.all([
        db.collection('drivers').get(),
        db.collection('driver_attendance').where('date', '==', date).get(),
        db.collection('driver_live_status').get(),
      ]);

      const attendanceByDriver = new Map(attendanceSnapshot.docs.map(item => [item.get('driverId') || item.id, item.data()]));
      const liveByDriver = new Map(liveSnapshot.docs.map(item => [item.get('driverId') || item.id, item.data()]));
      const matches = driversSnapshot.docs
        .map(item => ({ ...item.data(), id: item.id }))
        .filter(driver => {
          const attendance = attendanceByDriver.get(driver.id);
          const status = valueAsString(attendance || {}, 'status') || 'not_checked_in';
          const searchable = [valueAsString(driver, 'code'), valueAsString(driver, 'name'), valueAsString(driver, 'phone'), valueAsString(driver, 'licensePlate')].filter(Boolean).join(' ').toLowerCase();
          return (!query || searchable.includes(query)) && (requestedStatus === 'all' || status === requestedStatus) && !valueAsBoolean(driver, 'isRevoked');
        })
        .sort((a, b) => (valueAsString(a, 'name') || '').localeCompare(valueAsString(b, 'name') || '', 'vi'));

      return json({
        data: matches.slice(0, limit).map(driver => publicDriver(driver, attendanceByDriver.get(driver.id), liveByDriver.get(driver.id))),
        meta: { count: Math.min(matches.length, limit), totalMatched: matches.length, date, limit },
      });
    } catch (error) {
      console.error('Driver API failed:', error);
      return json({ error: 'driver_api_unavailable' }, 503);
    }
  },
};
