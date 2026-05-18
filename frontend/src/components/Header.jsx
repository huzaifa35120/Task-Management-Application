import { useTheme } from '../contexts/ThemeContext.jsx';

export default function Header({ stats }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header__brand">
        <div className="logo" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="32" height="32">
            <defs>
              <linearGradient id="lg" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#6366f1" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#lg)" />
            <path
              d="M9 16.5l4.5 4.5L23 11.5"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h1>TaskFlow</h1>
          <p className="tagline">Plan your work. Flow through your day.</p>
        </div>
      </div>

      <div className="header__right">
        {stats && (
          <div className="header__stats" aria-label="Task statistics">
            <Stat label="Total" value={stats.total} />
            <Stat label="To do" value={stats.status?.todo ?? 0} tone="todo" />
            <Stat label="In progress" value={stats.status?.['in-progress'] ?? 0} tone="in-progress" />
            <Stat label="Done" value={stats.status?.done ?? 0} tone="done" />
          </div>
        )}
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title="Toggle theme"
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className={`stat${tone ? ` stat--${tone}` : ''}`}>
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
