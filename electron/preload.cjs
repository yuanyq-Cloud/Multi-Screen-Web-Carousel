'use strict'

const { contextBridge, ipcRenderer } = require('electron')

/**
 * Expose safe Electron APIs to the renderer via window.electronAPI.
 * Only whitelisted IPC channels are exposed.
 */
contextBridge.exposeInMainWorld('electronAPI', {
    config: {
        /** Read (and parse) config.jsonc; resolves to object or null */
        read: () => ipcRenderer.invoke('config:read'),
        /** Write config object to config.jsonc */
        write: (data) => ipcRenderer.invoke('config:write', data),
    },
    folder: {
        /** Open native folder picker; resolves to { path, name } or null if cancelled */
        showPicker: () => ipcRenderer.invoke('folder:show-picker'),
        /**
         * Read image files from a folder path.
         * Resolves to [{ name, url, size }] where url is a carousel-local:// URL.
         */
        readImages: (folderPath) => ipcRenderer.invoke('folder:read-images', folderPath),
        /** Start watching a folder path and emit change notifications for a screen */
        watch: (screenId, folderPath) => ipcRenderer.invoke('folder:watch', screenId, folderPath),
        /** Stop watching a folder for a specific screen */
        unwatch: (screenId) => ipcRenderer.invoke('folder:unwatch', screenId),
        /** Subscribe to watched folder updates; returns unsubscribe callback */
        onChanged: (handler) => {
            const wrapped = (_event, payload) => handler(payload)
            ipcRenderer.on('folder:changed', wrapped)
            return () => ipcRenderer.removeListener('folder:changed', wrapped)
        },
    },
    screen: {
        /** Get physical display dimensions from Electron's screen module.
         *  Resolves to [{ x, y, physicalWidth, physicalHeight }] */
        getDisplays: () => ipcRenderer.invoke('screen:get-displays'),
    },
})
