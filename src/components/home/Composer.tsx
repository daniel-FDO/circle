import { useRef, useState, type ChangeEvent, type Ref } from "react";
import Avatar from "../Avatar";
import { ChevronDownIcon, CloseIcon, CodeIcon, GlobeIcon, ImageIcon, PlusIcon } from "../Icons";
import type { Profile } from "../../types";

const MAX_POST_LENGTH = 500;
const MAX_TOPICS = 3;

const audiences = [
  "Anyone can reply",
  "People you follow",
  "Only people you mention",
];

export type Draft = {
  body: string;
  topics: string[];
  image: { src: string; name: string } | null;
  code: string;
  audience: string;
};

type ComposerProps = {
  profile: Profile;
  topicOptions: string[];
  textareaRef: Ref<HTMLTextAreaElement>;
  onPublish: (draft: Draft) => void;
};

const iconButton =
  "w-9 h-9 rounded-full flex items-center justify-center transition disabled:opacity-35 disabled:cursor-not-allowed";

const Composer = ({ profile, topicOptions, textareaRef, onPublish }: ComposerProps) => {
  const [body, setBody] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [image, setImage] = useState<Draft["image"]>(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState("");
  const [audience, setAudience] = useState(audiences[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const remaining = MAX_POST_LENGTH - body.length;
  const canPublish = body.trim().length > 0 && remaining >= 0;
  const available = topicOptions.filter((t) => !topics.includes(t));

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage({ src: URL.createObjectURL(file), name: file.name });
      setCodeOpen(false);
      setCode("");
    }
    e.target.value = "";
  };

  const publish = () => {
    if (!canPublish) return;
    onPublish({ body: body.trim(), topics, image, code: codeOpen ? code : "", audience });
    setBody("");
    setTopics([]);
    setImage(null);
    setCode("");
    setCodeOpen(false);
    setPickerOpen(false);
  };

  // Ring fills as the post approaches the character limit
  const ratio = Math.min(body.length / MAX_POST_LENGTH, 1);
  const circumference = 2 * Math.PI * 8;

  return (
    <section
      aria-label="Create a post"
      className="bg-white border border-line rounded-xl p-4 shadow-[0_1px_2px_rgba(30,27,25,0.04)]"
    >
      <div className="flex gap-3">
        <Avatar name={profile.displayName} src={profile.avatar} className="w-10 h-10 text-sm" />
        <div className="flex-1 min-w-0">
          <label htmlFor="composer" className="sr-only">
            What are you working on?
          </label>
          <textarea
            id="composer"
            ref={textareaRef}
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) publish();
            }}
            placeholder="What are you working on?"
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-on-surface placeholder:text-muted outline-none pt-2"
          />

          <div className="mt-1 flex flex-wrap items-center gap-2 relative">
            {topics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-md bg-primary-soft text-primary text-xs font-semibold"
              >
                #{topic.replace(/[^A-Za-z0-9]/g, "")}
                <button
                  type="button"
                  onClick={() => setTopics((t) => t.filter((x) => x !== topic))}
                  aria-label={`Remove topic ${topic}`}
                  className="w-5 h-5 rounded flex items-center justify-center hover:bg-primary/10"
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
            {topics.length < MAX_TOPICS && available.length > 0 && (
              <button
                type="button"
                onClick={() => setPickerOpen((o) => !o)}
                aria-expanded={pickerOpen}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-dashed border-line text-xs font-semibold text-muted hover:text-on-surface hover:border-muted"
              >
                <PlusIcon className="w-3 h-3" /> Add topic
              </button>
            )}
            {pickerOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close topic list"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setPickerOpen(false)}
                />
                <ul className="absolute left-0 top-full mt-1 z-20 w-56 max-h-60 overflow-y-auto bg-white border border-line rounded-lg shadow-lg py-1">
                  {available.map((topic) => (
                    <li key={topic}>
                      <button
                        type="button"
                        onClick={() => {
                          setTopics((t) => [...t, topic]);
                          setPickerOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-surface-low"
                      >
                        {topic}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {image && (
            <div className="mt-3 rounded-lg border border-line overflow-hidden">
              <img src={image.src} alt="Attached image preview" className="w-full max-h-64 object-cover" />
              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-surface-low text-xs">
                <span className="flex items-center gap-1.5 text-on-surface-variant truncate">
                  <ImageIcon className="w-3.5 h-3.5 shrink-0" /> {image.name}
                </span>
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="font-semibold text-muted hover:text-on-surface px-1"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {codeOpen && (
            <div className="mt-3">
              <label htmlFor="composer-code" className="sr-only">
                Code snippet
              </label>
              <textarea
                id="composer-code"
                rows={4}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste a code snippet"
                spellCheck={false}
                className="w-full resize-y rounded-lg bg-surface-low border border-line px-3 py-2 font-mono text-[13px] text-on-surface outline-none focus:border-primary/40"
              />
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-primary">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={codeOpen}
                aria-label="Attach an image"
                title="Attach an image"
                className={`${iconButton} hover:bg-primary-soft`}
              >
                <ImageIcon />
              </button>
              <button
                type="button"
                onClick={() => setCodeOpen((o) => !o)}
                disabled={!!image}
                aria-pressed={codeOpen}
                aria-label="Add a code snippet"
                title="Add a code snippet"
                className={`${iconButton} ${codeOpen ? "bg-primary-soft" : "hover:bg-primary-soft"}`}
              >
                <CodeIcon />
              </button>
              <input ref={fileInput} type="file" accept="image/*" onChange={onFile} className="hidden" />

              <div className="relative ml-1">
                <GlobeIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <label htmlFor="audience" className="sr-only">
                  Who can reply
                </label>
                <select
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="appearance-none h-8 pl-7 pr-7 rounded-full bg-primary-soft/60 text-xs font-semibold text-primary outline-none cursor-pointer"
                >
                  {audiences.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
                <ChevronDownIcon className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`flex items-center gap-1.5 text-xs font-semibold ${remaining < 0 ? "text-red-600" : "text-muted"}`}
                aria-live="polite"
              >
                <svg viewBox="0 0 20 20" className="w-5 h-5 -rotate-90" aria-hidden>
                  <circle cx="10" cy="10" r="8" fill="none" stroke="var(--color-line)" strokeWidth="2.5" />
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    fill="none"
                    stroke={remaining < 0 ? "#dc2626" : "var(--color-primary)"}
                    strokeWidth="2.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - ratio)}
                    strokeLinecap="round"
                  />
                </svg>
                {remaining}
                <span className="sr-only">characters remaining</span>
              </span>
              <button
                type="button"
                onClick={publish}
                disabled={!canPublish}
                className="h-9 px-5 rounded-full bg-primary text-white text-sm font-bold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Composer;
