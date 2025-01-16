import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CanvasType, BlendMode } from './type';
import {
  HSVtoRGB,
  RGBtoHex,
  parseHexToHSV,
  drawColorWheel,
  drawBrightnessSlider,
} from './lib/utils';

const GradientGenerator = () => {
  const [startColor, setStartColor] = useState<string>('#efff00');
  const [endColor, setEndColor] = useState<string>('#ff6400');
  const [angle, setAngle] = useState<number>(180);
  const [activeCanvas, setActiveCanvas] = useState<CanvasType>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [blendMode, setBlendMode] = useState<BlendMode>('screen');

  const startColorWheelRef = useRef<HTMLCanvasElement | null>(null);
  const endColorWheelRef = useRef<HTMLCanvasElement | null>(null);
  const startBrightnessRef = useRef<HTMLCanvasElement | null>(null);
  const endBrightnessRef = useRef<HTMLCanvasElement | null>(null);

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
          setEndColor(color);
        }
      }
    }
    if (
      canvas === startBrightnessRef.current ||
      canvas === endBrightnessRef.current
    ) {
      const currentColor = activeCanvas === 'start' ? startColor : endColor;
      const { h, s } = parseHexToHSV(currentColor); // 現在の色の色相と彩度を取得
      const v = Math.min(Math.max(x / canvas.width, 0), 1); // 明度（v）の計算

      const { r, g, b } = HSVtoRGB(h, s, v); // 色相と彩度を維持し、明度のみ変更
      const color = RGBtoHex(r, g, b);

      if (activeCanvas === 'start') {
        setStartColor(color);
      } else if (activeCanvas === 'end') {
        setEndColor(color);
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
  }, []);
  useEffect(() => {
    if (startBrightnessRef.current) {
      drawBrightnessSlider(startBrightnessRef.current);
    }
    if (endBrightnessRef.current) {
      drawBrightnessSlider(endBrightnessRef.current);
    }
  }, []);

  const gradientString = `conic-gradient(
          #e1e1e1 0.25turn,
          #bdbdbd 0.25turn 0.5turn,
          #e1e1e1 0.5turn 0.75turn,
          #bdbdbd 0.75turn
        )
        top left / 40px 40px repeat,linear-gradient(${angle}deg, ${startColor}, ${endColor})`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`background: ${gradientString};`);
  };

  return (
    <div className="grid items-center justify-center w-full h-screen bg-neutral-100">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-Deco text-2xl text-center">
            グラデーション市松ジェネレーター
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* プレビュー */}
          <div
            className="w-full h-60 rounded-lg"
            style={{
              background: gradientString,
              backgroundBlendMode: blendMode,
            }}
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
              {/* 彩度 */}
              <canvas
                ref={startBrightnessRef}
                width={200}
                height={30}
                className="cursor-pointer"
                onMouseDown={(e) => {
                  setIsDragging(true);
                  setActiveCanvas('start');
                  if (startBrightnessRef.current) {
                    handleCanvasInteraction(e, startBrightnessRef.current);
                  }
                }}
                onMouseMove={(e) => {
                  if (startBrightnessRef.current) {
                    handleCanvasInteraction(e, startBrightnessRef.current);
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
              {/* 彩度 */}
              <canvas
                ref={endBrightnessRef}
                width={200}
                height={30}
                className="cursor-pointer"
                onMouseDown={(e) => {
                  setIsDragging(true);
                  setActiveCanvas('end');
                  if (endBrightnessRef.current) {
                    handleCanvasInteraction(e, endBrightnessRef.current);
                  }
                }}
                onMouseMove={(e) => {
                  if (endBrightnessRef.current) {
                    handleCanvasInteraction(e, endBrightnessRef.current);
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
          <div>
            <Select
              onValueChange={(value: BlendMode) => setBlendMode(value)}
              defaultValue="screen"
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="blend-mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="screen">screen</SelectItem>
                <SelectItem value="overlay">overlay</SelectItem>
                <SelectItem value="hard-light">hard-light</SelectItem>
                <SelectItem value="color-burn">color-burn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* CSS出力 */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <code>
              background: {gradientString}; background-blend-mode: {blendMode};
            </code>
            <button
              onClick={copyToClipboard}
              className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              コピー
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradientGenerator;
