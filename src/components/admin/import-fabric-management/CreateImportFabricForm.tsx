'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigation } from '@/hooks/useNavigation';
import { importFabricService } from '@/services/importFabric.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { createImportFabricSchema, type CreateImportFabricFormData } from '@/schemas/importFabric.schema';
import { ArrowLeft, Plus, Loader2, Upload, X } from 'lucide-react';
import { ImportFabricItemRow } from './ImportFabricItemRow';
import type { CreateImportFabricRequest } from '@/services/importFabric.service';

/**
 * Form tạo đơn nhập kho
 * 
 * Features:
 * - Multiple fabric items với dynamic add/remove rows
 * - Client-side validation với Yup schema
 * - Server-side error mapping từ backend format
 * - Infinite scroll select dropdowns
 * 
 * Backend error format:
 * {
 *   "message": "Dữ liệu không hợp lệ",
 *   "errors": [
 *     { "field": "items.0.length", "message": "Phải là số dương" },
 *     { "field": "items.1.quantity", "message": "Quantity phải lớn hơn 0" }
 *   ]
 * }
 */

export interface CreateImportFabricFormProps {
  warehouseId: string | number;
}

const emptyItem = {
  thickness: '',
  glossId: '',
  length: '',
  width: '',
  weight: '',
  categoryId: '',
  colorId: '',
  supplierId: '',
  quantity: '',
  price: '',
};

