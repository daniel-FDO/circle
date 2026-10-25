import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import FeedPostCard from "../components/home/FeedPostCard";
import FallbackImage from "../components/FallbackImage";
import { EntryCard } from "../components/profile/EntryCards";
import ProfileHeader, { type ProfileTab } from "../components/profile/ProfileHeader";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import { sampleEntries, sampleGalleries, sampleShelf, type ProfileEntry } from "../data/profileSamples";
import type { FeedPost } from "../data/posts";
import { useFeed } from "../layouts/feedContext";

const PAGE_SIZE = 3;
const TAB_IDS = ["posts", "visual", "galleries", "reading", "collections"] as const;
type TabId = (typeof TAB_IDS)[number];

type Item = { type: "mine"; post: FeedPost } | { type: "sample"; entry: ProfileEntry };

const tagsOf = (item: Item) =>
  item.type === "sample" ? item.entry.tags : item.post.topics.map((t) => t.replace(/[^A-Za-z0-9]/g, ""));

const card = "bg-white border border-line rounded-xl shadow-[0_1px_2px_rgba(30,27,25,0.04)]";

const Empty = ({ children }: { children: string }) => (
  <p className={`${card} p-8 text-center text-sm text-muted`}>{children}</p>
);

// Post-style tabs: topic filter row, entries, and "load more" paging
const EntryList = ({ items, empty }: { items: Item[]; empty: string }) => {
  const feed = useFeed();
  const [tag, setTag] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE_SIZE);

  const tags = [...new Set(items.flatMap(tagsOf))];
  const filtered = tag ? items.filter((i) => tagsOf(i).includes(tag)) : items;
  const visible = filtered.slice(0, shown);
  const chip = (active: boolean) =>
    `shrink-0 h-8 px-3 rounded-full text-xs font-semibold border transition ${
      active ? "bg-primary text-white border-primary" : "bg-white border-line text-on-surface-variant hover:border-muted"
    }`;

  return (
    <div className="space-y-4 min-w-0">
      {tags.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Filter by topic">
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-muted">Filter by</span>
          <button
            type="button"
            aria-pressed={!tag}
            onClick={() => {
              setTag(null);
              setShown(PAGE_SIZE);
            }}
            className={chip(!tag)}
          >
            All threads
          </button>
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tag === t}
              onClick={() => {
                setTag(tag === t ? null : t);
                setShown(PAGE_SIZE);
              }}
              className={chip(tag === t)}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {items.some((i) => i.type === "sample") && (
        <p className="text-xs text-muted">
          Entries marked <span className="font-bold">Sample</span> are demonstration content. Posts you publish
          appear here first.
        </p>
      )}

      {visible.length === 0 ? (
        <Empty>{tag ? "Nothing with this topic yet." : empty}</Empty>
      ) : (
        visible.map((item) =>
          item.type === "mine" ? (
            <FeedPostCard
              key={item.post.id}
              post={item.post}
              profile={feed.profile}
              liked={feed.liked.has(item.post.id)}
              saved={feed.saved.has(item.post.id)}
              reposted={feed.reposted.has(item.post.id)}
              replies={feed.replies[item.post.id] ?? []}
              onLike={() => feed.toggleLike(item.post.id)}
              onSave={() => feed.toggleSave(item.post.id)}
              onRepost={() => feed.toggleRepost(item.post.id)}
              onHide={() => feed.hidePost(item.post.id)}
              onReply={(text) => feed.addReply(item.post.id, text)}
              onTopic={(t) => setTag(t.replace(/[^A-Za-z0-9]/g, ""))}
            />
          ) : (
            <EntryCard
              key={item.entry.id}
              entry={item.entry}
              profile={feed.profile}
              liked={feed.liked.has(item.entry.id)}
              onLike={() => feed.toggleLike(item.entry.id)}
            />
          ),
        )
      )}

      {filtered.length > shown && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE_SIZE)}
            className="h-10 px-5 rounded-full border border-line bg-white text-sm font-semibold text-on-surface-variant hover:border-muted hover:text-on-surface"
          >
            Load earlier entries ({filtered.length - shown} more)
          </button>
        </div>
      )}
    </div>
  );
};

