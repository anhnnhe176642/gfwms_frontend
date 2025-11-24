import { useState, useCallback, useRef, useEffect } from 'react';

export interface BoundingBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  id?: string;
  label?: string;
}

interface UseBoundingBoxOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  enabled?: boolean;
  edgeThreshold?: number;
  multipleBoxes?: boolean;
  canvasLogicalWidth?: number;
  canvasLogicalHeight?: number;
  zoomLevel?: number;
}

interface UseBoundingBoxReturn {
  boxes: BoundingBox[];
  activeBox: BoundingBox | null;
  isDrawing: boolean;
  isMoving: boolean;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: () => void;
  setActiveBox: (box: BoundingBox | null) => void;
  addBox: (box: BoundingBox) => void;
  updateBox: (id: string, updates: Partial<BoundingBox>) => void;
  removeBox: (id: string) => void;
  clearBoxes: () => void;
  detectEdgeAtPoint: (x: number, y: number, box: BoundingBox) => string | null;
  isPointInsideBox: (x: number, y: number, box: BoundingBox) => boolean;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  deleteActiveBox: () => void;
}

export const useBoundingBox = ({
  canvasRef,
  enabled = true,
  edgeThreshold = 5,
  multipleBoxes = false,
  canvasLogicalWidth = 0,
  canvasLogicalHeight = 0,
  zoomLevel = 1,
}: UseBoundingBoxOptions): UseBoundingBoxReturn => {
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [activeBox, setActiveBox] = useState<BoundingBox | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [resizingEdge, setResizingEdge] = useState<string | null>(null);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  // Undo/Redo history - dùng ref để đơn giản, max 200 states
  // Khởi tạo với state empty để có thể undo về trạng thái ban đầu
  const historyRef = useRef<BoundingBox[][]>([[]]);
  const historyIndexRef = useRef<number>(0);
  const isApplyingHistoryRef = useRef(false);

  /**
   * Helper: Normalize tọa độ mouse theo scale
   * 
   * Canvas.width = image.width * baseScale * zoomLevel  
   * Use offsetX/offsetY - coordinates relative to target element (canvas)
   * Handles scroll, padding, border automatically
   */
  const getScaledCoordinates = useCallback(
    (clientX: number, clientY: number, canvas: HTMLCanvasElement, event?: MouseEvent | React.MouseEvent) => {
      let domX: number;
      let domY: number;
      
      // Prefer offsetX/offsetY if available (handles scroll/padding correctly)
      if (event && 'nativeEvent' in event) {
        // React synthetic event
        const nativeEvent = (event as React.MouseEvent).nativeEvent;
        domX = nativeEvent.offsetX;
        domY = nativeEvent.offsetY;
      } else if (event && 'offsetX' in event) {
        // Native event
        domX = (event as MouseEvent).offsetX;
        domY = (event as MouseEvent).offsetY;
      } else {
        // Fallback to clientX - rect
        const canvasRect = canvas.getBoundingClientRect();
        domX = clientX - canvasRect.left;
        domY = clientY - canvasRect.top;
      }
      
      // Convert from screen coords to canvas logical coords (canvas.width = logical * zoomLevel)
      const x = domX / (zoomLevel || 1);
      const y = domY / (zoomLevel || 1);
      
      // Clamp to logical bounds
      const maxX = canvas.width / (zoomLevel || 1);
      const maxY = canvas.height / (zoomLevel || 1);
      
      return {
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY)),
      };
    },
    [zoomLevel]
  );

  /**
   * Helper: Xử lý logic resize box
   */
  const handleBoxResize = useCallback(
    (box: BoundingBox, edge: string, x: number, y: number): BoundingBox => {
      let updatedBox = { ...box };
      switch (edge) {
        case 'tl':
          updatedBox.startX = x;
          updatedBox.startY = y;
          break;
        case 'tr':
          updatedBox.endX = x;
          updatedBox.startY = y;
          break;
        case 'bl':
          updatedBox.startX = x;
          updatedBox.endY = y;
          break;
        case 'br':
          updatedBox.endX = x;
          updatedBox.endY = y;
          break;
        case 'n':
          updatedBox.startY = y;
          break;
        case 's':
          updatedBox.endY = y;
          break;
        case 'w':
          updatedBox.startX = x;
          break;
        case 'e':
          updatedBox.endX = x;
          break;
      }
      return updatedBox;
    },
    []
  );

  /**
   * Lưu state vào history cho undo/redo - đơn giản, lưu mỗi lần kéo thả
   * Chỉ mark flag, useEffect sẽ tự động lưu khi boxes change
   */
  const saveToHistory = useCallback(() => {
    // Không lưu nếu đang apply undo/redo
    if (isApplyingHistoryRef.current) return;
  }, []);

  /**
   * Phát hiện cạnh hoặc góc tại một điểm - tối ưu O(1) check
   */
  const detectEdgeAtPoint = useCallback(
    (x: number, y: number, box: BoundingBox): string | null => {
      if (!box) return null;

      //  Scale edge threshold theo zoom level
      // Khi zoom lên (zoomLevel > 1), threshold nhỏ hơn để dễ click vào center
      // Khi zoom ra (zoomLevel < 1), threshold lớn hơn để dễ resize
      const scaledThreshold = edgeThreshold / Math.max(zoomLevel, 0.5);

      const x1 = Math.min(box.startX, box.endX);
      const y1 = Math.min(box.startY, box.endY);
      const w = Math.abs(box.endX - box.startX);
      const h = Math.abs(box.endY - box.startY);
      const x2 = x1 + w;
      const y2 = y1 + h;

      // Inline threshold check - tránh tạo array
      // Kiểm tra 4 góc
      if (Math.abs(x - x1) < scaledThreshold && Math.abs(y - y1) < scaledThreshold) return 'tl';
      if (Math.abs(x - x2) < scaledThreshold && Math.abs(y - y1) < scaledThreshold) return 'tr';
      if (Math.abs(x - x1) < scaledThreshold && Math.abs(y - y2) < scaledThreshold) return 'bl';
      if (Math.abs(x - x2) < scaledThreshold && Math.abs(y - y2) < scaledThreshold) return 'br';

      // Kiểm tra 4 cạnh
      if (Math.abs(x - (x1 + w / 2)) < scaledThreshold && Math.abs(y - y1) < scaledThreshold) return 'n';
      if (Math.abs(x - (x1 + w / 2)) < scaledThreshold && Math.abs(y - y2) < scaledThreshold) return 's';
      if (Math.abs(x - x1) < scaledThreshold && Math.abs(y - (y1 + h / 2)) < scaledThreshold) return 'w';
      if (Math.abs(x - x2) < scaledThreshold && Math.abs(y - (y1 + h / 2)) < scaledThreshold) return 'e';

      return null;
    },
    [edgeThreshold, zoomLevel]
  );

  /**
   * Kiểm tra điểm có nằm trong box không
   */
  const isPointInsideBox = useCallback(
    (x: number, y: number, box: BoundingBox): boolean => {
      if (!box) return false;

      const x1 = Math.min(box.startX, box.endX);
      const y1 = Math.min(box.startY, box.endY);
      const x2 = Math.max(box.startX, box.endX);
      const y2 = Math.max(box.startY, box.endY);

      // Kiểm tra đơn giản: điểm có nằm trong hộp không
      return x > x1 && x < x2 && y > y1 && y < y2;
    },
    []
  );

  /**
   * Tìm box tại điểm click - optimized
   * Ưu tiên active box nếu điểm nằm trong active box
   * Nếu không thì duyệt ngược mảng để ưu tiên box vẽ sau (trên cùng)
   */
  const findBoxAtPoint = useCallback(
    (x: number, y: number): BoundingBox | null => {
      // Ưu tiên active box nếu điểm nằm trong active box
      if (activeBox) {
        const edge = detectEdgeAtPoint(x, y, activeBox);
        if (edge || isPointInsideBox(x, y, activeBox)) {
          return activeBox;
        }
      }

      // Duyệt ngược để ưu tiên box vẽ sau (trên cùng)
      for (let i = boxes.length - 1; i >= 0; i--) {
        const box = boxes[i];
        // Bỏ qua active box vì đã check trên
        if (activeBox && box.id === activeBox.id) continue;
        
        // Kiểm tra edge trước (nhỏ hơn) rồi mới kiểm tra inside (lớn hơn)
        if (detectEdgeAtPoint(x, y, box) || isPointInsideBox(x, y, box)) {
          return box;
        }
      }
      return null;
    },
    [boxes, activeBox, isPointInsideBox, detectEdgeAtPoint]
  );

  /**
   * Xử lý mouse down
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !enabled) return;

      const { x, y } = getScaledCoordinates(e.clientX, e.clientY, canvas, e);

      // Tìm box tại vị trí click
      const clickedBox = findBoxAtPoint(x, y);

      if (clickedBox) {
        setActiveBox(clickedBox);

        // Kiểm tra resize
        const edge = detectEdgeAtPoint(x, y, clickedBox);
        if (edge) {
          setResizingEdge(edge);
          setIsDrawing(true);
          return;
        }

        // Kiểm tra move
        if (isPointInsideBox(x, y, clickedBox)) {
          setIsMoving(true);
          setLastMousePos({ x, y });
          return;
        }
      }

      // Vẽ box mới - luôn cho phép nếu click ngoài box hiện tại
      const newBox: BoundingBox = {
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        id: `box-${Date.now()}`,
      };
      setActiveBox(newBox);
      setIsDrawing(true);
    },
    [
      canvasRef,
      enabled,
      boxes,
      multipleBoxes,
      findBoxAtPoint,
      detectEdgeAtPoint,
      isPointInsideBox,
      getScaledCoordinates,
    ]
  );

  /**
   * Xử lý mouse move
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !activeBox) return;

      const { x, y } = getScaledCoordinates(e.clientX, e.clientY, canvas, e);

      if (isMoving) {
        // Di chuyển box
        const deltaX = x - lastMousePos.x;
        const deltaY = y - lastMousePos.y;

        const x1 = Math.min(activeBox.startX, activeBox.endX);
        const y1 = Math.min(activeBox.startY, activeBox.endY);
        const x2 = Math.max(activeBox.startX, activeBox.endX);
        const y2 = Math.max(activeBox.startY, activeBox.endY);
        const width = x2 - x1;
        const height = y2 - y1;

        const newX1 = Math.max(0, Math.min(x1 + deltaX, canvas.width - width));
        const newY1 = Math.max(0, Math.min(y1 + deltaY, canvas.height - height));

        const updatedBox = {
          ...activeBox,
          startX: newX1,
          startY: newY1,
          endX: newX1 + width,
          endY: newY1 + height,
        };

        // Cập nhật cả activeBox state và boxes array để UI được re-render
        setActiveBox(updatedBox);
        setBoxes((prev) => {
          const idx = prev.findIndex((b) => b.id === activeBox.id);
          if (idx >= 0) {
            const newBoxes = [...prev];
            newBoxes[idx] = updatedBox;
            return newBoxes;
          }
          return prev;
        });
        setLastMousePos({ x, y });
      } else if (isDrawing && resizingEdge) {
        // Resize box
        const updatedBox = handleBoxResize(activeBox, resizingEdge, x, y);
        setActiveBox(updatedBox);
        setBoxes((prev) => {
          const idx = prev.findIndex((b) => b.id === activeBox.id);
          if (idx >= 0) {
            const newBoxes = [...prev];
            newBoxes[idx] = updatedBox;
            return newBoxes;
          }
          return prev;
        });
      } else if (isDrawing) {
        // Vẽ box mới
        const updatedBox = {
          ...activeBox,
          endX: x,
          endY: y,
        };

        setActiveBox(updatedBox);
      }
    },
    [
      canvasRef,
      activeBox,
      isMoving,
      isDrawing,
      resizingEdge,
      lastMousePos,
      getScaledCoordinates,
      handleBoxResize,
    ]
  );

  /**
   * Xử lý mouse up
   */
  const handleMouseUp = useCallback(() => {
    if (activeBox && isDrawing) {
      const width = Math.abs(activeBox.endX - activeBox.startX);
      const height = Math.abs(activeBox.endY - activeBox.startY);

      // Min size: 5x5px để tránh tạo box quá nhỏ
      if (width >= 5 && height >= 5) {
        // Thêm hoặc cập nhật box
        let newBoxes: BoundingBox[] = [];
        
        if (multipleBoxes) {
          const existingIndex = boxes.findIndex((b) => b.id === activeBox.id);
          newBoxes = [...boxes];
          if (existingIndex >= 0) {
            newBoxes[existingIndex] = activeBox;
          } else {
            newBoxes.push(activeBox);
          }
        } else {
          // Single box mode: replace
          newBoxes = [activeBox];
        }

        setBoxes(newBoxes);
        saveToHistory();
      }
    }

    setIsDrawing(false);
    setResizingEdge(null);
    setIsMoving(false);
  }, [activeBox, isDrawing, boxes, multipleBoxes, saveToHistory]);

  /**
   * Auto-save history khi hoàn thành kéo/move/resize (isDrawing hoặc isMoving từ true -> false)
   * Không lưu mỗi frame mà chỉ lưu khi hoàn thành action
   */
  const isInteractingRef = useRef(false);

  useEffect(() => {
    const isCurrentlyInteracting = isDrawing || isMoving;
    const wasInteracting = isInteractingRef.current;

    // Nếu vừa kết thúc interact (từ true -> false), lưu history
    if (wasInteracting && !isCurrentlyInteracting && !isApplyingHistoryRef.current) {
      // Xóa các states phía sau historyIndex (khi user đã undo rồi thực hiện action mới)
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push([...boxes]);
      // Giữ tối đa 200 states
      if (historyRef.current.length > 200) {
        historyRef.current.shift();
      }
      historyIndexRef.current += 1;
    }

    isInteractingRef.current = isCurrentlyInteracting;
  }, [isDrawing, isMoving, boxes]);

  /**
   * Cập nhật cursor dựa trên vị trí - throttled
   * Chỉ cho phép resize/move trên active box
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const handleCanvasMouseMove = (e: MouseEvent) => {
      if (boxes.length === 0) {
        canvas.style.cursor = 'crosshair';
        return;
      }

      const { x, y } = getScaledCoordinates(e.clientX, e.clientY, canvas);

      const hoveredBox = findBoxAtPoint(x, y);

      if (!hoveredBox || !activeBox) {
        canvas.style.cursor = 'crosshair';
        return;
      }

      // Chỉ cho phép cursor move/resize nếu hover trên active box
      if (hoveredBox.id !== activeBox.id) {
        canvas.style.cursor = 'crosshair';
        return;
      }

      const edge = detectEdgeAtPoint(x, y, hoveredBox);

      if (!edge) {
        if (isPointInsideBox(x, y, hoveredBox)) {
          canvas.style.cursor = 'move';
        } else {
          canvas.style.cursor = 'crosshair';
        }
        return;
      }

      // Cursor cho resize
      if (edge === 'tl' || edge === 'br') {
        canvas.style.cursor = 'nwse-resize';
      } else if (edge === 'tr' || edge === 'bl') {
        canvas.style.cursor = 'nesw-resize';
      } else if (edge === 'n' || edge === 's') {
        canvas.style.cursor = 'ns-resize';
      } else if (edge === 'w' || edge === 'e') {
        canvas.style.cursor = 'ew-resize';
      }
    };

    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    return () => {
      canvas.removeEventListener('mousemove', handleCanvasMouseMove);
    };
  }, [
    canvasRef,
    enabled,
    boxes,
    activeBox,
    findBoxAtPoint,
    detectEdgeAtPoint,
    isPointInsideBox,
    getScaledCoordinates,
  ]);

  /**
   * Xử lý mouse move/up ngoài canvas
   */
  useEffect(() => {
    if (!enabled || (!isDrawing && !isMoving)) return;

    const canvas = canvasRef.current;
    if (!canvas || !activeBox) return;

    const handleDocumentMouseMove = (e: MouseEvent) => {
      const { x, y } = getScaledCoordinates(e.clientX, e.clientY, canvas);

      if (isMoving) {
        const deltaX = x - lastMousePos.x;
        const deltaY = y - lastMousePos.y;

        const x1 = Math.min(activeBox.startX, activeBox.endX);
        const y1 = Math.min(activeBox.startY, activeBox.endY);
        const x2 = Math.max(activeBox.startX, activeBox.endX);
        const y2 = Math.max(activeBox.startY, activeBox.endY);
        const width = x2 - x1;
        const height = y2 - y1;

        // Tính logical bounds (không phải DOM pixels)
        const logicalWidth = canvasLogicalWidth || canvas.width;
        const logicalHeight = canvasLogicalHeight || canvas.height;

        const newX1 = Math.max(0, Math.min(x1 + deltaX, logicalWidth - width));
        const newY1 = Math.max(0, Math.min(y1 + deltaY, logicalHeight - height));

        const updatedBox = {
          ...activeBox,
          startX: newX1,
          startY: newY1,
          endX: newX1 + width,
          endY: newY1 + height,
        };

        setActiveBox(updatedBox);
        // Cập nhật vào boxes state
        setBoxes((prev) => {
          const idx = prev.findIndex((b) => b.id === activeBox.id);
          if (idx >= 0) {
            const newBoxes = [...prev];
            newBoxes[idx] = updatedBox;
            return newBoxes;
          }
          return prev;
        });
        
        setLastMousePos({ x, y });
      } else if (isDrawing) {
        if (resizingEdge) {
          const updatedBox = handleBoxResize(activeBox, resizingEdge, x, y);
          setActiveBox(updatedBox);
          setBoxes((prev) => {
            const idx = prev.findIndex((b) => b.id === activeBox.id);
            if (idx >= 0) {
              const newBoxes = [...prev];
              newBoxes[idx] = updatedBox;
              return newBoxes;
            }
            return prev;
          });
        } else {
          setActiveBox({
            ...activeBox,
            endX: x,
            endY: y,
          });
        }
      }
    };

    const handleDocumentMouseUp = () => {
      handleMouseUp();
    };

    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [
    enabled,
    isDrawing,
    isMoving,
    activeBox,
    resizingEdge,
    lastMousePos,
    canvasRef,
    handleMouseUp,
    getScaledCoordinates,
    handleBoxResize,
    canvasLogicalWidth,
    canvasLogicalHeight,
  ]);

  /**
   * Thêm box
   */
  const addBox = useCallback((box: BoundingBox) => {
    setBoxes((prev) => [...prev, box]);
  }, []);

  /**
   * Cập nhật box - giữ nguyên O(n) vì cần update array order
   */
  const updateBox = useCallback((id: string, updates: Partial<BoundingBox>) => {
    setBoxes((prev) =>
      prev.map((box) => (box.id === id ? { ...box, ...updates } : box))
    );
  }, []);

  /**
   * Xóa box - tối ưu với boxMap
   */
  const removeBox = useCallback((id: string) => {
    setBoxes((prev) => prev.filter((box) => box.id !== id));
    if (activeBox?.id === id) {
      setActiveBox(null);
    }
  }, [activeBox]);

  /**
   * Xóa tất cả boxes
   */
  const clearBoxes = useCallback(() => {
    setBoxes([]);
    setActiveBox(null);
  }, []);

  /**
   * Undo - quay lại state trước đó
   */
  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      isApplyingHistoryRef.current = true;
      setBoxes([...historyRef.current[historyIndexRef.current]]);
      setActiveBox(null);
      // Reset flag sau khi state update
      setTimeout(() => {
        isApplyingHistoryRef.current = false;
      }, 0);
    }
  }, []);

  /**
   * Redo - tiến tới state tiếp theo
   */
  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      isApplyingHistoryRef.current = true;
      setBoxes([...historyRef.current[historyIndexRef.current]]);
      setActiveBox(null);
      // Reset flag sau khi state update
      setTimeout(() => {
        isApplyingHistoryRef.current = false;
      }, 0);
    }
  }, []);

  /**
   * Xóa active box (dùng cho phím Delete)
   */
  const deleteActiveBox = useCallback(() => {
    if (activeBox && activeBox.id) {
      const newBoxes = boxes.filter((box) => box.id !== activeBox.id);
      setBoxes(newBoxes);
      saveToHistory();
      setActiveBox(null);
    }
  }, [activeBox, boxes, saveToHistory]);

  return {
    boxes,
    activeBox,
    isDrawing,
    isMoving,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    setActiveBox,
    addBox,
    updateBox,
    removeBox,
    clearBoxes,
    detectEdgeAtPoint,
    isPointInsideBox,
    undo,
    redo,
    canUndo: historyIndexRef.current > 0,
    canRedo: historyIndexRef.current < historyRef.current.length - 1,
    deleteActiveBox,
  };
}
