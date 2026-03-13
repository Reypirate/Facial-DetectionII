import dynamic from "next/dynamic";

const FaceDetection = dynamic(() => import("@/components/FaceDetection"), {
    ssr: false,
    loading: () => (
        <div className="relative w-full max-w-[640px] aspect-[4/3] bg-zinc-900/50 backdrop-blur-md rounded-xl border border-white/5 flex flex-col items-center justify-center overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            
            <div className="relative z-10 text-center">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4 box-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <p className="text-emerald-400/80 font-mono text-sm tracking-widest animate-pulse">BOOTING AI CORE...</p>
            </div>
        </div>
    ),
});

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950 text-white">
            <div className="text-center mb-6">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 mb-1">
                    AI Vision Studio
                </h1>
                <p className="text-zinc-500 font-mono text-xs">
                    Face &bull; Hand Gestures &bull; Object Detection &bull; Photobooth
                </p>
            </div>

            <div className="w-full max-w-4xl flex flex-col items-center">
                <FaceDetection />
            </div>

            <div className="fixed bottom-3 text-[10px] text-zinc-700 font-mono">
                face-api.js &bull; MediaPipe Hands &bull; TensorFlow COCO-SSD
            </div>
        </main>
    );
}
