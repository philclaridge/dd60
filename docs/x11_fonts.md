# X11 Bitmap Font Research

This document accumulates research on X11 bitmap font characteristics, formats, and capabilities for understanding the existing CDC6600 emulation's font implementation.

## Overview

The existing CDC6600 emulation uses classic X11 bitmap fonts (not TrueType or other scalable fonts). Understanding these formats is crucial for creating appropriate font assets for the DD60 console emulation.

## X11 Bitmap Font Formats

### Core X11 Font System

The core X11 fonts system is directly derived from the fonts system included with **X11R1 in 1987**, which could only use **monochrome bitmap fonts**. This fundamental limitation shapes all classic X11 bitmap font formats.

### Primary Formats

#### BDF (Bitmap Distribution Format)

- **Developer**: Adobe
- **Type**: Text-based, human-readable ASCII format
- **Bit Depth**: **1-bit monochrome only** (no grayscale or alpha channel)
- **Storage**: Individual glyphs with bitmap data represented in hexadecimal
- **Usage**: Standard distribution format for bitmap fonts
- **Platform**: Cross-platform, primarily Unix/X Window environments

#### PCF (Portable Compiled Format)

- **Type**: Binary format
- **Purpose**: More efficient replacement for BDF
- **Bit Depth**: **1-bit monochrome only**
- **Advantages**: More efficient storage and faster loading than BDF
- **Conversion**: Use `bdftopcf` command to convert from BDF to PCF
- **Status**: Preferred format for installed bitmap fonts in X11

**PCF Technical Details:**
- File header contains 32-bit integers (LSB first)
- Two metrics tables: `PCF_METRICS` (bitmap size) and `PCF_INK_METRICS` (bounding box)
- Bitmap data format flags indicate:
  - Byte order: `format&4` => LSByte first
  - Bit order: `format&8` => LSBit first  
  - Row padding: `format&3` (0=>bytes, 1=>shorts, 2=>ints)
  - Storage units: `(format>>4)&3` (0=>bytes, 1=>shorts, 2=>ints)

#### SNF (Server Natural Format)

- **Status**: **Obsolete** (still supported for backwards compatibility)
- **Type**: Binary format
- **Bit Depth**: **1-bit monochrome only**
- **Note**: Should not be used for new development

## Bit Depth and Rendering Capabilities

### Monochrome Only (1-bit)

**Critical Finding**: All X11 bitmap font formats (BDF, PCF, SNF) are fundamentally **monochrome with 1-bit depth**:
- Each pixel is either ON or OFF
- No grayscale levels
- No alpha channel
- No anti-aliasing support

### Why No Anti-aliasing?

1. **Architectural Limitation**: Traditional X server can only render into monochrome bitmaps
2. **Background Color Unknown**: Text renderer doesn't know background color, cannot perform anti-aliasing
3. **XLFD Limitation**: X Logical Font Description doesn't support anti-aliasing or sub-pixel rendering

## Font Systems Comparison

### Core X11 Fonts (Bitmap)
- **Formats**: BDF, PCF, SNF
- **Bit Depth**: 1-bit monochrome only
- **Anti-aliasing**: Not supported
- **Alpha Channel**: Not supported
- **Grayscale**: Not supported
- **Usage**: Legacy applications, terminal emulators

### Xft/FreeType (Modern)
- **Formats**: TrueType, OpenType, Type 1
- **Bit Depth**: Full grayscale/color support
- **Anti-aliasing**: Supported
- **Sub-pixel Rendering**: Supported
- **Alpha Channel**: Supported via Render extension
- **Note**: **Incompatible with core X11 bitmap fonts**

## Implications for DD60 Emulation

### Current State
The existing CDC6600 emulation using X11 bitmap fonts means:
- Characters are rendered as pure 1-bit bitmaps
- No smoothing or anti-aliasing
- Sharp, pixelated edges (authentic to vintage displays)
- Fast rendering with minimal processing

### Conversion Considerations
To create X11 bitmap fonts from our CDC 6602 vector data:
1. Must rasterize vectors to 1-bit bitmaps at specific sizes
2. No intermediate gray levels possible
3. Need to optimize stroke thickness for 1-bit representation
4. Consider multiple sizes since bitmap fonts don't scale

### Format Choice
- **BDF**: Best for development and distribution (human-readable)
- **PCF**: Best for runtime use (efficient loading)
- **SNF**: Avoid (obsolete)

## BDF File Structure

### File Format Overview
BDF files are plain text ASCII files with a specific structure for defining bitmap glyphs.

