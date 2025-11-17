# Bounding Box System - Hướng dẫn sử dụng

Hệ thống bounding box tái sử dụng được cho các tính năng crop ảnh và label ảnh YOLO.

## 📁 Cấu trúc

```
src/
├── hooks/
│   └── useBoundingBox.ts          # Hook quản lý bounding boxes
├── lib/
│   └── canvasHelpers.ts            # Helpers vẽ và xử lý boxes
└── components/
    ├── admin/
    │   ├── fabric-count/
    │   │   ├── ImageCropper.tsx               # Component cũ (sẽ deprecated)
    │   │   └── ImageCropperRefactored.tsx     # Component mới dùng hook
    │   └── yolo-dataset-labeling/
    │       └── YOLOImageLabeling.tsx          # Component label YOLO
```

## 🎯 Tính năng

### 1. Hook `useBoundingBox`

Hook này quản lý tất cả logic tương tác với bounding boxes:

#### Tính năng:
-  Vẽ box mới bằng cách kéo chuột
-  Di chuyển box (drag inside box)
-  Resize box (drag corners/edges)
-  Hỗ trợ single box hoặc multiple boxes
-  Tự động cập nhật cursor dựa trên vị trí
-  Xử lý mouse events ngoài canvas

#### Cách sử dụng:

```tsx
import { useBoundingBox } from '@/hooks/useBoundingBox';

const MyComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    boxes,              // Danh sách boxes đã vẽ
    activeBox,          // Box đang được vẽ/chỉnh sửa
    isDrawing,          // Đang vẽ box mới
    isMoving,           // Đang di chuyển box
    isResizing,         // Đang resize box
    handleMouseDown,    // Event handler cho mouse down
    handleMouseMove,    // Event handler cho mouse move
    handleMouseUp,      // Event handler cho mouse up
    addBox,             // Thêm box mới
    updateBox,          // Cập nhật box
    removeBox,          // Xóa box
    clearBoxes,         // Xóa tất cả boxes
    setActiveBox,       // Set box active
  } = useBoundingBox({
    canvasRef,
    enabled: true,
    multipleBoxes: false, // true nếu cho phép nhiều boxes
    edgeThreshold: 15,    // Khoảng cách để detect edge
    handleSize: 10,       // Kích thước handle
    onBoxComplete: (box) => {
      console.log('Box completed:', box);
    },
    onBoxUpdate: (box) => {
      console.log('Box updated:', box);
    },
  });

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
};
```

### 2. Canvas Helpers (`canvasHelpers.ts`)

Các helper functions để vẽ và xử lý bounding boxes:

#### `drawBoundingBox(ctx, box, options)`
Vẽ một bounding box lên canvas.

```tsx
import { drawBoundingBox } from '@/lib/canvasHelpers';

drawBoundingBox(ctx, box, {
  strokeColor: '#4ECDC4',
  fillColor: 'rgba(0, 0, 0, 0)',
  lineWidth: 2,
  showHandles: true,
  showLabel: true,
  handleColor: '#4ECDC4',
  handleSize: 10,
  edgeHandleColor: '#95E1D3',
  edgeHandleSize: 8,
  showDimensions: true,
  scale: 1,
});
```

#### `drawBoundingBoxes(ctx, boxes, options)`
Vẽ nhiều boxes, highlight box active.

```tsx
drawBoundingBoxes(ctx, boxes, {
  activeBoxId: 'box-123',
  // ... other options
});
```

#### `drawDimOverlay(ctx, width, height, box, opacity)`
Vẽ overlay tối xung quanh box (dùng cho crop).

```tsx
drawDimOverlay(ctx, canvasWidth, canvasHeight, cropBox, 0.5);
```

#### Conversion helpers:

```tsx
// Chuyển box sang YOLO format (normalized 0-1)
const yolo = boundingBoxToYOLO(box, imageWidth, imageHeight);
// { x: 0.5, y: 0.5, width: 0.2, height: 0.3 }

// Chuyển YOLO format sang box
const box = yoloToBoundingBox(yolo, imageWidth, imageHeight, 'box-1', 'person');

// Normalize box (đảm bảo startX < endX, startY < endY)
const normalized = normalizeBoundingBox(box);

// Scale box
const scaled = scaleBoundingBox(box, 0.5);

// Kiểm tra box hợp lệ
const isValid = isValidBoundingBox(box, 10); // minSize = 10px

// Lấy kích thước
const { width, height } = getBoundingBoxSize(box);
```

## 📝 Ví dụ sử dụng

### Image Cropper (Single Box)

Xem: `src/components/admin/fabric-count/ImageCropperRefactored.tsx`

