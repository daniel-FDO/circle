import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import Composer from "../components/home/Composer";
import FeedList from "../components/home/FeedList";
import PageHeader from "../components/home/PageHeader";
import { card } from "../components/home/styles";
import { SlidersIcon } from "../components/Icons";
import { featuredTopics } from "../data/topics";
import { useFeed, type ComposeState } from "../layouts/feedContext";

type Tab = "forYou" | "following";
type Order = "curated" | "latest";

const tabs: [Tab, string][] = [
  ["forYou", "For you"],
  ["following", "Following"],
];

const Home = () => {
  const { profile, curation, posts, following, publish } = useFeed();
  const [tab, setTab] = useState<Tab>("forYou");
  const [order, setOrder] = useState<Order>("curated");
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();

  // "Create post" navigates here with { compose: true }; key changes on every click
  useEffect(() => {
    if ((location.state as ComposeState)?.compose) {
      composerRef.current?.focus();
      composerRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [location.key, location.state]);

  let feed;
  if (tab === "following") {
    feed = posts.filter((p) => p.mine || following.has(p.handle));
  } else {
    // For you: only posts from the user's chosen circles, falling back to everything
    const curated = posts.filter((p) => p.mine || p.topics.some((t) => curation.topics.includes(t)));
    feed = curated.some((p) => !p.mine) ? curated : posts;
  }
  if (order === "latest") feed = [...feed].sort((a, b) => a.minutesAgo - b.minutesAgo);

  return (
    <>
      <PageHeader>
        <div className={`${card} flex items-center justify-between gap-2 px-2 h-12`}>
          <h1 className="sr-only">Home</h1>
          <div role="tablist" aria-label="Feed" className="flex items-center gap-1 h-full">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`relative h-full px-3 text-sm transition ${
                  tab === id ? "font-bold text-on-surface" : "font-medium text-muted hover:text-on-surface"
                }`}
              >
                {label}
                {tab === id && <span className="absolute left-3 right-3 bottom-0 h-0.5 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOrder((o) => (o === "curated" ? "latest" : "curated"))}
            aria-label={`Sort: ${order === "curated" ? "curated stream" : "latest first"}. Click to switch.`}
            className="flex items-center gap-2 h-9 px-3 rounded-full text-xs font-semibold text-on-surface-variant bg-surface-low hover:bg-surface-high"
          >
            {order === "curated" ? "Curated stream" : "Latest first"}
            <SlidersIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </PageHeader>

      <div className="space-y-4">
        <Composer
          profile={profile}
          topicOptions={curation.topics.length ? curation.topics : featuredTopics}
          textareaRef={composerRef}
          onPublish={(draft) => {
            publish(draft);
            setTab("forYou");
          }}
        />
        <FeedList
          posts={feed}
          emptyMessage={tab === "following" ? "Follow a few people to fill this tab." : "Nothing here yet."}
        />
      </div>
    </>
  );
};

export default Home;
