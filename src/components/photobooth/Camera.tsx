"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/useCamera";
import { cn } from "@/lib/utils";

interface CameraProps {
  onCapture: (photoDataUrl: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function Camera({ onCapture, onClose, isOpen }: CameraProps) {
  const {
    videoRef,
    canvasRef,
    isStreaming,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    facingMode,
  } = useCamera();

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  const handleCapture = () => {
    const photo = capturePhoto();
    if (photo) {
      onCapture(photo);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ma-red">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" onClick={onClose} className="text-white">
          <XIcon className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          onClick={switchCamera}
          className="text-white"
          disabled={!isStreaming}
        >
          <SwitchCameraIcon className="h-6 w-6" />
        </Button>
      </div>

      {/* Video Preview */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center text-white">
            <p className="mb-4">Camera access denied or unavailable</p>
            <p className="text-sm text-gray-400">{error}</p>
            <Button onClick={startCamera} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "h-full max-h-[70vh] w-full object-cover",
              facingMode === "user" && "-scale-x-100"
            )}
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Capture Button */}
      <div className="flex items-center justify-center p-8">
        <button
          onClick={handleCapture}
          disabled={!isStreaming}
          className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white transition-transform active:scale-95 disabled:opacity-50"
        >
          <div className="h-16 w-16 rounded-full bg-white" />
        </button>
      </div>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function SwitchCameraIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}
