import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './ScreenMappingCard.module.css'

export default function ScreenMappingCard({ screen, folders, mapping, onMappingChange }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(true)
  const selectedFolder = folders.find(f => f.id === mapping.folderId)

  const TRANSITIONS = [
    { value: 'fade', label: t('transitionFade'), icon: '🌅' },
    { value: 'slide', label: t('transitionSlide'), icon: '➡' },
    { value: 'cube', label: t('transitionCube'), icon: '🎲' },
    { value: 'flip', label: t('transitionFlip'), icon: '🔄' },
    { value: 'coverflow', label: t('transitionCoverflow'), icon: '🗂' },
  ]

  const PLAYBACK_ORDERS = [
    { value: 'random', label: t('orderRandom') },
    { value: 'name', label: t('orderByName') },
    { value: 'date-desc', label: t('orderNewestFirst') },
    { value: 'date-asc', label: t('orderOldestFirst') },
  ]

  const update = (field, value) => {
    onMappingChange(screen.id, { ...mapping, [field]: value })
  }

  return (
    <div className={`${styles.card} ${mapping.folderId ? styles.configured : ''}`}>
      <div className={styles.cardHeader} onClick={() => setExpanded(e => !e)}>
        <div className={styles.screenInfo}>
          <span className={styles.screenIcon}>🖥</span>
          <div>
            <span className={styles.screenName}>{screen.label}</span>
            {screen.isPrimary && <span className={styles.badge}>Primary</span>}
          </div>
          <span className={styles.resolution}>{screen.physicalWidth ?? screen.width}×{screen.physicalHeight ?? screen.height}</span>
        </div>
        <div className={styles.headerRight}>
          {mapping.folderId ? (
            <span className={styles.statusDot} title={t('configured')} />
          ) : (
            <span className={styles.statusDotEmpty} title={t('notConfigured')} />
          )}
          <span className={styles.chevron}>{expanded ? '▾' : '▸'}</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.body}>
          {/* Folder Select */}
          <div className={styles.field}>
            <label className={styles.label}>{t('imageFolder')}</label>
            <select
              className={styles.select}
              value={mapping.folderId || ''}
              onChange={e => update('folderId', e.target.value || null)}
            >
              <option value="">{t('selectFolder')}</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name} ({t('imagesInFolder', { count: folder.imageCount })})
                </option>
              ))}
            </select>
            {folders.length === 0 && (
              <span className={styles.hint}>{t('addFolderFirst')}</span>
            )}
          </div>

          {/* Preview thumbnails */}
          {selectedFolder && (
            <div className={styles.previewStrip}>
              {selectedFolder.images.slice(0, 5).map((img, i) => (
                <img key={i} src={img.url} alt={img.name} className={styles.thumb} />
              ))}
              {selectedFolder.images.length > 5 && (
                <span className={styles.moreImages}>{t('moreImages', { count: selectedFolder.images.length - 5 })}</span>
              )}
            </div>
          )}

          {/* Duration */}
          <div className={styles.field}>
            <label className={styles.label}>
              {t('slideDuration')}
              <span className={styles.fieldValue}>{mapping.duration}s</span>
            </label>
            <input
              type="range"
              className={styles.range}
              min={1}
              max={30}
              step={1}
              value={mapping.duration}
              onChange={e => update('duration', Number(e.target.value))}
            />
            <div className={styles.rangeLabels}>
              <span>1s</span>
              <span>30s</span>
            </div>
          </div>

          {/* Playback Order */}
          <div className={styles.field}>
            <label className={styles.label}>{t('playbackOrder')}</label>
            <select
              className={styles.select}
              value={mapping.playbackOrder || 'random'}
              onChange={e => update('playbackOrder', e.target.value)}
            >
              {PLAYBACK_ORDERS.map(order => (
                <option key={order.value} value={order.value}>
                  {order.label}
                </option>
              ))}
            </select>
          </div>

          {/* Transition */}
          <div className={styles.field}>
            <label className={styles.label}>{t('transitionEffect')}</label>
            <div className={styles.transitionGrid}>
              {TRANSITIONS.map(tr => (
                <button
                  key={tr.value}
                  className={`${styles.transitionBtn} ${mapping.transition === tr.value ? styles.active : ''}`}
                  onClick={() => update('transition', tr.value)}
                >
                  <span className={styles.transitionIcon}>{tr.icon}</span>
                  <span className={styles.transitionLabel}>{tr.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
