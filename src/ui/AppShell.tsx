import { useState, type ReactNode } from 'react';
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare2,
  CircleGauge,
  FileClock,
  ListChecks,
  Menu,
  SearchCheck,
  Settings,
  ShieldCheck,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface AppShellProps {
  children: ReactNode;
}

interface NavigationItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

const navigation: NavigationItem[] = [
  { label: 'Today', to: '/', icon: CalendarDays, end: true },
  { label: 'All Actions', to: '/actions', icon: ListChecks },
  { label: 'Daily Brief', to: '/brief', icon: FileClock },
  { label: 'Targets', to: '/targets', icon: CircleGauge },
  { label: 'Pipeline', to: '/pipeline', icon: BriefcaseBusiness },
  { label: 'Evidence', to: '/evidence', icon: SearchCheck },
  { label: 'Approvals', to: '/approvals', icon: ShieldCheck },
  { label: 'Library', to: '/library', icon: BookOpen },
];

export function AppShell({ children }: AppShellProps) {
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <aside className={navigationOpen ? 'sidebar sidebar--open' : 'sidebar'}>
        <div className="sidebar__brand" aria-label="Linq Command Center">
          <span className="sidebar__brand-mark">L</span>
          <span>
            <strong>Linq</strong>
            <small>Command Center</small>
          </span>
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setNavigationOpen(false)}
              className={({ isActive }) =>
                isActive ? 'primary-nav__link primary-nav__link--active' : 'primary-nav__link'
              }
            >
              <Icon aria-hidden="true" strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <NavLink className="sidebar__settings" to="/settings">
            <Settings aria-hidden="true" />
            <span>Settings</span>
          </NavLink>
          <div className="founder-profile">
            <span className="founder-profile__avatar">
              <UserRound aria-hidden="true" />
            </span>
            <span>
              <strong>Founder</strong>
              <small>Team view</small>
            </span>
          </div>
        </div>
      </aside>

      {navigationOpen ? (
        <button
          type="button"
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setNavigationOpen(false)}
        />
      ) : null}

      <div className="workspace">
        <header className="workspace-header">
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label={navigationOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={navigationOpen}
            onClick={() => setNavigationOpen((open) => !open)}
          >
            {navigationOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>

          <div className="workspace-header__date">
            <CalendarDays aria-hidden="true" />
            <span>July 20, 2026</span>
          </div>

          <div className="workspace-header__safety" aria-label="Safety status">
            <CheckSquare2 aria-hidden="true" />
            <span>Outbound disabled</span>
          </div>
        </header>

        <main id="main-content" className="workspace-main">
          {children}
        </main>
      </div>
    </div>
  );
}
