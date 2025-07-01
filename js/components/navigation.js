/**
 * Navigation Component
 * 메인 네비게이션 및 모바일 메뉴 기능
 */

class Navigation {
    constructor() {
        console.log('🧭 네비게이션 컴포넌트 초기화 시작');
        
        // 즉시 초기화 시도
        this.tryInit();
        
        // DOMContentLoaded 이벤트에도 등록 (백업)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.tryInit());
        }
    }

    tryInit() {
        // utils 객체 체크
        if (!window.utils) {
            console.log('⏳ utils 대기 중...');
            setTimeout(() => this.tryInit(), 100);
            return;
        }
        
        console.log('✅ utils 로드됨, 네비게이션 초기화');
        this.init();
    }

    init() {
        // 중복 초기화 방지
        if (this.initialized) {
            console.log('📌 네비게이션 이미 초기화됨, 건너뛰기');
            return;
        }
        
        this.utils = window.utils;
        
        // 네비게이션 요소 확인
        const navigation = document.querySelector('.main-navigation');
        if (!navigation) {
            console.error('❌ 네비게이션 요소를 찾을 수 없습니다.');
            // 다시 시도 (DOM이 완전히 로드되지 않았을 수 있음)
            setTimeout(() => {
                if (!this.initialized) {
                    console.log('🔄 네비게이션 재시도...');
                    this.init();
                }
            }, 500);
            return;
        }
        
        console.log('✅ 네비게이션 요소 찾음:', navigation);
        
        // 네비게이션이 화면에 보이는지 확인
        const rect = navigation.getBoundingClientRect();
        if (rect.height === 0) {
            console.warn('⚠️ 네비게이션 높이가 0입니다. CSS 로딩 확인 필요');
        }
        
        this.bindEvents();
        this.setupDropdowns();
        this.setupMobileMenu();
        this.setupScrollEffects();
        this.setupActiveStates();
        
        // 초기화 완료 플래그
        this.initialized = true;
        
        // 추가 설정 실행
        this.afterInit();
        
        console.log('🎉 네비게이션 초기화 완료');
    }

    bindEvents() {
        // 모바일 메뉴 토글
        const mobileToggle = this.utils.$('.mobile-menu-toggle');
        if (mobileToggle) {
            this.utils.on(mobileToggle, 'click', () => this.toggleMobileMenu());
        }

        // 드롭다운 메뉴
        const dropdownItems = this.utils.$$('.nav-item.has-dropdown');
        dropdownItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            const dropdown = item.querySelector('.dropdown-menu');
            
            if (link && dropdown) {
                this.utils.on(link, 'click', (e) => {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        this.toggleDropdown(item);
                    }
                });
            }
        });

        // 리사이즈 이벤트
        this.utils.onResize(() => this.handleResize());
        
        // 외부 클릭으로 드롭다운 닫기
        this.utils.onClickOutside(this.utils.$('.main-nav-list'), (e) => this.handleOutsideClick(e));
    }

    setupDropdowns() {
        const dropdownItems = this.utils.$$('.nav-item.has-dropdown');
        
        dropdownItems.forEach(item => {
            const dropdown = item.querySelector('.dropdown-menu');
            if (dropdown) {
                this.utils.setStyle(dropdown, 'transition', 'all 0.3s ease-in-out');
            }
        });
    }

    setupMobileMenu() {
        const mobileMenu = this.utils.$('.main-nav-list');
        const mobileToggle = this.utils.$('.mobile-menu-toggle');
        
        if (mobileMenu && mobileToggle) {
            this.utils.removeClass(mobileMenu, 'active');
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
    }

    setupScrollEffects() {
        // utils 객체가 제대로 초기화되었는지 확인
        if (!this.utils || !this.utils.$) {
            console.warn('⚠️ utils 객체가 초기화되지 않았습니다.');
            return;
        }

        const navigation = this.utils.$('.main-navigation');
        if (!navigation) {
            console.warn('⚠️ 네비게이션 요소를 찾을 수 없어 스크롤 효과를 설정할 수 없습니다.');
            return;
        }
        
        let lastScrollTop = 0;
        let isScrolling = false;
        
        const handleScroll = this.debounce(() => {
            try {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollDifference = Math.abs(scrollTop - lastScrollTop);
                
                // 스크롤 거리가 충분히 클 때만 반응 (더 부드러운 UX)
                if (scrollDifference > 5) {
                    // 스크롤된 상태 클래스 추가/제거
                    if (scrollTop > 50) {
                        this.utils.addClass(navigation, 'scrolled');
                    } else {
                        this.utils.removeClass(navigation, 'scrolled');
                    }

                    // 네비게이션 숨김/표시 (아래로 많이 스크롤할 때만)
                    if (scrollTop > lastScrollTop && scrollTop > 200) {
                        // 아래로 스크롤
                        this.utils.addClass(navigation, 'nav-hidden');
                    } else if (scrollTop < lastScrollTop) {
                        // 위로 스크롤
                        this.utils.removeClass(navigation, 'nav-hidden');
                    }
                    
                    lastScrollTop = scrollTop;
                }
                
                isScrolling = false;
            } catch (error) {
                console.error('🚨 스크롤 이벤트 처리 중 오류:', error);
                isScrolling = false;
            }
        }, 16); // 60fps로 제한
        
        // 안전한 스크롤 이벤트 바인딩
        try {
            this.utils.onScroll(() => {
                if (!isScrolling) {
                    isScrolling = true;
                    handleScroll();
                }
            });
            
            console.log('📜 네비게이션 스크롤 효과 설정 완료');
        } catch (error) {
            console.error('🚨 스크롤 이벤트 바인딩 실패:', error);
        }
    }

    setupActiveStates() {
        // 현재 페이지에 따른 활성 상태 설정
        const currentPath = window.location.pathname;
        const navLinks = this.utils.$$('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href !== '#' && currentPath.includes(href.replace('#', ''))) {
                this.utils.addClass(link, 'active');
            }
        });
    }

    toggleMobileMenu() {
        const mobileMenu = this.utils.$('.main-nav-list');
        const mobileToggle = this.utils.$('.mobile-menu-toggle');
        
        if (mobileMenu && mobileToggle) {
            const isActive = this.utils.hasClass(mobileMenu, 'active');
            
            if (isActive) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }

    openMobileMenu() {
        const mobileMenu = this.utils.$('.main-nav-list');
        const mobileToggle = this.utils.$('.mobile-menu-toggle');
        
        if (mobileMenu && mobileToggle) {
            this.utils.addClass(mobileMenu, 'active');
            this.utils.addClass(mobileToggle, 'active');
            mobileToggle.setAttribute('aria-expanded', 'true');
            
            // 스크롤 방지
            document.body.style.overflow = 'hidden';
            
            // 애니메이션 효과
            this.animateMobileMenu('in');
            
            // 모바일에서 포트폴리오와 서비스 드롭다운 자동으로 열기
            setTimeout(() => {
                const portfolioItem = this.utils.$('.nav-item.has-dropdown');
                const serviceItem = this.utils.$$('.nav-item.has-dropdown')[1]; // 두 번째 드롭다운 (서비스)
                
                if (portfolioItem) {
                    this.utils.addClass(portfolioItem, 'active');
                    const portfolioDropdown = portfolioItem.querySelector('.dropdown-menu');
                    if (portfolioDropdown) {
                        this.utils.addClass(portfolioDropdown, 'show');
                    }
                }
                
                if (serviceItem) {
                    this.utils.addClass(serviceItem, 'active');
                    const serviceDropdown = serviceItem.querySelector('.dropdown-menu');
                    if (serviceDropdown) {
                        this.utils.addClass(serviceDropdown, 'show');
                    }
                }
            }, 100);
        }
    }

    closeMobileMenu() {
        const mobileMenu = this.utils.$('.main-nav-list');
        const mobileToggle = this.utils.$('.mobile-menu-toggle');
        
        if (mobileMenu && mobileToggle) {
            this.utils.removeClass(mobileMenu, 'active');
            this.utils.removeClass(mobileToggle, 'active');
            mobileToggle.setAttribute('aria-expanded', 'false');
            
            // 스크롤 복원
            document.body.style.overflow = '';
            
            // 애니메이션 효과
            this.animateMobileMenu('out');
            
            // 드롭다운 상태 초기화
            const dropdownItems = this.utils.$$('.nav-item.has-dropdown');
            dropdownItems.forEach(item => {
                this.utils.removeClass(item, 'active');
                const dropdown = item.querySelector('.dropdown-menu');
                if (dropdown) {
                    this.utils.removeClass(dropdown, 'show');
                }
            });
        }
    }

    animateMobileMenu(direction) {
        const mobileMenu = this.utils.$('.main-nav-list');
        if (!mobileMenu) return;
        
        if (direction === 'in') {
            this.utils.setStyle(mobileMenu, 'transform', 'translateX(0)');
            this.utils.setStyle(mobileMenu, 'opacity', '1');
        } else {
            this.utils.setStyle(mobileMenu, 'transform', 'translateX(-100%)');
            this.utils.setStyle(mobileMenu, 'opacity', '0');
        }
    }

    toggleDropdown(item) {
        const dropdown = item.querySelector('.dropdown-menu');
        const isActive = item.classList.contains('active');
        
        // 다른 드롭다운들 닫기
        this.utils.$$('.nav-item.has-dropdown.active').forEach(activeItem => {
            if (activeItem !== item) {
                this.utils.removeClass(activeItem, 'active');
                const activeDropdown = activeItem.querySelector('.dropdown-menu');
                if (activeDropdown) {
                    this.utils.removeClass(activeDropdown, 'show');
                }
            }
        });
        
        if (isActive) {
            this.utils.removeClass(item, 'active');
            this.utils.removeClass(dropdown, 'show');
        } else {
            this.utils.addClass(item, 'active');
            this.utils.addClass(dropdown, 'show');
        }
    }



    handleResize() {
        // utils 객체 확인
        if (!this.utils || !this.utils.$$) {
            console.warn('⚠️ handleResize: utils 객체가 초기화되지 않았습니다.');
            return;
        }

        try {
            // 화면 크기 변경 시 모바일 메뉴 닫기
            if (window.innerWidth > 768) {
                this.closeMobileMenu();
                
                // 드롭다운 상태 초기화
                this.utils.$$('.nav-item.has-dropdown.active').forEach(item => {
                    this.utils.removeClass(item, 'active');
                    const dropdown = item.querySelector('.dropdown-menu');
                    if (dropdown) {
                        this.utils.removeClass(dropdown, 'show');
                    }
                });
            }
        } catch (error) {
            console.error('🚨 리사이즈 이벤트 처리 중 오류:', error);
        }
    }

    handleOutsideClick(event) {
        // utils 객체 확인
        if (!this.utils || !this.utils.$) {
            console.warn('⚠️ handleOutsideClick: utils 객체가 초기화되지 않았습니다.');
            return;
        }

        try {
            const navigation = this.utils.$('.main-navigation');
            const mobileMenu = this.utils.$('.main-nav-list');
            
            // 모바일 메뉴 외부 클릭 시 닫기
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                if (navigation && !navigation.contains(event.target)) {
                    this.closeMobileMenu();
                }
            }
            
            // 드롭다운 외부 클릭 시 닫기
            const dropdownItems = this.utils.$$('.nav-item.has-dropdown');
            dropdownItems.forEach(item => {
                if (!item.contains(event.target)) {
                    this.utils.removeClass(item, 'active');
                    const dropdown = item.querySelector('.dropdown-menu');
                    if (dropdown) {
                        this.utils.removeClass(dropdown, 'show');
                    }
                }
            });
        } catch (error) {
            console.error('🚨 외부 클릭 이벤트 처리 중 오류:', error);
        }
    }

    // 북마크 기능
    setupBookmark() {
        const bookmarkBtn = this.utils.$('.bookmark-btn');
        if (bookmarkBtn) {
            this.utils.on(bookmarkBtn, 'click', () => this.toggleBookmark());
        }
    }

    toggleBookmark() {
        const bookmarkBtn = this.utils.$('.bookmark-btn');
        if (bookmarkBtn) {
            const isBookmarked = this.utils.hasClass(bookmarkBtn, 'active');
            
            if (isBookmarked) {
                this.utils.removeClass(bookmarkBtn, 'active');
                this.removeBookmark();
            } else {
                this.utils.addClass(bookmarkBtn, 'active');
                this.addBookmark();
            }
        }
    }

    addBookmark() {
        const pageTitle = document.title;
        const pageUrl = window.location.href;
        
        if ('bookmarks' in window && 'create' in window.bookmarks) {
            // Chrome 확장 프로그램 API 사용
            window.bookmarks.create({
                title: pageTitle,
                url: pageUrl
            });
        } else {
            // 기본 브라우저 북마크 다이얼로그 열기
            if (window.sidebar && window.sidebar.addPanel) {
                // Mozilla Firefox
                window.sidebar.addPanel(pageTitle, pageUrl, '');
            } else if (window.external && ('AddFavorite' in window.external)) {
                // Internet Explorer
                window.external.AddFavorite(pageUrl, pageTitle);
            } else {
                // 기타 브라우저
                alert('이 페이지를 북마크하려면 Ctrl+D를 누르세요.');
            }
        }
    }

    removeBookmark() {
        // 북마크 제거 로직 (실제로는 브라우저 API 제한으로 어려움)
        console.log('북마크 제거');
    }

    // 공유 기능
    setupShare() {
        const shareBtn = this.utils.$('.share-btn');
        if (shareBtn) {
            this.utils.on(shareBtn, 'click', () => this.sharePage());
        }
    }

    sharePage() {
        const pageTitle = document.title;
        const pageUrl = window.location.href;
        
        if (navigator.share) {
            // Web Share API 사용
            navigator.share({
                title: pageTitle,
                url: pageUrl
            }).catch(err => {
                console.log('공유 실패:', err);
                this.fallbackShare(pageTitle, pageUrl);
            });
        } else {
            // 폴백 공유 방법
            this.fallbackShare(pageTitle, pageUrl);
        }
    }

    fallbackShare(title, url) {
        // 클립보드에 URL 복사
        navigator.clipboard.writeText(url).then(() => {
            this.showToast('링크가 클립보드에 복사되었습니다!');
        }).catch(() => {
            // 클립보드 API가 지원되지 않는 경우
            this.showShareDialog(title, url);
        });
    }

    showShareDialog(title, url) {
        const dialog = document.createElement('div');
        dialog.className = 'share-dialog';
        dialog.innerHTML = `
            <div class="share-dialog-content">
                <h3>페이지 공유</h3>
                <p>${title}</p>
                <input type="text" value="${url}" readonly>
                <div class="share-dialog-actions">
                    <button class="btn btn-primary" onclick="navigator.clipboard.writeText('${url}')">복사</button>
                    <button class="btn btn-secondary" onclick="this.closest('.share-dialog').remove()">닫기</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // 접근성 개선
    setupAccessibility() {
        // 키보드 네비게이션
        const navLinks = this.utils.$$('.nav-link');
        navLinks.forEach((link, index) => {
            this.utils.on(link, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        });

        // 포커스 관리
        const dropdownItems = this.utils.$$('.nav-item.has-dropdown');
        dropdownItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            const dropdown = item.querySelector('.dropdown-menu');
            
            if (link && dropdown) {
                this.utils.on(link, 'focus', () => {
                    if (window.innerWidth > 768) {
                        this.openDropdown(item);
                    }
                });
                
                item.addEventListener('blur', (e) => {
                    if (!item.contains(e.relatedTarget)) {
                        this.closeDropdown(item);
                    }
                });
            }
        });
    }

    openDropdown(item) {
        const dropdown = item.querySelector('.dropdown-menu');
        if (dropdown) {
            item.classList.add('active');
            dropdown.classList.add('show');
        }
    }

    closeDropdown(item) {
        const dropdown = item.querySelector('.dropdown-menu');
        if (dropdown) {
            item.classList.remove('active');
            dropdown.classList.remove('show');
        }
    }

    // 성능 최적화
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 초기화 완료 후 추가 설정
    afterInit() {
        this.setupBookmark();
        this.setupShare();
        this.setupAccessibility();
        
        // 리사이즈 이벤트 최적화
        this.handleResize = this.debounce(this.handleResize, 250);
    }
}

// 전역으로 내보내기
window.Navigation = Navigation;

// Navigation 인스턴스 생성 (더 안정적인 방식)
const initNavigationInstance = () => {
    if (!window.navigation) {
        console.log('🧭 전역 네비게이션 인스턴스 생성');
        window.navigation = new Navigation();
    }
};

// 여러 시점에서 초기화 시도
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigationInstance);
} else {
    initNavigationInstance();
}

// 백업으로 window.load 이벤트에도 등록
window.addEventListener('load', () => {
    if (!window.navigation) {
        console.log('🔄 window.load에서 네비게이션 인스턴스 재시도');
        initNavigationInstance();
    }
}); 