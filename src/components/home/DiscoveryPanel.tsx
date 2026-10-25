import { Link } from "react-router";
import Avatar from "../Avatar";
import { SearchIcon, TrendIcon } from "../Icons";
import { suggestedVoices, trending } from "../../data/discovery";

type DiscoveryPanelProps = {
  query: string;
  activeTopic: string | null;
  following: Set<string>;
  onQuery: (query: string) => void;
  onToggleFollow: (handle: string) => void;
  onTopic: (topic: string) => void;
};

const card = "bg-white border border-line rounded-xl p-4 shadow-[0_1px_2px_rgba(30,27,25,0.04)]";

const DiscoveryPanel = ({
  query,
  activeTopic,
  following,
  onQuery,
  onToggleFollow,
  onTopic,
}: DiscoveryPanelProps) => {
  return (
    <aside className="hidden lg:block sticky top-0 max-h-screen overflow-y-auto py-5 space-y-4">
      <div className="relative">
        <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <label htmlFor="search" className="sr-only">
          Search creators, studios
        </label>
        <input
          id="search"
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search creators, studios..."
          className="w-full h-10 rounded-full bg-white border border-line pl-10 pr-4 text-sm outline-none placeholder:text-muted focus:border-primary/50"
        />
      </div>

      <section className={card} aria-labelledby="suggested-heading">
        <div className="flex items-baseline justify-between">
          <h2 id="suggested-heading" className="font-serif text-[17px] font-semibold">
            Suggested for you
          </h2>
          <Link to="/explore" className="text-xs font-bold text-primary hover:underline">
            Explore all
          </Link>
        </div>
        <ul className="mt-3 space-y-3">
          {suggestedVoices.map((voice) => {
            const isFollowing = following.has(voice.handle);
            return (
              <li key={voice.handle} className="flex items-center gap-2.5">
                <Avatar name={voice.name} className="w-9 h-9 text-xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{voice.name}</p>
                  <p className="text-xs text-muted truncate">@{voice.handle}</p>
                  <span className="inline-block mt-0.5 px-1.5 py-px rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                    {voice.tag}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleFollow(voice.handle)}
                  aria-pressed={isFollowing}
                  aria-label={`${isFollowing ? "Unfollow" : "Follow"} ${voice.name}`}
                  className={`h-8 px-3.5 rounded-full text-xs font-bold transition ${
                    isFollowing
                      ? "bg-primary text-white"
                      : "bg-surface-low border border-line text-on-surface hover:border-muted"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={card} aria-labelledby="trending-heading">
        <div className="flex items-center justify-between">
          <h2 id="trending-heading" className="font-serif text-[17px] font-semibold">
            Trending Topics
          </h2>
          <TrendIcon className="w-4 h-4 text-primary" />
        </div>
        <ul className="mt-2 divide-y divide-line">
          {trending.map((item) => {
            const active = activeTopic === item.topic;
            return (
              <li key={item.tag}>
                <button
                  type="button"
                  onClick={() => onTopic(item.topic)}
                  aria-pressed={active}
                  className={`w-full text-left py-2.5 px-2 -mx-2 rounded-lg flex items-center gap-2 transition ${
                    active ? "bg-primary-soft" : "hover:bg-surface-low"
                  }`}
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-[11px] text-muted">{item.category}</span>
                    <span className="block text-sm font-bold text-on-surface truncate">#{item.tag}</span>
                    <span className="block text-[11px] text-muted">{item.count}</span>
                  </span>
                  <TrendIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="px-1 text-[11px] leading-relaxed text-muted">
        <p className="flex flex-wrap gap-x-3 gap-y-1">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Accessibility</span>
          <span>Circle Journal</span>
          <span>Guidelines</span>
        </p>
        <p className="mt-1.5">© 2026 Circle Media. Slow by design.</p>
      </footer>
    </aside>
  );
};

export default DiscoveryPanel;
