"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PhotoCarousel } from "./PhotoCarousel";
import { PhotoGrid } from "./PhotoGrid";
import { Camera } from "./Camera";
import { cn } from "@/lib/utils";
import type { FrameTemplate, FrameConfig } from "@/types/frames";

export function PhotoBooth() {
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(0);
  const [step, setStep] = useState<"capture" | "preview">("capture");

  // Frame state
  const [frames, setFrames] = useState<FrameTemplate[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);

  // Swipe state for frame carousel
  const [frameDragStart, setFrameDragStart] = useState<number | null>(null);
  const [frameDragDelta, setFrameDragDelta] = useState(0);
  const [frameIsDragging, setFrameIsDragging] = useState(false);

  const downloadRef = useRef<HTMLAnchorElement>(null);
  const singleUploadRef = useRef<HTMLInputElement>(null);
  const activeUploadSlot = useRef<number>(0);

  // Load frames
  useEffect(() => {
    fetch("/templates/frames.json")
      .then((r) => r.json())
      .then((data: FrameConfig) => setFrames(data.frames))
      .catch(console.error);
  }, []);

  const currentFrame = frames[frameIndex] ?? null;
  const selectedFrame = currentFrame?.imagePath ?? null;
  const selectedFrameTemplate = currentFrame ?? null;

  const goToFrame = useCallback((index: number) => {
    setFrameIndex(Math.max(0, Math.min(frames.length - 1, index)));
  }, [frames.length]);

  // Frame swipe handlers
  const onFrameTouchStart = (e: React.TouchEvent) => {
    setFrameDragStart(e.touches[0].clientX);
    setFrameDragDelta(0);
    setFrameIsDragging(false);
  };
  const onFrameTouchMove = (e: React.TouchEvent) => {
    if (frameDragStart === null) return;
    const delta = e.touches[0].clientX - frameDragStart;
    setFrameDragDelta(delta);
    if (Math.abs(delta) > 8) setFrameIsDragging(true);
  };
  const onFrameTouchEnd = () => {
    if (frameIsDragging) {
      if (frameDragDelta < -50 && frameIndex < frames.length - 1) goToFrame(frameIndex + 1);
      else if (frameDragDelta > 50 && frameIndex > 0) goToFrame(frameIndex - 1);
    }
    setFrameDragStart(null);
    setFrameDragDelta(0);
    setFrameIsDragging(false);
  };
  const onFrameMouseDown = (e: React.MouseEvent) => {
    setFrameDragStart(e.clientX);
    setFrameDragDelta(0);
    setFrameIsDragging(false);
  };
  const onFrameMouseMove = (e: React.MouseEvent) => {
    if (frameDragStart === null) return;
    const delta = e.clientX - frameDragStart;
    setFrameDragDelta(delta);
    if (Math.abs(delta) > 8) setFrameIsDragging(true);
  };
  const onFrameMouseUp = () => {
    if (frameIsDragging) {
      if (frameDragDelta < -50 && frameIndex < frames.length - 1) goToFrame(frameIndex + 1);
      else if (frameDragDelta > 50 && frameIndex > 0) goToFrame(frameIndex - 1);
    }
    setFrameDragStart(null);
    setFrameDragDelta(0);
    setFrameIsDragging(false);
  };

  // Photo handlers
  const handleMultiUpload = (files: FileList) => {
    const fileArray = Array.from(files);
    let slotIndex = 0;
    for (const file of fileArray) {
      while (slotIndex < 4 && photos[slotIndex] !== null) slotIndex++;
      if (slotIndex >= 4) break;
      const reader = new FileReader();
      const capturedSlot = slotIndex;
      reader.onloadend = () => {
        setPhotos((p) => {
          const updated = [...p];
          updated[capturedSlot] = reader.result as string;
          return updated;
        });
      };
      reader.readAsDataURL(file);
      slotIndex++;
    }
  };

  const handleSingleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const slot = activeUploadSlot.current;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotos((prev) => {
        const next = [...prev];
        next[slot] = reader.result as string;
        return next;
      });
    };
    reader.readAsDataURL(file);
    if (singleUploadRef.current) singleUploadRef.current.value = "";
  };

  const handleCapture = (photoDataUrl: string) => {
    const slot = currentSlot;
    setPhotos((prev) => {
      const next = [...prev];
      next[slot] = photoDataUrl;
      return next;
    });
    setCurrentSlot((cur) => {
      for (let i = 1; i <= 4; i++) {
        const idx = (cur + i) % 4;
        if (!photos[idx] && idx !== slot) return idx;
      }
      return cur;
    });
  };

  const handleUploadPhoto = (index: number) => {
    activeUploadSlot.current = index;
    singleUploadRef.current?.click();
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const handleDownload = useCallback(async () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = selectedFrameTemplate?.canvasWidth || 1200;
    const height = selectedFrameTemplate?.canvasHeight || 1600;
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const photoHoles = selectedFrameTemplate?.photoHoles || [
      { x: 40, y: 40, size: 560 },
      { x: 620, y: 40, size: 560 },
      { x: 40, y: 620, size: 560 },
      { x: 620, y: 620, size: 560 },
    ];

    for (let i = 0; i < 4; i++) {
      const photo = photos[i];
      const hole = photoHoles[i];
      if (photo) {
        try {
          const img = await loadImage(photo);
          const ar = img.width / img.height;
          let dw = hole.size, dh = hole.size, ox = 0, oy = 0;
          if (ar > 1) { dw = hole.size * ar; ox = -(dw - hole.size) / 2; }
          else { dh = hole.size / ar; oy = -(dh - hole.size) / 2; }
          ctx.save();
          ctx.beginPath();
          ctx.rect(hole.x, hole.y, hole.size, hole.size);
          ctx.clip();
          ctx.drawImage(img, hole.x + ox, hole.y + oy, dw, dh);
          ctx.restore();
        } catch (err) {
          console.error(err);
        }
      } else {
        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(hole.x, hole.y, hole.size, hole.size);
      }
    }

    if (selectedFrame) {
      try {
        const frameImg = await loadImage(selectedFrame);
        ctx.drawImage(frameImg, 0, 0, width, height);
      } catch (err) {
        console.error(err);
      }
    }

    const link = downloadRef.current;
    if (link) {
      link.href = canvas.toDataURL("image/png");
      link.download = `photobooth-${Date.now()}.png`;
      link.click();
    }
  }, [photos, selectedFrame, selectedFrameTemplate]);

  const hasAllPhotos = photos.every((p) => p !== null);
  const hasAnyPhoto = photos.some((p) => p !== null);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between px-5 py-3">
        {step === "preview" ? (
          <button
            onClick={() => setStep("capture")}
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            ← Back
          </button>
        ) : (
          <div className="w-20" />
        )}
        <h1 className="font-display text-2xl text-[#EF3050]">photobooth</h1>
        {step === "capture" ? (
          <button
            onClick={() => { setPhotos([null, null, null, null]); setCurrentSlot(0); }}
            disabled={!hasAnyPhoto}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#8B7B6B] shadow-sm transition-all disabled:opacity-30 active:scale-95"
          >
            Clear
          </button>
        ) : (
          <div className="w-20" />
        )}
      </header>

      {/* ── Step: Capture ── */}
      {step === "capture" && (
        <div className="flex flex-1 flex-col gap-4 overflow-hidden px-5 pb-5">
          <div className="flex-1 overflow-hidden">
            <PhotoCarousel
              photos={photos}
              currentSlot={currentSlot}
              onSlotChange={setCurrentSlot}
              onTakePhoto={(index) => { setCurrentSlot(index); setIsCameraOpen(true); }}
              onUploadPhoto={handleUploadPhoto}
              onRemovePhoto={handleRemovePhoto}
              onMultiUpload={handleMultiUpload}
            />
          </div>

          <button
            onClick={() => setStep("preview")}
            disabled={!hasAllPhotos}
            className={cn(
              "flex-shrink-0 w-full rounded-2xl py-4 text-lg font-bold text-white shadow-lg transition-all active:scale-95",
              hasAllPhotos
                ? "bg-[#EF3050] shadow-[#EF3050]/30"
                : "bg-[#E8D5C4] text-[#C4A98E] shadow-none"
            )}
          >
            {hasAllPhotos
              ? "✨ Create My Photobooth"
              : `Add ${4 - photos.filter(Boolean).length} more photo${(4 - photos.filter(Boolean).length) !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* ── Step: Preview ── */}
      {step === "preview" && (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden px-5 pb-5">
          {/* Swipe hint */}
          <p className="flex-shrink-0 text-center text-xs text-[#8B7B6B]">
            ← swipe to change frame →
          </p>

          {/* Frame preview — takes all available space, swipe to change frame */}
          <div
            className="relative flex flex-1 min-h-0 items-center justify-center select-none cursor-grab active:cursor-grabbing"
            onTouchStart={onFrameTouchStart}
            onTouchMove={onFrameTouchMove}
            onTouchEnd={onFrameTouchEnd}
            onMouseDown={onFrameMouseDown}
            onMouseMove={onFrameMouseMove}
            onMouseUp={onFrameMouseUp}
            onMouseLeave={onFrameMouseUp}
          >
            {/* Prev arrow */}
            <button
              onClick={() => goToFrame(frameIndex - 1)}
              disabled={frameIndex === 0}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute left-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition-all disabled:opacity-0 active:scale-95"
            >
              <span className="text-sm">←</span>
            </button>

            {/* The actual photobooth preview */}
            <PhotoGrid
              className={
                currentFrame?.layout === "square"
                  ? "w-full max-w-full h-auto max-h-full shadow-2xl"
                  : "h-full w-auto max-w-full shadow-2xl"
              }
              photos={photos}
              frameOverlay={selectedFrame}
              frameTemplate={selectedFrameTemplate}
              onPhotoClick={undefined}
            />

            {/* Next arrow */}
            <button
              onClick={() => goToFrame(frameIndex + 1)}
              disabled={frameIndex === frames.length - 1}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition-all disabled:opacity-0 active:scale-95"
            >
              <span className="text-sm">→</span>
            </button>
          </div>

          {/* Frame name + dots */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
            <p className="text-sm font-semibold text-[#1A1A2E]">
              {currentFrame?.name ?? ""}
            </p>
            <div className="flex gap-1.5">
              {frames.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToFrame(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === frameIndex ? "w-6 bg-[#EF3050]" : "w-2 bg-[#E8D5C4]"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex-shrink-0 w-full rounded-2xl bg-[#EF3050] py-4 text-lg font-bold text-white shadow-lg shadow-[#EF3050]/30 transition-all active:scale-95"
          >
            ⬇️ Download
          </button>
        </div>
      )}

      {/* Hidden inputs */}
      <input ref={singleUploadRef} type="file" accept="image/*" onChange={handleSingleUploadChange} className="hidden" />
      <a ref={downloadRef} className="hidden" />

      <Camera isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
    </div>
  );
}
