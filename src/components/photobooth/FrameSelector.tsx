"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { FrameTemplate, FrameConfig } from "@/types/frames";

interface FrameSelectorProps {
  photos: (string | null)[];
  selectedFrame: string | null;
  onSelectFrame: (frame: string | null) => void;
  onSelectFrameTemplate: (template: FrameTemplate | null) => void;
  customFrames: string[];
  onUploadFrame: (frameDataUrl: string) => void;
}

export function FrameSelector({
  photos,
  selectedFrame,
  onSelectFrame,
  onSelectFrameTemplate,
  customFrames,
  onUploadFrame,
}: FrameSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [templates, setTemplates] = useState<FrameTemplate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetch("/templates/frames.json")
      .then((res) => res.json())
      .then((data: FrameConfig) => {
        setTemplates(data.frames);
      })
      .catch(console.error);
  }, []);

  const allFrames = [
    ...templates.map((template) => ({
      id: template.id,
      name: template.name,
      src: template.imagePath,
      template,
    })),
    ...customFrames.map((src, index) => ({
      id: `custom-${index}`,
      name: `Custom ${index + 1}`,
      src,
      template: null as FrameTemplate | null,
    })),
  ];

  // Auto-select first frame once templates load
  useEffect(() => {
    if (allFrames.length > 0 && selectedFrame === null) {
      const first = allFrames[0];
      if (first.template) {
        if (first.src) onSelectFrame(first.src);
        onSelectFrameTemplate(first.template);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates.length]);

  const goTo = useCallback((index: number) => {
    if (allFrames.length === 0) return;
    const clamped = Math.max(0, Math.min(allFrames.length - 1, index));
    setCurrentIndex(clamped);
    const frame = allFrames[clamped];
    if (frame.template) {
      if (frame.src) onSelectFrame(frame.src);
      else onSelectFrame(null);
      onSelectFrameTemplate(frame.template);
    } else {
      onSelectFrame(frame.src);
      onSelectFrameTemplate(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFrames.length, onSelectFrame, onSelectFrameTemplate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      onUploadFrame(result);
      onSelectFrame(result);
      onSelectFrameTemplate(null);
      // Will appear at end of allFrames on next render
      setTimeout(() => goTo(allFrames.length), 50);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Touch/mouse swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientX);
    setDragDelta(0);
    setIsDragging(false);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStart === null) return;
    const delta = e.touches[0].clientX - dragStart;
    setDragDelta(delta);
    if (Math.abs(delta) > 8) setIsDragging(true);
  };
  const onTouchEnd = () => {
    if (isDragging) {
      if (dragDelta < -50 && currentIndex < allFrames.length - 1) goTo(currentIndex + 1);
      else if (dragDelta > 50 && currentIndex > 0) goTo(currentIndex - 1);
    }
    setDragStart(null);
    setDragDelta(0);
    setIsDragging(false);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientX);
    setDragDelta(0);
    setIsDragging(false);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (dragStart === null) return;
    const delta = e.clientX - dragStart;
    setDragDelta(delta);
    if (Math.abs(delta) > 8) setIsDragging(true);
  };
  const onMouseUp = () => {
    if (isDragging) {
      if (dragDelta < -50 && currentIndex < allFrames.length - 1) goTo(currentIndex + 1);
      else if (dragDelta > 50 && currentIndex > 0) goTo(currentIndex - 1);
    }
    setDragStart(null);
    setDragDelta(0);
    setIsDragging(false);
  };

  if (allFrames.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center">
        <p className="text-sm text-[#8B7B6B]">Loading frames…</p>
      </div>
    );
  }

  const trackOffset = dragStart !== null ? dragDelta : 0;
  const translateX = -(currentIndex * 100) + (trackOffset / (trackRef.current?.offsetWidth || 1)) * 100;
  const currentFrame = allFrames[currentIndex];

  return (
    <div className="space-y-4">
      {/* Label + upload button */}
      <div className="flex items-center justify-between">
        <p className="font-semibold text-[#1A1A2E]">Choose Frame</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-full bg-[#F5EDE4] px-3 py-1.5 text-xs font-semibold text-[#8B7B6B] transition-all active:scale-95"
        >
          <span>📎</span> Upload Frame
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Frame carousel */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-all disabled:opacity-30 active:scale-95"
          style={{ zIndex: 10 }}
        >
          <span className="text-sm">←</span>
        </button>

        {/* Slides */}
        <div className="overflow-hidden rounded-2xl px-10">
          <div
            ref={trackRef}
            className={cn("frame-carousel-track", dragStart !== null && "carousel-dragging")}
            style={{ transform: `translateX(${translateX}%)` }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {allFrames.map((frame) => (
              <div key={frame.id} className="w-full flex-shrink-0 flex justify-center py-2">
                <FramePreview
                  frame={frame}
                  photos={photos}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={() => goTo(currentIndex + 1)}
          disabled={currentIndex === allFrames.length - 1}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-all disabled:opacity-30 active:scale-95"
        >
          <span className="text-sm">→</span>
        </button>
      </div>

      {/* Frame name + dot indicators */}
      <div className="flex flex-col items-center gap-2">
        <p className="font-semibold text-[#1A1A2E]">{currentFrame?.name}</p>
        <div className="flex gap-1.5">
          {allFrames.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === currentIndex ? "w-6 bg-[#EF3050]" : "w-2 bg-[#E8D5C4]"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Mini preview of the photobooth with a given frame
function FramePreview({
  frame,
  photos,
}: {
  frame: { id: string; name: string; src: string | null; template: FrameTemplate | null };
  photos: (string | null)[];
}) {
  const template = frame.template;

  const photoHoles = template?.photoHoles || [
    { x: 40, y: 40, size: 560 },
    { x: 620, y: 40, size: 560 },
    { x: 40, y: 620, size: 560 },
    { x: 620, y: 620, size: 560 },
  ];
  const canvasWidth = template?.canvasWidth || 1200;
  const canvasHeight = template?.canvasHeight || 1600;

  // Fixed bounding box — always 120×160px regardless of frame shape
  const BOX_W = 120;
  const BOX_H = 160;
  const scale = Math.min(BOX_W / canvasWidth, BOX_H / canvasHeight);
  const previewW = canvasWidth * scale;
  const previewH = canvasHeight * scale;

  return (
    // Outer bounding box: fixed size, centres the inner preview
    <div
      className="flex items-center justify-center"
      style={{ width: BOX_W, height: BOX_H }}
    >
      {/* Inner preview scaled to fit the bounding box */}
      <div
        className="relative rounded-xl shadow-md bg-white overflow-hidden"
        style={{ width: previewW, height: previewH }}
      >
        {/* Photos */}
        {photos.slice(0, 4).map((photo, i) => {
          const hole = photoHoles[i];
          const left = (hole.x / canvasWidth) * 100;
          const top = (hole.y / canvasHeight) * 100;
          const w = (hole.size / canvasWidth) * 100;
          const h = (hole.size / canvasHeight) * 100;

          return (
            <div
              key={i}
              className="absolute overflow-hidden"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${w}%`,
                height: `${h}%`,
              }}
            >
              {photo ? (
                <Image src={photo} alt="" fill className="object-cover" />
              ) : (
                <div className="h-full w-full bg-[#F5EDE4]" />
              )}
            </div>
          );
        })}

        {/* Frame overlay */}
        {frame.src && (
          <div className="pointer-events-none absolute inset-0">
            <Image src={frame.src} alt={frame.name} fill className="object-contain" />
          </div>
        )}
      </div>
    </div>
  );
}
