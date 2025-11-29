/**
 * YOLO Detection Types
 */

export type BoundingBox = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type Point = {
  x: number;
  y: number;
};

export type Dimensions = {
  width: number;
  height: number;
};

export type Detection = {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: BoundingBox;
  center: Point;
  dimensions: Dimensions;
  row?: number;
  rowline?: {
    row: number;
    meanX: number;
    meanY: number;
    dirX: number;
    dirY: number;
  } | null;
};

export type Summary = {
  total_objects: number;
  counts_by_class: Record<string, number>;
};

export type ImageInfo = {
  width: number;
  height: number;
  path: string;
};

export type ModelInfo = {
  model_path: string;
  confidence_threshold: number;
  classes: Record<string, string>;
};

export type YoloDetectionData = {
  summary: Summary;
  detections: Detection[];
  image_info: ImageInfo;
  model_info: ModelInfo;
};

export type YoloDetectionResponse = {
  success: boolean;
  message: string;
  data: YoloDetectionData;
};

export type YoloDetectParams = {
  image: File;
  confidence?: number;
};
