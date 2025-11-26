'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BoundingBox } from '@/hooks/useBoundingBox';

interface ReviewPanelProps {
  isPanelFloating: boolean;
  setIsPanelFloating: React.Dispatch<React.SetStateAction<boolean>>;
  autoLabelResults: any[];
  autoReviewIndex: number;
  activeBox: BoundingBox | null;
  selectedClass: string;
  classes: string[];
  boxes: BoundingBox[];
  setActiveBox: (b: BoundingBox | null) => void;
  updateBox: (id: string, patch: Partial<BoundingBox>) => void;
  prevAutoLabel: () => void;
  skipCurrentAutoLabel: () => void;
  confirmCurrentAutoLabel: () => void;
  getColorForClass: (name: string) => string;
  userSelectedBoxRef: React.RefObject<boolean>;
  onSizeChange?: (height: number) => void;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  isPanelFloating,
  setIsPanelFloating,
  autoLabelResults,
  autoReviewIndex,
  activeBox,
  selectedClass,
  classes,
  boxes,
  setActiveBox,
  updateBox,
  prevAutoLabel,
  skipCurrentAutoLabel,
  confirmCurrentAutoLabel,
  getColorForClass,
  userSelectedBoxRef,
  onSizeChange,
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const [isPanelDragging, setIsPanelDragging] = useState(false);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const capturedPointerIdRef = useRef<number | null>(null);
  const [panelPosition, setPanelPosition] = useState<{ x: number; y: number }>({ x: 0, y: 120 });

  // load saved position on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('yoloReviewPanelPos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPanelPosition({ x: parsed.x, y: parsed.y });
        }
      } else if (typeof window !== 'undefined') {
        const defaultX = window.innerWidth - 340;
        const defaultY = 120;
        setPanelPosition({ x: Math.max(defaultX, 16), y: defaultY });
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Notify parent of panel height changes so a layout placeholder can be kept in sync
  useEffect(() => {
    if (!panelRef.current || !onSizeChange) return;
    const el = panelRef.current;
    // report initial size
    try { onSizeChange(el.getBoundingClientRect().height); } catch (e) {}
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) {
        try { onSizeChange(rect.height); } catch (e) {}
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [panelRef, onSizeChange]);

  const clampAndSet = useCallback((newPos: { x: number; y: number }) => {
    if (!panelRef.current) {
      setPanelPosition(newPos);
      return;
    }
    const panelRect = panelRef.current.getBoundingClientRect();
    const pw = panelRect.width || 320;
    const ph = panelRect.height || 180;
    const minX = 8;
    const minY = 8;
    const maxX = Math.max(window.innerWidth - pw - 8, minX);
    const maxY = Math.max(window.innerHeight - ph - 8, minY);
    const x = Math.min(Math.max(newPos.x, minX), maxX);
    const y = Math.min(Math.max(newPos.y, minY), maxY);
    setPanelPosition({ x, y });
    try { localStorage.setItem('yoloReviewPanelPos', JSON.stringify({ x, y })); } catch (e) {}
  }, []);

  const onPanelPointerDown = useCallback((e: React.PointerEvent) => {
    if (!isPanelFloating) return;
    const target = e.target as HTMLElement;
    if (!panelRef.current) return;
    // Allow dragging from the main header area or the handle, but ignore clicks on interactive elements
    const clickedOnHandle = Boolean(target.closest('#review-panel-drag-handle'));
    const clickedOnHeader = Boolean(target.closest('.review-panel-header'));
    // ignore clicks on interactive form controls (buttons, inputs, selects, anchors)
    const interactive = Boolean(target.closest('button, input, textarea, select, a, [role="button"]'));
    if (!clickedOnHandle && (!clickedOnHeader || interactive)) return;

    draggingRef.current = true;
    setIsPanelDragging(true);
    panelRef.current.setPointerCapture(e.pointerId);
    capturedPointerIdRef.current = e.pointerId;
    const rect = panelRef.current.getBoundingClientRect();
    dragOffsetRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    e.preventDefault();
  }, [isPanelFloating]);

  useEffect(() => {
    const onPointerMove = (ev: PointerEvent) => {
      if (!draggingRef.current) return;
      const x = ev.clientX - dragOffsetRef.current.dx;
      const y = ev.clientY - dragOffsetRef.current.dy;
      clampAndSet({ x, y });
    };

    const onPointerUp = (ev: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsPanelDragging(false);
      if (panelRef.current) {
        try { panelRef.current.releasePointerCapture(ev.pointerId); } catch (err) {}
      }
      capturedPointerIdRef.current = null;
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };
  }, [clampAndSet]);

  useEffect(() => {
    if (!isPanelFloating && draggingRef.current) {
      draggingRef.current = false;
      setIsPanelDragging(false);
      try {
        if (capturedPointerIdRef.current != null) {
          panelRef.current?.releasePointerCapture(capturedPointerIdRef.current);
          capturedPointerIdRef.current = null;
        }
      } catch (err) {}
    }
  }, [isPanelFloating]);

  useEffect(() => {
    const handleResize = () => clampAndSet(panelPosition);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [panelPosition, clampAndSet]);

  // Persist floating state is handled by parent; keep it here just in case

  return (
    <div
      ref={panelRef}
      className={`p-3 rounded-md bg-muted border mb-2 shadow-lg ${isPanelDragging ? 'cursor-grabbing' : ''}`}
      style={isPanelFloating
        ? ({ position: 'fixed', zIndex: 80, width: 320, left: panelPosition.x, top: panelPosition.y } as React.CSSProperties)
        : undefined
      }
      data-floating
    >
      <div className={`review-panel-header flex items-center justify-between py-2 ${isPanelFloating ? 'cursor-grab' : ''}`} onPointerDown={onPanelPointerDown}>
        <div>
          <div className="text-sm font-semibold">Duyệt kết quả</div>
          <div className="text-xs text-muted-foreground">{`Kết quả: ${autoLabelResults.length} — Đang xem ${autoReviewIndex + 1}/${autoLabelResults.length}`}</div>
        </div>
        <div className="ml-2">
          <Button size="sm" variant={isPanelFloating ? 'default' : 'outline'} onClick={() => setIsPanelFloating((v) => !v)}>
            {isPanelFloating ? 'Ghim' : 'Nổi'}
          </Button>
        </div>
      </div>
      <div
        className={`mt-2 h-4 flex items-center gap-1 text-xs text-muted-foreground cursor-grab ${!isPanelFloating ? 'hidden' : ''}`}
        id="review-panel-drag-handle"
        title="Kéo để thay đổi vị trí"
        onPointerDown={onPanelPointerDown}
        aria-hidden={!isPanelFloating}
      >
        <div className="w-3 h-3 rounded bg-border" />
        <div className="flex-1">Kéo để di chuyển</div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={prevAutoLabel} disabled={autoReviewIndex === 0}>Trước</Button>
        <Button size="sm" variant="outline" onClick={skipCurrentAutoLabel}>Sau</Button>
        <Button size="sm" variant="default" onClick={confirmCurrentAutoLabel}>Duyệt & Tiếp</Button>
      </div>
      <div className="mt-3">
        <Label className="text-sm">Class cho object</Label>
        <Select value={activeBox?.label || selectedClass} onValueChange={(val) => {
          userSelectedBoxRef.current = true;
          if (activeBox) {
            setActiveBox({ ...activeBox, label: val });
            if (activeBox.id && boxes.some((b) => b.id === activeBox.id)) {
              updateBox(activeBox.id, { label: val });
            }
          }
        }}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Chọn class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls} value={cls}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: getColorForClass(cls) }} />
                  {cls}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReviewPanel;
