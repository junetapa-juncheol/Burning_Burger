/**
 * Main Application
 * 애플리케이션 전체를 관리하고 초기화합니다.
 */

class App {
    constructor() {
        this.config = window.CONFIG || {};
        
        if (!window.utils) {
            console.error("Utils is not loaded!");
            this.utils = {};
        } else {
            this.utils = window.utils;
        }

        this.components = {};
        
        // DOMContentLoaded 이벤트가 이미 발생했을 수 있으므로 즉시 초기화
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            this.init();
        } else {
            document.addEventListener('DOMContentLoaded', () => this.init());
        }
    }

    init() {
        console.log('Initializing application...');
        this.initCore();
        this.initComponents();
        this.bindGlobalEvents();
        // showContent는 로딩이 완료된 후 호출되도록 이동
    }

    initCore() {
        // 테마 초기화
        this.initTheme();

        // 언어 초기화
        this.initLanguage();
    }

    initComponents() {
        // 각 컴포넌트 초기화
        if (window.Navigation) this.components.navigation = new window.Navigation();
        
        if (window.MusicPlayer) {
            this.components.musicPlayer = new window.MusicPlayer();
            if (this.components.musicPlayer.init) {
                this.components.musicPlayer.init();
            }
        }

        if (window.Tabs) this.components.tabs = new window.Tabs();
        if (window.Search) this.components.search = new window.Search();
        if (window.HeroSection) this.components.hero = new window.HeroSection();
        if (window.PortfolioSection) this.components.portfolio = new window.PortfolioSection();
        if (window.AnimationsManager) this.components.animations = new window.AnimationsManager();
        
        console.log('Components initialized:', this.components);
    }

    bindGlobalEvents() {
        // 'load' 이벤트 리스너는 App 초기화 후 별도로 등록
        // 'beforeunload' 이벤트는 여기서 관리할 수 있음
        window.addEventListener('beforeunload', () => {
            // 페이지를 떠나기 전 처리 (예: 데이터 저장)
            // this.showLoadingScreen(); // 사용자가 원치 않는 동작일 수 있으므로 주석 처리
        });
    }

    showContent() {
        // 메인 콘텐츠 표시
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
        }
        console.log('Main content is now visible.');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500); // Fading-out transition
            console.log('Loading screen hidden.');
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            setTimeout(() => {
                loadingScreen.style.opacity = '1';
            }, 10);
            console.log('Loading screen shown.');
        }
    }

    initTheme() {
        const themeToggle = document.querySelector('.theme-toggle');
        const currentTheme = localStorage.getItem('theme') || this.config.theme?.default || 'light';

        document.documentElement.setAttribute('data-theme', currentTheme);

        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (currentTheme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
            
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (newTheme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    }

    initLanguage() {
        // 언어 선택 기능 초기화
        const langSelector = document.querySelector('.language-selector');
        if (langSelector) {
            // 언어 변경 로직 추가
        }
    }
}

// 애플리케이션 인스턴스 생성
const app = new App();

// 페이지의 모든 리소스(이미지, 오디오 등)가 로드된 후 실행
window.addEventListener('load', () => {
    console.log('All resources loaded. Hiding loading screen and showing content.');
    app.hideLoadingScreen();
    app.showContent();
});