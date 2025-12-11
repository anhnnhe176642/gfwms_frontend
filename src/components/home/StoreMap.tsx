'use client';

import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Store } from 'lucide-react';
import type { StoreListItem } from '@/types/store';

interface StoreMapProps {
  stores: StoreListItem[];
  title?: string;
  description?: string;
  height?: string;
}

/**
 * Component để lưu map instance
 */
function MapReference({ mapRef }: { mapRef: React.MutableRefObject<any> }) {
  const map = useMap();
  useEffect(() => {
    if (mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);
  return null;
}

/**
 * Component hiển thị vị trí các stores trên map
 * Dùng cho trang home hoặc bất kỳ nơi nào cần hiển thị stores
 */
export function StoreMap({
  stores,
  title = 'Vị trí các cửa hàng',
  description = 'Xem vị trí của tất cả các cửa hàng chúng tôi',
  height = 'h-80',
}: StoreMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Cấu hình default icons cho Leaflet
  useEffect(() => {
    // Fix for default marker icon
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  // Nếu không có stores, hiển thị default
  const storeLocations = stores.filter(
    store => store.latitude && store.longitude
  );

  const centerLat = storeLocations.length > 0
    ? storeLocations[0].latitude
    : 16.0583;
  const centerLng = storeLocations.length > 0
    ? storeLocations[0].longitude
    : 108.2772;

  // Tính toán bounds để fit tất cả markers
  useEffect(() => {
    if (storeLocations.length > 0 && mapRef.current) {
      try {
        const bounds = L.latLngBounds(
          storeLocations.map(store => [store.latitude, store.longitude])
        );
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [storeLocations]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className={`${height} rounded-lg overflow-hidden border border-gray-200 w-full relative z-0`}>
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={11}
            className="w-full h-full"
            style={{ width: '100%', height: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <MapReference mapRef={mapRef} />

            {/* Markers cho từng store */}
            {storeLocations.map((store) => (
              <Marker
                key={store.id}
                position={[store.latitude, store.longitude]}
                icon={L.divIcon({
                  className: 'custom-store-marker',
                  html: `<div style="
                    background-color: #059669;
                    color: white;
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.25);
                    border: 3px solid white;
                  ">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 6h16v4H4z" />
                      <path d="M6 10v10h12V10" />
                    </svg>
                  </div>`,
                  iconSize: [32, 32],
                  iconAnchor: [16, 16],
                  popupAnchor: [0, -16],
                })}
              >
                <Popup minWidth={250}>
                  <div className="space-y-2">
                    <div className="font-semibold text-base text-emerald-600">
                      {store.name}
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Địa chỉ:</span> {store.address}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Tọa độ:</span> {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}
                    </p>
                    <div className="pt-2 border-t">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        store.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {store.isActive ? '✓ Đang hoạt động' : '✗ Ngừng hoạt động'}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Danh sách stores */}
        {storeLocations.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Danh sách {storeLocations.length} cửa hàng:
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {storeLocations.map((store) => (
                <div
                  key={store.id}
                  className="flex items-start justify-between p-2 rounded-md hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{store.name}</p>
                    <p className="text-xs text-gray-500">{store.address}</p>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${
                    store.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {store.isActive ? 'Hoạt động' : 'Ngừng'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {storeLocations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Không có cửa hàng nào để hiển thị</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StoreMap;
