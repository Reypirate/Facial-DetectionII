import dynamic from "next/dynamic";

const FaceDetection = dynamic(() => import("@/components/FaceDetection"), {
    ssr: false,
    loading: () => (
        <div className="relative w-full max-w-[640px] aspect-[4/3] bg-forest-800/40 backdrop-blur-xl rounded-xl border border-mana-500/20 flex flex-col items-center justify-center overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-mana-500/10 to-transparent" />
            
            <div className="relative z-10 text-center">
                <div className="w-12 h-12 border-4 border-forest-700 border-t-mana-400 rounded-full animate-spin mx-auto mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <p className="text-mana-400 font-mono text-sm tracking-widest animate-pulse">AWAKENING ARCANE CORE...</p>
            </div>
        </div>
    ),
});

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-forest-900 text-elven-300 relative overflow-hidden">
            {/* Magical background radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-mana-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mana-400 via-emerald-200 to-cyan-300 mb-2 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] tracking-tight">
                    ARCANE BIOMETRICS
                </h1>
                <p className="text-mana-500/80 font-mono text-[10px] tracking-[0.3em] uppercase font-bold">
                    Ethereal Facial Detection System
                </p>
            </div>

            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
                <FaceDetection />
            </div>

            <div className="fixed bottom-4 text-[9px] text-elven-500/50 font-mono tracking-widest uppercase">
                Powered by Ancient Magic &bull; face-api.js &bull; MediaPipe
            </div>
        </main>
    );
}
