'use client';
import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import fabricCategoryService from '@/services/fabricCategory.service';
import fabricService from '@/services/fabric.service';
import fabricColorService from '@/services/fabricColor.service';
import fabricGlossService from '@/services/fabricGloss.service';
import supplierService from '@/services/supplier.service';
import type { FabricCategoryListItem } from '@/types/fabricCategory';
import type { FabricListItem } from '@/types/fabric';
import type { FabricColorListItem } from '@/types/fabricColor';
import type { FabricGlossListItem } from '@/types/fabricGloss';
import type { SupplierListItem } from '@/types/supplier';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IsLoading } from '@/components/common';
import AddToCart from '@/components/shop/AddToCart';

interface FabricCategoryDetailProps {
  categoryId: string;
}

export default function FabricCategoryDetail({ categoryId }: FabricCategoryDetailProps) {
  const [category, setCategory] = useState<FabricCategoryListItem | null>(null);
  const [fabrics, setFabrics] = useState<FabricListItem[]>([]);
  const [colors, setColors] = useState<FabricColorListItem[]>([]);
  const [glosses, setGlosses] = useState<FabricGlossListItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedGloss, setSelectedGloss] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch category
        const categoryData = await fabricCategoryService.getFabricCategoryById(categoryId);
        setCategory(categoryData);

        // Fetch fabrics by category
        const fabricsData = await fabricService.getFabrics({
          categoryId: categoryId,
          limit: 100,
        });
        setFabrics(fabricsData.data);

        // Fetch filter options
        const colorsData = await fabricColorService.getFabricColors({ limit: 100 });
        setColors(colorsData.data);

        const glossesData = await fabricGlossService.getFabricGlosses({ limit: 100 });
        setGlosses(glossesData.data);

        const suppliersData = await supplierService.getSuppliers({ limit: 100 });
        setSuppliers(suppliersData.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  // Filter fabrics based on selected options
  const filteredFabrics = fabrics.filter((fabric) => {
    if (selectedColor && selectedColor !== 'all' && fabric.color.id.toString() !== selectedColor) return false;
    if (selectedGloss && selectedGloss !== 'all' && fabric.gloss.id.toString() !== selectedGloss) return false;
    if (selectedSupplier && selectedSupplier !== 'all' && fabric.supplier.id.toString() !== selectedSupplier) return false;
    return true;
  });

  if (loading) {
    return <IsLoading />;
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy danh mục</h2>
        <Button asChild>
          <Link href="/">Quay lại trang chủ</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Link>
      </Button>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
        <p className="text-muted-foreground text-lg">{category.description}</p>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Lọc sản phẩm</CardTitle>
          <CardDescription>Chọn các tiêu chí để lọc vải</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Color Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Màu sắc</label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn màu sắc" />
                </SelectTrigger>
                <SelectContent>
                  {colors.length > 0 && (
                    <SelectItem value="all">Tất cả màu sắc</SelectItem>
                  )}
                  {colors.map((color) => (
                    <SelectItem key={color.id} value={color.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.hexCode || '#999' }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gloss Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Độ bóng</label>
              <Select value={selectedGloss} onValueChange={setSelectedGloss}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ bóng" />
                </SelectTrigger>
                <SelectContent>
                  {glosses.length > 0 && (
                    <SelectItem value="all">Tất cả độ bóng</SelectItem>
                  )}
                  {glosses.map((gloss) => (
                    <SelectItem key={gloss.id} value={gloss.id.toString()}>
                      {gloss.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Supplier Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nhà cung cấp</label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhà cung cấp" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.length > 0 && (
                    <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
                  )}
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedColor('');
                setSelectedGloss('');
                setSelectedSupplier('');
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fabrics Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Sản phẩm ({filteredFabrics.length})</h2>
        </div>

        {filteredFabrics.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">Không tìm thấy sản phẩm phù hợp</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFabrics.map((fabric) => (
              <Card key={fabric.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Color Preview */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-input"
                        style={{ backgroundColor: fabric.color.hexCode || '#999' }}
                      />
                      <div>
                        <p className="font-semibold">{fabric.color.name}</p>
                        <p className="text-sm text-muted-foreground">Danh mục: {fabric.category.name}</p>
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Độ dày</p>
                        <p className="font-medium">{fabric.thickness} mm</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Độ bóng</p>
                        <p className="font-medium">{fabric.gloss.description}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Chiều dài</p>
                        <p className="font-medium">{fabric.length} m</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Chiều rộng</p>
                        <p className="font-medium">{fabric.width} m</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cân nặng</p>
                        <p className="font-medium">{fabric.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Kho</p>
                        <p className="font-medium">{fabric.quantityInStock}</p>
                      </div>
                    </div>

                    {/* Supplier */}
                    <div className="text-sm">
                      <p className="text-muted-foreground">Nhà cung cấp</p>
                      <p className="font-medium">{fabric.supplier.name}</p>
                    </div>

                    {/* Price */}
                    <div className="border-t pt-4 mt-4">
                      <p className="text-2xl font-bold text-primary">
                        {fabric.sellingPrice.toLocaleString('vi-VN')} ₫
                      </p>
                    </div>

                    {/* Add to Cart */}
                    <AddToCart fabric={fabric} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
