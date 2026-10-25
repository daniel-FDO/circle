import { Link } from "react-router";
import { card } from "../home/styles";
import { CalendarIcon, CheckIcon, MoonIcon, TrendIcon } from "../Icons";
import { salons } from "../../data/notifications";
import { useFeed } from "../../layouts/feedContext";
import { categories, salonTime } from "../../lib/notifications";
import { DateTile } from "./NotificationCard";

const heading = "flex items-center gap-2 text-sm font-bold";

const SlowDelivery = () => {
  const { notificationStore, setQuietDigest } = useFeed();
  const on = notificationStore.quietDigest;
  return (
    <section aria-labelledby="slow-delivery-heading" className={`${card} p-4`}>
      <div className="flex items-center justify-between gap-2">
        <h2 id="slow-delivery-heading" className={heading}>
          <MoonIcon className="w-4 h-4 text-primary" />
          Slow Delivery
        </h2>
        <span className="h-5 px-2 rounded-md bg-surface-high text-[10px] font-bold text-on-surface-variant leading-5">
          Saved locally
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Prefer a calmer inbox? Quiet Digest Mode records that you'd like updates batched twice daily, at{" "}
        <strong className="text-on-surface">09:00</strong> and <strong className="text-on-surface">18:00</strong>.
      </p>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-surface-low border border-line px-3 py-2.5">
        <span className="min-w-0">
          <span id="quiet-digest-label" className="block text-xs font-bold">
            Quiet Digest Mode
          </span>
          <span className="block text-[11px] text-muted">{on ? "Preference on" : "Preference off"}</span>
        </span>
        <button
          id="quiet-digest"
          type="button"
          role="switch"
          aria-checked={on}
          aria-labelledby="quiet-digest-label"
          aria-describedby="quiet-digest-note"
          onClick={() => setQuietDigest(!on)}
          className={`relative w-11 h-6 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-line"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              on ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>
      <p id="quiet-digest-note" className="mt-2 text-[11px] text-muted">
        This prototype has no delivery server, so the setting is saved on this device and doesn't change delivery yet.
      </p>
    </section>
  );
};

const UpcomingSalons = () => {
  const { notificationStore } = useFeed();
  return (
    <section aria-labelledby="salons-heading" className={`${card} p-4`}>
      <div className="flex items-center justify-between gap-2">
        <h2 id="salons-heading" className={heading}>
          <CalendarIcon className="w-4 h-4 text-primary" />
          Upcoming Salons
        </h2>
        <Link to="/notifications?filter=salons" className="text-xs font-semibold text-primary hover:underline">
          View invites
        </Link>
      </div>
      <ul className="mt-3 space-y-3">
        {salons.map((s) => {
          const rsvp = notificationStore.rsvp[s.id];
          return (
            <li key={s.id} className="flex items-center gap-3">
              <DateTile salon={s} size="sm" />
              <div className="min-w-0">
                <p className="text-[13px] font-bold truncate">{s.title}</p>
                <p className="text-[11px] text-muted truncate">{salonTime(s)}</p>
                <p
                  className={`mt-0.5 text-[11px] font-semibold flex items-center gap-1 ${
                    rsvp === "going" ? "text-emerald-800" : "text-muted"
                  }`}
                >
                  {rsvp === "going" && <CheckIcon className="w-3 h-3" />}
                  {rsvp === "going" ? "RSVP confirmed" : rsvp === "declined" ? "Declined" : "Invited · awaiting reply"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const palette = ["#630ed4", "#e11d48", "#d97706", "#0284c7"];

// Derived from the notifications on this page, not from usage analytics
const InteractionRhythms = () => {
  const { notifications } = useFeed();
  const total = notifications.length;
  const read = notifications.filter((n) => !n.unread).length;
  const readPct = total ? Math.round((read / total) * 100) : 0;
  const counts = categories
    .filter((c) => c.id !== "all")
    .map((c, i) => ({
      label: c.label,
      color: palette[i],
      pct: total ? (notifications.filter((n) => n.category === c.id).length / total) * 100 : 0,
    }));
  // Each arc starts where the previous ones end
  const slices = counts.map((s, i) => ({ ...s, offset: counts.slice(0, i).reduce((sum, p) => sum + p.pct, 0) }));

  const r = 15.9155; // circumference of 100 makes dash lengths read as percentages

  return (
    <section aria-labelledby="rhythms-heading" className={`${card} p-4`}>
      <div className="flex items-center justify-between gap-2">
        <h2 id="rhythms-heading" className={heading}>
          <TrendIcon className="w-4 h-4 text-primary" />
          Interaction Rhythms
        </h2>
        <span className="text-[11px] text-muted">Sample data</span>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r={r} fill="none" stroke="var(--color-surface-high)" strokeWidth="4" />
            {slices.map((s) => (
              <circle
                key={s.label}
                cx="18"
                cy="18"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="4"
                strokeDasharray={`${s.pct} ${100 - s.pct}`}
                strokeDashoffset={-s.offset}
              />
            ))}
          </svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold leading-none">{readPct}%</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted mt-0.5">read</span>
          </span>
        </div>
        <ul className="flex-1 min-w-0 space-y-1.5">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center gap-2 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} aria-hidden />
              <span className="flex-1 min-w-0 truncate text-on-surface-variant">{s.label}</span>
              <span className="font-bold tabular-nums">{Math.round(s.pct)}%</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-[11px] text-muted leading-relaxed">
        Share of the {total} sample notifications on this page by type, and how many you've read. Not usage analytics.
      </p>
    </section>
  );
};

const NotificationSidebar = () => (
  <aside aria-label="Notification tools" className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 lg:sticky lg:top-5 lg:self-start">
    <SlowDelivery />
    <UpcomingSalons />
    <div className="md:col-span-2 lg:col-span-1">
      <InteractionRhythms />
    </div>
  </aside>
);

export default NotificationSidebar;
