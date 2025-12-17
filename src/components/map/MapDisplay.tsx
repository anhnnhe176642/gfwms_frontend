'use client';

import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface MapDisplayProps {
  latitude: number | undefined;
  longitude: number | undefined;
  title?: string;
  description?: string;
}

/**
 * Component để hiển thị vị trí trên map (read-only)
 * Không cho phép chỉnh sửa vị trí
 */
export function MapDisplay({ 
  latitude, 
  longitude, 
  title = 'Vị trí trên bản đồ',
  description = 'Vị trí địa lý của địa điểm'
}: MapDisplayProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Cấu hình default icons cho Leaflet
  useEffect(() => {
    setIsMounted(true);
    // Fix for default marker icon
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map */}
        <div className="h-80 rounded-lg overflow-hidden border border-gray-200 w-full relative z-0">
          <MapContainer
            center={[latitude || 16.0583, longitude || 108.2772]}
            zoom={latitude && longitude ? 15 : 5}
            className="w-full h-full"
            style={{ width: '100%', height: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {latitude && longitude && (
              <Marker position={[latitude, longitude]} />
            )}
          </MapContainer>
        </div>

        {/* Location coordinates */}
        {latitude && longitude && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vĩ độ (Latitude)</p>
              <p className="text-base font-semibold">{latitude.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kinh độ (Longitude)</p>
              <p className="text-base font-semibold">{longitude.toFixed(6)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MapDisplay;
