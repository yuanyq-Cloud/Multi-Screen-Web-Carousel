import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SlideshowCarousel from '../components/SlideshowCarousel'
import { getSlideshowData } from '../utils/storageUtils'
import { getPlaybackImages } from '../utils/imageUtils'
import styles from './Slideshow.module.css'

export default function Slideshow() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const screenId = searchParams.get('screen')
  const [data, setData] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const imageSignatureRef = useRef('')

  // Try to get data from opener (parent window) or own window
  useEffect(() => {
    if (!screenId) return

    // Retry a few times since the parent may take a moment to set data
    let attempts = 0
    const maxAttempts = 20
    let timerId = null

    const tryLoad = () => {
      const slideshowData = getSlideshowData(screenId)
      if (slideshowData) {
        setData(slideshowData)
        return
      }
      attempts++
      if (attempts < maxAttempts) {
        timerId = setTimeout(tryLoad, 200)
      }
    }

    tryLoad()
    return () => clearTimeout(timerId)
  }, [screenId])

  // Auto-hide overlay after 3s
  useEffect(() => {
    if (!data) return
    const timer = setTimeout(() => setShowOverlay(false), 3000)
    return () => clearTimeout(timer)
  }, [data])

  // Electron: watch folder changes (add/remove/rename) and refresh slideshow images.
  useEffect(() => {
    if (!screenId || !data?.folderPath || !window.electronAPI?.folder) return

    let cancelled = false
    let refreshTimer = null
    let pollTimer = null

    const buildSignature = (images) => images
      .map((img) => `${img.name}|${Number(img.modifiedTime) || 0}|${Number(img.size) || 0}`)
      .join('||')

    const refreshImages = async () => {
      try {
        const latest = await window.electronAPI.folder.readImages(data.folderPath)
        if (cancelled) return
        const nextSignature = buildSignature(latest)
        if (nextSignature === imageSignatureRef.current) return
        imageSignatureRef.current = nextSignature
        setData(prev => {
          if (!prev) return prev
          return {
            ...prev,
            images: getPlaybackImages(latest, prev.playbackOrder),
          }
        })
      } catch {
        // Ignore transient read errors while files are being moved or renamed.
      }
    }

    const unsubscribe = window.electronAPI.folder.onChanged((payload) => {
      if (!payload || payload.screenId !== screenId) return
      if (refreshTimer) clearTimeout(refreshTimer)
      refreshTimer = setTimeout(refreshImages, 120)
    })

    window.electronAPI.folder.watch(screenId, data.folderPath)
    refreshImages()
    pollTimer = setInterval(refreshImages, 2500)

    return () => {
      cancelled = true
      if (refreshTimer) clearTimeout(refreshTimer)
      if (pollTimer) clearInterval(pollTimer)
      unsubscribe?.()
      window.electronAPI.folder.unwatch(screenId)
    }
  }, [data?.folderPath, screenId])

  // Request fullscreen
  const requestFullscreen = useCallback(() => {
    const el = document.documentElement
    if (el.requestFullscreen) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen()
      setIsFullscreen(true)
    }
  }, [])

  useEffect(() => {
    if (data) {
      // Small delay to let the page render first
      const timer = setTimeout(requestFullscreen, 300)
      return () => clearTimeout(timer)
    }
  }, [data, requestFullscreen])

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // Close window on Escape (when not fullscreen)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        window.close()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!screenId) {
    return (
      <div className={styles.error}>
        <h2>{t('invalidUrl')}</h2>
        <p>{t('invalidUrlHint')}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>{t('loadingSlideshow')}</p>
        <p className={styles.loadingHint}>{t('waitingData')}</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <SlideshowCarousel
        images={data.images}
        duration={data.duration}
        transition={data.transition}
        showControls={false}
      />

      {/* HUD overlay */}
      {showOverlay && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <div className={styles.overlayTitle}>🎠 {data.folderName}</div>
            <div className={styles.overlayMeta}>
              {t('imagesCount', { count: data.images.length })} · {data.duration}s · {data.transition}
            </div>
            {!isFullscreen && (
              <button className={styles.fsBtn} onClick={requestFullscreen}>
                {t('enterFullscreen')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Subtle controls bar on hover */}
      <div className={styles.controlBar}>
        {!isFullscreen && (
          <button className={styles.controlBtn} onClick={requestFullscreen} title={t('enterFullscreen')}>
            {t('enterFullscreen')}
          </button>
        )}
        <button className={styles.controlBtn} onClick={() => window.close()} title="Close window">
          ✕
        </button>
      </div>
    </div>
  )
}
