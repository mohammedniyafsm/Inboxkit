import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { X, AlertCircle, Timer, Info, Terminal, Shield } from "lucide-react";
import { type Card } from "@/types/card";
import CardTile from "@/components/CardTile";
import ActionBlockedModal from "@/components/ActionBlockedModal";
import Leaderboard from "@/components/Leaderboard";
import { useArenaSocket } from "@/hooks/useArenaSocket";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { claimCard, getAllCards } from "@/services/cardService";
import { getMe } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const MAX_CLAIMS = 3;
const MAX_ACTIVE_CARDS = 2;

const getOwnerId = (card: Card) => {
    if (!card.ownerId) return null;
    return typeof card.ownerId === 'string' ? card.ownerId : (card.ownerId as any)._id;
};

// Helper to safely get owner Username
const getOwnerUsername = (card: Card) => {
    if (!card.ownerId || typeof card.ownerId === 'string') return "UNKNOWN AGENT";
    return card.ownerId.username;
};

const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === "object") {
        const maybeMessage = (err as { message?: unknown }).message;
        if (typeof maybeMessage === "string") return maybeMessage;

        const maybeResponse = (err as { response?: unknown }).response;
        if (maybeResponse && typeof maybeResponse === "object") {
            const data = (maybeResponse as { data?: unknown }).data;
            if (data && typeof data === "object") {
                const msg = (data as { message?: unknown }).message;
                if (typeof msg === "string") return msg;
            }
        }
    }
    return "Failed to claim card";
};

// Simple Toast component internal to Arena for now (or move to separate file)
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: -20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: -20, x: 20 }}
        className="fixed top-20 right-8 z-[200] bg-zinc-900 border border-white/10 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 backdrop-blur-md max-w-sm"
    >
        <Info size={18} className="text-blue-400" />
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-auto text-zinc-500 hover:text-white">
            <X size={14} />
        </button>
    </motion.div>
);

