import { useState, useCallback } from 'react';

export interface PolygonPoint {
  x: number;
  y: number;
}

/**
 * Hook to manage polygon drawing state and logic
 * - Tracks polygon points as user draws
 * - Checks if a point is inside the polygon (using ray casting algorithm)
 * - Supports editing points and adding points on edges
 */
export const usePolygonDrawing = () => {
  const [polygonPoints, setPolygonPoints] = useState<PolygonPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempLine, setTempLine] = useState<PolygonPoint | null>(null);
  const [draggingPointIndex, setDraggingPointIndex] = useState<number | null>(null);

  /**
   * Add a new point to the polygon
   */
  const addPoint = useCallback((point: PolygonPoint) => {
    setPolygonPoints((prev) => [...prev, point]);
  }, []);

  /**
   * Insert a point at a specific index (for adding points on edges)
   */
  const insertPoint = useCallback((point: PolygonPoint, index: number) => {
    setPolygonPoints((prev) => {
      const newPoints = [...prev];
      newPoints.splice(index, 0, point);
      return newPoints;
    });
  }, []);

  /**
   * Update a point at a specific index (for dragging)
   */
  const updatePoint = useCallback((index: number, point: PolygonPoint) => {
    setPolygonPoints((prev) => {
      const newPoints = [...prev];
      newPoints[index] = point;
      return newPoints;
    });
  }, []);

  /**
   * Delete a point at a specific index
   */
  const deletePoint = useCallback((index: number) => {
    setPolygonPoints((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Finish the polygon by connecting the last point to the first point
   */
  const finishPolygon = useCallback(() => {
    if (polygonPoints.length >= 3) {
      // Polygon is valid (need at least 3 points)
      setIsDrawing(false);
      setTempLine(null);
    }
  }, [polygonPoints.length]);

  /**
   * Clear the current polygon
   */
  const clearPolygon = useCallback(() => {
    setPolygonPoints([]);
    setIsDrawing(false);
    setTempLine(null);
    setDraggingPointIndex(null);
  }, []);

  /**
   * Update the temporary line being drawn (for preview)
   */
  const setCurrentLine = useCallback((point: PolygonPoint | null) => {
    setTempLine(point);
  }, []);

  /**
   * Check if a point is inside the polygon using ray casting algorithm
   * Reference: https://en.wikipedia.org/wiki/Point_in_polygon
   */
  const isPointInPolygon = useCallback(
    (point: PolygonPoint): boolean => {
      if (polygonPoints.length < 3) return false;

      let inside = false;
      const x = point.x;
      const y = point.y;

      // Use ray casting algorithm
      for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
        const xi = polygonPoints[i].x;
        const yi = polygonPoints[i].y;
        const xj = polygonPoints[j].x;
        const yj = polygonPoints[j].y;

        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }

      return inside;
    },
    [polygonPoints]
  );

  /**
   * Find the closest point on a polygon edge to a given point
   * Returns { edgeIndex, closestPoint, distance } or null if not found
   */
  const findClosestPointOnEdge = useCallback(
    (point: PolygonPoint, maxDistance: number = 20): { edgeIndex: number; closestPoint: PolygonPoint; distance: number } | null => {
      if (polygonPoints.length < 2) return null;

      let minDistance = maxDistance;
      let result = null;

      for (let i = 0; i < polygonPoints.length; i++) {
        const p1 = polygonPoints[i];
        const p2 = polygonPoints[(i + 1) % polygonPoints.length];

        // Calculate closest point on line segment
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const lengthSq = dx * dx + dy * dy;

        if (lengthSq === 0) continue;

        let t = ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / lengthSq;
        t = Math.max(0, Math.min(1, t));

        const closestPoint = {
          x: p1.x + t * dx,
          y: p1.y + t * dy,
        };

        const distance = Math.hypot(point.x - closestPoint.x, point.y - closestPoint.y);

        if (distance < minDistance) {
          minDistance = distance;
          result = { edgeIndex: i, closestPoint, distance };
        }
      }

      return result;
    },
    [polygonPoints]
  );

  return {
    polygonPoints,
    isDrawing,
    tempLine,
    draggingPointIndex,
    addPoint,
    insertPoint,
    updatePoint,
    deletePoint,
    finishPolygon,
    clearPolygon,
    setCurrentLine,
    setIsDrawing,
    setDraggingPointIndex,
    isPointInPolygon,
    findClosestPointOnEdge,
  };
};
