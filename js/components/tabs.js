/**
 * Tabs Component
 * 정보 탭 섹션의 탭 전환 기능
 */

class Tabs {
    constructor() {
        this.activeTab = 'announcements';
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupInitialState();
        this.setupAnimations();
    }

    bindEvents() {
        // 탭 버튼 클릭 이벤트
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });

        // 확장 버튼 클릭 이벤트
        const expandBtn = document.querySelector('.expand-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => this.toggleExpand());
        }

        // 키보드 네비게이션
        this.setupKeyboardNavigation();
    }

    setupInitialState() {
        // 초기 활성 탭 설정
        const defaultTab = document.querySelector('.tab-btn[data-tab="announcements"]');
        if (defaultTab) {
            defaultTab.classList.add('active');
        }

        // 초기 탭 패널 표시
        const defaultPanel = document.querySelector('#announcements');
        if (defaultPanel) {
            defaultPanel.classList.add('active');
        }
    }

    setupAnimations() {
        // 탭 전환 애니메이션 설정
        const tabPanels = document.querySelectorAll('.tab-panel');
        tabPanels.forEach(panel => {
            panel.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
        });
    }

    switchTab(tabId) {
        // 이전 활성 탭 비활성화
        const previousActiveBtn = document.querySelector('.tab-btn.active');
        const previousActivePanel = document.querySelector('.tab-panel.active');
        
        if (previousActiveBtn) {
            previousActiveBtn.classList.remove('active');
        }
        if (previousActivePanel) {
            previousActivePanel.classList.remove('active');
        }

        // 새 탭 활성화
        const newActiveBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        const newActivePanel = document.querySelector(`#${tabId}`);
        
        if (newActiveBtn) {
            newActiveBtn.classList.add('active');
        }
        if (newActivePanel) {
            newActivePanel.classList.add('active');
        }

        this.activeTab = tabId;
        
        // 탭 전환 애니메이션
        this.animateTabTransition(newActivePanel);
        
        // URL 해시 업데이트 (선택사항)
        this.updateURLHash(tabId);
        
        // 이벤트 발생
        this.dispatchTabChangeEvent(tabId);
    }

    animateTabTransition(panel) {
        if (!panel) return;
        
        // 페이드 인 애니메이션
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        }, 50);
    }

    updateURLHash(tabId) {
        // URL 해시 업데이트 (선택사항)
        const currentHash = window.location.hash;
        const newHash = `#${tabId}`;
        
        if (currentHash !== newHash) {
            window.history.replaceState(null, null, newHash);
        }
    }

    dispatchTabChangeEvent(tabId) {
        // 커스텀 이벤트 발생
        const event = new CustomEvent('tabChange', {
            detail: {
                tabId: tabId,
                tabName: this.getTabName(tabId)
            }
        });
        document.dispatchEvent(event);
    }

    getTabName(tabId) {
        const tabNames = {
            'announcements': '공지사항',
            'projects': '프로젝트 현황',
            'tech-blog': '기술 블로그',
            'tutorials': '튜토리얼'
        };
        return tabNames[tabId] || tabId;
    }

    toggleExpand() {
        const tabsContainer = document.querySelector('.tabs-container');
        const expandBtn = document.querySelector('.expand-btn');
        
        if (tabsContainer && expandBtn) {
            const isExpanded = tabsContainer.classList.contains('expanded');
            
            if (isExpanded) {
                this.collapseTabs();
            } else {
                this.expandTabs();
            }
        }
    }

    expandTabs() {
        const tabsContainer = document.querySelector('.tabs-container');
        const expandBtn = document.querySelector('.expand-btn');
        
        if (tabsContainer && expandBtn) {
            tabsContainer.classList.add('expanded');
            expandBtn.classList.add('expanded');
            
            // 확장 애니메이션
            this.animateExpand();
        }
    }

    collapseTabs() {
        const tabsContainer = document.querySelector('.tabs-container');
        const expandBtn = document.querySelector('.expand-btn');
        
        if (tabsContainer && expandBtn) {
            tabsContainer.classList.remove('expanded');
            expandBtn.classList.remove('expanded');
            
            // 축소 애니메이션
            this.animateCollapse();
        }
    }

    animateExpand() {
        const tabsHeader = document.querySelector('.tabs-header');
        if (tabsHeader) {
            tabsHeader.style.maxHeight = '200px';
            tabsHeader.style.overflow = 'visible';
        }
    }

    animateCollapse() {
        const tabsHeader = document.querySelector('.tabs-header');
        if (tabsHeader) {
            tabsHeader.style.maxHeight = '60px';
            tabsHeader.style.overflow = 'hidden';
        }
    }

    setupKeyboardNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach((button, index) => {
            button.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowRight':
                        e.preventDefault();
                        this.navigateToNextTab(index);
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.navigateToPreviousTab(index);
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.navigateToFirstTab();
                        break;
                    case 'End':
                        e.preventDefault();
                        this.navigateToLastTab();
                        break;
                }
            });
        });
    }

    navigateToNextTab(currentIndex) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const nextIndex = (currentIndex + 1) % tabButtons.length;
        const nextTab = tabButtons[nextIndex];
        
        if (nextTab) {
            const tabId = nextTab.getAttribute('data-tab');
            this.switchTab(tabId);
            nextTab.focus();
        }
    }

    navigateToPreviousTab(currentIndex) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const prevIndex = currentIndex === 0 ? tabButtons.length - 1 : currentIndex - 1;
        const prevTab = tabButtons[prevIndex];
        
        if (prevTab) {
            const tabId = prevTab.getAttribute('data-tab');
            this.switchTab(tabId);
            prevTab.focus();
        }
    }

    navigateToFirstTab() {
        const firstTab = document.querySelector('.tab-btn');
        if (firstTab) {
            const tabId = firstTab.getAttribute('data-tab');
            this.switchTab(tabId);
            firstTab.focus();
        }
    }

    navigateToLastTab() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const lastTab = tabButtons[tabButtons.length - 1];
        
        if (lastTab) {
            const tabId = lastTab.getAttribute('data-tab');
            this.switchTab(tabId);
            lastTab.focus();
        }
    }

    // 탭 콘텐츠 동적 로딩
    loadTabContent(tabId) {
        const panel = document.querySelector(`#${tabId}`);
        if (!panel) return;

        // 이미 로드된 경우 스킵
        if (panel.dataset.loaded === 'true') return;

        // 로딩 상태 표시
        this.showLoadingState(panel);

        // 콘텐츠 로딩 시뮬레이션 (실제로는 API 호출)
        setTimeout(() => {
            this.hideLoadingState(panel);
            panel.dataset.loaded = 'true';
        }, 500);
    }

    showLoadingState(panel) {
        const loadingHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>콘텐츠를 불러오는 중...</p>
            </div>
        `;
        panel.innerHTML = loadingHTML;
    }

    hideLoadingState(panel) {
        // 실제 콘텐츠로 교체
        const content = this.getTabContent(this.activeTab);
        if (content) {
            panel.innerHTML = content;
        }
    }

    getTabContent(tabId) {
        // 실제 구현에서는 API에서 데이터를 가져옴
        const contentMap = {
            'announcements': this.getAnnouncementsContent(),
            'projects': this.getProjectsContent(),
            'tech-blog': this.getTechBlogContent(),
            'tutorials': this.getTutorialsContent()
        };
        return contentMap[tabId];
    }

    getAnnouncementsContent() {
        return `
            <div class="panel-header">
                <h3 class="panel-title">
                    <i class="fas fa-bell" aria-hidden="true"></i>
                    최신 공지사항
                </h3>
                <div class="panel-date">2024.03.15</div>
            </div>
            <div class="news-list">
                <article class="news-item featured">
                    <div class="news-badge">중요</div>
                    <div class="news-content">
                        <h4 class="news-title">
                            <a href="#news1">🚀 신규 웹 플랫폼 런칭 및 협업 파트너 모집 안내</a>
                        </h4>
                        <p class="news-summary">
                            혁신적인 웹 플랫폼 개발을 위한 팀원을 모집합니다. React 기반의 최신 기술 스택을 활용한...
                        </p>
                        <div class="news-meta">
                            <span class="news-category">개발</span>
                            <span class="news-date">2024.03.15</span>
                            <span class="news-views">조회수 1,247</span>
                        </div>
                    </div>
                </article>
            </div>
        `;
    }

    getProjectsContent() {
        return `
            <div class="panel-header">
                <h3 class="panel-title">
                    <i class="fas fa-tasks" aria-hidden="true"></i>
                    진행중인 프로젝트
                </h3>
            </div>
            <div class="project-grid">
                <div class="project-card">
                    <div class="project-status active">진행중</div>
                    <h4 class="project-title">E-Commerce Platform</h4>
                    <p class="project-desc">React + Node.js 기반 쇼핑몰</p>
                    <div class="project-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 75%"></div>
                        </div>
                        <span class="progress-text">75%</span>
                    </div>
                </div>
            </div>
        `;
    }

    getTechBlogContent() {
        return `
            <div class="panel-header">
                <h3 class="panel-title">
                    <i class="fas fa-pen-alt" aria-hidden="true"></i>
                    최신 기술 포스트
                </h3>
            </div>
            <div class="blog-list">
                <article class="blog-item">
                    <div class="blog-thumbnail">
                        <img src="./assets/images/blog/react-hooks.jpg" alt="React Hooks">
                    </div>
                    <div class="blog-content">
                        <h4 class="blog-title">React Hooks 완벽 가이드</h4>
                        <p class="blog-excerpt">useState, useEffect부터 커스텀 훅까지...</p>
                        <div class="blog-meta">
                            <span class="blog-date">2024.03.14</span>
                            <span class="blog-read-time">5분 읽기</span>
                        </div>
                    </div>
                </article>
            </div>
        `;
    }

    getTutorialsContent() {
        return `
            <div class="panel-header">
                <h3 class="panel-title">
                    <i class="fas fa-video" aria-hidden="true"></i>
                    개발 튜토리얼
                </h3>
            </div>
            <div class="tutorial-grid">
                <div class="tutorial-card">
                    <div class="tutorial-thumbnail">
                        <img src="./assets/images/tutorials/js-basics.jpg" alt="JavaScript 기초">
                        <div class="play-overlay">
                            <i class="fas fa-play" aria-hidden="true"></i>
                        </div>
                    </div>
                    <h4 class="tutorial-title">JavaScript 기초부터 심화까지</h4>
                    <div class="tutorial-meta">
                        <span class="tutorial-duration">45분</span>
                        <span class="tutorial-level">초급</span>
                    </div>
                </div>
            </div>
        `;
    }

    // 접근성 개선
    setupAccessibility() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach((button, index) => {
            // ARIA 속성 설정
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-selected', button.classList.contains('active'));
            button.setAttribute('aria-controls', button.getAttribute('data-tab'));
            
            // 탭 패널 ARIA 속성
            const tabId = button.getAttribute('data-tab');
            const panel = document.querySelector(`#${tabId}`);
            if (panel) {
                panel.setAttribute('role', 'tabpanel');
                panel.setAttribute('aria-labelledby', button.id || `tab-${index}`);
            }
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
        
        // URL 해시에서 탭 복원
        this.restoreTabFromHash();
    }

    restoreTabFromHash() {
        const hash = window.location.hash.replace('#', '');
        if (hash && document.querySelector(`#${hash}`)) {
            this.switchTab(hash);
        }
    }
}

// 인스턴스 생성 및 초기화
document.addEventListener('DOMContentLoaded', () => {
    const tabs = new Tabs();
    tabs.afterInit();
});

// 전역으로 내보내기
window.Tabs = Tabs; 