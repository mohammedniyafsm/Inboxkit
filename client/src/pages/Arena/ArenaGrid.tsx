import { AlertCircle, RefreshCw } from "lucide-react";
import { type Card } from "@/types/card";
import CardTile from "@/components/CardTile";

interface ArenaGridProps {
    cards: Card[];
    error: string | null;
    loadingId: string | null;
    currentUserId: string | null;
    handleReshuffle: () => void;
    handleCardClick: (id: string) => void;
    isCardActive: (card: Card) => boolean;
    isCardExpired: (card: Card) => boolean;
    getOwnerId: (card: Card) => string | null;
    getOwnerUsername: (card: Card) => string;
}

export const ArenaGrid = ({
    cards,
    error,
    loadingId,
    currentUserId,
    handleReshuffle,
    handleCardClick,
    isCardActive,
    isCardExpired,
    getOwnerId,
    getOwnerUsername,
}: ArenaGridProps) => {
    return (
        <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        Active Sectors
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h1>
                    <p className="text-zinc-400">
                        Claim territories to generate points. Watch for rival activity.
                    </p>
                </div>
                <button
                    onClick={handleReshuffle}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5 hover:border-white/10"
                    title="Reshuffle Grid"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {cards.map((card) => {
                    const ownerId = getOwnerId(card);
                    const isMyActive = !!currentUserId && ownerId === currentUserId && isCardActive(card);
                    const isClaimed = !!ownerId && !isCardExpired(card);

                    return (
                        <div key={card._id} onClick={() => handleCardClick(card._id)}>
                            <CardTile
                                card={card}
                                isClaimed={isClaimed}
                                isMyActive={isMyActive}
                                ownerUsername={isClaimed && !isMyActive ? getOwnerUsername(card) : undefined}
                                disabled={false}
                                onClick={() => { }}
                                loading={loadingId === card._id}
                                layoutId={`card-${card._id}`}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
