// src/components/Layout.jsx

function Layout({ children, onToggleTheme, isLight }) {
  return (
    <div className={`app-root ${isLight ? "light-mode" : "dark-mode"}`}>
      <header className="top-nav">
        <h1 className="logo-text">AlgoSensei</h1>
        <nav className="nav-links">
          <button className="nav-btn">Home</button>
          <button className="nav-btn">Problems</button>
          <button className="nav-btn">Analyze Code</button>
          <button className="toggle-btn" onClick={onToggleTheme}>
            {isLight ? "Dark Mode" : "Light Mode"}
          </button>
        </nav>
      </header>

      <main className="main-area">{children}</main>
    </div>
  );
}

export default Layout;
