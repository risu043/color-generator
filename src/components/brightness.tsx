import React, { useEffect } from 'react';
import {
  drawBrightnessSlider,
  HSVtoRGB,
  parseHexToHSV,
  RGBtoHex,
} from '../lib/utils';

interface BrightnessCanvasProps {
  currentColor: string;
  setColor: (color: string) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  ref: React.RefObject<HTMLCanvasElement | null>;
}

export const Brightness: React.FC<BrightnessCanvasProps> = ({
  currentColor,
  setColor,
  isDragging,
  setIsDragging,
  ref,
}) => {
  useEffect(() => {
    if (ref && ref.current) {
      drawBrightnessSlider(ref.current);
    }
  }, [ref]);

  const handleCanvasInteraction = (
    e: React.MouseEvent<HTMLCanvasElement>
  ): void => {
    if (!ref || !ref.current) return;

    if (!isDragging && e.type === 'mousemove') return;

    const canvas = ref.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // const currentColor = canvas === ref.current;
    const { h, s } = parseHexToHSV(currentColor); // 現在の色の色相と彩度を取得
    const v = Math.min(Math.max(x / canvas.width, 0), 1); // 明度（v）の計算

    const { r, g, b } = HSVtoRGB(h, s, v); // 色相と彩度を維持し、明度のみ変更
    const color = RGBtoHex(r, g, b);

    setColor(color);
  };

  return (
    <canvas
      ref={ref}
      width={200}
      height={30}
      className="cursor-pointer mx-auto"
      onMouseDown={(e) => {
        setIsDragging(true);
        if (ref.current) {
          handleCanvasInteraction(e);
        }
      }}
      onMouseMove={(e) => {
        if (ref.current) {
          handleCanvasInteraction(e);
        }
      }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    />
  );
};
