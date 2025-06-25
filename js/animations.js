/**
 * Animations Manager
 * 스크롤 기반 애니메이션 및 인터랙션 효과 관리
 */

class AnimationsManager {
    constructor() {
        if (!window.utils) {
            console.error('AnimationsManager Error: window.utils is not defined. Animations will not initialize.');
            return;
        }

        this.utils = window.utils;
        
        this.elements = {
            scrollRevealElements: this.utils.$$('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'),
            parallaxElements: this.utils.$$('[data-parallax]'),
            counterElements: this.utils.$$('[data-counter]'),
            progressBars: this.utils.$$('[data-progress]'),
            typewriterElements: this.utils.$$('[data-typewriter]'),
            morphingElements: this.utils.$$('[data-morph]'),
            particleContainers: this.utils.$$('[data-particles]')
        };
        
        this.state = {
            isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            lastScrollY: 0,
            isScrolling: false,
            animatedElements: new Set(),
            runningAnimations: new Map(),
            observers: new Map(),
            rafId: null
        };
        
        this.config = {
            // 관찰자 설정
            intersectionThreshold: 0.1,
            intersectionRootMargin: '-10% 0px',
            
            // 애니메이션 설정
            animationDelay: 100,
            staggerDelay: 150,
            parallaxIntensity: 0.5,
            
            // 성능 설정
            throttleDelay: 16, // 60fps
            debounceDelay: 300
        };
        
        // 애니메이션 타입별 설정
        this.animationTypes = {
            'fade-in': { duration: 800, delay: 0 },
            'fade-in-up': { duration: 800, delay: 0 },
            'fade-in-down': { duration: 800, delay: 0 },
            'fade-in-left': { duration: 800, delay: 0 },
            'fade-in-right': { duration: 800, delay: 0 },
            'scale-in': { duration: 600, delay: 0 },
            'slide-in-up': { duration: 700, delay: 0 },
            'bounce-in': { duration: 1000, delay: 0 },
            'rotate-in': { duration: 800, delay: 0 }
        };
        
        this.init();
    }
    
    init() {
        if (this.state.isReducedMotion) {
            console.log('Reduced motion detected, disabling complex animations');
            this.disableAnimations();
            return;
        }
        
        this.setupObservers();
        this.bindEvents();
        this.initializeScrollReveal();
        this.initializeParallax();
        this.initializeCounters();
        this.initializeProgressBars();
        this.initializeTypewriter();
        this.initializeParticles();
        
        console.log('Animations Manager initialized');
    }
    
    setupObservers() {
        // 스크롤 리빌 옵저버
        if (this.utils.supportsFeature('intersectionObserver')) {
            this.createScrollRevealObserver();
            this.createParallaxObserver();
            this.createCounterObserver();
        }
        
        // 리사이즈 옵저버 (지원하는 경우)
        if ('ResizeObserver' in window) {
            this.createResizeObserver();
        }
    }
    
    createScrollRevealObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.revealElement(entry.target);
                } else if (entry.boundingClientRect.top > 0) {
                    // 요소가 뷰포트 위쪽으로 나가면 애니메이션 리셋 (옵션)
                    this.hideElement(entry.target);
                }
            });
        }, {
            threshold: this.config.intersectionThreshold,
            rootMargin: this.config.intersectionRootMargin
        });
        
        this.elements.scrollRevealElements.forEach(element => {
            observer.observe(element);
        });
        
        this.state.observers.set('scrollReveal', observer);
    }
    
    createParallaxObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                if (entry.isIntersecting) {
                    this.enableParallax(element);
                } else {
                    this.disableParallax(element);
                }
            });
        }, {
            threshold: 0,
            rootMargin: '50px 0px'
        });
        
        this.elements.parallaxElements.forEach(element => {
            observer.observe(element);
        });
        
        this.state.observers.set('parallax', observer);
    }
    
    createCounterObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        this.elements.counterElements.forEach(element => {
            observer.observe(element);
        });
        
        this.state.observers.set('counter', observer);
    }
    
    createResizeObserver() {
        const resizeObserver = new ResizeObserver(this.utils.debounce((entries) => {
            this.handleResize(entries);
        }, this.config.debounceDelay));
        
        // 파티클 컨테이너 관찰
        this.elements.particleContainers.forEach(container => {
            resizeObserver.observe(container);
        });
        
        this.state.observers.set('resize', resizeObserver);
    }
    
    bindEvents() {
        // 스크롤 이벤트
        const throttledScrollHandler = this.utils.throttle(() => {
            this.handleScroll();
        }, this.config.throttleDelay);
        
        this.utils.on(window, 'scroll', throttledScrollHandler);
        
        // 리사이즈 이벤트
        this.utils.on(window, 'resize', this.utils.debounce(() => {
            this.handleWindowResize();
        }, this.config.debounceDelay));
        
        // 페이지 가시성 변경
        this.utils.on(document, 'visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // 모션 설정 변경 감지
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.utils.on(motionQuery, 'change', (e) => {
            this.state.isReducedMotion = e.matches;
            if (e.matches) {
                this.disableAnimations();
            } else {
                this.enableAnimations();
            }
        });
    }
    
    initializeScrollReveal() {
        // 초기 상태 설정
        this.elements.scrollRevealElements.forEach(element => {
            this.prepareElement(element);
        });
    }
    
    prepareElement(element) {
        if (this.state.animatedElements.has(element)) return;
        
        // 데이터 속성에서 애니메이션 설정 읽기
        const animationType = element.dataset.animation || this.getAnimationTypeFromClass(element);
        const delay = parseInt(element.dataset.delay) || 0;
        const duration = parseInt(element.dataset.duration) || this.animationTypes[animationType]?.duration || 800;
        
        // 초기 상태 설정
        element.style.opacity = '0';
        element.style.transform = this.getInitialTransform(animationType);
        element.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`;
        
        // 애니메이션 데이터 저장
        element.animationConfig = {
            type: animationType,
            delay,
            duration,
            isRevealed: false
        };
    }
    
    getAnimationTypeFromClass(element) {
        const classes = element.className.split(' ');
        
        for (const className of classes) {
            if (className.includes('scroll-reveal-left')) return 'fade-in-left';
            if (className.includes('scroll-reveal-right')) return 'fade-in-right';
            if (className.includes('scroll-reveal-scale')) return 'scale-in';
            if (className.includes('scroll-reveal')) return 'fade-in-up';
        }
        
        return 'fade-in-up';
    }
    
    getInitialTransform(animationType) {
        const transforms = {
            'fade-in': 'translateY(0px)',
            'fade-in-up': 'translateY(30px)',
            'fade-in-down': 'translateY(-30px)',
            'fade-in-left': 'translateX(-30px)',
            'fade-in-right': 'translateX(30px)',
            'scale-in': 'scale(0.8)',
            'slide-in-up': 'translateY(100px)',
            'bounce-in': 'scale(0.3)',
            'rotate-in': 'rotate(-5deg) scale(0.8)'
        };
        
        return transforms[animationType] || 'translateY(30px)';
    }
    
    revealElement(element) {
        if (!element.animationConfig || element.animationConfig.isRevealed) return;
        
        element.animationConfig.isRevealed = true;
        this.state.animatedElements.add(element);
        
        // 스태거 애니메이션 처리
        const staggerGroup = element.dataset.stagger;
        if (staggerGroup) {
            this.handleStaggerAnimation(element, staggerGroup);
            return;
        }
        
        // 일반 애니메이션 실행
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0px) translateX(0px) scale(1) rotate(0deg)';
            
            this.utils.addClass(element, 'revealed');
        });
        
        // 애니메이션 완료 후 이벤트 발생
        setTimeout(() => {
            this.utils.trigger(element, 'animationComplete', {
                type: element.animationConfig.type,
                element: element
            });
        }, element.animationConfig.duration + element.animationConfig.delay);
    }
    
    hideElement(element) {
        if (!element.animationConfig || !element.animationConfig.isRevealed) return;
        
        // 리버스 애니메이션 (옵션에 따라)
        const allowReverse = element.dataset.reverse === 'true';
        if (!allowReverse) return;
        
        element.animationConfig.isRevealed = false;
        this.state.animatedElements.delete(element);
        
        element.style.opacity = '0';
        element.style.transform = this.getInitialTransform(element.animationConfig.type);
        
        this.utils.removeClass(element, 'revealed');
    }
    
    handleStaggerAnimation(element, staggerGroup) {
        const staggerElements = this.utils.$$(`[data-stagger="${staggerGroup}"]`);
        const elementIndex = Array.from(staggerElements).indexOf(element);
        const staggerDelay = elementIndex * this.config.staggerDelay;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0px) translateX(0px) scale(1) rotate(0deg)';
            this.utils.addClass(element, 'revealed');
        }, staggerDelay);
    }
    
    initializeParallax() {
        this.elements.parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || this.config.parallaxIntensity;
            const direction = element.dataset.parallaxDirection || 'vertical';
            
            element.parallaxConfig = {
                speed,
                direction,
                enabled: false,
                initialY: element.offsetTop
            };
        });
    }
    
    enableParallax(element) {
        if (element.parallaxConfig) {
            element.parallaxConfig.enabled = true;
        }
    }
    
    disableParallax(element) {
        if (element.parallaxConfig) {
            element.parallaxConfig.enabled = false;
            element.style.transform = '';
        }
    }
    
    initializeCounters() {
        this.elements.counterElements.forEach(element => {
            const target = parseInt(element.dataset.counter) || parseInt(element.textContent);
            const duration = parseInt(element.dataset.counterDuration) || 2000;
            const format = element.dataset.counterFormat || 'number';
            
            element.counterConfig = {
                target,
                duration,
                format,
                hasAnimated: false
            };
            
            element.textContent = '0';
        });
    }
    
    animateCounter(element) {
        if (!element.counterConfig || element.counterConfig.hasAnimated) return;
        
        element.counterConfig.hasAnimated = true;
        const { target, duration, format } = element.counterConfig;
        
        const startTime = performance.now();
        const startValue = 0;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.round(startValue + (target - startValue) * easeOutQuart);
            
            element.textContent = this.formatCounterValue(currentValue, format);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = this.formatCounterValue(target, format);
                this.utils.trigger(element, 'counterComplete', { target, element });
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    formatCounterValue(value, format) {
        switch (format) {
            case 'currency':
                return new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: 'KRW'
                }).format(value);
            case 'percentage':
                return value + '%';
            case 'decimal':
                return value.toLocaleString('ko-KR');
            default:
                return value.toString();
        }
    }
    
    initializeProgressBars() {
        this.elements.progressBars.forEach(element => {
            const target = parseInt(element.dataset.progress) || 100;
            const duration = parseInt(element.dataset.progressDuration) || 1500;
            
            element.progressConfig = {
                target,
                duration,
                hasAnimated: false
            };
            
            // 프로그레스 바 초기 설정
            const fill = this.utils.$('.progress-fill', element) || element;
            fill.style.width = '0%';
            fill.style.transition = `width ${duration}ms ease-out`;
        });
        
        // 프로그레스 바 관찰
        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateProgressBar(entry.target);
                    progressObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        this.elements.progressBars.forEach(element => {
            progressObserver.observe(element);
        });
    }
    
    animateProgressBar(element) {
        if (!element.progressConfig || element.progressConfig.hasAnimated) return;
        
        element.progressConfig.hasAnimated = true;
        const { target } = element.progressConfig;
        
        const fill = this.utils.$('.progress-fill', element) || element;
        
        requestAnimationFrame(() => {
            fill.style.width = `${target}%`;
        });
        
        // 수치 애니메이션 (있는 경우)
        const counter = this.utils.$('.progress-counter', element);
        if (counter) {
            this.animateProgressCounter(counter, target, element.progressConfig.duration);
        }
    }
    
    animateProgressCounter(counterElement, target, duration) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(target * easeOut);
            
            counterElement.textContent = currentValue + '%';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                counterElement.textContent = target + '%';
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    initializeTypewriter() {
        this.elements.typewriterElements.forEach(element => {
            const text = element.textContent;
            const speed = parseInt(element.dataset.typewriterSpeed) || 50;
            const delay = parseInt(element.dataset.typewriterDelay) || 0;
            
            element.typewriterConfig = {
                text,
                speed,
                delay,
                hasAnimated: false
            };
            
            element.textContent = '';
        });
        
        // 타이프라이터 관찰
        const typewriterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateTypewriter(entry.target);
                    typewriterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        this.elements.typewriterElements.forEach(element => {
            typewriterObserver.observe(element);
        });
    }
    
    animateTypewriter(element) {
        if (!element.typewriterConfig || element.typewriterConfig.hasAnimated) return;
        
        element.typewriterConfig.hasAnimated = true;
        const { text, speed, delay } = element.typewriterConfig;
        
        setTimeout(() => {
            let index = 0;
            const cursor = this.utils.createElement('span', {
                className: 'typewriter-cursor',
                textContent: '|'
            });
            
            element.appendChild(cursor);
            
            const typeInterval = setInterval(() => {
                if (index < text.length) {
                    element.insertBefore(document.createTextNode(text[index]), cursor);
                    index++;
                } else {
                    clearInterval(typeInterval);
                    // 커서 깜빡임 효과
                    this.utils.addClass(cursor, 'animate-blink');
                    
                    // 몇 초 후 커서 제거
                    setTimeout(() => {
                        cursor.remove();
                        this.utils.trigger(element, 'typewriterComplete', { text, element });
                    }, 2000);
                }
            }, speed);
        }, delay);
    }
    
    initializeParticles() {
        this.elements.particleContainers.forEach(container => {
            const count = parseInt(container.dataset.particles) || 50;
            const type = container.dataset.particleType || 'dots';
            const color = container.dataset.particleColor || '#3b82f6';
            
            this.createParticleSystem(container, { count, type, color });
        });
    }
    
    createParticleSystem(container, options) {
        const { count, type, color } = options;
        
        for (let i = 0; i < count; i++) {
            const particle = this.utils.createElement('div', {
                className: `particle particle-${type}`,
                style: {
                    position: 'absolute',
                    width: '4px',
                    height: '4px',
                    backgroundColor: color,
                    borderRadius: '50%',
                    opacity: Math.random() * 0.8 + 0.2,
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                    animation: `particleFloat ${Math.random() * 20 + 10}s linear infinite`
                }
            });
            
            container.appendChild(particle);
        }
    }
    
    handleScroll() {
        const currentScrollY = this.utils.getScrollPosition().y;
        const scrollDirection = currentScrollY > this.state.lastScrollY ? 'down' : 'up';
        
        this.state.lastScrollY = currentScrollY;
        this.state.isScrolling = true;
        
        // 패럴랙스 효과 업데이트
        this.updateParallax(currentScrollY);
        
        // 스크롤 방향에 따른 추가 효과
        this.handleScrollDirection(scrollDirection);
        
        // 스크롤 진행률 업데이트
        this.updateScrollProgress();
        
        // 스크롤 완료 처리
        clearTimeout(this.scrollEndTimer);
        this.scrollEndTimer = setTimeout(() => {
            this.state.isScrolling = false;
        }, 150);
    }
    
    updateParallax(scrollY) {
        this.elements.parallaxElements.forEach(element => {
            if (!element.parallaxConfig || !element.parallaxConfig.enabled) return;
            
            const { speed, direction } = element.parallaxConfig;
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // 요소가 뷰포트에 있을 때만 계산
            if (rect.bottom >= 0 && rect.top <= windowHeight) {
                const scrollProgress = (scrollY - element.offsetTop + windowHeight) / (windowHeight + element.offsetHeight);
                const translateValue = scrollProgress * speed * 100;
                
                if (direction === 'horizontal') {
                    element.style.transform = `translateX(${translateValue}px)`;
                } else {
                    element.style.transform = `translateY(${translateValue}px)`;
                }
            }
        });
    }
    
    handleScrollDirection(direction) {
        // 스크롤 방향에 따른 클래스 추가/제거
        document.body.setAttribute('data-scroll-direction', direction);
        
        // 방향별 애니메이션 트리거
        const directionElements = this.utils.$$(`[data-scroll-${direction}]`);
        directionElements.forEach(element => {
            this.utils.addClass(element, `scroll-${direction}`);
        });
    }
    
    updateScrollProgress() {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = (this.state.lastScrollY / scrollHeight) * 100;
        
        // 프로그레스 바 업데이트
        const progressBars = this.utils.$$('.scroll-progress-bar');
        progressBars.forEach(bar => {
            bar.style.width = `${scrollProgress}%`;
        });
        
        // 커스텀 이벤트 발생
        this.utils.trigger(document, 'scrollProgress', {
            progress: scrollProgress,
            scrollY: this.state.lastScrollY
        });
    }
    
    handleWindowResize() {
        // 패럴랙스 요소 위치 재계산
        this.elements.parallaxElements.forEach(element => {
            if (element.parallaxConfig) {
                element.parallaxConfig.initialY = element.offsetTop;
            }
        });
        
        // 파티클 시스템 재조정
        this.adjustParticleSystems();
    }
    
    handleResize(entries) {
        entries.forEach(entry => {
            const element = entry.target;
            
            if (element.classList.contains('particle-container')) {
                this.adjustParticleContainer(element);
            }
        });
    }
    
    adjustParticleSystems() {
        this.elements.particleContainers.forEach(container => {
            this.adjustParticleContainer(container);
        });
    }
    
    adjustParticleContainer(container) {
        const particles = this.utils.$$('.particle', container);
        const containerRect = container.getBoundingClientRect();
        
        particles.forEach(particle => {
            // 파티클 위치 재조정
            if (parseFloat(particle.style.left) > 100) {
                particle.style.left = Math.random() * 100 + '%';
            }
            if (parseFloat(particle.style.top) > 100) {
                particle.style.top = Math.random() * 100 + '%';
            }
        });
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // 페이지가 숨겨질 때 애니메이션 일시정지
            this.pauseAnimations();
        } else {
            // 페이지가 다시 보일 때 애니메이션 재개
            this.resumeAnimations();
        }
    }
    
    pauseAnimations() {
        document.body.style.animationPlayState = 'paused';
        
        this.state.runningAnimations.forEach((animation, element) => {
            if (animation.pause) {
                animation.pause();
            }
        });
    }
    
    resumeAnimations() {
        document.body.style.animationPlayState = 'running';
        
        this.state.runningAnimations.forEach((animation, element) => {
            if (animation.play) {
                animation.play();
            }
        });
    }
    
    disableAnimations() {
        // 모든 애니메이션 비활성화
        this.elements.scrollRevealElements.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'none';
            element.style.transition = 'none';
            this.utils.addClass(element, 'revealed');
        });
        
        // 패럴랙스 비활성화
        this.elements.parallaxElements.forEach(element => {
            element.style.transform = '';
        });
        
        // CSS 애니메이션 비활성화
        document.body.style.animation = 'none';
        
        console.log('Animations disabled due to reduced motion preference');
    }
    
    enableAnimations() {
        // 애니메이션 재활성화
        this.state.animatedElements.clear();
        
        this.elements.scrollRevealElements.forEach(element => {
            if (element.animationConfig) {
                element.animationConfig.isRevealed = false;
            }
            this.utils.removeClass(element, 'revealed');
            this.prepareElement(element);
        });
        
        document.body.style.animation = '';
        
        console.log('Animations enabled');
    }
    
    // 공개 메서드
    animateElement(element, animationType = 'fade-in-up', options = {}) {
        const config = {
            duration: options.duration || 800,
            delay: options.delay || 0,
            easing: options.easing || 'ease-out'
        };
        
        element.style.opacity = '0';
        element.style.transform = this.getInitialTransform(animationType);
        element.style.transition = `all ${config.duration}ms ${config.easing} ${config.delay}ms`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0px) translateX(0px) scale(1) rotate(0deg)';
        });
        
        return new Promise(resolve => {
            setTimeout(resolve, config.duration + config.delay);
        });
    }
    
    createStaggerAnimation(elements, options = {}) {
        const delay = options.staggerDelay || this.config.staggerDelay;
        const animationType = options.type || 'fade-in-up';
        
        elements.forEach((element, index) => {
            setTimeout(() => {
                this.animateElement(element, animationType, {
                    duration: options.duration,
                    easing: options.easing
                });
            }, index * delay);
        });
    }
    
    addScrollReveal(element, options = {}) {
        element.dataset.animation = options.type || 'fade-in-up';
        element.dataset.delay = options.delay || '0';
        element.dataset.duration = options.duration || '800';
        
        this.prepareElement(element);
        
        const observer = this.state.observers.get('scrollReveal');
        if (observer) {
            observer.observe(element);
        }
    }
    
    removeScrollReveal(element) {
        const observer = this.state.observers.get('scrollReveal');
        if (observer) {
            observer.unobserve(element);
        }
        
        this.state.animatedElements.delete(element);
        element.style.opacity = '';
        element.style.transform = '';
        element.style.transition = '';
    }
    
    getAnimationProgress() {
        return {
            revealed: this.state.animatedElements.size,
            total: this.elements.scrollRevealElements.length,
            percentage: (this.state.animatedElements.size / this.elements.scrollRevealElements.length) * 100
        };
    }
    
    destroy() {
        // 모든 관찰자 해제
        this.state.observers.forEach(observer => {
            observer.disconnect();
        });
        
        // 실행 중인 애니메이션 정리
        this.state.runningAnimations.forEach((animation, element) => {
            if (animation.cancel) {
                animation.cancel();
            }
        });
        
        // RAF 정리
        if (this.state.rafId) {
            cancelAnimationFrame(this.state.rafId);
        }
        
        console.log('Animations Manager destroyed');
    }
}

// AnimationsManager 인스턴스 생성
document.addEventListener('DOMContentLoaded', () => {
    window.animationsManager = new AnimationsManager();
});

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationsManager;
}

console.log('Animations system loaded');