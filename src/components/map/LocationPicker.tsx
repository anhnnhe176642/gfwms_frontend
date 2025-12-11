'use client';

import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, LocateFixed } from 'lucide-react';

interface LocationPickerProps {
  latitude: number | undefined;
  longitude: number | undefined;
  onLocationChange: (latitude: number, longitude: number) => void;
}

/**
 * Component giúp chọn vị trí trên map
 * Click trên map để chọn vị trí, hoặc sử dụng nút định vị để tự động lấy vị trí hiện tại
 */
export function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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

  // Xử lý click định vị
  const handleGetLocation = () => {
    setIsLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Trình duyệt của bạn không hỗ trợ định vị');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        onLocationChange(lat, lng);
        // Fly to location
        if (mapRef.current) {
          const map = mapRef.current as any;
          map.flyTo([lat, lng], 15);
        }
        setIsLoading(false);
      },
      () => {
        setError('Không thể lấy vị trí hiện tại. Vui lòng cấp quyền truy cập vị trí.');
        setIsLoading(false);
      }
    );
  };

  // Component lắng nghe click trên map
  function MapClickListener() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        onLocationChange(lat, lng);
      },
    });
    return null;
  }

  // Component lưu map instance
  function MapReference() {
    const map = useMap();
    useEffect(() => {
      if (mapRef) {
        mapRef.current = map;
      }
    }, [map]);
    return null;
  }

  // Tự động fly tới vị trí khi latitude/longitude thay đổi
  useEffect(() => {
    if (latitude && longitude && mapRef.current) {
      const map = mapRef.current as any;
      map.flyTo([latitude, longitude], 15);
    }
  }, [latitude, longitude]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Chọn vị trí cửa hàng
        </CardTitle>
        <CardDescription>
          Click trên map để chọn vị trí hoặc sử dụng nút định vị để tự động lấy vị trí hiện tại
        </CardDescription>
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
            <MapClickListener />
            <MapReference />
            {latitude && longitude && (
              <Marker position={[latitude, longitude]} />
            )}
          </MapContainer>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Location coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Vĩ độ (Latitude)</Label>
            <Input
              id="latitude"
              type="number"
              placeholder="16.0583"
              value={latitude ?? ''}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Kinh độ (Longitude)</Label>
            <Input
              id="longitude"
              type="number"
              placeholder="108.2772"
              value={longitude ?? ''}
              readOnly
              className="bg-gray-50"
            />
          </div>
        </div>

        {/* Get location button */}
        <Button
          type="button"
          onClick={handleGetLocation}
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading && <span className="animate-spin mr-2">⏳</span>}
          <LocateFixed className="h-4 w-4 mr-2" />
          {isLoading ? 'Đang định vị...' : 'Định vị vị trí hiện tại'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default LocationPicker;
