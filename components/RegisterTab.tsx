import React from "react";
import { cn } from "@/utils/cn";
import { SavedFace } from "@/types/models";

interface RegisterTabProps {
    registerName: string;
    setRegisterName: (name: string) => void;
    registerStatus: string;
    savedFaces: SavedFace[];
    isRegistrationReady: boolean;
    onRegister: () => void;
    onDeleteFace: (name: string) => void;
}

export default function RegisterTab({
    registerName,
    setRegisterName,
    registerStatus,
    savedFaces,
    isRegistrationReady,
    onRegister,
    onDeleteFace,
}: RegisterTabProps) {
    return (
        <div className="space-y-4">
            <div>
                <p className="text-slate-400 text-[10px] font-semibold uppercase mb-1 tracking-widest">
                    Face Registration
                </p>
                <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                    Look at the camera and enter a name. The border turns{" "}
                    <span className="text-emerald-600 font-semibold">green</span> when ready.
                </p>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="Enter name..."
                        className={cn(
                            "flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5",
                            "text-slate-800 text-sm outline-none transition-all",
                            "focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
                            "placeholder:text-slate-300"
                        )}
                    />
                    <button
                        onClick={onRegister}
                        disabled={!isRegistrationReady}
                        className={cn(
                            "px-6 py-2.5 font-semibold rounded-xl text-sm transition-all tracking-wide",
                            isRegistrationReady
                                ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                                : "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200"
                        )}
                    >
                        Register
                    </button>
                </div>
                {registerStatus && (
                    <p className="mt-3 text-xs text-emerald-600 font-medium">
                        {registerStatus}
                    </p>
                )}
            </div>

            {savedFaces.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase mb-3 tracking-widest">
                        Registered Faces ({savedFaces.length})
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {savedFaces.map((f, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 transition-colors"
                            >
                                <span className="text-slate-800 text-xs font-medium truncate pr-3">
                                    {f.name}
                                </span>
                                <button
                                    onClick={() => onDeleteFace(f.name)}
                                    className="text-rose-400 hover:text-rose-600 text-[10px] uppercase tracking-widest shrink-0 transition-colors font-semibold"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
