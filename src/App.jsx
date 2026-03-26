import { useState, useRef, useEffect, useCallback } from "react";
import albums from "./data/tracks";
import Visualizer from "./Visualizer";

// Each album gets its own neon color scheme
const albumColors = {
  "album-1": {
    text: "text-neon-cyan",
    dim: "text-neon-cyan-dim",
    bg: "bg-neon-cyan",
    bgFaint: "bg-neon-cyan/10",
    bgHover: "hover:bg-neon-cyan/5",
    border: "border-neon-cyan",
    glow: "var(--color-neon-cyan-glow)",
    hex: "#00ffff",
  },
  "album-2": {
    text: "text-neon-pink",
    dim: "text-neon-pink-dim",
    bg: "bg-neon-pink",
    bgFaint: "bg-neon-pink/10",
    bgHover: "hover:bg-neon-pink/5",
    border: "border-neon-pink",
    glow: "var(--color-neon-pink-glow)",
    hex: "#ff36ab",
  },
  "album-3": {
    text: "text-neon-orange",
    dim: "text-neon-orange-dim",
    bg: "bg-neon-orange",
    bgFaint: "bg-neon-orange/10",
    bgHover: "hover:bg-neon-orange/5",
    border: "border-neon-orange",
    glow: "var(--color-neon-orange-glow)",
    hex: "#ff8c00",
  },
};

const defaultColors = albumColors["album-1"];

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function ProgressBar({ current, duration, glow }) {
  const barWidth = 24;
  const pct = duration ? (current / duration) * 100 : 0;
  const filled = Math.round((pct / 100) * barWidth);
  const bar = "█".repeat(filled) + "░".repeat(barWidth - filled);
  return (
    <div
      className="text-xs tracking-widest select-none"
      style={{ textShadow: `0 0 6px ${glow}`, opacity: 0.7 }}
    >
      [{bar}]
    </div>
  );
}

