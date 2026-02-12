import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { type Card } from "@/types/card";
import ActionBlockedModal from "@/components/ActionBlockedModal";
import Leaderboard from "@/components/Leaderboard";
import { useArenaSocket } from "@/hooks/useArenaSocket";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { claimCard, getAllCards } from "@/services/cardService";
import { getMe } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { shuffleArray, triggerSideCannons } from "@/lib/utils";
import { getApiBaseUrl } from "@/lib/env";

// Sub-components
import { ArenaToast } from "./ArenaToast";
import { ArenaHeader } from "./ArenaHeader";
import { ArenaGrid } from "./ArenaGrid";
import { ActiveAssets } from "./ActiveAssets";
import { CardViewModal } from "./CardViewModal";
import { ArenaDirectives } from "./ArenaDirectives";

const MAX_CLAIMS = 5;
const MAX_ACTIVE_CARDS = 4;
const SHUFFLE_AFTER_CLOSE_DELAY_MS = 10000;
const RATE_LIMIT_WINDOW_MS = 3 * 60 * 1000;

const getOwnerId = (card: Card) => {
    if (!card.ownerId) return null;
    return typeof card.ownerId === 'string' ? card.ownerId : (card.ownerId as any)._id;
};

const getOwnerUsername = (card: Card) => {
    if (!card.ownerId || typeof card.ownerId === 'string') return "UNKNOWN AGENT";
    return card.ownerId.username;
};

const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === "object") {
        const maybeResponse = (err as { response?: unknown }).response;
        if (maybeResponse && typeof maybeResponse === "object") {
            const data = (maybeResponse as { data?: unknown }).data;
            if (data && typeof data === "object") {
                const msg = (data as { message?: unknown }).message;
                if (typeof msg === "string") return msg;
            }
        }

        const maybeMessage = (err as { message?: unknown }).message;
        if (typeof maybeMessage === "string") return maybeMessage;
    }
    return "Failed to claim card";
};

