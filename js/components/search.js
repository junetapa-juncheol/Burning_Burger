/**
 * Advanced Search Component
 * 고급 검색 시스템 - 자동완성, 필터링, 히스토리
 */

class SearchManager {
    constructor() {
        if (!window.utils) {
            console.error('SearchManager Error: window.utils is not defined. Search will not initialize.');
            return;
        }

        this.utils = window.utils;
        
        this.elements = {
            searchForm: this.utils.$('.search-form'),
            searchInput: this.utils.$('.search-input'),
            searchButton: this.utils.$('.search-btn'),
            suggestions: this.utils.$('.search-suggestions'),
            suggestionTags: this.utils.$$('.suggestion-tag'),
            resultsContainer: null,
            historyContainer: null,
            filtersContainer: null
        };
        
        this.state = {
            query: '',
            isSearching: false,
            results: [],
            suggestions: [],
            history: [],
            filters: {
                category: 'all',
                type: 'all',
                date: 'all'
            },
            selectedIndex: -1,
            showDropdown: false
        };
        
        this.config = {
            minCharacters: window.CONFIG?.get()?.search?.minLength || 2,
            maxResults: window.CONFIG?.get()?.search?.maxResults || 10,
            debounceDelay: window.CONFIG?.get()?.search?.debounce || 300,
            highlightResults: window.CONFIG?.get()?.search?.highlight || true,
            storageKey: 'search_history',
            maxHistoryItems: 10,
            apiEndpoint: '/api/search',
            enableVoiceSearch: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
        };
        
        this.searchIndex = new Map();
        this.searchableContent = [];
        this.debouncedSearch = this.utils.debounce(this.performSearch.bind(this), this.config.debounceDelay);
        
        this.init();
    }
    
    init() {
        this.createSearchInterface();
        this.loadSearchHistory();
        this.buildSearchIndex();
        this.bindEvents();
        this.initializeVoiceSearch();
        
        console.log('Search Manager initialized');
    }
    
    createSearchInterface() {
        // Create results dropdown
        this.elements.resultsContainer = this.utils.createElement('div', {
            className: 'search-results-dropdown',
            'aria-hidden': 'true'
        });
        // sectionsHTML을 빈 문자열로 설정하여 UI 숨김 처리
        const sectionsHTML = '';
        this.elements.resultsContainer.innerHTML = sectionsHTML;
        
        // Insert after search form
        if (this.elements.searchForm) {
            this.elements.searchForm.parentNode.insertBefore(
                this.elements.resultsContainer, 
                this.elements.searchForm.nextSibling
            );
        }
        
        // Get references to new elements
        this.elements.historyContainer = this.utils.$('.search-history-list');
        this.elements.filtersContainer = this.utils.$('.filter-options');
        this.elements.suggestionsContainer = this.utils.$('.search-suggestions-list');
        this.elements.resultsListContainer = this.utils.$('.search-results-list');
        this.elements.resultsCount = this.utils.$('.results-count');
    }
    
    buildSearchIndex() {
        // Build searchable content from page
        this.indexPageContent();
        this.indexPortfolioItems();
        this.indexMusicTracks();
        this.indexBlogPosts();
        
        console.log(`Search index built with ${this.searchableContent.length} items`);
    }
    
    indexPageContent() {
        // Index main page sections
        const sections = this.utils.$$('section[id]');
        sections.forEach(section => {
            const title = section.querySelector('h1, h2, h3')?.textContent || section.id;
            const content = this.extractTextContent(section);
            
            this.addToSearchIndex({
                id: `section-${section.id}`,
                title: title,
                content: content,
                url: `#${section.id}`,
                type: 'page',
                category: this.determineSectionCategory(section.id),
                weight: 10
            });
        });
    }
    
    indexPortfolioItems() {
        // Index portfolio items if available
        if (window.CONFIG?.get()?.projects) {
            window.CONFIG.get().projects.forEach(item => {
                this.addToSearchIndex({
                    id: `portfolio-${item.id}`,
                    title: item.title,
                    content: item.description + ' ' + (item.technologies ? item.technologies.join(' ') : ''),
                    url: item.url || `#portfolio-${item.id}`,
                    type: 'project',
                    category: 'portfolio',
                    weight: 8,
                    metadata: {
                        technologies: item.technologies || [],
                        category: item.category,
                        status: item.status
                    }
                });
            });
        }
    }
    
