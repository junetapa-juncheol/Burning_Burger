/**
 * Hero Section
 * 히어로 배너 및 프로필 섹션 기능
 */

class HeroSection {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAnimations();
        this.setupCounters();
        this.setupFloatingElements();
        this.setupProfileCard();
    }

    bindEvents() {
        // 배너 액션 버튼들
        const primaryBtn = document.querySelector('.btn-primary');
        const secondaryBtn = document.querySelector('.btn-secondary');
        
        if (primaryBtn) {
            primaryBtn.addEventListener('click', (e) => this.handlePrimaryAction(e));
        }
        
        if (secondaryBtn) {
            secondaryBtn.addEventListener('click', (e) => this.handleSecondaryAction(e));
        }

        // 프로필 액션 버튼들
        const profileBtns = document.querySelectorAll('.profile-btn');
        profileBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleProfileAction(e));
        });

        // 퀵 액세스 아이템들
        const quickAccessItems = document.querySelectorAll('.quick-access-item');
        quickAccessItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleQuickAccess(e));
        });

        // 스크롤 이벤트
        window.addEventListener('scroll', () => this.handleScroll());
        
        // 리사이즈 이벤트
        window.addEventListener('resize', () => this.handleResize());
    }

    setupAnimations() {
        // 배너 콘텐츠 애니메이션
        this.animateBannerContent();
        
        // 프로필 카드 애니메이션
        this.animateProfileCard();
        
        // 퀵 액세스 그리드 애니메이션
        this.animateQuickAccess();
    }

    animateBannerContent() {
        const bannerElements = [
            '.banner-badge',
            '.banner-title',
            '.banner-description',
            '.banner-meta',
            '.banner-actions'
        ];

        bannerElements.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    element.style.transition = 'all 0.6s ease-out';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
    }

    animateProfileCard() {
        const profileCard = document.querySelector('.profile-card');
        if (profileCard) {
            profileCard.style.opacity = '0';
            profileCard.style.transform = 'scale(0.9) translateY(20px)';
            
            setTimeout(() => {
                profileCard.style.transition = 'all 0.8s ease-out';
                profileCard.style.opacity = '1';
                profileCard.style.transform = 'scale(1) translateY(0)';
            }, 600);
        }
    }

    animateQuickAccess() {
        const quickAccessItems = document.querySelectorAll('.quick-access-item');
        
        quickAccessItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8) translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.5s ease-out';
                item.style.opacity = '1';
                item.style.transform = 'scale(1) translateY(0)';
            }, 800 + (index * 100));
        });
    }

    setupCounters() {
        // 통계 카운터 애니메이션
        const counterNumbers = document.querySelectorAll('.counter-number');
        
        counterNumbers.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2초
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            // Intersection Observer로 화면에 보일 때 시작
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }

    setupFloatingElements() {
        const floatingElements = document.querySelectorAll('.floating-element');
        
        floatingElements.forEach((element, index) => {
            // 랜덤한 애니메이션 지연
            const delay = Math.random() * 2;
            element.style.animationDelay = `${delay}s`;
            
            // 마우스 호버 효과
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'scale(1.2) rotate(10deg)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'scale(1) rotate(0deg)';
            });
        });
    }

    setupProfileCard() {
        const profileCard = document.querySelector('.profile-card');
        if (!profileCard) return;

        // 프로필 카드 호버 효과
        profileCard.addEventListener('mouseenter', () => {
            profileCard.style.transform = 'translateY(-5px) scale(1.02)';
            profileCard.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });

        profileCard.addEventListener('mouseleave', () => {
            profileCard.style.transform = 'translateY(0) scale(1)';
            profileCard.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        });

        // 프로필 이미지 효과
        const profileImage = document.querySelector('.profile-image');
        if (profileImage) {
            profileImage.addEventListener('load', () => {
                profileImage.style.opacity = '1';
                profileImage.style.transform = 'scale(1)';
            });
        }
    }

    handlePrimaryAction(event) {
        event.preventDefault();
        
        // 지원하기 버튼 클릭 시
        const targetSection = document.querySelector('#contact');
        if (targetSection) {
            targetSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        // 이벤트 추적
        this.trackEvent('hero_primary_action', '지원하기 버튼 클릭');
    }

    handleSecondaryAction(event) {
        event.preventDefault();
        
        // 포트폴리오 보기 버튼 클릭 시
        const targetSection = document.querySelector('#portfolio');
        if (targetSection) {
            targetSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        // 이벤트 추적
        this.trackEvent('hero_secondary_action', '포트폴리오 보기 버튼 클릭');
    }

    handleProfileAction(event) {
        event.preventDefault();
        
        const button = event.currentTarget;
        const isOutline = button.classList.contains('outline');
        
        if (isOutline) {
            // 연락하기 버튼
            const targetSection = document.querySelector('#contact');
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            this.trackEvent('profile_contact_action', '프로필 연락하기 버튼 클릭');
        } else {
            // 더 알아보기 버튼
            const targetSection = document.querySelector('#about');
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            this.trackEvent('profile_learn_more_action', '프로필 더 알아보기 버튼 클릭');
        }
    }

    handleQuickAccess(event) {
        event.preventDefault();
        
        const item = event.currentTarget;
        const type = item.classList.contains('web') ? 'web' :
                    item.classList.contains('app') ? 'app' :
                    item.classList.contains('music') ? 'music' : 'contact';
        
        // 해당 섹션으로 스크롤
        const targetSection = document.querySelector(`#${type}`);
        if (targetSection) {
            targetSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        // 이벤트 추적
        this.trackEvent('quick_access_click', `퀵 액세스 ${type} 클릭`);
    }

    handleScroll() {
        const heroBanner = document.querySelector('.hero-banner');
        if (!heroBanner) return;

        const scrollTop = window.pageYOffset;
        const bannerHeight = heroBanner.offsetHeight;
        
        // 패럴랙스 효과
        if (scrollTop < bannerHeight) {
            const parallaxValue = scrollTop * 0.5;
            heroBanner.style.transform = `translateY(${parallaxValue}px)`;
        }
        
        // 배경 그라데이션 변화
        const opacity = Math.max(0, 1 - (scrollTop / bannerHeight));
        heroBanner.style.opacity = opacity;
    }

    handleResize() {
        // 반응형 처리
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            if (window.innerWidth <= 768) {
                heroContent.style.gridTemplateColumns = '1fr';
            } else {
                heroContent.style.gridTemplateColumns = '2fr 1fr';
            }
        }
    }

    trackEvent(action, label) {
        // Google Analytics 이벤트 추적
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'hero_section',
                event_label: label
            });
        }
        
        // 커스텀 이벤트 발생
        const event = new CustomEvent('heroAction', {
            detail: {
                action: action,
                label: label,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(event);
    }

    // 배너 콘텐츠 동적 업데이트
    updateBannerContent(data) {
        const titleElement = document.querySelector('.banner-title');
        const descriptionElement = document.querySelector('.banner-description');
        const metaElements = document.querySelectorAll('.meta-value');
        
        if (titleElement && data.title) {
            titleElement.innerHTML = data.title;
        }
        
        if (descriptionElement && data.description) {
            descriptionElement.textContent = data.description;
        }
        
        if (data.meta && metaElements.length > 0) {
            data.meta.forEach((meta, index) => {
                if (metaElements[index]) {
                    metaElements[index].textContent = meta;
                }
            });
        }
    }

    // 프로필 정보 동적 업데이트
    updateProfileInfo(data) {
        const nameElement = document.querySelector('.profile-name');
        const titleElement = document.querySelector('.profile-title');
        const subtitleElement = document.querySelector('.profile-subtitle');
        const messageElement = document.querySelector('.message-text');
        
        if (nameElement && data.name) {
            nameElement.textContent = data.name;
        }
        
        if (titleElement && data.title) {
            titleElement.textContent = data.title;
        }
        
        if (subtitleElement && data.subtitle) {
            subtitleElement.textContent = data.subtitle;
        }
        
        if (messageElement && data.message) {
            messageElement.textContent = data.message;
        }
    }

    // 접근성 개선
    setupAccessibility() {
        // 키보드 네비게이션
        const interactiveElements = document.querySelectorAll('.btn, .profile-btn, .quick-access-item');
        
        interactiveElements.forEach(element => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        });

        // 포커스 표시
        interactiveElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.style.outline = '2px solid var(--color-primary)';
                element.style.outlineOffset = '2px';
            });
            
            element.addEventListener('blur', () => {
                element.style.outline = '';
                element.style.outlineOffset = '';
            });
        });
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
        this.setupAccessibility();
        
        // 스크롤 이벤트 최적화
        this.handleScroll = this.debounce(this.handleScroll, 10);
        this.handleResize = this.debounce(this.handleResize, 250);
        
        // 초기 리사이즈 처리
        this.handleResize();
    }
}

// 인스턴스 생성 및 초기화
document.addEventListener('DOMContentLoaded', () => {
    const heroSection = new HeroSection();
    heroSection.afterInit();
});

// 전역으로 내보내기
window.HeroSection = HeroSection; 