"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PhotoCarouselProps {
  photos: (string | null)[];
  currentSlot: number;
  onSlotChange: (index: number) => void;
  onTakePhoto: (index: number) => void;
  onUploadPhoto: (index: number) => void;
  onRemovePhoto: (index: number) => void;
  onMultiUpload: (files: FileList) => void;
}

export function PhotoCarousel({
  photos,
  currentSlot,
  onSlotChange,
  onTakePhoto,
  onUploadPhoto,
  onRemovePhoto,
  onMultiUpload,
}: PhotoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const multiUploadRef = useRef<HTMLInputElement>(null);
  const [showActions, setShowActions] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(3, index));
    onSlotChange(clamped);
    setShowActions(false);
  }, [onSlotChange]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientX);
    setDragDelta(0);
    setIsDragging(false);
    setShowActions(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStart === null) return;
    const delta = e.touches[0].clientX - dragStart;
    setDragDelta(delta);
    if (Math.abs(delta) > 8) setIsDragging(true);
  };

  const onTouchEnd = () => {
    if (isDragging) {
      if (dragDelta < -50 && currentSlot < 3) goTo(currentSlot + 1);
      else if (dragDelta > 50 && currentSlot > 0) goTo(currentSlot - 1);
    } else {
      // Tap — toggle actions
      setShowActions((prev) => !prev);
    }
    setDragStart(null);
    setDragDelta(0);
    setIsDragging(false);
  };

  // Mouse handlers for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientX);
    setDragDelta(0);
    setIsDragging(false);
    setShowActions(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (dragStart === null) return;
    const delta = e.clientX - dragStart;
    setDragDelta(delta);
    if (Math.abs(delta) > 8) setIsDragging(true);
  };

  const onMouseUp = () => {
    if (isDragging) {
      if (dragDelta < -50 && currentSlot < 3) goTo(currentSlot + 1);
      else if (dragDelta > 50 && currentSlot > 0) goTo(currentSlot - 1);
    } else {
      setShowActions((prev) => !prev);
    }
    setDragStart(null);
    setDragDelta(0);
    setIsDragging(false);
  };

  const trackOffset = dragStart !== null ? dragDelta : 0;
  const translateX = -(currentSlot * 100) + (trackOffset / (trackRef.current?.offsetWidth || 1)) * 100;

  const photo = photos[currentSlot];
  const filledCount = photos.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Carousel */}
      <div className="relative overflow-hidden rounded-3xl select-none">
        {/* Track */}
        <div
          ref={trackRef}
          className={cn("carousel-track", dragStart !== null && "carousel-dragging")}
          style={{ transform: `translateX(${translateX}%)` }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {photos.map((p, i) => (
            <div
              key={i}
              className="w-full flex-shrink-0"
              style={{ width: "100%" }}
            >
              <div
                className={cn(
                  "relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl",
                  !p && "border-4 border-dashed border-[#E8D5C4] bg-white"
                )}
                style={{ touchAction: "pan-y" }}
              >
                {p ? (
                  <Image
                    src={p}
                    alt={`Photo ${i + 1}`}
                    fill
                    className="object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EDE4]">
                      <span className="text-3xl">📸</span>
                    </div>
                    <p className="font-display text-lg text-[#C4A98E]">Photo {i + 1}</p>
                    <p className="text-sm text-[#C4A98E]">Tap to add</p>
                  </div>
                )}

                {/* Slot number badge */}
                <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
                  <span className="text-xs font-bold text-white">{i + 1}</span>
                </div>

                {/* Checkmark if filled */}
                {p && (
                  <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#06D6A0]">
                    <span className="text-xs text-white">✓</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action popup overlay (shows on tap) */}
        {showActions && (
          <div
            className="animate-pop-in absolute inset-0 flex items-end justify-center rounded-3xl bg-black/30 p-6 backdrop-blur-sm"
            onClick={() => setShowActions(false)}
          >
            <div
              className="w-full max-w-xs rounded-2xl bg-white p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="mb-3 text-center text-sm font-semibold text-[#8B7B6B]">
                Photo {currentSlot + 1}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { onTakePhoto(currentSlot); setShowActions(false); }}
                  className="flex items-center gap-3 rounded-xl bg-[#EF3050] px-4 py-3 text-left text-white transition-opacity active:opacity-80"
                >
                  <span className="text-xl">📷</span>
                  <span className="font-semibold">Take Photo</span>
                </button>
                <button
                  onClick={() => { onUploadPhoto(currentSlot); setShowActions(false); }}
                  className="flex items-center gap-3 rounded-xl bg-[#F5EDE4] px-4 py-3 text-left text-[#1A1A2E] transition-opacity active:opacity-80"
                >
                  <span className="text-xl">🖼️</span>
                  <span className="font-semibold">Upload Photo</span>
                </button>
                {photo && (
                  <button
                    onClick={() => { onRemovePhoto(currentSlot); setShowActions(false); }}
                    className="flex items-center gap-3 rounded-xl bg-[#FFF0F0] px-4 py-3 text-left text-[#EF3050] transition-opacity active:opacity-80"
                  >
                    <span className="text-xl">🗑️</span>
                    <span className="font-semibold">Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dot indicators + nav arrows */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => goTo(currentSlot - 1)}
          disabled={currentSlot === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition-all disabled:opacity-30 active:scale-95"
        >
          <span className="text-base">←</span>
        </button>

        <div className="flex gap-2">
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "h-3 rounded-full transition-all duration-300",
                i === currentSlot
                  ? "w-8 bg-[#EF3050] dot-active"
                  : p
                  ? "w-3 bg-[#06D6A0]"
                  : "w-3 bg-[#E8D5C4]"
              )}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(currentSlot + 1)}
          disabled={currentSlot === 3}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition-all disabled:opacity-30 active:scale-95"
        >
          <span className="text-base">→</span>
        </button>
      </div>

      {/* Progress text */}
      <p className="text-center text-sm text-[#8B7B6B]">
        {filledCount === 4
          ? "🎉 All 4 photos selected!"
          : `${filledCount} of 4 photos selected`}
      </p>

      {/* Multi-upload button */}
      <button
        onClick={() => multiUploadRef.current?.click()}
        className="mx-auto flex items-center gap-2 rounded-full border-2 border-dashed border-[#E8D5C4] bg-white px-5 py-2.5 text-sm font-semibold text-[#8B7B6B] transition-all hover:border-[#EF3050] hover:text-[#EF3050] active:scale-95"
      >
        <span>📤</span>
        Upload multiple photos
      </button>
      <input
        ref={multiUploadRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onMultiUpload(e.target.files);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}
