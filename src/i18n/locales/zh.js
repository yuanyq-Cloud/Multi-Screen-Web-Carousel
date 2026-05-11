export default {
    translation: {
        // App Header
        appTitle: '多屏网页轮播',
        appSubtitle: '跨多显示器同步幻灯片',

        // API Status
        fileSystemApi: '文件系统 API',
        windowManagementApi: '窗口管理 API',

        // Language Switcher
        langZh: '中文',
        langEn: 'English',

        // FolderSelector
        imageFolders: '图片文件夹',
        addFolder: '+ 添加文件夹',
        folderNotSupported: '文件系统访问 API 不支持',
        selectFolderTitle: '选择文件夹',
        fsApiWarning: '⚠ 文件系统访问 API 需要 Chrome/Edge 86+ 以及 HTTPS 或 localhost 环境。',
        noFoldersYet: '暂无文件夹。',
        noFoldersHint: '点击 <strong>+ 添加文件夹</strong> 选择本地图片文件夹。',
        imageCount_one: '{{count}} 张图片',
        imageCount_other: '{{count}} 张图片',
        removeFolder: '移除文件夹',

        // useFolderPicker errors
        noImagesInFolder: '在文件夹"{{name}}"中未找到图片文件。',
        folderReadError: '读取文件夹失败：{{message}}',

        // ScreenDetector
        connectedDisplays: '已连接显示器',
        refresh: '↺ 刷新',
        detectScreens: '检测显示器',
        wmApiWarning: '⚠ 窗口管理 API 需要 Chrome/Edge 100+ 以及 HTTPS 或 localhost 环境。将回退到单屏模式。',
        noScreensYet: '暂未检测到显示器。',
        noScreensHint: '点击 <strong>检测显示器</strong> 以发现您连接的显示器。',
        primary: '主屏',
        resolution: '分辨率',
        position: '位置',
        dpr: 'DPR',

        // useScreenDetection errors/labels
        wmPermissionDenied: '窗口管理权限被拒绝，将使用当前屏幕。',
        screenDetectionFailed: '屏幕检测失败：{{message}}',
        primaryDisplayFallback: '主显示器（回退模式）',
        primaryDisplay: '主显示器',
        displayLabel: '显示器 {{number}}',

        // ScreenMappingCard
        imageFolder: '图片文件夹',
        selectFolder: '— 选择文件夹 —',
        addFolderFirst: '请先在上方面板添加文件夹。',
        slideDuration: '切换间隔',
        playbackOrder: '播放顺序',
        transitionEffect: '过渡效果',
        configured: '已配置',
        notConfigured: '未配置',
        imagesInFolder: '{{count}} 张图片',
        moreImages: '+{{count}} 张',

        // Playback order labels
        orderRandom: '随机',
        orderByName: '按名称排序',
        orderNewestFirst: '最新优先',
        orderOldestFirst: '最旧优先',

        // Transition labels
        transitionFade: '淡入淡出',
        transitionSlide: '滑动',
        transitionCube: '立方体',
        transitionFlip: '翻转',
        transitionCoverflow: '封面流',

        // Dashboard main
        screenMapping: '屏幕映射',
        screensConfigured: '{{configured}}/{{total}} 个屏幕已配置',
        noScreensDetected: '未检测到屏幕',
        noScreensDetectedHint: '点击左侧面板中的 <strong>检测显示器</strong> 以发现已连接的显示器。',
        livePreview: '实时预览',
        noFolderAssigned: '该屏幕未分配文件夹',
        readyToLaunch: '✓ 准备启动 {{count}} 个幻灯片',
        configureFirst: '请至少配置一个屏幕映射后再启动',
        launchSlideshows: '🚀 启动幻灯片',
        noMappingError: '未配置任何文件夹到屏幕。请至少映射一个文件夹到屏幕。',
        popupBlockedError: '"{{label}}" 的窗口无法打开，请检查弹出窗口拦截设置。',

        // Slideshow page
        invalidUrl: '无效的幻灯片 URL',
        invalidUrlHint: '未提供屏幕 ID，请从控制台打开此幻灯片。',
        loadingSlideshow: '正在加载幻灯片…',
        waitingData: '等待来自控制台的图片数据',
        enterFullscreen: '⛶ 进入全屏',
        imagesCount: '{{count}} 张图片',

        // SlideshowCarousel
        noImages: '没有可显示的图片。',
    },
}
