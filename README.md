# DD60 Console Emulation Testbench

This project is a testbench to develop critical code modules for a high-fidelity emulation of a DD60 operator's console for a CDC6600 emulation.

## Overview

The CDC6600 was a supercomputer designed by Seymour Cray in the 1960s, and the DD60 was its console display system. This testbench focuses on developing the foundational components needed for accurate DD60 console emulation.

## Core Components

The foundation of this project centers around:

- **DD60 Vector Character Generator**: Core text rendering system with authentic CDC 6602 binary ROM format
- **Vector Drawing Logic Timing**: Precise timing emulation for vector operations  
- **Vector CRT Physics**: Understanding and modeling of vector CRT display characteristics

## Live Demo

🚀 **[View Live Demo](https://philclaridge.github.io/dd60/)**

- **[ROM Viewer](https://philclaridge.github.io/dd60/rom_viewer.html)** - Analyze CDC 6602 character ROM binary data
- **[Scaled Viewer](https://philclaridge.github.io/dd60/scaled_viewer.html)** - Interactive character rendering at multiple scales
- **[Documentation](https://philclaridge.github.io/dd60/documentation.html)** - Complete project documentation

## Current Status

This testbench has achieved:

- **Authentic CDC 6602 Character ROM**: Complete binary format implementation (`src/chargen/cdcRomBinary.js`)
- **Runtime Vector Conversion**: Functions to decode binary ROM to vector coordinates (`src/chargen/cdcRomFunctions.js`)
- **Comprehensive Visualization**: Interactive character generator analysis tool (`src/chargen/view_chargen_rom.html`)
- **Direction Change Detection**: Visual indicators for CDC 6602 direction tracking algorithm

## Planned Outputs

This testbench will produce various formats and implementations:

- **Font Assets**: Legacy fonts for X11 and modern systems representing the core vector CRT font
- **Texture Maps**: GPU-compatible assets for CRT vector display emulations
- **High-Fidelity Text Generation**: Super efficient text rendering for Babylon.js and similar frameworks using SDF/MSDF character generation

## Technology

- Vanilla JavaScript for both browser and server-side components
- Professional coding standards suitable for public GitHub repository

## Documentation

- See [CLAUDE.md](CLAUDE.md) for AI-specific development directions
- See [dd60.md](dd60.md) for detailed DD60 display specifications and research
