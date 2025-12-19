'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { InfiniteScrollSelect } from './InfiniteScrollSelect';
import { fabricCategoryService } from '@/services/fabricCategory.service';
import { fabricColorService } from '@/services/fabricColor.service';
import { fabricGlossService } from '@/services/fabricGloss.service';
import { supplierService } from '@/services/supplier.service';
import type { CreateImportFabricItemFormData } from '@/schemas/importFabric.schema';

interface ImportFabricItemRowProps {
  index: number;
  item: CreateImportFabricItemFormData;
  errors: Partial<Record<keyof CreateImportFabricItemFormData, string>>;
  touched: Partial<Record<keyof CreateImportFabricItemFormData, boolean>>;
  onChange: (field: keyof CreateImportFabricItemFormData, value: string) => void;
  onBlur: (field: keyof CreateImportFabricItemFormData) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function ImportFabricItemRow({
  index,
  item,
  errors,
  touched,
  onChange,
  onBlur,
  onRemove,
  canRemove,
}: ImportFabricItemRowProps) {
  const handleInputChange = (field: keyof CreateImportFabricItemFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange(field, e.target.value);
  };

  const handleInputBlur = (field: keyof CreateImportFabricItemFormData) => () => {
    onBlur(field);
  };

  const showError = (field: keyof CreateImportFabricItemFormData) => {
    return touched[field] && errors[field];
  };

  return (
    <React.Fragment>
      {/* Row 1: Select fields */}
      <tr className="border-b">
        <td className="px-4 py-3 text-sm font-medium align-top">{index + 1}</td>

        {/* Category Select */}
        <td className="px-4 py-3 align-top">
          <div className="space-y-1">
            <InfiniteScrollSelect
              value={item.categoryId}
              onChange={(val) => {
                onChange('categoryId', val);
                onBlur('categoryId');
              }}
              fetchData={fabricCategoryService.getFabricCategories}
              getLabel={(cat) => cat.name}
              getValue={(cat) => String(cat.id)}
              placeholder="Chọn loại vải"
              error={showError('categoryId') ? errors.categoryId : undefined}
            />
            {showError('categoryId') && (
              <p className="text-xs text-destructive">{errors.categoryId}</p>
            )}
          </div>
        </td>

        {/* Color Select */}
        <td className="px-4 py-3 align-top">
          <div className="space-y-1">
            <InfiniteScrollSelect
              value={item.colorId}
              onChange={(val) => {
                onChange('colorId', val);
                onBlur('colorId');
              }}
              fetchData={fabricColorService.getFabricColors}
              getLabel={(color) => color.name}
              getValue={(color) => String(color.id)}
              placeholder="Chọn màu sắc"
              error={showError('colorId') ? errors.colorId : undefined}
            />
            {showError('colorId') && (
              <p className="text-xs text-destructive">{errors.colorId}</p>
            )}
          </div>
        </td>

        {/* Gloss Select */}
        <td className="px-4 py-3 align-top">
          <div className="space-y-1">
            <InfiniteScrollSelect
              value={item.glossId}
              onChange={(val) => {
                onChange('glossId', val);
                onBlur('glossId');
              }}
              fetchData={fabricGlossService.getFabricGlosses}
              getLabel={(gloss) => gloss.description}
              getValue={(gloss) => String(gloss.id)}
              placeholder="Chọn độ bóng"
              error={showError('glossId') ? errors.glossId : undefined}
            />
            {showError('glossId') && (
              <p className="text-xs text-destructive">{errors.glossId}</p>
            )}
          </div>
        </td>

        {/* Supplier Select */}
        <td className="px-4 py-3 align-top">
          <div className="space-y-1">
            <InfiniteScrollSelect
              value={item.supplierId}
              onChange={(val) => {
                onChange('supplierId', val);
                onBlur('supplierId');
              }}
              fetchData={supplierService.getSuppliers}
              getLabel={(supplier) => supplier.name}
              getValue={(supplier) => String(supplier.id)}
              placeholder="Chọn NCC"
              error={showError('supplierId') ? errors.supplierId : undefined}
            />
            {showError('supplierId') && (
              <p className="text-xs text-destructive">{errors.supplierId}</p>
            )}
          </div>
        </td>

        {/* Delete Button */}
        <td className="px-4 py-3 align-top">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={!canRemove}
            className="h-9 w-9 p-0"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </td>
      </tr>

      {/* Row 2: Dimension inputs */}
      <tr className="border-b bg-muted/30">
        <td></td>

        {/* Thickness */}
        <td className="px-4 py-3">
          <div className="space-y-1">
            <Input
              type="number"
              placeholder="Độ dày (mm)"
              value={item.thickness}
              onChange={handleInputChange('thickness')}
              onBlur={handleInputBlur('thickness')}
              step="0.01"
              className={`h-9 text-sm ${showError('thickness') ? 'border-destructive' : ''}`}
            />
            {showError('thickness') && (
              <p className="text-xs text-destructive">{errors.thickness}</p>
            )}
          </div>
        </td>

        {/* Length */}
        <td className="px-4 py-3">
          <div className="space-y-1">
            <Input
              type="number"
              placeholder="Dài (m)"
              value={item.length}
              onChange={handleInputChange('length')}
              onBlur={handleInputBlur('length')}
              step="0.01"
              className={`h-9 text-sm ${showError('length') ? 'border-destructive' : ''}`}
            />
            {showError('length') && (
              <p className="text-xs text-destructive">{errors.length}</p>
            )}
          </div>
        </td>

        {/* Width */}
        <td className="px-4 py-3">
          <div className="space-y-1">
            <Input
              type="number"
              placeholder="Rộng (cm)"
              value={item.width}
              onChange={handleInputChange('width')}
              onBlur={handleInputBlur('width')}
              step="0.01"
              className={`h-9 text-sm ${showError('width') ? 'border-destructive' : ''}`}
            />
            {showError('width') && (
              <p className="text-xs text-destructive">{errors.width}</p>
            )}
          </div>
        </td>

        {/* Weight */}
        <td className="px-4 py-3">
          <div className="space-y-1">
            <Input
              type="number"
              placeholder="Trọng lượng (kg)"
              value={item.weight}
              onChange={handleInputChange('weight')}
              onBlur={handleInputBlur('weight')}
              step="0.01"
              className={`h-9 text-sm ${showError('weight') ? 'border-destructive' : ''}`}
            />
            {showError('weight') && (
              <p className="text-xs text-destructive">{errors.weight}</p>
            )}
          </div>
        </td>

        <td></td>
      </tr>

      {/* Row 3: Quantity and Price */}
      <tr className="border-b">
        <td></td>

        {/* Quantity */}
        <td className="px-4 py-3">
          <div className="space-y-1">
            <Input
              type="number"
              placeholder="Số lượng"
              value={item.quantity}
              onChange={handleInputChange('quantity')}
              onBlur={handleInputBlur('quantity')}
              step="1"
              className={`h-9 text-sm ${showError('quantity') ? 'border-destructive' : ''}`}
            />
            {showError('quantity') && (
              <p className="text-xs text-destructive">{errors.quantity}</p>
            )}
          </div>
        </td>

        {/* Price */}
        <td className="px-4 py-3">
          <div className="space-y-1">
            <Input
              type="number"
              placeholder="Giá (VND)"
              value={item.price}
              onChange={handleInputChange('price')}
              onBlur={handleInputBlur('price')}
              step="1000"
              className={`h-9 text-sm ${showError('price') ? 'border-destructive' : ''}`}
            />
            {showError('price') && (
              <p className="text-xs text-destructive">{errors.price}</p>
            )}
          </div>
        </td>

        <td colSpan={3}></td>
      </tr>
    </React.Fragment>
  );
}
