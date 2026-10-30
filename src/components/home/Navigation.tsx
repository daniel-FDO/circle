import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router";
import Avatar from "../Avatar";
import SignOutButton from "../SignOutButton";
import {
  BellIcon,
  BookmarkIcon,
  CompassIcon,
  HomeIcon,
  MailIcon,
  MoreIcon,
  PenIcon,
  PlusIcon,
  UserIcon,
} from "../Icons";
import type { Profile } from "../../types";

type Unread = { notifications: number; messages: number };

type NavItem = { to: string; label: string; icon: ReactNode; badge?: keyof Unread };

const navItems: NavItem[] = [
  { to: "/home", label: "Home", icon: <HomeIcon /> },
  { to: "/explore", label: "Explore", icon: <CompassIcon /> },
  { to: "/notifications", label: "Notifications", icon: <BellIcon />, badge: "notifications" },
  { to: "/messages", label: "Messages", icon: <MailIcon />, badge: "messages" },
  { to: "/bookmarks", label: "Bookmarks", icon: <BookmarkIcon className="w-5 h-5" /> },
  { to: "/profile", label: "Profile", icon: <UserIcon /> },
];

export const Logo = ({ compact = false }: { compact?: boolean }) => (
  <span className="flex items-center gap-2.5">
    <span className="relative w-8 h-8 rounded-full bg-surface-high flex items-center justify-center shrink-0" aria-hidden>
      <span className="w-3 h-3 rounded-full border-[2.5px] border-primary" />
      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-primary" />
    </span>
    <span className={`font-serif text-xl font-semibold ${compact ? "lg:inline hidden" : ""}`}>Circle</span>
  </span>
);

const Badge = ({ count, className = "" }: { count: number; className?: string }) =>
  count > 0 ? (
    <span
      className={`min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold leading-[18px] text-center ${className}`}
    >
      {count}
      <span className="sr-only"> unread</span>
    </span>
  ) : null;

type SidebarProps = {
  profile: Profile;
  unread: Unread;
  onCreatePost: () => void;
};

export const Sidebar = ({ profile, unread, onCreatePost }: SidebarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside className="hidden md:flex sticky top-0 h-screen flex-col py-5 lg:pr-2">
      <Link to="/home" aria-label="Circle home" className="px-2 lg:px-3 self-start rounded-lg">
        <Logo compact />
      </Link>

      <nav aria-label="Main" className="mt-7">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                aria-label={item.label}
                title={item.label}
                className={({ isActive }) =>
                  `relative w-full flex items-center gap-3 h-11 px-3 rounded-lg text-sm transition justify-center lg:justify-start ${
                    isActive
                      ? "bg-surface-high text-on-surface font-bold"
                      : "text-on-surface-variant font-medium hover:bg-surface-low hover:text-on-surface"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? "text-primary" : ""}>{item.icon}</span>
                    <span className="hidden lg:inline flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge count={unread[item.badge]} className="absolute top-1.5 right-1.5 lg:static" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        onClick={onCreatePost}
        aria-label="Create post"
        className="mt-5 h-11 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm shadow-primary/30 hover:brightness-110 transition"
      >
        <PenIcon />
        <span className="hidden lg:inline">Create post</span>
      </button>

      <div className="mt-auto relative flex items-center gap-1">
        {/* Identity always goes straight to the profile; the menu has its own button */}
        <Link
          to="/profile"
          title="Your profile"
          className="flex-1 min-w-0 flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-low justify-center lg:justify-start"
        >
          <Avatar name={profile.displayName} src={profile.avatar} className="w-9 h-9 text-xs" />
          <span className="sr-only lg:hidden">Your profile: {profile.displayName}</span>
          <span className="hidden lg:block min-w-0">
            <span className="block text-sm font-bold truncate">{profile.displayName}</span>
            <span className="block text-xs text-muted truncate">@{profile.handle}</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="Account options"
          className="hidden lg:flex w-9 h-9 shrink-0 rounded-full items-center justify-center text-muted hover:bg-surface-low hover:text-on-surface"
        >
          <MoreIcon className="w-4 h-4" />
        </button>
        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Close account menu"
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setMenuOpen(false)}
            />
            <div role="menu" className="absolute bottom-full right-0 mb-2 z-20 w-48 bg-white border border-line rounded-lg shadow-lg py-1">
              <Link
                role="menuitem"
                to="/profile/edit"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm hover:bg-surface-low"
              >
                Edit profile
              </Link>
              <SignOutButton
                role="menuitem"
                className="block w-full text-left px-3 py-2 text-sm hover:bg-surface-low disabled:opacity-60"
              />
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export const MobileHeader = ({ profile, unread }: { profile: Profile; unread: Unread }) => (
  <header className="md:hidden sticky top-0 z-30 bg-surface border-b border-line">
    <div className="h-14 px-4 flex items-center justify-between">
      <Link to="/home" aria-label="Circle home" className="rounded-lg">
        <Logo />
      </Link>
      <div className="flex items-center gap-1">
        <NavLink
          to="/messages"
          aria-label="Messages"
          className={({ isActive }) =>
            `relative w-11 h-11 rounded-full flex items-center justify-center hover:bg-surface-low ${
              isActive ? "text-primary" : "text-on-surface-variant"
            }`
          }
        >
          <MailIcon />
          <Badge count={unread.messages} className="absolute top-1 right-1" />
        </NavLink>
        <NavLink to="/profile" aria-label="Profile" className="w-11 h-11 flex items-center justify-center rounded-full">
          <Avatar name={profile.displayName} src={profile.avatar} className="w-8 h-8 text-xs" />
        </NavLink>
      </div>
    </div>
  </header>
);

export const MobileTabBar = ({ unread, onCreatePost }: { unread: Unread; onCreatePost: () => void }) => {
  const tab = (to: string, label: string, icon: ReactNode, count = 0) => (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        `relative flex-1 h-14 flex items-center justify-center ${isActive ? "text-primary" : "text-on-surface-variant"}`
      }
    >
      {icon}
      <Badge count={count} className="absolute top-2 left-1/2 ml-1" />
    </NavLink>
  );

  return (
    <nav aria-label="Main" className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-line flex items-center px-2 pb-[env(safe-area-inset-bottom)]">
      {tab("/home", "Home", <HomeIcon />)}
      {tab("/explore", "Explore", <CompassIcon />)}
      <div className="flex-1 flex justify-center">
        <button
          type="button"
          onClick={onCreatePost}
          aria-label="Create post"
          className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-sm shadow-primary/30"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
      {tab("/notifications", "Notifications", <BellIcon />, unread.notifications)}
      {tab("/bookmarks", "Bookmarks", <BookmarkIcon className="w-5 h-5" />)}
    </nav>
  );
};
