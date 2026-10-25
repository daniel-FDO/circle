import { useState } from "react";
import { Link } from "react-router";
import Avatar from "../Avatar";
import { CalendarIcon, CheckIcon, LinkIcon, MapPinIcon, PenIcon, ShareIcon } from "../Icons";
import type { Curation, Profile } from "../../types";

export type ProfileTab = { id: string; label: string; count: number | null };

type ProfileHeaderProps = {
  profile: Profile;
  curation: Curation;
  joinedAt: string | null;
  postCount: number;
  tabs: ProfileTab[];
  activeTab: string;
};

const websiteHref = (site: string) => (/^https?:\/\//i.test(site) ? site : `https://${site}`);

const ProfileHeader = ({ profile, curation, joinedAt, postCount, tabs, activeTab }: ProfileHeaderProps) => {
  const [copied, setCopied] = useState(false);
  const joined = joinedAt
    ? new Date(joinedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;
  const stats = [
    { value: curation.following.length, label: "Following" },
    { value: curation.topics.length, label: curation.topics.length === 1 ? "Circle" : "Circles" },
    { value: postCount, label: postCount === 1 ? "Post" : "Posts" },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/profile`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <section className="bg-white border border-line rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(30,27,25,0.04)]">
      <div className="h-32 sm:h-40 md:h-44 bg-surface-high">
        <img
          src="/images/kumiko.jpg"
          alt=""
          className="w-full h-full object-cover"
          style={{ objectPosition: "50% 18%" }}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </div>

      <div className="px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <Avatar
            name={profile.displayName}
            src={profile.avatar}
            className="-mt-12 md:-mt-14 w-24 h-24 md:w-28 md:h-28 text-2xl ring-4 ring-white shadow-sm"
          />
          <div className="flex items-center gap-2 pt-3">
            <Link
              to="/profile/edit"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-line bg-white text-sm font-bold text-on-surface hover:border-primary/50 hover:text-primary transition"
            >
              <PenIcon className="w-3.5 h-3.5" /> Edit Profile
            </Link>
            <button
              type="button"
              onClick={copyLink}
              aria-label={copied ? "Profile link copied" : "Copy profile link"}
              title="Copy profile link"
              className="w-9 h-9 rounded-full border border-line bg-white flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/50 transition"
            >
              {copied ? <CheckIcon className="w-3.5 h-3.5 text-primary" /> : <ShareIcon />}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h1 className="font-serif text-2xl md:text-[28px] font-semibold leading-tight break-words">
            {profile.displayName}
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary-soft text-primary text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Circle member
          </span>
          {curation.topics.slice(0, 2).map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
              {t}
            </span>
          ))}
        </div>
        <p className="mt-0.5 text-sm text-muted">
          @{profile.handle}
          {profile.pronouns && ` · ${profile.pronouns}`}
        </p>

        {profile.bio && (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-on-surface">{profile.bio}</p>
        )}

        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-on-surface-variant">
          {profile.location && (
            <li className="inline-flex items-center gap-1.5">
              <MapPinIcon /> {profile.location}
            </li>
          )}
          {profile.website && (
            <li className="inline-flex items-center gap-1.5 min-w-0">
              <LinkIcon />
              <a
                href={websiteHref(profile.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline truncate"
              >
                {profile.website.replace(/^https?:\/\//i, "")}
              </a>
            </li>
          )}
          {joined && (
            <li className="inline-flex items-center gap-1.5">
              <CalendarIcon /> Joined {joined}
            </li>
          )}
        </ul>

        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {stats.map((s) => (
            <div key={s.label} className="flex items-baseline gap-1.5">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-bold text-on-surface">{s.value.toLocaleString()}</dd>
              <span className="text-muted" aria-hidden>
                {s.label}
              </span>
            </div>
          ))}
        </dl>
      </div>

      <nav aria-label="Profile sections" className="mt-4 border-t border-line">
        <ul className="flex overflow-x-auto px-2 md:px-4 [scrollbar-width:none]">
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <li key={tab.id} className="shrink-0">
                <Link
                  to={tab.id === "posts" ? "/profile" : `/profile?tab=${tab.id}`}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-1.5 h-12 px-3 text-sm whitespace-nowrap transition ${
                    active ? "font-bold text-on-surface" : "font-medium text-muted hover:text-on-surface"
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span
                      className={`text-[11px] font-bold px-1.5 rounded-full ${
                        active ? "bg-primary-soft text-primary" : "bg-surface-high text-muted"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {active && <span className="absolute left-3 right-3 bottom-0 h-0.5 rounded-full bg-primary" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
};

export default ProfileHeader;