    indexMusicTracks() {
        // Index music tracks if available
        if (window.CONFIG?.get()?.tracks) {
            window.CONFIG.get().tracks.forEach(track => {
                this.addToSearchIndex({
                    id: `track-${track.id}`,
                    title: track.title,
                    content: `${track.artist} ${track.album} ${track.genre}`,
                    url: `#music-${track.id}`,
                    type: 'track',
                    category: 'music',
                    weight: 6,
                    metadata: {
                        artist: track.artist,
                        album: track.album,
                        genre: track.genre,
                        duration: track.duration
                    }
                });
            });
        }
    }
    
    indexBlogPosts() {
        // Index blog posts if available
        if (window.CONFIG?.get()?.blogPosts) {
            window.CONFIG.get().blogPosts.forEach(post => {
                this.addToSearchIndex({
                    id: `post-${post.id}`,
                    title: post.title,
                    content: post.excerpt + ' ' + (post.tags ? post.tags.join(' ') : ''),
                    url: post.url || `#blog-${post.id}`,
                    type: 'post',
                    category: 'blog',
                    weight: 7,
                    metadata: {
                        tags: post.tags || [],
                        category: post.category,
                        author: post.author,
                        date: post.date
                    }
                });
            });
        }
    }
    
    addToSearchIndex(item) {
        this.searchableContent.push(item);
        
        // Create keyword index for faster searching
        const keywords = this.extractKeywords(item.title + ' ' + item.content);
        keywords.forEach(keyword => {
            if (!this.searchIndex.has(keyword)) {
                this.searchIndex.set(keyword, []);
            }
            this.searchIndex.get(keyword).push(item.id);
        });
    }
    
    extractKeywords(text) {
        return text.toLowerCase()
                   .replace(/[^\w\s가-힣]/g, ' ')
                   .split(/\s+/)
                   .filter(word => word.length >= 2);
    }
    
    extractTextContent(element) {
        const clone = element.cloneNode(true);
        
        // Remove script and style elements
        clone.querySelectorAll('script, style, .sr-only').forEach(el => el.remove());
        
        return clone.textContent.replace(/\s+/g, ' ').trim();
    }
    
    determineSectionCategory(sectionId) {
        const categoryMap = {
            'home': 'about',
            'about': 'about',
            'portfolio': 'portfolio',
            'skills': 'about',
            'music': 'music',
            'blog': 'blog',
            'contact': 'about'
        };
        
        return categoryMap[sectionId] || 'about';
    }
    
    bindEvents() {
        // Search input events
        if (this.elements.searchInput) {
            this.utils.on(this.elements.searchInput, 'input', (e) => {
                this.handleSearchInput(e);
            });
            
            this.utils.on(this.elements.searchInput, 'focus', () => {
                this.showSearchDropdown();
            });
            
            this.utils.on(this.elements.searchInput, 'blur', (e) => {
                // Delay hiding to allow clicking on results
                setTimeout(() => {
                    this.hideSearchDropdown();
                }, 200);
            });
            
            this.utils.on(this.elements.searchInput, 'keydown', (e) => {
                this.handleSearchKeydown(e);
            });
        }
        
        // Search form submission
        if (this.elements.searchForm) {
            this.utils.on(this.elements.searchForm, 'submit', (e) => {
                this.handleSearchSubmit(e);
            });
        }
        
        // Suggestion tags
        this.elements.suggestionTags.forEach(tag => {
            this.utils.on(tag, 'click', () => {
                this.selectSuggestion(tag.textContent);
            });
        });
        
        // Filter changes
        const filterSelects = this.utils.$$('.filter-select');
        filterSelects.forEach(select => {
            this.utils.on(select, 'change', (e) => {
                this.handleFilterChange(e);
            });
        });
        
        // Global click to close dropdown
        this.utils.on(document, 'click', (e) => {
            if (!this.elements.searchForm?.contains(e.target) && 
                !this.elements.resultsContainer?.contains(e.target)) {
                this.hideSearchDropdown();
            }
        });
        
        // Escape key to close dropdown
        this.utils.on(document, 'keydown', (e) => {
            if (e.key === 'Escape' && this.state.showDropdown) {
                this.hideSearchDropdown();
                this.elements.searchInput?.blur();
            }
        });
    }
    
