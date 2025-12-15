/**
 * Circle Color Extractor Utility
 * Extract dominant colors from YOLO detection boxes and match with color palette
 * Browser-compatible version using Canvas API
 */

import chroma from 'chroma-js';

export interface ColorBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedColor {
  r: number;
  g: number;
  b: number;
}

export interface ExtractionResult {
  box: ColorBox;
  hasLabel: boolean;
  color: ExtractedColor | null;
}

export interface PaletteColor {
  id?: string;
  name?: string;
  color: string;
  hexCode?: string;
}

export interface MatchResult extends PaletteColor {
  deltaE: number;
}

/**
 * Extract main circle color from detection boxes in an image using Canvas API
 * Browser-compatible replacement for sharp/sharp-based extraction
 *
 * @param imageUrl - Image URL or data URL
 * @param boxes - Array of detection boxes to extract colors from
 * @param options - Configuration options
 * @returns Array of extraction results with matched colors
 */
export async function extractCircleColorsFromImage(
  imageUrl: string,
  boxes: ColorBox[],
  options: {
    resize?: number;
    minLabelSatDiff?: number;
    minLightness?: number;
  } = {}
): Promise<ExtractionResult[]> {
  const {
    resize = 80,
    minLabelSatDiff = 0.15,
    minLightness = 0.6,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const results: ExtractionResult[] = [];

        for (const box of boxes) {
          const result = extractColorFromBox(
            img,
            box,
            resize,
            minLabelSatDiff,
            minLightness
          );
          results.push(result);
        }

        resolve(results);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}

/**
 * Extract color from a single box using Canvas
 * Uses Hue histogram + median saturation/lightness for better dominant color detection
 */
function extractColorFromBox(
  img: HTMLImageElement,
  box: ColorBox,
  resize: number,
  minLabelSatDiff: number,
  minLightness: number
): ExtractionResult {
  // Create temporary canvas for extraction
  const canvas = document.createElement('canvas');
  canvas.width = resize;
  canvas.height = resize;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { box, hasLabel: false, color: null };
  }

  // Draw cropped and resized image
  ctx.drawImage(
    img,
    box.x,
    box.y,
    box.width,
    box.height,
    0,
    0,
    resize,
    resize
  );

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, resize, resize);
  const data = imageData.data;

  const sats: number[] = [];
  const pixels: Array<{ r: number; g: number; b: number; s: number; l: number; h?: number }> = [];

  // Convert pixels to saturation and store
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Skip transparent pixels
    if (data[i + 3] < 128) continue;

    const [h, s, l] = chroma.rgb(r, g, b).hsl();

    sats.push(s);
    pixels.push({ r, g, b, s, l, h });
  }

  if (pixels.length === 0) {
    return { box, hasLabel: false, color: null };
  }

  // Detect label by saturation clustering (k-means style)
  let c1 = 0.1;
  let c2 = 0.7;

  for (let k = 0; k < 8; k++) {
    const g1: number[] = [];
    const g2: number[] = [];

    for (const s of sats) {
      if (Math.abs(s - c1) < Math.abs(s - c2)) {
        g1.push(s);
      } else {
        g2.push(s);
      }
    }

    if (g1.length > 0) {
      c1 = g1.reduce((a, b) => a + b, 0) / g1.length;
    }
    if (g2.length > 0) {
      c2 = g2.reduce((a, b) => a + b, 0) / g2.length;
    }
  }

  const hasLabel = Math.abs(c1 - c2) > minLabelSatDiff;
  const sThreshold = (c1 + c2) / 2;

  // --- Extract dominant color using Hue histogram + median S/L ---
  const H_BINS = 36;
  const hist = Array(H_BINS).fill(0);
  const valid: Array<{ r: number; g: number; b: number; s: number; l: number; h: number }> = [];

  for (const p of pixels) {
    // Skip low-saturation bright pixels if label detected
    if (hasLabel && p.s < sThreshold && p.l > minLightness) {
      continue;
    }
    // Skip very low saturation pixels (grayscale-ish)
    if (p.s < 0.15) {
      continue;
    }

    const h = p.h;
    if (typeof h === 'undefined' || isNaN(h)) continue;

    const idx = Math.floor((h / 360) * H_BINS);
    hist[idx]++;
    valid.push({ ...p, h });
  }

  if (valid.length === 0) {
    return { box, hasLabel, color: null };
  }

  // Find dominant hue from histogram
  const maxIdx = hist.indexOf(Math.max(...hist));
  const dominantHue = (maxIdx + 0.5) * (360 / H_BINS);

  // Calculate median saturation and lightness
  const median = (arr: number[]): number => {
    const sorted = arr.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  };

  const sMed = median(valid.map(p => p.s));
  const lMed = median(valid.map(p => p.l));

  // Reconstruct RGB from dominant HSL
  const [R, G, B] = chroma.hsl(dominantHue, sMed, lMed).rgb();

  return {
    box,
    hasLabel,
    color: {
      r: Math.round(R),
      g: Math.round(G),
      b: Math.round(B),
    },
  };
}

