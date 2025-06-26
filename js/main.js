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
                if (window[component.class]) {
                    this.components[component.name] = new window[component.class]();
                    if (this.components[component.name].init) {
                        this.components[component.name].init();
                    }
                    console.log(`${component.class} initialized successfully`);
                }
            } catch (error) {
                console.error(`Failed to initialize ${component.class}:`, error);
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
            const icon = themeToggle.querySelector('i');
            if (currentTheme === 'dark') {
                this.utils.removeClass(icon, 'fa-moon');
                this.utils.addClass(icon, 'fa-sun');
            } else {
                this.utils.removeClass(icon, 'fa-sun');
                this.utils.addClass(icon, 'fa-moon');
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
            const icon = themeToggle.querySelector('i');
            if (newTheme === 'dark') {
                this.utils.removeClass(icon, 'fa-moon');
                this.utils.addClass(icon, 'fa-sun');
            } else {
                this.utils.removeClass(icon, 'fa-sun');
                this.utils.addClass(icon, 'fa-moon');
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