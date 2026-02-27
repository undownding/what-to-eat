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
];

const SEGMENT_ANGLE = 360 / WHEEL_ITEMS.length;
const LABEL_RADIUS = 104;

export default function Home() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentItem, setCurrentItem] = useState<WheelItem | null>(null);
  const [drawCount, setDrawCount] = useState(0);
  const [resultPulseKey, setResultPulseKey] = useState(0);

  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rollingTextRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (finishTimerRef.current) {
        clearTimeout(finishTimerRef.current);
      }
      if (rollingTextRef.current) {
        clearInterval(rollingTextRef.current);
      }
    };
  }, []);

  const gradientStops = WHEEL_ITEMS.map((_, index) => {
    const start = index * SEGMENT_ANGLE;
    const end = start + SEGMENT_ANGLE;
    return `${SEGMENT_COLORS[index]} ${start}deg ${end}deg`;
  }).join(", ");

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
    setCurrentItem(WHEEL_ITEMS[Math.floor(Math.random() * WHEEL_ITEMS.length)]);

    rollingTextRef.current = setInterval(() => {
      setCurrentItem(WHEEL_ITEMS[Math.floor(Math.random() * WHEEL_ITEMS.length)]);
    }, 120);

    setRotation(targetRotation);

    finishTimerRef.current = setTimeout(() => {
      if (rollingTextRef.current) {
        clearInterval(rollingTextRef.current);
        rollingTextRef.current = null;
      }
      setCurrentItem(selectedItem);
      setIsSpinning(false);
      setDrawCount((count) => count + 1);
      setResultPulseKey((key) => key + 1);
    }, 4000);
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
              transition: isSpinning
                ? "transform 4s cubic-bezier(0.18, 0.88, 0.3, 1)"
                : "none",
            }}
          >
            {WHEEL_ITEMS.map((item, index) => {
              const angle = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
              return (
                <div
                  key={item.name}
                  className="absolute left-1/2 top-1/2 flex w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center text-xs font-semibold leading-tight text-white drop-shadow md:w-20 md:text-sm"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-${LABEL_RADIUS}px) rotate(${-angle}deg)`,
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
