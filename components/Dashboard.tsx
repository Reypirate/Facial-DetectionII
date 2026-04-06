"use client";

import React from "react";
import { COLORS } from "@/utils/drawingHelpers";

interface DashboardProps {
    faceCount: number;
    handCount: number;
    objectCount: number;
    fps: number;
    topExpression: string;
    topGesture: string;
    emotionHistory: { time: number; emotion: string; score: number }[];
    soundEnabled: boolean;
    onToggleSound: () => void;
    detectionPaused: boolean;
}

export default function Dashboard({
    faceCount,
    handCount,
    objectCount,
    fps,
    topExpression,
    topGesture,
    emotionHistory,
    soundEnabled,
    onToggleSound,
    detectionPaused,
}: DashboardProps) {
    const recentEmotions = emotionHistory.slice(-20);

    return (
        <div className="w-full space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3">
                <StatCard label="Faces" value={faceCount} color={COLORS.face} />
                <StatCard label="Hands" value={handCount} color={COLORS.hand} />
                <StatCard label="Objects" value={objectCount} color={COLORS.object} />
                <StatCard label="FPS" value={fps} color="#64748b" />
            </div>

            {/* Current detections */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex flex-col justify-center">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-1">Expression</p>
                    <p className="text-slate-800 text-sm truncate font-medium">{topExpression || "—"}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex flex-col justify-center">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-1">Whisper Board</p>
                    <p className="text-slate-800 text-sm truncate font-medium">{topGesture || "—"}</p>
                </div>
            </div>

            {/* Emotion Timeline */}
            {recentEmotions.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase mb-3 tracking-widest">Emotion Timeline</p>
                    <div className="flex items-end gap-[3px] h-10 w-full rounded-lg overflow-hidden bg-white border border-slate-100 p-1">
                        {recentEmotions.map((e, i) => (
                            <div
                                key={i}
                                className="flex-1 rounded-sm transition-all duration-300 relative group"
                                style={{
                                    height: `${Math.max(e.score * 100, 8)}%`,
                                    backgroundColor: getEmotionColor(e.emotion),
                                    opacity: 0.4 + (i / recentEmotions.length) * 0.6,
                                }}
                            >
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                    {e.emotion} {Math.round(e.score * 100)}%
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-[9px] text-slate-400 tracking-widest font-medium">-20s</span>
                        <span className="text-[9px] text-slate-500 tracking-widest font-medium">now</span>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex gap-3 justify-end items-center mt-2 border-t border-slate-200 pt-4">
                {detectionPaused && (
                    <span className="px-4 py-2 rounded-xl border border-amber-300 text-amber-700 bg-amber-50 text-[10px] uppercase tracking-widest font-semibold animate-pulse">
                        Paused
                    </span>
                )}
                <button
                    onClick={onToggleSound}
                    className={`px-4 py-2 rounded-xl border text-[10px] tracking-widest uppercase font-semibold transition-all ${soundEnabled
                            ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                            : "border-slate-200 text-slate-400 bg-white hover:bg-slate-50"
                        }`}
                >
                    {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
                </button>
            </div>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-center transition-all hover:shadow-sm">
            <p className="text-3xl font-semibold tracking-tighter" style={{ color }}>
                {value}
            </p>
            <p className="text-slate-400 text-[9px] uppercase tracking-widest font-semibold mt-1">{label}</p>
        </div>
    );
}

function getEmotionColor(emotion: string): string {
    const map: Record<string, string> = {
        happy: "#34d399",
        sad: "#60a5fa",
        angry: "#f87171",
        surprised: "#fbbf24",
        disgusted: "#a78bfa",
        fearful: "#818cf8",
        neutral: "#94a3b8",
    };
    return map[emotion.toLowerCase()] || "#94a3b8";
}
