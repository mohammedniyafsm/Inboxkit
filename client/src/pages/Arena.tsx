"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, Trophy, X, Sparkles } from "lucide-react";

interface Block {
    id: number;
    owner: string | null;
    status: "unclaimed" | "owned";
    image: string | null;
}

const CHARACTER_IMAGES = [
    "https://i.pinimg.com/1200x/8b/98/f4/8b98f43bbe93c508f6d1c62b8a9c49de.jpg",
    "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80",
    "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&q=80",
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
];

export default function Arena() {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        // Initialize 144 blocks with some random images
        const initialBlocks = Array.from({ length: 144 }, (_, i) => ({
            id: i + 1,
            owner: null,
            status: "unclaimed" as const,
            image: Math.random() > 0.88 ? CHARACTER_IMAGES[Math.floor(Math.random() * CHARACTER_IMAGES.length)] : null,
        }));
        setBlocks(initialBlocks);
    }, []);

    const handleBlockClick = (id: number) => {
        if (selectedBlockId === id) return;
        setSelectedBlockId(id);
        setIsFlipped(false);

        // Auto-flip after a short delay when it reaches center
        setTimeout(() => setIsFlipped(true), 600);

        // Update capture status
        setBlocks(prev => prev.map(block =>
            block.id === id ? { ...block, status: "owned" as const, owner: "Niyaf" } : block
        ));
    };

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    return (
        <main className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-zinc-500/5 blur-[120px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto relative z-10">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-4">
                            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">Arena Live</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-white leading-[0.9]">Zone Control</h1>
                        <p className="text-zinc-500 mt-4 max-w-xl font-medium uppercase text-[10px] tracking-[0.2em] leading-relaxed">
                            Every click is a conquest. Find hidden legendary assets. High fidelity grid synchronization active.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-xl">
                            <Trophy className="h-6 w-6 text-white" />
                            <div>
                                <p className="text-[10px] uppercase text-zinc-500 font-black">Rank</p>
                                <p className="text-xl font-black italic tracking-tight">#01</p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-xl">
                            <Target className="h-6 w-6 text-white" />
                            <div>
                                <p className="text-[10px] uppercase text-zinc-500 font-black">Territory</p>
                                <p className="text-xl font-black italic tracking-tight">{blocks.filter(b => b.status === "owned").length}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* The Grid */}
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                    {blocks.map((block) => (
                        <motion.div
                            key={block.id}
                            layoutId={`block-${block.id}`}
                            onClick={() => handleBlockClick(block.id)}
                            className="aspect-square"
                        >
                            <Card className={`
                                h-full w-full cursor-pointer border-white/5 transition-all duration-300
                                ${block.status === "owned" ? "bg-white/10" : "bg-zinc-900/40 hover:bg-zinc-800/60"}
                                rounded-lg flex items-center justify-center relative group overflow-hidden
                            `}>
                                {block.status === "owned" ? (
                                    <Zap className="h-3 w-3 text-white" />
                                ) : (
                                    <span className="text-[8px] font-black text-white/5 group-hover:text-white/20">
                                        {block.id.toString().padStart(3, '0')}
                                    </span>
                                )}
                                {block.image && block.status === "unclaimed" && (
                                    <Sparkles className="absolute top-1 right-1 h-2 w-2 text-white/20 animate-pulse" />
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Selection/Flip Modal */}
            <AnimatePresence>
                {selectedBlockId && selectedBlock && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedBlockId(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />

                        <div className="relative w-full max-w-[400px] aspect-[3/4] preserve-3d">
                            <motion.div
                                layoutId={`block-${selectedBlockId}`}
                                className="w-full h-full cursor-pointer relative"
                                style={{ transformStyle: "preserve-3d" }}
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                onClick={() => setIsFlipped(!isFlipped)}
                            >
                                {/* Front Face (Back of card initially) */}
                                <div
                                    className="absolute inset-0 backface-hidden rounded-[2rem] bg-zinc-900 border-2 border-white/10 flex flex-col items-center justify-center p-8 text-center"
                                >
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <Zap className="h-10 w-10 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Claiming Tile</h3>
                                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">
                                        Synchronizing with server...
                                    </p>
                                </div>

                                {/* Back Face (Actual Character Art) */}
                                <div
                                    className="absolute inset-0 backface-hidden rounded-[2rem] overflow-hidden border-2 border-white/20"
                                    style={{ transform: "rotateY(180deg)" }}
                                >
                                    {selectedBlock.image ? (
                                        <div className="relative h-full w-full">
                                            <img
                                                src={selectedBlock.image}
                                                className="h-full w-full object-cover"
                                                alt="Character"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                            <div className="absolute bottom-8 left-8 right-8 text-left">
                                                <Badge variant="outline" className="mb-4 border-white/20 bg-black/40 backdrop-blur text-white text-[10px] uppercase font-black tracking-widest px-3 py-1">
                                                    Legendary Found
                                                </Badge>
                                                <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase drop-shadow-2xl">
                                                    Arcane Master
                                                </h2>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full w-full bg-white flex flex-col items-center justify-center p-8 text-center">
                                            <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-6">
                                                <Target className="h-8 w-8 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2 text-black leading-tight">
                                                Tile Captured Successfully
                                            </h3>
                                            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                                No hidden asset in this zone
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Close Button */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 }}
                                onClick={() => setSelectedBlockId(null)}
                                className="absolute -top-12 right-0 bg-white text-black p-2 rounded-full hover:bg-zinc-200 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </motion.button>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .preserve-3d { transform-style: preserve-3d; perspective: 1000px; }
                .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
            `}</style>
        </main>
    );
}
