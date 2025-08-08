# 🔥 Burning Burger

> **불타는 맛의 정점! 프리미엄 수제 햄버거의 진수를 선보이는 모던 웹사이트**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/ko/docs/Web/JavaScript)

## 📖 프로젝트 소개

**Burning Burger**는 프리미엄 수제 햄버거 브랜드의 공식 웹사이트입니다. 불타는 맛을 테마로 한 강렬한 브랜딩과 함께, 신선한 국내산 소고기 패티와 엄선된 재료로 만든 시그니처 햄버거들을 소개합니다.

### ✨ 주요 특징

- 🔥 **강렬한 브랜딩**: 불타는 맛을 형상화한 그라디언트와 애니메이션
- 🎨 **모던 디자인**: Glassmorphism과 블러 효과를 활용한 세련된 UI
- 📱 **완전 반응형**: 모든 디바이스에서 최적화된 사용자 경험
- ⚡ **부드러운 애니메이션**: CSS 키프레임과 transform을 활용한 인터랙티브 요소
- 🚀 **성능 최적화**: 가벼운 순수 HTML/CSS/JS 구조

## 🍔 메뉴 라인업

| 메뉴 | 설명 | 가격 |
|------|------|------|
| 🔥 **클래식 파이어 치즈버거** | 정통 미국식 햄버거의 불타는 완성형 | ₩12,000 |
| 🔥 **스파이시 베이컨 블레이즈** | 바삭한 베이컨과 특제 매운소스의 환상조합 | ₩15,000 |
| 🔥 **프리미엄 인페르노 머쉬룸** | 아보카도와 버섯의 불타는 프리미엄 조합 | ₩17,000 |

## 🛠️ 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업과 웹 표준 준수
- **CSS3**: Flexbox, Grid, Keyframes, Backdrop-filter
- **JavaScript**: 인터랙티브 요소 (필요시 확장 가능)
- **Google Fonts**: Fredoka One, Noto Sans KR

### 디자인 시스템
- **컬러 팔레트**: Orange (#FF4500), Orange Red (#FF8C00), Crimson (#DC143C)
- **타이포그래피**: 한글 최적화 폰트 조합
- **애니메이션**: 60fps 부드러운 트랜지션

## 📁 프로젝트 구조

```
burning-burger/
├── index.html              # 메인 페이지
├── css/
│   ├── reset.css          # CSS 리셋
│   ├── common.css         # 공통 스타일
│   └── main.css           # 메인 스타일
└── images/
    ├── logo.png           # 로고 이미지
    ├── background.png     # 배경 이미지
    ├── classic-burger.jpg # 클래식 버거 이미지
    ├── bacon-burger.jpg   # 베이컨 버거 이미지
    └── mushroom-burger.jpg # 머쉬룸 버거 이미지
```

## 🚀 시작하기

### 필수 조건
- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 웹 서버 (개발용: Live Server, Python SimpleHTTPServer 등)

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/yourusername/burning-burger.git
   cd burning-burger
   ```

2. **로컬 서버 실행**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (http-server)
   npx http-server
   ```

3. **브라우저에서 확인**
   ```
   http://localhost:8000
   ```

## 🎯 주요 기능

### 🎨 비주얼 효과
- **그라디언트 애니메이션**: 15초 주기로 변화하는 배경 그라디언트
- **Glassmorphism**: 블러 효과와 반투명성을 활용한 모던 카드 디자인
- **Float Animation**: 히어로 이미지의 부유 효과
- **Hover Effects**: 메뉴 아이템과 버튼의 인터랙티브 반응

### 📱 반응형 디자인
- **Desktop**: 1200px 이상 - 풀 레이아웃
- **Tablet**: 768px - 1199px - 적응형 레이아웃
- **Mobile**: 768px 이하 - 세로 스택 레이아웃

### ⚡ 성능 최적화
- CSS 프리로딩과 최적화된 애니메이션
- 이미지 lazy loading 준비
- 최소한의 HTTP 요청

## 🎨 디자인 하이라이트

### 컬러 시스템
```css
/* Primary Gradient */
background: linear-gradient(135deg, #ff4500, #ff8c00, #dc143c);

/* Glass Effect */
background: rgba(255, 255, 255, 0.92);
backdrop-filter: blur(15px);
```

### 애니메이션
- **Gradient Shift**: 배경 색상의 점진적 변화
- **Float Effect**: Y축 -10px 이동으로 부유감 연출
- **Rocket Animation**: CTA 버튼의 로켓 아이콘 움직임

## 🔧 커스터마이징

### 색상 변경
`main.css`의 CSS 변수를 수정하여 브랜드 컬러를 변경할 수 있습니다:

```css
:root {
  --primary-orange: #ff4500;
  --secondary-orange: #ff8c00;
  --accent-crimson: #dc143c;
}
```

### 메뉴 추가
`index.html`의 `.menu-gallery` 섹션에 새로운 `.menu-item`을 추가:

```html
<div class="menu-item">
  <div class="menu-image">
    <img src="images/new-burger.jpg" alt="새로운 버거" class="menu-img">
  </div>
  <h3>🔥 새로운 버거 이름</h3>
  <p>버거 설명</p>
  <div class="price">₩가격</div>
</div>
```

## 📈 향후 계획

- [ ] **백엔드 연동**: 주문 시스템 구현
- [ ] **CMS 통합**: 메뉴 관리 시스템
- [ ] **PWA 지원**: 오프라인 접근 가능
- [ ] **다국어 지원**: 영어, 일본어 버전 추가
- [ ] **결제 시스템**: 온라인 주문 및 결제 기능

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 👥 개발팀

- **Frontend Developer**: [Your Name](https://github.com/yourusername)
- **UI/UX Designer**: [Designer Name](https://github.com/designerusername)

## 📞 연락처

프로젝트 관련 문의사항이 있으시면 언제든지 연락해 주세요!

- 📧 Email: contact@burningburger.com
- 🐙 GitHub: [@yourusername](https://github.com/yourusername)
- 🌐 Website: [burningburger.com](https://burningburger.com)

---

<div align="center">

**🔥 Made with ❤️ and 🍔 by Burning Burger Team**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/burning-burger?style=social)](https://github.com/yourusername/burning-burger/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/burning-burger?style=social)](https://github.com/yourusername/burning-burger/network)

</div>