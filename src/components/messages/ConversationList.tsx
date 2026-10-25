import type { Ref } from "react";
import { NavLink } from "react-router";
import Avatar from "../Avatar";
import { PenIcon, SearchIcon } from "../Icons";
import type { Conversation } from "../../data/messages";
import { formatListTime, lastMessage, previewOf } from "../../lib/messages";

export type Filter = "all" | "unread" | "requests";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "requests", label: "Requests" },
];

type ConversationListProps = {
  conversations: Conversation[];
  activeId: string | undefined;
  unreadCount: number;
  query: string;
  onQuery: (query: string) => void;
  filter: Filter;
  onFilter: (filter: Filter) => void;
  drafts: Record<string, string>;
  searchRef: Ref<HTMLInputElement>;
  onCompose: () => void;
};

const ConversationList = ({
  conversations,
  activeId,
  unreadCount,
  query,
  onQuery,
  filter,
  onFilter,
  drafts,
  searchRef,
  onCompose,
}: ConversationListProps) => (
  <section aria-labelledby="messages-heading" className="flex-1 flex flex-col min-h-0 bg-surface-low md:border-r md:border-line">
    <div className="px-4 pt-5 pb-3 space-y-3">
      <div className="flex items-center gap-2">
        <h2 id="messages-heading" className="text-lg font-bold">
          Messages
        </h2>
        {unreadCount > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[11px] font-bold leading-5 text-center">
            {unreadCount}
            <span className="sr-only"> unread</span>
          </span>
        )}
        <button
          type="button"
          onClick={onCompose}
          aria-label="Find a conversation"
          title="Find a conversation"
          className="ml-auto w-9 h-9 rounded-lg border border-line bg-white flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/40 transition"
        >
          <PenIcon />
        </button>
      </div>

      <div className="relative">
        <label htmlFor="message-search" className="sr-only">
          Search conversations
        </label>
        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          ref={searchRef}
          id="message-search"
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search dialogues, curators, keywords"
          className="w-full h-10 pl-9 pr-3 rounded-full bg-white border border-line text-[13px] placeholder:text-muted focus:border-primary/50 outline-none"
        />
      </div>

      <div role="group" aria-label="Filter conversations" className="flex gap-1.5">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => onFilter(f.id)}
            className={`h-8 px-3.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              filter === f.id
                ? "bg-primary text-white"
                : "bg-surface-high text-on-surface-variant hover:bg-line hover:text-on-surface"
            }`}
          >
            {f.label}
            {f.id === "unread" && unreadCount > 0 && filter !== f.id && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" aria-hidden />
            )}
          </button>
        ))}
      </div>
    </div>

    {conversations.length === 0 ? (
      <p role="status" className="px-6 py-10 text-center text-sm text-muted">
        {query.trim() ? `No conversations match “${query.trim()}”.` : "Nothing here right now."}
      </p>
    ) : (
      <ul className="flex-1 min-h-0 md:overflow-y-auto px-2 pb-3 space-y-0.5">
        {conversations.map((c) => {
          const last = lastMessage(c);
          const draft = drafts[c.id]?.trim();
          const active = c.id === activeId;
          return (
            <li key={c.id}>
              <NavLink
                to={`/messages/${c.id}`}
                className={`relative flex gap-3 px-3 py-3 rounded-xl transition ${
                  active ? "bg-white shadow-[0_1px_3px_rgba(30,27,25,0.08)]" : "hover:bg-white/60"
                }`}
              >
                {active && <span className="absolute left-0 inset-y-2 w-[3px] rounded-r-full bg-primary" aria-hidden />}
                <Avatar name={c.name} className="w-10 h-10 text-sm" />
                <span className="flex-1 min-w-0">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-bold truncate">{c.name}</span>
                    <time
                      dateTime={last.sentAt}
                      className={`shrink-0 text-[11px] ${c.unread ? "text-primary font-semibold" : "text-muted"}`}
                    >
                      {formatListTime(last.sentAt)}
                    </time>
                  </span>
                  <span
                    className={`block mt-0.5 text-xs truncate ${
                      c.unread ? "text-on-surface font-semibold" : "text-on-surface-variant"
                    }`}
                  >
                    {draft ? <span className="text-primary">Draft: {draft}</span> : previewOf(last)}
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted truncate">{c.request ? "Message request" : c.topic}</span>
                    {c.unread && (
                      <span className="shrink-0 h-[18px] px-2 rounded-full bg-primary text-white text-[10px] font-bold leading-[18px]">
                        New<span className="sr-only"> unread message</span>
                      </span>
                    )}
                  </span>
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);

export default ConversationList;