export default function App() {
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const analyserRef = useRef(null);
  const [analyser, setAnalyser] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeAlbum, setActiveAlbum] = useState(albums[0]?.id || null);
  const [volume, setVolume] = useState(0.7);
  const [glitch, setGlitch] = useState(false);

  const allTracks = albums.flatMap((a) => a.tracks);
  const trackObj = allTracks.find((t) => t.id === currentTrack);
  const currentAlbum = albums.find((a) =>
    a.tracks.some((t) => t.id === currentTrack)
  );

  // Color scheme based on what's playing, fallback to active album tab
  const playingColors = currentAlbum
    ? albumColors[currentAlbum.id] || defaultColors
    : albumColors[activeAlbum] || defaultColors;

  const triggerGlitch = useCallback(() => {
    setGlitch(true);
    setTimeout(() => setGlitch(false), 150);
  }, []);

  const playTrack = useCallback(
    (trackId) => {
      triggerGlitch();
      setCurrentTrack(trackId);
      setIsPlaying(true);
    },
    [triggerGlitch]
  );

  const togglePlay = useCallback(() => {
    if (!currentTrack) {
      const album = albums.find((a) => a.id === activeAlbum) || albums[0];
      const firstTrack = album?.tracks[0];
      if (firstTrack) {
        playTrack(firstTrack.id);
        return;
      }
    }
    setIsPlaying((p) => !p);
  }, [currentTrack, playTrack]);

  const nextTrack = useCallback(() => {
    if (!currentTrack) return;
    const album = albums.find((a) =>
      a.tracks.some((t) => t.id === currentTrack)
    );
    if (!album) return;
    const idx = album.tracks.findIndex((t) => t.id === currentTrack);
    const next = album.tracks[(idx + 1) % album.tracks.length];
    playTrack(next.id);
  }, [currentTrack, playTrack]);

  const prevTrack = useCallback(() => {
    if (!currentTrack) return;
    const album = albums.find((a) =>
      a.tracks.some((t) => t.id === currentTrack)
    );
    if (!album) return;
    const idx = album.tracks.findIndex((t) => t.id === currentTrack);
    const prev =
      album.tracks[(idx - 1 + album.tracks.length) % album.tracks.length];
    playTrack(prev.id);
  }, [currentTrack, playTrack]);

  // Set up Web Audio API (once)
  const initAudioContext = useCallback(() => {
    if (audioCtxRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const node = ctx.createAnalyser();
    node.fftSize = 256;
    node.smoothingTimeConstant = 0.75;

    const source = ctx.createMediaElementSource(audio);
    source.connect(node);
    node.connect(ctx.destination);

    audioCtxRef.current = ctx;
    sourceRef.current = source;
    analyserRef.current = node;
    setAnalyser(node);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !trackObj) return;
    audio.src = import.meta.env.BASE_URL + trackObj.file.replace(/^\//, '');
    audio.loop = true;
    audio.load();
    if (isPlaying) {
      initAudioContext();
      audio.play().catch(() => {});
    }
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      initAudioContext();
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume();
      }
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  // Media Session API — lock screen controls + background playback
  useEffect(() => {
    if (!("mediaSession" in navigator) || !trackObj) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: trackObj.title,
      artist: "Synthony",
      album: currentAlbum?.name || "",
    });

    navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler("previoustrack", prevTrack);
    navigator.mediaSession.setActionHandler("nexttrack", nextTrack);
  }, [currentTrack, trackObj, currentAlbum, prevTrack, nextTrack]);

  useEffect(() => {
    const handler = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === "ArrowRight") nextTrack();
      if (e.code === "ArrowLeft") prevTrack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay, nextTrack, prevTrack]);

  const visibleAlbum = albums.find((a) => a.id === activeAlbum);
  const tabColors = albumColors[activeAlbum] || defaultColors;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background GIF */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}background.gif)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 1,
        }}
      />

      <audio ref={audioRef} />

      {/* Pager device */}
      <div
        className={`pager-device relative z-10 w-full min-h-screen md:min-h-0 md:w-[520px] md:rounded-sm bg-pager-bg p-2 transition-transform ${
          glitch ? "translate-x-[3px] skew-x-1" : ""
        }`}
        style={{
          boxShadow: `0 0 40px ${playingColors.glow}, inset 0 0 40px rgba(0, 0, 0, 0.8), 0 0 80px ${playingColors.glow}`,
        }}
      >
        {/* Mobile: neon accent lines instead of border */}
        <style>{`
          @media (max-width: 767px) {
            .pager-device { border: none !important; border-radius: 0 !important; }
          }
          @media (min-width: 768px) {
            .pager-device { border: 2px solid ${playingColors.hex} !important; }
          }
        `}</style>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-neon-purple-dim">
          <span className="text-xs text-neon-purple tracking-[0.3em] uppercase"
            style={{ textShadow: "0 0 8px var(--color-neon-purple-glow)" }}
          >
            synthony&apos;s world
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neon-pink animate-blink">●</span>
            <span className="text-[10px] text-neon-cyan animate-blink" style={{ animationDelay: "0.3s" }}>●</span>
            <span className="text-[10px] text-pager-text animate-blink" style={{ animationDelay: "0.6s" }}>●</span>
          </div>
        </div>

        {/* Screen */}
        <div className="scanline relative bg-pager-screen m-1 rounded-sm overflow-hidden">
          {/* Now playing display */}
          <div className="px-4 py-3 border-b border-neon-purple-dim/30 h-[120px] flex flex-col justify-center">
            {trackObj ? (
              <div>
                <div className="text-xs text-neon-purple-dim mb-1 tracking-wider">
                  NOW PLAYING
                </div>
                <div
                  className={`text-lg ${playingColors.text} truncate`}
                  style={{ textShadow: `0 0 8px ${playingColors.glow}, 0 0 16px ${playingColors.glow}` }}
                >
                  {trackObj.title}
                </div>
                <div className={`text-xs ${playingColors.dim} truncate mt-0.5`}>
                  {currentAlbum?.name}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs ${playingColors.dim}`}>
                    {formatTime(currentTime)}
                  </span>
                  <ProgressBar
                    current={currentTime}
                    duration={duration}
                    glow={playingColors.glow}
                  />
                  <span className={`text-xs ${playingColors.dim}`}>
                    {formatTime(duration)}
                  </span>
                </div>
                <div className="text-xs text-neon-pink-dim mt-1">
                  {isPlaying ? "▶ LOOP" : "■ PAUSED"}
                </div>
              </div>
            ) : (
              <div className="text-base text-neon-purple-dim">
                <span
                  className="animate-pulse-glow text-neon-purple"
                  style={{ textShadow: "0 0 8px var(--color-neon-purple-glow)" }}
                >
                  SELECT A TRACK
                </span>
              </div>
            )}
          </div>

          {/* Visualizer */}
          <div className="px-2 py-2 border-b border-neon-purple-dim/30">
            <Visualizer
              analyser={analyser}
              isPlaying={isPlaying}
              albumId={currentAlbum?.id || activeAlbum}
            />
          </div>

          {/* Album tabs */}
          <div className="flex border-b border-neon-purple-dim/30">
            {albums.map((album) => {
              const ac = albumColors[album.id] || defaultColors;
              const isActive = activeAlbum === album.id;
              return (
                <button
                  key={album.id}
                  onClick={() => setActiveAlbum(album.id)}
                  className={`flex-1 px-3 py-2 text-xs tracking-wider border-none cursor-pointer transition-colors ${
                    isActive
                      ? `${ac.bg} text-pager-bg`
                      : `bg-transparent ${ac.dim} hover:${ac.text}`
                  }`}
                  style={
                    isActive
                      ? { boxShadow: `0 0 12px ${ac.glow}` }
                      : undefined
                  }
                >
                  {album.name}
                </button>
              );
            })}
          </div>

          {/* Track list */}
          <div className="h-[280px] md:h-[280px] overflow-y-auto">
            {visibleAlbum?.tracks.map((track, i) => {
              const isActive = currentTrack === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => isActive && isPlaying ? setIsPlaying(false) : playTrack(track.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 border-none cursor-pointer text-left transition-colors ${
                    isActive
                      ? `${tabColors.bgFaint} ${tabColors.text}`
                      : `bg-transparent ${tabColors.dim} ${tabColors.bgHover} hover:${tabColors.text}`
                  }`}
                  style={
                    isActive
                      ? { textShadow: `0 0 8px ${tabColors.glow}` }
                      : undefined
                  }
                >
                  <span className="text-xs w-5 text-right">
                    {isActive && isPlaying
                      ? "▶"
                      : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm truncate">{track.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Neon divider (mobile: replaces the outer border glow) */}
        <div
          className="md:hidden h-[1px] mx-2 my-1"
          style={{
            background: `linear-gradient(to right, transparent, ${playingColors.hex}, transparent)`,
            boxShadow: `0 0 6px ${playingColors.glow}`,
          }}
        />

        {/* Transport controls */}
        <div className="flex items-center justify-center gap-6 px-4 py-3">
          <button
            onClick={prevTrack}
            className="text-neon-cyan-dim hover:text-neon-cyan text-base border-none bg-transparent cursor-pointer transition-colors"
            style={{ textShadow: "0 0 6px var(--color-neon-cyan-glow)" }}
          >
            ◀◀
          </button>
          <button
            onClick={togglePlay}
            className="text-neon-pink hover:text-neon-pink text-2xl border-none bg-transparent cursor-pointer transition-colors"
            style={{ textShadow: "0 0 12px var(--color-neon-pink-glow), 0 0 24px var(--color-neon-pink-glow)" }}
          >
            {isPlaying ? "■" : "▶"}
          </button>
          <button
            onClick={nextTrack}
            className="text-neon-cyan-dim hover:text-neon-cyan text-base border-none bg-transparent cursor-pointer transition-colors"
            style={{ textShadow: "0 0 6px var(--color-neon-cyan-glow)" }}
          >
            ▶▶
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 px-4 pb-2">
          <span className="text-xs text-neon-orange-dim">VOL</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 appearance-none bg-neon-orange-dim rounded-none accent-[var(--color-neon-orange)] cursor-pointer"
          />
        </div>

        {/* Footer */}
        <div className="text-center py-1.5 border-t border-neon-purple-dim/30">
          <span className="text-[9px] text-neon-purple-dim tracking-[0.5em]">
            STRUDEL LOOPS
          </span>
        </div>
      </div>
    </div>
  );
}
