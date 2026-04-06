import dynamic from "next/dynamic";

const FaceDetection = dynamic(() => import("@/components/FaceDetection"), {
    ssr: false,
    loading: () => (
        <div className="relative w-full max-w-[640px] aspect-[4/3] bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center overflow-hidden shadow-md">
            <div className="relative z-10 text-center">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 text-xs font-medium tracking-wider">Loading...</p>
            </div>
        </div>
    ),
});

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 text-center mb-6">
                <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-1 tracking-tight">
                    WhisperWeave
                </h1>
                <p className="text-slate-400 text-[11px] tracking-[0.25em] uppercase font-semibold">
                    Gentle AI Vision · Limbo
                </p>
            </div>

            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
                <FaceDetection />
            </div>

            <div className="fixed bottom-4 text-[9px] text-slate-300 tracking-widest uppercase font-medium">
                face-api.js · MediaPipe · TensorFlow
            </div>
        </main>
    );
}
