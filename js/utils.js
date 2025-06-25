/**
 * Utility Functions
 * 공통으로 사용되는 유틸리티 함수들
 */

// DOM 요소 선택 헬퍼
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// 이벤트 리스너 등록 헬퍼
const on = (element, event, handler, options = {}) => {
    element.addEventListener(event, handler, options);
};

// 이벤트 리스너 제거 헬퍼
const off = (element, event, handler, options = {}) => {
    element.removeEventListener(event, handler, options);
};

// 클래스 조작 헬퍼
const addClass = (element, className) => {
    element.classList.add(className);
};

const removeClass = (element, className) => {
    element.classList.remove(className);
};

const toggleClass = (element, className) => {
    element.classList.toggle(className);
};

const hasClass = (element, className) => {
    return element.classList.contains(className);
};

// 스타일 조작 헬퍼
const setStyle = (element, property, value) => {
    element.style[property] = value;
};

const getStyle = (element, property) => {
    return getComputedStyle(element)[property];
};

// 애니메이션 헬퍼
const animate = (element, keyframes, options = {}) => {
    return element.animate(keyframes, {
        duration: 300,
        easing: 'ease-in-out',
        fill: 'forwards',
        ...options
    });
};

// 디바운스 함수
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// 쓰로틀 함수
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// 로컬 스토리지 헬퍼
const storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Failed to get from localStorage:', error);
            return defaultValue;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Failed to set to localStorage:', error);
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
        }
    }
};

// 쿠키 헬퍼
const cookies = {
    get: (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    },
    
    set: (name, value, days = 7) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },
    
    remove: (name) => {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
};

// URL 파라미터 헬퍼
const urlParams = {
    get: (name) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },
    
    set: (name, value) => {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    },
    
    remove: (name) => {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.replaceState({}, '', url);
    },
    
    getAll: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        return params;
    }
};

// 랜덤 값 생성
const random = {
    int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    float: (min, max) => Math.random() * (max - min) + min,
    choice: (array) => array[Math.floor(Math.random() * array.length)],
    id: (length = 8) => Math.random().toString(36).substring(2, length + 2)
};

// 시간 포맷팅
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 파일 크기 포맷팅
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 숫자 포맷팅
const formatNumber = (num, locale = 'ko-KR') => {
    return new Intl.NumberFormat(locale).format(num);
};

// 날짜 포맷팅
const formatDate = (date, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    };
    return new Intl.DateTimeFormat('ko-KR', defaultOptions).format(new Date(date));
};

// 텍스트 자르기
const truncateText = (text, maxLength, suffix = '...') => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + suffix;
};

// 스크롤 위치 가져오기
const getScrollPosition = () => {
    return {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
    };
};

// 스크롤 위치 설정
const setScrollPosition = (x, y) => {
    window.scrollTo(x, y);
};

// 요소가 뷰포트에 보이는지 확인
const isElementInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

// 요소가 부분적으로 보이는지 확인
const isElementPartiallyInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom > 0 &&
        rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
        rect.right > 0
    );
};

// 스크롤 이벤트 리스너
const onScroll = (callback, options = {}) => {
    const throttledCallback = throttle(callback, options.throttle || 16);
    on(window, 'scroll', throttledCallback, { passive: true });
};

// 리사이즈 이벤트 리스너
const onResize = (callback, options = {}) => {
    const debouncedCallback = debounce(callback, options.debounce || 250);
    on(window, 'resize', debouncedCallback, { passive: true });
};

// 클릭 외부 감지
const onClickOutside = (element, callback) => {
    const handleClick = (event) => {
        if (!element.contains(event.target)) {
            callback(event);
        }
    };
    on(document, 'click', handleClick);
    return () => off(document, 'click', handleClick);
};

// 키보드 이벤트 리스너
const onKeyPress = (callback, keys = []) => {
    const handleKeyPress = (event) => {
        if (keys.length === 0 || keys.includes(event.key)) {
            callback(event);
        }
    };
    on(document, 'keydown', handleKeyPress);
    return () => off(document, 'keydown', handleKeyPress);
};

// 복사 기능
const copyToClipboard = (text) => {
    return new Promise((resolve, reject) => {
        if (!text) {
            return reject(new Error('Clipboard write failed: text is empty.'));
        }

        if (!navigator.clipboard) {
            // Clipboard API 미지원 시 폴백 로직
            try {
                const textArea = createElement('textarea', {
                    value: text,
                    style: { position: 'fixed', opacity: '0' }
                });
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    resolve(true);
                } else {
                    reject(new Error('Fallback clipboard copy failed.'));
                }
            } catch (err) {
                console.error('Fallback clipboard error:', err);
                reject(err);
            }
            return;
        }

        // Clipboard API 사용
        navigator.clipboard.writeText(text).then(() => {
            resolve(true);
        }).catch(err => {
            console.error('Clipboard write failed:', err);
            reject(err);
        });
    });
};

