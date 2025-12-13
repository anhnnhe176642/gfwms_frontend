'use client';
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Upload, Loader2, X } from 'lucide-react';
import fabricColorService from '@/services/fabricColor.service';
import type { FabricColorListItem, FabricColorListParams } from '@/types/fabricColor';
import type { PaginationState } from '@/types/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { IsLoading } from '@/components/common';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ColorThief from 'colorthief';

// Helper function to calculate color distance based on hex codes
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return Infinity;
  
  // Using weighted Euclidean distance for better perceptual matching
  const rMean = (rgb1.r + rgb2.r) / 2;
  const dR = rgb1.r - rgb2.r;
  const dG = rgb1.g - rgb2.g;
  const dB = rgb1.b - rgb2.b;
  
  return Math.sqrt(
    (2 + rMean / 256) * dR * dR +
    4 * dG * dG +
    (2 + (255 - rMean) / 256) * dB * dB
  );
}

// Get color family from hex
function getColorFamily(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'Không xác định';
  
  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2 / 255;
  
  if (lightness < 0.15) return 'Đen';
  if (lightness > 0.85) return 'Trắng';
  
  const saturation = max === min ? 0 : (max - min) / (1 - Math.abs(2 * lightness - 1)) / 255;
  if (saturation < 0.15) return 'Xám';
  
  // Calculate hue
  let hue = 0;
  if (max === r) {
    hue = ((g - b) / (max - min)) % 6;
  } else if (max === g) {
    hue = (b - r) / (max - min) + 2;
  } else {
    hue = (r - g) / (max - min) + 4;
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  
  if (hue < 15 || hue >= 345) return 'Đỏ';
  if (hue < 45) return 'Cam';
  if (hue < 75) return 'Vàng';
  if (hue < 150) return 'Xanh lá';
  if (hue < 210) return 'Xanh dương';
  if (hue < 270) return 'Tím';
  if (hue < 315) return 'Hồng';
  return 'Đỏ';
}

const COLOR_FAMILIES = [
  { value: 'all', label: 'Tất cả màu', hexCode: '#999999' },
  { value: 'Đỏ', label: 'Đỏ', hexCode: '#ef4444' },
  { value: 'Cam', label: 'Cam', hexCode: '#f97316' },
  { value: 'Vàng', label: 'Vàng', hexCode: '#eab308' },
  { value: 'Xanh lá', label: 'Xanh lá', hexCode: '#22c55e' },
  { value: 'Xanh dương', label: 'Xanh dương', hexCode: '#3b82f6' },
  { value: 'Tím', label: 'Tím', hexCode: '#a855f7' },
  { value: 'Hồng', label: 'Hồng', hexCode: '#ec4899' },
  { value: 'Đen', label: 'Đen', hexCode: '#1f2937' },
  { value: 'Trắng', label: 'Trắng', hexCode: '#f3f4f6' },
  { value: 'Xám', label: 'Xám', hexCode: '#9ca3af' },
];

const SORT_OPTIONS = [
  { value: 'id:asc', label: 'Mã màu (A-Z)' },
  { value: 'id:desc', label: 'Mã màu (Z-A)' },
  { value: 'name:asc', label: 'Tên màu (A-Z)' },
  { value: 'name:desc', label: 'Tên màu (Z-A)' },
  { value: 'createdAt:desc', label: 'Mới nhất' },
  { value: 'createdAt:asc', label: 'Cũ nhất' },
];

interface FabricColorSearchProps {
  categoryId?: string;
}

export default function FabricColorSearch({ categoryId }: FabricColorSearchProps) {
  const [colors, setColors] = useState<FabricColorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColorFamily, setSelectedColorFamily] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('name:asc');
  const [hexSearchColor, setHexSearchColor] = useState<string>('');
  const [hexSearchRange, setHexSearchRange] = useState<number>(50); 

  // Image extract color states
  const [showColorExtractor, setShowColorExtractor] = useState(false);
  const [extractorImage, setExtractorImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce hex color picker (don't call API while user is adjusting)
  const [debouncedHexColor, setDebouncedHexColor] = useState('');
  const [debouncedHexRange, setDebouncedHexRange] = useState<number>(50);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHexColor(hexSearchColor);
      setDebouncedHexRange(hexSearchRange);
    }, 500);
    return () => clearTimeout(timer);
  }, [hexSearchColor, hexSearchRange]);

  // Fetch colors
  const fetchColors = useCallback(async () => {
    try {
      setLoading(true);
      const [sortBy, order] = sortOption.split(':');
      
      const params: FabricColorListParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        colorFamily: selectedColorFamily !== 'all' ? selectedColorFamily : undefined,
        hexSearchColor: debouncedHexColor || undefined,
        hexSearchRange: debouncedHexColor ? debouncedHexRange : undefined,
        sortBy,
        order,
      };

      const response = await fabricColorService.getFabricColors(params);
      setColors(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch colors:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sortOption, pagination.page, pagination.limit, selectedColorFamily, debouncedHexColor, debouncedHexRange]);

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, sortOption]);

  // All filtering now done by backend
  // Frontend just displays the results
  const filteredColors = colors;

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedColorFamily('all');
    setSortOption('name:asc');
    setHexSearchColor('');
    setHexSearchRange(20);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExtractorImage(file);
      setShowColorExtractor(true);
    }
  };

  const handleColorExtracted = (hexCode: string) => {
    setHexSearchColor(hexCode);
    setShowColorExtractor(false);
    toast.success(`Đã trích xuất màu: ${hexCode}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Tìm kiếm màu vải</h1>
        <p className="text-muted-foreground text-lg">
          Khám phá hơn 200+ màu vải đa dạng. Tìm kiếm theo tên, mã màu hoặc lọc theo họ màu.
        </p>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc tìm kiếm
          </CardTitle>
          <CardDescription>Tìm kiếm theo tên, mã màu, hoặc lọc theo họ màu và màu tương tự</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Text Search */}
            <div className="space-y-2">
              <Label>Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tên màu hoặc mã màu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" />
                Sắp xếp
              </Label>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger>
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color Family Filter */}
          <div className="space-y-3">
            <Label>Họ màu</Label>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-11 gap-2">
              {COLOR_FAMILIES.map((family) => (
                <button
                  key={family.value}
                  onClick={() => setSelectedColorFamily(family.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:shadow-md group',
                    selectedColorFamily === family.value
                      ? 'ring-2 ring-primary ring-offset-2 shadow-lg'
                      : 'hover:bg-muted'
                  )}
                  title={family.label}
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-input shadow-sm group-hover:shadow-md"
                    style={{ backgroundColor: family.hexCode }}
                  />
                  <span className="text-xs text-center font-medium truncate w-full">
                    {family.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Xóa bộ lọc
            </Button>
          </div>

          {/* Hex Color Search Row */}
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label>Tìm màu tương tự (Hex Code)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={hexSearchColor || '#ffffff'}
                    onChange={(e) => setHexSearchColor(e.target.value)}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    placeholder="#RRGGBB"
                    value={hexSearchColor}
                    onChange={(e) => setHexSearchColor(e.target.value)}
                    className="flex-1 font-mono"
                    maxLength={7}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Độ tương đồng: {hexSearchRange}%</Label>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[hexSearchRange]}
                  onValueChange={(value) => setHexSearchRange(value[0])}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {hexSearchRange === 0 && '0% = Chấp nhận tất cả màu'}
                  {hexSearchRange > 0 && hexSearchRange <= 33 && ' Chấp nhận lệch màu'}
                  {hexSearchRange > 33 && hexSearchRange < 67 && ' Bình thường'}
                  {hexSearchRange >= 67 && hexSearchRange < 100 && ' Gần giống hệt'}
                  {hexSearchRange === 100 && '100% = Giống hệt'}
                </p>
              </div>

              {hexSearchColor && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div
                    className="w-8 h-8 rounded border-2"
                    style={{ backgroundColor: hexSearchColor }}
                  />
                  <span>Tìm {filteredColors.length} màu tương tự</span>
                </div>
              )}
            </div>

            {/* Image Extract Section */}
            <div className="border-t pt-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Hoặc trích xuất màu từ ảnh
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Tải lên ảnh
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Hiển thị {colors.length} / {pagination.total} màu
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <IsLoading />
      ) : colors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-lg">Không tìm thấy màu phù hợp</p>
            <Button variant="link" onClick={clearFilters}>
              Xóa bộ lọc và thử lại
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Colors Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredColors.map((color) => (
              <Link
                key={color.id}
                href={`/shop/color/${encodeURIComponent(color.id)}${categoryId ? `?category=${categoryId}` : ''}`}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
                  <CardContent className="p-0">
                    {/* Color Preview */}
                    <div
                      className="h-24 w-full transition-transform"
                      style={{ backgroundColor: color.hexCode || '#999999' }}
                    />
                    
                    {/* Color Info */}
                    <div className="p-3 space-y-1">
                      <p className="text-xs text-muted-foreground font-mono">
                        {color.id}
                      </p>
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {color.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {color.hexCode || 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        'w-10',
                        pagination.page === pageNum && 'pointer-events-none'
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Color Extractor Modal */}
      {extractorImage && (
        <ImageColorExtractor
          isOpen={showColorExtractor}
          onClose={() => {
            setShowColorExtractor(false);
            setExtractorImage(null);
          }}
          imageFile={extractorImage}
          onColorExtracted={handleColorExtracted}
        />
      )}
    </div>
  );
}

/**
 * Color Extractor Modal Component
 * Extracts colors from uploaded image using ColorThief
 */
interface ImageColorExtractorProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File;
  onColorExtracted: (hexCode: string) => void;
}

const ImageColorExtractor: React.FC<ImageColorExtractorProps> = ({
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
        const hexPalette = paletteColors.map((rgb: [number, number, number]) =>
          rgbToHex(rgb[0], rgb[1], rgb[2])
        );
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
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
        .toUpperCase()
    );
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
          <DialogTitle>Trích xuất và chọn màu từ ảnh</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Preview */}
          {imageUrl && (
            <div className="space-y-2">
              <Label>Ảnh đã tải lên</Label>
              <div className="relative w-full bg-muted rounded-lg overflow-hidden">
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Uploaded"
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
                      <CardDescription className="text-xs">Nhấp vào một màu để chọn</CardDescription>
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
