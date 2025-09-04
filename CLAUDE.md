# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository is a test-bench to develop critical code modules for a high-fidelity emulation of a DD60 operator's console for a CDC6600 emulation that is already developed elsewhere. This project focuses on the foundational components needed for accurate DD60 console emulation.

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

### JavaScript Coding Standards

- **JSDoc Type Annotations**: Use comprehensive JSDoc comments with type information to enable IDE type checking without TypeScript
- **Example JSDoc patterns**:
  ```javascript
  /**
   * Convert vector data to triplet format
   * @param {Array<[number, number, boolean]>} vectorData - Array of [x, y, beamOn] coordinates
   * @param {Object} [options={}] - Optional configuration
   * @param {number} [options.scale=1] - Scale factor for coordinates
   * @returns {Array<[number, number, number]>} Array of [x, y, intensity] triplets
   */
  function vectorToTriplets(vectorData, options = {}) {
    // Implementation
  }
  ```
- **Type Definitions**: Define complex types in JSDoc for reuse across the codebase
- **Parameter Validation**: Include parameter validation and null checks for robustness

## File Organization

- Any Claude-generated temporary test files should be placed in `claude_temp_tests/` directory
- Keep the root directory clean of temporary test files

## Current Implementation Status

### Completed Components

- **CDC 6602 Character ROM**: Authentic binary format in `src/chargen/cdcRomBinary.js`
- **Runtime Conversion Functions**: Binary-to-vector decoding in `src/chargen/cdcRomFunctions.js`
- **Visualization Tool**: Interactive analysis in `src/chargen/view_chargen_rom.html`
- **Direction Change Detection**: Visual indicators for CDC 6602 direction tracking

### File Structure
```
src/
├── chargen/                     # Active character generator implementation
│   ├── cdcRomBinary.js         # Authoritative CDC 6602 binary ROM data
│   ├── cdcRomFunctions.js      # Runtime conversion functions
│   └── view_chargen_rom.html   # Interactive analysis tool
└── archive_to_delete/          # Historical reference files
    ├── vectorRomCDC6602.js     # Original vector data (for validation)
    └── [test files]            # Round-trip validation tests
```

## Testing and Verification

### Playwright Testing Framework

The project includes Playwright for automated testing and visual verification:

- **Installation**: `npm install` (already configured in package.json)
- **Browser Setup**: `npx playwright install` (downloads Chrome, Firefox, WebKit)
- **Use Cases**: 
  - Visual regression testing of character rendering
  - Canvas content verification across different scales
  - Error detection in visualization tools
  - Cross-browser compatibility testing

### Testing Commands

```bash
npm test                    # Run test suite (to be implemented)
npx playwright test        # Run Playwright tests
npx playwright show-report # View test results
```

### Running Playwright Tests

Due to ES module CORS restrictions with `file://` protocol, use the HTTP server test approach:

```bash
# Start HTTP server for testing (required for ES6 modules)
python3 -m http.server 8000

# Successful bitmap verification test (includes HTTP server)
npx playwright test tests/server-bitmap-test.spec.js

# Other useful Playwright commands
npx playwright test --headed              # Run with browser visible
npx playwright test --debug               # Run in debug mode
npx playwright test --reporter=list       # Detailed console output
npx playwright codegen                    # Generate test code interactively
```

**Critical**: Always use HTTP server for Playwright testing to prevent CORS issues with ES6 module imports. Use `http://localhost:8000/` URLs instead of `file://` URLs in test scripts.

**⚠️ CORS Testing Guidelines for Claude**:
- **NEVER** use `file://` protocol for testing ES6 modules (will always fail with CORS errors)
- **ALWAYS** start HTTP server first: `python3 -m http.server 8000`
- **ALWAYS** use `http://localhost:8000/` URLs in Playwright tests
- **DO NOT** repeatedly attempt `file://` testing when CORS errors occur
- **VERIFY** HTTP server is running with `curl -s -I http://localhost:8000/` before testing
- **USE** HTTP-based tests like `tests/server-bitmap-test.spec.js` as templates

**Important**: HTML files are in root directory (`scaled_viewer.html`, `rom_viewer.html`) with imports to `./src/` modules. This resolves path resolution issues for both direct browser access and Playwright testing.

### Playwright Capabilities for DD60

- **Character Renderer Testing**: Verify triplet arrays render correctly at multiple scales
- **Canvas Introspection**: Extract and compare pixel data from character visualizations
- **Error Monitoring**: Detect JavaScript errors, failed network requests, console warnings
- **Visual Comparisons**: Screenshot-based regression testing for rendering techniques

## Development Notes

As this project grows, future updates should include:

- Architecture documentation as the emulation components are implemented
- Specific details about DD60 console emulation implementation patterns
- Test suites for character generation and rendering validation