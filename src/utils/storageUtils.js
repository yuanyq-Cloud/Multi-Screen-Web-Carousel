/**
 * Store slideshow configurations for cross-window access.
 *
 * Browser: child windows share window.opener with the parent.
 * Electron: each BrowserWindow is a separate renderer process so
 *   window.opener is null — localStorage (shared across all windows
 *   of the same origin) is used as the fallback channel instead.
 */

const STORAGE_KEY = '__slideshowData'
const LS_KEY = 'mswc_slideshowData'

/**
 * Save all screen configurations for child window access.
 * @param {Array} mappings - Array of {screenId, images, duration, transition, playbackOrder}
 */
export function saveSlideshowData(mappings) {
    window[STORAGE_KEY] = {}
    mappings.forEach((m) => {
        window[STORAGE_KEY][m.screenId] = {
            images: m.images,
            duration: m.duration,
            transition: m.transition,
            playbackOrder: m.playbackOrder,
            folderName: m.folderName,
            folderPath: m.folderPath,
        }
    })
    // Persist to localStorage so Electron child windows (separate renderer
    // processes where window.opener === null) can still read the data.
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(window[STORAGE_KEY]))
    } catch {
        /* storage unavailable – fall back to window.opener only */
    }
}

/**
 * Get slideshow config for a specific screen from the parent window.
 * Called from child (slideshow) windows.
 * @param {string} screenId
 */
export function getSlideshowData(screenId) {
    // 1. Own window (same-context fallback or dashboard preview)
    if (window[STORAGE_KEY]?.[screenId]) {
        return window[STORAGE_KEY][screenId]
    }
    // 2. Parent window via window.opener (browser environment)
    if (window.opener?.[STORAGE_KEY]?.[screenId]) {
        return window.opener[STORAGE_KEY][screenId]
    }
    // 3. localStorage (Electron: window.opener is null between BrowserWindows)
    try {
        const stored = localStorage.getItem(LS_KEY)
        if (stored) {
            const data = JSON.parse(stored)
            if (data?.[screenId]) return data[screenId]
        }
    } catch {
        /* ignore parse errors */
    }
    return null
}