```tsx
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
  multipleBoxes: false, // Chỉ 1 box
});

const cropBox = boxes.length > 0 ? boxes[0] : activeBox;
```

### YOLO Image Labeling (Multiple Boxes)

Xem: `src/components/admin/yolo-dataset-labeling/YOLOImageLabeling.tsx`

```tsx
const {
  boxes,
  activeBox,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  removeBox,
  updateBox,
  clearBoxes,
} = useBoundingBox({
  canvasRef,
  enabled: imageLoaded,
  multipleBoxes: true, // Nhiều boxes
});

// Vẽ tất cả boxes với labels
const allBoxes = activeBox ? [...boxes, activeBox] : boxes;
drawBoundingBoxes(ctx, allBoxes, {
  showLabel: true,
  activeBoxId: activeBox?.id,
});
```

## 🎨 Interaction Pattern

### Vẽ box mới:
1. Click và drag trên canvas
2. Box được tạo với `startX, startY, endX, endY`
3. Sau khi mouse up, box được add vào `boxes` array

### Di chuyển box:
1. Click vào bên trong box (cách cạnh > `edgeThreshold`)
2. Drag để di chuyển
3. Box được giữ nguyên kích thước, chỉ thay đổi vị trí

### Resize box:
1. Click vào góc hoặc cạnh của box (trong vùng `edgeThreshold`)
2. Drag để resize
3. Tùy góc/cạnh nào được chọn mà box resize tương ứng

### Cursor states:
- `crosshair`: Mặc định, sẵn sàng vẽ box mới
- `move`: Hover inside box
- `nwse-resize`: Hover góc top-left hoặc bottom-right
- `nesw-resize`: Hover góc top-right hoặc bottom-left
- `ns-resize`: Hover cạnh top hoặc bottom
- `ew-resize`: Hover cạnh left hoặc right

## 🔧 Type Definitions

### BoundingBox
```typescript
interface BoundingBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  id?: string;        // Unique ID
  label?: string;     // Class label (cho YOLO)
}
```

### DrawBoxOptions
```typescript
interface DrawBoxOptions {
  strokeColor?: string;
  fillColor?: string;
  lineWidth?: number;
  showHandles?: boolean;
  showLabel?: boolean;
  handleColor?: string;
  handleSize?: number;
  edgeHandleColor?: string;
  edgeHandleSize?: number;
  dimBackground?: boolean;
  showDimensions?: boolean;
  scale?: number;
}
```

## 🚀 Migration Guide

### Chuyển từ ImageCropper.tsx cũ sang dùng hook:

**Trước:**
```tsx
// Phải tự quản lý tất cả states
const [isDrawing, setIsDrawing] = useState(false);
const [cropBox, setCropBox] = useState(null);
const [isMoving, setIsMoving] = useState(false);
const [resizingEdge, setResizingEdge] = useState(null);
// ... nhiều logic phức tạp
```

**Sau:**
```tsx
// Chỉ cần dùng hook
const {
  boxes,
  activeBox,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  clearBoxes,
} = useBoundingBox({
  canvasRef,
  enabled: true,
  multipleBoxes: false,
});

const cropBox = boxes.length > 0 ? boxes[0] : activeBox;
```

## 🎯 Best Practices

1. **Always normalize boxes before using:**
   ```tsx
   const normalized = normalizeBoundingBox(box);
   ```

2. **Validate boxes before saving:**
   ```tsx
   const validBoxes = boxes.filter(box => isValidBoundingBox(box, 10));
   ```

3. **Use scale correctly:**
   ```tsx
   // Khi vẽ lên canvas có scale
   drawBoundingBox(ctx, box, { scale: calculatedScale });
   
   // Khi convert về pixel gốc
   const actualWidth = displayWidth / scale;
   ```

4. **Clean up on unmount:**
   ```tsx
   useEffect(() => {
     return () => {
       clearBoxes();
     };
   }, []);
   ```

## 🐛 Troubleshooting

### Box không vẽ được
- Kiểm tra `enabled` prop = `true`
- Kiểm tra canvas có ref chưa
- Kiểm tra event handlers được bind đúng

### Cursor không đổi
- Hook tự động quản lý cursor
- Đảm bảo không override `cursor` style ở nơi khác

### Box bị lệch khi resize
- Kiểm tra scale được tính đúng
- Normalize box sau khi resize

### Mouse events không hoạt động ngoài canvas
- Hook đã handle sẵn document-level events
- Đảm bảo không có conflicts với global event listeners

---

**Author:** GFWMS Frontend Team  
**Last Updated:** 2025-01-17
