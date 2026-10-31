"use client";

import { memo, useEffect, useRef } from "react";

type Point = { x: number; y: number };
const point = (): Point => ({ x: 5 + Math.random() * 84, y: 12 + Math.random() * 52 });
const transform = ({ x, y }: Point) => `translate(${x}%, ${y}%)`;

export const HalloweenBats = memo(function HalloweenBats({ motion }: { motion: boolean }) {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!motion || !layer.current) return;
    let disposed = false;
    const flights: Animation[] = [];
    const carriers = Array.from(layer.current.children) as HTMLElement[];

    carriers.forEach((carrier, index) => {
      let from = { x: index ? 83 : 8, y: index ? 43 : 20 };
      const fly = () => {
        if (disposed) return;
        const to = point();
        const midpoint = {
          x: (from.x + to.x) / 2,
          y: Math.max(7, Math.min(66, (from.y + to.y) / 2 + (Math.random() - 0.5) * 22)),
        };
        const sprite = carrier.firstElementChild as HTMLElement;
        sprite.style.setProperty("--bat-facing", to.x < from.x ? "-1" : "1");
        sprite.style.setProperty("--bat-bank", `${(to.y - from.y) * 0.45}deg`);
        const flight = carrier.animate(
          [
            { transform: transform(from) },
            { transform: transform(midpoint), offset: 0.5 },
            { transform: transform(to) },
          ],
          {
            duration: 2200 + Math.random() * 2600,
            easing: "cubic-bezier(.35,0,.65,1)",
            fill: "forwards",
          },
        );
        flights[index]?.cancel();
        flights[index] = flight;
        if (document.hidden) flight.pause();
        from = to;
        flight.onfinish = fly;
      };
      fly();
    });
    const visibility = () =>
      flights.forEach((flight) => (document.hidden ? flight.pause() : flight.play()));
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", visibility);
      flights.forEach((flight) => {
        flight.onfinish = null;
        flight.cancel();
      });
    };
  }, [motion]);

  if (!motion) return null;
  return (
    <div className="halloween-bats" ref={layer} aria-hidden="true">
      {[0, 1].map((index) => (
        <div className={`halloween-bat-carrier halloween-bat-carrier-${index}`} key={index}>
          <svg className="halloween-flying-bat" viewBox="0 0 120 72" focusable="false">
            <g fill="#291333" stroke="#d6a5ff" strokeWidth="2" strokeLinejoin="round">
              <path
                className="bat-wing bat-wing-left"
                d="M58 35C42 9 23 9 3 15l12 13 2 18 16-4 13 15 14-15Z"
              />
              <path
                className="bat-wing bat-wing-right"
                d="M62 35C78 9 97 9 117 15l-12 13-2 18-16-4-13 15-14-15Z"
              />
              <path d="m49 30 1-18 10 9 10-9 1 18c13 17 4 33-11 35-15-2-24-18-11-35Z" />
            </g>
            <g fill="#ffcf7d">
              <ellipse cx="55" cy="36" rx="2.5" ry="3" />
              <ellipse cx="65" cy="36" rx="2.5" ry="3" />
            </g>
            <path d="m56 46 4 4 4-4" fill="none" stroke="#f7d4ff" strokeWidth="2" />
          </svg>
        </div>
      ))}
    </div>
  );
});
