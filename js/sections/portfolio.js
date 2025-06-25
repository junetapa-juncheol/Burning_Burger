/**
 * Portfolio Section
 * 포트폴리오 섹션 기능
 */

class PortfolioSection {
    constructor() {
        this.currentFilter = 'all';
        this.currentSort = 'date';
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFilters();
        this.setupSorting();
        this.setupLightbox();
        this.setupAnimations();
    }

    bindEvents() {
        // 필터 버튼들
        const filterButtons = document.querySelectorAll('.portfolio-filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = button.getAttribute('data-filter');
                this.filterProjects(filter);
            });
        });

        // 정렬 버튼들
        const sortButtons = document.querySelectorAll('.portfolio-sort-btn');
        sortButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const sort = button.getAttribute('data-sort');
                this.sortProjects(sort);
            });
        });

        // 프로젝트 카드 클릭
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('click', (e) => this.handleProjectClick(e));
        });

        // 검색 기능
        const searchInput = document.querySelector('.portfolio-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // 무한 스크롤
        this.setupInfiniteScroll();
    }

    setupFilters() {
        // 필터 상태 관리
        this.filters = {
            all: () => true,
            web: (project) => project.category === 'web',
            mobile: (project) => project.category === 'mobile',
            design: (project) => project.category === 'design',
            music: (project) => project.category === 'music'
        };
    }

    setupSorting() {
        // 정렬 옵션 관리
        this.sortOptions = {
            date: (a, b) => new Date(b.date) - new Date(a.date),
            name: (a, b) => a.title.localeCompare(b.title),
            category: (a, b) => a.category.localeCompare(b.category),
            popularity: (a, b) => b.views - a.views
        };
    }

    setupLightbox() {
        // 라이트박스 초기화
        this.lightbox = {
            isOpen: false,
            currentIndex: 0,
            images: []
        };
    }

    setupAnimations() {
        // 프로젝트 카드 애니메이션
        this.animateProjectCards();
    }

    animateProjectCards() {
        const projectCards = document.querySelectorAll('.project-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        projectCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease-out';
            observer.observe(card);
        });
    }

    filterProjects(filter) {
        this.currentFilter = filter;
        
        // 필터 버튼 상태 업데이트
        document.querySelectorAll('.portfolio-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        // 프로젝트 필터링
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
        
        // 결과 카운트 업데이트
        this.updateResultCount();
        
        // 이벤트 추적
        this.trackEvent('portfolio_filter', `필터: ${filter}`);
    }

    sortProjects(sort) {
        this.currentSort = sort;
        
        // 정렬 버튼 상태 업데이트
        document.querySelectorAll('.portfolio-sort-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-sort="${sort}"]`).classList.add('active');
        
        // 프로젝트 정렬
        const projectGrid = document.querySelector('.portfolio-grid');
        if (projectGrid) {
            const projectCards = Array.from(projectGrid.children);
            
            projectCards.sort((a, b) => {
                const aValue = this.getSortValue(a, sort);
                const bValue = this.getSortValue(b, sort);
                
                if (sort === 'date') {
                    return new Date(bValue) - new Date(aValue);
                } else if (sort === 'popularity') {
                    return parseInt(bValue) - parseInt(aValue);
                } else {
                    return aValue.localeCompare(bValue);
                }
            });
            
            // DOM에서 재정렬
            projectCards.forEach(card => {
                projectGrid.appendChild(card);
            });
        }
        
        // 이벤트 추적
        this.trackEvent('portfolio_sort', `정렬: ${sort}`);
    }

    getSortValue(card, sort) {
        switch (sort) {
            case 'date':
                return card.getAttribute('data-date');
            case 'name':
                return card.querySelector('.project-title').textContent;
            case 'category':
                return card.getAttribute('data-category');
            case 'popularity':
                return card.getAttribute('data-views') || '0';
            default:
                return '';
        }
    }

    handleProjectClick(event) {
        const card = event.currentTarget;
        const projectId = card.getAttribute('data-project-id');
        
        // 프로젝트 상세 모달 열기
        this.openProjectModal(projectId);
        
        // 이벤트 추적
        this.trackEvent('portfolio_project_click', `프로젝트: ${projectId}`);
    }

    openProjectModal(projectId) {
        // 프로젝트 데이터 가져오기
        const projectData = this.getProjectData(projectId);
        
        // 모달 생성
        const modal = this.createProjectModal(projectData);
        document.body.appendChild(modal);
        
        // 모달 애니메이션
        setTimeout(() => {
            modal.classList.add('show');
        }, 50);
        
        // 모달 닫기 이벤트
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                this.closeProjectModal(modal);
            }
        });
        
        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeProjectModal(modal);
            }
        });
    }

    createProjectModal(projectData) {
        const modal = document.createElement('div');
        modal.className = 'project-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" aria-label="닫기">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-header">
                    <h2 class="modal-title">${projectData.title}</h2>
                    <div class="modal-meta">
                        <span class="modal-category">${projectData.category}</span>
                        <span class="modal-date">${projectData.date}</span>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="modal-gallery">
                        ${projectData.images.map(img => `
                            <img src="${img.src}" alt="${img.alt}" class="modal-image">
                        `).join('')}
                    </div>
                    <div class="modal-description">
                        <p>${projectData.description}</p>
                    </div>
                    <div class="modal-tech">
                        <h3>사용 기술</h3>
                        <div class="tech-tags">
                            ${projectData.technologies.map(tech => `
                                <span class="tech-tag">${tech}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <a href="${projectData.liveUrl}" class="btn btn-primary" target="_blank">
                        <i class="fas fa-external-link-alt"></i>
                        라이브 데모
                    </a>
                    <a href="${projectData.githubUrl}" class="btn btn-secondary" target="_blank">
                        <i class="fab fa-github"></i>
                        GitHub
                    </a>
                </div>
            </div>
        `;
        
        return modal;
    }

    closeProjectModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }

    getProjectData(projectId) {
        // 실제 구현에서는 API에서 데이터를 가져옴
        return {
            id: projectId,
            title: '프로젝트 제목',
            category: 'web',
            date: '2024-03-15',
            description: '프로젝트 설명...',
            images: [
                { src: './assets/images/projects/project1.jpg', alt: '프로젝트 이미지 1' },
                { src: './assets/images/projects/project2.jpg', alt: '프로젝트 이미지 2' }
            ],
            technologies: ['React', 'Node.js', 'MongoDB'],
            liveUrl: '#',
            githubUrl: '#'
        };
    }

    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            const title = card.querySelector('.project-title').textContent.toLowerCase();
            const description = card.querySelector('.project-description').textContent.toLowerCase();
            const category = card.getAttribute('data-category').toLowerCase();
            
            const matches = title.includes(searchTerm) || 
                           description.includes(searchTerm) || 
                           category.includes(searchTerm);
            
            if (matches) {
                card.style.display = 'block';
                card.style.opacity = '1';
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
            }
        });
        
        this.updateResultCount();
    }

    updateResultCount() {
        const visibleCards = document.querySelectorAll('.project-card[style*="display: block"], .project-card:not([style*="display: none"])');
        const resultCount = document.querySelector('.portfolio-result-count');
        
        if (resultCount) {
            resultCount.textContent = `${visibleCards.length}개의 프로젝트`;
        }
    }

    setupInfiniteScroll() {
        const projectGrid = document.querySelector('.portfolio-grid');
        if (!projectGrid) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadMoreProjects();
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '100px'
        });

        // 감시할 요소 (마지막 프로젝트 카드)
        const lastCard = projectGrid.lastElementChild;
        if (lastCard) {
            observer.observe(lastCard);
        }
    }

    loadMoreProjects() {
        // 추가 프로젝트 로딩 (실제로는 API 호출)
        console.log('추가 프로젝트 로딩...');
        
        // 로딩 상태 표시
        this.showLoadingState();
        
        // 시뮬레이션된 로딩
        setTimeout(() => {
            this.hideLoadingState();
            // 새 프로젝트 카드 추가 로직
        }, 1000);
    }

    showLoadingState() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'portfolio-loading';
        loadingElement.innerHTML = `
            <div class="loading-spinner"></div>
            <p>프로젝트를 불러오는 중...</p>
        `;
        
        const projectGrid = document.querySelector('.portfolio-grid');
        if (projectGrid) {
            projectGrid.appendChild(loadingElement);
        }
    }

    hideLoadingState() {
        const loadingElement = document.querySelector('.portfolio-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    trackEvent(action, label) {
        // Google Analytics 이벤트 추적
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'portfolio',
                event_label: label
            });
        }
        
        // 커스텀 이벤트 발생
        const event = new CustomEvent('portfolioAction', {
            detail: {
                action: action,
                label: label,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(event);
    }

    // 접근성 개선
    setupAccessibility() {
        // 키보드 네비게이션
        const interactiveElements = document.querySelectorAll('.portfolio-filter-btn, .portfolio-sort-btn, .project-card');
        
        interactiveElements.forEach(element => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        });

        // ARIA 속성 설정
        const filterButtons = document.querySelectorAll('.portfolio-filter-btn');
        filterButtons.forEach(button => {
            button.setAttribute('role', 'button');
            button.setAttribute('aria-pressed', button.classList.contains('active'));
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
        
        // 검색 이벤트 최적화
        this.handleSearch = this.debounce(this.handleSearch, 300);
        
        // 초기 결과 카운트 업데이트
        this.updateResultCount();
    }
}

// 인스턴스 생성 및 초기화
document.addEventListener('DOMContentLoaded', () => {
    const portfolioSection = new PortfolioSection();
    portfolioSection.afterInit();
});

// 전역으로 내보내기
window.PortfolioSection = PortfolioSection; 