'use client';

import React, { useRef, useState } from 'react';
import { Camera } from 'react-camera-pro';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const cameraRef = useRef<any>(null);
  const [isFacingMode, setIsFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraKey, setCameraKey] = useState(0);

  const handleCapture = async () => {
    try {
      if (cameraRef.current) {
        const photo = cameraRef.current.takePhoto() as string;
        
        // Convert base64 to File
        const response = await fetch(photo);
        const blob = await response.blob();
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        
        // Send file directly to parent, let it handle cropping in ImageCropper
        onCapture(file);
        onClose();
        toast.success('Chụp ảnh thành công');
      }
    } catch (error) {
      toast.error('Lỗi khi chụp ảnh');
      console.error('Camera capture error:', error);
    }
  };

  const handleToggleCamera = () => {
    setIsFacingMode(prev => {
      const newMode = prev === 'user' ? 'environment' : 'user';
      setCameraKey(prev => prev + 1); // Force re-render camera component
      return newMode;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chụp ảnh bằng camera</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Camera View */}
          <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            {typeof window !== 'undefined' && (
              <Camera
                key={cameraKey}
                ref={cameraRef}
                facingMode={isFacingMode}
                aspectRatio={16 / 9}
                errorMessages={{
                  noCameraAccessible: 'Không thể truy cập camera',
                  permissionDenied: 'Quyền truy cập camera bị từ chối',
                  switchCamera: 'Chuyển camera',
                }}
              />
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 justify-between">
              <Button
                variant="outline"
                onClick={handleToggleCamera}
                className="flex-1"
                title={isFacingMode === 'environment' ? 'Chuyển sang camera trước' : 'Chuyển sang camera sau'}
              >
                🔄 {isFacingMode === 'environment' ? 'Camera Trước' : 'Camera Sau'}
              </Button>
              <Button
                onClick={handleCapture}
                className="flex-1"
              >
                📸 Chụp
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              ❌ Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
