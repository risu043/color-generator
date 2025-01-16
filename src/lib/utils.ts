import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RGB } from '../type';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// HSV to RGB conversion
export const HSVtoRGB = (h: number, s: number, v: number): RGB => {
  let r = 0,
    g = 0,
    b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

// RGB to Hex conversion
export const RGBtoHex = (r: number, g: number, b: number): string => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
};

// HEXカラーをRGBに変換する
const parseHexToRGB = (hex: string): RGB => {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

// HEXカラーをHSVに変換する関数
export const parseHexToHSV = (
  hex: string
): { h: number; s: number; v: number } => {
  const { r, g, b } = parseHexToRGB(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
  }
  h = (h * 60 + 360) % 360;

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h: h / 360, s, v };
};

// Draw color wheel
export const drawColorWheel = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 5;

  ctx.clearRect(0, 0, width, height);

  for (let y = -radius; y < radius; y++) {
    for (let x = -radius; x < radius; x++) {
      const distance = Math.sqrt(x * x + y * y);
      if (distance <= radius) {
        const hue = (Math.atan2(y, x) + Math.PI) / (Math.PI * 2);
        const saturation = distance / radius;
        const { r, g, b } = HSVtoRGB(hue, saturation, 1);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(centerX + x, centerY + y, 1, 1);
      }
    }
  }
};

// Draw brightness slider
export const drawBrightnessSlider = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const { r, g, b } = parseHexToRGB('#ffffff'); // HEXカラーをRGBに変換する関数
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

  // 明るさ0%から100%までのグラデーション
  gradient.addColorStop(0, 'black'); // 明度0%
  gradient.addColorStop(1, `rgb(${r}, ${g}, ${b})`); // 明度100%

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};
