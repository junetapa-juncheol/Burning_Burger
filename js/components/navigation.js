/**
 * Navigation Component
 * 메인 네비게이션 및 모바일 메뉴 기능
 */

class Navigation {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDropdowns();
        this.setupMobileMenu();
        this.setupScrollEffects();
        this.setupActiveStates();
    }

    bindEvents() {
        // 모바일 메뉴 토글
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // 드롭다운 메뉴
        const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
        dropdownItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            const dropdown = item.querySelector('.dropdown-menu');
            
            if (link && dropdown) {
                link.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        this.toggleDropdown(item);
                    }
                });
            }
        });

        // 스크롤 이벤트
        window.addEventListener('scroll', () => this.handleScroll());
        
        // 리사이즈 이벤트
        window.addEventListener('resize', () => this.handleResize());
        
        // 외부 클릭으로 드롭다운 닫기
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    setupDropdowns() {
        const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
        
        dropdownItems.forEach(item => {
            const dropdown = item.querySelector('.dropdown-menu');
            if (dropdown) {
                // 드롭다운 애니메이션 설정
                dropdown.style.transition = 'all 0.3s ease-in-out';
            }
        });
    }

    setupMobileMenu() {
        const mobileMenu = document.querySelector('.main-nav-list');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        if (mobileMenu && mobileToggle) {
            // 모바일 메뉴 초기 상태 설정
            mobileMenu.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
    }

    setupScrollEffects() {
        const navigation = document.querySelector('.main-navigation');
        if (navigation) {
            let lastScrollTop = 0;
            
            window.addEventListener('scroll', () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    // 아래로 스크롤
                    navigation.classList.add('nav-hidden');
                } else {
                    // 위로 스크롤
                    navigation.classList.remove('nav-hidden');
                }
                
                lastScrollTop = scrollTop;
            });
        }
    }

    setupActiveStates() {
        // 현재 페이지에 따른 활성 상태 설정
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href !== '#' && currentPath.includes(href.replace('#', ''))) {
                link.classList.add('active');
            }
        });
    }

    toggleMobileMenu() {
        const mobileMenu = document.querySelector('.main-nav-list');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        if (mobileMenu && mobileToggle) {
            const isActive = mobileMenu.classList.contains('active');
            
            if (isActive) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }

    openMobileMenu() {
        const mobileMenu = document.querySelector('.main-nav-list');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        if (mobileMenu && mobileToggle) {
            mobileMenu.classList.add('active');
            mobileToggle.classList.add('active');
            mobileToggle.setAttribute('aria-expanded', 'true');
            
            // 스크롤 방지
            document.body.style.overflow = 'hidden';
            
            // 애니메이션 효과
            this.animateMobileMenu('in');
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.querySelector('.main-nav-list');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        if (mobileMenu && mobileToggle) {
            mobileMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
            
            // 스크롤 복원
            document.body.style.overflow = '';
            
            // 애니메이션 효과
            this.animateMobileMenu('out');
        }
    }

    animateMobileMenu(direction) {
        const mobileMenu = document.querySelector('.main-nav-list');
        if (!mobileMenu) return;
        
        if (direction === 'in') {
            mobileMenu.style.transform = 'translateX(0)';
            mobileMenu.style.opacity = '1';
        } else {
            mobileMenu.style.transform = 'translateX(-100%)';
            mobileMenu.style.opacity = '0';
        }
    }

    toggleDropdown(item) {
        const dropdown = item.querySelector('.dropdown-menu');
        const isActive = item.classList.contains('active');
        
        // 다른 드롭다운들 닫기
        document.querySelectorAll('.nav-item.has-dropdown.active').forEach(activeItem => {
            if (activeItem !== item) {
                activeItem.classList.remove('active');
                const activeDropdown = activeItem.querySelector('.dropdown-menu');
                if (activeDropdown) {
                    activeDropdown.classList.remove('show');
                }
            }
        });
        
        if (isActive) {
            item.classList.remove('active');
            dropdown.classList.remove('show');
        } else {
            item.classList.add('active');
            dropdown.classList.add('show');
        }
    }

    handleScroll() {
        const navigation = document.querySelector('.main-navigation');
        if (navigation) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 50) {
                navigation.classList.add('scrolled');
            } else {
                navigation.classList.remove('scrolled');
            }
        }
    }

    handleResize() {
        // 화면 크기 변경 시 모바일 메뉴 닫기
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
            
            // 드롭다운 상태 초기화
            document.querySelectorAll('.nav-item.has-dropdown.active').forEach(item => {
                item.classList.remove('active');
                const dropdown = item.querySelector('.dropdown-menu');
                if (dropdown) {
                    dropdown.classList.remove('show');
                }
            });
        }
    }

    handleOutsideClick(event) {
        const navigation = document.querySelector('.main-navigation');
        const mobileMenu = document.querySelector('.main-nav-list');
        
        // 모바일 메뉴 외부 클릭 시 닫기
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!navigation.contains(event.target)) {
                this.closeMobileMenu();
            }
        }
        
        // 드롭다운 외부 클릭 시 닫기
        const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
        dropdownItems.forEach(item => {
            if (!item.contains(event.target)) {
                item.classList.remove('active');
                const dropdown = item.querySelector('.dropdown-menu');
                if (dropdown) {
                    dropdown.classList.remove('show');
                }
            }
        });
    }

    // 북마크 기능
    setupBookmark() {
        const bookmarkBtn = document.querySelector('.bookmark-btn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', () => this.toggleBookmark());
        }
    }

    toggleBookmark() {
        const bookmarkBtn = document.querySelector('.bookmark-btn');
        if (bookmarkBtn) {
            const isBookmarked = bookmarkBtn.classList.contains('active');
            
            if (isBookmarked) {
                bookmarkBtn.classList.remove('active');
                this.removeBookmark();
            } else {
                bookmarkBtn.classList.add('active');
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
        const shareBtn = document.querySelector('.share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.sharePage());
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
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        });

        // 포커스 관리
        const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
        dropdownItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            const dropdown = item.querySelector('.dropdown-menu');
            
            if (link && dropdown) {
                link.addEventListener('focus', () => {
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
        
        // 스크롤 이벤트 최적화
        this.handleScroll = this.debounce(this.handleScroll, 10);
        this.handleResize = this.debounce(this.handleResize, 250);
    }
}

// 인스턴스 생성 및 초기화
document.addEventListener('DOMContentLoaded', () => {
    const navigation = new Navigation();
    navigation.afterInit();
});

// 전역으로 내보내기
window.Navigation = Navigation; 