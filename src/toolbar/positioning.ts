interface Point {
  left: number;
  top: number;
}

interface Size {
  width: number;
  height: number;
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const VIEWPORT_PADDING = 8;

function clampValue(value: number, min: number, max: number): number {
  if (max < min) return min;

  return Math.min(Math.max(value, min), max);
}

export function clampPosition(point: Point, toolbar: Size, viewport: Size): Point {
  return {
    left: clampValue(
      point.left,
      VIEWPORT_PADDING,
      viewport.width - toolbar.width - VIEWPORT_PADDING,
    ),
    top: clampValue(
      point.top,
      VIEWPORT_PADDING,
      viewport.height - toolbar.height - VIEWPORT_PADDING,
    ),
  };
}

export function positionNearRect(rect: Rect, toolbar: Size, viewport: Size): Point {
  const centeredLeft = rect.left + (rect.right - rect.left - toolbar.width) / 2;
  const aboveTop = rect.top - toolbar.height - VIEWPORT_PADDING;
  const belowTop = rect.bottom + VIEWPORT_PADDING;
  const aboveFits = aboveTop >= VIEWPORT_PADDING;
  const belowFits = belowTop + toolbar.height <= viewport.height - VIEWPORT_PADDING;
  const spaceAbove = rect.top - VIEWPORT_PADDING;
  const spaceBelow = viewport.height - rect.bottom - VIEWPORT_PADDING;
  const top = aboveFits
    ? aboveTop
    : belowFits
      ? belowTop
      : spaceAbove >= spaceBelow
        ? aboveTop
        : belowTop;

  return clampPosition({ left: centeredLeft, top }, toolbar, viewport);
}
