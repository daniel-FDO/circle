import { useEffect, useState } from "react";
import { matchPath, Outlet, useLocation, useNavigate } from "react-router";
import DiscoveryPanel from "../components/home/DiscoveryPanel";
import { MobileHeader, MobileTabBar, Sidebar } from "../components/home/Navigation";
import type { Draft } from "../components/home/Composer";
import type { Reply } from "../components/home/FeedPostCard";
import type { ChatMessage } from "../data/messages";
import { posts as seedPosts, type FeedPost } from "../data/posts";
import { loadBookmarks, saveBookmarks } from "../lib/bookmarks";
import { buildConversations, loadMessages, saveMessages } from "../lib/messages";
import { buildNotifications, loadNotifications, saveNotifications, type Rsvp } from "../lib/notifications";
import type { Curation, Profile } from "../types";
import type { FeedContext } from "./feedContext";

const FEED_ROUTES = ["/home", "/explore", "/bookmarks"];

const toggleIn = (set: Set<string>, value: string) => {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
};

type AppLayoutProps = {
  profile: Profile;
  curation: Curation;
  joinedAt: string | null;
  onProfileChange: (profile: Profile) => void;
  onCurationChange: (curation: Curation) => void;
};

const AppLayout = ({ profile, curation, joinedAt, onProfileChange, onCurationChange }: AppLayoutProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [query, setQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState(loadBookmarks);
  const [reposted, setReposted] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [myPosts, setMyPosts] = useState<FeedPost[]>([]);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [messageStore, setMessageStore] = useState(loadMessages);
  const [notificationStore, setNotificationStore] = useState(loadNotifications);

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  // One bookmark store backs Home, Profile and Bookmarks
  const saved = new Set(Object.keys(bookmarks.savedAt));
  const setSavedAt = (id: string, at: string | null) =>
    setBookmarks((b) => {
      const savedAt = { ...b.savedAt };
      if (at) savedAt[id] = at;
      else delete savedAt[id];
      return { ...b, savedAt };
    });

  useEffect(() => {
    saveMessages(messageStore);
  }, [messageStore]);

  useEffect(() => {
    saveNotifications(notificationStore);
  }, [notificationStore]);

  const notificationList = buildNotifications(notificationStore, curation, joinedAt);
  const markNotificationsRead = (ids: string[]) =>
    setNotificationStore((s) => ({ ...s, read: [...new Set([...s.read, ...ids])] }));

  const conversations = buildConversations(messageStore);
  const messagesMatch = matchPath("/messages/:conversationId?", pathname);
  const openConversation = messagesMatch?.params.conversationId;

  // Opening a conversation (by link, URL or Back) marks it as read
  if (openConversation && conversations.some((c) => c.id === openConversation && c.unread))
    setMessageStore((s) => ({ ...s, read: [...s.read, openConversation] }));
  const unread = {
    notifications: notificationList.filter((n) => n.unread).length,
    messages: conversations.filter((c) => c.unread).length,
  };

  const following = new Set(curation.following);
  const isFeedRoute = FEED_ROUTES.includes(pathname);
  // The profile page brings its own secondary column, so it spans both right columns
  const wide = ["/profile", "/notifications", "/bookmarks"].includes(pathname) || messagesMatch !== null;

  const publish = (draft: Draft) => {
    const post: FeedPost = {
      id: `mine-${Date.now()}`,
      author: profile.displayName || "You",
      handle: profile.handle,
      avatar: profile.avatar,
      role: profile.location ? `${profile.pronouns ? `${profile.pronouns} · ` : ""}${profile.location}` : "Circle member",
      minutesAgo: 0,
      topics: draft.topics,
      body: draft.body,
      media: draft.image
        ? { type: "images", images: [{ src: draft.image.src, alt: draft.image.name }] }
        : draft.code.trim()
          ? { type: "code", filename: "snippet", code: draft.code }
          : undefined,
      likes: 0,
      replies: 0,
      reposts: 0,
      audience: draft.audience,
      mine: true,
    };
    setMyPosts((p) => [post, ...p]);
    setTopicFilter(null);
    setQuery("");
  };

  const filterByTopic = (topic: string) => {
    setTopicFilter((t) => (t === topic ? null : topic));
    if (!isFeedRoute) navigate("/home");
  };

  const toggleFollow = (handle: string) =>
    onCurationChange({ ...curation, following: [...toggleIn(following, handle)] });

  const sendMessage = (conversationId: string, message: Pick<ChatMessage, "text" | "attachment">) => {
    const sent: ChatMessage = {
      id: `me-${Date.now()}`,
      from: "me",
      text: message.text,
      sentAt: new Date().toISOString(),
      attachment: message.attachment,
    };
    setMessageStore((s) => ({ ...s, sent: { ...s.sent, [conversationId]: [...(s.sent[conversationId] ?? []), sent] } }));
  };

  const createPost = () => navigate("/home", { state: { compose: true } });

  const context: FeedContext = {
    profile,
    curation,
    joinedAt,
    onProfileChange,
    onCurationChange,
    posts: [...myPosts, ...seedPosts].filter((p) => !hidden.has(p.id)),
    following,
    toggleFollow,
    liked,
    saved,
    reposted,
    replies,
    toggleLike: (id) => setLiked((s) => toggleIn(s, id)),
    toggleSave: (id) =>
      setBookmarks((b) => {
        const savedAt = { ...b.savedAt };
        if (savedAt[id]) delete savedAt[id];
        else savedAt[id] = new Date().toISOString();
        return { ...b, savedAt };
      }),
    bookmarks,
    restoreBookmark: (id, at) => setSavedAt(id, at),
    createShelf: (name, itemIds) => {
      const id = `shelf-${Date.now()}`;
      setBookmarks((b) => ({ ...b, shelves: [...b.shelves, { id, name, itemIds }] }));
      return id;
    },
    toggleRepost: (id) => setReposted((s) => toggleIn(s, id)),
    hidden,
    hidePost: (id) => setHidden((s) => new Set(s).add(id)),
    addReply: (id, text) =>
      setReplies((r) => ({ ...r, [id]: [...(r[id] ?? []), { id: `${Date.now()}`, text }] })),
    publish,
    query,
    setQuery,
    topicFilter,
    setTopicFilter,
    filterByTopic,
    conversations,
    sendMessage,
    notifications: notificationList,
    notificationStore,
    markNotificationsRead,
    setRsvp: (salonId: string, rsvp: Rsvp) =>
      setNotificationStore((s) => ({ ...s, rsvp: { ...s.rsvp, [salonId]: rsvp } })),
    addNotificationReply: (id: string, text: string) =>
      setNotificationStore((s) => ({
        ...s,
        read: s.read.includes(id) ? s.read : [...s.read, id],
        replies: { ...s.replies, [id]: [...(s.replies[id] ?? []), { id: `${Date.now()}`, text, at: new Date().toISOString() }] },
      })),
    setQuietDigest: (on: boolean) => setNotificationStore((s) => ({ ...s, quietDigest: on })),
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <MobileHeader profile={profile} unread={unread} />

      <div
        className={`max-w-7xl mx-auto px-4 md:px-5 lg:px-6 grid grid-cols-1 md:grid-cols-[76px_minmax(0,1fr)] gap-5 lg:gap-6 ${
          wide
            ? "lg:grid-cols-[minmax(0,20fr)_minmax(0,80fr)]"
            : "lg:grid-cols-[minmax(0,20fr)_minmax(0,53fr)_minmax(0,27fr)]"
        }`}
      >
        <Sidebar profile={profile} unread={unread} onCreatePost={createPost} />

        {/* Messages sizes itself to the viewport; an open thread on mobile hides the tab bar */}
        <main className={`min-w-0 ${messagesMatch ? (openConversation ? "" : "pb-24 md:pb-0") : "pb-24 md:pb-10"}`}>
          <Outlet context={context} />
        </main>

        {!wide && (
          <DiscoveryPanel
            query={query}
            activeTopic={topicFilter}
            following={following}
            onQuery={(value) => {
              setQuery(value);
              if (!isFeedRoute) navigate("/explore");
            }}
            onToggleFollow={toggleFollow}
            onTopic={filterByTopic}
          />
        )}
      </div>

      {!openConversation && <MobileTabBar unread={unread} onCreatePost={createPost} />}
    </div>
  );
};

export default AppLayout;