    handleSearchInput(e) {
        const query = e.target.value.trim();
        this.state.query = query;
        
        if (query.length >= this.config.minCharacters) {
            this.debouncedSearch(query);
            this.showSearchDropdown();
        } else {
            this.clearResults();
            if (query.length === 0) {
                this.showSearchHistory();
            }
        }
    }
    
    handleSearchKeydown(e) {
        if (!this.state.showDropdown) return;
        
        const results = this.utils.$$('.search-result-item');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.state.selectedIndex = Math.min(
                    this.state.selectedIndex + 1, 
                    results.length - 1
                );
                this.updateResultSelection(results);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.state.selectedIndex = Math.max(
                    this.state.selectedIndex - 1, 
                    -1
                );
                this.updateResultSelection(results);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.state.selectedIndex >= 0 && results[this.state.selectedIndex]) {
                    this.selectResult(results[this.state.selectedIndex]);
                } else {
                    this.handleSearchSubmit(e);
                }
                break;
                
            case 'Tab':
                if (this.state.selectedIndex >= 0 && results[this.state.selectedIndex]) {
                    e.preventDefault();
                    this.selectResult(results[this.state.selectedIndex]);
                }
                break;
        }
    }
    
    handleSearchSubmit(e) {
        e.preventDefault();
        
        const query = this.state.query.trim();
        if (query.length < this.config.minCharacters) return;
        
        this.addToSearchHistory(query);
        this.performSearch(query, true);
        this.hideSearchDropdown();
        
        // Track search event
        this.trackSearchEvent(query);
    }
    
    async performSearch(query, isSubmit = false) {
        if (this.state.isSearching) return;
        
        this.state.isSearching = true;
        this.showSearchLoading();
        
        try {
            // Perform local search
            const localResults = this.searchLocal(query);
            
            // Optionally perform remote search
            let remoteResults = [];
            if (this.config.apiEndpoint && isSubmit) {
                remoteResults = await this.searchRemote(query);
            }
            
            // Combine and rank results
            const allResults = this.combineResults(localResults, remoteResults);
            this.state.results = this.rankResults(allResults, query);
            
            this.displayResults();
            this.generateSuggestions(query);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showSearchError();
        } finally {
            this.state.isSearching = false;
            this.hideSearchLoading();
        }
    }
    
    searchLocal(query) {
        const keywords = this.extractKeywords(query);
        const matchingItems = new Map();
        
        // Find items that match keywords
        keywords.forEach(keyword => {
            const matches = this.searchIndex.get(keyword) || [];
            matches.forEach(itemId => {
                const item = this.searchableContent.find(item => item.id === itemId);
                if (item && this.matchesFilters(item)) {
                    const score = matchingItems.get(itemId) || 0;
                    matchingItems.set(itemId, score + this.calculateRelevanceScore(item, keyword, query));
                }
            });
        });
        
        // Convert to array and add fuzzy search results
        const results = Array.from(matchingItems.entries()).map(([id, score]) => {
            const item = this.searchableContent.find(item => item.id === id);
            return { ...item, score };
        });
        
        // Add fuzzy search results for partial matches
        const fuzzyResults = this.performFuzzySearch(query);
        results.push(...fuzzyResults);
        
        return results;
    }
    
    performFuzzySearch(query) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        this.searchableContent.forEach(item => {
            if (!this.matchesFilters(item)) return;
            
            const titleLower = item.title.toLowerCase();
            const contentLower = item.content.toLowerCase();
            
            // Check for partial matches
            if (titleLower.includes(queryLower) || contentLower.includes(queryLower)) {
                const score = this.calculateFuzzyScore(item, query);
                if (score > 0.3) { // Threshold for relevance
                    results.push({ ...item, score });
                }
            }
        });
        
        return results;
    }
    
    calculateRelevanceScore(item, keyword, fullQuery) {
        let score = 0;
        
        const titleLower = item.title.toLowerCase();
        const contentLower = item.content.toLowerCase();
        const keywordLower = keyword.toLowerCase();
        
        // Title matches score higher
        if (titleLower.includes(keywordLower)) {
            score += 10;
            if (titleLower.startsWith(keywordLower)) {
                score += 5;
            }
        }
        
        // Content matches
        if (contentLower.includes(keywordLower)) {
            score += 5;
        }
        
        // Exact matches score higher
        if (titleLower === fullQuery.toLowerCase()) {
            score += 20;
        }
        
        // Weight by item type
        score *= item.weight || 1;
        
        return score;
    }
    
    calculateFuzzyScore(item, query) {
        // Simple fuzzy scoring algorithm
        const titleSimilarity = this.calculateSimilarity(item.title.toLowerCase(), query.toLowerCase());
        const contentSimilarity = this.calculateSimilarity(item.content.toLowerCase(), query.toLowerCase());
        
        return Math.max(titleSimilarity * 2, contentSimilarity); // Title matches weighted higher
    }
    
    calculateSimilarity(str1, str2) {
        // Levenshtein distance-based similarity
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }
    
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
        
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,        // deletion
                    matrix[j - 1][i] + 1,        // insertion
                    matrix[j - 1][i - 1] + substitutionCost // substitution
                );
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    async searchRemote(query) {
        try {
            const response = await fetch(`${this.config.apiEndpoint}?q=${encodeURIComponent(query)}&limit=${this.config.maxResults}`);
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Remote search failed:', error);
            return [];
        }
    }
    
    combineResults(localResults, remoteResults) {
        const combined = [...localResults];
        
        // Add remote results that aren't duplicates
        remoteResults.forEach(remoteResult => {
            const duplicate = combined.find(local => 
                local.url === remoteResult.url || local.title === remoteResult.title
            );
            
            if (!duplicate) {
                combined.push({ ...remoteResult, isRemote: true });
            }
        });
        
        return combined;
    }
    
    rankResults(results, query) {
        return results
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, this.config.maxResults);
    }
    
    matchesFilters(item) {
        const { category, type } = this.state.filters;
        
        if (category !== 'all' && item.category !== category) {
            return false;
        }
        
        if (type !== 'all' && item.type !== type) {
            return false;
        }
        
        return true;
    }
    
    displayResults() {
        if (!this.elements.resultsListContainer) return;
        
        const resultsHTML = this.state.results.map(result => 
            this.createResultHTML(result)
        ).join('');
        
        this.elements.resultsListContainer.innerHTML = resultsHTML;
        
        // Update results count
        if (this.elements.resultsCount) {
            this.elements.resultsCount.textContent = `(${this.state.results.length})`;
        }
        
        // Bind result item events
        this.bindResultEvents();
        
        // Show results section
        this.utils.$('.search-results-section')?.classList.add('has-results');
    }
    
    createResultHTML(result) {
        const highlightedTitle = this.config.highlightResults 
            ? this.highlightText(result.title, this.state.query)
            : result.title;
            
        const highlightedContent = this.config.highlightResults
            ? this.highlightText(this.truncateContent(result.content, 100), this.state.query)
            : this.truncateContent(result.content, 100);
        
        return `
            <div class="search-result-item" data-url="${result.url}" data-type="${result.type}">
                <div class="result-icon">
                    <i class="${this.getResultIcon(result.type)}" aria-hidden="true"></i>
                </div>
                <div class="result-content">
                    <h5 class="result-title">${highlightedTitle}</h5>
                    <p class="result-snippet">${highlightedContent}</p>
                    <div class="result-meta">
                        <span class="result-type">${this.getResultTypeLabel(result.type)}</span>
                        <span class="result-category">${this.getResultCategoryLabel(result.category)}</span>
                        ${result.isRemote ? '<span class="result-source">외부</span>' : ''}
                    </div>
                </div>
                <div class="result-actions">
                    <button class="result-action-btn" aria-label="결과 선택">
                        <i class="fas fa-arrow-right" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    highlightText(text, query) {
        if (!query.trim()) return text;
        
        const keywords = this.extractKeywords(query);
        let highlightedText = text;
        
        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
        });
        
        return highlightedText;
    }
    
    truncateContent(content, maxLength) {
        if (content.length <= maxLength) return content;
        
        const truncated = content.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        
        return lastSpace > -1 
            ? truncated.substring(0, lastSpace) + '...'
            : truncated + '...';
    }
    
    getResultIcon(type) {
        const iconMap = {
            'page': 'fas fa-file-alt',
            'project': 'fas fa-code',
            'post': 'fas fa-blog',
            'track': 'fas fa-music'
        };
        
        return iconMap[type] || 'fas fa-file';
    }
    
    getResultTypeLabel(type) {
        const labelMap = {
            'page': '페이지',
            'project': '프로젝트',
            'post': '게시물',
            'track': '음악'
        };
        
        return labelMap[type] || type;
    }
    
    getResultCategoryLabel(category) {
        const labelMap = {
            'about': '소개',
            'portfolio': '포트폴리오',
            'blog': '블로그',
            'music': '음악'
        };
        
        return labelMap[category] || category;
    }
    
    bindResultEvents() {
        const resultItems = this.utils.$$('.search-result-item');
        
        resultItems.forEach((item, index) => {
            this.utils.on(item, 'click', () => {
                this.selectResult(item);
            });
            
            this.utils.on(item, 'mouseenter', () => {
                this.state.selectedIndex = index;
                this.updateResultSelection(resultItems);
            });
        });
    }
    
    updateResultSelection(results) {
        results.forEach((item, index) => {
            item.classList.toggle('selected', index === this.state.selectedIndex);
        });
        
        // Scroll selected item into view
        if (this.state.selectedIndex >= 0) {
            const selectedItem = results[this.state.selectedIndex];
            selectedItem?.scrollIntoView({ block: 'nearest' });
        }
    }
    
    selectResult(resultElement) {
        const url = resultElement.dataset.url;
        const type = resultElement.dataset.type;
        
        // Add to search history
        const title = resultElement.querySelector('.result-title').textContent;
        this.addToSearchHistory(this.state.query, { title, url, type });
        
        // Navigate to result
        if (url.startsWith('#')) {
            // Internal link
            const target = this.utils.$(url);
            if (target) {
                this.hideSearchDropdown();
                this.utils.smoothScrollTo(target);
                
                // Update URL
                history.pushState(null, null, url);
            }
        } else if (url.startsWith('http')) {
            // External link
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            // Relative link
            window.location.href = url;
        }
        
        // Track result click
        this.trackResultClick(this.state.query, url, type);
    }
    
    generateSuggestions(query) {
        if (!this.elements.suggestionsContainer) return;
        
        const suggestions = [
            ...window.config.search.suggestions.filter(suggestion => 
                suggestion.toLowerCase().includes(query.toLowerCase()) && 
                suggestion.toLowerCase() !== query.toLowerCase()
            ),
            ...this.generateRelatedSuggestions(query)
        ].slice(0, 5);
        
        const suggestionsHTML = suggestions.map(suggestion => `
            <div class="search-suggestion-item" data-suggestion="${suggestion}">
                <i class="fas fa-search" aria-hidden="true"></i>
                <span>${this.highlightText(suggestion, query)}</span>
            </div>
        `).join('');
        
        this.elements.suggestionsContainer.innerHTML = suggestionsHTML;
        
        // Bind suggestion events
        this.utils.$$('.search-suggestion-item').forEach(item => {
            this.utils.on(item, 'click', () => {
                this.selectSuggestion(item.dataset.suggestion);
            });
        });
        
        // Show suggestions section
        this.utils.$('.search-suggestions-section')?.classList.toggle('has-suggestions', suggestions.length > 0);
    }
    
    generateRelatedSuggestions(query) {
        const related = [];
        const queryKeywords = this.extractKeywords(query);
        
        // Find related terms from search index
        this.searchableContent.forEach(item => {
            const itemKeywords = this.extractKeywords(item.title + ' ' + item.content);
            const commonKeywords = queryKeywords.filter(kw => itemKeywords.includes(kw));
            
            if (commonKeywords.length > 0) {
                itemKeywords.forEach(keyword => {
                    if (!queryKeywords.includes(keyword) && 
                        keyword.length > 2 && 
                        !related.includes(keyword)) {
                        related.push(keyword);
                    }
                });
            }
        });
        
        return related.slice(0, 3);
    }
    
    selectSuggestion(suggestion) {
        this.elements.searchInput.value = suggestion;
        this.state.query = suggestion;
        this.performSearch(suggestion, true);
        this.elements.searchInput.focus();
    }
    
    // Search history management
    loadSearchHistory() {
        this.state.history = this.utils.storage.get(this.config.storageKey, []);
        this.displaySearchHistory();
    }
    
    addToSearchHistory(query, metadata = null) {
        if (!query.trim()) return;
        
        // Remove existing entry if present
        this.state.history = this.state.history.filter(item => 
            (typeof item === 'string' ? item : item.query) !== query
        );
        
        // Add new entry
        const historyItem = metadata ? { query, ...metadata } : query;
        this.state.history.unshift(historyItem);
        
        // Limit history size
        if (this.state.history.length > this.config.maxHistoryItems) {
            this.state.history = this.state.history.slice(0, this.config.maxHistoryItems);
        }
        
        // Save to storage
        this.utils.storage.set(this.config.storageKey, this.state.history);
        this.displaySearchHistory();
    }
    
    displaySearchHistory() {
        if (!this.elements.historyContainer || this.state.history.length === 0) {
            this.utils.$('.search-history')?.classList.remove('has-history');
            return;
        }
        
        const historyHTML = this.state.history.slice(0, 5).map(item => {
            const query = typeof item === 'string' ? item : item.query;
            const title = typeof item === 'string' ? null : item.title;
            
            return `
                <div class="search-history-item" data-query="${query}">
                    <div class="history-icon">
                        <i class="fas fa-history" aria-hidden="true"></i>
                    </div>
                    <div class="history-content">
                        <div class="history-query">${query}</div>
                        ${title ? `<div class="history-title">${title}</div>` : ''}
                    </div>
                    <div class="history-actions">
                        <button class="history-remove-btn" aria-label="검색 기록 삭제" data-query="${query}">
                            <i class="fas fa-times" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        this.elements.historyContainer.innerHTML = historyHTML;
        
        // Bind history events
        this.utils.$$('.search-history-item').forEach(item => {
            this.utils.on(item, 'click', (e) => {
                if (!e.target.closest('.history-remove-btn')) {
                    this.selectSuggestion(item.dataset.query);
                }
            });
        });
        
        this.utils.$$('.history-remove-btn').forEach(btn => {
            this.utils.on(btn, 'click', (e) => {
                e.stopPropagation();
                this.removeFromHistory(btn.dataset.query);
            });
        });
        
        // Show history section
        this.utils.$('.search-history')?.classList.add('has-history');
    }
    
    removeFromHistory(query) {
        this.state.history = this.state.history.filter(item => 
            (typeof item === 'string' ? item : item.query) !== query
        );
        
        this.utils.storage.set(this.config.storageKey, this.state.history);
        this.displaySearchHistory();
    }
    
    clearSearchHistory() {
        this.state.history = [];
        this.utils.storage.remove(this.config.storageKey);
        this.displaySearchHistory();
    }
    
    // Filter handling
    handleFilterChange(e) {
        const filterType = e.target.id.replace('-filter', '');
        this.state.filters[filterType] = e.target.value;
        
        // Re-run search with new filters
        if (this.state.query.length >= this.config.minCharacters) {
            this.performSearch(this.state.query);
        }
    }
    
    // UI state management
    showSearchDropdown() {
        if (this.state.showDropdown) return;
        
        this.state.showDropdown = true;
        this.elements.resultsContainer.classList.add('show');
        this.elements.resultsContainer.setAttribute('aria-hidden', 'false');
        
        // Show appropriate content
        if (this.state.query.length === 0) {
            this.showSearchHistory();
        }
    }
    
    hideSearchDropdown() {
        this.state.showDropdown = false;
        this.elements.resultsContainer.classList.remove('show');
        this.elements.resultsContainer.setAttribute('aria-hidden', 'true');
        this.state.selectedIndex = -1;
    }
    
    showSearchHistory() {
        this.displaySearchHistory();
        this.clearResults();
    }
    
    clearResults() {
        this.state.results = [];
        if (this.elements.resultsListContainer) {
            this.elements.resultsListContainer.innerHTML = '';
        }
        if (this.elements.resultsCount) {
            this.elements.resultsCount.textContent = '';
        }
        this.utils.$('.search-results-section')?.classList.remove('has-results');
    }
    
    showSearchLoading() {
        if (this.elements.resultsListContainer) {
            this.elements.resultsListContainer.innerHTML = `
                <div class="search-loading">
                    <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
                    <span>검색 중...</span>
                </div>
            `;
        }
    }
    
    hideSearchLoading() {
        const loading = this.utils.$('.search-loading');
        if (loading) {
            loading.remove();
        }
    }
    
    showSearchError() {
        if (this.elements.resultsListContainer) {
            this.elements.resultsListContainer.innerHTML = `
                <div class="search-error">
                    <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                    <span>검색 중 오류가 발생했습니다. 다시 시도해 주세요.</span>
                </div>
            `;
        }
    }
    
    // Voice search
    initializeVoiceSearch() {
        if (!this.config.enableVoiceSearch) return;
        
        const voiceBtn = this.utils.createElement('button', {
            className: 'voice-search-btn',
            'aria-label': '음성 검색',
            innerHTML: '<i class="fas fa-microphone" aria-hidden="true"></i>'
        });
        
        this.elements.searchForm?.appendChild(voiceBtn);
        
        this.utils.on(voiceBtn, 'click', () => {
            this.startVoiceSearch();
        });
    }
    
    startVoiceSearch() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'ko-KR';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            this.utils.$('.voice-search-btn')?.classList.add('recording');
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.elements.searchInput.value = transcript;
            this.state.query = transcript;
            this.performSearch(transcript, true);
        };
        
        recognition.onerror = (event) => {
            console.error('Voice search error:', event.error);
        };
        
        recognition.onend = () => {
            this.utils.$('.voice-search-btn')?.classList.remove('recording');
        };
        
        recognition.start();
    }
    
    // Analytics
    trackSearchEvent(query) {
        if (window.config.analytics.enabled) {
            window.eventBus?.emit('searchPerformed', {
                query,
                resultsCount: this.state.results.length,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    trackResultClick(query, url, type) {
        if (window.config.analytics.enabled) {
            window.eventBus?.emit('searchResultClick', {
                query,
                url,
                type,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // Public API
    search(query) {
        this.elements.searchInput.value = query;
        this.state.query = query;
        this.performSearch(query, true);
        this.showSearchDropdown();
    }
    
    getSearchHistory() {
        return [...this.state.history];
    }
    
    getSearchResults() {
        return [...this.state.results];
    }
    
    setFilters(filters) {
        Object.assign(this.state.filters, filters);
        
        // Update filter UI
        Object.entries(filters).forEach(([key, value]) => {
            const select = this.utils.$(`#${key}-filter`);
            if (select) {
                select.value = value;
            }
        });
        
        // Re-run search if active
        if (this.state.query.length >= this.config.minCharacters) {
            this.performSearch(this.state.query);
        }
    }
    
    destroy() {
        // Remove event listeners and clean up
        this.elements.resultsContainer?.remove();
        
        console.log('Search Manager destroyed');
    }
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // utils 객체가 로드될 때까지 대기
    const waitForUtils = () => {
        if (window.utils) {
            const searchForm = window.utils.$('.search-form');
            if (searchForm) {
                window.searchManager = new SearchManager();
            }
        } else {
            setTimeout(waitForUtils, 100);
        }
    };
    waitForUtils();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchManager;
}