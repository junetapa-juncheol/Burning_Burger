/**
 * Music Player Component
 * 음악 플레이어 기능 관리
 */

class MusicPlayer {
    constructor() {
        if (!window.utils) {
            console.error('MusicPlayer Error: window.utils is not defined. Player will not initialize.');
            return; // 초기화 중단
        }
        
        this.utils = window.utils; // 클래스 내에서 utils 참조

        this.elements = {
            container: this.utils.$('.music-player-bar'),
            audio: this.utils.$('#audio-player'),
            playPauseBtn: this.utils.$('.play-pause-btn'),
            prevBtn: this.utils.$('.prev-btn'),
            nextBtn: this.utils.$('.next-btn'),
            repeatBtn: this.utils.$('.repeat-btn'),
            shuffleBtn: this.utils.$('.shuffle-btn'),
            volumeBtn: this.utils.$('.volume-btn'),
            volumeSlider: this.utils.$('.volume-input'),
            progressContainer: this.utils.$('.progress-container'),
            progressBar: this.utils.$('.progress-bar'),
            progressFill: this.utils.$('.progress-fill'),
            progressHandle: this.utils.$('.progress-handle'),
            currentTime: this.utils.$('.current-time'),
            totalTime: this.utils.$('.total-time'),
            trackTitle: this.utils.$('.track-title'),
            trackArtist: this.utils.$('.track-artist'),
            albumImage: this.utils.$('.album-image'),
            equalizer: this.utils.$('.equalizer'),
            playlistBtn: this.utils.$('.playlist-btn'),
            fullscreenBtn: this.utils.$('.fullscreen-btn')
        };
        
        this.state = {
            isPlaying: false,
            isPaused: false,
            currentTrackIndex: 0,
            currentTime: 0,
            duration: 0,
            volume: 0.7,
            isMuted: false,
            isRepeat: false,
            isShuffle: false,
            isLoading: false,
            wasPlayingBeforeDrag: false
        };
        
        this.playlist = window.CONFIG?.tracks || [];
        this.originalPlaylist = [...this.playlist];
        
        this.config = {
            autoplay: window.CONFIG?.musicPlayer?.autoplay || false,
            volume: window.CONFIG?.musicPlayer?.volume || 0.7,
            crossfade: window.CONFIG?.musicPlayer?.crossfade || 2000,
            storageKey: window.CONFIG?.musicPlayer?.storageKey || 'music-player-settings'
        };
        
        this.analytics = {
            playCount: 0,
            totalPlayTime: 0,
            sessionStartTime: null
        };
        
        // this.init(); // App 클래스에서 명시적으로 호출하도록 변경
    }
    
    init() {
        if (!this.elements.container || !this.elements.audio || this.playlist.length === 0) {
            console.warn('Music player initialization failed: missing elements or empty playlist');
            return;
        }
        
        this.setupAudio();
        this.loadTrack(this.state.currentTrackIndex);
        this.bindEvents();
        this.loadSettings();
        this.updateUI();
        
        console.log('Music Player initialized');
    }
    
    setupAudio() {
        if (!this.elements.audio) return;
        
        // 오디오 기본 설정
        this.elements.audio.preload = 'metadata';
        this.elements.audio.volume = this.config.volume;
        
        // 크로스 오리진 설정
        this.elements.audio.crossOrigin = 'anonymous';
        
        // 오디오 컨텍스트 설정 (Web Audio API 지원 시)
        if (this.utils.supportsFeature('webAudio')) {
            this.setupAudioContext();
        }
    }
    
    setupAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.audioSource = this.audioContext.createMediaElementSource(this.elements.audio);
            this.gainNode = this.audioContext.createGain();
            
