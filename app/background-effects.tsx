"use client";

import { useEffect, useRef, useCallback } from "react";

export default function BackgroundEffects() {
  const pylonRef = useRef<HTMLDivElement>(null);
  const shootingStarContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!pylonRef.current) return;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const deltaX = (e.clientX - centerX) / centerX;
    const deltaY = (e.clientY - centerY) / centerY;

    const moveX = deltaX * -10;
    const moveY = deltaY * -10;

    pylonRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
  }, []);

  const spawnShootingStar = useCallback(() => {
    const container = shootingStarContainerRef.current;
    if (!container) return;

    const star = document.createElement("div");
    star.className = "shooting-star";

    const startX = Math.random() * window.innerWidth * 0.6;
    const startY = Math.random() * window.innerHeight * 0.3;
    const angle = 32;
    const width = 80 + Math.random() * 200;
    const travelX = 300 + Math.random() * 500;
    const travelY = travelX * Math.tan((angle * Math.PI) / 180);
    const duration = 0.5 + Math.random() * 1;
    const thickness = 1 + Math.random() * 2;

    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;
    star.style.width = `${width}px`;
    star.style.height = `${thickness}px`;
    star.style.setProperty("--angle", `${angle}deg`);
    star.style.setProperty("--travel-x", `${travelX}px`);
    star.style.setProperty("--travel-y", `${travelY}px`);
    star.style.animationDuration = `${duration}s`;

    const brightness = 0.5 + Math.random() * 0.5;
    star.style.filter = `drop-shadow(0 0 ${4 + Math.random() * 8}px rgba(180, 200, 255, ${brightness}))`;

    container.appendChild(star);

    setTimeout(() => {
      star.remove();
    }, duration * 1000 + 100);
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const scheduleNext = () => {
      const delay = 800 + Math.random() * 4000;
      return setTimeout(() => {
        spawnShootingStar();
        // Occasionally spawn two close together
        if (Math.random() < 0.2) {
          setTimeout(spawnShootingStar, 100 + Math.random() * 300);
        }
        timerRef.current = scheduleNext();
      }, delay);
    };

    const timerRef = { current: scheduleNext() };

    return () => clearTimeout(timerRef.current);
  }, [spawnShootingStar]);

  return (
    <>
      <div className="galaxy-bg" />
      <div className="pylon-parallax" ref={pylonRef} />
      <div className="dark-overlay" />
      <div className="light-beam" />
      <div ref={shootingStarContainerRef} className="fixed inset-0 z-[-3] pointer-events-none" />
    </>
  );
}
