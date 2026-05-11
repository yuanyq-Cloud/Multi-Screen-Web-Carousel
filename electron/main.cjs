const { app, BrowserWindow, Menu, session, ipcMain, dialog, protocol, screen: electronScreen } = require('electron')
const path = require('path')
const fs = require('fs')

// ── JSONC helper (main process only) ───────────────────────────────────────
function stripJsoncComments(text) {
    return text.replace(/^\s*\/\/.*$/gm, '')
}

// ── Image extensions ────────────────────────────────────────────────────────
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.svg', '.avif'])

// ── Register carousel-local:// scheme BEFORE app.ready ─────────────────────
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'carousel-local',
        privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true },
    },
])

const isDev = !app.isPackaged
const preloadPath = path.join(__dirname, 'preload.cjs')

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: preloadPath,
        },
    })

    // Grant all browser permission requests (Window Management API, File System Access API, etc.)
    session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
        callback(true)
    })

    // Allow window.open() from renderer to create properly positioned BrowserWindows.
    // Electron automatically parses left/top/width/height from the features string.
    win.webContents.setWindowOpenHandler(({ url }) => {
        const isSlideshowWindow = typeof url === 'string' && url.includes('#/slideshow')
        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                autoHideMenuBar: true,
                ...(isSlideshowWindow && {
                    fullscreen: true,
                    frame: false,
                    backgroundColor: '#000000',
                }),
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    preload: preloadPath,
                },
            },
        }
    })

    if (isDev) {
        win.loadURL('http://localhost:5173')
        win.webContents.openDevTools()
        // Suppress harmless "Autofill.enable not found" DevTools CDP noise
        win.webContents.on('console-message', (_e, _level, message) => {
            if (message.includes('Autofill.enable')) return
            // let everything else through naturally
        })
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'))
    }
}

app.whenReady().then(() => {
    Menu.setApplicationMenu(null)

    // ── Custom protocol: serve local image files to the renderer ───────────
    // URL format: carousel-local://localhost/F:/path/to/file.jpg  (Windows)
    //             carousel-local://localhost/home/user/file.jpg   (Unix)
    // Using //localhost/ as a dummy authority so Chromium's standard URL parser
    // never mistakes the Windows drive letter (F:) for the host/port.
    const IMAGE_MIME = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp',
        '.tiff': 'image/tiff',
        '.tif': 'image/tiff',
        '.svg': 'image/svg+xml',
        '.avif': 'image/avif',
    }
    protocol.handle('carousel-local', async (request) => {
        try {
            // new URL() works here: 'carousel-local://localhost/F:/...' → pathname '/F:/...'
            const url = new URL(request.url)
            let filePath = decodeURIComponent(url.pathname)
            // Windows: pathname = '/F:/other/...' → strip leading slash
            if (process.platform === 'win32' && /^\/[A-Za-z]:\//.test(filePath)) {
                filePath = filePath.slice(1)
            }
            const data = await fs.promises.readFile(filePath)
            const ext = path.extname(filePath).toLowerCase()
            return new Response(data, {
                headers: {
                    'Content-Type': IMAGE_MIME[ext] || 'application/octet-stream',
                    'Access-Control-Allow-Origin': '*',
                },
            })
        } catch (err) {
            return new Response(`Not found: ${err.message}`, { status: 404 })
        }
    })

    // ── Config IPC ─────────────────────────────────────────────────────────
    const configPath = path.join(app.getPath('userData'), 'config.jsonc')

    ipcMain.handle('config:read', async () => {
        try {
            const text = await fs.promises.readFile(configPath, 'utf-8')
            return JSON.parse(stripJsoncComments(text))
        } catch {
            return null
        }
    })

    ipcMain.handle('config:write', async (_event, data) => {
        const header = '// Multi-Screen Web Carousel \u2014 Configuration\n' + '// Auto-generated. You can edit this file manually.\n' + '// Supported comments: // line comments (JSONC format).\n' + '//\n' + '// folders[].id            \u2014 unique folder identifier\n' + '// folders[].name          \u2014 display name\n' + '// folders[].path          \u2014 absolute path to the image directory\n' + '// mappings.<id>.folderId      \u2014 which folder to play on that screen\n' + '// mappings.<id>.duration      \u2014 slide duration in seconds\n' + '// mappings.<id>.transition    \u2014 fade | slide | cube | flip | coverflow\n' + '// mappings.<id>.playbackOrder \u2014 random | name | date-desc | date-asc\n\n'
        await fs.promises.writeFile(configPath, header + JSON.stringify(data, null, 2) + '\n', 'utf-8')
    })

    // ── Folder IPC ─────────────────────────────────────────────────────────
    ipcMain.handle('folder:show-picker', async () => {
        const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
        if (result.canceled || result.filePaths.length === 0) return null
        const folderPath = result.filePaths[0]
        return { path: folderPath, name: path.basename(folderPath) }
    })

    ipcMain.handle('folder:read-images', async (_event, folderPath) => {
        try {
            const entries = await fs.promises.readdir(folderPath, { withFileTypes: true })
            const images = []
            for (const entry of entries) {
                if (!entry.isFile()) continue
                const ext = path.extname(entry.name).toLowerCase()
                if (!IMAGE_EXTS.has(ext)) continue
                const filePath = path.join(folderPath, entry.name)
                const stat = await fs.promises.stat(filePath)
                // Build carousel-local://localhost/<path> URL.
                // Using //localhost/ avoids Chromium parsing 'F:' as URL authority.
                // Windows: 'F:\\path\\img.jpg' → '/F:/path/img.jpg'
                // Unix:    '/home/user/img.jpg' → '/home/user/img.jpg'
                const normalized = filePath.replace(/\\/g, '/')
                const urlPath = normalized.startsWith('/') ? normalized : '/' + normalized
                const url = `carousel-local://localhost${encodeURI(urlPath)}`
                images.push({ name: entry.name, url, size: stat.size, modifiedTime: stat.mtimeMs })
            }
            images.sort((a, b) => a.name.localeCompare(b.name))
            return images
        } catch (err) {
            console.error('folder:read-images error:', err)
            return []
        }
    })

    // ── Screen IPC ─────────────────────────────────────────────────────────
    ipcMain.handle('screen:get-displays', () => {
        return electronScreen.getAllDisplays().map((d) => ({
            x: d.bounds.x,
            y: d.bounds.y,
            physicalWidth: Math.round(d.bounds.width * d.scaleFactor),
            physicalHeight: Math.round(d.bounds.height * d.scaleFactor),
        }))
    })

    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
