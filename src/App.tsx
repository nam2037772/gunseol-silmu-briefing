import './App.css'
import NewsBoard from './components/NewsBoard'

function App() {
  return (
    <div id="top">
      <header className="app-header">
        <div className="app-header__inner">
          <h1 className="app-header__title">건설뉴스브리핑</h1>
          <p className="app-header__subtitle">
            건설 실무자가 확인해야 할 공식 공지, 정책, 안전 정보를 한곳에 모아 보여줍니다.
          </p>
        </div>
      </header>

      <main className="app-main">
        <NewsBoard />
        <p className="app-disclaimer">
          국토교통부, 대한건설협회, 대한건축사협회, CSI(건설공사 안전관리 종합정보망) 등 공식 출처의 공지·보도자료·안전자료를
          하루 1~2회 자동 수집합니다. 공식 출처 링크만 제공하며 원문 전문은 저장하지 않습니다.
        </p>
      </main>

      <footer className="app-footer">
        <p className="app-footer__text">건설뉴스브리핑은 문서방의 공식소식 관제센터입니다.</p>
        <a
          className="app-footer__link"
          href="https://nam2037772.github.io/munseobang-open-toolbox/"
          target="_blank"
          rel="noopener noreferrer"
        >
          문서방 바로가기
        </a>
      </footer>
    </div>
  )
}

export default App
