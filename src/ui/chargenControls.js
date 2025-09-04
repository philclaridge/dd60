// Rendering controls UI functions
// Extracted from inline JavaScript in HTML files

/**
 * Get current rendering options from control checkboxes
 * @returns {Object} Current rendering options
 */
export function getRenderingOptions() {
    return {
        showBeamOff: document.getElementById('showBeamOff')?.checked || false,
        showArrowheads: document.getElementById('showArrowheads')?.checked || false,
        showDwellPoints: document.getElementById('showDwellPoints')?.checked || false,
        showGrid: document.getElementById('showGrid')?.checked || false
    };
}

/**
 * Set rendering options in control checkboxes
 * @param {Object} options - Options to set
 * @param {boolean} options.showBeamOff - Show beam-off movements
 * @param {boolean} options.showArrowheads - Show direction arrows
 * @param {boolean} options.showDwellPoints - Show dwell points
 * @param {boolean} options.showGrid - Show grid
 */
export function setRenderingOptions(options) {
    if (options.showBeamOff !== undefined) {
        const checkbox = document.getElementById('showBeamOff');
        if (checkbox) checkbox.checked = options.showBeamOff;
    }
    
    if (options.showArrowheads !== undefined) {
        const checkbox = document.getElementById('showArrowheads');
        if (checkbox) checkbox.checked = options.showArrowheads;
    }
    
    if (options.showDwellPoints !== undefined) {
        const checkbox = document.getElementById('showDwellPoints');
        if (checkbox) checkbox.checked = options.showDwellPoints;
    }
    
    if (options.showGrid !== undefined) {
        const checkbox = document.getElementById('showGrid');
        if (checkbox) checkbox.checked = options.showGrid;
    }
}

/**
 * Initialize rendering controls with change listeners
 * @param {Function} onChange - Callback when any option changes
 */
export function initializeRenderingControls(onChange = () => {}) {
    const controlIds = ['showBeamOff', 'showArrowheads', 'showDwellPoints', 'showGrid'];
    
    controlIds.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                const options = getRenderingOptions();
                onChange(options);
            });
        }
    });
}