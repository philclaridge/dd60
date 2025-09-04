# DD60 Character Generator Analysis

This document analyzes the character generation system of the DD60 display console, focusing on stroke patterns, timing, and the derivative display implementations.

## Overview

The DD60 character generator creates vector-based characters using incremental stroke patterns. Each character is composed of a series of strokes with specific X/Y movements, drawn sequentially by the electron beam.

## Character Generation System

### Basic Principles
- **Stroke-Based Drawing**: Characters formed by sequences of connected strokes
- **Incremental Movement**: Each stroke defined relative to previous position
- **Digital Control**: 0, 1, or 2 unit steps in X and/or Y per 100ns segment
- **Scaling**: Hardware supports small/medium/large/quadruple character sizes

### Timing Specifications
- **Stroke Segment Duration**: 100ns per segment
- **Maximum Step Size**: 2 units (base scale) per segment
- **Scaling Factor**: 1×, 2×, 3×, or 4× applied through analog circuits

## Stroke Pattern Architecture

### Coordinate System
- **Grid Resolution**: Characters designed on 8×8 base grid
- **Origin**: Bottom-left (0,0) for character cell
- **Step Units**: 0, 1, or 2 units per axis per segment

### Movement Encoding
Each stroke segment encodes:
- **X displacement**: -2, -1, 0, +1, or +2 units
- **Y displacement**: -2, -1, 0, +1, or +2 units
- **Beam state**: On or Off (blanked moves)

## Character Set Analysis

*[To be populated with specific character stroke patterns]*

### Numeric Characters (0-9)
*[Detailed stroke sequences to be documented]*

### Alphabetic Characters (A-Z)
*[Detailed stroke sequences to be documented]*

### Special Characters
*[Detailed stroke sequences to be documented]*

## Implementation Considerations

### Stroke Optimization
- Minimize total stroke count for refresh rate
- Optimize stroke order to reduce blanked moves
- Consider beam settling time between strokes

### Analog Effects on Stroke Patterns
- Corner rounding from bandwidth limitations
- Brightness variations from velocity changes
- Character distortion from signal path filtering

## Derivative Implementations

### Known Variants
*[To be documented: Other systems using similar character generation]*

### Modern Recreations
*[To be documented: Contemporary implementations and emulations]*

## Research Notes

### Primary Sources
- CDC 6600 technical documentation
- Display controller schematics
- Original character ROM patterns (if available)

### Observations from Hardware
- Referenced screenshot: `dd60_close_up_display_screenshot_numeric_characters.png`
- Character appearance shows analog distortion of digital patterns
- Stroke visibility varies with drawing speed

## Future Analysis

### To Be Investigated
- Complete character set mapping
- Exact stroke sequence timing
- Blanking protocol between characters
- Character spacing and positioning rules
- Special display modes (if any)

### Required Information
- Character ROM dump or equivalent documentation
- Detailed timing diagrams
- Display controller microcode (if applicable)

---

*This document will be expanded as more information about the DD60 character generator becomes available.*