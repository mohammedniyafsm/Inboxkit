import { Timer } from "lucide-react";
import { type Card } from "@/types/card";

interface ActiveAssetsProps {
    userCards: Card[];
    activeMyCardsCount: number;
    maxActiveCards: number;
    now: number;
    setSelectedCardId: (id: string) => void;
    isCardActive: (card: Card) => boolean;
}

export const ActiveAssets = ({
    userCards,
    activeMyCardsCount,
    maxActiveCards,
    now,
    setSelectedCardId,
    isCardActive,
}: ActiveAssetsProps) => {
    if (activeMyCardsCount === 0) return null;

    return (
        <div className="mb-6 p-4 rounded-xl bg-emerald-900/10 border border-emerald-500/20 backdrop-blur-sm">
            <h3 className="text-xs font-black uppercase text-emerald-400 mb-3 flex items-center justify-between tracking-widest">
                <span>Active Assets</span>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/20">
                    {activeMyCardsCount}/{maxActiveCards}
                </span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {userCards.filter(c => isCardActive(c)).map(card => (
                    <div
                        key={card._id}
                        onClick={() => setSelectedCardId(card._id)}
                        className="group relative aspect-video sm:aspect-square rounded-lg overflow-hidden border border-emerald-500/30 cursor-pointer hover:border-emerald-400 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-black"
                    >
                        {card.image && (
                            <img src={card.image} alt={card.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                        <div className="absolute top-1 right-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]" />
                        </div>

                        <div className="absolute bottom-0 inset-x-0 p-2">
                            <div className="text-[10px] font-black text-white truncate uppercase tracking-tight">{card.name}</div>
                            <div className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                                <Timer size={8} />
                                {Math.max(0, Math.ceil((new Date(card.expiresAt!).getTime() - now) / 1000))}s
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
