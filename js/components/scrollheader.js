/**
 * Scroll Header Component
 * 스크롤에 따라 헤더의 숨김/보임 및 스타일을 제어합니다.
 */

class ScrollHeader {
    constructor() {
        this.header = null;
        this.navigation = null;
        this.lastScrollY = 0;
        this.scrollThreshold = 100; // 스크롤 임계값
        this.isHeaderHidden = false;
        this.isHeaderCompact = false;
        this.scrollDirection = 'up';
        this.ticking = false; // 스크롤 이벤트 최적화용
        
        console.log('🎯 ScrollHeader 초기화 중...');
        this.init();
    }

    init() {
        // DOM 요소 찾기
        this.header = document.querySelector('.main-header');
        this.navigation = document.querySelector('.main-navigation');
        
        if (!this.header) {
            console.warn('⚠️ .main-header 요소를 찾을 수 없습니다.');
            return;
        }

        // 초기 스크롤 위치 설정
        this.lastScrollY = window.scrollY;
        
        // 이벤트 리스너 등록
        this.bindEvents();
        
        // 초기 상태 설정
        this.updateHeaderState();
        
        console.log('✅ ScrollHeader 초기화 완료');
    }

    bindEvents() {
        // 스크롤 이벤트 (throttled)
        window.addEventListener('scroll', () => this.requestTick());
        
        // 리사이즈 이벤트
        window.addEventListener('resize', () => this.handleResize());
        
        // 페이지 로드 시 한 번 더 실행
        window.addEventListener('load', () => this.updateHeaderState());
    }

    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => this.handleScroll());
            this.ticking = true;
        }
    }

    handleScroll() {
        const currentScrollY = window.scrollY;
        const scrollDifference = currentScrollY - this.lastScrollY;
        
        // 스크롤 방향 감지
        if (scrollDifference > 0 && currentScrollY > this.scrollThreshold) {
            this.scrollDirection = 'down';
        } else if (scrollDifference < 0) {
            this.scrollDirection = 'up';
        }
        
        // 헤더 상태 업데이트
        this.updateHeaderState();
        
        this.lastScrollY = currentScrollY;
        this.ticking = false;
    }

    updateHeaderState() {
        const currentScrollY = window.scrollY;
        
        // 1. 헤더 숨김/보임 로직
        if (this.scrollDirection === 'down' && currentScrollY > this.scrollThreshold) {
            this.hideHeader();
        } else if (this.scrollDirection === 'up' || currentScrollY <= this.scrollThreshold) {
            this.showHeader();
        }
        
        // 2. 헤더 축소 로직
        if (currentScrollY > 50) {
            this.compactHeader();
        } else {
            this.expandHeader();
        }
    }

    hideHeader() {
        if (!this.isHeaderHidden) {
            this.header.classList.add('header-hidden');
            this.isHeaderHidden = true;
            
            // 접근성을 위한 aria 속성 추가
            this.header.setAttribute('aria-hidden', 'true');
            
            console.log('📤 헤더 숨김');
        }
    }

    showHeader() {
        if (this.isHeaderHidden) {
            this.header.classList.remove('header-hidden');
            this.isHeaderHidden = false;
            
            // 접근성을 위한 aria 속성 제거
            this.header.removeAttribute('aria-hidden');
            
            console.log('📥 헤더 표시');
        }
    }

    compactHeader() {
        if (!this.isHeaderCompact) {
            this.header.classList.add('header-compact');
            this.isHeaderCompact = true;
            
            console.log('📦 헤더 축소');
        }
    }

    expandHeader() {
        if (this.isHeaderCompact) {
            this.header.classList.remove('header-compact');
            this.isHeaderCompact = false;
            
            console.log('📖 헤더 확장');
        }
    }

    handleResize() {
        // 화면 크기 변경 시 상태 재계산
        this.updateHeaderState();
    }

    // 수동으로 헤더 표시 (예: 페이지 최상단 이동 시)
    forceShowHeader() {
        this.showHeader();
        this.scrollDirection = 'up';
    }

    // 수동으로 헤더 숨김
    forceHideHeader() {
        this.hideHeader();
        this.scrollDirection = 'down';
    }

    // 현재 헤더 상태 반환
    getHeaderState() {
        return {
            isHidden: this.isHeaderHidden,
            isCompact: this.isHeaderCompact,
            scrollDirection: this.scrollDirection,
            scrollY: window.scrollY
        };
    }

    // 설정 변경
    updateConfig(config) {
        if (config.scrollThreshold !== undefined) {
            this.scrollThreshold = config.scrollThreshold;
        }
        console.log('⚙️ ScrollHeader 설정 업데이트:', config);
    }

    // 컴포넌트 해제
    destroy() {
        window.removeEventListener('scroll', this.requestTick);
        window.removeEventListener('resize', this.handleResize);
        
        // 클래스 제거
        if (this.header) {
            this.header.classList.remove('header-hidden', 'header-compact');
            this.header.removeAttribute('aria-hidden');
        }
        
        console.log('🗑️ ScrollHeader 해제됨');
    }
}

// 전역에 등록
window.ScrollHeader = ScrollHeader; 