const Profile = () => {
  const feed = useFeed();
  const [params] = useSearchParams();
  const requested = params.get("tab");
  const tab: TabId = TAB_IDS.includes(requested as TabId) ? (requested as TabId) : "posts";

  const mine: Item[] = feed.posts.filter((p) => p.mine).map((post) => ({ type: "mine", post }));
  const samples: Item[] = sampleEntries.map((entry) => ({ type: "sample", entry }));
  const postItems = [...mine, ...samples];
  const visualItems = postItems.filter((i) =>
    i.type === "mine" ? i.post.media?.type === "images" : i.entry.kind === "visual",
  );
  const essayItems = samples.filter((i) => i.type === "sample" && i.entry.kind === "article");

  const tabs: ProfileTab[] = [
    { id: "posts", label: "Articles & Posts", count: postItems.length },
    { id: "visual", label: "Visual Stories", count: visualItems.length },
    { id: "galleries", label: "Curated Galleries", count: sampleGalleries.length },
    { id: "reading", label: "Reading Log", count: sampleShelf.length },
    { id: "collections", label: "Collections & Essays", count: essayItems.length },
  ];

  let content;
  if (tab === "posts") {
    content = <EntryList key="posts" items={postItems} empty="No posts yet." />;
  } else if (tab === "visual") {
    content = <EntryList key="visual" items={visualItems} empty="No visual stories yet. Attach an image when you publish." />;
  } else if (tab === "collections") {
    content = <EntryList key="collections" items={essayItems} empty="No essays yet." />;
  } else if (tab === "galleries") {
    content = (
      <div className="space-y-4">
        <p className="text-xs text-muted">Sample galleries showing how curated sets appear on your profile.</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sampleGalleries.map((g) => (
            <li key={g.id} className={`${card} overflow-hidden`}>
              <div className="grid grid-cols-3 gap-1 h-36">
                {g.images.slice(0, 3).map((img, i) => (
                  <FallbackImage
                    key={img.src + i}
                    image={img}
                    className={`w-full h-full ${g.images.length === 2 && i === 0 ? "col-span-2" : ""}`}
                  />
                ))}
              </div>
              <div className="p-4">
                <p className="font-serif text-lg font-semibold">{g.title}</p>
                <p className="text-sm text-on-surface-variant">{g.description}</p>
                <p className="mt-1 text-xs text-muted">{g.images.length} images · Sample</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  } else {
    content = (
      <div className="space-y-4">
        <p className="text-xs text-muted">Sample reading log.</p>
        <ul className={`${card} divide-y divide-line`}>
          {sampleShelf.map((b) => (
            <li key={b.title} className="flex items-center gap-3 p-4">
              <span className="w-9 h-12 shrink-0 rounded-sm bg-gradient-to-b from-surface-high to-line border border-line shadow-[inset_3px_0_0_rgba(99,14,212,0.35)]" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{b.title}</p>
                <p className="text-xs text-muted">
                  {b.author} · {b.tag}
                </p>
              </div>
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-surface-high text-[11px] font-semibold text-on-surface-variant">
                {b.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="pt-3 md:pt-5 space-y-5">
      <ProfileHeader
        profile={feed.profile}
        curation={feed.curation}
        joinedAt={feed.joinedAt}
        postCount={mine.length}
        tabs={tabs}
        activeTab={tab}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-5 items-start">
        <section aria-label={tabs.find((t) => t.id === tab)?.label} className="min-w-0">
          {content}
        </section>
        <ProfileSidebar following={feed.following} onToggleFollow={feed.toggleFollow} />
      </div>

      <p className="text-center text-xs text-muted pb-2">
        Looking for your feed? <Link to="/home" className="font-semibold text-primary hover:underline">Back to Home</Link>
      </p>
    </div>
  );
};

export default Profile;
