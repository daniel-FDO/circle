import { useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "../Icons";

// Fixed bar heights so the waveform looks the same on every render
const bars = [5, 9, 14, 8, 16, 11, 19, 13, 9, 15, 21, 17, 12, 7, 14, 19, 22, 15, 10, 6, 12, 18, 13, 8, 5, 11, 16, 12, 7, 4, 9, 14, 18, 12, 8, 5, 10, 15, 9, 6];

const fmt = (s: number) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

type AudioPlayerProps = {
  title: string;
  meta: string;
  sources: { src: string; type: string }[];
};

const AudioPlayer = ({ title, meta, sources }: AudioPlayerProps) => {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  const progress = duration ? time / duration : 0;

  const toggle = async () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      try {
        await el.play();
      } catch {
        setError(true);
      }
    } else {
      el.pause();
    }
  };

  return (
    <div className="mt-3 flex items-center gap-3 rounded-lg border border-line bg-surface-low p-3">
      <audio
        ref={audio}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onError={() => setError(true)}
      >
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </audio>
      <button
        type="button"
        onClick={toggle}
        disabled={error}
        aria-label={`${playing ? "Pause" : "Play"} ${title}`}
        className="w-11 h-11 shrink-0 rounded-full bg-primary text-white flex items-center justify-center hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {playing ? <PauseIcon /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-semibold truncate">{title}</p>
          <span className="text-xs text-muted shrink-0 tabular-nums">
            {fmt(time)} / {fmt(duration)}
          </span>
        </div>
        {/* Range input sits over the waveform so seeking works by mouse, touch and keyboard */}
        <div className="relative mt-1.5 h-6 rounded focus-within:outline-2 focus-within:outline-primary focus-within:outline-offset-2">
          <div className="absolute inset-0 flex items-center gap-[3px]" aria-hidden>
            {bars.map((h, i) => (
              <span
                key={i}
                className={`flex-1 rounded-full ${i / bars.length < progress ? "bg-primary" : "bg-primary/30"}`}
                style={{ height: `${h + 2}px` }}
              />
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            disabled={!duration}
            onChange={(e) => {
              const t = Number(e.target.value);
              if (audio.current) audio.current.currentTime = t;
              setTime(t);
            }}
            aria-label={`Seek ${title}`}
            aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
          />
        </div>
        <p className="mt-1 text-[11px] text-muted">{error ? "This recording couldn't be played." : meta}</p>
      </div>
    </div>
  );
};

export default AudioPlayer;
