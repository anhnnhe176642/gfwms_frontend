'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Store, Filter, ShoppingCart, MapPin } from 'lucide-react';
import fabricColorService from '@/services/fabricColor.service';
import fabricCategoryService from '@/services/fabricCategory.service';
import fabricCustomerService, { FabricFilterParams } from '@/services/fabricCustomer.service';
import type { FabricColorListItem } from '@/types/fabricColor';
import type { FabricCategoryListItem } from '@/types/fabricCategory';
import {
  CategoryFilterOption,
  ColorFilterOption,
  GlossFilterOption,
  NumericFilterOption,
  StoreFilterOption,
} from '@/services/fabricCustomer.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IsLoading } from '@/components/common';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { StoreMap } from '@/components/home';
import type { StoreListItem } from '@/types/store';
import { toast } from 'sonner';

interface FabricColorDetailPageProps {
  colorId: string;
  categoryId?: string;
}

// Compact filter button component
interface FilterButtonProps {
  label: string;
  count: number;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function FilterButton({ label, count, isSelected, isDisabled, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-all whitespace-nowrap ${
        isSelected
          ? 'bg-blue-600 text-white'
          : isDisabled
            ? 'bg-gray-100 text-gray-400 opacity-40 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <span className="truncate max-w-20">{label}</span>
      <span className="text-xs opacity-75">({count})</span>
    </button>
  );
}

// Haversine formula to calculate distance between two coordinates (in km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function FabricColorDetailPage({ colorId, categoryId }: FabricColorDetailPageProps) {
  const [color, setColor] = useState<FabricColorListItem | null>(null);
  const [category, setCategory] = useState<FabricCategoryListItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter options from API - merged with previous values for disabled states
  const [filterOptions, setFilterOptions] = useState({
    categories: [] as CategoryFilterOption[],
    colors: [] as ColorFilterOption[],
    glosses: [] as GlossFilterOption[],
    thicknesses: [] as NumericFilterOption[],
    widths: [] as NumericFilterOption[],
    lengths: [] as NumericFilterOption[],
    stores: [] as StoreFilterOption[],
  });

  // Track which options are currently available (not disabled)
  const [availableOptions, setAvailableOptions] = useState({
    categories: new Set<number>(),
    glosses: new Set<number>(),
    thicknesses: new Set<number>(),
    widths: new Set<number>(),
    lengths: new Set<number>(),
  });

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    categoryId ? parseInt(categoryId) : undefined
  );
  const [selectedGloss, setSelectedGloss] = useState<number | undefined>(undefined);
  const [selectedThickness, setSelectedThickness] = useState<number | undefined>(undefined);
  const [selectedWidth, setSelectedWidth] = useState<number | undefined>(undefined);
  const [selectedLength, setSelectedLength] = useState<number | undefined>(undefined);

