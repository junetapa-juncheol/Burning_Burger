/**
 * Main Application
 * 애플리케이션 전체를 관리하고 초기화합니다.
 */

class App {
    constructor() {
        // DOMContentLoaded 이벤트가 이미 발생했을 수 있으므로 즉시 초기화
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            this.waitForUtils();
        } else {
            document.addEventListener('DOMContentLoaded', () => this.waitForUtils());
        }
    }

    waitForUtils() {
        // utils 객체가 로드될 때까지 대기
        if (window.utils) {
            this.init();
        } else {
            console.log('Waiting for utils to load...');
            setTimeout(() => this.waitForUtils(), 100);
        }
    }

    init() {
        this.config = window.CONFIG || {};
        this.utils = window.utils;
        this.components = {};

        console.log('Initializing application...');
        this.initCore();
        this.initComponents();
        this.bindGlobalEvents();
    }

    initCore() {
        // 테마 초기화
        this.initTheme();
        // 언어 초기화
        this.initLanguage();
    }

    initComponents() {
        // 각 컴포넌트 초기화 전에 utils 객체가 로드되었는지 확인
        if (!window.utils) {
            console.error('Utils is not loaded! Components will not be initialized.');
            return;
        }

        // 컴포넌트 초기화 순서 중요 (MusicPlayer는 별도로 초기화되므로 제외)
        const initSequence = [
            { name: 'navigation', class: 'Navigation' },
            { name: 'tabs', class: 'Tabs' },
            { name: 'search', class: 'SearchManager' },
            { name: 'hero', class: 'HeroSection' },
            { name: 'portfolio', class: 'PortfolioSection' },
            { name: 'animations', class: 'AnimationsManager' }
        ];

        initSequence.forEach(component => {
            try {
                console.log(`🔧 ${component.class} 초기화 시도...`);
                
                if (window[component.class]) {
                    this.components[component.name] = new window[component.class]();
                    
                    // init 메서드가 있고 아직 호출되지 않았다면 호출
                    if (this.components[component.name].init && typeof this.components[component.name].init === 'function') {
                        this.components[component.name].init();
                    }
                    
                    console.log(`✅ ${component.class} 초기화 성공`);
                } else {
                    console.warn(`⚠️ ${component.class} 클래스를 찾을 수 없습니다.`);
                }
            } catch (error) {
                console.error(`❌ ${component.class} 초기화 실패:`, error);
            }
        });

        console.log('Components initialized:', this.components);
    }

    bindGlobalEvents() {
        // 전역 이벤트 바인딩
        this.utils.on(window, 'beforeunload', () => {
            // 페이지를 떠나기 전 처리
        });
    }

    showContent() {
        const mainContent = this.utils.$('.main-content');
        if (mainContent) {
            this.utils.setStyle(mainContent, 'visibility', 'visible');
            this.utils.setStyle(mainContent, 'opacity', '1');
        }
        console.log('Main content is now visible.');
    }

    hideLoadingScreen() {
        const loadingScreen = this.utils.$('#loading-screen');
        if (loadingScreen) {
            this.utils.setStyle(loadingScreen, 'opacity', '0');
            setTimeout(() => {
                this.utils.setStyle(loadingScreen, 'display', 'none');
            }, 500);
            console.log('Loading screen hidden.');
        }
    }

    showLoadingScreen() {
        const loadingScreen = this.utils.$('#loading-screen');
        if (loadingScreen) {
            this.utils.setStyle(loadingScreen, 'display', 'flex');
            setTimeout(() => {
                this.utils.setStyle(loadingScreen, 'opacity', '1');
            }, 10);
            console.log('Loading screen shown.');
        }
    }

    initTheme() {
        const themeToggle = this.utils.$('.theme-toggle');
        const currentTheme = this.utils.storage.get('theme') || this.config.theme?.default || 'light';

        document.documentElement.setAttribute('data-theme', currentTheme);

        if (themeToggle) {
            const svg = themeToggle.querySelector('svg');
            if (svg && currentTheme === 'dark') {
                // Sun icon for dark theme
                svg.innerHTML = '<path fill="currentColor" d="M361.5 1.2c5 1.3 8.3 6.5 6.9 11.4L343.4 82.7l28.3-12.6c5-2.2 10.9 0 13.1 5s0 10.9-5 13.1l-28.3 12.6 69.1 25.4c5 1.8 7.6 7.4 5.8 12.4s-7.4 7.6-12.4 5.8L344 118l12.6 28.3c2.2 5 0 10.9-5 13.1s-10.9 0-13.1-5L326.9 126l-25.4 69.1c-1.8 5-7.4 7.6-12.4 5.8s-7.6-7.4-5.8-12.4L310.7 119l-28.3 12.6c-5 2.2-10.9 0-13.1-5s0-10.9 5-13.1l28.3-12.6L233.5 75.5c-5-1.8-7.6-7.4-5.8-12.4s7.4-7.6 12.4-5.8L309.2 83l-12.6-28.3c-2.2-5 0-10.9 5-13.1s10.9 0 13.1 5L327.3 75l25.4-69.1c1.8-5 7.4-7.6 12.4-5.8zM287.6 64.7c-1.2 0-2.4.1-3.6.2L265.5 33.2c-1.7-3.2-5.2-5.2-9-5.2s-7.2 2-9 5.2L229 65c-1.2-.1-2.4-.2-3.6-.2c-15.5 0-29.3 7.2-38.4 18.5L148 64.8c-3.2-1.7-7.2-1.7-10.4 0s-5.4 4.7-5.4 8.2V96c0 8.8 7.2 16 16 16h128c8.8 0 16-7.2 16-16V73c0-3.5-1.9-6.7-5-8.4z"/>';
            } else if (svg) {
                // Moon icon for light theme
                svg.innerHTML = '<path fill="currentColor" d="m223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/>';
            }
            
            this.utils.on(themeToggle, 'click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        this.utils.storage.set('theme', newTheme);
        
        const themeToggle = this.utils.$('.theme-toggle');
        if (themeToggle) {
            const svg = themeToggle.querySelector('svg');
            if (svg) {
                if (newTheme === 'dark') {
                    // Sun icon for dark theme
                    svg.innerHTML = '<path fill="currentColor" d="M361.5 1.2c5 1.3 8.3 6.5 6.9 11.4L343.4 82.7l28.3-12.6c5-2.2 10.9 0 13.1 5s0 10.9-5 13.1l-28.3 12.6 69.1 25.4c5 1.8 7.6 7.4 5.8 12.4s-7.4 7.6-12.4 5.8L344 118l12.6 28.3c2.2 5 0 10.9-5 13.1s-10.9 0-13.1-5L326.9 126l-25.4 69.1c-1.8 5-7.4 7.6-12.4 5.8s-7.6-7.4-5.8-12.4L310.7 119l-28.3 12.6c-5 2.2-10.9 0-13.1-5s0-10.9 5-13.1l28.3-12.6L233.5 75.5c-5-1.8-7.6-7.4-5.8-12.4s7.4-7.6 12.4-5.8L309.2 83l-12.6-28.3c-2.2-5 0-10.9 5-13.1s10.9 0 13.1 5L327.3 75l25.4-69.1c1.8-5 7.4-7.6 12.4-5.8z"/>';
                } else {
                    // Moon icon for light theme
                    svg.innerHTML = '<path fill="currentColor" d="m223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/>';
                }
            }
        }
    }

    initLanguage() {
        // 언어 선택 기능 초기화
        const langSelector = this.utils.$('.language-selector');
        if (langSelector) {
            // 언어 변경 로직 추가
        }
    }
}

// 애플리케이션 인스턴스 생성
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});

// 페이지의 모든 리소스가 로드된 후 실행
window.addEventListener('load', () => {
    if (app) {
        console.log('All resources loaded. Hiding loading screen and showing content.');
        app.hideLoadingScreen();
        app.showContent();
    }
});