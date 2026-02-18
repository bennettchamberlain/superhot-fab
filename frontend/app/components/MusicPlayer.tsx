'use client';

import { useEffect, useRef, useState } from 'react';

export interface MusicTrack {
  _key: string;
  title?: string | null;
  url: string;
}

interface MusicPlayerProps {
  tracks: MusicTrack[];
}

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CROSSFADE_SECS = 3;
const CROSSFADE_STEPS = 50;
const STEP_MS = (CROSSFADE_SECS * 1000) / CROSSFADE_STEPS;

export default function MusicPlayer({ tracks }: MusicPlayerProps) {
  const [muted, setMuted] = useState(true);
  const mutedRef = useRef(true);

  // All audio state in refs to avoid stale closures in callbacks
  const audioA = useRef<HTMLAudioElement | null>(null);
  const audioB = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef<'A' | 'B'>('A');
  const queueRef = useRef<MusicTrack[]>([]);
  const queueIdxRef = useRef(0);
  const isFadingRef = useRef(false);
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // One-time setup: create audio elements, shuffle queue, begin muted playback
  useEffect(() => {
    const validTracks = tracks.filter((t) => Boolean(t.url));
    if (!validTracks.length) return;

    const a = new Audio();
    const b = new Audio();
    a.preload = 'metadata';
    b.preload = 'metadata';
    a.muted = true;
    b.muted = true;
    audioA.current = a;
    audioB.current = b;

    queueRef.current = shuffleArr(validTracks);
    queueIdxRef.current = 0;
    a.src = queueRef.current[0].url;
    a.play().catch(() => {
      // Autoplay blocked — will start when user clicks unmute
    });

    const crossfade = () => {
      if (isFadingRef.current) return;

      const outgoing = activeRef.current === 'A' ? audioA.current : audioB.current;
      const incoming = activeRef.current === 'A' ? audioB.current : audioA.current;
      if (!outgoing || !incoming) return;

      // Advance to next shuffled track
      queueIdxRef.current = (queueIdxRef.current + 1) % queueRef.current.length;
      incoming.src = queueRef.current[queueIdxRef.current].url;
      incoming.volume = 0;
      incoming.muted = mutedRef.current;
      incoming.play().catch(() => {});

      isFadingRef.current = true;
      let step = 0;
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);

      fadeTimerRef.current = setInterval(() => {
        step++;
        const t = step / CROSSFADE_STEPS;
        outgoing.volume = Math.max(0, 1 - t);
        incoming.volume = Math.min(1, t);

        if (step >= CROSSFADE_STEPS) {
          clearInterval(fadeTimerRef.current!);
          fadeTimerRef.current = null;
          outgoing.pause();
          outgoing.volume = 1;
          activeRef.current = activeRef.current === 'A' ? 'B' : 'A';
          isFadingRef.current = false;
        }
      }, STEP_MS);
    };

    const onTimeUpdate = (e: Event) => {
      const audio = e.target as HTMLAudioElement;
      if (
        !isFadingRef.current &&
        audio.duration > 0 &&
        audio.currentTime >= audio.duration - CROSSFADE_SECS
      ) {
        crossfade();
      }
    };

    a.addEventListener('timeupdate', onTimeUpdate);
    b.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      a.removeEventListener('timeupdate', onTimeUpdate);
      b.removeEventListener('timeupdate', onTimeUpdate);
      a.pause();
      b.pause();
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = () => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    // If audio was blocked on load, try playing now on user gesture
    if (!next) {
      const cur = activeRef.current === 'A' ? audioA.current : audioB.current;
      cur?.play().catch(() => {});
    }
    if (audioA.current) audioA.current.muted = next;
    if (audioB.current) audioB.current.muted = next;
  };

  const hasTracks = tracks.filter((t) => t.url).length > 0;

  return (
    <>
      <style>{`
        @keyframes eq-bar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.15); }
        }
        @keyframes music-ripple {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes music-ripple-delay {
          0%   { transform: scale(1);   opacity: 0.3; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        .eq-bar { animation: eq-bar 1s ease-in-out infinite; transform-origin: bottom; }
        .music-ripple-1 { animation: music-ripple 2s ease-out infinite; }
        .music-ripple-2 { animation: music-ripple-delay 2s ease-out infinite 0.7s; }
      `}</style>

      <button
        onClick={hasTracks ? toggleMute : undefined}
        aria-label={!hasTracks ? 'No tracks in playlist' : muted ? 'Unmute music' : 'Mute music'}
        className={`
          fixed bottom-5 right-5 z-50
          w-11 h-11 rounded-sm
          flex items-center justify-center
          transition-all duration-500
          ${!hasTracks
            ? 'bg-black/40 border border-white/8 opacity-40 cursor-not-allowed'
            : muted
            ? 'bg-black/60 border border-white/15 hover:border-white/30 hover:bg-black/70 cursor-pointer'
            : 'bg-black/80 border border-[#FFB81C]/50 shadow-[0_0_18px_rgba(255,184,28,0.25)] hover:shadow-[0_0_28px_rgba(255,184,28,0.4)] cursor-pointer'
          }
        `}
      >
        {/* Ripple rings when unmuted */}
        {!muted && (
          <>
            <span
              className="absolute inset-0 rounded-sm border border-[#FFB81C]/30 music-ripple-1"
              style={{ pointerEvents: 'none' }}
            />
            <span
              className="absolute inset-0 rounded-sm border border-[#FFB81C]/20 music-ripple-2"
              style={{ pointerEvents: 'none' }}
            />
          </>
        )}

        {/* Icon: equalizer bars when playing, crossed speaker when muted */}
        {muted ? (
          <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon
              points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
              fill="rgba(255,255,255,0.1)"
            />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          /* Animated equalizer bars */
          <div className="flex items-end gap-[3px]" style={{ height: 14 }}>
            {[4, 9, 14, 10, 5].map((h, i) => (
              <div
                key={i}
                className="eq-bar rounded-sm"
                style={{
                  width: 2.5,
                  height: h,
                  background: '#FFB81C',
                  animationDelay: `${i * 0.14}s`,
                }}
              />
            ))}
          </div>
        )}
      </button>
    </>
  );
}