  // Cart input states
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<'roll' | 'meter'>('meter');
  const [selectedStore, setSelectedStore] = useState<number | undefined>(undefined);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantityError, setQuantityError] = useState<string>('');

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [storesWithDistance, setStoresWithDistance] = useState<
    (StoreFilterOption & { distance?: number })[]
  >([]);

  // Handle geolocation request
  const handleGetLocation = useCallback(async () => {
    setIsLocating(true);
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ latitude, longitude });
            toast.success('Đã xác định vị trí của bạn');
          },
          (error) => {
            console.error('Geolocation error:', error);
            toast.error('Không thể xác định vị trí. Vui lòng kiểm tra quyền truy cập vị trí.');
          }
        );
      } else {
        toast.error('Trình duyệt của bạn không hỗ trợ xác định vị trí');
      }
    } finally {
      setIsLocating(false);
    }
  }, []);

  // Update stores with distance when user location or stores change
  useEffect(() => {
    const stores = filterOptions.stores.map((store) => {
      let distance: number | undefined;
      if (userLocation && store.latitude !== null && store.longitude !== null) {
        distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          store.latitude,
          store.longitude
        );
      }
      return { ...store, distance };
    });

    // Sort by distance if user location is available
    if (userLocation) {
      stores.sort((a, b) => {
        const distA = a.distance ?? Number.MAX_VALUE;
        const distB = b.distance ?? Number.MAX_VALUE;
        return distA - distB;
      });

      // Set nearest store as default if not already selected
      if (!selectedStore && stores.length > 0) {
        setSelectedStore(stores[0].id);
      }
    }

    setStoresWithDistance(stores);
  }, [filterOptions.stores, userLocation, selectedStore]);

  // Helper function to merge and track available options
  const mergeFilterOptions = useCallback((newData: typeof filterOptions) => {
    setFilterOptions((prev) => {
      const merged = {
        categories: mergeOptionArrays(prev.categories, newData.categories, 'id'),
        colors: mergeOptionArrays(prev.colors, newData.colors, 'id'),
        glosses: mergeOptionArrays(prev.glosses, newData.glosses, 'id'),
        thicknesses: mergeOptionArrays(prev.thicknesses, newData.thicknesses, 'value'),
        widths: mergeOptionArrays(prev.widths, newData.widths, 'value'),
        lengths: mergeOptionArrays(prev.lengths, newData.lengths, 'value'),
        stores: newData.stores,
      };

      // Track available options
      setAvailableOptions({
        categories: new Set(newData.categories.map((c) => c.id)),
        glosses: new Set(newData.glosses.map((g) => g.id)),
        thicknesses: new Set(newData.thicknesses.map((t) => t.value as number)),
        widths: new Set(newData.widths.map((w) => w.value as number)),
        lengths: new Set(newData.lengths.map((l) => l.value as number)),
      });

      return merged;
    });
  }, []);

  // Merge arrays by key, keeping old items but updating counts
  const mergeOptionArrays = <T extends Record<K, any>, K extends PropertyKey>(
    oldArray: T[],
    newArray: T[],
    key: K
  ): T[] => {
    const newMap = new Map(newArray.map((item) => [item[key], item]));
    const merged = new Map(oldArray.map((item) => [item[key], item]));

    newArray.forEach((item) => {
      merged.set(item[key], item);
    });

    return Array.from(merged.values());
  };

  // Fetch filter options when filters change
  const fetchFilterOptions = useCallback(async () => {
    try {
      const params: FabricFilterParams = {
        colorId,
        categoryId: selectedCategory,
        glossId: selectedGloss,
        thickness: selectedThickness,
        width: selectedWidth,
        length: selectedLength,
      };

      const data = await fabricCustomerService.getFilterOptions(params);
      mergeFilterOptions(data);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  }, [colorId, selectedCategory, selectedGloss, selectedThickness, selectedWidth, selectedLength, mergeFilterOptions]);

  // Initial load: fetch color and filter options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch color details
        const colorData = await fabricColorService.getFabricColorById(colorId);
        setColor(colorData);

        // Fetch category if provided
        if (categoryId) {
          const categoryData = await fabricCategoryService.getFabricCategoryById(categoryId);
          setCategory(categoryData);
          setSelectedCategory(parseInt(categoryId));
        }

        // Fetch initial filter options
        const params: FabricFilterParams = {
          colorId,
          categoryId: categoryId ? parseInt(categoryId) : undefined,
        };
        const data = await fabricCustomerService.getFilterOptions(params);
        mergeFilterOptions(data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [colorId, categoryId]);

  // Update filter options when any filter changes
  useEffect(() => {
    if (!loading) {
      fetchFilterOptions();
    }
  }, [selectedCategory, selectedGloss, selectedThickness, selectedWidth, selectedLength, fetchFilterOptions, loading]);

  // Helper to get first selected filter data for totals
  const getFirstSelectedFilterData = useCallback(() => {
    // Check filters in order: category, gloss, thickness, width, length
    if (selectedCategory !== undefined) {
      const found = filterOptions.categories.find((c) => c.id === selectedCategory);
      if (found) return { totalUncut: found.totalUncut, totalMeters: found.totalMeters };
    }
    if (selectedGloss !== undefined) {
      const found = filterOptions.glosses.find((g) => g.id === selectedGloss);
      if (found) return { totalUncut: found.totalUncut, totalMeters: found.totalMeters };
    }
    if (selectedThickness !== undefined) {
      const found = filterOptions.thicknesses.find((t) => t.value === selectedThickness);
      if (found) return { totalUncut: found.totalUncut, totalMeters: found.totalMeters };
    }
    if (selectedWidth !== undefined) {
      const found = filterOptions.widths.find((w) => w.value === selectedWidth);
      if (found) return { totalUncut: found.totalUncut, totalMeters: found.totalMeters };
    }
    if (selectedLength !== undefined) {
      const found = filterOptions.lengths.find((l) => l.value === selectedLength);
      if (found) return { totalUncut: found.totalUncut, totalMeters: found.totalMeters };
    }
    return null;
  }, [
    selectedCategory,
    selectedGloss,
    selectedThickness,
    selectedWidth,
    selectedLength,
    filterOptions.categories,
    filterOptions.glosses,
    filterOptions.thicknesses,
    filterOptions.widths,
    filterOptions.lengths,
  ]);

  const firstFilterData = getFirstSelectedFilterData();

  // Validate quantity against store availability
  const validateQuantity = useCallback(
    (qty: number) => {
      if (!selectedStore) {
        setQuantityError('');
        return true;
      }

      const store = filterOptions.stores.find((s) => s.id === selectedStore);
      if (!store) {
        setQuantityError('');
        return true;
      }

      const availableQty = unit === 'meter' ? store.totalMeters : store.totalUncutRolls;
      if (qty > availableQty) {
        setQuantityError(
          `Số lượng không được vượt quá ${Math.round(availableQty).toLocaleString('vi-VN')} ${unit === 'meter' ? 'mét' : 'cuộn'}`
        );
        return false;
      }

      setQuantityError('');
      return true;
    },
    [selectedStore, unit, filterOptions.stores]
  );

  // Helper to check if option is disabled
  const isOptionDisabled = (type: keyof typeof availableOptions, value: any): boolean => {
    return !availableOptions[type].has(value);
  };

  // Add to cart logic
  const addToCart = useCartStore((state) => state.addItem);
  const initCart = useCartStore((state) => state.initCart);
  const user = useAuthStore((state) => state.user);

  const handleAddToCart = async () => {
    // Validate
    if (!color) {
      toast.error('Không có dữ liệu sản phẩm');
      return;
    }

    if (!selectedStore) {
      toast.error('Vui lòng chọn cửa hàng');
      return;
    }

    if (quantity < 1) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    // Validate quantity against store availability
    if (!validateQuantity(quantity)) {
      return;
    }

    if (!user?.id) {
      toast.error('Vui lòng đăng nhập để sử dụng giỏ hàng');
      return;
    }

    try {
      setIsAddingToCart(true);

      // Initialize cart if needed
      if (!useCartStore.getState().cart) {
        initCart(String(user.id));
      }

      // Create a fabric-like object with all selected attributes
      const fabricForCart = {
        id: color.id, // Using color ID as fabric ID
        thickness: selectedThickness || 0,
        gloss: {
          id: selectedGloss || 0,
          description: filterOptions.glosses.find((g) => g.id === selectedGloss)?.description || 'N/A',
        },
        length: selectedLength || 0,
        width: selectedWidth || 0,
        weight: 0,
        sellingPrice: 0,
        quantityInStock: 0,
        category: {
          id: selectedCategory || 0,
          name: filterOptions.categories.find((c) => c.id === selectedCategory)?.name || 'N/A',
        },
        color: {
          id: color.id,
          name: color.name,
          hexCode: color.hexCode,
        },
        supplier: {
          id: 0,
          name: 'N/A',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add store info
        storeId: selectedStore,
        storeName: filterOptions.stores.find((s) => s.id === selectedStore)?.name || 'N/A',
      };

      addToCart(fabricForCart as any, quantity, unit, {
        categoryId: selectedCategory,
        categoryName: filterOptions.categories.find((c) => c.id === selectedCategory)?.name,
        glossId: selectedGloss,
        glossDescription: filterOptions.glosses.find((g) => g.id === selectedGloss)?.description,
        thickness: selectedThickness,
        thicknessLabel: selectedThickness ? `${selectedThickness}mm` : undefined,
        width: selectedWidth,
        widthLabel: selectedWidth ? `${selectedWidth}m` : undefined,
        length: selectedLength,
        lengthLabel: selectedLength ? `${selectedLength}m` : undefined,
        storeId: selectedStore,
        storeName: filterOptions.stores.find((s) => s.id === selectedStore)?.name,
      });
      toast.success('Đã thêm vào giỏ hàng');
      
      // Reset inputs
      setQuantity(1);
      setUnit('meter');
      setSelectedStore(undefined);
      setQuantityError('');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Có lỗi khi thêm vào giỏ hàng');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Helper to handle click on disabled option - remove the filter
  const handleDisabledOptionClick = (
    type: 'category' | 'gloss' | 'thickness' | 'width' | 'length',
    value: any
  ) => {
    if (isOptionDisabled(
      type === 'category' ? 'categories' : type === 'gloss' ? 'glosses' : type === 'thickness' ? 'thicknesses' : type === 'width' ? 'widths' : 'lengths',
      value
    )) {
      // Clear the selection
      switch (type) {
        case 'category':
          setSelectedCategory(undefined);
          break;
        case 'gloss':
          setSelectedGloss(undefined);
          break;
        case 'thickness':
          setSelectedThickness(undefined);
          break;
        case 'width':
          setSelectedWidth(undefined);
          break;
        case 'length':
          setSelectedLength(undefined);
          break;
      }
    }
  };

  if (loading) {
    return <IsLoading />;
  }

  if (!color) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy màu vải</h2>
        <Button asChild>
          <Link href="/shop">Quay lại tìm kiếm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/shop">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại tìm kiếm
        </Link>
      </Button>

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Color Info */}
        <div className="space-y-6">
          {/* Color Preview Card */}
          <Card>
            <CardContent className="p-0">
              {/* Large Color Preview */}
              <div
                className="h-64 w-full rounded-t-lg"
                style={{ backgroundColor: color.hexCode || '#999999' }}
              />

              {/* Color Details */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mã màu</p>
                  <p className="text-2xl font-bold font-mono">{color.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tên màu</p>
                  <p className="text-xl font-semibold">{color.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hex Code</p>
                  <p className="font-mono text-sm">{color.hexCode || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Info */}
          {category && (
            <Card>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {category.image ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Chưa có ảnh loại vải</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Store Map */}
          <Card>
            <CardContent className="p-0">
              <StoreMap
                stores={storesWithDistance
                  .filter((store) => store.latitude !== null && store.longitude !== null)
                  .map((store) => ({
                    id: store.id,
                    name: store.name,
                    address: store.address,
                    latitude: store.latitude || 0,
                    longitude: store.longitude || 0,
                    isActive: true,
                    createdAt: '',
                    updatedAt: '',
                  }))}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Filters & Stock Info */}
        <div className="space-y-6">
          {/* Filter Options Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Bộ lọc sản phẩm
              </CardTitle>
              <CardDescription>Chọn chi tiết để xem tồn kho</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Filter (if not pre-selected) */}
              {!categoryId && filterOptions.categories.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Loại vải</Label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.categories.map((cat) => {
                      const isDisabled = isOptionDisabled('categories', cat.id);
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <FilterButton
                          key={cat.id}
                          label={cat.name}
                          count={cat.count}
                          isSelected={isSelected}
                          isDisabled={isDisabled}
                          onClick={() => {
                            if (isDisabled && !isSelected) {
                              handleDisabledOptionClick('category', cat.id);
                            } else if (isSelected) {
                              // Toggle off if already selected
                              setSelectedCategory(undefined);
                            } else {
                              // Toggle on if not selected
                              setSelectedCategory(cat.id);
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Gloss Filter */}
              {filterOptions.glosses.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Độ bóng</Label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.glosses.map((gloss) => {
                      const isDisabled = isOptionDisabled('glosses', gloss.id);
                      const isSelected = selectedGloss === gloss.id;
                      return (
                        <FilterButton
                          key={gloss.id}
                          label={gloss.description}
                          count={gloss.count}
                          isSelected={isSelected}
                          isDisabled={isDisabled}
                          onClick={() => {
                            if (isDisabled && !isSelected) {
                              handleDisabledOptionClick('gloss', gloss.id);
                            } else if (isSelected) {
                              // Toggle off if already selected
                              setSelectedGloss(undefined);
                            } else {
                              // Toggle on if not selected
                              setSelectedGloss(gloss.id);
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Thickness Filter */}
              {filterOptions.thicknesses.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Độ dày (mm)</Label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.thicknesses
                      .sort((a, b) => (a.value as number) - (b.value as number))
                      .map((thickness) => {
                      const isDisabled = isOptionDisabled('thicknesses', thickness.value);
                      const isSelected = selectedThickness === thickness.value;
                      return (
                        <FilterButton
                          key={thickness.value}
                          label={`${thickness.value}`}
                          count={thickness.count}
                          isSelected={isSelected}
                          isDisabled={isDisabled}
                          onClick={() => {
                            if (isDisabled && !isSelected) {
                              handleDisabledOptionClick('thickness', thickness.value);
                            } else if (isSelected) {
                              // Toggle off if already selected
                              setSelectedThickness(undefined);
                            } else {
                              // Toggle on if not selected
                              setSelectedThickness(thickness.value as number);
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Width Filter */}
              {filterOptions.widths.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Chiều rộng (m)</Label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.widths
                      .sort((a, b) => (a.value as number) - (b.value as number))
                      .map((width) => {
                      const isDisabled = isOptionDisabled('widths', width.value);
                      const isSelected = selectedWidth === width.value;
                      return (
                        <FilterButton
                          key={width.value}
                          label={`${width.value}`}
                          count={width.count}
                          isSelected={isSelected}
                          isDisabled={isDisabled}
                          onClick={() => {
                            if (isDisabled && !isSelected) {
                              handleDisabledOptionClick('width', width.value);
                            } else if (isSelected) {
                              // Toggle off if already selected
                              setSelectedWidth(undefined);
                            } else {
                              // Toggle on if not selected
                              setSelectedWidth(width.value as number);
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Length Filter */}
              {filterOptions.lengths.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Chiều dài (m)</Label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.lengths
                      .sort((a, b) => (a.value as number) - (b.value as number))
                      .map((length) => {
                      const isDisabled = isOptionDisabled('lengths', length.value);
                      const isSelected = selectedLength === length.value;
                      return (
                        <FilterButton
                          key={length.value}
                          label={`${length.value}`}
                          count={length.count}
                          isSelected={isSelected}
                          isDisabled={isDisabled}
                          onClick={() => {
                            if (isDisabled && !isSelected) {
                              handleDisabledOptionClick('length', length.value);
                            } else if (isSelected) {
                              // Toggle off if already selected
                              setSelectedLength(undefined);
                            } else {
                              // Toggle on if not selected
                              setSelectedLength(length.value as number);
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add to Cart Section */}
              <div className="border-t pt-6 space-y-3">
                <h3 className="font-semibold text-sm">Thêm vào giỏ hàng</h3>

                {/* Inline: Quantity, Unit, Store */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Quantity Input */}
                  <div className="col-span-1">
                    <Label className="text-xs">Số lượng</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => {
                        const newQty = Math.max(1, parseInt(e.target.value) || 1);
                        setQuantity(newQty);
                        validateQuantity(newQty);
                      }}
                      className={`mt-1 h-9 ${quantityError ? 'border-red-500' : ''}`}
                    />
                    {quantityError && <p className="text-xs text-red-500 mt-1">{quantityError}</p>}
                  </div>

                  {/* Unit Select */}
                  <div className="col-span-1">
                    <Label className="text-xs">Đơn vị</Label>
                    <Select 
                      value={unit} 
                      onValueChange={(v) => {
                        setUnit(v as 'roll' | 'meter');
                        validateQuantity(quantity);
                      }}
                    >
                      <SelectTrigger className="mt-1 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meter">Mét</SelectItem>
                        <SelectItem value="roll">Cuộn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Store Select with location button */}
                  <div className="col-span-4">
                    <Label className="text-xs">Cửa hàng</Label>
                    <Select 
                      value={selectedStore?.toString() || ''} 
                      onValueChange={(v) => {
                        setSelectedStore(parseInt(v));
                        validateQuantity(quantity);
                      }}
                    >
                      <SelectTrigger className="mt-1 h-9">
                        <SelectValue placeholder="Chọn cửa hàng" />
                      </SelectTrigger>
                      <SelectContent>
                        {storesWithDistance.map((store) => {
                          const availableQty = unit === 'meter' ? store.totalMeters : store.totalUncutRolls;
                          const distanceStr = store.distance ? ` (${store.distance.toFixed(1)} km)` : '';
                          return (
                            <SelectItem key={store.id} value={store.id.toString()}>
                              {store.name} ({Math.round(availableQty).toLocaleString('vi-VN')})
                              {distanceStr}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Button */}
                  <div className="col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="w-full h-9"
                      title="Xác định vị trí của bạn"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !selectedStore}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Store Stock Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Tồn kho cửa hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary if filter is selected */}
              {firstFilterData && (
                <div className="bg-linear-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Cuộn(nguyên)</p>
                      <p className="text-2xl font-bold text-blue-600">{firstFilterData.totalUncut.toLocaleString('vi-VN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Tổng tồn (mét)</p>
                      <p className="text-2xl font-bold text-blue-600">{Math.round(firstFilterData.totalMeters).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Store list */}
              {filterOptions.stores.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Không có cửa hàng có sản phẩm này</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filterOptions.stores.map((store) => (
                    <div key={store.id} className="border rounded-lg p-3 space-y-2">
                      <div>
                        <p className="font-medium">{store.name}</p>
                        <p className="text-xs text-muted-foreground">{store.address}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="bg-muted/50 p-2 rounded">
                          <p className="text-xs text-muted-foreground">Số sản phẩm</p>
                          <p className="font-semibold">{store.fabricCount}</p>
                        </div>
                        <div className="bg-muted/50 p-2 rounded">
                          <p className="text-xs text-muted-foreground">Cuộn(nguyên)</p>
                          <p className="font-semibold">{store.totalUncutRolls.toLocaleString('vi-VN')}</p>
                        </div>
                        <div className="bg-muted/50 p-2 rounded">
                          <p className="text-xs text-muted-foreground">Tổng tồn (mét)</p>
                          <p className="font-semibold">{Math.round(store.totalMeters).toLocaleString('vi-VN')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
