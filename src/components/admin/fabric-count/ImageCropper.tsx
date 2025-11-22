'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useBoundingBox } from '@/hooks/useBoundingBox';
import { drawBoundingBox, drawDimOverlay } from '@/lib/canvasHelpers';

interface ImageCropperProps {
  imageSrc: string;
  onCropConfirm: (croppedImage: File) => void;
  onSkipCrop?: (originalFile: File) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropConfirm,
  onSkipCrop,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  const MAX_DISPLAY_WIDTH = 800;
  const MAX_DISPLAY_HEIGHT = 600;

  // Sử dụng hook useBoundingBox để quản lý crop box
  // canvasLogicalWidth/Height là kích thước ảnh gốc (trước scale)
  const {
    boxes,
    activeBox,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    clearBoxes,
  } = useBoundingBox({
    canvasRef,
    enabled: imageLoaded,
    multipleBoxes: false, // Chỉ cho phép 1 crop box
    edgeThreshold: 15, // Tăng vùng resize để dễ kéo cạnh
    // Truyền kích thước ảnh gốc để hook ánh xạ tọa độ DOM -> logical coordinates
    canvasLogicalWidth: originalImage?.width || 0,
    canvasLogicalHeight: originalImage?.height || 0,
  });

  // Lấy crop box hiện tại - ưu tiên activeBox (đang vẽ/resize) rồi mới là boxes
  const cropBox = activeBox || (boxes.length > 0 ? boxes[0] : null);

  // Vẽ canvas với ảnh và crop box
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Tính toán scale để fit vào kích thước max
    const widthRatio = MAX_DISPLAY_WIDTH / originalImage.width;
    const heightRatio = MAX_DISPLAY_HEIGHT / originalImage.height;
    const calculatedScale = Math.min(widthRatio, heightRatio, 1);

    const displayWidth = originalImage.width * calculatedScale;
    const displayHeight = originalImage.height * calculatedScale;

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    setScale(calculatedScale);

    // Vẽ ảnh gốc
    ctx.drawImage(originalImage, 0, 0, displayWidth, displayHeight);

    // Vẽ crop box nếu có
    if (cropBox && cropBox.startX !== cropBox.endX && cropBox.startY !== cropBox.endY) {
      // cropBox đang ở logical coordinates (kích thước ảnh gốc)
      // Cần scale để vẽ trên canvas display
      const scaledBox = {
        ...cropBox,
        startX: cropBox.startX * calculatedScale,
        startY: cropBox.startY * calculatedScale,
        endX: cropBox.endX * calculatedScale,
        endY: cropBox.endY * calculatedScale,
      };

      // Vẽ overlay tối
      drawDimOverlay(ctx, displayWidth, displayHeight, scaledBox, 0.5);

      // Vẽ lại vùng sáng (vùng sẽ được cắt)
      const x1 = Math.min(cropBox.startX, cropBox.endX);
      const y1 = Math.min(cropBox.startY, cropBox.endY);
      const width = Math.abs(cropBox.endX - cropBox.startX);
      const height = Math.abs(cropBox.endY - cropBox.startY);

      ctx.drawImage(
        originalImage,
        x1,
        y1,
        width,
        height,
        x1 * calculatedScale,
        y1 * calculatedScale,
        width * calculatedScale,
        height * calculatedScale
      );

      // Vẽ border và handles sử dụng helper
      drawBoundingBox(ctx, scaledBox, {
        strokeColor: '#4ECDC4',
        lineWidth: 2,
        showHandles: true,
        handleColor: '#4ECDC4',
        handleSize: 10,
        edgeHandleColor: '#95E1D3',
        edgeHandleSize: 8,
        showDimensions: true,
        scale: calculatedScale,
      });
    }
  };

  // Load ảnh
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalImage(img);
      setImageLoaded(true);
    };
    img.onerror = () => {
      toast.error('Không thể tải ảnh');
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Vẽ lại canvas khi có thay đổi
  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [imageLoaded, cropBox, originalImage]);

  const handleCrop = async () => {
    if (!cropBox || !originalImage) return;

    try {
      // cropBox đã ở logical coordinates (kích thước ảnh gốc)
      // Không cần chia scale, có thể dùng trực tiếp
      const x1 = Math.min(cropBox.startX, cropBox.endX);
      const y1 = Math.min(cropBox.startY, cropBox.endY);
      const x2 = Math.max(cropBox.startX, cropBox.endX);
      const y2 = Math.max(cropBox.startY, cropBox.endY);

      let width = x2 - x1;
      let height = y2 - y1;

      if (width < 50 || height < 50) {
        toast.error('Vùng cắt quá nhỏ, vui lòng chọn vùng lớn hơn');
        return;
      }

      // Làm tròn tọa độ
      const finalX = Math.max(0, Math.round(x1));
      const finalY = Math.max(0, Math.round(y1));
      const finalWidth = Math.min(Math.round(width), originalImage.width - finalX);
      const finalHeight = Math.min(Math.round(height), originalImage.height - finalY);

      if (finalWidth < 50 || finalHeight < 50) {
        toast.error('Vùng cắt quá nhỏ sau khi điều chỉnh');
        return;
      }

      // Tạo canvas để cắt ảnh
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = finalWidth;
      cropCanvas.height = finalHeight;

      const ctx = cropCanvas.getContext('2d');
      if (!ctx) {
        toast.error('Không thể xử lý ảnh');
        return;
      }

      ctx.drawImage(
        originalImage,
        finalX,
        finalY,
        finalWidth,
        finalHeight,
        0,
        0,
        finalWidth,
        finalHeight
      );

      // Chuyển canvas thành file
      cropCanvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Không thể chuyển đổi ảnh');
          return;
        }

        const file = new File([blob], 'cropped-image.png', { type: 'image/png' });
        onCropConfirm(file);
        toast.success('Cắt ảnh thành công');
      }, 'image/png');
    } catch (error) {
      toast.error('Lỗi khi cắt ảnh');
    }
  };

  const handleReset = () => {
    clearBoxes();
  };

  const handleSkipCrop = async () => {
    if (!originalImage) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error('Không thể xử lý ảnh');
        return;
      }

      ctx.drawImage(originalImage, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Không thể chuyển đổi ảnh');
          return;
        }

        const file = new File([blob], 'original-image.png', { type: 'image/png' });
        onSkipCrop?.(file);
        toast.success('Gửi ảnh thành công');
      }, 'image/png');
    } catch (error) {
      toast.error('Lỗi khi gửi ảnh');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cắt ảnh</CardTitle>
        <CardDescription>
          Khoanh vùng ảnh để chọn phần cần gửi. Kéo chuột để vẽ hộp cắt.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="max-w-full h-auto border-2 border-dashed border-primary rounded-md cursor-crosshair"
          />
        </div>

        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
          💡 <strong>Hướng dẫn:</strong> Kéo chuột để vẽ hộp cắt. Sau khi vẽ xong, kéo các cạnh/góc để điều chỉnh kích thước hoặc kéo bên trong hộp để di chuyển.
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          {cropBox && (
            <Button variant="outline" onClick={handleReset}>
              ↻ Chọn lại
            </Button>
          )}
          {onSkipCrop && (
            <Button variant="outline" onClick={handleSkipCrop}>
              ➜ Gửi không cắt
            </Button>
          )}
          <Button
            onClick={handleCrop}
            disabled={!cropBox || cropBox.startX === cropBox.endX || cropBox.startY === cropBox.endY}
          >
            ✓ Xác nhận cắt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
