import { useRef, useEffect, useCallback } from "react";

const BAR_GRADIENT = [
  "#1a801a", "#1a801a",
  "#33ff33", "#33ff33", "#33ff33",
  "#00ffff", "#00ffff",
  "#ff36ab", "#ff36ab",
  "#ffffff",
];

const PEAK_HOLD_FRAMES = 40;

export default function Visualizer({ analyser, isPlaying, albumId }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const animRef = useRef(null);
  const peaksRef = useRef([]);
  const peakHoldRef = useRef([]);
  const waveHistoryRef = useRef([]);

  const accentColor =
    albumId === "album-2"
      ? "#ff36ab"
      : albumId === "album-3"
        ? "#ff8c00"
        : "#00ffff";

  const glowColor =
    albumId === "album-2"
      ? "rgba(255, 54, 171, 0.6)"
      : albumId === "album-3"
        ? "rgba(255, 140, 0, 0.6)"
        : "rgba(0, 255, 255, 0.6)";

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext("2d");
    }
    const ctx = ctxRef.current;
    const W = canvas.width;
    const H = canvas.height;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    analyser.getByteTimeDomainData(timeArray);

    ctx.clearRect(0, 0, W, H);

    // --- SPECTRUM ANALYZER (left 58%) ---
    const specW = Math.floor(W * 0.58);
    const specH = H - 4;
    const specX = 2;
    const specY = 2;
    const numBars = 24;
    const barSpacing = 2;
    const barW = Math.floor((specW - (numBars - 1) * barSpacing) / numBars);
    const segmentH = 3;
    const maxSegments = Math.floor(specH / (segmentH + 1));

    if (peaksRef.current.length !== numBars) {
      peaksRef.current = new Array(numBars).fill(0);
      peakHoldRef.current = new Array(numBars).fill(0);
    }

    // Grid lines
    ctx.strokeStyle = "rgba(51, 255, 51, 0.05)";
    ctx.lineWidth = 1;
    for (let g = 0; g < maxSegments; g += 4) {
      const gy = specY + specH - g * (segmentH + 1);
      ctx.beginPath();
      ctx.moveTo(specX, gy);
      ctx.lineTo(specX + specW, gy);
      ctx.stroke();
    }

    for (let i = 0; i < numBars; i++) {
      const binIdx = Math.floor(Math.pow(i / numBars, 1.5) * (bufferLength * 0.8));
      const val = dataArray[Math.min(binIdx, bufferLength - 1)] / 255;
      const segments = Math.floor(val * maxSegments);
      const x = specX + i * (barW + barSpacing);

      for (let s = 0; s < segments; s++) {
        const y = specY + specH - (s + 1) * (segmentH + 1);
        const colorIdx = Math.floor((s / maxSegments) * BAR_GRADIENT.length);
        const color = BAR_GRADIENT[Math.min(colorIdx, BAR_GRADIENT.length - 1)];
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barW, segmentH);
        if (s > maxSegments * 0.7) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 6;
          ctx.fillRect(x, y, barW, segmentH);
          ctx.shadowBlur = 0;
        }
      }

      // Peak hold
      if (segments > peaksRef.current[i]) {
        peaksRef.current[i] = segments;
        peakHoldRef.current[i] = PEAK_HOLD_FRAMES;
      } else if (peakHoldRef.current[i] > 0) {
        peakHoldRef.current[i]--;
      } else {
        peaksRef.current[i] = Math.max(0, peaksRef.current[i] - 0.3);
      }

      const peakY = specY + specH - peaksRef.current[i] * (segmentH + 1);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 4;
      ctx.fillRect(x, peakY, barW, 1);
      ctx.shadowBlur = 0;
    }

    // --- WAVEFORM (right 38%) ---
    const waveX = specX + specW + 8;
    const waveW = W - waveX - 4;
    const waveH = Math.floor(H * 0.45);
    const waveY = 4;

    ctx.strokeStyle = "rgba(191, 95, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(waveX, waveY, waveW, waveH);

    ctx.strokeStyle = "rgba(191, 95, 255, 0.1)";
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(waveX, waveY + waveH / 2);
    ctx.lineTo(waveX + waveW, waveY + waveH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ghost waveforms
    const snapshot = new Uint8Array(timeArray);
    waveHistoryRef.current.push(snapshot);
    if (waveHistoryRef.current.length > 3) waveHistoryRef.current.shift();

    const sliceWidth = waveW / bufferLength;
    waveHistoryRef.current.forEach((hist, idx) => {
      if (idx === waveHistoryRef.current.length - 1) return;
      const alpha = 0.08 * (idx + 1);
      ctx.beginPath();
      ctx.strokeStyle = `rgba(191, 95, 255, ${alpha})`;
      ctx.lineWidth = 1;
      let hx = waveX;
      for (let i = 0; i < hist.length; i++) {
        const v = hist[i] / 128.0;
        const y = waveY + (v * waveH) / 2;
        if (i === 0) ctx.moveTo(hx, y);
        else ctx.lineTo(hx, y);
        hx += sliceWidth;
      }
      ctx.stroke();
    });

    // Main waveform
    ctx.beginPath();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8;
    let wx = waveX;
    for (let i = 0; i < bufferLength; i++) {
      const v = timeArray[i] / 128.0;
      const y = waveY + (v * waveH) / 2;
      if (i === 0) ctx.moveTo(wx, y);
      else ctx.lineTo(wx, y);
      wx += sliceWidth;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // --- VU METERS (bottom right) ---
    const vuX = waveX;
    const vuY = waveY + waveH + 8;
    const vuW = waveW;
    const vuH = H - vuY - 4;
    const meterH = Math.floor((vuH - 10) / 2);
    const meterBarW = vuW - 24;

    const half = Math.floor(bufferLength / 2);
    let lSum = 0, rSum = 0;
    for (let i = 0; i < half; i++) lSum += Math.abs(timeArray[i] - 128);
    for (let i = half; i < bufferLength; i++) rSum += Math.abs(timeArray[i] - 128);
    const lLevel = Math.min(1, (lSum / half / 128) * 3);
    const rLevel = Math.min(1, (rSum / half / 128) * 3);

    ctx.fillStyle = "rgba(191, 95, 255, 0.5)";
    ctx.font = "8px 'Departure Mono', monospace";
    ctx.fillText("L", vuX + 2, vuY + meterH / 2 + 3);
    ctx.fillText("R", vuX + 2, vuY + meterH + 10 + meterH / 2 + 3);

    drawVuMeter(ctx, vuX + 16, vuY + 2, meterBarW, meterH - 2, lLevel);
    drawVuMeter(ctx, vuX + 16, vuY + meterH + 8, meterBarW, meterH - 2, rLevel);

    ctx.fillStyle = "rgba(51, 255, 51, 0.25)";
    ctx.font = "7px 'Departure Mono', monospace";
    const dbMarks = ["-40", "-20", "-10", "-3", "0"];
    for (let i = 0; i < dbMarks.length; i++) {
      const mx = vuX + 16 + (i / (dbMarks.length - 1)) * meterBarW;
      ctx.fillText(dbMarks[i], mx - 4, vuY + vuH);
    }

    animRef.current = requestAnimationFrame(draw);
  }, [analyser, glowColor, accentColor]);

  useEffect(() => {
    if (isPlaying && analyser) {
      animRef.current = requestAnimationFrame(draw);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, analyser, draw]);

  return (
    <canvas
      ref={canvasRef}
      width={490}
      height={140}
      className="w-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

function drawVuMeter(ctx, x, y, w, h, level) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(x, y, w, h);

  const numSegs = 20;
  const segW = Math.floor((w - (numSegs - 1)) / numSegs);
  const filledSegs = Math.floor(level * numSegs);

  for (let i = 0; i < numSegs; i++) {
    const sx = x + i * (segW + 1);
    const pct = i / numSegs;
    if (i < filledSegs) {
      if (pct < 0.5) ctx.fillStyle = "#33ff33";
      else if (pct < 0.75) ctx.fillStyle = "#00ffff";
      else if (pct < 0.9) ctx.fillStyle = "#ff8c00";
      else {
        ctx.fillStyle = "#ff36ab";
        ctx.shadowColor = "#ff36ab";
        ctx.shadowBlur = 6;
      }
      ctx.fillRect(sx, y + 1, segW, h - 2);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = "rgba(51, 255, 51, 0.06)";
      ctx.fillRect(sx, y + 1, segW, h - 2);
    }
  }
}