export default function Arena() {
    const { user } = useAuth();
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
    const [claimHistory, setClaimHistory] = useState<number[]>([]);
    const [now, setNow] = useState(Date.now());
    const [justClaimedCard, setJustClaimedCard] = useState<Card | null>(null);

    // Leaderboard state
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    // Derived state for current user
    const currentUserId = user?._id || user?.id || (user as any)?._id;
    // Memoize token to prevent unnecessary re-connections if render happens
    const token = useMemo(() => localStorage.getItem("token"), []);

    // Modal State
    const [blockModal, setBlockModal] = useState<{
        isOpen: boolean;
        type: "cooldown" | "limit" | "rate_limit" | "occupied" | null;
        message?: string;
        cooldownEndsAt?: number | null;
    }>({ isOpen: false, type: null });

    // Toast State
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Time Sync
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    // History Cleanup & Cooldown Local Tick
    useEffect(() => {
        setClaimHistory((prev) => prev.filter((t) => now - t < (2 * 60 * 1000)));
        if (cooldownUntil && now >= cooldownUntil) {
            setCooldownUntil(null);
        }
    }, [now, cooldownUntil]);

    // Initial Fetch
    const fetchData = useCallback(async () => {
        try {
            setError(null);
            const token = localStorage.getItem("token");
            if (!token) return;

            const [cardsData, leaderboardRes, me] = await Promise.all([
                getAllCards(),
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/leaderboard`)
                    .then(res => res.json())
                    .then(data => data.data || [])
                    .catch(err => {
                        console.error("Leaderboard fetch failed", err);
                        return [];
                    }),
                getMe(token)
            ]);

            setCards(cardsData);
            setLeaderboard(leaderboardRes);

            if (me.cooldownUntil) {
                const ts = new Date(me.cooldownUntil).getTime();
                if (ts > Date.now()) setCooldownUntil(ts);
            }
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            setError(message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Real-time Socket Integration ---
    const handleCardUpdate = useCallback((updatedCard: Card) => {
        setCards((prevCards) =>
            prevCards.map((c) => (c._id === updatedCard._id ? updatedCard : c))
        );

        // Notify if another user claimed a card
        const newOwnerId = getOwnerId(updatedCard);
        if (newOwnerId && newOwnerId !== currentUserId) {
            const ownerName = getOwnerUsername(updatedCard);
            // Only show toast if it was recently claimed (expiresAt is in future)
            if (new Date(updatedCard.expiresAt!).getTime() > Date.now()) {
                setToastMessage(`Terminals in sector ${updatedCard.name} seized by ${ownerName || 'another operative'}.`);
                // Auto hide
                setTimeout(() => setToastMessage(null), 3000);
            }
        }
    }, [currentUserId]);

    const handleLeaderboardUpdate = useCallback((updatedUser: any) => {
        setLeaderboard(prev => {
            // Update the user in the list or add them if new
            const exists = prev.find(u => u._id === updatedUser.userId);
            let newList;
            if (exists) {
                newList = prev.map(u => u._id === updatedUser.userId ? { ...u, totalPoints: updatedUser.totalPoints } : u);
            } else {
                newList = [...prev, { _id: updatedUser.userId, username: updatedUser.username, totalPoints: updatedUser.totalPoints }];
            }
            // Sort descending by points
            return newList.sort((a, b) => b.totalPoints - a.totalPoints);
        });
    }, []);

    useArenaSocket(token, {
        onCardUpdate: handleCardUpdate,
        onLeaderboardUpdate: handleLeaderboardUpdate
    });


    // Derived States
    const cooldownRemaining = useMemo(() => {
        if (!cooldownUntil) return 0;
        return Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
    }, [cooldownUntil, now]);

    const remainingAttempts = useMemo(() => {
        return Math.max(0, MAX_CLAIMS - claimHistory.length);
    }, [claimHistory.length]);

    const resetInSeconds = useMemo(() => {
        if (claimHistory.length === 0) return 0;
        const oldest = Math.min(...claimHistory);
        return Math.max(0, Math.ceil((oldest + (2 * 60 * 1000) - now) / 1000));
    }, [claimHistory, now]);

    const isCardActive = useCallback((card: Card) => {
        return !!card.expiresAt && new Date(card.expiresAt).getTime() > now;
    }, [now]);

    const isCardExpired = useCallback((card: Card) => {
        return !!card.expiresAt && new Date(card.expiresAt).getTime() <= now;
    }, [now]);

    const isCardAvailable = useCallback((card: Card) => {
        const ownerId = getOwnerId(card);
        if (!ownerId) return true;
        return isCardExpired(card);
    }, [isCardExpired]);

    const activeMyCardsCount = useMemo(() => {
        if (!currentUserId) return 0;
        return cards.filter(
            (c) => getOwnerId(c) === currentUserId && isCardActive(c)
        ).length;
    }, [cards, currentUserId, isCardActive]);

    const userCards = useMemo(() =>
        cards.filter(c => c.ownerId && (typeof c.ownerId === 'string' ? c.ownerId : c.ownerId._id) === currentUserId),
        [cards, currentUserId]);

    const displayCardId = selectedCardId || (justClaimedCard ? justClaimedCard._id : null);
    const displayCard = cards.find(c => c._id === displayCardId);

    const typeBadgeClass = (type?: Card["type"]) => {
        switch (type) {
            case "rare": return "border-purple-400/40 text-purple-200";
            case "trap": return "border-red-400/40 text-red-200";
            default: return "border-white/20 text-white";
        }
    };

    // --- Claim Logic ---
    const handleStrictClaim = useCallback(async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setError(null);

        // 1. Strict Cooldown Check -> Modal
        if (cooldownRemaining > 0) {
            setBlockModal({
                isOpen: true,
                type: "cooldown",
                message: `Operational cooling active. Systems ready in ${cooldownRemaining}s.`,
                cooldownEndsAt: cooldownUntil
            });
            return;
        }

        // 2. Strict Active Count Check -> Modal
        if (activeMyCardsCount >= MAX_ACTIVE_CARDS) {
            setBlockModal({
                isOpen: true,
                type: "limit",
                message: `Territory limit reached (${MAX_ACTIVE_CARDS}). Secure current assets before expanding.`
            });
            return;
        }

        // 3. Strict Rate Limit Check -> Modal
        if (remainingAttempts <= 0) {
            setBlockModal({
                isOpen: true,
                type: "rate_limit",
                message: `Action limit exceeded. Bandwidth recharge in ${resetInSeconds}s.`
            });
            return;
        }

        const card = cards.find((c) => c._id === id);
        if (card && !isCardAvailable(card)) {
            setError("This sector is already occupied.");
            return;
        }

        try {
            setLoadingId(id);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication required.");
                return;
            }

            const updated = await claimCard(id, token);

            // Optimistic update
            setCards((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
            setClaimHistory((prev) => [...prev, Date.now()]);

            const me = await getMe(token);
            if (me.cooldownUntil) {
                setCooldownUntil(new Date(me.cooldownUntil).getTime());
            }

            setJustClaimedCard(updated);

        } catch (err: unknown) {
            const message = getErrorMessage(err);
            // If message indicates specific block, show modal, else error
            if (message.includes('Cooldown')) {
                const seconds = Number(message.match(/\d+/)?.[0] || '60');
                setBlockModal({
                    isOpen: true,
                    type: "cooldown",
                    message: `Operational cooling active. Systems ready in ${seconds}s.`,
                    cooldownEndsAt: Date.now() + (seconds * 1000)
                });
            } else if (message.includes('active cards')) {
                setBlockModal({
                    isOpen: true,
                    type: "limit",
                    message: `Territory limit reached. Release a sector to expand.`
                });
            } else if (message.includes('Rate limit')) {
                setBlockModal({
                    isOpen: true,
                    type: "rate_limit",
                    message: `Action limit exceeded. Bandwidth recharge in ${resetInSeconds}s.`
                });
            } else {
                setError(message);
                fetchData();
            }
        } finally {
            setLoadingId(null);
        }
    }, [cooldownRemaining, activeMyCardsCount, remainingAttempts, resetInSeconds, cards, isCardAvailable, fetchData]);

    const handleCardClick = useCallback((id: string) => {
        const card = cards.find(c => c._id === id);
        if (!card) return;

        const ownerId = getOwnerId(card);
        const isMyActive = !!currentUserId && ownerId === currentUserId && isCardActive(card);
        // "isClaimed" usually means someone else owns it and it's active
        const isClaimed = !!ownerId && !isCardExpired(card);

        if (isMyActive) {
            setSelectedCardId(id);
            return;
        }

        if (isClaimed) {
            const ownerName = getOwnerUsername(card);
            setBlockModal({
                isOpen: true,
                type: "occupied",
                message: `Sector occupied by ${ownerName}. Cannot claim.`
            });
            return;
        }

        handleStrictClaim(id);
    }, [cards, currentUserId, isCardActive, isCardExpired, handleStrictClaim]);


    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-500 text-sm animate-pulse">Establishing uplink...</p>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-emerald-500/30">
                {/* Background ambient effects */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
                </div>

                {/* MODALS & TOASTS */}
                <ActionBlockedModal
                    isOpen={blockModal.isOpen}
                    type={blockModal.type}
                    message={blockModal.message}
                    cooldownEndsAt={blockModal.cooldownEndsAt}
                    onClose={() => setBlockModal(prev => ({ ...prev, isOpen: false }))}
                />

                <AnimatePresence>
                    {toastMessage && (
                        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
                    )}
                </AnimatePresence>

                {/* Selection/Flip Modal */}
                <AnimatePresence>
                    {displayCardId && displayCard && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => { setSelectedCardId(null); setJustClaimedCard(null); }}
                                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                            />

                            <div className="relative w-full max-w-[320px] aspect-[3/4] preserve-3d">
                                {justClaimedCard && justClaimedCard._id === displayCardId && (
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="absolute -top-20 left-0 right-0 text-center z-20 pointer-events-none"
                                    >
                                        <h2 className="text-4xl font-black italic uppercase text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">
                                            CONQUERED!
                                        </h2>
                                        <p className="text-white text-xs tracking-widest uppercase font-bold mt-2">
                                            Territory Secured
                                        </p>
                                    </motion.div>
                                )}

                                <motion.div
                                    layoutId={`card-${displayCardId}`}
                                    className="w-full h-full cursor-pointer relative"
                                    animate={{ rotateY: 0 }}
                                    onClick={() => { setSelectedCardId(null); setJustClaimedCard(null); }}
                                >
                                    <div className={`absolute inset-0 rounded-[2rem] overflow-hidden border-2 bg-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500
                                    ${justClaimedCard && justClaimedCard._id === displayCardId ? "border-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.5)]" : "border-white/20"}
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
                                    onClick={() => { setSelectedCardId(null); setJustClaimedCard(null); }}
                                    className="absolute -top-12 right-0 bg-white text-black p-2 rounded-full hover:bg-zinc-200 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* HEADER */}
                <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/10 p-2 rounded-lg border border-white/5">
                                <Terminal size={18} className="text-emerald-500" />
                            </div>
                            <span className="font-bold tracking-tight text-lg">
                                Arena <span className="text-zinc-500 text-sm font-normal ml-2">v2.0.4</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium">
                                        <Shield size={12} />
                                        <span>{activeMyCardsCount}/{MAX_ACTIVE_CARDS} ACTIVE</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>Active Territories</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </header>

                {/* MAIN LAYOUT */}
                <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto z-10 relative">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* LEFT: Cards Grid (3 cols) */}
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
                                                // isMine logic for CardTile
                                                isClaimed={isClaimed}
                                                isMyActive={isMyActive}
                                                // If I don't own it but it's claimed, show owner name
                                                ownerUsername={isClaimed && !isMyActive ? getOwnerUsername(card) : undefined}
                                                disabled={false}
                                                // We handle click on the wrapper for simplicity
                                                onClick={() => { }}
                                                loading={loadingId === card._id}
                                                layoutId={`card-${card._id}`}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RIGHT: Leaderboard Sidebar (1 col) */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="sticky top-24">

                                {/* MY ACTIVE CARDS MINI-DASHBOARD */}
                                {activeMyCardsCount > 0 && (
                                    <div className="mb-6 p-4 rounded-xl bg-emerald-900/10 border border-emerald-500/20 backdrop-blur-sm">
                                        <h3 className="text-xs font-black uppercase text-emerald-400 mb-3 flex items-center justify-between tracking-widest">
                                            <span>Active Assets</span>
                                            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/20">
                                                {activeMyCardsCount}/{MAX_ACTIVE_CARDS}
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
                                )}

                                <Leaderboard users={leaderboard} currentUserId={currentUserId} />

                                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                                    <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2">Directives</h3>
                                    <ul className="space-y-2 text-xs text-zinc-400">
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-500">•</span>
                                            Claim empty sectors to gain points.
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-500">•</span>
                                            Rare sectors yield 2x points.
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500">•</span>
                                            Traps deduct points and stall systems (+5m).
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500">•</span>
                                            Maintain top rank for dominance.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <style>{`
                .preserve-3d { transform-style: preserve-3d; perspective: 1000px; }
                .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
            `}</style>
                <SmoothCursor />
            </div>
        </TooltipProvider>
    );
}
