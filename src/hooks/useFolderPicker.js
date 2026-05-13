import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { readImagesFromDirectory, revokeImageUrls } from '../utils/imageUtils'

const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI)

/**
 * Hook for selecting image folders.
 * In Electron, uses native dialog + IPC to get the full folder path.
 * In a plain browser, falls back to the File System Access API.
 */
export function useFolderPicker() {
    const { t } = useTranslation()
    const [folders, setFolders] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const folderSignaturesRef = useRef({})

    const isSupported = isElectron || (typeof window !== 'undefined' && 'showDirectoryPicker' in window)

    const buildImageSignature = useCallback((images) => {
        return images.map((img) => `${img.name}|${Number(img.modifiedTime) || 0}|${Number(img.size) || 0}`).join('||')
    }, [])

    const pickFolder = useCallback(async () => {
        if (!isSupported) {
            setError('File System Access API is not supported in this browser.')
            return
        }
        setError(null)
        setLoading(true)
        try {
            if (isElectron) {
                // ── Electron path ──────────────────────────────────────────────────
                const picked = await window.electronAPI.folder.showPicker()
                if (!picked) {
                    setLoading(false)
                    return
                } // user cancelled

                const images = await window.electronAPI.folder.readImages(picked.path)
                if (images.length === 0) {
                    setError(t('noImagesInFolder', { name: picked.name }))
                    setLoading(false)
                    return
                }
                const newFolder = {
                    id: `folder-${Date.now()}`,
                    name: picked.name,
                    path: picked.path,
                    images,
                    imageCount: images.length,
                }
                folderSignaturesRef.current[newFolder.id] = buildImageSignature(images)
                setFolders((prev) => [...prev, newFolder])
            } else {
                // ── Browser path ───────────────────────────────────────────────────
                const dirHandle = await window.showDirectoryPicker({ mode: 'read' })
                const images = await readImagesFromDirectory(dirHandle)
                if (images.length === 0) {
                    setError(t('noImagesInFolder', { name: dirHandle.name }))
                    setLoading(false)
                    return
                }
                const newFolder = {
                    id: `folder-${Date.now()}`,
                    name: dirHandle.name,
                    handle: dirHandle,
                    images,
                    imageCount: images.length,
                }
                folderSignaturesRef.current[newFolder.id] = buildImageSignature(images)
                setFolders((prev) => [...prev, newFolder])
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(t('folderReadError', { message: err.message }))
            }
        } finally {
            setLoading(false)
        }
    }, [isSupported, t])

    const removeFolder = useCallback((folderId) => {
        setFolders((prev) => {
            const folder = prev.find((f) => f.id === folderId)
            if (folder) revokeImageUrls(folder.images)
            return prev.filter((f) => f.id !== folderId)
        })
        delete folderSignaturesRef.current[folderId]
    }, [])

    /**
     * Restore previously-saved folders from config (Electron only).
     * @param {Array<{id, name, path, images, imageCount}>} savedFolders
     */
    const restoreFolders = useCallback(
        (savedFolders) => {
            const nextSignatures = {}
            savedFolders.forEach((folder) => {
                nextSignatures[folder.id] = buildImageSignature(folder.images || [])
            })
            folderSignaturesRef.current = nextSignatures
            setFolders(savedFolders)
        },
        [buildImageSignature],
    )

    useEffect(() => {
        if (!isElectron || !window.electronAPI?.folder) return

        const refreshFolder = async (folderId) => {
            const folder = folders.find((f) => f.id === folderId)
            if (!folder?.path) return

            try {
                const latest = await window.electronAPI.folder.readImages(folder.path)
                const nextSignature = buildImageSignature(latest)
                if (nextSignature === folderSignaturesRef.current[folderId]) return

                setFolders((prev) =>
                    prev.map((item) => {
                        if (item.id !== folderId) return item
                        return {
                            ...item,
                            images: latest,
                            imageCount: latest.length,
                        }
                    }),
                )
                folderSignaturesRef.current[folderId] = nextSignature
            } catch {
                // Ignore transient read errors during file operations.
            }
        }

        const unsubscribe = window.electronAPI.folder.onChanged((payload) => {
            if (!payload?.screenId) return
            const folderExists = folders.some((f) => f.id === payload.screenId)
            if (!folderExists) return
            refreshFolder(payload.screenId)
        })

        folders.forEach((folder) => {
            if (folder.path) {
                window.electronAPI.folder.watch(folder.id, folder.path)
            }
        })

        const pollTimer = setInterval(() => {
            folders.forEach((folder) => {
                refreshFolder(folder.id)
            })
        }, 3000)

        return () => {
            clearInterval(pollTimer)
            unsubscribe?.()
            folders.forEach((folder) => {
                window.electronAPI.folder.unwatch(folder.id)
            })
        }
    }, [folders, buildImageSignature])

    return { folders, loading, error, isSupported, pickFolder, removeFolder, restoreFolders }
}
