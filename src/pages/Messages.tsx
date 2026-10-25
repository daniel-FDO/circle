import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import Avatar from "../components/Avatar";
import { MailIcon } from "../components/Icons";
import ConversationList, { type Filter } from "../components/messages/ConversationList";
import Thread from "../components/messages/Thread";
import { useFeed, type MessageDraftState } from "../layouts/feedContext";

const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
const kbd = "inline-flex items-center h-5 min-w-5 px-1.5 rounded border border-line bg-white text-[10px] font-semibold text-on-surface-variant";

const Placeholder = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="hidden md:flex flex-col items-center justify-center gap-3 h-full bg-white px-8 text-center">
    <span className="w-12 h-12 rounded-full bg-primary-soft text-primary flex items-center justify-center">
      <MailIcon />
    </span>
    <h2 className="text-base font-bold">{title}</h2>
    <div className="text-sm text-muted max-w-xs">{children}</div>
  </div>
);

// The selected conversation lives in the URL (/messages/:conversationId); everything else here is local UI state
const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { conversations, sendMessage, profile } = useFeed();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  // A prefilled draft (e.g. "Send welcome note") lands in the composer; it's never sent automatically
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const draft = (location.state as MessageDraftState)?.draft;
    return draft && conversationId ? { [conversationId]: draft } : {};
  });
  const searchRef = useRef<HTMLInputElement>(null);

  // Drop the prefill from history so a refresh doesn't restore it over the user's edits
  useEffect(() => {
    if ((location.state as MessageDraftState)?.draft) navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  const active = conversations.find((c) => c.id === conversationId);
  const unreadCount = conversations.filter((c) => c.unread).length;
  const q = query.trim().toLowerCase();
  const visible = conversations.filter((c) => {
    // Opening an unread thread marks it read; keep it listed under "Unread" while it's open
    if (filter === "unread" && !c.unread && c.id !== conversationId) return false;
    if (filter === "requests" && !c.request) return false;
    return !q || [c.name, c.handle, c.topic, ...c.messages.map((m) => m.text)].some((s) => s.toLowerCase().includes(q));
  });

  // Shortcuts advertised in the footer: Ctrl/⌘+K focuses search, Alt+↑/↓ moves between listed threads
  const order = visible.map((c) => c.id).join(" ");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      } else if (e.altKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        const ids = order ? order.split(" ") : [];
        if (!ids.length) return;
        e.preventDefault();
        const i = conversationId ? ids.indexOf(conversationId) : -1;
        const next = e.key === "ArrowDown" ? Math.min(i + 1, ids.length - 1) : i < 0 ? ids.length - 1 : Math.max(i - 1, 0);
        if (ids[next] !== conversationId) navigate(`/messages/${ids[next]}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [order, conversationId, navigate]);

  const members = conversations.filter((c) => !c.request).slice(0, 3);

  return (
    <div
      className={`flex flex-col md:h-screen md:pt-5 md:pb-3 ${
        // Mobile thread fills the space under the 56px header and its 1px border
        conversationId ? "h-[calc(100dvh-3.5rem-1px)] -mx-4 md:mx-0" : "pt-3"
      }`}
    >
      <header className={`${conversationId ? "hidden md:flex" : "flex"} items-center gap-2.5 pb-3 md:pb-4 min-w-0`}>
        <span className="w-2 h-2 rounded-full bg-primary/50 shrink-0" aria-hidden />
        <h1 className="text-[15px] md:text-base font-bold truncate">Studio Directives &amp; Salon Notes</h1>
        <span className="shrink-0 h-5 px-2 rounded-md bg-surface-high text-[10px] font-bold text-on-surface-variant leading-5">
          Demo
        </span>
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <p className="hidden xl:block text-[11px] text-muted">Sample conversations, saved on this device</p>
          <div role="img" aria-label={`Members: ${members.map((m) => m.name).join(", ")}`} className="flex -space-x-1.5">
            {members.map((m) => (
              <span key={m.id} className="rounded-full ring-2 ring-surface">
                <Avatar name={m.name} className="w-6 h-6 text-[9px]" />
              </span>
            ))}
          </div>
        </div>
      </header>

      <div
        className={`flex-1 min-h-0 grid grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(240px,1fr)_minmax(0,2fr)] bg-white border-line overflow-hidden md:border md:rounded-2xl md:shadow-[0_2px_12px_rgba(30,27,25,0.05)] ${
          conversationId ? "border-y" : "border rounded-2xl"
        }`}
      >
        <div className={`${conversationId ? "hidden md:flex" : "flex"} flex-col min-h-0`}>
          <ConversationList
            conversations={visible}
            activeId={conversationId}
            unreadCount={unreadCount}
            query={query}
            onQuery={setQuery}
            filter={filter}
            onFilter={setFilter}
            drafts={drafts}
            searchRef={searchRef}
            onCompose={() => searchRef.current?.focus()}
          />
        </div>

        <div className={`${conversationId ? "block" : "hidden md:block"} min-h-0 min-w-0`}>
          {active ? (
            <Thread
              key={active.id}
              conversation={active}
              profile={profile}
              draft={drafts[active.id] ?? ""}
              onDraftChange={(draft) => setDrafts((d) => ({ ...d, [active.id]: draft }))}
              onSend={(message) => sendMessage(active.id, message)}
            />
          ) : conversationId ? (
            <div className="flex flex-col items-center justify-center gap-3 h-full bg-white px-8 text-center">
              <h2 className="text-base font-bold">Conversation not found</h2>
              <p className="text-sm text-muted">This link doesn't match any of your conversations.</p>
              <Link to="/messages" className="h-10 px-4 rounded-full bg-primary text-white text-sm font-bold flex items-center">
                Back to messages
              </Link>
            </div>
          ) : (
            <Placeholder title="Select a conversation">Choose a thread from the list to read it and reply.</Placeholder>
          )}
        </div>
      </div>

      <footer className="hidden md:flex items-center justify-between gap-4 pt-3 px-1 text-[11px] text-muted">
        <div className="flex items-center gap-4 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Keyboard shortcuts</span>
          <span className="flex items-center gap-1">
            <kbd className={kbd}>{isMac ? "⌘" : "Ctrl"}</kbd>
            <kbd className={kbd}>K</kbd>
            <span className="ml-0.5">Search</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className={kbd}>{isMac ? "⌥" : "Alt"}</kbd>
            <kbd className={kbd}>↑↓</kbd>
            <span className="ml-0.5">Switch conversation</span>
          </span>
        </div>
        <p className="hidden lg:block truncate">Circle Curatorial Dialogue — Made for focused, distraction-free creation</p>
      </footer>
    </div>
  );
};

export default Messages;
