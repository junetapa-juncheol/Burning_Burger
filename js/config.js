/**
 * Application Configuration
 * 애플리케이션 전역 설정
 */

const CONFIG = {
    // 기본 설정
    app: {
        name: 'junetapa - Creative Developer Portal',
        version: '1.0.0',
        description: '크리에이티브 개발자 포털 - 웹 개발, 음악 작곡, 창작 활동을 소개합니다',
        author: 'junetapa',
        url: 'https://junetapa.info'
    },

    // API 설정
    api: {
        baseUrl: 'https://api.junetapa.info',
        timeout: 10000,
        retries: 3
    },

    // 음악 플레이어 설정
    musicPlayer: {
        autoplay: false,
        loop: false,
        shuffle: false,
        volume: 0.7,
        fadeIn: 500,
        fadeOut: 500,
        equalizer: {
            enabled: true,
            bars: 4,
            animationSpeed: 1200
        }
    },

    // 애니메이션 설정
    animations: {
        enabled: true,
        duration: {
            fast: 150,
            normal: 300,
            slow: 500
        },
        easing: {
            ease: 'ease-in-out',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        },
        scroll: {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        }
    },

    // 검색 설정
    search: {
        debounce: 300,
        minLength: 2,
        maxResults: 10,
        highlight: true
    },

    // 테마 설정
    theme: {
        default: 'light',
        options: ['light', 'dark', 'auto'],
        transition: 300
    },

    // 언어 설정
    language: {
        default: 'ko',
        options: [
            { code: 'ko', name: '한국어', flag: '🇰🇷' },
            { code: 'en', name: 'English', flag: '🇺🇸' }
        ]
    },

    // 소셜 미디어 링크
    social: {
        github: 'https://github.com/junetapa',
        linkedin: 'https://linkedin.com/in/junetapa',
        youtube: 'https://youtube.com/@junetapa',
        instagram: 'https://instagram.com/junetapa',
        twitter: 'https://twitter.com/junetapa',
        spotify: 'https://open.spotify.com/artist/junetapa'
    },

    // 연락처 정보
    contact: {
        email: 'jun22sky@nate.com',
        phone: '+82-10-1234-5678',
        address: '인천광역시 부평구',
        businessHours: '월-금 9:00-18:00'
    },

    // 프로젝트 통계
    stats: {
        completedProjects: 42,
        yearsOfExperience: 5,
        technologies: 15,
        clients: 25
    },

    // 음악 트랙 정보
    tracks: [
        {
            id: 1,
            title: '폭염 속 불꽃',
            artist: '만수동 고양이',
            album: '여름 이야기',
            duration: 200,
            src: './assets/audio/3. 폭염 속 불꽃.mp3',
            cover: './assets/images/al.png',
            genre: 'Instrumental',
            year: 2024
        }
    ],

    // 프로젝트 데이터
    projects: [
        {
            id: 1,
            title: 'E-Commerce Platform',
            description: 'React + Node.js 기반 쇼핑몰',
            category: 'web',
            status: 'active',
            progress: 75,
            technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
            image: './assets/images/profile.jpg',
            url: 'https://project1.com',
            github: 'https://github.com/junetapa/project1'
        },
        {
            id: 2,
            title: 'Music Streaming App',
            description: '개인 음악 스트리밍 서비스',
            category: 'mobile',
            status: 'planning',
            progress: 25,
            technologies: ['React Native', 'Firebase', 'Spotify API'],
            image: './assets/images/profile.jpg',
            url: null,
            github: 'https://github.com/junetapa/project2'
        }
    ],

    // 블로그 포스트
    blogPosts: [
        {
            id: 1,
            title: 'React Hooks 완벽 가이드',
            excerpt: 'useState, useEffect부터 커스텀 훅까지...',
            category: 'frontend',
            tags: ['React', 'JavaScript', 'Hooks'],
            author: 'junetapa',
            date: '2024-03-14',
            readTime: 5,
            image: './assets/images/blog/react-hooks.jpg',
            url: '/blog/react-hooks-guide'
        }
    ],

    // 튜토리얼
    tutorials: [
        {
            id: 1,
            title: 'JavaScript 기초부터 심화까지',
            description: 'JavaScript의 핵심 개념들을 단계별로 학습',
            category: 'programming',
            level: 'beginner',
            duration: 45,
            image: './assets/images/tutorials/js-basics.jpg',
            url: '/tutorials/javascript-basics'
        }
    ],

    // 공지사항
    announcements: [
        {
            id: 1,
            title: '🚀 신규 웹 플랫폼 런칭 및 협업 파트너 모집 안내',
            summary: '혁신적인 웹 플랫폼 개발을 위한 팀원을 모집합니다. React 기반의 최신 기술 스택을 활용한...',
            category: 'development',
            priority: 'high',
            date: '2024-03-15',
            views: 1247,
            url: '/announcements/new-platform-launch'
        },
        {
            id: 2,
            title: '개인 포트폴리오 사이트 리뉴얼 완료 안내',
            summary: '',
            category: 'update',
            priority: 'normal',
            date: '2024-03-12',
            views: 856,
            url: '/announcements/portfolio-renewal'
        }
    ],

    // 카테고리 정보
    categories: {
        web: {
            name: '웹 개발',
            icon: 'fas fa-code',
            color: '#3b82f6',
            description: '프론트엔드, 백엔드, 풀스택 웹 개발 프로젝트'
        },
        music: {
            name: '음악 제작',
            icon: 'fas fa-music',
            color: '#8b5cf6',
            description: '곡 작곡, 편곡, 믹싱 및 음악 제작 작업'
        },
        design: {
            name: '디자인',
            icon: 'fas fa-palette',
            color: '#f59e0b',
            description: 'UI/UX 디자인, 그래픽 디자인, 브랜딩'
        }
    },

    // 검색 제안어
    searchSuggestions: [
        'React', 'JavaScript', '음악작곡', '웹디자인',
        'Node.js', 'TypeScript', 'UI/UX', '포트폴리오',
        '프론트엔드', '백엔드', '모바일앱', '프로젝트'
    ],

    // 성능 설정
    performance: {
        lazyLoading: true,
        imageOptimization: true,
        codeSplitting: true,
        caching: {
            enabled: true,
            duration: 86400 // 24시간
        }
    },

    // 접근성 설정
    accessibility: {
        skipLinks: true,
        focusIndicators: true,
        keyboardNavigation: true,
        screenReader: true,
        highContrast: false,
        reducedMotion: false
    },

    // 분석 설정
    analytics: {
        enabled: true,
        googleAnalytics: {
            trackingId: 'GA_TRACKING_ID'
        },
        hotjar: {
            siteId: 'HOTJAR_SITE_ID'
        }
    },

    // 보안 설정
    security: {
        csp: {
            enabled: true,
            directives: {
                'default-src': ["'self'"],
                'script-src': ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
                'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
                'font-src': ["'self'", 'https://fonts.gstatic.com'],
                'img-src': ["'self'", 'data:', 'https:'],
                'connect-src': ["'self'", 'https://api.yoursite.com']
            }
        },
        hsts: {
            enabled: true,
            maxAge: 31536000
        }
    },

    // 개발 설정
    development: {
        debug: false,
        logLevel: 'info',
        hotReload: true,
        sourceMaps: true
    }
};

