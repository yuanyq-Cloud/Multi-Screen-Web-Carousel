/**
 * Config persistence utilities — JSONC format via Electron IPC.
 * In a plain browser (no window.electronAPI) all functions are no-ops.
 */

/**
 * Load the saved config from config.jsonc via Electron IPC.
 * Returns the parsed object or null when unavailable.
 * @returns {Promise<{version:number, folders:Array, mappings:object}|null>}
 */
export async function loadConfig() {
    if (!window.electronAPI) return null
    try {
        return await window.electronAPI.config.read()
    } catch {
        return null
    }
}

/**
 * Persist folders and mappings to config.jsonc.
 * Only folders that have a .path property (Electron-picked) are saved.
 *
 * @param {Array<{id:string, name:string, path?:string}>} folders
 * @param {object} mappings  { [screenId]: { folderId, duration, transition, playbackOrder } }
 */
export async function saveConfig(folders, mappings) {
    if (!window.electronAPI) return
    const data = {
        version: 1,
        folders: folders.filter((f) => f.path).map((f) => ({ id: f.id, name: f.name, path: f.path })),
        mappings,
    }
    await window.electronAPI.config.write(data)
}
