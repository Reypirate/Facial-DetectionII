import React from "react";
import { cn } from "@/utils/cn";
import { SavedFace } from "@/types/models";

interface RegisterTabProps {
    registerName: string;
    setRegisterName: (name: string) => void;
    registerStatus: string;
    savedFaces: SavedFace[];
    hasBlinked: boolean;
    isRegistrationReady: boolean;
    onRegister: () => void;
    onDeleteFace: (name: string) => void;
}

export default function RegisterTab({
    registerName,
    setRegisterName,
    registerStatus,
    savedFaces,
    hasBlinked,
    isRegistrationReady,
    onRegister,
    onDeleteFace,
}: RegisterTabProps) {
    return (
        <div className="space-y-4">
            <div>
                <p className="text-elven-500 text-[10px] font-mono uppercase mb-1 tracking-widest font-bold">
                    Arcane Identity Enrollment
                </p>
                <p className="text-elven-400 text-xs mb-4 leading-relaxed tracking-wider">
                    Align face with the central lens. The matrix pulses <span className="text-mana-400 font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]">emerald</span> when lock is secured. Enter an alias to bind local recognition runes.
                </p>

                {/* Liveness Indicator */}
                <div className={`mb-4 border rounded-xl p-3 flex items-center justify-between transition-all ${hasBlinked
                        ? "bg-mana-500/10 border-mana-500/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]"
                        : "bg-orange-500/10 border-orange-500/30 shadow-[inset_0_0_20px_rgba(249,115,22,0.1)]"
                    }`}>
                    <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold tracking-widest uppercase text-elven-300">
                            Vitality Verification
                        </span>
                        <span className={`text-[10px] font-mono tracking-widest uppercase mt-0.5 ${hasBlinked ? "text-mana-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "text-orange-400 animate-pulse drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]"
                            }`}>
                            {hasBlinked ? "✧ REAL LIFEFORM MET" : "⚠️ AWAITING BLINK CALIBRATION..."}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="Enter binding alias..."
                        className={cn(
                            "flex-1 bg-forest-900/80 border border-mana-500/20 rounded-xl px-4 py-2.5",
                            "text-mana-400 font-mono text-sm outline-none transition-all shadow-inner",
                            "focus:outline-none focus:border-mana-500/50 focus:bg-forest-900",
                            "placeholder:text-elven-500/50"
                        )}
                    />
                    <button
                        onClick={onRegister}
                        disabled={!isRegistrationReady}
                        className={cn(
                            "px-6 py-2.5 font-bold font-mono rounded-xl text-sm transition-all tracking-wide",
                            isRegistrationReady
                                ? "bg-mana-500 text-forest-900 shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:bg-mana-400"
                                : "bg-forest-800 text-elven-500 cursor-not-allowed border border-white/5"
                        )}
                    >
                        BIND
                    </button>
                </div>
                {registerStatus && (
                    <p className="mt-3 text-xs font-mono text-mana-400 flex items-center gap-2 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] animate-pulse">
                        {registerStatus}
                    </p>
                )}
            </div>

            {savedFaces.length > 0 && (
                <div className="pt-4 border-t border-mana-500/20">
                    <p className="text-elven-500 text-[10px] font-mono uppercase mb-3 tracking-widest font-bold">
                        Secured Crystal Index ({savedFaces.length})
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {savedFaces.map((f, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between bg-forest-900/50 border border-mana-500/10 hover:border-mana-500/30 rounded-xl px-3 py-2 transition-colors"
                            >
                                <span className="text-elven-300 font-mono text-xs font-bold truncate pr-3 drop-shadow-[0_0_2px_rgba(243,244,246,0.5)]">
                                    {f.name}
                                </span>
                                <button
                                    onClick={() => onDeleteFace(f.name)}
                                    className="text-red-400/70 hover:text-red-400 text-[10px] uppercase font-mono tracking-widest shrink-0 transition-colors"
                                >
                                    Shatter
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
