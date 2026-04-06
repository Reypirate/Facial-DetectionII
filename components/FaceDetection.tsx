"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { toggleSounds } from "@/utils/sounds";
import { cn } from "@/utils/cn";
import Dashboard from "./Dashboard";
import { useCamera } from "@/hooks/useCamera";
import { useAIModels } from "@/hooks/useAIModels";
import { useDetection } from "@/hooks/useDetection";
import { SavedFace } from "@/types/models";
import RegisterTab from "./RegisterTab";

// ─── Face Registration store ────────────────────────────────────────────
function loadSavedFaces(): SavedFace[] {
    try {
        const raw = localStorage.getItem("ai-vision-faces");
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return parsed.map((f: any) => ({
            name: f.name,
            descriptor: new Float32Array(f.descriptor),
        }));
    } catch {
        return [];
    }
}

function saveFaceToDB(name: string, descriptor: Float32Array) {
    const existing = loadSavedFaces();
    existing.push({ name, descriptor });
    const serialized = existing.map((f) => ({
        name: f.name,
        descriptor: Array.from(f.descriptor),
    }));
    localStorage.setItem("ai-vision-faces", JSON.stringify(serialized));
}

// ─── Tabs ───────────────────────────────────────────────────────────────
type TabId = "detection" | "soundboard" | "register";

