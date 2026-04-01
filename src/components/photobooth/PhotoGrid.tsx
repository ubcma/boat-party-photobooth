"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import type { FrameTemplate } from "@/types/frames";

interface PhotoGridProps {
  photos: (string | null)[];
  onPhotoClick?: (index: number) => void;
  frameOverlay?: string | null;
  frameTemplate?: FrameTemplate | null;
  className?: string;
  activePhotoIndex?: number | null;
  onAction?: (action: "take" | "upload" | "remove" | "cancel", index: number) => void;
  photoFilters?: string[];
}

export function PhotoGrid({
  photos,
  onPhotoClick,
  frameOverlay,
  frameTemplate,
  className,
  activePhotoIndex,
  onAction,
  photoFilters,
}: PhotoGridProps) {
  // Get photo holes from template or use default grid positions
  const photoHoles = frameTemplate?.photoHoles || [
    { x: 40, y: 40, size: 560 },
    { x: 620, y: 40, size: 560 },
    { x: 40, y: 620, size: 560 },
    { x: 620, y: 620, size: 560 },
  ];

  const canvasWidth = frameTemplate?.canvasWidth || 1200;
  const canvasHeight = frameTemplate?.canvasHeight || 1600;

  return (
    <div
      className={cn("relative w-full max-w-md", className)}
      style={{
        aspectRatio: `${canvasWidth} / ${canvasHeight}`,
      }}
    >
      {/* Photo Grid Container */}
      <div className="absolute inset-0">
        {photos.slice(0, 4).map((photo, index) => {
          const hole = photoHoles[index];
          // Calculate percentage positions for responsive layout
          const leftPercent = (hole.x / canvasWidth) * 100;
          const topPercent = (hole.y / canvasHeight) * 100;
          const widthPercent = (hole.size / canvasWidth) * 100;
          const heightPercent = (hole.size / canvasHeight) * 100;

          return (
            <div
              key={index}
              className={cn(
                "absolute transition-all",
                activePhotoIndex === index && "z-50"
              )}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
              }}
            >
              <button
                onClick={() => onPhotoClick?.(index)}
                className={cn(
                  "h-full w-full overflow-hidden rounded-lg border-2 border-dashed transition-all",
                  photo
                    ? "border-transparent"
                    : "border-muted-foreground/30 hover:border-primary/50",
                  onPhotoClick && "cursor-pointer hover:opacity-90",
                  activePhotoIndex === index && "border-primary"
                )}
              >
                {photo ? (
                  <Image
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover"
                    style={photoFilters?.[index] && photoFilters[index] !== "none"
                      ? { filter: photoFilters[index] }
                      : undefined}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted/50">
                    <span className="text-4xl font-light text-muted-foreground">
                      {index + 1}
                    </span>
                  </div>
                )}
              </button>

              {/* Contextual Popup */}
              {activePhotoIndex === index && onAction && (
                <div className="absolute left-1/2 top-[105%] z-50 flex w-40 -translate-x-1/2 flex-col gap-1 rounded-lg border bg-popover p-2 shadow-md hover:cursor-default">
                  <div className="mb-1 text-center text-xs text-muted-foreground">
                    Edit Photo {index + 1}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction("take", index);
                    }}
                    className="rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    Take Photo
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction("upload", index);
                    }}
                    className="rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    Upload Photo
                  </button>
                  {photo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction("remove", index);
                      }}
                      className="rounded-sm px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10"
                    >
                      Remove
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction("cancel", index);
                    }}
                    className="rounded-sm px-2 py-1.5 text-center text-sm text-muted-foreground hover:bg-accent"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Frame Overlay */}
      {frameOverlay && (
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={frameOverlay}
            alt="Frame overlay"
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}
