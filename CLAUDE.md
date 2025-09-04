# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository is a testbench to develop critical code modules for a high-fidelity emulation of a DD60 operator's console for a CDC6600 emulation that is already developed elsewhere. This project focuses on the foundational components needed for accurate DD60 console emulation.

## Technology Stack

- **Language**: Vanilla JavaScript only
- **Deployment**: Mixed browser and server-side components
- **Standards**: Professional coding standards suitable for public GitHub repository

## Core Focus Areas

The foundation of this project centers around:

1. **DD60 Vector Character Generator**: The core text rendering system
2. **Vector Drawing Logic Timing**: Precise timing emulation for vector operations
3. **Vector CRT Physics**: Understanding and modeling of vector CRT display characteristics

## Planned Deliverables

This testbench will produce:

- Font assets in various formats (including legacy fonts for X11) representing the core vector CRT font
- Texture maps for GPU-driven CRT vector display emulations  
- Super efficient high-fidelity text generation within Babylon.js or similar using SDF/MSDF character generation

## Development Guidelines

- Use `dd60.md` to accumulate detailed DD60 display specifications and research
- Keep README.md clean as it will be the GitHub front page
- No framework dependencies - vanilla JavaScript only
- Code must be suitable for public scrutiny and collaboration

## File Organization

- Any Claude-generated temporary test files should be placed in `claude_temp_tests/` directory
- Keep the root directory clean of temporary test files

## Development Notes

As this is a new project, development patterns and build commands will be established as the codebase grows. Future updates to this file should include:

- Build and compilation commands once a build system is established
- Testing framework and commands when tests are added
- Architecture documentation as the emulation components are implemented
- Specific details about DD60 console emulation implementation patterns