/**
 * Match RGB color to closest palette color using Delta-E (CIEDE2000)
 *
 * @param rgb - RGB color to match
 * @param palette - Array of palette colors with hex codes
 * @returns Best matching palette color with Delta-E distance
 */
export function matchPalette(
  rgb: ExtractedColor | null,
  palette: PaletteColor[]
): MatchResult | null {
  if (!rgb || palette.length === 0) {
    return null;
  }

  let best: MatchResult | null = null;
  let min = Infinity;

  const sourceChroma = chroma.rgb(rgb.r, rgb.g, rgb.b);

  for (const p of palette) {
    // Try hexCode first, then color property
    const colorStr = p.hexCode || p.color;
    try {
      const targetChroma = chroma(colorStr);
      const d = chroma.deltaE(sourceChroma, targetChroma);

      if (d < min) {
        min = d;
        best = {
          ...p,
          deltaE: d,
        };
      }
    } catch (e) {
      // Skip invalid colors
      continue;
    }
  }

  return best;
}

/**
 * Batch match multiple extracted colors to palette
 * Always returns ALL extracted colors (no filtering by confidence)
 *
 * @param extractedColors - Results from extractCircleColorsFromImage
 * @param palette - Color palette to match against
 * @returns Array of matched colors with statistics (all items, confidence may be low)
 */
export function matchMultipleColors(
  extractedColors: ExtractionResult[],
  palette: PaletteColor[]
): Array<{
  extraction: ExtractionResult;
  match: MatchResult | null;
  confidence: number; // 0-1, higher is better match
}> {
  const maxDeltaE = 30; // Reasonable threshold for "good" match

  return extractedColors.map((extraction) => {
    const match = matchPalette(extraction.color, palette);
    const confidence = match ? Math.max(0, 1 - match.deltaE / maxDeltaE) : 0;

    return {
      extraction,
      match,
      confidence,
    };
  });
  // NO filtering - return ALL items, even low confidence matches
}

/**
 * Count detected items by color and include all palette colors (even with 0 count)
 *
 * @param matches - Results from matchMultipleColors
 * @param palette - Full color palette to include in results
 * @param minConfidence - Minimum confidence to count an item (default 0 = count all)
 * @returns Object with color ID as key, includes all palette colors
 */
export function countByColor(
  matches: Array<{
    extraction: ExtractionResult;
    match: MatchResult | null;
    confidence: number;
  }>,
  palette: PaletteColor[],
  minConfidence: number = 0
): Record<string, { count: number; name: string; hexCode?: string; confidence: number }> {
  const result: Record<
    string,
    { count: number; name: string; hexCode?: string; confidence: number }
  > = {};

  // Initialize all palette colors with 0 count
  for (const color of palette) {
    const colorId = color.id || color.name || color.color;
    if (colorId) {
      result[colorId] = {
        count: 0,
        name: color.name || colorId,
        hexCode: color.hexCode || color.color,
        confidence: 0,
      };
    }
  }

  // Count matches (only items meeting minConfidence threshold)
  for (const { match, confidence } of matches) {
    if (!match) continue;
    if (confidence < minConfidence) continue;

    const colorId = match.id || match.name || match.color;
    if (!colorId) continue;

    // Initialize if not already in result
    if (!result[colorId]) {
      result[colorId] = {
        count: 0,
        name: match.name || colorId,
        hexCode: match.hexCode || match.color,
        confidence: confidence,
      };
    }

    result[colorId].count++;
    // Update confidence to average
    result[colorId].confidence =
      (result[colorId].confidence * (result[colorId].count - 1) + confidence) /
      result[colorId].count;
  }

  return result;
}
