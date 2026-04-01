# Quick Reference: Measuring Frame Holes

## Coordinate System

```
Canvas Origin (0,0) is at TOP-LEFT corner

     0   100  200  300  400  500  600  700  800  900  1000 1100 1200
   0 ┌────────────────────────────────────────────────────────────┐
     │                                                            │
 100 │    (100, 100) ← x,y of top-left corner                    │
     │       ┌─────────────┐                                     │
 200 │       │             │                                     │
     │       │   Photo 1   │ ← size: 500 × 500                   │
 300 │       │             │                                     │
     │       │             │                                     │
 400 │       └─────────────┘                                     │
     │                                                            │
     │                                                            │
     │                                                            │
     │                                                            │
     └────────────────────────────────────────────────────────────┘
```

## What to Measure

### ✅ DO: Measure from top-left corner

```json
{
  "x": 100,    // ← Distance from LEFT edge to LEFT edge of hole
  "y": 100,    // ← Distance from TOP edge to TOP edge of hole  
  "size": 500  // ← Width and height of the square
}
```

### ❌ DON'T: Measure from center

The x,y values are NOT the center point of the hole!

## Example: Default 2×2 Grid

```
Canvas: 1200 × 1600 pixels
Padding: 40px
Gap: 20px
Photo size: 560 × 560px

     0                    620              1200
   0 ┌──────────────────────────────────────┐
     │ padding                              │
  40 │ 40  ┌────────┐ gap ┌────────┐       │
     │     │ Photo1 │ 20  │ Photo2 │       │
     │     │560×560 │     │560×560 │       │
     │     └────────┘     └────────┘       │
     │      gap 20                          │
 620 │     ┌────────┐     ┌────────┐       │
     │     │ Photo3 │     │ Photo4 │       │
     │     │560×560 │     │560×560 │       │
     │     └────────┘     └────────┘       │
     └──────────────────────────────────────┘
```

Configuration:
```json
{
  "photoHoles": [
    { "x": 40,  "y": 40,  "size": 560 },  // Photo 1: top-left
    { "x": 620, "y": 40,  "size": 560 },  // Photo 2: top-right (40 + 560 + 20 = 620)
    { "x": 40,  "y": 620, "size": 560 },  // Photo 3: bottom-left (40 + 560 + 20 = 620)
    { "x": 620, "y": 620, "size": 560 }   // Photo 4: bottom-right
  ],
  "canvasWidth": 1200,
  "canvasHeight": 1600
}
```

## Calculation Formula

If you want evenly spaced holes:

```
First hole:
  x = padding
  y = padding

Second hole (same row):
  x = padding + size + gap
  y = padding

Third hole (second row):
  x = padding  
  y = padding + size + gap

Fourth hole (second row):
  x = padding + size + gap
  y = padding + size + gap
```

## How to Use Selection Tool in Common Editors

### Photoshop
1. Press `M` for Marquee Tool
2. Draw selection around hole
3. Window → Info (shows X, Y, W, H)

### Figma  
1. Select the transparent area
2. Right panel shows X, Y, W, H

### GIMP
1. Press `R` for Rectangle Select
2. Draw selection
3. Tool Options shows Position (X, Y) and Size (W, H)

### Sketch
1. Select the shape/hole
2. Inspector panel shows X, Y, W, H
