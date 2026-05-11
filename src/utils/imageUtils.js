const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml', 'image/avif'])

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.svg', '.avif'])

function isImageFile(name, type) {
    if (type && IMAGE_MIME_TYPES.has(type)) return true
    const ext = name.substring(name.lastIndexOf('.')).toLowerCase()
    return IMAGE_EXTENSIONS.has(ext)
}

/**
 * Read all image files from a FileSystemDirectoryHandle.
 * Returns array of { name, url (object URL), file }.
 */
export async function readImagesFromDirectory(dirHandle) {
    const images = []
    for await (const [name, handle] of dirHandle) {
        if (handle.kind === 'file') {
            const file = await handle.getFile()
            if (isImageFile(name, file.type)) {
                const url = URL.createObjectURL(file)
                images.push({ name, url, size: file.size, modifiedTime: file.lastModified })
            }
        }
    }
    // Sort alphabetically by name
    images.sort((a, b) => a.name.localeCompare(b.name))
    return images
}

/**
 * Revoke all object URLs in an images array to free memory.
 */
export function revokeImageUrls(images) {
    images.forEach((img) => {
        if (img.url && img.url.startsWith('blob:')) {
            URL.revokeObjectURL(img.url)
        }
    })
}

/**
 * Create a playback-ordered copy of an image list.
 * @param {Array<{name?:string, modifiedTime?:number}>} images
 * @param {'random'|'name'|'date'|'date-asc'|'date-desc'} order
 */
export function getPlaybackImages(images, order = 'random') {
    const list = Array.isArray(images) ? [...images] : []
    if (list.length <= 1) return list

    if (order === 'name') {
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        return list
    }

    if (order === 'date' || order === 'date-asc' || order === 'date-desc') {
        list.sort((a, b) => {
            const timeA = Number(a.modifiedTime) || 0
            const timeB = Number(b.modifiedTime) || 0
            if (timeA !== timeB) return order === 'date-desc' ? timeB - timeA : timeA - timeB
            return (a.name || '').localeCompare(b.name || '')
        })
        return list
    }

    for (let i = list.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[list[i], list[j]] = [list[j], list[i]]
    }
    return list
}
