import { motion, AnimatePresence } from "framer-motion";
import { X, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type Card } from "@/types/card";

interface CardViewModalProps {
    displayCardId: string | null;
    displayCard: Card | undefined;
    justClaimedCard: Card | null;
    now: number;
    setSelectedCardId: (id: string | null) => void;
    setJustClaimedCard: (card: Card | null) => void;
}

export const CardViewModal = ({
    displayCardId,
    displayCard,
    justClaimedCard,
    now,
    setSelectedCardId,
    setJustClaimedCard,
}: CardViewModalProps) => {
    const typeBadgeClass = (type?: Card["type"]) => {
        switch (type) {
            case "rare": return "border-purple-400/40 text-purple-200";
            case "trap": return "border-red-400/40 text-red-200";
            default: return "border-white/20 text-white";
        }
    };

    const handleClose = () => {
        setSelectedCardId(null);
        setJustClaimedCard(null);
    };

    return (
        <AnimatePresence>
            {displayCardId && displayCard && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                    />

                    <div className="relative w-full max-w-[320px] aspect-[3/4] preserve-3d">
                        {justClaimedCard && justClaimedCard._id === displayCardId && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute -top-20 left-0 right-0 text-center z-20 pointer-events-none"
                            >
                                <h2 className={`text-4xl font-black italic uppercase drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] ${justClaimedCard.type === 'trap' ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'text-emerald-400'}`}>
                                    {justClaimedCard.type === 'trap' ? 'TRAPPED!' : 'CONQUERED!'}
                                </h2>
                                <p className="text-white text-xs tracking-widest uppercase font-bold mt-2">
                                    {justClaimedCard.type === 'trap' ? 'System Compromised' : 'Territory Secured'}
                                </p>
                            </motion.div>
                        )}

                        <motion.div
                            layoutId={`card-${displayCardId}`}
                            className="w-full h-full cursor-pointer relative"
                            animate={{ rotateY: 0 }}
                            onClick={handleClose}
                        >
                            <div className={`absolute inset-0 rounded-[2rem] overflow-hidden border-2 bg-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500
                            ${justClaimedCard && justClaimedCard._id === displayCardId
                                    ? (justClaimedCard.type === 'trap'
                                        ? "border-red-500 shadow-[0_0_100px_rgba(220,38,38,0.6)] bg-red-950/50"
                                        : "border-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.5)]")
                                    : "border-white/20"}
                        `}>
                                {displayCard.image ? (
                                    <div className="relative h-full w-full">
                                        <img src={displayCard.image} className="h-full w-full object-cover opacity-60" alt={displayCard.name} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                        <div className="absolute bottom-6 left-6 right-6 text-left">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Badge variant="outline" className={`bg-black/40 backdrop-blur text-[10px] uppercase font-black tracking-widest px-3 py-1 ${typeBadgeClass(displayCard.type)}`}>
                                                    {displayCard.type}
                                                </Badge>
                                                <Badge variant="outline" className="border-amber-300/40 bg-black/40 backdrop-blur text-amber-200 text-[10px] uppercase font-black tracking-widest px-3 py-1">
                                                    {displayCard.points} pts
                                                </Badge>
                                            </div>
                                            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase drop-shadow-2xl">
                                                {displayCard.name}
                                            </h2>
                                            {displayCard.description && <p className="mt-2 text-xs text-zinc-300 uppercase tracking-widest font-black leading-relaxed">{displayCard.description}</p>}
                                            <div className="mt-6">
                                                <div className="w-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 py-3 rounded-lg text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                                    <Timer className="h-4 w-4" />
                                                    Active Territory
                                                </div>
                                                {displayCard.expiresAt && <p className="mt-2 text-center text-xs text-emerald-400/80 uppercase tracking-widest font-bold">Expires in {Math.max(0, Math.ceil((new Date(displayCard.expiresAt).getTime() - now) / 1000))}s</p>}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full w-full bg-zinc-900 flex flex-col items-center justify-center p-8 text-center border-2 border-emerald-500">
                                        <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2 text-white leading-tight">{displayCard.name}</h3>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                        <motion.button
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 }}
                            onClick={handleClose}
                            className="absolute -top-12 right-0 bg-white text-black p-2 rounded-full hover:bg-zinc-200 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </motion.button>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};
