"use client";

import React, { useRef, useState, useCallback } from "react";
import { playShutter, playCountdownBeep } from "@/utils/sounds";

interface PhotoboothProps {
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

type FrameStyle = "none" | "polaroid" | "vintage" | "neon" | "filmstrip";

const FRAMES: { id: FrameStyle; label: string; emoji: string }[] = [
    { id: "none", label: "None", emoji: "🚫" },
    { id: "polaroid", label: "Retro", emoji: "📷" },
    { id: "vintage", label: "Sepia", emoji: "🎞️" },
    { id: "neon", label: "Cyber", emoji: "💡" },
    { id: "filmstrip", label: "Reel", emoji: "🎬" },
];

export default function Photobooth({ videoRef, canvasRef }: PhotoboothProps) {
    const [photos, setPhotos] = useState<string[]>([]);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [selectedFrame, setSelectedFrame] = useState<FrameStyle>("polaroid");
    const [stripMode, setStripMode] = useState(false);
    const [stripPhotos, setStripPhotos] = useState<string[]>([]);
    const [flash, setFlash] = useState(false);
    const captureCanvasRef = useRef<HTMLCanvasElement>(null);

    const capturePhoto = useCallback(() => {
        const video = videoRef.current;
        if (!video || video.readyState !== 4) return null;

        const canvas = document.createElement("canvas");
        const w = video.videoWidth;
        const h = video.videoHeight;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;

        // Mirror the image
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, w, h);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Draw overlay from detection canvas
        if (canvasRef.current) {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(canvasRef.current, 0, 0, w, h);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        // Apply frame
        applyFrame(ctx, w, h, selectedFrame);

        return canvas.toDataURL("image/png");
    }, [videoRef, canvasRef, selectedFrame]);

    const startCountdown = useCallback(
        (onFinish: () => void) => {
            setCountdown(5);
            playCountdownBeep();

            let count = 5;
            const timer = setInterval(() => {
                count--;
                if (count > 0) {
                    setCountdown(count);
                    playCountdownBeep();
                } else {
                    clearInterval(timer);
                    setCountdown(null);
                    playCountdownBeep(true);
                    setFlash(true);
                    setTimeout(() => setFlash(false), 200);
                    playShutter();
                    onFinish();
                }
            }, 1000);
        },
        []
    );

    const handleSingleShot = () => {
        startCountdown(() => {
            const photo = capturePhoto();
            if (photo) setPhotos((prev) => [photo, ...prev]);
        });
    };

    const handleStripShot = () => {
        setStripMode(true);
        setStripPhotos([]);

        // Use a local array to collect shots (avoids React state batching issues)
        const collectedShots: string[] = [];

        function takeNext() {
            startCountdown(() => {
                const photo = capturePhoto();
                if (photo) {
                    collectedShots.push(photo);
                    setStripPhotos([...collectedShots]); // update UI progress

                    if (collectedShots.length < 4) {
                        // 6 second delay so people can pose
                        setTimeout(takeNext, 6000);
                    } else {
                        // All 4 shots taken — combine into one strip
                        setTimeout(() => {
                            combineStrip(collectedShots);
                            setStripMode(false);
                            setStripPhotos([]);
                        }, 500);
                    }
                }
            });
        }
        takeNext();
    };

    const combineStrip = (shots: string[]) => {
        const canvas = document.createElement("canvas");
        const imgW = 320;
        const imgH = 240;
        const padding = 10;
        canvas.width = imgW + padding * 2;
        canvas.height = (imgH + padding) * 4 + padding;
        const ctx = canvas.getContext("2d")!;

        // Background
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Title
        ctx.fillStyle = "#00ff88";
        ctx.font = "bold 14px monospace";

        let loaded = 0;
        shots.forEach((src, i) => {
            const img = new Image();
            img.onload = () => {
                const y = padding + i * (imgH + padding);
                // White border
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(padding - 3, y - 3, imgW + 6, imgH + 6);
                ctx.drawImage(img, padding, y, imgW, imgH);
                loaded++;
                if (loaded === shots.length) {
                    setPhotos((prev) => [canvas.toDataURL("image/png"), ...prev]);
                }
            };
            img.src = src;
        });
    };

    const downloadPhoto = (dataUrl: string, index: number) => {
        const link = document.createElement("a");
        link.download = `ai-vision-photo-${index + 1}.png`;
        link.href = dataUrl;
        link.click();
    };

    const clearGallery = () => setPhotos([]);

    return (
        <div className="w-full space-y-4">
            {/* Flash overlay */}
            {flash && (
                <div className="fixed inset-0 bg-white/90 z-50 pointer-events-none animate-[flash_0.3s_ease-out]" />
            )}

            {/* Countdown overlay */}
            {countdown !== null && (
                <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none bg-black/20 backdrop-blur-sm">
                    <span className="text-[12rem] font-black font-mono text-white drop-shadow-[0_0_50px_rgba(0,255,136,1)] animate-ping">
                        {countdown}
                    </span>
                </div>
            )}

            {/* Frame selection */}
            <div>
                <p className="text-zinc-500 text-[10px] font-mono uppercase mb-2 tracking-widest font-bold">Aesthetic Filter</p>
                <div className="flex gap-2 bg-white/5 border border-white/10 p-1.5 rounded-xl overflow-x-auto no-scrollbar">
                    {FRAMES.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setSelectedFrame(f.id)}
                            className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] font-mono tracking-widest uppercase transition-all whitespace-nowrap font-bold ${selectedFrame === f.id
                                ? "bg-emerald-500/20 text-emerald-400 shadow-[inset_0_0_10px_rgba(16,185,129,0.3)] border border-emerald-500/30"
                                : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:bg-white/5"
                                }`}
                        >
                            {f.emoji} {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Capture buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handleSingleShot}
                    disabled={countdown !== null}
                    className="flex-1 py-4 bg-gradient-to-br from-emerald-500 via-emerald-600 to-cyan-600 hover:from-emerald-400 hover:via-emerald-500 hover:to-cyan-500 text-black font-black uppercase font-mono tracking-widest rounded-xl text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                    📸 CAPTURE NODE
                </button>
                <button
                    onClick={handleStripShot}
                    disabled={countdown !== null || stripMode}
                    className="flex-1 py-4 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 hover:from-purple-400 hover:via-purple-500 hover:to-pink-500 text-white font-black uppercase font-mono tracking-widest rounded-xl text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                >
                    🎬 BURST SEQUENCE
                </button>
            </div>

            {/* Strip progress */}
            {stripMode && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-purple-500 animate-ping" />
                    <p className="text-purple-400 font-mono text-xs tracking-widest font-bold">
                        BUFFERING: {stripPhotos.length}/4 FRAMES SECURED...
                    </p>
                </div>
            )}

            {/* Gallery */}
            {photos.length > 0 && (
                <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest font-bold">
                            Local Memory Buffer ({photos.length})
                        </p>
                        <button
                            onClick={clearGallery}
                            className="text-[10px] text-red-500 bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-lg uppercase tracking-widest font-mono font-bold transition-all"
                        >
                            FORMAT DISK
                        </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {photos.map((photo, i) => (
                            <div key={i} className="relative group cursor-pointer aspect-square bg-black rounded-lg overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all">
                                <img
                                    src={photo}
                                    alt={`Photo ${i + 1}`}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110"
                                />
                                <button
                                    onClick={() => downloadPhoto(photo, i)}
                                    className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-all font-mono"
                                >
                                    💾 SAVE
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Gesture hint */}
            <p className="text-zinc-600 text-[9px] font-mono tracking-widest uppercase font-bold text-center mt-2">
                SYSTEM TIP: FORM 👍 <span className="text-emerald-500 border border-emerald-500/20 bg-emerald-500/10 px-1 rounded">THUMBS UP</span> GESTURE TO AUTO-TRIGGER CAPTURE
            </p>
        </div>
    );
}

// ─── Frame drawing ──────────────────────────────────────────────────────
function applyFrame(ctx: CanvasRenderingContext2D, w: number, h: number, frame: FrameStyle) {
    switch (frame) {
        case "polaroid": {
            const borderW = 20;
            const bottomW = 60;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, w, borderW);
            ctx.fillRect(0, 0, borderW, h);
            ctx.fillRect(w - borderW, 0, borderW, h);
            ctx.fillRect(0, h - bottomW, w, bottomW);
            ctx.fillStyle = "#333";
            ctx.font = "italic 16px serif";
            ctx.fillText("AI Vision • " + new Date().toLocaleDateString(), borderW + 8, h - 20);
            break;
        }
        case "vintage": {
            ctx.fillStyle = "rgba(160, 120, 60, 0.25)";
            ctx.fillRect(0, 0, w, h);
            // Vignette
            const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
            grad.addColorStop(0, "transparent");
            grad.addColorStop(1, "rgba(0,0,0,0.5)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            break;
        }
        case "neon": {
            ctx.shadowColor = "#00ff88";
            ctx.shadowBlur = 15;
            ctx.strokeStyle = "#00ff88";
            ctx.lineWidth = 4;
            ctx.strokeRect(10, 10, w - 20, h - 20);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#00bbff";
            ctx.lineWidth = 2;
            ctx.strokeRect(16, 16, w - 32, h - 32);
            break;
        }
        case "filmstrip": {
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, w, 30);
            ctx.fillRect(0, h - 30, w, 30);
            // Sprocket holes
            for (let i = 0; i < w; i += 40) {
                ctx.fillStyle = "#333";
                ctx.fillRect(i + 10, 5, 20, 20);
                ctx.fillRect(i + 10, h - 25, 20, 20);
            }
            break;
        }
    }
}
