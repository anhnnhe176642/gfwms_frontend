import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

export interface BoundingBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  id?: string;
  label?: string;
}

// Patch op types used for history
export type PatchOp =
  | { type: 'add'; box: BoundingBox; index: number }
  | { type: 'remove'; box: BoundingBox; index: number }
  | { type: 'update'; id: string; prev: BoundingBox; next: BoundingBox }
  | { type: 'replace_all'; prev: BoundingBox[]; next: BoundingBox[] };

export type UndoRedoResult = {
  op: PatchOp;
  direction: 'undo' | 'redo';
};

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
  undo: () => UndoRedoResult | null;
  redo: () => UndoRedoResult | null;
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
  
  // Undo/Redo: delta-based history (patches) to save memory
  // Patch op types below capture only changes per operation
  type PatchOp =
    | { type: 'add'; box: BoundingBox; index: number }
    | { type: 'remove'; box: BoundingBox; index: number }
    | { type: 'update'; id: string; prev: BoundingBox; next: BoundingBox }
    | { type: 'replace_all'; prev: BoundingBox[]; next: BoundingBox[] };

  const HISTORY_LIMIT = 500;
  const historyRef = useRef<PatchOp[]>([]);
  // historyIndex points to last applied op: -1 means nothing applied
  const historyIndexRef = useRef<number>(-1);
  const isApplyingHistoryRef = useRef(false);
  const [historyVersion, setHistoryVersion] = useState(0); // reactive flag for UI

  // Track operation start state for mouse interactions (move/resize)
  const operationStartBoxRef = useRef<BoundingBox | null>(null);

  // Undo/Redo result returned to caller

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

  const bumpHistoryVersion = useCallback(() => setHistoryVersion(v => v + 1), []);

  /**
   * pushOperation: add a patch operation into history (delta-based)
   */
  const pushOperation = useCallback((op: PatchOp) => {
    if (isApplyingHistoryRef.current) return;
    // remove redo history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    // avoid duplicate consecutive ops
    const last = historyRef.current[historyRef.current.length - 1];
    try {
      if (last && JSON.stringify(last) === JSON.stringify(op)) return;
    } catch (e) {
      // fallback: if stringify fails, proceed
    }
    historyRef.current.push(op);
    if (historyRef.current.length > HISTORY_LIMIT) {
      historyRef.current.shift();
      // adjust index when oldest removed
      historyIndexRef.current = Math.max(-1, historyIndexRef.current - 1);
    }
    historyIndexRef.current = historyRef.current.length - 1;
    bumpHistoryVersion();
  }, [bumpHistoryVersion]);

  const applyOperation = useCallback((op: PatchOp, forward: boolean) => {
    // Applies operation forward (true) or undo (false). Always uses setBoxes
    isApplyingHistoryRef.current = true;
    setBoxes((prev) => {
      switch (op.type) {
        case 'add': {
          if (forward) {
            const idx = Math.min(Math.max(0, op.index), prev.length);
            return [...prev.slice(0, idx), op.box, ...prev.slice(idx)];
          }
          return prev.filter((b) => b.id !== op.box.id);
        }
        case 'remove': {
          if (forward) {
            return prev.filter((b) => b.id !== op.box.id);
          }
          const idx = Math.min(Math.max(0, op.index), prev.length);
          return [...prev.slice(0, idx), op.box, ...prev.slice(idx)];
        }
        case 'update': {
          const target = forward ? op.next : op.prev;
          return prev.map((b) => (b.id === op.id ? target : b));
        }
        case 'replace_all': {
          return forward ? op.next : op.prev;
        }
      }
    });
    // microtask to unflag after state applied
    setTimeout(() => {
      isApplyingHistoryRef.current = false;
      bumpHistoryVersion();
    }, 0);
  }, [bumpHistoryVersion]);

  // NOTE: saveToHistory was removed in favor of granular patch operations

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
          // record starting state for update op
          operationStartBoxRef.current = { ...clickedBox };
          setIsDrawing(true);
          return;
        }

        // Kiểm tra move
        if (isPointInsideBox(x, y, clickedBox)) {
          // record starting state for move op
          operationStartBoxRef.current = { ...clickedBox };
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
            // update existing box - update op handled by interaction effect
            newBoxes[existingIndex] = activeBox;
          } else {
            // new box: append
            newBoxes.push(activeBox);
            // create add op (index = existing length)
            pushOperation({ type: 'add', box: { ...activeBox }, index: boxes.length });
          }
        } else {
          // Single box mode: replace
          newBoxes = [activeBox];
          pushOperation({ type: 'replace_all', prev: [...boxes], next: [...newBoxes] });
        }

        setBoxes(newBoxes);
      }
    }

    setIsDrawing(false);
    setResizingEdge(null);
    setIsMoving(false);
  }, [activeBox, isDrawing, boxes, multipleBoxes, pushOperation]);

  /**
   * Auto-save history khi hoàn thành kéo/move/resize (isDrawing hoặc isMoving từ true -> false)
   * Không lưu mỗi frame mà chỉ lưu khi hoàn thành action
   */
  const isInteractingRef = useRef(false);

  useEffect(() => {
    const isCurrentlyInteracting = isDrawing || isMoving;
    const wasInteracting = isInteractingRef.current;

    // Interaction start: capture initial box state (only for move/resize)
    if (!wasInteracting && isCurrentlyInteracting) {
      operationStartBoxRef.current = activeBox ? { ...activeBox } : null;
    }

    // Interaction end: create update op if box changed
    if (wasInteracting && !isCurrentlyInteracting && !isApplyingHistoryRef.current) {
      const start = operationStartBoxRef.current;
      if (start) {
        const current = boxes.find((b) => b.id === start.id);
        if (current && JSON.stringify(start) !== JSON.stringify(current)) {
          pushOperation({ type: 'update', id: start.id!, prev: start, next: { ...current } });
        }
      }
      operationStartBoxRef.current = null;
    }

    isInteractingRef.current = isCurrentlyInteracting;
  }, [isDrawing, isMoving, activeBox, boxes, pushOperation]);

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
    if (isApplyingHistoryRef.current) {
      // If history is being applied, just set without pushing
      setBoxes((prev) => [...prev, box]);
      return;
    }
    setBoxes((prev) => {
      const idx = prev.length;
      const next = [...prev, box];
      pushOperation({ type: 'add', box, index: idx });
      return next;
    });
  }, [pushOperation]);

  /**
   * Cập nhật box - giữ nguyên O(n) vì cần update array order
   */
  const updateBox = useCallback((id: string, updates: Partial<BoundingBox>) => {
    setBoxes((prev) => {
      const prevBox = prev.find((b) => b.id === id);
      if (!prevBox) return prev;
      const nextBox = { ...prevBox, ...updates };
      if (JSON.stringify(prevBox) !== JSON.stringify(nextBox)) {
        pushOperation({ type: 'update', id, prev: { ...prevBox }, next: { ...nextBox } });
      }
      return prev.map((box) => (box.id === id ? nextBox : box));
    });
  }, [pushOperation]);

  /**
   * Xóa box - tối ưu với boxMap
   */
  const removeBox = useCallback((id: string) => {
    if (isApplyingHistoryRef.current) {
      setBoxes((prev) => prev.filter((box) => box.id !== id));
      if (activeBox?.id === id) setActiveBox(null);
      return;
    }
    setBoxes((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      const prevBox = idx >= 0 ? prev[idx] : undefined;
      const next = prev.filter((box) => box.id !== id);
      if (prevBox) {
        pushOperation({ type: 'remove', box: { ...prevBox }, index: idx });
      }
      return next;
    });
    if (activeBox?.id === id) {
      setActiveBox(null);
    }
  }, [activeBox, pushOperation]);

  /**
   * Xóa tất cả boxes
   */
  const clearBoxes = useCallback(() => {
    if (isApplyingHistoryRef.current) {
      setBoxes([]);
      setActiveBox(null);
      return;
    }
    setBoxes((prev) => {
      const prevBoxes = [...prev];
      const next: BoundingBox[] = [];
      if (prevBoxes.length > 0) {
        pushOperation({ type: 'replace_all', prev: prevBoxes, next });
      }
      return next;
    });
    setActiveBox(null);
  }, [pushOperation]);

  /**
   * Undo - quay lại state trước đó
   */
  const undo = useCallback((): UndoRedoResult | null => {
    const idx = historyIndexRef.current;
    if (idx >= 0) {
      const op = historyRef.current[idx];
      applyOperation(op, false); // apply inverse
      historyIndexRef.current = idx - 1; // set index after applying
      setActiveBox(null);
      return { op, direction: 'undo' };
    }
    return null;
  }, [applyOperation]);

  /**
   * Redo - tiến tới state tiếp theo
   */
  const redo = useCallback((): UndoRedoResult | null => {
    const nextIndex = historyIndexRef.current + 1;
    if (nextIndex < historyRef.current.length) {
      const op = historyRef.current[nextIndex];
      applyOperation(op, true);
      historyIndexRef.current = nextIndex; // set index after applying
      setActiveBox(null);
      return { op, direction: 'redo' };
    }
    return null;
  }, [applyOperation]);

  /**
   * Xóa active box (dùng cho phím Delete)
   */
  const deleteActiveBox = useCallback(() => {
    if (activeBox && activeBox.id) {
      removeBox(activeBox.id);
      setActiveBox(null);
    }
  }, [activeBox, removeBox]);

  const canUndo = useMemo(() => historyIndexRef.current >= 0, [historyVersion]);
  const canRedo = useMemo(() => historyIndexRef.current < historyRef.current.length - 1, [historyVersion]);

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
    canUndo,
    canRedo,
    deleteActiveBox,
  };
}
