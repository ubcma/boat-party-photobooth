export interface PhotoHole {
    x: number; // X position in pixels from top-left
    y: number; // Y position in pixels from top-left
    size: number; // Width and height in pixels (square)
}

export interface FrameTemplate {
    id: string;
    name: string;
    imagePath: string | null; // Path to PNG file in /public/templates/
    description?: string;
    photoHoles: PhotoHole[]; // Array of 4 photo positions
    canvasWidth: number; // Total canvas width
    canvasHeight: number; // Total canvas height
}

export interface FrameConfig {
    frames: FrameTemplate[];
}