export default function Arena() {
    const apiBaseUrl = getApiBaseUrl();
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
    const currentUserId = user?.id || null;
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
    const [toast, setToast] = useState<{
        message: string;
        subMessage?: string;
        type?: "info" | "directive" | "warning" | "success";
    } | null>(null);
    const shuffleAfterCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initial Rules Directive Sequence
    useEffect(() => {
        const sequence = [
            {
                message: "Directive: Capacity Limit",
                subMessage: `Maximum of ${MAX_ACTIVE_CARDS} active sectors allowed at once.`,
                type: "directive" as const,
                delay: 1000
            },
            {
                message: "Directive: Systems Reset",
                subMessage: "Every claim initiates a 60s security cooldown.",
                type: "directive" as const,
                delay: 5000
            },
            {
                message: "Directive: Bandwidth Cap",
                subMessage: "Max 5 claims per 3 minutes allowed before lockout.",
                type: "directive" as const,
                delay: 9000
            }
        ];

        sequence.forEach((t) => {
            setTimeout(() => {
                setToast({ message: t.message, subMessage: t.subMessage, type: t.type });
            }, t.delay);
        });

        // Clear last toast
        setTimeout(() => setToast(null), 13000);
    }, []);

    // Time Sync
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        return () => {
            if (shuffleAfterCloseTimerRef.current) {
                clearTimeout(shuffleAfterCloseTimerRef.current);
                shuffleAfterCloseTimerRef.current = null;
            }
        };
    }, []);

    // History Cleanup & Cooldown Local Tick
    useEffect(() => {
        setClaimHistory((prev) => prev.filter((t) => now - t < RATE_LIMIT_WINDOW_MS));
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
                fetch(`${apiBaseUrl}/auth/leaderboard`)
                    .then(res => res.json())
                    .then(data => data.data || [])
                    .catch(err => {
                        console.error("Leaderboard fetch failed", err);
                        return [];
                    }),
                getMe(token)
            ]);

            setCards(shuffleArray(cardsData));
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
                setToast({
                    message: `Sector Seized: ${updatedCard.name}`,
                    subMessage: `Controlled by ${ownerName || 'another operative'}.`,
                    type: "warning"
                });
                // Auto hide
                setTimeout(() => setToast(null), 3000);
            }
        }
    }, [currentUserId]);

    const handleCardExpired = useCallback((card: Card) => {
        setCards((prevCards) =>
            prevCards.map((c) => (c._id === card._id ? card : c))
        );
    }, []);

    const handleLeaderboardUpdate = useCallback((updatedUser: any) => {
        setLeaderboard(prev => {
            const exists = prev.find(u => u._id === updatedUser.userId);
            let newList;
            if (exists) {
                newList = prev.map(u => u._id === updatedUser.userId ? { ...u, totalPoints: updatedUser.totalPoints } : u);
            } else {
                newList = [...prev, { _id: updatedUser.userId, username: updatedUser.username, totalPoints: updatedUser.totalPoints }];
            }
            return newList.sort((a, b) => b.totalPoints - a.totalPoints);
        });
    }, []);

    useArenaSocket(token, {
        onCardUpdate: handleCardUpdate,
        onCardExpired: handleCardExpired,
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
        return Math.max(0, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000));
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

    // --- Claim Logic ---
    const handleStrictClaim = useCallback(async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setError(null);

        if (cooldownRemaining > 0) {
            setBlockModal({
                isOpen: true,
                type: "cooldown",
                message: `Operational cooling active. Systems ready in ${cooldownRemaining}s.`,
                cooldownEndsAt: cooldownUntil
            });
            return;
        }

        if (activeMyCardsCount >= MAX_ACTIVE_CARDS) {
            setBlockModal({
                isOpen: true,
                type: "limit",
                message: `Territory limit reached (${MAX_ACTIVE_CARDS}). Secure current assets before expanding.`
            });
            return;
        }

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

            setCards((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
            setClaimHistory((prev) => [...prev, Date.now()]);

            const me = await getMe(token);
            if (me.cooldownUntil) {
                setCooldownUntil(new Date(me.cooldownUntil).getTime());
            }

            setJustClaimedCard(updated);

            if (updated.type === 'rare') {
                triggerSideCannons();
            }

        } catch (err: unknown) {
            const message = getErrorMessage(err);
            if (/cooldown/i.test(message)) {
                const seconds = Number(message.match(/\d+/)?.[0] || '60');
                setBlockModal({
                    isOpen: true,
                    type: "cooldown",
                    message: `Operational cooling active. Systems ready in ${seconds}s.`,
                    cooldownEndsAt: Date.now() + (seconds * 1000)
                });
            } else if (/active cards/i.test(message)) {
                setBlockModal({
                    isOpen: true,
                    type: "limit",
                    message: `Territory limit reached. Release a sector to expand.`
                });
            } else if (/rate limit/i.test(message)) {
                setToast({
                    message: "Rate Limit Exceeded",
                    subMessage: message,
                    type: "warning"
                });
                setTimeout(() => setToast(null), 4000);
                setBlockModal({
                    isOpen: true,
                    type: "rate_limit",
                    message
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

    const handleReshuffle = useCallback(() => {
        setCards(prev => shuffleArray(prev));
    }, []);

    const handleCardViewClose = useCallback(() => {
        const shouldShuffleAfterClose = !!justClaimedCard;
        setSelectedCardId(null);
        setJustClaimedCard(null);

        if (shouldShuffleAfterClose) {
            if (shuffleAfterCloseTimerRef.current) {
                clearTimeout(shuffleAfterCloseTimerRef.current);
            }
            shuffleAfterCloseTimerRef.current = setTimeout(() => {
                setCards((prev) => shuffleArray(prev));
                shuffleAfterCloseTimerRef.current = null;
            }, SHUFFLE_AFTER_CLOSE_DELAY_MS);
        }
    }, [justClaimedCard]);

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

                <ActionBlockedModal
                    isOpen={blockModal.isOpen}
                    type={blockModal.type}
                    message={blockModal.message}
                    cooldownEndsAt={blockModal.cooldownEndsAt}
                    onClose={() => setBlockModal(prev => ({ ...prev, isOpen: false }))}
                />

                <AnimatePresence>
                    {toast && (
                        <ArenaToast
                            message={toast.message}
                            subMessage={toast.subMessage}
                            type={toast.type}
                            onClose={() => setToast(null)}
                        />
                    )}
                </AnimatePresence>

                <CardViewModal
                    displayCardId={displayCardId}
                    displayCard={displayCard}
                    justClaimedCard={justClaimedCard}
                    now={now}
                    onClose={handleCardViewClose}
                />

                <ArenaHeader activeMyCardsCount={activeMyCardsCount} maxActiveCards={MAX_ACTIVE_CARDS} />

                <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto z-10 relative">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <ArenaGrid
                            cards={cards}
                            error={error}
                            loadingId={loadingId}
                            currentUserId={currentUserId}
                            handleReshuffle={handleReshuffle}
                            handleCardClick={handleCardClick}
                            isCardActive={isCardActive}
                            isCardExpired={isCardExpired}
                            getOwnerId={getOwnerId}
                            getOwnerUsername={getOwnerUsername}
                        />

                        <div className="lg:col-span-1 space-y-6">
                            <div className="sticky top-24">
                                <ActiveAssets
                                    userCards={userCards}
                                    activeMyCardsCount={activeMyCardsCount}
                                    maxActiveCards={MAX_ACTIVE_CARDS}
                                    now={now}
                                    setSelectedCardId={setSelectedCardId}
                                    isCardActive={isCardActive}
                                />

                                <Leaderboard users={leaderboard} currentUserId={currentUserId} />

                                <ArenaDirectives />
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

