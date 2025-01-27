import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BlendMode } from '@/type';
import { Brightness } from '@/components/brightness';
import { ColorWheel } from '@/components/colorwheel';

const GradientGenerator = () => {
  const [startColor, setStartColor] = useState<string>('#efff00');
  const [endColor, setEndColor] = useState<string>('#ff6400');
  const [angle, setAngle] = useState<number>(180);
  const [isDragging, setIsDragging] = useState(false);
  const [blendMode, setBlendMode] = useState<BlendMode>('screen');

  const startColorWheelRef = useRef<HTMLCanvasElement | null>(null);
  const endColorWheelRef = useRef<HTMLCanvasElement | null>(null);
  const startBrightnessRef = useRef<HTMLCanvasElement | null>(null);
  const endBrightnessRef = useRef<HTMLCanvasElement | null>(null);

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
    <div className="container mx-auto max-w-2xl my-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-Deco text-xl md:text-2xl text-center">
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
          <div className="md:flex gap-8 justify-center">
            <div className="space-y-2 border rounded-xl p-4 mb-4">
              <div className="text-center">開始色: {startColor}</div>
              <ColorWheel
                setColor={setStartColor}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                ref={startColorWheelRef}
              />
              <Brightness
                currentColor={startColor}
                setColor={setStartColor}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                ref={startBrightnessRef}
              />
            </div>
            <div className="space-y-2 border rounded-xl p-4 mb-4">
              <div className="text-center">終了色: {endColor}</div>
              <ColorWheel
                setColor={setEndColor}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                ref={endColorWheelRef}
              />
              <Brightness
                currentColor={endColor}
                setColor={setEndColor}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                ref={endBrightnessRef}
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
          <div className="flex items-center gap-4">
            <label className="min-w-24">レイヤー効果:</label>
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