export function CreateImportFabricForm({ warehouseId }: CreateImportFabricFormProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [items, setItems] = useState<CreateImportFabricFormData['items']>([{ ...emptyItem }]);
  const [signatureImage, setSignatureImage] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Add a new item row
  const handleAddItem = () => {
    setItems([...items, { ...emptyItem }]);
  };

  // Remove an item row
  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      // Clear errors for removed item
      const newErrors = { ...errors };
      if (newErrors.items && Array.isArray(newErrors.items)) {
        newErrors.items.splice(index, 1);
        setErrors(newErrors);
      }
    } else {
      toast.error('Phải có ít nhất một mục nhập');
    }
  };

  // Handle item field change
  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);

    // Clear error for this field when user changes it
    if (errors.items?.[index]?.[field]) {
      const newErrors = { ...errors };
      if (newErrors.items && Array.isArray(newErrors.items)) {
        const itemErrors = { ...newErrors.items[index] };
        delete itemErrors[field];
        newErrors.items[index] = itemErrors;
        setErrors(newErrors);
      }
    }
  };

  // Handle item field blur
  const handleItemBlur = (index: number, field: string) => {
    setTouched({ ...touched, [`items[${index}].${field}`]: true });
  };

  // Handle signature image selection
  const handleSignatureImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        toast.error('Định dạng ảnh không hợp lệ (JPEG, PNG, GIF, WEBP)');
        return;
      }

      if (file.size > maxSize) {
        toast.error('Ảnh chữ ký phải nhỏ hơn 10MB');
        return;
      }

      setSignatureImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove signature image
  const handleRemoveSignature = () => {
    setSignatureImage(null);
    setSignaturePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate form
  const validateForm = async (): Promise<boolean> => {
    try {
      await createImportFabricSchema.validate({ items }, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: Record<string, any> = { items: [] };
        
        err.inner.forEach((error) => {
          if (error.path) {
            // Parse path like "items[0].categoryId"
            const match = error.path.match(/items\[(\d+)\]\.(.+)/);
            if (match) {
              const itemIndex = parseInt(match[1]);
              const fieldName = match[2];
              
              if (!validationErrors.items[itemIndex]) {
                validationErrors.items[itemIndex] = {};
              }
              validationErrors.items[itemIndex][fieldName] = error.message;
            } else if (error.path === 'items') {
              validationErrors.items = error.message;
            }
          }
        });

        setErrors(validationErrors);

        // Mark all fields as touched to show errors
        const newTouched: Record<string, boolean> = {};
        items.forEach((_, index) => {
          Object.keys(emptyItem).forEach((field) => {
            newTouched[`items[${index}].${field}`] = true;
          });
        });
        setTouched(newTouched);

        return false;
      }
      return false;
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setIsSubmitting(true);

    try {
      // Validate form first
      const isValid = await validateForm();
      if (!isValid) {
        toast.error('Vui lòng kiểm tra lại thông tin');
        setIsSubmitting(false);
        return;
      }

      // Convert string values to numbers for API
      const requestData: CreateImportFabricRequest = {
        warehouseId: Number(warehouseId),
        items: items.map((item) => ({
          thickness: parseFloat(item.thickness),
          glossId: parseInt(item.glossId),
          length: parseFloat(item.length),
          width: parseFloat(item.width),
          weight: parseFloat(item.weight),
          categoryId: parseInt(item.categoryId),
          colorId: item.colorId,
          supplierId: parseInt(item.supplierId),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
        })),
        signatureImage: signatureImage || undefined,
      };

      await importFabricService.createImportFabric(requestData);
      toast.success('Tạo đơn nhập kho thành công');
      router.push(`/admin/warehouses/${warehouseId}/import-fabrics`);
    } catch (err) {
      // Handle backend validation errors
      const fieldErrors = extractFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        // Map backend errors to form structure
        // Backend format: "items.0.categoryId" -> Frontend: items[0].categoryId
        const mappedErrors: Record<string, any> = { items: [] };
        const touchedFields: Record<string, boolean> = {};

        Object.entries(fieldErrors).forEach(([key, message]) => {
          // Parse backend error keys like "items.0.categoryId"
          const match = key.match(/items\.(\d+)\.(.+)/);
          if (match) {
            const itemIndex = parseInt(match[1]);
            const fieldName = match[2];
            
            // Initialize item errors object if not exists
            if (!mappedErrors.items[itemIndex]) {
              mappedErrors.items[itemIndex] = {};
            }
            
            // Set error message
            mappedErrors.items[itemIndex][fieldName] = message;
            
            // Mark field as touched so error is displayed
            touchedFields[`items[${itemIndex}].${fieldName}`] = true;
          }
        });
        
        setErrors(mappedErrors);
        setTouched((prev) => ({ ...prev, ...touchedFields }));
      }

      const message = getServerErrorMessage(err);
      setServerError(message || 'Có lỗi xảy ra khi tạo đơn nhập kho');
      toast.error(message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
          disabled={isSubmitting}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo đơn nhập kho</h1>
          <p className="text-muted-foreground mt-1">
            Điền thông tin vải để tạo một đơn nhập kho mới
          </p>
        </div>
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Import Fabric Items Card */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết vải nhập</CardTitle>
            <CardDescription>Thêm thông tin các loại vải cần nhập vào kho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Items Table */}
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">STT</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Loại vải</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Màu sắc</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Độ bóng</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Nhà cung cấp</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <ImportFabricItemRow
                      key={index}
                      index={index}
                      item={item}
                      errors={errors.items?.[index] || {}}
                      touched={{
                        thickness: touched[`items[${index}].thickness`],
                        glossId: touched[`items[${index}].glossId`],
                        length: touched[`items[${index}].length`],
                        width: touched[`items[${index}].width`],
                        weight: touched[`items[${index}].weight`],
                        categoryId: touched[`items[${index}].categoryId`],
                        colorId: touched[`items[${index}].colorId`],
                        supplierId: touched[`items[${index}].supplierId`],
                        quantity: touched[`items[${index}].quantity`],
                        price: touched[`items[${index}].price`],
                      }}
                      onChange={(field, value) => handleItemChange(index, field, value)}
                      onBlur={(field) => handleItemBlur(index, field)}
                      onRemove={() => handleRemoveItem(index)}
                      canRemove={items.length > 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Array-level error */}
            {typeof errors.items === 'string' && (
              <p className="text-sm text-destructive">{errors.items}</p>
            )}

            {/* Add Item Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
              disabled={isSubmitting}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Thêm dòng mới
            </Button>
          </CardContent>
        </Card>

        {/* Signature Image Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Ảnh chữ ký hoá đơn</CardTitle>
            <CardDescription>Tải lên ảnh chữ ký hoá đơn (tùy chọn, max 10MB)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleSignatureImageSelect}
              className="hidden"
            />

            {signaturePreview ? (
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative border-2 border-dashed rounded-lg p-4 bg-muted/30">
                  <img
                    src={signaturePreview}
                    alt="Signature Preview"
                    className="max-h-64 mx-auto rounded"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveSignature}
                    className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {signatureImage?.name} ({(signatureImage!.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Thay đổi ảnh
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Nhấp để tải lên ảnh chữ ký</p>
                <p className="text-xs text-muted-foreground mt-1">
                  hoặc kéo thả ảnh (JPEG, PNG, GIF, WEBP, max 10MB)
                </p>
              </div>
            )}

            {errors.signatureImage && (
              <p className="text-sm text-destructive">{errors.signatureImage}</p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={handleGoBack} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tạo đơn nhập
          </Button>
        </div>
      </form>
    </div>
  );
}