### Basic Structure Example
```
STARTFONT 2.1
FONT -gnu-unifont-medium-r-normal--16-160-75-75-c-80-iso10646-1
SIZE 16 75 75
FONTBOUNDINGBOX 16 16 0 -2
STARTPROPERTIES 2
FONT_ASCENT 14
FONT_DESCENT 2
ENDPROPERTIES
CHARS 1
STARTCHAR U+0041
ENCODING 65
SWIDTH 500 0
DWIDTH 8 0
BBX 8 16 0 -2
BITMAP
00
00
00
18
24
24
42
42
7E
42
42
42
42
00
00
00
ENDCHAR
ENDFONT
```

### Key Elements

#### Character Definition
- **STARTCHAR**: Begins character definition (e.g., "U+0041" for Unicode point)
- **ENCODING**: Numeric character code (e.g., 65 for ASCII 'A')
- **BBX**: Bounding box (width height xoffset yoffset)
- **BITMAP**: Begins hexadecimal bitmap data
- **ENDCHAR**: Ends character definition

#### Bitmap Data Format
- **Hexadecimal encoding**: Each line represents one row of pixels
- **Bit mapping**: "1" = pixel on (black), "0" = pixel off (white)
- **Padding**: Lines padded to nearest byte boundary with zeros
- **Bit order**: MSB represents leftmost pixel

#### Example Decoding
```
Hex: 18 = Binary: 00011000
Hex: 24 = Binary: 00100100
Hex: 42 = Binary: 01000010
Hex: 7E = Binary: 01111110
```
This forms the shape of letter 'A' in the bitmap.

## Technical Specifications Summary

| Format | Type | Bit Depth | Anti-aliasing | Alpha Channel | Status |
|--------|------|-----------|---------------|---------------|---------|
| BDF | Text/ASCII | 1-bit | No | No | Standard |
| PCF | Binary | 1-bit | No | No | Preferred |
| SNF | Binary | 1-bit | No | No | Obsolete |

## Tools for BDF Font Creation

### Primary Editors

#### FontForge (Recommended)
- **Type**: Full-featured open-source font editor
- **BDF Support**: Complete read/write/edit capabilities
- **Features**:
  - Create bitmap-only fonts (File→New, then Element→Bitmap Strikes Available)
  - Import multiple BDF files into single font
  - Edit individual glyphs visually
  - Export to BDF, PCF, and other formats
  - Cross-platform (Linux, macOS, Windows)
- **Installation**: Available via package managers or https://fontforge.org

#### gbdfed (GTK-based BDF Font Editor)
- **Type**: Dedicated BDF editor for Linux/Unix
- **Features**:
  - Interactive glyph editing
  - Cut/paste between fonts and glyphs
  - Import from PK/GF, HBF, PSF, OTF/TTF formats
  - Export to PSF2, HEX formats
  - Grab fonts from X server
- **Best for**: Quick BDF editing on Linux systems

#### bdfedit (Simple X11 BDF Editor)
- **Type**: Lightweight X11 tool
- **Features**:
  - Visual glyph editing
  - Import XBM bitmaps
  - Basic font property editing
- **Best for**: Simple edits and learning BDF structure

### Conversion Utilities

#### bdftopcf
- **Purpose**: Convert BDF to PCF format
- **Usage**: `bdftopcf input.bdf -o output.pcf`
- **Note**: Essential for preparing fonts for X11 use

#### pcf2bdf
- **Purpose**: Convert PCF back to BDF
- **Usage**: `pcf2bdf input.pcf -o output.bdf`
- **Note**: Useful for editing existing PCF fonts

### Programmatic Tools

#### Python Libraries
- **bdflib**: Python library for reading/writing BDF files
- **bdfparser**: BDF format parser library
- **Usage**: Ideal for batch processing and automated font generation

#### Online Tools
- **SnowB Bitmap Font**: Generate bitmap fonts from TrueType
- **BitFontMaker2**: Web-based bitmap font editor
- **Note**: Limited compared to desktop tools but convenient for quick tasks

### Workflow for DD60 Font Creation

1. **Vector to Bitmap Conversion**:
   - Rasterize CDC 6602 vector data at target sizes
   - Apply threshold for 1-bit conversion
   - Save as BDF format

2. **BDF Creation Process**:
   ```
   Vector Data → Rasterize → 1-bit Bitmap → BDF Format → PCF (for use)
   ```

3. **Recommended Tools Chain**:
   - **Development**: FontForge or custom script with bdflib
   - **Testing**: bdfedit for quick checks
   - **Deployment**: bdftopcf for final conversion

## CDC 6602 Character Size Requirements

### Character Bounds Analysis

Based on analysis of the CDC 6602 character ROM data:

#### Vector Coordinate Range
- **X coordinates**: 0 to 6 (7 units wide)
- **Y coordinates**: 0 to 6 (7 units high)
- **Base grid**: Characters fit within 7×7 grid