// 환경별 설정
const ENV = {
    development: {
        ...CONFIG,
        api: {
            ...CONFIG.api,
            baseUrl: 'http://localhost:3000/api'
        },
        development: {
            ...CONFIG.development,
            debug: true,
            logLevel: 'debug'
        }
    },
    production: {
        ...CONFIG,
        performance: {
            ...CONFIG.performance,
            lazyLoading: true,
            imageOptimization: true,
            codeSplitting: true
        },
        development: {
            ...CONFIG.development,
            debug: false,
            logLevel: 'error'
        }
    }
};

// 현재 환경 감지
const getCurrentEnv = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'development';
    }
    return 'production';
};

// 현재 환경의 설정 반환
const getConfig = () => {
    const currentEnv = getCurrentEnv();
    return ENV[currentEnv] || CONFIG;
};

// 설정 유효성 검사
const validateConfig = (config) => {
    const required = ['app', 'api', 'theme', 'language'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
        console.warn('Missing required config keys:', missing);
        return false;
    }
    
    return true;
};

// 설정 초기화
const initConfig = () => {
    const config = getConfig();
    
    if (!validateConfig(config)) {
        console.error('Invalid configuration');
        return null;
    }
    
    // 전역 설정 객체로 설정
    window.APP_CONFIG = config;
    
    // 메타 태그 업데이트
    updateMetaTags(config);
    
    // CSP 설정 적용
    if (config.security.csp.enabled) {
        applyCSP(config.security.csp.directives);
    }
    
    console.log('Configuration loaded:', config.app.name, 'v' + config.app.version);
    return config;
};

// 메타 태그 업데이트
const updateMetaTags = (config) => {
    const metaTags = {
        'description': config.app.description,
        'author': config.app.author,
        'og:title': config.app.name,
        'og:description': config.app.description,
        'og:url': config.app.url,
        'twitter:title': config.app.name,
        'twitter:description': config.app.description
    };
    
    Object.entries(metaTags).forEach(([name, content]) => {
        const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        if (meta) {
            meta.setAttribute('content', content);
        }
    });
};

// CSP 설정 적용
const applyCSP = (directives) => {
    const cspString = Object.entries(directives)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ');
    
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = cspString;
    document.head.appendChild(meta);
};

// 설정 내보내기
window.CONFIG = {
    get: getConfig,
    init: initConfig,
    validate: validateConfig,
    env: getCurrentEnv
};

// 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
    initConfig();
});