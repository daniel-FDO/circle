import { Link, useSearchParams } from "react-router";
import { CheckIcon, SlidersIcon } from "../components/Icons";
import NotificationCard from "../components/notifications/NotificationCard";
import NotificationSidebar from "../components/notifications/NotificationSidebar";
import type { NotificationCategory } from "../data/notifications";
import { useFeed } from "../layouts/feedContext";
import { categories, groupLabel, type FeedNotification } from "../lib/notifications";

type Filter = NotificationCategory | "all";

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

const isFilter = (v: string | null): v is Filter => categories.some((c) => c.id === v);

// The active filter lives in ?filter= so refresh and Back/Forward keep it
const Notifications = () => {
  const { notifications, markNotificationsRead } = useFeed();
  const [params] = useSearchParams();
  const requested = params.get("filter");
  const filter: Filter = isFilter(requested) ? requested : "all";

  const visible = filter === "all" ? notifications : notifications.filter((n) => n.category === filter);
  const unreadIn = (id: Filter) =>
    notifications.filter((n) => n.unread && (id === "all" || n.category === id)).length;
  const totalUnread = unreadIn("all");
  const visibleUnread = visible.filter((n) => n.unread).length;

  const groups: { label: string; items: FeedNotification[] }[] = [];
  for (const n of visible) {
    const label = groupLabel(n.at);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(n);
    else groups.push({ label, items: [n] });
  }

  const openPreferences = () => {
    const toggle = document.getElementById("quiet-digest");
    if (!toggle) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    toggle.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    toggle.focus({ preventScroll: true });
  };

  return (
    <div className="pt-4 md:pt-7">
      <header className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Atelier feed · Dispatch</p>
          <h1 className="mt-1 font-serif text-4xl md:text-[44px] font-semibold leading-tight">Notifications</h1>
          <p className="mt-1.5 max-w-xl text-sm text-on-surface-variant">
            Updates on discussions, intimate salons, and curated gestures across your creative circle.
          </p>
          <p className="mt-1 text-[11px] text-muted">Sample notifications · your responses are saved on this device</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => markNotificationsRead(notifications.map((n) => n.id))}
            disabled={totalUnread === 0}
            className="h-9 px-3.5 rounded-full border border-line bg-white text-xs font-bold inline-flex items-center gap-1.5 text-on-surface hover:border-primary/40 hover:text-primary transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-line disabled:hover:text-on-surface"
          >
            <CheckIcon className="w-3 h-3" />
            Mark all read
          </button>
          <button
            type="button"
            onClick={openPreferences}
            aria-label="Notification preferences"
            title="Notification preferences"
            className="w-9 h-9 rounded-full border border-line bg-white flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/40 transition"
          >
            <SlidersIcon />
          </button>
        </div>
      </header>

      <nav aria-label="Filter notifications" className="mt-5 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto">
        <ul className="flex gap-2 w-max pb-1">
          {categories.map((c) => {
            const active = c.id === filter;
            const count = unreadIn(c.id);
            return (
              <li key={c.id}>
                <Link
                  to={c.id === "all" ? "/notifications" : `/notifications?filter=${c.id}`}
                  aria-current={active ? "page" : undefined}
                  className={`relative h-9 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border transition whitespace-nowrap ${
                    active
                      ? "bg-primary border-primary text-white"
                      : "bg-white border-line text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
                  }`}
                >
                  {c.label}
                  {count > 0 && (
                    <span
                      className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-[18px] text-center ${
                        active ? "bg-white/25 text-white" : "bg-surface-high text-on-surface-variant"
                      }`}
                    >
                      {count}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_16.5rem] xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] pb-6">
        <div className="min-w-0">
          {groups.length === 0 ? (
            <p className="bg-white border border-line rounded-xl p-8 text-center text-sm text-muted">
              No notifications in this category.
            </p>
          ) : (
            groups.map((g) => (
              <section key={g.label} aria-labelledby={`group-${slug(g.label)}`} className="mb-6">
                <h2
                  id={`group-${slug(g.label)}`}
                  className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted"
                >
                  {g.label} · {g.items.length} {g.items.length === 1 ? "moment" : "moments"}
                </h2>
                <div className="space-y-3">
                  {g.items.map((n) => (
                    <NotificationCard key={n.id} n={n} />
                  ))}
                </div>
              </section>
            ))
          )}
          {groups.length > 0 && (
            <p role="status" className="py-4 text-center text-xs text-muted">
              {visibleUnread === 0
                ? "You've absorbed every quiet dispatch here. Nothing unread."
                : `That's everything here · ${visibleUnread} still unread.`}
            </p>
          )}
        </div>

        <NotificationSidebar />
      </div>
    </div>
  );
};

export default Notifications;
