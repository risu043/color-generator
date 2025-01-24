import React, { useEffect } from 'react';
import { drawColorWheel, HSVtoRGB, RGBtoHex } from '../lib/utils';

interface ColorCanvasProps {
  setColor: (color: string) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  ref: React.RefObject<HTMLCanvasElement>;
}

export const ColorWheel: React.FC<ColorCanvasProps> = ({
  setColor,
  isDragging,
  setIsDragging,
  ref,
}) => {
  //   const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      drawColorWheel(ref.current);
    }
  }, []);

  const handleCanvasInteraction = (
    e: React.MouseEvent<HTMLCanvasElement>
  ): void => {
    if (!ref.current) return;

    if (!isDragging && e.type === 'mousemove') return;

    const canvas = ref.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 5;

    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= radius) {
      const hue = (Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2);
      const saturation = Math.min(distance / radius, 1);
      const { r, g, b } = HSVtoRGB(hue, saturation, 1);
      const newColor = RGBtoHex(r, g, b);
      setColor(newColor);
    }
  };

  return (
    <canvas
      ref={ref}
      width={200}
      height={200}
      className="cursor-pointer mx-auto"
      onMouseDown={(e) => {
        setIsDragging(true);
        handleCanvasInteraction(e);
      }}
      onMouseMove={handleCanvasInteraction}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    />
  );
};
