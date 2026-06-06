import { useTranslation } from 'react-i18next'
import styles from './FolderSelector.module.css'

export default function FolderSelector({ folders, loading, error, isSupported, onPickFolder, onRemoveFolder }) {
  const { t } = useTranslation() 
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>📁</span>
          {t('imageFolders')}
        </h2>
        <button
          className={styles.addBtn}
          onClick={onPickFolder}
          disabled={loading || !isSupported}
          title={!isSupported ? t('folderNotSupported') : t('selectFolderTitle')}
        >
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            <span>{t('addFolder')}</span>
          )}
        </button>
      </div>

      {!isSupported && (
        <div className={styles.warning}>
          {t('fsApiWarning')}
        </div>
      )}

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      {folders.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🖼</div>
          <p>{t('noFoldersYet')}</p>
          <p className={styles.emptyHint} dangerouslySetInnerHTML={{ __html: t('noFoldersHint') }} />
        </div>
      ) : (
        <ul className={styles.list}>
          {folders.map(folder => (
            <li key={folder.id} className={styles.item}>
              <div className={styles.folderIcon}>📂</div>
              <div className={styles.folderInfo}>
                <span className={styles.folderName}>{folder.name}</span>
                <span className={styles.folderCount}>{t('imagesInFolder', { count: folder.imageCount })}</span>
              </div>
              {folder.images.length > 0 && (
                <div className={styles.preview}>
                  {folder.images.slice(0, 3).map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={img.name}
                      className={styles.thumb}
                    />
                  ))}
                </div>
              )}
              <button
                className={styles.removeBtn}
                onClick={() => onRemoveFolder(folder.id)}
                title={t('removeFolder')}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
