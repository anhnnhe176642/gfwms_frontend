'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ImageCropperProps {
  imageSrc: string;
  onCropConfirm: (croppedImage: File) => void;
  onCancel: () => void;
}

interface CropBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropConfirm,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [scale, setScale] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [resizingEdge, setResizingEdge] = useState<string | null>(null);

  const MAX_DISPLAY_WIDTH = 800;
  const MAX_DISPLAY_HEIGHT = 600;
  const HANDLE_SIZE = 10;
  const EDGE_THRESHOLD = 15;

  // Vẽ canvas
  const drawCanvas = (crop: CropBox | null = cropBox) => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Tính toán scale
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
    let finalCropBox = crop;

    if (finalCropBox && finalCropBox.startX !== finalCropBox.endX && finalCropBox.startY !== finalCropBox.endY) {
      const x1 = Math.min(finalCropBox.startX, finalCropBox.endX);
      const y1 = Math.min(finalCropBox.startY, finalCropBox.endY);
      const width = Math.abs(finalCropBox.endX - finalCropBox.startX);
      const height = Math.abs(finalCropBox.endY - finalCropBox.startY);

      // Vẽ overlay tối
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Vẽ vùng sáng (vùng sẽ được cắt)
      ctx.clearRect(x1, y1, width, height);
      ctx.drawImage(
        originalImage,
        x1 / calculatedScale,
        y1 / calculatedScale,
        width / calculatedScale,
        height / calculatedScale,
        x1,
        y1,
        width,
        height
      );

      // Vẽ border của crop box
      ctx.strokeStyle = '#4ECDC4';
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, width, height);

      // Vẽ corner handles
      const handleSize = 10;
      const corners = [
        { x: x1, y: y1 }, // top-left
        { x: x1 + width, y: y1 }, // top-right
        { x: x1, y: y1 + height }, // bottom-left
        { x: x1 + width, y: y1 + height }, // bottom-right
      ];

      corners.forEach((corner) => {
        ctx.fillStyle = '#4ECDC4';
        ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
      });

      // Vẽ edge handles (trung điểm các cạnh)
      const midSize = 8;
      const edges = [
        { x: x1 + width / 2, y: y1 }, // top
        { x: x1 + width / 2, y: y1 + height }, // bottom
        { x: x1, y: y1 + height / 2 }, // left
        { x: x1 + width, y: y1 + height / 2 }, // right
      ];

      edges.forEach((edge) => {
        ctx.fillStyle = '#95E1D3';
        ctx.fillRect(edge.x - midSize / 2, edge.y - midSize / 2, midSize, midSize);
      });

      // Hiển thị kích thước
      const displayCropWidth = Math.round(width / calculatedScale);
      const displayCropHeight = Math.round(height / calculatedScale);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      const infoText = `${displayCropWidth}x${displayCropHeight}px`;
      ctx.strokeText(infoText, x1 + 10, y1 + 30);
      ctx.fillText(infoText, x1 + 10, y1 + 30);
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

  useEffect(() => {
    drawCanvas();
  }, [imageLoaded, cropBox]);

  useEffect(() => {
    const handleCanvasMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn || !cropBox) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const detectedEdge = detectEdgeAtPoint(x, y, cropBox);
      
      if (!detectedEdge) {
        canvas.style.cursor = 'crosshair';
        return;
      }

      // Cập nhật cursor dựa trên cạnh/góc
      if (detectedEdge === 'tl' || detectedEdge === 'br') {
        canvas.style.cursor = 'nwse-resize';
      } else if (detectedEdge === 'tr' || detectedEdge === 'bl') {
        canvas.style.cursor = 'nesw-resize';
      } else if (detectedEdge === 'n' || detectedEdge === 's') {
        canvas.style.cursor = 'ns-resize';
      } else if (detectedEdge === 'w' || detectedEdge === 'e') {
        canvas.style.cursor = 'ew-resize';
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleCanvasMouseMove);
      return () => {
        canvas.removeEventListener('mousemove', handleCanvasMouseMove);
      };
    }
  }, [hasDrawn, cropBox]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Nếu đã vẽ crop box, kiểm tra xem có đang nhấn vào cạnh/góc không
    if (hasDrawn && cropBox) {
      const detectedEdge = detectEdgeAtPoint(x, y, cropBox);
      if (detectedEdge) {
        setResizingEdge(detectedEdge);
        setIsDrawing(true);
        return;
      }
    }

    // Nếu không phải resize, bắt đầu vẽ crop box mới
    setResizingEdge(null);
    setIsDrawing(true);
    setCropBox({
      startX: x,
      startY: y,
      endX: x,
      endY: y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !cropBox) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Nếu đang resize từ cạnh, cập nhật crop box theo edge
    if (isDrawing && resizingEdge) {
      let newCropBox = { ...cropBox };

      switch (resizingEdge) {
        case 'tl': // top-left
          newCropBox.startX = x;
          newCropBox.startY = y;
          break;
        case 'tr': // top-right
          newCropBox.endX = x;
          newCropBox.startY = y;
          break;
        case 'bl': // bottom-left
          newCropBox.startX = x;
          newCropBox.endY = y;
          break;
        case 'br': // bottom-right
          newCropBox.endX = x;
          newCropBox.endY = y;
          break;
        case 'n': // north (top)
          newCropBox.startY = y;
          break;
        case 's': // south (bottom)
          newCropBox.endY = y;
          break;
        case 'w': // west (left)
          newCropBox.startX = x;
          break;
        case 'e': // east (right)
          newCropBox.endX = x;
          break;
      }

      setCropBox(newCropBox);
      return;
    }

    // Vẽ crop box mới
    if (!isDrawing) return;

    setCropBox({
      ...cropBox,
      endX: x,
      endY: y,
    });
  };

  // Hàm kiểm tra xem điểm (x, y) có gần cạnh/góc không
  const detectEdgeAtPoint = (x: number, y: number, crop: CropBox | null): string | null => {
    if (!crop) return null;

    const x1 = Math.min(crop.startX, crop.endX);
    const y1 = Math.min(crop.startY, crop.endY);
    const w = Math.abs(crop.endX - crop.startX);
    const h = Math.abs(crop.endY - crop.startY);

    // Kiểm tra góc
    const corners = [
      { id: 'tl', x: x1, y: y1 },
      { id: 'tr', x: x1 + w, y: y1 },
      { id: 'bl', x: x1, y: y1 + h },
      { id: 'br', x: x1 + w, y: y1 + h },
    ];

    for (const corner of corners) {
      if (Math.abs(x - corner.x) < EDGE_THRESHOLD && Math.abs(y - corner.y) < EDGE_THRESHOLD) {
        return corner.id;
      }
    }

    // Kiểm tra cạnh
    const edges = [
      { id: 'n', x: x1 + w / 2, y: y1 },
      { id: 's', x: x1 + w / 2, y: y1 + h },
      { id: 'w', x: x1, y: y1 + h / 2 },
      { id: 'e', x: x1 + w, y: y1 + h / 2 },
    ];

    for (const edge of edges) {
      if (Math.abs(x - edge.x) < EDGE_THRESHOLD && Math.abs(y - edge.y) < EDGE_THRESHOLD) {
        return edge.id;
      }
    }

    return null;
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setResizingEdge(null);
    
    // Sau khi kéo lần đầu, đánh dấu đã vẽ
    if (cropBox && !hasDrawn) {
      const width = Math.abs(cropBox.endX - cropBox.startX) / scale;
      const height = Math.abs(cropBox.endY - cropBox.startY) / scale;
      
      if (width > 0 && height > 0) {
        setHasDrawn(true);
      }
    }
  };

  const handleCrop = async () => {
    if (!cropBox || !originalImage) return;

    try {
      // Sử dụng giá trị từ input nếu đã chỉnh sửa, nếu không dùng giá trị từ crop box
      let width = Math.abs(cropBox.endX - cropBox.startX) / scale;
      let height = Math.abs(cropBox.endY - cropBox.startY) / scale;

      if (width < 50 || height < 50) {
        toast.error('Vùng cắt quá nhỏ, vui lòng chọn vùng lớn hơn');
        return;
      }

      // Giữ nguyên tâm, lấy vị trí bắt đầu dựa trên kích thước mới
      const centerX = (cropBox.startX + cropBox.endX) / 2 / scale;
      const centerY = (cropBox.startY + cropBox.endY) / 2 / scale;
      const x1 = Math.max(0, Math.round(centerX - width / 2));
      const y1 = Math.max(0, Math.round(centerY - height / 2));

      // Đảm bảo không vượt quá biên ảnh
      const finalWidth = Math.min(Math.round(width), originalImage.width - x1);
      const finalHeight = Math.min(Math.round(height), originalImage.height - y1);

      if (finalWidth < 50 || finalHeight < 50) {
        toast.error('Vùng cắt quá nhỏ sau khi điều chỉnh, vui lòng thay đổi lại kích thước');
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
        x1,
        y1,
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
    setCropBox(null);
    setHasDrawn(false);
    setResizingEdge(null);
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
            onMouseLeave={handleMouseUp}
            className="max-w-full h-auto border-2 border-dashed border-primary rounded-md cursor-crosshair"
          />
        </div>

        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
          💡 <strong>Hướng dẫn:</strong> Kéo chuột để vẽ hộp cắt. Sau khi vẽ xong, kéo các cạnh/góc để điều chỉnh kích thước. Vùng được làm sáng là phần sẽ được gửi.
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Hủy
          </Button>
          {hasDrawn && (
            <Button
              variant="outline"
              onClick={handleReset}
            >
              ↻ Chọn lại
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
