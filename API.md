# VietGo Driver API

Endpoint: `GET https://vietgodriver.vercel.app/api/drivers`

This is a private, read-only API. It returns only the approved fields: driver name, phone number, license plate, shift status, and online state. PINs, secrets, deposits, internal notes, GPS coordinates, and route history are never returned.

## Vercel environment variables

Set these variables in Vercel Project Settings > Environment Variables for Production, Preview, and Development:

| Variable | Value |
| --- | --- |
| `DRIVER_API_KEY` | A long, random secret used by API consumers. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | The complete Firebase service-account JSON with Firestore read permission. |
| `FIREBASE_DATABASE_ID` | Optional; needed only when using another Firestore database ID. |
| `DRIVER_API_ALLOWED_ORIGIN` | Optional browser CORS origin. Defaults to `https://vietgodriver.vercel.app`. |

Do not commit any of these secret values. Redeploy after adding or changing environment variables.

## Authentication

Every request needs one of these headers:

```bash
Authorization: Bearer YOUR_DRIVER_API_KEY
# or
X-API-Key: YOUR_DRIVER_API_KEY
```

## Examples

```bash
# Drivers currently on duty
curl "https://vietgodriver.vercel.app/api/drivers?status=on_duty" \
  -H "X-API-Key: YOUR_DRIVER_API_KEY"

# Search by name, phone, license plate, or driver code
curl "https://vietgodriver.vercel.app/api/drivers?q=TX-123" \
  -H "Authorization: Bearer YOUR_DRIVER_API_KEY"
```

## Query parameters

| Parameter | Description |
| --- | --- |
| `q` | Searches name, phone, license plate, or driver code. |
| `status` | `on_duty`, `standby`, `off_duty`, `emergency_leave`, or `not_checked_in`. |
| `date` | Attendance date in `YYYY-MM-DD`; defaults to Asia/Bangkok current date. |
| `limit` | A value from 1 to 100; defaults to 50. |
