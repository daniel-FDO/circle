type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

// Thinner stroke for navigation and action-row icons
const line = { ...base, strokeWidth: 1.75 };

export const CheckIcon = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg {...base} className={className} strokeWidth={3}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);

export const PlusIcon = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const CameraIcon = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

export const ArrowIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const CloseIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const SearchIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg {...base} className={className}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4 4" />
  </svg>
);

export const BookmarkIcon = ({
  className = "w-4 h-4",
  filled = false,
}: IconProps & { filled?: boolean }) => (
  <svg {...line} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M6 4h12v17l-6-4-6 4z" />
  </svg>
);

export const ReplyIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg {...line} className={className}>
    <path d="M4 5h16v11H9l-5 4z" />
  </svg>
);

export const LockIcon = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);

export const HomeIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg {...line} className={className}>
    <path d="M4 10.5L12 4l8 6.5V20h-5.5v-5.5h-5V20H4z" />
  </svg>
);

export const CompassIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg {...line} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M15.5 8.5l-2 5-5 2 2-5z" />
  </svg>
);

export const BellIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg {...line} className={className}>
    <path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z" />
    <path d="M10 20.5a2 2 0 004 0" />
  </svg>
);

export const MailIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg {...line} className={className}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);

export const UserIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg {...line} className={className}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20a7 7 0 0114 0" />
  </svg>
);

export const PenIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M4 20h4L19 9l-4-4L4 16z" />
    <path d="M13.5 6.5l4 4" />
  </svg>
);

export const ImageIcon = ({ className = "w-4.5 h-4.5" }: IconProps) => (
  <svg {...line} className={className}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <circle cx="9" cy="10" r="1.75" />
    <path d="M20 16l-5-5-8.5 8.5" />
  </svg>
);

export const CodeIcon = ({ className = "w-4.5 h-4.5" }: IconProps) => (
  <svg {...line} className={className}>
    <path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5" />
  </svg>
);

export const GlobeIcon = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg {...line} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z" />
  </svg>
);

export const MoreIcon = ({ className = "w-4.5 h-4.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <circle cx="5.5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="18.5" cy="12" r="1.6" />
  </svg>
);

export const HeartIcon = ({
  className = "w-4 h-4",
  filled = false,
}: IconProps & { filled?: boolean }) => (
  <svg {...line} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.3a4.3 4.3 0 017.5 2.5C19.5 15.4 12 20 12 20z" />
  </svg>
);

export const RepeatIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg {...line} className={className}>
    <path d="M17 3.5l3 3-3 3" />
    <path d="M4 11V9.5a3 3 0 013-3h13" />
    <path d="M7 20.5l-3-3 3-3" />
    <path d="M20 13v1.5a3 3 0 01-3 3H4" />
  </svg>
);

export const ShareIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg {...line} className={className}>
    <path d="M12 15V4M8 8l4-4 4 4" />
    <path d="M5 13v6.5h14V13" />
  </svg>
);

export const PlayIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M8 5.5v13l10.5-6.5z" />
  </svg>
);

export const SlidersIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg {...line} className={className}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </svg>
);

export const TrendIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg {...line} className={className}>
    <path d="M3.5 17l6-6 4 4 7-7.5" />
    <path d="M15 7.5h5.5V13" />
  </svg>
);

export const ChevronDownIcon = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const PauseIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <rect x="6.5" y="5" width="4" height="14" rx="1" />
    <rect x="13.5" y="5" width="4" height="14" rx="1" />
  </svg>
);

export const MapPinIcon = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg {...line} className={className}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.25" />
  </svg>
);

export const LinkIcon = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg {...line} className={className}>
    <path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1" />
    <path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1" />
  </svg>
);

export const CalendarIcon = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg {...line} className={className}>
    <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
  </svg>
);

export const SendIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg {...line} className={className}>
    <path d="M20.5 3.5L10 14M20.5 3.5l-6.5 17-4-6.5-6.5-4z" />
  </svg>
);

export const PaperclipIcon = ({ className = "w-4.5 h-4.5" }: IconProps) => (
  <svg {...line} className={className}>
    <path d="M20 11.5l-7.8 7.8a5 5 0 01-7.1-7.1l8.5-8.5a3.3 3.3 0 014.7 4.7l-8.5 8.5a1.7 1.7 0 01-2.4-2.4l7.8-7.8" />
  </svg>
);

export const InfoIcon = ({ className = "w-4.5 h-4.5" }: IconProps) => (
  <svg {...line} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5M12 7.75v.01" />
  </svg>
);

export const ChevronLeftIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const DownloadIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg {...line} className={className}>
    <path d="M12 4v11M7.5 10.5L12 15l4.5-4.5" />
    <path d="M5 19.5h14" />
  </svg>
);

export const MoonIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg {...line} className={className}>
    <path d="M19.5 14.5A7.5 7.5 0 019.5 4.5a7.5 7.5 0 1010 10z" />
  </svg>
);

export const SparkIcon = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg {...line} className={className}>
    <path d="M12 3.5l1.9 5.6 5.6 1.9-5.6 1.9-1.9 5.6-1.9-5.6-5.6-1.9 5.6-1.9z" />
  </svg>
);
