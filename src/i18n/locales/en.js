export default {
    translation: {
        // App Header
        appTitle: 'Multi-Screen Web Carousel',
        appSubtitle: 'Synchronized slideshow across multiple displays',

        // API Status
        fileSystemApi: 'File System API',
        windowManagementApi: 'Window Management API',

        // Language Switcher
        langZh: '中文',
        langEn: 'English',

        // FolderSelector
        imageFolders: 'Image Folders',
        addFolder: '+ Add Folder',
        folderNotSupported: 'File System Access API not supported',
        selectFolderTitle: 'Select a folder',
        fsApiWarning: '⚠ File System Access API requires Chrome/Edge 86+ with HTTPS or localhost.',
        noFoldersYet: 'No folders added yet.',
        noFoldersHint: 'Click <strong>+ Add Folder</strong> to select a local image folder.',
        imageCount_one: '{{count}} image',
        imageCount_other: '{{count}} images',
        removeFolder: 'Remove folder',

        // useFolderPicker errors
        noImagesInFolder: 'No image files found in "{{name}}".',
        folderReadError: 'Failed to read folder: {{message}}',

        // ScreenDetector
        connectedDisplays: 'Connected Displays',
        refresh: '↺ Refresh',
        detectScreens: 'Detect Screens',
        wmApiWarning: '⚠ Window Management API requires Chrome/Edge 100+ with HTTPS or localhost. Falling back to single-screen mode.',
        noScreensYet: 'No screens detected yet.',
        noScreensHint: 'Click <strong>Detect Screens</strong> to discover your monitors.',
        primary: 'Primary',
        resolution: 'Resolution',
        position: 'Position',
        dpr: 'DPR',

        // useScreenDetection errors/labels
        wmPermissionDenied: 'Window Management permission denied. Using current screen only.',
        screenDetectionFailed: 'Screen detection failed: {{message}}',
        primaryDisplayFallback: 'Primary Display (fallback)',
        primaryDisplay: 'Primary Display',
        displayLabel: 'Display {{number}}',

        // ScreenMappingCard
        imageFolder: 'Image Folder',
        selectFolder: '— Select a folder —',
        addFolderFirst: 'Add folders in the panel above first.',
        slideDuration: 'Slide Duration',
        playbackOrder: 'Playback Order',
        transitionEffect: 'Transition Effect',
        configured: 'Configured',
        notConfigured: 'Not configured',
        imagesInFolder: '{{count}} images',
        moreImages: '+{{count}} more',

        // Playback order labels
        orderRandom: 'Random',
        orderByName: 'By Name',
        orderNewestFirst: 'Newest First',
        orderOldestFirst: 'Oldest First',

        // Transition labels
        transitionFade: 'Fade',
        transitionSlide: 'Slide',
        transitionCube: 'Cube',
        transitionFlip: 'Flip',
        transitionCoverflow: 'Coverflow',

        // Dashboard main
        screenMapping: 'Screen Mapping',
        screensConfigured: '{{configured}} of {{total}} screen{{plural}} configured',
        noScreensDetected: 'No screens detected',
        noScreensDetectedHint: 'Click <strong>Detect Screens</strong> in the left panel to discover your connected monitors.',
        livePreview: 'Live Preview',
        noFolderAssigned: 'No folder assigned to this screen',
        readyToLaunch: '✓ Ready to launch {{count}} slideshow{{plural}}',
        configureFirst: 'Configure at least one screen mapping to launch',
        launchSlideshows: '🚀 Launch Slideshows',
        noMappingError: 'No screens are configured with a folder. Please map at least one folder to a screen.',
        popupBlockedError: 'Could not open window for "{{label}}". Check popup blocker settings.',

        // Slideshow page
        invalidUrl: 'Invalid Slideshow URL',
        invalidUrlHint: 'No screen ID provided. Open this slideshow from the dashboard.',
        loadingSlideshow: 'Loading slideshow…',
        waitingData: 'Waiting for image data from dashboard',
        enterFullscreen: '⛶ Enter Fullscreen',
        imagesCount: '{{count}} images',

        // SlideshowCarousel
        noImages: 'No images to display.',
    },
}
