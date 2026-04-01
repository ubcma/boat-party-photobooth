# Frame Template System

This photobooth application supports custom frame templates with precise photo positioning using a JSON configuration system.

## Overview

Frame templates allow you to:
- Define exact positions and sizes for photo holes in your frame images
- Create PNG frames with transparent holes where photos will appear
- Ensure perfect alignment between photos and frame overlays
- Support multiple frame designs with different layouts

## How It Works

### 1. Frame Configuration File

The frame templates are defined in `/public/templates/frames.json`. This file contains:

```json
{
  "frames": [
    {
      "id": "unique-frame-id",
      "name": "Display Name",
      "imagePath": "/templates/your-frame.png",
      "description": "Optional description",
      "photoHoles": [
        { "x": 40, "y": 40, "size": 560 },
        { "x": 620, "y": 40, "size": 560 },
        { "x": 40, "y": 620, "size": 560 },
        { "x": 620, "y": 620, "size": 560 }
      ],
      "canvasWidth": 1200,
      "canvasHeight": 1600
    }
  ]
}
```

### 2. Configuration Properties

#### Frame Template Properties

- **id** (string): Unique identifier for the frame
- **name** (string): Display name shown in the UI
- **imagePath** (string | null): Path to the PNG frame file in `/public/templates/`
  - Set to `null` for no frame overlay (just positioning)
- **description** (string, optional): Description of the frame
- **photoHoles** (array): Array of 4 photo hole definitions
- **canvasWidth** (number): Total canvas width in pixels (default: 1200)
- **canvasHeight** (number): Total canvas height in pixels (default: 1600)

#### Photo Hole Properties

Each photo hole is defined by:
- **x** (number): X position in pixels of the **top-left corner** of the hole, measured from the left edge of the canvas (0 = left edge)
- **y** (number): Y position in pixels of the **top-left corner** of the hole, measured from the top edge of the canvas (0 = top edge)
- **size** (number): Width and height in pixels (all holes are square)

**Important**: The x and y coordinates represent the **top-left corner** of the hole, NOT the center.

**Coordinate System**:
```
(0,0) ────────────────────► X-axis
  │
  │    (x,y) ← Top-left corner of hole
  │      ┌──────────┐
  │      │          │
  │      │   Hole   │ ← size × size
  │      │          │
  │      └──────────┘
  │
  ▼
Y-axis
```

### 3. Creating Frame Templates

#### Step 1: Design Your Frame

1. Create a canvas with your desired dimensions (e.g., 1200x1600 pixels)
2. Design your frame overlay
3. Leave **transparent holes** where you want photos to appear
4. All photo holes should be **square** and **transparent**

#### Step 2: Measure Photo Hole Positions

Using your image editor (Photoshop, Figma, GIMP, etc.):

**Method 1: Using Selection Tool (Recommended)**
1. Select the rectangular selection/marquee tool
2. Draw a selection around one transparent hole
3. Look at the selection info panel (usually shows X, Y, W, H)
   - **X value** → Use as `x` in your config
   - **Y value** → Use as `y` in your config  
   - **W (width)** → Use as `size` in your config
4. Repeat for all 4 holes

**Method 2: Using Ruler/Guides**
1. Enable rulers (usually View → Rulers)
2. For each hole, measure from the canvas edge to the hole edge:
   - Distance from **left edge** of canvas to **left edge** of hole = `x`
   - Distance from **top edge** of canvas to **top edge** of hole = `y`
   - Width/height of the hole = `size`

**Example Measurements**:
```
If your selection tool shows:
  X: 100, Y: 200, W: 500, H: 500

Your config should be:
  { "x": 100, "y": 200, "size": 500 }
```

**Important Notes**:
- All measurements are in **pixels**
- Measure from **top-left corner** of each hole, not the center
- All holes must be **square** (width = height)
- Note the canvas dimensions (width and height)

#### Step 3: Export Your Frame

1. Export as PNG with transparency
2. Save to `/public/templates/your-frame-name.png`

#### Step 4: Add to Configuration

Add a new entry to `/public/templates/frames.json`:

```json
{
  "id": "my-custom-frame",
  "name": "My Custom Frame",
  "imagePath": "/templates/my-frame.png",
  "photoHoles": [
    { "x": 100, "y": 100, "size": 500 },
    { "x": 650, "y": 100, "size": 500 },
    { "x": 100, "y": 650, "size": 500 },
    { "x": 650, "y": 650, "size": 500 }
  ],
  "canvasWidth": 1200,
  "canvasHeight": 1600
}
```

## Example Layouts

### Standard 2x2 Grid (Default)

```
Canvas: 1200x1600px
Gap: 20px
Padding: 40px
Photo size: 560x560px

┌─────────────────────────┐
│  ┌────┐ gap ┌────┐      │
│  │ 1  │ 20  │ 2  │      │
│  └────┘     └────┘      │
│   gap                   │
│   20                    │
│  ┌────┐     ┌────┐      │
│  │ 3  │     │ 4  │      │
│  └────┘     └────┘      │
└─────────────────────────┘
```

Configuration:
```json
{
  "photoHoles": [
    { "x": 40, "y": 40, "size": 560 },
    { "x": 620, "y": 40, "size": 560 },
    { "x": 40, "y": 620, "size": 560 },
    { "x": 620, "y": 620, "size": 560 }
  ]
}
```

### Vertical Strip Layout

```
Canvas: 1200x1600px

┌─────────────────────────┐
│      ┌────────┐          │
│      │   1    │          │
│      └────────┘          │
│      ┌────────┐          │
│      │   2    │          │
│      └────────┘          │
│      ┌────────┐          │
│      │   3    │          │
│      └────────┘          │
│      ┌────────┐          │
│      │   4    │          │
│      └────────┘          │
└─────────────────────────┘
```

Configuration:
```json
{
  "photoHoles": [
    { "x": 300, "y": 50, "size": 600 },
    { "x": 300, "y": 400, "size": 600 },
    { "x": 300, "y": 750, "size": 600 },
    { "x": 300, "y": 1100, "size": 600 }
  ]
}
```

## Tips for Perfect Alignment

1. **Use a Grid System**: Design your frame on a grid to ensure consistent spacing
2. **Document Your Measurements**: Keep notes of your measurements as you design
3. **Test with Sample Photos**: Upload test photos to verify alignment
4. **Use Round Numbers**: Stick to multiples of 10 for easier calculations
5. **Maintain Aspect Ratio**: Keep the 3:4 aspect ratio (1200x1600) for consistency

## Photo Rendering Behavior

When photos are rendered:
- Photos are **centered** within their designated holes
- Photos maintain their **aspect ratio**
- Photos are **cropped** to fit the square hole (cover mode)
- The frame overlay is drawn **on top** of the photos

## Troubleshooting

### Photos Don't Align with Frame Holes

- Double-check your x, y, and size measurements
- Ensure your canvas dimensions match the configuration
- Verify the frame PNG has proper transparency

### Frame Doesn't Load

- Check that the imagePath is correct (relative to `/public/`)
- Ensure the PNG file exists in the correct location
- Check browser console for loading errors

### Photos Appear Cut Off

- Verify that the hole size matches the transparent area in your frame
- Check that all measurements are in pixels, not percentages

## Advanced Usage

### Creating Frames Without Overlays

You can create positioning templates without frame overlays by setting `imagePath` to `null`:

```json
{
  "id": "no-frame-custom-layout",
  "name": "Custom Layout (No Frame)",
  "imagePath": null,
  "photoHoles": [ /* your custom positions */ ]
}
```

This is useful for:
- Testing different layouts
- Creating print-ready grids
- Custom spacing without decorative frames