            this.audioSource.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            
            // 이퀄라이저 설정
            this.setupEqualizer();
        } catch (error) {
            console.warn('Web Audio API setup failed:', error);
        }
    }
    
    setupEqualizer() {
        if (!this.audioContext) return;
        
        // 간단한 이퀄라이저 (저음, 중음, 고음)
        this.equalizer = {
            lowshelf: this.audioContext.createBiquadFilter(),
            peaking: this.audioContext.createBiquadFilter(),
            highshelf: this.audioContext.createBiquadFilter()
        };
        
        // 저음 (100Hz)
        this.equalizer.lowshelf.type = 'lowshelf';
        this.equalizer.lowshelf.frequency.value = 100;
        this.equalizer.lowshelf.gain.value = 0;
        
        // 중음 (1000Hz)
        this.equalizer.peaking.type = 'peaking';
        this.equalizer.peaking.frequency.value = 1000;
        this.equalizer.peaking.Q.value = 1;
        this.equalizer.peaking.gain.value = 0;
        
        // 고음 (10000Hz)
        this.equalizer.highshelf.type = 'highshelf';
        this.equalizer.highshelf.frequency.value = 10000;
        this.equalizer.highshelf.gain.value = 0;
        
        // 필터 연결
        this.audioSource.disconnect();
        this.audioSource.connect(this.equalizer.lowshelf);
        this.equalizer.lowshelf.connect(this.equalizer.peaking);
        this.equalizer.peaking.connect(this.equalizer.highshelf);
        this.equalizer.highshelf.connect(this.gainNode);
    }
    
    bindEvents() {
        // 플레이어 컨트롤 이벤트
        if (this.elements.playPauseBtn) {
            this.utils.on(this.elements.playPauseBtn, 'click', () => this.togglePlayPause());
        }
        
        if (this.elements.prevBtn) {
            this.utils.on(this.elements.prevBtn, 'click', () => this.previousTrack());
        }
        
        if (this.elements.nextBtn) {
            this.utils.on(this.elements.nextBtn, 'click', () => this.nextTrack());
        }
        
        if (this.elements.repeatBtn) {
            this.utils.on(this.elements.repeatBtn, 'click', () => this.toggleRepeat());
        }
        
        if (this.elements.shuffleBtn) {
            this.utils.on(this.elements.shuffleBtn, 'click', () => this.toggleShuffle());
        }
        
        // 볼륨 컨트롤
        if (this.elements.volumeBtn) {
            this.utils.on(this.elements.volumeBtn, 'click', () => this.toggleMute());
        }
        
        if (this.elements.volumeSlider) {
            this.utils.on(this.elements.volumeSlider, 'input', (e) => {
                this.setVolume(parseFloat(e.target.value) / 100);
            });
        }
        
        // 프로그레스 바 이벤트
        if (this.elements.progressContainer) {
            this.utils.on(this.elements.progressContainer, 'click', (e) => {
                this.handleProgressClick(e);
            });
            
            this.utils.on(this.elements.progressContainer, 'mousedown', (e) => {
                this.handleProgressMouseDown(e);
            });
        }
        
        // 오디오 이벤트
        if (this.elements.audio) {
            this.utils.on(this.elements.audio, 'loadstart', () => this.handleLoadStart());
            this.utils.on(this.elements.audio, 'loadedmetadata', () => this.handleLoadedMetadata());
            this.utils.on(this.elements.audio, 'canplay', () => this.handleCanPlay());
            this.utils.on(this.elements.audio, 'play', () => this.handlePlay());
            this.utils.on(this.elements.audio, 'pause', () => this.handlePause());
            this.utils.on(this.elements.audio, 'ended', () => this.handleEnded());
            this.utils.on(this.elements.audio, 'timeupdate', () => this.handleTimeUpdate());
            this.utils.on(this.elements.audio, 'error', (e) => this.handleError(e));
            this.utils.on(this.elements.audio, 'waiting', () => this.handleWaiting());
            this.utils.on(this.elements.audio, 'playing', () => this.handlePlaying());
        }
        
        // 키보드 단축키
        this.utils.on(document, 'keydown', (e) => this.handleKeyboard(e));
        
        // 미디어 세션 API (지원 시)
        if ('mediaSession' in navigator) {
            this.setupMediaSession();
        }
        
        // 페이지 가시성 변경
        this.utils.on(document, 'visibilitychange', () => {
            if (document.hidden && this.state.isPlaying) {
                // 백그라운드에서도 재생 계속
                this.analytics.sessionStartTime = Date.now();
            }
        });
        
        // 플레이리스트 버튼
        if (this.elements.playlistBtn) {
            this.utils.on(this.elements.playlistBtn, 'click', () => this.togglePlaylist());
        }
        
        // 전체화면 버튼
        if (this.elements.fullscreenBtn) {
            this.utils.on(this.elements.fullscreenBtn, 'click', () => this.toggleFullscreen());
        }
    }
    
    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        const track = this.playlist[index];
        if (!track) return;
        
        this.state.currentTrackIndex = index;
        this.state.isLoading = true;
        
        // 오디오 소스 설정
        this.elements.audio.src = track.src;
        
        // UI 업데이트
        this.updateTrackInfo(track);
        this.updateUI();
        
        // 메타데이터 로드
        this.elements.audio.load();
        
        console.log(`Loading track: ${track.title}`);
    }
    
    updateTrackInfo(track) {
        if (this.elements.trackTitle) {
            this.elements.trackTitle.textContent = track.title;
        }
        
        if (this.elements.trackArtist) {
            this.elements.trackArtist.textContent = track.artist;
        }
        
        if (this.elements.albumImage && track.cover) {
            this.elements.albumImage.src = track.cover;
            this.elements.albumImage.alt = `${track.album} 앨범 커버`;
        }
        
        // 페이지 타이틀 업데이트
        if (this.state.isPlaying) {
            document.title = `♪ ${track.title} - ${track.artist}`;
        }
    }
    
    async togglePlayPause() {
        if (!this.elements.audio) return;
        
        try {
            if (this.state.isPlaying) {
                this.pause();
            } else {
                await this.play();
            }
        } catch (error) {
            console.error('Play/pause error:', error);
            this.handlePlaybackError();
        }
    }
    
    async play() {
        if (!this.elements.audio) return;
        
        // 오디오 컨텍스트 재개 (필요 시)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        try {
            await this.elements.audio.play();
            this.analytics.sessionStartTime = Date.now();
            this.analytics.playCount++;
        } catch (error) {
            throw error;
        }
    }
    
    pause() {
        if (!this.elements.audio) return;
        
        this.elements.audio.pause();
        
        // 재생 시간 기록
        if (this.analytics.sessionStartTime) {
            this.analytics.totalPlayTime += Date.now() - this.analytics.sessionStartTime;
            this.analytics.sessionStartTime = null;
        }
    }
    
    stop() {
        if (!this.elements.audio) return;
        
        this.pause();
        this.elements.audio.currentTime = 0;
        this.updateProgress();
    }
    
    previousTrack() {
        let newIndex;
        
        if (this.state.isShuffle) {
            newIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            newIndex = this.state.currentTrackIndex - 1;
            if (newIndex < 0) {
                newIndex = this.playlist.length - 1;
            }
        }
        
        this.loadTrack(newIndex);
        
        if (this.state.isPlaying) {
            setTimeout(() => this.play(), 100);
        }
    }
    
    nextTrack() {
        let newIndex;
        
        if (this.state.isShuffle) {
            newIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            newIndex = this.state.currentTrackIndex + 1;
            if (newIndex >= this.playlist.length) {
                newIndex = 0;
            }
        }
        
        this.loadTrack(newIndex);
        
        if (this.state.isPlaying) {
            setTimeout(() => this.play(), 100);
        }
    }
    
    toggleRepeat() {
        this.state.isRepeat = !this.state.isRepeat;
        this.utils.toggleClass(this.elements.repeatBtn, 'active', this.state.isRepeat);
        this.saveSettings();
        
        console.log(`Repeat: ${this.state.isRepeat ? 'ON' : 'OFF'}`);
    }
    
    toggleShuffle() {
        this.state.isShuffle = !this.state.isShuffle;
        this.utils.toggleClass(this.elements.shuffleBtn, 'active', this.state.isShuffle);
        
        if (this.state.isShuffle) {
            // 플레이리스트 셔플
            this.shufflePlaylist();
        } else {
            // 원본 플레이리스트 복원
            this.playlist = [...this.originalPlaylist];
        }
        
        this.saveSettings();
        console.log(`Shuffle: ${this.state.isShuffle ? 'ON' : 'OFF'}`);
    }
    
    shufflePlaylist() {
        const currentTrack = this.playlist[this.state.currentTrackIndex];
        
        // Fisher-Yates 셔플 알고리즘
        for (let i = this.playlist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
        }
        
        // 현재 트랙 인덱스 재계산
        this.state.currentTrackIndex = this.playlist.findIndex(track => 
            track.src === currentTrack.src
        );
    }
    
    setVolume(volume) {
        this.state.volume = Math.max(0, Math.min(1, volume));
        
        if (this.elements.audio) {
            this.elements.audio.volume = this.state.volume;
        }
        
        if (this.gainNode) {
            this.gainNode.gain.value = this.state.volume;
        }
        
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.value = this.state.volume * 100;
        }
        
        // 음소거 상태 확인
        this.state.isMuted = this.state.volume === 0;
        this.updateVolumeIcon();
        
        this.saveSettings();
    }
    
    toggleMute() {
        if (this.state.isMuted) {
            this.setVolume(this.state.volume || 0.7);
        } else {
            this.setVolume(0);
        }
    }
    
    updateVolumeIcon() {
        if (!this.elements.volumeBtn) return;
        
        const icon = this.utils.$('i', this.elements.volumeBtn);
        if (!icon) return;
        
        icon.className = '';
        
        if (this.state.isMuted || this.state.volume === 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (this.state.volume < 0.5) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }
    
    handleProgressClick(e) {
        if (!this.elements.audio || !this.state.duration) return;
        
        const rect = this.elements.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * this.state.duration;
        
        this.seekTo(newTime);
    }
    
    handleProgressMouseDown(e) {
        e.preventDefault();
        
        this.state.wasPlayingBeforeDrag = this.state.isPlaying;
        if (this.state.isPlaying) {
            this.pause();
        }
        
        const handleMouseMove = (e) => {
            this.handleProgressClick(e);
        };
        
        const handleMouseUp = () => {
            if (this.state.wasPlayingBeforeDrag) {
                this.play();
            }
            
            this.utils.off(document, 'mousemove', handleMouseMove);
            this.utils.off(document, 'mouseup', handleMouseUp);
        };
        
        this.utils.on(document, 'mousemove', handleMouseMove);
        this.utils.on(document, 'mouseup', handleMouseUp);
    }
    
    seekTo(time) {
        if (!this.elements.audio) return;
        
        this.elements.audio.currentTime = Math.max(0, Math.min(time, this.state.duration));
    }
    
    updateProgress() {
        if (!this.elements.audio) return;
        
        const currentTime = this.elements.audio.currentTime;
        const duration = this.elements.audio.duration || 0;
        
        this.state.currentTime = currentTime;
        this.state.duration = duration;
        
        // 프로그레스 바 업데이트
        if (this.elements.progressFill && duration > 0) {
            const percentage = (currentTime / duration) * 100;
            this.elements.progressFill.style.width = `${percentage}%`;
            
            if (this.elements.progressHandle) {
                this.elements.progressHandle.style.left = `${percentage}%`;
            }
        }
        
        // 시간 표시 업데이트
        if (this.elements.currentTime) {
            this.elements.currentTime.textContent = this.formatTime(currentTime);
        }
        
        if (this.elements.totalTime) {
            this.elements.totalTime.textContent = this.formatTime(duration);
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateUI() {
        // 플레이/정지 버튼 아이콘
        if (this.elements.playPauseBtn) {
            const icon = this.utils.$('i', this.elements.playPauseBtn);
            if (icon) {
                icon.className = this.state.isPlaying ? 'fas fa-pause' : 'fas fa-play';
            }
        }
        
        // 컨테이너 상태 클래스
        if (this.elements.container) {
            this.utils.toggleClass(this.elements.container, 'playing', this.state.isPlaying);
            this.utils.toggleClass(this.elements.container, 'loading', this.state.isLoading);
        }
        
        // 이퀄라이저 애니메이션
        if (this.elements.equalizer) {
            this.utils.toggleClass(this.elements.equalizer, 'animate', this.state.isPlaying);
        }
        
        // 볼륨 아이콘 업데이트
        this.updateVolumeIcon();
        
        // 반복/셔플 버튼 상태
        this.utils.toggleClass(this.elements.repeatBtn, 'active', this.state.isRepeat);
        this.utils.toggleClass(this.elements.shuffleBtn, 'active', this.state.isShuffle);
    }
    
    // 오디오 이벤트 핸들러들
    handleLoadStart() {
        this.state.isLoading = true;
        this.updateUI();
    }
    
    handleLoadedMetadata() {
        this.updateProgress();
    }
    
    handleCanPlay() {
        this.state.isLoading = false;
        this.updateUI();
    }
    
    handlePlay() {
        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.updateUI();
        
        // 페이지 타이틀 업데이트
        const track = this.playlist[this.state.currentTrackIndex];
        if (track) {
            document.title = `♪ ${track.title} - ${track.artist}`;
        }
    }
    
    handlePause() {
        this.state.isPlaying = false;
        this.state.isPaused = true;
        this.updateUI();
        
        // 페이지 타이틀 복원
        document.title = document.title.replace('♪ ', '');
    }
    
    handleEnded() {
        if (this.state.isRepeat) {
            this.seekTo(0);
            this.play();
        } else {
            this.nextTrack();
        }
    }
    
    handleTimeUpdate() {
        this.updateProgress();
    }
    
    handleError(e) {
        console.error('Audio error:', e);
        this.handlePlaybackError();
    }
    
    handleWaiting() {
        this.state.isLoading = true;
        this.updateUI();
    }
    
    handlePlaying() {
        this.state.isLoading = false;
        this.updateUI();
    }
    
    handlePlaybackError() {
        // 에러 시 다음 트랙으로 이동
        console.warn('Playback error, skipping to next track');
        setTimeout(() => {
            this.nextTrack();
        }, 1000);
    }
    
    handleKeyboard(e) {
        // 스페이스바: 재생/정지
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            this.togglePlayPause();
        }
        
        // Ctrl + 화살표: 이전/다음 곡
        if (e.ctrlKey) {
            switch (e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousTrack();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextTrack();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.setVolume(Math.min(1, this.state.volume + 0.1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.setVolume(Math.max(0, this.state.volume - 0.1));
                    break;
                case 'KeyM':
                    e.preventDefault();
                    this.toggleMute();
                    break;
            }
        }
    }
    
    setupMediaSession() {
        if (!('mediaSession' in navigator)) return;
        
        const track = this.playlist[this.state.currentTrackIndex];
        if (!track) return;
        
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: track.artist,
            album: track.album,
            artwork: track.cover ? [
                { src: track.cover, sizes: '512x512', type: 'image/jpeg' }
            ] : []
        });
        
        // 미디어 세션 액션 핸들러
        navigator.mediaSession.setActionHandler('play', () => this.play());
        navigator.mediaSession.setActionHandler('pause', () => this.pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => this.previousTrack());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
        navigator.mediaSession.setActionHandler('seekbackward', () => {
            this.seekTo(this.state.currentTime - 10);
        });
        navigator.mediaSession.setActionHandler('seekforward', () => {
            this.seekTo(this.state.currentTime + 10);
        });
    }
    
    togglePlaylist() {
        // 플레이리스트 UI 토글 (향후 구현)
        console.log('Playlist toggle');
    }
    
    toggleFullscreen() {
        // 전체화면 모드 토글 (향후 구현)
        console.log('Fullscreen toggle');
    }
    
    saveSettings() {
        const settings = {
            volume: this.state.volume,
            isRepeat: this.state.isRepeat,
            isShuffle: this.state.isShuffle,
            currentTrackIndex: this.state.currentTrackIndex
        };
        
        this.utils.storage.set(this.config.storageKey, settings);
    }
    
    loadSettings() {
        const settings = this.utils.storage.get(this.config.storageKey, {});
        
        if (settings.volume !== undefined) {
            this.setVolume(settings.volume);
        }
        
        if (settings.isRepeat !== undefined) {
            this.state.isRepeat = settings.isRepeat;
        }
        
        if (settings.isShuffle !== undefined) {
            this.state.isShuffle = settings.isShuffle;
        }
        
        if (settings.currentTrackIndex !== undefined && 
            settings.currentTrackIndex < this.playlist.length) {
            this.state.currentTrackIndex = settings.currentTrackIndex;
        }
    }
    
    // 공개 메서드
    getCurrentTrack() {
        return this.playlist[this.state.currentTrackIndex];
    }
    
    getPlaylist() {
        return [...this.playlist];
    }
    
    getAnalytics() {
        return { ...this.analytics };
    }
    
    addToPlaylist(track) {
        this.playlist.push(track);
        this.originalPlaylist.push(track);
    }
    
    removeFromPlaylist(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.playlist.splice(index, 1);
            
            // 현재 재생 중인 트랙 인덱스 조정
            if (index < this.state.currentTrackIndex) {
                this.state.currentTrackIndex--;
            } else if (index === this.state.currentTrackIndex) {
                this.loadTrack(Math.min(this.state.currentTrackIndex, this.playlist.length - 1));
            }
        }
    }
    
    destroy() {
        this.pause();
        this.saveSettings();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        console.log('Music Player destroyed');
    }
}

// 전역 인스턴스 생성
let musicPlayer = null;

this.utils.ready(() => {
    musicPlayer = new MusicPlayer();
    
    // 전역 접근을 위해 window에 할당
    window.musicPlayer = musicPlayer;
});

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicPlayer;
}

console.log('Music Player component loaded');