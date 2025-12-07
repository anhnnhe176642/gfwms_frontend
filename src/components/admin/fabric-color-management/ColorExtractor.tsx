'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { X, Pipette, Loader2 } from 'lucide-react';
import ColorThief from 'colorthief';

interface ColorExtractorProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File;
  onColorExtracted: (hexCode: string) => void;
}

/**
 * Component để trích xuất màu từ ảnh sử dụng Color Thief
 * Hỗ trợ chọn màu thủ công từ color picker
 */
export const ColorExtractor: React.FC<ColorExtractorProps> = ({
  isOpen,
  onClose,
  imageFile,
  onColorExtracted,
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('#FF0000');
  const [palette, setPalette] = useState<string[]>([]);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load image file into data URL
  useEffect(() => {
    if (!imageFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImageUrl(url);
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  // Extract colors when image loads
  useEffect(() => {
    if (!imageUrl || !imageRef.current) return;

    const extractColors = async () => {
      try {
        setIsLoading(true);

        // Wait for image to load
        await new Promise((resolve) => {
          if (imageRef.current?.complete) {
            resolve(null);
          } else {
            imageRef.current?.addEventListener('load', resolve, { once: true });
          }
        });

        // Create ColorThief instance
        const colorThief = new (ColorThief as any)();

        // Get dominant color
        const dominantColor = await colorThief.getColor(imageRef.current!);
        const dominantHex = rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]);
        setSelectedColor(dominantHex);

        // Get color palette (5 colors)
        const paletteColors = await colorThief.getPalette(imageRef.current!, 5);
        const hexPalette = paletteColors.map((rgb: [number, number, number]) => rgbToHex(rgb[0], rgb[1], rgb[2]));
        setPalette(hexPalette);

        toast.success('Trích xuất màu thành công');
      } catch (error) {
        console.error('Color extraction error:', error);
        toast.error('Lỗi khi trích xuất màu từ ảnh');
      } finally {
        setIsLoading(false);
      }
    };

    extractColors();
  }, [imageUrl]);

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  const handleConfirmColor = () => {
    if (!selectedColor) {
      toast.error('Vui lòng chọn màu');
      return;
    }
    onColorExtracted(selectedColor);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Trích xuất và chọn màu</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Preview - Only render if imageUrl exists */}
          {imageUrl && (
            <div className="space-y-2">
              <Label>Ảnh đã chụp</Label>
              <div className="relative w-full bg-muted rounded-lg overflow-hidden">
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Captured"
                  className="w-full h-auto max-h-64 object-contain"
                  crossOrigin="anonymous"
                />
              </div>
            </div>
          )}

          {/* Color Selection */}
          <div className="space-y-4">
            <Label>Chọn màu</Label>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Đang trích xuất màu...</span>
              </div>
            ) : (
              <>
                {/* Dominant Color & Manual Picker */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Chọn màu chủ đạo hoặc tuỳ chỉnh</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Color Picker & Hex Input */}
                    <div className="flex gap-3 items-end">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="color-input" className="text-xs">
                          Chọn màu
                        </Label>
                        <div className="flex gap-2 items-center">
                          <input
                            id="color-input"
                            type="color"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value.toUpperCase())}
                            className="w-12 h-10 rounded cursor-pointer border border-input"
                          />
                          <input
                            type="text"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value.toUpperCase())}
                            placeholder="#FF0000"
                            className="flex-1 px-3 py-2 text-sm border border-input rounded font-mono"
                          />
                        </div>
                      </div>
                      <div
                        className="w-16 h-10 rounded border-2 border-input"
                        style={{ backgroundColor: selectedColor }}
                        title={selectedColor}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Color Palette from Image */}
                {palette.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Danh sách màu được trích xuất</CardTitle>
                      <CardDescription className="text-xs">
                        Nhấp vào một màu để chọn
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Color swatches */}
                        <div className="grid grid-cols-5 gap-2">
                          {palette.map((color) => (
                            <button
                              key={color}
                              className={`h-16 rounded-lg border-2 transition-all cursor-pointer ${
                                selectedColor === color
                                  ? 'border-foreground ring-2 ring-offset-2 ring-blue-500'
                                  : 'border-input hover:border-muted-foreground'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setSelectedColor(color)}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
            <Button onClick={handleConfirmColor} disabled={isLoading}>
              Xác nhận màu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
