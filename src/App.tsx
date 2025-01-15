import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RGB, CanvasType } from './type';

const GradientGenerator = () => {
  const [startColor, setStartColor] = useState<string>('#ff0000');
  const [endColor, setEndColor] = useState<string>('#0000ff');
  const [angle, setAngle] = useState<number>(90);
  const [activeCanvas, setActiveCanvas] = useState<CanvasType>(null);
  const [isDragging, setIsDragging] = useState(false);

  const startColorWheelRef = useRef<HTMLCanvasElement | null>(null);
  const endColorWheelRef = useRef<HTMLCanvasElement | null>(null);
  const brightnessRef = useRef<HTMLCanvasElement | null>(null);

  // HSV to RGB conversion
  const HSVtoRGB = (h: number, s: number, v: number): RGB => {
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
  const RGBtoHex = (r: number, g: number, b: number): string => {
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

  // Draw color wheel
  const drawColorWheel = (canvas: HTMLCanvasElement): void => {
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
  const drawBrightnessSlider = (
    canvas: HTMLCanvasElement,
    baseColor: string
  ) => {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Handle canvas click/drag
  const handleCanvasInteraction = (
    e: React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ): void => {
    if (!isDragging && e.type === 'mousemove') return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
      canvas === startColorWheelRef.current ||
      canvas === endColorWheelRef.current
    ) {
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
        const color = RGBtoHex(r, g, b);

        if (activeCanvas === 'start') {
          setStartColor(color);
        } else if (activeCanvas === 'end') {
          // 明示的に条件を指定
          setEndColor(color);
        }
      }
    }
  };

  const leave = () => {
    setIsDragging(false);
    setActiveCanvas(null);
  };

  useEffect(() => {
    if (startColorWheelRef.current) {
      drawColorWheel(startColorWheelRef.current);
    }
    if (endColorWheelRef.current) {
      drawColorWheel(endColorWheelRef.current);
    }
  }, [drawColorWheel]);

  const gradientString = `linear-gradient(${angle}deg, ${startColor}, ${endColor})`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`background: ${gradientString};`);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>グラデーションジェネレーター</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* プレビュー */}
        <div
          className="w-full h-60 rounded-lg"
          style={{ background: gradientString }}
        />

        {/* カラーピッカー */}
        <div className="flex gap-8 justify-center">
          <div className="space-y-2">
            <div className="text-center">開始色: {startColor}</div>
            <canvas
              ref={startColorWheelRef}
              width={200}
              height={200}
              className="cursor-pointer"
              onMouseDown={(e) => {
                setIsDragging(true);
                setActiveCanvas('start');
                if (startColorWheelRef.current) {
                  handleCanvasInteraction(e, startColorWheelRef.current);
                }
              }}
              onMouseMove={(e) => {
                if (startColorWheelRef.current) {
                  handleCanvasInteraction(e, startColorWheelRef.current);
                }
              }}
              onMouseUp={() => leave()}
              onMouseLeave={() => leave()}
            />
          </div>

          <div className="space-y-2">
            <div className="text-center">終了色: {endColor}</div>
            <canvas
              ref={endColorWheelRef}
              width={200}
              height={200}
              className="cursor-pointer"
              onMouseDown={(e) => {
                setIsDragging(true);
                setActiveCanvas('end');
                if (endColorWheelRef.current) {
                  handleCanvasInteraction(e, endColorWheelRef.current);
                }
              }}
              onMouseMove={(e) => {
                if (endColorWheelRef.current) {
                  handleCanvasInteraction(e, endColorWheelRef.current);
                }
              }}
              onMouseUp={() => leave()}
              onMouseLeave={() => leave()}
            />
          </div>
        </div>

        {/* 角度スライダー */}
        <div className="flex items-center gap-4">
          <label className="min-w-24">角度:</label>
          <input
            type="range"
            min="0"
            max="360"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full"
          />
          <span className="min-w-12">{angle}°</span>
        </div>

        {/* CSS出力 */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <code>background: {gradientString};</code>
          <button
            onClick={copyToClipboard}
            className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            コピー
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradientGenerator;
