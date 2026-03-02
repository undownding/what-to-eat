"use client";

import { useEffect, useRef, useState } from "react";

type WheelItem = {
  name: string;
  emoji: string;
};

const WHEEL_ITEMS: WheelItem[] = [
  { name: "烤肉", emoji: "🥩" },
  { name: "披萨", emoji: "🍕" },
  { name: "汉堡", emoji: "🍔" },
  { name: "拉面", emoji: "🍜" },
  { name: "麻辣烫", emoji: "🌶️" },
  { name: "火锅", emoji: "🍲" },
  { name: "炸鸡", emoji: "🍗" },
  { name: "烤冷面", emoji: "🥞" },
  { name: "粥", emoji: "🥣" },
  { name: "盐水鸭", emoji: "🦆" },
  { name: "白斩鸡", emoji: "🐔" },
  { name: "烤鱼", emoji: "🐟" },
  { name: "炒饭", emoji: "🍚" },
  { name: "东北菜", emoji: "🥬" },
];

const SEGMENT_COLORS = [
  "#F97316",
  "#FB7185",
  "#8B5CF6",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#14B8A6",
  "#6366F1",
  "#D946EF",
  "#0EA5E9",
  "#22C55E",
  "#A855F7",
  "#EAB308",
];

const SEGMENT_ANGLE = 360 / WHEEL_ITEMS.length;
const LABEL_RADIUS = 128;
const DURATION = 4000;

// cubic-bezier(0.18, 0.88, 0.3, 1)
function cubicBezier(t: number): number {
  const x1 = 0.18, y1 = 0.88;
  const x2 = 0.3, y2 = 1;

  // 使用 Newton-Raphson 方法求解 x(t) = target 对应的 t
  function findTForX(target: number): number {
    let t = target;
    for (let i = 0; i < 8; i++) {
      const x = 3 * t * (1 - t) * (1 - t) * x1 + 3 * t * t * (1 - t) * x2 + t * t * t;
      const dx = 3 * (1 - t) * (1 - t) * x1 + 6 * t * (1 - t) * (x2 - x1) + 3 * t * t * (1 - x2);
      if (Math.abs(x - target) < 1e-6) break;
      t -= (x - target) / dx;
    }
    return t;
  }

  const tNorm = findTForX(t);
  return 3 * tNorm * (1 - tNorm) * (1 - tNorm) * y1 + 3 * tNorm * tNorm * (1 - tNorm) * y2 + tNorm * tNorm * tNorm;
}

function getCurrentItemFromRotation(totalRotation: number): WheelItem {
  const normalizedRotation = (360 - (totalRotation % 360) + 360) % 360;
  const index = Math.floor(normalizedRotation / SEGMENT_ANGLE) % WHEEL_ITEMS.length;
  return WHEEL_ITEMS[index];
}

export default function Home() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentItem, setCurrentItem] = useState<WheelItem | null>(null);
  const [drawCount, setDrawCount] = useState(0);
  const [resultPulseKey, setResultPulseKey] = useState(0);

  const animationRef = useRef<{
    startRotation: number;
    targetRotation: number;
    startTime: number;
    selectedItem: WheelItem;
  } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const gradientStops = WHEEL_ITEMS.map((_, index) => {
    const start = index * SEGMENT_ANGLE;
    const end = start + SEGMENT_ANGLE;
    return `${SEGMENT_COLORS[index]} ${start}deg ${end}deg`;
  }).join(", ");

  const animate = () => {
    if (!animationRef.current) return;

    const { startRotation, targetRotation, startTime, selectedItem } = animationRef.current;
    const now = performance.now();
    const elapsed = now - startTime;

    if (elapsed >= DURATION) {
      setRotation(targetRotation);
      setCurrentItem(selectedItem);
      setIsSpinning(false);
      setDrawCount((count) => count + 1);
      setResultPulseKey((key) => key + 1);
      animationRef.current = null;
      rafRef.current = null;
      return;
    }

    const t = elapsed / DURATION;
    const progress = cubicBezier(t);
    const currentRotation = startRotation + (targetRotation - startRotation) * progress;

    setRotation(currentRotation);
    setCurrentItem(getCurrentItemFromRotation(currentRotation));

    rafRef.current = requestAnimationFrame(animate);
  };

  const handleDraw = () => {
    if (isSpinning || drawCount >= 3) {
      return;
    }

    const selectedIndex = Math.floor(Math.random() * WHEEL_ITEMS.length);
    const selectedItem = WHEEL_ITEMS[selectedIndex];
    const selectedCenter = selectedIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const targetNormalized = (360 - selectedCenter + 360) % 360;
    const minTarget = rotation + 360 * 5;
    const targetRotation =
      minTarget + ((targetNormalized - (minTarget % 360) + 360) % 360);

    setIsSpinning(true);

    animationRef.current = {
      startRotation: rotation,
      targetRotation,
      startTime: performance.now(),
      selectedItem,
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10 text-zinc-900">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          今天吃什么转盘
        </h1>

        <div className="relative">
          <div
            className="h-80 w-80 rounded-full border-8 border-white shadow-2xl md:h-96 md:w-96"
            style={{
              background: `conic-gradient(${gradientStops})`,
              transform: `rotate(${rotation}deg)`,
              transition: "none",
            }}
          >
            {WHEEL_ITEMS.map((item, index) => {
              const angle = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
              return (
                <div
                  key={item.name}
                  className="absolute left-1/2 top-1/2 flex w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center text-[11px] font-semibold leading-tight text-white drop-shadow md:w-16 md:text-xs"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-${LABEL_RADIUS}px)`,
                    transformOrigin: "center center",
                  }}
                >
                  <span className="text-lg md:text-xl">{item.emoji}</span>
                  <span className="mt-0.5">{item.name}</span>
                </div>
              );
            })}
          </div>

          <div className="absolute left-1/2 top-[-14px] h-0 w-0 -translate-x-1/2 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-rose-600" />
          <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md" />
        </div>

        {currentItem ? (
          <p
            key={isSpinning ? "rolling" : `result-${resultPulseKey}`}
            className={`rounded-full bg-white px-5 py-2 text-base font-medium shadow ${
              !isSpinning ? "result-pop-highlight" : ""
            }`}
          >
            {isSpinning ? "正在抽：" : "结果是："}
            {currentItem.emoji} {currentItem.name}
          </p>
        ) : (
          <p className="text-zinc-500">准备好抽一发，看看今天吃啥</p>
        )}

        {drawCount < 3 ? (
          <button
            type="button"
            onClick={handleDraw}
            disabled={isSpinning}
            className="rounded-full bg-rose-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition enabled:hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {isSpinning ? "抽奖中..." : `开始抽奖（剩余 ${3 - drawCount} 次）`}
          </button>
        ) : (
          <p className="rounded-xl bg-zinc-900 px-6 py-3 text-center text-base font-medium text-zinc-100">
            今天已经给你安排三次了，还纠结？再不吃外卖都打烊啦 😏
          </p>
        )}
      </div>
    </main>
  );
}