export default function FaceDetection() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [activeTab, setActiveTab] = useState<TabId>("detection");
    const [detectionPaused, setDetectionPaused] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const { videoRef, cameraReady, cameraError, retryCamera } = useCamera();
    const {
        faceModelsReady,
        handModelsReady,
        objectModelReady,
        handResultsRef,
        objectModelRef,
        onFaceApiLoad,
        onCocoSsdLoad,
        onHandsLoad
    } = useAIModels(videoRef);

    // Face registration state
    const [registerName, setRegisterName] = useState("");
    const [registerStatus, setRegisterStatus] = useState("");
    const [savedFaces, setSavedFaces] = useState<SavedFace[]>([]);

    useEffect(() => {
        setSavedFaces(loadSavedFaces());
    }, []);

    const {
        faceCount,
        handCount,
        objectCount,
        fps,
        topExpression,
        topGesture,
        emotionHistory,
        lastDescriptorRef,
    } = useDetection({
        videoRef,
        canvasRef,
        cameraReady,
        faceModelsReady,
        handModelsReady,
        objectModelReady,
        handResultsRef,
        objectModelRef,
        detectionPaused,
        savedFaces,
        activeTab
    });

    // No blink check — just face + name
    const isRegistrationReady = lastDescriptorRef.current !== null && registerName.trim().length > 0;

    const handleRegisterFace = () => {
        if (!registerName.trim()) {
            setRegisterStatus("Please enter a name.");
            return;
        }
        if (!lastDescriptorRef.current) {
            setRegisterStatus("No face detected. Look at the camera.");
            return;
        }
        saveFaceToDB(registerName.trim(), lastDescriptorRef.current);
        setSavedFaces(loadSavedFaces());
        setRegisterStatus(`✓ Registered: ${registerName}`);
        setRegisterName("");
        setTimeout(() => setRegisterStatus(""), 3000);
    };

    const handleDeleteFace = (name: string) => {
        const remaining = savedFaces.filter((f) => f.name !== name);
        const serialized = remaining.map((f) => ({
            name: f.name,
            descriptor: Array.from(f.descriptor),
        }));
        localStorage.setItem("ai-vision-faces", JSON.stringify(serialized));
        setSavedFaces(remaining);
    };

    const handleToggleSound = () => {
        const next = !soundEnabled;
        setSoundEnabled(next);
        toggleSounds(next);
    };

    const areAllModelsLoading = cameraReady && (!faceModelsReady || !handModelsReady || !objectModelReady);
    
    // Clean border states
    let videoBorderClass = "border-slate-200";
    if (activeTab === "register") {
        videoBorderClass = isRegistrationReady 
            ? "border-emerald-400 shadow-md" 
            : "border-rose-300 shadow-md";
    } else if (activeTab === "soundboard") {
        videoBorderClass = "border-indigo-300 shadow-md";
    }

    // Tab order: Detection → Whisper Board → Register
    const TABS: { id: TabId; label: string; icon: string }[] = [
        { id: "detection", label: "Detection", icon: "👁" },
        { id: "soundboard", label: "Whisper Board", icon: "♪" },
        { id: "register", label: "Register", icon: "✎" },
    ];

    if (cameraError) {
        return (
            <div className={cn(
                "flex flex-col items-center justify-center w-full max-w-[800px] aspect-[4/3]",
                "bg-white rounded-2xl border border-slate-200 text-center",
                "p-8 shadow-lg"
            )}>
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-5">
                    <p className="text-3xl">📷</p>
                </div>
                <h2 className="text-slate-900 font-semibold mb-2 text-lg">Camera Access Needed</h2>
                <p className="text-slate-500 text-sm mb-6 max-w-sm leading-relaxed">
                    Please allow camera access so we can detect faces and hands.
                </p>
                <button
                    onClick={retryCamera}
                    className={cn(
                        "px-6 py-2.5 bg-indigo-600 text-white rounded-xl",
                        "hover:bg-indigo-500 transition-all text-sm font-medium shadow-sm"
                    )}
                >
                    Try Again
                </button>
            </div>
        );
    }

    // ── Status Indicator ──
    const renderStatusIndicator = () => {
        if (!cameraReady) {
            return (
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-slate-500 text-[10px] font-medium tracking-wider">Connecting...</span>
                </div>
            );
        }
        if (areAllModelsLoading) {
            return (
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-slate-500 text-[10px] font-medium tracking-wider">Loading models...</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-600 text-[10px] font-medium tracking-wider">Ready</span>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center w-full">
            {/* AI Model Scripts */}
            <Script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js" strategy="lazyOnload" onLoad={onFaceApiLoad} />
            <Script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.21.0/dist/tf.min.js" strategy="lazyOnload" onLoad={() => {
                const cocoScript = document.createElement("script");
                cocoScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js";
                cocoScript.onload = onCocoSsdLoad;
                document.head.appendChild(cocoScript);
            }} />
            <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js" strategy="lazyOnload" crossOrigin="anonymous" onLoad={onHandsLoad} />

            {/* Main Stage */}
            <div className={cn(
                "relative w-full max-w-[800px] aspect-[4/3] rounded-2xl overflow-hidden",
                "border-2 shadow-lg transition-all duration-500 bg-slate-50",
                videoBorderClass
            )}>
                
                {/* Raw Video Feed */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)", filter: "brightness(1.02) contrast(1.02)" }}
                />

                {/* Detection Canvas Overlay */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{ transform: "scaleX(-1)" }}
                />

                {/* Top Nav */}
                <div className="absolute top-3 inset-x-3 z-30 flex justify-between items-start pointer-events-none">
                    {/* Tab Bar */}
                    <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl p-1 flex gap-0.5 shadow-md">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[11px] transition-all font-medium tracking-wide",
                                    activeTab === tab.id
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                                )}
                            >
                                {tab.icon} <span className="hidden sm:inline-block ml-0.5">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Status Pill */}
                    <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-slate-200 rounded-full px-3 py-1.5 shadow-md">
                        {renderStatusIndicator()}
                    </div>
                </div>

                {/* Center Loading State */}
                {areAllModelsLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/70 backdrop-blur-sm pointer-events-none">
                        <div className="w-12 h-12 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                        <p className="text-slate-500 text-xs font-medium tracking-wider">Loading models...</p>
                    </div>
                )}
                
                {/* Paused Overlay */}
                {detectionPaused && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20 pointer-events-none">
                        <span className="text-2xl font-semibold text-slate-700 tracking-wide">Paused</span>
                    </div>
                )}
            </div>

            {/* Panel Below Video */}
            <div className="w-full max-w-[800px] mt-4 flex flex-col items-center justify-end z-30">
                <div className="w-full overflow-y-auto no-scrollbar rounded-2xl bg-white border border-slate-200 shadow-md transition-all p-5">
                    
                    {activeTab === "detection" && (
                        <Dashboard
                            faceCount={faceCount}
                            handCount={handCount}
                            objectCount={objectCount}
                            fps={fps}
                            topExpression={topExpression}
                            topGesture={topGesture}
                            emotionHistory={emotionHistory}
                            soundEnabled={soundEnabled}
                            onToggleSound={handleToggleSound}
                            detectionPaused={detectionPaused}
                        />
                    )}

                    {activeTab === "soundboard" && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-slate-400 text-[10px] font-semibold uppercase mb-1 tracking-widest">Whisper Board</p>
                                <p className="text-slate-500 text-xs leading-relaxed">
                                    Words hover over your fingertips. Curl a finger to trigger its word. Pinch thumb &amp; index for &ldquo;that&rdquo;.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-5 gap-2">
                                {[
                                    { word: "I", finger: "Index", color: "bg-slate-100 border-slate-200" },
                                    { word: "love", finger: "Middle", color: "bg-rose-50 border-rose-200" },
                                    { word: "you", finger: "Ring", color: "bg-blue-50 border-blue-200" },
                                    { word: "hate", finger: "Pinky", color: "bg-orange-50 border-orange-200" },
                                    { word: "that", finger: "Pinch", color: "bg-violet-50 border-violet-200" },
                                ].map(({ word, finger, color }) => (
                                    <div key={word} className={cn(
                                        "rounded-xl p-3 text-center border transition-all",
                                        color
                                    )}>
                                        <p className="text-slate-800 text-lg font-semibold">{word}</p>
                                        <p className="text-slate-400 text-[9px] uppercase tracking-widest mt-1 font-medium">{finger}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                <p className="text-slate-400 text-[10px] font-semibold uppercase mb-2 tracking-widest">Output</p>
                                <p className="text-slate-800 text-base font-semibold min-h-[1.5em]">
                                    {topGesture || <span className="text-slate-300 italic font-normal">listening...</span>}
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleToggleSound}
                                    className={cn(
                                        "px-4 py-2 rounded-xl border text-[10px] tracking-widest uppercase font-semibold transition-all",
                                        soundEnabled
                                            ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                                            : "border-slate-200 text-slate-400 bg-white hover:bg-slate-50"
                                    )}
                                >
                                    {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "register" && (
                        <RegisterTab
                            registerName={registerName}
                            setRegisterName={setRegisterName}
                            registerStatus={registerStatus}
                            savedFaces={savedFaces}
                            isRegistrationReady={isRegistrationReady}
                            onRegister={handleRegisterFace}
                            onDeleteFace={handleDeleteFace}
                        />
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex gap-5 px-5 py-2.5 bg-white rounded-full border border-slate-200 text-[9px] tracking-widest uppercase font-semibold text-slate-400 shadow-sm">
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-emerald-400" /> Faces
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-blue-400" /> Hands
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-amber-400" /> Objects
                </span>
            </div>
        </div>
    );
}
