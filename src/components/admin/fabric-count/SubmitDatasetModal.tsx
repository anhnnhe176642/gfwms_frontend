'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fabricCountService } from '@/services/fabric-count.service';
import { yoloDatasetService } from '@/services/yolo-dataset.service';
import { Detection } from '@/types/yolo';
import type { DatasetListItem } from '@/types/yolo-dataset';

interface SubmitDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  detections: Detection[];
  imageInfo: {
    width: number;
    height: number;
  };
  onSuccess?: () => void;
}

export const SubmitDatasetModal: React.FC<SubmitDatasetModalProps> = ({
  isOpen,
  onClose,
  imageFile,
  detections,
  imageInfo,
  onSuccess,
}) => {
  const [datasets, setDatasets] = useState<DatasetListItem[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(false);

  // Fetch datasets when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDatasets();
    }
  }, [isOpen]);

  const fetchDatasets = async () => {
    try {
      setIsLoadingDatasets(true);
      const response = await yoloDatasetService.getDatasets({
        limit: 100,
        status: 'ACTIVE',
      });
      setDatasets(response.data);
      if (response.data.length > 0) {
        setSelectedDatasetId(response.data[0].id);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Lỗi khi tải danh sách dataset';
      toast.error(message);
    } finally {
      setIsLoadingDatasets(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDatasetId || !imageFile) {
      toast.error('Vui lòng chọn dataset và ảnh');
      return;
    }

    if (detections.length === 0) {
      toast.error('Không có vật thể nào để gửi');
      return;
    }

    try {
      setIsLoading(true);

      // Submit to dataset using fabric count service
      await fabricCountService.submitToDataset({
        datasetId: selectedDatasetId,
        imageFile,
        detections,
        imageInfo,
        notes,
      });

      toast.success(
        `Đã gửi ảnh với ${detections.length} vật thể vào dataset thành công!`
      );

      // Reset form
      setSelectedDatasetId(datasets[0]?.id || '');
      setNotes('');
      onClose();

      // Call onSuccess callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Lỗi khi gửi ảnh vào dataset';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gửi ảnh vào Dataset</DialogTitle>
          <DialogDescription>
            Chọn dataset để lưu ảnh cùng các vật thể được đánh dấu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dataset Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Dataset</label>
            {isLoadingDatasets ? (
              <div className="flex items-center justify-center p-2 border rounded">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">
                  Đang tải danh sách...
                </span>
              </div>
            ) : datasets.length === 0 ? (
              <div className="p-2 border rounded bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Không có dataset nào. Hãy tạo dataset trước.
                </p>
              </div>
            ) : (
              <Select value={selectedDatasetId} onValueChange={setSelectedDatasetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.name}
                      {dataset.totalImages !== undefined && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({dataset.totalImages} ảnh)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Image Info */}
          <div className="p-3 bg-muted/50 rounded text-sm space-y-1">
            <p>
              <span className="font-medium">Vật thể:</span> {detections.length}
            </p>
            <p>
              <span className="font-medium">Kích thước ảnh:</span>{' '}
              {imageInfo.width} x {imageInfo.height}px
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ghi chú (tùy chọn)</label>
            <Textarea
              placeholder="Thêm ghi chú về ảnh này..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-20"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !selectedDatasetId ||
              datasets.length === 0 ||
              detections.length === 0
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang gửi...
              </>
            ) : (
              'Gửi'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
