import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Activity, Clock3, ExternalLink, MapPin, Radio, ShieldCheck, Users } from 'lucide-react';
import { DriverLiveStatus, DriverRoutePoint } from '../types';
import { subscribeCloudDriverRoute } from '../services/firestoreSync';
import { getTodayDateString } from '../utils/formatters';

interface LiveDriverMapProps {
  statuses: DriverLiveStatus[];
  canViewLocation: boolean;
  viewerDriverId?: string;
  canViewRoute?: boolean;
  compact?: boolean;
}

const ONLINE_TIMEOUT_MS = 2 * 60 * 1000;
const OPERATING_START_HOUR = 6;
const OPERATING_END_HOUR = 23;

// The primary source can be blocked by a company network.  Keep a public
// alternate so the dispatch screen does not become a blank panel.
const MAP_SOURCES = [
  {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    name: 'Esri World Street Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
];

const isLive = (status: DriverLiveStatus, now: number) =>
  status.isSharingLocation && now - new Date(status.lastSeenAt).getTime() <= ONLINE_TIMEOUT_MS;

const formatDuration = (milliseconds: number) => {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
};

/** Counts only the portion of a live session that falls inside 06:00–23:00. */
const operatingDuration = (onlineSince: string, now: Date) => {
  const start = new Date(onlineSince);
  const day = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  let result = 0;
  for (let cursor = new Date(day); cursor <= now; cursor.setDate(cursor.getDate() + 1)) {
    const windowStart = new Date(cursor);
    windowStart.setHours(OPERATING_START_HOUR, 0, 0, 0);
    const windowEnd = new Date(cursor);
    windowEnd.setHours(OPERATING_END_HOUR, 0, 0, 0);
    const overlapStart = Math.max(start.getTime(), windowStart.getTime());
    const overlapEnd = Math.min(now.getTime(), windowEnd.getTime());
    if (overlapEnd > overlapStart) result += overlapEnd - overlapStart;
  }
  return result;
};

const formatLastSeen = (value: string, now: number) => {
  const seconds = Math.max(0, Math.floor((now - new Date(value).getTime()) / 1000));
  if (seconds < 15) return 'vừa cập nhật';
  if (seconds < 60) return `${seconds} giây trước`;
  return `${Math.floor(seconds / 60)} phút trước`;
};

const distanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const earthRadius = 6371000;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (meters: number) => meters >= 1000 ? `${(meters / 1000).toFixed(meters >= 10000 ? 0 : 1)} km` : `${Math.round(meters)} m`;

const FitLiveDrivers: React.FC<{ statuses: DriverLiveStatus[] }> = ({ statuses }) => {
  const map = useMap();
  useEffect(() => {
    if (!statuses.length) return;
    if (statuses.length === 1) {
      map.setView([statuses[0].latitude, statuses[0].longitude], 15);
      return;
    }
    map.fitBounds(statuses.map(status => [status.latitude, status.longitude] as [number, number]), { padding: [32, 32], maxZoom: 15 });
  }, [map, statuses]);
  return null;
};

export const LiveDriverMap: React.FC<LiveDriverMapProps> = ({ statuses, canViewLocation, viewerDriverId, canViewRoute = false, compact = false }) => {
  const [now, setNow] = useState(() => Date.now());
  const [mapPresentation, setMapPresentation] = useState<'place' | 'fleet'>('place');
  const [mapSourceIndex, setMapSourceIndex] = useState(0);
  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const [routeDriverId, setRouteDriverId] = useState<string | null>(null);
  const [routePoints, setRoutePoints] = useState<DriverRoutePoint[]>([]);
  const sourceErrorHandled = useRef(false);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const liveStatuses = useMemo(() => statuses.filter(status =>
    isLive(status, now) && Number.isFinite(status.latitude) && Number.isFinite(status.longitude) &&
    (!viewerDriverId || status.driverId === viewerDriverId || status.isVisibleToDrivers)
  ), [statuses, now, viewerDriverId]);
  const viewerStatus = liveStatuses.find(status => status.driverId === viewerDriverId) || null;
  const selectedRouteDriverId = routeDriverId && liveStatuses.some(status => status.driverId === routeDriverId)
    ? routeDriverId
    : liveStatuses[0]?.driverId || null;
  const focusedDriver = liveStatuses.find(status => status.driverId === selectedRouteDriverId) || liveStatuses[0] || null;
  const googleMapsEmbedUrl = focusedDriver
    ? `https://www.google.com/maps?q=${focusedDriver.latitude},${focusedDriver.longitude}&z=16&output=embed`
    : '';
  useEffect(() => {
    if (!canViewRoute || !selectedRouteDriverId) {
      setRoutePoints([]);
      return;
    }
    return subscribeCloudDriverRoute(selectedRouteDriverId, getTodayDateString(), setRoutePoints);
  }, [canViewRoute, selectedRouteDriverId]);
  const totalActivity = useMemo(
    () => liveStatuses.reduce((total, status) => total + operatingDuration(status.onlineSince, new Date(now)), 0),
    [liveStatuses, now]
  );
  const defaultCenter: [number, number] = liveStatuses.length
    ? [liveStatuses[0].latitude, liveStatuses[0].longitude]
    : [10.8231, 106.6297];
  const mapSource = MAP_SOURCES[mapSourceIndex];
  const handleTileError = () => {
    if (sourceErrorHandled.current) return;
    sourceErrorHandled.current = true;
    if (mapSourceIndex < MAP_SOURCES.length - 1) {
      setMapSourceIndex(index => index + 1);
      window.setTimeout(() => { sourceErrorHandled.current = false; }, 1000);
      return;
    }
    setTilesUnavailable(true);
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400"><Radio className="h-4 w-4 animate-pulse" /></span>
            <div>
              <h3 className="font-black text-white">{viewerDriverId ? 'Đội xe trực tuyến · vị trí đồng đội' : 'Tài xế trực tuyến · GPS thời gian thực'}</h3>
              <p className="text-xs text-slate-400">{viewerDriverId ? 'Xem vị trí hiện tại và khoảng cách đến các tài xế đang trực đã đồng ý chia sẻ.' : 'Chỉ tính hoạt động trong giờ VietGo 06:00–23:00 · tự chuyển offline sau 2 phút không có tín hiệu.'}</p>
            </div>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-200"><ShieldCheck className="h-3.5 w-3.5" /> Vị trí cần tài xế đồng ý</span>
      </div>

      {!compact && <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3"><Users className="h-4 w-4 text-emerald-400" /><p className="mt-2 text-2xl font-black text-white">{liveStatuses.length}</p><p className="text-[11px] text-emerald-200">đang online có GPS</p></div>
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3"><Activity className="h-4 w-4 text-cyan-400" /><p className="mt-2 text-2xl font-black text-white">{formatDuration(totalActivity)}</p><p className="text-[11px] text-cyan-100">tổng hoạt động trong khung giờ</p></div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3"><Clock3 className="h-4 w-4 text-violet-400" /><p className="mt-2 text-2xl font-black text-white">06:00–23:00</p><p className="text-[11px] text-violet-100">khung vận hành VietGo</p></div>
      </div>}

      {!canViewLocation ? (
        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800/70 p-4 text-sm text-slate-300">Tài khoản cấp 3 chỉ được xem số tài xế đang trực; vị trí GPS chỉ dành cho Admin và Quản lý vận hành.</div>
      ) : liveStatuses.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center text-sm text-slate-400"><MapPin className="mx-auto mb-2 h-6 w-6 text-slate-500" />Chưa có tài xế chia sẻ vị trí. Tài xế cần đăng nhập, điểm danh và bấm “Bật chia sẻ vị trí”.</div>
      ) : (
        <div className={`mt-4 grid gap-4 ${compact ? '' : 'xl:grid-cols-[minmax(0,1fr)_280px]'}`}>
          <div className={`relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 ${compact ? 'h-[250px]' : 'h-[340px]'}`}>
            <div className="absolute left-3 top-3 z-[500] inline-flex rounded-xl border border-slate-600 bg-slate-950/90 p-1 shadow-lg backdrop-blur">
              <button type="button" onClick={() => setMapPresentation('place')} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${mapPresentation === 'place' ? 'bg-emerald-400 text-slate-950' : 'text-slate-300'}`}>Địa điểm</button>
              <button type="button" onClick={() => { setTilesUnavailable(false); setMapPresentation('fleet'); }} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${mapPresentation === 'fleet' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'}`}>Đội xe</button>
            </div>
            {mapPresentation === 'place' || tilesUnavailable ? (
              <iframe title={`Bản đồ địa điểm của ${focusedDriver?.driverName || 'tài xế'}`} src={googleMapsEmbedUrl} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom className="h-full w-full" aria-label="Bản đồ tài xế trực tuyến">
                <TileLayer key={mapSource.url} attribution={mapSource.attribution} url={mapSource.url} eventHandlers={{ tileerror: handleTileError }} />
                <FitLiveDrivers statuses={liveStatuses} />
                {canViewRoute && routePoints.length > 1 && <Polyline positions={routePoints.map(point => [point.latitude, point.longitude] as [number, number])} pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.8 }} />}
                {liveStatuses.map(status => (
                  <CircleMarker key={status.driverId} center={[status.latitude, status.longitude]} radius={11} pathOptions={{ color: '#052e16', weight: 2, fillColor: '#22c55e', fillOpacity: 0.95 }}>
                    <Popup><strong>{status.driverName}</strong><br />{status.driverCode}{status.licensePlate ? ` · ${status.licensePlate}` : ''}<br />Hoạt động: {formatDuration(operatingDuration(status.onlineSince, new Date(now)))}<br />Cập nhật: {formatLastSeen(status.lastSeenAt, now)}</Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            )}
            {mapPresentation === 'place' && focusedDriver && <div className="absolute bottom-3 left-3 z-[500] rounded-lg bg-slate-950/90 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur"><MapPin className="mr-1 inline h-3.5 w-3.5 text-rose-400" />{focusedDriver.driverName} · vị trí hiện tại</div>}
          </div>
          <div className={`${compact ? 'max-h-56' : 'max-h-[340px]'} space-y-2 overflow-y-auto pr-1`}>
            {liveStatuses.map(status => (
              <div key={status.driverId} className={`w-full rounded-xl border bg-slate-800 p-3 text-left ${canViewRoute && selectedRouteDriverId === status.driverId ? 'border-amber-400/70' : 'border-slate-700'}`}>
                <div className="flex items-start justify-between gap-2"><div><p className="font-bold text-white">{status.driverName}</p><p className="text-[11px] text-slate-400">{status.driverCode}{status.licensePlate ? ` · ${status.licensePlate}` : ''}</p></div><span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#4ade80]" /></div>
                <p className="mt-2 text-xs text-emerald-300">{formatDuration(operatingDuration(status.onlineSince, new Date(now)))} hoạt động</p>
                <p className="mt-1 text-[11px] text-slate-400">{formatLastSeen(status.lastSeenAt, now)}{status.accuracy ? ` · sai số ±${Math.round(status.accuracy)}m` : ''}</p>
                {viewerStatus && status.driverId !== viewerStatus.driverId && <p className="mt-1 text-[11px] font-bold text-cyan-300">Cách bạn: {formatDistance(distanceInMeters(viewerStatus.latitude, viewerStatus.longitude, status.latitude, status.longitude))}</p>}
                <button type="button" onClick={() => { setRouteDriverId(status.driverId); setMapPresentation('place'); }} className="mt-2 block text-[11px] font-bold text-emerald-300 hover:text-emerald-200">Xem địa điểm trên bản đồ</button>
                {canViewRoute && <button type="button" onClick={() => setRouteDriverId(status.driverId)} className="mt-2 block text-[11px] font-bold text-amber-300 hover:text-amber-200">{selectedRouteDriverId === status.driverId ? `Hành trình hôm nay: ${routePoints.length} điểm` : 'Xem hành trình hôm nay'}</button>}
                <a href={`https://www.google.com/maps/search/?api=1&query=${status.latitude},${status.longitude}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200"><ExternalLink className="h-3 w-3" /> Mở vị trí chính xác</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
