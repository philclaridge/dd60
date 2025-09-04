// Character selector UI functions
// Extracted from inline JavaScript in HTML files

import { generateTripletRom } from '../chargenTriplets.js';

/**
 * Initialize character selector with buttons
 * @param {string} selectorId - ID of container element
 * @param {Object} options - Configuration options
 * @param {string} options.defaultChar - Initially selected character
 * @param {string} options.charOrder - Order of characters to display
 * @param {Function} options.onSelect - Callback when character is selected
 * @returns {string} The selected character
 */
export function initializeCharacterSelector(selectorId, options = {}) {
    const {
        defaultChar = 'A',
        charOrder = '0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ+-*/()=,.',
        onSelect = () => {}
    } = options;
    
    const selector = document.getElementById(selectorId);
    if (!selector) {
        console.warn(`Character selector element '${selectorId}' not found`);
        return defaultChar;
    }
    
    const tripletRom = generateTripletRom();
    
    // Clear existing buttons
    selector.innerHTML = '';
    
    for (const char of charOrder) {
        if (tripletRom[char]) {
            const button = document.createElement('button');
            button.className = 'character-button';
            button.textContent = char === ' ' ? '␣' : char;
            button.dataset.char = char;
            button.onclick = () => {
                selectCharacter(char, onSelect);
            };
            
            if (char === defaultChar) {
                button.classList.add('selected');
            }
            
            selector.appendChild(button);
        }
    }
    
    return defaultChar;
}

/**
 * Select a character and update UI
 * @param {string} char - Character to select
 * @param {Function} onSelect - Callback function to call after selection
 */
export function selectCharacter(char, onSelect = () => {}) {
    // Update button states
    document.querySelectorAll('.character-button').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.char === char);
    });
    
    // Call callback with selected character
    onSelect(char);
}

/**
 * Get currently selected character
 * @returns {string} Currently selected character or null if none
 */
export function getSelectedCharacter() {
    const selectedBtn = document.querySelector('.character-button.selected');
    return selectedBtn ? selectedBtn.dataset.char : null;
}