// 다운로드 기능
const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// 이미지 프리로드
const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

// 여러 이미지 프리로드
const preloadImages = (srcs) => {
    return Promise.all(srcs.map(src => preloadImage(src)));
};

// 로딩 상태 관리
const loading = {
    show: (message = '로딩 중...') => {
        const loadingEl = $('#loading-screen');
        if (loadingEl) {
            const textEl = loadingEl.querySelector('.loading-text');
            if (textEl) textEl.textContent = message;
            removeClass(loadingEl, 'hidden');
        }
    },
    
    hide: () => {
        const loadingEl = $('#loading-screen');
        if (loadingEl) {
            addClass(loadingEl, 'hidden');
        }
    }
};

// 토스트 메시지
const toast = {
    show: (message, type = 'info', duration = 3000) => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close" aria-label="닫기">×</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // 애니메이션
        requestAnimationFrame(() => {
            addClass(toast, 'show');
        });
        
        // 자동 제거
        const autoRemove = setTimeout(() => {
            toast.hide();
        }, duration);
        
        // 수동 제거
        const closeBtn = toast.querySelector('.toast-close');
        on(closeBtn, 'click', () => {
            clearTimeout(autoRemove);
            toast.hide();
        });
        
        return toast;
    },
    
    hide: (toast) => {
        removeClass(toast, 'show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
};

// 모달 관리
const modal = {
    show: (content, options = {}) => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${options.title || ''}</h3>
                    <button class="modal-close" aria-label="닫기">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 애니메이션
        requestAnimationFrame(() => {
            addClass(modal, 'show');
        });
        
        // 닫기 이벤트
        const closeModal = () => modal.hide();
        const closeBtn = modal.querySelector('.modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        on(closeBtn, 'click', closeModal);
        on(backdrop, 'click', closeModal);
        
        // ESC 키로 닫기
        const escHandler = (event) => {
            if (event.key === 'Escape') {
                closeModal();
                off(document, 'keydown', escHandler);
            }
        };
        on(document, 'keydown', escHandler);
        
        modal.hide = () => {
            removeClass(modal, 'show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };
        
        return modal;
    }
};

// 테마 관리
const theme = {
    get: () => {
        return storage.get('theme', 'light');
    },
    
    set: (themeName) => {
        document.documentElement.setAttribute('data-theme', themeName);
        storage.set('theme', themeName);
    },
    
    toggle: () => {
        const currentTheme = theme.get();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        theme.set(newTheme);
        return newTheme;
    },
    
    init: () => {
        const savedTheme = theme.get();
        theme.set(savedTheme);
    }
};

// 언어 관리
const language = {
    get: () => {
        return storage.get('language', 'ko');
    },
    
    set: (lang) => {
        document.documentElement.setAttribute('lang', lang);
        storage.set('language', lang);
    },
    
    init: () => {
        const savedLang = language.get();
        language.set(savedLang);
    }
};

// 성능 측정
const performance = {
    measure: (name, fn) => {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    },
    
    async measureAsync: async (name, fn) => {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        console.log(`${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    }
};

// 에러 핸들링
const errorHandler = {
    init: () => {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            // 에러 로깅 서비스로 전송
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            // 에러 로깅 서비스로 전송
        });
    }
};

const createElement = (tagName, options = {}) => {
    const element = document.createElement(tagName);
    Object.entries(options).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else {
            element.setAttribute(key, value);
        }
    });
    return element;
};

const trigger = (element, eventName, detail = {}) => {
    const event = new CustomEvent(eventName, { detail, bubbles: true });
    element.dispatchEvent(event);
};

// 유틸리티 초기화 및 전역 노출
const initUtils = () => {
    const utils = {
        $, $$,
        on, off,
        addClass, removeClass, toggleClass, hasClass,
        setStyle, getStyle,
        animate,
        debounce, throttle,
        storage, cookies, urlParams,
        random,
        formatTime, formatFileSize, formatNumber, formatDate,
        truncateText,
        getScrollPosition, setScrollPosition,
        isElementInViewport, isElementPartiallyInViewport,
        onScroll, onResize, onClickOutside, onKeyPress,
        copyToClipboard,
        downloadFile,
        preloadImage, preloadImages,
        createModal,
        createElement,
        trigger,
        // 아래 함수들은 추가 정의가 필요합니다.
        // supportsFeature, ready 등
    };

    window.utils = utils;
    console.log('Utilities initialized and exposed to window.utils');
};

// DOM이 준비되면 유틸리티 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUtils);
} else {
    initUtils();
} 