#### Bitmap Size for 1:1 Rendering
For a simple render with **1 pixel per 1 vector unit**:
- **Minimum bitmap size**: **7×7 pixels**
- **Character origin**: (0, 0) at bottom-left
- **No negative coordinates**: All vectors are in positive quadrant

#### Practical Bitmap Sizes

For X11 bitmap fonts, common sizes would be:

1. **7×7 pixels** (1:1 mapping)
   - Direct vector-to-pixel mapping
   - Very small, limited readability
   - Suitable for miniature displays

2. **14×14 pixels** (2:1 mapping)
   - 2 pixels per vector unit
   - Better stroke definition
   - Minimum practical size for terminals

3. **21×21 pixels** (3:1 mapping)
   - 3 pixels per vector unit
   - Good balance of size and clarity
   - Allows some stroke width variation

4. **28×28 pixels** (4:1 mapping)
   - 4 pixels per vector unit
   - Excellent readability
   - Comparable to standard terminal fonts

#### Important Notes

- The CDC 6602 uses an **8×8 logical grid** but characters only use 7×7
- The unused row/column likely provided character spacing
- For X11 fonts, we'd add spacing between characters (typically 1-2 pixels)
- Actual font metrics would include ascent/descent beyond character bounds

## X11 Font Metrics and Character Spacing

### Character Cell vs Glyph Size

X11 BDF fonts distinguish between:
- **Character cell**: Space allocated for each character (affects string spacing)
- **Glyph bitmap**: Actual drawn pixels (can be smaller than cell)

### BDF Metrics Explained

#### DWIDTH (Device Width) - Character Advance
```
DWIDTH 8 0
```
- Controls cursor advancement between characters
- First number: horizontal pixels to advance for next character
- Second number: vertical advance (usually 0 for horizontal text)
- **This is your "character cell width"**

#### BBX (Bounding Box) - Actual Glyph Size
```
BBX 7 7 0 0
```
- Format: `BBX width height x_offset y_offset`
- Defines actual bitmap dimensions and position within character cell
- **This is your actual drawing area**

#### FONTBOUNDINGBOX - Overall Font Metrics
```
FONTBOUNDINGBOX 8 8 0 0
```
- Maximum character cell size for entire font
- Used for font-wide spacing calculations

### Perfect Match for CDC 6602

This system perfectly accommodates the CDC 6602 design:

```
# 7×7 glyph in 8×8 cell (1:1 scale)
FONTBOUNDINGBOX 8 8 0 0
DWIDTH 8 0      # 8-pixel advance = automatic 1-pixel spacing
BBX 7 7 0 0     # 7×7 actual character bitmap

# 14×14 glyph in 16×16 cell (2× scale)  
FONTBOUNDINGBOX 16 16 0 0
DWIDTH 16 0     # 16-pixel advance = automatic 2-pixel spacing
BBX 14 14 1 1   # 14×14 bitmap centered in cell

# 21×21 glyph in 24×24 cell (3× scale)
FONTBOUNDINGBOX 24 24 0 0  
DWIDTH 24 0     # 24-pixel advance = automatic 3-pixel spacing
BBX 21 21 1 1   # 21×21 bitmap with 1-pixel margin
```

### Key Benefits

1. **Automatic spacing**: DWIDTH handles inter-character gaps
2. **Clean separation**: Glyph size independent of character advance
3. **Authentic layout**: Matches CDC 6602's 7×7 drawing in 8×8 grid
4. **Scalable**: Same principle works at any scale factor

### Implementation Strategy

For DD60 X11 fonts:
1. **Character cell**: Set to 8×8 (or scaled multiples)
2. **Glyph bitmap**: Use 7×7 from CDC 6602 vectors  
3. **Positioning**: Center or align glyphs within cells as needed
4. **Spacing**: Automatically handled by DWIDTH metrics

This approach preserves the authentic CDC 6602 character proportions while providing proper text layout for modern X11 applications.

## Key Takeaways

1. **X11 bitmap fonts are strictly 1-bit monochrome** - no grayscale or alpha channel
2. **No anti-aliasing possible** with classic X11 bitmap fonts
3. **BDF is the standard source format**, converted to PCF for efficiency
4. **Modern Xft/FreeType is incompatible** with core X11 bitmap font system
5. **Bitmap fonts require pre-rendering** at each desired size
6. **FontForge is the most comprehensive tool** for BDF font creation
7. **BDF format is human-readable**, enabling direct text editing if needed

## References

- X11R7.7 Documentation: https://x.org/releases/X11R7.7/doc/xorg-docs/fonts/fonts.html
- FontForge PCF Format: https://fontforge.org/docs/techref/pcf-format.html
- X.Org Font Documentation: https://www.x.org/archive/X11R7.5/doc/fonts/fonts.html
- X Logical Font Description: https://wiki.archlinux.org/title/X_Logical_Font_Description